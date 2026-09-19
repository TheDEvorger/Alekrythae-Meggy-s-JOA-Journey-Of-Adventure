(function registerPerformanceModule(){
    "use strict";
    const app=window.Alekrythae;if(!app)throw new Error("Alekrythae orkestratörü bulunamadı");
    const PROFILES=Object.freeze(["efficient","balanced","cinematic","eco","cpu-ram"]),PROFILE_SET=new Set(PROFILES);
    app.registerModule({
        id:"application.performance",
        order:15,
        async start({eventBus}){
            const root=document.documentElement;
            const normalized=preferred=>{const value=String(preferred||root.dataset.alekPerformance||"").trim().toLowerCase();return PROFILE_SET.has(value)?value:"efficient";};
            const setProfile=(preferred,{emit=true}={})=>{
                const profile=normalized(preferred);root.dataset.alekPerformance=profile;
                const shell=document.getElementById("alekV2Shell");if(shell)shell.dataset.performance=profile;
                if(emit){eventBus.emit("performance:profile-changed",{profile});window.dispatchEvent(new CustomEvent("alek:performance-profile-changed",{detail:{profile}}));}
                return profile;
            };
            this.onSuspend=()=>root.classList.add("alek-suspend");
            this.onResume=()=>{root.classList.remove("alek-suspend");setProfile(root.dataset.alekPerformance,{emit:false});};
            this.offSuspend=eventBus.on("app:suspended",this.onSuspend);
            this.offResume=eventBus.on("app:resumed",this.onResume);
            const efficientStyle=document.createElement("style");
            efficientStyle.id="alek-v0124-efficient-profile";
            efficientStyle.textContent=`
html[data-alek-performance="efficient"] :is(.v9-core-orb,.v9-core-moon,.taxonomy-data-sigil,.adventure-portal-moon,.alek-state-ribbon,.meggy-orb:not(.mv-speaking),.meggy-orb:not(.mv-speaking) img){animation:none!important;will-change:auto!important}
html[data-alek-performance="efficient"] :is(.v9-masthead,.alek-v2-nav,.taxonomy-circle-shade.r70,.joa-floating-palette,.tavern-meggy-col,.tavern-center,.tavern-speakers){backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
html[data-alek-performance="efficient"] .taxonomy-core-moon-image{animation:none!important;will-change:auto!important}
html[data-alek-performance="efficient"] .resource-energy-lane{animation-play-state:running!important;will-change:transform,filter,opacity!important}
html[data-alek-performance="efficient"] :is(.journey-card.is-immortal,.focused-avatar-shell.is-immortal,#activeAvatarImg.character-detail-avatar-stage.is-immortal){animation:none!important;will-change:auto!important}
html[data-alek-performance="efficient"] :is(.journey-card.is-immortal::before,.journey-card.is-immortal::after,.focused-avatar-shell.is-immortal::before,.focused-avatar-shell.is-immortal::after,#activeAvatarImg.character-detail-avatar-stage.is-immortal::before,#activeAvatarImg.character-detail-avatar-stage.is-immortal::after){animation:none!important;will-change:auto!important}
`;
            document.head.appendChild(efficientStyle);this.efficientStyle=efficientStyle;
            setProfile(root.dataset.alekPerformance,{emit:false});
            if(document.hidden)this.onSuspend();else this.onResume();
            window.__ALEK_PERFORMANCE__=Object.freeze({profile:()=>normalized(root.dataset.alekPerformance),setProfile,profiles:PROFILES,revision:140});
        },
        async stop(){
            this.offSuspend?.();this.offResume?.();document.documentElement.classList.remove("alek-suspend");
            this.efficientStyle?.remove();this.efficientStyle=null;delete window.__ALEK_PERFORMANCE__;
        }
    });
})();
