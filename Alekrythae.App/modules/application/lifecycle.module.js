(function registerLifecycleModule(){
    "use strict";
    const app=window.Alekrythae;
    if(!app)throw new Error("Alekrythae orkestratörü bulunamadı");

    app.registerModule({
        id:"application.lifecycle",
        order:10,
        async start({eventBus}){
            let lastState=null;
            const isActive=()=>!document.hidden;
            const publish=(force=false,reason="visible")=>{
                const active=isActive();
                if(!force&&active===lastState)return;
                lastState=active;
                eventBus.emit(active?"app:resumed":"app:suspended",{
                    at:Date.now(),
                    reason:active?reason:"hidden"
                });
            };
            const wake=(reason="foreground")=>{
                if(document.hidden)return false;
                // WPF Core gerçek pencere odağını ve WebView2 suspend/resume akışını
                // zaten yönetiyor. Chromium'un geçici `blur` olayı burada ikinci bir
                // askıya alma üretmemeli; aksi hâlde kart barları klavye girdisi
                // gelene kadar `alek-suspend` altında kalabiliyor.
                publish(true,reason);
                return true;
            };
            const sleep=()=>publish(true,"hidden");
            const onVisibility=()=>document.hidden?sleep():wake("visibility");
            const onForegroundActivity=()=>wake("ui-activity");
            const wakeEvents=[
                [window,"focus"],
                [window,"pageshow"],
                [window,"pointerenter"],
                [window,"pointerdown"],
                [window,"keydown"]
            ];
            wakeEvents.forEach(([target,name])=>target.addEventListener(name,onForegroundActivity,true));
            // `blur` burada kasıtlı olarak askıya alma sebebi değildir. Gerçek arka
            // plan/odak kaybında Core WebView2'yi uyutur; sayfa yaşam döngüsü ise
            // visibility/pagehide üzerinden kapanır.
            window.addEventListener("pagehide",sleep,true);
            window.addEventListener("alek:foreground-activity",onForegroundActivity,true);
            window.addEventListener("alek:resource-wake",onForegroundActivity,true);
            document.addEventListener("visibilitychange",onVisibility,true);
            window.__ALEK_FOREGROUND_ACTIVITY__=onForegroundActivity;
            this.dispose=()=>{
                wakeEvents.forEach(([target,name])=>target.removeEventListener(name,onForegroundActivity,true));
                window.removeEventListener("pagehide",sleep,true);
                window.removeEventListener("alek:foreground-activity",onForegroundActivity,true);
                window.removeEventListener("alek:resource-wake",onForegroundActivity,true);
                document.removeEventListener("visibilitychange",onVisibility,true);
                if(window.__ALEK_FOREGROUND_ACTIVITY__===onForegroundActivity)delete window.__ALEK_FOREGROUND_ACTIVITY__;
            };
            publish(true,"startup");
        },
        async stop(){this.dispose?.();this.dispose=null;}
    });
})();
