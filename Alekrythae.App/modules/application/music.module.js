(function registerJoaMusicModule(){
    "use strict";
    const app=window.Alekrythae;if(!app)throw new Error("Alekrythae orkestratörü bulunamadı");
    const AUDIO_RE=/\.(mp3|m4a|m3a|mp4|aac|wav|ogg|opus|flac|wma|webm)$/i;
    const virtualUrl=path=>"https://alek-assets.local/"+String(path||"").replace(/\\/g,"/").replace(/^\/+/,"").split("/").map(encodeURIComponent).join("/");
    const numericKey=name=>{const base=String(name||"").replace(/\.[^.]+$/,""),m=base.match(/^\s*(\d+)/);return m?Number(m[1]):Number.MAX_SAFE_INTEGER;};
    const scan=async()=>{
        if(typeof window.__alekList!=="function")return [];
        const result=await window.__alekList("Musics");
        const items=Array.isArray(result?.items)?result.items:[];
        return items.filter(item=>item?.type==="file"&&AUDIO_RE.test(item.name||""))
            .map(item=>({name:String(item.name),path:`Musics/${item.name}`}))
            .sort((a,b)=>numericKey(a.name)-numericKey(b.name)||a.name.localeCompare(b.name,"tr",{numeric:true,sensitivity:"base"}));
    };
    app.registerModule({
        id:"application.music",
        order:19,
        async start({eventBus}){
            const audio=new Audio();audio.preload="metadata";audio.volume=.72;audio.loop=false;audio.style.display="none";audio.setAttribute("aria-hidden","true");document.body.appendChild(audio);
            let list=await scan(),index=0,unlocked=false,stopped=false;
            const loadCurrent=()=>{if(!list.length)return false;if(index>=list.length)index=0;audio.src=virtualUrl(list[index].path);audio.load();return true;};
            const play=async()=>{if(stopped||!list.length)return false;if(!audio.src)loadCurrent();try{await audio.play();unlocked=true;return true;}catch(error){console.warn("Müzik başlatılamadı",list[index]?.name,error);return false;}};
            const next=async()=>{if(!list.length)return false;index=(index+1)%list.length;try{audio.pause();audio.removeAttribute("src");audio.load();}catch(_){}loadCurrent();return await play();};
            const unlock=()=>{if(unlocked)return;void play();};
            const refresh=async()=>{const oldName=list[index]?.name||"";list=await scan();const found=list.findIndex(item=>item.name===oldName);index=found>=0?found:0;if(list.length&&!audio.src)loadCurrent();return list.slice();};
            audio.addEventListener("ended",()=>{void next();});
            audio.addEventListener("error",()=>{if(list.length>1)void next();});
            document.addEventListener("pointerdown",unlock,true);document.addEventListener("keydown",unlock,true);
            window.addEventListener("alek:user-activated",unlock,true);
            if(list.length)loadCurrent();
            this.dispose=()=>{stopped=true;document.removeEventListener("pointerdown",unlock,true);document.removeEventListener("keydown",unlock,true);window.removeEventListener("alek:user-activated",unlock,true);try{audio.pause();audio.removeAttribute("src");audio.load();audio.remove();}catch(_){}};
            window.__ALEK_MUSIC__=Object.freeze({
                files:()=>list.map(item=>item.name),current:()=>list[index]?.name||"",play,pause:()=>audio.pause(),next,previous:async()=>{if(!list.length)return false;index=(index-1+list.length)%list.length;audio.src="";loadCurrent();return play();},refresh,
                setVolume:value=>{audio.volume=Math.max(0,Math.min(1,Number(value)||0));return audio.volume;},volume:()=>audio.volume
            });
            eventBus.emit("music:ready",{count:list.length,folder:"Musics"});
        },
        async stop(){this.dispose?.();this.dispose=null;delete window.__ALEK_MUSIC__;}
    });
})();
