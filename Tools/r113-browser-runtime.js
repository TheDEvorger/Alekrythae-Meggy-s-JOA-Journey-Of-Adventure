"use strict";

// Real Chromium and all shipping modules. Only native Core operations are
// simulated; writes stay in memory, never in the user's Games folder.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {createRequire}=require("node:module");
const deps=process.env.ALEK_QA_DEPENDENCIES?createRequire(path.join(path.resolve(process.env.ALEK_QA_DEPENDENCIES),"package.json")):require;
const {chromium}=require("playwright");
const root=path.resolve(process.argv[2]||path.join(__dirname,".."));
const baseline=process.argv.includes("--baseline");
const output=process.env.ALEK_QA_OUTPUT&&path.resolve(process.env.ALEK_QA_OUTPUT);
const source=relative=>fs.readFileSync(path.join(root,relative),"utf8");

async function openApplication(browser,{blockedModules=true,failDatabase=false,saved,bridgeFiles=true}={}){
    const context=await browser.newContext({viewport:{width:1440,height:900},ignoreHTTPSErrors:true});
    const page=await context.newPage();
    const errors=[],logs=[],requests=[],operations=[];
    const store=saved||{files:new Map(),documents:new Map(),registry:null};
    const localFile=relative=>{const target=path.resolve(root,String(relative||"").replace(/\\/g,"/"));return target.startsWith(root+path.sep)?target:null;};
    const bytes=relative=>{if(store.files.has(relative))return store.files.get(relative);const target=localFile(relative);return target&&fs.existsSync(target)&&fs.statSync(target).isFile()?fs.readFileSync(target):null;};
    const types={".js":"text/javascript",".json":"application/json",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".mp3":"audio/mpeg",".woff2":"font/woff2"};
    page.on("pageerror",error=>errors.push(String(error.stack||error)));
    page.on("console",message=>{if(["error","warning"].includes(message.type()))logs.push(message.text());});
    await context.route("**/*",async route=>{
        const url=new URL(route.request().url());
        if(url.hostname==="alek-external.local"&&url.searchParams.get("path")==="C:\\QA\\sample.png")return route.fulfill({status:200,body:bytes("Assets/character_card_frame.png"),contentType:"image/png",headers:{"Access-Control-Allow-Origin":"*"}});
        if(url.hostname!=="alek-assets.local")return route.abort();
        const relative=decodeURIComponent(url.pathname).replace(/^\/+/,"");
        if(blockedModules&&relative.startsWith("Alekrythae.App/")){requests.push({relative,blocked:true});return route.abort();}
        const body=bytes(relative);
        if(!body){requests.push({relative,status:404});return route.fulfill({status:404,body:"not found",headers:{"Access-Control-Allow-Origin":"*"}});}
        return route.fulfill({status:200,body,contentType:types[path.extname(relative)]||"application/octet-stream",headers:{"Access-Control-Allow-Origin":"*"}});
    });
    await page.exposeFunction("__testCoreAPI",async(op,payload={})=>{
        operations.push(op);const key=payload.folder+"/"+payload.key;
        switch(op){
            case "fs.readText": {const file=bridgeFiles?bytes(payload.path):null;return file?{ok:true,content:file.toString("utf8")}:{ok:false,error:"not_found"};}
            case "fs.exists": {const file=bytes(payload.path);return {ok:true,exists:!!file,type:file?"file":"missing"};}
            case "fs.mkdir": return {ok:true};
            case "fs.list": {const target=localFile(payload.path),items=[];if(target&&fs.existsSync(target)&&fs.statSync(target).isDirectory())for(const entry of fs.readdirSync(target,{withFileTypes:true}))items.push({name:entry.name,type:entry.isDirectory()?"directory":"file"});return {ok:true,items};}
            case "fs.writeBinary": store.files.set(payload.path,Buffer.from(payload.base64,"base64"));return {ok:true};
            case "fs.writeText": store.files.set(payload.path,Buffer.from(payload.content));return {ok:true};
            case "db.registry.read": return {ok:true,data:store.registry};
            case "db.registry.write": store.registry=structuredClone(payload.data);return {ok:true};
            case "db.game.ensure": return failDatabase?{ok:false,error:"test_database_unavailable"}:{ok:true};
            case "db.game.read": return {ok:true,exists:store.documents.has(key),data:store.documents.get(key)||null};
            case "db.game.hasDocument": return {ok:true,exists:store.documents.has(key)};
            case "db.game.write": store.documents.set(key,structuredClone(payload.data));return {ok:true};
            case "listGraphicsAdapters": return {ok:true,adapters:[]};
            case "setGraphicsPreference": return {ok:true};
            case "pickExternalMedia": return store.pickerImage?{ok:true,cancelled:false,files:[{path:"C:\\QA\\sample.png"}]}:{ok:true,cancelled:true,files:[]};
            case "getResourceUsage": return {ok:true};
            default: return {ok:false,error:"unsupported_test_operation:"+op};
        }
    });
    await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
    await page.evaluate(()=>{
        window.__alekAPI=(op,payload)=>window.__testCoreAPI(op,payload||{});
        const bind=(name,op,keys)=>window[name]=(...args)=>window.__alekAPI(op,Object.fromEntries(keys.map((key,i)=>[key,args[i]])));
        bind("__alekReadText","fs.readText",["path"]);bind("__alekWriteText","fs.writeText",["path","content"]);
        bind("__alekList","fs.list",["path"]);bind("__alekExists","fs.exists",["path"]);bind("__alekMkdir","fs.mkdir",["path"]);
        bind("__alekWriteBinary","fs.writeBinary",["path","base64"]);window.__alekReveal=()=>{};window.__alekMemory=null;
    });
    await page.addScriptTag({content:source("Alekrythae.alek")+"\n//# sourceURL=about:blank"});
    await page.waitForFunction(()=>["running","failed"].includes(window.__ALEK_ORCHESTRATOR__?.status.phase),{},{timeout:40000});
    const state=await page.evaluate(()=>({phase:window.__ALEK_ORCHESTRATOR__?.status.phase,error:window.__ALEK_BOOT_ERROR__||null,legacyReady:window.__ALEK_LEGACY_READY__===true,modules:window.Alekrythae?.listModules?.(),resources:window.__ALEK_ORCHESTRATOR__?.status.loadedResources}));
    return {context,page,state,errors,logs,requests,operations,store};
}

