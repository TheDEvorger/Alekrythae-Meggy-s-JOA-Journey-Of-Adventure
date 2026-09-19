(function installAlekrythaeWorldLoreProfile(){
    "use strict";
    const profile={
        id:"alekrythae-24th-planet",
        version:16,
        displayName:"Yirmi Dört'ün Gezegeni",
        laws:{
            noDesert:true,
            noSwamp:true,
            surfaceWaterCoverage:.75,
            allSurfaceWaterFreshAndDrinkable:true,
            soilAndWaterDoNotBecomeMud:true,
            biomesAreNotBoundToLatitude:true,
            horizonAppearsNearlyFlatBecausePlanetaryScaleIsImmense:true,
            atmosphereIsMultiLayered:true,
            floatingIslandsAndStormRoutesAreCanonical:true,
            undergroundIsAContinuousShellEcology:true,
            pathogensDoNotGenerateAsEarthVirusesOrBacteria:true,
            harshestClimateRemainsMoreLivableThanEarthEquivalent:true,
            geographyCultureAndRepeatedLifePatternsCoShapeBiology:true,
            planetAwarenessIsPassiveDistributedAndNonDivine:true,
            blueCoreAndAethFlowAreEnvironmentalFoundations:true,
            landscapeBias:"beautiful-livable-varied-layered",
            localMapScale:"world-metric-unbounded-continuous-r111",
            hydrographyBias:"ocean-dominant-three-to-one-water-with-earthlike-basin-typology-rich-rivers-lakes-waterfalls-clear-reedlands-and-no-swamps",
            language:"Aꬲæŀɇꞎʏł’Qʏħʉŷɍɨř",
            generationContract:[
                "Okyanus, deniz, göl, nehir ve akarsular tatlı, temiz ve içilebilir sudur.",
                "Toplam yüzey suyunun küresel hedefi yaklaşık yüzde yetmiş beştir; okyanus, deniz, göl, nehir, akarsu ve şelale su yüzeyi bu toplamın içindedir. Sulak arazi kara biyomudur.",
                "Kalıcı çöl, bataklık, patojenik Dünya virüsü/bakterisi ve çamur biyomu üretilmez. Sulak bölgeler berrak su, sazlık, çiçekli su çayırı ve göl/delta ekosistemi olarak kalır.",
                "Biyomlar enleme kilitlenmez; coğrafya, kültür, tekrar eden yaşam ve A̤ɐ͜ɨǣ́ꞎ͡ƣ birlikte iz bırakır.",
                "Yerküre, Uçan Ada, Yeraltı ve Kozmik Ada aynı koordinatı paylaşabilir ama birbirinden bağımsız katmanlardır.",
                "Yerküre sonsuz ve deterministik üretilir; kamera için yapay dünya sınırı yoktur, pratik sınır yalnız makinenin ve sonlu sayıların kapasitesidir.",
                "Her yüzey kıtası, kendisine bağlı kara parçaları ve adacıklarıyla birlikte 240.000 kilometre çaplı tek bir çember içinde kalır.",
                "Kıyılar girintili, çıkıntılı ve çok ölçekli oluşur; iklim, topoğrafya ve halk coğrafyası arasında geniş yumuşak geçiş kuşakları bulunur.",
                "Yerel harita normal okunabilir coğrafya gösterir; gezegenin dev ölçeği kıyıyı veya ufku karikatürleştirmez.",
                "Dünya yalnız kıta-okyanus-dağ-nehir tipolojisi için referanstır; Ałek’ryŧhæ coğrafyası güzellik, ekolojik zenginlik ve fantastik oluşum bakımından daha üst düzeydir.",
                "Dev ağaçlar bazı bölgelerde orman elemanı değil coğrafi anıt ölçeğinde oluşur; kökleri yüzey, su ve Yeraltı katmanlarını bağlayabilir.",
                "24 halkın hiçbiri atlanmaz; her halk en az bir ana katmanda kanonik habitat üretim hakkına sahiptir."
            ]
        },

        biomeVariationEngine:{
            mode:"combinatorial-lore-biomes",
            axes:{
                landform:["teras","oyuk","sırt","havza","örgü","halka","yarık","vadi","plato","adacık","kıyı","bahçe"],
                flora:["çiçekli","yosunlu","kök-ağlı","meyveli","ışıltılı","ipeksi","kristal-yapraklı","sarmaşıklı","dev-yapraklı","su-çiçekli","sis-otlu","minik-dostlu"],
                water:["pınarlı","göllü","nehirli","şelaleli","lagünlü","kanallı","damarlı","kaynaklı","inci-sığlıklı","akıntılı","sis-sulu","tatlı-okyanuslu"],
                atmosphere:["mavi-aylı","gümüş-sisli","renkli-bulutlu","fırtına-yüklü","ışık-kırılmalı","yıldız-görülü","sakin","rüzgâr-örgülü","gök-cisimli","auralı","parıltılı","derin-gölgeli"],
                arcana:["düşük-rezonanslı","damar-rezonanslı","kristal-rezonanslı","çiçek-rezonanslı","su-rezonanslı","kök-rezonanslı","fırtına-rezonanslı","mühürlü","dalgalı","yüksek-rezonanslı","uyumlu","değişken"],
                light:["şafak","gün-ışığı","mavi-ay","alacakaranlık","gümüş","turkuaz","zümrüt","mor","kehribar","camgöbeği","yıldız","çok-katmanlı"]
            },
            theoreticalCombinations:2985984,
            rule:"Temel biyom, altı bağımsız lore ekseninin birleşimiyle çeşitlenir; çöl üretilmez."
        },

        // R5: kullanıcıya açık ayrı yükselti katmanı yoktur. Kartografya
        // yalnız üretimden gelen lore alanlarını ve çizgisiz SVG yüzeyini tanımlar.
        cartography:{
            version:"vector-lore-four-realms-v17-r111",
            style:"continuous-belt-production-lore-svg",
            rules:[
                "Su, kıyı, orman, dağ, bulut, ada, mağara ve kozmik yüzeyler yalnız üretimden gelen lore alan renklerini taşır.",
                "Kıyı, ada çeperi, fırtına rotası, mağara çeperi veya mineral damarı için eş-yükselti çizgi katmanı üretilmez.",
                "Dekoratif halk ve doğa motifleri üretilmez; kullanıcı boya katmanı harita görünümünden bağımsız kalır.",
                "Eski piyon koordinatları, yürünebilirlik, biyom ve su kararları görsel güncellemeden etkilenmez."
            ],
            inks:{
                water:"#66d9df",aeth:"#74e7ff",gold:"#d8b45c",moon:"#a9c9ff",forest:"#72b879",
                storm:"#9b8bd9",stone:"#a59b87",shadow:"#080b12",snow:"#e7f3ef"
            }
        },

        // 24 halkın yerleşim biçimi burada yalnız harita imzasına çevrilir.
        // affinity değerleri bir katmanda hangi çevrenin o halkın kanonik yaşam
        // alanına daha uygun olduğunu belirtir; nüfus veya siyasi sınır üretmez.
        folkHabitats:[
            {key:"haem-tyaern",name:"Ħǽɱ’Ŧʏǽɍŋ",romanized:"Hæm’Tyærn",motif:"citadel",color:"#d2b26d",settlement:.94,layers:{surface:1,sky:.12,underground:.22,cosmic:.18},affinity:{surface:{water:[0,.7],coast:[.55,.34],height:[.22,.28]},underground:{open:[1,.4]}}},
            {key:"dal-rhim",name:"Ḓɐꞎ’Ɍɨɱ",romanized:"Dal’Rhim",motif:"moon-spire",color:"#aab9e7",settlement:.98,layers:{surface:.72,sky:.04,underground:.16,cosmic:.30},affinity:{surface:{water:[0,.65],arcana:[.76,.48],warmth:[.30,.28],forest:[.42,.18]},cosmic:{arcana:[.82,.55],astral:[.68,.45]}}},
            {key:"ory-kaen",name:"Ɵɍʏ’Ƙǽŋ",romanized:"Ory’Kaen",motif:"arena-garden",color:"#a27bd2",settlement:.96,layers:{surface:.68,sky:.10,underground:.08,cosmic:.25},affinity:{surface:{water:[0,.65],arcana:[.84,.48],warmth:[.64,.25],forest:[.50,.18]},cosmic:{arcana:[.88,.55],island:[1,.22]}}},
            {key:"rhyirun-kharun",name:"Ɍʏɨɍʉŋ’Χɐɍűŋ",romanized:"Rhyirun’Kharûn",motif:"water-city",color:"#66dbe2",settlement:.72,layers:{surface:.96,sky:.02,underground:.38},affinity:{surface:{water:[1,1],coast:[1,.82],moisture:[1,.38]},underground:{water:[1,1],open:[1,.36]}}},
            {key:"thalass-moryn",name:"Þɐꞎɐśś’Ɱǿɍʏɴ",romanized:"Thalass’Møryŋ",motif:"whale-port",color:"#8ed5e6",settlement:.72,layers:{surface:.04,sky:1,underground:.01,cosmic:.35},affinity:{sky:{island:[1,.9],cloud:[.62,.55],arcana:[.66,.36],storm:[.35,.22]},cosmic:{island:[1,.65],astral:[.55,.28]}}},
            {key:"maerethi-solayn",name:"Ɱǽṙɇþɨ’Śɵꞎɐʏŋ",romanized:"Mæřethi’Solayn",motif:"coral-port",color:"#efb85e",settlement:.84,layers:{surface:.86,sky:.03,underground:.03},affinity:{surface:{water:[0,.4],coast:[1,1],warmth:[.92,.72],moisture:[.84,.42]}}},
            {key:"thir-nocht",name:"Þɨɍ’Ŋɵčŧ",romanized:"Thir’Nocht",motif:"hidden-manor",color:"#b84f70",settlement:.56,layers:{surface:.44,sky:.02,underground:.24},affinity:{surface:{water:[0,.55],forest:[.68,.46],arcana:[.72,.36],warmth:[.32,.28]},underground:{open:[1,.45],water:[0,.18]}}},
            {key:"dray-zurkhaer",name:"Ḓɍɐỿ’Žűɍχǽɍ",romanized:"Draƴ’Zûrkhaer",motif:"dragon-keep",color:"#e2bd59",settlement:.76,layers:{surface:.78,sky:.26,underground:.34,cosmic:.28},affinity:{surface:{water:[0,.7],height:[.90,.8],warmth:[.84,.48],arcana:[.68,.22]},sky:{island:[1,.65],height:[.82,.46]},underground:{mineral:[.9,.55],open:[1,.24]},cosmic:{island:[1,.48],storm:[.58,.24]}}},
            {key:"aeth-vaeryn",name:"Ǽþ’Ʋǽɍʏŋ",romanized:"Aeth’Vaeryn",motif:"tree-city",color:"#7bcf8d",settlement:.50,layers:{surface:.92,sky:.05,underground:.08},affinity:{surface:{water:[0,.45],forest:[1,1],moisture:[.82,.52],arcana:[.68,.34]}}},
            {key:"zhar-kharzun",name:"Ƶɐṙ’Χɐɍžűŋ",romanized:"Zhař’Kharzûn",motif:"forge-city",color:"#e77742",settlement:.84,layers:{surface:.56,sky:.06,underground:.90},affinity:{surface:{water:[0,.68],height:[.68,.6],warmth:[.88,.58]},underground:{mineral:[1,.9],open:[1,.48],fungus:[.28,.18]}}},
            {key:"au-ben",name:"Ɐʉ’Ƀɇŋ",romanized:"Au’Ben",motif:"market",color:"#d89d62",settlement:.82,layers:{surface:.68,sky:.16,underground:.12},affinity:{surface:{water:[0,.38],coast:[.78,.65],height:[.16,.25]},sky:{island:[1,.34]}}},
            {key:"zil-krat",name:"Žɨꞎ’Ƙɍɐŧ",romanized:"Zil’Krat",motif:"crystal-burrow",color:"#c68be1",settlement:.58,layers:{surface:.28,sky:.02,underground:.98},affinity:{surface:{height:[.72,.45],forest:[.70,.34]},underground:{mineral:[1,1],open:[1,.6],fungus:[.52,.18]}}},
            {key:"khaur-gath",name:"Χɐʉɍ’Ǥɐþ",romanized:"Khaur’Gath",motif:"canopy-camp",color:"#62b56d",settlement:.42,layers:{surface:.80,sky:.03,underground:.08},affinity:{surface:{water:[0,.58],forest:[1,1],moisture:[.76,.42],height:[.28,.22]}}},
            {key:"muo-nthir",name:"Ɱʉɵ’Ŋþɨɍ",romanized:"Muo’nthir",motif:"giant-hold",color:"#a9b06f",settlement:.44,layers:{surface:.76,sky:.02,underground:.12},affinity:{surface:{water:[0,.7],height:[.42,.62],forest:[.28,.3],moisture:[.55,.18]}}},
            {key:"iskael-vaeryth",name:"Ɨśƙǽɬ’Ʋǽɍʏþ",romanized:"Iskæł’Væryth",motif:"ice-palace",color:"#d8f1f2",settlement:.72,layers:{surface:.74,sky:.12,underground:.08},affinity:{surface:{water:[0,.45],warmth:[0,1],height:[.76,.68],moisture:[.62,.28]},sky:{storm:[.34,.22],height:[.72,.25]}}},
            {key:"kalyti-yhrae",name:"Ƙɐꞎʏŧɨ’Ƴħɍǽ",romanized:"Kalyti’yhrae",motif:"shape-workshop",color:"#cf8bdb",settlement:.78,layers:{surface:.58,sky:.34,underground:.30,cosmic:.32},affinity:{surface:{water:[0,.55],arcana:[.72,.6],height:[.50,.28]},sky:{island:[1,.55],arcana:[.75,.46]},underground:{open:[1,.45],mineral:[.62,.22]},cosmic:{arcana:[.8,.6],astral:[.72,.4]}}},
            {key:"thae-ryn",name:"Þǽ’Ɍʏŋ",romanized:"Thae’Ryn",motif:"flower-hollow",color:"#f3a7d2",settlement:.30,layers:{surface:.72,sky:.15,underground:.06},affinity:{surface:{water:[0,.34],forest:[.90,.72],moisture:[.94,.72],arcana:[.78,.46]},sky:{island:[1,.24],cloud:[.72,.2]}}},
            {key:"neraeth-vaeluna",name:"Ŋɇɍǽþ’Ʋǽꞎűŋɐ",romanized:"Neræth’Vaelûna",motif:"water-grotto",color:"#75c8c9",settlement:.24,layers:{surface:.56,sky:.01,underground:1},affinity:{surface:{water:[1,.82],coast:[1,.86],forest:[.58,.28]},underground:{water:[1,1],open:[1,.76],fungus:[.58,.2]}}},
            {key:"gorum-maekhryth",name:"Ǥɵɍűɱ’Ɱǽχɍʏþ",romanized:"Gorûm’Mækhryth",motif:"living-cavern",color:"#72dfc9",settlement:.28,layers:{surface:.08,sky:.01,underground:1},affinity:{underground:{open:[1,.8],mineral:[.88,.82],fungus:[.72,.5],water:[.35,.18]}}},
            {key:"vekthar-numyr",name:"Ʋɇƙþɐɍ’Ŋűɱʏɍ",romanized:"Vekthar’Nûmyr",motif:"suspended-city",color:"#7aa4d8",settlement:.92,layers:{surface:.30,sky:.94,underground:.34,cosmic:.48},affinity:{surface:{water:[0,.62],height:[.82,.62],arcana:[.62,.22]},sky:{island:[1,.88],height:[.82,.62],storm:[.42,.18]},underground:{open:[1,.58],mineral:[.58,.2]},cosmic:{island:[1,.82],astral:[.68,.36]}}},
            {key:"thyra-vekuryn",name:"Þʏɍɐ’Ʋɇƙűɍʏŋ",romanized:"Thyra’Vekûryn",motif:"storm-port",color:"#a38ee9",settlement:.48,layers:{surface:.18,sky:1,underground:.02,cosmic:.60},affinity:{surface:{height:[.72,.42],warmth:[.18,.34],arcana:[.74,.3]},sky:{storm:[1,1],cloud:[.72,.5],arcana:[.76,.56]},cosmic:{storm:[1,1],astral:[.72,.48],arcana:[.78,.4]}}},
            {key:"syl-nethroth",name:"Śʏꞎ’Ŋɇþɍǿþ",romanized:"Syl’Nethrøth",motif:"living-grove",color:"#7fce69",settlement:.52,layers:{surface:.86,sky:.03,underground:.12},affinity:{surface:{water:[0,.42],forest:[1,1],moisture:[.92,.78],warmth:[.62,.28]},underground:{open:[1,.25],fungus:[.7,.28]}}},
            {key:"asteryn-veyrkha",name:"Ɐśŧɇɍʏŋ’Ʋɇʏɍχɐ",romanized:"Asteryn’Veyrkha",motif:"ring-city",color:"#7798e7",settlement:.84,layers:{surface:.02,sky:.66,underground:.01,cosmic:1},affinity:{sky:{island:[1,.20],arcana:[1,1],height:[1,.90],astral:[1,1.40],storm:[.42,.16]},cosmic:{island:[1,.75],arcana:[1,1],astral:[1,1.5],storm:[.42,.16]}}},
            {key:"vhargaeth-run",name:"Ʋħɐṙǥǽþ’Ɍűŋ",romanized:"Vhařgæth’Rûn",motif:"border-tower",color:"#777fa6",settlement:.28,layers:{surface:.42,sky:.01,underground:.14},affinity:{surface:{water:[0,.6],forest:[.58,.58],height:[.30,.26],coast:[.30,.16]},underground:{open:[1,.28]}}}
        ],

        geographyDNA:{
            version:"lore-geography-dna-v1",
            axes:["macroTopology","relief","hydrology","climate","floraScale","mineralogy","aethDensity","atmosphere","rarePhenomenon","folkAffinity"],
            laws:[
                "Makro coğrafya önce kurulur; biyom rengi kıta veya ada geometrisini üretmez.",
                "Yakın LOD uzak LOD'un kimliğini değiştirmez; yalnız aynı bölgenin alt ayrıntılarını açar.",
                "Büyük bölgeler kendi içinde alt-vadi, göl, nehir, orman, kristal, sis ve yerleşim cepleri taşıyabilir.",
                "Fantastik oluşumlar konfeti gibi eşit dağılmaz; bazıları kıtasal, bazıları bölgesel, bazıları son derece nadirdir.",
                "Mimari uygunluk doğal coğrafyanın üstüne oturur; doğayı silmez."
            ],
            giantTreeClasses:["kadim-dev-ağaç-denizi","dünya-ağacı-vadisi","şelaleli-kök-katedrali","gümüş-taç-ormanı","turkuaz-özsu-koruluğu","altın-çiçekli-dev-ağaçlık","bulut-taçlı-ağaç-diyarı","yeraltına-inen-kök-labirenti"],
            rareWonders:["kilometrelik-doğal-taş-kemer","iç-içe-göl-halkaları","şelale-teras-ülkesi","kristal-kanyon","yüzeye-vuran-goroum-kristali","ay-gümüş-vadi","aurora-göl-havzası","dev-kök-köprüleri","prizmatik-kaya-sırtı","ışıklı-su-damarları"]
        },

        folkGeographyContract:[
            ["haem-tyaern","nehir-ovası","liman","verimli-vadi","göl-kıyısı"],
            ["dal-rhim","ay-gümüş-vadi","sisli-yüksek-kent","bordo-koruluk","gümüş-göl"],
            ["ory-kaen","mor-altın-bahçe","kül-yüksekova","koyu-mavi-kayalık","aeth-eşik"],
            ["rhyirun-kharun","tatlı-su-okyanusu","sualtı-kemerleri","ışıklı-yosun-denizi","akıntı-kenti"],
            ["thalass-moryn","uçan-diyar","bulut-yolu","gök-gölü","balina-geçidi"],
            ["maerethi-solayn","tropik-kıyı","mercan-limanı","meyve-koruluğu","sıcak-kaynak-terası"],
            ["thir-nocht","gece-mahallesi","sisli-vadi","eski-taş-yapı","gizli-mahzen"],
            ["dray-zurkhaer","yüksek-doruk","volkanik-sırt","sıcak-rüzgar-geçidi","maden-terası"],
            ["aeth-vaeryn","kadim-orman","berrak-göl","yaşayan-koruluk","dev-ağaç"],
            ["zhar-kharzun","kızıl-metal-vadi","döküm-sırtı","obsidyen-teras","sıcak-maden"],
            ["au-ben","liman-mahallesi","ticaret-boğazı","nehir-pazarı","ada-limanı"],
            ["zil-krat","kristal-mağara","ışıklı-mantar","maden-damarı","temiz-kapalı-ekosistem"],
            ["khaur-gath","büyük-av-ormanı","ağaç-ev-kuşağı","orman-çayırı","nehirli-kök-bölgesi"],
            ["muo-nthir","geniş-ova","dağ-eteği","hayvan-göç-yolu","büyük-köy-platoları"],
            ["iskael-vaeryth","kristal-kar-ovası","donmuş-göl","süt-mavisi-buz-mağarası","donmuş-şelale"],
            ["kalyti-yhrae","geçit-şehri","kristal-köprü","mimari-kaya-sahası","büyük-salon"],
            ["thae-ryn","çiçek-vadisi","yüksek-ağaç","su-kaynağı","saklı-kovuk"],
            ["neraeth-vaeluna","vaeluna-damarı","mağara-gölü","su-tüneli","şelale-arkası-geçit"],
            ["gorum-maekhryth","yenilenen-mağara","mineral-çiçeklenmesi","aeth-kristal-yatağı","canlı-kaya-bahçesi"],
            ["vekthar-numyr","asılı-kütle","hareketli-köprü","gök-limanı","ağır-yapı-tersanesi"],
            ["thyra-vekuryn","yıldırım-koridoru","fırtına-cebi","sis-geçidi","gök-pazarı"],
            ["syl-nethroth","kök-şehir","nektar-koruluğu","yosun-terası","ışıklı-mantar-alt-ormanı"],
            ["asteryn-veyrkha","halka-kent","yıldız-camı","kozmik-liman","aeth-akım-yolu"],
            ["vhargaeth-run","orman-kenarı","sınır-kasabası","terk-edilmiş-kule","gece-eşik-bölgesi"]
        ],

        layers:{
            surface:{
                key:"surface",
                label:"Yerküre",
                badge:"Yerküre · Tatlı su okyanusları · Yaşayan coğrafya",
                biomes:[
                    "tatlı-su-okyanusu","tatlı-su-denizi","inci-sığlık","mercan-kıyısı","akdenizî-yaşam-kuşağı",
                    "ay-gümüş-koruluğu","mor-kül-bahçesi","kadim-canlı-orman","kök-şehir-ormanı","çiçek-vadisi",
                    "tropik-meyve-kıyısı","berrak-sazlık-göl-ovası","su-çiçekli-çayır","dev-otlak","fırtına-yüksekliği","kızıl-metal-vadisi",
                    "ejder-volkan-sırtı","kristal-geçit","gümüş-dağ","buzul-kristal-vadi","gece-eşik-ormanı",
                    "göl-aynası","berrak-nehir","berrak-şelale","dev-ağaç-diyarı","dünya-ağacı-vadisi","aurora-göl-havzası","şelale-teras-ülkesi","mağara-girişi","derin-çöküntü"
                ]
            },
            sky:{
                key:"sky",
                label:"Uçan Ada",
                badge:"Uçan Ada · Bulut denizleri · Fırtına yolları",
                biomes:["açık-gök-boşluğu","bulut-denizi","uçan-çayır","gök-koruluğu","asılı-su-bahçesi","gök-gölü","gök-nehri","asılı-şelale","fırtına-adası","buzlu-gök-adası","kristal-gök-adası","çiçekli-gök-bahçesi","meyveli-gök-koruluğu","güneş-yüksekliği","dev-gök-ağacı","bulut-taçlı-kök-adası","yıldırım-hasat-adası","asılı-köprü-kütlesi","balina-yolu"]
            },
            underground:{
                key:"underground",
                label:"Yeraltı",
                badge:"Yeraltı · Kaya ve toprak tünelleri · Madenler · Nehirler · Işıklı mantarlar",
                biomes:["derin-kaya-tüneli","kil-havzası","kireçtaşı-odası","yeraltı-nehri","yeraltı-şelalesi","yeraltı-göleti","bakır-damarı","demir-damarı","altın-damarı","gümüş-damarı","ametist-damarı","zümrüt-damarı","safir-damarı","yeşil-ışıklı-mantar-ormanı","mor-ışıklı-mantar-ormanı","kehribar-ışıklı-mantar-ormanı","camgöbeği-ışıklı-mantar-ormanı","mineral-teras","kök-katedrali","inci-mağara-gölü","prizmatik-kristal-ormanı","yaşayan-kaya-bahçesi","aeth-kristal-yatağı","beyaz-taş-vault","yeraltı-çiçek-vadisi"]
            },
            cosmic:{
                key:"cosmic",
                label:"Kozmik Ada",
                badge:"Kozmik Ada · Yıldız maddesi · Astral bahçeler · Halka şehirler",
                biomes:["kozmik-boşluk","yıldız-sisi","yıldız-maddesi-adası","astral-bahçe","halka-yüzeyi","aeth-akıntısı","kozmik-fırtına","nebula-bahçesi","altın-halka-adası","mor-kristal-ada","camgöbeği-akım-adası","kor-çekirdek-adası","soluk-madde-adası","yıldız-camı-ovası","gümüş-halka-bahçesi","prizmatik-yıldız-adası","sessiz-indigo-kütlesi","turkuaz-kozmik-vaha","beyaz-altın-gözlemevi-adası"]
            }
        },
        archetypes:[
            "takımada-denizleri","iç-denizler","fiyort-kıyıları","göl-zincirleri","örgülü-kıtalar","yeşil-yarımadalar",
            "kristal-yüksekovalar","çiçek-vadileri","fırtına-kıyıları","tatlı-su-labirenti","dağ-bahçeleri","lagün-kuşakları"
        ]
    };
    window.AlekrythaeWorldLoreProfile=Object.freeze(profile);
})();
