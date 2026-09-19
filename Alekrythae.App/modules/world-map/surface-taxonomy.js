(function installSurfaceTaxonomy(){
    "use strict";

    // R49: The runtime axis order is intentionally preserved because the renderer
    // uses these numeric indexes for frost, water and vegetation decisions.
    const SURFACES=Object.freeze([
        "Açık Yüzeyler","Dalgalı Yüzeyler","Yüksek Yüzeyler","Dağ Kütleleri","Çöküntü ve Havzalar",
        "Yarık ve Vadi Sistemleri","Akan Su Sistemleri","Toplanan Su Sistemleri","Kıyı ve Ada Sistemleri","Anıtsal Yüzey Oluşumları"
    ]);
    const SPATIAL=Object.freeze([
        "Kesintisiz Yayılım","Şeritli Yayılım","Dallanan Yayılım","Ağsı Yayılım","Kümeli Yayılım",
        "Birbirine Geçen Mozaik","Halkalı Yayılım","Işınsal Yayılım","İç İçe Yerleşim","Kademeli Geçiş"
    ]);
    const COVER=Object.freeze([
        "İnce Yüzey Örtüsü","Çayır ve Çiçek Denizi","Çalılık ve Yoğun Alt Örtü","Sütunsu Canlı Örtü","Açık Taçlı Koruluk",
        "Birleşik Taç Ormanı","Çok Katlı Yaşam Ormanı","Anıtsal Canlı Örtü","Sarılıcı, Köklü ve Köprüleyen Örtü","Suya Bağlı Canlı Örtü"
    ]);
    const PROCESS=Object.freeze([
        "Sükûnet ve Denge","Berrak Akış ve Su Dolaşımı","Çiy, Nem ve Beslenim","Ilık Işınım ve Parlaklık","Canlı Soğuk ve Kristalleşme",
        "Rüzgâr ve Hava Dolaşımı","Gölge ve Alacakaranlık","Fırtına ve Elektrik","Rezonans ve Mineral","Döngüsel Dönüşüm"
    ]);
    const SIGNATURES=Object.freeze([
        {name:"Ħǽɱ’Ŧʏǽɍŋ",romanized:"Hæm’Tyærn",readerLabel:"İnsan",title:"Uyum ve Yaşanabilirlik",stem:"Uyum",hue:36,sat:.02,light:.01},
        {name:"Dal’Rhim",title:"Ay-Gölge Asaleti",stem:"Ay-Gölge",hue:238,sat:.05,light:-.02},
        {name:"Ory’Kaen",title:"Baskı ve Kara-Mavi Akış",stem:"Kara-Mor",hue:265,sat:.09,light:-.07},
        {name:"Rhyirun’Kharûn",title:"Akıntı Hafızası",stem:"Akıntı",hue:190,sat:.08,light:.03},
        {name:"Thalass’Møryŋ",title:"Gök Yolu ve Uzak Ufuk",stem:"Uzak-Ufuk",hue:205,sat:.04,light:.05},
        {name:"Mæřethi’Solayn",title:"Sıcaklık, Ritim ve Bolluk",stem:"Güneş-Ritim",hue:24,sat:.12,light:.04},
        {name:"Thir’Nocht",title:"Kızıl Gece ve Gizli Av",stem:"Kızıl-Gece",hue:345,sat:.12,light:-.06},
        {name:"Draƴ’Zûrkhaer",title:"Ejder Görkemi",stem:"Ejder",hue:46,sat:.12,light:.04},
        {name:"Aeth’Vaeryn",title:"Canlı Uyum ve Zarif Işık",stem:"Zarif-Işık",hue:142,sat:.08,light:.03},
        {name:"Zhař’Kharzûn",title:"Ocak, Metal ve İşlenebilir Kuvvet",stem:"Ocak",hue:19,sat:.08,light:-.01},
        {name:"Au’Ben",title:"Çeviklik, Oyun ve Seçenek",stem:"Oyun",hue:34,sat:.07,light:.02},
        {name:"Zil’Krat",title:"Kristal İncelik ve Hassas Düzen",stem:"Kristal",hue:280,sat:.08,light:.05},
        {name:"Khaur’Gath",title:"Zümrüt Kudret ve Koruma",stem:"Zümrüt",hue:132,sat:.12,light:-.01},
        {name:"Muo’nthir",title:"Büyük Ölçek ve Yeryüzü Hafızası",stem:"Yeryüzü",hue:92,sat:-.02,light:-.02},
        {name:"Iskæł’Væryth",title:"Beyaz Sükûnet ve Hassas Don",stem:"Beyaz",hue:207,sat:-.04,light:.12},
        {name:"Kalyti’yhrae",title:"Suret Akışı ve Yapısal Esneklik",stem:"Suret",hue:294,sat:.08,light:.03},
        {name:"Thae’Ryn",title:"Çiçek Işığı ve Küçük Canlılık",stem:"Çiçek-Işığı",hue:318,sat:.13,light:.07},
        {name:"Neræth’Vaelûna",title:"İnci Yelpazesi ve Akışkan Zarafet",stem:"İnci",hue:188,sat:.07,light:.07},
        {name:"Gorûm’Mækhryth",title:"Toprak Doğumu ve Yeni Yüzey",stem:"Toprak-Doğum",hue:28,sat:.04,light:.01},
        {name:"Vekthar’Nûmyr",title:"Kütle, Sürtünme ve Yön Alanı",stem:"Yön-Alanı",hue:214,sat:.03,light:-.02},
        {name:"Thyra’Vekûryn",title:"Fırtına Hasadı ve Canlı Elektrik",stem:"Fırtına",hue:258,sat:.13,light:.04},
        {name:"Syl’Nethrøth",title:"Canlı Kök ve Güneş Bahçesi",stem:"Canlı-Kök",hue:113,sat:.12,light:.04},
        {name:"Asteryn’Veyrkha",title:"Düşüş İzi ve Yıldız Maddesi",stem:"Yıldız-İzi",hue:225,sat:.09,light:.04},
        {name:"Vhařgæth’Rûn",title:"Gece Sürüsü ve Ay Yolları",stem:"Ay-Yolu",hue:250,sat:.08,light:-.06}
    ]);

    // 10 surface-form core titles. These are descriptive core labels only;
    // numeric Y indexes above remain backward-compatible with the renderer.
    const CORE_SURFACES=Object.freeze([
        {name:"Çiçek Ovası Havzaları",short:"Çiçek Ovası",description:"Geniş, açık, canlı ve çiçekli düzlükler; seyrek ağaç yerine sürekli yaşam dokusu taşır."},
        {name:"Dalgalı Yeşil Kuşaklar",short:"Dalgalı Yeşil Kuşak",description:"Yumuşak tepe-dip ritmi taşıyan, ağaç kümeleri ve çayırlarla örülü yeşil yüzeyler."},
        {name:"Yüksek Yayla ve Sırt Kuşakları",short:"Yüksek Yayla",description:"Yükselmiş düzlüklere, rüzgârlı sırtlara ve katmanlı yüksek yüzeylere sahip bölgeler."},
        {name:"Dağ Omurgaları ve Zirve Hatları",short:"Dağ Omurgası",description:"Katman katman yükselen kütleler, okunur sırtlar, yamaçlar, zirveler ve yüksek geçitler."},
        {name:"Derin Havza ve Çöküntü Alanları",short:"Derin Havza",description:"Çevre araziye göre aşağıda kalan geniş veya dar çöküntüler; nadir derin oyuklar burada yoğunlaşabilir."},
        {name:"Derin Vadi ve Yarma Hatları",short:"Yarma Vadisi",description:"Araziyi uzunlamasına yaran vadiler, boğazlar, uçurum eşikleri ve akış koridorları."},
        {name:"Nehir Damarları ve Şelale Ağları",short:"Şelale Damarı",description:"Dallanan akarsular, eğim kırımlarında çağlayanlar ve birbirine bağlanan berrak su yolları."},
        {name:"Göl Aynası ve Kaynak Havzaları",short:"Göl Aynası",description:"Durgun tatlı su yüzeyleri, kaynak çevreleri ve suya bağlı yoğun canlı kuşakları."},
        {name:"Kıyı Kemerleri ve Tatlı Su Ufukları",short:"Tatlı Su Kıyısı",description:"Tatlı su denizleri ve büyük göller çevresinde kıyı, ada, koy ve yeşil su-karasal geçişleri."},
        {name:"Anıtsal Taç, Taş ve Kök Alanları",short:"Anıtsal Taçlık",description:"Dev ağaçlar, büyük kök sistemleri, belirgin kaya kütleleri ve nadir anıtsal oluşumların baskın olduğu alanlar."}
    ]);

    // One representative M/C/E combination for each surface-form core.
    // Every Y-H core expands through all 10x10x10 M/C/E variants = 1,000 final biomes.
    const CORE_DEFAULTS=Object.freeze([
        {m:0,c:1,e:0}, // open / meadow / calm
        {m:9,c:4,e:5}, // stepped / grove / wind
        {m:9,c:3,e:5}, // stepped / columnar / wind
        {m:9,c:3,e:4}, // stepped / columnar / living cold
        {m:8,c:9,e:2}, // nested / water-bound / moisture
        {m:2,c:5,e:1}, // branching / canopy / clear flow
        {m:2,c:9,e:1}, // branching / water-bound / clear flow
        {m:8,c:9,e:0}, // nested / water-bound / calm
        {m:6,c:9,e:5}, // ringed / water-bound / wind
        {m:4,c:7,e:8}  // clustered / monumental / resonance
    ]);

    const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    const hash=(seed,x,z,salt=0)=>{
        let h=(Number(seed)||1)^Math.imul((x|0)+salt,374761393)^Math.imul((z|0)-salt,668265263);
        h=Math.imul(h^(h>>>13),1274126177);
        return((h^(h>>>16))>>>0)/4294967295;
    };
    const indexFrom=(value,count)=>clamp(Math.floor(clamp(Number(value)||0,0,.999999)*count),0,count-1);
    const code=(prefix,index)=>`${prefix}${String(index+1).padStart(2,"0")}`;
    const coreId=index=>`B${String(index+1).padStart(3,"0")}`;

    const CORES=Object.freeze(CORE_SURFACES.flatMap((terrain,yi)=>SIGNATURES.map((signature,hi)=>{
        const idx=yi*SIGNATURES.length+hi;
        const defaults=CORE_DEFAULTS[yi];
        const fullCode=`${code("Y",yi)}-${code("M",defaults.m)}-${code("C",defaults.c)}-${code("E",defaults.e)}-${code("H",hi)}`;
        const forestBase=[.62,.78,.70,.56,.66,.72,.76,.68,.60,.82][yi];
        const giantBase=[.02,.04,.05,.025,.025,.035,.03,.03,.025,.12][yi];
        const pitBase=[.004,.004,.006,.012,.04,.028,.004,.006,.006,.035][yi];
        const settlementBase=[.62,.46,.34,.16,.30,.22,.28,.24,.44,.12][yi];
        return Object.freeze({
            id:coreId(idx),
            coreCode:`${code("Y",yi)}-${code("H",hi)}`,
            representativeCode:fullCode,
            surfaceIndex:yi,
            signatureIndex:hi,
            surface:terrain,
            signature,
            name:`${signature.stem} ${terrain.short}`,
            description:`${terrain.description} ${signature.name} imzasında ${signature.title.toLocaleLowerCase("tr-TR")} görsel ve ekolojik dili öne çıkar.`,
            defaults:Object.freeze({spatialIndex:defaults.m,coverIndex:defaults.c,processIndex:defaults.e}),
            biases:Object.freeze({
                forestDensity:clamp(forestBase+(hi===21?.08:0)+(hi===8?.04:0),0,1),
                giantTree:clamp(giantBase+(hi===21?.06:0)+(hi===13?.02:0),0,.24),
                deepPit:clamp(pitBase+(hi===18?.012:0)+(hi===13?.008:0),0,.08),
                settlement:clamp(settlementBase+(hi===0?.12:0)+(hi===10?.06:0)-(hi===23?.08:0),0,1)
            })
        });
    })));
    const CORE_BY_ID=new Map(CORES.map(core=>[core.id,core]));

    function getCore(surfaceIndex,signatureIndex){
        const yi=clamp(Math.floor(Number(surfaceIndex)||0),0,CORE_SURFACES.length-1);
        const hi=clamp(Math.floor(Number(signatureIndex)||0),0,SIGNATURES.length-1);
        return CORES[yi*SIGNATURES.length+hi];
    }

    function classify(seed,x,z,fields={}){
        const h=Number(fields.height)||0,m=clamp(Number(fields.moisture)||0,0,1),t=clamp(Number(fields.warmth)||0,0,1),a=clamp(Number(fields.arcana)||0,0,1),ridge=clamp(Number(fields.ridge)||0,0,1),river=clamp(Number.isFinite(Number(fields.river))?Number(fields.river):1,0,1),lagoon=clamp(Number(fields.lagoon)||0,0,1);
        const regionScale=1_200_000;
        const rx=Math.floor(Number(x||0)/regionScale),rz=Math.floor(Number(z||0)/regionScale);
        const broad=hash(seed,rx,rz,1103),shape=hash(seed,rx,rz,2207),coverNoise=hash(seed,rx,rz,3313),processNoise=hash(seed,rx,rz,4421),signatureNoise=hash(seed,rx,rz,5531);

        let yi;
        const waterKind=String(fields.waterKind||""),anomalyKind=String(fields.anomalyKind||"");
        if(anomalyKind==="deep-pit"||anomalyKind==="cave-entrance")yi=4;
        else if(waterKind==="open-water")yi=8;
        else if(waterKind==="lake")yi=7;
        else if(waterKind==="river"||waterKind==="waterfall")yi=6;
        else if(h>10.5)yi=3;
        else if(h>6.2)yi=2;
        else if(h<1.2&&lagoon>.55)yi=8;
        else if(h<2.4&&m>.72)yi=7;
        else if(river<.075&&m>.45)yi=6;
        else if(ridge>.82&&h<5.8)yi=5;
        else if(broad<.10)yi=4;
        else if(broad>.91||a>.86)yi=9;
        else if(ridge>.58)yi=1;
        else yi=0;

        let mi;
        const geometry=(shape+ridge*.23+lagoon*.13)%1;
        if(river<.045)mi=2;
        else if(lagoon>.78)mi=6;
        else if(ridge>.83)mi=7;
        else mi=indexFrom(geometry,10);

        let ci;
        const fertility=clamp(m*.58+a*.24+(1-Math.abs(t-.56))*.18,0,1);
        if(yi===6||yi===7||yi===8)ci=9;
        else if(a>.86&&coverNoise>.58)ci=7;
        else if(ridge>.76&&coverNoise>.66)ci=8;
        else ci=indexFrom(clamp(fertility*.78+coverNoise*.22,0,1),10);

        let ei;
        if(river<.055||yi===6)ei=1;
        else if(t<.23)ei=4;
        else if(t>.76)ei=3;
        else if(m>.82)ei=2;
        else if(a>.84)ei=8;
        else ei=indexFrom(processNoise,10);

        // H ekseni rastgele bir imza değildir. Üretim çekirdeğinin aynı noktada
        // gerçekten seçtiği 24 halktan birinin folkIndex değerini taşır.
        const selectedFolkIndex=Number(fields.folkIndex);
        const hi=Number.isInteger(selectedFolkIndex)&&selectedFolkIndex>=0&&selectedFolkIndex<SIGNATURES.length?selectedFolkIndex:indexFrom((signatureNoise+a*.17+t*.07+m*.05)%1,24);
        const signature=SIGNATURES[hi];
        const core=getCore(yi,hi);
        const taxonomyCode=`${code("Y",yi)}-${code("M",mi)}-${code("C",ci)}-${code("E",ei)}-${code("H",hi)}`;
        return Object.freeze({
            code:taxonomyCode,
            coreId:core.id,
            coreCode:core.coreCode,
            coreName:core.name,
            core,
            surfaceIndex:yi,spatialIndex:mi,coverIndex:ci,processIndex:ei,signatureIndex:hi,
            surface:SURFACES[yi],spatial:SPATIAL[mi],cover:COVER[ci],process:PROCESS[ei],signature,
            name:`${core.name} · ${PROCESS[ei]} · ${COVER[ci]}`,
            regionKey:`${String(fields.layerKey||"surface")}:${rx}:${rz}:${taxonomyCode}`
        });
    }

    window.AlekrythaeSurfaceTaxonomy=Object.freeze({
        version:"production-ymceh-v4-macro-biome",
        total:10*10*10*10*24,
        coreCount:CORES.length,
        axes:Object.freeze({SURFACES,SPATIAL,COVER,PROCESS,SIGNATURES}),
        coreSurfaces:CORE_SURFACES,
        cores:CORES,
        getCore,
        getCoreById:id=>CORE_BY_ID.get(String(id||"").toUpperCase())||null,
        classify
    });
})();
