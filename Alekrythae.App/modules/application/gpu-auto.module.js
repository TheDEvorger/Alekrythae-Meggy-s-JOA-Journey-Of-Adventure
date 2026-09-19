(function registerGpuAutoSelectModule(){
    "use strict";
    const app=window.Alekrythae;if(!app)throw new Error("Alekrythae orkestratörü bulunamadı");

    const number=value=>Number.isFinite(Number(value))?Number(value):0;
    const memoryMb=item=>Math.max(number(item?.dedicatedMemoryMb),number(item?.memoryMb),number(item?.adapterMemoryMb));
    const classScore=item=>{
        const text=`${item?.kind||""} ${item?.preference||""} ${item?.name||""} ${item?.description||""}`.toLowerCase();
        if(/software|basic render|warp|swiftshader/.test(text))return 0;
        if(/discrete|dedicated|high.performance/.test(text))return 40;
        if(/integrated|power.saving|uma/.test(text))return 20;
        return memoryMb(item)>0?10:5;
    };
    const chooseBest=items=>items.map((item,index)=>({item,index,score:classScore(item),memory:memoryMb(item)}))
        .sort((a,b)=>b.score-a.score||b.memory-a.memory||a.index-b.index)[0]?.item||null;
    const adapterId=(item,index=0)=>String(item?.id??item?.luid??item?.adapterId??index);
    const configuredAdapterId=config=>String(config?.selectedAdapterId??config?.SelectedAdapterId??"");
    const wasExplicit=config=>Boolean(config?.userExplicitlySelected??config?.UserExplicitlySelected);
    const preferenceFor=item=>String(item?.kind||"").toLowerCase()==="integrated"?"power-saving":"high-performance";
    const notice=(message,duration=4600)=>{try{window.Notice?.(message,duration);}catch(_){}};

    const ensureStyle=()=>{
        if(document.getElementById("alek-gpu-moon-style"))return;
        const style=document.createElement("style");
        style.id="alek-gpu-moon-style";
        style.textContent=`
          .joa-brand img[data-alek-gpu-moon="1"]{cursor:pointer!important;transition:filter .16s ease,box-shadow .16s ease,transform .16s ease}
          .joa-brand img[data-alek-gpu-moon="1"]:hover{filter:brightness(1.12) saturate(1.08);box-shadow:0 0 0 2px rgba(112,220,255,.35),0 0 30px rgba(43,184,240,.68)!important;transform:scale(1.035)}
          .alek-gpu-moon-pop{position:fixed;z-index:2147483490;width:min(286px,calc(100vw - 20px));padding:9px;border:1px solid rgba(89,191,225,.66);border-radius:10px;background:linear-gradient(180deg,rgba(5,20,29,.985),rgba(2,9,14,.99));box-shadow:0 16px 38px rgba(0,0,0,.58),0 0 24px rgba(57,190,235,.12);backdrop-filter:blur(10px);color:#dff8ff;font:700 10px "Segoe UI",sans-serif}
          .alek-gpu-moon-pop[hidden]{display:none!important}
          .alek-gpu-moon-pop header{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;padding-bottom:7px;border-bottom:1px solid rgba(80,137,158,.34)}
          .alek-gpu-moon-pop header strong{color:#ead7a6;font:800 11px Georgia,serif;letter-spacing:.05em}
          .alek-gpu-moon-pop header span{color:#79cae6;font-size:9px}
          .alek-gpu-moon-pop select{width:100%;height:30px;padding:0 8px;border:1px solid rgba(86,155,181,.55);border-radius:7px;outline:0;background:#061722;color:#effbff;font:700 10px "Segoe UI",sans-serif;cursor:pointer}
          .alek-gpu-moon-pop small{display:block;margin-top:7px;color:#7896a2;line-height:1.35}
          .alek-gpu-moon-pop[data-busy="1"]{opacity:.6;pointer-events:none}
          body:has(.alek-cosmic-farewell) .alek-gpu-moon-pop{display:none!important}
        `;
        document.head.appendChild(style);
    };

    const closePopover=()=>{
        document.querySelector(".alek-gpu-moon-pop")?.remove();
    };

    const positionPopover=(popover,moon)=>{
        const r=moon.getBoundingClientRect();
        const width=Math.min(286,Math.max(220,window.innerWidth-20));
        const left=Math.max(10,Math.min(window.innerWidth-width-10,r.left));
        const top=Math.min(window.innerHeight-130,r.bottom+8);
        popover.style.left=`${left}px`;
        popover.style.top=`${Math.max(8,top)}px`;
    };

    const openPopover=(state,eventBus,moon)=>{
        const existing=document.querySelector(".alek-gpu-moon-pop");
        if(existing){existing.remove();return;}
        const pop=document.createElement("section");
        pop.className="alek-gpu-moon-pop";
        pop.innerHTML=`<header><strong>GPU</strong><span>${state.exact?"Tam adaptör":"Windows güç sınıfı"}</span></header><select aria-label="Grafik işlemci seç"></select><small>Mavi Ay GPU seçimidir. Özel seçim yoksa en güçlü yüksek-performans adayı kullanılır.</small>`;
        const select=pop.querySelector("select");
        const items=state.adapters||[];

        if(items.length){
            items.forEach((item,index)=>{
                const option=document.createElement("option");
                option.value=adapterId(item,index);
                const mem=memoryMb(item);
                option.textContent=`${item.name||"GPU"}${mem?` · ${Math.round(mem)} MB`:""}`;
                select.appendChild(option);
            });
        }else{
            const option=document.createElement("option");
            option.value="";
            option.textContent="Otomatik · yüksek performans";
            select.appendChild(option);
        }

        if(state.selected){
            const id=adapterId(state.selected,items.indexOf(state.selected));
            if([...select.options].some(option=>option.value===id))select.value=id;
        }

        select.addEventListener("change",async()=>{
            const index=items.findIndex((item,i)=>adapterId(item,i)===select.value);
            const item=index>=0?items[index]:null;
            pop.dataset.busy="1";
            try{
                const result=await window.__alekAPI("setGraphicsPreference",{
                    preference:item?preferenceFor(item):"high-performance",
                    adapterId:item?adapterId(item,index):"",
                    automatic:false
                });
                state.selected=item||state.selected;
                state.applied=!!result?.ok;
                state.restartRequired=!!result?.restartRequired;
                eventBus.emit("gpu:user-selected",{...state,result});
                const name=item?.name||"yüksek performans GPU";
                if(result?.restartRequired){
                    notice(`${name} seçildi. Bu Core sürümünde WebView2 yeni oturumda bu tercihle açılır.`,5600);
                }else{
                    notice(`${name} etkin.`,3200);
                }
            }catch(error){
                notice(`GPU tercihi uygulanamadı: ${error?.message||error}`,6200);
            }finally{
                pop.dataset.busy="0";
            }
        });

        document.body.appendChild(pop);
        positionPopover(pop,moon);
        setTimeout(()=>select.focus({preventScroll:true}),0);
    };

    const attachMoon=(state,eventBus)=>{
        ensureStyle();
        const moon=document.querySelector(".joa-world-shell .joa-brand img");
        if(!moon||moon.dataset.alekGpuMoon==="1")return false;
        moon.dataset.alekGpuMoon="1";
        moon.tabIndex=0;
        moon.setAttribute("role","button");
        moon.setAttribute("aria-label","GPU seç");
        moon.title="GPU seç";
        const toggle=event=>{
            event.preventDefault();
            event.stopPropagation();
            openPopover(state,eventBus,moon);
        };
        moon.addEventListener("click",toggle);
        moon.addEventListener("keydown",event=>{
            if(event.key==="Enter"||event.key===" "){event.preventDefault();toggle(event);}
            if(event.key==="Escape")closePopover();
        });
        return true;
    };

    app.registerModule({
        id:"application.gpu-auto",
        order:18,
        async start({eventBus}){
            // GPU seçimi ile görsel performans profili birbirinden bağımsızdır.
            // Güçlü GPU'yu seçmek, bütün dekoratif animasyonları "cinematic" moda zorlamaz.
            if(!document.documentElement.dataset.alekPerformance)document.documentElement.dataset.alekPerformance="efficient";
            const state={mode:"efficient",preference:"high-performance",adapters:[],selected:null,exact:false,applied:false,restartRequired:false,error:""};
            try{
                if(typeof window.__alekAPI!=="function")throw new Error("Core grafik köprüsü yok");
                const result=await window.__alekAPI("listGraphicsAdapters",{});
                const items=Array.isArray(result?.adapters)?result.adapters:[];
                state.adapters=items;
                state.exact=!!result?.exactAdapterSelection;

                const configuredId=configuredAdapterId(result?.config);
                const configured=wasExplicit(result?.config)
                    ?items.find((item,index)=>adapterId(item,index)===configuredId)
                    :null;
                const best=configured||chooseBest(items);
                state.selected=best;

                if(!configured){
                    const id=best?adapterId(best,items.indexOf(best)):"";
                    const applied=await window.__alekAPI("setGraphicsPreference",{
                        preference:"high-performance",
                        adapterId:id,
                        automatic:true
                    });
                    state.applied=!!applied?.ok;
                    state.restartRequired=!!applied?.restartRequired;
                    if(!state.applied)state.error=String(applied?.error||"GPU tercihi uygulanamadı");
                }else{
                    state.applied=true;
                }
            }catch(error){
                state.error=String(error?.message||error);
            }

            this.offJoa=eventBus.on("joa:opened",()=>requestAnimationFrame(()=>attachMoon(state,eventBus)));
            this.offInventory=eventBus.on("joa:inventory-opened",()=>requestAnimationFrame(()=>attachMoon(state,eventBus)));
            this.offClosed=eventBus.on("joa:closed",()=>closePopover());
            window.addEventListener("resize",this.onResize=()=>{
                const pop=document.querySelector(".alek-gpu-moon-pop");
                const moon=document.querySelector(".joa-world-shell .joa-brand img[data-alek-gpu-moon='1']");
                if(pop&&moon)positionPopover(pop,moon);
            });
            document.addEventListener("pointerdown",this.onOutside=event=>{
                const pop=document.querySelector(".alek-gpu-moon-pop");
                if(!pop)return;
                if(pop.contains(event.target))return;
                if(event.target?.closest?.(".joa-brand img[data-alek-gpu-moon='1']"))return;
                pop.remove();
            },true);

            window.__ALEK_GPU_AUTO__=state;
            eventBus.emit("gpu:auto-selected",state);
            requestAnimationFrame(()=>attachMoon(state,eventBus));
        },
        async stop(){
            this.offJoa?.();this.offInventory?.();this.offClosed?.();
            if(this.onResize)window.removeEventListener("resize",this.onResize);
            if(this.onOutside)document.removeEventListener("pointerdown",this.onOutside,true);
            closePopover();
            document.getElementById("alek-gpu-moon-style")?.remove();
            document.querySelectorAll("[data-alek-gpu-moon='1']").forEach(node=>{
                delete node.dataset.alekGpuMoon;
                node.removeAttribute("role");
                node.removeAttribute("aria-label");
                node.removeAttribute("tabindex");
                node.removeAttribute("title");
            });
            delete window.__ALEK_GPU_AUTO__;
        }
    });
})();