(async()=>{
    let executablePath=process.env.ALEK_QA_CHROMIUM,args=[];
    if(process.env.ALEK_QA_DEPENDENCIES){const bundled=deps("@sparticuz/chromium").default;executablePath=executablePath||await bundled.executablePath();args=bundled.args.filter(arg=>!["--single-process","--in-process-gpu","--disable-web-security"].includes(arg));}
    const browser=await chromium.launch({headless:true,executablePath,args}),checks=[];
    try{
        const app=await openApplication(browser);
        if(output){fs.mkdirSync(output,{recursive:true});await app.page.screenshot({path:path.join(output,baseline?"R112-ERROR-REPRODUCED.png":"R113-OPENING.png")});}
        if(baseline){assert.equal(app.state.phase,"failed");assert.match(app.state.error,/getDynamicUrl is not defined/);console.log(JSON.stringify({ok:true,baseline:true,browser:browser.version(),state:app.state,errors:app.errors,logs:app.logs},null,2));return;}
        assert.equal(app.state.phase,"running",JSON.stringify({state:app.state,errors:app.errors,logs:app.logs}));
        assert.equal(app.errors.length,0,app.errors.join("\n"));
        checks.push("Complete shipping application reaches running in Chromium with virtual module requests blocked");
        assert.equal(app.state.modules.length,10);assert(app.state.modules.every(module=>module.state==="started"));
        assert.equal(app.state.resources.length,18);assert(app.state.resources.every(resource=>resource.transport==="core-file"));
        checks.push("All 10 real modules and 18 application resources start through the Core file bridge");
        const acorn=deps("acorn"),scope=deps("eslint-scope");
        const ast=acorn.parse(source("Alekrythae.App/legacy/legacy-app.js"),{ecmaVersion:2025,locations:true,ranges:true});
        const names=new Set(await app.page.evaluate(()=>Object.getOwnPropertyNames(window)));
        const unknown=scope.analyze(ast,{ecmaVersion:2025,optimistic:true}).globalScope.through.filter(ref=>!names.has(ref.identifier.name)).map(ref=>({name:ref.identifier.name,line:ref.identifier.loc.start.line}));
        assert.deepEqual(unknown,[]);
        checks.push("Full legacy lexical scope audit has zero unresolved identifiers against the actual browser globals");
        // The moon floats continuously; click its current centre with a real
        // mouse event rather than waiting for animation stability.
        const moon=await app.page.locator(".alek-opening-moon").boundingBox();assert(moon&&moon.width>0);
        await app.page.mouse.click(moon.x+moon.width/2,moon.y+moon.height/2);
        await app.page.locator(".alek-cosmic-opening").waitFor({state:"detached",timeout:15000});
        if(output)await app.page.screenshot({path:path.join(output,"R113-ADVENTURES.png")});
        await app.page.locator(".portal-adventure-card").first().click();
        await app.page.waitForFunction(()=>window.__ALEK_COSMIC_OPENING_LOCKED__===false&&!document.querySelector(".adventure-portal-shade"),{},{timeout:15000});
        assert.equal(app.errors.length,0,app.errors.join("\n"));
        checks.push("Moon opening, adventure selector and adventure entry work with real pointer clicks");
        await app.page.getByRole("button",{name:"Mevcut Değerle Başla",exact:true}).click();
        await app.page.locator(".adventure-start-time-modal").waitFor({state:"detached",timeout:15000});
        await app.page.locator(".joa-world-shell").waitFor({state:"visible",timeout:15000});
        checks.push("First-adventure start-date dialog saves and releases the map");
        await app.page.keyboard.press("F1");
        await app.page.locator(".joa-inventory-page-shell").waitFor({state:"visible",timeout:15000});
        await app.page.keyboard.press("Control+e");
        assert.equal(await app.page.locator(".inventory-command-place").count(),1);
        await app.page.keyboard.press("Escape");
        assert.equal(await app.page.locator(".inventory-command-place").count(),0);
        await app.page.keyboard.press("Control+f");
        assert.equal(await app.page.locator(".inventory-command-focus").count(),1);
        await app.page.keyboard.press("Escape");
        assert.equal(await app.page.locator(".inventory-command-focus").count(),0);
        checks.push("F1 opens inventory; Ctrl+E and Ctrl+F survive key release; Escape cancels each command");
        await app.page.keyboard.press("F2");
        await app.page.waitForFunction(()=>window.__alekCurrentPrimarySurface==="map"&&!document.querySelector(".joa-inventory-page-shell")&&document.querySelector(".joa-floating-palette")&&document.activeElement?.classList.contains("joa-world-shell"));
        await app.page.evaluate(()=>{window.__qaShiftEvents=[];for(const type of ["keydown","keyup"])window.addEventListener(type,event=>{if(event.key==="Shift")window.__qaShiftEvents.push({type,code:event.code,at:performance.now(),target:event.target?.className});},true);});
        await app.page.keyboard.press("Shift");
        try{await app.page.locator(".joa-floating-palette.open").waitFor({state:"visible",timeout:5000});}catch(error){throw new Error(JSON.stringify(await app.page.evaluate(()=>{const c=window.Alekrythae.getModule("joa.world-experience").controller;return {paletteOpen:c.paletteOpen,inventoryPage:c.inventoryPage,shift:c.shiftTapCandidate,events:window.__qaShiftEvents,focus:document.activeElement?.outerHTML.slice(0,300),palette:document.querySelector(".joa-floating-palette")?.outerHTML.slice(0,300)};})));}
        await app.page.locator('[data-action="toggle-layers"]').click();
        await app.page.locator('[data-action="toggle-layer-kind"]').first().click();
        const pickerBefore=app.operations.filter(op=>op==="pickExternalMedia").length;
        app.store.pickerImage=true;
        await app.page.locator('[data-action="pick-layer-image"]').click();
        // Wait on the native-boundary call, not an implementation-specific UI timer.
        await new Promise((resolve,reject)=>{const started=Date.now();const tick=()=>{if(app.operations.filter(op=>op==="pickExternalMedia").length>pickerBefore)return resolve();if(Date.now()-started>5000)return reject(new Error("Palette never requested the image picker"));setTimeout(tick,20);};tick();});
        await app.page.locator(".joa-map-image-item img").waitFor({state:"visible",timeout:15000});
        await app.page.waitForFunction(()=>{const img=document.querySelector(".joa-map-image-item img");return img?.complete&&img.naturalWidth>0;});
        assert([...app.store.files.keys()].some(name=>name.includes("/Media/JoA-Maps/")&&name.endsWith("_sample.png")));
        await app.page.keyboard.press("Escape");
        assert.equal(await app.page.locator(".joa-floating-palette.open").count(),0);
        assert.equal(app.errors.length,0,app.errors.join("\n"));
        checks.push("F2 returns to map; Shift opens palette; image-layer picker copies selected PNG into adventure media and displays it; Escape closes palette");
        const ui=await app.page.evaluate(()=>({surface:window.__alekCurrentPrimarySurface,buttons:[...document.querySelectorAll("button")].filter(b=>b.getBoundingClientRect().width>0).map(b=>({text:b.textContent.slice(0,50),title:b.title,action:b.dataset.action})).slice(0,40)}));
        const failed=await openApplication(browser,{failDatabase:true});
        assert.equal(failed.state.phase,"failed");assert.match(failed.state.error,/test_database_unavailable/);assert.equal(failed.state.legacyReady,false);
        checks.push("Asynchronous database initialization failure reports its actual cause and cannot mark the application ready");
        console.log(JSON.stringify({ok:true,browser:browser.version(),checks,state:app.state,ui,errors:app.errors,logs:app.logs,requests:app.requests,operations:[...new Set(app.operations)]},null,2));
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
