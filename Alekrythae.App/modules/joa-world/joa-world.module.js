(function registerJoAWorldModule(){
    "use strict";

    const app=window.Alekrythae;
    if(!app)return;
    const NS=window.AlekrythaeWorldMap||(window.AlekrythaeWorldMap={});
    const WORLD_LAYERS=Object.freeze(["surface","sky","underground","cosmic"]);
    const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
    const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
    const notice=(message,duration=4200)=>{try{window.Notice?.(message,duration);}catch(_){}};
    const formatDuration=seconds=>{
        const total=Math.max(0,Math.round(Number(seconds)||0));
        const days=Math.floor(total/86400),hours=Math.floor(total%86400/3600),minutes=Math.floor(total%3600/60),secs=total%60;
        if(days||hours)return[days?`${days} gün`:"",hours?`${hours} saat`:"",minutes?`${minutes} dk`:""].filter(Boolean).join(" ");
        if(minutes)return`${minutes} dk${secs?` ${secs} sn`:""}`;
        return`${Math.max(1,secs)} sn`;
    };
    const JOA_UNIT_DIAMETER_M=1;
    const JOA_GROUP_DIAMETER_M=3;
    const JOA_LOCATION_DIAMETER_M=5;
    const JOA_DEFAULT_SPEED_MPS=1.4;
    const JOA_DEFAULT_VISION_RADIUS_M=240;
    const JOA_READABLE_CAMERA_DISTANCE=640;
    const JOA_DEFAULT_METERS_PER_PIXEL=1;
    const JOA_SCALE_BAR_REFERENCE_PX=115;
    const JOA_LOCAL_INTERACTION_MAX_DISTANCE_M=24*1000;
    const JOA_MAP_IMAGE_MAX_M=Number.MAX_VALUE/64;
    const maxCameraDistanceForViewport=(width,height)=>{
        const w=Math.max(2,Number(width)||1920),h=Math.max(2,Number(height)||1080);
        // Kamera için ürün tavanı yoktur. Yalnız IEEE-754 işlemlerinin sonlu
        // kalmasını sağlayan, ekran boyutuna bağlı sayısal emniyet payı vardır.
        return Number.MAX_VALUE/(Math.max(w,h)*1024);
    };
    const localPointSafe=(x,z)=>Number.isFinite(Number(x))&&Number.isFinite(Number(z));
    NS.cosmicScale=Object.freeze({cameraMaxDistanceMeters:Number.MAX_VALUE,maxViewSpanMeters:Number.MAX_VALUE,maxScaleBarMeters:Number.MAX_VALUE,localInteractionMaxDistanceMeters:JOA_LOCAL_INTERACTION_MAX_DISTANCE_M,localCoordinateLimitMeters:Number.MAX_VALUE,isLocalPointSafe:localPointSafe,cameraDistanceForViewport:maxCameraDistanceForViewport,unbounded:true});
    // Kayıtları sessizce kırpmak mevcut çizimin eski kısımlarını yok ediyordu.
    // Yüksek güvenlik sınırına gelinirse var olan veri korunur ve yalnız yeni
    // damgalar durdurulur. Normal kullanımda bu sınıra ulaşılmaz.
    const JOA_PAINT_RECORD_LIMIT=240000;
    const JOA_PAINT_UNDO_LIMIT=24;
    const compactScaleNumber=value=>{const n=Math.max(0,Number(value)||0);if(n>=1e12){const exponent=Math.floor(Math.log10(n)),mantissa=Number((n/10**exponent).toPrecision(3)).toLocaleString("tr-TR");return`${mantissa} × 10^${exponent}`;}if(n>=1e9)return`${Number((n/1e9).toPrecision(3)).toLocaleString("tr-TR")} milyar`;if(n>=1e6)return`${Number((n/1e6).toPrecision(3)).toLocaleString("tr-TR")} milyon`;return Number(n.toPrecision(3)).toLocaleString("tr-TR");};
    const formatDistance=meters=>{const value=Math.max(0,Number(meters)||0);if(value>=1e9)return`${compactScaleNumber(value/1000)} kilometre`;return value>=1000?`${Number((value/1000).toFixed(value>=10000?1:2)).toLocaleString("tr-TR")} kilometre`:`${Math.round(value).toLocaleString("tr-TR")} metre`;};
    const travelSeconds=(distanceMeters,speedMps)=>Math.max(0,Number(distanceMeters)||0)/Math.max(.01,Number(speedMps)||JOA_DEFAULT_SPEED_MPS);

    const MAP_LAYER_GUIDES=Object.freeze({
        surface:{
            title:"Yerküre · Renk + Coğrafya Anahtarı",
            subtitle:"Su derinliği → ana kara/biyom → topoğrafya → yakın zoom oluşumları. Çukurlar ayrı siyah lekeler değil, zeminin renginden koyu kahveye ve derin merkezde siyaha yaklaşan tona iner.",
            sections:[
                {title:"SU VE KIYI",hint:"Tatlı/temiz su kanonu. Renk koyulaştıkça genel olarak daha açık deniz/derin su okunur.",entries:[
                    ["#031b3e","Derin su","Derin tatlı su okyanusu"],["#064b7b","Okyanus","Açık okyanus gövdesi"],["#087c9a","Deniz","Deniz ve kıta çevresi su"],["#42adb0","Sığlık","Kıyı, lagün ve sığ su"],["#368ba4","Özel akıntı","Kristal / A̤ɐ͜ɨǣ́ꞎ͡ƣ karakterli su"]
                ]},
                {title:"24 ANA HALK BİYOMU",hint:"Kara önce büyük halk-coğrafya eyaletlerine ayrılır. Ana gövdeler saf ve geniştir; yalnız sınırda iki komşu biyom arasında organik geçiş kuşağı oluşur.",entries:[
                    ["#5b8b4e","Hæm’Tyærn","Bereketli ova / yerleşim kuşağı"],["#464f5e","Dal’Rhim","Ay-gölge koruluğu"],["#604f69","Ory’Kaen","Kül-mor yaşam diyarı"],["#378470","Rhyirun","Akıntı kıyıları"],["#5b8077","Thalass","Gök-eşik yüksekliği"],["#529554","Mæřethi","Tropik meyve kuşağı"],["#44434d","Thir’Nocht","Gece-eşik toprakları"],["#744f37","Draƴ’Zûrkhaer","Termal sırtlar"],
                    ["#257746","Aeth’Vaeryn","Yaşayan orman"],["#7e4f37","Zhař’Kharzûn","Ocak-metal vadisi"],["#5c8250","Au’Ben","Avcı korulukları"],["#5b716d","Zil’Krat","Kristal-karst yüksekliği"],["#496a43","Khaur’Gath","Büyük av ormanı"],["#6c8469","Muo’nthir","Dev otlak-yüksekova"],["#789394","Iskæł’Væryth","Soğuk vadi kuşağı"],["#687c65","Kalyti’yhrae","Biçim bahçeleri"],
                    ["#659d5b","Thae’Ryn","Çiçek-hava vadileri"],["#4c848b","Neræth’Vaelûna","Rezonans havzaları"],["#4c5e45","Gorûm","Mineral-kök toprakları"],["#6c7566","Vekthar","Kütle-denge platosu"],["#4e6774","Thyra","Fırtına yüksekliği"],["#267745","Syl’Nethrøth","Kök-ağ ormanı"],["#5b6685","Asteryn","Yıldız-eşik yaylası"],["#3f4c4f","Vhařgæth","Dönüşüm-eşik ormanı"],
                    ["#7a8270","Geçiş kuşağı","Yalnız iki büyük ana biyomun sınırında yumuşak karışım"]
                ]},
                {title:"COĞRAFİ OLUŞUMLAR",hint:"Zoom yaklaştıkça aynı koordinatta bölgesel → yerel → mikro detay açılır.",entries:[
                    ["#625747","Havza","Mega / bölgesel çanak ve havza"],["#776f61","Sırt","Kıtasal ve bölgesel sırt omurgası"],["#453b32","Yar / Vadi","Ravine, yar ve keskin vadi"],["#6f756c","Kaya rafı","Taş çıkıntısı ve doğal raf"],["#9bbec0","Buzul çanağı","Soğuk lore coğrafyası"],["#6a4f43","Kaldera","Volkanik çökme ve krater ailesi"],["#4b9f91","Delta","Nehir ağzı ve kollanma"],["#176f8e","Fiyort","Kıyıya giren soğuk/yüksek su kolu"]
                ]},
                {title:"ÇUKUR DERİNLİĞİ",hint:"Çukur rengi kendi zemininden türetilir. Büyük ve derin çukurlarda kenar koyu kahve, merkez siyaha yakın sıcak koyu tona iner; saf siyah kullanılmaz.",entries:[
                    ["#5b402d","Çukur dudağı","Zemin rengi hâlâ baskın, hafif koyulaşma"],["#3e2b21","Çukur yamacı","Koyu toprak / kahve duvar"],["#281b16","Derin çukur","Derinlik arttıkça sıcak koyu kahve"],["#17110f","Çukur merkezi","Çok büyük/derin merkez, siyaha yakın ama siyah değil"],["#110d0c","Mağara ağzı","Gerçek mağara açıklığı; en koyu doğal ton"]
                ]}
            ],
            paint:[
                ["#4d3526","Ahşap"],["#7b7f82","Taş"],["#b79a69","Yol"],["#d9c58b","Duvar"],["#7a2630","Çatı"],["#2e7f4e","Bitki"],["#3b8fae","Su"],["#65d5e8","A̤ɐ͜ɨǣ́ꞎ͡ƣ"],["#e5bd52","Altın"],["#15191d","Gölge"]
            ]
        },
        sky:{
            title:"Uçan Ada · Renk + Coğrafya Anahtarı",
            subtitle:"Gök boşluğu ve bulut önce gelir; ada kütlesi, yükselti, gök suyu, hava/enerji ve lore bölgeleri bunun üstüne oturur.",
            sections:[
                {title:"GÖK VE BULUT",hint:"Boşluk ana zemin; bulutlar seyrek bankalar hâlinde oluşur.",entries:[
                    ["#07162b","Açık gök","Uçan diyarlar arasındaki büyük boşluk"],["#6e9fb5","Bulut denizi","Seyrek bulut bankaları"],["#91bdc9","Yoğun bulut","Yakın/yerel yoğun bulut kütlesi"]
                ]},
                {title:"UÇAN KÜTLE",hint:"Ada maskesi ve yükseklik üzerine iklim/lore cepleri gelir.",entries:[
                    ["#496f62","Ada toprağı","Temel uçan kara kütlesi"],["#71857c","Yüksek ada","Yüksek sırt ve taşlık"],["#17675d","Gök koruluğu","Orman / yoğun bitki"],["#aecbd5","Buzlu ada","Soğuk gök coğrafyası"],["#454d79","Fırtına adası","Fırtına ve yıldırım etkili alan"]
                ]},
                {title:"GÖK SUYU VE ENERJİ",hint:"Göller, nehirler ve şelaleler ada kütlesinin içinde gerçek su coğrafyasıdır.",entries:[
                    ["#288fb2","Gök gölü","Asılı ada üzerindeki göl"],["#37a6be","Nehir / Şelale","Gök nehri ve kenardan düşen su"],["#458f7e","Su bahçesi","Thalass / gök-su karakteri"],["#708fb7","Aurora","Yüksek katman / aurora alanı"],["#6899b0","Kristal","Kristal gök yapısı"],["#a69455","Güneş yüksekliği","Altın / sıcak yüksek bölge"]
                ]}
            ],
            paint:[
                ["#dcecf3","Bulut taşı"],["#7fb7cf","Bulut"],["#56aa79","Gök çayırı"],["#27806c","Gök ağacı"],["#576d97","Fırtına taşı"],["#72bec2","Işık yolu"],["#b28de8","Arcana"],["#e5bd52","Altın"],["#4d3526","Ahşap"],["#15191d","Gölge"]
            ]
        },
        underground:{
            title:"Yeraltı · Renk + Coğrafya Anahtarı",
            subtitle:"Kapalı kaya → açık mağara/tünel → jeolojik malzeme → su/ekoloji → mineral ve lore damarları sırasıyla okunur.",
            sections:[
                {title:"KAYA VE BOŞLUK",hint:"openMask mağara salonu ve tünelleri kapalı kaya kütlesinden ayırır.",entries:[
                    ["#100e12","Kapalı kaya","Oyuk dışı ana kaya kütlesi"],["#39312d","Mağara kayası","Açık tünel / salon zemini"],["#51483d","Kaya rölyefi","Yükselti ve iri kaya formu"],["#74462e","Kil","Kil havzası"],["#77705d","Kireçtaşı","Kireç odası / karst karakteri"]
                ]},
                {title:"SU VE YAŞAYAN YERALTI",hint:"Yeraltı suyu, mantar ve kök ekolojileri ayrı coğrafi katmanlardır.",entries:[
                    ["#0f5666","Yeraltı suyu","Nehir, gölet ve su galerisi"],["#245d48","Mantar ekolojisi","Canlı mantar kuşağı"],["#4d6b48","Kök katedrali","Kök ve yaşayan taş çevresi"],["#6c9ea1","İnci mağarası","Su / inci karakterli oyuk"]
                ]},
                {title:"DAMAR VE KRİSTAL",hint:"Mineral rengi yalnız uygun damar/mağara ekolojisinde görünür; A̤ɐ͜ɨǣ́ꞎ͡ƣ kristali Gorûm iziyle sınırlıdır.",entries:[
                    ["#8b4f34","Metal damarı","Bakır/demir/metal kuşağı"],["#5b477d","Değerli damar","Ametist ve değerli mineral"],["#3a97cd","Kristal mağara","Mavi kristal oluşumu"],["#bebcae","Tuz / açık mineral","Tuz ve açık mineral kuşağı"],["#231f26","Obsidyen","Koyu cam-kaya"],["#146a6b","Gorûm A̤ɐ͜ɨǣ́ꞎ͡ƣ izi","Kanonik Gorûm mağara dönüşümü"]
                ]}
            ],
            paint:[
                ["#52463a","Kaya"],["#815234","Kil"],["#79715e","Kireçtaşı"],["#185a65","Su"],["#b15b30","Bakır"],["#89503f","Demir"],["#d6a93a","Altın"],["#a683bd","Ametist"],["#2f9159","Zümrüt"],["#39a8ad","Işıklı mantar"]
            ]
        },
        cosmic:{
            title:"Kozmik Ada · Renk + Coğrafya Anahtarı",
            subtitle:"Kozmik boşluk ana zemin; yıldız sisi seyrek kalır. Ada maddesi, halka, bahçe, enerji/fırtına ve halk-lore katmanları üstüne gelir.",
            sections:[
                {title:"BOŞLUK VE SİS",hint:"Kozmik alanın çoğu boşluk olarak kalır; sis bütün ekranı doldurmaz.",entries:[
                    ["#030716","Kozmik boşluk","Ana karanlık uzamsal zemin"],["#1f2b5b","Yıldız sisi","Seyrek astral sis bankası"],["#2a4069","Boşluk camı","Koyu cam/uzamsal özel yapı"]
                ]},
                {title:"KOZMİK KÜTLE",hint:"islandMask yürünebilir yıldız-madde kütlesini belirler.",entries:[
                    ["#4f5b97","Yıldız maddesi","Temel kozmik ada"],["#4b8f85","Astral bahçe","Yaşayan kozmik bahçe"],["#707db0","Halka yüzeyi","Halka şehir / işlenmiş kütle"],["#6074b8","Kozmik kristal","Kristal yıldız maddesi"]
                ]},
                {title:"ENERJİ VE LORE",hint:"Astral, A̤ɐ͜ɨǣ́ꞎ͡ƣ, fırtına ve halk etkileri ada geometrisini renklendirir.",entries:[
                    ["#3bb9d0","Kozmik A̤ɐ͜ɨǣ́ꞎ͡ƣ","Enerji akıntısı"],["#5b3a8b","Kozmik fırtına","Fırtına düğümü"],["#804489","Nebula gülü","Nebula karakteri"],["#5080a8","Yıldız camı","Asteryn yıldız-camı"],["#8895b0","Gümüş halka","Vekthar / halka mühendisliği"],["#7e65b6","Prizmatik yapı","Kalyti kozmik yapı"],["#b4a574","Beyaz-altın","Asteryn gözlemevi / liman karakteri"]
                ]}
            ],
            paint:[
                ["#4f5b97","Yıldız maddesi"],["#4b8f85","Astral bahçe"],["#707db0","Halka yüzeyi"],["#3bb9d0","A̤ɐ͜ɨǣ́ꞎ͡ƣ"],["#5b3a8b","Kozmik fırtına"],["#e5bd52","Altın"],["#15191d","Gölge"]
            ]
        }
    });


    const PAINT_LAYER_NAMES=Object.freeze(["Çizim I","Çizim II","İşaretler"]);
    // Harita fırçaları belirli bir nesneyi hazır çizmez. Bunlar, her şeklin ve
    // dokunun türetilebildiği temel piksel uçlarıdır: sert, yumuşak, sprey,
    // tram, keski, hava, gren, tarama, kontur ve yerel bulanıklaştırma.
    const PAINT_BRUSHES=Object.freeze([
        {id:"pixel-hard",label:"Sert Kare",shape:"square",glyph:"■",hue:190,spacing:.30,opacity:1,size:1},
        {id:"pixel-round",label:"Sert Daire",shape:"circle",glyph:"●",hue:205,spacing:.30,opacity:1,size:1},
        {id:"pixel-diamond",label:"Sert Elmas",shape:"diamond",glyph:"◆",hue:222,spacing:.34,opacity:1,size:1},
        {id:"pixel-cross",label:"Artı Uç",shape:"cross",glyph:"✣",hue:238,spacing:.36,opacity:1,size:1},
        {id:"soft-round",label:"Yumuşak Daire",shape:"circle",glyph:"◉",hue:260,spacing:.22,opacity:.88,size:1.12,soft:.62},
        {id:"soft-square",label:"Yumuşak Kare",shape:"soft-square",glyph:"▣",hue:276,spacing:.24,opacity:.84,size:1.10,soft:.58},
        {id:"spray-fine",label:"İnce Sprey",shape:"spray",glyph:"⸬",hue:292,spacing:.20,opacity:.68,size:1.05,jitter:.62,density:18},
        {id:"spray-wide",label:"Geniş Sprey",shape:"spray",glyph:"⁙",hue:308,spacing:.28,opacity:.50,size:1.45,jitter:1,density:28},
        {id:"dither-light",label:"Seyrek Tram",shape:"dither",glyph:"░",hue:326,spacing:.30,opacity:.64,size:1,density:7},
        {id:"dither-dense",label:"Yoğun Tram",shape:"dither",glyph:"▒",hue:344,spacing:.24,opacity:.86,size:1.12,density:13},
        {id:"ridge",label:"Yatay Tarama",shape:"hatch",glyph:"≋",hue:18,spacing:.24,opacity:.92,size:1.18},
        {id:"rubble",label:"Kaba Serpinti",shape:"scatter",glyph:"⋰",hue:34,spacing:.34,opacity:.82,size:1.20,density:8},
        {id:"road",label:"İnce Keski",shape:"line-thin",glyph:"━",hue:48,spacing:.13,opacity:1,size:.72},
        {id:"wall",label:"Geniş Keski",shape:"line-wide",glyph:"▬",hue:62,spacing:.12,opacity:1,size:1.06},
        {id:"river",label:"Saydam Yıkama",shape:"circle",glyph:"◌",hue:82,spacing:.16,opacity:.34,size:1.42,soft:.72},
        {id:"shore",label:"Yumuşak Geniş",shape:"ellipse",glyph:"⬭",hue:104,spacing:.17,opacity:.64,size:1.58,soft:.46},
        {id:"forest",label:"İnce Gren",shape:"grain",glyph:"∷",hue:128,spacing:.30,opacity:.74,size:1.12,density:24},
        {id:"flower",label:"Dağınık Nokta",shape:"scatter",glyph:"✦",hue:150,spacing:.38,opacity:.88,size:.82,density:5},
        {id:"crystal",label:"Çapraz Tarama",shape:"hatch-cross",glyph:"╳",hue:170,spacing:.28,opacity:.90,size:1.16},
        {id:"glow",label:"Hava Fırçası",shape:"airbrush",glyph:"✺",hue:186,spacing:.18,opacity:.56,size:1.52,soft:.84},
        {id:"cloud",label:"Bulanıklaştır",shape:"blur",glyph:"◎",hue:214,spacing:.18,opacity:.92,size:1.38,effect:"blur",blur:.20},
        {id:"mist",label:"Çok Yumuşak",shape:"airbrush",glyph:"☁",hue:242,spacing:.15,opacity:.26,size:1.88,soft:.96},
        {id:"rune",label:"Kontur Ucu",shape:"outline",glyph:"◇",hue:272,spacing:.42,opacity:1,size:1},
        {id:"architecture",label:"Dolu Blok",shape:"block",glyph:"▰",hue:302,spacing:.09,opacity:1,size:1.35}
    ]);
    const brushById=id=>PAINT_BRUSHES.find(item=>item.id===id)||PAINT_BRUSHES[0];
    const ALEK_BRUSH_MOTIFS=Object.freeze([
        '<rect x="13" y="13" width="22" height="22" rx="2"/><rect x="18" y="18" width="12" height="12" rx="1"/>',
        '<circle cx="24" cy="24" r="12"/><circle cx="24" cy="24" r="5"/>',
        '<path d="M24 8 40 24 24 40 8 24Z"/><path d="M24 15 33 24 24 33 15 24Z"/>',
        '<path d="M21 8h6v13h13v6H27v13h-6V27H8v-6h13Z"/>',
        '<circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="3"/>',
        '<rect x="9" y="9" width="30" height="30" rx="5"/><rect x="15" y="15" width="18" height="18" rx="4"/>',
        '<circle cx="15" cy="16" r="2"/><circle cx="25" cy="12" r="1.6"/><circle cx="33" cy="19" r="2.2"/><circle cx="19" cy="27" r="1.8"/><circle cx="30" cy="32" r="2"/>',
        '<circle cx="12" cy="14" r="2"/><circle cx="21" cy="10" r="1.5"/><circle cx="31" cy="14" r="2"/><circle cx="37" cy="24" r="1.7"/><circle cx="29" cy="31" r="2.2"/><circle cx="17" cy="36" r="1.6"/><circle cx="11" cy="27" r="2"/>',
        '<path d="M11 13h5v5h-5zm10 0h5v5h-5zm10 0h5v5h-5zM16 23h5v5h-5zm10 0h5v5h-5zM11 33h5v5h-5zm10 0h5v5h-5zm10 0h5v5h-5z"/>',
        '<path d="M10 11h7v7h-7zm10 0h7v7h-7zm10 0h7v7h-7zM10 21h7v7h-7zm10 0h7v7h-7zm10 0h7v7h-7zM10 31h7v7h-7zm10 0h7v7h-7zm10 0h7v7h-7z"/>',
        '<path d="M9 14h30M9 22h30M9 30h30M9 38h30"/>',
        '<path d="m11 34 7-18 7 16 6-22 6 24"/>',
        '<path d="M8 24h32"/><path d="m31 17 9 7-9 7"/>',
        '<path d="M8 20h32M8 28h32"/><path d="m31 13 9 11-9 11"/>',
        '<circle cx="24" cy="24" r="14"/><path d="M12 24c6-7 18 7 24 0"/>',
        '<ellipse cx="24" cy="24" rx="17" ry="10"/><path d="M10 24h28"/>',
        '<path d="M12 12l24 24M20 10l18 18M10 20l18 18"/>',
        '<path d="M24 8v32M8 24h32M13 13l22 22M35 13 13 35"/>',
        '<path d="m24 8 4 11 12 5-12 5-4 11-4-11-12-5 12-5Z"/>',
        '<circle cx="24" cy="24" r="15"/><path d="M24 8v32M8 24h32"/>',
        '<circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="2"/>',
        '<path d="M9 29c5-10 10-10 15 0 5-10 10-10 15 0M12 34c4-6 8-6 12 0 4-6 8-6 12 0"/>',
        '<path d="M24 7 39 17v14L24 41 9 31V17Z"/><path d="M24 14v20M15 19l18 10M33 19 15 29"/>',
        '<path d="M10 10h12v12H10zm16 0h12v12H26zM10 26h12v12H10zm16 0h12v12H26z"/>'
    ]);
    const alekBrushSigilSvg=item=>{const index=Math.max(0,PAINT_BRUSHES.indexOf(item));return`<svg viewBox="0 0 48 48" aria-hidden="true"><g>${ALEK_BRUSH_MOTIFS[index]||ALEK_BRUSH_MOTIFS[0]}</g></svg>`;};
    const ALEK_TOOL_SIGILS=Object.freeze({
        brushes:'<svg viewBox="0 0 48 48"><path d="m24 6 5 13 13 5-13 5-5 13-5-13-13-5 13-5Z"/><circle cx="24" cy="24" r="5"/></svg>',
        paint:'<svg viewBox="0 0 48 48"><path d="M12 36c6-13 12-22 24-27l3 3C34 24 25 30 12 36Z"/><path d="M11 37c-3 2-3 5-4 7 3 0 7-1 8-4Z"/></svg>',
        eyedropper:'<svg viewBox="0 0 48 48"><path d="m31 8 9 9-8 8-3-3-14 14-5 2 2-5 14-14-3-3Z"/><path d="M13 35h9"/></svg>',
        erase:'<svg viewBox="0 0 48 48"><path d="m11 31 17-19 10 10-14 16H15Z"/><path d="M23 38h17"/></svg>',
        layers:'<svg viewBox="0 0 48 48"><path d="m24 7 18 9-18 9-18-9Z"/><path d="m8 24 16 8 16-8M8 32l16 8 16-8"/></svg>',
        gallery:'<svg viewBox="0 0 48 48"><path d="M8 11h32v26H8Z"/><circle cx="31" cy="19" r="4"/><path d="m11 34 9-10 6 6 5-5 7 9"/><path d="m5 15 3-4 4-3M43 15l-3-4-4-3M5 33l3 4 4 3M43 33l-3 4-4 3"/></svg>'
    });
    const alekToolSigil=id=>`<span class="joa-tool-sigil">${ALEK_TOOL_SIGILS[id]||ALEK_TOOL_SIGILS.brushes}</span>`;
    const clamp01=value=>clamp(Number(value)||0,0,1);
    const hslToHex=(h,s,l)=>{h=((Number(h)||0)%360+360)%360;s=clamp01((Number(s)||0)/100);l=clamp01((Number(l)||0)/100);const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return`#${[r,g,b].map(v=>Math.round((v+m)*255).toString(16).padStart(2,"0")).join("")}`;};
    const hexToRgb=value=>{const hex=String(value||"").replace("#","");if(!/^[0-9a-f]{6}$/i.test(hex))return[255,255,255];return[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16)];};

    class VectorDiscoveryRenderer{
        constructor(canvas,{seed=1,camera,onAfterRender,getDiscoveryRegions,layerKey="surface"}={}){
            this.canvas=canvas;
            this.vectorSvg=canvas.parentElement?.querySelector(".joa-vector-terrain")||null;
            if(!this.vectorSvg)throw new Error("JoA vektör harita yüzeyi açılamadı.");
            this.vectorClipId=`joa-vector-clip-${Math.random().toString(36).slice(2,9)}`;
            this.layerKey=WORLD_LAYERS.includes(String(layerKey))?String(layerKey):"surface";
            this.generator=new NS.ChunkGenerator({seed:Number(seed)||1,chunkSize:512,resolution:12,layerKey:this.layerKey});
            this.camera={targetX:0,targetZ:0,distance:JOA_READABLE_CAMERA_DISTANCE,...camera,yaw:0,pitch:90};
            this.localCamera={
                targetX:localPointSafe(this.camera.localTargetX,this.camera.localTargetZ)?Number(this.camera.localTargetX):(localPointSafe(this.camera.targetX,this.camera.targetZ)?Number(this.camera.targetX):0),
                targetZ:localPointSafe(this.camera.localTargetX,this.camera.localTargetZ)?Number(this.camera.localTargetZ):(localPointSafe(this.camera.targetX,this.camera.targetZ)?Number(this.camera.targetZ):0),
                distance:clamp(Number(this.camera.localDistance)||Math.min(Number(this.camera.distance)||JOA_READABLE_CAMERA_DISTANCE,JOA_LOCAL_INTERACTION_MAX_DISTANCE_M),.025,JOA_LOCAL_INTERACTION_MAX_DISTANCE_M)
            };
            this.onAfterRender=onAfterRender;
            this.getDiscoveryRegions=getDiscoveryRegions;
            this.mode="joa-vector-discovery";
            this.frame=0;
            this.needsFrame=true;
            this.disposed=false;
            this.interactiveUntil=0;
            this.refineTimer=0;
            this.terrainBuildHandle=0;
            this.terrainBuildKind="";
            this.terrainBuildToken=0;
            this.terrainBuildSignature="";
            this.sampleCache=new Map();
            this.visualSampleCache=new Map();
            this.terrainView=null;
            this.terrainWorldStep=0;
            this.terrainWorldBounds=null;
            this.paintView=null;
            this.imageView=null;
            this.resize();
            window.addEventListener("resize",this.onResize=()=>this.resize());
            window.addEventListener("alek:resource-state",this.onResource=event=>{if(event.detail?.active&&this.needsFrame)this.requestFrame();});
            if(!this.cameraSpanSafe())this.restoreLocalCamera({invalidate:false});
            this.syncLocalCameraMetadata();
            this.invalidate();
        }
        syncLocalCameraMetadata(){this.camera.localTargetX=this.localCamera.targetX;this.camera.localTargetZ=this.localCamera.targetZ;this.camera.localDistance=this.localCamera.distance;}
        localInteractionReady(){return Number(this.camera.distance)<=JOA_LOCAL_INTERACTION_MAX_DISTANCE_M&&localPointSafe(this.camera.targetX,this.camera.targetZ)&&this.cameraSpanSafe();}
        cameraSpanSafe(){const width=this.canvas?.clientWidth||1920,height=this.canvas?.clientHeight||1080,distance=Math.max(.025,Number(this.camera.distance)||JOA_READABLE_CAMERA_DISTANCE),scale=Math.min(width,height)*1.18/distance,halfW=width/Math.max(Number.MIN_VALUE,scale)/2,halfH=height/Math.max(Number.MIN_VALUE,scale)/2,x=Number(this.camera.targetX),z=Number(this.camera.targetZ);return Number.isFinite(x)&&Number.isFinite(z)&&Number.isFinite(distance)&&Number.isFinite(scale)&&scale>0&&Number.isFinite(halfW)&&Number.isFinite(halfH);}
        captureLocalCamera(force=false){if(!force&&!this.localInteractionReady())return false;if(!localPointSafe(this.camera.targetX,this.camera.targetZ))return false;this.localCamera={targetX:Number(this.camera.targetX),targetZ:Number(this.camera.targetZ),distance:clamp(Number(this.camera.distance)||JOA_READABLE_CAMERA_DISTANCE,.025,JOA_LOCAL_INTERACTION_MAX_DISTANCE_M)};this.syncLocalCameraMetadata();return true;}
        restoreLocalCamera({distance,invalidate=true}={}){const nextDistance=clamp(Number(distance)||Number(this.localCamera.distance)||JOA_READABLE_CAMERA_DISTANCE,.025,JOA_LOCAL_INTERACTION_MAX_DISTANCE_M);Object.assign(this.camera,{targetX:Number(this.localCamera.targetX)||0,targetZ:Number(this.localCamera.targetZ)||0,distance:nextDistance,yaw:0,pitch:90});this.captureLocalCamera(true);this.terrainView=null;this.terrainWorldBounds=null;this.terrainWorldStep=0;this.paintView=null;this.imageView=null;if(invalidate)this.invalidate();return true;}
        focusLocalPoint(x,z,distance){if(!localPointSafe(x,z))return false;Object.assign(this.camera,{targetX:Number(x),targetZ:Number(z),distance:clamp(Number(distance)||Number(this.localCamera.distance)||JOA_READABLE_CAMERA_DISTANCE,.025,JOA_LOCAL_INTERACTION_MAX_DISTANCE_M),yaw:0,pitch:90});this.captureLocalCamera(true);this.terrainView=null;this.terrainWorldBounds=null;this.terrainWorldStep=0;this.paintView=null;this.imageView=null;this.invalidate();return true;}
        adoptCamera(camera={}){Object.assign(this.camera,{...camera,yaw:0,pitch:90});this.camera.distance=clamp(Number(this.camera.distance)||JOA_READABLE_CAMERA_DISTANCE,.025,maxCameraDistanceForViewport(this.canvas?.clientWidth,this.canvas?.clientHeight));this.localCamera={targetX:localPointSafe(camera.localTargetX,camera.localTargetZ)?Number(camera.localTargetX):(localPointSafe(camera.targetX,camera.targetZ)?Number(camera.targetX):0),targetZ:localPointSafe(camera.localTargetX,camera.localTargetZ)?Number(camera.localTargetZ):(localPointSafe(camera.targetX,camera.targetZ)?Number(camera.targetZ):0),distance:clamp(Number(camera.localDistance)||Math.min(Number(camera.distance)||JOA_READABLE_CAMERA_DISTANCE,JOA_LOCAL_INTERACTION_MAX_DISTANCE_M),.025,JOA_LOCAL_INTERACTION_MAX_DISTANCE_M)};if(!Number.isFinite(Number(this.camera.targetX)))this.camera.targetX=Number(this.localCamera.targetX)||0;if(!Number.isFinite(Number(this.camera.targetZ)))this.camera.targetZ=Number(this.localCamera.targetZ)||0;if(!Number.isFinite(Number(this.camera.distance))||Number(this.camera.distance)<=0)this.camera.distance=JOA_READABLE_CAMERA_DISTANCE;this.syncLocalCameraMetadata();this.terrainView=null;this.terrainWorldBounds=null;this.terrainWorldStep=0;this.paintView=null;this.imageView=null;this.invalidate();}
        resize(){
            // Canvas yalnız işaretçi/klavye hit yüzeyidir; arazi SVG viewBox ile çizilir.
            const w=Math.max(2,Math.floor(this.canvas.clientWidth)),h=Math.max(2,Math.floor(this.canvas.clientHeight));
            if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
            this.invalidate();
        }
        viewport(){
            const width=this.canvas.clientWidth||1,height=this.canvas.clientHeight||1;
            let centerX=Number(this.camera.targetX),centerZ=Number(this.camera.targetZ);
            if(!Number.isFinite(centerX))centerX=Number(this.localCamera?.targetX)||0;
            if(!Number.isFinite(centerZ))centerZ=Number(this.localCamera?.targetZ)||0;
            const numericCeiling=Math.min(maxCameraDistanceForViewport(width,height),Number.MAX_VALUE/(Math.max(width,height,2)*64));
            let distance=clamp(Number(this.camera.distance)||JOA_READABLE_CAMERA_DISTANCE,.025,numericCeiling);
            let scale=Math.min(width,height)*1.18/distance;
            if(!Number.isFinite(scale)||scale<=0){distance=numericCeiling;scale=Math.min(width,height)*1.18/distance;}
            scale=Math.max(Number.MIN_VALUE,scale);
            let halfW=width/scale/2,halfH=height/scale/2;
            if(!Number.isFinite(halfW)||!Number.isFinite(halfH)){distance=Math.min(distance,Number.MAX_VALUE/(Math.max(width,height,2)*256));scale=Math.max(Number.MIN_VALUE,Math.min(width,height)*1.18/distance);halfW=width/scale/2;halfH=height/scale/2;}
            this.camera.targetX=centerX;this.camera.targetZ=centerZ;this.camera.distance=distance;
            return{width,height,scale,centerX,centerZ,halfW,halfH,minX:centerX-halfW,maxX:centerX+halfW,minZ:centerZ-halfH,maxZ:centerZ+halfH};
        }
        worldToScreen(view,x,z){return{x:(Number(x)-view.centerX)*view.scale+view.width/2,y:(Number(z)-view.centerZ)*view.scale+view.height/2};}
        screenToWorld(view,x,y){return{x:view.centerX+(Number(x)-view.width/2)/view.scale,z:view.centerZ+(Number(y)-view.height/2)/view.scale};}
        setLayer(layerKey){
            const next=WORLD_LAYERS.includes(String(layerKey))?String(layerKey):"surface";
            if(next===this.layerKey)return;
            this.layerKey=next;this.generator.setLayer?.(next);this.sampleCache.clear();this.visualSampleCache.clear();this.terrainView=null;this.terrainWorldBounds=null;this.terrainWorldStep=0;this.paintView=null;this.imageView=null;this.invalidate();
        }
        detailTierFor(view){
            const metersPerPixel=1/Math.max(Number.MIN_VALUE,view?.scale||1);
            if(metersPerPixel<=.85)return 0;
            if(metersPerPixel<=4)return 1;
            if(metersPerPixel<=24)return 2;
            if(metersPerPixel<=180)return 3;
            if(metersPerPixel<=1_800)return 4;
            if(metersPerPixel<=18_000)return 5;
            if(metersPerPixel<=180_000)return 6;
            if(metersPerPixel<=1_800_000)return 7;
            return 8;
        }
        markInteraction(){
            this.interactiveUntil=performance.now()+220;
            clearTimeout(this.refineTimer);
            // Tekerin her dişinde araziyi yeniden üretme. Etkileşim boyunca mevcut
            // SVG yalnız GPU matrisiyle taşınır; kullanıcı durduktan sonra tek bir
            // kaliteli dünya örneklemesi yapılır.
            this.refineTimer=setTimeout(()=>{if(this.disposed)return;this.interactiveUntil=0;this.invalidate();},180);
        }
        discoveryRegions(){
            const raw=typeof this.getDiscoveryRegions==="function"?this.getDiscoveryRegions():[];
            return(Array.isArray(raw)?raw:[]).filter(Boolean).map(point=>({x:Number(point.x)||0,z:Number(point.z)||0,r:Math.max(2,Number(point.r)||2)}));
        }
        loreLayerDefinitions(){
            const number=value=>Number.isFinite(Number(value))?Number(value):0;
            if(this.layerKey==="cosmic"){
                const mask=sample=>number(sample?.islandMask);
                return{
                    base:"cosmic-void",
                    paints:{"cosmic-void":{base:"#030716"},"star-mist":{base:"#1f2b5b"},"star-matter":{base:"#4f5b97"},"astral-garden":{base:"#4b8f85"},"ring-surface":{base:"#707db0"},"cosmic-aeth":{base:"#3bb9d0"},"cosmic-storm":{base:"#5b3a8b"},"cosmic-crystal":{base:"#6074b8"},"cosmic-ember":{base:"#8b4a5b"},"cosmic-pale":{base:"#97a4c4"},"nebula-rose":{base:"#804489"},"nebula-blue":{base:"#375d9d"},"cosmic-gold":{base:"#af8948"},"void-glass":{base:"#2a4069"},"cosmic-green":{base:"#3b8470"},"cosmic-magenta":{base:"#90457e"},"star-glass":{base:"#5080a8"},"silver-ring":{base:"#8895b0"},"prismatic-star":{base:"#7e65b6"},"indigo-quiet":{base:"#1f2d52"},"cosmic-teal2":{base:"#2e8e92"},"white-gold":{base:"#b4a574"},"cosmic-rose2":{base:"#9d588e"}},
                    layers:[
                        // PATCH89: yıldız sisi boşluğu tamamen boyamaz; seyrek bankalar halinde görünür.
                        {id:"star-mist",paint:"star-mist",maxTier:7,value:sample=>(number(sample?.starMistBank)-.26)*5,fillOpacity:.32},
                        {id:"star-matter",paint:"star-matter",maxTier:8,value:mask},
                        {id:"astral-garden",paint:"astral-garden",maxTier:8,value:sample=>Math.min(mask(sample),sample?.baseBiome==="astral-bahçe"?1:-1)},
                        {id:"ring-surface",paint:"ring-surface",maxTier:8,value:sample=>Math.min(mask(sample),/halka/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cosmic-aeth",paint:"cosmic-aeth",maxTier:8,value:sample=>Math.min(mask(sample),/aeth/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cosmic-storm",paint:"cosmic-storm",maxTier:8,value:sample=>Math.min(mask(sample),/fırtına/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cosmic-crystal",paint:"cosmic-crystal",maxTier:8,value:sample=>Math.min(mask(sample),/kristal/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cosmic-ember",paint:"cosmic-ember",maxTier:8,value:sample=>Math.min(mask(sample),/kor-çekirdek/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cosmic-pale",paint:"cosmic-pale",maxTier:8,value:sample=>Math.min(mask(sample),/soluk-madde/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"nebula-rose",paint:"nebula-rose",maxTier:8,value:sample=>Math.min(mask(sample),/nebula-gül/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"nebula-blue",paint:"nebula-blue",maxTier:8,value:sample=>Math.min(mask(sample),/nebula-mavi/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cosmic-gold",paint:"cosmic-gold",maxTier:8,value:sample=>Math.min(mask(sample),/altın-halka/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"void-glass",paint:"void-glass",maxTier:8,value:sample=>Math.min(mask(sample),/boşluk-camı/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cosmic-green",paint:"cosmic-green",maxTier:8,value:sample=>Math.min(mask(sample),/kozmik-yeşil/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cosmic-magenta",paint:"cosmic-magenta",maxTier:8,value:sample=>Math.min(mask(sample),/mor-kristal/.test(String(sample?.baseBiome||""))?1:-1)},
                        // PATCH93 · Asteryn kozmik katmanları tek mor palete düşmez.
                        {id:"star-glass",paint:"star-glass",maxTier:8,value:sample=>Math.min(mask(sample),/yıldız-camı/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"silver-ring",paint:"silver-ring",maxTier:8,value:sample=>Math.min(mask(sample),/gümüş-halka/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"prismatic-star",paint:"prismatic-star",maxTier:8,value:sample=>Math.min(mask(sample),/prizmatik-yıldız/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"indigo-quiet",paint:"indigo-quiet",maxTier:8,value:sample=>Math.min(mask(sample),/sessiz-indigo/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cosmic-teal2",paint:"cosmic-teal2",maxTier:8,value:sample=>Math.min(mask(sample),/turkuaz-kozmik/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"white-gold",paint:"white-gold",maxTier:8,value:sample=>Math.min(mask(sample),/beyaz-altın-gözlemevi/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cosmic-rose2",paint:"cosmic-rose2",maxTier:8,value:sample=>Math.min(mask(sample),/gül-aurora/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-asteryn-space",paint:"white-gold",maxTier:6,value:sample=>Math.min(mask(sample),/^asteryn-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-thalass-space",paint:"nebula-blue",maxTier:6,value:sample=>Math.min(mask(sample),/^thalass-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-thyra-space",paint:"cosmic-storm",maxTier:6,value:sample=>Math.min(mask(sample),/^thyra-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-vekthar-space",paint:"silver-ring",maxTier:6,value:sample=>Math.min(mask(sample),/^vekthar-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-kalyti-space",paint:"prismatic-star",maxTier:6,value:sample=>Math.min(mask(sample),/^kalyti-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-dal-space",paint:"indigo-quiet",maxTier:6,value:sample=>Math.min(mask(sample),/^dal-rhim-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-ory-space",paint:"cosmic-rose2",maxTier:6,value:sample=>Math.min(mask(sample),/^ory-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-dray-space",paint:"cosmic-ember",maxTier:6,value:sample=>Math.min(mask(sample),/^dray-/.test(String(sample?.baseBiome||""))?1:-1)}
                    ]
                };
            }
            if(this.layerKey==="sky"){
                const mask=sample=>number(sample?.islandMask);
                return{
                    base:"sky-void",
                    paints:{
                        "sky-void":{base:"#07162b"},"cloud-sea":{base:"#6e9fb5"},"dense-cloud":{base:"#91bdc9"},
                        "island-earth":{base:"#496f62"},"island-high":{base:"#71857c"},"sky-forest":{base:"#17675d"},
                        "storm-island":{base:"#454d79"},"light-garden":{base:"#3d9e9b"},"sky-frost":{base:"#aecbd5"},"sky-crystal":{base:"#6899b0"},"sky-sun":{base:"#a69455"},"sky-water-garden":{base:"#458f7e"},"sky-giant-tree":{base:"#2d8b57"},"sky-root":{base:"#428467"},"sky-pearl":{base:"#74b0ab"},"sky-aurora":{base:"#708fb7"},"sky-gold2":{base:"#ae9754"},"sky-violet":{base:"#775c9a"},"sky-teal":{base:"#3a949a"},"sky-white":{base:"#b1c9c7"},"sky-bridge":{base:"#747a79"},"sky-lake":{base:"#288fb2"},"sky-river":{base:"#37a6be"},"sky-flower":{base:"#90a668"},"sky-fruit":{base:"#4c9159"},"sky-mist":{base:"#688c99"},"sky-rock":{base:"#707572"},"astral-veil":{base:"#263d78"},"sky-fall":{base:"#54aebe"},"sky-thalass":{base:"#73aaa9"},"sky-asteryn":{base:"#748eb7"},"sky-kalyti":{base:"#719eae"},"sky-dray":{base:"#a18755"}
                    },
                    layers:[
                        // PATCH89: açık gök ana boşluktur. Bulutlar yalnız seyrek bankalar halinde görünür.
                        {id:"cloud-sea",paint:"cloud-sea",maxTier:7,value:sample=>(number(sample?.cloudBank)-.24)*5,fillOpacity:.24},
                        {id:"dense-cloud",paint:"dense-cloud",maxTier:3,value:sample=>(number(sample?.denseCloud)-.22)*6,fillOpacity:.34},
                        {id:"island-earth",paint:"island-earth",maxTier:8,value:mask},
                        {id:"island-high",paint:"island-high",maxTier:4,value:sample=>Math.min(mask(sample),(number(sample?.height)-5)/5)},
                        {id:"sky-forest",paint:"sky-forest",maxTier:8,value:sample=>Math.min(mask(sample),/koruluğu/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"storm-island",paint:"storm-island",maxTier:8,value:sample=>Math.min(mask(sample),/fırtına/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"light-garden",paint:"light-garden",maxTier:8,value:sample=>Math.min(mask(sample),/ışık-bahçesi/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-frost",paint:"sky-frost",maxTier:8,value:sample=>Math.min(mask(sample),/buzlu/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-crystal",paint:"sky-crystal",maxTier:8,value:sample=>Math.min(mask(sample),/kristal/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-sun",paint:"sky-sun",maxTier:8,value:sample=>Math.min(mask(sample),/güneş/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-water-garden",paint:"sky-water-garden",maxTier:8,value:sample=>Math.min(mask(sample),/asılı-su-bahçesi/.test(String(sample?.baseBiome||""))?1:-1)},
                        // PATCH93 · Thalass / Thyra / Vekthar gök diyarı aileleri.
                        {id:"sky-giant-tree",paint:"sky-giant-tree",maxTier:8,value:sample=>Math.min(mask(sample),/dev-gök-ağacı/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-root",paint:"sky-root",maxTier:8,value:sample=>Math.min(mask(sample),/bulut-taçlı-kök/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-pearl",paint:"sky-pearl",maxTier:8,value:sample=>Math.min(mask(sample),/inci-bulut/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-aurora",paint:"sky-aurora",maxTier:8,value:sample=>Math.min(mask(sample),/aurora-gök/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-white",paint:"sky-white",maxTier:8,value:sample=>Math.min(mask(sample),/gümüş-ışık/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-gold2",paint:"sky-gold2",maxTier:8,value:sample=>Math.min(mask(sample),/altın-güneş-adaları/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-violet",paint:"sky-violet",maxTier:8,value:sample=>Math.min(mask(sample),/menekşe-aeth/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-teal",paint:"sky-teal",maxTier:8,value:sample=>Math.min(mask(sample),/turkuaz-rüzgar/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-bridge",paint:"sky-bridge",maxTier:8,value:sample=>Math.min(mask(sample),/asılı-köprü-kütlesi/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-lightning",paint:"storm-island",maxTier:8,value:sample=>Math.min(mask(sample),/yıldırım-hasat/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-thalass",paint:"sky-thalass",maxTier:5,value:sample=>Math.min(mask(sample),/^thalass-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-vekthar",paint:"sky-bridge",maxTier:5,value:sample=>Math.min(mask(sample),/^vekthar-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-thyra",paint:"storm-island",maxTier:5,value:sample=>Math.min(mask(sample),/^thyra-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-asteryn",paint:"sky-asteryn",maxTier:5,value:sample=>Math.min(mask(sample),/^asteryn-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-kalyti",paint:"sky-kalyti",maxTier:5,value:sample=>Math.min(mask(sample),/^kalyti-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-dray",paint:"sky-dray",maxTier:5,value:sample=>Math.min(mask(sample),/^dray-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-lake",paint:"sky-lake",maxTier:5,value:sample=>Math.min(mask(sample),sample?.skyLake?1:-1)},
                        {id:"sky-river",paint:"sky-river",maxTier:4,value:sample=>Math.min(mask(sample),sample?.skyRiver?1:-1)},
                        {id:"sky-flower",paint:"sky-flower",maxTier:8,value:sample=>Math.min(mask(sample),/çiçekli/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-fruit",paint:"sky-fruit",maxTier:8,value:sample=>Math.min(mask(sample),/meyveli/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-mist",paint:"sky-mist",maxTier:8,value:sample=>Math.min(mask(sample),/sisli/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"sky-rock",paint:"sky-rock",maxTier:8,value:sample=>Math.min(mask(sample),/gümüş-gök/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"astral-veil",paint:"astral-veil",maxTier:3,value:sample=>Math.min(mask(sample),(number(sample?.astralStrength)-.38)*6),fillOpacity:.42},
                        {id:"sky-fall",paint:"sky-fall",maxTier:2,value:sample=>Math.min(mask(sample),(number(sample?.skyWaterfallStrength)-.20)*5),fillOpacity:.78}
                    ]
                };
            }
            if(this.layerKey==="underground"){
                const mask=sample=>number(sample?.openMask);
                return{
                    base:"cave-void",
                    paints:{
                        "cave-void":{base:"#100e12"},"cave-rock":{base:"#39312d"},"cave-relief":{base:"#51483d"},"cave-clay":{base:"#74462e"},
                        "cave-lime":{base:"#77705d"},"cave-water":{base:"#0f5666"},"cave-mineral":{base:"#5e594c"},"cave-metal":{base:"#8b4f34"},
                        "cave-precious":{base:"#5b477d"},"cave-fungus":{base:"#245d48"},"cave-lava":{base:"#76301e"},"cave-crystal":{base:"#3a97cd"},"cave-salt":{base:"#bebcae"},"cave-obsidian":{base:"#231f26"},"cave-sulfur":{base:"#877f39"},"cave-rose":{base:"#a95b7c"},"cave-blue":{base:"#3e5370"},"cave-moss":{base:"#415c44"},"cave-quartz":{base:"#acb7be"},"gorum-aeth":{base:"#146a6b"},"cave-root-cathedral":{base:"#4d6b48"},"cave-pearl":{base:"#6c9ea1"},"cave-prismatic":{base:"#7e67ab"},"cave-living-stone":{base:"#4a7e5b"},"cave-aeth-crystal":{base:"#34afb7"},"cave-white-vault":{base:"#b7bbb1"},"cave-flower":{base:"#748f61"},"cave-amber":{base:"#a17641"},"cave-azure":{base:"#377a90"},"cave-silver":{base:"#8b9797"}
                    },
                    layers:[
                        {id:"cave-rock",paint:"cave-rock",maxTier:8,value:mask},
                        {id:"cave-relief",paint:"cave-relief",maxTier:2,value:sample=>Math.min(mask(sample),(number(sample?.height)-3.5)/4)},
                        {id:"cave-clay",paint:"cave-clay",maxTier:8,value:sample=>sample?.baseBiome==="kil-havzası"?1:-1},
                        {id:"cave-lime",paint:"cave-lime",maxTier:8,value:sample=>/kireçtaşı/.test(String(sample?.baseBiome||""))?1:-1},
                        {id:"cave-salt",paint:"cave-salt",maxTier:8,value:sample=>/tuz-katedral/.test(String(sample?.baseBiome||""))?1:-1},
                        {id:"cave-obsidian",paint:"cave-obsidian",maxTier:8,value:sample=>/obsidyen/.test(String(sample?.baseBiome||""))?1:-1},
                        {id:"cave-sulfur",paint:"cave-sulfur",maxTier:8,value:sample=>/kükürt/.test(String(sample?.baseBiome||""))?1:-1},
                        {id:"cave-rose",paint:"cave-rose",maxTier:8,value:sample=>/gül-kristal/.test(String(sample?.baseBiome||""))?1:-1},
                        {id:"cave-blue",paint:"cave-blue",maxTier:8,value:sample=>/mavi-taş/.test(String(sample?.baseBiome||""))?1:-1},
                        {id:"cave-moss",paint:"cave-moss",maxTier:8,value:sample=>/yosunlu-kaya/.test(String(sample?.baseBiome||""))?1:-1},
                        {id:"cave-quartz",paint:"cave-quartz",maxTier:8,value:sample=>/kuvars-katedral/.test(String(sample?.baseBiome||""))?1:-1},
                        {id:"cave-mineral",paint:"cave-mineral",maxTier:2,value:sample=>Math.min(mask(sample),(number(sample?.mineral)-.72)*5)},
                        {id:"cave-metal",paint:"cave-metal",maxTier:8,value:sample=>Math.min(mask(sample),/bakır|demir|altın|gümüş/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cave-precious",paint:"cave-precious",maxTier:8,value:sample=>Math.min(mask(sample),/ametist|zümrüt|safir/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cave-fungus",paint:"cave-fungus",maxTier:2,value:sample=>Math.min(mask(sample),(number(sample?.fungus)-.80)*6)},
                        {id:"cave-water",paint:"cave-water",maxTier:5,value:sample=>Math.min(mask(sample),sample?.water?1:-1)},
                        {id:"cave-lava",paint:"cave-lava",maxTier:5,value:sample=>Math.min(mask(sample),sample?.lava?1:-1)},
                        {id:"cave-crystal",paint:"cave-crystal",maxTier:8,value:sample=>Math.min(mask(sample),/kristal/.test(String(sample?.baseBiome||""))?1:-1)},
                        // PATCH93 · Yeraltı artık tek taş paleti değil; Gorûm, Zil'Krat ve Neræth ekolojileri makro LOD'da da okunur.
                        {id:"cave-root-cathedral",paint:"cave-root-cathedral",maxTier:8,value:sample=>Math.min(mask(sample),/kök-katedrali/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cave-pearl",paint:"cave-pearl",maxTier:8,value:sample=>Math.min(mask(sample),/inci-mağara/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cave-prismatic",paint:"cave-prismatic",maxTier:8,value:sample=>Math.min(mask(sample),/prizmatik-kristal/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cave-living-stone",paint:"cave-living-stone",maxTier:8,value:sample=>Math.min(mask(sample),/yaşayan-kaya/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cave-aeth-crystal",paint:"cave-aeth-crystal",maxTier:8,value:sample=>Math.min(mask(sample),/aeth-kristal/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cave-white-vault",paint:"cave-white-vault",maxTier:8,value:sample=>Math.min(mask(sample),/beyaz-taş-vault/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cave-flower",paint:"cave-flower",maxTier:8,value:sample=>Math.min(mask(sample),/yeraltı-çiçek-vadisi/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cave-amber",paint:"cave-amber",maxTier:8,value:sample=>Math.min(mask(sample),/kehribar-kaya/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cave-azure",paint:"cave-azure",maxTier:8,value:sample=>Math.min(mask(sample),/azur-mineral/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"cave-silver",paint:"cave-silver",maxTier:8,value:sample=>Math.min(mask(sample),/gümüş-mağara/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-zil",paint:"cave-prismatic",maxTier:5,value:sample=>Math.min(mask(sample),/^zil-krat-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-neraeth",paint:"cave-pearl",maxTier:5,value:sample=>Math.min(mask(sample),/^vaeluna-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-gorum",paint:"cave-living-stone",maxTier:5,value:sample=>Math.min(mask(sample),/^gorum-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-zhar",paint:"cave-metal",maxTier:5,value:sample=>Math.min(mask(sample),/^zhar-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-rhyirun-cave",paint:"cave-azure",maxTier:5,value:sample=>Math.min(mask(sample),/^rhyirun-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-kalyti-cave",paint:"cave-white-vault",maxTier:5,value:sample=>Math.min(mask(sample),/^kalyti-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-vekthar-cave",paint:"cave-silver",maxTier:5,value:sample=>Math.min(mask(sample),/^vekthar-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"folk-dray-cave",paint:"cave-amber",maxTier:5,value:sample=>Math.min(mask(sample),/^dray-/.test(String(sample?.baseBiome||""))?1:-1)},
                        {id:"gorum-aeth",paint:"gorum-aeth",maxTier:1,value:sample=>(number(sample?.goroumCrystalStrength)-.12)*5,fillOpacity:.72}
                    ]
                };
            }
            const folkStyles=Array.isArray(NS.surfaceFolkStyles)?NS.surfaceFolkStyles:[];
            const folkPaints=Object.fromEntries(folkStyles.map((style,index)=>{
                const color=Array.isArray(style?.color)?style.color:[72,112,82],hex=`#${color.slice(0,3).map(value=>clamp(Math.round(Number(value)||0),0,255).toString(16).padStart(2,"0")).join("")}`;
                return[`realm-${String(style?.key||index)}`,{base:hex,texture:"realm"}];
            }));
            const influenceWeight=(sample,field,key)=>number((Array.isArray(sample?.[field])?sample[field]:[]).find(item=>String(item?.key)===String(key))?.weight);
            // R110 · Diyar/iklim/topografya artık tek kazananlı hücreler değildir.
            // İki düşük opaklıklı eşik, komşu alanları geniş geçiş kuşaklarında
            // üst üste bindirir; keskin pasta dilimi ve baklava sınırları kaybolur.
            const folkLayers=folkStyles.flatMap((style,index)=>{
                const key=String(style?.key||index),paint=`realm-${key}`,weight=sample=>influenceWeight(sample?.folkBiome||{},"influences",key);
                return[
                    {id:`${paint}-belt`,paint,maxTier:8,influenceGroup:"folk",influenceKey:key,value:sample=>Math.min(number(sample?.landSignal)*24,weight(sample)-.075),fillOpacity:.28},
                    {id:`${paint}-body`,paint,maxTier:8,influenceGroup:"folk",influenceKey:key,value:sample=>Math.min(number(sample?.landSignal)*24,weight(sample)-.285),fillOpacity:.42}
                ];
            });
            const oceanLayers=["water-ocean","water-moon","water-aeth","water-moss"].flatMap((paint,index)=>[
                {id:`ocean-atlas-${index+1}-belt`,paint,maxTier:8,influenceGroup:"ocean",influenceKey:String(index),value:sample=>Math.min(-number(sample?.landSignal)*24,number((sample?.oceanAtlasInfluences||[]).find(item=>Number(item?.index)===index)?.weight)-.10),fillOpacity:.18},
                {id:`ocean-atlas-${index+1}-body`,paint,maxTier:8,influenceGroup:"ocean",influenceKey:String(index),value:sample=>Math.min(-number(sample?.landSignal)*24,number((sample?.oceanAtlasInfluences||[]).find(item=>Number(item?.index)===index)?.weight)-.38),fillOpacity:.22}
            ]);
            const climatePaints={temperate:"land-living",ice:"biome-ice",tropical:"biome-tropical",forest:"forest-living",mediterranean:"biome-med",arcane:"biome-arcane",storm:"biome-storm",floral:"biome-floral",volcanic:"biome-volcanic"};
            const climateLayers=Object.entries(climatePaints).flatMap(([key,paint])=>[
                {id:`climate-${key}-belt`,paint,maxTier:8,influenceGroup:"climate",influenceKey:key,value:sample=>Math.min(number(sample?.landSignal)*24,influenceWeight(sample,"climateInfluences",key)-.09),fillOpacity:.10},
                {id:`climate-${key}-core`,paint,maxTier:8,influenceGroup:"climate",influenceKey:key,value:sample=>Math.min(number(sample?.landSignal)*24,influenceWeight(sample,"climateInfluences",key)-.34),fillOpacity:.15}
            ]);
            const topographyPaints={
                upland:["atlas-upland-shadow","atlas-upland-face"],mountain:["atlas-mountain-shadow","atlas-mountain-face"],snow:["atlas-snow-shadow","atlas-snow-face"],
                basin:["atlas-basin-shadow","atlas-basin-face"],ridge:["atlas-ridge-shadow","atlas-ridge-face"]
            };
            const topographyLayers=Object.entries(topographyPaints).flatMap(([key,paints])=>{
                // Atlas topografyası bir yol şeridi gibi tek renkli boru değildir.
                // Doğrudan sürekli fizik alanlarını kullan; kar yalnız gerçekten
                // soğuk/yüksek kesimde, sırt ise dağ kütlesinin içinde görünür.
                const signal=sample=>{
                    const influence=influenceWeight(sample,"topographyInfluences",key);
                    const broad=number(sample?.atlasReliefTexture),broken=number(sample?.atlasReliefBreakup);
                    if(key==="mountain")return Math.max(influence*.46,number(sample?.atlasMountainStrength)*(.16+broken*.98));
                    if(key==="ridge")return Math.max(influence*.42,Math.min(number(sample?.atlasRidgeStrength),number(sample?.atlasMountainStrength)*1.16)*(.14+broad*1.02));
                    if(key==="snow"){
                        const coldHigh=clamp((.43-number(sample?.atlasWarmth))*2.8+(number(sample?.atlasReliefHeight)-19)/13,0,1);
                        return Math.min(influence,number(sample?.atlasMountainStrength))*coldHigh*(.12+broken*1.04);
                    }
                    if(key==="basin")return Math.max(influence*.56,number(sample?.atlasBasinStrength)*(.38+(1-broad)*.72));
                    return Math.max(influence*.54,number(sample?.atlasUplandStrength)*(.34+broad*.62));
                };
                const thresholds={upland:[.19,.43],mountain:[.22,.54],snow:[.28,.61],basin:[.20,.46],ridge:[.24,.56]}[key];
                const opacities={upland:[.055,.12],mountain:[.055,.17],snow:[.045,.16],basin:[.05,.12],ridge:[.05,.15]}[key];
                return[
                    {id:`topography-${key}-belt`,paint:paints[0],maxTier:8,influenceGroup:"topography",influenceKey:key,value:sample=>Math.min(number(sample?.landSignal)*24,signal(sample)-thresholds[0]),fillOpacity:opacities[0]},
                    {id:`topography-${key}-core`,paint:paints[1],maxTier:8,influenceGroup:"topography",influenceKey:key,value:sample=>Math.min(number(sample?.landSignal)*24,signal(sample)-thresholds[1]),fillOpacity:opacities[1]}
                ];
            });
            return{
                base:"water-deep",
                paints:{
                    "water-deep":{base:"#031b3e"},"water-ocean":{base:"#064b7b"},"water-sea":{base:"#087c9a"},"water-shallow":{base:"#42adb0"},"water-moon":{base:"#2b537b"},"water-aeth":{base:"#1f7c9b"},"water-moss":{base:"#186967"},"water-crystal":{base:"#368ba4"},"water-pearl":{base:"#4fa5a6"},"water-aurora":{base:"#447897"},
                    "land-living":{base:"#477b53"},"shore-living":{base:"#779a69"},"forest-living":{base:"#145a40"},"flower-aeth":{base:"#648f5f"},
                    "biome-ice":{base:"#bfd5d2"},"biome-tropical":{base:"#3b8c57"},"biome-clearwater":{base:"#4a976f"},"biome-arcane":{base:"#5b547f"},
                    "biome-volcanic":{base:"#604b45"},"biome-storm":{base:"#526a76"},"biome-floral":{base:"#718f60"},"biome-sun":{base:"#89804f"},
                    "biome-moon":{base:"#49526b"},"biome-ory":{base:"#5b4770"},"biome-med":{base:"#6c8f52"},"biome-giant":{base:"#70894d"},"biome-root":{base:"#247743"},"biome-forge":{base:"#7e4a36"},"biome-dragon":{base:"#704e37"},"biome-crystal2":{base:"#4a838e"},"biome-twilight":{base:"#3d4b58"},
                    "biome-tree":{base:"#1c7d46"},"biome-worldtree":{base:"#2e8f4e"},"biome-waterfall":{base:"#468f87"},"biome-aurora":{base:"#4d8993"},"biome-pearl":{base:"#5ca6a0"},"biome-emerald":{base:"#348e50"},"biome-sungold":{base:"#8f8448"},"biome-silver":{base:"#668b7a"},"biome-luminous":{base:"#729f9e"},"folk-nature":{base:"#2f8553"},"folk-moon":{base:"#56627f"},"folk-ory":{base:"#6b5581"},"folk-ice":{base:"#a9cbd0"},"folk-forge":{base:"#87553c"},"folk-coral":{base:"#55a083"},"folk-plains":{base:"#789052"},"folk-twilight":{base:"#465362"},
                    "atlas-upland-shadow":{base:"#3f5145",texture:"atlas-relief"},"atlas-upland-face":{base:"#6d7a63",texture:"atlas-relief"},
                    "atlas-mountain-shadow":{base:"#303a35",texture:"atlas-relief"},"atlas-mountain-face":{base:"#73786f",texture:"atlas-relief"},
                    "atlas-snow-shadow":{base:"#81948f",texture:"atlas-relief"},"atlas-snow-face":{base:"#c2d0cc",texture:"atlas-relief"},
                    "atlas-basin-shadow":{base:"#39463c",texture:"atlas-relief"},"atlas-basin-face":{base:"#5d6755",texture:"atlas-relief"},
                    "atlas-ridge-shadow":{base:"#333c37",texture:"atlas-relief"},"atlas-ridge-face":{base:"#646a61",texture:"atlas-relief"},
                    "highland":{base:"#536957"},"mountain":{base:"#4f554d"},"snow":{base:"#a8bbb7"},"clear-water":{base:"#4d9673"},"sinkhole":{base:"#353d39"},"cave-mouth":{base:"#0c1112"},"lake":{base:"#0e7698"},"river":{base:"#1688a9"},
                    "geo-basin":{base:"#4b5144"},"geo-ridge":{base:"#4b5048"},"geo-ravine":{base:"#453b32"},"geo-rock":{base:"#60665e"},"geo-glacial":{base:"#9bbec0"},"geo-caldera":{base:"#6a4f43"},"geo-root":{base:"#1d663d"},"geo-spring":{base:"#4fa6a0"},"geo-delta":{base:"#4b9f91"},"geo-fjord":{base:"#176f8e"},"geo-hollow":{base:"#5a4938"},"pit-rim":{base:"#5b402d"},"pit-wall":{base:"#3e2b21"},"pit-deep":{base:"#281b16"},"pit-core":{base:"#17110f"},...folkPaints
                },
                layers:[
                    {id:"water-ocean",paint:"water-ocean",maxTier:8,value:sample=>number(sample?.landSignal)+.17},
                    {id:"water-sea",paint:"water-sea",maxTier:8,value:sample=>number(sample?.landSignal)+.075},
                    {id:"water-shallow",paint:"water-shallow",maxTier:6,value:sample=>number(sample?.landSignal)+.018},
                    // Dört gezegensel okyanus havzası atlas LOD'unda geniş ve
                    // kesintisiz kalır. Yerel su-lore katmanları bunların üstündedir.
                    ...oceanLayers,
                    // PATCH93 · Okyanus yüzeyi boş mavi fon değildir; Rhyirun ve su-lore makro eyaletleri zoom boyunca korunur.
                    {id:"water-moon",paint:"water-moon",maxTier:6,value:sample=>/gümüş-ay-denizi/.test(String(sample?.baseBiome||""))?1:-1},
                    {id:"water-aeth",paint:"water-aeth",maxTier:6,value:sample=>/aeth-akıntı-denizi|rhyirun-akıntı-bahçesi|vaeluna-berrak-su/.test(String(sample?.baseBiome||""))?1:-1},
                    {id:"water-moss",paint:"water-moss",maxTier:6,value:sample=>/ışıklı-yosun|rhyirun-ışıklı-yosun/.test(String(sample?.baseBiome||""))?1:-1},
                    {id:"water-crystal",paint:"water-crystal",maxTier:6,value:sample=>/kristal-akıntı|ışıklı-inci/.test(String(sample?.baseBiome||""))?1:-1},
                    {id:"water-pearl",paint:"water-pearl",maxTier:6,value:sample=>/turkuaz-mercan|maerethi-mercan/.test(String(sample?.baseBiome||""))?1:-1},
                    {id:"water-aurora",paint:"water-aurora",maxTier:6,value:sample=>/yıldız-yansımalı/.test(String(sample?.baseBiome||""))?1:-1},
                    {id:"land-living",paint:"land-living",maxTier:8,value:sample=>number(sample?.landSignal)},
                    ...folkLayers,
                    ...climateLayers,
                    ...topographyLayers,
                    // R110 · Atlas rölyefi çizgiyle çevrilmez. Eski üç paralel dağ
                    // konturu her kıtada otoyol/rota gibi okunuyordu. Dağ, yüksekova,
                    // sırt ve havza biçimleri yukarıdaki geniş belt+core dolgularıyla
                    // yumuşakça karışır; yüzeydeki tek zorunlu çizgi gerçek kıyıdır.
                    {id:"biome-ice",paint:"biome-ice",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="ice"?1:-1)},
                    {id:"biome-tropical",paint:"biome-tropical",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,/^tropical/.test(String(sample?.macroBiomeKey||""))?1:-1)},
                    {id:"biome-moon",paint:"biome-moon",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="moonwood"?1:-1)},
                    {id:"biome-ory",paint:"biome-ory",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="ory-garden"?1:-1)},
                    {id:"biome-med",paint:"biome-med",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="mediterranean"?1:-1)},
                    {id:"biome-giant",paint:"biome-giant",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="giant-plains"?1:-1)},
                    {id:"biome-root",paint:"biome-root",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,/ancient-forest|living-root/.test(String(sample?.macroBiomeKey||""))?1:-1)},
                    {id:"biome-forge",paint:"biome-forge",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="forge"?1:-1)},
                    {id:"biome-dragon",paint:"biome-dragon",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="dragon-volcanic"?1:-1)},
                    {id:"biome-crystal2",paint:"biome-crystal2",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="crystal"?1:-1)},
                    {id:"biome-twilight",paint:"biome-twilight",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="twilight-edge"?1:-1)},
                    {id:"biome-clearwater",paint:"biome-clearwater",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="clear-water-meadow"?1:-1)},
                    // PATCH93 · Dünya tipolojisi korunur; fantastik coğrafi kimlik zoom boyunca sabit kalır.
                    {id:"biome-tree",paint:"biome-tree",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="giant-tree"?1:-1)},
                    {id:"biome-worldtree",paint:"biome-worldtree",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="world-tree"?1:-1)},
                    {id:"biome-waterfall",paint:"biome-waterfall",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="waterfall-realm"?1:-1)},
                    {id:"biome-aurora",paint:"biome-aurora",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="aurora-basin"?1:-1)},
                    {id:"biome-pearl",paint:"biome-pearl",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="pearl-coast"?1:-1)},
                    {id:"biome-emerald",paint:"biome-emerald",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="emerald-valley"?1:-1)},
                    {id:"biome-sungold",paint:"biome-sungold",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="sun-gold-hills"?1:-1)},
                    {id:"biome-silver",paint:"biome-silver",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="silver-crown"?1:-1)},
                    {id:"biome-luminous",paint:"biome-luminous",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="luminous-lake"?1:-1)},
                    {id:"biome-arcane",paint:"biome-arcane",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,/ory-garden|moonwood|crystal/.test(String(sample?.macroBiomeKey||""))?1:-1)},
                    {id:"biome-volcanic",paint:"biome-volcanic",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,/dragon-volcanic|forge/.test(String(sample?.macroBiomeKey||""))?1:-1)},
                    {id:"biome-storm",paint:"biome-storm",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="storm"?1:-1)},
                    {id:"biome-floral",paint:"biome-floral",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="floral"?1:-1)},
                    {id:"biome-sun",paint:"biome-sun",maxTier:8,value:sample=>Math.min(number(sample?.landSignal)*20,sample?.macroBiomeKey==="giant-plains"?1:-1)},
                    // PATCH99 · Hiyerarşik Yaşayan Coğrafya. Aynı coğrafi
                    // oluşum her zoom'da aynı koordinattadır; uzak görünüm yalnız
                    // büyük aileleri, yakın görünüm ise metre ölçekli alt detayları açar.
                    {id:"geo-mega-basin",paint:"geo-basin",maxTier:6,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.basinMacroStrength)-.18)*5),fillOpacity:.18},
                    {id:"geo-regional-basin",paint:"geo-basin",maxTier:4,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.basinRegionalStrength)-.22)*6),fillOpacity:.24},
                    {id:"geo-ridge-spine",paint:"geo-ridge",maxTier:5,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.ridgeSpineStrength)-.34)*6),fillOpacity:.28},
                    {id:"geo-glacial-basin",paint:"geo-glacial",maxTier:4,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.glacialBasinStrength)-.30)*7),fillOpacity:.46},
                    {id:"geo-caldera",paint:"geo-caldera",maxTier:3,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.calderaStrength)-.32)*7),fillOpacity:.48},
                    {id:"geo-fjord",paint:"geo-fjord",maxTier:4,value:sample=>(number(sample?.coastalWaterStrength)-.34)*8,fillOpacity:.86},
                    {id:"geo-delta",paint:"geo-delta",maxTier:3,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.deltaStrength)-.28)*8),fillOpacity:.56},
                    {id:"geo-root-hollow",paint:"geo-root",maxTier:2,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.rootHollowStrength)-.34)*8),fillOpacity:.32},
                    {id:"geo-ravine",paint:"geo-ravine",maxTier:2,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.ravineStrength)-.38)*8),fillOpacity:.42},
                    {id:"geo-rock-shelf",paint:"geo-rock",maxTier:1,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.rockShelfStrength)-.68)*10),fillOpacity:.34},
                    {id:"geo-local-hollow",paint:"geo-hollow",maxTier:2,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.localHollowStrength)-.40)*8),fillOpacity:.27},
                    {id:"geo-micro-hollow",paint:"geo-hollow",maxTier:0,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.microHollowStrength)-.42)*9),fillOpacity:.34},
                    {id:"geo-warm-spring",paint:"geo-spring",maxTier:1,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.hotSpringStrength)-.42)*9),fillOpacity:.64},
                    {id:"shore-living",paint:"shore-living",maxTier:5,value:sample=>Math.min(number(sample?.landSignal)*24,(.055-number(sample?.landSignal))*24),fillOpacity:.52},
                    {id:"forest-climate",paint:"forest-living",maxTier:5,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.moisture)-.62)*5,15-number(sample?.height)),fillOpacity:.56},
                    {id:"flower-aeth",paint:"flower-aeth",maxTier:3,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.arcana)-.76)*6,(number(sample?.moisture)-.50)*4,9-number(sample?.height)),fillOpacity:.58},
                    {id:"clear-water-meadow",paint:"clear-water",maxTier:3,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.wetlandStrength)-.36)*8,10-number(sample?.height)),fillOpacity:.62},
                    // PATCH100 · Çukurlar artık tek gri/siyah boya değildir. Katmanlar
                    // saydamdır; alttaki gerçek toprak/biyom rengi görünmeye devam eder.
                    // Pit strength merkeze doğru yükseldiğinden aynı oluşum doğal olarak
                    // toprak → koyu kahve → siyaha yakın sıcak çekirdek gradyanı kazanır.
                    {id:"pit-rim",paint:"pit-rim",maxTier:2,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.pitStrength)-.18)*8),fillOpacity:.34},
                    {id:"pit-wall",paint:"pit-wall",maxTier:2,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.pitStrength)-.36)*9),fillOpacity:.46},
                    {id:"pit-deep",paint:"pit-deep",maxTier:1,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.pitStrength)-.56)*10,(number(sample?.pitDepthM)-120)/480+(number(sample?.pitRadiusM)-180)/900),fillOpacity:.58},
                    {id:"pit-core",paint:"pit-core",maxTier:1,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.pitStrength)-.75)*12,(number(sample?.pitDepthM)-420)/900+(number(sample?.pitRadiusM)-650)/1800),fillOpacity:.68},
                    {id:"cave-mouth",paint:"cave-mouth",maxTier:1,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.caveEntranceStrength)-.48)*10),fillOpacity:.80},
                    {id:"lake-major",paint:"lake",maxTier:4,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.lakeStrength)-.52)*12,(.30-number(sample?.landSignal))*12)},
                    {id:"lake-local",paint:"lake",maxTier:2,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.lakeStrength)-.38)*12,(.30-number(sample?.landSignal))*12)},
                    {id:"river",paint:"river",maxTier:3,value:sample=>Math.min(number(sample?.landSignal)*24,(number(sample?.riverStrength)-.27)*12,14.5-number(sample?.height))},
                    {id:"continent-coastline",paint:"land-living",maxTier:8,value:sample=>number(sample?.landSignal),contourOnly:true,stroke:"#e8d7a2",strokeOpacity:.46,strokeWidth:1.15}
                ]
            };
        }
        vectorPaintUrl(paintId){return`url(#${this.vectorClipId}-${paintId})`;}
        installVectorDefs(namespace,definition){
            const make=(tag,attributes={})=>{const node=document.createElementNS(namespace,tag);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));return node;};
            const defs=make("defs");
            for(const [paintId,paint] of Object.entries(definition.paints||{})){
                const patternId=`${this.vectorClipId}-${paintId}`;
                // R109 · Tek renk blok yerine ucuz, deterministik kartografik doku.
                // SVG filtre/turbulence kullanılmaz; birkaç çizgi ve nokta GPU dostudur.
                const isRealm=paint.texture==="realm"||paintId.startsWith("realm-");
                const isRelief=paint.texture==="atlas-relief";
                const isWater=!isRealm&&/water|ocean|sea|lake|river|fjord|delta|spring|lagoon|pearl|aeth/.test(paintId);
                const isForest=/forest|root|tree|nature|living/.test(paintId);
                const isMountain=/mountain|highland|ridge|rock|basin|hollow|pit|cave/.test(paintId);
                const isCrystal=/crystal|snow|ice|glacial|silver|white/.test(paintId);
                const isCosmic=/cosmic|star|nebula|void|astral|aurora/.test(paintId);
                const isVolcanic=/volcan|forge|caldera|ember|lava|dragon/.test(paintId);
                const size=isRelief?24:isWater?36:isCosmic?30:isMountain?28:24;
                const pattern=make("pattern",{id:patternId,patternUnits:"userSpaceOnUse",width:size,height:size});
                pattern.appendChild(make("rect",{x:"0",y:"0",width:size,height:size,fill:paint.base||"#111827"}));
                if(isRelief){
                    // Rölyefin dokusu tekrar eden SVG sembolü değil; üreticinin iki
                    // ayrı sürekli gürültü alanıyla böldüğü organik gölge/yüz maskesidir.
                }else if(isWater){
                    // R110 · Su yüzeyinde tekrar eden dalga simgesi yoktur. Okyanus
                    // derinliği, sahanlık ve havza geçişleri zaten geniş renk alanları
                    // olarak çizilir; desen çizgisi atlası duvar kâğıdına çeviriyordu.
                }else if(isRealm){
                    // Diyar geçişleri renk alanıdır; paralel tarama çizgisi değildir.
                    // Alttaki doğal yüzey dokusu düşük opaklıklı renklerden görünür.
                }else if(isForest){
                    pattern.appendChild(make("circle",{cx:"6",cy:"7",r:"2.2",fill:"#071f17","fill-opacity":".19"}));
                    pattern.appendChild(make("circle",{cx:"18",cy:"17",r:"3.1",fill:"#d7efd0","fill-opacity":".09"}));
                    pattern.appendChild(make("path",{d:"M6 10V14 M18 20V24",stroke:"#082418","stroke-opacity":".20","stroke-width":"1"}));
                }else if(isMountain){
                    // Dağ/havza sınırının organik dolgusu yeterlidir. Tekrarlanan
                    // üçgen sırt glifleri ve çift açık/koyu çizgiler rota sanılıyordu.
                }else if(isCrystal){
                    pattern.appendChild(make("path",{d:`M${size*.5} 4 L${size-5} ${size*.5} L${size*.5} ${size-4} L5 ${size*.5} Z`,fill:"none",stroke:"#efffff","stroke-opacity":".15","stroke-width":"1"}));
                }else if(isCosmic){
                    pattern.appendChild(make("circle",{cx:"6",cy:"8",r:"1.1",fill:"#ffffff","fill-opacity":".25"}));
                    pattern.appendChild(make("circle",{cx:"22",cy:"19",r:".7",fill:"#bdefff","fill-opacity":".22"}));
                }else if(isVolcanic){
                    pattern.appendChild(make("path",{d:`M2 2 L${size*.42} ${size*.44} L${size*.30} ${size*.72} L${size-2} ${size-2}`,fill:"none",stroke:"#220f0b","stroke-opacity":".22","stroke-width":"1.1"}));
                }else{
                    pattern.appendChild(make("path",{d:`M-4 ${size-3} L${size-3} -4 M6 ${size+4} L${size+4} 6`,fill:"none",stroke:"#f5efd9","stroke-opacity":paint.texture==="realm"?".075":".045","stroke-width":".8"}));
                }
                defs.appendChild(pattern);
            }
            return defs;
        }
        clipVectorTriangle(vertices,valueOf){
            const input=vertices.map(point=>({...point,value:Number(valueOf(point.sample))}));
            const output=[];
            for(let index=0;index<input.length;index++){
                const current=input[index],previous=input[(index+input.length-1)%input.length];
                const currentInside=Number.isFinite(current.value)&&current.value>=0;
                const previousInside=Number.isFinite(previous.value)&&previous.value>=0;
                const intersection=()=>{
                    const denominator=current.value-previous.value;
                    const ratio=Math.abs(denominator)<1e-9?.5:clamp((0-previous.value)/denominator,0,1);
                    return{x:previous.x+(current.x-previous.x)*ratio,y:previous.y+(current.y-previous.y)*ratio,value:0};
                };
                if(currentInside){if(!previousInside)output.push(intersection());output.push(current);}
                else if(previousInside)output.push(intersection());
            }
            return output;
        }
        vectorPathFor(samples,columns,rows,originX,originY,cellWidth,cellHeight,valueOf){
            // PATCH93: Her hücrenin dört köşesinde aynı lore predicate'ini tekrar
            // çalıştırmak büyük haritalarda pahalıydı. Değerleri vertex başına bir
            // kez hesapla; kıyı/interpolasyon geometrisi aynı kalır.
            const stride=columns+1,values=new Float64Array(samples.length);
            for(let index=0;index<samples.length;index++){const value=Number(valueOf(samples[index]));values[index]=Number.isFinite(value)?value:-Infinity;}
            const commands=[];
            const edge=(ax,ay,bx,by,va,vb)=>{const denominator=vb-va,ratio=Math.abs(denominator)<1e-12?.5:clamp(-va/denominator,0,1);return[ax+(bx-ax)*ratio,ay+(by-ay)*ratio];};
            const append=polygon=>{
                if(polygon.length<3)return;
                commands.push(`M${polygon[0][0].toFixed(1)} ${polygon[0][1].toFixed(1)}`);
                for(let index=1;index<polygon.length;index++)commands.push(`L${polygon[index][0].toFixed(1)} ${polygon[index][1].toFixed(1)}`);
                commands.push("Z");
            };
            for(let row=0;row<rows;row++){
                let runStart=-1;
                const y0=originY+row*cellHeight,y1=y0+cellHeight;
                const flushRun=endColumn=>{
                    if(runStart<0)return;
                    const left=(originX+runStart*cellWidth).toFixed(1),right=(originX+endColumn*cellWidth).toFixed(1),top=y0.toFixed(1),bottom=y1.toFixed(1);
                    commands.push(`M${left} ${top}H${right}V${bottom}H${left}Z`);runStart=-1;
                };
                for(let column=0;column<columns;column++){
                    const i0=row*stride+column,i1=i0+1,i3=(row+1)*stride+column,i2=i3+1;
                    const va=values[i0],vb=values[i1],vc=values[i2],vd=values[i3];
                    const ia=va>=0,ib=vb>=0,ic=vc>=0,id=vd>=0;
                    if(ia&&ib&&ic&&id){if(runStart<0)runStart=column;continue;}
                    flushRun(column);
                    if(!ia&&!ib&&!ic&&!id)continue;
                    const x0=originX+column*cellWidth,x1=x0+cellWidth,a=[x0,y0],b=[x1,y0],c=[x1,y1],d=[x0,y1];
                    const t=edge(x0,y0,x1,y0,va,vb),r=edge(x1,y0,x1,y1,vb,vc),bt=edge(x1,y1,x0,y1,vc,vd),l=edge(x0,y1,x0,y0,vd,va);
                    const mask=(ia?1:0)|(ib?2:0)|(ic?4:0)|(id?8:0),center=(va+vb+vc+vd)/4;
                    const cases={1:[[a,t,l]],2:[[b,r,t]],3:[[a,b,r,l]],4:[[c,bt,r]],6:[[t,b,c,bt]],7:[[a,b,c,bt,l]],8:[[d,l,bt]],9:[[a,t,bt,d]],11:[[a,b,r,bt,d]],12:[[l,r,c,d]],13:[[a,t,r,c,d]],14:[[t,b,c,d,l]]};
                    if(mask===5){if(center>=0)append([a,t,r,c,bt,l]);else{append([a,t,l]);append([c,bt,r]);}}
                    else if(mask===10){if(center>=0)append([t,b,r,bt,d,l]);else{append([b,r,t]);append([d,l,bt]);}}
                    else for(const polygon of cases[mask]||[])append(polygon);
                }
                flushRun(columns);
            }
            return commands.join("");
        }
        vectorContourPathFor(samples,columns,rows,originX,originY,cellWidth,cellHeight,valueOf){
            const stride=columns+1,values=new Float64Array(samples.length),commands=[];
            for(let index=0;index<samples.length;index++){const value=Number(valueOf(samples[index]));values[index]=Number.isFinite(value)?value:-Infinity;}
            const crossing=(ax,ay,bx,by,va,vb)=>{const denominator=vb-va,ratio=Math.abs(denominator)<1e-12?.5:clamp(-va/denominator,0,1);return[ax+(bx-ax)*ratio,ay+(by-ay)*ratio];};
            const segment=(a,b)=>commands.push(`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`);
            for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
                const i0=row*stride+column,i1=i0+1,i3=(row+1)*stride+column,i2=i3+1,va=values[i0],vb=values[i1],vc=values[i2],vd=values[i3];
                const mask=(va>=0?1:0)|(vb>=0?2:0)|(vc>=0?4:0)|(vd>=0?8:0);if(mask===0||mask===15)continue;
                const x0=originX+column*cellWidth,x1=x0+cellWidth,y0=originY+row*cellHeight,y1=y0+cellHeight;
                const t=crossing(x0,y0,x1,y0,va,vb),r=crossing(x1,y0,x1,y1,vb,vc),b=crossing(x1,y1,x0,y1,vc,vd),l=crossing(x0,y1,x0,y0,vd,va),center=(va+vb+vc+vd)/4;
                if(mask===1||mask===14)segment(l,t);
                else if(mask===2||mask===13)segment(t,r);
                else if(mask===3||mask===12)segment(l,r);
                else if(mask===4||mask===11)segment(r,b);
                else if(mask===6||mask===9)segment(t,b);
                else if(mask===7||mask===8)segment(l,b);
                else if(mask===5){if(center>=0){segment(t,r);segment(b,l);}else{segment(l,t);segment(r,b);}}
                else if(mask===10){if(center>=0){segment(l,t);segment(r,b);}else{segment(t,r);segment(b,l);}}
            }
            return commands.join("");
        }
        appendSurfaceRealmLabels(namespace,group,samples,columns,rows,originX,originY,cellWidth,cellHeight,tier){
            if(this.layerKey!=="surface"||tier<5)return 0;
            const styles=new Map((Array.isArray(NS.surfaceFolkStyles)?NS.surfaceFolkStyles:[]).map(style=>[String(style?.key||""),style]));
            const candidates=new Map(),stride=columns+1,maxX=originX+columns*cellWidth,maxY=originY+rows*cellHeight;
            for(let row=0;row<=rows;row++)for(let column=0;column<=columns;column++){
                const sample=samples[row*stride+column],land=Number(sample?.landSignal)||0,key=String(sample?.folkBiome?.primaryKey||"");
                if(land<=0||!styles.has(key))continue;
                const margin=Number(sample?.folkBiome?.margin)||0,transition=Number(sample?.folkBiome?.transition)||0;
                const x=originX+column*cellWidth,y=originY+row*cellHeight;
                // Aynı diyarın birkaç parçası varsa kadraj kenarındaki değil,
                // okunabilir iç parçadaki çekirdeği seç; zorunlu kenar etiketleri
                // aşağıda güvenli alana sıkıştırılır.
                const edgeRoom=Math.min(x-originX,maxX-x,y-originY,maxY-y),edgeScore=clamp(edgeRoom/54,0,1);
                const score=Math.min(.45,land)+margin*.72-transition*.18+edgeScore*.22;
                const candidate={key,score,x,y};
                if(!candidates.has(key)||candidate.score>candidates.get(key).score)candidates.set(key,candidate);
            }
            const labelGroup=document.createElementNS(namespace,"g");labelGroup.dataset.atlasLayer="realm-labels";
            labelGroup.setAttribute("pointer-events","none");
            const fontSize=tier>=8?9.4:tier>=7?10.2:11.2,placed=[];
            for(const candidate of candidates.values()){
                const style=styles.get(candidate.key)||{},label=String(style.name||candidate.key).split(/\s+/)[0];
                const estimatedWidth=Math.max(28,label.length*fontSize*.57),baseX=clamp(candidate.x,originX+68,maxX-68),baseY=clamp(candidate.y,originY+15,maxY-15);
                const offsets=[[0,0],[0,-1.45],[0,1.45],[-.80,0],[.80,0],[-.62,-1.25],[.62,1.25]];
                let labelX=baseX,labelY=baseY;
                for(const [ox,oy] of offsets){
                    const x=clamp(baseX+ox*fontSize,originX+68,maxX-68),y=clamp(baseY+oy*fontSize,originY+15,maxY-15);
                    const overlaps=placed.some(item=>Math.abs(x-item.x)<(estimatedWidth+item.width)*.5+5&&Math.abs(y-item.y)<fontSize*1.22);
                    if(!overlaps){labelX=x;labelY=y;break;}
                }
                placed.push({x:labelX,y:labelY,width:estimatedWidth});
                const text=document.createElementNS(namespace,"text");
                text.setAttribute("x",labelX.toFixed(1));text.setAttribute("y",labelY.toFixed(1));
                text.setAttribute("text-anchor","middle");text.setAttribute("dominant-baseline","central");
                text.setAttribute("font-family","Georgia, 'Times New Roman', serif");text.setAttribute("font-size",String(fontSize));
                text.setAttribute("font-weight","700");text.setAttribute("letter-spacing",".045em");
                text.setAttribute("fill","#f4e6b9");text.setAttribute("fill-opacity",tier>=8?".88":".94");
                text.setAttribute("stroke","#06111c");text.setAttribute("stroke-opacity",".92");text.setAttribute("stroke-width","2.8");
                text.setAttribute("stroke-linejoin","round");text.setAttribute("paint-order","stroke fill");
                text.dataset.realmKey=candidate.key;text.textContent=label;labelGroup.appendChild(text);
            }
            if(labelGroup.childNodes.length)group.appendChild(labelGroup);
            return labelGroup.childNodes.length;
        }
        vectorSampleBudget(view){
            const mpp=1/Math.max(Number.MIN_VALUE,view?.scale||1);
            // PATCH95: R93'ün uzak LOD bütçesi 30-40 piksellik marching-squares
            // hücreleri üretiyor, özellikle iklim ve okyanus eyaletlerini kare /
            // baklava bloklarına çeviriyordu. Yakın bütçe korunurken atlas ölçeği
            // tekrar yeterli kontur çözünürlüğüne çıkarılır. Örnekler tüm katmanlar
            // tarafından ortak kullanıldığı için maliyet katman sayısıyla çarpılmaz.
            // PATCH99: metre ölçekli doğal oluşumlar yakın zoomda gerçekten
            // kontur kazanabilsin. Uzak LOD bütçesi değişmez; maliyet yalnız yakın
            // kadrajda artar ve etkileşim bittikten sonra örneklenir.
            if(mpp<=.18)return{columns:176,rows:99};
            if(mpp<=.55)return{columns:148,rows:83};
            if(mpp<=3)return{columns:128,rows:72};
            if(mpp<=24)return{columns:112,rows:63};
            if(mpp<=180)return{columns:96,rows:54};
            if(mpp<=1_800)return{columns:92,rows:52};
            if(mpp<=18_000)return{columns:108,rows:61};
            if(mpp<=180_000)return{columns:180,rows:102};
            if(mpp<=1_800_000)return{columns:220,rows:124};
            return{columns:196,rows:110};
        }
        vectorWorldStep(view){
            const metersPerPixel=1/Math.max(Number.MIN_VALUE,view?.scale||1),spanX=Math.max(.01,view.maxX-view.minX),spanZ=Math.max(.01,view.maxZ-view.minZ),budget=this.vectorSampleBudget(view);
            const desired=Math.max(.0078125,metersPerPixel*2.3,spanX/Math.max(8,budget.columns),spanZ/Math.max(8,budget.rows));
            // PATCH95: atlas konturları sqrt2 basamakta gereğinden fazla irileşiyordu.
            // Çeyrek-octave kuantizasyon hücreyi ekranda daha küçük tutar; yeniden
            // örnekleme yine etkileşim bittikten sonra yapıldığı için wheel akışı korunur.
            return clamp(2**(Math.ceil(Math.log2(desired)*4)/4),.0078125,maxCameraDistanceForViewport(view?.width,view?.height));
        }
        stableSamplerCoordinate(value){const number=Number(value);return Number.isFinite(number)?number:0;}
        sampleAtCached(x,z){
            const key=`${this.layerKey}|${x}|${z}`;
            if(this.sampleCache.has(key))return this.sampleCache.get(key);
            const sample=this.generator.sampleAt?.(this.stableSamplerCoordinate(x),this.stableSamplerCoordinate(z))||{};
            this.sampleCache.set(key,sample);
            if(this.sampleCache.size>24000){let trim=6000;for(const cacheKey of this.sampleCache.keys()){if(trim--<=0)break;this.sampleCache.delete(cacheKey);}}
            return sample;
        }
        visualSampleAtCached(x,z,detailTier=0){
            const tier=Number.isFinite(Number(detailTier))?Number(detailTier):0,key=`${this.layerKey}|${tier}|${x}|${z}`;
            if(this.visualSampleCache.has(key))return this.visualSampleCache.get(key);
            const sx=this.stableSamplerCoordinate(x),sz=this.stableSamplerCoordinate(z),sample=this.generator.visualSampleAt?.(sx,sz,tier)||this.generator.sampleAt?.(sx,sz)||{};
            this.visualSampleCache.set(key,sample);
            if(this.visualSampleCache.size>48000){let trim=12000;for(const cacheKey of this.visualSampleCache.keys()){if(trim--<=0)break;this.visualSampleCache.delete(cacheKey);}}
            return sample;
        }
        applyCachedViewTransform(element,oldView,currentView){
            if(!element||!oldView||!currentView)return false;
            const scale=currentView.scale/oldView.scale,tx=(oldView.centerX-currentView.centerX)*currentView.scale+currentView.width/2-oldView.width/2*scale,ty=(oldView.centerZ-currentView.centerZ)*currentView.scale+currentView.height/2-oldView.height/2*scale;
            if(!Number.isFinite(scale)||!Number.isFinite(tx)||!Number.isFinite(ty)||scale<1/6||scale>6||Math.abs(tx)>1e7||Math.abs(ty)>1e7)return false;
            element.style.transformOrigin="0 0";element.style.transform=`matrix(${scale},0,0,${scale},${tx},${ty})`;return true;
        }
        drawVectorTerrain(view,regions){
            const svg=this.vectorSvg;if(!svg)return false;
            const namespace="http://www.w3.org/2000/svg",width=Math.max(2,Math.round(view.width)),height=Math.max(2,Math.round(view.height));
            const tier=this.detailTierFor(view),worldStep=this.vectorWorldStep(view);
            const minWorldX=Math.floor(view.minX/worldStep)*worldStep-worldStep,maxWorldX=Math.ceil(view.maxX/worldStep)*worldStep+worldStep;
            const minWorldZ=Math.floor(view.minZ/worldStep)*worldStep-worldStep,maxWorldZ=Math.ceil(view.maxZ/worldStep)*worldStep+worldStep;
            const columns=Math.max(1,Math.round((maxWorldX-minWorldX)/worldStep)),rows=Math.max(1,Math.round((maxWorldZ-minWorldZ)/worldStep));
            const signature=[this.layerKey,"lore",worldStep,minWorldX,maxWorldX,minWorldZ,maxWorldZ,Math.round(view.width),Math.round(view.height)].join("|");
            const cachedBounds=this.terrainWorldBounds,cachedStep=Number(this.terrainWorldStep)||0;
            if(this.terrainView&&cachedBounds&&Math.abs(cachedStep-worldStep)<1e-9&&cachedBounds.minX<=view.minX&&cachedBounds.maxX>=view.maxX&&cachedBounds.minZ<=view.minZ&&cachedBounds.maxZ>=view.maxZ){this.applyCachedViewTransform(svg,this.terrainView,view);return false;}
            if(signature===this.terrainBuildSignature&&this.terrainView){this.applyCachedViewTransform(svg,this.terrainView,view);return false;}
            const origin=this.worldToScreen(view,minWorldX,minWorldZ),cellWidth=worldStep*view.scale,cellHeight=worldStep*view.scale,samples=new Array((columns+1)*(rows+1));
            for(let row=0;row<=rows;row++)for(let column=0;column<=columns;column++){
                samples[row*(columns+1)+column]=this.visualSampleAtCached(minWorldX+column*worldStep,minWorldZ+row*worldStep,tier);
            }
            svg.setAttribute("viewBox",`0 0 ${width} ${height}`);svg.setAttribute("preserveAspectRatio","none");svg.setAttribute("shape-rendering","geometricPrecision");
            const definition=this.loreLayerDefinitions(),defs=this.installVectorDefs(namespace,definition),group=document.createElementNS(namespace,"g"),base=document.createElementNS(namespace,"rect");base.setAttribute("x","0");base.setAttribute("y","0");base.setAttribute("width",String(width));base.setAttribute("height",String(height));base.setAttribute("fill",this.vectorPaintUrl(definition.base));group.appendChild(base);
            // Üretimden gelen lore alanları SVG olarak çizilir; kullanıcı boyası
            // bundan bağımsız bir tuvalde kalır.
            // Yüzeyde ana renk kaynağı 24 gerçek diyar katmanıdır. Eski genel
            // `biome-*` katmanları bunların üstünü kapatıyor ve aynı örneği onlarca
            // kez konturluyordu; fiziksel orman/dağ/kar bindirmeleri zaten aşağıda.
            const presentInfluences={folk:new Set(),ocean:new Set(),climate:new Set(),topography:new Set()};
            if(this.layerKey==="surface")for(const sample of samples){
                for(const item of sample?.folkBiome?.influences||[])if(Number(item?.weight)>.055)presentInfluences.folk.add(String(item?.key));
                for(const item of sample?.oceanAtlasInfluences||[])if(Number(item?.weight)>.055)presentInfluences.ocean.add(String(item?.index));
                for(const item of sample?.climateInfluences||[])if(Number(item?.weight)>.055)presentInfluences.climate.add(String(item?.key));
                for(const item of sample?.topographyInfluences||[])if(Number(item?.weight)>.055)presentInfluences.topography.add(String(item?.key));
            }
            const layers=(definition.layers||[]).filter(layer=>tier<=Number(layer.maxTier??3)&&!(this.layerKey==="surface"&&String(layer.id||"").startsWith("biome-"))&&(!layer.influenceGroup||presentInfluences[layer.influenceGroup]?.has(String(layer.influenceKey))));
            for(const layer of layers){
                const pathData=layer.contourOnly?this.vectorContourPathFor(samples,columns,rows,origin.x,origin.y,cellWidth,cellHeight,layer.value):this.vectorPathFor(samples,columns,rows,origin.x,origin.y,cellWidth,cellHeight,layer.value);if(!pathData)continue;
                const paint=definition.paints?.[layer.paint]||{};
                const path=document.createElementNS(namespace,"path");path.setAttribute("d",pathData);path.setAttribute("fill",layer.contourOnly?"none":this.vectorPaintUrl(layer.paint));path.setAttribute("fill-opacity",String(layer.contourOnly?0:(layer.fillOpacity??1)));path.setAttribute("stroke",layer.stroke||paint.base||"#111820");path.setAttribute("stroke-opacity",String(layer.strokeOpacity??0));path.setAttribute("stroke-width",String(layer.strokeWidth??.46));path.setAttribute("stroke-linejoin","round");path.setAttribute("stroke-linecap","round");path.setAttribute("shape-rendering","geometricPrecision");path.setAttribute("vector-effect","non-scaling-stroke");path.dataset.atlasLayer=layer.id||layer.paint;group.appendChild(path);
            }
            const realmLabelCount=this.appendSurfaceRealmLabels(namespace,group,samples,columns,rows,origin.x,origin.y,cellWidth,cellHeight,tier);
            svg.style.transform="";svg.style.transformOrigin="0 0";
            svg.replaceChildren(defs,group);svg.dataset.vectorColumns=String(columns);svg.dataset.vectorRows=String(rows);svg.dataset.vectorTier=String(tier);svg.dataset.vectorWorldStep=String(worldStep);svg.dataset.atlasVersion=String(NS.cartography?.version||"vector-lore-four-realms-v17-r111");svg.dataset.atlasLayer=this.layerKey;svg.dataset.terrainColorMode="lore-continuous";svg.dataset.realmLabelCount=String(realmLabelCount);
            this.terrainView={...view};
            this.terrainWorldStep=worldStep;
            this.terrainWorldBounds={minX:minWorldX,maxX:maxWorldX,minZ:minWorldZ,maxZ:maxWorldZ};
            this.terrainBuildSignature=signature;
            return true;
        }
        cancelTerrainBuild(){
            this.terrainBuildToken++;
            if(!this.terrainBuildHandle)return;
            if(this.terrainBuildKind==="idle"&&typeof window.cancelIdleCallback==="function")window.cancelIdleCallback(this.terrainBuildHandle);
            else clearTimeout(this.terrainBuildHandle);
            this.terrainBuildHandle=0;this.terrainBuildKind="";
        }
        scheduleTerrainBuild(view,{urgent=false}={}){
            this.cancelTerrainBuild();
            const token=this.terrainBuildToken,run=()=>{
                this.terrainBuildHandle=0;this.terrainBuildKind="";
                if(this.disposed||token!==this.terrainBuildToken)return;
                try{this.drawVectorTerrain(view,this.discoveryRegions());this.vectorSvg?.removeAttribute("data-render-error");}
                catch(error){console.error("[JoA map] terrain build failed; last good frame preserved",error);if(this.vectorSvg)this.vectorSvg.dataset.renderError="1";}
            };
            if(urgent){this.terrainBuildKind="timer";this.terrainBuildHandle=setTimeout(run,48);return;}
            if(typeof window.requestIdleCallback==="function"){
                this.terrainBuildKind="idle";
                this.terrainBuildHandle=window.requestIdleCallback(run,{timeout:420});
            }else{
                this.terrainBuildKind="timer";
                this.terrainBuildHandle=setTimeout(run,180);
            }
        }
        draw(){
            const view=this.viewport(),interactive=performance.now()<this.interactiveUntil,baseTier=clamp(this.detailTierFor(view)+(interactive?1:0),0,8);
            this.scheduleTerrainBuild(view);
            this.canvas.dataset.lod=String(baseTier);this.canvas.classList.toggle("lod-moving",interactive);
            this.canvas.dataset.renderer="svg-line-free-production-lore-atlas";
            this.lastView=view;this.needsFrame=false;this.onAfterRender?.(this,{preview:false});
        }
        requestFrame(){
            if(this.disposed||this.frame)return;
            const governor=window.__ALEK_RESOURCE_GOVERNOR__;if(governor&&!governor.canRun(this.canvas))return;
            this.frame=requestAnimationFrame(()=>{this.frame=0;if(this.disposed||!this.needsFrame)return;this.draw();});
        }
        invalidate(){this.needsFrame=true;this.requestFrame();}
        previewInteraction(){
            this.cancelTerrainBuild();
            const old=this.terrainView,current=this.viewport();
            const terrainOk=old&&this.vectorSvg?this.applyCachedViewTransform(this.vectorSvg,old,current):false;
            // Arazi SVG'si zaman zaman artalanda yenilenir; boya tuvali ise kendi
            // görünümünde rasterleştirilir. Aynı eski görünümü paylaşmaları uzun
            // pan/zoom dizilerinde boyayı iki kez kaydırıp ölçekliyordu.
            const paint=this.canvas.parentElement?.querySelector(".joa-paint-layer"),paintOld=this.paintView;if(paint&&paintOld)this.applyCachedViewTransform(paint,paintOld,current);
            const images=this.canvas.parentElement?.querySelector(".joa-map-images"),imageOld=this.imageView;if(images&&imageOld)this.applyCachedViewTransform(images,imageOld,current);
            if(old&&!terrainOk)this.scheduleTerrainBuild(current,{urgent:true});
            this.lastView=current;this.needsFrame=false;this.onAfterRender?.(this,{preview:true});
        }
        pan(dx,dy){const view=this.lastView||this.viewport();this.camera.targetX-=dx/view.scale;this.camera.targetZ-=dy/view.scale;if(this.localInteractionReady())this.captureLocalCamera();this.markInteraction();this.previewInteraction();}
        zoom(delta,clientX=null,clientY=null){const beforeView=this.lastView||this.viewport(),before=Number(this.camera.distance)||JOA_READABLE_CAMERA_DISTANCE,maxDistance=maxCameraDistanceForViewport(this.canvas?.clientWidth,this.canvas?.clientHeight),magnitude=Math.max(1,Math.abs(Math.log10(Math.max(.025,before)))),outFactor=magnitude>250?10:magnitude>80?5:magnitude>24?3:magnitude>10?1.8:1.25,inFactor=1/outFactor,next=clamp(before*(delta<0?inFactor:outFactor),.025,maxDistance),rect=this.canvas.getBoundingClientRect(),sx=Number.isFinite(Number(clientX))?Number(clientX)-rect.left:beforeView.width/2,sy=Number.isFinite(Number(clientY))?Number(clientY)-rect.top:beforeView.height/2,anchor=this.screenToWorld(beforeView,sx,sy);this.camera.distance=next;const afterView=this.viewport();if(Number.isFinite(anchor.x)&&Number.isFinite(anchor.z)&&Number.isFinite(afterView.scale)&&afterView.scale>0){this.camera.targetX=anchor.x-(sx-afterView.width/2)/afterView.scale;this.camera.targetZ=anchor.z-(sy-afterView.height/2)/afterView.scale;}if(this.localInteractionReady())this.captureLocalCamera();this.markInteraction();this.previewInteraction();}
        setOneMeterPerPixel(){const width=this.canvas.clientWidth||1,height=this.canvas.clientHeight||1;this.camera.distance=Math.max(.12,Math.min(width,height)*1.18*JOA_DEFAULT_METERS_PER_PIXEL);this.captureLocalCamera(true);this.invalidate();return this.camera.distance;}
        reset(){Object.assign(this.camera,{targetX:0,targetZ:0,yaw:0,pitch:90});this.setOneMeterPerPixel();}
        project(x,y,z){const view=this.lastView||this.viewport(),p=this.worldToScreen(view,x,z);return{x:p.x,y:p.y,visible:p.x>-80&&p.x<view.width+80&&p.y>-80&&p.y<view.height+80,depth:1};}
        groundFromScreen(clientX,clientY){const rect=this.canvas.getBoundingClientRect(),view=this.lastView||this.viewport(),world=this.screenToWorld(view,clientX-rect.left,clientY-rect.top),sample=this.sampleAtCached(world.x,world.z);return{x:world.x,z:world.z,y:Number(sample?.height)||0};}
        heightAt(x,z){return Number(this.sampleAtCached(x,z)?.height)||0;}
        findNearestScenicLand(x,z,{maxRadius=12000,step=96}={}){
            let best=null;
            const scoreAt=(px,pz)=>{const sample=this.generator.sampleAt?.(px,pz);if(!sample?.walkable)return null;return{point:{x:px,z:pz,y:Number(sample.height)||0},score:(Number(sample.moisture)||.5)*.52+(Number(sample.arcana)||.5)*.31-Math.abs((Number(sample.height)||0)-3.1)*.025};};
            const center=scoreAt(x,z);if(center)return center.point;
            for(let radius=step;radius<=maxRadius;radius+=step){const samples=Math.max(16,Math.ceil(Math.PI*2*radius/step));for(let index=0;index<samples;index++){const angle=index/samples*Math.PI*2,candidate=scoreAt(x+Math.cos(angle)*radius,z+Math.sin(angle)*radius);if(candidate&&(!best||candidate.score>best.score))best=candidate;}if(best&&radius>=step*3)return best.point;}
            return{x,z,y:this.generator.heightAt(x,z)};
        }
        dispose(){this.disposed=true;cancelAnimationFrame(this.frame);clearTimeout(this.refineTimer);this.cancelTerrainBuild();window.removeEventListener("resize",this.onResize);window.removeEventListener("alek:resource-state",this.onResource);this.sampleCache.clear();this.visualSampleCache.clear();this.vectorSvg?.replaceChildren();}
    }
    NS.VectorDiscoveryRenderer=VectorDiscoveryRenderer;

    class JoAWorldController{
        constructor(bridge,eventBus){this.bridge=bridge;this.eventBus=eventBus;this.overlay=null;this.renderer=null;this.state=null;this.entities=[];this.party=null;this.markerNodes=new Map();this.mapImageNodes=new Map();this.openNodes=new Set(["root"]);this.travelGroupMemberCounts=new Map();this.inventorySelected=new Set();this.inventoryDeleteInFlight=false;this.worldSelected=new Set();this.controlledEntityKey="";this.drag=null;this.inventoryDragKey="";this.inventoryDidDrag=false;this.travelMode=false;this.routeDrawing=false;this.travelPlans=new Map();this.activeTravelKey="";this.travelPreview=null;this.markerClickTimers=new Map();this.markerLastClickAt=new Map();this.saveTimer=0;this.drawerWidth=420;this.travelAnimating=false;this.travelCancelVersion=0;this.travelCancelInFlight=false;this.travelStartPromise=null;this.travelCommitPromise=null;this.travelAnimationSnapshot=null;this.travelExecutionPreview=null;this.lastInventoryShortcutAt=0;this.lastInventoryShortcutUpAt=0;this.fogBack=document.createElement("canvas");this.fogBackCtx=this.fogBack.getContext("2d",{alpha:true});this.onGlobalKeyDown=null;this.onGlobalKeyUp=null;this.onGlobalPointerMove=null;this.onGlobalPointerUp=null;this.onTravelProgress=null;this.onRouteCancelled=null;this.onTimeRefreshed=null;this.onTravelGroupsChanged=null;this.onMapImageSelected=null;this.lastAnimatedVisionAt=0;this.lastVisionByEntity=new Map();this.inventoryPointerDrag=null;this.inventoryDragGhost=null;this.paintMode=false;this.paletteOpen=false;this.paintColor="#3b8fae";this.paintBrush=18;this.paintSoftness=0;this.paintHue=196;this.paintSaturation=58;this.paintLightness=46;this.paintTool="paint";this.paintBrushId="pixel-hard";this.paintActiveLayer=0;this.paintLayerVisibility=[true,true,true];this.paintOpacity=100;this.brushPanelOpen=false;this.layerPanelOpen=false;this.paintLayerDrag=null;this.paintLayerDragGhost=null;this.layerDragSuppressClickUntil=0;this.paintPointer=null;this.paintLastWorld=null;this.brushAdjustDrag=null;this.palettePointer=null;this.paintRegionDraft=null;this.paintUndo=[];this.paintUndoScope="";this.paintStrokeUndo=null;this.paintStrokeChanged=false;this.paintRecordKeyIndex=null;this.paintRenderFrame=0;this.paintLayerBuffer=null;this.paintBlurBuffer=null;this.paintLimitNoticeAt=0;this.paintRejectNoticeAt=0;this.pendingPlacement=null;this.ePlaceHeld=false;this.shiftTapCandidate=false;this.shiftTapStartedAt=0;this.legendCollapsed=true;this.inventoryPage=false;this.inventoryPanX=0;this.inventoryPanY=0;this.inventoryPan=null;this.focusHeld=false;this.inventoryFocusIntent=false;this.inventoryPlaceIntent=false;this.lastLegendLayer="";this.lastMapWorldPoint=null;this.mapImageDrag=null;this.selectedMapImageId="";this.pendingImageLayerId=null;this.zoomFrame=0;this.zoomDelta=0;this.zoomAnchorX=NaN;this.zoomAnchorY=NaN;this.mapPanFrame=0;this.mapPanDx=0;this.mapPanDy=0;this.travelCameraDirty=false;}
        setInventoryCommand(command=""){
            const normalized=command==="place"||command==="focus"?command:"";
            this.inventoryPlaceIntent=normalized==="place";this.inventoryFocusIntent=normalized==="focus";
            this.overlay?.classList.toggle("inventory-command-place",this.inventoryPlaceIntent);
            this.overlay?.classList.toggle("inventory-command-focus",this.inventoryFocusIntent);
            this.overlay?.classList.toggle("enter-container-modifier",this.inventoryPlaceIntent);
            if(this.overlay)this.overlay.dataset.inventoryCommand=normalized;
            return normalized;
        }
        open({force=false,openInventory=false,inventoryOnly=false,inventoryCommand="",pendingPlacementKey="",focusEntityKey="",focusLayerKey=""}={}){
            // F1/F2 ana yüzey geçişi JoA kabuğunu kapatıp yeniden kurar. Kartlar
            // ortak Mevcudat deposundan tekrar okunurken seyahat grubu eskiden
            // yalnız bu denetleyicinin state kopyasında kalıyordu. Aynı macera
            // yeniden açılıyorsa canlı grupları geçiş boyunca elde tut.
            const retainedAdventureId=String(this.state?.adventureId||"");
            const retainedTravelGroups=this.travelGroupSnapshot();
            const retainedTravelGroupsRevision=Math.max(0,Number(this.state?.travelGroupsRevision)||0);
            if(this.groupGathering===undefined)this.groupGathering=null;
            if(this.mapCameraSnapshot===undefined)this.mapCameraSnapshot=null;
            if(!Array.isArray(this.travelAnimationRoutes))this.travelAnimationRoutes=[];
            if(typeof this.portableContainerKey!=="string")this.portableContainerKey="";
            if(!this.overlay){this.travelAnimationRoutes=[];this.portableContainerKey="";}
            const wantsInventory=!!inventoryOnly||!!openInventory;
            if(this.overlay){
                if(force&&this.inventoryPage===wantsInventory){
                    if(this.inventoryPage&&inventoryCommand){this.setInventoryCommand(inventoryCommand);this.renderInventory();}
                    this.overlay.focus?.({preventScroll:true});
                    if(focusEntityKey&&!this.inventoryPage)this.focusWorldEntity(focusEntityKey);
                    if(pendingPlacementKey&&!this.inventoryPage)this.activatePendingPlacement(pendingPlacementKey);
                    return true;
                }
                this.close({save:true});
            }
            document.querySelectorAll(".alek-infinite-map,.journey-world-overlay,.joa-world-shell").forEach(node=>{try{node.remove();}catch(_){}});
            this.inventoryPage=wantsInventory;
            this.setInventoryCommand(wantsInventory?inventoryCommand:"");
            this.state=this.bridge.getWorldMapState?.()||{seed:"1",camera:{targetX:0,targetZ:0,distance:JOA_READABLE_CAMERA_DISTANCE},layerCameras:{},discoveredVisionPoints:[],entities:[],layerKey:"surface"};this.paintRecordRepairSignature="";this.paintRenderFailures=0;
            this.state.layerKey=this.normalizeLayerKey(focusLayerKey||this.state.layerKey);this.state.layerCameras=this.state.layerCameras&&typeof this.state.layerCameras==="object"?this.state.layerCameras:{};
            // Görüş artık seçili karakterin canlı dairesidir. Eski keşif noktaları
            // çizilmez, fakat geriye dönük kayıt uyumu için aynen korunur.
            if(!Array.isArray(this.state.discoveredVisionPoints))this.state.discoveredVisionPoints=[];
            this.controlledEntityKey=String(this.state.controlledEntityKey||"");
            this.state.camera={targetX:0,targetZ:0,distance:JOA_READABLE_CAMERA_DISTANCE,...(this.state.camera||{}),yaw:0,pitch:90};
            // Karttan dönüldüğünde son harita kadrajı birebir korunur.
            if(focusLayerKey&&this.state.layerCameras[this.state.layerKey])this.state.camera={...this.state.camera,...this.state.layerCameras[this.state.layerKey],yaw:0,pitch:90};
            else if(!wantsInventory&&this.mapCameraSnapshot)this.state.camera={...this.state.camera,...this.mapCameraSnapshot,yaw:0,pitch:90};
            // R46 gerçek ölçek geçişi: eski kameralar 1 metrelik piyonu onlarca metreymiş
            // gibi gösterebiliyordu. Bu yalnız bir kez uygulanır ve mevcut konumu korur.
            if(!["meter-true-scale-v2","meter-pixel-grid-v1","meter-cosmic-scale-v1","meter-map-cap-2400000km-v1","meter-map-cap-2400000km-v2","meter-map-cap-240km-v1","meter-map-cap-24km-v2","meter-unbounded-zoomout-v1","meter-unbounded-r110-v1","meter-unbounded-r111-v1"].includes(this.state.scaleUnit)){
                this.state.camera.distance=JOA_READABLE_CAMERA_DISTANCE;
                this.state.scaleUnit="meter-true-scale-v2";
            }
            // Eski veya bozulmuş kamera değerlerini ürün sınırına değil, yalnız
            // ekran matematiğinin sonlu kalacağı IEEE-754 emniyet tavanına al.
            this.state.camera.distance=clamp(Number(this.state.camera.distance)||JOA_READABLE_CAMERA_DISTANCE,.025,maxCameraDistanceForViewport());
            for(const savedCamera of Object.values(this.state.layerCameras||{})){
                if(savedCamera&&typeof savedCamera==="object")savedCamera.distance=clamp(Number(savedCamera.distance)||JOA_READABLE_CAMERA_DISTANCE,.025,maxCameraDistanceForViewport());
            }
            this.state.scaleUnit="meter-unbounded-r111-v1";
            // v0.1.5: 240 m görüş yarıçapı yerel bir alan gibi okunur.
            // Varsayılan kadraj yaklaşık 0.8 km dikey dünya alanı gösterir.
            // Kullanıcının elle yaptığı özel zoom korunur; yalnız eski varsayılanlar taşınır.
            if(Number(this.state.readableScaleVersion||0)<4){
                const oldDistance=Math.max(.025,Number(this.state.camera.distance)||640);
                const wasOldDefault=[600,640,900].some(value=>Math.abs(oldDistance-value)<28);
                if(wasOldDefault)this.state.camera.distance=JOA_READABLE_CAMERA_DISTANCE;
                this.state.readableScaleVersion=4;
            }
            // R110 kıta metriği yeniden kalibre edildi. Yalnız tamamen içeriksiz
            // kayıt başlangıç kıtasına döner; piyon/boya/görsel koordinatları korunur.
            if(Number(this.state.terrainMetricVersion||0)<6){
                // Piyonların kanonik kaynağı bazı eski kayıtlarda world-state içi
                // `entities` değil Core köprüsüdür. Yalnız state'e bakmak dolu bir
                // haritanın kamerasını sıfırlayabiliyordu; iki kaynağı da koru.
                const storedEntities=this.bridge.listWorldMapEntities?.()||[],storedGroups=this.bridge.listJoATravelGroups?.()?.groups||[];
                const hasPlacedBridgeContent=(Array.isArray(storedEntities)&&storedEntities.some(item=>item?.placedOnMap!==false))||(Array.isArray(storedGroups)&&storedGroups.some(item=>item?.placedOnMap!==false));
                const hasAnchoredContent=hasPlacedBridgeContent||(Array.isArray(this.state.entities)&&this.state.entities.length>0)||(Array.isArray(this.state.mapImages)&&this.state.mapImages.length>0)||Object.values(this.state.pixelPaint||{}).some(records=>Array.isArray(records)&&records.length>0)||(Array.isArray(this.state.activeTravelRoutes)&&this.state.activeTravelRoutes.length>0);
                if(!hasAnchoredContent){
                    this.state.camera={...this.state.camera,targetX:0,targetZ:0,distance:JOA_READABLE_CAMERA_DISTANCE,localTargetX:0,localTargetZ:0,localDistance:JOA_READABLE_CAMERA_DISTANCE};
                    for(const layer of WORLD_LAYERS)this.state.layerCameras[layer]={targetX:0,targetZ:0,distance:JOA_READABLE_CAMERA_DISTANCE,yaw:0,pitch:90,localTargetX:0,localTargetZ:0,localDistance:JOA_READABLE_CAMERA_DISTANCE};
                }
                this.state.joaSpawnNormalized=this.state.joaSpawnNormalized&&typeof this.state.joaSpawnNormalized==="object"?this.state.joaSpawnNormalized:{};
                this.state.joaSpawnNormalized.surface=true;
                this.state.terrainMetricVersion=6;
            }
            this.state.speedUnit="mps-v1";
            this.state.tokenDiameterM=JOA_UNIT_DIAMETER_M;
            const canonicalGroups=this.bridge.listJoATravelGroups?.();
            const sameAdventure=!retainedAdventureId||!String(this.state.adventureId||"")||retainedAdventureId===String(this.state.adventureId||"");
            const canonicalList=canonicalGroups&&Array.isArray(canonicalGroups.groups)?canonicalGroups.groups:null;
            const canonicalTombstone=canonicalGroups?.tombstone===true;
            let recoveredRetainedGroups=false;
            if(canonicalList&&(canonicalList.length||canonicalTombstone||!sameAdventure||!retainedTravelGroups.length)){
                this.state.travelGroups=canonicalList;this.state.travelGroupsRevision=Number(canonicalGroups.revision)||0;
            }else if(sameAdventure&&retainedTravelGroups.length){
                this.state.travelGroups=retainedTravelGroups;this.state.travelGroupsRevision=Math.max(retainedTravelGroupsRevision,Number(canonicalGroups?.revision)||0);recoveredRetainedGroups=true;
            }
            if(!Array.isArray(this.state.travelGroups))this.state.travelGroups=[];
            const repairedOverlaps=this.repairTravelGroupOverlaps();
            if(recoveredRetainedGroups||repairedOverlaps){
                const saved=this.bridge.saveJoATravelGroups?.(this.travelGroupSnapshot(),{reason:repairedOverlaps?"overlap-repaired":"primary-surface-recovery",revision:Number(this.state.travelGroupsRevision)||0});
                if(saved?.ok&&Array.isArray(saved.groups)){this.state.travelGroups=saved.groups;this.state.travelGroupsRevision=Number(saved.revision)||0;}
            }
            this.publishTravelGroupSnapshot("surface-open");
            this.state.pixelPaint=this.state.pixelPaint&&typeof this.state.pixelPaint==="object"?this.state.pixelPaint:{};
            for(const layer of WORLD_LAYERS)if(!Array.isArray(this.state.pixelPaint[layer]))this.state.pixelPaint[layer]=[];
            this.state.mapImages=this.normalizeMapImages(this.state.mapImages);
            this.legendCollapsed=this.state.legendOpen!==true;
            this.refreshEntities();
            if(this.inventoryPage)return this.openInventoryPage();
            const adventure=this.bridge.getAdventureInfo?.()||{name:"Alekrythae",gameTime:""};
            const overlay=document.createElement("section");overlay.className="joa-world-shell";overlay.tabIndex=0;overlay.style.setProperty("--joa-drawer-width",`${this.drawerWidth}px`);
            overlay.innerHTML=`
                <header class="joa-topbar">
                    <div class="joa-brand"><img src="https://alek-assets.local/Assets/Bluemoon.png" alt=""><span><strong>AŁEK’RYŦHÆ</strong><small>${escapeHtml(adventure.name)}</small></span></div>
                    <div class="joa-title"><strong>Journey of Adventurer</strong><small>Karakter 1×1 m · Grup 3×3 m · Mekân 5×5 m</small></div>
                    <div class="joa-clock"><strong>${escapeHtml(adventure.gameTime||"")}</strong><span class="joa-surface-actions"><button class="joa-meggy-gate" type="button" title="Kısayol Rehberi" aria-label="Kısayol Rehberi"><img src="https://alek-assets.local/Assets/meggy.png" alt="Meggy"></button></span></div>
                </header>
                <main class="joa-stage">
                    <svg class="joa-vector-terrain" aria-hidden="true" preserveAspectRatio="none"></svg>
                    <canvas class="joa-map-canvas" tabindex="0"></canvas>
                    <canvas class="joa-paint-layer" aria-hidden="true"></canvas>
                    <div class="joa-map-images" aria-label="Diyar görselleri"></div>
                    <canvas class="joa-fog" aria-hidden="true"></canvas>
                    <svg class="joa-travel-route" aria-hidden="true"><polyline></polyline></svg>
                    <div class="joa-vision-ring" aria-hidden="true"><span>240 metre görüş yarıçapı</span></div>
                    <div class="joa-map-markers"></div>
                    <div class="joa-map-badge"></div>
                    <nav class="joa-layer-switch" aria-label="Harita katmanları">
                        <button type="button" data-world-layer="surface"><b>1</b><span>Yerküre</span></button>
                        <button type="button" data-world-layer="sky"><b>2</b><span>Uçan Ada</span></button>
                        <button type="button" data-world-layer="underground"><b>3</b><span>Yeraltı</span></button>
                        <button type="button" data-world-layer="cosmic"><b>4</b><span>Kozmik Ada</span></button>
                    </nav>
                    <div class="joa-scale-bar" aria-label="Gerçek dünya ölçeği"><i></i><span>100 m</span></div>
                    <div class="joa-discovery-status" aria-live="polite">Bir karakter veya mekân seç · canlı görüş yalnız onun çevresinde açılır</div>
                    <aside class="joa-map-legend" aria-label="Harita renklerinin anlamları"></aside>
                    <section class="joa-floating-palette" data-layout-revision="r109" aria-hidden="true"></section>
                    <div class="joa-empty-world"><img src="https://alek-assets.local/Assets/Bluemoon.png" alt=""><strong>Haritada karakter yok</strong><span>F1 ile Mevcudat’ı aç. Ctrl+E ile karakteri eline al veya Mevcudat çekmecesinden haritaya sürükle. Karakter ve mekân karanlıkta da piyon olarak görünür.</span><button>Mevcudat’ı Aç</button></div>
                    <aside class="joa-inventory-drawer" aria-hidden="true"><header><div><small>YAŞAYAN MEVCUDAT</small><strong>Mevcudat</strong></div><button class="joa-drawer-close">×</button></header><div class="joa-inventory-help"></div><div class="joa-inventory-tree"></div></aside>
                    <aside class="joa-portable-inventory" aria-hidden="true"><header><div><small>PORTATİF MEVCUDAT</small><strong>İç Konteynerler</strong></div><button class="joa-portable-close" type="button" aria-label="Kapat">×</button></header><p>Tüm piyonlar: orta tıkla iç mevcudatı aç · Haritadaki bağımsız Seyahat Grubu: sağ tıkla dağıt · bu listedeki her piyon/kart: sağ tıkla taşıyıcıdan yaklaşık 1 metre çevreye çıkar.</p><div class="joa-portable-list"></div></aside>
                    <section class="joa-travel-console" aria-hidden="true"><div><small>S · SEYAHAT MODU · G · GRUP NOKTASI</small><strong class="joa-travel-metric">Piyonu seç · E + grup piyonu: gruba katıl · Boşluk: hareket.</strong></div></section>
                </main>`;
            document.body.appendChild(overlay);this.overlay=overlay;
            this.state.camera=this.prepareCameraForLayer(this.state.layerKey,this.state.camera);this.state.layerCameras[this.state.layerKey]={...this.state.camera};
            const canvas=overlay.querySelector(".joa-map-canvas");this.renderer=new VectorDiscoveryRenderer(canvas,{seed:Number(this.state.seed)||1,camera:this.state.camera,onAfterRender:(_renderer,flags)=>this.renderOverlay(flags),getDiscoveryRegions:()=>this.discoveryRegions(),layerKey:this.state.layerKey});
            if(Number(this.state.meterPixelGridVersion||0)<1){this.renderer.setOneMeterPerPixel();this.state.meterPixelGridVersion=1;this.state.camera={...this.renderer.camera};}
            this.refreshEntities();
            this.bindUi();this.refreshAll();
            if(pendingPlacementKey)requestAnimationFrame(()=>this.activatePendingPlacement(pendingPlacementKey));
            if(focusEntityKey)requestAnimationFrame(()=>this.focusWorldEntity(focusEntityKey));
            window.__alekCurrentPrimarySurface="map";overlay.focus({preventScroll:true});this.eventBus.emit("joa:opened",{});return true;
        }
        openInventoryPage(){
            const adventure=this.bridge.getAdventureInfo?.()||{name:"Alekrythae",gameTime:""},buildRevision=Number(window.Alekrythae?.manifest?.architectureRevision)||0;
            const targetContext=window.__ALEK_ITEM_TRANSFER_TARGET__,targetMode=!!(targetContext?.active&&typeof targetContext.accept==="function");
            const surfaceTitle=targetMode?String(targetContext.title||"Hedef Mevcudatı Seç"):"Kartlar ve Alt Kümeler";
            const surfaceHelp=targetMode?"Sol tık: hedef Karakter veya Mekân kartını seç · Orta tuş: serbest gezin · Esc: işlemi iptal et":"Ctrl+F + kart: haritadaki piyonu bul · Ctrl+E + kart: haritaya yerleştir · Sol tık: kağıt · Ctrl + sol tık: seç · Delete: kartı kaldır";
            const overlay=document.createElement("section");overlay.className="joa-world-shell joa-inventory-page-shell";overlay.tabIndex=0;
            overlay.classList.toggle("joa-item-transfer-target-mode",targetMode);
            overlay.innerHTML=`<header class="joa-topbar"><div class="joa-brand"><img src="https://alek-assets.local/Assets/Bluemoon.png" alt=""><span><strong>AŁEK’RYŦHÆ</strong><small>${escapeHtml(adventure.name)}</small></span></div><div class="joa-title"><strong>${targetMode?"Eşya Hedefi":"Yaşayan Mevcudat"}</strong><small>${targetMode?escapeHtml(String(targetContext.instruction||"Hedef Karakter veya Mekân kartını seç.")):`Haritadan bağımsız çalışma yüzeyi · orta tuşla serbest gezin${buildRevision?` · R${buildRevision}`:""}`}</small></div><div class="joa-clock"><strong>${escapeHtml(adventure.gameTime||"")}</strong><span class="joa-surface-actions"><button class="joa-meggy-gate" type="button" title="Tavern’a geç" aria-label="Tavern’a geç" ${targetMode?"disabled":""}><img src="https://alek-assets.local/Assets/meggy.png" alt="Meggy"></button></span></div></header><main class="joa-inventory-page-stage"><section class="joa-inventory-page-surface"><header><div><small>${targetMode?"VER / TAKAS HEDEF SEÇİMİ":"MEVCUDAT UZAYI"}</small><strong>${escapeHtml(surfaceTitle)}</strong></div><span>${escapeHtml(surfaceHelp)}</span></header>${targetMode?`<div class="joa-item-transfer-banner"><span aria-hidden="true"><i></i></span><div><strong>${escapeHtml(String(targetContext.instruction||"Hedef Karakter veya Mekân kartını seç."))}</strong><small>Kaynak: ${escapeHtml(String(targetContext.sourceName||"Mevcudat"))} · başka bir Karakter veya Mekân kartı seçilebilir</small></div><kbd>ESC</kbd></div>`:`<div class="joa-inventory-help"><b>Haritadakini bul:</b> Ctrl+F basılıyken karta tıkla. <b>Haritaya yerleştir:</b> Ctrl+E basılıyken karta tıkla. <b>Katmanlar:</b> Map’te 1 Yerküre · 2 Uçan Ada · 3 Yeraltı · 4 Kozmik Ada. <b>Haritadan kaldır:</b> satırdaki × Haritadan düğmesi kartı silmeden yalnız piyonu kaldırır. <b>Tavern:</b> sağ üstteki Meggy dairesine bas; konuşmacı eklemek için satırdaki konuşma mührünü kullan. · Sol tık: kağıt · Sağ tık: alt küme · Sürükle: iç içe taşı/sırala</div>`}<div class="joa-inventory-tree" tabindex="0"></div></section></main>`;
            document.body.appendChild(overlay);this.overlay=overlay;this.setInventoryCommand(this.inventoryPlaceIntent?"place":this.inventoryFocusIntent?"focus":"");this.bindInventoryPageUi();this.renderInventory();window.__alekCurrentPrimarySurface="inventory";overlay.focus({preventScroll:true});this.eventBus.emit("joa:inventory-opened",{});return true;
        }
        bindInventoryPageUi(){
            const o=this.overlay,host=o.querySelector(".joa-inventory-tree");
            o.querySelector(".joa-meggy-gate").onclick=()=>{this.save();queueMicrotask(()=>this.bridge.openMeggyTavern?.());};
            o.addEventListener("keydown",event=>this.onKeyDown(event),true);
            this.onGlobalKeyDown=event=>{if(this.overlay?.isConnected)this.onKeyDown(event);};
            // Ctrl+E / Ctrl+F artık basılı-tutma modu değil, tek kullanımlık komuttur.
            // keyup komutu düşürmez; kart tıklaması veya Esc tüketir.
            this.onGlobalKeyUp=()=>{};
            window.addEventListener("keydown",this.onGlobalKeyDown,true);window.addEventListener("keyup",this.onGlobalKeyUp,true);
            this.onGlobalPointerMove=event=>{this.updateInventoryPointerDrag(event);this.updateInventoryCanvasPan(event);};
            this.onGlobalPointerUp=event=>{void this.finishInventoryPointerDrag(event);this.finishInventoryCanvasPan(event);};
            window.addEventListener("pointermove",this.onGlobalPointerMove,{capture:true,passive:false});window.addEventListener("pointerup",this.onGlobalPointerUp,true);window.addEventListener("pointercancel",this.onGlobalPointerUp,true);
            host.addEventListener("pointerdown",event=>this.beginInventoryCanvasPan(event));
            host.addEventListener("auxclick",event=>{if(event.button===1){event.preventDefault();event.stopPropagation();}});
            host.addEventListener("wheel",event=>{event.preventDefault();event.stopPropagation();},{passive:false});
            host.addEventListener("contextmenu",event=>{if(event.target.closest?.(".joa-tree-row"))return;event.preventDefault();});
            // Mevcudat sayfası haritadan bağımsız açıldığı için bindUi çalışmaz.
            // Hiyerarşi değişikliğini burada da doğrudan dinle; taşıma aynı anda ekrana yansısın.
            window.addEventListener("alek:joa-entity-updated",this.onEntityUpdate=()=>{if(!this.overlay?.isConnected)return;this.renderInventory();});
            this.bindTravelGroupInventoryEvents();
        }
        beginInventoryCanvasPan(event){if(event.button!==1||event.target.closest?.("input,button"))return;this.inventoryPan={pointerId:event.pointerId,lastX:event.clientX,lastY:event.clientY};event.currentTarget.setPointerCapture?.(event.pointerId);this.overlay?.classList.add("inventory-panning");event.preventDefault();event.stopPropagation();}
        updateInventoryCanvasPan(event){const pan=this.inventoryPan;if(!pan||event.pointerId!==pan.pointerId)return;this.inventoryPanX+=event.clientX-pan.lastX;this.inventoryPanY+=event.clientY-pan.lastY;pan.lastX=event.clientX;pan.lastY=event.clientY;this.applyInventoryPan();event.preventDefault();event.stopPropagation();}
        finishInventoryCanvasPan(event){const pan=this.inventoryPan;if(!pan||event.pointerId!==pan.pointerId)return;this.inventoryPan=null;this.overlay?.classList.remove("inventory-panning");event.preventDefault();event.stopPropagation();}
        applyInventoryPan(){if(!this.inventoryPage)return;const host=this.overlay?.querySelector(".joa-inventory-tree"),track=host?.querySelector(".joa-inventory-tree-track");if(!host||!track)return;const minX=Math.min(0,host.clientWidth-track.scrollWidth-80),minY=Math.min(0,host.clientHeight-track.scrollHeight-80);this.inventoryPanX=clamp(this.inventoryPanX,minX,80);this.inventoryPanY=clamp(this.inventoryPanY,minY,80);track.style.transform=`translate3d(${Math.round(this.inventoryPanX)}px,${Math.round(this.inventoryPanY)}px,0)`;}

        bindTravelGroupInventoryEvents(){
            if(this.onTravelGroupsChanged)window.removeEventListener("alek:joa-travel-groups-changed",this.onTravelGroupsChanged);
            this.onTravelGroupsChanged=event=>{
                if(event.detail?.source===this||!this.overlay?.isConnected)return;
                const incoming=event.detail?.groups;if(!Array.isArray(incoming)||!this.state)return;
                this.state.travelGroups=incoming.map(group=>({...group,members:[...(Array.isArray(group?.members)?group.members:[])]}));
                this.state.travelGroupsRevision=Math.max(Number(this.state.travelGroupsRevision)||0,Number(event.detail?.revision)||0);
                this.refreshAll();
            };
            window.addEventListener("alek:joa-travel-groups-changed",this.onTravelGroupsChanged);
        }

        normalizeLayerKey(value){return WORLD_LAYERS.includes(String(value))?String(value):"surface";}
        normalizeMapImages(value){return(Array.isArray(value)?value:[]).filter(item=>item&&String(item.path||"").trim()).map((item,index)=>({...item,id:String(item.id||`map-image-${Date.now()}-${index}`),path:String(item.path),layerKey:this.normalizeLayerKey(item.layerKey),paintLayer:item.paintLayer!==null&&item.paintLayer!==undefined&&item.paintLayer!==""&&Number.isInteger(Number(item.paintLayer))?Number(item.paintLayer):null,x:Number.isFinite(Number(item.x))?Number(item.x):0,z:Number.isFinite(Number(item.z))?Number(item.z):0,widthM:clamp(Number(item.widthM)||320,.1,JOA_MAP_IMAGE_MAX_M),heightM:clamp(Number(item.heightM)||180,.1,JOA_MAP_IMAGE_MAX_M),locked:item.locked===true,opacity:clamp(Number(item.opacity)||1,.05,1)}));}
        safeLocalPointForLayer(layerKey=this.state?.layerKey,excludeKey=""){const layer=this.normalizeLayerKey(layerKey),wanted=String(this.controlledEntityKey||this.state?.controlledEntityKey||""),candidates=(this.allMapEntities||this.entities||[]).filter(item=>String(item.layerKey||"surface")===layer&&String(item.key||"")!==String(excludeKey||"")&&localPointSafe(item.x,item.z));return candidates.find(item=>String(item.key||"")===wanted)||candidates[0]||null;}
        prepareCameraForLayer(layerKey,camera={}){const source=camera&&typeof camera==="object"?camera:{},distance=clamp(Number(source.distance)||JOA_READABLE_CAMERA_DISTANCE,.025,maxCameraDistanceForViewport()),fallback=this.safeLocalPointForLayer(layerKey),fallbackX=Number(fallback?.x)||0,fallbackZ=Number(fallback?.z)||0,storedLocalSafe=localPointSafe(source.localTargetX,source.localTargetZ),targetSafe=localPointSafe(source.targetX,source.targetZ),localTargetX=storedLocalSafe?Number(source.localTargetX):(targetSafe?Number(source.targetX):fallbackX),localTargetZ=storedLocalSafe?Number(source.localTargetZ):(targetSafe?Number(source.targetZ):fallbackZ),collapsed=Number(source.targetX)-distance===Number(source.targetX)+distance||Number(source.targetZ)-distance===Number(source.targetZ)+distance;return{...source,targetX:(!targetSafe||collapsed)?localTargetX:(Number(source.targetX)||0),targetZ:(!targetSafe||collapsed)?localTargetZ:(Number(source.targetZ)||0),distance,yaw:0,pitch:90,localTargetX,localTargetZ,localDistance:clamp(Number(source.localDistance)||Math.min(distance,JOA_READABLE_CAMERA_DISTANCE),.025,JOA_LOCAL_INTERACTION_MAX_DISTANCE_M)};}
        localMapOperationAllowed({notifyUser=true}={}){const ok=!!this.renderer?.localInteractionReady?.();if(!ok&&notifyUser)notice("Bu işlem için yerel ölçeğe dön: bir piyona F + sol tıkla veya yakınlaş.",3200);return ok;}
        layerInfo(key=this.state?.layerKey){const layer=this.normalizeLayerKey(key),profile=NS.profile||window.AlekrythaeWorldLoreProfile||{};return profile.layers?.[layer]||{key:layer,label:layer,badge:"Ałek’ryŧhæ yaşayan dünya katmanı"};}
        async switchLayer(layerKey){
            if(!this.overlay||!this.renderer)return;const next=this.normalizeLayerKey(layerKey),current=this.state.layerKey;if(next===current)return;
            this.resetPaintUndo();this.paintRegionDraft=null;
            this.state.layerCameras=this.state.layerCameras&&typeof this.state.layerCameras==="object"?this.state.layerCameras:{};
            this.state.layerCameras[current]={...this.renderer.camera};
            const nextCamera=this.prepareCameraForLayer(next,this.state.layerCameras[next]?{...this.state.layerCameras[next]}:{targetX:0,targetZ:0,distance:JOA_READABLE_CAMERA_DISTANCE,yaw:0,pitch:90});
            this.state.camera={...nextCamera};this.state.layerKey=next;this.bridge.setCurrentLayer?.(next);
            this.renderer.setLayer(next);this.renderer.adoptCamera(nextCamera);this.refreshEntities();this.party=null;this.lastLegendLayer="";this.selectedMapImageId="";this.refreshAll();this.scheduleSave();notice(`${this.layerInfo(next).label} katmanı · 1 Yerküre · 2 Uçan Ada · 3 Yeraltı · 4 Kozmik Ada`);
        }
        runtimeVisionRange(value){
            // PATCH82: Görüş mesafesi ile harita ölçeği tamamen bağımsızdır.
            // Hiçbir özel sayı (24 km, 240 km veya başka bir değer) otomatik olarak
            // başka bir görüş mesafesine çevrilmez. Karakter kartında ne yazıyorsa aynen kullanılır.
            return Math.max(0,Number(value)||0);
        }
        refreshEntities(){
            // PATCH82: Dünya nesnelerinin görüş değeri yalnız kendi kaydından gelir.
            // Harita ölçeği/zoom tavanı burada hiçbir dönüşüm yapmaz.
            const allBase=(this.bridge.listWorldMapEntities?.()||[]).map(entity=>{const base=String(entity?.entityType||"")==="location"?{...entity,worldDiameterM:JOA_LOCATION_DIAMETER_M}:{...entity};base.visionRange=this.runtimeVisionRange(base.visionRange);return base;});
            this.allMapEntities=allBase;const activeLayer=String(this.state?.layerKey||"surface");const base=allBase.filter(entity=>String(entity?.layerKey||"surface")===activeLayer);
            if(!this.state)this.state={};
            // PATCH51: travelGroups için tek kaynak legacy bridge'in kanonik snapshot'ıdır.
            // Controller/map/live kopyalarını union edip eski state'i diriltmeyiz.
            const canonical=this.bridge.listJoATravelGroups?.();if(canonical&&Array.isArray(canonical.groups)){this.state.travelGroups=canonical.groups.map(group=>({...group,members:[...(group.members||[])]}));this.state.travelGroupsRevision=Number(canonical.revision)||0;this.state.travelGroupsTombstone=canonical.tombstone===true;}
            if(!Array.isArray(this.state.travelGroups))this.state.travelGroups=[];
            const inventoryBase=this.bridge.listJoAEntities?.()||[],groupKeys=new Set(this.state.travelGroups.map(group=>`group:${String(group.id||"")}`)),validParents=new Set(["root",...inventoryBase.map(item=>String(item.key||"")),...groupKeys]);let changed=false;
            // members[] karar veren ikinci state değildir. Normal kartlarda olduğu gibi gerçek
            // ebeveyn parentKey'tir; members[] yalnız geriye dönük/diagnostic ayna olarak türetilir.
            this.state.travelGroups=this.state.travelGroups.map((group,index)=>{
                const id=String(group?.id||`travel-group-${index+1}`),ownKey=`group:${id}`,members=inventoryBase.filter(item=>String(item.parentKey||"root")===ownKey).map(item=>String(item.key||"")).filter(Boolean),legacy=(group.members||[]).map(String);
                if(members.length!==legacy.length||members.some((key,i)=>key!==legacy[i]))changed=true;
                let parentKey=String(group?.parentKey||"root");if(!validParents.has(parentKey)||parentKey===ownKey){parentKey="root";changed=true;}
                return{...group,id,x:Number(group?.x)||0,z:Number(group?.z)||0,layerKey:this.normalizeLayerKey(group?.layerKey),parentKey,order:Number(group?.order)||index,members:[...new Set(members)],pinned:group?.pinned===true,isCard:true,hasSheet:false};
            });
            const byGroupKey=new Map(this.state.travelGroups.map(group=>[`group:${group.id}`,group]));for(const group of this.state.travelGroups){const ownKey=`group:${group.id}`,seen=new Set([ownKey]);let cursor=String(group.parentKey||"root");while(cursor.startsWith("group:")){if(seen.has(cursor)){group.parentKey="root";changed=true;break;}seen.add(cursor);const parent=byGroupKey.get(cursor);if(!parent){break;}cursor=String(parent.parentKey||"root");}}
            if(this.syncTravelGroupNames(inventoryBase))changed=true;
            const groups=this.state.travelGroups.filter(group=>group.placedOnMap!==false&&String(group.parentKey||"root")==="root"&&String(group.layerKey||"surface")===activeLayer).map(group=>({key:`group:${group.id}`,groupId:group.id,name:group.name,x:group.x,z:group.z,layerKey:group.layerKey,entityType:"travel-group",isTravelGroup:true,worldDiameterM:JOA_GROUP_DIAMETER_M,accent:"#71cde9",members:[...group.members],pinned:group.pinned===true,travelSpeed:this.groupTravelSpeed(group,allBase),visionRange:this.groupVisionRange(group)}));
            this.entities=[...base,...groups];if(changed)this.scheduleSave();this.party=null;
        }
        entityWorldCenter(entity){
            // x/z bütün piyon tiplerinde görselin ve görüşün merkezidir; sol-üst köşe değildir.
            return{x:Number(entity?.x)||0,z:Number(entity?.z)||0};
        }
        travelGroupRecord(id){
            const target=String(id||"");let group=(Array.isArray(this.state?.travelGroups)?this.state.travelGroups:[]).find(item=>String(item.id)===target)||null;if(group)return group;
            const canonical=this.bridge.listJoATravelGroups?.();if(canonical&&Array.isArray(canonical.groups)){
                if(!this.state)this.state={};this.state.travelGroups=canonical.groups;this.state.travelGroupsRevision=Number(canonical.revision)||0;
                group=canonical.groups.find(item=>String(item.id)===target)||null;
            }
            return group;
        }
        travelGroupSnapshot(){return(Array.isArray(this.state?.travelGroups)?this.state.travelGroups:[]).map(group=>({...group,members:[...(Array.isArray(group?.members)?group.members:[])]}));}
        travelGroupNumber(group,index=0){const explicit=Number(group?.groupNumber);if(Number.isInteger(explicit)&&explicit>0)return explicit;const match=String(group?.name||"").match(/^Seyahat Grubu\s+(\d+)/i);return match?Math.max(1,Number(match[1])||1):Math.max(1,index+1);}
        syncTravelGroupNames(baseRecords=null){
            const groups=Array.isArray(this.state?.travelGroups)?this.state.travelGroups:[];if(!groups.length)return false;
            const base=Array.isArray(baseRecords)?baseRecords:(this.bridge.listJoAEntities?.()||[]),children=new Map(),nodes=[],baseKeys=new Set(base.map(item=>String(item?.key||"")).filter(Boolean)),groupKeys=new Set(groups.map(group=>`group:${String(group?.id||"")}`));
            // PATCH51: kişi sayısı da yalnız gerçek parentKey ağacından hesaplanır.
            for(const item of base){const realParent=String(item?.parentKey||"root"),safeParent=realParent==="root"||baseKeys.has(realParent)||groupKeys.has(realParent)?realParent:"root";nodes.push({...item,parentKey:safeParent,isTravelGroup:false});}
            for(const [index,group] of groups.entries())nodes.push({key:`group:${group.id}`,parentKey:String(group.parentKey||"root"),isTravelGroup:true,group,index});
            for(const item of nodes){const parent=String(item?.parentKey||"root");if(!children.has(parent))children.set(parent,[]);children.get(parent).push(item);}
            const countPeople=rootKey=>{let count=0;const seen=new Set(),walk=key=>{if(seen.has(key))return;seen.add(key);for(const child of children.get(key)||[]){if(child.isTravelGroup){walk(String(child.key||""));continue;}if(String(child.entityType||child.type||"")==="character")count++;walk(String(child.key||""));}};walk(rootKey);return count;};
            let changed=false;const usedNumbers=new Set();for(const [index,group] of groups.entries()){let number=this.travelGroupNumber(group,index);if(usedNumbers.has(number)){number=1;while(usedNumbers.has(number))number++;}usedNumbers.add(number);const count=countPeople(`group:${group.id}`),name=`Seyahat Grubu ${number} - ${count} Kişi`;if(Number(group.groupNumber)!==number||Number(group.personCount)!==count||String(group.name||"")!==name)changed=true;group.groupNumber=number;group.personCount=count;group.name=name;group.title="Seyahat Grubu";group.subtitle="Seyahat Grubu";group.isCard=true;group.hasSheet=false;}return changed;
        }
        publishTravelGroupSnapshot(reason="updated"){
            try{window.__ALEK_LIVE_JOA_TRAVEL_GROUPS__={adventureId:String(this.state?.adventureId||""),revision:Number(this.state?.travelGroupsRevision)||0,tombstone:this.travelGroupSnapshot().length===0,reason:String(reason||"updated"),groups:this.travelGroupSnapshot()};}catch(_){}
        }
        persistTravelGroups(reason="updated"){
            this.syncTravelGroupNames();const groups=this.travelGroupSnapshot();if(this.state)this.state.travelGroups=groups;
            const saved=this.bridge.saveJoATravelGroups?.(groups,{reason:String(reason||"updated"),revision:Number(this.state?.travelGroupsRevision)||0});
            if(saved?.ok&&Array.isArray(saved.groups)){this.state.travelGroups=saved.groups;this.state.travelGroupsRevision=Number(saved.revision)||0;}
            else this.bridge.saveWorldMapState?.({travelGroups:groups,travelGroupsRevision:Number(this.state?.travelGroupsRevision)||0});
            this.publishTravelGroupSnapshot(reason);
            // Seyahat Grubu yaşayan Mevcudat ağacında normal kart sözleşmesini kullanır.
            // Tek istisnaları kağıt içeriğinin olmaması ve haritadaki sağ tık davranışıdır.
            // Oluşturma, üyelik, iç içe taşıma ve dağılma aynı yaşam-döngüsü olayıyla bütün açık yüzeylere yayılır.
            const detail={source:this,reason:String(reason||"updated"),revision:Number(this.state?.travelGroupsRevision)||0,groups:this.travelGroupSnapshot(),activeKeys:this.travelGroupSnapshot().map(group=>`group:${group.id}`)};
            if(this.inventoryPage&&this.overlay?.isConnected)this.renderInventory();
            window.dispatchEvent(new CustomEvent("alek:joa-travel-groups-changed",{detail}));
            this.eventBus?.emit?.("joa:travel-groups-changed",{reason:detail.reason,groups:detail.groups,activeKeys:detail.activeKeys});
            return groups;
        }
        travelGroupDescendantRecords(group){
            if(!group)return[];const records=this.inventoryRecords(),children=new Map();for(const item of records){const parent=String(item.parentKey||"root");if(!children.has(parent))children.set(parent,[]);children.get(parent).push(item);}const result=[],seen=new Set(),walk=key=>{if(seen.has(key))return;seen.add(key);for(const child of children.get(key)||[]){result.push(child);walk(String(child.key||""));}};walk(`group:${group.id}`);return result;
        }
        groupMemberEntities(group,source=this.allMapEntities||this.entities){const keys=new Set(this.travelGroupDescendantRecords(group).filter(item=>!item.isTravelGroup).map(item=>String(item.key||"")));return(source||[]).filter(entity=>!entity.isTravelGroup&&keys.has(String(entity.sourceEntityKey||"")));}
        groupTravelSpeed(group,source=this.allMapEntities||this.entities){const descendants=this.travelGroupDescendantRecords(group).filter(item=>!item.isTravelGroup),speeds=descendants.map(item=>Number(item.travelSpeed)).filter(value=>Number.isFinite(value)&&value>0);if(speeds.length)return Math.min(...speeds);const mapped=this.groupMemberEntities(group,source).map(entity=>Number(entity.travelSpeed)).filter(value=>Number.isFinite(value)&&value>0);return mapped.length?Math.min(...mapped):JOA_DEFAULT_SPEED_MPS;}
        groupVisionRange(group){const values=this.travelGroupDescendantRecords(group).filter(item=>!item.isTravelGroup).map(item=>this.runtimeVisionRange(item.visionRange)).filter(value=>Number.isFinite(value)&&value>0);return values.length?Math.max(...values):0;}
        nextTravelGroupNumber(){
            const used=new Set();for(const [index,group] of (this.state?.travelGroups||[]).entries())used.add(this.travelGroupNumber(group,index));
            let number=1;while(used.has(number))number++;return number;
        }
        repairTravelGroupOverlaps(){
            const groups=(this.state?.travelGroups||[]).filter(group=>group?.placedOnMap!==false&&String(group?.parentKey||"root")==="root"),placedByLayer=new Map(),clearance=JOA_GROUP_DIAMETER_M+2,goldenAngle=Math.PI*(3-Math.sqrt(5));let changed=false;
            for(const group of groups){const layer=String(group?.layerKey||"surface");if(!placedByLayer.has(layer))placedByLayer.set(layer,[]);const placed=placedByLayer.get(layer),origin={x:Number(group?.x)||0,z:Number(group?.z)||0};let candidate=origin;
                if(placed.some(point=>Math.hypot(origin.x-point.x,origin.z-point.z)<.5)){for(let attempt=1;attempt<=196;attempt++){const radius=clearance*Math.sqrt(attempt),angle=attempt*goldenAngle,next={x:origin.x+Math.cos(angle)*radius,z:origin.z+Math.sin(angle)*radius};if(placed.every(point=>Math.hypot(next.x-point.x,next.z-point.z)>=clearance)){candidate=next;changed=true;break;}}}
                group.x=candidate.x;group.z=candidate.z;placed.push(candidate);
            }
            return changed;
        }
        travelGroupSpawnPoint(point){
            const base={x:Number(point?.x)||0,z:Number(point?.z)||0},layerKey=String(this.state?.layerKey||"surface"),clearance=JOA_GROUP_DIAMETER_M+2;
            const visible=(this.state?.travelGroups||[]).filter(group=>group?.placedOnMap!==false&&String(group?.parentKey||"root")==="root"&&String(group?.layerKey||"surface")===layerKey);
            const free=candidate=>this.isDiscoveredPoint(candidate)&&visible.every(group=>Math.hypot(candidate.x-(Number(group?.x)||0),candidate.z-(Number(group?.z)||0))>=clearance);
            if(free(base))return base;const goldenAngle=Math.PI*(3-Math.sqrt(5));for(let attempt=1;attempt<=196;attempt++){const radius=clearance*Math.sqrt(attempt),angle=attempt*goldenAngle,candidate={x:base.x+Math.cos(angle)*radius,z:base.z+Math.sin(angle)*radius};if(free(candidate))return candidate;}
            // Aynı yerde üst üste görünmek, ikinci kartı hiç oluşturmamaktan iyidir.
            return base;
        }
        openTravelGroupNode(groupId){const id=String(groupId||"");if(!id)return false;this.openNodes.add(`group:${id}`);return true;}
        createTravelGroup(point=this.lastMapWorldPoint){
            if(!this.travelMode){notice("Önce S ile seyahat modunu aç.");return false;}
            if(!this.localMapOperationAllowed())return false;
            const target=point||{x:Number(this.renderer?.camera?.targetX)||0,z:Number(this.renderer?.camera?.targetZ)||0};
            // Görüntüde yalnız aktif piyonun dairesi gerçek haritadır. Etkileşim de
            // aynı sözleşmeye uyar; siyah bölgede başka bir piyon görüyor diye gizli
            // koordinata grup bırakılamaz.
            if(!this.isDiscoveredPoint(target)){notice("Grup noktası yalnız aktif piyonun görüş alanına kurulabilir.");return false;}
            const spawn=this.travelGroupSpawnPoint(target),created=this.bridge.createJoATravelGroup?.({x:spawn.x,z:spawn.z,layerKey:String(this.state.layerKey||"surface"),placedOnMap:true,order:Date.now()});
            if(!created?.id){notice("Seyahat Grubu oluşturulamadı.");return false;}
            const canonical=this.bridge.listJoATravelGroups?.();if(canonical&&Array.isArray(canonical.groups)){this.state.travelGroups=canonical.groups;this.state.travelGroupsRevision=Number(canonical.revision)||0;}
            this.openTravelGroupNode(created.id);this.refreshEntities();this.createMarkers();this.renderOverlay();notice(`${created.name||"Seyahat Grubu"} kuruldu · yeni bağımsız piyon/kart.`,2600);return true;
        }
        // PATCH51: üyelik için ayrı members[] yazıcısı yoktur. Karakter, Mekân ve
        // Seyahat Grubu aynı moveInventoryNode -> bridge.moveJoAInventoryNode yolunu kullanır.
        setTravelGroupDestination(subject,target){
            if(!subject||!target?.isTravelGroup)return false;
            const plan=this.ensureTravelPlan(subject),targetGroupId=String(target.groupId||"");
            if(subject.isTravelGroup){const sourceKey=`group:${String(subject.groupId||"")}`;if(!targetGroupId||sourceKey===`group:${targetGroupId}`||this.inventoryWouldCycle(sourceKey,`group:${targetGroupId}`)){notice("Bir seyahat grubu kendi içine veya kendi alt kümesine giremez.");return false;}plan.enterTargetRecordKey=`group:${targetGroupId}`;plan.enterTargetWorldKey=String(target.key||"");plan.enterTargetName=String(target.name||"Seyahat Grubu");delete plan.joinGroupId;}
            else{const sourceKey=String(subject.sourceEntityKey||"");if(!sourceKey){notice("Bu piyon seyahat grubuna katılamıyor.");return false;}plan.joinGroupId=targetGroupId;delete plan.enterTargetRecordKey;delete plan.enterTargetWorldKey;delete plan.enterTargetName;}
            this.addTravelPoint(this.entityWorldCenter(target),true);this.finishRouteDrawing();notice(`${subject.name||"Mevcudat"} → ${target.name||"Seyahat Grubu"} içine giriş rotası hazır · Boşluk ile hareket.`,3400);return true;
        }
        async disbandTravelGroup(entity){
            const group=this.travelGroupRecord(entity?.groupId);if(!group)return false;
            const removedKey=`group:${group.id}`,fallbackParent=String(group.parentKey||"root"),records=this.inventoryRecords(),directChildren=records.filter(item=>String(item.parentKey||"root")===removedKey),count=directChildren.length;
            if(this.activeTravelRoutes().some(route=>String(route.key)===removedKey))await Promise.resolve(this.bridge.cancelJoATravelRoute?.(removedKey));
            // Önce bütün doğrudan çocukları normal kart taşıma çekirdeğiyle üst konteynere çıkar.
            // Böylece hiçbir karakter/mekân/grup, silinecek group:<id> parentKey'inde yetim kalmaz.
            for(const [index,child] of directChildren.entries()){
                const moved=await this.bridge.moveJoAInventoryNode?.(String(child.key),fallbackParent,Date.now()+index);if(!moved){notice(`${child.name||"Mevcudat"} üst konteynere aktarılamadı; grup dağıtma iptal edildi.`);return false;}
            }
            const removed=await Promise.resolve(this.bridge.removeJoATravelGroup?.(String(group.id)));if(!removed){notice("Seyahat Grubu kartı kaldırılamadı.");return false;}
            this.travelPlans.delete(removedKey);this.worldSelected.delete(removedKey);if(String(this.controlledEntityKey||this.state?.controlledEntityKey||"")===removedKey){this.controlledEntityKey="";if(this.state)this.state.controlledEntityKey="";}if(String(this.portableTravelGroupId||"")===String(group.id))this.closePortableInventory();
            // Kök düzeye çıkan çocuklar normal kartlarda olduğu gibi tekrar bağımsız piyon olabilir.
            if(fallbackParent==="root")for(const [index,child] of directChildren.entries()){
                const angle=-Math.PI/2+(Math.PI*2*index)/Math.max(1,count),point={x:Number(group.x)+Math.cos(angle),z:Number(group.z)+Math.sin(angle),layerKey:String(group.layerKey||"surface")};
                await Promise.resolve(this.bridge.placeJoAInventoryNodeOnMap?.(String(child.key),point));
            }
            this.reloadWorldState();this.refreshEntities();this.refreshAll();this.save();
            const resultText=fallbackParent==="root"?(count?`${count} alt kart merkezden yaklaşık 1 metre uzağa dağıtıldı.`:"boş grup kaldırıldı."):`${count} alt kart üst konteynere aktarıldı.`;
            notice(`${group.name} çözüldü · ${resultText}`,4200);return true;
        }
        activeVisionEntity(){
            const visible=this.entities.filter(item=>["character","location","travel-group"].includes(String(item.entityType||""))&&String(item.layerKey||"surface")===String(this.state?.layerKey||"surface"));
            // Aktif görüş tek bir kişiye aittir. Seyahat eden başka piyona basıldığında
            // controlledEntityKey de değişir; sis ve kamera yeni kişinin alanına geçer.
            return visible.find(item=>String(item.key)===String(this.controlledEntityKey||this.state?.controlledEntityKey||""))||visible.find(item=>this.worldSelected.has(item.key))||visible[0]||null;
        }
        discoveryRegions(){
            const layer=String(this.state?.layerKey||"surface"),entity=this.activeVisionEntity();
            if(!entity||String(entity.layerKey||"surface")!==layer)return[];
            const radius=this.runtimeVisionRange(entity.visionRange),center=this.entityWorldCenter(entity);if(radius<=0)return[];return[{x:center.x,z:center.z,r:radius,layerKey:layer,current:true,entityKey:String(entity.key||"")}];
        }
        pointVisibleToActiveCharacter(entity){
            const vision=this.activeVisionEntity();
            if(!vision||!entity)return false;
            if(String(entity.layerKey||"surface")!==String(vision.layerKey||"surface"))return false;
            const radius=this.runtimeVisionRange(vision.visionRange);if(radius<=0)return false;
            const point=this.entityWorldCenter(entity),center=this.entityWorldCenter(vision);
            return Math.hypot(point.x-center.x,point.z-center.z)<=radius;
        }
        selectWorldCharacter(entity,{enter=false}={}){
            // Sol tık bütün bireysel piyonlarda seçimdir. Karakter ile Karakter/Yaratık
            // aynı kanonik birey davranışını kullanır; yalnız kimlik adı/sembolü ayrıdır.
            if(!entity||(!["character","being","location"].includes(String(entity.entityType||""))&&entity?.type!=="journey-character"))return false;
            const entityKey=String(entity.key||"");if(!entityKey)return false;
            this.worldSelected.clear();
            this.worldSelected.add(entityKey);
            // R56 düzeltmesi: aktif görüş ayrı bir anahtarla tutuluyor. Yalnız
            // worldSelected değişirse seçim halkası yeni piyona geçse bile sis,
            // görüş çemberi ve "controlled" işareti eski karakterde kilitli kalır.
            // Her gerçek sol tık aktif karakteri değiştirir; `enter` yalnızca
            // kameranın seçilen piyona merkezlenip merkezlenmeyeceğini belirler.
            this.controlledEntityKey=entityKey;
            this.state.controlledEntityKey=entityKey;
            if(enter)this.renderer.focusLocalPoint?.(Number(entity.x)||0,Number(entity.z)||0,Math.min(Number(this.renderer.camera.distance)||JOA_READABLE_CAMERA_DISTANCE,JOA_LOCAL_INTERACTION_MAX_DISTANCE_M));
            this.scheduleSave();
            this.createMarkers();
            this.renderer?.invalidate();
            this.renderOverlay();
            return true;
        }
        activateTravelingEntityView(entity){
            if(!entity||!this.renderer)return false;const key=String(entity.key||"");if(!key)return false;
            this.worldSelected.clear();this.worldSelected.add(key);this.controlledEntityKey=key;this.state.controlledEntityKey=key;
            // Seyahat sol tık: seçim halkası ve aktif görüş piyonla değişir; kamera
            // kullanıcının kadrajını korur ve hareket başlayınca piyonu kovalamaz.
            this.createMarkers();this.renderer.invalidate?.();this.renderOverlay();this.scheduleSave();return true;
        }
        refreshAll(){
            this.refreshEntities();
            if(this.inventoryPage){this.renderInventory();return;}
            this.createMarkers();this.renderEmptyState();
            const layer=String(this.state?.layerKey||"surface"),legendHost=this.overlay?.querySelector(".joa-legend-body");if(this.lastLegendLayer!==layer||!legendHost?.firstElementChild){this.lastLegendLayer=layer;this.renderLegend();}
            this.renderer?.invalidate();this.renderOverlay();
        }
        bindUi(){
            const o=this.overlay,canvas=o.querySelector(".joa-map-canvas"),legend=o.querySelector(".joa-map-legend"),palette=o.querySelector(".joa-floating-palette");
            o.querySelector(".joa-meggy-gate").onclick=()=>window.__alekOpenShortcutHelp?.();
            o.querySelector(".joa-drawer-close").onclick=()=>this.toggleInventory(false);
            o.querySelector(".joa-portable-close").onclick=()=>this.closePortableInventory();
            o.querySelector(".joa-empty-world button").onclick=()=>this.toggleInventory(true);
            const resize=o.querySelector(".joa-drawer-resizer");if(resize)resize.hidden=true;
            o.querySelectorAll("[data-world-layer]").forEach(button=>button.onclick=event=>{event.preventDefault();event.stopPropagation();void this.switchLayer(button.dataset.worldLayer);});
            o.addEventListener("keydown",event=>this.onKeyDown(event),true);
            this.onGlobalKeyDown=event=>{if(this.overlay?.isConnected)this.onKeyDown(event);};
            this.onGlobalKeyUp=event=>{
                if(!this.overlay?.isConnected)return;
                if(event.code==="KeyF")this.focusHeld=false;
                if(event.code==="KeyE"){this.ePlaceHeld=false;this.overlay?.classList.remove("enter-container-modifier");}
                if((event.code==="ShiftLeft"||event.code==="ShiftRight")&&this.shiftTapCandidate){const elapsed=performance.now()-this.shiftTapStartedAt;this.shiftTapCandidate=false;if(elapsed<650){event.preventDefault();event.stopPropagation();this.setPaletteOpen();return;}}
                return;
            };
            window.addEventListener("keydown",this.onGlobalKeyDown,true);window.addEventListener("keyup",this.onGlobalKeyUp,true);
            this.onGlobalPointerMove=event=>{this.updateInventoryPointerDrag(event);this.updatePalettePointer(event);this.updateMapImagePointer(event);if(this.paintPointer?.pointerId===event.pointerId&&event.target!==canvas&&((Number(event.buttons)||0)&1))this.onMapPointerMove(event);};
            this.onGlobalPointerUp=event=>{if(this.paintPointer?.pointerId===event.pointerId)this.onMapPointerUp(event);this.finishMapImagePointer(event);void this.finishInventoryPointerDrag(event);this.finishPalettePointer(event);};
            window.addEventListener("pointermove",this.onGlobalPointerMove,{capture:true,passive:false});window.addEventListener("pointerup",this.onGlobalPointerUp,true);window.addEventListener("pointercancel",this.onGlobalPointerUp,true);
            this.onPaintWindowBlur=()=>{this.focusHeld=false;this.ePlaceHeld=false;this.inventoryFocusIntent=false;this.inventoryPlaceIntent=false;this.mapImageDrag=null;this.overlay?.classList.remove("enter-container-modifier");this.recoverInterruptedPaintStroke();};
            this.onPaintVisibilityChange=()=>{if(document.visibilityState==="hidden")this.recoverInterruptedPaintStroke();};
            window.addEventListener("blur",this.onPaintWindowBlur,true);document.addEventListener("visibilitychange",this.onPaintVisibilityChange,true);
            canvas.addEventListener("contextmenu",event=>{event.preventDefault();event.stopPropagation();});
            canvas.addEventListener("auxclick",event=>{if(event.button===1){event.preventDefault();event.stopPropagation();}});
            const stage=o.querySelector(".joa-stage");
            stage?.addEventListener("wheel",event=>{if(event.ctrlKey||event.target?.closest?.(".joa-floating-palette,.joa-portable-inventory,.joa-inventory-drawer"))return;event.preventDefault();event.stopPropagation();this.zoomDelta+=Number(event.deltaY)||0;this.zoomAnchorX=Number(event.clientX);this.zoomAnchorY=Number(event.clientY);if(this.zoomFrame)return;this.zoomFrame=requestAnimationFrame(()=>{this.zoomFrame=0;const delta=this.zoomDelta,clientX=this.zoomAnchorX,clientY=this.zoomAnchorY;this.zoomDelta=0;if(!delta||!this.renderer)return;this.renderer.zoom(delta,clientX,clientY);this.scheduleSave();});},{passive:false,capture:true});
            // Boya modunda bazı Electron/Chromium sürümleri görünmez hit canvas'ı
            // katman değişiminden sonra hedef olarak seçmeyi bırakabiliyor. Stage'in
            // yakalama aşaması, harita üstündeki piyon/sis/SVG hedefini aynı kanonik
            // boya akışına yönlendirir; palet ve gerçek denetimler kapsam dışıdır.
            stage?.addEventListener("pointerdown",event=>{if(!this.paintMode||event.button!==0||event.target===canvas||event.target?.closest?.(".joa-map-image-item,.joa-floating-palette,.joa-layer-switch,.joa-portable-inventory,.joa-inventory-drawer,.joa-travel-console,.joa-map-legend,input,textarea,select"))return;event.__joaPaintStageRouted=true;this.onMapPointerDown(event);},true);
            legend.addEventListener("click",event=>this.onLegendClick(event));
            palette.addEventListener("click",event=>this.onPaletteClick(event));palette.addEventListener("input",event=>this.onPaletteInput(event));palette.addEventListener("pointerdown",event=>this.onPalettePointerDown(event));palette.addEventListener("dragstart",event=>this.onLayerDragStart(event));palette.addEventListener("dragover",event=>this.onLayerDragOver(event));palette.addEventListener("drop",event=>this.onLayerDrop(event));palette.addEventListener("dragend",()=>this.finishLayerDrag());
            canvas.addEventListener("pointerdown",event=>this.onMapPointerDown(event));canvas.addEventListener("pointermove",event=>this.onMapPointerMove(event));canvas.addEventListener("pointerup",event=>this.onMapPointerUp(event));canvas.addEventListener("pointercancel",event=>this.onMapPointerUp(event));canvas.addEventListener("lostpointercapture",event=>{if(this.paintPointer?.pointerId===event.pointerId)queueMicrotask(()=>{if(this.paintPointer?.pointerId===event.pointerId)this.recoverInterruptedPaintStroke();});});
            const paintCanvas=o.querySelector(".joa-paint-layer");paintCanvas?.addEventListener?.("contextlost",event=>{event.preventDefault?.();this.paintLayerBuffer=null;this.paintBlurBuffer=null;notice("Boya yüzeyi yenileniyor; çizimin korunuyor.",2200);});paintCanvas?.addEventListener?.("contextrestored",()=>{this.paintLayerBuffer=null;this.paintBlurBuffer=null;this.requestPaintRender();});
            canvas.addEventListener("dragover",event=>{if(event.dataTransfer?.types?.includes("text/joa-key")){event.preventDefault();event.dataTransfer.dropEffect="move";canvas.classList.add("drop-ready");}});
            canvas.addEventListener("dragleave",()=>canvas.classList.remove("drop-ready"));
            canvas.addEventListener("drop",async event=>{canvas.classList.remove("drop-ready");const key=event.dataTransfer?.getData("text/joa-key");if(!key)return;event.preventDefault();const point=this.renderer.groundFromScreen(event.clientX,event.clientY);if(!point||!localPointSafe(point.x,point.z)){notice("Piyon noktası sonlu bir dünya koordinatı değil.");return;}const placed=await this.bridge.placeJoAInventoryNodeOnMap?.(key,{x:point.x,z:point.z,layerKey:String(this.state.layerKey||"surface")});if(!placed){notice("Piyon sabitlenmiş olabilir. Önce sabitliğini gevşet.");return;}this.reloadWorldState();this.refreshEntities();const entity=this.entities.find(item=>String(item.sourceEntityKey||item.key)===String(key)||String(item.key)===String(placed.key||""));if(entity){this.worldSelected.clear();this.worldSelected.add(entity.key);this.controlledEntityKey=entity.key;this.state.controlledEntityKey=entity.key;}this.refreshAll();this.scheduleSave();notice("Karakter JoA dünyasına yerleştirildi.");});
            o.addEventListener("contextmenu",event=>{
                // Mevcudat satırları kendi sağ-tık davranışını yönetir.
                // Yakalama aşamasında olayı kesmek, satırın dal aç/kapat işlevini susturuyordu.
                if(event.target?.closest?.(".joa-tree-row,.joa-world-token,.joa-portable-row,.joa-portable-inventory"))return;
                event.preventDefault();event.stopPropagation();
            },true);
            window.addEventListener("alek:joa-entity-updated",this.onEntityUpdate=event=>{
                if(!this.overlay)return;
                if(event.detail?.hierarchyOnly){this.reloadWorldState();this.refreshEntities();this.refreshAll();return;}
                this.refreshAll();
            });
            this.bindTravelGroupInventoryEvents();
            window.addEventListener("alek:joa-travel-progress",this.onTravelProgress=event=>{if(!this.overlay||this.travelAnimating)return;const travel=event.detail?.travel;if(!travel?.movements?.length)return;void this.animateTravelMovements(travel.movements,{gameTime:event.detail?.gameTime,refreshState:true});});
            window.addEventListener("alek:joa-route-cancelled",this.onRouteCancelled=()=>{if(!this.overlay||this.travelCancelInFlight)return;this.reloadWorldState();this.refreshAll();});
            window.addEventListener("alek:joa-time-refreshed",this.onTimeRefreshed=event=>{if(!this.overlay)return;const clock=this.overlay.querySelector(".joa-clock strong");const info=this.bridge.getAdventureInfo?.();if(clock)clock.textContent=info?.gameTime||event.detail?.gameTime||clock.textContent;this.reloadWorldState();this.refreshAll();});
            window.addEventListener("alek:joa-map-image-selected",this.onMapImageSelected=event=>{if(!this.overlay||!event.detail?.path)return;const pending=Number(this.pendingImageLayerId),layerId=Number.isInteger(pending)?pending:undefined;this.pendingImageLayerId=null;void this.addMapImage(String(event.detail.path),layerId);});
            this.renderPalette();
        }
        onKeyDown(event){
            const target=event.target,editable=target&&((target.matches&&target.matches("input,textarea,select"))||target.isContentEditable);
            if(event.__joaHandled)return;
            if(event.key==="Tab"||event.code==="Tab"){event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();return;}
            const runeConfirm=this.overlay?.querySelector?.(".joa-rune-confirm");
            if(event.key==="Escape"&&runeConfirm){event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();runeConfirm.querySelector?.("[data-no]")?.click?.();return;}
            const staleVaultConfirm=document.querySelector(".seal-modal-overlay");
            if(event.key==="Escape"&&staleVaultConfirm){event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();this.inventorySelected.clear();staleVaultConfirm.querySelector?.(".cancel")?.click?.();if(staleVaultConfirm.isConnected)staleVaultConfirm.remove();this.renderInventory();notice("Takılı kalan silme penceresi ve seçim temizlendi.",2200);return;}
            if(editable)return;
            const key=String(event.key||"").toLowerCase(),plain=!event.ctrlKey&&!event.altKey&&!event.metaKey;
            if(this.inventoryPage){
                const targetContext=window.__ALEK_ITEM_TRANSFER_TARGET__;
                if(event.key==="Escape"&&targetContext?.active&&typeof targetContext.cancel==="function"){
                    event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
                    const cancel=targetContext.cancel;this.close({save:false});try{delete window.__ALEK_ITEM_TRANSFER_TARGET__;}catch(_){window.__ALEK_ITEM_TRANSFER_TARGET__=null;}queueMicrotask(()=>cancel());return;
                }
                if(event.key==="Escape"){
                    event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
                    // R16: Mevcudat üstünde K ile açılan Taksonomi yalnız kendini kapatır.
                    // Esc hiçbir zaman Map'e veya başka ana yüzeye geçiş değildir.
                    if(document.querySelector(".taxonomy-circle-shade.r70")){window.__alekCloseJoATaxonomy?.();return;}
                    if(this.inventoryPlaceIntent||this.inventoryFocusIntent){this.setInventoryCommand("");this.renderInventory();notice("Mevcudat komutu iptal edildi.",1600);return;}
                    if(this.travelMode||this.travelAnimating||this.groupGathering||this.travelPlans.size||this.activeTravelRoutes().length){if(this.inventorySelected.size){this.inventorySelected.clear();this.renderInventory();}void this.cancelAllTravel();return;}
                    if(this.inventorySelected.size){this.inventorySelected.clear();this.renderInventory();notice("Çoklu seçim temizlendi.",1800);}
                    return;
                }
                if(event.key==="Delete"&&this.inventorySelected.size){event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();void this.deleteSelectedInventory();return;}
                if(event.ctrlKey&&event.altKey&&!event.shiftKey&&!event.metaKey){if(this.inventorySelected.size){this.inventorySelected.clear();this.renderInventory();notice("Çoklu seçim temizlendi.",1800);}event.__joaHandled=true;event.preventDefault();return;}
                if(key==="f"&&event.ctrlKey&&!event.altKey&&!event.metaKey&&!event.shiftKey){this.setInventoryCommand("focus");this.renderInventory();notice("Bul komutu hazır · bir karta tıkla veya Esc ile iptal et.",1900);event.__joaHandled=true;event.preventDefault();event.stopPropagation();return;}
                if(key==="e"&&event.ctrlKey&&!event.altKey&&!event.metaKey&&!event.shiftKey){this.setInventoryCommand("place");this.renderInventory();notice("Yerleştir komutu hazır · bir karta tıkla veya Esc ile iptal et.",1900);event.__joaHandled=true;event.preventDefault();event.stopPropagation();return;}
                if(key==="k"&&plain&&!event.shiftKey){event.__joaHandled=true;event.preventDefault();event.stopPropagation();void this.createVarlik();return;}
                return;
            }
            if((key==="e"||key==="f")&&event.ctrlKey&&!event.altKey&&!event.metaKey&&!event.shiftKey){
                const inventoryCommand=key==="e"?"place":"focus";event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
                this.save();this.close({save:false});queueMicrotask(()=>this.open({force:true,inventoryOnly:true,inventoryCommand}));return;
            }
            if(key==="f"&&plain&&!event.shiftKey&&!this.paletteOpen){this.focusHeld=true;event.__joaHandled=true;event.preventDefault();return;}
            if(this.paletteOpen&&event.ctrlKey&&!event.altKey&&!event.metaKey&&!event.shiftKey&&key==="z"){event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();this.undoPaint();return;}
            // Ctrl + Alt, Ctrl ile biriktirilmiş bütün JoA seçimlerini tek hamlede temizler.
            // Girdi alanlarında AltGr yazımını bozmamak için düzenlenebilir hedefler yukarıda elenir.
            if(event.ctrlKey&&event.altKey&&!event.metaKey&&!event.shiftKey){
                const hadSelection=this.inventorySelected.size>0||this.worldSelected.size>0;
                if(hadSelection){
                    this.inventorySelected.clear();this.worldSelected.clear();
                    this.renderInventory();this.createMarkers();this.renderOverlay();
                    notice("Çoklu seçim temizlendi.",2200);
                    event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
                }
                return;
            }
            if(event.code==="ShiftLeft"||event.code==="ShiftRight"){if(!event.repeat){this.shiftTapCandidate=true;this.shiftTapStartedAt=performance.now();}return;}
            if(event.shiftKey)this.shiftTapCandidate=false;
            const taxonomyOpen=!!document.querySelector(".taxonomy-circle-shade.r70"),shortcutOpen=!!document.querySelector(".shortcut-atlas-shade"),radialOpen=!!document.querySelector(".alek-primary-radial-shade");
            if(taxonomyOpen){if(key==="escape"){event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();window.__alekCloseJoATaxonomy?.();}return;}
            if(shortcutOpen||radialOpen)return;
            if(plain&&!event.shiftKey&&/^(Digit|Numpad)[1-4]$/.test(event.code)){event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();const layer=({1:"surface",2:"sky",3:"underground",4:"cosmic"})[event.code.slice(-1)];void this.switchLayer(layer);return;}
            if(this.paletteOpen&&plain&&!event.shiftKey){
                if(key==="a"){event.__joaHandled=true;event.preventDefault();this.setPaintTool("eyedropper");return;}
                if(key==="f"){event.__joaHandled=true;event.preventDefault();this.setPaintTool("paint");return;}
                if(key==="e"){event.__joaHandled=true;event.preventDefault();this.setPaintTool("erase");return;}
            }
            if(key==="e"&&plain&&!event.shiftKey){this.ePlaceHeld=true;this.ePlaceIntentUntil=performance.now()+8000;this.overlay?.classList.add("enter-container-modifier");event.__joaHandled=true;event.preventDefault();event.stopPropagation();return;}
            if(key==="k"&&plain&&!event.shiftKey){event.__joaHandled=true;event.preventDefault();event.stopPropagation();void this.createMekanForPlacement();return;}
            if(key==="g"&&plain&&!event.shiftKey){event.__joaHandled=true;event.preventDefault();event.stopPropagation();this.createTravelGroup();return;}
            if(key==="t"&&plain&&!event.shiftKey){event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();const modal=window.__ALEK_JOURNEY_SIMULATION__?.openTimeCamp?.({fromJoA:true});if(modal?.shade){modal.shade.classList.add("joa-global-modal");document.body.appendChild(modal.shade);}return;}
            if(key==="b"&&plain){event.__joaHandled=true;event.preventDefault();event.stopPropagation();this.startEncounter();return;}
            if(key==="s"&&plain&&!event.shiftKey){event.__joaHandled=true;event.preventDefault();event.stopPropagation();this.toggleTravel();return;}
            if(event.key==="Delete"&&this.inventorySelected.size){event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();void this.deleteSelectedInventory();return;}
            if(event.key==="Delete"&&this.worldSelected.size===1){event.__joaHandled=true;event.preventDefault();event.stopPropagation();const entity=this.entities.find(item=>this.worldSelected.has(item.key));if(entity&&!entity.isTravelGroup)void this.removeEntityFromScene(entity);return;}
            if((event.code==="Space"||event.key===" ")&&this.travelMode){event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();if(this.routeDrawing){notice("Rotayı ikinci tıkla bitir, sonra Boşluk tuşuna bas.");return;}this.executeTravel();return;}
            if(event.key==="Escape"){event.__joaHandled=true;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();if(this.paintRegionDraft){this.cancelRegionBoundary();return;}if(this.pendingPlacement){this.pendingPlacement=null;this.overlay?.classList.remove("placement-mode");this.renderEmptyState();this.renderer?.invalidate();this.drawFog();notice("Haritaya yerleştirme iptal edildi.");return;}if(this.travelMode||this.travelAnimating||this.groupGathering||this.travelPlans.size||this.activeTravelRoutes().length){if(this.inventorySelected.size){this.inventorySelected.clear();this.renderInventory();}void this.cancelAllTravel();return;}if(this.inventorySelected.size){this.inventorySelected.clear();this.renderInventory();notice("Çoklu seçim temizlendi.",1800);return;}if(this.overlay.querySelector(".joa-portable-inventory")?.classList.contains("open")){this.closePortableInventory();return;}if(this.overlay.querySelector(".joa-inventory-drawer")?.classList.contains("open")){this.toggleInventory(false);return;}if(this.paletteOpen){this.setPaletteOpen(false);return;}if(this.worldSelected.size){this.worldSelected.clear();this.createMarkers();this.renderOverlay();return;}return;}
        }

        isDiscoveredPoint(point,margin=0){if(!point)return false;return this.discoveryRegions().some(region=>Math.hypot(Number(point.x)-region.x,Number(point.z)-region.z)<=Math.max(0,region.r+Number(margin||0)));}
        isDiscoveredSegment(from,to){
            if(!from||!to)return false;
            const dx=Number(to.x)-Number(from.x),dz=Number(to.z)-Number(from.z),distance=Math.hypot(dx,dz),step=4,count=Math.max(1,Math.ceil(distance/step));
            for(let index=0;index<=count;index++){const t=index/count;if(!this.isDiscoveredPoint({x:Number(from.x)+dx*t,z:Number(from.z)+dz*t}))return false;}
            return true;
        }
        focusWorldEntity(key){
            if(!this.renderer)return false;const target=String(key||""),find=()=>this.entities.find(item=>String(item.key)===target||String(item.sourceEntityKey||"")===target)||(target.startsWith("group:")?(()=>{const group=this.travelGroupRecord(target.slice(6));return group&&group.placedOnMap!==false&&String(group.parentKey||"root")==="root"&&String(group.layerKey||"surface")===String(this.state?.layerKey||"surface")?{...group,key:`group:${group.id}`,groupId:String(group.id),isTravelGroup:true,entityType:"travel-group"}:null;})():null);let entity=find();if(!entity){notice("Bu mevcudat yaşayan haritada bulunmuyor.");return false;}
            if(!localPointSafe(entity.x,entity.z)){const safe=this.safeLocalPointForLayer(entity.layerKey,entity.key),recovered=this.bridge.recoverJoAWorldPosition?.(entity.key,{x:Number(safe?.x)||0,z:Number(safe?.z)||0,layerKey:String(entity.layerKey||this.state?.layerKey||"surface")});if(!recovered){notice("Piyonun hassas konumu kurtarılamadı.",4200);return false;}this.reloadWorldState();this.refreshEntities();entity=find()||recovered;notice("Sayısal olarak bozulmuş piyon son geçerli yerel konuma döndürüldü.",3600);}
            const currentDistance=Math.max(.025,Number(this.renderer.camera.distance)||JOA_READABLE_CAMERA_DISTANCE),distance=currentDistance>JOA_LOCAL_INTERACTION_MAX_DISTANCE_M?clamp(Math.max(640,(Number(entity.visionRange)||240)*2.7),640,2400):currentDistance;
            if(!this.renderer.focusLocalPoint?.(Number(entity.x)||0,Number(entity.z)||0,distance))return false;this.worldSelected.clear();this.worldSelected.add(String(entity.key));this.controlledEntityKey=String(entity.key);this.state.controlledEntityKey=this.controlledEntityKey;this.mapCameraSnapshot={...this.renderer.camera};this.createMarkers();this.renderOverlay();this.scheduleSave();return true;
        }
        focusInventoryEntity(key){const sourceKey=String(key||""),entity=(this.allMapEntities||[]).find(item=>String(item.sourceEntityKey||item.key)===sourceKey),group=sourceKey.startsWith("group:")?this.travelGroupRecord(sourceKey.slice(6)):null,target=entity||(group&&group.placedOnMap!==false&&String(group.parentKey||"root")==="root"?{...group,key:`group:${group.id}`}:null);if(!target){notice("Bu yolcunun yaşayan haritada mühürlü bir konumu bulunmuyor.");return false;}const entityKey=String(target.key),layerKey=this.normalizeLayerKey(target.layerKey);this.close({save:false});queueMicrotask(()=>this.open({force:true,focusEntityKey:entityKey,focusLayerKey:layerKey}));return true;}
        partyStatus(){return this.bridge.getAdventurePartyStatus?.()||{key:"",characterCount:0,memberCount:0,ready:false,characterKeys:[],primaryKey:""};}
        selectPartyVisionMember(status=this.partyStatus()){
            const keys=new Set(Array.isArray(status.characterKeys)?status.characterKeys.map(String):[]);
            const preferred=String(status.primaryKey||"");
            const member=this.entities.find(item=>String(item.sourceEntityKey||"")===preferred)||this.entities.find(item=>keys.has(String(item.sourceEntityKey||"")));
            if(!member)return false;
            this.worldSelected.clear();this.worldSelected.add(member.key);this.controlledEntityKey=String(member.key||"");this.state.controlledEntityKey=this.controlledEntityKey;return true;
        }
        async confirmRune({title="Yol Mührü",message="Bu işlemi onaylıyor musun?",confirmText="Mühürle",cancelText="Vazgeç"}={}){return await new Promise(resolve=>{const shade=document.createElement("div");shade.className="joa-rune-confirm joa-global-modal";shade.innerHTML=`<section><i>✦</i><small>${escapeHtml(title)}</small><strong>${escapeHtml(message)}</strong><div><button type="button" data-no>${escapeHtml(cancelText)}</button><button type="button" data-yes>${escapeHtml(confirmText)}</button></div></section>`;let settled=false;const done=value=>{if(settled)return;settled=true;shade.remove();resolve(value);};shade.querySelector("[data-no]").onclick=()=>done(false);shade.querySelector("[data-yes]").onclick=()=>done(true);shade.onclick=event=>{if(event.target===shade)done(false);};this.overlay?.appendChild(shade);requestAnimationFrame(()=>shade.querySelector("[data-yes]")?.focus());});}
        async removeEntityFromScene(entity){if(!entity)return false;const ok=await this.confirmRune({title:"Harita Mührünü Kaldır",message:`${entity.name||"Bu piyon"} haritadan kaldırılsın mı? Kartı, alt kümeleri ve geçmişi korunacak.`,confirmText:"Haritadan Kaldır"});if(!ok)return false;const removed=await this.bridge.removeWorldMapEntity?.(entity.key);if(!removed){notice("Piyon haritadan kaldırılamadı.");return false;}this.worldSelected.delete(entity.key);this.reloadWorldState();this.refreshEntities();this.refreshAll();notice("Piyon haritadan kaldırıldı; Mevcudat kaydı korundu.");return true;}
        activatePendingPlacement(key){
            if(!key||!this.renderer)return false;
            const sourceKey=String(key),group=sourceKey.startsWith("group:")?this.travelGroupRecord(sourceKey.slice(6)):null,records=this.bridge.listJoAEntities?.()||[];
            if(group){if(group.pinned===true){notice(`${group.name||"Seyahat Grubu"} haritada sabit. Önce piyonun sabitliğini gevşet.`);return false;}this.pendingPlacement={sourceKey,existingKey:sourceKey,traveling:this.activeTravelRoutes().some(route=>String(route.key)===sourceKey),name:String(group.name||"Seyahat Grubu"),isTravelGroup:true,groupId:String(group.id)};this.overlay?.classList.add("placement-mode");this.renderEmptyState();this.renderer?.invalidate();this.drawFog();notice(`${this.pendingPlacement.name} elinde. Haritada yerleştireceğin noktaya tıkla; Mevcudat kartı korunur.`,4200);return true;}
            const record=records.find(item=>String(item.key)===sourceKey);
            if(!record){notice("Karakter bulunamadı.");return false;}
            const existing=this.entities.find(item=>String(item.sourceEntityKey||item.key)===sourceKey);
            if(existing?.pinned){notice(`${record.name||"Karakter"} haritada sabit. Önce piyonun sabitliğini gevşet.`);return false;}
            const active=this.activeTravelRoutes().find(route=>String(route.key)===String(existing?.key||""));
            this.pendingPlacement={sourceKey,existingKey:String(existing?.key||""),traveling:!!active,name:String(record.name||existing?.name||"Karakter"),isAdventureParty:false};
            this.overlay?.classList.add("placement-mode");
            this.renderEmptyState();this.renderer?.invalidate();this.drawFog();
            notice(active?`${this.pendingPlacement.name} yolda. Yeni noktaya tıklarsan kalan rota iptal edilir. Esc ile vazgeç.`:existing?`${this.pendingPlacement.name} haritada. Yeni konuma tıkla veya Esc ile vazgeç.`:`${this.pendingPlacement.name} elinde. Karanlık dahil istediğin noktaya yerleştir. Esc ile vazgeç.`,6500);
            return true;
        }

        setPaletteOpen(force){
            if(!this.overlay)return false;
            const next=typeof force==="boolean"?force:!this.paletteOpen;
            if(next!==this.paletteOpen)this.resetPaintUndo();
            this.paletteOpen=next;
            if(!next){
                this.paintRegionDraft=null;
            }
            this.setPaintMode(next,this.paintColor);
            this.renderPalette();
            const palette=this.overlay.querySelector(".joa-floating-palette");
            palette?.setAttribute("aria-hidden",String(!next));
            this.overlay.classList.toggle("palette-open",next);
            // Sınır çizgileri boya tuvalinin parçasıdır. Palet kapanınca tuvali
            // hemen yenilemezsek son kesik çerçeve ekranda donup kalır.
            this.renderPaint();
            return next;
        }
        currentPaintMeta(){
            const mapLayer=this.normalizeLayerKey(this.state?.layerKey);
            if(!this.state.pixelPaintMeta||typeof this.state.pixelPaintMeta!=="object")this.state.pixelPaintMeta={};
            let meta=this.state.pixelPaintMeta[mapLayer];
            if(!meta||typeof meta!=="object")meta=this.state.pixelPaintMeta[mapLayer]={};

            // R41 migration: old flat numbered layers become one named region.
            if(!Array.isArray(meta.regions)||!meta.layers||typeof meta.layers!=="object"){
                const legacyCount=Math.max(1,Array.isArray(meta.visibility)?meta.visibility.length:0,Array.isArray(meta.names)?meta.names.length:0);
                const legacyOrder=Array.isArray(meta.order)?meta.order.map(Number).filter(Number.isInteger):Array.from({length:legacyCount},(_,i)=>i);
                const ids=[...new Set([...legacyOrder,...Array.from({length:legacyCount},(_,i)=>i)])];
                const regionId="region-1";
                const layers={};
                for(const id of ids)layers[String(id)]={id,name:String(meta.names?.[id]||`Katman ${id+1}`),visible:meta.visibility?.[id]!==false,regionId};
                meta.regions=[{id:regionId,name:"Ana Bölge",visible:true,collapsed:false,bounds:null,layerOrder:ids}];
                meta.regionOrder=[regionId];meta.layers=layers;
                meta.activeRegionId=regionId;meta.activeLayerId=Number.isInteger(Number(meta.activeLayer))?Number(meta.activeLayer):ids[0];
                meta.nextLayerId=Math.max(...ids,0)+1;meta.nextRegionId=2;
            }

            if(!Array.isArray(meta.regionOrder))meta.regionOrder=meta.regions.map(region=>String(region.id));
            const regionById=new Map();
            meta.regions=meta.regions.filter(region=>region&&region.id!==undefined).map((region,index)=>{
                const id=String(region.id),clean={...region,id,name:String(region.name||`Bölge ${index+1}`),visible:region.visible!==false,collapsed:region.collapsed===true,bounds:region.bounds&&Number.isFinite(Number(region.bounds.minX))&&Number.isFinite(Number(region.bounds.maxX))&&Number.isFinite(Number(region.bounds.minZ))&&Number.isFinite(Number(region.bounds.maxZ))?{...region.bounds,minX:Number(region.bounds.minX),maxX:Number(region.bounds.maxX),minZ:Number(region.bounds.minZ),maxZ:Number(region.bounds.maxZ)}:null,layerOrder:Array.isArray(region.layerOrder)?region.layerOrder.map(Number).filter(Number.isInteger):[]};
                regionById.set(id,clean);return clean;
            });
            meta.regionOrder=[...new Set(meta.regionOrder.map(String).filter(id=>regionById.has(id)))];
            for(const region of meta.regions)if(!meta.regionOrder.includes(region.id))meta.regionOrder.push(region.id);
            if(!meta.regions.length){const region={id:"region-1",name:"Ana Bölge",visible:true,collapsed:false,bounds:null,layerOrder:[]};meta.regions=[region];meta.regionOrder=[region.id];regionById.set(region.id,region);}

            const normalizedLayers={};
            for(const [key,value] of Object.entries(meta.layers||{})){
                const id=Number(value?.id??key);if(!Number.isInteger(id))continue;
                let regionId=String(value?.regionId||meta.regionOrder[0]);if(!regionById.has(regionId))regionId=meta.regionOrder[0];
                normalizedLayers[String(id)]={...value,id,name:String(value?.name||`Katman ${id+1}`),visible:value?.visible!==false,regionId,kind:value?.kind==="image"?"image":"paint",imageId:String(value?.imageId||"")};
            }
            meta.layers=normalizedLayers;
            if(!Object.keys(meta.layers).length){const id=0,regionId=meta.regionOrder[0];meta.layers[String(id)]={id,name:"Zemin",visible:true,regionId,kind:"paint",imageId:""};regionById.get(regionId).layerOrder=[id];}

            const assigned=new Set();
            for(const regionId of meta.regionOrder){const region=regionById.get(regionId);region.layerOrder=[...new Set(region.layerOrder.filter(id=>meta.layers[String(id)]&&meta.layers[String(id)].regionId===regionId&&!assigned.has(id)))];for(const id of region.layerOrder)assigned.add(id);}
            for(const layer of Object.values(meta.layers)){if(assigned.has(layer.id))continue;const region=regionById.get(layer.regionId)||regionById.get(meta.regionOrder[0]);layer.regionId=region.id;region.layerOrder.push(layer.id);assigned.add(layer.id);}

            meta.activeRegionId=regionById.has(String(meta.activeRegionId))?String(meta.activeRegionId):meta.regionOrder[0];
            let activeLayer=Number(meta.activeLayerId);
            if(!Number.isInteger(activeLayer)||!meta.layers[String(activeLayer)])activeLayer=regionById.get(meta.activeRegionId)?.layerOrder?.[0];
            if(!Number.isInteger(activeLayer)){activeLayer=Number(Object.keys(meta.layers)[0]);meta.activeRegionId=meta.layers[String(activeLayer)].regionId;}
            const activeInfo=meta.layers[String(activeLayer)];if(activeInfo)meta.activeRegionId=activeInfo.regionId;
            meta.activeLayerId=activeLayer;
            meta.nextLayerId=Math.max(Number(meta.nextLayerId)||0,...Object.values(meta.layers).map(layer=>layer.id+1),1);
            meta.nextRegionId=Math.max(Number(meta.nextRegionId)||1,meta.regions.length+1);

            // R64 migration: PATCH74'te ayrı galeride duran görseller artık normal
            // Bölge/Katman ağacının parçasıdır. Her eski görsel bir resim katmanına
            // bağlanır; böylece sürükle-bırak sırası boya ve resim arasında ortaktır.
            if(meta.imageLayerMigrationR64!==true){
                const images=this.currentMapImages().filter(item=>String(item.layerKey||"surface")===mapLayer),fallbackRegion=regionById.get(meta.regionOrder[0]);
                for(const [index,image] of images.entries()){
                    let layer=Number.isInteger(Number(image.paintLayer))?meta.layers[String(Number(image.paintLayer))]:null;
                    if(!layer){const id=meta.nextLayerId++;layer={id,name:`Görsel ${index+1}`,visible:true,regionId:fallbackRegion.id,kind:"image",imageId:String(image.id)};meta.layers[String(id)]=layer;fallbackRegion.layerOrder.push(id);image.paintLayer=id;}
                    layer.kind="image";layer.imageId=String(image.id);image.paintLayer=layer.id;
                }
                meta.imageLayerMigrationR64=true;
            }

            // Mask sistemi tamamen kaldırıldı. Eski maske kayıtları bir kez temizlenir.
            if(meta.maskRecordsRemovedR41!==true){const records=this.currentPaintRecords();for(let i=records.length-1;i>=0;i--)if(String(records[i]?.kind||"paint")==="mask")records.splice(i,1);meta.maskRecordsRemovedR41=true;}

            this.paintActiveLayer=meta.activeLayerId;
            this.paintLayerVisibility=Object.values(meta.layers).map(layer=>layer.visible!==false);
            // Legacy alanları yalnız geriye dönük veri uyumu için güncel tut.
            meta.activeLayer=meta.activeLayerId;meta.order=meta.regionOrder.flatMap(id=>regionById.get(id)?.layerOrder||[]);
            return meta;
        }
        regionById(meta,regionId){return meta.regions.find(region=>String(region.id)===String(regionId))||meta.regions[0]||null;}
        activePaintRegion(meta=this.currentPaintMeta()){return this.regionById(meta,meta.activeRegionId);}
        activePaintLayer(meta=this.currentPaintMeta()){return meta.layers[String(meta.activeLayerId)]||null;}
        regionForLayer(meta,layerId){const layer=meta.layers[String(layerId)];return layer?this.regionById(meta,layer.regionId):null;}
        cancelPaintPointer({commit=false,render=false}={}){const pointer=this.paintPointer,pointerId=pointer?.pointerId,canvas=this.overlay?.querySelector?.(".joa-map-canvas");this.paintPointer=null;this.paintLastWorld=null;if(pointerId!==undefined&&pointerId!==null){try{canvas?.releasePointerCapture?.(pointerId);}catch(_){}}if(commit&&pointer?.mode==="paint")this.finishPaintStroke();else{this.paintStrokeUndo=null;this.paintStrokeChanged=false;}this.paintRecordKeyIndex=null;if(render)this.requestPaintRender();return!!pointer;}
        recoverInterruptedPaintStroke({render=true}={}){const pointer=this.paintPointer;if(!pointer)return false;const mode=pointer.mode;this.cancelPaintPointer({commit:mode==="paint",render:false});if(mode==="region"&&this.paintRegionDraft)this.cancelRegionBoundary();if(render)this.requestPaintRender();this.scheduleSave();return true;}
        releasePaintAuxiliaryPointers(){const canvas=this.overlay?.querySelector?.(".joa-map-canvas"),release=holder=>{const id=holder?.pointerId,target=holder?.captureTarget||canvas;if(id===undefined||id===null)return;try{target?.releasePointerCapture?.(id);}catch(_){}};release(this.brushAdjustDrag);release(this.palettePointer);if(this.paintLayerDrag?.custom)release(this.paintLayerDrag);this.brushAdjustDrag=null;this.palettePointer=null;this.finishLayerDrag();this.overlay?.querySelector?.(".joa-floating-palette")?.classList?.remove?.("is-dragging");}
        resetPaintUndo(){this.cancelPaintPointer();this.paintUndo=[];this.paintUndoScope="";}
        resetPaintLayerInteraction(){this.recoverInterruptedPaintStroke({render:false});this.resetPaintUndo();this.releasePaintAuxiliaryPointers();this.paintRegionDraft=null;if(this.paintTool==="region")this.paintTool="paint";if(this.paletteOpen&&!this.paintMode){this.paintMode=true;this.overlay?.classList?.add?.("paint-mode");}}
        syncActiveLayerInteraction(meta,layer){
            if(!layer){this.selectedMapImageId="";this.overlay?.classList?.remove?.("image-layer-active");return"paint";}
            const isImage=layer.kind==="image",region=this.regionForLayer(meta,layer.id),visible=layer.visible!==false&&region?.visible!==false;
            if(isImage){
                if(this.paintPointer)this.recoverInterruptedPaintStroke({render:false});
                this.paintTool="image";
                const image=this.mapImageForLayer?.(layer.id);
                this.selectedMapImageId=image&&visible&&image.locked!==true?String(image.id):"";
            }else{
                if(this.paintTool==="image"||this.paintTool==="region")this.paintTool="paint";
                this.selectedMapImageId="";
            }
            this.overlay?.classList?.toggle?.("image-layer-active",isImage);
            return isImage?"image":"paint";
        }
        imageLayerLocked(layerId){const record=this.mapImageForLayer?.(layerId);return !!record?.locked;}
        requireUnlockedImageLayer(layerId,message="Görsel kilitli · önce kilit mührünü aç."){if(!this.imageLayerLocked(layerId))return true;notice(message,2200);return false;}
        activatePaintLayer(meta,layerId,{reveal=true}={}){const layer=meta?.layers?.[String(Number(layerId))];if(!layer)return null;const region=this.regionForLayer(meta,layer.id);if(!region)return null;meta.activeRegionId=region.id;meta.activeLayerId=layer.id;this.paintActiveLayer=layer.id;if(reveal){region.visible=true;layer.visible=true;}this.syncActiveLayerInteraction(meta,layer);return{layer,region};}
        ensureActivePaintTarget(meta=this.currentPaintMeta(),{reveal=false,notifyReveal=false}={}){let target=this.activatePaintLayer(meta,meta.activeLayerId,{reveal:false});if(!target){const fallback=meta.regionOrder.flatMap(regionId=>this.regionById(meta,regionId)?.layerOrder||[]).find(id=>meta.layers[String(id)]);target=this.activatePaintLayer(meta,fallback,{reveal:false});}if(!target)return null;const wasHidden=target.region.visible===false||target.layer.visible===false;if(reveal&&wasHidden){target.region.visible=true;target.layer.visible=true;if(notifyReveal)notice(`${target.layer.name} yeniden görünür yapıldı; çizim bu katmana devam ediyor.`,2200);this.renderPalette();this.renderPaint();this.scheduleSave();}return target;}
        repairPaintRecords(meta=this.currentPaintMeta(),{force=false}={}){
            const records=this.currentPaintRecords(),validIds=Object.values(meta?.layers||{}).map(layer=>Number(layer.id)).filter(Number.isInteger).sort((a,b)=>a-b),signature=`${this.normalizeLayerKey(this.state?.layerKey)}|${validIds.join(",")}`;
            if(!force&&this.paintRecordRepairSignature===signature)return 0;
            this.paintRecordRepairSignature=signature;
            const valid=new Set(validIds),brushIds=new Set(PAINT_BRUSHES.map(brush=>brush.id)),fallback=Number(meta?.activeLayerId),fallbackId=valid.has(fallback)?fallback:validIds[0],seenKeys=new Set();
            let repaired=0;
            for(let index=records.length-1;index>=0;index--){
                const record=records[index];
                if(!record||typeof record!=="object"){records.splice(index,1);repaired++;continue;}

                // R57 data migration: erken 0,5 m denemeleri yalnız hücre indisi ve
                // grid snapshot'ı taşıyabiliyordu. Dünya koordinatını aynı snapshot'tan
                // geri kur; kayıtları geçersiz boya sanıp silme.
                const indexedGrid=Number.isInteger(Number(record.cellX))&&Number.isInteger(Number(record.cellZ));
                const gridLike=String(record.kind||"")==="grid-cell"||record.gridAligned===true||record.gridCell===true||indexedGrid&&Number.isFinite(Number(record.gridCellSizeM));
                if(gridLike){
                    const wasCanonical=String(record.kind||"")==="grid-cell"&&Number.isFinite(Number(record.x))&&Number.isFinite(Number(record.z))&&Number.isFinite(Number(record.gridCellSizeM))&&String(record.brushId||"")==="pixel-hard";
                    const cellSize=Math.max(.1,Number(record.gridCellSizeM)||Number(record.size)||.5),originX=Number.isFinite(Number(record.gridOriginX))?Number(record.gridOriginX):0,originZ=Number.isFinite(Number(record.gridOriginZ))?Number(record.gridOriginZ):0;
                    const cellX=indexedGrid?Number(record.cellX):Math.floor(((Number(record.x)||0)-originX)/cellSize),cellZ=indexedGrid?Number(record.cellZ):Math.floor(((Number(record.z)||0)-originZ)/cellSize);
                    const x=Number.isFinite(Number(record.x))?Number(record.x):originX+cellX*cellSize,z=Number.isFinite(Number(record.z))?Number(record.z):originZ+cellZ*cellSize,tile={tileX:Math.floor(cellX/256),tileZ:Math.floor(cellZ/256),tileKey:`${Math.floor(cellX/256)}:${Math.floor(cellZ/256)}`};
                    Object.assign(record,{kind:"grid-cell",x,z,size:cellSize,cellX,cellZ,gridOriginX:originX,gridOriginZ:originZ,gridCellSizeM:cellSize,tileX:Number(record.tileX??tile.tileX),tileZ:Number(record.tileZ??tile.tileZ),tileKey:String(record.tileKey||tile.tileKey),brushId:"pixel-hard",softness:0});
                    if(!wasCanonical)repaired++;
                }
                if(!Number.isFinite(Number(record.x))||!Number.isFinite(Number(record.z))){records.splice(index,1);repaired++;continue;}

                let layerId=Number(record.paintLayer);
                if(!Number.isInteger(layerId)||!valid.has(layerId)){
                    if(!Number.isInteger(fallbackId)){records.splice(index,1);repaired++;continue;}
                    layerId=fallbackId;record.paintLayer=fallbackId;record.key="";repaired++;
                }
                let size=Number(record.size);
                if(!Number.isFinite(size)||size<=0){size=1;record.size=1;repaired++;}
                else if(size>1000000){size=1000000;record.size=size;repaired++;}
                record.opacity=clamp01(record.opacity??1);
                record.softness=gridLike?0:clamp01(record.softness||0);
                if(!brushIds.has(record.brushId)){record.brushId="pixel-hard";record.key="";repaired++;}
                let key=String(record.key||"");
                if(gridLike){
                    const snapshot={originX:record.gridOriginX,originZ:record.gridOriginZ,cellSizeM:record.gridCellSizeM},cell={cellX:record.cellX,cellZ:record.cellZ};
                    const gridKey=`${layerId}|grid|${Number(record.gridOriginX).toFixed(6)}|${Number(record.gridOriginZ).toFixed(6)}|${Number(record.gridCellSizeM).toFixed(6)}|${Number(record.cellX)}|${Number(record.cellZ)}`;
                    if(key!==gridKey){key=gridKey;record.key=key;repaired++;}
                }else if(!key){
                    const quant=Math.max(.018,size*.30),qx=Math.round(Number(record.x)/quant)*quant,qz=Math.round(Number(record.z)/quant)*quant;
                    key=`${layerId}|paint|${qx.toFixed(3)}|${qz.toFixed(3)}|${size.toFixed(3)}|${record.brushId}`;record.key=key;repaired++;
                }
                if(seenKeys.has(key)){records.splice(index,1);repaired++;continue;}
                seenKeys.add(key);
            }
            if(repaired){this.paintRecordKeyIndex=null;this.scheduleSave();notice(`${repaired} bozuk, yinelenen veya sahipsiz boya kaydı onarıldı; fırça yeniden hazır.`,2800);}
            return repaired;
        }
        paintScopeKey(meta=this.currentPaintMeta()){return`${this.normalizeLayerKey(this.state?.layerKey)}|${meta.activeRegionId}|${meta.activeLayerId}`;}
        rebuildPaintRecordIndex(records=this.currentPaintRecords()){const index=new Map();for(const record of records){const key=String(record?.key||"");if(key)index.set(key,record);}this.paintRecordKeyIndex=index;return index;}
        beginPaintStroke(){if(this.paintPointer)this.recoverInterruptedPaintStroke({render:false});const meta=this.currentPaintMeta(),target=this.ensureActivePaintTarget(meta,{reveal:true,notifyReveal:true});if(!target){notice("Çizim için geçerli bir katman bulunamadı.",2200);return false;}if(target.layer.kind==="image"){notice("Bu katman Resim modunda · çizmek için katman türünü Çizim yap.",2200);return false;}this.repairPaintRecords(meta);const scope=this.paintScopeKey(meta);if(this.paintUndoScope!==scope){this.paintUndo=[];this.paintUndoScope=scope;}this.rebuildPaintRecordIndex();this.paintStrokeUndo={layerId:target.layer.id,before:new Map(),added:new Set()};this.paintStrokeChanged=false;return true;}
        finishPaintStroke(){const change=this.paintStrokeUndo;if(change&&this.paintStrokeChanged&&(change.before.size||change.added.size)){this.paintUndo.push({layerId:change.layerId,before:[...change.before.values()].map(record=>({...record})),added:[...change.added]});if(this.paintUndo.length>JOA_PAINT_UNDO_LIMIT)this.paintUndo.splice(0,this.paintUndo.length-JOA_PAINT_UNDO_LIMIT);}this.paintStrokeUndo=null;this.paintStrokeChanged=false;}
        undoPaint(){const meta=this.currentPaintMeta(),scope=this.paintScopeKey(meta);if(this.paintUndoScope!==scope||!this.paintUndo.length){notice("Bu katman oturumunda geri alınacak çizim yok.",1800);return false;}const change=this.paintUndo.pop(),records=this.currentPaintRecords(),added=new Set(change.added||[]);for(let i=records.length-1;i>=0;i--)if(added.has(String(records[i]?.key||"")))records.splice(i,1);const index=this.rebuildPaintRecordIndex(records);for(const saved of change.before||[]){const key=String(saved?.key||""),existing=key?index.get(key):null;if(existing)Object.assign(existing,saved);else{const restored={...saved};records.push(restored);if(key)index.set(key,restored);}}this.paintStrokeUndo=null;this.paintStrokeChanged=false;this.renderPaint();this.scheduleSave();notice("Son çizim geri alındı.",1500);return true;}
        pointInRegion(point,region){if(!region?.bounds)return true;const x=Number(point.x)||0,z=Number(point.z)||0,b=region.bounds;return x>=Math.min(b.minX,b.maxX)&&x<=Math.max(b.minX,b.maxX)&&z>=Math.min(b.minZ,b.maxZ)&&z<=Math.max(b.minZ,b.maxZ);}
        startRegionBoundary(regionId){const meta=this.currentPaintMeta(),region=this.regionById(meta,regionId);if(!region)return;meta.activeRegionId=region.id;if(region.layerOrder.length){meta.activeLayerId=region.layerOrder[0];this.paintActiveLayer=meta.activeLayerId;}this.resetPaintUndo();this.paintTool="region";this.paintRegionDraft={regionId:region.id,start:null,current:null,previousBounds:region.bounds?{...region.bounds}:null};this.brushPanelOpen=false;notice("Bölge sınırı: haritada bir köşeden karşı köşeye sürükle. Esc ile vazgeç.",4200);this.renderPalette();this.renderPaint();}
        cancelRegionBoundary(){if(!this.paintRegionDraft)return;const meta=this.currentPaintMeta(),region=this.regionById(meta,this.paintRegionDraft.regionId);if(region)region.bounds=this.paintRegionDraft.previousBounds?{...this.paintRegionDraft.previousBounds}:region.bounds;this.paintRegionDraft=null;this.paintTool="paint";this.renderPalette();this.renderPaint();}
        finishRegionBoundary(){const draft=this.paintRegionDraft;if(!draft?.start||!draft?.current)return this.cancelRegionBoundary();const meta=this.currentPaintMeta(),region=this.regionById(meta,draft.regionId);if(region){region.bounds={minX:Math.min(draft.start.x,draft.current.x),maxX:Math.max(draft.start.x,draft.current.x),minZ:Math.min(draft.start.z,draft.current.z),maxZ:Math.max(draft.start.z,draft.current.z)};notice(`${region.name} sınırı kaydedildi.`,1800);}this.paintRegionDraft=null;this.paintTool="paint";this.resetPaintUndo();this.renderPalette();this.renderPaint();this.scheduleSave();}
        applyRegionClip(ctx,region){if(!region?.bounds||!this.renderer)return false;const b=region.bounds,corners=[[b.minX,b.minZ],[b.maxX,b.minZ],[b.maxX,b.maxZ],[b.minX,b.maxZ]].map(([x,z])=>this.renderer.project(x,0,z));if(corners.some(point=>!point))return false;ctx.beginPath();ctx.moveTo(corners[0].x,corners[0].y);for(let i=1;i<corners.length;i++)ctx.lineTo(corners[i].x,corners[i].y);ctx.closePath();ctx.clip();return true;}
        selectedBrush(){return brushById(this.paintBrushId);}
        effectivePaintTool(){return this.paintTool;}
        setPaintTool(tool){const meta=this.currentPaintMeta(),active=meta.layers[String(meta.activeLayerId)],isImage=active?.kind==="image",allowed=new Set(["paint","eyedropper","erase","region","image"]);let next=allowed.has(tool)?tool:"paint";if(isImage)next="image";else if(next==="image")next="paint";this.paintTool=next;if(this.paintTool!=="region")this.paintRegionDraft=null;this.setPaintMode(true,this.paintColor);this.renderPalette();}



        setPaintColor(color){if(/^#[0-9a-f]{6}$/i.test(String(color||"")))this.paintColor=String(color).toLowerCase();this.paintTool="paint";this.syncPaletteLiveControls();}
        syncPaletteLiveControls(){const host=this.overlay?.querySelector(".joa-floating-palette");if(!host)return;const marker=host.querySelector(".joa-color-wheel i"),swatch=host.querySelector(".joa-current-color"),readouts=host.querySelectorAll(".joa-palette-readouts span b"),lightness=host.querySelector('[data-role="lightness"]'),opacity=host.querySelector('[data-role="opacity"]'),brushSize=host.querySelector('[data-role="brush-size"]'),softness=host.querySelector('[data-role="softness"]');if(marker){marker.style.left=`${clamp((94-(Number(this.paintLightness)||46))/88*100,0,100)}%`;marker.style.top=`${clamp((Number(this.paintHue)||0)/360*100,0,100)}%`;}if(swatch)swatch.style.setProperty("--paint",this.paintColor);if(readouts[0])readouts[0].textContent=String(Math.round(this.paintBrush));if(readouts[1])readouts[1].textContent=`${Math.round(this.paintSoftness)}%`;if(readouts[2])readouts[2].textContent=`${Math.round(this.paintOpacity)}%`;if(lightness&&String(lightness.value)!==String(this.paintLightness))lightness.value=String(this.paintLightness);if(opacity&&String(opacity.value)!==String(this.paintOpacity))opacity.value=String(this.paintOpacity);if(brushSize&&String(brushSize.value)!==String(this.paintBrush))brushSize.value=String(this.paintBrush);if(softness&&String(softness.value)!==String(this.paintSoftness))softness.value=String(this.paintSoftness);}
        setColorFromWheel(event,wheel){const rect=wheel.getBoundingClientRect(),x=clamp((event.clientX-rect.left)/Math.max(1,rect.width),0,1),y=clamp((event.clientY-rect.top)/Math.max(1,rect.height),0,1);this.paintHue=y*359.999;this.paintSaturation=88;this.paintLightness=94-x*88;this.paintColor=hslToHex(this.paintHue,this.paintSaturation,this.paintLightness);this.paintTool="paint";this.syncPaletteLiveControls();}
        onPalettePointerDown(event){
            const palette=this.overlay?.querySelector(".joa-floating-palette");if(!palette)return;
            const layerHandle=event.target.closest?.("[data-layer-drag]"),regionHandle=event.target.closest?.("[data-region-drag]");
            if(layerHandle||regionHandle){
                const type=layerHandle?"layer":"region",sourceNode=layerHandle?.closest(".joa-layer-row")||regionHandle?.closest(".joa-region-header"),label=sourceNode?.querySelector("input")?.value||sourceNode?.textContent?.trim()||"Katman";
                this.paintLayerDrag={type,layerId:layerHandle?Number(layerHandle.dataset.layerDrag):undefined,regionId:regionHandle?String(regionHandle.dataset.regionDrag||""):undefined,pointerId:event.pointerId,captureTarget:layerHandle||regionHandle,sourceNode,custom:true,drop:null};
                (layerHandle||regionHandle).setPointerCapture?.(event.pointerId);sourceNode?.classList.add("dragging");
                const ghost=document.createElement("div");ghost.className="joa-layer-drag-ghost";ghost.textContent=label;ghost.style.left=`${event.clientX+14}px`;ghost.style.top=`${event.clientY+12}px`;document.body.appendChild(ghost);this.paintLayerDragGhost=ghost;
                event.preventDefault();event.stopPropagation();return;
            }
            const wheel=event.target.closest?.(".joa-color-wheel");if(wheel){event.preventDefault();event.stopPropagation();this.palettePointer={mode:"color",pointerId:event.pointerId,wheel,captureTarget:wheel};wheel.setPointerCapture?.(event.pointerId);this.setColorFromWheel(event,wheel);return;}
            const handle=event.target.closest?.(".joa-palette-handle");if(handle&&!event.target.closest("button")){const rect=palette.getBoundingClientRect();this.palettePointer={mode:"drag",pointerId:event.pointerId,dx:event.clientX-rect.left,dy:event.clientY-rect.top,captureTarget:handle};handle.setPointerCapture?.(event.pointerId);palette.classList.add("is-dragging");event.preventDefault();event.stopPropagation();}
        }
        updatePalettePointer(event){
            const treeDrag=this.paintLayerDrag;
            if(treeDrag?.custom&&event.pointerId===treeDrag.pointerId){
                this.overlay?.querySelectorAll?.(".joa-layer-row.drop-before,.joa-layer-row.drop-after,.joa-region-card.drop-before,.joa-region-card.drop-after")?.forEach(node=>node.classList.remove("drop-before","drop-after"));
                if(this.paintLayerDragGhost){this.paintLayerDragGhost.style.left=`${event.clientX+14}px`;this.paintLayerDragGhost.style.top=`${event.clientY+12}px`;}
                const tree=this.overlay?.querySelector(".joa-layer-tree");
                if(tree){const rect=tree.getBoundingClientRect(),edge=34;if(event.clientY<rect.top+edge)tree.scrollTop-=14;else if(event.clientY>rect.bottom-edge)tree.scrollTop+=14;}
                const stack=document.elementsFromPoint?.(event.clientX,event.clientY)||[];let targetLayer=null,targetRegion=null;
                for(const node of stack){
                    const candidateLayer=node?.closest?.(".joa-layer-row[data-layer-id]"),candidateRegion=node?.closest?.(".joa-region-card[data-region-id]");
                    if(candidateLayer&&candidateLayer!==treeDrag.sourceNode){targetLayer=candidateLayer;targetRegion=candidateLayer.closest(".joa-region-card[data-region-id]");break;}
                    if(candidateRegion&&candidateRegion!==treeDrag.sourceNode?.closest?.(".joa-region-card[data-region-id]")){targetRegion=candidateRegion;break;}
                }
                if(targetLayer||targetRegion){const target=targetLayer||targetRegion,rect=target.getBoundingClientRect(),after=event.clientY>=rect.top+rect.height/2,targetRegionId=String((targetLayer?.closest(".joa-region-card")||targetRegion)?.dataset.regionId||"");treeDrag.drop={targetLayerId:targetLayer?Number(targetLayer.dataset.layerId):null,targetRegionId,after};target.classList.add(after?"drop-after":"drop-before");}
                event.preventDefault();event.stopPropagation();return;
            }
            const drag=this.palettePointer;if(!drag||event.pointerId!==drag.pointerId)return;
            if(drag.mode==="color"){this.setColorFromWheel(event,drag.wheel);event.preventDefault();return;}
            if(drag.mode==="drag"){const palette=this.overlay?.querySelector(".joa-floating-palette");if(!palette)return;const viewportWidth=document.documentElement.clientWidth||window.innerWidth,viewportHeight=document.documentElement.clientHeight||window.innerHeight,flyoutReserve=(this.brushPanelOpen||this.layerPanelOpen)?406:0,maxX=Math.max(0,viewportWidth-palette.offsetWidth),minX=Math.min(flyoutReserve,maxX),maxY=Math.max(72,viewportHeight-palette.offsetHeight),left=Math.round(clamp(event.clientX-drag.dx,minX,maxX)),top=Math.round(clamp(event.clientY-drag.dy,72,maxY));palette.style.left=`${left}px`;palette.style.top=`${top}px`;palette.style.right="auto";this.state.paintPalettePosition={left,top};event.preventDefault();event.stopPropagation();}
        }
        finishPalettePointer(event){
            const treeDrag=this.paintLayerDrag;
            if(treeDrag?.custom&&event.pointerId===treeDrag.pointerId){try{treeDrag.captureTarget?.releasePointerCapture?.(event.pointerId);}catch(_){}const drop=treeDrag.drop;if(drop)this.commitPaintTreeDrop(treeDrag,drop.targetRegionId,drop.targetLayerId,drop.after);this.finishLayerDrag();event.preventDefault();event.stopPropagation();return;}
            const drag=this.palettePointer;if(!drag||event.pointerId!==drag.pointerId)return;try{drag.captureTarget?.releasePointerCapture?.(event.pointerId);}catch(_){}this.overlay?.querySelector(".joa-floating-palette")?.classList.remove("is-dragging");this.palettePointer=null;this.scheduleSave();
        }
        clearLayerDropHints(){this.overlay?.querySelectorAll?.(".joa-layer-row.drop-before,.joa-layer-row.drop-after,.joa-region-card.drop-before,.joa-region-card.drop-after,.joa-layer-row.dragging,.joa-region-header.dragging")?.forEach(node=>node.classList.remove("drop-before","drop-after","dragging"));}
        onLayerDragStart(event){
            const layerHandle=event.target?.closest?.("[data-layer-drag]"),regionHandle=event.target?.closest?.("[data-region-drag]");
            if(layerHandle){const layerId=Number(layerHandle.dataset.layerDrag);if(!Number.isInteger(layerId))return;this.paintLayerDrag={type:"layer",layerId};layerHandle.closest(".joa-layer-row")?.classList.add("dragging");if(event.dataTransfer){event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/joa-paint-layer",String(layerId));}return;}
            if(regionHandle){const regionId=String(regionHandle.dataset.regionDrag||"");if(!regionId)return;this.paintLayerDrag={type:"region",regionId};regionHandle.closest(".joa-region-header")?.classList.add("dragging");if(event.dataTransfer){event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/joa-paint-region",regionId);}}
        }
        onLayerDragOver(event){
            if(!this.paintLayerDrag)return;
            const targetLayer=event.target?.closest?.(".joa-layer-row[data-layer-id]"),targetRegion=event.target?.closest?.(".joa-region-card[data-region-id]");
            if(!targetLayer&&!targetRegion)return;
            event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect="move";
            this.clearLayerDropHints();
            const target=targetLayer||targetRegion,rect=target.getBoundingClientRect(),after=event.clientY>=rect.top+rect.height/2;
            target.classList.add(after?"drop-after":"drop-before");
        }
        commitPaintTreeDrop(drag,targetRegionId,targetLayerId,after=false){
            const meta=this.currentPaintMeta(),targetRegion=this.regionById(meta,targetRegionId);if(!targetRegion)return false;
            if(drag.type==="region"){
                const sourceId=String(drag.regionId||"");if(!sourceId||sourceId===targetRegion.id)return false;const order=meta.regionOrder.filter(id=>id!==sourceId),index=order.indexOf(targetRegion.id);order.splice(clamp(index+(after?1:0),0,order.length),0,sourceId);meta.regionOrder=order;this.layerDragSuppressClickUntil=performance.now()+300;this.resetPaintLayerInteraction();this.renderMapImages();this.renderPaint();this.renderPalette();this.scheduleSave();return true;
            }
            const sourceId=Number(drag.layerId),source=meta.layers[String(sourceId)];if(!source)return false;const wasActive=meta.activeLayerId===sourceId;for(const region of meta.regions)region.layerOrder=region.layerOrder.filter(id=>id!==sourceId);let insertAt=targetRegion.layerOrder.length;if(Number.isInteger(targetLayerId)&&targetLayerId!==sourceId){const idx=targetRegion.layerOrder.indexOf(targetLayerId);insertAt=idx<0?targetRegion.layerOrder.length:idx+(after?1:0);}targetRegion.layerOrder.splice(clamp(insertAt,0,targetRegion.layerOrder.length),0,sourceId);source.regionId=targetRegion.id;if(wasActive)this.activatePaintLayer(meta,sourceId,{reveal:true});else this.ensureActivePaintTarget(meta);this.resetPaintLayerInteraction();this.layerDragSuppressClickUntil=performance.now()+300;this.renderMapImages();this.renderPaint();this.renderPalette();this.scheduleSave();notice(`${source.name} katmanı ${targetRegion.name} içine taşındı.`,1800);return true;
        }
        onLayerDrop(event){
            if(!this.paintLayerDrag||this.paintLayerDrag.custom)return;
            const targetLayer=event.target?.closest?.(".joa-layer-row[data-layer-id]"),targetRegionCard=event.target?.closest?.(".joa-region-card[data-region-id]");if(!targetLayer&&!targetRegionCard){this.finishLayerDrag();return;}
            event.preventDefault();event.stopPropagation();const targetRegionId=String((targetLayer?.closest(".joa-region-card")||targetRegionCard)?.dataset.regionId||""),targetLayerId=targetLayer?Number(targetLayer.dataset.layerId):null,target=targetLayer||targetRegionCard,rect=target.getBoundingClientRect(),after=event.clientY>=rect.top+rect.height/2;this.commitPaintTreeDrop(this.paintLayerDrag,targetRegionId,targetLayerId,after);this.finishLayerDrag();
        }
        finishLayerDrag(){this.clearLayerDropHints();this.paintLayerDragGhost?.remove();this.paintLayerDragGhost=null;this.paintLayerDrag=null;}
        async onPaletteClick(event){
            const input=event.target.closest?.("input");if(input)return;
            const button=event.target.closest?.("button"),layerRow=event.target.closest?.(".joa-layer-row[data-layer-id]"),regionCard=event.target.closest?.(".joa-region-card[data-region-id]");
            if(!button){if(layerRow){const meta=this.currentPaintMeta(),layerId=Number(layerRow.dataset.layerId),layer=meta.layers[String(layerId)];if(this.activatePaintLayer(meta,layerId,{reveal:true})){this.resetPaintLayerInteraction();this.renderPalette();this.renderMapImages();this.renderPaint();this.scheduleSave();if(layer?.kind==="image"&&Number(event.detail)>=2)this.openMapImagePicker(layerId);}}return;}
            if(performance.now()<this.layerDragSuppressClickUntil)return;
            if(button.dataset.action==="close-palette"){this.setPaletteOpen(false);return;}
            if(button.dataset.action==="toggle-brushes"){this.brushPanelOpen=!this.brushPanelOpen;this.layerPanelOpen=false;this.renderPalette();this.renderPaint();return;}
            if(button.dataset.action==="toggle-layers"){this.layerPanelOpen=!this.layerPanelOpen;this.brushPanelOpen=false;this.renderPalette();this.renderPaint();return;}
            if(button.dataset.tool){this.setPaintTool(button.dataset.tool);return;}
            if(button.dataset.brush){this.paintBrushId=button.dataset.brush;this.brushPanelOpen=false;this.setPaintMode(true,this.paintColor);this.renderPalette();return;}
            const meta=this.currentPaintMeta();
            if(button.dataset.action==="pick-layer-image"){const id=Number(meta.activeLayerId);this.openMapImagePicker(id);return;}
            if(button.dataset.action==="toggle-layer-kind"){const id=Number(button.dataset.layerId),layer=meta.layers[String(id)];if(!layer)return;if(layer.kind==="image"&&!this.requireUnlockedImageLayer(id,"Kilitli resim katmanının türü değiştirilemez · önce kilidi aç."))return;this.activatePaintLayer(meta,id,{reveal:true});layer.kind=layer.kind==="image"?"paint":"image";this.syncActiveLayerInteraction(meta,layer);this.resetPaintLayerInteraction();if(layer.kind==="image"&&!this.mapImageForLayer(id))this.openMapImagePicker(id);this.renderMapImages();this.renderPaint();this.renderPalette();this.scheduleSave();return;}
            if(button.dataset.action==="select-region"){const region=this.regionById(meta,button.dataset.regionId);if(region){const layerId=region.layerOrder.find(id=>meta.layers[String(id)]?.visible!==false)??region.layerOrder[0];region.visible=true;if(this.activatePaintLayer(meta,layerId,{reveal:true})){this.resetPaintLayerInteraction();this.renderPalette();this.renderMapImages();this.renderPaint();this.scheduleSave();}}return;}
            if(button.dataset.action==="toggle-region"){const region=this.regionById(meta,button.dataset.regionId);if(region){region.collapsed=!region.collapsed;this.renderPalette();this.scheduleSave();}return;}
            if(button.dataset.action==="region-visibility"){const region=this.regionById(meta,button.dataset.regionId);if(region){this.resetPaintLayerInteraction();region.visible=!region.visible;this.syncActiveLayerInteraction(meta,meta.layers[String(meta.activeLayerId)]);this.renderPalette();this.renderMapImages();this.renderPaint();this.scheduleSave();}return;}
            if(button.dataset.action==="set-region-bounds"){this.startRegionBoundary(button.dataset.regionId);return;}
            if(button.dataset.action==="add-region"){
                const id=`region-${meta.nextRegionId++}`,layerId=meta.nextLayerId++;
                const region={id,name:`Bölge ${meta.regions.length+1}`,visible:true,collapsed:false,bounds:null,layerOrder:[layerId]};meta.regions.push(region);meta.regionOrder.push(id);meta.layers[String(layerId)]={id:layerId,name:"Zemin",visible:true,regionId:id,kind:"paint",imageId:""};meta.activeRegionId=id;meta.activeLayerId=layerId;this.paintActiveLayer=layerId;this.resetPaintUndo();this.startRegionBoundary(id);this.scheduleSave();return;
            }
            if(button.dataset.action==="delete-region"){
                if(meta.regions.length<=1){notice("En az bir bölge kalmalı.");return;}
                const region=this.regionById(meta,button.dataset.regionId);if(!region)return;
                if(region.layerOrder.some(id=>this.imageLayerLocked(id))){notice("Bu bölgede kilitli bir resim var · bölgeyi silmeden önce kilidi aç.",2600);return;}
                const ok=await this.confirmRune({title:"Bölge Mührü",message:`${region.name} ve içindeki katmanlar silinsin mi? Bu işlem bu katmandaki çizimleri de kaldırır.`,confirmText:"Bölgeyi Sil",cancelText:"Vazgeç"});
                if(!ok)return;
                const records=this.currentPaintRecords(),ids=new Set(region.layerOrder);
                for(let i=records.length-1;i>=0;i--)if(ids.has(Number(records[i].paintLayer)||0))records.splice(i,1);
                this.state.mapImages=this.currentMapImages().filter(item=>String(item.layerKey||"surface")!==String(this.state.layerKey||"surface")||!ids.has(Number(item.paintLayer)));
                for(const id of ids)delete meta.layers[String(id)];
                meta.regions=meta.regions.filter(item=>item.id!==region.id);
                meta.regionOrder=meta.regionOrder.filter(id=>id!==region.id);
                const next=this.regionById(meta,meta.regionOrder[0]);
                if(!this.ensureActivePaintTarget(meta))this.activatePaintLayer(meta,next?.layerOrder?.[0],{reveal:true});
                this.ensureActivePaintTarget(meta,{reveal:true});this.resetPaintLayerInteraction();this.syncActiveLayerInteraction(meta,meta.layers[String(meta.activeLayerId)]);this.renderMapImages();this.renderPaint();this.renderPalette();this.scheduleSave();return;
            }
            if(button.dataset.action==="add-layer"){
                const region=this.regionById(meta,button.dataset.regionId||meta.activeRegionId);if(!region)return;const id=meta.nextLayerId++;meta.layers[String(id)]={id,name:`Katman ${region.layerOrder.length+1}`,visible:true,regionId:region.id,kind:"paint",imageId:""};region.layerOrder.push(id);region.collapsed=false;this.activatePaintLayer(meta,id,{reveal:true});this.resetPaintLayerInteraction();this.renderPalette();this.renderMapImages();this.renderPaint();this.scheduleSave();return;
            }
            if(button.dataset.action==="select-layer"){const id=Number(button.dataset.layerId);if(this.activatePaintLayer(meta,id,{reveal:true})){this.resetPaintLayerInteraction();this.renderPalette();this.renderMapImages();this.renderPaint();this.scheduleSave();}return;}
            if(button.dataset.action==="layer-visibility"){const id=Number(button.dataset.layerId),layer=meta.layers[String(id)];if(layer){this.resetPaintLayerInteraction();layer.visible=!layer.visible;if(Number(meta.activeLayerId)===id)this.syncActiveLayerInteraction(meta,layer);this.renderPalette();this.renderMapImages();this.renderPaint();this.scheduleSave();}return;}
            if(button.dataset.action==="clear-layer"){const id=Number(button.dataset.layerId),records=this.currentPaintRecords(),layer=meta.layers[String(id)];if(layer?.kind==="image"&&!this.requireUnlockedImageLayer(id,"Kilitli resim katmanı temizlenemez · önce kilidi aç."))return;this.resetPaintLayerInteraction();for(let i=records.length-1;i>=0;i--)if((Number(records[i].paintLayer)||0)===id)records.splice(i,1);this.state.mapImages=this.currentMapImages().filter(item=>String(item.layerKey||"surface")!==String(this.state.layerKey||"surface")||Number(item.paintLayer)!==id);if(layer)layer.imageId="";this.renderMapImages();this.renderPaint();this.renderPalette();this.scheduleSave();return;}
            if(button.dataset.action==="delete-layer"){
                const id=Number(button.dataset.layerId),layer=meta.layers[String(id)],region=layer?this.regionById(meta,layer.regionId):null;if(!layer||!region)return;if(layer.kind==="image"&&!this.requireUnlockedImageLayer(id,"Kilitli resim katmanı silinemez · önce kilidi aç."))return;if(region.layerOrder.length<=1){notice("Bir bölgede en az bir katman kalmalı.");return;}const wasActive=meta.activeLayerId===id,removedIndex=region.layerOrder.indexOf(id),records=this.currentPaintRecords();this.resetPaintLayerInteraction();for(let i=records.length-1;i>=0;i--)if((Number(records[i].paintLayer)||0)===id)records.splice(i,1);this.state.mapImages=this.currentMapImages().filter(item=>String(item.layerKey||"surface")!==String(this.state.layerKey||"surface")||Number(item.paintLayer)!==id);region.layerOrder=region.layerOrder.filter(value=>value!==id);delete meta.layers[String(id)];if(wasActive){const nextId=region.layerOrder[Math.min(Math.max(removedIndex,0),region.layerOrder.length-1)];this.activatePaintLayer(meta,nextId,{reveal:true});}else this.ensureActivePaintTarget(meta);this.renderMapImages();this.renderPaint();this.renderPalette();this.scheduleSave();return;
            }
        }
        onPaletteInput(event){
            const input=event.target;
            if(input.dataset.role==="lightness"){this.paintLightness=clamp(Number(input.value)||46,4,96);this.paintColor=hslToHex(this.paintHue,this.paintSaturation,this.paintLightness);this.syncPaletteLiveControls();return;}
            if(input.dataset.role==="opacity"){const value=Number(input.value);this.paintOpacity=clamp(Number.isFinite(value)?value:100,0,100);this.syncPaletteLiveControls();return;}
            if(input.dataset.role==="brush-size"){this.paintBrush=clamp(Number(input.value)||18,1,240);this.syncPaletteLiveControls();return;}
            if(input.dataset.role==="softness"){this.paintSoftness=clamp(Number(input.value)||0,0,100);this.syncPaletteLiveControls();return;}
            const meta=this.currentPaintMeta();
            if(input.dataset.regionName!==undefined){const region=this.regionById(meta,input.dataset.regionName);if(region){region.name=String(input.value||"").slice(0,80)||"İsimsiz Bölge";this.scheduleSave();}return;}
            if(input.dataset.layerName!==undefined){const layer=meta.layers[String(Number(input.dataset.layerName))];if(layer){layer.name=String(input.value||"").slice(0,80)||"İsimsiz Katman";this.scheduleSave();}return;}
        }
        renderPalette(){
            const host=this.overlay?.querySelector(".joa-floating-palette");if(!host)return;
            const meta=this.currentPaintMeta(),pos=this.state.paintPalettePosition,markerX=clamp((94-(Number(this.paintLightness)||46))/88*100,0,100),markerY=clamp((Number(this.paintHue)||0)/360*100,0,100),activeLayer=meta.layers[String(meta.activeLayerId)];this.syncActiveLayerInteraction(meta,activeLayer);const activeTool=this.effectivePaintTool(),imageMode=activeLayer?.kind==="image";
            if(pos&&Number.isFinite(pos.left)&&Number.isFinite(pos.top)){
                const viewportWidth=document.documentElement.clientWidth||window.innerWidth,viewportHeight=document.documentElement.clientHeight||window.innerHeight,paletteWidth=Math.min(330,Math.max(0,viewportWidth-16)),left=clamp(Number(pos.left),8,Math.max(8,viewportWidth-paletteWidth-8)),top=clamp(Number(pos.top),72,Math.max(72,viewportHeight-86));
                host.style.left=`${left}px`;host.style.top=`${top}px`;host.style.right="auto";this.state.paintPalettePosition={...pos,left,top};
            }
            host.dataset.layoutRevision="r109";host.dataset.behaviorRevision="r109";host.classList.toggle("open",this.paletteOpen);host.classList.toggle("brushes-open",this.brushPanelOpen);host.classList.toggle("layers-open",this.layerPanelOpen);this.overlay?.classList.toggle("image-layer-active",activeLayer?.kind==="image");
            const brushSigil=item=>`<i class="joa-brush-sigil brush-${item.shape}" style="--brush-hue:${Number(item.hue)||190}">${alekBrushSigilSvg(item)}</i>`;
            const regionTree=meta.regionOrder.map(regionId=>{const region=this.regionById(meta,regionId);if(!region)return"";const activeRegion=meta.activeRegionId===region.id;const layers=region.layerOrder.map(layerId=>{const layer=meta.layers[String(layerId)];if(!layer)return"";const active=meta.activeLayerId===layerId,isImage=layer.kind==="image",kindTitle=isImage?"Resim katmanı · tıklayınca Çizim olur · satıra çift tık resmi değiştirir":"Çizim katmanı · tıklayınca Resim olur";return`<div class="joa-layer-row ${active?"active":""} ${layer.visible?"":"hidden-layer"} ${isImage?"image-kind":"paint-kind"}" data-layer-id="${layerId}"><span class="joa-layer-drag-handle" data-layer-drag="${layerId}" title="Katmanı sürükle">⠿</span><button type="button" data-action="toggle-layer-kind" data-layer-id="${layerId}" class="joa-layer-kind" title="${kindTitle}">${isImage?"▧":"✎"}</button><button type="button" data-action="select-layer" data-layer-id="${layerId}" class="joa-layer-sigil" title="Katmanı seç">${active?"◆":"◇"}</button><input data-layer-name="${layerId}" value="${escapeHtml(layer.name)}" maxlength="80" aria-label="Katman adı"><button type="button" data-action="layer-visibility" data-layer-id="${layerId}" title="Göster / gizle">${layer.visible?"◉":"○"}</button><button type="button" data-action="clear-layer" data-layer-id="${layerId}" title="Katman içeriğini temizle">⌫</button><button type="button" data-action="delete-layer" data-layer-id="${layerId}" title="Katmanı sil">−</button></div>`;}).join("");return`<section class="joa-region-card ${activeRegion?"active":""} ${region.visible?"":"hidden-region"}" data-region-id="${escapeHtml(region.id)}"><header class="joa-region-header"><span class="joa-region-drag-handle" data-region-drag="${escapeHtml(region.id)}" title="Bölgeyi sürükle">✥</span><button type="button" data-action="toggle-region" data-region-id="${escapeHtml(region.id)}" title="Katmanları aç / kapat">${region.collapsed?"▸":"▾"}</button><button type="button" data-action="select-region" data-region-id="${escapeHtml(region.id)}" class="joa-region-sigil" title="Bölgeyi seç">${activeRegion?"⬢":"⬡"}</button><input data-region-name="${escapeHtml(region.id)}" value="${escapeHtml(region.name)}" maxlength="80" aria-label="Bölge adı"><button type="button" data-action="set-region-bounds" data-region-id="${escapeHtml(region.id)}" title="Haritada bölge sınırı çiz">⌗</button><button type="button" data-action="region-visibility" data-region-id="${escapeHtml(region.id)}" title="Bölgeyi göster / gizle">${region.visible?"◉":"○"}</button><button type="button" data-action="add-layer" data-region-id="${escapeHtml(region.id)}" title="Bu bölgeye katman ekle">＋</button><button type="button" data-action="delete-region" data-region-id="${escapeHtml(region.id)}" title="Bölgeyi sil">−</button></header>${region.collapsed?"":`<div class="joa-region-layers">${layers}</div>`}</section>`;}).join("");
            host.innerHTML=`<header class="joa-palette-handle"><strong>Harita Paleti</strong><button type="button" data-action="close-palette" title="Kapat">×</button></header><div class="joa-palette-body"><nav class="joa-palette-toolrail"><button type="button" data-action="toggle-brushes" class="${this.brushPanelOpen?"active":""}" title="24 Alekrythae fırça mührü" ${imageMode?"disabled":""}>${alekToolSigil("brushes")}</button><button type="button" ${imageMode?'data-action="pick-layer-image"':'data-tool="paint"'} class="tool-normal ${imageMode?"tool-image-active":""} ${(activeTool==="paint"||activeTool==="image")?"active":""}" title="${imageMode?"Galeriden görsel seç veya değiştir":"Çiz"}">${alekToolSigil(imageMode?"gallery":"paint")}</button><button type="button" data-tool="eyedropper" class="tool-eyedropper ${activeTool==="eyedropper"?"active":""}" title="Renk al" ${imageMode?"disabled":""}>${alekToolSigil("eyedropper")}</button><button type="button" data-tool="erase" class="tool-erase ${activeTool==="erase"?"active":""}" title="Sil" ${imageMode?"disabled":""}>${alekToolSigil("erase")}</button><button type="button" data-action="toggle-layers" class="${this.layerPanelOpen?"active":""}" title="Bölge ve katmanlar">${alekToolSigil("layers")}</button></nav><section class="joa-color-section"><div class="joa-color-field joa-color-wheel" style="--hue:${this.paintHue}deg;--sat:${this.paintSaturation}%;--light:${this.paintLightness}%"><i style="left:${markerX}%;top:${markerY}%"></i></div><div class="joa-color-controls"><i class="joa-current-color" style="--paint:${this.paintColor}" title="Seçili renk"></i><label class="joa-slider-line" title="Aydınlık / karanlık"><span>☀</span><input data-role="lightness" type="range" min="4" max="96" value="${this.paintLightness}"></label><label class="joa-slider-line" title="Fırça boyutu"><span>↕</span><input data-role="brush-size" type="range" min="1" max="240" value="${this.paintBrush}"></label><label class="joa-slider-line" title="Yumuşaklık"><span>≈</span><input data-role="softness" type="range" min="0" max="100" value="${this.paintSoftness}"></label><label class="joa-slider-line" title="Saydamlık"><span>◐</span><input data-role="opacity" type="range" min="0" max="100" value="${this.paintOpacity}"></label><div class="joa-palette-readouts"><span>Boyut <b>${Math.round(this.paintBrush)}</b></span><span>Yumuşak <b>${Math.round(this.paintSoftness)}%</b></span><span>Opak <b>${Math.round(this.paintOpacity)}%</b></span></div></div></section><section class="joa-brush-flyout" aria-label="24 Alekrythae fırça mührü">${PAINT_BRUSHES.map(item=>`<button type="button" data-brush="${item.id}" class="${item.id===this.paintBrushId?"active":""}" title="${escapeHtml(item.label)}" style="--brush-hue:${Number(item.hue)||190}">${brushSigil(item)}</button>`).join("")}</section><section class="joa-layer-popup" aria-label="Bölgeler ve çizim/resim katmanları"><header class="joa-layer-popup-title"><div><strong>Bölgeler ve Katmanlar</strong><small>Aşağıdaki üstte görünür · ✎ Çizim · ▧ Resim · sürükle bırak</small></div><button type="button" data-action="add-region" title="Yeni bölge">＋ Bölge</button></header><div class="joa-layer-tree">${regionTree}</div></section></div>`;
            requestAnimationFrame(()=>{if(!host.isConnected)return;const viewportWidth=document.documentElement.clientWidth||window.innerWidth,viewportHeight=document.documentElement.clientHeight||window.innerHeight,rect=host.getBoundingClientRect(),left=clamp(rect.left,8,Math.max(8,viewportWidth-rect.width-8)),top=clamp(rect.top,72,Math.max(72,viewportHeight-rect.height-8));if(Math.abs(left-rect.left)>.5||Math.abs(top-rect.top)>.5){host.style.left=`${left}px`;host.style.top=`${top}px`;host.style.right="auto";this.state.paintPalettePosition={left:Math.round(left),top:Math.round(top)};this.scheduleSave();}});
            if(this.brushPanelOpen||this.layerPanelOpen){requestAnimationFrame(()=>{if(!host.isConnected)return;const flyout=host.querySelector(this.brushPanelOpen?".joa-brush-flyout":".joa-layer-popup"),rect=host.getBoundingClientRect(),flyoutWidth=flyout?.offsetWidth||430;if(rect.left<flyoutWidth+8){const left=Math.min(Math.max(flyoutWidth+8,0),Math.max(0,window.innerWidth-host.offsetWidth-8));host.style.left=`${left}px`;host.style.right="auto";this.state.paintPalettePosition={left,top:Math.round(rect.top)};}});}
        }
        currentMapImages(){if(!this.state)this.state={};this.state.mapImages=this.normalizeMapImages(this.state.mapImages);return this.state.mapImages;}
        mapImageForLayer(layerId){const id=Number(layerId);if(!Number.isInteger(id))return null;const worldLayer=String(this.state?.layerKey||"surface"),meta=this.state?.pixelPaintMeta?.[worldLayer]||this.state?.paintMeta?.[worldLayer]||null,layer=meta?.layers?.[String(id)]||null,images=this.currentMapImages().filter(item=>String(item.layerKey||"surface")===worldLayer);if(layer?.imageId){const byId=images.find(item=>String(item.id)===String(layer.imageId));if(byId){if(Number(byId.paintLayer)!==id)byId.paintLayer=id;return byId;}}const byLayer=images.find(item=>Number(item.paintLayer)===id)||null;if(byLayer&&layer&&String(layer.imageId||"")!==String(byLayer.id))layer.imageId=String(byLayer.id);return byLayer;}
        openMapImagePicker(layerId=this.currentPaintMeta()?.activeLayerId){const id=Number(layerId);if(!Number.isInteger(id))return false;const meta=this.currentPaintMeta(),layer=meta.layers[String(id)];if(!layer)return false;if(this.imageLayerLocked(id)){notice("Görsel kilitli · resmi değiştirmek için önce kilidi aç.",2400);return false;}this.activatePaintLayer(meta,id,{reveal:true});layer.kind="image";this.syncActiveLayerInteraction(meta,layer);this.pendingImageLayerId=id;const opened=this.bridge.openJoAMapImagePicker?.();if(!opened){this.pendingImageLayerId=null;notice("Diyar görseli seçicisi açılamadı.");}this.renderPalette();return!!opened;}
        async imageAspect(path){return await new Promise(resolve=>{const image=new Image(),url=this.bridge.resolveJoAMediaUrl?.(path)||`https://alek-assets.local/${String(path).replace(/^\/+/,"")}`;let done=false;const finish=value=>{if(done)return;done=true;resolve(value);};image.onload=()=>finish(image.naturalWidth&&image.naturalHeight?image.naturalWidth/image.naturalHeight:16/9);image.onerror=()=>finish(16/9);image.src=url;setTimeout(()=>finish(16/9),2500);});}
        async addMapImage(path,layerId){if(!path)return false;const meta=this.currentPaintMeta(),id=Number.isInteger(Number(layerId))?Number(layerId):Number(meta.activeLayerId),layer=meta.layers[String(id)];if(!layer)return false;if(this.imageLayerLocked(id)){notice("Görsel kilitli · yeni resim uygulanmadı.",2200);this.pendingImageLayerId=null;return false;}this.activatePaintLayer(meta,id,{reveal:true});layer.kind="image";this.syncActiveLayerInteraction(meta,layer);const view=this.renderer.lastView||this.renderer.viewport(),aspect=clamp(await this.imageAspect(path),.08,12),point=localPointSafe(this.lastMapWorldPoint?.x,this.lastMapWorldPoint?.z)?this.lastMapWorldPoint:{x:Number(this.renderer.camera.targetX)||0,z:Number(this.renderer.camera.targetZ)||0},now=new Date().toISOString();let record=this.mapImageForLayer(id);if(record){record.path=String(path);record.heightM=clamp(clamp(Number(record.widthM)||320,.1,JOA_MAP_IMAGE_MAX_M)/aspect,.1,JOA_MAP_IMAGE_MAX_M);record.updatedAt=now;}else{const widthM=clamp(Number(view.halfW)*.72,5,JOA_MAP_IMAGE_MAX_M),heightM=clamp(widthM/aspect,.1,JOA_MAP_IMAGE_MAX_M);record={id:`map-image-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,path:String(path),layerKey:String(this.state.layerKey||"surface"),paintLayer:id,x:Number(point.x)||0,z:Number(point.z)||0,widthM,heightM,locked:false,opacity:1,createdAt:now,updatedAt:now};this.currentMapImages().push(record);}record.paintLayer=id;layer.imageId=record.id;this.selectedMapImageId=record.id;this.pendingImageLayerId=null;this.renderMapImages();this.renderPaint();this.renderPalette();this.scheduleSave();notice("Resim katmana bağlandı · sürükle, köşeden boyutlandır veya katman gözünden gizle.",3600);return true;}
        mapImageRecord(id){return this.currentMapImages().find(item=>String(item.id)===String(id))||null;}
        mapImageIcon(kind){if(kind==="lock")return'<svg viewBox="0 0 32 32"><path d="M9 14h14v12H9Z"/><path d="M12 14V9a4 4 0 0 1 8 0v5"/><circle cx="16" cy="20" r="1.5"/></svg>';if(kind==="unlock")return'<svg viewBox="0 0 32 32"><path d="M9 14h14v12H9Z"/><path d="M12 14V9a4 4 0 0 1 7-2.6"/><circle cx="16" cy="20" r="1.5"/></svg>';return'<svg viewBox="0 0 32 32"><path d="M9 10h14M12 10l1 16h6l1-16M13 7h6"/></svg>';}
        renderMapImages(){
            const host=this.overlay?.querySelector(".joa-map-images");if(!host||!this.renderer)return;
            const view=this.renderer.lastView||this.renderer.viewport(),meta=this.currentPaintMeta(),activeLayer=meta.layers[String(meta.activeLayerId)];
            this.syncActiveLayerInteraction(meta,activeLayer);
            host.style.transform="";host.style.transformOrigin="0 0";
            const active=this.currentMapImages().filter(item=>String(item.layerKey||"surface")===String(this.state.layerKey||"surface")),living=new Set(active.map(item=>String(item.id)));
            for(const [id,node] of this.mapImageNodes)if(!living.has(id)){node.remove();this.mapImageNodes.delete(id);}
            for(const record of active){
                const layer=meta.layers[String(Number(record.paintLayer))],region=layer?this.regionForLayer(meta,layer.id):null,layerEligible=!!layer&&layer.kind==="image"&&layer.visible!==false&&region?.visible!==false,activeLayerImage=layerEligible&&Number(layer.id)===Number(meta.activeLayerId),editable=activeLayerImage&&this.paintMode&&record.locked!==true;
                let node=this.mapImageNodes.get(String(record.id));
                if(!node){
                    node=document.createElement("article");node.className="joa-map-image-item";node.dataset.id=String(record.id);node.tabIndex=-1;
                    node.innerHTML='<img draggable="false" alt="Diyar görseli"><div class="joa-map-image-controls"><button type="button" data-image-action="lock" aria-label="Görseli kilitle"></button><button type="button" data-image-action="delete" aria-label="Görseli kaldır"></button></div><button type="button" class="joa-map-image-resize" data-image-action="resize" aria-label="Görseli boyutlandır"><i></i></button>';
                    node.addEventListener("pointerdown",event=>this.beginMapImagePointer(event,String(record.id)));
                    node.addEventListener("click",event=>{const button=event.target.closest?.("[data-image-action]");if(!button)return;event.preventDefault();event.stopPropagation();void this.onMapImageAction(String(record.id),button.dataset.imageAction);});
                    host.appendChild(node);this.mapImageNodes.set(String(record.id),node);
                }
                const p=this.renderer.worldToScreen(view,record.x,record.z),rawWidth=Math.max(.01,record.widthM*view.scale),rawHeight=Math.max(.01,record.heightM*view.scale),offscreen=p.x+rawWidth/2<-80||p.x-rawWidth/2>view.width+80||p.y+rawHeight/2<-80||p.y-rawHeight/2>view.height+80;
                node.hidden=offscreen||!layerEligible;
                node.classList.toggle("active-layer-image",activeLayerImage);node.classList.toggle("editable",editable);node.classList.toggle("passive",!editable);node.classList.toggle("locked",record.locked===true);node.classList.toggle("selected",editable&&String(record.id)===String(this.selectedMapImageId));
                if(node.hidden)continue;
                node.dataset.layerId=String(layer.id);node.dataset.editable=editable?"true":"false";node.style.left=`${p.x}px`;node.style.top=`${p.y}px`;node.style.width=`${clamp(rawWidth,.01,200000)}px`;node.style.height=`${clamp(rawHeight,.01,200000)}px`;node.style.opacity="1";
                const image=node.querySelector("img"),url=this.bridge.resolveJoAMediaUrl?.(record.path)||`https://alek-assets.local/${String(record.path).replace(/^\/+/,"")}`;
                if(image&&image.dataset.path!==record.path){image.dataset.path=record.path;image.onload=()=>this.requestPaintRender();image.onerror=()=>this.requestPaintRender();image.src=url;}
                const lock=node.querySelector('[data-image-action="lock"]');if(lock){lock.innerHTML=this.mapImageIcon(record.locked?"unlock":"lock");lock.title=record.locked?"Kilidi aç":"Konumu ve boyutu kilitle";}
                const remove=node.querySelector('[data-image-action="delete"]');if(remove){remove.innerHTML=this.mapImageIcon("delete");remove.disabled=record.locked===true;remove.title=record.locked?"Kilitli görsel silinemez · önce kilidi aç":"Bu katmandaki resmi kaldır";}
                const resize=node.querySelector('[data-image-action="resize"]');if(resize){resize.disabled=!editable;resize.title=record.locked?"Kilitli görsel boyutlandırılamaz · önce kilidi aç":editable?"Görseli boyutlandır":"Önce bu resim katmanını seç";}
            }
            this.renderer.imageView={...view};
        }
        beginMapImagePointer(event,id){
            if(event.button!==0)return;const record=this.mapImageRecord(id);if(!record)return;
            const meta=this.currentPaintMeta(),layer=meta.layers[String(Number(record.paintLayer))],region=layer?this.regionForLayer(meta,layer.id):null,action=event.target.closest?.("[data-image-action]")?.dataset.imageAction;
            if(!layer||layer.kind!=="image"||layer.visible===false||region?.visible===false||Number(meta.activeLayerId)!==Number(layer.id))return;
            if(action&&action!=="resize"){event.stopPropagation();return;}
            if(record.locked){event.preventDefault();event.stopPropagation();return;}
            this.selectedMapImageId=String(record.id);this.renderMapImages();
            event.preventDefault();event.stopPropagation();
            const node=this.mapImageNodes.get(String(record.id)),rect=node?.getBoundingClientRect(),mode=action==="resize"?"resize":"move";
            this.mapImageDrag={pointerId:event.pointerId,id:String(record.id),mode,lastX:event.clientX,lastY:event.clientY,startWidth:record.widthM,startHeight:record.heightM,centerX:rect?rect.left+rect.width/2:event.clientX,centerY:rect?rect.top+rect.height/2:event.clientY,startRadius:Math.max(8,Math.hypot(event.clientX-(rect?rect.left+rect.width/2:event.clientX-8),event.clientY-(rect?rect.top+rect.height/2:event.clientY-8)))};
            try{node?.setPointerCapture?.(event.pointerId);}catch(_){}node?.classList.add("dragging");
        }
        updateMapImagePointer(event){const drag=this.mapImageDrag;if(!drag||drag.pointerId!==event.pointerId)return;const record=this.mapImageRecord(drag.id),view=this.renderer?.lastView||this.renderer?.viewport();if(!record||!view)return;if(record.locked){const node=this.mapImageNodes.get(drag.id);try{node?.releasePointerCapture?.(event.pointerId);}catch(_){}node?.classList.remove("dragging");this.mapImageDrag=null;return;}if(drag.mode==="move"){record.x+=(event.clientX-drag.lastX)/view.scale;record.z+=(event.clientY-drag.lastY)/view.scale;drag.lastX=event.clientX;drag.lastY=event.clientY;}else{const radius=Math.max(4,Math.hypot(event.clientX-drag.centerX,event.clientY-drag.centerY)),factor=clamp(radius/drag.startRadius,.02,50);record.widthM=clamp(drag.startWidth*factor,.1,JOA_MAP_IMAGE_MAX_M);record.heightM=clamp(drag.startHeight*factor,.1,JOA_MAP_IMAGE_MAX_M);}record.updatedAt=new Date().toISOString();this.renderMapImages();this.requestPaintRender();event.preventDefault();event.stopPropagation();}
        finishMapImagePointer(event){const drag=this.mapImageDrag;if(!drag||drag.pointerId!==event.pointerId)return;const node=this.mapImageNodes.get(drag.id);try{node?.releasePointerCapture?.(event.pointerId);}catch(_){}node?.classList.remove("dragging");this.mapImageDrag=null;this.requestPaintRender();this.scheduleSave();event.preventDefault?.();event.stopPropagation?.();}
        async onMapImageAction(id,action){const record=this.mapImageRecord(id);if(!record)return false;if(action==="lock"){record.locked=!record.locked;if(record.locked&&String(this.mapImageDrag?.id||"")===String(record.id)){const drag=this.mapImageDrag,node=this.mapImageNodes.get(String(record.id));try{node?.releasePointerCapture?.(drag.pointerId);}catch(_){}node?.classList.remove("dragging");this.mapImageDrag=null;}record.updatedAt=new Date().toISOString();this.selectedMapImageId=record.locked?"":String(record.id);this.renderMapImages();this.scheduleSave();notice(record.locked?"Diyar görseli kilitlendi · çerçeve ve tüm dönüşüm etkileşimi kapalı.":"Diyar görselinin kilidi açıldı.",2200);return true;}if(action==="delete"){if(record.locked){notice("Görsel kilitli · silmeden önce kilidi aç.",2200);return false;}const ok=await this.confirmRune({title:"Resim Katmanı",message:"Bu resim katmandan kaldırılsın mı? Kaynak fotoğraf dosyası silinmez.",confirmText:"Resmi Kaldır",cancelText:"Vazgeç"});if(!ok)return false;const meta=this.currentPaintMeta(),layer=meta.layers[String(Number(record.paintLayer))];this.state.mapImages=this.currentMapImages().filter(item=>String(item.id)!==String(id));if(layer&&String(layer.imageId||"")===String(id))layer.imageId="";this.selectedMapImageId="";this.renderMapImages();this.renderPaint();this.renderPalette();this.scheduleSave();return true;}return false;}
        samplePaintColor(point){const records=this.currentPaintRecords(),meta=this.currentPaintMeta(),region=this.activePaintRegion(meta);for(let i=records.length-1;i>=0;i--){const record=records[i];if(String(record.kind||"paint")==="mask"||!this.pointInRegion(record,region))continue;if(String(record.kind||"")==="grid-cell"){const size=Math.max(.1,Number(record.gridCellSizeM)||Number(record.size)||.5),x=Number(record.x)||0,z=Number(record.z)||0;if(point.x>=x&&point.x<x+size&&point.z>=z&&point.z<z+size)return String(record.color||this.paintColor);continue;}const radius=Math.max(Number(record.size)||1,this.paintWorldSize())*.7;if(Math.hypot(Number(record.x)-point.x,Number(record.z)-point.z)<=radius)return String(record.color||this.paintColor);}const rgb=this.renderer?.colorAt?.(point.x,point.z,1)||[255,255,255];return`#${rgb.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,"0")).join("")}`;}
        async placeInventoryEntityOnMap(key){if(!key)return false;if(this.inventoryPage){const sourceKey=String(key);this.close({save:false});queueMicrotask(()=>this.open({force:true,pendingPlacementKey:sourceKey}));return true;}return this.activatePendingPlacement(key);}
        async commitPendingPlacement(point){
            const pending=this.pendingPlacement;if(!pending||!point)return false;
            // PATCH93/PATCH92 completion: Piyon yerleştirme boya gibi yerel bir işlem
            // değildir. Ultra-uzak atlas koordinatına doğrudan mühürlenebilir.
            if(!localPointSafe(point.x,point.z)){notice("Piyon noktası sonlu bir dünya koordinatı değil.");return false;}
            if(pending.traveling&&pending.existingKey)await this.bridge.cancelJoATravelRoute?.(pending.existingKey);
            let placed;if(pending.isTravelGroup){const group=this.travelGroupRecord(pending.groupId);if(group){group.parentKey="root";group.placedOnMap=true;group.x=Number(point.x)||0;group.z=Number(point.z)||0;group.layerKey=String(this.state.layerKey||"surface");this.persistTravelGroups("placed-on-map");placed={key:`group:${group.id}`};}}
            else placed=await this.bridge.placeJoAEntityOnMap?.(pending.sourceKey,{x:Number(point.x)||0,z:Number(point.z)||0,layerKey:String(this.state.layerKey||"surface")});
            this.pendingPlacement=null;this.overlay?.classList.remove("placement-mode");if(!placed){this.renderEmptyState();this.renderer?.invalidate();this.drawFog();notice("Piyon sabitlenmiş olabilir. Önce piyonun sabitliğini gevşet.");return false;}
            this.reloadWorldState({preserveTravelGroups:pending.isTravelGroup});this.refreshEntities();const entity=this.entities.find(item=>String(item.sourceEntityKey||item.key)===String(pending.sourceKey)||String(item.key)===String(placed.key||""));if(entity){this.worldSelected.clear();this.worldSelected.add(entity.key);this.controlledEntityKey=entity.key;this.state.controlledEntityKey=entity.key;this.recordVisionAlong([{x:entity.x,z:entity.z}],entity,true);}this.refreshAll();this.scheduleSave();notice(pending.isTravelGroup?"Seyahat grubu seçtiğin noktaya yerleştirildi.":"Karakter seçtiğin noktaya yerleştirildi.");return true;
        }
        inventoryHitTest(clientX,clientY,sourceKey=""){const stack=document.elementsFromPoint?.(clientX,clientY)||[document.elementFromPoint(clientX,clientY)].filter(Boolean);let host=null,canvas=null;for(const node of stack){const row=node?.closest?.(".joa-tree-row");if(row&&row.dataset.key!==String(sourceKey))return{row,host:row.closest(".joa-inventory-tree"),canvas:null};host=host||node?.closest?.(".joa-inventory-tree");canvas=canvas||node?.closest?.(".joa-map-canvas");}return{row:null,host,canvas};}
        async createVarlik(){this.save();await this.bridge.createJoAVarlik?.();this.refreshEntities();this.renderInventory();notice("Yeni karakter oluşturuldu.",1800);}
        async createMekanForPlacement(){this.save();const record=await this.bridge.createJoAMekan?.();if(!record?.key){notice("Mekân oluşturulamadı.");return false;}this.refreshEntities();const ok=this.activatePendingPlacement(record.key);if(ok)notice(`${record.name||"Yeni Mekân"} elinde · haritada yerleştireceğin noktaya tıkla.`,3500);return ok;}
        selectedTravelEntities(){
            const selected=this.entities.filter(item=>this.worldSelected.has(item.key));
            return selected.length?selected:[];
        }
        travelCentroid(subjects=this.selectedTravelEntities()){
            if(!subjects.length)return null;
            return{x:subjects.reduce((sum,item)=>sum+Number(item.x||0),0)/subjects.length,z:subjects.reduce((sum,item)=>sum+Number(item.z||0),0)/subjects.length};
        }
        queueMapPan(dx,dy){this.mapPanDx+=Number(dx)||0;this.mapPanDy+=Number(dy)||0;if(this.mapPanFrame)return;this.mapPanFrame=requestAnimationFrame(()=>{this.mapPanFrame=0;this.flushMapPan();});}
        flushMapPan(){const dx=this.mapPanDx,dy=this.mapPanDy;this.mapPanDx=0;this.mapPanDy=0;if((dx||dy)&&this.renderer){this.renderer.pan(dx,dy);if(this.travelAnimating||this.travelStartPromise||this.travelCommitPromise)this.travelCameraDirty=true;else this.scheduleSave();}}
        onMapPointerDown(event){
            if(event.button!==0&&event.button!==1&&event.button!==2)return;const canvas=this.overlay?.querySelector?.(".joa-map-canvas")||event.currentTarget;canvas?.focus?.({preventScroll:true});
            if(event.button===1){this.drag={mode:"pan",pointerId:event.pointerId,lastX:event.clientX,lastY:event.clientY};canvas.classList.add("dragging");canvas.setPointerCapture?.(event.pointerId);event.preventDefault();event.stopPropagation();return;}
            // PATCH83: seyahat animasyonu çalışırken sol sürükleme yalnız kameradır.
            // Rota/karakter yürütme state'ine dokunmaz, iptal/cancel akışına giremez.
            if(this.travelAnimating&&event.button===0){this.drag={mode:"pan",pointerId:event.pointerId,lastX:event.clientX,lastY:event.clientY};canvas.classList.add("dragging");canvas.setPointerCapture?.(event.pointerId);event.preventDefault();event.stopPropagation();return;}
            if(this.paletteOpen&&event.altKey&&(event.button===0||event.button===2)){this.brushAdjustDrag={pointerId:event.pointerId,mode:event.button===0?"size":"softness",startY:event.clientY,startValue:event.button===0?this.paintBrush:this.paintSoftness};canvas.setPointerCapture?.(event.pointerId);event.preventDefault();event.stopPropagation();return;}if(event.button===2){event.preventDefault();event.stopPropagation();return;}
            const point=this.renderer.groundFromScreen(event.clientX,event.clientY);if(!point)return;this.lastMapWorldPoint={x:Number(point.x)||0,z:Number(point.z)||0};
            // PATCH83: Seyahat rotası uzak zoomda da çizilebilir. Zoom-out artık sınırsızdır;
            // localInteractionReady() seyahatin ikinci tıklamasını yutmaz.
            if(this.travelMode){event.preventDefault();event.stopPropagation();if(!localPointSafe(point.x,point.z)){notice("Rota noktası sonlu bir dünya koordinatı değil.");return;}if(!this.routeDrawing||!this.activeTravelKey){notice("Önce seyahat edecek piyona tıkla.");return;}this.addTravelPoint(point,true);this.finishRouteDrawing();return;}
            if(this.pendingPlacement){event.preventDefault();event.stopPropagation();if(!localPointSafe(point.x,point.z)){notice("Piyon noktası sonlu bir dünya koordinatı değil.");return;}void this.commitPendingPlacement(point);return;}
            if(!this.localMapOperationAllowed({notifyUser:!!this.paintMode}))return;
            if(this.paintMode){event.preventDefault();event.stopPropagation();
                if(this.effectivePaintTool()==="region"){const meta=this.currentPaintMeta(),region=this.activePaintRegion(meta);if(!region)return;if(this.paintPointer)this.recoverInterruptedPaintStroke({render:false});if(!this.paintRegionDraft||this.paintRegionDraft.regionId!==region.id)this.paintRegionDraft={regionId:region.id,start:null,current:null,previousBounds:region.bounds?{...region.bounds}:null};this.paintRegionDraft.start={x:Number(point.x)||0,z:Number(point.z)||0};this.paintRegionDraft.current={...this.paintRegionDraft.start};this.paintPointer={pointerId:event.pointerId,mode:"region"};try{canvas.setPointerCapture?.(event.pointerId);}catch(_){}this.renderPaint();return;}
                if(this.effectivePaintTool()==="eyedropper"){this.paintColor=this.samplePaintColor(point);this.paintTool="paint";this.renderPalette();return;}
                if(!this.beginPaintStroke())return;this.paintPointer={pointerId:event.pointerId,mode:"paint"};this.paintLastWorld=null;try{canvas.setPointerCapture?.(event.pointerId);}catch(_){}this.addPaintPoint(point,true);return;
            }
            this.drag={mode:"pan",pointerId:event.pointerId,lastX:event.clientX,lastY:event.clientY};canvas.classList.add("dragging");canvas.setPointerCapture?.(event.pointerId);event.preventDefault();
        }
        onMapPointerMove(event){
            const hoverPoint=this.renderer?.groundFromScreen?.(event.clientX,event.clientY);if(hoverPoint)this.lastMapWorldPoint={x:Number(hoverPoint.x)||0,z:Number(hoverPoint.z)||0};
            if(this.brushAdjustDrag&&this.brushAdjustDrag.pointerId===event.pointerId){const delta=this.brushAdjustDrag.startY-event.clientY;if(this.brushAdjustDrag.mode==="size")this.paintBrush=clamp(this.brushAdjustDrag.startValue+delta*.34,1,240);else this.paintSoftness=clamp(this.brushAdjustDrag.startValue+delta*.38,0,100);this.syncPaletteLiveControls();event.preventDefault();return;}
            if(this.drag&&this.drag.pointerId===event.pointerId&&this.drag.mode==="pan"){const dx=event.clientX-this.drag.lastX,dy=event.clientY-this.drag.lastY;this.drag.lastX=event.clientX;this.drag.lastY=event.clientY;this.queueMapPan(dx,dy);event.preventDefault();return;}
            if(this.paintMode&&this.paintPointer?.pointerId===event.pointerId){const point=this.renderer.groundFromScreen(event.clientX,event.clientY);if(point){if(this.paintPointer.mode==="region"&&this.paintRegionDraft){this.paintRegionDraft.current={x:Number(point.x)||0,z:Number(point.z)||0};this.renderPaint();}else this.addPaintPoint(point,false);}event.preventDefault();return;}
            if(this.travelMode&&this.routeDrawing&&this.activeTravelKey){const point=this.renderer.groundFromScreen(event.clientX,event.clientY);if(point)this.addTravelPoint(point,false);return;}
        }
        onMapPointerUp(event){const canvas=this.overlay?.querySelector?.(".joa-map-canvas")||event.currentTarget;if(this.brushAdjustDrag?.pointerId===event.pointerId){this.brushAdjustDrag=null;try{canvas?.releasePointerCapture?.(event.pointerId);}catch(_){}this.scheduleSave();event.preventDefault?.();return;}if(this.drag&&this.drag.pointerId===event.pointerId){this.flushMapPan();canvas?.classList?.remove?.("dragging");this.drag=null;try{canvas?.releasePointerCapture?.(event.pointerId);}catch(_){}event.preventDefault?.();return;}if(this.paintPointer?.pointerId===event.pointerId){const mode=this.paintPointer.mode;this.paintPointer=null;this.paintLastWorld=null;try{canvas?.releasePointerCapture?.(event.pointerId);}catch(_){}if(mode==="region")this.finishRegionBoundary();else this.finishPaintStroke();this.scheduleSave();event.preventDefault?.();}}
        currentPaintRecords(){const layer=this.normalizeLayerKey(this.state?.layerKey);if(!this.state)this.state={};if(!this.state.pixelPaint||typeof this.state.pixelPaint!=="object")this.state.pixelPaint={};if(!Array.isArray(this.state.pixelPaint[layer]))this.state.pixelPaint[layer]=[];return this.state.pixelPaint[layer];}
        paintWorldSize(){const view=this.renderer?.lastView||this.renderer?.viewport();return Math.max(.04,(Number(this.paintBrush)||18)/Math.max(.0001,view?.scale||1));}
        requestPaintRender(){if(this.paintRenderFrame)return;this.paintRenderFrame=requestAnimationFrame(()=>{this.paintRenderFrame=0;this.renderPaint();});}
        notifyPaintRejected(message){const now=Date.now();if(now-this.paintRejectNoticeAt<2600)return;this.paintRejectNoticeAt=now;notice(message,3200);}
        addPaintPoint(point,force=false){
            if(!this.paintMode||!this.renderer||!this.state||!this.localMapOperationAllowed({notifyUser:force}))return;
            const records=this.currentPaintRecords(),meta=this.currentPaintMeta(),targetInfo=this.ensureActivePaintTarget(meta),region=targetInfo?.region,brush=this.selectedBrush(),size=this.paintWorldSize()*Math.max(.2,Number(brush.size)||1),tool=this.effectivePaintTool(),step=Math.max(.025,size*Math.max(.08,Number(brush.spacing)||.35)),target={x:Number(point.x)||0,z:Number(point.z)||0},from=this.paintLastWorld||target,dx=target.x-from.x,dz=target.z-from.z,distance=Math.hypot(dx,dz),count=Math.min(2048,Math.max(1,Math.ceil(distance/step))),layer=targetInfo?.layer?.id,indexByKey=this.paintRecordKeyIndex||this.rebuildPaintRecordIndex(records),change=this.paintStrokeUndo;let changed=false,rejectedBounds=false,accepted=false;
            if(!targetInfo){if(force)this.notifyPaintRejected("Çizim için geçerli bir katman bulunamadı.");return;}if(targetInfo.layer.kind==="image"){if(force)this.notifyPaintRejected("Bu katman Resim modunda · çizmek için katman türünü Çizim yap.");return;}
            if(tool!=="erase"&&clamp01(this.paintOpacity/100)<=0){this.paintLastWorld=target;return;}
            const recoveryNow=Date.now();if(records.length>=JOA_PAINT_RECORD_LIMIT&&recoveryNow-(Number(this.paintLimitRecoveryAt)||0)>10000){this.paintLimitRecoveryAt=recoveryNow;this.repairPaintRecords(meta,{force:true});indexByKey.clear();for(const record of records){const key=String(record?.key||"");if(key)indexByKey.set(key,record);}this.paintRecordKeyIndex=indexByKey;}
            for(let index=force?0:1;index<=count;index++){const t=count?index/count:1,x=from.x+dx*t,z=from.z+dz*t,sample={x,z};if(!this.pointInRegion(sample,region)){rejectedBounds=true;continue;}accepted=true;
                if(tool==="erase"){for(let i=records.length-1;i>=0;i--){const record=records[i],sameLayer=(Number(record.paintLayer)||0)===layer,radius=Math.max(size,Number(record.size)||size)*.82;if(sameLayer&&Math.hypot(Number(record.x)-x,Number(record.z)-z)<=radius){const key=String(record?.key||"");if(change&&key){if(change.added.has(key))change.added.delete(key);else if(!change.before.has(key))change.before.set(key,{...record});}records.splice(i,1);if(key)indexByKey.delete(key);changed=true;}}continue;}
                const quant=Math.max(.018,size*.30),qx=Math.round(x/quant)*quant,qz=Math.round(z/quant)*quant,key=`${layer}|paint|${qx.toFixed(3)}|${qz.toFixed(3)}|${size.toFixed(3)}|${brush.id}`,existing=indexByKey.get(key);const payload={key,x:qx,z:qz,size,color:this.paintColor,kind:"paint",paintLayer:layer,brushId:brush.id,softness:Math.max(Number(brush.soft)||0,this.paintSoftness/100),opacity:clamp01(this.paintOpacity/100),seed:Math.abs(Math.sin(qx*12.9898+qz*78.233))*9999};
                if(existing){if(change&&!change.added.has(key)&&!change.before.has(key))change.before.set(key,{...existing});Object.assign(existing,payload);changed=true;}
                else if(records.length<JOA_PAINT_RECORD_LIMIT){records.push(payload);indexByKey.set(key,payload);change?.added.add(key);changed=true;}
                else{const now=Date.now();if(now-this.paintLimitNoticeAt>4000){this.paintLimitNoticeAt=now;notice("Çizim güvenlik sınırına ulaştı. Mevcut çizim korunuyor; yer açmak için gereksiz bir katmanı temizleyebilirsin.",4200);}}
            }
            this.paintLastWorld=target;if(changed){this.paintStrokeChanged=true;this.requestPaintRender();}else if(force&&!accepted&&rejectedBounds)this.notifyPaintRejected(`${region?.name||"Aktif bölge"} çerçevesinin dışına yeni boya eklenmez. Dışarıdaki eski boya silinmez; çerçeveyi yeniden genişletince görünür.`);
        }
        drawPaintStamp(ctx,record,p,px){
            if(String(record?.kind||"")==="grid-cell"){ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=clamp01(record.opacity??1);ctx.fillStyle=String(record.color||"#fff");ctx.fillRect(p.x,p.y,Math.max(.5,px),Math.max(.5,px));ctx.restore();return;}
            const brush=brushById(record.brushId),shape=brush.shape||"square",opacity=clamp01(record.opacity??1),soft=clamp01(record.softness||0),x=p.x,y=p.y,half=px/2,color=String(record.color||"#fff");
            ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle=color;ctx.strokeStyle=color;
            if(shape==="blur"){ctx.restore();return;}
            if(shape==="airbrush"||(soft>.02&&shape!=="soft-square"&&shape!=="ellipse")){
                const gradient=ctx.createRadialGradient(x,y,0,x,y,Math.max(1,half)),rgb=hexToRgb(color);
                gradient.addColorStop(0,`rgba(${rgb.join(",")},${Math.min(1,opacity)})`);
                gradient.addColorStop(Math.max(.05,1-soft),`rgba(${rgb.join(",")},${opacity*.66})`);
                gradient.addColorStop(1,`rgba(${rgb.join(",")},0)`);ctx.globalAlpha=1;ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(x,y,Math.max(1,half),0,Math.PI*2);ctx.fill();ctx.restore();return;
            }
            if(shape==="soft-square"){ctx.shadowColor=color;ctx.shadowBlur=Math.max(1,px*soft*.48);const inset=px*soft*.18;ctx.fillRect(x-half+inset,y-half+inset,Math.max(1,px-inset*2),Math.max(1,px-inset*2));}
            else if(shape==="circle"){ctx.beginPath();ctx.arc(x,y,Math.max(1,half),0,Math.PI*2);ctx.fill();}
            else if(shape==="ellipse"){ctx.shadowColor=color;ctx.shadowBlur=Math.max(0,px*soft*.32);ctx.beginPath();ctx.ellipse(x,y,Math.max(1,half),Math.max(1,half*.62),0,0,Math.PI*2);ctx.fill();}
            else if(shape==="diamond"){ctx.beginPath();ctx.moveTo(x,y-half);ctx.lineTo(x+half,y);ctx.lineTo(x,y+half);ctx.lineTo(x-half,y);ctx.closePath();ctx.fill();}
            else if(shape==="cross"){ctx.fillRect(x-px*.12,y-half,px*.24,px);ctx.fillRect(x-half,y-px*.12,px,px*.24);}
            else if(shape==="line-thin"){ctx.fillRect(x-half,y-Math.max(.5,px*.09),px,Math.max(1,px*.18));}
            else if(shape==="line-wide"){ctx.fillRect(x-half,y-Math.max(.5,px*.22),px,Math.max(1,px*.44));}
            else if(shape==="hatch"||shape==="hatch-cross"){ctx.lineWidth=Math.max(1,px*.09);ctx.lineCap="square";for(let i=-1;i<=1;i++){const offset=i*px*.25;ctx.beginPath();ctx.moveTo(x-half,y+offset);ctx.lineTo(x+half,y+offset);ctx.stroke();if(shape==="hatch-cross"){ctx.beginPath();ctx.moveTo(x+offset,y-half);ctx.lineTo(x+offset,y+half);ctx.stroke();}}}
            else if(shape==="outline"){ctx.lineWidth=Math.max(1,px*.11);ctx.beginPath();ctx.arc(x,y,Math.max(1,half*.76),0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-half);ctx.lineTo(x+half,y);ctx.lineTo(x,y+half);ctx.lineTo(x-half,y);ctx.closePath();ctx.stroke();}
            else if(shape==="spray"||shape==="dither"||shape==="scatter"||shape==="grain"){
                const count=Math.max(3,Number(brush.density)||(shape==="spray"?18:shape==="dither"?9:shape==="grain"?24:7));
                for(let i=0;i<count;i++){const wave=Math.sin((record.seed+i*17.713)*(i+1)*.97),angle=(record.seed*.013+i*2.399963)%6.283185,radius=half*((wave*.5+.5)*.96),sx=x+Math.cos(angle)*radius,sy=y+Math.sin(angle)*radius;let unit=Math.max(1,px*(shape==="grain"?.045:shape==="dither"?.08:shape==="spray"?.065:.12));if(shape==="dither"){const grid=Math.max(1,px*.18);ctx.fillRect(Math.round(sx/grid)*grid-unit/2,Math.round(sy/grid)*grid-unit/2,unit,unit);}else{ctx.beginPath();ctx.arc(sx,sy,unit*.5,0,Math.PI*2);ctx.fill();}}
            }else if(shape==="block")ctx.fillRect(Math.round(x-half),Math.round(y-half),Math.ceil(px),Math.ceil(px));
            else ctx.fillRect(Math.round(x-half),Math.round(y-half),Math.ceil(px),Math.ceil(px));
            ctx.restore();
        }
        drawPaintStampLod(ctx,record,p,px,detailTier){
            if(String(record?.kind||"")==="grid-cell"){this.drawPaintStamp(ctx,record,p,px);return;}
            if(detailTier<=1){this.drawPaintStamp(ctx,record,p,px);return;}
            const color=String(record.color||"#fff"),opacity=clamp01(record.opacity??1),brush=brushById(record.brushId);
            ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle=color;
            if(brush.effect==="blur"||brush.shape==="blur"||brush.shape==="airbrush"){ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.7,px*.45),0,Math.PI*2);ctx.fill();}
            else{const side=Math.max(1,px*.72);ctx.fillRect(Math.round(p.x-side*.5),Math.round(p.y-side*.5),Math.ceil(side),Math.ceil(side));}
            ctx.restore();
        }
        applyLocalBlur(ctx,source,record,p,px,displayWidth,displayHeight){
            const brush=brushById(record.brushId),strength=Math.max(1,px*Math.max(.08,Number(brush.blur)||.18));
            ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,Math.max(2,px*.55),0,Math.PI*2);ctx.clip();ctx.globalAlpha=clamp01(record.opacity??1);ctx.filter=`blur(${strength}px)`;ctx.drawImage(source,0,0,displayWidth,displayHeight);ctx.restore();
        }
        reusablePaintBuffer(property,width,height){let canvas=this[property];if(!canvas){canvas=document.createElement("canvas");this[property]=canvas;}if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}return canvas;}
        renderPaint(){try{const result=this.renderPaintUnsafe();this.paintRenderFailures=0;return result;}catch(error){this.paintLayerBuffer=null;this.paintBlurBuffer=null;this.paintRenderFailures=(Number(this.paintRenderFailures)||0)+1;try{console.warn("JoA boya yüzeyi yenilendi:",error);}catch(_){}if(this.paintRenderFailures<=1){this.paintRenderFrame=requestAnimationFrame(()=>{this.paintRenderFrame=0;this.renderPaint();});}const now=Date.now();if(now-(Number(this.paintRecoveryNoticeAt)||0)>4200){this.paintRecoveryNoticeAt=now;notice("Fırça yüzeyi toparlandı; çizimin korunuyor. Tekrar çizebilirsin.",3200);}return false;}}
        renderPaintUnsafe(){
            const canvas=this.overlay?.querySelector(".joa-paint-layer");if(!canvas||!this.renderer)return;
            if(this.paintRenderFrame){cancelAnimationFrame(this.paintRenderFrame);this.paintRenderFrame=0;}
            canvas.style.transform="";canvas.style.transformOrigin="0 0";
            const view=this.renderer.lastView||this.renderer.viewport(),detailTier=this.renderer.detailTierFor(view),dprCap=detailTier>=2?1:1.5;
            const rect=canvas.getBoundingClientRect(),dpr=Math.max(1,Math.min(dprCap,window.devicePixelRatio||1)),w=Math.max(1,Math.floor(rect.width*dpr)),h=Math.max(1,Math.floor(rect.height*dpr));
            if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
            const out=canvas.getContext("2d",{alpha:true});out.setTransform(dpr,0,0,dpr,0,0);out.imageSmoothingEnabled=true;try{out.imageSmoothingQuality="high";}catch(_){}out.clearRect(0,0,rect.width,rect.height);
            const records=this.currentPaintRecords(),meta=this.currentPaintMeta(),recordsByLayer=new Map(),imageByLayer=new Map();
            // Kayıtları ve resimleri her katman için baştan taramak yerine tek geçişte ayır.
            for(const record of records){if(String(record?.kind||"paint")==="mask")continue;const layerId=Number(record?.paintLayer)||0;if(!recordsByLayer.has(layerId))recordsByLayer.set(layerId,[]);recordsByLayer.get(layerId).push(record);}
            const worldLayer=String(this.state?.layerKey||"surface");
            for(const record of this.currentMapImages())if(String(record.layerKey||"surface")===worldLayer&&Number.isInteger(Number(record.paintLayer)))imageByLayer.set(Number(record.paintLayer),record);
            for(const regionId of meta.regionOrder){const region=this.regionById(meta,regionId);if(!region||region.visible===false)continue;
                for(const layerId of region.layerOrder){const layer=meta.layers[String(layerId)];if(!layer||layer.visible===false)continue;
                    if(layer.kind==="image"){const record=imageByLayer.get(Number(layerId)),image=record?this.mapImageNodes.get(String(record.id))?.querySelector?.("img"):null;if(record&&image?.complete&&Number(image.naturalWidth)>0&&Number(image.naturalHeight)>0){const p=this.renderer.worldToScreen(view,record.x,record.z),drawW=Math.max(.01,Number(record.widthM)||.1)*view.scale,drawH=Math.max(.01,Number(record.heightM)||.1)*view.scale;out.save();this.applyRegionClip(out,region);out.globalAlpha=clamp01(record.opacity??1);out.drawImage(image,p.x-drawW/2,p.y-drawH/2,drawW,drawH);out.restore();}continue;}
                    const visible=[],layerRecords=recordsByLayer.get(layerId)||[];
                    for(const record of layerRecords){const x=Number(record.x)||0,z=Number(record.z)||0,radius=Math.max(.04,Number(record.size)||1);if(x+radius<view.minX||x-radius>view.maxX||z+radius<view.minZ||z-radius>view.maxZ)continue;const p=this.renderer.worldToScreen(view,x,z),rawPx=radius*view.scale;visible.push({record,p,px:Math.max(.8,rawPx)});}
                    if(!visible.length)continue;
                    const buffer=this.reusablePaintBuffer("paintLayerBuffer",w,h),ctx=buffer.getContext("2d",{alpha:true});ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;try{ctx.imageSmoothingQuality="high";}catch(_){}ctx.save();this.applyRegionClip(ctx,region);const blurRecords=[];
                    for(const item of visible){const brush=brushById(item.record.brushId);if(detailTier<=1&&(brush.effect==="blur"||brush.shape==="blur")){blurRecords.push(item);continue;}this.drawPaintStampLod(ctx,item.record,item.p,item.px,detailTier);}
                    if(blurRecords.length){const source=this.reusablePaintBuffer("paintBlurBuffer",w,h),sourceCtx=source.getContext("2d",{alpha:true});sourceCtx.setTransform(1,0,0,1,0,0);sourceCtx.clearRect(0,0,w,h);sourceCtx.drawImage(buffer,0,0);for(const item of blurRecords)this.applyLocalBlur(ctx,source,item.record,item.p,item.px,rect.width,rect.height);}ctx.restore();out.drawImage(buffer,0,0,rect.width,rect.height);
                }
            }
            if(this.paletteOpen&&this.layerPanelOpen){out.save();out.lineWidth=1.5;out.setLineDash([8,6]);const activeLayer=meta.layers[String(meta.activeLayerId)],activeRegion=activeLayer?this.regionById(meta,activeLayer.regionId):null;if(activeLayer?.visible!==false&&activeRegion?.visible!==false&&activeRegion?.bounds){const b=activeRegion.bounds,corners=[[b.minX,b.minZ],[b.maxX,b.minZ],[b.maxX,b.maxZ],[b.minX,b.maxZ]].map(([x,z])=>this.renderer.project(x,0,z));if(!corners.some(point=>!point)){out.strokeStyle="rgba(119,229,255,.92)";out.beginPath();out.moveTo(corners[0].x,corners[0].y);for(let i=1;i<corners.length;i++)out.lineTo(corners[i].x,corners[i].y);out.closePath();out.stroke();}}
                const draft=this.paintRegionDraft;if(draft?.start&&draft?.current){const corners=[[draft.start.x,draft.start.z],[draft.current.x,draft.start.z],[draft.current.x,draft.current.z],[draft.start.x,draft.current.z]].map(([x,z])=>this.renderer.project(x,0,z));if(!corners.some(point=>!point)){out.strokeStyle="rgba(255,220,104,.98)";out.fillStyle="rgba(255,220,104,.08)";out.beginPath();out.moveTo(corners[0].x,corners[0].y);for(let i=1;i<corners.length;i++)out.lineTo(corners[i].x,corners[i].y);out.closePath();out.fill();out.stroke();}}out.restore();
            }
            this.renderer.paintView={...view};
        }
        setPaintMode(enabled,color=this.paintColor){const next=!!enabled;if(this.paintPointer)this.recoverInterruptedPaintStroke({render:false});if(this.paintMode&&!next)this.resetPaintUndo();this.paintMode=next;this.paintColor=this.paintMode?(color||this.paintColor||"#7b7f82"):this.paintColor;this.paintPointer=null;this.paintLastWorld=null;this.paintRecordKeyIndex=null;if(this.paintMode&&this.travelMode)this.cancelTravel({clearPlans:false});this.overlay?.classList.toggle("paint-mode",this.paintMode);}
        onLegendClick(event){const button=event.target.closest?.("button");if(!button)return;if(button.dataset.action==="toggle-legend"){this.legendCollapsed=!this.legendCollapsed;if(this.state)this.state.legendOpen=!this.legendCollapsed;this.renderLegend();this.scheduleSave();}}
        renderLegend(){
            const host=this.overlay?.querySelector(".joa-map-legend");if(!host)return;
            const layer=this.normalizeLayerKey(this.state?.layerKey),guide=MAP_LAYER_GUIDES[layer]||MAP_LAYER_GUIDES.surface,title=guide.title;
            host.classList.toggle("collapsed",this.legendCollapsed);
            const sections=Array.isArray(guide.sections)&&guide.sections.length?guide.sections:[{title:"RENKLER",hint:"",entries:Array.isArray(guide.legend)?guide.legend:[]}];
            const body=sections.map(section=>{
                const entries=(section.entries||[]).map(([color,name,meaning])=>`<li><i style="--swatch:${color}"></i><span><b>${escapeHtml(name)}</b><small>${escapeHtml(meaning)}</small></span></li>`).join("");
                return`<section class="joa-map-legend-group" style="margin:0 0 10px"><div style="padding:5px 7px 4px;border-bottom:1px solid rgba(136,208,224,.18)"><b style="font-size:10px;letter-spacing:.09em;color:#91d6e5">${escapeHtml(section.title||"")}</b>${section.hint?`<small style="display:block;margin-top:2px;opacity:.72;line-height:1.25">${escapeHtml(section.hint)}</small>`:""}</div><ul style="margin-top:4px">${entries}</ul></section>`;
            }).join("");
            host.innerHTML=`<header><div><small>1 YERKÜRE · 2 UÇAN ADA · 3 YERALTI · 4 KOZMİK ADA</small><strong>${escapeHtml(title)}</strong></div><button type="button" data-action="toggle-legend" title="Renk ve coğrafya anahtarını daralt">${this.legendCollapsed?"▶":"◀"}</button></header><div class="joa-map-legend-body">${guide.subtitle?`<p style="margin:0 7px 8px;font-size:10px;line-height:1.32;opacity:.76">${escapeHtml(guide.subtitle)}</p>`:""}${body}</div>`;
        }
        addTravelPoint(point,force=false){
            const plan=this.travelPlans.get(this.activeTravelKey);if(!plan)return;const group=plan.isTravelGroup?this.travelGroupRecord(plan.groupId||plan.key):null,emptyTravelGroup=!!group&&this.travelGroupDescendantRecords(group).length===0;if(!emptyTravelGroup&&!this.isDiscoveredPoint(point)){if(force)notice("Karanlık alana rota çizilemez. Aktif piyonla görüş sınırına kadar ilerle.");return;}
            const last=plan.path[plan.path.length-1],view=this.renderer.lastView||this.renderer.viewport(),minStep=Math.max(.03,4/Math.max(.0001,view.scale));
            if(last&&!emptyTravelGroup&&!this.isDiscoveredSegment(last,point)){if(force)notice("Rota karanlık bir boşluğun içinden geçemez. Keşfedilmiş yol üzerinden çiz.");return;}
            if(force||!last||Math.hypot(point.x-last.x,point.z-last.z)>=minStep){plan.path.push({x:Number(point.x)||0,z:Number(point.z)||0});this.travelPreview=null;this.drawTravelRoute();this.updateTravelConsole();}
        }
        finishRouteDrawing(){
            if(!this.routeDrawing)return;const plan=this.travelPlans.get(this.activeTravelKey);
            if(!plan||this.pathDistance(plan.path)<=.05){if(this.activeTravelKey)this.travelPlans.delete(this.activeTravelKey);notice("Rota çok kısa olduğu için kaydedilmedi.");}
            this.routeDrawing=false;this.activeTravelKey="";this.worldSelected.clear();this.travelPreview=null;this.createMarkers();this.renderOverlay();this.drawTravelRoute();this.updateTravelConsole();
        }
        toggleInventory(force){
            if(this.inventoryPage){if(force===false){this.close({save:false});queueMicrotask(()=>this.open({force:true}));return false;}return true;}
            if(!this.overlay)return false;
            if(force===false)return false;
            this.save();this.close({save:false});queueMicrotask(()=>this.open({force:true,inventoryOnly:true}));return true;
        }
        clearInventoryDropVisuals(){
            this.overlay?.querySelectorAll?.(".joa-tree-row.drop-target,.joa-tree-row.drop-before,.joa-tree-row.drop-after,.joa-tree-row.drop-inside").forEach(row=>{row.classList.remove("drop-target","drop-before","drop-after","drop-inside");delete row.dataset.dropMode;});
            this.overlay?.querySelector?.(".joa-inventory-tree")?.classList.remove("drop-root");
        }
        inventoryDropMode(row,clientY){
            // PATCH46: Seyahat Grubu, Mevcudat ağacında Karakter/Mekân kartıyla aynı
            // sürükleme geometrisini kullanır. Özel "her zaman içine at" yolu yoktur.
            const rect=row.getBoundingClientRect(),ratio=(clientY-rect.top)/Math.max(1,rect.height),container=row.dataset.container!=="false";
            if(ratio<.28)return"before";if(ratio>.72)return"after";return container?"inside":"after";
        }
        syncTravelGroupOpenState(records,groupKeys){
            if(!(this.travelGroupMemberCounts instanceof Map))this.travelGroupMemberCounts=new Map();
            const active=new Set(groupKeys||[]),counts=new Map();for(const item of records||[]){const parent=String(item?.parentKey||"root");counts.set(parent,(counts.get(parent)||0)+1);}
            for(const key of active){const count=counts.get(key)||0,previous=this.travelGroupMemberCounts.get(key);if(count>0&&(previous===undefined||count>previous))this.openNodes.add(key);this.travelGroupMemberCounts.set(key,count);}
            for(const key of [...this.travelGroupMemberCounts.keys()])if(!active.has(key)){this.travelGroupMemberCounts.delete(key);this.openNodes.delete(key);}
        }
        inventoryRecords(){
            // PATCH51: normal kart ağacıyla aynı tek projeksiyon. Bridge zaten Karakter,
            // Mekân ve Seyahat Grubunu tek kart listesinde döndürüyor; burada ikinci kez
            // controller/map/live snapshot birleştirmiyoruz.
            const canonical=this.bridge.listJoATravelGroups?.()||{};if(!this.state)this.state={};if(Array.isArray(canonical.groups)){this.state.travelGroups=canonical.groups.map(group=>({...group,members:[...(group.members||[])]}));this.state.travelGroupsRevision=Number(canonical.revision)||0;this.state.travelGroupsTombstone=canonical.tombstone===true;}
            const projected=(this.bridge.listJoAInventoryEntities?.()||this.bridge.listJoAEntities?.()||[]).map(item=>({...item})),baseKeys=new Set(projected.filter(item=>!item.isTravelGroup).map(item=>String(item.key||""))),groupKeys=new Set(projected.filter(item=>item.isTravelGroup).map(item=>String(item.key||"")));
            const records=projected.map((item,index)=>{const raw=String(item.parentKey||"root"),parentKey=raw==="root"||baseKeys.has(raw)||groupKeys.has(raw)?raw:"root";return{...item,parentKey,order:Number(item.order)||index,isCard:true,hasSheet:item.isTravelGroup?false:item.hasSheet!==false};});
            const counts=new Map();for(const item of records){const parent=String(item.parentKey||"root");counts.set(parent,(counts.get(parent)||0)+1);}for(const item of records)item.childrenCount=counts.get(String(item.key||""))||0;
            this.syncTravelGroupOpenState(records,groupKeys);return records.sort((a,b)=>Number(a.order)-Number(b.order)||String(a.name||"").localeCompare(String(b.name||""),"tr"));
        }
        inventoryWouldCycle(sourceKey,targetKey,records=this.inventoryRecords()){
            const source=String(sourceKey||""),byKey=new Map(records.map(item=>[String(item.key),item]));let cursor=String(targetKey||"root"),guard=0;
            while(cursor!=="root"&&guard++<512){if(cursor===source)return true;const item=byKey.get(cursor);if(!item)return false;cursor=String(item.parentKey||"root");}
            return guard>=512;
        }
        async moveInventoryNode(sourceKey,targetKey="root",order=0){
            const source=String(sourceKey||""),target=String(targetKey||"root"),records=this.inventoryRecords(),byKey=new Map(records.map(item=>[String(item.key),item])),sourceItem=byKey.get(source),targetItem=target==="root"?null:byKey.get(target);
            if(!sourceItem||source===target||(target!=="root"&&(!targetItem||targetItem.isContainer===false))||this.inventoryWouldCycle(source,target,records))return false;
            // Tek mekanik: karakter, mekân ve Seyahat Grubu aynı bridge taşıma çekirdeğine gider.
            const moved=await this.bridge.moveJoAInventoryNode?.(source,target,Number(order)||Date.now());if(!moved)return false;
            if(targetItem?.isTravelGroup)this.openTravelGroupNode(targetItem.groupId);else if(target!=="root")this.openNodes.add(target);
            const canonical=this.bridge.listJoATravelGroups?.();if(canonical&&Array.isArray(canonical.groups)){this.state.travelGroups=canonical.groups;this.state.travelGroupsRevision=Number(canonical.revision)||0;}
            this.reloadWorldState();this.refreshEntities();this.refreshAll();return true;
        }
        async removeTravelGroupFromMap(item){
            const group=this.travelGroupRecord(item?.groupId||String(item?.key||"").replace(/^group:/,""));if(!group)return false;
            const ok=await this.confirmRune({title:"Harita Mührünü Kaldır",message:`${group.name||"Seyahat Grubu"} haritadan kaldırılsın mı? Seyahat Grubu kartı ve içindeki mevcudat korunacak.`,confirmText:"Haritadan Kaldır"});if(!ok)return false;
            group.placedOnMap=false;this.travelPlans.delete(`group:${group.id}`);this.worldSelected.delete(`group:${group.id}`);this.refreshEntities();this.refreshAll();this.persistTravelGroups("removed-from-map");notice("Seyahat Grubu haritadan kaldırıldı; Mevcudat kartı korundu.",2200);return true;
        }
        async placeInventoryNodeOnMap(key,point){
            const item=this.inventoryRecords().find(record=>String(record.key)===String(key));if(!item||!point)return false;
            const placed=await this.bridge.placeJoAInventoryNodeOnMap?.(String(key),{x:Number(point.x)||0,z:Number(point.z)||0,layerKey:String(this.state.layerKey||"surface")});if(!placed)return false;
            this.reloadWorldState();this.refreshEntities();this.refreshAll();return true;
        }
        beginInventoryPointerCandidate(event,item,row){
            if(event.button!==0||item.undeletable)return;
            if(this.inventoryPlaceIntent||this.inventoryFocusIntent){row.dataset.inventoryCommand=this.inventoryPlaceIntent?"place":"focus";this.inventoryPointerDrag=null;return;}
            delete row.dataset.inventoryCommand;
            this.inventoryPointerDrag={pointerId:event.pointerId,key:item.key,startX:event.clientX,startY:event.clientY,lastX:event.clientX,lastY:event.clientY,row,active:false};
        }
        updateInventoryPointerDrag(event){
            const drag=this.inventoryPointerDrag;if(!drag||event.pointerId!==drag.pointerId)return;
            drag.lastX=event.clientX;drag.lastY=event.clientY;
            if(!drag.active&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<7)return;
            if(!drag.active){
                drag.active=true;this.inventoryDidDrag=true;this.inventoryDragKey=drag.key;drag.row?.classList.add("dragging");document.documentElement.classList.add("joa-inventory-pointer-dragging");
                try{drag.row?.setPointerCapture?.(event.pointerId);}catch(_){}
                const ghost=document.createElement("div");ghost.className="joa-tree-drag-ghost";ghost.textContent=drag.row?.querySelector(".joa-tree-copy strong")?.textContent||"Mevcudat";document.body.appendChild(ghost);this.inventoryDragGhost=ghost;
            }
            event.preventDefault();
            if(this.inventoryDragGhost){this.inventoryDragGhost.style.left=`${event.clientX+14}px`;this.inventoryDragGhost.style.top=`${event.clientY+14}px`;}
            this.clearInventoryDropVisuals();
            const hit=this.inventoryHitTest(event.clientX,event.clientY,drag.key),targetRow=hit.row,host=hit.host;
            if(targetRow){const mode=this.inventoryDropMode(targetRow,event.clientY);targetRow.dataset.dropMode=mode;targetRow.classList.add("drop-target",`drop-${mode}`);}
            else if(host)host.classList.add("drop-root");
        }
        async finishInventoryPointerDrag(event){
            const drag=this.inventoryPointerDrag;if(!drag||event.pointerId!==drag.pointerId)return;
            this.inventoryPointerDrag=null;
            if(!drag.active)return;
            event.preventDefault();event.stopPropagation();
            try{drag.row?.releasePointerCapture?.(event.pointerId);}catch(_){}
            const dropX=Number.isFinite(drag.lastX)?drag.lastX:event.clientX,dropY=Number.isFinite(drag.lastY)?drag.lastY:event.clientY;
            const hit=this.inventoryHitTest(dropX,dropY,drag.key),targetRow=hit.row,host=hit.host,canvas=hit.canvas;
            let ok=false;
            if(targetRow&&targetRow.dataset.key!==drag.key){
                const records=this.inventoryRecords(),targetItem=records.find(item=>String(item.key)===String(targetRow.dataset.key)),mode=targetRow.dataset.dropMode||this.inventoryDropMode(targetRow,dropY);
                if(targetItem){const target=mode==="inside"?targetItem.key:targetItem.parentKey,order=mode==="before"?Number(targetItem.order)-.5:mode==="after"?Number(targetItem.order)+.5:Date.now();const targetContainer=records.find(entry=>String(entry.key)===String(target));if(target!=="root"&&!targetContainer?.isAdventureParty)this.openNodes.add(target);ok=await this.moveInventoryNode(drag.key,target,order);}
            }else if(host){ok=await this.moveInventoryNode(drag.key,"root",Date.now());}
            else if(canvas&&this.renderer){const point=this.renderer.groundFromScreen(dropX,dropY);if(point&&localPointSafe(point.x,point.z))ok=await this.placeInventoryNodeOnMap(drag.key,point);else if(point)notice("Piyon noktası sonlu bir dünya koordinatı değil.");}
            drag.row?.classList.remove("dragging");document.documentElement.classList.remove("joa-inventory-pointer-dragging");this.inventoryDragGhost?.remove();this.inventoryDragGhost=null;this.inventoryDragKey="";this.clearInventoryDropVisuals();
            setTimeout(()=>{this.inventoryDidDrag=false;},120);
            if(ok)this.renderInventory();else notice("Mevcudat taşınamadı. Hedef kendi alt kümesi olamaz.");
        }
        renderInventory(){
            if(!this.overlay)return;const host=this.overlay.querySelector(".joa-inventory-tree");if(!host)return;const scrollTop=host.scrollTop,scrollLeft=host.scrollLeft,records=this.inventoryRecords(),targetContext=window.__ALEK_ITEM_TRANSFER_TARGET__,targetMode=!!(this.inventoryPage&&targetContext?.active&&typeof targetContext.accept==="function");host.replaceChildren();
            const track=document.createElement("div");track.className="joa-inventory-tree-track";host.appendChild(track);
            host.ondragover=event=>{if(event.target.closest?.(".joa-tree-row"))return;if(!this.inventoryDragKey)return;event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect="move";host.classList.add("drop-root");};
            host.ondragleave=event=>{if(!host.contains(event.relatedTarget))host.classList.remove("drop-root");};
            host.ondrop=async event=>{if(event.target.closest?.(".joa-tree-row"))return;event.preventDefault();event.stopPropagation();host.classList.remove("drop-root");const sourceKey=event.dataTransfer?.getData("text/joa-key")||event.dataTransfer?.getData("text/plain")||this.inventoryDragKey;if(!sourceKey)return;const ok=await this.moveInventoryNode(sourceKey,"root",Date.now());if(ok)this.renderInventory();else notice("Bu mevcudat kök düzeye taşınamadı.");};
            host.onwheel=event=>{if(this.inventoryPage){event.preventDefault();event.stopPropagation();return;}const horizontal=event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY);if(horizontal){const amount=event.deltaX||event.deltaY;if(amount){host.scrollLeft+=amount;event.preventDefault();event.stopPropagation();}}else if(event.deltaY){host.scrollTop+=event.deltaY;event.preventDefault();event.stopPropagation();}};
            const children=new Map();for(const item of records){const parent=String(item.parentKey||"root");if(!children.has(parent))children.set(parent,[]);children.get(parent).push(item);}for(const list of children.values())list.sort((a,b)=>Number(a.order)-Number(b.order)||a.name.localeCompare(b.name,"tr"));
            let maxVisibleDepth=0;const indentStep=32;
            const draw=(parent,depth)=>{for(const item of children.get(parent)||[]){
                maxVisibleDepth=Math.max(maxVisibleDepth,depth);
                const row=document.createElement("div");row.className="joa-tree-row";row.style.setProperty("--depth",String(depth));row.style.setProperty("--tree-indent",`${depth*indentStep}px`);row.style.setProperty("--node-accent",String(item.accent||"#71cde9"));row.dataset.key=item.key;row.dataset.container=String(item.isContainer!==false);row.dataset.card="true";row.dataset.entityType=String(item.entityType||"");row.title="Ctrl+E + tık: haritaya ekle · Sürükle: başka mevcudatın içine taşı veya sırala";row.draggable=false;row.classList.toggle("selected",this.inventorySelected.has(item.key));row.classList.toggle("party",item.isAdventureParty);const targetCandidate=targetMode&&!item.isTravelGroup&&["character","location"].includes(item.entityType)&&String(item.key)!==String(targetContext.sourceKey||"");row.classList.toggle("item-transfer-target",targetCandidate);row.classList.toggle("item-transfer-unavailable",targetMode&&!targetCandidate);
                const childCount=(children.get(item.key)||[]).length,hasChildren=childCount>0,open=this.openNodes.has(item.key),mapEntity=this.entities.find(entity=>String(entity.sourceEntityKey||entity.key)===String(item.key))||(this.allMapEntities||[]).find(entity=>String(entity.sourceEntityKey||entity.key)===String(item.key)),running=mapEntity&&this.activeTravelRoutes().some(route=>String(route.key)===String(mapEntity.key));
                const partyStatus=item.isAdventureParty?this.partyStatus():null;
                {const shownSubtitle=String(item.isTravelGroup?"Seyahat Grubu":item.subtitle||""),canTavern=!targetMode&&!item.isTravelGroup&&["character","location"].includes(item.entityType),inTavern=canTavern&&!!this.bridge.isJoAEntityInTavern?.(item.key);row.innerHTML=`<span class="joa-tree-caret">${hasChildren?(open?"▾":"▸"):""}</span><span class="joa-tree-glyph${hasChildren?" has-children":" leaf"}"><i class="joa-entity-mark" aria-hidden="true"></i>${hasChildren?`<b>${childCount}</b>`:""}</span><span class="joa-tree-copy"><strong>${escapeHtml(item.name)}</strong>${shownSubtitle?`<small style="color:var(--node-accent)">${escapeHtml(shownSubtitle)}</small>`:""}</span>${!targetMode&&running?'<span class="joa-tree-status traveling">Yolda</span>':!targetMode&&mapEntity?'<button type="button" class="joa-tree-map-remove" title="Bu piyonu haritadan kaldır">× Haritadan</button>':""}${targetCandidate?'<span class="joa-item-transfer-pick">HEDEF SEÇ</span>':""}${canTavern?`<button type="button" class="joa-tree-tavern-speaker ${inTavern?"active":""}" title="${inTavern?"Tavern katılımcısı · basınca sahneden çıkar":"Tavern katılımcısı yap"}" aria-label="${inTavern?"Tavern katılımcısı · sahneden çıkar":"Tavern katılımcısı yap"}"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 8h18v12H15l-6 5v-5H7Z"/><path d="M12 13h8M12 17h5"/></svg><span>${inTavern?"TAVERNA'DA":"TAVERN"}</span></button>`:""}`;}
                const speakerBtn=row.querySelector(".joa-tree-tavern-speaker");if(speakerBtn)speakerBtn.onclick=async event=>{event.preventDefault();event.stopPropagation();const result=await this.bridge.toggleJoAEntityTavern?.(item.key);if(!result?.ok){notice("Tavern konuşmacısı değiştirilemedi.",2200);return;}notice(result.active?`${item.name} Tavern konuşmacısı oldu.`:`${item.name} Tavern sahnesinden çıkarıldı.`,2200);this.renderInventory();};
                const removeMapBtn=row.querySelector(".joa-tree-map-remove");if(removeMapBtn)removeMapBtn.onclick=event=>{event.preventDefault();event.stopPropagation();if(item.isTravelGroup)void this.removeTravelGroupFromMap(item);else void this.removeEntityFromScene(mapEntity);};
                if(targetMode)row.title=targetCandidate?`${item.name} · eşya işlemi için hedef seç`:(String(item.key)===String(targetContext.sourceKey||"")?"Kaynak mevcudat hedef seçilemez":"Yalnız Karakter veya Mekân kartları hedef seçilebilir");
                else if(item.isAdventureParty)row.title=partyStatus?.ready?`Özel Macera Grubu · ${partyStatus.memberCount??partyStatus.characterCount??0} üye · sol tık kağıda gir · sağ tık üyeleri aç/kapat`:'Özel Macera Grubu · Karakter/Karakter üyesi sürükle · sol tık kağıda gir · sağ tık üyeleri aç/kapat';
                else if(item.isTravelGroup)row.title="Seyahat Grubu · Ctrl+F: haritadakini bul · Ctrl+E: Map’e yerleştir · sağ tık: alt kümeyi aç/kapat";
                else row.title="Sol tık: kağıda gir · Ctrl+F: haritadakini bul · Ctrl+E: Map’e yerleştir · Sürükle: karakter/mekân içine taşı";
                row.onpointerdown=targetMode?event=>{if(event.button===0){event.stopPropagation();this.inventoryPointerDrag=null;this.inventoryDidDrag=false;}}:event=>this.beginInventoryPointerCandidate(event,item,row);
                row.onclick=event=>{event.stopPropagation();if(targetMode){if(!targetCandidate){notice(String(item.key)===String(targetContext.sourceKey||"")?"Kaynak mevcudat hedef seçilemez.":"Yalnız başka bir Karakter veya Mekân kartı hedef seçilebilir.",1800);return;}const accept=targetContext.accept;this.close({save:false});try{delete window.__ALEK_ITEM_TRANSFER_TARGET__;}catch(_){window.__ALEK_ITEM_TRANSFER_TARGET__=null;}queueMicrotask(()=>accept(item.key));return;}const inventoryCommand=String(row.dataset.inventoryCommand||"");delete row.dataset.inventoryCommand;if(this.inventoryDidDrag){this.inventoryDidDrag=false;return;}if(inventoryCommand==="place"||this.inventoryPlaceIntent){this.setInventoryCommand("");this.inventoryPointerDrag=null;this.inventoryDidDrag=false;void this.placeInventoryEntityOnMap(item.key);return;}if(inventoryCommand==="focus"||this.inventoryFocusIntent){this.setInventoryCommand("");this.focusInventoryEntity(item.key);return;}if(event.ctrlKey||event.metaKey){this.inventorySelected.has(item.key)?this.inventorySelected.delete(item.key):this.inventorySelected.add(item.key);this.renderInventory();return;}if(item.isTravelGroup)return;this.openDetail(item.key);};
                row.oncontextmenu=event=>{event.preventDefault();event.stopPropagation();if(event.ctrlKey&&event.altKey){void this.placeInventoryEntityOnMap(item.key);return;}if(!hasChildren)return;open?this.openNodes.delete(item.key):this.openNodes.add(item.key);this.renderInventory();};row.querySelector(".joa-tree-caret").onclick=event=>{event.preventDefault();event.stopPropagation();if(!hasChildren)return;open?this.openNodes.delete(item.key):this.openNodes.add(item.key);this.renderInventory();};
                row.ondragstart=event=>{this.inventoryDragKey=item.key;this.inventoryDidDrag=true;event.dataTransfer?.setData("text/joa-key",item.key);event.dataTransfer?.setData("text/plain",item.key);if(event.dataTransfer)event.dataTransfer.effectAllowed="move";row.classList.add("dragging");};row.ondragend=()=>{row.classList.remove("dragging");this.inventoryDragKey="";setTimeout(()=>{this.inventoryDidDrag=false;},80);};
                row.ondragover=event=>{event.preventDefault();const mode=this.inventoryDropMode(row,event.clientY);row.dataset.dropMode=mode;row.classList.add("drop-target");row.classList.toggle("drop-before",mode==="before");row.classList.toggle("drop-after",mode==="after");row.classList.toggle("drop-inside",mode==="inside");event.dataTransfer.dropEffect="move";};
                row.ondragleave=()=>{row.classList.remove("drop-target","drop-before","drop-after","drop-inside");delete row.dataset.dropMode;};
                row.ondrop=async event=>{event.preventDefault();event.stopPropagation();const mode=row.dataset.dropMode||"after";row.classList.remove("drop-target","drop-before","drop-after","drop-inside");delete row.dataset.dropMode;const sourceKey=event.dataTransfer?.getData("text/joa-key")||event.dataTransfer?.getData("text/plain")||this.inventoryDragKey;if(!sourceKey||sourceKey===item.key)return;const target=mode==="inside"?item.key:item.parentKey;const order=mode==="before"?Number(item.order)-.5:mode==="after"?Number(item.order)+.5:Date.now();if(target!=="root"&&!records.find(entry=>String(entry.key)===String(target))?.isAdventureParty)this.openNodes.add(target);const ok=await this.moveInventoryNode(sourceKey,target,order);if(ok)this.renderInventory();else notice("Bu mevcudat buraya taşınamadı.");};
                track.appendChild(row);if(hasChildren&&open)draw(item.key,depth+1);
            }};draw("root",0);
            track.style.setProperty("--visible-depth",String(maxVisibleDepth));track.style.removeProperty("--tree-content-width");
            if(records.length===0){const empty=document.createElement("div");empty.className="joa-inventory-empty";empty.innerHTML='<strong>Henüz Karakter yok</strong><span>K tuşu doğrudan yeni Karakter oluşturur. Tek kart tipi Karakter’tır.</span><button type="button">K · Yeni Karakter</button>';empty.querySelector("button").onclick=()=>this.createVarlik();track.appendChild(empty);}
            requestAnimationFrame(()=>{
                // Açık dalların gerçek sağ ucunu ölç. Derinlik veya uzun ad arttıkça
                // yatay yüzey büyür; dallar kapanınca yeniden küçülür.
                const contentWidth=Math.max(host.clientWidth,Math.ceil(track.scrollWidth+24));
                track.style.setProperty("width",`${contentWidth}px`,"important");
                track.style.setProperty("min-width",`${contentWidth}px`,"important");
                if(this.inventoryPage){host.scrollTop=0;host.scrollLeft=0;this.applyInventoryPan();}
                else{host.scrollTop=scrollTop;host.scrollLeft=Math.min(scrollLeft,Math.max(0,contentWidth-host.clientWidth));}
            });
        }
        async deleteSelectedInventory(){
            if(this.inventoryDeleteInFlight)return false;const keys=[...this.inventorySelected];if(!keys.length)return false;
            const selectedRecords=this.inventoryRecords().filter(record=>this.inventorySelected.has(String(record.key))),groupIds=selectedRecords.filter(item=>item.isTravelGroup).map(item=>String(item.groupId)),entityKeys=selectedRecords.filter(item=>!item.isTravelGroup).map(item=>String(item.key));
            if(!groupIds.length&&!entityKeys.length){notice("Silinecek geçerli bir Mevcudat seçilmedi.",2200);return false;}
            const parts=[];if(entityKeys.length)parts.push(`${entityKeys.length} kart Mahzen'e taşınacak`);if(groupIds.length)parts.push(`${groupIds.length} seyahat grubu dağıtılacak`);
            this.inventoryDeleteInFlight=true;
            try{
                const ok=await this.confirmRune({title:"Mevcudat Mührü",message:`${parts.join(" · ")}. Alt kümeler ve tarihî kayıtlar korunarak devam edilsin mi?`,confirmText:"Seçileni Kaldır",cancelText:"Vazgeç"});if(!ok)return false;
                let changed=false;for(const groupId of groupIds)changed=(await this.disbandTravelGroup({groupId}))||changed;
                if(entityKeys.length){const archived=await this.bridge.archiveJoAEntities?.(entityKeys);changed=archived===true||archived?.ok===true||changed;if(!archived)notice("Seçili kartlar kaldırılamadı; silinemez bir kayıt seçilmiş olabilir.",3200);}
                if(changed){this.inventorySelected.clear();this.refreshAll();notice("Seçili mevcudat etkin dünyadan çıkarıldı; tarihî kayıtları korundu.");}return changed;
            }finally{this.inventoryDeleteInFlight=false;}
        }
        openDetail(key){
            if(!key||!this.overlay)return;
            if(!this.inventoryPage&&this.renderer)this.mapCameraSnapshot={...this.renderer.camera};
            this.save();
            const current=String(window.__alekCurrentPrimarySurface||"");
            const origin=current==="inventory"||current==="map"?current:(this.inventoryPage?"inventory":"map");
            if(!this.bridge.openJoAEntitySheet?.(key,{origin}))notice("Karakter kağıdı açılamadı.");
        }
        openPortableInventory(entity){
            if(entity?.isTravelGroup){
                this.portableTravelGroupId=String(entity.groupId||"");this.portableContainerKey="";
                const panel=this.overlay?.querySelector(".joa-portable-inventory");if(!panel)return false;
                panel.dataset.worldKey=String(entity.key||"");panel.dataset.travelGroupId=this.portableTravelGroupId;panel.classList.add("open");panel.setAttribute("aria-hidden","false");this.renderPortableInventory();return true;
            }
            const sourceKey=String(entity?.sourceEntityKey||entity?.sourceCharacterKey||"");
            if(!sourceKey){notice("Bu piyonun taşınabilir bir Mevcudat konteyneri yok.");return false;}
            this.portableTravelGroupId="";this.portableContainerKey=sourceKey;
            const panel=this.overlay?.querySelector(".joa-portable-inventory");if(!panel)return false;
            panel.dataset.worldKey=String(entity.key||"");delete panel.dataset.travelGroupId;panel.classList.add("open");panel.setAttribute("aria-hidden","false");this.renderPortableInventory();return true;
        }
        closePortableInventory(){
            this.portableContainerKey="";this.portableTravelGroupId="";const panel=this.overlay?.querySelector(".joa-portable-inventory");if(!panel)return;
            panel.classList.remove("open");panel.setAttribute("aria-hidden","true");delete panel.dataset.worldKey;delete panel.dataset.travelGroupId;
        }
        portableEjectionPoint(carrier,childKey){
            const text=String(childKey||"");let hash=2166136261;for(const ch of text){hash^=ch.codePointAt(0)||0;hash=Math.imul(hash,16777619)>>>0;}
            const occupied=this.entities.filter(item=>String(item.layerKey||"surface")===String(carrier.layerKey||"surface"));
            for(let attempt=0;attempt<16;attempt++){
                const angle=((hash%360)+attempt*137.507764)*Math.PI/180,radius=.72+((hash>>>8)%29)/100;
                const point={x:(Number(carrier.x)||0)+Math.cos(angle)*radius,z:(Number(carrier.z)||0)+Math.sin(angle)*radius};
                if(occupied.every(item=>String(item.key)===String(carrier.key)||Math.hypot((Number(item.x)||0)-point.x,(Number(item.z)||0)-point.z)>.42))return point;
            }
            return{x:(Number(carrier.x)||0)+1,z:Number(carrier.z)||0};
        }
        async ejectPortableEntity(childKey){
            const panel=this.overlay?.querySelector(".joa-portable-inventory"),worldKey=String(panel?.dataset.worldKey||""),portableGroup=this.portableTravelGroupId?this.travelGroupRecord(this.portableTravelGroupId):null,carrier=this.entities.find(item=>String(item.key)===worldKey)||(portableGroup?{key:`group:${portableGroup.id}`,groupId:portableGroup.id,isTravelGroup:true,x:portableGroup.x,z:portableGroup.z,layerKey:portableGroup.layerKey}:null);
            const sourceKey=String(childKey||"");if(!carrier){notice("Taşıyıcı piyon artık haritada değil.");this.closePortableInventory();return false;}
            const point=this.portableEjectionPoint(carrier,sourceKey),moved=await this.bridge.moveJoAInventoryNode?.(sourceKey,"root",Date.now());if(!moved){notice("Bu mevcudat konteynerden çıkarılamadı.");return false;}
            const placed=await this.bridge.placeJoAInventoryNodeOnMap?.(sourceKey,{...point,layerKey:String(carrier.layerKey||portableGroup?.layerKey||this.state.layerKey||"surface")});if(!placed){notice("Piyon dışarı çıkarıldı ancak haritaya yerleştirilemedi.");return false;}
            this.reloadWorldState();this.refreshEntities();this.refreshAll();this.renderPortableInventory();notice(`${placed.name||"Mevcudat"} taşıyıcıdan çıktı ve çevresine yerleşti.`,2400);return true;
        }
        renderPortableInventory(){
            const panel=this.overlay?.querySelector(".joa-portable-inventory"),list=panel?.querySelector(".joa-portable-list");if(!panel||!list||(!this.portableContainerKey&&!this.portableTravelGroupId))return;
            const records=this.inventoryRecords(),group=this.portableTravelGroupId?this.travelGroupRecord(this.portableTravelGroupId):null,container=records.find(item=>String(item.key)===String(this.portableContainerKey));
            const parentKey=group?`group:${group.id}`:String(this.portableContainerKey),children=records.filter(item=>String(item.parentKey||"root")===parentKey).sort((a,b)=>Number(a.order)-Number(b.order)||String(a.name).localeCompare(String(b.name),"tr"));
            const heading=panel.querySelector("header strong");if(heading)heading.textContent=group?.name||container?.name||"İç Konteynerler";
            list.replaceChildren();
            if(!children.length){const empty=document.createElement("div");empty.className="joa-portable-empty";empty.innerHTML=group?'<strong>Seyahat grubu boş</strong><span>Seyahat modunda E + sol tık ile karakterleri bu noktaya yönlendir.</span>':'<strong>Konteyner boş</strong><span>Mevcudat’ta bu piyonun içine karakter veya mekân taşıyabilirsin.</span>';list.appendChild(empty);return;}
            for(const item of children){const row=document.createElement("button");row.type="button";row.className="joa-portable-row";row.style.setProperty("--portable-accent",String(item.accent||"#71cde9"));row.innerHTML=`<i aria-hidden="true">${item.isTravelGroup?"◎":item.entityType==="location"?"◇":"◉"}</i><span><strong>${escapeHtml(item.name||"Mevcudat")}</strong><small>${escapeHtml(item.subtitle||item.entityType||"Karakter")}</small></span><b title="İçindeki doğrudan mevcudat sayısı">${Math.max(0,Number(item.childrenCount)||0)}</b>`;
                row.onclick=event=>{event.preventDefault();event.stopPropagation();if(item.isTravelGroup){this.portableTravelGroupId=String(item.groupId||"");this.portableContainerKey="";panel.dataset.worldKey=String(item.key||"");panel.dataset.travelGroupId=this.portableTravelGroupId;this.renderPortableInventory();return;}this.openDetail(item.key);};
                row.oncontextmenu=event=>{event.preventDefault();event.stopPropagation();void this.ejectPortableEntity(item.key);};
                list.appendChild(row);
            }
        }
        async startEncounter(){
            const keys=[...this.inventorySelected];
            if(!keys.length){notice('Önce F1 tuşuyla Mevcudatı açıp karşılaşacakları seç.');return;}
            const result=await this.bridge.startJoAEncounter?.(keys);
            if(!result?.ok){notice(result?.error||"Karşılaşma başlatılamadı.");return;}
            this.close({save:true});
        }
        renderEmptyState(){if(!this.overlay)return;const empty=this.overlay.querySelector(".joa-empty-world"),here=this.entities.some(item=>["character","location","travel-group"].includes(String(item.entityType||""))&&String(item.layerKey||"surface")===this.state.layerKey),info=this.layerInfo();empty.classList.toggle("hidden",here||!!this.pendingPlacement);const strong=empty.querySelector("strong"),span=empty.querySelector("span"),button=empty.querySelector("button");if(strong)strong.textContent=`${info.label} üzerinde piyon yok`;if(span)span.textContent="F1 ile Mevcudat’tan karakter, mekân veya Seyahat Grubu kartı getir.";if(button)button.textContent="Mevcudat’ı Aç";}
        async placeParty(){this.toggleInventory(true);}


        reloadWorldState({preserveTravelGroups=false}={}){
            const groups=preserveTravelGroups?this.travelGroupSnapshot():null,fresh=this.bridge.getWorldMapState?.();if(!fresh)return;
            const camera=this.renderer?.camera?{...this.renderer.camera}:{...(this.state?.camera||{})};this.state={...fresh,camera};if(groups)this.state.travelGroups=groups;
            if(preserveTravelGroups)this.persistTravelGroups("preserved-reload");
            else{const canonical=this.bridge.listJoATravelGroups?.();if(canonical&&Array.isArray(canonical.groups)){this.state.travelGroups=canonical.groups;this.state.travelGroupsRevision=Number(canonical.revision)||0;}}
            if(!Array.isArray(this.state.travelGroups))this.state.travelGroups=[];
        }
        activeTravelRoutes(){return(Array.isArray(this.state?.activeTravelRoutes)?this.state.activeTravelRoutes:[]).filter(route=>route&&route.key&&Array.isArray(route.path)&&route.path.length&&(route.path.length>1||route.entryBlocked===true));}
        ensureTravelPlan(subject){
            let plan=this.travelPlans.get(subject.key);
            if(!plan){plan={key:subject.key,name:subject.name,speed:Math.max(.01,Number(subject.travelSpeed)||JOA_DEFAULT_SPEED_MPS),speedUnit:"mps-v1",visionRange:Math.max(0,Number(subject.visionRange)||0),sourceRecordKey:String(subject.sourceEntityKey||""),isTravelGroup:subject.isTravelGroup===true,groupId:String(subject.groupId||""),path:[{x:Number(subject.x)||0,z:Number(subject.z)||0}]};this.travelPlans.set(subject.key,plan);}
            return plan;
        }
        travelPointBeside(subject,target){
            const plan=this.travelPlans.get(String(subject?.key||""));
            const from=(plan?.path?.length?plan.path[plan.path.length-1]:subject)||{x:0,z:0};
            const tx=Number(target?.x)||0,tz=Number(target?.z)||0,fx=Number(from?.x)||0,fz=Number(from?.z)||0;
            let dx=fx-tx,dz=fz-tz,length=Math.hypot(dx,dz);
            if(length<.0001){dx=1;dz=0;length=1;}
            const sourceDiameter=Math.max(.01,Number(subject?.worldDiameterM)||1),targetDiameter=Math.max(.01,Number(target?.worldDiameterM)||1);
            const standOff=(sourceDiameter+targetDiameter)/2+.18;
            return{x:tx+(dx/length)*standOff,z:tz+(dz/length)*standOff};
        }
        setTravelContainerDestination(subject,target){
            if(!subject||!target||String(subject.key)===String(target.key))return false;
            const sourceRecordKey=String(subject.sourceEntityKey||""),targetRecordKey=String(target.sourceEntityKey||"");
            if((!sourceRecordKey&&!subject.isTravelGroup)||!targetRecordKey){notice("Bu iki piyon konteyner ilişkisi kuramıyor.");return false;}
            const plan=this.ensureTravelPlan(subject);
            plan.sourceRecordKey=sourceRecordKey;
            plan.enterTargetRecordKey=targetRecordKey;
            plan.enterTargetWorldKey=String(target.key||"");
            plan.enterTargetName=String(target.name||"Mevcudat");
            delete plan.joinGroupId;
            if(subject.isTravelGroup)plan.groupContainerEntry=true;
            this.addTravelPoint({x:Number(target.x)||0,z:Number(target.z)||0},true);
            this.finishRouteDrawing();
            notice(`${subject.name||"Mevcudat"} → ${target.name||"Mevcudat"} içine giriş rotası hazır · Boşluk ile hareket.`,3600);
            return true;
        }
        cancelPendingRouteForEntity(subject){
            const key=String(subject?.key||"");if(!key)return false;const existed=this.travelPlans.delete(key);
            if(String(this.activeTravelKey||"")===key){this.routeDrawing=false;this.activeTravelKey="";this.travelPreview=null;}
            this.worldSelected.delete(key);this.createMarkers();this.drawTravelRoute();this.updateTravelConsole();
            if(existed)notice(`${subject?.name||"Mevcudat"} için çizilen bireysel rota iptal edildi.`,2200);return existed;
        }
        beginRouteForEntity(subject){
            if(!this.travelMode||!subject)return;
            if(subject.pinned===true){notice(`${subject.name||"Karakter"} sabit. Önce sabitliği gevşet.`);return;}
            const active=this.activeTravelRoutes().find(route=>String(route.key)===String(subject.key));if(active){void this.cancelActiveRoute(subject);return;}
            if(this.routeDrawing&&this.activeTravelKey!==subject.key)this.finishRouteDrawing();
            this.toggleInventory(false);this.travelPlans.delete(subject.key);this.ensureTravelPlan(subject);this.activeTravelKey=subject.key;this.routeDrawing=true;
            // R60: seyahat modundaki ilk sol tık yalnız rota aktörünü seçmez;
            // seçim halkası, aktif görüş/sis sahibi, kamera ve hareket takip
            // anahtarını da aynı piyona geçirir.
            this.activateTravelingEntityView(subject);
            this.travelPreview=null;this.createMarkers();this.renderOverlay();this.drawTravelRoute();this.updateTravelConsole();
        }
        startTravelForEntity(subject){if(!this.travelMode)this.toggleTravel();this.beginRouteForEntity(subject);}
        toggleTravel(){
            if(this.travelMode){this.cancelTravel({clearPlans:true});return;}
            this.toggleInventory(false);this.travelMode=true;this.routeDrawing=false;this.activeTravelKey="";this.worldSelected.clear();this.overlay.classList.add("travel-mode");const console=this.overlay.querySelector(".joa-travel-console");console.classList.add("open");console.setAttribute("aria-hidden","false");this.createMarkers();this.renderOverlay();this.drawTravelRoute();this.updateTravelConsole();
        }
        async cancelActiveRoute(subject){
            const ok=await this.bridge.cancelJoATravelRoute?.(subject.key);if(!ok){notice("İptal edilecek etkin rota bulunamadı.");return;}
            this.reloadWorldState();this.refreshEntities();this.createMarkers();this.renderOverlay();this.drawTravelRoute();this.updateTravelConsole();notice(`${subject.name||"Mevcudat"} bulunduğu yerde durdu; kalan rota iptal edildi.`);
        }
        async cancelAllTravel(){
            if(this.travelCancelInFlight)return false;this.travelCancelInFlight=true;const animationSnapshot=this.travelAnimationSnapshot?{...this.travelAnimationSnapshot,positions:(this.travelAnimationSnapshot.positions||[]).map(item=>({...item}))}:null,preview=this.travelExecutionPreview?{...this.travelExecutionPreview}:null;this.travelCancelVersion++;
            const gathering=this.groupGathering,planned=this.travelPlans.size,knownActive=this.activeTravelRoutes().length;
            if(gathering){gathering.cancelled=true;gathering.pending.clear();if(typeof gathering.releaseWait==="function"){gathering.releaseWait();gathering.releaseWait=null;}}
            this.travelPlans.clear();this.routeDrawing=false;this.activeTravelKey="";this.travelPreview=null;this.travelAnimationRoutes=[];
            try{
                if(this.travelStartPromise)try{await this.travelStartPromise;}catch(_){}
                // R56 Patch 08: Seyahat sonucu henüz kesinleştirilmeden oynatılır.
                // Esc gelirse yalnız ekranda gerçekten geçen oran kadar oyun zamanı
                // ilerletilir, ardından tam interpolasyon koordinatları kayda yazılır.
                if(this.travelCommitPromise)try{await this.travelCommitPromise;}catch(_){}
                else if(animationSnapshot?.positions?.length){const fraction=clamp(Number(animationSnapshot.progress)||0,0,.999999),fullSeconds=Math.max(0,Number(preview?.seconds||animationSnapshot.gameSeconds)||0),elapsed=Math.max(0,Math.floor(fullSeconds*fraction));if(elapsed>0)await this.bridge.advanceJoATravelSharedSlice?.({elapsedSeconds:elapsed,reason:"JoA seyahati Esc ile durduruldu"});await this.bridge.commitJoATravelPositions?.(animationSnapshot.positions);}
                let result=await this.bridge.cancelAllJoATravelRoutes?.();
                if(!result){const keys=this.activeTravelRoutes().map(route=>String(route.key));const settled=await Promise.all(keys.map(key=>Promise.resolve(this.bridge.cancelJoATravelRoute?.(key)).catch(()=>false)));result={ok:true,cancelled:settled.filter(Boolean).length};}
                this.travelAnimating=false;this.groupGathering=null;this.travelExecutionPreview=null;this.travelAnimationSnapshot=null;this.overlay?.classList.remove("travel-animating");this.cancelTravel({clearPlans:true});this.reloadWorldState();this.refreshEntities();this.refreshAll();
                const cancelled=Math.max(0,Number(result?.cancelled)||knownActive);notice(`Seyahat iptal edildi · ${planned} hazır rota ve ${cancelled} devam eden rota silindi. Bütün piyonlar ulaştıkları son konumda kaldı.`,4200);return true;
            }catch(error){console.error("Bütün seyahat rotaları iptal edilemedi",error);this.travelAnimating=false;this.groupGathering=null;this.travelExecutionPreview=null;this.travelAnimationSnapshot=null;this.overlay?.classList.remove("travel-animating");this.cancelTravel({clearPlans:true});this.reloadWorldState();this.refreshAll();notice("Seyahat ekranı durduruldu fakat kayıtlı rotaların tamamı silinemedi.",5200);return false;}
            finally{this.travelCancelInFlight=false;this.ePlaceHeld=false;this.overlay?.classList.remove("enter-container-modifier");}
        }
        async cancelGroupGathering(){
            if(!this.groupGathering)return false;return await this.cancelAllTravel();
        }
        cancelTravel({clearPlans=true}={}){
            this.travelMode=false;this.routeDrawing=false;this.travelPreview=null;this.activeTravelKey="";this.worldSelected.clear();this.ePlaceHeld=false;if(clearPlans)this.travelPlans.clear();this.overlay?.classList.remove("travel-mode","enter-container-modifier");const console=this.overlay?.querySelector(".joa-travel-console");if(console){console.classList.remove("open");console.setAttribute("aria-hidden","true");}this.drawTravelRoute();this.createMarkers();this.renderOverlay();
        }
        pathDistance(path){let distance=0;for(let i=1;i<path.length;i++)distance+=Math.hypot(path[i].x-path[i-1].x,path[i].z-path[i-1].z);return distance;}
        prepareTravelPath(path){
            const clean=(Array.isArray(path)?path:[]).map(point=>({x:Number(point?.x)||0,z:Number(point?.z)||0,...point}));
            const cumulative=new Float64Array(Math.max(1,clean.length));let total=0;
            for(let i=1;i<clean.length;i++){total+=Math.hypot(clean[i].x-clean[i-1].x,clean[i].z-clean[i-1].z);cumulative[i]=total;}
            return{path:clean,cumulative,total};
        }
        pointAlongPrepared(prepared,fraction){
            const path=prepared?.path||[],cumulative=prepared?.cumulative,total=Math.max(0,Number(prepared?.total)||0);
            if(!path.length)return{point:{x:0,z:0},index:0,distance:0};
            if(!total||fraction>=1){const end=path[path.length-1];return{point:end,index:path.length-1,distance:total};}
            const target=total*clamp(fraction,0,1);let lo=1,hi=path.length-1;
            while(lo<hi){const mid=(lo+hi)>>1;if(cumulative[mid]<target)lo=mid+1;else hi=mid;}
            const i=Math.max(1,lo),a=path[i-1],b=path[i],start=cumulative[i-1]||0,segment=Math.max(0,cumulative[i]-start),t=segment?clamp((target-start)/segment,0,1):1;
            return{point:{x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t},index:i,distance:target};
        }
        pointAlongPath(path,fraction){const prepared=this.prepareTravelPath(path),along=this.pointAlongPrepared(prepared,fraction);return{point:along.point,traveledPath:[along.point],remainingPath:[along.point],distance:along.distance};}
        routeDisplayPath(path,maxPoints=700){
            if(!Array.isArray(path)||path.length<=maxPoints)return path||[];const out=[path[0]],step=(path.length-1)/(maxPoints-1);
            for(let i=1;i<maxPoints-1;i++)out.push(path[Math.min(path.length-2,Math.round(i*step))]);out.push(path[path.length-1]);return out;
        }
        validTravelPlans(){return[...this.travelPlans.values()].filter(plan=>Array.isArray(plan.path)&&plan.path.length>1&&this.pathDistance(plan.path)>.05&&this.entities.some(item=>item.key===plan.key));}
        updateTravelConsole(){
            if(!this.overlay)return;const plans=this.validTravelPlans(),active=this.travelPlans.get(this.activeTravelKey),running=this.activeTravelRoutes();let text;
            if(this.routeDrawing&&active){const distance=this.pathDistance(active.path),seconds=travelSeconds(distance,active.speed);text=`${active.name} rotası çiziliyor · ${formatDistance(distance)} · ${Number(active.speed||JOA_DEFAULT_SPEED_MPS).toFixed(2)} metre/saniye · ${formatDuration(seconds)} oyun zamanı · ikinci tık: bitir`;}
            else if(plans.length)text=`${plans.length} rota hazır · E + grup: katıl · grup piyonuna rota: bütün üyeler beraber · Boşluk: hareket`;
            else text=`Piyona tıkla → G: 3×3 grup noktası · E + grup: katıl · Seyahat Grubu sağ tık: dağıt · orta tık: iç Mevcudat${running.length?` · yolda: ${running.length}`:""}`;
            this.overlay.querySelector(".joa-travel-metric").textContent=text;
        }
        drawTravelRoute(){
            if(!this.overlay||!this.renderer)return;const svg=this.overlay.querySelector(".joa-travel-route");svg.replaceChildren();
            const draw=(route,className)=>{if(!Array.isArray(route.path)||route.path.length<2)return;const line=document.createElementNS("http://www.w3.org/2000/svg","polyline");line.dataset.key=route.key;line.classList.add(className);if(route.key===this.activeTravelKey)line.classList.add("active");const routeMpp=1/Math.max(Number.MIN_VALUE,this.renderer?.lastView?.scale||1),maxRoutePoints=routeMpp>1e7?48:routeMpp>1e6?72:routeMpp>1e5?120:routeMpp>1e4?220:routeMpp>1e3?360:700;const displayPath=this.routeDisplayPath(route.path,maxRoutePoints);line.setAttribute("points",displayPath.map(point=>this.renderer.project(point.x,0,point.z)).filter(Boolean).map(point=>`${point.x},${point.y}`).join(" "));svg.appendChild(line);};
            const active=new Map();for(const route of this.activeTravelRoutes())active.set(String(route.key),route);for(const route of this.travelAnimationRoutes||[])active.set(String(route.key),route);
            for(const route of active.values())draw(route,"journey-active");for(const plan of this.travelPlans.values())draw(plan,"journey-planned");
        }
        travelVisualCadence(){
            const view=this.renderer?.lastView||this.renderer?.viewport?.(),mpp=1/Math.max(Number.MIN_VALUE,view?.scale||1);
            if(mpp<=4)return{interval:22,transition:28,ultra:false};
            if(mpp<=180)return{interval:34,transition:42,ultra:false};
            if(mpp<=18_000)return{interval:60,transition:66,ultra:false};
            if(mpp<=1_800_000)return{interval:110,transition:108,ultra:false};
            if(mpp<=18_000_000)return{interval:220,transition:80,ultra:true};
            return{interval:420,transition:0,ultra:true};
        }
        async animateTravelMovements(movements,{gameTime="",gameSeconds=0,refreshState=true,manageFlag=true}={}){
            const list=(Array.isArray(movements)?movements:[]).filter(item=>Array.isArray(item.path)&&item.path.length);if(!list.length){if(refreshState){this.reloadWorldState();this.refreshAll();}return;}
            const cancellationVersion=this.travelCancelVersion;
            if(manageFlag){if(this.travelAnimating)return;this.travelAnimating=true;this.overlay?.classList.add("travel-animating");}
            const animationRoutes=new Map((this.travelAnimationRoutes||[]).map(route=>[String(route.key),route]));for(const movement of list)if(!animationRoutes.has(String(movement.key)))animationRoutes.set(String(movement.key),{key:String(movement.key),path:movement.path.map(point=>({...point}))});this.travelAnimationRoutes=[...animationRoutes.values()];
            const preparedByKey=new Map();for(const movement of list)preparedByKey.set(String(movement.key),this.prepareTravelPath(movement.path));
            const longestDistance=Math.max(...list.map(item=>Math.max(1,preparedByKey.get(String(item.key))?.total||1)));
            const travelView=this.renderer?.lastView||this.renderer?.viewport?.(),travelMpp=1/Math.max(Number.MIN_VALUE,travelView?.scale||1);
            let maxPixelMove=0;for(const movement of list){const startPoint=movement.start||movement.path?.[0]||{},endPoint=movement.end||movement.path?.[movement.path.length-1]||{};const a=this.renderer?.project?.(Number(startPoint.x)||0,0,Number(startPoint.z)||0),b=this.renderer?.project?.(Number(endPoint.x)||0,0,Number(endPoint.z)||0);if(a&&b)maxPixelMove=Math.max(maxPixelMove,Math.hypot((b.x||0)-(a.x||0),(b.y||0)-(a.y||0)));}
            // PATCH90: ultra uzak atlas görünümünde bir Takat diliminin hareketi ekranda
            // görünmüyorsa 4.6 saniyelik animasyon yapmanın hiçbir anlamı yoktur. Mantıksal
            // seyahat bridge'de eksiksiz commit edilir; burada yalnız ucuz görsel temsil vardır.
            const ultraAtlas=travelMpp>1e7||maxPixelMove<1.25;
            const duration=ultraAtlas?120:travelMpp>1e6?360:travelMpp>1e5?650:clamp(650+Math.log10(longestDistance+10)*360,700,3200),start=performance.now();
            const entityByKey=new Map(this.entities.map(entity=>[String(entity.key),entity]));for(const movement of list){const entity=entityByKey.get(String(movement.key));if(entity){entity.x=Number(movement.start?.x??movement.path[0]?.x)||0;entity.z=Number(movement.start?.z??movement.path[0]?.z)||0;}}
            let lastClockSecond=-1,lastVisualAt=-Infinity,lastFogAt=-Infinity,finished=false;
            await new Promise(resolve=>{const step=now=>{
                if(cancellationVersion!==this.travelCancelVersion){resolve();return;}
                const progress=clamp((now-start)/duration,0,1),cadence=this.travelVisualCadence();
                if(progress<1&&now-lastVisualAt<cadence.interval){requestAnimationFrame(step);return;}
                lastVisualAt=now;const positions=[];
                for(const movement of list){
                    const entity=entityByKey.get(String(movement.key));if(!entity)continue;
                    const prepared=preparedByKey.get(String(movement.key)),movementSeconds=travelSeconds(prepared?.total||0,movement.speed),movementProgress=gameSeconds>0&&movementSeconds>0?clamp(progress*Math.max(0,Number(gameSeconds))/movementSeconds,0,1):progress,along=this.pointAlongPrepared(prepared,movementProgress),point=along.point;
                    entity.x=point.x;entity.z=point.z;if(entity.isTravelGroup){const group=this.travelGroupRecord(entity.groupId);if(group){group.x=point.x;group.z=point.z;}}
                    const animationRoute=animationRoutes.get(String(movement.key));if(animationRoute){const tail=prepared?.path||[];animationRoute.path=movementProgress>=1?[point]:[point,...tail.slice(Math.max(1,Number(along.index)||1))];}
                    const marker=this.markerNodes.get(String(movement.key));if(marker){marker.style.transition=`left ${cadence.transition}ms linear, top ${cadence.transition}ms linear`;marker.classList.toggle("travel-entered-preview",(movement.willEnter===true||movement.entered===true)&&movementProgress>=1);}
                    positions.push({key:String(movement.key),groupId:String(movement.groupId||entity.groupId||""),x:point.x,z:point.z});
                }
                const previewSeconds=gameSeconds>0?Math.max(0,Math.min(Math.round(Number(gameSeconds)||0),Math.floor(progress*Math.max(0,Number(gameSeconds)||0)))):0;
                if(gameSeconds>0&&previewSeconds!==lastClockSecond){lastClockSecond=previewSeconds;const clock=this.overlay?.querySelector(".joa-clock strong"),previewTime=this.bridge.previewJoAGameTime?.(previewSeconds);if(clock&&previewTime)clock.textContent=previewTime;}
                this.travelAnimationSnapshot={progress,gameSeconds:Math.max(0,Number(gameSeconds)||0),positions};this.travelAnimationRoutes=[...animationRoutes.values()];
                // PATCH91: araziyi yeniden üretmeden yalnız ucuz rota SVG'sini güncelle. Böylece
                // piyon ilerledikçe arkasında kalan sarı yol silinir; ultra uzak rotada da 48 noktalık
                // temsil çizgisi güncellendiğinden bu işlem arazi renderını kilitlemez.
                this.drawTravelRoute();
                if(!ultraAtlas||progress>=1)this.renderOverlay({preview:true,travelLight:true});
                if(!ultraAtlas&&now-lastFogAt>=Math.max(160,cadence.interval*2)){lastFogAt=now;this.drawFog();}
                if(progress<1){requestAnimationFrame(step);return;}finished=true;resolve();
            };requestAnimationFrame(step);});
            for(const movement of list){const marker=this.markerNodes.get(String(movement.key));if(marker)marker.style.transition="";}
            if(finished)this.travelAnimationRoutes=[];
            if(refreshState){this.reloadWorldState();this.refreshEntities();this.createMarkers();this.renderer?.invalidate();this.renderOverlay();this.updateTravelConsole();}
            if(gameTime&&this.overlay?.querySelector(".joa-clock strong"))this.overlay.querySelector(".joa-clock strong").textContent=gameTime;
            if(manageFlag){this.travelAnimating=false;this.overlay?.classList.remove("travel-animating");}
            return{completed:finished,progress:Number(this.travelAnimationSnapshot?.progress)||0,positions:(this.travelAnimationSnapshot?.positions||[]).map(item=>({...item}))};
        }
        async executeTravel(){
            if(this.travelAnimating)return;const plans=this.validTravelPlans();if(!plans.length){notice("Önce S ile seyahat moduna gir, piyona tıkla ve rotayı ikinci tıkla tamamla.");return;}const executionVersion=this.travelCancelVersion;
            // Kamera pan/zoom kaydı seyahat commit'iyle yarışmasın. Bekleyen kamera kaydı
            // animasyon sonuna ertelenir; dünya hareketi bridge tarafından tek başına commit edilir.
            if(this.saveTimer){clearTimeout(this.saveTimer);this.saveTimer=0;this.travelCameraDirty=true;}
            this.travelAnimating=true;this.overlay?.classList.add("travel-animating");
            try{
                this.travelAnimationRoutes=plans.map(plan=>({...plan,path:plan.path.map(point=>({...point}))}));this.drawTravelRoute();
                const startPromise=Promise.resolve(this.bridge.startJoATravelRoutes?.(plans.map(plan=>({...plan,path:plan.path.map(point=>({...point}))}))));this.travelStartPromise=startPromise;const started=await startPromise;if(this.travelStartPromise===startPromise)this.travelStartPromise=null;if(!started?.ok)throw new Error(started?.error||"Rotalar başlatılamadı.");
                if(executionVersion!==this.travelCancelVersion)return;
                const selectedKey=String(this.controlledEntityKey||plans[0]?.key||"");
                this.travelPlans.clear();this.routeDrawing=false;this.activeTravelKey="";this.worldSelected.clear();if(selectedKey)this.worldSelected.add(selectedKey);
                const preview=this.bridge.previewJoATravelSharedSlice?.();if(!preview?.ok){this.reloadWorldState();this.refreshAll();notice(preview?.error||"Seyahat için ortak zaman dilimi bulunamadı.",5200);this.cancelTravel({clearPlans:true});return;}this.travelExecutionPreview={...preview};
                const animated=await this.animateTravelMovements(preview.movements||[],{gameSeconds:preview.seconds,refreshState:false,manageFlag:false});if(executionVersion!==this.travelCancelVersion||!animated?.completed)return;
                const commitPromise=Promise.resolve(this.bridge.advanceJoATravelSharedSlice?.({elapsedSeconds:preview.seconds,reason:preview.mode==="entry"?"Son konteyner girişine kadar eşzamanlı seyahat":"İlk rota bitimine kadar eşzamanlı seyahat"}));this.travelCommitPromise=commitPromise;const result=await commitPromise;if(this.travelCommitPromise===commitPromise)this.travelCommitPromise=null;if(executionVersion!==this.travelCancelVersion)return;if(!result?.ok)throw new Error(result?.error||"Seyahat kesinleştirilemedi.");
                this.travelAnimationSnapshot=null;this.travelExecutionPreview=null;this.reloadWorldState();this.refreshEntities();this.createMarkers();this.renderer?.invalidate();this.renderOverlay();this.updateTravelConsole();const clock=this.overlay?.querySelector(".joa-clock strong"),committedTime=this.bridge.getAdventureInfo?.().gameTime||result.gameTime;if(clock&&committedTime)clock.textContent=committedTime;this.save();
                const travel=result.travel||{},entered=travel.entered||[],completed=travel.completed||[],paused=travel.paused||[],exhausted=travel.exhausted||[],blocked=result.blocked||[],remaining=this.activeTravelRoutes().length;
                notice(`${entered.length?`${entered.map(item=>`${item.name} → ${item.targetName} içine girdi`).join(" · ")}. `:""}${completed.length&&!entered.length?`${completed.join(", ")} rotasını tamamladı. `:""}${exhausted.length?`${exhausted.join(", ")} Takatı bittiği için durdu. `:""}${paused.length?`${paused.join(", ")} bulunduğu noktada bekliyor. `:""}${blocked.length?`${blocked.map(item=>item.name).join(", ")} rotasında ilerledi fakat geçersiz hedefe giremedi; hedef kaydı korundu. `:""}${remaining?`${remaining} tamamlanmamış veya giriş bekleyen rota kayıtta kaldı. `:""}${formatDuration(result.seconds||preview.seconds)} geçti.`);
                this.cancelTravel({clearPlans:true});
            }catch(error){console.error("JoA seyahati tamamlanamadı",error);const clock=this.overlay?.querySelector(".joa-clock strong"),currentTime=this.bridge.getAdventureInfo?.().gameTime;if(clock&&currentTime)clock.textContent=currentTime;notice("Seyahat tamamlanamadı: "+(error?.message||error),7000);}
            finally{this.groupGathering=null;this.travelStartPromise=null;this.travelCommitPromise=null;this.travelAnimationRoutes=[];this.travelAnimating=false;this.overlay?.classList.remove("travel-animating");if(executionVersion===this.travelCancelVersion&&!this.travelCancelInFlight){this.travelAnimationSnapshot=null;this.travelExecutionPreview=null;this.reloadWorldState();this.refreshAll();}if(this.travelCameraDirty){this.travelCameraDirty=false;queueMicrotask(()=>{if(this.overlay?.isConnected)this.scheduleSave();});}}
        }
        recordVisionAlong(path,entity=this.activeVisionEntity(),force=false){
            // v0.1.28: keşif izi tutulmaz. Görüş yalnız aktif karakterin canlı dairesidir.
            // Aktif piyonun x/z'si animasyonla değiştiği için görüş dairesi onu izler;
            // kamera ise kullanıcının bıraktığı kadrajda kalır.
            return false;
        }
        createMarkers(){
            if(!this.overlay)return;const host=this.overlay.querySelector(".joa-map-markers");host.replaceChildren();this.markerNodes.clear();
            const groupKeys=new Set((this.state.travelGroups||[]).map(group=>`group:${String(group.id||"")}`)),groupedSourceKeys=new Set(this.inventoryRecords().filter(item=>!item.isTravelGroup&&groupKeys.has(String(item.parentKey||"root"))).map(item=>String(item.key||"")));for(const group of this.state.travelGroups||[])for(const key of group.members||[])groupedSourceKeys.add(String(key));
            const visibleLayerEntities=this.entities.filter(item=>String(item.layerKey||"surface")===this.state.layerKey&&(item.isTravelGroup||!groupedSourceKeys.has(String(item.sourceEntityKey||""))));
            for(const entity of visibleLayerEntities){
                // R18: Macera Grubu kendi piyonunu daima korur. Üyeler bu piyonun çevresindeki bağlı formasyondur.
                const marker=document.createElement("button");marker.type="button";marker.tabIndex=-1;marker.className="joa-world-token entity";marker.style.setProperty("--entity-accent",String(entity.accent||"#8be5ff"));marker.dataset.key=entity.key;marker.classList.toggle("selected",this.worldSelected.has(entity.key));marker.classList.toggle("traveling",this.activeTravelRoutes().some(route=>String(route.key)===String(entity.key))||this.travelPlans.has(entity.key));marker.classList.toggle("pinned",entity.pinned===true);marker.classList.toggle("location",String(entity.entityType||"")==="location");marker.classList.toggle("travel-group",entity.isTravelGroup===true);
                const pawnImage=entity.avatar||entity.cardImage||entity.portrait||entity.image||"",crop=entity.avatarCrop||{},cropX=clamp(Number(crop.x)||50,0,100),cropY=clamp(Number(crop.y)||50,0,100),cropScale=clamp(Number(crop.scale)||1,1,4);
                const art=entity.isTravelGroup?`<i class="joa-travel-group-sigil" aria-hidden="true"><svg viewBox="0 0 64 64"><circle class="orbit" cx="32" cy="32" r="24"/><path class="crescent" d="M38 13c-12 3-18 18-10 29 4 6 11 9 18 7-5 5-12 8-20 6C13 52 5 39 8 26 11 13 24 5 38 9Z"/><circle class="member" cx="21" cy="25" r="4"/><circle class="member" cx="42" cy="25" r="4"/><circle class="member" cx="32" cy="42" r="4"/><path class="bond" d="M24 28 30 38M40 28 34 38M25 25h13"/></svg></i>`:pawnImage?`<img style="--crop-x:${cropX}%;--crop-y:${cropY}%;--crop-scale:${cropScale}" src="https://alek-assets.local/${escapeHtml(String(pawnImage).replace(/^\/+/,""))}" alt="">`:`<i aria-hidden="true" class="joa-token-fallback"></i>`;marker.innerHTML=`<span>${art}</span><small>${escapeHtml(entity.name||"Karakter")}</small>${entity.pinned?'<b class="joa-token-pin" title="Sabit">⌖</b>':''}`;
                marker.classList.toggle("container-entry-candidate",["character","location","travel-group"].includes(String(entity.entityType||"")));
                let markerPointer=null;
                marker.onpointerdown=event=>{
                    event.stopPropagation();if(event.button!==0){event.preventDefault();return;}
                    markerPointer={id:event.pointerId,x:event.clientX,y:event.clientY};
                    try{marker.setPointerCapture?.(event.pointerId);}catch(_){}
                };
                marker.onpointerup=event=>{
                    const active=markerPointer;markerPointer=null;if(!active||event.button!==0||active.id!==event.pointerId)return;
                    try{marker.releasePointerCapture?.(event.pointerId);}catch(_){}
                    if(Math.hypot(event.clientX-active.x,event.clientY-active.y)>7)return;
                    event.stopPropagation();event.stopImmediatePropagation?.();
                    marker.dataset.pointerActivatedAt=String(performance.now());marker.click();
                };
                marker.onpointercancel=()=>{markerPointer=null;};
                marker.onauxclick=event=>{if(event.button!==1)return;event.preventDefault();event.stopPropagation();this.openPortableInventory(entity);};
                marker.onclick=event=>{
                    event.preventDefault();event.stopPropagation();
                    // pointerup yukarıda seçimi doğrudan tetikler. Tarayıcının
                    // hemen arkasından ürettiği ikinci sentetik click yinelenmez.
                    if(event.detail>0&&performance.now()-(Number(marker.dataset.pointerActivatedAt)||0)<360)return;
                    const traveling=this.activeTravelRoutes().some(route=>String(route.key)===String(entity.key))||(this.travelAnimationRoutes||[]).some(route=>String(route.key)===String(entity.key));
                    // PATCH78: Seyahat modunda aynı piyona tekrar tıklamak o piyona ait
                    // rotayı iptal eder. Seyahat modu dışında aktif yolcuya tık hâlâ görüşe odaklanır.
                    if(this.travelMode&&traveling){void this.cancelActiveRoute(entity);return;}
                    if(traveling){this.activateTravelingEntityView(entity);return;}
                    if(this.focusHeld){this.focusHeld=false;this.focusWorldEntity(entity.key);return;}
                    if(this.travelMode){
                        if(this.routeDrawing){
                            const subject=this.entities.find(item=>String(item.key)===String(this.activeTravelKey||""));
                            if(subject&&String(subject.key)===String(entity.key)){this.cancelPendingRouteForEntity(subject);return;}
                            if(subject&&String(subject.key)!==String(entity.key)){
                                if(this.ePlaceHeld){if(entity.isTravelGroup)this.setTravelGroupDestination(subject,entity);else this.setTravelContainerDestination(subject,entity);return;}
                                const plan=this.travelPlans.get(subject.key);
                                if(plan){delete plan.enterTargetRecordKey;delete plan.enterTargetWorldKey;delete plan.enterTargetName;delete plan.joinGroupId;}
                                this.addTravelPoint(this.travelPointBeside(subject,entity),true);
                                this.finishRouteDrawing();
                                return;
                            }
                            this.addTravelPoint({x:Number(entity.x)||0,z:Number(entity.z)||0},true);this.finishRouteDrawing();return;
                        }
                        this.beginRouteForEntity(entity);return;
                    }

                    if(entity.isTravelGroup){this.worldSelected.clear();this.worldSelected.add(entity.key);this.controlledEntityKey=String(entity.key||"");this.state.controlledEntityKey=this.controlledEntityKey;this.scheduleSave();this.createMarkers();this.renderer?.invalidate();this.renderOverlay();return;}
                    this.selectWorldCharacter(entity,{enter:false});
                };
                marker.oncontextmenu=event=>{
                    event.preventDefault();event.stopPropagation();
                    if(entity.isTravelGroup){if(event.ctrlKey&&event.altKey){void this.removeTravelGroupFromMap(entity);return;}void this.disbandTravelGroup(entity);return;}
                    if(event.ctrlKey&&event.altKey){void this.removeEntityFromScene(entity);return;}

                    // Normal kartlı piyonlarda sağ tık kağıdı açar. Seyahat Grubunun
                    // kağıt içeriği yoktur; bu nedenle düz sağ tık doğrudan grubu dağıtır.
                    // İç Mevcudat ise diğer tüm piyonlarda olduğu gibi orta tıkla açılır.
                    const sourceKey=entity.sourceEntityKey||entity.sourceCharacterKey||entity.key;if(sourceKey)this.openDetail(sourceKey);
                };
                marker.ondblclick=async event=>{event.preventDefault();event.stopPropagation();const next=!entity.pinned;if(entity.isTravelGroup){const group=this.travelGroupRecord(entity.groupId);if(!group)return;group.pinned=next;entity.pinned=next;this.persistTravelGroups("pin-changed");this.createMarkers();this.renderOverlay();notice(entity.pinned?`${entity.name} sabitlendi.`:`${entity.name} serbest bırakıldı.`,1800);return;}const saved=await this.bridge.setWorldMapEntityPinned?.(entity.key,next);entity.pinned=!!saved;this.createMarkers();this.renderOverlay();notice(entity.pinned?`${entity.name} sabitlendi.`:`${entity.name} serbest bırakıldı.`,1800);};
                host.appendChild(marker);this.markerNodes.set(entity.key,marker);
            }
            if(this.overlay.querySelector(".joa-portable-inventory.open"))this.renderPortableInventory();
            this.renderOverlay();
        }
        drawFog(){
            // R22: Eski tam ekran fog-canvas her kamera karesinde milyonlarca piksel
            // dolduruyordu. Görüş artık tek canlı daire olduğundan aynı sonucu tek CSS
            // radial-gradient ile üretiriz: geçmiş taramalar render edilmez, dışarısı tam siyah.
            const fog=this.overlay?.querySelector(".joa-fog");if(!fog||!this.renderer)return;
            // PATCH81 kesin görüş kuralı: kamera ne kadar yakın/uzak olursa olsun
            // aktif karakterin görüş dairesinin DIŞI tam siyahtır. Ölçek, LOD ve
            // atlas modu sis kararına hiçbir koşul eklemez.
            const view=this.renderer.lastView||this.renderer.viewport(),region=this.discoveryRegions()[0]||null;
            if(!region){
                fog.style.background="#000";fog.style.opacity="1";return;
            }
            const center=this.renderer.worldToScreen(view,region.x,region.z),radius=Math.max(0,Number(region.r)||0)*view.scale;
            if(radius<=0||!Number.isFinite(radius)||!Number.isFinite(center.x)||!Number.isFinite(center.y)){fog.style.background="#000";fog.style.opacity="1";return;}
            // 0.75 px geçiş yalnız raster kenar aliasingini gizler; yarı keşif/sis değildir.
            const inner=Math.max(0,radius-.75),outer=radius+.25;
            fog.style.background=`radial-gradient(circle at ${center.x.toFixed(2)}px ${center.y.toFixed(2)}px, transparent 0 ${inner.toFixed(2)}px, #000 ${outer.toFixed(2)}px 100%)`;
            fog.style.opacity="1";
        }

        updateScaleBar(){
            if(!this.overlay||!this.renderer)return;const host=this.overlay.querySelector(".joa-scale-bar"),view=this.renderer.lastView||this.renderer.viewport();if(!host||!view)return;
            const targetWorld=JOA_SCALE_BAR_REFERENCE_PX/Math.max(Number.MIN_VALUE,view.scale),power=Math.pow(10,Math.floor(Math.log10(Math.max(.000001,targetWorld)))),normalized=targetWorld/power;const nice=(normalized>=5?5:normalized>=2?2:1)*power,pixels=clamp(nice*view.scale,42,190);let label;if(nice<1)label=`${Math.round(nice*100)} santimetre`;else label=formatDistance(nice);
            host.style.setProperty("--scale-width",`${Math.round(pixels)}px`);delete host.dataset.maxScaleKm;const text=host.querySelector("span");if(text)text.textContent=label;
        }

        renderOverlay({preview=false,travelLight=false}={}){
            if(!this.overlay||!this.renderer)return;
            const view=this.renderer.lastView||this.renderer.viewport();
            if(!preview){
                const info=this.layerInfo(),badge=this.overlay.querySelector(".joa-map-badge"),center=this.renderer.sampleAtCached?.(this.renderer.camera.targetX,this.renderer.camera.targetZ);
                if(badge)badge.textContent=center?.taxonomyCode?`${center.taxonomyCode} · ${center.taxonomyName}`:`${info.badge||info.label} · ${NS.archetypeName?.(this.renderer.generator.seed)||"yaşayan coğrafya"} · üretim alanı`;
                this.overlay.querySelectorAll("[data-world-layer]").forEach(button=>{const active=String(button.dataset.worldLayer)===String(this.state.layerKey);button.classList.toggle("active",active);button.setAttribute("aria-pressed",active?"true":"false");});
                const status=this.overlay.querySelector(".joa-discovery-status");if(status){const vision=this.activeVisionEntity(),radius=Math.round(this.runtimeVisionRange(vision?.visionRange));status.textContent=vision?(radius>0?`Aktif görüş · ${vision.name||"Karakter"} · ${radius} m yarıçap · dışarısı tamamen gizli`:`${vision.name||"Karakter"} · görüş kapalı`):"Bir karakter veya mekân seç · canlı görüş yalnız onun çevresinde açılır";}
                this.renderMapImages();this.renderPaint();
            }
            for(const entity of this.entities){const marker=this.markerNodes.get(entity.key);if(!marker)continue;const pawnCenter=this.entityWorldCenter(entity),p=this.renderer.project(pawnCenter.x,0,pawnCenter.z);const hidden=!p?.visible;marker.classList.toggle("offscreen",hidden);if(!p)continue;const diameter=String(entity.entityType||"")==="location"?JOA_LOCATION_DIAMETER_M:Math.max(.01,Number(entity.worldDiameterM)||Number(this.state.tokenDiameterM)||JOA_UNIT_DIAMETER_M),pixelDiameter=Math.max(.18,diameter*view.scale);marker.style.left=`${p.x}px`;marker.style.top=`${p.y}px`;marker.style.transform="translate(-50%,-50%)";marker.style.setProperty("--token-px",`${pixelDiameter}px`);marker.style.setProperty("--token-border-px",`${clamp(pixelDiameter*.12,.12,1.2)}px`);marker.classList.toggle("far",pixelDiameter<6);marker.classList.toggle("very-far",pixelDiameter<2);marker.classList.toggle("selected",this.worldSelected.has(entity.key));marker.classList.toggle("controlled",String(entity.key)===String(this.controlledEntityKey||this.state?.controlledEntityKey||""));}
            const visionRing=this.overlay.querySelector(".joa-vision-ring"),visionEntity=this.activeVisionEntity();if(visionRing&&visionEntity&&String(visionEntity.layerKey||"surface")===this.state.layerKey){const visionCenter=this.entityWorldCenter(visionEntity),p=this.renderer.project(visionCenter.x,0,visionCenter.z),meters=this.runtimeVisionRange(visionEntity.visionRange),radius=meters*view.scale;visionRing.hidden=!p||meters<=0||radius<2;if(p&&meters>0){visionRing.style.left=`${p.x}px`;visionRing.style.top=`${p.y}px`;visionRing.style.width=`${radius*2}px`;visionRing.style.height=`${radius*2}px`;const label=visionRing.querySelector("span");if(label)label.textContent=`${Math.round(meters)} metre görüş yarıçapı`;}}else if(visionRing)visionRing.hidden=true;
            if(!travelLight)this.drawTravelRoute();if(!preview)this.updateScaleBar();if(!travelLight)this.drawFog();
        }
        scheduleSave(){if(this.travelAnimating||this.travelStartPromise||this.travelCommitPromise){this.travelCameraDirty=true;return;}clearTimeout(this.saveTimer);this.saveTimer=setTimeout(()=>{this.saveTimer=0;this.save();},160);}
        save(){if(!this.state)return;if(this.renderer){this.renderer.syncLocalCameraMetadata?.();this.state.camera={...this.renderer.camera};this.state.layerCameras=this.state.layerCameras&&typeof this.state.layerCameras==="object"?this.state.layerCameras:{};this.state.layerCameras[String(this.state.layerKey||"surface")]={...this.renderer.camera};}this.state.entities=this.state.entities||[];this.state.mapImages=this.normalizeMapImages(this.state.mapImages);if(!Array.isArray(this.state.discoveredVisionPoints))this.state.discoveredVisionPoints=[];this.state.controlledEntityKey=String(this.controlledEntityKey||this.state.controlledEntityKey||"");this.state.legendOpen=!this.legendCollapsed;this.state.scaleUnit="meter-unbounded-r111-v1";this.state.meterPixelGridVersion=1;this.state.speedUnit="mps-v1";this.state.tokenDiameterM=JOA_UNIT_DIAMETER_M;this.bridge.saveWorldMapState?.(this.state);}
        hasTransientState(){
            if(!this.overlay?.isConnected)return false;
            if(this.pendingPlacement||this.paintRegionDraft||this.paletteOpen||this.travelMode)return true;
            if(this.overlay.querySelector(".joa-inventory-drawer.open"))return true;
            if(this.overlay.querySelector(".joa-portable-inventory.open"))return true;
            return false;
        }
        close({save=true,returnToTavern=false}={}){if(!this.overlay)return;
            // PATCH48: F1/F2 bir kamera komutu değildir. Map yüzeyi kapanmadan hemen
            // önce kullanıcının gerçek kadrajını RAM'de mühürle; Mevcudat yüzeyi
            // renderer taşımadığı için bu snapshot'a asla dokunmaz. F2 ile Map geri
            // açıldığında open() aynı targetX/targetZ/distance değerlerini birebir yükler.
            if(!this.inventoryPage&&this.renderer)this.mapCameraSnapshot={...this.renderer.camera};
            if(save)this.save();clearTimeout(this.saveTimer);if(this.paintRenderFrame)cancelAnimationFrame(this.paintRenderFrame);this.paintRenderFrame=0;if(this.zoomFrame)cancelAnimationFrame(this.zoomFrame);this.zoomFrame=0;this.zoomDelta=0;if(this.mapPanFrame)cancelAnimationFrame(this.mapPanFrame);this.mapPanFrame=0;this.mapPanDx=0;this.mapPanDy=0;for(const timer of this.markerClickTimers.values())clearTimeout(timer);this.markerClickTimers.clear();this.markerLastClickAt.clear();window.removeEventListener("alek:joa-entity-updated",this.onEntityUpdate);window.removeEventListener("alek:joa-travel-progress",this.onTravelProgress);window.removeEventListener("alek:joa-route-cancelled",this.onRouteCancelled);window.removeEventListener("alek:joa-time-refreshed",this.onTimeRefreshed);window.removeEventListener("alek:joa-travel-groups-changed",this.onTravelGroupsChanged);window.removeEventListener("alek:joa-map-image-selected",this.onMapImageSelected);if(this.onGlobalKeyDown)window.removeEventListener("keydown",this.onGlobalKeyDown,true);if(this.onGlobalKeyUp)window.removeEventListener("keyup",this.onGlobalKeyUp,true);if(this.onGlobalPointerMove)window.removeEventListener("pointermove",this.onGlobalPointerMove,true);if(this.onGlobalPointerUp){window.removeEventListener("pointerup",this.onGlobalPointerUp,true);window.removeEventListener("pointercancel",this.onGlobalPointerUp,true);}if(this.onPaintWindowBlur)window.removeEventListener("blur",this.onPaintWindowBlur,true);if(this.onPaintVisibilityChange)document.removeEventListener("visibilitychange",this.onPaintVisibilityChange,true);this.onGlobalKeyDown=null;this.onGlobalKeyUp=null;this.onGlobalPointerMove=null;this.onGlobalPointerUp=null;this.onPaintWindowBlur=null;this.onPaintVisibilityChange=null;this.onTravelGroupsChanged=null;this.onMapImageSelected=null;this.inventoryDragGhost?.remove();this.inventoryDragGhost=null;this.releasePaintAuxiliaryPointers();this.pendingPlacement=null;this.ePlaceHeld=false;this.ePlaceIntentUntil=0;this.focusHeld=false;this.inventoryPan=null;this.paintRegionDraft=null;this.paintLayerBuffer=null;this.paintBlurBuffer=null;this.mapImageDrag=null;this.pendingImageLayerId=null;this.mapImageNodes.clear();this.resetPaintUndo();this.onTravelProgress=null;this.onRouteCancelled=null;this.renderer?.dispose();this.renderer=null;this.overlay.remove();this.overlay=null;this.eventBus.emit("joa:closed",{});if(returnToTavern)queueMicrotask(()=>this.bridge.openMeggyTavern?.());}
        dispose(){this.close();}
    }

    app.registerModule({
        id:"joa.world-experience",
        order:60,
        async start({bridge,eventBus}){
            if(!bridge)throw new Error("JoA uyumluluk köprüsü bulunamadı.");
            this.previousToggle=window.__alekGetWorldMapToggleHandler?.()||window.__alekToggleWorldMap||null;
            this.controller=new JoAWorldController(bridge,eventBus);
            // v0.1.9: Ana Daire F2 ile açılır. JoA seyahati S ile planlanır. Eski Runtime Alt+S'yi
            // yakalasa bile bu uyumluluk işleyicisi yalnız tuşu tüketir; görünüm değiştirmez.
            this.toggle=()=>true;
            if(typeof window.__alekSetWorldMapToggleHandler==="function")window.__alekSetWorldMapToggleHandler(this.toggle);else window.__alekToggleWorldMap=this.toggle;
            window.__alekOpenJoAWorld=options=>this.controller.open(options||{});
            window.__alekOpenJoAMapPage=()=>this.controller.open({force:true,inventoryOnly:false});
            window.__alekOpenJoAInventoryPage=()=>this.controller.open({force:true,inventoryOnly:true});
            window.__alekCloseJoAWorld=options=>{this.controller.close(options||{});return true;};
            window.__alekToggleJoAInventory=force=>{this.controller.toggleInventory(force);return true;};
            window.__alekToggleJoAPalette=force=>this.controller.setPaletteOpen(force);
            // Legacy denetim için şimdilik tutuluyor; R26'da çalışma modları ana F geçişlerini kilitlemez.
            window.__alekJoAHasTransientState=()=>this.controller?.hasTransientState?.()===true;
            window.__ALEK_WORLD_MAP_SHORTCUT_OWNED__=true;
            // R26 · activeV2View legacy IIFE içinde kapalı kapsamdaydı; bu modül onu hiçbir
            // zaman göremediği için ilk açılışta eski Journey kart ekranı kalıyordu.
            // Orkestratörün kanonik yüzey bilgisini kullan ve açılışta bekleyen F1/F2
            // isteğini de kaybetme.
            try{
                requestAnimationFrame(()=>{
                    // R29 · Açılış Mavi Ayı etkinleştirilmeden JoA katmanı body'ye
                    // basılmaz. Aksi halde joa-world-shell splash'tan yüksek z-index ile
                    // açılış ekranını örtüp uygulamayı "bam diye açılmış" gösteriyordu.
                    if(window.__ALEK_COSMIC_OPENING_LOCKED__===true)return;
                    const pending=String(window.__ALEK_PENDING_JOA_SURFACE__||"");
                    const surface=pending||String(window.__alekCurrentPrimarySurface||"");
                    if(surface==="inventory")this.controller.open({force:true,inventoryOnly:true});
                    else if(surface==="map")this.controller.open({force:true,inventoryOnly:false});
                    if(pending)delete window.__ALEK_PENDING_JOA_SURFACE__;
                });
            }catch(_){}
        },
        async stop(){if(typeof window.__alekSetWorldMapToggleHandler==="function")window.__alekSetWorldMapToggleHandler(this.previousToggle);else if(this.previousToggle)window.__alekToggleWorldMap=this.previousToggle;this.controller?.dispose();delete window.__alekOpenJoAWorld;delete window.__alekOpenJoAMapPage;delete window.__alekOpenJoAInventoryPage;delete window.__alekCloseJoAWorld;delete window.__alekToggleJoAInventory;delete window.__alekToggleJoAPalette;delete window.__alekJoAHasTransientState;}
    });
})();
