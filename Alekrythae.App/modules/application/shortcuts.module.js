(function registerShortcutModule(){
"use strict";
const app=window.Alekrythae;if(!app)throw new Error("Alekrythae orkestratörü bulunamadı");
const plain=e=>!e?.altKey&&!e?.ctrlKey&&!e?.metaKey&&!e?.shiftKey;
const fn=e=>{const c=String(e?.code||e?.key||"");if(["F1","F2","F3","F4"].includes(c))return c;const n=Number(e?.keyCode);return n===112?"F1":n===113?"F2":n===114?"F3":n===115?"F4":"";};
const quoteMenuKey=e=>!e?.ctrlKey&&!e?.altKey&&!e?.metaKey&&(
 e?.key==='"'||e?.key==="é"||e?.key==="²"||
 e?.code==="Quote"||e?.code==="Backquote"||
 (e?.code==="Digit2"&&e?.shiftKey)||
 Number(e?.keyCode)===222||Number(e?.keyCode)===192
);
const editable=e=>{const t=e?.target;return !!(t&&((t.matches&&t.matches("input,textarea,select"))||t.isContentEditable));};
const blocked=()=>{try{return window.__alekHasHardBlockingWindow?.()===true;}catch(_){return false;}};
const dismissSoft=()=>{try{window.__alekDismissPrimaryNavigationOverlays?.();}catch(_){}};
const consume=e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();};
let lastKey="",lastAt=0;
const go=target=>{
 const nav=window.__alekNavigatePrimarySurface;
 if(typeof nav==="function"){void nav(target);return true;}
 const fallback={help:window.__alekOpenShortcutHelp,map:window.__alekOpenMapDirect,inventory:window.__alekOpenInventoryDirect,ai:window.__alekOpenAssistant}[target];
 if(typeof fallback==="function"){void fallback();return true;}
 return false;
};
app.registerModule({
 id:"application.shortcuts",order:20,
 async start({eventBus}){
  window.__ALEK_WORLD_MAP_SHORTCUT_OWNED__=true;
  this.onKeyDown=e=>{
   const editing=editable(e);
   // R54: Tab ile odak dolaşımı ve tırnak/backquote yüzey değiştiricisi tamamen
   // kapalıdır. Türkçe Q klavyede küçük i fiziksel olarak Quote kodu üretir;
   // gerçek bir yazı alanındayken bu kod normal karakter girişi olarak bırakılır.
   if(e.key==="Tab"||e.code==="Tab"||(!editing&&quoteMenuKey(e))){consume(e);return;}
   // R18 sözleşmesi: Esc bir ANA MENÜ tuşu değildir. Yalnız açık geçici pencereyi
   // kapatır. Geçici pencere yoksa Esc ana yüzey üzerinde tüketilir ve hiçbir yere gitmez.
   if(e.key==="Escape"){
    if(window.__alekCancelMoonFarewell?.(e)===true){consume(e);return;}
    if(document.querySelector(".alek-emoji-keyboard")){
     consume(e);window.__alekCloseEmojiKeyboard?.();return;
    }
   if(document.querySelector(".taxonomy-circle-shade.r70")){
     consume(e);window.__alekCloseJoATaxonomy?.();return;
    }
    // JoA kendi geçici durumlarını (rota, seçim, çekmece, palet ve yerleştirme)
    // öncelik sırasıyla kapatır. Esc burada tüketilirse JoA listener'ı olayı hiç
    // göremez ve geçici durum açık kaldığı için ana yüzey geçişleri de kilitlenir.
    if(document.querySelector(".joa-world-shell"))return;
    if(blocked())return; // Kağıt/modal/drawer/palet kendi Esc işleyicisine ulaşsın.
    if(window.__alekIsAnyPrimarySurfaceOpen?.()||window.__alekCurrentPrimarySurface){consume(e);return;}
    return;
   }

   // R33: Bir kart/kağıt/modal/palet açıksa F1/F2/F3/F4 kesinlikle yüzey değiştirmez.
   // Önce ESC ile açık pencere kapanır, sonra ana menü kısayolları yeniden etkinleşir.
   if(blocked()){
    if((!editing&&quoteMenuKey(e))||fn(e)){consume(e);}
    return;
   }

   if(!plain(e))return;
   const k=fn(e);if(!k)return;
   consume(e);dismissSoft();
   const now=performance.now();
   if(e.repeat||(lastKey===k&&now-lastAt<180))return;
   lastKey=k;lastAt=now;

   if(k==="F1"){if(!window.__alekIsPrimarySurfaceOpen?.("inventory"))go("inventory");return;}
   if(k==="F2"){if(!window.__alekIsPrimarySurfaceOpen?.("map"))go("map");return;}
   if(k==="F3"){if(!window.__alekIsPrimarySurfaceOpen?.("ai"))go("ai");return;}
   if(k==="F4"){void window.__alekMoonFarewellExit?.();return;}
  };
  window.addEventListener("keydown",this.onKeyDown,true);
  eventBus.emit("shortcut:ready",{id:"joa.fixed-menus-r56",keys:"F1 F2 F3 F4 · Tab ve tırnak kapalı"});
 },
 async stop(){window.removeEventListener("keydown",this.onKeyDown,true);this.onKeyDown=null;delete window.__ALEK_WORLD_MAP_SHORTCUT_OWNED__;}
});
})();
