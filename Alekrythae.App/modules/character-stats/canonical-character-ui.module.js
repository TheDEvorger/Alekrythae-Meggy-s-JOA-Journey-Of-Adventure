(function registerCanonicalCharacterUiModule(){
    "use strict";

    const app=window.Alekrythae;
    if(!app)throw new Error("Alekrythae orkestratörü bulunamadı");

    const editableTarget=target=>Boolean(target?.closest?.("input, textarea, select, [contenteditable='true']"));

    app.registerModule({
        id:"character-stats.canonical-ui",
        order:75,
        async start(){
            this.onKeyDown=event=>{
                if(event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
                if(event.code!=="KeyK"&&String(event.key||"").toLocaleLowerCase("tr")!=="k")return;
                if(editableTarget(event.target)||document.querySelector(".alek-stat-modal-overlay"))return;
                const trigger=document.querySelector("#alekLegacyMainPanel.character-detail-open #openStatCircleBtn:not(:disabled)");
                if(!trigger)return;
                event.preventDefault();
                event.stopPropagation();
                trigger.click();
            };
            window.addEventListener("keydown",this.onKeyDown,true);
        },
        async stop(){
            if(this.onKeyDown)window.removeEventListener("keydown",this.onKeyDown,true);
            this.onKeyDown=null;
        }
    });
})();
