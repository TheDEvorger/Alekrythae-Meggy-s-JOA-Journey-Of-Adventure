"use strict";

// Bütün .alek yükleyicisi çalışır; yalnız tarayıcı DOM'u ve Core dosya taşıması
// taklit edilir. Bu test Windows/WebView2 uçtan uca testi olduğunu iddia etmez.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../..");
const stylePath = "modules/character-stats/stat-circle.css";
const actualCss = fs.readFileSync(path.join(root, "Alekrythae.App", stylePath), "utf8");
const manifest = {
    id: "alekrythae.joa-tavern", version: "0.1.71-R113", architectureRevision: 214,
    entry: "Alekrythae.alek", preloads: ["preload.js"],
    modules: ["legacy.js", "module.js"], styles: [stylePath], postStyles: ["post.css"]
};
const fixture = {
    "manifest.json": JSON.stringify(manifest),
    [stylePath]: actualCss + '\n.test{background:url("../textures/t.png");filter:url(#local);cursor:url("data:image/png;base64,AA==")}.root{background:url("/Assets/a.png")} @import "extra.css";',
    "post.css": ".after-legacy{color:red}",
    "preload.js": "window.bootOrder=['preload'];",
    "legacy.js": "window.bootOrder.push('legacy');window.__ALEK_LEGACY_READY__=true;window.__ALEK_LEGACY_BRIDGE__={};",
    "module.js": "window.bootOrder.push('module');const bootFixture={id:'boot.fixture',start(){window.bootOrder.push('start')},stop(){}};Alekrythae.registerModule(bootFixture);"
};

