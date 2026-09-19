(function initializeAlekNativeRenderer(){
    "use strict";
    if(window.__ALEK_RENDERER__)return;
    const app=window.Alekrythae;
    if(!app)throw new Error("Alekrythae orkestratörü bulunamadı");

    const tasks=new Map();
    const imageCache=new Map();
    let nextTaskId=1;
    let frameHandle=0;
    let appActive=!document.hidden;

    const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
    const easeOutCubic=value=>1-Math.pow(1-clamp(value,0,1),3);
    const isDrawable=node=>node instanceof Element&&node.isConnected&&node.getClientRects().length>0;
    const isViewportDrawable=node=>{
        if(!isDrawable(node))return false;
        const rect=node.getBoundingClientRect();
        return rect.width>=2&&rect.height>=2&&rect.bottom>=-32&&rect.right>=-32&&rect.top<=innerHeight+32&&rect.left<=innerWidth+32;
    };
    const currentProfile=()=>document.documentElement.dataset.alekPerformance||"cpu-ram";
    const profileFps=preferred=>{
        const profile=currentProfile();
        if(profile==="eco")return Math.min(preferred,24);
        if(profile==="cpu-ram")return Math.min(preferred,30);
        if(profile==="balanced")return Math.min(preferred,45);
        if(profile==="efficient")return Math.min(preferred,30);
        return preferred;
    };
    const profileDpr=maxDpr=>{
        const profile=currentProfile();
        if(profile==="eco")return Math.min(maxDpr,.85);
        if(profile==="cpu-ram")return Math.min(maxDpr,1);
        if(profile==="balanced")return Math.min(maxDpr,1.25);
        if(profile==="efficient")return Math.min(maxDpr,1);
        return maxDpr;
    };
    const profileImageCacheDelay=delay=>currentProfile()==="cpu-ram"?Math.max(Number(delay)||0,240000):Math.max(Number(delay)||0,4000);
    const hasRunnableTasks=()=>{for(const task of tasks.values())if(!task.disposed&&task.enabled!==false)return true;return false;};
    const requestFrame=()=>{
        if(!frameHandle&&appActive&&hasRunnableTasks())frameHandle=requestAnimationFrame(runFrame);
    };
    const runFrame=now=>{
        frameHandle=0;
        if(!appActive)return;
        for(const [id,task] of tasks){
            if(task.disposed){tasks.delete(id);continue;}
            if(task.owner&&!task.owner.isConnected){task.dispose?.();tasks.delete(id);continue;}
            if(task.enabled===false)continue;
            const fps=Math.max(1,task.profileAware===false?(task.fps||60):profileFps(task.fps||60));
            const interval=1000/fps;
            if(now-task.lastFrame+0.1<interval)continue;
            const delta=task.lastFrame?Math.min(100,now-task.lastFrame):interval;
            task.lastFrame=now;
            try{task.draw(now,delta);}catch(error){console.error("Ałek renderer görevi durduruldu:",error);task.dispose?.();tasks.delete(id);}
        }
        if(hasRunnableTasks())requestFrame();
    };
    const addTask=(owner,draw,{fps=60,enabled=true,dispose=null,profileAware=true}={})=>{
        const id=nextTaskId++;
        const task={owner,draw,fps,enabled,lastFrame:0,disposed:false,dispose,profileAware};
        tasks.set(id,task);requestFrame();
        return{
            setEnabled(value){task.enabled=Boolean(value);if(task.enabled){task.lastFrame=0;requestFrame();}else if(frameHandle&&!hasRunnableTasks()){cancelAnimationFrame(frameHandle);frameHandle=0;}},
            dispose(){if(task.disposed)return;task.disposed=true;try{task.dispose?.();}finally{tasks.delete(id);}},
            invalidate(){task.lastFrame=0;requestFrame();}
        };
    };
    const setAppActive=value=>{
        appActive=Boolean(value)&&!document.hidden;
        if(!appActive&&frameHandle){cancelAnimationFrame(frameHandle);frameHandle=0;}
        if(appActive){for(const task of tasks.values())task.lastFrame=0;requestFrame();}
    };

    const acquireImage=url=>{
        const key=String(url||"");
        let entry=imageCache.get(key);
        if(!entry){
            const image=new Image();
            image.decoding="async";
            entry={image,refs:0,releaseTimer:0,state:"loading",promise:null,lastUsed:performance.now()};
            entry.promise=new Promise((resolve,reject)=>{
                image.onload=()=>{entry.state="ready";resolve(image);requestFrame();};
                image.onerror=()=>{entry.state="error";reject(new Error(`Görsel yüklenemedi: ${key}`));};
            });
            image.src=key;
            imageCache.set(key,entry);
        }
        clearTimeout(entry.releaseTimer);entry.releaseTimer=0;entry.refs++;entry.lastUsed=performance.now();
        return entry;
    };
    const releaseImage=(url,delay=4000)=>{
        const key=String(url||""),entry=imageCache.get(key);if(!entry)return;
        entry.refs=Math.max(0,entry.refs-1);
        if(entry.refs||entry.releaseTimer)return;
        const effectiveDelay=profileImageCacheDelay(delay);
        entry.releaseTimer=setTimeout(()=>{
            entry.releaseTimer=0;
            if(entry.refs)return;
            try{entry.image.removeAttribute("src");}catch(_){ }
            imageCache.delete(key);
        },effectiveDelay);
    };
    const fitCanvas=(canvas,maxDpr=1.5)=>{
        const rect=canvas.getBoundingClientRect();
        if(rect.width<2||rect.height<2)return null;
        const dpr=Math.min(window.devicePixelRatio||1,profileDpr(maxDpr));
        const width=Math.max(2,Math.round(rect.width*dpr)),height=Math.max(2,Math.round(rect.height*dpr));
        if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
        const context=canvas.getContext("2d",{alpha:true});
        if(!context)return null;
        context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,width,height);context.setTransform(dpr,0,0,dpr,0,0);
        return{context,width:rect.width,height:rect.height,dpr};
    };
    const fitFrameBuffer=(frontCanvas,backCanvas,maxDpr=1.5,{profileAware=true}={})=>{
        const rect=frontCanvas.getBoundingClientRect();
        if(rect.width<2||rect.height<2)return null;
        // R16: Kaynak enerji tüpleri görsel kalite profiline düşürülmez.
        // Ana dünya yine profil sınırına uyar; yalnız barlar gerçek DPR ile 60 FPS akar.
        const dpr=Math.min(window.devicePixelRatio||1,profileAware?profileDpr(maxDpr):maxDpr);
        const pixelWidth=Math.max(2,Math.round(rect.width*dpr)),pixelHeight=Math.max(2,Math.round(rect.height*dpr));
        if(frontCanvas.width!==pixelWidth||frontCanvas.height!==pixelHeight){frontCanvas.width=pixelWidth;frontCanvas.height=pixelHeight;}
        if(backCanvas.width!==pixelWidth||backCanvas.height!==pixelHeight){backCanvas.width=pixelWidth;backCanvas.height=pixelHeight;}
        const context=backCanvas.getContext("2d",{alpha:true});
        if(!context)return null;
        context.setTransform(1,0,0,1,0,0);context.globalAlpha=1;context.globalCompositeOperation="source-over";context.clearRect(0,0,pixelWidth,pixelHeight);context.setTransform(dpr,0,0,dpr,0,0);
        return{context,width:rect.width,height:rect.height,dpr,pixelWidth,pixelHeight};
    };
    const presentFrame=(frontCanvas,backCanvas,pixelWidth,pixelHeight)=>{
        const context=frontCanvas.getContext("2d",{alpha:true});
        if(!context)return false;
        context.setTransform(1,0,0,1,0,0);context.globalAlpha=1;
        // Tek bir copy çizimi, WebView2'nin temizlenmiş fakat henüz tamamlanmamış
        // Canvas karesini compositor'a vermesini engeller.
        context.globalCompositeOperation="copy";context.drawImage(backCanvas,0,0,pixelWidth,pixelHeight);
        context.globalCompositeOperation="source-over";
        return true;
    };
    const observeVisibility=(element,onChange)=>{
        const inViewport=()=>isViewportDrawable(element);
        let visible=inViewport();
        // Observer olayı yalnız yeniden ölçümü tetikler. WebView2, dönüşen veya
        // kayan panellerde gecikmiş false olayı verebilir; gerçek geometriyi
        // tekrar okumadan bu olaya güvenmek görünür Canvas'ı göz kırptırıyordu.
        const publish=()=>{const next=inViewport();if(next===visible)return;visible=next;onChange(next);};
        let intersection=null;
        if("IntersectionObserver" in window){
            intersection=new IntersectionObserver(()=>publish(),{root:null,rootMargin:"32px",threshold:0});
            intersection.observe(element);
        }
        const resize="ResizeObserver" in window?new ResizeObserver(()=>publish()):null;
        resize?.observe(element);
        onChange(visible);
        requestAnimationFrame(()=>requestAnimationFrame(()=>publish()));
        return()=>{intersection?.disconnect();resize?.disconnect();};
    };

    const mountDirectedOpeningSparks=(host,{count=240,direction="outward"}={})=>{
        if(!(host instanceof Element))return null;
        const canvas=document.createElement("canvas");canvas.className="alek-opening-spark-canvas";host.replaceChildren(canvas);
        const colors=[[243,253,255],[159,229,255],[65,164,255],[180,251,255],[109,212,255],[31,124,255]];
        const inward=String(direction||"outward").toLowerCase()==="inward";
        const particles=Array.from({length:Math.max(1,Number(count)||240)},(_,index)=>({
            index,
            angle:Math.random()*Math.PI*2,
            start:16.6+Math.random()*3.1,
            end:30+Math.random()*31,
            core:.18+Math.random()*.34,
            size:.8+Math.random()*4.8,
            trail:14+Math.random()*56,
            duration:1.2+Math.random()*4.2,
            delay:-Math.random()*8,
            alpha:.36+Math.random()*.64,
            color:colors[index%colors.length]
        }));
        let disposed=false,visible=true;
        let finishStart=0,finishDuration=0,finishResolve=null,finishPromise=null,finishParticles=null,finishDone=false,finishMode="moon";

        const loopingState=(particle,now)=>{
            const seconds=now*.001;
            const phase=((seconds+particle.delay)%particle.duration+particle.duration)%particle.duration/particle.duration;
            const travel=easeOutCubic(phase);
            const target=inward?particle.core:particle.end;
            const radius=inward?particle.end-(particle.end-target)*travel:particle.start+(particle.end-particle.start)*travel;
            let opacity=phase<.08?particle.alpha*(phase/.08):phase<.46?particle.alpha:phase<.78?particle.alpha*(1-(phase-.46)*.72/.32):particle.alpha*.28*(1-(phase-.78)/.22);
            const scale=inward?(.05+(.22-.05)*phase):(.22+(.05-.22)*phase);
            return{radius,opacity:Math.max(0,opacity),scale,impact:false};
        };

        const makeFinalParticles=(durationMs,anchorNow)=>{
            const total=Math.max(1200,Number(durationMs)||3000);
            let lastIndex=0,lastDuration=-1;
            particles.forEach((p,i)=>{if(p.duration>lastDuration){lastDuration=p.duration;lastIndex=i;}});
            return particles.map((p,i)=>{
                const live=loopingState(p,anchorNow),liveRadius=live.radius;
                // Final faz click anındaki gerçek akıştan devam eder; yeni bir yön ya da halka başlangıcı yok.
                if(i===lastIndex)return{...p,launchDelay:0,flightMs:total,launchRadius:liveRadius,launchOpacity:live.opacity,targetRadius:p.core,isLast:true};
                const launchDelay=Math.floor(Math.random()*720);
                const room=Math.max(360,total-launchDelay-70);
                const requested=420+Math.random()*Math.max(1,room-420);
                const flightMs=Math.max(320,Math.min(requested,p.duration*1000,total-launchDelay-40));
                return{...p,launchDelay,flightMs,launchRadius:liveRadius,launchOpacity:live.opacity,targetRadius:p.core,isLast:false};
            });
        };

        const makeFadeParticles=(durationMs,anchorNow)=>{
            const total=Math.max(900,Number(durationMs)||2400);
            const fadeMs=Math.max(70,Math.min(130,total*.055));
            const order=particles.map((_,index)=>index);
            // Sönme sırası uzamsal bir içe çekilme dalgası oluşturmasın; meteorlar
            // bulundukları yerlerde, dağınık fakat kesin bir sıra ile kapanır.
            for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
            const rank=new Map(order.map((index,position)=>[index,position]));
            const lastRank=Math.max(1,particles.length-1),fadeSpan=Math.max(0,total-fadeMs);
            return particles.map((particle,index)=>{
                const live=loopingState(particle,anchorNow);
                return{
                    ...particle,
                    launchDelay:(rank.get(index)||0)/lastRank*fadeSpan,
                    flightMs:fadeMs,
                    launchRadius:live.radius,
                    launchOpacity:live.opacity,
                    launchScale:live.scale
                };
            });
        };

        const finalState=(particle,now)=>{
            const elapsed=now-finishStart-particle.launchDelay;
            if(elapsed<0)return{radius:particle.launchRadius,opacity:0,scale:.05,impact:false};
            const phase=clamp(elapsed/Math.max(1,particle.flightMs),0,1);
            // Final fazda da aynı hareket ailesi sürer; yalnız hedef Ay'ın iç çekirdeğidir.
            const travel=easeOutCubic(phase);
            const target=particle.targetRadius ?? particle.core ?? 0.28;
            const radius=particle.launchRadius-(particle.launchRadius-target)*travel;
            const launchOpacity=Math.max(.08,Math.min(1,particle.launchOpacity ?? particle.alpha));
            let opacity=Math.min(particle.alpha,launchOpacity);
            // Click sonrası yeni meteor doğmuş gibi görünmesin; ilk anda görünürlük korunur.
            if(phase>.72)opacity*=Math.max(0,1-(phase-.72)/.28);
            const scale=.05+(.22-.05)*phase;
            return{radius,opacity:Math.max(0,opacity),scale,impact:particle.isLast&&phase>=.998};
        };

        const fadeState=(particle,now)=>{
            const elapsed=now-finishStart-particle.launchDelay;
            const radius=particle.launchRadius;
            const opacity=Math.max(0,particle.launchOpacity??particle.alpha);
            const scale=Math.max(.01,particle.launchScale??.12);
            if(elapsed<0)return{radius,opacity,scale,impact:false};
            const phase=clamp(elapsed/Math.max(1,particle.flightMs),0,1);
            // Yalnız ışık söner; yarıçap sabit kaldığı için meteor Aya doğru tek
            // piksel bile ilerlemez ve yeni bir meteor doğmuş izlenimi oluşmaz.
            return{radius,opacity:opacity*(1-easeOutCubic(phase)),scale,impact:false};
        };

        const drawParticle=(ctx,particle,state,cx,cy,vmin)=>{
            if(state.opacity<=.003)return;
            const radius=state.radius*vmin,x=cx+Math.cos(particle.angle)*radius,y=cy+Math.sin(particle.angle)*radius;
            const tail=Math.min(particle.trail*vmin*.16,radius*.42),tailSign=inward?1:-1,tx=x+Math.cos(particle.angle)*tail*tailSign,ty=y+Math.sin(particle.angle)*tail*tailSign;
            const [rr,gg,bb]=particle.color;
            const gradient=ctx.createLinearGradient(tx,ty,x,y);gradient.addColorStop(0,`rgba(${rr},${gg},${bb},0)`);gradient.addColorStop(.68,`rgba(${rr},${gg},${bb},${state.opacity*.42})`);gradient.addColorStop(1,`rgba(245,253,255,${state.opacity})`);
            ctx.strokeStyle=gradient;ctx.lineWidth=Math.max(.55,particle.size*.36*state.scale+0.45);ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(x,y);ctx.stroke();
            ctx.fillStyle=`rgba(${rr},${gg},${bb},${state.opacity*.18})`;ctx.beginPath();ctx.arc(x,y,Math.max(1.5,particle.size*1.7),0,Math.PI*2);ctx.fill();
            ctx.fillStyle=`rgba(245,253,255,${Math.min(1,state.opacity*.96)})`;ctx.beginPath();ctx.arc(x,y,Math.max(.45,particle.size*.36),0,Math.PI*2);ctx.fill();
            if(state.impact){ctx.fillStyle=`rgba(220,250,255,${Math.min(.58,state.opacity)})`;ctx.beginPath();ctx.arc(x,y,Math.max(1.4,particle.size*1.45),0,Math.PI*2);ctx.fill();}
        };

        const draw=now=>{
            if(!visible||disposed)return;
            const fitted=fitCanvas(canvas,1.5);if(!fitted)return;
            const {context:ctx,width,height}=fitted,cx=width/2,cy=height/2,vmin=Math.min(width,height)/100;
            ctx.globalCompositeOperation="lighter";ctx.lineCap="round";
            if(finishStart&&finishParticles){
                for(const particle of finishParticles)drawParticle(ctx,particle,finishMode==="fade"?fadeState(particle,now):finalState(particle,now),cx,cy,vmin);
                // SON meteorun normal uçuş süresi gerçekten bittikten ve o kare çizildikten sonra resolve.
                const allDoneAt=finishParticles.reduce((max,p)=>Math.max(max,(p.launchDelay||0)+(p.flightMs||0)),finishDuration);
                if(!finishDone&&now-finishStart>=allDoneAt){
                    finishDone=true;
                    const resolve=finishResolve;finishResolve=null;
                    requestAnimationFrame(()=>resolve?.({ok:true,impactAt:performance.now()}));
                }
            }else{
                for(const particle of particles)drawParticle(ctx,particle,loopingState(particle,now),cx,cy,vmin);
            }
            ctx.globalCompositeOperation="source-over";
        };
        const task=addTask(canvas,draw,{fps:60});
        const stopVisibility=observeVisibility(canvas,value=>{visible=value;task.setEnabled(value||!!finishStart);});
        const controller={
            // Eski çağrılar için korunur; kapanış artık bunu KULLANMAZ.
            drain(duration=2400){return controller.finishAtMoon(duration);},
            finishAtMoon(duration=3000){
                if(disposed)return Promise.resolve({ok:false,disposed:true});
                if(finishPromise)return finishPromise;
                finishDuration=Math.max(900,Number(duration)||3000);
                finishStart=performance.now();finishDone=false;finishMode="moon";
                finishParticles=makeFinalParticles(finishDuration,finishStart);
                task.setEnabled(true);task.invalidate();
                finishPromise=new Promise(resolve=>{finishResolve=resolve;});
                return finishPromise;
            },
            extinguishSequentially(duration=2400){
                if(disposed)return Promise.resolve({ok:false,disposed:true});
                if(finishPromise)return finishPromise;
                finishDuration=Math.max(900,Number(duration)||2400);
                finishStart=performance.now();finishDone=false;finishMode="fade";
                finishParticles=makeFadeParticles(finishDuration,finishStart);
                task.setEnabled(true);task.invalidate();
                finishPromise=new Promise(resolve=>{finishResolve=resolve;});
                return finishPromise;
            },
            dispose(){if(disposed)return;disposed=true;stopVisibility();task.dispose();const resolve=finishResolve;finishResolve=null;try{canvas.remove();}catch(_){ }resolve?.({ok:false,disposed:true});}
        };
        canvas.__alekDisposeRenderer=controller.dispose;
        return controller;
    };

    // FaeraTh v0.1.1 kanonik giriş rendererı. Açılışta kullanılan dışa akış
    // kaynak projedeki hesap ve zamanlama ile birebir korunur. Yönlü renderer
    // yalnız kapanıştaki içe akış için ayrı tutulur.
    const mountFaerathOpeningSparks=(host,{count=240}={})=>{
        if(!(host instanceof Element))return null;
        const canvas=document.createElement("canvas");canvas.className="alek-opening-spark-canvas";host.replaceChildren(canvas);
        const colors=[[243,253,255],[159,229,255],[65,164,255],[180,251,255],[109,212,255],[31,124,255]];
        const particles=Array.from({length:Math.max(1,Number(count)||240)},(_,index)=>({
            angle:Math.random()*Math.PI*2,
            start:16.6+Math.random()*3.1,
            end:30+Math.random()*31,
            size:.8+Math.random()*4.8,
            trail:14+Math.random()*56,
            duration:1.2+Math.random()*4.2,
            delay:-Math.random()*8,
            alpha:.36+Math.random()*.64,
            color:colors[index%colors.length],
            drain:null
        }));
        let drainStart=0,drainDuration=0,drainResolve=null,disposed=false,visible=true;
        const positionFor=(particle,now)=>{
            const seconds=now*.001;
            let phase=((seconds+particle.delay)%particle.duration+particle.duration)%particle.duration/particle.duration;
            const radius=particle.start+(particle.end-particle.start)*easeOutCubic(phase);
            let opacity=phase<.08?particle.alpha*(phase/.08):phase<.46?particle.alpha:phase<.78?particle.alpha*(1-(phase-.46)*.72/.32):particle.alpha*.28*(1-(phase-.78)/.22);
            let scale=.22+(.05-.22)*phase;
            if(drainStart){
                if(!particle.drain)particle.drain={radius,opacity,scale};
                const d=clamp((now-drainStart)/drainDuration,0,1),e=easeOutCubic(d);
                phase=1;opacity=particle.drain.opacity*(1-d);scale=particle.drain.scale+(.04-particle.drain.scale)*e;
                return{radius:particle.drain.radius+(particle.end-particle.drain.radius)*e,opacity,scale};
            }
            return{radius,opacity:Math.max(0,opacity),scale};
        };
        const draw=now=>{
            if(!visible||disposed)return;
            const fitted=fitCanvas(canvas,1.5);if(!fitted)return;
            const {context:ctx,width,height}=fitted,cx=width/2,cy=height/2,vmin=Math.min(width,height)/100;
            ctx.globalCompositeOperation="lighter";ctx.lineCap="round";
            for(const particle of particles){
                const state=positionFor(particle,now);if(state.opacity<=.003)continue;
                const radius=state.radius*vmin,x=cx+Math.cos(particle.angle)*radius,y=cy+Math.sin(particle.angle)*radius;
                const tail=Math.min(particle.trail*vmin*.16,radius*.42),tx=x-Math.cos(particle.angle)*tail,ty=y-Math.sin(particle.angle)*tail;
                const [r,g,b]=particle.color;
                const gradient=ctx.createLinearGradient(tx,ty,x,y);gradient.addColorStop(0,`rgba(${r},${g},${b},0)`);gradient.addColorStop(.68,`rgba(${r},${g},${b},${state.opacity*.42})`);gradient.addColorStop(1,`rgba(245,253,255,${state.opacity})`);
                ctx.strokeStyle=gradient;ctx.lineWidth=Math.max(.55,particle.size*.36*state.scale+0.45);ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(x,y);ctx.stroke();
                ctx.fillStyle=`rgba(${r},${g},${b},${state.opacity*.18})`;ctx.beginPath();ctx.arc(x,y,Math.max(1.5,particle.size*1.7),0,Math.PI*2);ctx.fill();
                ctx.fillStyle=`rgba(245,253,255,${Math.min(1,state.opacity*.96)})`;ctx.beginPath();ctx.arc(x,y,Math.max(.45,particle.size*.36),0,Math.PI*2);ctx.fill();
            }
            ctx.globalCompositeOperation="source-over";
            if(drainStart&&now-drainStart>=drainDuration){const resolve=drainResolve;drainResolve=null;controller.dispose();resolve?.();}
        };
        const task=addTask(canvas,draw,{fps:60});
        const stopVisibility=observeVisibility(canvas,value=>{visible=value;task.setEnabled(value);});
        const controller={
            drain(duration=2400){
                if(disposed)return Promise.resolve();
                if(drainStart)return new Promise(resolve=>{const previous=drainResolve;drainResolve=()=>{previous?.();resolve();};});
                drainStart=performance.now();drainDuration=Math.max(100,Number(duration)||2400);particles.forEach(p=>{p.drain=null;});task.setEnabled(true);task.invalidate();
                return new Promise(resolve=>{drainResolve=resolve;});
            },
            dispose(){if(disposed)return;disposed=true;stopVisibility();task.dispose();const resolve=drainResolve;drainResolve=null;try{canvas.remove();}catch(_){ }resolve?.();}
        };
        canvas.__alekDisposeRenderer=controller.dispose;
        return controller;
    };

    const mountOpeningSparks=(host,options={})=>{
        const direction=String(options?.direction||"outward").toLowerCase();
        return direction==="inward"
            ?mountDirectedOpeningSparks(host,options)
            :mountFaerathOpeningSparks(host,options);
    };

    const mountTaxonomy=(canvas,{layers=[]}={})=>{
        if(!(canvas instanceof HTMLCanvasElement))return null;
        const frameBuffer=document.createElement("canvas");
        const normalized=Array.from(layers).map(layer=>({
            url:String(layer.url||""),tag:String(layer.tag||"P").toUpperCase(),opacity:clamp(Number(layer.opacity)||0,0,1),
            duration:Math.max(.1,Number(layer.duration)||12),startTurn:Number(layer.startTurn)||0,entry:null
        })).filter(layer=>layer.url);
        let active=true,visible=true,disposed=false,loadToken=0;
        const load=()=>{
            if(normalized.every(layer=>layer.entry))return;
            const token=++loadToken;
            for(const layer of normalized)if(!layer.entry){const entry=acquireImage(layer.url);layer.entry=entry;entry.promise.catch(()=>{if(token===loadToken)layer.entry=null;});}
        };
        const release=()=>{loadToken++;for(const layer of normalized)if(layer.entry){releaseImage(layer.url,2500);layer.entry=null;}};
        const clipFor=(ctx,tag,w,h)=>{
            const gap=.0018,half=.5;
            if(tag==="P")ctx.rect(0,0,w*(half-gap),h*(half-gap));
            else if(tag==="S")ctx.rect(w*(half+gap),0,w*(half-gap),h*(half-gap));
            else if(tag==="M")ctx.rect(0,h*(half+gap),w*(half-gap),h*(half-gap));
            else ctx.rect(w*(half+gap),h*(half+gap),w*(half-gap),h*(half-gap));
        };
        const draw=now=>{
            if(!active||!visible||disposed)return;load();
            // Renk katmanları tek tek geldikçe ana Canvas'ı temizlemek bazı
            // çeyrekleri yanıp sönüyormuş gibi gösteriyordu. İlk kare ancak
            // bütün yerel katmanlar hazır olduğunda atomik olarak çizilir.
            if(!normalized.length||normalized.some(layer=>layer.entry?.state!=="ready"))return;
            const fitted=fitFrameBuffer(canvas,frameBuffer,1.5);if(!fitted)return;
            const {context:ctx,width:w,height:h,pixelWidth,pixelHeight}=fitted;
            ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
            for(const layer of normalized){
                if(layer.entry?.state!=="ready")continue;
                const angle=(layer.startTurn+(now*.001/layer.duration))*Math.PI*2;
                ctx.save();ctx.beginPath();clipFor(ctx,layer.tag,w,h);ctx.clip();ctx.globalAlpha=layer.opacity;ctx.translate(w/2,h/2);ctx.rotate(angle);ctx.drawImage(layer.entry.image,-w/2,-h/2,w,h);ctx.restore();
            }
            presentFrame(canvas,frameBuffer,pixelWidth,pixelHeight);
        };
        const task=addTask(canvas,draw,{fps:60,profileAware:false});
        const stopVisibility=observeVisibility(canvas,value=>{visible=value;task.setEnabled(active&&visible);if(active&&visible)load();});
        const controller={
            setActive(value){active=Boolean(value);task.setEnabled(active&&visible);if(active&&visible){load();task.invalidate();}},
            invalidate(){if(disposed)return;visible=isViewportDrawable(canvas);task.setEnabled(active&&visible);if(active&&visible){load();task.invalidate();}},
            dispose(){if(disposed)return;disposed=true;stopVisibility();task.dispose();release();}
        };
        canvas.__alekDisposeRenderer=controller.dispose;load();return controller;
    };

    const mountResourceFlow=(canvas,{layers=[],orientation="horizontal"}={})=>{
        if(!(canvas instanceof HTMLCanvasElement))return null;
        const frameBuffer=document.createElement("canvas");
        const normalized=Array.from(layers).map(layer=>({url:String(layer.url||""),opacity:clamp(Number(layer.opacity)||0,0,1),duration:Math.max(.1,Number(layer.duration)||12),entry:null})).filter(layer=>layer.url);
        const vertical=orientation==="vertical";
        let active=false,visible=isDrawable(canvas),disposed=false,releaseTimer=0,loadToken=0;
        // Yerel animasyon saati yalnız gerçekten çizim yapılırken ilerler.
        // Böylece panel kapanıp açıldığında veya bar ekrandan çıktığında enerji
        // dokusu duvar saatine sıçramaz; kaldığı fazdan devam eder.
        let flowClockMs=0;
        const load=()=>{
            clearTimeout(releaseTimer);releaseTimer=0;const token=++loadToken;
            for(const layer of normalized)if(!layer.entry){const entry=acquireImage(layer.url);layer.entry=entry;entry.promise.catch(()=>{if(token===loadToken)layer.entry=null;});}
        };
        const release=()=>{loadToken++;for(const layer of normalized)if(layer.entry){releaseImage(layer.url,3000);layer.entry=null;}const ctx=canvas.getContext("2d");ctx?.clearRect(0,0,canvas.width,canvas.height);};
        const scheduleRelease=()=>{if(releaseTimer)return;releaseTimer=setTimeout(()=>{releaseTimer=0;if(!active)release();},8000);};
        const drawVertical=(ctx,image,y,w,h)=>{ctx.save();ctx.translate(w,y);ctx.rotate(Math.PI/2);ctx.drawImage(image,0,0,h,w);ctx.restore();};
        const drawFrame=(timeMs,force=false)=>{
            if((!active&&!force)||!visible||disposed)return;load();
            const readyLayers=normalized.filter(layer=>layer.entry?.state==="ready");
            // En yavaş PNG diğer katmanları bloke etmez. İlk hazır katman arka
            // tamponda tamamlanır ve tek işlemde görünür Canvas'a geçirilir.
            if(!readyLayers.length)return;
            const fitted=fitFrameBuffer(canvas,frameBuffer,3,{profileAware:false});if(!fitted)return;
            const {context:ctx,width:w,height:h,pixelWidth,pixelHeight}=fitted;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";ctx.globalCompositeOperation="source-over";
            for(const layer of readyLayers){
                const phase=((timeMs*.001/layer.duration)%1+1)%1;ctx.globalAlpha=layer.opacity;
                if(vertical){const shift=phase*h;drawVertical(ctx,layer.entry.image,-h+shift,w,h);drawVertical(ctx,layer.entry.image,shift,w,h);}
                else{const shift=phase*w;ctx.drawImage(layer.entry.image,-w+shift,0,w,h);ctx.drawImage(layer.entry.image,shift,0,w,h);}
            }
            ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";
            presentFrame(canvas,frameBuffer,pixelWidth,pixelHeight);
        };
        const draw=(now,delta)=>{
            if(active&&visible)flowClockMs+=Math.min(100,Math.max(0,Number(delta)||0));
            drawFrame(flowClockMs,false);
        };
        // R4: görünür dört ana kaynak barı gerçek 60 FPS hedefler.
        // Görünmez olduğunda task tamamen kapanır.
        const task=addTask(canvas,draw,{fps:60,enabled:false,profileAware:false});
        const stopVisibility=observeVisibility(canvas,value=>{visible=value;task.setEnabled(active&&visible);});
        const prime=()=>{
            if(disposed||!isViewportDrawable(canvas))return false;
            visible=true;
            load();
            // İlk kare anında çizilir ama yerel faz ileri atılmaz.
            drawFrame(flowClockMs,true);
            task.setEnabled(active&&visible);
            task.invalidate();
            return true;
        };
        const controller={
            setActive(value){active=Boolean(value);visible=isViewportDrawable(canvas);task.setEnabled(active&&visible);if(active){load();prime();requestAnimationFrame(()=>{visible=isViewportDrawable(canvas);if(visible){prime();task.setEnabled(true);}});}else scheduleRelease();},
            invalidate(){visible=isViewportDrawable(canvas);if(visible)prime();else task.setEnabled(false);},
            prime,
            dispose(){if(disposed)return;disposed=true;clearTimeout(releaseTimer);stopVisibility();task.dispose();release();}
        };
        canvas.__alekDisposeRenderer=controller.dispose;
        // Panel henüz sağdan açılırken dokuları hazırlamaya başla. Animasyon
        // görevi görünürlük kuralına uymaya devam eder; yalnız yerel PNG decode'u
        // kullanıcı tıklaması veya geç bir observer olayı beklemez.
        load();
        return controller;
    };

    const renderer=Object.freeze({revision:135,addTask,setAppActive,mountOpeningSparks,mountTaxonomy,mountResourceFlow,stats:()=>({tasks:tasks.size,cachedImages:imageCache.size,active:appActive,profile:currentProfile(),dprCap:profileDpr(1.5)})});
    window.__ALEK_RENDERER__=renderer;

    app.registerModule({
        id:"application.native-renderer",
        order:16,
        async start(){
            this.onState=event=>setAppActive(event.detail?.active!==false);
            this.onVisibility=()=>setAppActive(!document.hidden);
            this.onForeground=()=>{if(!document.hidden)setAppActive(true);};
            window.addEventListener("alek:resource-state",this.onState,true);
            window.addEventListener("alek:foreground-activity",this.onForeground,true);
            window.addEventListener("alek:resource-wake",this.onForeground,true);
            document.addEventListener("visibilitychange",this.onVisibility,true);
            setAppActive(!document.hidden);
        },
        async stop(){
            window.removeEventListener("alek:resource-state",this.onState,true);
            window.removeEventListener("alek:foreground-activity",this.onForeground,true);
            window.removeEventListener("alek:resource-wake",this.onForeground,true);
            document.removeEventListener("visibilitychange",this.onVisibility,true);
            for(const task of Array.from(tasks.values())){try{task.dispose?.();}catch(_){ }}
            tasks.clear();setAppActive(false);delete window.__ALEK_RENDERER__;
        }
    });
})();
