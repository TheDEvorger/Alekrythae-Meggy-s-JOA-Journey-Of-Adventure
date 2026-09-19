(function installChunkGenerator(){
    "use strict";
    const PROFILE=window.AlekrythaeWorldLoreProfile||{layers:{surface:{},sky:{},underground:{},cosmic:{}},archetypes:[]};
    const SURFACE_TAXONOMY=window.AlekrythaeSurfaceTaxonomy||null;
    const FOLK_HABITATS=Array.isArray(PROFILE.folkHabitats)?PROFILE.folkHabitats:[];
    const FOLK_GEO_CONTRACT=new Map((Array.isArray(PROFILE.folkGeographyContract)?PROFILE.folkGeographyContract:[]).map(row=>[String(row?.[0]||""),row.slice(1).map(String)]));
    const CARTOGRAPHY=PROFILE.cartography||{version:"classic-vector-v1"};
    const fract=value=>value-Math.floor(value);
    const smooth=t=>t*t*(3-2*t);
    const mix=(a,b,t)=>a+(b-a)*t;
    const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
    // R110 · Bitwise koordinat dönüşümü uzak dünyayı 32 bitte tekrar ettiriyordu.
    // IEEE-754 bitlerini katlayarak JavaScript'in temsil edebildiği bütün sonlu
    // koordinatlarda kararlı, tekrarsız bir prosedürel kimlik üretiriz.
    const HASH_BITS=new DataView(new ArrayBuffer(8));
    const foldHashNumber=value=>{
        const number=Number(value);HASH_BITS.setFloat64(0,Number.isFinite(number)?number:0,true);
        let h=HASH_BITS.getUint32(0,true)^Math.imul(HASH_BITS.getUint32(4,true),0x9e3779b1);
        h=Math.imul(h^(h>>>16),0x85ebca6b);h=Math.imul(h^(h>>>13),0xc2b2ae35);return(h^(h>>>16))>>>0;
    };
    const hash=(seed,x,z)=>{
        let h=foldHashNumber(Number(seed)||1)^Math.imul(foldHashNumber(x),374761393)^Math.imul(foldHashNumber(z),668265263);
        h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295;
    };
    const valueNoise=(seed,x,z)=>{
        const x0=Math.floor(x),z0=Math.floor(z),tx=smooth(fract(x)),tz=smooth(fract(z));
        return mix(mix(hash(seed,x0,z0),hash(seed,x0+1,z0),tx),mix(hash(seed,x0,z0+1),hash(seed,x0+1,z0+1),tx),tz);
    };
    const fbm=(seed,x,z,octaves=5)=>{
        let value=0,amplitude=.55,frequency=1,total=0;
        for(let i=0;i<octaves;i++){value+=valueNoise(seed+i*1013,x*frequency,z*frequency)*amplitude;total+=amplitude;amplitude*=.5;frequency*=2;}
        return value/total;
    };
    const ridged=(seed,x,z,octaves=5)=>1-Math.abs(fbm(seed,x,z,octaves)*2-1);
    const signed=(seed,x,z,octaves=5)=>fbm(seed,x,z,octaves)*2-1;
    const layerSalt=layerKey=>layerKey==="sky"?7000003:layerKey==="underground"?13000007:layerKey==="cosmic"?19000033:0;
    const normalizedLayer=layerKey=>["surface","sky","underground","cosmic"].includes(String(layerKey))?String(layerKey):"surface";
    // v0.1.26 · 1 dünya birimi hâlâ 1 metredir. Kıta/iklim/biyom
    // kütlelerinin dalga boyu büyütülür ki 240 m yerel alan gibi görünsün.
    const TARGET_WATER_COVERAGE=.50; // R111 · sonsuz yüzeyde hedef dış-zarf: yaklaşık yarı kara, yarı açık su
    const SURFACE_GEOGRAPHY_SCALE_M=6.0;
    const SKY_GEOGRAPHY_SCALE_M=3.8;
    const UNDERGROUND_GEOGRAPHY_SCALE_M=3.2;
    const COSMIC_GEOGRAPHY_SCALE_M=4.4;
    const palette={
        deepWater:[3,21,48],ocean:[4,48,91],water:[7,82,132],lagoon:[18,130,157],shallows:[64,174,178],moonSea:[43,83,123],aethSea:[31,124,155],mossOcean:[24,105,103],crystalCurrent:[54,139,164],pearlSea:[79,165,166],auroraSea:[68,120,151],
        meadow:[65,153,83],forest:[24,111,68],deepForest:[15,83,57],flower:[95,168,93],moss:[78,139,91],clearReed:[58,139,104],waterMeadow:[74,151,111],giantTree:[28,125,70],worldTree:[46,143,78],silverCrown:[102,139,122],turquoiseSap:[45,151,126],goldBloom:[148,151,78],auroraBasin:[77,137,147],waterfallRealm:[70,147,139],pearlCoast:[92,166,160],emeraldValley:[52,142,80],sunGoldHill:[143,132,72],
        tropical:[73,151,88],storm:[73,126,111],crystal:[92,142,151],highland:[105,133,116],mountain:[126,145,137],snow:[197,219,214],sinkhole:[76,57,42],caveMouth:[17,13,12],
        violetForest:[84,76,121],arcaneCrystal:[74,131,142],sunSteppe:[133,126,78],volcanic:[92,70,64],frostForest:[133,158,157],stormHighland:[78,101,113],floralParadise:[104,145,91],
        moonGrove:[73,82,107],oryGarden:[91,71,112],mediterranean:[108,143,82],giantPlain:[112,137,77],livingRoot:[36,119,67],redMetal:[126,74,54],dragonRidge:[112,78,55],glacialCrystal:[167,199,205],twilightEdge:[61,75,88],coralCoast:[74,157,132],
        skyVoid:[5,17,37],cloud:[127,183,207],skyMeadow:[86,170,121],skyForest:[39,128,108],stormIsland:[87,109,151],lightGarden:[114,190,194],skyFrost:[174,204,213],skyCrystal:[104,153,176],skySun:[166,148,85],skyWaterGarden:[69,143,126],skyGiantTree:[45,139,87],skyRoot:[66,132,103],skyPearl:[116,176,171],skyAurora:[112,143,183],skyGold:[174,151,84],skyViolet:[119,92,154],skyTeal:[58,148,154],skyWhite:[177,201,199],
        skyLake:[40,143,178],skyRiver:[55,166,190],skyFlower:[144,166,104],skyFruit:[76,145,89],skyMist:[104,140,153],skyRock:[112,117,114],
        caveVoid:[20,17,14],rock:[82,70,58],darkRock:[48,48,49],limestone:[121,113,94],clay:[129,82,52],mineral:[104,101,88],lava:[118,48,30],basalt:[62,55,55],crystalCave:[58,151,205],
        copper:[177,91,48],iron:[137,62,45],gold:[214,169,58],silver:[166,177,181],amethyst:[131,74,170],emerald:[47,145,89],sapphire:[49,105,170],
        mushroom:[72,157,83],mushroomViolet:[147,73,177],mushroomAmber:[207,139,52],mushroomCyan:[57,168,173],
        undergroundWater:[24,90,101],deepUndergroundWater:[13,55,68],salt:[190,188,174],obsidian:[35,31,38],sulfur:[135,127,57],roseCrystal:[169,91,124],blueStone:[62,83,112],mossStone:[65,92,68],quartz:[172,183,190],rootCathedral:[77,107,72],pearlGrotto:[108,158,161],prismatic:[126,103,171],livingStone:[74,126,91],aethCrystal:[52,175,183],whiteVault:[183,187,177],flowerCave:[116,143,97],amberCave:[161,118,65],azureGarden:[55,122,144],silverCavern:[139,151,151],
        cosmicVoid:[3,7,22],starMist:[31,43,91],starMatter:[79,91,151],astralGarden:[75,143,133],ringSurface:[112,125,176],cosmicAeth:[59,185,208],cosmicStorm:[91,58,139],cosmicCrystal:[96,116,184],cosmicEmber:[139,74,91],cosmicPale:[151,164,196],
        nebulaRose:[128,68,137],nebulaBlue:[55,93,157],cosmicGold:[175,137,72],voidGlass:[42,64,105],cosmicGreen:[59,132,112],cosmicMagenta:[144,69,126],starGlass:[80,128,168],silverRing:[136,149,176],prismaticStar:[126,101,182],indigoQuiet:[31,45,82],cosmicTeal:[46,142,146],whiteGold:[180,165,116],cosmicRose:[157,88,142],cosmicAzure:[64,116,177]
    };

    const variationAxes=PROFILE.biomeVariationEngine?.axes||{};
    const rgbShift=(color,hueBias=0,lightBias=0,satBias=0)=>{const [r,g,b]=color.map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min,l=(max+min)/2;let h=0,s=0;if(delta){s=delta/(1-Math.abs(2*l-1));if(max===r)h=60*(((g-b)/delta)%6);else if(max===g)h=60*((b-r)/delta+2);else h=60*((r-g)/delta+4);}h=(h+hueBias+360)%360;s=clamp(s+satBias,0,1);const nl=clamp(l+lightBias,0,1),c=(1-Math.abs(2*nl-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=nl-c/2;let rr=0,gg=0,bb=0;if(h<60){rr=c;gg=x}else if(h<120){rr=x;gg=c}else if(h<180){gg=c;bb=x}else if(h<240){gg=x;bb=c}else if(h<300){rr=x;bb=c}else{rr=c;bb=x}return[rr,gg,bb].map(v=>Math.round(clamp((v+m)*255,0,255)));};
    const mixRgb=(a,b,t)=>{const k=clamp(Number(t)||0,0,1),aa=Array.isArray(a)?a:[96,78,58],bb=Array.isArray(b)?b:[16,11,9];return[0,1,2].map(i=>Math.round(mix(Number(aa[i])||0,Number(bb[i])||0,k)));};
    const normalizedInfluences=(entries,temperature=.22)=>{
        const ranked=entries.map(entry=>({...entry,score:Number(entry.score)||0})).sort((a,b)=>b.score-a.score),maximum=ranked[0]?.score||0;
        const raw=ranked.map(entry=>Math.exp(clamp((entry.score-maximum)/Math.max(.001,temperature),-20,0))),total=raw.reduce((sum,value)=>sum+value,0)||1;
        return ranked.map((entry,index)=>({...entry,weight:raw[index]/total}));
    };

    // PATCH104 · 24 PRIMARY FOLK BIOME PROVINCES
    // Her halk yüzeyde kendi büyük coğrafi çekirdeğine sahip olabilir. Bu renkler
    // halk kostümü gibi düz boya değildir; gerçek zemin paletidir. Jeoloji, su,
    // yükselti ve yakın-zoom relief bunun üstünde çalışır.
    const FOLK_SURFACE_BIOME_STYLES=Object.freeze([
        {key:"haem-tyaern",name:"Hæm’Tyærn Bereketli Ova",color:[91,139,78]},
        {key:"dal-rhim",name:"Dal’Rhim Ay-Gölge Koruluğu",color:[82,92,108]},
        {key:"ory-kaen",name:"Ory’Kaen Kül-Mor Yaşam Diyarı",color:[96,79,105]},
        {key:"rhyirun-kharun",name:"Rhyirun Akıntı Kıyıları",color:[55,132,112]},
        {key:"thalass-moryn",name:"Thalass Gök-Eşik Yüksekliği",color:[91,128,119]},
        {key:"maerethi-solayn",name:"Mæřethi Tropik Meyve Kuşağı",color:[82,149,84]},
        {key:"thir-nocht",name:"Thir’Nocht Gece-Eşik Toprakları",color:[68,67,77]},
        {key:"dray-zurkhaer",name:"Draƴ’Zûrkhaer Termal Sırtları",color:[116,79,55]},
        {key:"aeth-vaeryn",name:"Aeth’Vaeryn Yaşayan Ormanı",color:[58,133,82]},
        {key:"zhar-kharzun",name:"Zhař’Kharzûn Ocak-Metal Vadisi",color:[126,79,55]},
        {key:"au-ben",name:"Au’Ben Avcı Korulukları",color:[92,130,80]},
        {key:"zil-krat",name:"Zil’Krat Kristal-Karst Yüksekliği",color:[91,113,109]},
        {key:"khaur-gath",name:"Khaur’Gath Büyük Av Ormanı",color:[73,106,67]},
        {key:"muo-nthir",name:"Muo’nthir Dev Otlak-Yüksekova",color:[108,132,105]},
        {key:"iskael-vaeryth",name:"Iskæł’Væryth Soğuk Vadi Kuşağı",color:[120,147,148]},
        {key:"kalyti-yhrae",name:"Kalyti’yhrae Biçim Bahçeleri",color:[104,124,101]},
        {key:"thae-ryn",name:"Thae’Ryn Çiçek-Hava Vadileri",color:[101,157,91]},
        {key:"neraeth-vaeluna",name:"Neræth’Vaelûna Rezonans Havzaları",color:[76,132,139]},
        {key:"gorum-maekhryth",name:"Gorûm Mineral-Kök Toprakları",color:[76,94,69]},
        {key:"vekthar-numyr",name:"Vekthar Kütle-Denge Platosu",color:[108,117,102]},
        {key:"thyra-vekuryn",name:"Thyra Fırtına Yüksekliği",color:[78,103,116]},
        {key:"syl-nethroth",name:"Syl’Nethrøth Kök-Ağ Ormanı",color:[48,110,73]},
        {key:"asteryn-veyrkha",name:"Asteryn Yıldız-Eşik Yaylası",color:[91,102,133]},
        {key:"vhargaeth-run",name:"Vhařgæth Dönüşüm-Eşik Ormanı",color:[63,76,79]}
    ]);
    const isColdRealmKey=key=>/dal-rhim|iskael-vaeryth|zilk|thalass|thyra/.test(String(key||"").toLowerCase());
    const isShadowRealmKey=key=>/dal-rhim|thir-nocht|ory-kaen|vhargaeth/.test(String(key||"").toLowerCase());
    const isVerdantRealmKey=key=>/aeth-vaeryn|syl-nethroth|haem-tyaern|maerethi|au-ben|khaur-gath|thae-ryn/.test(String(key||"").toLowerCase());
    const folkStyleFor=(index,key="")=>{
        const byKey=FOLK_SURFACE_BIOME_STYLES.find(item=>item.key===String(key||""));
        return byKey||FOLK_SURFACE_BIOME_STYLES[Math.abs(Number(index)||0)%FOLK_SURFACE_BIOME_STYLES.length];
    };
    const surfaceFolkBiomeProvince=(seed,x,z,environment={})=>{
        const px=Number(x)||0,pz=Number(z)||0;
        // R110 · Diyar sınırları tek hücrede renk değiştirmez. Organik biçimde
        // bükülen komşu adayların en güçlü üçü tutulur ve softmax ağırlığıyla
        // karıştırılır; sonuç gerçek bir geçiş kuşağıdır.
        const warpScale=860_000_000;
        const wx=px+signed(seed+104101,(px+910_000)/warpScale,(pz-730_000)/warpScale,3)*42_000_000;
        const wz=pz+signed(seed+104111,(px-1_370_000)/warpScale,(pz+1_190_000)/warpScale,3)*42_000_000;
        const candidates=new Map();
        const consider=(claim,score,provinceRadiusM,tierCluster)=>{
            const index=Math.abs(Number(claim)||0)%24,folk=FOLK_HABITATS[index]||{};
            const fit=affinityFit(folk.affinity?.surface,environment),layerWeight=clamp(Number(folk.layers?.surface)||.24,.12,1);
            const item={score:score+fit*.12+layerWeight*.035,index,folk,fit,style:folkStyleFor(index,folk.key),provinceRadiusM,sizeK:Math.max(1,Math.round(provinceRadiusM/24_000)),tierCluster};
            if(!candidates.has(index)||item.score>candidates.get(index).score)candidates.set(index,item);
        };
        // 192 milyon metrelik ana ağ: dünya görünümünde bile sınırlar organik,
        // bölgeler geniş ve okunaklı kalır. Ayrıntı, ana alanı parçalamadan ceplerde
        // açılır; yalnız 3×3 komşu hücre gerekir.
        const macroCell=192_000_000,mbx=Math.floor(wx/macroCell),mbz=Math.floor(wz/macroCell);
        for(let oz=-1;oz<=1;oz++)for(let ox=-1;ox<=1;ox++){
            const cx=mbx+ox,cz=mbz+oz;
            const centerX=(cx+.5)*macroCell+(hash(seed+104121,cx,cz)-.5)*macroCell*.46;
            const centerZ=(cz+.5)*macroCell+(hash(seed+104131,cx,cz)-.5)*macroCell*.46;
            const claim=Math.floor(hash(seed+104141,cx*31+7,cz*29-11)*24)%24;
            const edge=signed(seed+104211+claim*37,(wx+claim*17_000)/58_000_000,(wz-claim*13_000)/58_000_000,3)*.135;
            consider(claim,-Math.hypot(wx-centerX,wz-centerZ)/macroCell+edge,96_000_000,8000);
        }
        // Bölgesel ve yerel cepler her hücrede doğmaz. Kazandıklarında ana diyara
        // yumuşakça karışır; boş hücreler için gürültü/affinity hesabı yapılmaz.
        const pockets=[
            {cell:48_000_000,chance:.12,minRadius:4_800_000,maxRadius:20_000_000,salt:104301,bias:.31,tier:2000},
            {cell:12_000_000,chance:.04,minRadius:300_000,maxRadius:2_400_000,salt:104401,bias:.24,tier:500}
        ];
        for(const pocket of pockets){
            const bx=Math.floor(wx/pocket.cell),bz=Math.floor(wz/pocket.cell);
            for(let oz=-1;oz<=1;oz++)for(let ox=-1;ox<=1;ox++){
                const cx=bx+ox,cz=bz+oz;if(hash(seed+pocket.salt,cx,cz)>=pocket.chance)continue;
                const centerX=(cx+.5)*pocket.cell+(hash(seed+pocket.salt+11,cx,cz)-.5)*pocket.cell*.68;
                const centerZ=(cz+.5)*pocket.cell+(hash(seed+pocket.salt+17,cx,cz)-.5)*pocket.cell*.68;
                const radius=mix(pocket.minRadius,pocket.maxRadius,Math.pow(hash(seed+pocket.salt+23,cx-7,cz+13),.74));
                const angle=(hash(seed+pocket.salt+31,cx+11,cz-17)-.5)*Math.PI,aspect=mix(.58,1.72,hash(seed+pocket.salt+37,cx-19,cz+23));
                const dx=wx-centerX,dz=wz-centerZ,ca=Math.cos(angle),sa=Math.sin(angle),rx=(dx*ca+dz*sa)/(radius*aspect),rz=(-dx*sa+dz*ca)/(radius/Math.sqrt(aspect));
                const edgeWarp=signed(seed+pocket.salt+41,(wx-centerX)/Math.max(24_000,radius*.54),(wz-centerZ)/Math.max(24_000,radius*.54),3)*.18;
                const distance=Math.hypot(rx,rz)-edgeWarp;if(distance>1.18)continue;
                const claim=Math.floor(hash(seed+pocket.salt+29,cx*37+5,cz*41-9)*24)%24;
                const organic=signed(seed+pocket.salt+claim*43,(wx-centerX)/Math.max(24_000,radius*.72),(wz-centerZ)/Math.max(24_000,radius*.72),2)*.07;
                consider(claim,pocket.bias-distance*.34+organic,radius,pocket.tier);
            }
        }
        if(!candidates.size){const fallback={score:0,index:0,folk:FOLK_HABITATS[0]||{},fit:.5,style:folkStyleFor(0),provinceRadiusM:2_400_000,sizeK:100,tierCluster:200};candidates.set(0,fallback);}
        const ranked=[...candidates.values()].sort((a,b)=>b.score-a.score).slice(0,3),first=ranked[0],second=ranked[1]||first,third=ranked[2]||second;
        const temperature=.105,rawWeights=ranked.map(item=>Math.exp(clamp((item.score-first.score)/temperature,-18,0))),weightTotal=rawWeights.reduce((sum,value)=>sum+value,0)||1;
        const influences=ranked.map((item,index)=>({index:item.index,key:item.style.key,name:item.style.name,color:item.style.color,weight:rawWeights[index]/weightTotal,score:item.score}));
        while(influences.length<3)influences.push({...influences[influences.length-1],weight:0});
        const color=[0,1,2].map(channel=>Math.round(influences.reduce((sum,item)=>sum+(Number(item.color?.[channel])||0)*item.weight,0)));
        const margin=Math.max(0,first.score-second.score),transition=smooth(clamp((.18-margin)/.18,0,1));
        return{
            primaryIndex:first.index,secondaryIndex:second.index,tertiaryIndex:third.index,
            primaryKey:first.style.key,secondaryKey:second.style.key,tertiaryKey:third.style.key,
            primaryName:first.style.name,secondaryName:second.style.name,tertiaryName:third.style.name,
            primaryColor:first.style.color,secondaryColor:second.style.color,tertiaryColor:third.style.color,
            primaryWeight:influences[0].weight,secondaryWeight:influences[1].weight,tertiaryWeight:influences[2].weight,
            influences,color,transition,margin,fit:first.fit,
            provinceRadiusM:first.provinceRadiusM,sizeK:first.sizeK,tierCluster:first.tierCluster
        };
    };
    const biomeVariation=(seed,x,z,layerKey,baseBiome,color)=>{const scale=layerKey==="underground"?24000:layerKey==="sky"?96000:layerKey==="cosmic"?140000:180000,ix=Math.floor(x/scale),iz=Math.floor(z/scale),axisNames=["landform","flora","water","atmosphere","arcana","light"],picked=axisNames.map((axis,index)=>{const list=variationAxes[axis]||[axis];return list[Math.floor(hash(seed+index*7103,ix+index*17,iz-index*23)*list.length)%list.length];}),signature=picked.join(" · "),sx=x/scale,sz=z/scale,hue=signed(seed+77001,sx*.72,sz*.72,4)*7.5,light=signed(seed+77002,sx*.66,sz*.66,4)*.045,sat=signed(seed+77003,sx*.81,sz*.81,4)*.055;return{biome:`${baseBiome} · ${picked[0]} ${picked[1]}`,baseBiome,variantKey:`${layerKey}:${ix}:${iz}:${picked.join("|")}`,variantName:signature,color:rgbShift(color,hue,light,sat)};};

    const affinityFit=(rules,environment)=>{
        let matched=0,total=0;
        for(const [axis,rule] of Object.entries(rules||{})){
            if(!Array.isArray(rule)||rule.length<2||!Object.prototype.hasOwnProperty.call(environment,axis))continue;
            const target=clamp(Number(rule[0])||0,0,1),weight=Math.max(0,Number(rule[1])||0);if(!weight)continue;
            matched+=(1-Math.abs(clamp(Number(environment[axis])||0,0,1)-target))*weight;total+=weight;
        }
        return total?matched/total:.46;
    };
    const cultureFor=(seed,x,z,layerKey,environment)=>{
        const layer=normalizedLayer(layerKey),scale=layer==="underground"?220000:layer==="sky"?900000:layer==="cosmic"?1800000:520000,rx=Math.floor(Number(x||0)/scale),rz=Math.floor(Number(z||0)/scale);
        if(!FOLK_HABITATS.length)return{folkIndex:0,folkKey:"haem-tyaern",folkName:"Ħǽɱ’Ŧʏǽɍŋ",folkRomanized:"Hæm’Tyærn",folkColor:"#d2b26d",folkMotif:"citadel",folkStrength:.5,folkSettlement:.5,folkGeographyPrimary:"nehir-ovası",folkGeographyTags:["nehir-ovası","liman","verimli-vadi","göl-kıyısı"]};
        // Her halk en az bir lore-uyumlu ana katmanda bölgesel hak sahibidir.
        // Hak tek başına yetmez: iklim uyumu düşükse daha uygun komşu halk kazanır.
        // Böylece 24 halk görünür kalır ama örneğin Asteryn sıradan bir yüzey
        // köyüne, Mæřethi de dağ zirvesine rastgele basılmaz.
        const eligible=[];for(let index=0;index<FOLK_HABITATS.length;index++)if(Number(FOLK_HABITATS[index]?.layers?.[layer])>=.25)eligible.push(index);
        const claimIndex=eligible.length?eligible[Math.floor(hash(seed+layerSalt(layer)+79031,rx,rz)*eligible.length)%eligible.length]:0;
        let selected=FOLK_HABITATS[0],selectedIndex=0,best=-Infinity,bestFit=.46;
        for(let index=0;index<FOLK_HABITATS.length;index++){
            const folk=FOLK_HABITATS[index]||{},layerWeight=clamp(Number(folk.layers?.[layer])||0,0,1);if(layerWeight<=0)continue;
            const fit=affinityFit(folk.affinity?.[layer],environment);
            const regional=hash(seed+layerSalt(layer)+index*811,rx+index*29,rz-index*41),continuity=hash(seed+index*131,rx,rz);
            const habitatClaim=index===claimIndex?( .28+fit*.72)*.92:0;
            const score=layerWeight*.64+fit*.92+regional*.14+continuity*.06+habitatClaim;
            if(score>best){best=score;bestFit=fit;selected=folk;selectedIndex=index;}
        }
        const folkKey=String(selected.key||`folk-${selectedIndex+1}`),geoTags=[...(FOLK_GEO_CONTRACT.get(folkKey)||[])];
        return{folkIndex:selectedIndex,folkKey,folkName:String(selected.name||""),folkRomanized:String(selected.romanized||""),folkColor:String(selected.color||"#9ed5e2"),folkMotif:String(selected.motif||"citadel"),folkStrength:clamp(bestFit,0,1),folkSettlement:clamp(Number(selected.settlement)||.5,0,1),folkGeographyPrimary:String(geoTags[0]||""),folkGeographyTags:geoTags};
    };
    const atlasFields=(seed,x,z,layerKey,environment,{walkable=false,water=false,ridge=0,height=0}={})=>{
        const layer=normalizedLayer(layerKey),culture=cultureFor(seed,x,z,layer,environment),cellSize=layer==="underground"?128:layer==="sky"?160:layer==="cosmic"?176:192,cx=Math.floor(Number(x||0)/cellSize),cz=Math.floor(Number(z||0)/cellSize);
        const nativeWater=Number(FOLK_HABITATS[culture.folkIndex]?.affinity?.[layer]?.water?.[0])>.74;
        let terrainFit=walkable?1:0;if(layer==="surface"&&water&&nativeWater)terrainFit=1;if(layer==="sky"&&!walkable&&culture.folkKey==="thyra-vekuryn"&&Number(environment.storm)>.66)terrainFit=.72;
        if(layer==="sky"&&culture.folkKey==="asteryn-veyrkha"&&Number(environment.astral)<.38)terrainFit=0;
        if(layer==="cosmic"&&!walkable)terrainFit=0;
        const reliefPenalty=layer==="surface"?clamp(1-Math.max(0,Number(ridge)||0)*.28-Math.max(0,Number(height)-14)/22,0,1):1;
        const settlementPotential=clamp(culture.folkSettlement*culture.folkStrength*terrainFit*reliefPenalty,0,1);
        return{
            ...culture,cartographyVersion:String(CARTOGRAPHY.version||"classic-vector-v1"),cartographyCellM:cellSize,
            settlementPotential,siteRank:hash(seed+layerSalt(layer)+88001,cx,cz),featureRank:hash(seed+layerSalt(layer)+88003,cx+17,cz-23),textureRank:hash(seed+layerSalt(layer)+88007,Math.floor(Number(x||0)/24),Math.floor(Number(z||0)/24)),
            reliefLight:clamp(.5+signed(seed+layerSalt(layer)+88103,Number(x||0)*.0017,Number(z||0)*.0017,3)*.5,0,1)
        };
    };
    const archetypeIndex=seed=>Math.floor(hash(Number(seed)||1,173,991)*12)%12;
    const archetypeName=seed=>PROFILE.archetypes?.[archetypeIndex(seed)]||"yaşayan-kıtalar";
    const warpCoordinates=(seed,x,z,scale=.00042,strength=1650)=>{
        const wx=signed(seed+9301,x*scale,z*scale,4)*strength;
        const wz=signed(seed+19301,(x+9000)*scale,(z-7000)*scale,4)*strength;
        return{x:x+wx,z:z+wz};
    };

    // PATCH83: makro dünya alanları kıta/iklim ölçeğini binlerce kilometreye taşır.
    // Yerel eski motor bu alanların üzerinde kıyı, göl, nehir ve mikro rölyefi üretmeye devam eder.
    const rareSurfaceAnomaly=(seed,x,z)=>{
        const cell=260000,cx=Math.floor(Number(x||0)/cell),cz=Math.floor(Number(z||0)/cell),roll=hash(seed+845003,cx,cz);
        if(roll>.012)return{pitStrength:0,caveEntranceStrength:0,pitRadiusM:0,pitDepthM:0,anomalyKey:""};
        const radius=320+Math.pow(hash(seed+845011,cx+17,cz-29),1.70)*3480,margin=6200;
        const centerX=cx*cell+margin+hash(seed+845021,cx-7,cz+13)*(cell-margin*2),centerZ=cz*cell+margin+hash(seed+845031,cx+31,cz-19)*(cell-margin*2);
        const distance=Math.hypot(Number(x||0)-centerX,Number(z||0)-centerZ),pitStrength=clamp(1-distance/radius,0,1);
        if(pitStrength<=0)return{pitStrength:0,caveEntranceStrength:0,pitRadiusM:radius,pitDepthM:0,anomalyKey:""};
        const caveRoll=hash(seed+845041,cx,cz),caveEntranceStrength=caveRoll<.35?clamp((pitStrength-.72)/.28,0,1):0;
        const pitDepthM=80+hash(seed+845051,cx+5,cz+11)*1720;
        return{pitStrength,caveEntranceStrength,pitRadiusM:radius,pitDepthM,anomalyKey:`surface-anomaly:${cx}:${cz}`};
    };
    const ARCHIPELAGO_CACHE=new Map();
    const cachePut=(cache,key,value,limit=4096)=>{cache.set(key,value);if(cache.size>limit){let trim=Math.max(64,Math.floor(limit*.12));for(const k of cache.keys()){if(trim--<=0)break;cache.delete(k);}}return value;};

    // PATCH97 · PLANETARY MACRO GEOGRAPHY
    // Yerküre artık "her hücrede bir kıta" mantığıyla üretilmez. Kara/su omurgası,
    // gezegen ölçekli ve kesintisiz tek bir alan üzerinden doğar. Böylece aynı
    // kadrajda onlarca eş-boy ada yerine birkaç dev kıta, ikincil kara kütlesi ve
    // gerçekten geniş okyanus boşlukları oluşur. Dünya'nın şekilleri kopyalanmaz;
    // yalnız kıta-okyanus hiyerarşisi ve doğal ölçek farkı örnek alınır.
    const ellipseDistance=(px,pz,x,z,rx,rz,angle)=>{const dx=px-x,dz=pz-z,ca=Math.cos(angle),sa=Math.sin(angle);return Math.hypot((dx*ca+dz*sa)/Math.max(1,rx),(-dx*sa+dz*ca)/Math.max(1,rz));};
    const taperedCapsuleField=(px,pz,segment)=>{
        const vx=segment.x2-segment.x1,vz=segment.z2-segment.z1,lengthSq=vx*vx+vz*vz;
        const t=lengthSq>0?clamp(((px-segment.x1)*vx+(pz-segment.z1)*vz)/lengthSq,0,1):0,eased=t*t*(3-2*t);
        const cx=segment.x1+vx*t,cz=segment.z1+vz*t,radius=Math.max(1,mix(segment.r1,segment.r2,eased));
        return 1-Math.hypot(px-cx,pz-cz)/radius;
    };

    // PATCH99 · Hiyerarşik Yaşayan Coğrafya
    // Bu alanlar yeni bir kıta üretmez. PATCH97'nin gezegen omurgasının içinde,
    // birkaç metreden yüzlerce kilometreye kadar birbirinin çocuğu gibi okunan
    // jeomorfolojik ayrıntılar üretir. Aynı koordinat her zoom'da aynı oluşuma
    // sahiptir; zoom yalnız renderer'ın hangi ölçeği gösterebildiğini değiştirir.
    const scatteredOvalField=(seed,x,z,config)=>{
        const px=Number(x)||0,pz=Number(z)||0,cellSize=Math.max(8,Number(config.cellSize)||1000),salt=Number(config.salt)||1;
        const baseX=Math.floor(px/cellSize),baseZ=Math.floor(pz/cellSize);let best=null;
        for(let oz=-1;oz<=1;oz++)for(let ox=-1;ox<=1;ox++){
            const cx=baseX+ox,cz=baseZ+oz;if(hash(seed+salt,cx,cz)>Number(config.chance||0))continue;
            const jitter=.76,centerX=(cx+.5+(hash(seed+salt+11,cx+7,cz-13)-.5)*jitter)*cellSize,centerZ=(cz+.5+(hash(seed+salt+17,cx-19,cz+5)-.5)*jitter)*cellSize;
            const radius=mix(Number(config.radiusMin)||4,Number(config.radiusMax)||cellSize*.32,Math.pow(hash(seed+salt+23,cx+29,cz-31),1.32));
            const aspect=mix(Number(config.aspectMin)||.48,Number(config.aspectMax)||1.85,hash(seed+salt+29,cx-37,cz+41));
            const rx=radius*(aspect>=1?aspect:1),rz=radius*(aspect>=1?1:1/Math.max(.28,aspect)),angle=(hash(seed+salt+31,cx+43,cz-47)-.5)*Math.PI;
            const d=ellipseDistance(px,pz,centerX,centerZ,rx,rz,angle);if(d>1.18)continue;
            const strength=smooth(clamp(1-d,0,1)),rim=smooth(clamp(1-Math.abs(d-.80)/.16,0,1)),edge=smooth(clamp(1-Math.abs(d-1)/.12,0,1));
            const candidate={strength,rim,edge,d,radius,rx,rz,angle,centerX,centerZ,depthScale:hash(seed+salt+43,cx+59,cz-61),theme:Math.floor(hash(seed+salt+47,cx-67,cz+71)*12),key:`${salt}:${cx}:${cz}`};
            if(!best||candidate.strength+candidate.rim*.12>best.strength+best.rim*.12)best=candidate;
        }
        return best||{strength:0,rim:0,edge:0,d:9,radius:0,rx:0,rz:0,angle:0,centerX:0,centerZ:0,depthScale:0,theme:0,key:""};
    };
    const zeroOvalFeature=()=>({strength:0,rim:0,edge:0,d:9,radius:0,rx:0,rz:0,angle:0,centerX:0,centerZ:0,depthScale:0,theme:0,key:""});
    const zeroLivingGeography=()=>({
        basinMacroStrength:0,basinRegionalStrength:0,localHollowStrength:0,microHollowStrength:0,pitStrength:0,pitRadiusM:0,pitDepthM:0,caveEntranceStrength:0,
        ridgeSpineStrength:0,ravineStrength:0,terraceStrength:0,rockShelfStrength:0,fjordStrength:0,deltaStrength:0,glacialBasinStrength:0,calderaStrength:0,
        rootHollowStrength:0,hotSpringStrength:0,gorumTraceStrength:0,formationLakeStrength:0,coastalWaterStrength:0,formationWaterType:"",formationClass:"plain",formationHeightDelta:0,loreGeoSignature:""
    });
    const surfaceLivingGeography=(seed,x,z,context={})=>{
        const px=Number(x)||0,pz=Number(z)||0,landSignal=Number(context.landSignal)||0;if(landSignal<=0)return zeroLivingGeography();
        const tier=Number.isFinite(Number(context.detailTier))?Number(context.detailTier):-1,showMacro=tier<0||tier<=6,showRegional=tier<0||tier<=5,showLocal=tier<0||tier<=4,showMicro=tier<0||tier<=2;
        const landMask=smooth(clamp((landSignal+.012)/.22,0,1)),coast=clamp(Number(context.coastAffinity)||0,0,1),moisture=clamp(Number(context.moisture)||0,0,1),warmth=clamp(Number(context.warmth)||0,0,1),arcana=clamp(Number(context.arcana)||0,0,1),ridge=clamp(Number(context.ridge)||0,0,1),river=clamp(Number(context.riverStrength)||0,0,1),height=Number(context.height)||0,macroBiome=String(context.macroBiomeKey||"");
        // 4 ölçekli çöküntü ailesi. Hücre merkezleri jitter'lıdır ve komşu hücreler
        // birlikte örneklendiği için görünür kare sınırı üretmez. Renderer uzak LOD'da
        // yalnız gereken ölçeği hesaplar; fiziksel sampleAt ise bütün ölçekleri görür.
        const macro=showMacro?scatteredOvalField(seed+991001,px,pz,{cellSize:4_800_000,chance:.18,radiusMin:260_000,radiusMax:1_450_000,aspectMin:.42,aspectMax:2.4,salt:99101}):zeroOvalFeature();
        const regional=showRegional?scatteredOvalField(seed+991101,px,pz,{cellSize:820_000,chance:.17,radiusMin:28_000,radiusMax:270_000,aspectMin:.38,aspectMax:2.1,salt:99111}):zeroOvalFeature();
        const local=showLocal?scatteredOvalField(seed+991201,px,pz,{cellSize:118_000,chance:.17,radiusMin:1200,radiusMax:58_000,aspectMin:.34,aspectMax:2.15,salt:99121}):zeroOvalFeature();
        const micro=showMicro?scatteredOvalField(seed+991301,px,pz,{cellSize:8_200,chance:.135,radiusMin:4,radiusMax:2_400,aspectMin:.38,aspectMax:1.95,salt:99131}):zeroOvalFeature();
        const basinMacroStrength=macro.strength*landMask*clamp(1-ridge*.54,0,1),basinRegionalStrength=regional.strength*landMask*clamp(1-ridge*.42,0,1),localHollowStrength=local.strength*landMask,microHollowStrength=micro.strength*landMask;
        // Çizgisel yapılar: sırt / yar / teras. Bunlar kıta topolojisini değiştirmez,
        // fakat zoom-in sırasında araziye yön ve jeolojik hafıza verir.
        const ridgeLine=showMacro?ridged(seed+992001,(px+170_000)/620_000,(pz-130_000)/620_000,5):0,ridgeSpineStrength=showMacro?landMask*Math.pow(clamp((ridgeLine-.60)/.40,0,1),1.55)*clamp(.38+ridge*.84,0,1):0;
        const ravineLine=showLocal?Math.abs(signed(seed+992101,(px-31_000)/74_000,(pz+47_000)/74_000,4)):1,ravineStrength=showLocal?landMask*clamp((.060-ravineLine)/.060,0,1)*clamp(.32+ridge*.68+river*.28,0,1):0;
        const shelfLine=(tier<0||tier<=1)?ridged(seed+992201,(px+12_000)/31_000,(pz-9_000)/31_000,4):0,rockShelfStrength=(tier<0||tier<=1)?landMask*Math.pow(clamp((shelfLine-.82)/.18,0,1),1.75)*clamp(.22+ridge*.82,0,1):0;
        const terraceWave=showLocal?Math.abs(signed(seed+992301,(px-8_500)/18_000,(pz+12_500)/18_000,3)):1,terraceStrength=showLocal?landMask*clamp((.11-terraceWave)/.11,0,1)*clamp((moisture-.34)*1.65,0,1)*clamp((10.5-height)/10.5,0,1):0;
        // Lore-affinity coğrafyası. Halkları haritaya rastgele damgalamak yerine,
        // onların kanonik habitatlarının zaten uygun olduğu fiziksel bölgelerde
        // coğrafi varyasyonlar güçlenir.
        const iceCore=clamp((.14-warmth)*4.8,0,1)*clamp((height-4.2)/8.8,0,1),iceAffinity=(macroBiome==="ice"?1:.14)*iceCore,forestAffinity=clamp((moisture-.55)*2.35,0,1)*clamp((12-height)/12,0,1),volcanicAffinity=clamp(((Number(context.volcanicField)||0)-.68)*3.0,0,1);
        const volcanicLore=/dragon-volcanic|forge/.test(macroBiome)?1:volcanicAffinity,highlandAffinity=clamp((height-5.5)/11,0,1)*clamp(.42+ridge*.72,0,1),tropicalAffinity=clamp((warmth-.58)*2.5,0,1)*clamp((moisture-.45)*2.0,0,1),rootAffinity=forestAffinity*clamp(.52+arcana*.58,0,1);
        const glacialBasinStrength=Math.max(basinRegionalStrength*.74,localHollowStrength*.42)*iceAffinity,calderaStrength=regional.strength*landMask*volcanicLore*clamp(.44+regional.rim*.72,0,1),rootHollowStrength=localHollowStrength*rootAffinity;
        const karstNoise=showLocal?fbm(seed+993001,(px+44_000)/155_000,(pz-67_000)/155_000,4):0,karstAffinity=showLocal?clamp((karstNoise-.58)*2.6,0,1)*clamp((moisture-.42)*1.8,0,1)*clamp(.78-ridge*.35,0,1):0;
        const pitStrength=Math.max(localHollowStrength*.86,microHollowStrength*1.08,basinRegionalStrength*.42*clamp(.40+karstAffinity*1.2,0,1)),pitSource=microHollowStrength>=localHollowStrength*.80?micro:local;
        const pitRadiusM=Math.max(0,pitSource.radius),pitDepthM=pitStrength>0?clamp(pitRadiusM*mix(.08,.62,pitSource.depthScale),1.2,18_000):0;
        const caveRoll=hash(seed+993101,Math.floor(px/6200),Math.floor(pz/6200)),gorumTraceStrength=localHollowStrength*karstAffinity*(caveRoll<.11?1:0),caveEntranceStrength=Math.max(gorumTraceStrength,karstAffinity*microHollowStrength*(caveRoll<.22?1:0))*clamp((pitStrength-.48)/.52,0,1);
        // Kıyı aileleri: soğuk/yüksek bölgede fiyort; ana nehir ağzında delta;
        // sıcak kıyıda kaynak/teras. Tüm sular Gezegen kanonuna uygun tatlı sudur.
        const fjordThread=showRegional?Math.abs(signed(seed+993201,(px+15_000)/92_000,(pz-21_000)/92_000,4)):1,fjordStrength=showRegional?coast*highlandAffinity*clamp(.24+iceAffinity*.62,0,1)*clamp((.044-fjordThread)/.044,0,1):0;
        const deltaBranch=showLocal?ridged(seed+993301,(px-5_700)/24_000,(pz+8_600)/24_000,4):0,deltaStrength=showLocal?coast*Math.pow(river,1.45)*clamp((deltaBranch-.64)/.36,0,1)*clamp(.38+moisture*.52,0,1):0;
        const coastalWaterStrength=fjordStrength*clamp((.060-landSignal)/.060,0,1)*.55;
        const springNoise=(tier<0||tier<=1)?fbm(seed+993401,(px+1700)/9_000,(pz-3300)/9_000,3):0,hotSpringStrength=(tier<0||tier<=1)?Math.max(localHollowStrength*.26,microHollowStrength*.62)*clamp((springNoise-.76)*4.2,0,1)*clamp(tropicalAffinity*.52+volcanicLore*.42,0,1):0;
        const waterPotential=clamp((moisture-.58)*1.55+river*.34+coast*.08,0,1),formationLakeStrength=Math.max(glacialBasinStrength*.58,calderaStrength*.34*waterPotential,basinRegionalStrength*.26*waterPotential,localHollowStrength*.34*waterPotential,hotSpringStrength*.62);
        let formationWaterType="";if(formationLakeStrength>.60){if(glacialBasinStrength>=Math.max(calderaStrength,hotSpringStrength))formationWaterType="glacial-lake";else if(calderaStrength>=Math.max(glacialBasinStrength,hotSpringStrength))formationWaterType="caldera-lake";else if(hotSpringStrength>.68)formationWaterType="spring-pool";else formationWaterType=pitRadiusM<2200?"hollow-pool":"basin-lake";}
        const basinDepth=(basinMacroStrength*mix(1.2,5.4,macro.depthScale)+basinRegionalStrength*mix(.8,4.6,regional.depthScale)+localHollowStrength*mix(.35,2.8,local.depthScale)+microHollowStrength*mix(.10,1.2,micro.depthScale));
        const rimLift=(macro.rim*basinMacroStrength*.95+regional.rim*basinRegionalStrength*1.2+local.rim*localHollowStrength*.82+micro.rim*microHollowStrength*.42);
        const formationHeightDelta=-basinDepth-ravineStrength*1.55-glacialBasinStrength*.85-calderaStrength*1.45+rimLift+ridgeSpineStrength*1.65+rockShelfStrength*.72+terraceStrength*.22;
        const candidates=[
            [calderaStrength,"volcanic-caldera"],[glacialBasinStrength,"glacial-basin"],[fjordStrength,"fjord-coast"],[deltaStrength,"river-delta"],[gorumTraceStrength,"gorum-karst-trace"],[rootHollowStrength,"living-root-hollow"],[hotSpringStrength,"warm-spring-terrace"],[basinMacroStrength,"mega-basin"],[basinRegionalStrength,"regional-basin"],[ravineStrength,"ravine"],[ridgeSpineStrength,"ridge-spine"],[localHollowStrength,"local-hollow"],[microHollowStrength,"micro-hollow"]
        ];
        let formationClass="plain",formationScore=.16;for(const [score,name] of candidates)if(score>formationScore){formationScore=score;formationClass=name;}
        const loreBits=[];if(iceAffinity>.52)loreBits.push("iskael");if(volcanicLore>.52)loreBits.push("dray-zhar");if(rootAffinity>.55)loreBits.push("aeth-syl");if(coast>.58&&river>.45)loreBits.push("rhyirun-water");if(tropicalAffinity>.58&&coast>.40)loreBits.push("maerethi-coast");if(gorumTraceStrength>.30)loreBits.push("gorum-deep-trace");if(highlandAffinity>.58)loreBits.push("muo-highland");
        return{basinMacroStrength,basinRegionalStrength,localHollowStrength,microHollowStrength,pitStrength,pitRadiusM,pitDepthM,caveEntranceStrength,ridgeSpineStrength,ravineStrength,terraceStrength,rockShelfStrength,fjordStrength,deltaStrength,glacialBasinStrength,calderaStrength,rootHollowStrength,hotSpringStrength,gorumTraceStrength,formationLakeStrength,coastalWaterStrength,formationWaterType,formationClass,formationHeightDelta,loreGeoSignature:loreBits.join("+")};
    };
    const CONTINENT_MAX_DIAMETER_M=240_000_000;
    const CONTINENT_CONTAINMENT_RADIUS_M=CONTINENT_MAX_DIAMETER_M/2;
    const CONTINENT_GUARD_RADIUS_M=119_200_000;
    // R111 · DÜZENSİZ KITA / SÜPERKITA MOTORU
    // R110'un şaşırtmalı satır kafesi deterministikti fakat atlas ölçeğinde yan yana
    // dizilmiş benzer adalar gibi okunuyordu. Yeni motor 520.000 km'lik yalnızca
    // adresleme amaçlı sektörlerde, birbirinden bağımsız ve gevşek mavi-gürültü
    // yerleşimli kıta aileleri üretir. Sektör sınırı hiçbir geometri sınırı değildir.
    const R111_CONTINENT_SECTOR_M=520_000_000;
    const R111_CONTINENT_FORMS=Object.freeze(["minor","shield","ribbon","crescent","fused","supercontinent"]);
    const R111_SECTOR_CACHE=new Map();
    const r111FormFor=(seed,sx,sz,index,forced="")=>{
        if(forced)return forced;
        const roll=hash(seed+981001,sx*97+index*31,sz*89-index*37);
        if(roll<.07)return"minor";
        if(roll<.27)return"shield";
        if(roll<.35)return"ribbon";
        if(roll<.43)return"crescent";
        if(roll<.70)return"fused";
        return"supercontinent";
    };
    const r111RadiusFor=(seed,sx,sz,index,form,forced=0)=>{
        if(forced)return Math.min(CONTINENT_GUARD_RADIUS_M,Math.max(24_000_000,Number(forced)||0));
        const roll=Math.pow(hash(seed+981011,sx*101+index*43,sz*103-index*47),.64),ranges={
            minor:[64_000_000,91_000_000],shield:[99_000_000,117_600_000],ribbon:[97_000_000,116_800_000],
            crescent:[101_000_000,117_900_000],fused:[106_000_000,118_700_000],supercontinent:[113_000_000,119_100_000]
        },range=ranges[form]||ranges.shield;
        return mix(range[0],range[1],roll);
    };
    const r111BuildDescriptor=(seed,sx,sz,index,centerX,centerZ,form,familyRadius)=>{
        const angle=(hash(seed+981021,sx*107+index*53,sz*109-index*59)-.5)*Math.PI*2,ca=Math.cos(angle),sa=Math.sin(angle);
        const theme=Math.floor(hash(seed+981031,sx*113+index*61,sz*127-index*67)*12),shapes=[],segments=[],bays=[],islets=[];
        const localPoint=(along,cross)=>({x:centerX+ca*along-sa*cross,z:centerZ+sa*along+ca*cross});
        const fit=(point,extent,margin=500_000)=>{const dx=point.x-centerX,dz=point.z-centerZ,distance=Math.hypot(dx,dz),limit=Math.max(1,familyRadius-Math.max(1,extent)-margin);return distance>limit?{x:centerX+dx/distance*limit,z:centerZ+dz/distance*limit}:point;};
        const addShape=(along,cross,rx,rz,a=angle,kind="plate")=>{const extent=Math.max(rx,rz),point=fit(localPoint(along,cross),extent);shapes.push({x:point.x,z:point.z,rx,rz,a,kind});return point;};
        const addSegment=(a,b,r1,r2,kind="bridge")=>segments.push({x1:a.x,z1:a.z,x2:b.x,z2:b.z,r1,r2,kind});
        const unit=(salt)=>hash(seed+salt,sx*131+index*71,sz*137-index*73),signedUnit=salt=>unit(salt)*2-1,R=familyRadius;
        let radialBase=0,radialAmp=[0,0,0],radialPhase=[unit(981041)*Math.PI*2,unit(981043)*Math.PI*2,unit(981047)*Math.PI*2];
        if(form==="minor"){
            radialBase=.72;radialAmp=[.105,.065,.030];
            for(let i=0;i<3;i++){const a=angle+i*Math.PI*2/3+signedUnit(981101+i*17)*.38,r=R*mix(.10,.28,unit(981103+i*19)),p=localPoint(Math.cos(a-angle)*r,Math.sin(a-angle)*r);addShape((p.x-centerX)*ca+(p.z-centerZ)*sa,-(p.x-centerX)*sa+(p.z-centerZ)*ca,R*mix(.31,.44,unit(981107+i*23)),R*mix(.27,.39,unit(981109+i*29)),a,`minor-lobe-${i}`);}
        }else if(form==="shield"){
            radialBase=.79;radialAmp=[.105,.060,.028];
            for(let i=0;i<6;i++){const a=angle+i*Math.PI/3+signedUnit(981201+i*31)*.30,r=R*mix(.22,.45,unit(981203+i*37));addShape(Math.cos(a-angle)*r,Math.sin(a-angle)*r,R*mix(.34,.49,unit(981207+i*41)),R*mix(.27,.43,unit(981209+i*43)),a+signedUnit(981211+i*47)*.48,`shield-lobe-${i}`);}
        }else if(form==="fused"||form==="supercontinent"){
            const superForm=form==="supercontinent";radialBase=superForm ? .855 : .65;radialAmp=superForm?[.075,.048,.025]:[.095,.058,.028];
            const count=superForm?7:5;let previous={x:centerX,z:centerZ};
            for(let i=0;i<count;i++){const a=angle+i*Math.PI*2/count+signedUnit(981301+i*47)*.36,r=R*mix(superForm ? .20 : .17,superForm ? .49 : .43,unit(981303+i*53)),rx=R*mix(superForm ? .36 : .39,superForm ? .55 : .58,unit(981307+i*59)),rz=R*mix(superForm ? .29 : .31,superForm ? .48 : .50,unit(981309+i*61)),point=addShape(Math.cos(a-angle)*r,Math.sin(a-angle)*r,rx,rz,a+signedUnit(981311+i*67)*.62,`${form}-plate-${i}`);if(i&&i%2===1)addSegment(previous,point,R*.24,R*.29,`${form}-isthmus`);previous=point;}
            addShape(0,0,R*(superForm ? .58 : .51),R*(superForm ? .51 : .46),angle+signedUnit(981397)*.22,`${form}-heart`);
        }else if(form==="ribbon"){
            const nodes=[];for(let i=0;i<8;i++){const t=i/7*2-1,along=t*R*.68,cross=Math.sin(t*Math.PI*1.18+radialPhase[0])*R*.19+Math.sin(t*Math.PI*2.4+radialPhase[1])*R*.055,point=fit(localPoint(along,cross),R*.24);nodes.push(point);const width=R*mix(.22,.31,unit(981401+i*71))*(.78+.22*(1-Math.abs(t)));addShape(along,cross,width*1.22,width,angle+signedUnit(981403+i*73)*.52,`ribbon-lobe-${i}`);if(i)addSegment(nodes[i-1],point,R*.245,R*.245,"ribbon-spine");}
        }else{
            const nodes=[],arcSide=unit(981501)<.5?-1:1;for(let i=0;i<9;i++){const t=i/8*2-1,a=t*1.34,along=Math.cos(a)*R*.46-R*.17,cross=arcSide*Math.sin(a)*R*.60,point=fit(localPoint(along,cross),R*.25);nodes.push(point);const width=R*mix(.235,.315,unit(981503+i*79));addShape(along,cross,width*1.18,width,angle+a*.42+signedUnit(981507+i*83)*.28,`crescent-lobe-${i}`);if(i)addSegment(nodes[i-1],point,R*.235,R*.235,"crescent-arc");}
            const bite=localPoint(R*.10,-arcSide*R*.10);bays.push({x:bite.x,z:bite.z,rx:R*.58,rz:R*.43,a:angle,strength:1.08,kind:"crescent-basin"});
        }
        const ordinaryBays=form==="supercontinent"?4:form==="fused"||form==="shield"?5:form==="minor"?2:3;
        for(let i=0;i<ordinaryBays;i++){const a=angle+unit(981601+i*89)*Math.PI*2,deep=(form==="supercontinent"&&i<2)||(form==="fused"&&i===0),radial=R*mix(.69,.87,unit(981603+i*97)),p=localPoint(Math.cos(a-angle)*radial,Math.sin(a-angle)*radial);bays.push({x:p.x,z:p.z,rx:R*mix(deep ? .25 : .12,deep ? .39 : .24,unit(981607+i*101)),rz:R*mix(deep ? .10 : .07,deep ? .20 : .15,unit(981609+i*103)),a,strength:mix(.78,1.08,unit(981611+i*107)),kind:deep?"deep-gulf":"bay"});}
        const isletCount=form==="minor"?5:7+Math.floor(unit(981701)*8);
        for(let i=0;i<isletCount;i++){const a=angle+unit(981703+i*109)*Math.PI*2,radial=R*mix(.78,.965,unit(981707+i*113)),size=R*mix(.008,.035,Math.pow(unit(981709+i*127),1.55)),aspect=mix(.48,2.05,unit(981711+i*131)),rx=size*(aspect>=1?aspect:1),rz=size*(aspect>=1?1:1/Math.max(.36,aspect)),extent=Math.max(rx,rz),safeRadial=Math.min(radial,R-extent-240_000),p=localPoint(Math.cos(a-angle)*safeRadial,Math.sin(a-angle)*safeRadial);islets.push({x:p.x,z:p.z,rx,rz,a:a+signedUnit(981713+i*137)*.7,index:i});}
        return{active:true,sx,sz,index,key:`continent:${sx}:${sz}:${index}`,centerX,centerZ,angle,theme,form,familyRadius,radialBase,radialAmp,radialPhase,shapes,segments,bays,islets};
    };
    const r111Sector=(seed,sx,sz)=>{
        const cacheKey=`${Number(seed)||1}:${sx}:${sz}`;if(R111_SECTOR_CACHE.has(cacheKey))return R111_SECTOR_CACHE.get(cacheKey);
        const originSector=sx===0&&sz===0,density=fbm(seed+982001,(sx+17)/2.65,(sz-23)/2.65,3),jitter=hash(seed+982003,sx-29,sz+31);
        let count=(density<.16?2+Math.floor(jitter*2):density<.37?4+Math.floor(jitter*2):density<.72?6+Math.floor(jitter*3):10+Math.floor(jitter*3))+(hash(seed+982007,sx+41,sz-43)<.38?1:0);
        if(originSector)count=1;
        const descriptors=[],start=originSector?1:0;
        if(originSector)descriptors.push(r111BuildDescriptor(seed,0,0,0,0,0,"supercontinent",116_927_000));
        for(let index=start;index<count;index++){
            const form=r111FormFor(seed,sx,sz,index),familyRadius=r111RadiusFor(seed,sx,sz,index,form);let best=null;
            for(let attempt=0;attempt<18;attempt++){
                const x=sx*R111_CONTINENT_SECTOR_M+(hash(seed+982101+index*211+attempt*17,sx*149+attempt*13,sz*151-index*17)-.5)*R111_CONTINENT_SECTOR_M*.90;
                const z=sz*R111_CONTINENT_SECTOR_M+(hash(seed+982103+index*223+attempt*19,sx*157-index*23,sz*163+attempt*29)-.5)*R111_CONTINENT_SECTOR_M*.90;
                let clearance=Infinity;for(const item of descriptors)clearance=Math.min(clearance,Math.hypot(x-item.centerX,z-item.centerZ)-(familyRadius+item.familyRadius)*.82);
                const boundaryClearance=R111_CONTINENT_SECTOR_M*.48-Math.max(Math.abs(x-sx*R111_CONTINENT_SECTOR_M),Math.abs(z-sz*R111_CONTINENT_SECTOR_M));
                const score=Math.min(clearance,boundaryClearance+42_000_000);if(!best||score>best.score)best={x,z,score};
            }
            descriptors.push(r111BuildDescriptor(seed,sx,sz,index,best.x,best.z,form,familyRadius));
        }
        return cachePut(R111_SECTOR_CACHE,cacheKey,{sx,sz,density,descriptors},4096);
    };
    const r111FieldFor=(seed,px,pz,d)=>{
        const dx=px-d.centerX,dz=pz-d.centerZ,distance=Math.hypot(dx,dz);if(distance>d.familyRadius+1_000_000)return null;
        let main=-2.5;
        if(d.radialBase>0){const theta=Math.atan2(dz,dx)-d.angle,boundary=d.familyRadius*clamp(d.radialBase+Math.sin(theta*3+d.radialPhase[0])*d.radialAmp[0]+Math.sin(theta*5+d.radialPhase[1])*d.radialAmp[1]+Math.sin(theta*9+d.radialPhase[2])*d.radialAmp[2],.48,.972);main=Math.max(main,(boundary-distance)/Math.max(1,d.familyRadius*.22));}
        for(const segment of d.segments)main=Math.max(main,taperedCapsuleField(px,pz,segment));
        for(const shape of d.shapes)main=Math.max(main,1-ellipseDistance(px,pz,shape.x,shape.z,shape.rx,shape.rz,shape.a));
        for(let bayIndex=0;bayIndex<d.bays.length;bayIndex++){
            const bay=d.bays[bayIndex],distanceToBay=ellipseDistance(px,pz,bay.x,bay.z,bay.rx,bay.rz,bay.a),bayEdge=clamp(1-Math.abs(distanceToBay-1)/.42,0,1);
            const bayNoise=signed(seed+982401+d.theme*97+bayIndex*43,(px-bay.x)/Math.max(420_000,bay.rx*.48),(pz-bay.z)/Math.max(420_000,bay.rz*.48),3)*.14+signed(seed+982411+d.theme*101+bayIndex*47,(px-bay.x)/Math.max(180_000,bay.rx*.17),(pz-bay.z)/Math.max(180_000,bay.rz*.17),2)*.045;
            const waterField=(distanceToBay-1+bayEdge*bayNoise)*bay.strength;main=Math.min(main,waterField);
        }
        const edge=clamp(1-Math.abs(main)/.30,0,1),scale=Math.max(480_000,d.familyRadius*.105);
        main+=edge*(signed(seed+982501+d.theme*139,(dx+11_000_000)/scale,(dz-7_000_000)/scale,4)*.135+signed(seed+982511+d.theme*149,(dx-1_900_000)/(scale*.28),(dz+2_300_000)/(scale*.28),3)*.055);
        let isletField=-2.5;
        for(const item of d.islets){let value=1-ellipseDistance(px,pz,item.x,item.z,item.rx,item.rz,item.a),rim=clamp(1-Math.abs(value)/.28,0,1);value+=rim*signed(seed+982601+item.index*17,(px-item.x)/Math.max(150_000,item.rx*.64),(pz-item.z)/Math.max(150_000,item.rz*.64),3)*.11;isletField=Math.max(isletField,value);}
        const containmentSignal=(d.familyRadius-distance)/Math.max(500_000,d.familyRadius*.022),associatedIslet=isletField>main,field=Math.min(Math.max(main,isletField),containmentSignal);
        return{field,envelope:field,isletField,associatedIslet,containmentSignal,descriptor:d};
    };
    const r111PlanetaryContinentalField=(seed,x,z)=>{
        const px=Number(x)||0,pz=Number(z)||0,baseX=Math.round(px/R111_CONTINENT_SECTOR_M),baseZ=Math.round(pz/R111_CONTINENT_SECTOR_M),insideOriginReserve=Math.hypot(px,pz)<CONTINENT_CONTAINMENT_RADIUS_M;let best=null,second=null;
        for(let oz=-1;oz<=1;oz++)for(let ox=-1;ox<=1;ox++)for(const descriptor of r111Sector(seed,baseX+ox,baseZ+oz).descriptors){
            if(insideOriginReserve&&descriptor.key!=="continent:0:0:0")continue;
            const field=r111FieldFor(seed,px,pz,descriptor);if(!field)continue;
            if(!best||field.field>best.field){second=best;best=field;}else if(!second||field.field>second.field)second=field;
        }
        if(!best)return{score:-2.5,envelopeScore:-2.5,mainScore:-2.5,coastalIslandScore:-2.5,sectorX:baseX,sectorZ:baseZ,continentKey:`ocean:${baseX}:${baseZ}`,continentForm:"ocean",continentTheme:0,continentAngle:0,continentCenterX:0,continentCenterZ:0,continentFamilyRadiusM:0,continentContainmentRadiusM:CONTINENT_CONTAINMENT_RADIUS_M,containmentSignal:-2.5,associatedIslet:false,rift:0,inlandSea:0};
        const d=best.descriptor,separationSignal=second?(Math.abs(best.field-second.field)-.052)*2.0:2.5,envelopeScore=Math.min(best.envelope,separationSignal),basinA=fbm(seed+982701,(px-d.centerX+17_000_000)/52_000_000,(pz-d.centerZ-13_000_000)/52_000_000,3),basinB=fbm(seed+982711,(px-d.centerX-11_000_000)/31_000_000,(pz-d.centerZ+19_000_000)/31_000_000,3),inlandSea=Math.pow(clamp((basinA-.92)/.08,0,1),2.2)*Math.pow(clamp((basinB-.85)/.15,0,1),1.7),score=Math.min(envelopeScore-inlandSea*.10*clamp((envelopeScore+.14)/.52,0,1),best.containmentSignal);
        return{score,envelopeScore,mainScore:score,coastalIslandScore:best.isletField,sectorX:d.sx,sectorZ:d.sz,continentKey:d.key,continentForm:d.form,continentTheme:d.theme,continentAngle:d.angle,continentCenterX:d.centerX,continentCenterZ:d.centerZ,continentFamilyRadiusM:d.familyRadius,continentContainmentRadiusM:CONTINENT_CONTAINMENT_RADIUS_M,containmentSignal:best.containmentSignal,associatedIslet:best.associatedIslet,rift:0,inlandSea};
    };
    const continentMassField=(seed,x,z)=>r111PlanetaryContinentalField(seed,x,z);

    // Adalar ve uçan/kozmik takımadalar için ortak, hücre sınırı görünmeyen küme
    // üreticisi. Hücre yalnız cluster merkezini deterministik seçer; gerçek ada
    // geometrisi cluster merkezinin çevresindeki bağımsız elips/warp parçalarıdır.
    const archipelagoCell=(seed,cx,cz,config)=>{
        const salt=Number(config.salt)||1,key=`${salt}:${Number(seed)||1}:${cx}:${cz}`;if(ARCHIPELAGO_CACHE.has(key))return ARCHIPELAGO_CACHE.get(key);
        const cellSize=config.cellSize,enabled=hash(seed+salt,cx,cz)<config.chance;
        if(!enabled)return cachePut(ARCHIPELAGO_CACHE,key,{enabled:false,cx,cz,items:[],theme:0,centerX:0,centerZ:0,spread:1},8192);
        const jitter=cellSize*.34,centerX=(cx+.5)*cellSize+(hash(seed+salt+11,cx+13,cz-7)-.5)*jitter*2,centerZ=(cz+.5)*cellSize+(hash(seed+salt+17,cx-5,cz+19)-.5)*jitter*2;
        const spread=mix(config.spreadMin,config.spreadMax,hash(seed+salt+23,cx+29,cz-31));
        const count=Math.max(1,Math.floor(mix(config.itemMin,config.itemMax+1,hash(seed+salt+29,cx-37,cz+41))));
        const theme=Math.floor(hash(seed+salt+31,cx+43,cz-47)*(config.themeCount||6));
        const items=[];
        for(let i=0;i<count;i++){
            const a=hash(seed+salt+101+i*71,cx+i*11,cz-i*13)*Math.PI*2;
            const radial=i===0?hash(seed+salt+103,cx,cz)*.12:(.18+Math.pow(hash(seed+salt+107+i*67,cx-i*17,cz+i*23),.72)*.82);
            const px=centerX+Math.cos(a)*spread*radial,pz=centerZ+Math.sin(a)*spread*radial;
            const base=mix(config.radiusMin,config.radiusMax,Math.pow(hash(seed+salt+109+i*59,cx+i*29,cz-i*31),1.25))*(i===0?1.35:1);
            const aspect=mix(config.aspectMin||.48,config.aspectMax||1.45,hash(seed+salt+113+i*53,cx-i*37,cz+i*41));
            const rx=base*(aspect>=1?aspect:1),rz=base*(aspect>=1?1:1/Math.max(.32,aspect));
            items.push({x:px,z:pz,rx,rz,angle:(hash(seed+salt+127+i*47,cx+i*43,cz-i*47)-.5)*Math.PI,phase:hash(seed+salt+131+i*43,cx-i*53,cz+i*59)*Math.PI*2});
        }
        return cachePut(ARCHIPELAGO_CACHE,key,{enabled:true,cx,cz,centerX,centerZ,spread,items,theme},8192);
    };
    const archipelagoField=(seed,x,z,config)=>{
        const px=Number(x)||0,pz=Number(z)||0,baseX=Math.floor(px/config.cellSize),baseZ=Math.floor(pz/config.cellSize);let best=-2.5,bestCluster=0,bestTheme=0,bestKey="";
        for(let oz=-1;oz<=1;oz++)for(let ox=-1;ox<=1;ox++){
            const cell=archipelagoCell(seed,baseX+ox,baseZ+oz,config);if(!cell.enabled)continue;
            const clusterDistance=Math.hypot(px-cell.centerX,pz-cell.centerZ),clusterEnvelope=smooth(clamp(1-clusterDistance/Math.max(1,cell.spread*1.38),0,1));if(clusterEnvelope<=0)continue;
            for(let i=0;i<cell.items.length;i++){
                const item=cell.items[i],d=ellipseDistance(px,pz,item.x,item.z,item.rx,item.rz,item.angle);if(d>1.42)continue;
                let field=1-d;
                const edge=clamp(1-Math.abs(field)/.33,0,1),noise=signed(seed+(config.salt||1)+7001+i*97,(px/item.rx)*1.7,(pz/item.rz)*1.7,3);
                field+=edge*noise*.18;
                field*=.72+.28*clusterEnvelope;
                if(field>best){best=field;bestCluster=clusterEnvelope;bestTheme=cell.theme;bestKey=`${cell.cx}:${cell.cz}`;}
            }
        }
        return{field:best,cluster:bestCluster,theme:bestTheme,key:bestKey};
    };
    const surfaceRawFields=(seed,x,z)=>{
        const px=Number(x)||0,pz=Number(z)||0,metricX=px/SURFACE_GEOGRAPHY_SCALE_M,metricZ=pz/SURFACE_GEOGRAPHY_SCALE_M;
        const archetype=archetypeIndex(seed),w=warpCoordinates(seed,metricX,metricZ,.00018,2600),wx=w.x,wz=w.z;
        const mass=continentMassField(seed,px,pz),macroLandBias=mass.score,macroEnvelopeBias=Number.isFinite(Number(mass.envelopeScore))?Number(mass.envelopeScore):mass.score;
        const continent=signed(seed+101,wx*.00017,wz*.00017,6);
        const regional=signed(seed+1201,wx*.00044,wz*.00044,5),shelf=signed(seed+2201,wx*.00088,wz*.00088,5),detail=signed(seed+3201,wx*.00165,wz*.00165,4);
        const ridge=ridged(seed+4201,wx*.00062,wz*.00062,5);
        // Büyük nehir havzaları + eski R5 yerel akarsuları. Makro damar orta/uzak
        // ölçekte okunur, mikro damar yakınlaşınca ayrıntıyı geri getirir.
        const basinRiver=Math.abs(signed(seed+5181,(wx+150000)*.000014,(wz-90000)*.000014,5));
        const majorRiver=Math.abs(signed(seed+5201,wx*.0062,wz*.0062,5)),minorStream=Math.abs(signed(seed+5251,(wx+4100)*.017,(wz-2600)*.017,4));
        const basinStrength=clamp((.014-basinRiver)/.014,0,1)*.26,majorStrength=clamp((.082-majorRiver)/.082,0,1)*.56,streamStrength=clamp((.034-minorStream)/.034,0,1)*.18;
        const riverStrength=Math.max(basinStrength,majorStrength,streamStrength);
        const lagoon=ridged(seed+6201,wx*.00082,wz*.00082,4);
        const lakeNoise=fbm(seed+7201,(wx-8300)*.0042,(wz+6200)*.0042,5),lakeShape=ridged(seed+7251,(wx+2400)*.0027,(wz-4400)*.0027,4);
        const macroLakeNoise=fbm(seed+7261,(px-2_100_000)*.0000018,(pz+1_700_000)*.0000018,4),macroLakeShape=ridged(seed+7271,(px+900_000)*.0000028,(pz-1_400_000)*.0000028,4);
        let localLandSignal=continent*.70+regional*.20+shelf*.075+detail*.025;
        if(archetype===0)localLandSignal=continent*.57+regional*.25+shelf*.14+detail*.04-.025;
        else if(archetype===1)localLandSignal=continent*.70+regional*.18-(lagoon-.5)*.15+shelf*.05+.015;
        else if(archetype===2)localLandSignal=continent*.64+regional*.18+(ridge-.5)*.15-shelf*.06;
        else if(archetype===3)localLandSignal=continent*.70+regional*.17-(lagoon-.5)*.11+shelf*.05+.015;
        else if(archetype===4)localLandSignal=continent*.58+regional*.18+(ridge-.5)*.21+shelf*.04-.01;
        else if(archetype===5)localLandSignal=continent*.69+regional*.21+shelf*.07+detail*.03+.01;
        else if(archetype===6)localLandSignal=continent*.73+regional*.16+(ridge-.5)*.11+shelf*.03+.018;
        else if(archetype===7)localLandSignal=continent*.71+regional*.20+shelf*.065+detail*.025+.012;
        else if(archetype===8)localLandSignal=continent*.67+regional*.21-shelf*.035+(ridge-.5)*.065;
        else if(archetype===9)localLandSignal=continent*.63+regional*.17-(.5-majorRiver)*.12+(lagoon-.5)*.07+.006;
        else if(archetype===10)localLandSignal=continent*.72+regional*.16+(ridge-.5)*.14+shelf*.025+.015;
        else if(archetype===11)localLandSignal=continent*.66+regional*.18+(lagoon-.5)*.10-majorRiver*.018+.008;
        // PATCH97: kıtayı tek başına gezegen ölçekli levha alanı belirler. Eski R5
        // yerel alanı yalnız kıyı yakınında çok zayıf rötuş verir; iç bölgeleri adacıklara
        // bölemez ve okyanusta yeni kıta doğuramaz.
        const localCoastInfluence=clamp(1-Math.abs(macroLandBias-.08)/.46,0,1);
        let mainlandSignal=macroLandBias+localLandSignal*(.010+.036*localCoastInfluence);
        // PATCH98 · Zoom-in sırasında harita daha çok doğal detay açsın diye kıta
        // omurgasını bozmadan, yalnız kıyı kuşağına ve iç arazilere çok kademeli
        // şekil heykeltıraşı eklenir. Bu katmanlar uzaktan yalnız siluet nüansı verir,
        // yakında ise koy, burun, yarımada, vadi ve mikro kırıkları belirginleştirir.
        const nearMacroCoast=clamp(1-Math.abs(mainlandSignal-.055)/.26,0,1);
        const closeLandMask=smooth(clamp((mainlandSignal-.010)/.25,0,1));
        const microWarp=warpCoordinates(seed+90001,metricX,metricZ,.0017,9800),mwx=microWarp.x,mwz=microWarp.z;
        const coveField=ridged(seed+90011,mwx*.0028,mwz*.0028,4);
        const fjordField=Math.abs(signed(seed+90021,(mwx+8400)*.0048,(mwz-6200)*.0048,4));
        const peninsulaField=signed(seed+90031,(mwx-5100)*.0032,(mwz+3900)*.0032,4);
        const shoreRipple=signed(seed+90041,(mwx+1700)*.0085,(mwz-1300)*.0085,3);
        const inlandBasin=signed(seed+90051,(px+17000)/210_000,(pz-14000)/210_000,4);
        const inlandSpine=ridged(seed+90061,(px-24000)/130_000,(pz+11000)/130_000,4)-.5;
        const shoreCarve=nearMacroCoast*(Math.pow(clamp((coveField-.57)/.43,0,1),1.45)*.052+Math.pow(clamp((.09-fjordField)/.09,0,1),1.7)*.036);
        const shoreLift=nearMacroCoast*(peninsulaField*.034+shoreRipple*.012);
        const inlandLift=closeLandMask*(inlandBasin*.014+inlandSpine*.010);
        mainlandSignal+=shoreLift-shoreCarve+inlandLift;
        // Hiçbir kıyı rötuşu kesin kıta çemberinin dışında kara üretemez.
        const containmentSignal=Number.isFinite(Number(mass.containmentSignal))?Number(mass.containmentSignal):-2.5;
        mainlandSignal=Math.min(mainlandSignal,containmentSignal);
        const rawLandSignal=mainlandSignal,rawEnvelopeSignal=Math.min(macroEnvelopeBias,containmentSignal),islandBoost=Number(mass.coastalIslandScore)||-2.5;
        return{metricX,metricZ,wx,wz,archetype,continent,megaContinent:macroLandBias,superShelf:0,macroContinent:macroLandBias,macroShelf:0,continentalCore:Number(mass.mainScore)||macroLandBias,macroLandBias,macroEnvelopeBias,continentCellX:mass.sectorX,continentCellZ:mass.sectorZ,continentKey:mass.continentKey||"",continentForm:mass.continentForm||"",continentAngle:Number(mass.continentAngle)||0,continentCenterX:mass.continentCenterX,continentCenterZ:mass.continentCenterZ,continentFamilyRadiusM:Number(mass.continentFamilyRadiusM)||0,continentContainmentRadiusM:mass.continentContainmentRadiusM,containmentSignal,associatedIslet:!!mass.associatedIslet,coastalIslandScore:mass.coastalIslandScore,localLandSignal,islandBoost,regional,shelf,detail,ridge,basinRiver,majorRiver,minorStream,basinStrength,majorStrength,streamStrength,riverStrength,lagoon,lakeNoise,lakeShape,macroLakeNoise,macroLakeShape,rawLandSignal,rawEnvelopeSignal,rift:mass.rift||0,inlandSea:mass.inlandSea||0};
    };
    const surfaceFields=(seed,x,z,detailTier=null)=>{
        const r=surfaceRawFields(seed,x,z),seaCut=0,envelopeLandSignal=r.rawEnvelopeSignal,sculptedLandSignal=r.rawLandSignal;
        // PATCH102 · Kıyı heykeli yalnız dış-zarfın kenarında topolojiyi etkiler.
        // Kıtanın derin iç kısmı artık coast-noise yüzünden mavi kanallara parçalanamaz.
        const envelopeCoastBand=clamp(1-Math.abs(envelopeLandSignal)/.125,0,1);
        let landSignal=envelopeLandSignal+(sculptedLandSignal-envelopeLandSignal)*envelopeCoastBand;
        if(envelopeLandSignal>.13)landSignal=Math.max(landSignal,.045+Math.min(.16,(envelopeLandSignal-.13)*.55));
        const lowland=clamp(1-Math.abs(landSignal-.055)/.19,0,1);
        const localLake=clamp((r.lakeNoise-.50)/.36,0,1)*clamp((r.lakeShape-.10)/.70,0,1),macroLake=clamp((r.macroLakeNoise-.60)/.30,0,1)*clamp((r.macroLakeShape-.18)/.68,0,1);
        const lakeStrength=Math.max(localLake,macroLake*.82)*lowland;
        const landMask=smooth(clamp((landSignal+.018)/.105,0,1));
        const closeTerrainMask=landSignal>0?smooth(clamp((landSignal+.030)/.34,0,1)):0;
        const coastDetailMask=landSignal>0?clamp(1-Math.abs(landSignal-.050)/.16,0,1):0;
        const tributaryField=Math.abs(signed(seed+91401,(Number(x)+5200)/13_000,(Number(z)-4100)/13_000,3));
        let riverStrength=Math.max(r.riverStrength,clamp((.020-tributaryField)/.020,0,1)*.16*closeTerrainMask);
        const riverCut=landMask*Math.pow(riverStrength,1.24)*(1.0+r.lagoon*.28);
        const mountains=Math.pow(r.ridge,4.3)*landMask*(r.archetype===6||r.archetype===10?19.5:14.5);
        const rolling=(r.detail*.72+r.regional*.28)*landMask*2.4;
        const hillField=signed(seed+91211,(Number(x)+14_000)/78_000,(Number(z)-12_000)/78_000,4);
        const hillField2=signed(seed+91221,(Number(x)-23_000)/44_000,(Number(z)+18_000)/44_000,3);
        const escarpment=ridged(seed+91241,(Number(x)-31_000)/52_000,(Number(z)+27_000)/52_000,4)-.5;
        const valleyField=Math.abs(signed(seed+91231,(Number(x)+7_200)/31_000,(Number(z)-4_900)/31_000,4));
        const coveDetail=ridged(seed+91251,(Number(x)+4_700)/18_000,(Number(z)-7_700)/18_000,3)-.5;
        const inletThread=Math.abs(signed(seed+91261,(Number(x)-2700)/14_000,(Number(z)+3900)/14_000,3));
        const valleyCut=closeTerrainMask*clamp((.048-valleyField)/.048,0,1)*1.35;
        const coastRelief=coastDetailMask*(coveDetail*.70-clamp((.052-inletThread)/.052,0,1)*1.10);
        const inlandRelief=closeTerrainMask*(hillField*1.25+hillField2*.85+escarpment*.95);
        let height=landSignal*24+mountains+rolling-riverCut*3.2+inlandRelief+coastRelief-valleyCut;
        const lakeSupport=Math.max(r.macroLakeNoise*.62+r.macroLakeShape*.38,r.lakeNoise*.46+r.lakeShape*.54,r.basinStrength*.90+r.majorStrength*.20);
        const inlandSeaStrength=clamp(((Number(r.inlandSea)||0)-.82)/.18,0,1)*clamp((envelopeLandSignal-.045)/.22,0,1);
        let lakeCandidate=(landSignal>.018&&landSignal<.20&&lakeStrength>.64&&lakeSupport>.62&&r.ridge<.76)||inlandSeaStrength>.72;
        if(inlandSeaStrength>.72)lakeStrength=Math.max(lakeStrength,.74+inlandSeaStrength*.20);
        if(lakeCandidate)height=Math.min(height,.46-lakeStrength*1.34);
        // PATCH90 · 24 halkın habitatlarını taşıyabilecek kıtasal biyom eyaletleri.
        // Bunlar kıta geometrisini ASLA üretmez; kara/su maskesi bittikten sonra boyanır.
        // Dalga boyları milyonlarca metre olduğu için bir iklim kuşağı ekranda konfeti gibi dağılmaz.
        const macroMoisture=fbm(seed+41011,(r.wx+370000)/14_000_000,(r.wz-210000)/14_000_000,5),regionalMoisture=fbm(seed+41041,r.wx*.0000048,r.wz*.0000048,4);
        const localMoisture=fbm(seed+91311,(Number(x)+3400)/24_000,(Number(z)-2800)/24_000,3);
        const moisture=clamp(macroMoisture*.87+regionalMoisture*.045+r.lagoon*.025+r.lakeNoise*.018+riverStrength*.040+(localMoisture-.5)*.028*closeTerrainMask,0,1);
        const climateBand=.5+.5*Math.sin((r.wz+(Number(seed)||1)*31711)*.00000031),macroWarmth=fbm(seed+51011,(r.wx-910000)/16_000_000,(r.wz+440000)/16_000_000,5);
        const localWarmth=fbm(seed+91321,(Number(x)-5100)/33_000,(Number(z)+4400)/33_000,3);
        const warmth=clamp(macroWarmth*.72+climateBand*.24+fbm(seed+51041,(r.wx+31000)*.0000047,(r.wz-17000)*.0000047,3)*.04+(localWarmth-.5)*.020*closeTerrainMask,0,1);
        const macroArcana=ridged(seed+61011,r.wx/12_000_000,r.wz/12_000_000,5),localArcana=ridged(seed+91331,(Number(x)+7000)/29_000,(Number(z)-9100)/29_000,3),arcana=clamp(macroArcana*.88+fbm(seed+71041,r.wx*.0000052,r.wz*.0000052,3)*.12+(localArcana-.5)*.035*closeTerrainMask,0,1);
        // PATCH96 · Atlas görünümü için ayrı, gerçekten makro iklim alanları.
        // Bunlar yalnız 2 octave taşır; 200.000+ km ölçeğinde dama/baklava üretmez.
        const climateWarpX=signed(seed+71091,(Number(x)||0)/760_000_000,(Number(z)||0)/760_000_000,3)*118_000_000,climateWarpZ=signed(seed+71097,(Number(x)+97_000_000)/760_000_000,(Number(z)-61_000_000)/760_000_000,3)*118_000_000;
        const atlasMoisture=fbm(seed+71101,(Number(x)+climateWarpX+71_000_000)/520_000_000,(Number(z)+climateWarpZ-43_000_000)/520_000_000,3);
        const atlasWarmth=fbm(seed+71111,(Number(x)+climateWarpX-51_000_000)/610_000_000,(Number(z)+climateWarpZ+67_000_000)/610_000_000,3);
        const atlasArcana=ridged(seed+71121,(Number(x)+climateWarpX+23_000_000)/580_000_000,(Number(z)+climateWarpZ-89_000_000)/580_000_000,3);
        const volcanicField=fbm(seed+81011,(Number(x)||0)/96_000_000,(Number(z)||0)/96_000_000,5),stormField=ridged(seed+82011,(Number(x)||0)/108_000_000,(Number(z)||0)/108_000_000,5),floralField=fbm(seed+83011,(Number(x)||0)/92_000_000,(Number(z)||0)/92_000_000,5);
        const provinceField=fbm(seed+83111,(Number(x)||0)/135_000_000,(Number(z)||0)/135_000_000,5),provinceWarp=signed(seed+83121,(Number(x)||0)/185_000_000,(Number(z)||0)/185_000_000,4);
        // PATCH96 · Kıta üzerinde 24 yön dilimine bölünen atan2 eyaletleri kaldırıldı.
        // Onun yerine yüz milyonlarca metre boyunca devam eden iki sürekli iklim alanı
        // kullanılır. Böylece uzak atlas görünümündeki baklava/konfeti biyom mozaiği yok olur.
        const provinceA=signed(seed+83131,(Number(x)||0)/128_000_000,(Number(z)||0)/128_000_000,5),provinceB=signed(seed+83141,(Number(x)+21_700_000)/158_000_000,(Number(z)-17_100_000)/158_000_000,5);
        const provincePhase=clamp(.5+provinceA*.31+provinceB*.19,0,1),provinceIndex=Math.min(7,Math.floor(provincePhase*8));
        const giantTreeField=fbm(seed+83201,(Number(x)+11_400_000)/38_000_000,(Number(z)-9_900_000)/38_000_000,5);
        const worldTreeField=ridged(seed+83211,(Number(x)-22_100_000)/92_000_000,(Number(z)+17_700_000)/92_000_000,5);
        const waterfallRealmField=fbm(seed+83221,(Number(x)+7_700_000)/34_000_000,(Number(z)+4_400_000)/34_000_000,4);
        const auroraBasinField=ridged(seed+83231,(Number(x)-11_100_000)/54_000_000,(Number(z)-23_300_000)/54_000_000,4);
        const pearlCoastField=fbm(seed+83241,(Number(x)+31_100_000)/48_000_000,(Number(z)-16_600_000)/48_000_000,4);
        const sunGoldField=fbm(seed+83251,(Number(x)-8_800_000)/46_000_000,(Number(z)+29_900_000)/46_000_000,4);
        // PATCH93 · Su gezegenin dörtte üçünü kapladığı için okyanus da kendi makro
        // coğrafi eyaletlerine sahiptir. Bunlar su/kara kararını değiştirmez, yalnız
        // aynı tatlı-su okyanusunun büyük ve sürekli görsel-ekolojik karakterini taşır.
        const oceanThemeField=fbm(seed+83261,(Number(x)+41_100_000)/95_000_000,(Number(z)-33_300_000)/95_000_000,5);
        const oceanGlowField=ridged(seed+83271,(Number(x)-27_700_000)/120_000_000,(Number(z)+46_600_000)/120_000_000,4);
        // R110 · Okyanus havzaları ayrık sınıf değildir. Dört büyük akıntı karakteri
        // Gauss ağırlıklarıyla birbirine karışır; sınırda ani mavi blok oluşmaz.
        const oceanAtlasA=signed(seed+83281,(Number(x)+137_000_000)/450_000_000,(Number(z)-91_000_000)/450_000_000,3);
        const oceanAtlasB=signed(seed+83291,(Number(x)-203_000_000)/780_000_000,(Number(z)+157_000_000)/780_000_000,3);
        const oceanAtlasPhase=clamp(.5+oceanAtlasA*.38+oceanAtlasB*.20,0,1),oceanCenters=[.08,.36,.64,.92],oceanRaw=oceanCenters.map((center,index)=>({index,key:["open","moon","aeth","moss"][index],score:Math.exp(-Math.pow(oceanAtlasPhase-center,2)/(2*.145*.145))})),oceanTotal=oceanRaw.reduce((sum,item)=>sum+item.score,0)||1,oceanAtlasInfluences=oceanRaw.map(item=>({...item,weight:item.score/oceanTotal})).sort((a,b)=>b.weight-a.weight),oceanAtlasIndex=oceanAtlasInfluences[0]?.index||0;
        const coastAffinity=clamp(1-Math.abs(landSignal-.045)/.15,0,1),wetlandStrength=landSignal>0?clamp((moisture-.55)*2.55+clamp((11-height)/11,0,1)*.62+coastAffinity*.24+riverStrength*.24+lakeStrength*.30-.10,0,1):0;
        const folkBiome=surfaceFolkBiomeProvince(seed,x,z,{
            water:0,coast:coastAffinity,warmth,moisture,
            height:clamp(height/20,0,1),
            forest:clamp((moisture-.40)*2.05*(1-clamp(height/20,0,1)*.58),0,1),
            arcana,storm:clamp((1-warmth)*.56+r.ridge*.44,0,1)
        });
        // PATCH96 · Makro biyomlar önce iklimden doğar, lore temaları sonra seyrek
        // özel bölgeler olarak üstüne oturur. Böylece aynı kıtada onlarca küçük renk
        // karesi yerine birkaç büyük coğrafi kuşak okunur. 24 halkın habitat sistemi
        // cultureFor/taksonomi tarafında aynen yaşamaya devam eder.
        let macroBiomeKey="temperate";
        if(warmth<.22)macroBiomeKey="ice";
        else if(volcanicField>.875&&height>6.2)macroBiomeKey=provinceIndex%2?"dragon-volcanic":"forge";
        else if(height>10.5||r.ridge>.73)macroBiomeKey="highland";
        else if(warmth>.70&&moisture>.58)macroBiomeKey=coastAffinity>.48?"tropical-coast":"tropical";
        else if(moisture>.76&&arcana>.61)macroBiomeKey=provinceField>.57?"living-root":"ancient-forest";
        else if(moisture>.69)macroBiomeKey="ancient-forest";
        else if(arcana>.74&&moisture>.50)macroBiomeKey=provinceWarp>.08?"crystal":"moonwood";
        else if(warmth>.57&&moisture>.43)macroBiomeKey="mediterranean";
        else if(moisture<.42&&warmth>.35)macroBiomeKey="giant-plains";
        else if(floralField>.72&&moisture>.54)macroBiomeKey="floral";
        else if(stormField>.80&&warmth<.55)macroBiomeKey="storm";
        if(wetlandStrength>.82)macroBiomeKey="clear-water-meadow";
        if((macroBiomeKey==="temperate"||macroBiomeKey==="moonwood")&&warmth<.36&&provinceWarp<-.38)macroBiomeKey="twilight-edge";
        if(giantTreeField>.77&&moisture>.58&&height<11)macroBiomeKey=worldTreeField>.88?"world-tree":"giant-tree";
        else if(waterfallRealmField>.82&&r.ridge>.52&&moisture>.54)macroBiomeKey="waterfall-realm";
        else if(auroraBasinField>.91&&arcana>.60&&height<8)macroBiomeKey="aurora-basin";
        else if(pearlCoastField>.80&&coastAffinity>.56)macroBiomeKey="pearl-coast";
        else if(sunGoldField>.82&&warmth>.50&&moisture>.34&&height<9)macroBiomeKey="sun-gold-hills";
        // İklim ve topoğrafya aynı koordinatta birden çok ağırlık taşır. Etiket için
        // en güçlüsü kullanılabilir; renk/renderer bütün ağırlıkları yumuşak kuşaklar
        // halinde tüketir.
        const climateInfluences=normalizedInfluences([
            {key:"temperate",score:1-Math.abs(atlasWarmth-.52)*2.0-Math.abs(atlasMoisture-.54)*1.15},
            {key:"ice",score:(.36-atlasWarmth)*3.0+(height-7)*.025},
            {key:"tropical",score:(atlasWarmth-.58)*2.35+(atlasMoisture-.42)*.72},
            {key:"forest",score:(atlasMoisture-.53)*2.20-Math.abs(atlasWarmth-.51)*.45},
            {key:"mediterranean",score:.82-Math.abs(atlasWarmth-.63)*2.3-Math.abs(atlasMoisture-.46)*1.5},
            {key:"arcane",score:(atlasArcana-.55)*1.75+(arcana-.55)*.35},
            {key:"storm",score:(stormField-.57)*1.65+(1-atlasWarmth)*.12},
            {key:"floral",score:(floralField-.56)*1.48+(atlasMoisture-.48)*.38},
            {key:"volcanic",score:(volcanicField-.65)*1.75+Math.max(0,height-6)*.025}
        ],.31);
        // R110 · Atlas topografyası yerel 78–1.600 km gürültüden örneklenirse
        // uzak zoomda rastgele benek/mozaik oluşur. Kıtanın kendi dönük ekseninde
        // onlarca milyon metrelik kıvrımlı sıradağlar, yüksek ovalar ve havzalar
        // kurulur; yakın detay motoru bunların üstüne ayrıca çalışmaya devam eder.
        const ownerDx=Number(x)-Number(r.continentCenterX),ownerDz=Number(z)-Number(r.continentCenterZ),ownerAngle=Number(r.continentAngle)||0,ownerCos=Math.cos(ownerAngle),ownerSin=Math.sin(ownerAngle);
        const ownerAlong=ownerDx*ownerCos+ownerDz*ownerSin,ownerCross=-ownerDx*ownerSin+ownerDz*ownerCos,ownerCellX=Number(r.continentCellX)||0,ownerCellZ=Number(r.continentCellZ)||0;
        const mountainPhase=hash(seed+84201,ownerCellX,ownerCellZ)*Math.PI*2,mountainOffset=(hash(seed+84211,ownerCellX+7,ownerCellZ-11)-.5)*32_000_000;
        const primaryFoldCenter=mountainOffset+Math.sin(ownerAlong/22_000_000+mountainPhase)*8_500_000+signed(seed+84221,ownerAlong/74_000_000,ownerCross/210_000_000,3)*6_500_000;
        const primaryFoldWidth=mix(7_000_000,12_500_000,hash(seed+84231,ownerCellX-13,ownerCellZ+17)),primaryFold=Math.exp(-Math.pow((ownerCross-primaryFoldCenter)/primaryFoldWidth,2)*1.35)*smooth(clamp((106_000_000-Math.abs(ownerAlong))/34_000_000,0,1));
        const branchAngle=ownerAngle+(hash(seed+84241,ownerCellX+19,ownerCellZ-23)-.5)*1.34,branchCos=Math.cos(branchAngle),branchSin=Math.sin(branchAngle),branchAlong=ownerDx*branchCos+ownerDz*branchSin,branchCross=-ownerDx*branchSin+ownerDz*branchCos,branchOffset=(hash(seed+84251,ownerCellX-29,ownerCellZ+31)-.5)*38_000_000;
        const branchFoldCenter=branchOffset+Math.sin(branchAlong/18_000_000+mountainPhase*.71)*6_000_000,branchFold=Math.exp(-Math.pow((branchCross-branchFoldCenter)/8_500_000,2)*1.55)*smooth(clamp((76_000_000-Math.abs(branchAlong))/27_000_000,0,1))*.72;
        const atlasReliefTexture=fbm(seed+84261,(ownerAlong+17_000_000)/43_000_000,(ownerCross-13_000_000)/43_000_000,4),atlasReliefBreakup=fbm(seed+84266,(ownerAlong-9_000_000)/17_000_000,(ownerCross+21_000_000)/23_000_000,4),atlasMountainStrength=clamp(Math.max(primaryFold,branchFold)*(.27+atlasReliefTexture*.57+atlasReliefBreakup*.43),0,1);
        const atlasUplandStrength=clamp(fbm(seed+84271,(ownerAlong-23_000_000)/72_000_000,(ownerCross+19_000_000)/72_000_000,4)*.78+atlasMountainStrength*.34,0,1),atlasBasinStrength=clamp(fbm(seed+84281,(ownerAlong+31_000_000)/58_000_000,(ownerCross-27_000_000)/58_000_000,4)*.96-atlasMountainStrength*.48,0,1),atlasRidgeStrength=clamp(atlasMountainStrength*.82+ridged(seed+84291,ownerAlong/54_000_000,ownerCross/54_000_000,3)*.24,0,1);
        const atlasReliefHeight=clamp(2.2+atlasUplandStrength*7.6+atlasMountainStrength*15.8-atlasBasinStrength*3.8,0,28);
        const topographyInfluences=normalizedInfluences([
            {key:"lowland",score:1.12-atlasReliefHeight*.067+atlasBasinStrength*.28},
            {key:"upland",score:.86-Math.abs(atlasReliefHeight-9.5)*.071+atlasUplandStrength*.34},
            {key:"mountain",score:.40-Math.abs(atlasReliefHeight-18)*.050+atlasMountainStrength*1.08},
            {key:"snow",score:.20-Math.abs(atlasReliefHeight-25)*.042+atlasMountainStrength*.62+(1-atlasWarmth)*.48},
            {key:"basin",score:.29+atlasBasinStrength*1.10-atlasMountainStrength*.34},
            {key:"ridge",score:.23+atlasRidgeStrength*.93}
        ],.29);
        // PATCH99 · Lore destekli yaşayan coğrafya, iklim ve topoğrafya belli
        // olduktan sonra devreye girer. Böylece soğuk bölgede buzul çanağı,
        // volkanik sırtta kaldera, canlı ormanda kök havzası, kıyıda fiyort/delta
        // rastgele değil bağlama bağlı biçimde doğar.
        const living=surfaceLivingGeography(seed,x,z,{landSignal,coastAffinity,moisture,warmth,arcana,ridge:r.ridge,riverStrength,height,macroBiomeKey,volcanicField,stormField,wetlandStrength,detailTier});
        height+=living.formationHeightDelta;
        const legacyAnomaly=landSignal>0?rareSurfaceAnomaly(seed,x,z):{pitStrength:0,caveEntranceStrength:0,pitRadiusM:0,pitDepthM:0,anomalyKey:""},anomaly={
            pitStrength:Math.max(living.pitStrength,legacyAnomaly.pitStrength*.52),
            caveEntranceStrength:Math.max(living.caveEntranceStrength,legacyAnomaly.caveEntranceStrength*.58),
            pitRadiusM:living.pitStrength>=legacyAnomaly.pitStrength*.52?living.pitRadiusM:legacyAnomaly.pitRadiusM,
            pitDepthM:living.pitStrength>=legacyAnomaly.pitStrength*.52?living.pitDepthM:legacyAnomaly.pitDepthM,
            anomalyKey:living.formationClass!=="plain"?`living:${living.formationClass}`:legacyAnomaly.anomalyKey
        };
        height-=anomaly.pitStrength*mix(.15,3.4,clamp(anomaly.pitDepthM/5000,0,1));
        if(living.formationLakeStrength>.72&&landSignal>.014&&height<7.4){lakeStrength=Math.max(lakeStrength,living.formationLakeStrength);lakeCandidate=true;height=Math.min(height,.46-lakeStrength*1.12);}
        const waterfallStrength=clamp((riverStrength-.22)/.78,0,1)*clamp((r.ridge-.39)/.61,0,1)*clamp((height-.85)/5.4,0,1);
        // Görsel sampler tam kültür/taksonomi hesabına girmeden su makro kimliğini
        // taşıyabilsin. surfaceSample daha sonra gerçek baseBiome ile bunu ezer.
        let baseBiome=macroBiomeKey;
        if(landSignal<=0){
            if(landSignal<-.17)baseBiome=oceanGlowField>.88&&arcana>.61?"yıldız-yansımalı-tatlı-okyanus":oceanThemeField>.76&&moisture>.52?"ışıklı-yosun-tatlı-okyanusu":"derin-tatlı-su-okyanusu";
            else if(landSignal<-.075)baseBiome=oceanGlowField>.78&&arcana>.66?"kristal-akıntı-okyanusu":warmth<.34&&oceanThemeField<.43?"gümüş-ay-denizi":arcana>.72&&oceanThemeField>.58?"aeth-akıntı-denizi":"tatlı-su-okyanusu";
            else if(landSignal<-.018)baseBiome=warmth>.64&&moisture>.57?"turkuaz-mercan-denizi":arcana>.68?"ışıklı-inci-denizi":"tatlı-su-denizi";
            else baseBiome=oceanThemeField>.62?"inci-sığlık":"turkuaz-kıyı-sığlığı";
        }
        return{...r,...living,...anomaly,height,moisture,warmth,arcana,macroMoisture,macroWarmth,atlasMoisture,atlasWarmth,atlasArcana,atlasMountainStrength,atlasUplandStrength,atlasBasinStrength,atlasRidgeStrength,atlasReliefHeight,atlasReliefTexture,atlasReliefBreakup,climateBand,climateInfluences,topographyInfluences,volcanicField,stormField,floralField,macroBiomeKey,baseBiome,folkBiome,provincePhase,provinceIndex,wetlandStrength,giantTreeField,worldTreeField,waterfallRealmField,auroraBasinField,pearlCoastField,sunGoldField,oceanThemeField,oceanGlowField,oceanAtlasPhase,oceanAtlasIndex,oceanAtlasInfluences,landSignal,envelopeLandSignal,inlandSeaStrength,seaCut,lakeStrength,lakeCandidate,waterfallStrength,riverStrength,closeTerrainMask,coastDetailMask};
    };
    const surfaceSample=(seed,x,z)=>{
        const f=surfaceFields(seed,x,z),h=f.height,m=f.moisture,t=f.warmth,a=f.arcana,riverStrength=clamp(Number(f.riverStrength)||0,0,1),coastAffinity=clamp(1-Math.abs(f.landSignal-.045)/.15,0,1);
        const oceanWater=Number(f.envelopeLandSignal)<=0;
        const lakeWater=!oceanWater&&f.lakeCandidate;
        const riverWater=!oceanWater&&!lakeWater&&riverStrength>.78&&h<11.8&&f.landSignal<.16;
        const waterfall=riverWater&&f.waterfallStrength>.58;
        let biome,color,walkable=true,isWater=false;
        if(oceanWater){
            isWater=true;walkable=false;
            const oceanTheme=Number(f.oceanThemeField)||0,oceanGlow=Number(f.oceanGlowField)||0;
            if(f.landSignal<-.17){
                if(oceanGlow>.88&&a>.61){biome="yıldız-yansımalı-tatlı-okyanus";color=palette.auroraSea;}
                else if(oceanTheme>.76&&m>.52){biome="ışıklı-yosun-tatlı-okyanusu";color=palette.mossOcean;}
                else{biome="derin-tatlı-su-okyanusu";color=palette.deepWater;}
            }
            else if(f.landSignal<-.075){
                if(oceanGlow>.78&&a>.66){biome="kristal-akıntı-okyanusu";color=palette.crystalCurrent;}
                else if(t<.34&&oceanTheme<.43){biome="gümüş-ay-denizi";color=palette.moonSea;}
                else if(a>.72&&oceanTheme>.58){biome="aeth-akıntı-denizi";color=palette.aethSea;}
                else{biome="tatlı-su-okyanusu";color=palette.ocean;}
            }
            else if(f.landSignal<-.018){
                if(t>.64&&m>.57){biome="turkuaz-mercan-denizi";color=palette.pearlSea;}
                else if(a>.68){biome="ışıklı-inci-denizi";color=palette.crystalCurrent;}
                else{biome="tatlı-su-denizi";color=palette.water;}
            }
            else{biome=oceanTheme>.62?"inci-sığlık":"turkuaz-kıyı-sığlığı";color=f.landSignal<-.007?palette.lagoon:palette.shallows;}
            // Uzak ölçekte büyülü okyanus bölgeleri açık renkli sahte kara gibi
            // okunmasın. Tema rengi derinlik boyunca kesintisiz biçimde görünür,
            // fakat açık turkuaz yalnız gerçek kıta sahanlığına yaklaşınca güçlenir.
            const shelfVisibility=smooth(clamp((f.landSignal+.205)/.205,0,1));
            color=mixRgb(palette.deepWater,color,.10+shelfVisibility*.90);
        }
        else if(lakeWater){
            if(Number(f.inlandSeaStrength)>.72){biome="kıta-içi-tatlı-su-denizi";color=palette.ocean;}
            else if(f.formationWaterType==="glacial-lake"){biome="buzul-çanağı-tatlı-su-gölü";color=palette.crystalCurrent;}
            else if(f.formationWaterType==="caldera-lake"){biome="kaldera-tatlı-su-gölü";color=palette.water;}
            else if(f.formationWaterType==="spring-pool"){biome="sıcak-kaynak-terası";color=palette.lagoon;}
            else if(f.formationWaterType==="hollow-pool"){biome="doğal-su-cebi";color=palette.shallows;}
            else if(f.formationWaterType==="basin-lake"){biome="havza-tatlı-su-gölü";color=palette.water;}
            else{biome=f.lakeStrength>.68?"göl-aynası":"kaynak-havzası";color=f.lakeStrength>.68?palette.water:palette.lagoon;}
            walkable=false;isWater=true;
        }
        else if(riverWater){biome=waterfall?"berrak-şelale":f.deltaStrength>.48?"örgülü-delta-akışı":riverStrength>.72?"berrak-nehir":"ışıltılı-akarsu";color=waterfall?palette.shallows:f.deltaStrength>.48?palette.clearReed:riverStrength>.68?palette.water:palette.lagoon;walkable=riverStrength<.46&&!waterfall;isWater=true;}
        else if(f.caveEntranceStrength>.52){biome=f.gorumTraceStrength>.42?"eski-gorûm-derinlik-izi":"mağara-girişi";color=palette.caveMouth;walkable=false;}
        else if(f.calderaStrength>.52){biome="volkanik-kaldera-çanağı";color=palette.volcanic;}
        else if(f.rootHollowStrength>.56){biome="yaşayan-kök-havzası";color=palette.livingRoot;}
        else if(f.ravineStrength>.62){biome="doğal-yar-vadisi";color=palette.highland;}
        else if(f.pitStrength>.16){
            biome=f.pitRadiusM<90?"mikro-doğal-çukur":f.pitRadiusM<1800?"yerel-çöküntü":"derin-çöküntü";
            // PATCH100 · Çukur, bulunduğu toprağın üstüne siyah disk basmaz.
            // Önce çevrenin toprak tonu seçilir; pitStrength merkeze yaklaştıkça,
            // boyut ve gerçek derinlik arttıkça sıcak koyu kahve üzerinden siyaha
            // yakın ama asla saf siyah olmayan çekirdeğe iner.
            const provinceSoil=Array.isArray(f.folkBiome?.color)?f.folkBiome.color:null;
            const pitSoil=provinceSoil||(/dragon-volcanic|forge/.test(String(f.macroBiomeKey||""))?[101,72,53]:
                f.macroBiomeKey==="ice"?[103,105,96]:
                /ancient-forest|living-root|giant-tree|world-tree/.test(String(f.macroBiomeKey||""))?[76,78,52]:
                /^tropical/.test(String(f.macroBiomeKey||""))?[94,80,52]:
                /moonwood|ory-garden|crystal/.test(String(f.macroBiomeKey||""))?[80,69,72]:
                f.height>8?[91,84,70]:[102,82,58]);
            const depthNorm=clamp(Math.log10(1+Math.max(0,Number(f.pitDepthM)||0))/4.30,0,1),sizeNorm=clamp(Math.log10(1+Math.max(0,Number(f.pitRadiusM)||0))/5.15,0,1),centerNorm=Math.pow(clamp((Number(f.pitStrength)-.18)/.82,0,1),1.18);
            const darkness=clamp(.10+centerNorm*(.58+depthNorm*.18+sizeNorm*.08)+(depthNorm*.11+sizeNorm*.07)*(.45+centerNorm*.55),.12,.93);
            color=mixRgb(pitSoil,[15,10,8],darkness);walkable=f.pitStrength<.72;
        }
        else if(f.glacialBasinStrength>.66&&String(f.macroBiomeKey||"")==="ice"){biome="buzul-oyma-çanağı";color=palette.glacialCrystal;}
        else{
            const province=f.folkBiome||surfaceFolkBiomeProvince(seed,x,z,{water:0,coast:coastAffinity,warmth:t,moisture:m,height:clamp(h/20,0,1),forest:clamp((m-.40)*2.05,0,1),arcana:a,storm:clamp((1-t)*.56+f.ridge*.44,0,1)});
            const provinceColor=province.color||palette.meadow,provinceKey=String(province.primaryKey||""),transition=Number(province.transition)||0;
            const coldRealm=isColdRealmKey(provinceKey)||String(f.macroBiomeKey||"")==="ice",shadowRealm=isShadowRealmKey(provinceKey),verdantRealm=isVerdantRealmKey(provinceKey);
            const climateColors={temperate:palette.meadow,ice:palette.frostForest,tropical:palette.tropical,forest:palette.deepForest,mediterranean:palette.mediterranean,arcane:palette.arcaneCrystal,storm:palette.stormHighland,floral:palette.floralParadise,volcanic:palette.volcanic};
            const climate=f.climateInfluences||[],climateColor=[0,1,2].map(channel=>Math.round(climate.reduce((sum,item)=>sum+(climateColors[item.key]?.[channel]||provinceColor[channel])*Number(item.weight||0),0)));
            color=mixRgb(provinceColor,climateColor,.39);
            const topographyColors={lowland:color,upland:palette.highland,mountain:shadowRealm?[154,160,166]:palette.mountain,snow:coldRealm?palette.snow:palette.mountain,basin:verdantRealm?palette.waterMeadow:palette.moss,ridge:palette.highland};
            const topography=f.topographyInfluences||[],topographyColor=[0,1,2].map(channel=>Math.round(topography.reduce((sum,item)=>sum+(topographyColors[item.key]?.[channel]||color[channel])*Number(item.weight||0),0)));
            color=mixRgb(color,topographyColor,.31);
            const wetlandWeight=clamp((Number(f.wetlandStrength)-.34)/.55,0,1);color=mixRgb(color,palette.waterMeadow,wetlandWeight*.18);
            const dominantClimate=climate[0]?.key||"temperate",dominantTopography=topography[0]?.key||"lowland",climateNames={temperate:"ılıman",ice:"soğuk",tropical:"tropik",forest:"orman",mediterranean:"Akdeniz",arcane:"aeth",storm:"fırtına",floral:"çiçek",volcanic:"volkanik"},topographyNames={lowland:"ova",upland:"yüksekova",mountain:"dağ",snow:"kar",basin:"havza",ridge:"sırt"};
            biome=transition>.28?`${province.primaryName} ↔ ${province.secondaryName} geçiş kuşağı`:`${province.primaryName} · ${climateNames[dominantClimate]||dominantClimate} ${topographyNames[dominantTopography]||dominantTopography}`;
        }
        // PATCH93 · 24 halkın coğrafi ihtiyacı yalnız isim değildir. Güçlü habitat
        // uyumu, ana fiziksel coğrafyayı bozmadan lore-uyumlu alt-diyar kimliği verir.
        const preEnvironment={water:isWater?1:0,coast:clamp(1-Math.abs(f.landSignal)/.115,0,1),warmth:t,moisture:m,height:clamp(h/20,0,1),forest:clamp((m-.40)*2.05*(1-clamp(h/20,0,1)*.58),0,1),arcana:a,storm:clamp((1-t)*.56+f.ridge*.44,0,1)};
        const folkPreview=cultureFor(seed,x,z,"surface",preEnvironment);
        if(isWater&&folkPreview.folkStrength>.72){
            if(folkPreview.folkKey==="rhyirun-kharun"&&oceanWater){biome=f.landSignal<-.075?"rhyirun-ışıklı-yosun-okyanusu":"rhyirun-akıntı-bahçesi";color=f.landSignal<-.075?palette.mossOcean:palette.aethSea;}
            else if(folkPreview.folkKey==="maerethi-solayn"&&coastAffinity>.60&&t>.58){biome="maerethi-mercan-kıyı-suları";color=palette.pearlSea;}
            else if(folkPreview.folkKey==="neraeth-vaeluna"&&(lakeWater||riverWater)){biome="vaeluna-berrak-su-damarı";color=palette.aethSea;}
        }
        // Lore önizlemesi yukarıdaki okyanus derinlik tonunu ezebilirdi. Bütün açık
        // okyanus renkleri burada ikinci kez aynı kesintisiz şelf alanına bağlanır;
        // böylece uzaktan bakınca parlak su lekeleri ada/kara gibi görünmez.
        if(oceanWater){const shelfVisibility=smooth(clamp((f.landSignal+.205)/.205,0,1));color=mixRgb(palette.deepWater,color,.10+shelfVisibility*.90);}
        // PATCH104 · Kara rengini küçük cultureFor hücreleri artık ezmez.
        // Halk kimliği yüzlerce/binlerce km ölçekli folkBiome province tarafından
        // belirlenir; cultureFor yerleşim/taksonomi metadata üretmeye devam eder.
        // R42: Taksonomi bölgeleri kimlik/isim üretmeye devam eder; fakat bölgeye
        // ait ayrık imza rengi doğrudan araziye uygulanmaz. Özellikle x=0/z=0 ve
        // 48 km sınırlarında koca kareler hâlinde renk sıçraması oluşturuyordu.
        // Görsel nüans artık kesintisiz dünya alanlarından türetilir.
        const continuousHue=(a-.5)*3.2+(f.coastDetailMask||0)*1.4-(f.closeTerrainMask||0)*.6;
        const continuousLight=(m-.5)*.018+(t-.5)*.012+(f.closeTerrainMask||0)*.010+(f.coastDetailMask||0)*.006;
        const continuousSat=(a-.5)*.025+(f.closeTerrainMask||0)*.010;
        const interpretedColor=rgbShift(color,continuousHue,continuousLight,continuousSat);
        const variant=biomeVariation(seed,Number(x||0)/SURFACE_GEOGRAPHY_SCALE_M,Number(z||0)/SURFACE_GEOGRAPHY_SCALE_M,"surface",biome,interpretedColor);
        const riverWidthM=riverWater?mix(1.2,54,Math.pow(riverStrength,1.48))*mix(.82,1.30,m):0;
        const normalizedHeight=clamp(h/20,0,1),environment={
            water:isWater?1:0,coast:clamp(1-Math.abs(f.landSignal)/.115,0,1),warmth:t,moisture:m,height:normalizedHeight,
            forest:clamp((m-.40)*2.05*(1-normalizedHeight*.58),0,1),arcana:a,storm:clamp((1-t)*.56+f.ridge*.44,0,1),wetland:f.wetlandStrength,volcanic:f.volcanicField,floral:f.floralField
        };
        // Atlas alanları yalnızca görsel imza ve yerleşim motifi üretir. Aşağıdaki
        // eski yürünebilirlik/su/biyom alanlarını asla değiştirmez; kayıtlı piyonlar,
        // seyahat rotaları ve eski dünya koordinatları aynı coğrafyada kalır.
        const atlas=atlasFields(seed,x,z,"surface",environment,{walkable,water:isWater,ridge:f.ridge,height:h});
        // PATCH81: Eski R5 arazi motoruna dokunulmaz. waterKind yalnız Y-M-C-E-H
        // taksonomisine suyun gerçek türünü ileten metadata'dır; geometri, eşik,
        // renk, kıyı, göl, nehir ve yükseklik hesaplarını değiştirmez.
        const waterKind=oceanWater?"open-water":lakeWater?(Number(f.inlandSeaStrength)>.72?"inland-sea":(f.formationWaterType||"lake")):waterfall?"waterfall":riverWater?(f.deltaStrength>.48?"delta":"river"):"land";
        const anomalyKind=f.caveEntranceStrength>.52?"cave-entrance":f.pitStrength>.22?"deep-pit":"",taxonomy=SURFACE_TAXONOMY?.classify?.(seed,x,z,{...f,...environment,...atlas,river:riverStrength,lagoon:f.lagoon,water:isWater?1:0,waterKind,lake:lakeWater?1:0,waterfall:waterfall?1:0,wetland:f.wetlandStrength,anomalyKind,layerKey:"surface"})||null;
        return{...f,...variant,...atlas,taxonomyCode:taxonomy?.code||"",taxonomyName:taxonomy?.name||"",taxonomyRegionKey:taxonomy?.regionKey||"",taxonomy,walkable,water:isWater,waterKind,freshwater:isWater,mudless:true,riverStrength,riverWidthM,lake:lakeWater,waterfall,wetland:f.wetlandStrength,anomalyKind,layerKey:"surface"};
    };
    // PATCH89 · Uçan Ada: önce büyük gök boşluğu, sonra seyrek takımada
    // kümeleri. Bir kümenin içinde farklı iklim alt cepleri olabilir; bütün gök
    // tek renk/tek iklim değildir.
    const SKY_ARCHIPELAGO={cellSize:3_600_000,chance:.28,spreadMin:280_000,spreadMax:1_300_000,itemMin:2,itemMax:10,radiusMin:35_000,radiusMax:330_000,aspectMin:.34,aspectMax:1.95,themeCount:16,salt:701101};
    const SKY_SOLITARY={cellSize:1_600_000,chance:.024,spreadMin:45_000,spreadMax:150_000,itemMin:1,itemMax:2,radiusMin:9_000,radiusMax:78_000,aspectMin:.38,aspectMax:1.72,themeCount:16,salt:701201};
    const skySample=(seed,x,z)=>{
        const mx=Number(x||0)/SKY_GEOGRAPHY_SCALE_M,mz=Number(z||0)/SKY_GEOGRAPHY_SCALE_M,s=seed+layerSalt("sky");
        const arch=archipelagoField(s,x,z,SKY_ARCHIPELAGO),solo=archipelagoField(s+97,x,z,SKY_SOLITARY),best=arch.field>=solo.field?arch:solo;
        const walkable=best.field>0,islandMask=best.field,theme=best.theme||0,cluster=best.cluster||0;
        // Atmosfer alanları ada geometrisinden bağımsız ve çok daha geniştir.
        const macroCloud=fbm(s+700101,(mx+180000)*.000018,(mz-270000)*.000018,5),cloudDetail=fbm(s+700111,mx*.00029,mz*.00029,4);
        const cloudBank=clamp((macroCloud-.57)*2.4,0,1)*(.62+.38*cloudDetail);
        const storm=fbm(s+700401,(mx-350000)*.000010,(mz+210000)*.000010,5),light=ridged(s+700501,(mx+110000)*.000031,(mz-90000)*.000031,4),frost=fbm(s+700601,(mx-520000)*.000009,(mz-160000)*.000009,5),lush=fbm(s+700701,(mx+250000)*.000012,(mz+330000)*.000012,5);
        const ridge=ridged(s+700301,mx*.00025,mz*.00025,4),local=fbm(s+700201,mx*.00034,mz*.00034,5);
        const height=(walkable?Math.max(.02,islandMask)*17:0)+ridge*(walkable?3.4:.4),subClimate=fbm(s+700811,(mx+(theme+1)*71000)*.000038,(mz-(theme+1)*53000)*.000038,4);
        const skyWaterBasin=fbm(s+700821,(mx-130000)*.000070,(mz+220000)*.000070,4),skyRiverField=Math.abs(signed(s+700831,mx*.000165,mz*.000165,4)),skyTree=fbm(s+700841,(mx+170000)*.000024,(mz-130000)*.000024,5),skyAurora=ridged(s+700851,(mx-260000)*.000017,(mz+330000)*.000017,4);
        const skyLake=walkable&&islandMask>.16&&skyWaterBasin>.82,skyRiver=walkable&&!skyLake&&islandMask>.11&&skyRiverField<.040&&lush>.48;
        const skyWaterfall=skyRiver&&ridge>.72&&height>4.5;
        let biome,color;
        if(!walkable){biome=cloudBank>.42?"seyrek-bulut-denizi":"açık-gök-boşluğu";color=cloudBank>.42?palette.cloud:palette.skyVoid;}
        else{
            // PATCH90: ada İÇLERİ boş bir toprak rengi değildir. Büyük uçan diyarlar
            // kendi göl, nehir, şelale, orman, çiçek, buz, kristal ve fırtına ceplerini taşır.
            if(skyWaterfall){biome="asılı-şelale";color=palette.skyRiver;}
            else if(skyRiver){biome="gök-nehri";color=palette.skyRiver;}
            else if(skyLake){biome="gök-gölü";color=palette.skyLake;}
            else if((theme===2&&storm>.48)||storm>.80){biome="fırtına-adası";color=palette.stormIsland;}
            else if((theme===3&&frost>.44)||(frost>.80&&subClimate>.40)){biome="buzlu-gök-adası";color=palette.skyFrost;}
            else if((theme===4&&light>.44)||(light>.82&&subClimate>.50)){biome="kristal-gök-adası";color=palette.skyCrystal;}
            else if(theme===5&&subClimate>.48){biome="güneş-yüksekliği";color=palette.skySun;}
            else if(theme===6&&subClimate>.42){biome="çiçekli-gök-bahçesi";color=palette.skyFlower;}
            else if(theme===7&&lush>.42){biome="meyveli-gök-koruluğu";color=palette.skyFruit;}
            else if(theme===8){biome=subClimate>.52?"sisli-kaya-adası":"gümüş-gök-sırtı";color=subClimate>.52?palette.skyMist:palette.skyRock;}
            else if(theme===9&&skyTree>.50){biome=skyTree>.76?"dev-gök-ağacı":"bulut-taçlı-kök-adası";color=skyTree>.76?palette.skyGiantTree:palette.skyRoot;}
            else if(theme===10){biome="inci-bulut-bahçesi";color=palette.skyPearl;}
            else if(theme===11){biome=skyAurora>.58?"aurora-gök-adası":"gümüş-ışık-adası";color=skyAurora>.58?palette.skyAurora:palette.skyWhite;}
            else if(theme===12){biome="yıldırım-hasat-adası";color=palette.stormIsland;}
            else if(theme===13){biome="asılı-köprü-kütlesi";color=palette.skyRock;}
            else if(theme===14){biome="altın-güneş-adaları";color=palette.skyGold;}
            else if(theme===15){biome=subClimate>.5?"menekşe-aeth-adası":"turkuaz-rüzgar-adası";color=subClimate>.5?palette.skyViolet:palette.skyTeal;}
            else if((theme===1&&lush>.40)||lush>.70){biome=subClimate>.54?"gök-koruluğu":"asılı-su-bahçesi";color=subClimate>.54?palette.skyForest:palette.skyWaterGarden;}
            else if(light>.73&&subClimate>.60){biome="ışık-bahçesi";color=palette.lightGarden;}
            else{biome=subClimate>.52?"uçan-çayır":"gök-koruluğu";color=subClimate>.52?palette.skyMeadow:palette.skyForest;}
        }
        const astralStrength=walkable?clamp((light-.70)*2.8,0,1)*clamp((height-1.4)/10,0,1):0;
        const environment={island:walkable?1:0,cloud:cloudBank,storm,arcana:light,height:clamp((height+2)/18,0,1),astral:astralStrength,water:0,open:walkable?1:0,archipelago:cluster,theme};
        const atlas=atlasFields(seed,x,z,"sky",environment,{walkable,water:skyLake||skyRiver||skyWaterfall,ridge,height});
        if(walkable&&atlas.folkStrength>.70&&!skyLake&&!skyRiver&&!skyWaterfall){
            if(atlas.folkKey==="thalass-moryn"){biome=cluster>.42?"thalass-balina-geçidi-diyarı":"thalass-gök-gölü-adası";color=cluster>.42?palette.skyPearl:palette.skyWaterGarden;}
            else if(atlas.folkKey==="vekthar-numyr"){biome="vekthar-asılı-köprü-kütlesi";color=palette.skyRock;}
            else if(atlas.folkKey==="thyra-vekuryn"&&storm>.42){biome="thyra-yıldırım-koridoru-adası";color=palette.stormIsland;}
            else if(atlas.folkKey==="asteryn-veyrkha"&&light>.55){biome="asteryn-yüksek-katman-geçişi";color=palette.skyAurora;}
            else if(atlas.folkKey==="kalyti-yhrae"){biome="kalyti-kristal-köprü-adası";color=palette.skyCrystal;}
            else if(atlas.folkKey==="dray-zurkhaer"&&height>5){biome="dray-sıcak-rüzgar-gök-sırtı";color=palette.skyGold;}
        }
        const skyWaterfallStrength=skyWaterfall?1:(walkable?clamp((cloudDetail-.62)*2.7,0,1)*clamp((height-2)/10,0,1)*clamp((lush-.45)*1.8,0,1):0);
        const taxonomy=SURFACE_TAXONOMY?.classify?.(seed,x,z,{height,moisture:lush,warmth:1-frost,arcana:light,ridge,river:0,lagoon:0,...environment,...atlas,islandGroupStrength:cluster,solitaryIslandStrength:solo.cluster||0,layerKey:"sky"})||null;
        const variant=biomeVariation(seed,mx,mz,"sky",biome,color);return{height,moisture:lush,warmth:1-frost,arcana:light,ridge,river:0,lagoon:0,...variant,...atlas,taxonomyCode:taxonomy?.code||"",taxonomyName:taxonomy?.name||"",taxonomyRegionKey:taxonomy?.regionKey||"",taxonomy,cloud:cloudBank,cloudBank,cloudDetail,islands:local,islandMask,islandGroupStrength:cluster,solitaryIslandStrength:solo.cluster||0,storm,light,frost,lush,skyTheme:theme,skyTreeStrength:skyTree,skyAuroraStrength:skyAurora,astralStrength,denseCloud:clamp((cloudBank-.62)*2.8,0,1),skyWaterfallStrength,skyLake,skyRiver,skyWaterfall,water:skyLake||skyRiver||skyWaterfall,walkable,layerKey:"sky"};
    };
    // PATCH89 · Yeraltı: tekdüze gürültü yerine makro mağara eyaletleri,
    // büyük salonlar, bağlantı tünelleri ve farklı jeolojik/ekolojik kuşaklar.
    const undergroundSample=(seed,x,z)=>{
        const mx=Number(x||0)/UNDERGROUND_GEOGRAPHY_SCALE_M,mz=Number(z||0)/UNDERGROUND_GEOGRAPHY_SCALE_M,s=seed+layerSalt("underground");
        const warp=warpCoordinates(s,mx,mz,.00011,3400),wx=warp.x,wz=warp.z;
        const province=fbm(s+41,(wx+420000)*.0000065,(wz-310000)*.0000065,5),chambers=fbm(s+101,wx*.000038,wz*.000038,5),tunnels=ridged(s+201,wx*.000115,wz*.000115,5);
        const fracture=Math.abs(signed(s+231,(wx-190000)*.000024,(wz+270000)*.000024,5));
        // Büyük mağara salonları + uzun tünel damarları. Dışarıdaki kapalı kaya
        // bölgeleri gerçekten geniş kütleler olarak kalır.
        const chamberOpen=clamp((province-.47)*2.9,0,1)*clamp((chambers-.40)*2.2,0,1);
        const tunnelOpen=clamp((tunnels-.74)*3.8,0,1)*clamp((.23-fracture)/.23,0,1);
        const openScore=Math.max(chamberOpen,tunnelOpen*.78),walkable=openScore>.12,openMask=openScore-.12;
        const water=fbm(s+301,(wx+80000)*.000025,(wz-140000)*.000025,5),mineral=ridged(s+401,wx*.000071,wz*.000071,5),fungus=fbm(s+501,(wx-120000)*.000034,(wz+90000)*.000034,4),magma=fbm(s+551,(wx+370000)*.000010,(wz+210000)*.000010,5);
        const riverField=Math.abs(signed(s+601,wx*.000095,wz*.000095,5)),cascade=ridged(s+701,wx*.00014,wz*.00014,4),stone=fbm(s+801,wx*.000026,wz*.000026,4),oreSelector=hash(s+901,Math.floor(wx/420),Math.floor(wz/420)),fungusSelector=hash(s+1001,Math.floor(wx/360),Math.floor(wz/360));
        const geology=fbm(s+1101,(wx+910000)*.0000032,(wz-630000)*.0000032,4),geologyBand=Math.floor(clamp(geology,0,.999999)*16),rootField=fbm(s+1201,(wx+370000)*.000006,(wz-510000)*.000006,4),prismField=ridged(s+1301,(wx-420000)*.000008,(wz+280000)*.000008,4),livingStoneField=fbm(s+1401,(wx+210000)*.000009,(wz+190000)*.000009,4);
        const river=walkable&&riverField<.050&&water>.42,waterfall=river&&cascade>.72;
        const lake=walkable&&water>.82&&openScore>.32;
        const lava=walkable&&magma>.83&&water<.68;
        const height=(openScore-.12)*9+mineral*2.1-(lava?1.2:0);
        let biome,color;
        if(!walkable){biome=province<.35?"derin-kapalı-kaya":"kapalı-kaya";color=stone>.58?palette.darkRock:palette.caveVoid;}
        else if(lava){biome=magma>.91?"lav-gölü":"bazalt-lav-çatlağı";color=magma>.91?palette.lava:palette.basalt;}
        else if(waterfall){biome="yeraltı-şelalesi";color=palette.undergroundWater;}
        else if(river){biome="yeraltı-nehri";color=water>.67?palette.undergroundWater:palette.deepUndergroundWater;}
        else if(lake){biome="yeraltı-gölü";color=palette.undergroundWater;}
        else if(mineral>.93){
            if(oreSelector<.14){biome="bakır-damarı";color=palette.copper;}
            else if(oreSelector<.28){biome="demir-damarı";color=palette.iron;}
            else if(oreSelector<.40){biome="altın-damarı";color=palette.gold;}
            else if(oreSelector<.52){biome="gümüş-damarı";color=palette.silver;}
            else if(oreSelector<.68){biome="ametist-damarı";color=palette.amethyst;}
            else if(oreSelector<.82){biome="zümrüt-damarı";color=palette.emerald;}
            else{biome="safir-damarı";color=palette.sapphire;}
        }
        else if(mineral>.86&&fungus>.56){biome="kristal-mağara";color=palette.crystalCave;}
        else if(fungus>.76){
            if(fungusSelector<.25){biome="yeşil-ışıklı-mantar-ormanı";color=palette.mushroom;}
            else if(fungusSelector<.5){biome="mor-ışıklı-mantar-ormanı";color=palette.mushroomViolet;}
            else if(fungusSelector<.75){biome="kehribar-ışıklı-mantar-ormanı";color=palette.mushroomAmber;}
            else{biome="camgöbeği-ışıklı-mantar-ormanı";color=palette.mushroomCyan;}
        }
        else if(chambers<.48){biome="kil-havzası";color=palette.clay;}
        else if(mineral>.70){biome="mineral-teras";color=palette.mineral;}
        else if(rootField>.82&&openScore>.34){biome="kök-katedrali";color=palette.rootCathedral;}
        else if(prismField>.90&&mineral>.64){biome="prizmatik-kristal-ormanı";color=palette.prismatic;}
        else if(livingStoneField>.84&&fungus>.48){biome="yaşayan-kaya-bahçesi";color=palette.livingStone;}
        else if(geologyBand===0){biome="tuz-katedral-salonu";color=palette.salt;}
        else if(geologyBand===1){biome="obsidyen-oyukları";color=palette.obsidian;}
        else if(geologyBand===2){biome="kükürt-mineral-havzası";color=palette.sulfur;}
        else if(geologyBand===3){biome="gül-kristal-kayalığı";color=palette.roseCrystal;}
        else if(geologyBand===4){biome="mavi-taş-galerisi";color=palette.blueStone;}
        else if(geologyBand===5){biome="yosunlu-kaya-salonu";color=palette.mossStone;}
        else if(geologyBand===6){biome="kuvars-katedral-salonu";color=palette.quartz;}
        else if(geologyBand===7){biome="inci-mağara-gölü";color=palette.pearlGrotto;}
        else if(geologyBand===8){biome="beyaz-taş-vault";color=palette.whiteVault;}
        else if(geologyBand===9){biome="yeraltı-çiçek-vadisi";color=palette.flowerCave;}
        else if(geologyBand===10){biome="kehribar-kaya-terası";color=palette.amberCave;}
        else if(geologyBand===11){biome="azur-mineral-bahçesi";color=palette.azureGarden;}
        else if(geologyBand===12){biome="gümüş-mağara-sırtı";color=palette.silverCavern;}
        else if(geologyBand===13&&mineral>.62){biome="aeth-kristal-yatağı";color=palette.aethCrystal;}
        else if(geologyBand===14){biome="kireçtaşı-salonu";color=palette.limestone;}
        else{biome="derin-kaya-salonu";color=stone>.48?palette.rock:palette.darkRock;}
        const hasWater=river||lake||waterfall,environment={open:walkable?1:0,water:hasWater?1:0,mineral,fungus,height:clamp(height/8,0,1),arcana:mineral,moisture:water,magma};
        const atlas=atlasFields(seed,x,z,"underground",environment,{walkable,water:hasWater,ridge:tunnels,height});
        if(walkable&&atlas.folkStrength>.69&&!lava){
            if(atlas.folkKey==="zil-krat"&&mineral>.58){biome="zil-krat-ışıltılı-kristal-ekosistemi";color=mineral>.79?palette.prismatic:palette.crystalCave;}
            else if(atlas.folkKey==="neraeth-vaeluna"&&hasWater){biome="vaeluna-su-tüneli-ekosistemi";color=palette.pearlGrotto;}
            else if(atlas.folkKey==="gorum-maekhryth"&&mineral>.58){biome="gorum-canlı-mineral-bahçesi";color=palette.livingStone;}
            else if(atlas.folkKey==="zhar-kharzun"&&magma>.50){biome="zhar-sıcak-maden-salonu";color=palette.copper;}
            else if(atlas.folkKey==="rhyirun-kharun"&&hasWater){biome="rhyirun-yeraltı-su-kemeri";color=palette.azureGarden;}
            else if(atlas.folkKey==="kalyti-yhrae"&&openScore>.30){biome="kalyti-büyük-taş-salonu";color=palette.whiteVault;}
            else if(atlas.folkKey==="vekthar-numyr"&&openScore>.34){biome="vekthar-asılı-kaya-galerisi";color=palette.silverCavern;}
            else if(atlas.folkKey==="dray-zurkhaer"&&magma>.42){biome="dray-volkan-altı-mağarası";color=palette.amberCave;}
        }
        const goroumCrystalStrength=atlas.folkKey==="gorum-maekhryth"&&walkable?clamp((mineral-.78)*3.4,0,1)*clamp((fungus-.38)*1.5,0,1):0;
        const taxonomy=SURFACE_TAXONOMY?.classify?.(seed,x,z,{height,moisture:water,warmth:1-magma,arcana:mineral,ridge:tunnels,river:river?0:riverField,lagoon:0,...environment,...atlas,layerKey:"underground"})||null;
        const variant=biomeVariation(seed,mx,mz,"underground",biome,color);return{height,moisture:water,warmth:1-magma,arcana:mineral,ridge:tunnels,river:river?0:riverField,lagoon:0,...variant,...atlas,taxonomyCode:taxonomy?.code||"",taxonomyName:taxonomy?.name||"",taxonomyRegionKey:taxonomy?.regionKey||"",taxonomy,province,chambers,tunnels,fracture,waterField:water,mineral,fungus,magma,riverField,cascade,stone,oreSelector,fungusSelector,geology,geologyBand,rootField,prismField,livingStoneField,open:openScore,openMask,goroumCrystalStrength,walkable,water:hasWater,lake,lava,waterfall,layerKey:"underground"};
    };
    // PATCH89 · Kozmik Ada: Uçan Ada'dan belirgin biçimde daha seyrek,
    // daha büyük boşluklu ve farklı anomali temalarına sahip parçalı kümeler.
    const COSMIC_ARCHIPELAGO={cellSize:8_500_000,chance:.12,spreadMin:620_000,spreadMax:2_400_000,itemMin:2,itemMax:7,radiusMin:42_000,radiusMax:360_000,aspectMin:.28,aspectMax:2.15,themeCount:16,salt:191101};
    const COSMIC_SOLITARY={cellSize:4_200_000,chance:.014,spreadMin:90_000,spreadMax:310_000,itemMin:1,itemMax:2,radiusMin:18_000,radiusMax:120_000,aspectMin:.34,aspectMax:1.92,themeCount:16,salt:191201};
    const cosmicSample=(seed,x,z)=>{
        const mx=Number(x||0)/COSMIC_GEOGRAPHY_SCALE_M,mz=Number(z||0)/COSMIC_GEOGRAPHY_SCALE_M,s=seed+layerSalt("cosmic");
        const arch=archipelagoField(s,x,z,COSMIC_ARCHIPELAGO),solo=archipelagoField(s+211,x,z,COSMIC_SOLITARY),best=arch.field>=solo.field?arch:solo;
        const walkable=best.field>0,islandMask=best.field,cluster=best.cluster||0,theme=best.theme||0;
        const matter=fbm(s+101,mx*.000019,mz*.000019,6),rings=ridged(s+211,mx*.000037,mz*.000037,5),astral=fbm(s+307,(mx+430000)*.000009,(mz-350000)*.000009,5),garden=fbm(s+419,mx*.000029,mz*.000029,4),storm=ridged(s+523,(mx-280000)*.000008,(mz+190000)*.000008,5),aeth=ridged(s+631,mx*.000055,mz*.000055,4),ember=fbm(s+741,(mx+510000)*.000011,(mz+610000)*.000011,4);
        const starMistBank=clamp((astral-.64)*2.7,0,1)*(.55+.45*fbm(s+751,mx*.000021,mz*.000021,3));
        const height=(walkable?Math.max(.01,islandMask):-.05)*19+rings*(walkable?3.2:.5),sub=fbm(s+761,(mx+(theme+1)*91000)*.000031,(mz-(theme+1)*67000)*.000031,4);
        const nebula=fbm(s+771,(mx+710000)*.0000072,(mz-420000)*.0000072,5),voidGlass=ridged(s+781,mx*.000024,mz*.000024,4),starglass=fbm(s+791,(mx-880000)*.000010,(mz+510000)*.000010,4),quiet=fbm(s+801,(mx+390000)*.000006,(mz-760000)*.000006,4);
        let biome,color;
        if(!walkable){biome=starMistBank>.32?"yıldız-sisi":"kozmik-boşluk";color=starMistBank>.32?palette.starMist:palette.cosmicVoid;}
        else if((theme===4&&storm>.44)||storm>.84){biome="kozmik-fırtına";color=palette.cosmicStorm;}
        else if((theme===5&&ember>.44)||(ember>.80&&sub>.48)){biome="kor-çekirdek-adası";color=palette.cosmicEmber;}
        else if((theme===3&&aeth>.46)||aeth>.84){biome="camgöbeği-akım-adası";color=palette.cosmicAeth;}
        else if((theme===2&&rings>.44)||(rings>.81&&sub>.46)){biome="altın-halka-adası";color=sub>.55?palette.cosmicGold:palette.ringSurface;}
        else if((theme===1&&garden>.44)||(garden>.73&&astral>.48)){biome="astral-bahçe";color=palette.astralGarden;}
        else if(theme===6){biome=sub>.50?"mor-kristal-ada":"soluk-madde-adası";color=sub>.50?palette.cosmicMagenta:palette.cosmicPale;}
        else if(theme===7){biome=nebula>.52?"nebula-gül-bahçesi":"nebula-mavi-adası";color=nebula>.52?palette.nebulaRose:palette.nebulaBlue;}
        else if(theme===8){biome="boşluk-camı-adası";color=voidGlass>.52?palette.voidGlass:palette.cosmicCrystal;}
        else if(theme===9){biome="kozmik-yeşil-vaha";color=palette.cosmicGreen;}
        else if(theme===10){biome="yıldız-camı-ovası";color=palette.starGlass;}
        else if(theme===11){biome="gümüş-halka-bahçesi";color=palette.silverRing;}
        else if(theme===12){biome="prizmatik-yıldız-adası";color=palette.prismaticStar;}
        else if(theme===13){biome="sessiz-indigo-kütlesi";color=palette.indigoQuiet;}
        else if(theme===14){biome="turkuaz-kozmik-vaha";color=palette.cosmicTeal;}
        else if(theme===15){biome=sub>.52?"beyaz-altın-gözlemevi-adası":"gül-aurora-adası";color=sub>.52?palette.whiteGold:palette.cosmicRose;}
        else if(matter>.82){biome="kristal-yıldız-adası";color=palette.cosmicCrystal;}
        else{biome="yıldız-maddesi-adası";color=palette.starMatter;}
        const environment={island:walkable?1:0,open:walkable?1:0,astral,arcana:clamp(astral*.48+aeth*.42+matter*.10,0,1),storm,water:0,height:clamp((height+3)/18,0,1),moisture:garden,warmth:1-storm,archipelago:cluster,theme};
        const atlas=atlasFields(seed,x,z,"cosmic",environment,{walkable,water:false,ridge:rings,height});
        if(walkable&&atlas.folkStrength>.68){
            if(atlas.folkKey==="asteryn-veyrkha"){biome=starglass>.55?"asteryn-yıldız-camı-halka-kütlesi":"asteryn-kozmik-liman-adası";color=starglass>.55?palette.starGlass:palette.whiteGold;}
            else if(atlas.folkKey==="thalass-moryn"){biome="thalass-yüksek-gök-geçiş-adası";color=palette.cosmicAzure;}
            else if(atlas.folkKey==="thyra-vekuryn"&&storm>.42){biome="thyra-kozmik-fırtına-düğümü";color=palette.cosmicStorm;}
            else if(atlas.folkKey==="vekthar-numyr"){biome="vekthar-halka-mühendislik-kütlesi";color=palette.silverRing;}
            else if(atlas.folkKey==="kalyti-yhrae"){biome="kalyti-prizmatik-yapı-adası";color=palette.prismaticStar;}
            else if(atlas.folkKey==="dal-rhim"){biome="dal-rhim-gümüş-gece-halkası";color=palette.indigoQuiet;}
            else if(atlas.folkKey==="ory-kaen"){biome="ory-mor-altın-kozmik-bahçe";color=palette.cosmicRose;}
            else if(atlas.folkKey==="dray-zurkhaer"){biome="dray-kor-yıldız-kütlesi";color=palette.cosmicEmber;}
        }
        const taxonomy=SURFACE_TAXONOMY?.classify?.(seed,x,z,{height,moisture:garden,warmth:1-storm,arcana:environment.arcana,ridge:rings,river:0,lagoon:0,...environment,...atlas,islandGroupStrength:cluster,solitaryIslandStrength:solo.cluster||0,layerKey:"cosmic"})||null,variant=biomeVariation(seed,mx,mz,"cosmic",biome,color);
        return{height,moisture:garden,warmth:1-storm,arcana:environment.arcana,ridge:rings,river:0,lagoon:0,...variant,...atlas,taxonomyCode:taxonomy?.code||"",taxonomyName:taxonomy?.name||"",taxonomyRegionKey:taxonomy?.regionKey||"",taxonomy,matter,rings,astral,garden,storm,aeth,ember,nebula,voidGlass,starglass,quiet,starMistBank,islandMask,islandGroupStrength:cluster,solitaryIslandStrength:solo.cluster||0,cosmicTheme:theme,walkable,water:false,layerKey:"cosmic"};
    };
    const visualSampleAt=(seed,x,z,layerKey="surface",detailTier=null)=>{
        const layer=normalizedLayer(layerKey);
        if(layer==="surface")return surfaceFields(seed,x,z,detailTier);
        return layer==="sky"?skySample(seed,x,z):layer==="underground"?undergroundSample(seed,x,z):cosmicSample(seed,x,z);
    };
    const sampleAt=(seed,x,z,layerKey="surface")=>{
        const layer=normalizedLayer(layerKey);
        return layer==="sky"?skySample(seed,x,z):layer==="underground"?undergroundSample(seed,x,z):layer==="cosmic"?cosmicSample(seed,x,z):surfaceSample(seed,x,z);
    };
    const terrainHeight=(seed,x,z,layerKey="surface")=>sampleAt(seed,x,z,layerKey).height;
    const moistureAt=(seed,x,z,layerKey="surface")=>sampleAt(seed,x,z,layerKey).moisture;
    const colorFor=(height,moisture,slope,layerKey="surface",seed=1,x=0,z=0)=>sampleAt(seed,x,z,layerKey).color.map(v=>v/255);

    class ChunkGenerator{
        constructor({seed=1,chunkSize=28,resolution=14,layerKey="surface"}={}){
            this.seed=Number(seed)||1;this.chunkSize=chunkSize;this.resolution=resolution;this.layerKey=normalizedLayer(layerKey);this.archetypeName=archetypeName(this.seed);this.cache=new Map();this.cacheLimit=18;
        }
        setLayer(layerKey){const next=normalizedLayer(layerKey);if(next===this.layerKey)return;this.layerKey=next;this.clearCache();}
        key(cx,cz){return`${this.layerKey}:${cx}:${cz}`;}
        sampleAt(x,z){return sampleAt(this.seed,x,z,this.layerKey);}
        visualSampleAt(x,z,detailTier=null){return visualSampleAt(this.seed,x,z,this.layerKey,detailTier);}
        heightAt(x,z){return this.sampleAt(x,z).height;}
        isWalkableAt(x,z){return !!this.sampleAt(x,z).walkable;}
        biomeAt(x,z){return this.sampleAt(x,z).biome;}
        colorAt(x,z){return this.sampleAt(x,z).color;}
        generate(cx,cz){
            const key=this.key(cx,cz),cached=this.cache.get(key);if(cached){this.cache.delete(key);this.cache.set(key,cached);return cached;}
            const size=this.chunkSize,res=this.resolution,step=size/res,stride=res+1,paddedStride=res+3;
            const heights=new Float32Array(paddedStride*paddedStride);
            for(let iz=-1;iz<=res+1;iz++)for(let ix=-1;ix<=res+1;ix++){const wx=cx*size+ix*step,wz=cz*size+iz*step;heights[(iz+1)*paddedStride+(ix+1)]=this.heightAt(wx,wz);}
            const vertexCount=stride*stride,vertices=new Float32Array(vertexCount*3),normals=new Float32Array(vertexCount*3),colors=new Float32Array(vertexCount*3),indices=new Uint16Array(res*res*6);let vertexOffset=0;
            for(let iz=0;iz<=res;iz++)for(let ix=0;ix<=res;ix++){
                const p=(iz+1)*paddedStride+(ix+1),h=heights[p],left=heights[p-1],right=heights[p+1],up=heights[p-paddedStride],down=heights[p+paddedStride];let nx=left-right,ny=step*2,nz=up-down,len=Math.hypot(nx,ny,nz)||1;nx/=len;ny/=len;nz/=len;
                const wx=cx*size+ix*step,wz=cz*size+iz*step,sample=this.sampleAt(wx,wz),color=sample.color.map(v=>v/255);
                vertices[vertexOffset]=ix*step;vertices[vertexOffset+1]=h;vertices[vertexOffset+2]=iz*step;normals[vertexOffset]=nx;normals[vertexOffset+1]=ny;normals[vertexOffset+2]=nz;colors[vertexOffset]=color[0];colors[vertexOffset+1]=color[1];colors[vertexOffset+2]=color[2];vertexOffset+=3;
            }
            let indexOffset=0;for(let iz=0;iz<res;iz++)for(let ix=0;ix<res;ix++){const a=iz*stride+ix,b=a+1,c=a+stride,d=c+1;indices[indexOffset++]=a;indices[indexOffset++]=c;indices[indexOffset++]=b;indices[indexOffset++]=b;indices[indexOffset++]=c;indices[indexOffset++]=d;}
            const chunk={key,cx,cz,size,resolution:res,vertices,normals,colors,indices,layerKey:this.layerKey,archetype:archetypeName(this.seed)};this.cache.set(key,chunk);while(this.cache.size>this.cacheLimit)this.cache.delete(this.cache.keys().next().value);return chunk;
        }
        clearCache(){this.cache.clear();}
    }
    window.AlekrythaeWorldMap={...(window.AlekrythaeWorldMap||{}),ChunkGenerator,terrainHeight,moistureAt,colorFor,sampleAt,visualSampleAt,archetypeName,cultureFor,folkHabitats:FOLK_HABITATS,surfaceFolkStyles:FOLK_SURFACE_BIOME_STYLES,cartography:CARTOGRAPHY,profile:PROFILE,surfaceWaterCoverageTarget:TARGET_WATER_COVERAGE,surfaceAtlas:Object.freeze({continentSectorMeters:R111_CONTINENT_SECTOR_M,maxContinentDiameterMeters:CONTINENT_MAX_DIAMETER_M,continentContainmentRadiusMeters:CONTINENT_CONTAINMENT_RADIUS_M,continentForms:R111_CONTINENT_FORMS,targetLandCoverage:1-TARGET_WATER_COVERAGE,coordinateUnit:"meter",unbounded:true,revision:111})};
})();