async function boot({entry, bridge = "readText", network = false, files = {}, injected = manifest} = {}) {
    const sources = {...fixture, ...files};
    const reads = [], requests = [], nodes = [], errors = [], events = new Map();
    const emit = (name, event) => { for (const handler of events.get(name) || []) handler(event); };
    let context;
    class Node {
        constructor(tag) { this.tagName = tag; this.dataset = {}; this.style = {}; this.children = []; this.textContent = ""; }
        appendChild(child) {
            this.children.push(child); nodes.push(child);
            if (this.tagName === "head") {
                if (child.tagName === "script" && !child.src) run(child, child.textContent);
                else if (child.tagName === "script" || child.tagName === "link") {
                    const url = child.src || child.href;
                    const resource = new URL(url).pathname.replace(/^\/Alekrythae.App\//, "");
                    requests.push(resource);
                    queueMicrotask(() => {
                        if (!network || typeof sources[resource] !== "string") return child.onerror?.({type: "error"});
                        if (child.tagName === "script") run(child, sources[resource]);
                        child.onload?.();
                    });
                }
            }
            return child;
        }
        remove() { this.removed = true; }
    }
    function run(node, text) {
        const filename = node.src || /\/\/# sourceURL=(.+)/.exec(text)?.[1] || "about:blank";
        try { vm.runInContext(text, context, {filename}); }
        catch (error) { emit("error", {filename, message: error.message, error}); }
    }
    const sandbox = {
        console: {error: (...args) => errors.push(args.map(String).join(" ")), warn() {}, info() {}},
        URL, setTimeout, clearTimeout, queueMicrotask,
        document: {createElement: tag => new Node(tag), head: new Node("head"), body: new Node("body")},
        __ALEK_EXTERNAL_MANIFEST__: injected,
        addEventListener(name, handler) { const set = events.get(name) || new Set(); set.add(handler); events.set(name, set); },
        removeEventListener(name, handler) { events.get(name)?.delete(handler); },
        async fetch(url) {
            const resource = new URL(url).pathname.replace(/^\/Alekrythae.App\//, "");
            if (!network || typeof sources[resource] !== "string") throw new Error("virtual host unavailable");
            return {ok: true, json: async () => JSON.parse(sources[resource])};
        }
    };
    const read = async relative => {
        reads.push(relative);
        const resource = relative.replace(/^Alekrythae.App\//, "");
        return typeof sources[resource] === "string" ? {ok: true, content: sources[resource]} : {ok: false, error: "not_found"};
    };
    if (bridge === "readText") sandbox.__alekReadText = read;
    else if (bridge === "api") sandbox.__alekAPI = (op, payload) => {
        assert.equal(op, "fs.readText"); return read(payload.path);
    };
    else if (bridge === "unavailable") sandbox.__alekReadText = async () => ({ok: false, error: "bridge_unavailable"});
    sandbox.window = sandbox;
    context = vm.createContext(sandbox);
    const promise = vm.runInContext(entry || fs.readFileSync(path.join(root, "Alekrythae.alek"), "utf8"), context);
    await promise;
    return {sandbox, nodes, reads, requests, errors, events, status: sandbox.__ALEK_ORCHESTRATOR__?.status};
}

(async () => {
    if (process.argv.includes("--baseline")) {
        const file = process.argv[process.argv.indexOf("--baseline") + 1];
        const old = await boot({entry: fs.readFileSync(file, "utf8")});
        assert(old.errors.some(error => error.includes("Stil yüklenemedi: " + stylePath)), "R111 hatası yeniden üretilemedi");
        assert.notEqual(old.status?.phase, "running");
        console.log(JSON.stringify({ok: true, reproduced: "R111 sanal adres engellenince, dosya köprüsü çalışsa da ilk CSS'te duruyor."}, null, 2));
        return;
    }
    const checks = [];
    const local = await boot();
    assert.equal(local.status.phase, "running");
    assert.equal(local.status.failedModules.length, 0);
    assert.equal(local.status.loadedResources.length, 5);
    assert.deepEqual(Array.from(local.sandbox.bootOrder), ["preload", "legacy", "module", "start"]);
    assert.equal(local.requests.length, 0, "Core dosyaları için sanal adrese bağımlılık kaldı");
    assert(local.reads.includes("Alekrythae.App/" + stylePath));
    assert.equal(local.events.get("error")?.size, 0);
    checks.push("Sanal adres kapalı + Core okuması açık: ilk CSS ve sıralı açılış başarılı");

    const css = local.nodes.find(node => node.dataset.alekStyle === stylePath).textContent;
    assert(css.includes(actualCss.slice(0, 200)), "Gerçek stat-circle.css yüklenmedi");
    assert(css.includes('url("https://alek-assets.local/Alekrythae.App/modules/textures/t.png")'));
    assert(css.includes('url("#local")'));
    assert(css.includes('url("data:image/png;base64,AA==")'));
    assert(css.includes('url("https://alek-assets.local/Assets/a.png")'));
    assert(css.includes('@import "https://alek-assets.local/Alekrythae.App/modules/character-stats/extra.css"'));
    checks.push("Gerçek CSS korunur; göreli URL/import taşınır; SVG/data başvuruları korunur");

    const generic = await boot({bridge: "api"});
    assert.equal(generic.status.phase, "running");
    assert.equal(generic.requests.length, 0);
    checks.push("Yalnız genel __alekAPI bulunan Core uyumluluğu");

    const web = await boot({bridge: null, network: true});
    assert.equal(web.status.phase, "running");
    assert.deepEqual(web.requests, [stylePath, "preload.js", "legacy.js", "post.css", "module.js"]);
    checks.push("Core köprüsü olmayan ortamda sanal adres yükleme sırası");

    const unsupported = await boot({bridge: "unavailable", network: true});
    assert.equal(unsupported.status.phase, "running");
    checks.push("Eski/uyumsuz Core dosya API'sinden çalışan adres yoluna dönüş");

    const missing = await boot({files: {[stylePath]: undefined}});
    assert.equal(missing.status.phase, "failed");
    assert(missing.sandbox.__ALEK_BOOT_ERROR__.includes("Alekrythae.App/" + stylePath));
    assert(missing.sandbox.__ALEK_BOOT_ERROR__.includes("ZIP'in tamamını"));
    assert(missing.nodes.some(node => node.dataset.alekBootError === "true"));
    checks.push("Gerçekten eksik CSS: doğru dosya yolu ve paket çıkarma açıklaması");

    const badScript = await boot({files: {"module.js": "throw new Error('module execution failed');"}});
    assert.equal(badScript.status.phase, "failed");
    assert(badScript.sandbox.__ALEK_BOOT_ERROR__.includes("module execution failed"));
    assert.equal(badScript.events.get("error")?.size, 0);
    checks.push("Yerel script çalışma hatası başarı sayılmaz; hata dinleyicisi temizlenir");

    const badSyntax = await boot({files: {"module.js": "const broken = ;"}});
    assert.equal(badSyntax.status.phase, "failed");
    checks.push("Yerel script sözdizimi hatası açılışı başarısız işaretler");

    const asyncLegacy = await boot({files:{"legacy.js":"window.__ALEK_LEGACY_BOOT_PROMISE__=Promise.resolve({ok:false,error:new Error('legacy database failed')});"}});
    assert.equal(asyncLegacy.status.phase,"failed");
    assert(asyncLegacy.sandbox.__ALEK_BOOT_ERROR__.includes("legacy database failed"));
    assert(!asyncLegacy.reads.includes("Alekrythae.App/module.js"));
    checks.push("Asenkron ana uygulama hatası sonraki modülleri başlatmaz; asıl neden korunur");

    const pendingLegacy = await boot({files:{"legacy.js":"window.__ALEK_LEGACY_READY__=true;window.__ALEK_LEGACY_BRIDGE__={};window.__ALEK_LEGACY_BOOT_PROMISE__=new Promise(resolve=>setTimeout(()=>resolve({ok:false,error:new Error('late legacy failure')}),1));"}});
    assert.equal(pendingLegacy.status.phase,"failed");
    assert(pendingLegacy.sandbox.__ALEK_BOOT_ERROR__.includes("late legacy failure"));
    assert(!pendingLegacy.reads.includes("Alekrythae.App/module.js"));
    checks.push("Erken hazır bayrağı bekleyen açılış sonucunu atlayamaz");

    const badUrlScript = await boot({bridge:"unavailable",network:true,files:{"module.js":"throw new Error('virtual script execution failed')"}});
    assert.equal(badUrlScript.status.phase,"failed");
    assert(badUrlScript.sandbox.__ALEK_BOOT_ERROR__.includes("virtual script execution failed"));
    assert.equal(badUrlScript.events.get("error")?.size,0);
    checks.push("Sanal adres yüklemesinde de çalışma hatası başarı sayılmaz; dinleyici temizlenir");

    const stale = await boot({injected: {...manifest, styles: ["stale.css"]}});
    assert.equal(stale.status.phase, "running");
    assert(!stale.reads.some(name => name.includes("stale.css")));
    checks.push("Diskteki manifest eski Core enjeksiyonundan önceliklidir");

    const unsafe = await boot({files: {"manifest.json": JSON.stringify({...manifest, styles: ["../outside.css"]})}});
    assert.equal(unsafe.status.phase, "failed");
    assert(!unsafe.reads.some(name => name.includes("..")));
    checks.push("Manifest yolu paket kökünün dışına çıkamaz");

    console.log(JSON.stringify({ok: true, checks}, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
