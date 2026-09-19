(function registerResourceGovernorModule(){
    "use strict";
    const app=window.Alekrythae;
    if(!app)throw new Error("Alekrythae orkestratörü bulunamadı");

    // Tek tek her partikülü izlemek yerine görsel sistemlerin kök kapsamlarını izleriz.
    // Böylece aynı görüntü ve animasyon yoğunluğu korunurken observer/DOM maliyeti düşer.
    const ANIMATION_SCOPE_SELECTORS=[
        ".taxonomy-energy-canvas",
        ".taxonomy-core-moon-image",
        ".taxonomy-data-sigil",
        ".v9-core-moon",
        ".v9-core-orb",
        ".energy-flow",
        ".skill-master-fill",
        ".alek-state-ribbon",
        ".alek-cosmic-opening",
        ".adventure-portal-moon",
        ".meggy-orb",
        ".varlik-particle-layer"
    ];
    const ANIMATION_SCOPE_SELECTOR=ANIMATION_SCOPE_SELECTORS.join(",");

    app.registerModule({
        id:"application.resource-governor",
        order:17,
        async start({eventBus}){
            let suspended=document.hidden;
            let lastPublished=null;
            let scanQueued=false;
            let needsFullScan=false;

            const isExplicitlyPaused=node=>node instanceof Element&&Boolean(node.closest('[data-alek-runtime-paused="true"]'));
            const isHiddenByAncestor=node=>{
                if(!(node instanceof Element)||!node.isConnected)return true;
                if(node.closest('[hidden],[aria-hidden="true"],[inert]'))return true;
                const style=getComputedStyle(node);
                if(style.display==="none"||style.visibility==="hidden"||style.contentVisibility==="hidden")return true;
                const rect=node.getBoundingClientRect();
                if(rect.width<1||rect.height<1)return true;
                return rect.bottom<=0||rect.right<=0||rect.top>=innerHeight||rect.left>=innerWidth;
            };
            const canRun=node=>!suspended&&!isExplicitlyPaused(node)&&!isHiddenByAncestor(node);

            const style=document.createElement("style");
            style.id="alek-r103-resource-policy";
            const suspendedSelectors=ANIMATION_SCOPE_SELECTORS
                .flatMap(selector=>[
                    `html.alek-resource-suspended ${selector}`,
                    `html.alek-resource-suspended ${selector} *`,
                    `html.alek-resource-suspended ${selector}::before`,
                    `html.alek-resource-suspended ${selector}::after`,
                    `html.alek-resource-suspended ${selector} *::before`,
                    `html.alek-resource-suspended ${selector} *::after`
                ])
                .join(",");
            style.textContent=`
                ${suspendedSelectors},
                [data-alek-runtime-offscreen="true"],
                [data-alek-runtime-offscreen="true"] *,
                [data-alek-runtime-offscreen="true"]::before,
                [data-alek-runtime-offscreen="true"]::after,
                [data-alek-runtime-offscreen="true"] *::before,
                [data-alek-runtime-offscreen="true"] *::after {
                    animation-play-state:paused!important;
                    will-change:auto!important;
                }
            `;
            document.head.appendChild(style);

            const intersectionObserver="IntersectionObserver" in window?new IntersectionObserver(entries=>{
                for(const entry of entries){
                    if(!(entry.target instanceof Element))continue;
                    if(entry.isIntersecting&&entry.intersectionRatio>0)delete entry.target.dataset.alekRuntimeOffscreen;
                    else entry.target.dataset.alekRuntimeOffscreen="true";
                }
            },{root:null,rootMargin:"48px",threshold:0}):null;

            const observeRoot=root=>{
                if(!intersectionObserver||!(root instanceof Element||root instanceof Document))return;
                if(root instanceof Element&&root.matches(ANIMATION_SCOPE_SELECTOR))intersectionObserver.observe(root);
                root.querySelectorAll?.(ANIMATION_SCOPE_SELECTOR).forEach(node=>intersectionObserver.observe(node));
            };
            const queueFullScan=()=>{
                needsFullScan=true;
                if(scanQueued||suspended)return;
                scanQueued=true;
                requestAnimationFrame(()=>{
                    scanQueued=false;
                    if(suspended)return;
                    if(needsFullScan){needsFullScan=false;observeRoot(document);}
                });
            };
            const pendingMutationRoots=new Set();
            let mutationFlushQueued=false;
            const flushMutationRoots=()=>{
                mutationFlushQueued=false;if(suspended){pendingMutationRoots.clear();needsFullScan=true;return;}
                const roots=[...pendingMutationRoots];pendingMutationRoots.clear();
                // Aynı DOM dalının hem ebeveyni hem çocukları geldiyse yalnız en üst kökü tara.
                const topRoots=roots.filter(node=>!roots.some(other=>other!==node&&other.contains?.(node)));
                topRoots.forEach(observeRoot);
            };
            const mutationObserver=new MutationObserver(records=>{
                if(suspended){needsFullScan=true;return;}
                for(const record of records)for(const node of record.addedNodes)if(node instanceof Element)pendingMutationRoots.add(node);
                if(!mutationFlushQueued&&pendingMutationRoots.size){mutationFlushQueued=true;requestAnimationFrame(flushMutationRoots);}
            });
            mutationObserver.observe(document.documentElement,{childList:true,subtree:true});

            const publish=active=>{
                const next=Boolean(active);
                suspended=!next;
                document.documentElement.classList.toggle("alek-resource-suspended",suspended);
                if(next)queueFullScan();
                if(lastPublished===next)return;
                lastPublished=next;
                window.dispatchEvent(new CustomEvent("alek:resource-state",{detail:{active:next}}));
                eventBus.emit(next?"resources:resumed":"resources:suspended",{at:Date.now()});
            };
            const recompute=()=>publish(!document.hidden);
            const onWake=()=>recompute();
            window.addEventListener("alek:resource-wake",onWake,true);
            this.offSuspend=eventBus.on("app:suspended",()=>publish(false));
            this.offResume=eventBus.on("app:resumed",()=>publish(true));

            window.__ALEK_RESOURCE_GOVERNOR__=Object.freeze({
                revision:127,
                isAppActive:()=>!suspended,
                canRun,
                wake:node=>window.dispatchEvent(new CustomEvent("alek:resource-wake",{detail:{node}})),
                pauseScope:node=>{if(node instanceof Element)node.dataset.alekRuntimePaused="true";},
                resumeScope:node=>{
                    if(node instanceof Element)delete node.dataset.alekRuntimePaused;
                    recompute();
                }
            });

            this.dispose=()=>{
                window.removeEventListener("alek:resource-wake",onWake,true);
                this.offSuspend?.();
                this.offResume?.();
                mutationObserver.disconnect();
                intersectionObserver?.disconnect();
                style.remove();
                document.documentElement.classList.remove("alek-resource-suspended");
                delete window.__ALEK_RESOURCE_GOVERNOR__;
            };
            observeRoot(document);
            recompute();
        },
        async stop(){this.dispose?.();this.dispose=null;}
    });
})();
