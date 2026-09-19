;(()=>{
'use strict';

// Alekrythae Language Engine v6.0.3 POLYMORPH TURKISH IDENTITY HOTFIX
// One-way deterministic translator: Turkish/Latin -> fixed per-letter reading -> Local Glyph
// alek.window.fullscreen = true

const APP_VERSION = '6.0.3';
const LANGUAGE_CORE_VERSION = '17.0';
const ENGINE_EDITION = 'POLYMORPH';
const SYNTHESIS_SEED = 'Alekrythae-Polymorph-Independent240-v6';
const GRAMMAR_VERSION = '6.0-SIR2-POLYMORPH';
const MORPHOLOGY_VERSION = '6.0-LATTICE-FUSION';
const DICTIONARY_SCHEMA = 6;
const SYNTHESIS_SCHEMA = 'Independent240-Diverse256-Polymorph-v3';

// ============================================================
// CANON DATA FROM LORE v17
// ============================================================
const GLYPH_MULTI = [
  ['ae','ǽ'], ['th','þ'], ['kh','χ'], ['rh','ʁ'], ['zh','ʐ'],
  ['ch','č'], ['sh','š'], ['gh','ɣ'], ['ng','ɴ']
];
const GLYPH_SINGLE = {
  'a':'ɐ','b':'ƀ','c':'ƈ','d':'ḓ','e':'ɇ','f':'ƒ','g':'ǥ','h':'ħ','i':'ɨ','j':'ʝ','k':'ƙ','l':'ꞎ','m':'ɱ','n':'ŋ','o':'ɵ','p':'ƥ','q':'ʠ','r':'ɍ','s':'ś','t':'ŧ','u':'ʉ','v':'Ʋ','w':'ẅ','x':'χ','y':'ʏ','z':'ž',
  'æ':'ǽ','ř':'ṙ','ƴ':'ỿ','û':'ű','ø':'ǿ','ł':'ɬ','ŋ':'ɴ',
  'á':'ɐ','â':'ɐ','à':'ɐ','ä':'ɐ','é':'ɇ','ê':'ɇ','ë':'ɇ','í':'ɨ','î':'ɨ','ó':'ɵ','ô':'ɵ','ö':'ǿ','ú':'ʉ','ü':'ű','ç':'č','ş':'š','ğ':'ɣ','ı':'ɨ'
};
// Full 240-glyph inventory from Lore v17. This is the actual native alphabet pool.
// v1 used only the small transliteration subset below; v2 mathematical synthesis uses all 240.
const GLYPH240 = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "ꬲ", "æ", "á", "ã", "é", "ë", "í", "î", "ɨ", "ø", "ô", "ɵ", "ú", "û", "ʉ", "ƴ", "ý", "ÿ", "ł", "ŀ", "ꞎ", "ɇ", "ʏ", "Ɏ", "ŷ", "ɱ", "ṁ", "ń", "ñ", "ŋ", "ř", "ŕ", "ɍ", "ś", "š", "ʋ", "ṽ", "Ʋ", "ħ", "ḣ", "ḥ", "ẅ", "ŵ", "ƿ", "ʝ", "ĵ", "ǰ", "ƒ", "ḟ", "ž", "ź", "ƀ", "ɓ", "ç", "ċ", "ƈ", "ð", "ḓ", "đ", "ǥ", "ĝ", "ġ", "ɠ", "ƙ", "ķ", "ḱ", "ƥ", "ṕ", "ʠ", "ɋ", "χ", "ẋ", "ŧ", "ť", "þ", "ā", "ă", "ą", "ǎ", "ɐ", "ɑ", "ɒ", "ȧ", "ạ", "ả", "ấ", "ầ", "ẫ", "ǽ", "ꜳ", "ē", "ĕ", "ė", "ę", "ě", "ɛ", "ī", "ĭ", "į", "ı", "ɪ", "ɩ", "ō", "ŏ", "ő", "ǿ", "ɷ", "ɞ", "ū", "ŭ", "ů", "ű", "ų", "ɯ", "ȳ", "ɏ", "ỿ", "ɬ", "ɮ", "ɫ", "ƚ", "ƛ", "ȴ", "ḿ", "ṃ", "ᵯ", "ᶆ", "ꬺ", "ꝳ", "ᴟ", "ɲ", "ɳ", "ɴ", "ņ", "ň", "ƞ", "ʁ", "ʀ", "ɼ", "ɽ", "ɾ", "ṙ", "ɕ", "ʂ", "ŝ", "ş", "ș", "ȿ", "ṣ", "ʐ", "ʑ", "ƶ", "ȥ", "ɀ", "ẓ", "ⱬ", "ⱱ", "ⱴ", "ṿ", "ᶌ", "ỽ", "ʌ", "ɧ", "ĥ", "ƕ", "ȟ", "ɦ", "ḫ", "ẃ", "ẁ", "ẇ", "ẉ", "ẘ", "ⱳ", "ɉ", "ȷ", "ɟ", "ʒ", "ʓ", "ʄ", "ɸ", "ᵮ", "ᶂ", "ʩ", "ꞙ", "ḃ", "ƃ", "ᵬ", "ᶀ", "ḅ", "ḇ", "ꞵ", "ć", "ĉ", "č", "ȼ", "ḉ", "ꞓ", "ď", "ƌ", "ȡ", "ɖ", "ɗ", "ḍ", "ɣ", "ȝ", "ꝋ", "ƣ", "ɢ", "ʡ", "ʢ", "ʘ", "ɂ", "ꜣ"];
const GLYPH240_SET = new Set(GLYPH240);

// Every one of the 240 native glyphs is an independent atomic letter.
// v2.2 adds a FIXED one-way Latin reading to each glyph. These readings are
// properties of individual letters only: they do not form Aeth/Naer families,
// onset/nucleus/coda slots, 24x10 banks, semantic roots or positional templates.
// Generated words are still chosen directly from all 240 glyphs.
const GLYPH240_READING = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ae","æ","á","ã","é","ë","í","î","ï","ö","ô","ô","ú","û","ü","y","ý","ÿ","lh","l","ll","ê","ÿ","yh","ŷ","mh","ṁ","ń","ñ","ng","ř","ŕ","rr","ś","sh","vh","ṽ","v","hh","ḣ","ḥ","ẅ","ŵ","wh","jy","ĵ","ǰ","ph","ḟ","zh","ź","bh","bw","ç","ċ","ch","dh","dr","dz","gh","ĝ","ġ","gr","kh","ķ","ḱ","pf","ṕ","qh","q","xh","ẋ","th","ť","th","ā","ă","ą","ǎ","ă","aa","ao","ȧ","ạ","ả","ấ","ầ","ẫ","æ","aoe","ē","ĕ","ė","ę","ě","è","ī","ĭ","į","ı","ih","ii","ō","ŏ","ő","ö","oa","eo","ū","ŭ","ů","ű","ų","wu","ȳ","yi","yy","hl","lz","ł","tl","kl","ly","ḿ","ṃ","mm","mw","mn","oo","mu","ny","nr","nn","ņ","ň","nh","rh","rrh","rl","rd","rt","ṙ","sy","sr","ŝ","ş","ss","sz","ss","zhr","zy","zh","zd","zr","ẓ","zz","vw","vr","vv","vy","wy","â","hy","ĥ","hw","hr","hv","khh","ẃ","ẁ","ẇ","ẉ","ẘ","wr","jr","j","gy","zh","zj","jy","fh","ft","fr","fn","qv","ḃ","br","bm","bk","ḅ","ḇ","bv","ć","ĉ","č","ȼ","ḉ","cr","ď","dd","dj","dw","dy","ḍ","gh","yh","oi","oi","gg","qq","qr","qo","qk","qa"];
if (GLYPH240.length !== 240 || new Set(GLYPH240).size !== 240 || GLYPH240_READING.length !== 240) {
  throw new Error('240-glif çekirdeği bozuk: 240 bağımsız harf ve 240 okuma değeri gerekli.');
}

// ASCII a-z are also present in the 240 inventory, therefore they cannot by themselves
// prove that input is already native script. Only distinctive native glyphs count here.
const LOCAL_GLYPHS = new Set(
  GLYPH240.filter(ch=>!/^[A-Za-z]$/.test(ch))
    .concat(Object.values(GLYPH_SINGLE), GLYPH_MULTI.map(x=>x[1]))
    .join('')
);
// GLYPH240 içinde ç, ı ve ş gibi Türkçe kaynak harfleri de bağımsız yerel
// harfler olarak bulunur. Bu ortaklık, "Dış" gibi Türkçe bir sözcüğün
// çoğunluğu yerel glifmiş gibi algılanıp çevrilmeden bırakılmasına yol açamaz.
// Kaynak sözcük yalnız Türkçe/Latin harflerinden oluşuyorsa daima Türkçe
// çözümleme hattına girer; yerel-script koruması ancak ayırt edici glifler
// gerçekten bulunduğunda devreye girer.
const TURKISH_SOURCE_LETTERS = new Set(Array.from('abcçdefgğhıijklmnoöprsştuüvyzqwxâîû'));
const SACRED_TOKENS = new Set(['A̤ɐ͜ɨǣ́ꞎ͡ƣ','Aꬲæŀɇꞎʏł’Qʏħʉŷɍɨř'].map(x=>x.normalize('NFC')));

const CANON_ENTRIES = [
  // 24 peoples · Lore v17 native forms. Romanization is reading/accessibility only.
  ['Hæm’Tyærn','Ħǽɱ’Ŧʏǽɍŋ',['insan','human','Hæm’Tyærn','Hæm’Væryn','ħǽɱ’Ʋǽɍʏŋ']],
  ['Dal’Rhim','Ḓɐꞎ’Ɍɨɱ',['Dal’Rhim','ḓɐꞎ’ʁɨɱ']],
  ['Ory’Kaen','Ɵɍʏ’Ƙǽŋ',['Ory’Kaen','ɵɍʏ’ƙǽŋ']],
  ['Rhyirun’Kharûn','Ɍʏɨɍʉŋ’Χɐɍűŋ',['Rhyirun’Kharûn','ʁʏɨɍʉŋ’χɐɍűŋ']],
  ['Thalass’Møryŋ','Þɐꞎɐśś’Ɱǿɍʏɴ',['Thalass’Møryŋ','þɐꞎɐśś’ɱǿɍʏɴ']],
  ['Mæřethi’Solayn','Ɱǽṙɇþɨ’Śɵꞎɐʏŋ',['Mæřethi’Solayn','ɱǽṙɇþɨ’śɵꞎɐʏŋ']],
  ['Thir’Nocht','Þɨɍ’Ŋɵčŧ',['Thir’Nocht','þɨɍ’ŋɵčŧ']],
  ['Draƴ’Zûrkhaer','Ḓɍɐỿ’Žűɍχǽɍ',['Draƴ’Zûrkhaer','ḓɍɐỿ’žűɍχǽɍ']],
  ['Aeth’Vaeryn','Ǽþ’Ʋǽɍʏŋ',['Aeth’Vaeryn','ǽþ’Ʋǽɍʏŋ']],
  ['Zhař’Kharzûn','Ƶɐṙ’Χɐɍžűŋ',['Zhař’Kharzûn','ʐɐṙ’χɐɍžűŋ']],
  ['Au’Ben','Ɐʉ’Ƀɇŋ',['Au’Ben','ɐʉ’ƀɇŋ']],
  ['Zil’Krat','Žɨꞎ’Ƙɍɐŧ',['Zil’Krat','žɨꞎ’ƙɍɐŧ']],
  ['Khaur’Gath','Χɐʉɍ’Ǥɐþ',['Khaur’Gath','χɐʉɍ’ǥɐþ']],
  ['Muo’nthir','Ɱʉɵ’Ŋþɨɍ',['Muo’nthir','ɱʉɵ’ŋþɨɍ']],
  ['Iskæł’Væryth','Ɨśƙǽɬ’Ʋǽɍʏþ',['Iskæł’Væryth','ɨśƙǽɬ’Ʋǽɍʏþ']],
  ['Kalyti’yhrae','Ƙɐꞎʏŧɨ’Ƴħɍǽ',['Kalyti’yhrae','ƙɐꞎʏŧɨ’ʏħɍǽ']],
  ['Thae’Ryn','Þǽ’Ɍʏŋ',['Thae’Ryn','þǽ’ɍʏŋ']],
  ['Neræth’Vaelûna','Ŋɇɍǽþ’Ʋǽꞎűŋɐ',['Neræth’Vaelûna','ŋɇɍǽþ’Ʋǽꞎűŋɐ']],
  ['Gorûm’Mækhryth','Ǥɵɍűɱ’Ɱǽχɍʏþ',['Gorûm’Mækhryth','ǥɵɍűɱ’ɱǽχɍʏþ']],
  ['Vekthar’Nûmyr','Ʋɇƙþɐɍ’Ŋűɱʏɍ',['Vekthar’Nûmyr','Ʋɇƙþɐɍ’ŋűɱʏɍ']],
  ['Thyra’Vekûryn','Þʏɍɐ’Ʋɇƙűɍʏŋ',['Thyra’Vekûryn','þʏɍɐ’Ʋɇƙűɍʏŋ']],
  ['Syl’Nethrøth','Śʏꞎ’Ŋɇþɍǿþ',['Syl’Nethrøth','śʏꞎ’ŋɇþɍǿþ']],
  ['Asteryn’Veyrkha','Ɐśŧɇɍʏŋ’Ʋɇʏɍχɐ',['Asteryn’Veyrkha','ɐśŧɇɍʏŋ’Ʋɇʏɍχɐ']],
  ['Vhařgæth’Rûn','Ʋħɐṙǥǽþ’Ɍűŋ',['Vhařgæth’Rûn','Ʋħɐṙǥǽþ’ɍűŋ']],

  // v17 canonical characters and legacy aliases
  ['Eğvrıifin','Ȧꬲṙɏƒẘ’Łǽîɳ',['AF','Aꬲryfw’łæîn','Aꬲryfw’Læîn','Eğvrıifin']],
  ['Maelverın','Ɱǽɬ’Ʋǽṙɏɳ',['MV','Mæel’Væřyŋ','Maelverın']],
  ['Şofreng','Šǿḟṙǽŋ',['Šoḟraŋ','Şofreng']],
  ['İælad-Thryx Qha-ervûn','Īǽɬȧḓ’Þṙɏχ ⟡ Qħȧ’ėṙƲűɳ',['İælad’Thryx ⟡ Qha’ervûn','İælad’Thryx','İælad']],
  ['Sæl-Nyra Kor-Thyn','Śǽɬ’Ňɏṙȧ ⟡ Ƙǿṙ’Þɏɳ',['Sael’Nyra ⟡ Kor’Thyn','Sael’Nyra','Sael']],
  ['Valk Þurn','Ʋȧɬƙ ⟡ Þʉṙɳ',['Valk ⟡ Thurn','Valk Thurn','Valk']],
  ['Iyæmi Næider','Īɏǽṃĭ ⟡ Ňǽɪḓėṙ',['İami ⟡ Naider','İami']],
  ['Mŷsa Næider','Ɱŷşȧ ⟡ Ňǽɪḓėṙ',['Mysa ⟡ Naider','Mysa']],
  ['Vha-Kiëlin Dor-Nly','Ʋħȧ’Ƙĭėɬĭɳ ⟡ Ḓǿṙ’Ňɬɏ',["Va’Kielin ⟡ Dor’nLy","Va’Kielin"]],
  ['Sennægh Dor-Nly','Śėɳɳǽɣ ⟡ Ḓǿṙ’Ňɬɏ',["Sennag ⟡ Dor’nLy",'Sennag']],
  ['Tghoryæs Milæy','Ŧɣǿṙɏǽş ⟡ Ɱĭɬǽɏ',['Tghoryas ⟡ Milley','Tghoryas']],
  ['Zhæray Milæy','Žǽṙȧɏ ⟡ Ɱĭɬǽɏ',['Zaerai ⟡ Milley','Zaerai']],
  ['Cyr-Næl AuVra','Ƈɏṙ’Ňǽɬ ⟡ AʉƲṙȧ',["Cyr’Nael ⟡ Auvra","Cyr’Nael"]],
  ['Mireþz AuVra','Ɱĭṙėþž ⟡ AʉƲṙȧ',['Mirethz ⟡ Auvra','Mirethz']],
  ['Harnyël Ulkh','Ħȧṙɳɏëɬ ⟡ Ūɬχ',['Harniel ⟡ Ulkh','Harniel']],
  ['Sæřre Ulkh','Śǽṙṙė ⟡ Ūɬχ',['Saerre ⟡ Ulkh','Saerre']],
  ['Khor-Þal Seliþ','Ƙħǿṙ’Þȧɬ ⟡ Śėɬĭþ',["Kor’Thal ⟡ Selith","Kor’Thal"]],
  ['Lunæx Seliþ','Ƚʉɳǽχ ⟡ Śėɬĭþ',['Lunéax ⟡ Selith','Lunéax']],
  ['Turoq Værn','Ŧʉṙǿʠ ⟡ Ʋǽṙɳ',['Turoqk ⟡ Vaern','Turoqk']],
  ['Elossya Værn','Ėɬǿşşɏȧ ⟡ Ʋǽṙɳ',['Elossia ⟡ Vaern','Elossia']],
  ['Dhrehn Mor-Þalen','Ḓħṙėɳ ⟡ Ɱǿṙ’Þȧɬėɳ',["Drehn ⟡ Mor’Thalen",'Drehn']],
  ['Kheyl Mor-Þalen','Ƙħėɏɬ ⟡ Ɱǿṙ’Þȧɬėɳ',["Kheyl ⟡ Mor’Thalen",'Kheyl']],
  ['Rhæma Kor-Dhn-Eš','Ɍħǽṃȧ ⟡ Ƙǿṙ’Ðɳ’Ėš',["Rhema ⟡ Kor’dhn’esh",'Rhema']],
  ['Mæ-Gyen Foin-Sþea','Ɱǽ’Ǥɏėɳ ⟡ Ƒǿĭɳ’Śþėȧ',["Ma’Gien ⟡ Foin’Sthea","Ma’Gien"]],
  ['Raskæra Þurn','Řȧşƙǽṙȧ ⟡ Þʉṙɳ',['Raskæra ⟡ Thurn','Raskæra']],

  // system terms established by lore
  ['Aeth’Au','ǽþ’ɐʉ',['nature sense','doğa sezgisi','doga sezgisi','Aeth’Au']],
  ['Ael’Rûn','ǽꞎ’ɍűŋ',['true immortality','içsel gerçek ölümsüzlük','gerçek ölümsüzlük','Ael’Rûn']],
  ['Mægen’Kaen','ɱǽǥɇŋ’ƙǽŋ',['mageen ascendance','Mægen’Kaen']],
  ['Ael’Kalyth','ǽꞎ’ƙɐꞎʏþ',['arcana','Ael’Kalyth']],
  ['Vhae’Rûn','Ʋħǽ’ɍűŋ',['void','Vhae’Rûn']],
  ['Rhim’Lûn','ʁɨɱ’ꞎűŋ',['kraliçe uykusu','kralice uykusu','Rhim’Lûn']],
  ['Nær’Rûn','ŋǽɍ’ɍűŋ',['normal durum','normal state','Nær’Rûn']],
  ['Aster’Rûn','ɐśŧɇɍ’ɍűŋ',['kozmik durum','cosmic state','Aster’Rûn']],
  ['Aster’Syr','ɐśŧɇɍ’śʏɍ',['yıldız örgüsü','yildiz orgusu','star weave','Aster’Syr']],
  ['Myr’Qor','ɱʏɍ’ʠɵɍ',['mavi çekirdek','blue core','Myr’Qor']],
  ['Qor’Seryn','ʠɵɍ’śɇɍʏŋ',['kardan halkaları','kardan halkalari','Qor’Seryn']],

  // names / ships / relations
  ['Sæl’Qharyn','śǽꞎ’ʠħɐɍʏŋ',['SÆL’QHARYN','Sæl’Qharyn']],
  ['Rhæth-Thûer','ʁǽþ-þűɇɍ',['RHÆŦH-THÛER','Rhæth-Thûer']],
  ['Aeth’Møř','Ǽþ’Ɱǿṙ',['Aꬲŧħ’Møř','Aeth’Møř','ǽþ’ɱǿṙ']],
  ['Vael’Tharyn','Ʋǽꞎ’þɐɍʏŋ',['Vael’Tharyn']],
  ['Feł','ƒɇɬ',['Feł']],
  ['Feł’aryŋ','ƒɇɬ’ɐɍʏɴ',['Feł’aryŋ']],

  // calendar
  ['Færa’Th','ƒǽɍɐ’þ',['Færa’Th']],
  ['Zháraq’Velyn','ʐɐɍɐʠ’Ʋɇꞎʏŋ',['Zháraq’Velyn']],
  ['Thyrlûn’Qaem','þʏɍꞎűŋ’ʠǽɱ',['Thyrlûn’Qaem']],
  ['Qhaervûn’Zæl','ʠħǽɍƲűŋ’žǽꞎ',['Qhaervûn’Zæl']],
  ['Velkhar’Ythû','Ʋɇꞎχɐɍ’ʏþű',['Velkhar’Ythû']],
  ['Ałthryn’Vaer','ɐɬþɍʏŋ’Ʋǽɍ',['Ałthryn’Vaer']],
  ['Sevræl’Qhôr','śɇƲɍǽꞎ’ʠħǿɍ',['Sevræl’Qhôr']],
  ['Vraëlun','Ʋɍɐǽꞎʉŋ',['Vraëlun']]
];

// v2.1: there is NO productive Aeth/Naer-style semantic root fallback.
// Only whole terms explicitly present in CANON_ENTRIES remain canonical exceptions.
// Every other Turkish lexical root receives its own independent mathematical word.

// Small grammatical vocabulary. Values are semantic engine IDs, not Alekrythae words.
// Their actual native forms are deterministic direct-glyph morphemes generated below.
const FUNCTION_WORDS = {
  've':'and','ile':'with','sırasında':'during','sirasinda':'during','boyunca':'throughout','arasında':'between','arasinda':'between','ama':'but','fakat':'but','ancak':'but','çünkü':'because','cunku':'because',
  'bu':'this','şu':'that-near','su':'that-near','o':'that','bir':'one','çok':'many','cok':'many','az':'few',
  'için':'for','icin':'for','gibi':'like','sonra':'after','önce':'before','once':'before','şimdi':'now','simdi':'now',
  'evet':'yes','hayır':'no','hayir':'no','değil':'not','degil':'not','yok':'none','var':'exists',
  'ben':'i','sen':'you-sg','biz':'we','siz':'you-pl','kim':'who','ne':'what','nerede':'where','neden':'why','nasıl':'how','nasil':'how'
};

// Deterministic Turkish suffix -> Alek morpheme. Longest match first.
const SUFFIX_RULES = [
  // verb compounds / tenses
  {re:/(abilecek|abilecek)$/i, tag:'yeterlilik-gelecek'},
  {re:/(mayacak|meyecek)$/i, tag:'olumsuz-gelecek'},
  {re:/(acak|ecek)$/i, tag:'gelecek'},
  {re:/([ıiuü]?yor)$/i, tag:'şimdiki-zaman'},
  {re:/(mış|miş|muş|müş)$/i, tag:'öğrenilen-geçmiş'},
  {re:/(dı|di|du|dü|tı|ti|tu|tü)$/i, tag:'geçmiş'},
  {re:/(malı|meli)$/i, tag:'gereklilik'},
  {re:/(sa|se)$/i, tag:'koşul'},
  {re:/(mak|mek)$/i, tag:'mastar'},
  {re:/(ar|er|ır|ir|ur|ür)$/i, tag:'geniş-zaman', conservative:true},
  // derivational negation before tense where visible
  {re:/(ma|me)$/i, tag:'olumsuzluk'},
  // cases and nominal morphology
  {re:/(larıyla|leriyle)$/i, tag:'çoğul-birliktelik'},
  {re:/(lardan|lerden)$/i, tag:'çoğul-ayrılma'},
  {re:/(larda|lerde)$/i, tag:'çoğul-bulunma'},
  {re:/(lara|lere)$/i, tag:'çoğul-yönelme'},
  {re:/(ların|lerin)$/i, tag:'çoğul-ilgi'},
  {re:/(ları|leri)$/i, tag:'çoğul-belirtme/iyelik'},
  {re:/(lar|ler)$/i, tag:'çoğul'},
  {re:/(dan|den|tan|ten)$/i, tag:'ayrılma'},
  {re:/(da|de|ta|te)$/i, tag:'bulunma'},
  {re:/(yla|yle|la|le)$/i, tag:'birliktelik/araç'},
  {re:/(ya|ye)$/i, tag:'yönelme'},
  {re:/(ın|in|un|ün)$/i, tag:'ilgi'},
  {re:/(ımız|imiz|umuz|ümüz)$/i, tag:'1çoğul-iyelik'},
  {re:/(ınız|iniz|unuz|ünüz)$/i, tag:'2çoğul-iyelik'},
  {re:/(ım|im|um|üm)$/i, tag:'1tekil-iyelik'},
  {re:/(sın|sin|sun|sün)$/i, tag:'2tekil'},
  {re:/(si|sı|su|sü)$/i, tag:'3tekil-iyelik'},
  // accusative and dative single vowels are deliberately last/conservative
  {re:/([ıiuü])$/i, tag:'belirtme', conservative:true},
  {re:/([ae])$/i, tag:'yönelme', conservative:true}
];

// v2.1: no syllable families, no phonetic slots, no reusable pseudo-roots.
// Each generated native word is a sequence of independently selected letters from all 240 glyphs.

// ============================================================
// STATE / PERSISTENCE
// ============================================================
const state = {
  custom: {},                // source -> {roman,glyph,note,locked}
  settings: {
    mode:'auto', unknown:'synthesize', preserveMarkdown:true,
    canonLock:true, properPolicy:'phonetic', autoTranslate:false, strictMorph:true,
    protectFrontMatter:true, protectLinks:true
  },
  lastResult: null,
  lexemeCache: new Map(),
  generatedUsage: new Map(),
  sessionWarnings: []
};
function legacyV21NormalizeCustomEntry(v){
  if(typeof v === 'string') return {roman:v,glyph:romanToGlyph(v),note:'v2 uyum kaydı'};
  if(v && typeof v === 'object'){
    const roman=String(v.roman||'').trim();
    const glyph=String(v.glyph||'').trim() || romanToGlyph(roman);
    return {roman,glyph,note:String(v.note||''),locked:!!v.locked};
  }
  return {roman:'',glyph:'',note:''};
}
function loadState(){
  try {
    const x = window.__alekStorage;
    if (x && typeof x === 'object') {
      if (x.custom && typeof x.custom === 'object') {
        state.custom={}; for(const [k,v] of Object.entries(x.custom)) state.custom[k]=normalizeCustomEntry(v);
      }
      if (x.settings && typeof x.settings === 'object') Object.assign(state.settings, x.settings);
    }
  } catch(e) {}
}
function persist(){
  try { if (window.__alekSave) window.__alekSave(JSON.stringify({schema:6,custom:state.custom,settings:state.settings})); } catch(e) {}
  try { __v6RefCache={fp:null,profile:null}; } catch(e) {}
}


// ============================================================
// NORMALIZATION / HASH / SYNTHESIS
// ============================================================
function normTR(s){
  return String(s ?? '')
    .normalize('NFC')
    .replace(/[’‘`´]/g,"'")
    .toLocaleLowerCase('tr-TR')
    .trim();
}
function plainTR(s){
  return normTR(s)
    .replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u')
    .replace(/â/g,'a').replace(/î/g,'i').replace(/û/g,'u');
}
// Arama/okunuş karşılaştırması aksanları katlayabilir; sözlük kimliği katlayamaz.
// ASCII dışı kaynak harfi kod noktasıyla kaçırıldığı için ş ile s aynı kök değildir.
function identityTR(s){
  return Array.from(normTR(s)).map(ch=>/[a-z0-9:_-]/.test(ch)?ch:`u${ch.codePointAt(0).toString(16)}u`).join('');
}
function fnv1a64(str){
  let h = 0xcbf29ce484222325n;
  const p = 0x100000001b3n;
  const bytes = new TextEncoder().encode(str);
  for (const b of bytes) { h ^= BigInt(b); h = BigInt.asUintN(64, h * p); }
  return h;
}
function mix64(z){
  // SplitMix64 avalanche finalizer. Important because low FNV bits are weak for modulo-240 selection.
  z = BigInt.asUintN(64, z + 0x9e3779b97f4a7c15n);
  z = BigInt.asUintN(64, (z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n);
  z = BigInt.asUintN(64, (z ^ (z >> 27n)) * 0x94d049bb133111ebn);
  return BigInt.asUintN(64, z ^ (z >> 31n));
}
function capRoman(s){
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function upperNativeChar(ch){
  if(!ch) return ch;
  const up=ch.toLocaleUpperCase('tr-TR');
  return up || ch;
}
function capitalizeNativeWord(s){
  const arr=Array.from(String(s||''));
  for(let i=0;i<arr.length;i++){
    if(/\p{L}/u.test(arr[i])){ arr[i]=upperNativeChar(arr[i]); break; }
  }
  return arr.join('');
}
function fnvHex(str){ return fnv1a64(String(str)).toString(16).padStart(16,'0'); }
function legacyV21ShannonMetrics(text){
  const freq=new Map(); let n=0, adjacent=0, prev=null;
  for(const ch of String(text||'')){
    if(!GLYPH240_SET.has(ch) && !GLYPH240_SET.has(ch.toLocaleLowerCase('tr-TR'))) continue;
    const key=GLYPH240_SET.has(ch)?ch:ch.toLocaleLowerCase('tr-TR');
    freq.set(key,(freq.get(key)||0)+1); n++;
    if(prev===key) adjacent++; prev=key;
  }
  let H=0,max=0;
  if(n){ for(const c of freq.values()){const p=c/n;H-=p*Math.log2(p);if(c>max)max=c;} }
  return {count:n,distinct:freq.size,entropy:H,entropyNorm:n?H/Math.log2(240):0,dominant:n?max/n:0,adjacentRepeat:n>1?adjacent/(n-1):0};
}
function lexicalTokenCount(analysis){ return analysis.filter(x=>x && x.type && !['punct','local'].includes(x.type)).length; }
function glyphReading(indices){
  return indices.map(i=>GLYPH240_READING[i]).join('');
}
function synthIndependent(source, minLetters=3, maxLetters=9){
  const key = identityTR(source);
  if (!key) return {roman:String(source ?? ''), glyph:String(source ?? ''), indices:[]};
  const cacheKey=`${minLetters}:${maxLetters}:${key}`;
  if (state.lexemeCache.has(cacheKey)) return state.lexemeCache.get(cacheKey);

  const h0 = mix64(fnv1a64(SYNTHESIS_SEED + '|' + key));
  const span = Math.max(1, maxLetters-minLetters+1);
  const count = minLetters + Number(mix64(h0 ^ BigInt(key.length)) % BigInt(span));
  const indices=[];
  for(let pos=0; pos<count; pos++){
    // Independent letters: no onset/coda bank, no vowel/consonant template, no family restriction.
    const h = mix64(h0 ^ mix64(BigInt(pos+1) * 0xd6e8feb86659fd93n) ^ BigInt(key.length*131));
    indices.push(Number(h % 240n));
  }
  const result={roman:glyphReading(indices),glyph:indices.map(i=>GLYPH240[i]).join(''),indices};
  state.lexemeCache.set(cacheKey,result);
  return result;
}
function legacyV21SynthLexeme(source){ return synthIndependent('lex:'+source,3,9); }
function functionForm(id){ return synthIndependent('function:'+id,2,4); }
function grammarForm(tag){ return synthIndependent('grammar:'+tag,1,3); }

// ============================================================
// GLYPH TRANSLITERATOR
// ============================================================
function romanToGlyph(text){
  const src = String(text ?? '').normalize('NFC');
  let out='';
  for(let i=0;i<src.length;){
    const ch = src[i];
    if (LOCAL_GLYPHS.has(ch)) { out += ch; i++; continue; }
    if (ch === '’' || ch === "'") { out += '’'; i++; continue; }
    const rem = src.slice(i).toLowerCase();
    let hit=false;
    for (const [seq,g] of GLYPH_MULTI){
      if (rem.startsWith(seq)){ out += g; i += seq.length; hit=true; break; }
    }
    if(hit) continue;
    const low = ch.toLocaleLowerCase('tr-TR');
    if (GLYPH_SINGLE[low]) out += GLYPH_SINGLE[low];
    else out += ch;
    i++;
  }
  return out;
}

// ============================================================
// CANON LOOKUPS
// ============================================================
const aliasMap = new Map();
const romanKnown = new Map();
for(const [roman,glyph,aliases] of CANON_ENTRIES){
  romanKnown.set(normTR(roman), {roman,glyph});
  romanKnown.set(normTR(glyph), {roman,glyph});
  for(const a of aliases) aliasMap.set(normTR(a), {roman,glyph});
  aliasMap.set(normTR(roman), {roman,glyph});
}
function customEntries(){
  return Object.entries(state.custom).map(([source,v])=>{const e=normalizeCustomEntry(v);return {source,roman:e.roman,glyph:e.glyph,note:e.note};});
}
function findExactPhrase(s){
  const k = normTR(s);
  if(state.settings.canonLock){ const c=aliasMap.get(k)||romanKnown.get(k); if(c) return c; }
  if (state.custom[k]) {const e=normalizeCustomEntry(state.custom[k]);return {roman:e.roman,glyph:e.glyph,custom:true};}
  return aliasMap.get(k) || romanKnown.get(k) || null;
}

function knownRomanToken(token){
  const k = normTR(token);
  return romanKnown.get(k) || aliasMap.get(k) || null;
}

function legacyV21LooksRomanized(token){
  if (knownRomanToken(token)) return true;
  return /[æřƴûøłŋǽṙỿűǿɬɴ]/i.test(token) || /(?:th|kh|rh|zh|qh|ae|yhr|khry)/i.test(token) || /['’]/.test(token);
}
function isMostlyLocalGlyph(token){
  const sourceLetters=Array.from(String(token??'').normalize('NFC')).filter(ch=>/\p{L}/u.test(ch));
  if(sourceLetters.length&&sourceLetters.every(ch=>TURKISH_SOURCE_LETTERS.has(ch.toLocaleLowerCase('tr-TR'))))return false;
  let letters=0, local=0;
  for(const ch of sourceLetters){letters++;const low=ch.toLocaleLowerCase('tr-TR');if(LOCAL_GLYPHS.has(ch)||LOCAL_GLYPHS.has(low))local++;}
  return letters>0 && local/letters > 0.6;
}

// ============================================================
// TURKISH MORPHOLOGY
// ============================================================
function stripSuffixes(word){
  let stem = normTR(word);
  const suffixes=[];
  // do at most 4 suffix layers, conservative to avoid shredding short words
  for(let pass=0;pass<4;pass++){
    let matched=false;
    for(const rule of SUFFIX_RULES){
      const m = stem.match(rule.re);
      if(!m) continue;
      const candidate = stem.slice(0, stem.length - m[0].length);
      if(candidate.length < 3) continue;
      if(rule.conservative && candidate.length < 4) continue;
      // Do not strip from a word that is itself a known canon/root/function word.
      if(FUNCTION_WORDS[stem] || aliasMap.has(stem)) continue;
      stem = candidate;
      suffixes.unshift({tag:rule.tag,src:m[0]});
      matched=true;
      break;
    }
    if(!matched) break;
  }
  return {stem,suffixes};
}

function legacyV21TranslateTurkishWord(word, stats){
  const raw = word;
  const n = normTR(word);
  if(!n) return {roman:raw,glyph:raw,type:'punct'};
  if(SACRED_TOKENS.has(String(raw).normalize('NFC')) || /[ꬲƣ]/u.test(raw)) { stats.local++; return {roman:raw,glyph:raw,type:'sacred',source:raw}; }

  const exact = findExactPhrase(n);
  if(exact){ stats.canon++; return {roman:exact.roman,glyph:exact.glyph,type: exact.custom?'custom':'canon',source:raw}; }

  if(isMostlyLocalGlyph(raw)){ stats.local++; return {roman:raw,glyph:raw,type:'local',source:raw}; }

  if(looksRomanized(raw)){
    const kr = knownRomanToken(raw);
    stats.roman++;
    return {roman:kr?kr.roman:raw, glyph:kr?kr.glyph:romanToGlyph(raw), type:'roman',source:raw};
  }

  if(FUNCTION_WORDS[n]){
    const f=functionForm(FUNCTION_WORDS[n]); stats.grammar++;
    return {roman:f.roman,glyph:f.glyph,type:'grammar',source:raw};
  }

  const {stem,suffixes} = stripSuffixes(n);
  let baseRoman=''; let baseGlyph=null; let type='generated';
  if(state.custom[stem]) { const ce=normalizeCustomEntry(state.custom[stem]); baseRoman=ce.roman; baseGlyph=ce.glyph; type='custom'; stats.custom++; }
  else if(FUNCTION_WORDS[stem]) {
    const f=functionForm(FUNCTION_WORDS[stem]); baseRoman=f.roman; baseGlyph=f.glyph; type='grammar'; stats.grammar++;
  }
  else {
    if(state.settings.unknown === 'mark') {
      baseRoman='⟦'+stem+'⟧'; baseGlyph=baseRoman; type='unknown'; stats.unknown++;
    } else if(state.settings.unknown === 'phonetic') {
      baseRoman=stem.replace(/ç/g,'ch').replace(/ş/g,'sh').replace(/ğ/g,'gh').replace(/ı/g,'i').replace(/ö/g,'ø').replace(/ü/g,'û');
      baseRoman=capRoman(baseRoman); baseGlyph=romanToGlyph(baseRoman); type='loan'; stats.loan++;
    } else {
      const syn=synthLexeme(stem);
      baseRoman=syn.roman; baseGlyph=syn.glyph; type='generated'; stats.generated++;
      const gu=state.generatedUsage.get(stem)||{source:stem,roman:syn.roman,glyph:syn.glyph,count:0}; gu.count++; state.generatedUsage.set(stem,gu);
    }
  }
  const suffixForms=suffixes.map(x=>grammarForm(x.tag));
  stats.suffix += suffixes.length;
  const roman = baseRoman + suffixForms.map(x=>'’'+x.roman).join('');
  const glyph = baseGlyph + suffixForms.map(x=>'’'+x.glyph).join('');
  return {roman,glyph,type,source:raw,stem,suffixes};
}

// ============================================================
// PHRASE PROTECTION AND TEXT TRANSLATION
// ============================================================
function collectPhraseAliases(){
  const arr=[];
  for(const [k,v] of aliasMap.entries()) if(k.includes(' ')) arr.push([k,v]);
  for(const [k,v] of Object.entries(state.custom)) if(k.includes(' ')){const e=normalizeCustomEntry(v);arr.push([normTR(k),{roman:e.roman,glyph:e.glyph,custom:true}]);}
  arr.sort((a,b)=>b[0].length-a[0].length);
  return arr;
}

function protectMarkdown(text){
  const slots=[]; let s=String(text ?? '');
  const put=m=>{const id=`\uE000${slots.length}\uE001`;slots.push(m);return id;};
  // Sacred/canonical compound strings must never be shredded by tokenization.
  for(const sacred of SACRED_TOKENS) s=s.split(sacred).join(put(sacred));
  if(!state.settings.preserveMarkdown) return {text:s, slots};

  // YAML front matter, fenced/inline code, HTML, URLs, wiki link targets, Markdown destinations, file-like paths.
  if(state.settings.protectFrontMatter) s=s.replace(/^---\s*\n[\s\S]*?\n---\s*(?=\n|$)/m,put);
  const patterns=[
    /```[\s\S]*?```/g, /~~~[\s\S]*?~~~/g, /`[^`\n]*`/g,
    /https?:\/\/[^\s)\]}]+/g, /<[^>]+>/g,
    /\]\((?:[^()\\]|\\.)+\)/g,
    /\[\[[^\]|]+(?=\||\]\])/g,
    /(?:[A-Za-z]:\\|\.\.\/|\.\/)[^\s<>:"|?*]+/g
  ];
  for(const re of patterns) s=s.replace(re,put);
  return {text:s,slots};
}
function restoreMarkdown(text,slots){
  return text.replace(/\uE000(\d+)\uE001/g,(_,i)=>slots[Number(i)] ?? '');
}

function legacyV21TranslateText(input, mode='auto'){
  const stats={canon:0,custom:0,root:0,grammar:0,generated:0,loan:0,unknown:0,roman:0,local:0,suffix:0,phrases:0};
  const analysis=[];
  const protectedData=protectMarkdown(String(input ?? ''));
  let text=protectedData.text;
  const phraseSlots=[];

  // Known multi-word phrases first, case-insensitive and Unicode-normalized through a scanning replacement.
  // To remain deterministic, longer phrases win.
  const phrases=collectPhraseAliases();
  if(mode !== 'roman'){
    for(const [phrase,val] of phrases){
      // Build a tolerant regex over exact phrase characters and whitespace.
      const esc=phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+');
      const re=new RegExp(`(?<![\\p{L}\\p{N}])${esc}(?![\\p{L}\\p{N}])`,'giu');
      text=text.replace(re,()=>{ const id=`\uE100${phraseSlots.length}\uE101`; phraseSlots.push(val); stats.phrases++; stats.canon++; return id; });
    }
  }

  // Tokenize into words or separators. Private-use placeholders stay intact.
  const tokens=text.match(/\uE100\d+\uE101|\uE000\d+\uE001|[\p{L}\p{M}0-9_'’\-]+|[^\p{L}\p{M}0-9_'’\-\uE000\uE001\uE100\uE101]+|[\uE000\uE001\uE100\uE101]/gu) || [];
  const romanParts=[], glyphParts=[];

  for(const tok of tokens){
    let m=tok.match(/^\uE100(\d+)\uE101$/);
    if(m){ const v=phraseSlots[Number(m[1])]; romanParts.push(v.roman);glyphParts.push(v.glyph);analysis.push({source:'[deyim]',roman:v.roman,type:'canon-phrase'});continue; }
    if(/^\uE000\d+\uE001$/.test(tok)){ romanParts.push(tok);glyphParts.push(tok);continue; }
    if(!/[\p{L}\p{N}]/u.test(tok)){ romanParts.push(tok);glyphParts.push(tok);continue; }

    let res;
    if(mode==='roman'){
      if(isMostlyLocalGlyph(tok)) res={roman:tok,glyph:tok,type:'local',source:tok};
      else {const kr=knownRomanToken(tok);res={roman:kr?kr.roman:tok,glyph:kr?kr.glyph:romanToGlyph(tok),type:'roman',source:tok};stats.roman++;}
    } else if(mode==='turkish') {
      res=translateTurkishWord(tok,stats);
    } else {
      if(isMostlyLocalGlyph(tok)) {res={roman:tok,glyph:tok,type:'local',source:tok};stats.local++;}
      else if(knownRomanToken(tok) || looksRomanized(tok)) {const kr=knownRomanToken(tok);res={roman:kr?kr.roman:tok,glyph:kr?kr.glyph:romanToGlyph(tok),type:'roman',source:tok};stats.roman++;}
      else res=translateTurkishWord(tok,stats);
    }
    romanParts.push(res.roman); glyphParts.push(res.glyph); analysis.push(res);
  }

  const roman=restoreMarkdown(romanParts.join(''),protectedData.slots);
  const glyph=restoreMarkdown(glyphParts.join(''),protectedData.slots);
  const used240 = new Set();
  for(const ch of glyph){ const lo=ch.toLocaleLowerCase('tr-TR'); if(GLYPH240_SET.has(ch)) used240.add(ch); else if(GLYPH240_SET.has(lo)) used240.add(lo); }
  stats.glyph240Distinct = used240.size;
  const gm=shannonMetrics(glyph); const lex=lexicalTokenCount(analysis)||1;
  stats.entropyNorm=gm.entropyNorm; stats.dominantGlyph=gm.dominant; stats.adjacentRepeat=gm.adjacentRepeat;
  stats.lexicalTokens=lex; stats.canonCoverage=(stats.canon+stats.custom)/lex; stats.generatedShare=stats.generated/lex;
  stats.fingerprint=fnvHex(glyph+'|'+roman+'|'+APP_VERSION+'|'+LANGUAGE_CORE_VERSION);
  const warnings=[];
  if(stats.unknown) warnings.push(`${stats.unknown} çözümlenmeyen/işaretli kök var.`);
  if(stats.generatedShare>0.70) warnings.push('Metnin büyük kısmı matematiksel yeni sözlükten geliyor; kanonik sözlüğe alınacak adaylar olabilir.');
  if(stats.adjacentRepeat>0.12) warnings.push('Yerel çıktıda ardışık aynı glif oranı yüksek. Bu hata değildir; bağımsız harf kuralının doğal sonucu olabilir.');
  return {roman,glyph,stats,analysis,warnings};
}

// ============================================================
// SINGULARITY v4 COMPATIBILITY CORE
// Deterministic Turkish morphology -> semantic IR -> word-family morphology
// No AI, no Aeth/Naer productive syllable banks, no reverse translation.
// ============================================================
const ROOT_HINTS = new Set([
  'ev','gemi','şehir','sehir','kale','kitap','ağaç','agac','güç','guc','ses','ışık','isik','su','yol','kanat','renk','çocuk','cocuk','beden','bitki','doğa','doga','metal','taş','tas','toprak','hava','ateş','ates','buz','soğuk','soguk','sıcak','sicak','yaşam','yasam','ölüm','olum','hız','hiz','hareket','akıntı','akinti','koku','ritim','enerji','zaman','yıldız','yildiz','gezegen','evren','kraliçe','kralice','halk','ırk','irk','adam','kadın','kadin','insan'
].map(normTR));
const LEMMA_SOFTEN_EXCEPTIONS = new Set(['ad','od','sac','hac','yad','kod'].map(normTR));
const MORPH_TAGS = {
  // derivation
  privative:{kind:'derivation',pos:'adj',role:'without'}, possessiveAdj:{kind:'derivation',pos:'adj',role:'with'},
  nominalizer:{kind:'derivation',pos:'noun',role:'concept'}, become:{kind:'derivation',pos:'verb',role:'become'},
  causativeBecome:{kind:'derivation',pos:'verb',role:'cause-become'}, causative:{kind:'derivation',pos:'verb',role:'cause'},
  passive:{kind:'derivation',pos:'verb',role:'passive'}, reciprocal:{kind:'derivation',pos:'verb',role:'reciprocal'},
  // verb inflection
  ability:{kind:'inflection',pos:'verb'}, neg:{kind:'inflection',pos:'verb'}, future:{kind:'inflection',pos:'verb'},
  progressive:{kind:'inflection',pos:'verb'}, evidentialPast:{kind:'inflection',pos:'verb'}, past:{kind:'inflection',pos:'verb'},
  necessity:{kind:'inflection',pos:'verb'}, conditional:{kind:'inflection',pos:'verb'}, infinitive:{kind:'inflection',pos:'verb'},
  aorist:{kind:'inflection',pos:'verb'},
  // person
  p1sg:{kind:'person'},p2sg:{kind:'person'},p1pl:{kind:'person'},p2pl:{kind:'person'},p3pl:{kind:'person'},
  // noun
  plural:{kind:'number'}, poss1sg:{kind:'poss'},poss2sg:{kind:'poss'},poss3sg:{kind:'poss'},poss1pl:{kind:'poss'},poss2pl:{kind:'poss'},
  accusative:{kind:'case',role:'object'}, dative:{kind:'case',role:'goal'}, locative:{kind:'case',role:'location'},
  ablative:{kind:'case',role:'source'}, genitive:{kind:'case',role:'possessor'}, instrumental:{kind:'case',role:'instrument'}
};
const MORPH_SURFACES = [
  // longest/specific first; surface strings are lowercase NFC
  ['causativeBecome',['laştır','leştir'],5,1.00],
  ['ability',['yabil','yebil','abil','ebil'],4,0.98],
  ['future',['acak','ecek'],3,0.98], ['progressive',['ıyor','iyor','uyor','üyor','yor'],3,0.98],
  ['evidentialPast',['mış','miş','muş','müş'],3,0.98], ['necessity',['malı','meli'],3,0.98],
  ['poss1pl',['ımız','imiz','umuz','ümüz'],3,0.96], ['poss2pl',['ınız','iniz','unuz','ünüz'],3,0.96],
  ['ablative',['dan','den','tan','ten'],3,0.98], ['instrumental',['yla','yle'],3,0.98],
  ['causative',['dır','dir','dur','dür','tır','tir','tur','tür'],3,0.84],
  ['privative',['sız','siz','suz','süz'],3,0.99], ['possessiveAdj',['lı','li','lu','lü'],2,0.90],
  ['nominalizer',['lık','lik','luk','lük'],3,0.98], ['become',['laş','leş','lan','len'],3,0.90],
  ['passive',['ıl','il','ul','ül'],2,0.78], ['reciprocal',['ış','iş','uş','üş'],2,0.76],
  ['neg',['ma','me'],2,0.82], ['past',['dı','di','du','dü','tı','ti','tu','tü'],2,0.97],
  ['conditional',['sa','se'],2,0.94], ['infinitive',['mak','mek'],2,1.00],
  ['plural',['lar','ler'],2,0.99], ['locative',['da','de','ta','te'],2,0.97],
  ['instrumental',['la','le'],2,0.80], ['genitive',['ın','in','un','ün','nın','nin','nun','nün'],2,0.91],
  ['poss1sg',['ım','im','um','üm','m'],2,0.82], ['poss2sg',['ın','in','un','ün','n'],2,0.72],
  ['poss3sg',['sı','si','su','sü'],2,0.93], ['p2pl',['sınız','siniz','sunuz','sünüz','nız','niz','nuz','nüz'],2,0.82],
  ['p1pl',['ız','iz','uz','üz','k'],2,0.74], ['p2sg',['sın','sin','sun','sün'],2,0.90],
  ['p1sg',['ım','im','um','üm','m'],2,0.75], ['p3pl',['lar','ler'],2,0.70],
  ['dative',['ya','ye'],2,0.98],
  // single vowels only accepted through contextual gate below
  ['accusative',['ı','i','u','ü'],1,0.56], ['dative',['a','e'],1,0.52],
  ['aorist',['ar','er','ır','ir','ur','ür','r'],2,0.58]
];
const MORPH_SORTED = MORPH_SURFACES.flatMap(([tag,forms,minStem,conf])=>forms.map(surface=>({tag,surface,minStem,conf}))).sort((a,b)=>b.surface.length-a.surface.length || b.conf-a.conf);

function graphemes(s){
  s=String(s??'').normalize('NFC');
  try { if(Intl && Intl.Segmenter){const seg=new Intl.Segmenter(undefined,{granularity:'grapheme'});return Array.from(seg.segment(s),x=>x.segment);} } catch(e){}
  return Array.from(s);
}
function shannonMetrics(text){
  const chars=graphemes(text).filter(ch=>GLYPH240_SET.has(ch)||LOCAL_GLYPHS.has(ch));
  if(!chars.length)return{entropy:0,entropyNorm:0,dominant:0,adjacentRepeat:0};
  const m=new Map();let rep=0;for(let i=0;i<chars.length;i++){m.set(chars[i],(m.get(chars[i])||0)+1);if(i&&chars[i]===chars[i-1])rep++;}
  let h=0,max=0;for(const n of m.values()){const p=n/chars.length;h-=p*Math.log2(p);if(n>max)max=n;}
  return {entropy:h,entropyNorm:h/Math.log2(Math.min(240,Math.max(2,m.size))),dominant:max/chars.length,adjacentRepeat:rep/Math.max(1,chars.length-1)};
}
function fingerprint128(str){return fnvHex('A|'+str)+fnvHex('B|'+str);}
function titleCaseNativeGlyph(g){return capitalizeNativeWord(g);}
function phoneticRomanTR(s){return String(s).normalize('NFC').replace(/ç/gi,'ch').replace(/ş/gi,'sh').replace(/ğ/gi,'gh').replace(/ı/g,'i').replace(/İ/g,'I').replace(/ö/gi,'ø').replace(/ü/gi,'û');}
function looksRomanized(token){
  if (knownRomanToken(token)) return true;
  // Apostrophe alone is NOT evidence; Turkish proper-name suffixes also use it.
  return /[æřƴûøłŋǽṙỿűǿɬɴꬲƣ]/i.test(token) || /(?:th|kh|rh|zh|qh|ae|yhr|khry)/i.test(token);
}
function isUnknownProper(raw){const n=normTR(raw),v=String(raw||'');const strong=/^[A-ZÇĞİÖŞÜ]{2,}$/u.test(v)||/[’']/u.test(v)||/^\p{Lu}[^\s]*\p{Lu}/u.test(v);return strong&&!findExactPhrase(raw)&&!ROOT_HINTS.has(n)&&!FUNCTION_WORDS[n];}
function unsoftenStem(stem, hadVowelInitialSuffix){
  if(!hadVowelInitialSuffix || stem.length<4 || LEMMA_SOFTEN_EXCEPTIONS.has(stem)) return stem;
  const map={b:'p',c:'ç',d:'t',ğ:'k'}; const last=stem.at(-1); return map[last]?stem.slice(0,-1)+map[last]:stem;
}
function allowSingleVowelRule(current, candidate, properSuffix){
  if(properSuffix)return true;
  if(/(?:lar|ler)$/u.test(candidate) && candidate.length>4)return true;
  if(ROOT_HINTS.has(candidate)||state.custom[candidate]||aliasMap.has(candidate))return true;
  const map={b:'p',c:'ç',d:'t',ğ:'k'};const last=candidate.at(-1);const restored=map[last]?candidate.slice(0,-1)+map[last]:candidate;
  if(ROOT_HINTS.has(restored)||state.custom[restored]||aliasMap.has(restored))return true;
  return false;
}
function morphologyCandidates(word, properSuffix=false){
  const n=normTR(word); const out=[];
  const walk=(cur, parts, score, depth)=>{
    if(depth>7)return;
    if(parts.length) out.push({stem:cur,morphemes:[...parts].reverse(),score});
    for(const r of MORPH_SORTED){
      if(!cur.endsWith(r.surface))continue;
      const cand=cur.slice(0,-r.surface.length); if(cand.length<r.minStem)continue;
      if(r.surface.length===1 && !allowSingleVowelRule(cur,cand,properSuffix))continue;
      // Avoid shredding already canonical/function words.
      if(FUNCTION_WORDS[cur]||aliasMap.has(cur)||romanKnown.has(cur))continue;
      // Do not repeatedly peel identical low-confidence ambiguous endings.
      if(parts.length && parts.at(-1).tag===r.tag && r.conf<0.8)continue;
      const lengthBonus=Math.min(0.14,r.surface.length*0.025);const contextualBoost=r.surface.length===1?0.35:0;
      walk(cand,[...parts,{tag:r.tag,src:r.surface,confidence:r.conf}],score+r.conf+lengthBonus+contextualBoost,depth+1);
    }
  };
  walk(n,[],0,0); return out;
}
function legacyV4AnalyzeTurkishMorphology(raw){
  const original=String(raw??''); let n=normTR(original); if(!n)return {lemma:n,pos:'punct',morphemes:[],confidence:1,role:null};
  let properBase=null, properSuffix=false;
  const apos=n.match(/^(.+)'([a-zçğıöşü]+)$/iu); if(apos){properBase=apos[1];n=apos[1]+apos[2];properSuffix=true;}
  if(FUNCTION_WORDS[n])return{lemma:n,pos:'function',morphemes:[],confidence:1,role:null};
  if(findExactPhrase(n))return{lemma:n,pos:'canon',morphemes:[],confidence:1,role:null};
  const cands=morphologyCandidates(n,properSuffix);
  let best=cands.sort((a,b)=>b.score-a.score || b.morphemes.length-a.morphemes.length || b.stem.length-a.stem.length)[0];
  const threshold=state.settings.strictMorph===false?0.64:0.80;
  if(!best || best.score<threshold){return{lemma:properBase||n,pos:'noun',morphemes:[],confidence:0.64,role:null,properSuffix};}
  const firstSurface=best.morphemes[0]?.src||''; const vowelInitial=/^[aeıioöuü]/.test(firstSurface);
  let lemma=unsoftenStem(best.stem,vowelInitial);
  // If the original used an apostrophe, the left side is the lexical identity exactly.
  if(properBase) lemma=properBase;
  let pos='noun', role=null;
  for(const m of best.morphemes){const meta=MORPH_TAGS[m.tag]||{};if(meta.pos)pos=meta.pos;if(meta.role)role=meta.role;}
  const avg=best.morphemes.reduce((s,m)=>s+m.confidence,0)/Math.max(1,best.morphemes.length);
  const confidence=Math.max(0.45,Math.min(0.995,avg));
  return {lemma,pos,morphemes:best.morphemes,confidence,role,properSuffix};
}
function morphologyKey(m){return `${m.lemma}|${m.pos}|${m.morphemes.map(x=>x.tag).join('+')}`;}
function lexemeForLemma(lemma){
  const n=normTR(lemma); const exact=findExactPhrase(n); if(exact)return {roman:exact.roman,glyph:exact.glyph,source:'canon'};
  if(state.custom[n]){const e=normalizeCustomEntry(state.custom[n]);return{roman:e.roman,glyph:e.glyph,source:'custom'};}
  const syn=synthLexeme(n);return{...syn,source:'generated'};
}
function morphForm(tag){return grammarForm('morph-v4:'+tag);}
function translateProperUnknown(raw,stats){
  const policy=state.settings.properPolicy||'phonetic';
  if(policy==='preserve'){stats.proper++;return{roman:raw,glyph:raw,type:'proper-preserve',source:raw,lemma:normTR(raw),morphemes:[],pos:'proper',confidence:1};}
  if(policy==='synthesize'){
    const x=synthIndependent('proper:'+normTR(raw),3,8);stats.proper++;return{roman:capRoman(x.roman),glyph:titleCaseNativeGlyph(x.glyph),type:'proper-generated',source:raw,lemma:normTR(raw),morphemes:[],pos:'proper',confidence:1};
  }
  const roman=phoneticRomanTR(raw);stats.proper++;return{roman,glyph:romanToGlyph(roman),type:'proper-phonetic',source:raw,lemma:normTR(raw),morphemes:[],pos:'proper',confidence:1};
}
function translateTurkishWord(word, stats){
  const raw=String(word??''), n=normTR(raw); if(!n)return{roman:raw,glyph:raw,type:'punct',source:raw};
  if(SACRED_TOKENS.has(raw.normalize('NFC')) || /[ꬲƣ]/u.test(raw)){stats.local++;return{roman:raw,glyph:raw,type:'sacred',source:raw,lemma:n,pos:'sacred',morphemes:[],confidence:1};}
  const exact=findExactPhrase(n);if(exact){stats.canon++;return{roman:exact.roman,glyph:exact.glyph,type:exact.custom?'custom':'canon',source:raw,lemma:n,pos:'canon',morphemes:[],confidence:1};}
  if(isMostlyLocalGlyph(raw)){stats.local++;return{roman:raw,glyph:raw,type:'local',source:raw,lemma:n,pos:'local',morphemes:[],confidence:1};}
  if(looksRomanized(raw)){const kr=knownRomanToken(raw);stats.roman++;return{roman:kr?kr.roman:raw,glyph:kr?kr.glyph:romanToGlyph(raw),type:'roman',source:raw,lemma:n,pos:'roman',morphemes:[],confidence:1};}
  if(FUNCTION_WORDS[n]){const f=functionForm(FUNCTION_WORDS[n]);stats.grammar++;return{roman:f.roman,glyph:f.glyph,type:'grammar',source:raw,lemma:n,pos:'function',morphemes:[],confidence:1};}
  // Unknown capitalized names are handled before morphology to avoid changing identity accidentally.
  if(isUnknownProper(raw) && !/[’']/.test(raw)) return translateProperUnknown(raw,stats);
  const morph=analyzeTurkishMorphology(raw); stats.morphAnalyzed++;stats.morphConfidenceSum+=morph.confidence;
  let base;
  if(state.custom[morph.lemma]){const e=normalizeCustomEntry(state.custom[morph.lemma]);base={roman:e.roman,glyph:e.glyph,source:'custom'};stats.custom++;}
  else if(FUNCTION_WORDS[morph.lemma]){const f=functionForm(FUNCTION_WORDS[morph.lemma]);base={...f,source:'grammar'};stats.grammar++;}
  else if(state.settings.unknown==='mark'){base={roman:'⟦'+morph.lemma+'⟧',glyph:'⟦'+morph.lemma+'⟧',source:'unknown'};stats.unknown++;}
  else if(state.settings.unknown==='phonetic'){const r=phoneticRomanTR(morph.lemma);base={roman:r,glyph:romanToGlyph(r),source:'loan'};stats.loan++;}
  else {base=lexemeForLemma(morph.lemma);stats.generated++;const gu=state.generatedUsage.get(morph.lemma)||{source:morph.lemma,roman:base.roman,glyph:base.glyph,count:0,pos:morph.pos};gu.count++;gu.pos=morph.pos;state.generatedUsage.set(morph.lemma,gu);}
  const suffixForms=morph.morphemes.map(x=>({m:x,f:morphForm(x.tag)}));stats.suffix+=suffixForms.length;
  const roman=base.roman+suffixForms.map(x=>'’'+x.f.roman).join('');
  const glyph=base.glyph+suffixForms.map(x=>'’'+x.f.glyph).join('');
  return {roman,glyph,type:base.source==='generated'?'generated':base.source,source:raw,lemma:morph.lemma,pos:morph.pos,morphemes:morph.morphemes,role:morph.role,confidence:morph.confidence,familyKey:'lex:'+morph.lemma};
}
function legacyV4BuildSemanticIR(analysis){
  const nodes=[]; let sentence=0, index=0;
  for(const a of analysis){
    if(!a||!a.type)continue;
    nodes.push({id:index++,sentence,source:a.source||'',lemma:a.lemma||normTR(a.source||''),pos:a.pos||a.type,role:a.role||null,features:(a.morphemes||[]).map(x=>x.tag),confidence:a.confidence??1,output:{roman:a.roman||'',glyph:a.glyph||''},origin:a.type});
    if(/[.!?…]$/.test(a.source||''))sentence++;
  }
  return {schema:'Alekrythae-SIR/1',nodes,sentences:Math.max(1,sentence+1)};
}
function translateText(input, mode='auto'){
  const stats={canon:0,custom:0,grammar:0,generated:0,loan:0,unknown:0,roman:0,local:0,suffix:0,phrases:0,proper:0,morphAnalyzed:0,morphConfidenceSum:0};
  const analysis=[]; const protectedData=protectMarkdown(String(input??''));let text=protectedData.text;const phraseSlots=[];
  const phrases=collectPhraseAliases();
  if(mode!=='roman')for(const [phrase,val] of phrases){const escp=phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+');const re=new RegExp(`(?<![\\p{L}\\p{N}])${escp}(?![\\p{L}\\p{N}])`,'giu');text=text.replace(re,()=>{const id=`\uE100${phraseSlots.length}\uE101`;phraseSlots.push(val);stats.phrases++;stats.canon++;return id;});}
  const tokens=text.match(/\uE100\d+\uE101|\uE000\d+\uE001|[\p{L}\p{M}0-9_'’\-]+|[^\p{L}\p{M}0-9_'’\-\uE000\uE001\uE100\uE101]+|[\uE000\uE001\uE100\uE101]/gu)||[];
  const romanParts=[],glyphParts=[];
  for(const tok of tokens){
    let mm=tok.match(/^\uE100(\d+)\uE101$/);if(mm){const v=phraseSlots[Number(mm[1])];romanParts.push(v.roman);glyphParts.push(v.glyph);analysis.push({source:'[deyim]',roman:v.roman,glyph:v.glyph,type:'canon-phrase',lemma:'[deyim]',pos:'phrase',morphemes:[],confidence:1});continue;}
    if(/^\uE000\d+\uE001$/.test(tok)){romanParts.push(tok);glyphParts.push(tok);continue;}
    if(!/[\p{L}\p{N}]/u.test(tok)){romanParts.push(tok);glyphParts.push(tok);analysis.push({source:tok,roman:tok,glyph:tok,type:'punct',lemma:'',pos:'punct',morphemes:[],confidence:1});continue;}
    let res;
    if(mode==='roman'){if(isMostlyLocalGlyph(tok))res={roman:tok,glyph:tok,type:'local',source:tok,lemma:normTR(tok),pos:'local',morphemes:[],confidence:1};else{const kr=knownRomanToken(tok);res={roman:kr?kr.roman:tok,glyph:kr?kr.glyph:romanToGlyph(tok),type:'roman',source:tok,lemma:normTR(tok),pos:'roman',morphemes:[],confidence:1};stats.roman++;}}
    else if(mode==='turkish')res=translateTurkishWord(tok,stats);
    else {if(isMostlyLocalGlyph(tok)){res={roman:tok,glyph:tok,type:'local',source:tok,lemma:normTR(tok),pos:'local',morphemes:[],confidence:1};stats.local++;}else if(knownRomanToken(tok)||looksRomanized(tok)){const kr=knownRomanToken(tok);res={roman:kr?kr.roman:tok,glyph:kr?kr.glyph:romanToGlyph(tok),type:'roman',source:tok,lemma:normTR(tok),pos:'roman',morphemes:[],confidence:1};stats.roman++;}else res=translateTurkishWord(tok,stats);}
    romanParts.push(res.roman);glyphParts.push(res.glyph);analysis.push(res);
  }
  const roman=restoreMarkdown(romanParts.join(''),protectedData.slots),glyph=restoreMarkdown(glyphParts.join(''),protectedData.slots);
  const used240=new Set();for(const ch of graphemes(glyph)){const lo=ch.toLocaleLowerCase('tr-TR');if(GLYPH240_SET.has(ch))used240.add(ch);else if(GLYPH240_SET.has(lo))used240.add(lo);}
  stats.glyph240Distinct=used240.size;const gm=shannonMetrics(glyph);const lex=lexicalTokenCount(analysis)||1;stats.entropyNorm=gm.entropyNorm;stats.dominantGlyph=gm.dominant;stats.adjacentRepeat=gm.adjacentRepeat;stats.lexicalTokens=lex;stats.canonCoverage=(stats.canon+stats.custom)/lex;stats.generatedShare=stats.generated/lex;stats.morphConfidenceAvg=stats.morphAnalyzed?stats.morphConfidenceSum/stats.morphAnalyzed:1;
  const familyCounts=new Map();for(const a of analysis)if(a.familyKey)familyCounts.set(a.familyKey,(familyCounts.get(a.familyKey)||0)+1);stats.familyReuse=Array.from(familyCounts.values()).filter(v=>v>1).reduce((s,v)=>s+v,0);
  const ir=buildSemanticIR(analysis);stats.irNodes=ir.nodes.length;stats.fingerprint=fingerprint128(glyph+'|'+roman+'|'+APP_VERSION+'|'+LANGUAGE_CORE_VERSION+'|'+GRAMMAR_VERSION);
  const warnings=[];if(stats.unknown)warnings.push(`${stats.unknown} çözümlenmeyen/işaretli kök var.`);if(stats.generatedShare>0.70)warnings.push('Metnin büyük kısmı matematiksel yeni sözlükten geliyor; korpus öncelik listesini kullan.');if(stats.morphConfidenceAvg<0.72)warnings.push('Bazı Türkçe morfoloji çözümlemeleri düşük güvenli; Analiz sekmesinden kontrol et.');
  return {roman,glyph,stats,analysis,ir,warnings};
}
function normalizeCustomEntry(v){
  if(typeof v==='string')return{roman:v,glyph:romanToGlyph(v),lemma:'',pos:'unknown',domain:'custom',status:'legacy',version:'2',aliases:[],note:'v2 uyum kaydı',locked:false};
  if(v&&typeof v==='object'){const roman=String(v.roman||'').trim(),glyph=String(v.glyph||'').trim()||romanToGlyph(roman);return{roman,glyph,lemma:String(v.lemma||'').trim(),pos:String(v.pos||'unknown'),domain:String(v.domain||'custom'),status:String(v.status||'canon'),version:String(v.version||APP_VERSION),aliases:Array.isArray(v.aliases)?v.aliases:[],note:String(v.note||''),locked:!!v.locked};}
  return{roman:'',glyph:'',lemma:'',pos:'unknown',domain:'custom',status:'draft',version:APP_VERSION,aliases:[],note:'',locked:false};
}
function corpusAggregate(results){
  const lemmas=new Map();let tokens=0,generated=0,canon=0;
  for(const r of results)for(const a of r.analysis||[]){if(!a||!a.lemma||['punct','local'].includes(a.type))continue;tokens++;if(a.type==='generated')generated++;if(String(a.type).startsWith('canon')||a.type==='custom')canon++;const k=a.lemma;const x=lemmas.get(k)||{lemma:k,count:0,generated:0,pos:{},examples:[]};x.count++;if(a.type==='generated')x.generated++;x.pos[a.pos||a.type]=(x.pos[a.pos||a.type]||0)+1;if(x.examples.length<3&&!x.examples.includes(a.source))x.examples.push(a.source);lemmas.set(k,x);}
  const rows=Array.from(lemmas.values()).sort((a,b)=>b.generated-a.generated||b.count-a.count||a.lemma.localeCompare(b.lemma,'tr'));
  return{schema:'Alekrythae-Corpus/1',engine:APP_VERSION,lore:LANGUAGE_CORE_VERSION,tokens,canonCoverage:tokens?canon/tokens:1,generatedShare:tokens?generated/tokens:0,priority:rows.slice(0,500)};
}


// ============================================================
// TRANSCENDENCE v5 CORE
// Morphology lattice + sentence graph + reproducible build lock.
// This layer does not invent a new lore grammar. It analyses Turkish input
// and preserves source order unless a future canon grammar profile is defined.
// ============================================================
const IR_SCHEMA = 'Alekrythae-SIR/2';
const BUILD_LOCK_SCHEMA = 'Alekrythae-BuildLock/1';
const LEXEME_SCHEMA = 'Alekrythae-Lexeme/1';
const AMBIGUITY_MARGIN = 0.18;
const MORPH_MAX_ALTERNATIVES = 5;

// Additional Turkish morphology without syllable templates or AI.
const MORPH_V5_EXTRA = [
  ['agentive',['cı','ci','cu','cü','çı','çi','çu','çü'],2,0.95,'noun'],
  ['adverbial',['ca','ce','ça','çe'],2,0.78,'adv'],
  ['accusative',['yı','yi','yu','yü'],2,0.98,'noun'],
  ['relational',['sal','sel'],3,0.90,'adj'],
  ['collective',['gil'],2,0.74,'noun'],
  ['equative',['casına','cesine','çasına','çesine'],3,0.86,'adv'],
  ['converb',['arak','erek'],3,0.94,'adv'],
  ['converb',['ıp','ip','up','üp'],2,0.90,'adv'],
  ['participle',['an','en'],2,0.77,'adj'],
  ['participle',['dık','dik','duk','dük','tık','tik','tuk','tük'],3,0.82,'adj'],
  ['participle',['acak','ecek'],3,0.78,'adj']
];
for(const [tag,forms,minStem,conf,pos] of MORPH_V5_EXTRA){
  if(!MORPH_TAGS[tag]) MORPH_TAGS[tag]={kind:'derivation',pos:pos||'unknown'};
  for(const surface of forms){
    if(!MORPH_SORTED.some(x=>x.tag===tag&&x.surface===surface)) MORPH_SORTED.push({tag,surface,minStem,conf});
  }
}
MORPH_SORTED.sort((a,b)=>b.surface.length-a.surface.length || b.conf-a.conf);


const LEXEME_SEED_V5 = 'Alekrythae-Transcendence-Lexeme128-v1';
function synthIndependent128(source,minLetters=6,maxLetters=10){
  const key=identityTR(source);
  if(!key)return{roman:String(source??''),glyph:String(source??''),indices:[]};
  const cacheKey=`V5:${minLetters}:${maxLetters}:${key}`;
  if(state.lexemeCache.has(cacheKey))return state.lexemeCache.get(cacheKey);
  const h1=mix64(fnv1a64(LEXEME_SEED_V5+'|A|'+key));
  const h2=mix64(fnv1a64(LEXEME_SEED_V5+'|B|'+key));
  const span=Math.max(1,maxLetters-minLetters+1);
  const count=minLetters+Number(mix64(h1^h2^BigInt(key.length*257))%BigInt(span));
  const indices=[];
  for(let pos=0;pos<count;pos++){
    const laneA=mix64(h1 ^ (BigInt(pos+1)*0x9e3779b97f4a7c15n));
    const laneB=mix64(h2 ^ (BigInt(pos+1)*0xd6e8feb86659fd93n));
    indices.push(Number(mix64(laneA^laneB^BigInt(pos*911+key.length))%240n));
  }
  const result={roman:glyphReading(indices),glyph:indices.map(i=>GLYPH240[i]).join(''),indices};
  state.lexemeCache.set(cacheKey,result);return result;
}
// V5 lexemes use a 128-bit-derived 6–10 glyph identity space. Function and grammar
// morphemes intentionally retain the legacy stable generator so old grammatical
// output does not churn between major versions.
function synthLexeme(source){return synthIndependent128('lex:'+source,6,10);}

function stableObject(value){
  if(Array.isArray(value)) return value.map(stableObject);
  if(value&&typeof value==='object'){
    const o={};for(const k of Object.keys(value).sort())o[k]=stableObject(value[k]);return o;
  }
  return value;
}
function stableJson(value){return JSON.stringify(stableObject(value));}
function hash128Text(s){return fingerprint128(String(s??''));}
function lexemeId(lemma){return 'LX-'+fnvHex('lexeme-id|'+normTR(lemma)).slice(0,12).toUpperCase();}
function dictionaryFingerprint(){
  const canon=CANON_ENTRIES.map(x=>({roman:x[0],glyph:x[1],aliases:[...(x[2]||[])].sort()}));
  const custom=Object.fromEntries(Object.entries(state.custom||{}).sort(([a],[b])=>a.localeCompare(b,'tr')).map(([k,v])=>[k,normalizeCustomEntry(v)]));
  return hash128Text(stableJson({schema:DICTIONARY_SCHEMA,canon,custom}));
}
function engineFingerprint(){return hash128Text(stableJson({engine:APP_VERSION,edition:ENGINE_EDITION,lore:LANGUAGE_CORE_VERSION,grammar:GRAMMAR_VERSION,morphology:MORPHOLOGY_VERSION,synthesis:SYNTHESIS_SCHEMA,seed:SYNTHESIS_SEED,lexemeSeed:(typeof V6_LEXEME_SEED!=='undefined'?V6_LEXEME_SEED:null),candidateCount:(typeof V6_CANDIDATES!=='undefined'?V6_CANDIDATES:null),alphabet:GLYPH240,readings:GLYPH240_READING}));}

function morphologyLattice(raw){
  const original=String(raw??'');let n=normTR(original);if(!n)return{best:{lemma:n,pos:'punct',morphemes:[],confidence:1,role:null},alternatives:[],ambiguous:false,margin:1};
  let properBase=null,properSuffix=false;const apos=n.match(/^(.+)'([a-zçğıöşü]+)$/iu);if(apos){properBase=apos[1];n=apos[1]+apos[2];properSuffix=true;}
  if(FUNCTION_WORDS[n]){const b={lemma:n,pos:'function',morphemes:[],confidence:1,role:null,properSuffix};return{best:b,alternatives:[],ambiguous:false,margin:1};}
  if(findExactPhrase(n)){const b={lemma:n,pos:'canon',morphemes:[],confidence:1,role:null,properSuffix};return{best:b,alternatives:[],ambiguous:false,margin:1};}
  const rawCands=morphologyCandidates(n,properSuffix);
  const cands=[];
  for(const c of rawCands){
    const firstSurface=c.morphemes[0]?.src||'',vowelInitial=/^[aeıioöuü]/.test(firstSurface);
    let lemma=properBase||unsoftenStem(c.stem,vowelInitial),pos='noun',role=null;
    for(const m of c.morphemes){const meta=MORPH_TAGS[m.tag]||{};if(meta.pos)pos=meta.pos;if(meta.role)role=meta.role;}
    const avg=c.morphemes.reduce((s,m)=>s+(m.confidence||0.5),0)/Math.max(1,c.morphemes.length);
    const knownRoot=ROOT_HINTS.has(normTR(lemma))||state.custom[normTR(lemma)]||aliasMap.has(normTR(lemma));
    const knownBoost=knownRoot?1.25:0;
    const complexityPenalty=Math.max(0,c.morphemes.length-4)*0.035;
    const derivCount=c.morphemes.filter(m=>(MORPH_TAGS[m.tag]||{}).kind==='derivation').length;
    const tagset=new Set(c.morphemes.map(m=>m.tag));
    const hasCase=['accusative','dative','locative','ablative','genitive','instrumental'].some(t=>tagset.has(t));
    const hasVerbCore=['neg','future','progressive','past','evidentialPast','necessity','conditional','infinitive','aorist','ability','causative','passive','reciprocal'].some(t=>tagset.has(t));
    const hasVerbPerson=['p1sg','p2sg','p1pl','p2pl','p3pl'].some(t=>tagset.has(t));
    const shortUnknownPenalty=!knownRoot&&lemma.length<4?(4-lemma.length)*0.72:0;
    const derivUnknownPenalty=!knownRoot?derivCount*0.95:0;
    const categoryPenalty=(hasCase&&(hasVerbCore||hasVerbPerson))?2.4:0;
    const totalPenalty=complexityPenalty+shortUnknownPenalty+derivUnknownPenalty+categoryPenalty;
    const confidence=Math.max(0.30,Math.min(0.999,avg+knownBoost-totalPenalty));
    cands.push({lemma,pos,role,morphemes:c.morphemes,confidence,score:c.score+knownBoost-totalPenalty,properSuffix});
  }
  cands.sort((a,b)=>b.score-a.score||b.confidence-a.confidence||a.morphemes.length-b.morphemes.length);
  const threshold=state.settings.strictMorph===false?0.60:0.76;
  let best=cands[0];
  if(!best||best.confidence<threshold)best={lemma:properBase||n,pos:'noun',morphemes:[],confidence:0.64,role:null,properSuffix};
  const alternatives=cands.filter(x=>!(x.lemma===best.lemma&&x.morphemes.map(m=>m.tag).join('+')===best.morphemes.map(m=>m.tag).join('+'))).slice(0,MORPH_MAX_ALTERNATIVES);
  const second=alternatives[0];const margin=second?Math.max(0,best.confidence-second.confidence):1;
  return{best,alternatives,ambiguous:!!second&&margin<AMBIGUITY_MARGIN,margin};
}
function analyzeTurkishMorphology(raw){
  const L=morphologyLattice(raw);return{...L.best,alternatives:L.alternatives,ambiguous:L.ambiguous,ambiguityMargin:L.margin};
}

function inferSentenceGraph(nodes,sentenceIndex){
  const meaningful=nodes.filter(n=>!['punct','local'].includes(n.pos));
  const predicates=meaningful.filter(n=>n.pos==='verb'||n.features.some(f=>['future','progressive','past','evidentialPast','necessity','conditional','aorist'].includes(f)));
  const predicate=predicates.at(-1)||null;
  const edges=[];
  for(const n of meaningful){
    if(!predicate||n.id===predicate.id)continue;
    let rel=null;
    if(n.features.includes('accusative'))rel='object';
    else if(n.features.includes('dative'))rel='goal';
    else if(n.features.includes('ablative'))rel='source';
    else if(n.features.includes('locative'))rel='location';
    else if(n.features.includes('instrumental'))rel='instrument';
    else if(n.features.includes('genitive'))rel='possessor';
    if(rel)edges.push({from:n.id,to:predicate.id,relation:rel,confidence:0.96});
  }
  if(predicate){
    const hasSubject=edges.some(e=>e.relation==='subject');
    if(!hasSubject){
      const candidate=[...meaningful].reverse().find(n=>n.id<predicate.id&&['noun','proper','canon'].includes(n.pos)&&!n.features.some(f=>['accusative','dative','ablative','locative','instrumental','genitive'].includes(f)));
      if(candidate)edges.push({from:candidate.id,to:predicate.id,relation:'subject',confidence:0.62,inferred:true});
    }
  }
  // modifier links: adjective/adverb immediately before a content word
  for(let i=0;i<meaningful.length-1;i++){
    const a=meaningful[i],b=meaningful[i+1];if(a.pos==='adj'&&['noun','proper','canon'].includes(b.pos))edges.push({from:a.id,to:b.id,relation:'modifier',confidence:0.78});
    if(a.pos==='adv'&&b.pos==='verb')edges.push({from:a.id,to:b.id,relation:'modifier',confidence:0.76});
  }
  return{sentence:sentenceIndex,predicate:predicate?.id??null,edges};
}
function buildSemanticIR(analysis){
  const nodes=[];let sentence=0,index=0;let buffer=[];const sentenceNodes=[];
  const flush=()=>{if(buffer.length){sentenceNodes.push(buffer);buffer=[];sentence++;}};
  for(const a of analysis){
    if(!a||!a.type)continue;
    const features=(a.morphemes||[]).map(x=>x.tag);
    const node={id:index++,sentence,source:a.source||'',lemma:a.lemma||normTR(a.source||''),lexemeId:a.lemma?lexemeId(a.lemma):null,pos:a.pos||a.type,role:a.role||null,features,confidence:a.confidence??1,ambiguity:{ambiguous:!!a.ambiguous,margin:a.ambiguityMargin??1,alternatives:(a.alternatives||[]).slice(0,3).map(x=>({lemma:x.lemma,pos:x.pos,features:x.morphemes.map(m=>m.tag),confidence:x.confidence}))},output:{roman:a.roman||'',glyph:a.glyph||''},origin:a.type};
    nodes.push(node);buffer.push(node);
    if(/[.!?…]/.test(a.source||''))flush();
  }
  flush();
  const graphs=sentenceNodes.map((ns,i)=>inferSentenceGraph(ns,i));
  const ambiguities=nodes.filter(n=>n.ambiguity.ambiguous).map(n=>({node:n.id,source:n.source,chosen:n.lemma,alternatives:n.ambiguity.alternatives,margin:n.ambiguity.margin}));
  return{schema:IR_SCHEMA,sourceOrderPolicy:'preserve-until-canon-grammar-exists',nodes,sentences:sentenceNodes.length,graphs,ambiguities};
}

function validateIR(ir){
  const issues=[];if(!ir||ir.schema!==IR_SCHEMA)issues.push({severity:'error',code:'IR_SCHEMA'});
  const ids=new Set();for(const n of ir?.nodes||[]){if(ids.has(n.id))issues.push({severity:'error',code:'DUP_NODE',node:n.id});ids.add(n.id);if(!Number.isFinite(n.confidence))issues.push({severity:'error',code:'BAD_CONF',node:n.id});}
  for(const g of ir?.graphs||[])for(const e of g.edges||[]){if(!ids.has(e.from)||!ids.has(e.to))issues.push({severity:'error',code:'BROKEN_EDGE',edge:e});}
  return{ok:!issues.some(x=>x.severity==='error'),issues};
}
function buildLock(input,result){
  const dict=dictionaryFingerprint(),engine=engineFingerprint(),inputHash=hash128Text(input),romanHash=hash128Text(result.roman),glyphHash=hash128Text(result.glyph),irHash=hash128Text(stableJson(result.ir));
  const payload={schema:BUILD_LOCK_SCHEMA,engine:APP_VERSION,edition:ENGINE_EDITION,lore:LANGUAGE_CORE_VERSION,grammar:GRAMMAR_VERSION,morphology:MORPHOLOGY_VERSION,synthesis:SYNTHESIS_SCHEMA,dictionary:dict,engineFingerprint:engine,input:inputHash,outputs:{roman:romanHash,glyph:glyphHash,ir:irHash}};
  return{...payload,compileSignature:hash128Text(stableJson(payload))};
}

// Wrap the v4 translator so every compilation gets SIR/2, validation and a reproducible lock.
const __translateTextV4 = translateText;
translateText = function(input,mode='auto'){
  const r=__translateTextV4(input,mode);
  r.ir=buildSemanticIR(r.analysis||[]);
  r.validation=validateIR(r.ir);
  r.stats.ambiguities=r.ir.ambiguities.length;
  r.stats.dictionaryFingerprint=dictionaryFingerprint();
  r.stats.engineFingerprint=engineFingerprint();
  r.lock=buildLock(String(input??''),r);
  r.stats.compileSignature=r.lock.compileSignature;
  if(r.ir.ambiguities.length)r.warnings.push(`${r.ir.ambiguities.length} morfolojik belirsizlik var; SIR/2 inceleme kuyruğuna eklendi.`);
  if(!r.validation.ok)r.warnings.push('SIR/2 doğrulama hatası bulundu; Tanılama sekmesini kontrol et.');
  return r;
};

function corpusAggregateV5(results){
  const base=corpusAggregate(results),ambiguities=new Map(),roles={},families=new Map();
  for(const r of results){
    for(const a of r.ir?.ambiguities||[]){const k=normTR(a.source);const x=ambiguities.get(k)||{source:a.source,count:0,examples:[],alternatives:a.alternatives};x.count++;if(x.examples.length<5)x.examples.push(a);ambiguities.set(k,x);}
    for(const g of r.ir?.graphs||[])for(const e of g.edges||[])roles[e.relation]=(roles[e.relation]||0)+1;
    for(const n of r.ir?.nodes||[])if(n.lexemeId){const x=families.get(n.lexemeId)||{lexemeId:n.lexemeId,lemma:n.lemma,count:0,forms:new Set()};x.count++;x.forms.add(n.source);families.set(n.lexemeId,x);}
  }
  return{...base,schema:'Alekrythae-Corpus/2',ambiguityQueue:Array.from(ambiguities.values()).sort((a,b)=>b.count-a.count).slice(0,500),semanticRoles:roles,lexemeFamilies:Array.from(families.values()).map(x=>({...x,forms:Array.from(x.forms).slice(0,20)})).sort((a,b)=>b.count-a.count).slice(0,1000)};
}
function canonHealth(){
  const nativeSeen=new Map(),aliasSeen=new Map(),issues=[];
  for(const [roman,glyph,aliases] of CANON_ENTRIES){
    const g=glyph.normalize('NFC');if(nativeSeen.has(g))issues.push({severity:'warn',type:'duplicate-glyph',a:nativeSeen.get(g),b:roman,glyph:g});else nativeSeen.set(g,roman);
    for(const a of [roman,...(aliases||[])]){const k=normTR(a);if(aliasSeen.has(k)&&aliasSeen.get(k)!==roman)issues.push({severity:'error',type:'alias-collision',alias:a,a:aliasSeen.get(k),b:roman});else aliasSeen.set(k,roman);}
  }
  for(const [k,v] of Object.entries(state.custom||{})){const e=normalizeCustomEntry(v);if(!e.glyph)issues.push({severity:'error',type:'custom-empty-glyph',key:k});if(aliasMap.has(normTR(k)))issues.push({severity:'warn',type:'custom-shadows-canon',key:k});}
  return{schema:'Alekrythae-CanonHealth/1',ok:!issues.some(x=>x.severity==='error'),issues,canonCount:CANON_ENTRIES.length,customCount:Object.keys(state.custom||{}).length,dictionaryFingerprint:dictionaryFingerprint()};
}


// ============================================================
// POLYMORPH v6 CORE
// Anti-pattern lexeme forge + lexeme-specific fusional morphology.
// No onset/nucleus/coda banks. No Aeth/Naer productive chunks. No fixed
// visible suffix is shared by every lexeme. All 240 letters remain atomic.
// ============================================================
const V6_LEXEME_SEED = 'Alekrythae-Polymorph-Lexeme256-v1';
const V6_CANDIDATES = 32;
const V6_LEXEME_MIN = 5;
const V6_LEXEME_MAX = 13;
const V6_SURFACE_MIN = 2;
const V6_SURFACE_MAX = 5;
let __v6RefCache = {fp:null,profile:null};

function v6Lane(key,lane,salt=0){
  return mix64(fnv1a64(`${V6_LEXEME_SEED}|${lane}|${salt}|${key}`));
}
function v6Ngrams(arr,n){
  const out=[]; for(let i=0;i+n<=arr.length;i++) out.push(arr.slice(i,i+n).join('\u0001')); return out;
}
function v6ReferenceProfile(){
  if(__v6RefCache.profile) return __v6RefCache.profile;
  const fp=dictionaryFingerprint();
  const bigrams=new Set(),trigrams=new Set(),prefix2=new Set(),suffix2=new Set(),roman2=new Set();
  const add=(glyph,roman)=>{
    const g=graphemes(String(glyph||'').normalize('NFC')).map(x=>x.toLocaleLowerCase('tr-TR')).filter(x=>GLYPH240_SET.has(x));
    for(const x of v6Ngrams(g,2))bigrams.add(x); for(const x of v6Ngrams(g,3))trigrams.add(x);
    if(g.length>=2){prefix2.add(g.slice(0,2).join('\u0001'));suffix2.add(g.slice(-2).join('\u0001'));}
    const r=Array.from(plainTR(roman||'').replace(/[^a-z0-9]/g,'')); for(const x of v6Ngrams(r,2))roman2.add(x);
  };
  for(const [roman,glyph] of CANON_ENTRIES)add(glyph,roman);
  for(const v of Object.values(state.custom||{})){const e=normalizeCustomEntry(v);add(e.glyph,e.roman);}
  const profile={fp,bigrams,trigrams,prefix2,suffix2,roman2}; __v6RefCache={fp,profile}; return profile;
}
function v6RawCandidate(key,salt,minLetters,maxLetters,roots=null){
  roots=roots||[v6Lane(key,'A',0),v6Lane(key,'B',0),v6Lane(key,'C',0),v6Lane(key,'D',0)];
  const ss=BigInt(salt+1);
  const h0=mix64(roots[0]^ss*0x9e3779b97f4a7c15n),h1=mix64(roots[1]^ss*0xd6e8feb86659fd93n),h2=mix64(roots[2]^ss*0xa0761d6478bd642fn),h3=mix64(roots[3]^ss*0xe7037ed1a0b428dbn);
  const span=Math.max(1,maxLetters-minLetters+1);
  const count=minLetters+Number(mix64(h0^h1^h2^h3^BigInt(key.length*401+salt))%BigInt(span));
  const indices=[];
  for(let pos=0;pos<count;pos++){
    const p=BigInt(pos+1);
    const z=mix64(
      mix64(h0 ^ p*0x9e3779b97f4a7c15n) ^
      mix64(h1 ^ p*0xd6e8feb86659fd93n) ^
      mix64(h2 ^ p*0xa0761d6478bd642fn) ^
      mix64(h3 ^ p*0xe7037ed1a0b428dbn) ^ BigInt(salt*1009+pos*313)
    );
    indices.push(Number(z%240n));
  }
  // Source-specific identity anchor. It is just one of the 240 independent letters,
  // not a syllable slot or phonetic class. This prevents anti-pattern scoring from
  // starving rarely selected glyphs across large corpora.
  if(indices.length){const anchor=Number(mix64(roots[0]^roots[2]^BigInt(key.length*733))%240n);const anchorPos=Number(mix64(roots[1]^BigInt(salt+1))%BigInt(indices.length));indices[anchorPos]=anchor;}
  return {indices,glyph:indices.map(i=>GLYPH240[i]).join(''),roman:glyphReading(indices)};
}
function v6CandidatePenalty(c,p){
  const g=c.indices.map(i=>GLYPH240[i]),r=Array.from(plainTR(c.roman).replace(/[^a-z0-9]/g,''));
  let score=0;
  const seenGlyph=new Set(),seen2=new Set(),seen3=new Set();
  for(let i=0;i<g.length;i++){
    if(i&&g[i]===g[i-1])score+=12;
    if(seenGlyph.has(g[i]))score+=0.75; seenGlyph.add(g[i]);
  }
  for(const x of v6Ngrams(g,2)){if(seen2.has(x))score+=8;seen2.add(x);if(p.bigrams.has(x))score+=1.6;}
  for(const x of v6Ngrams(g,3)){if(seen3.has(x))score+=14;seen3.add(x);if(p.trigrams.has(x))score+=5.5;}
  if(g.length>=2){const pre=g.slice(0,2).join('\u0001'),suf=g.slice(-2).join('\u0001');if(p.prefix2.has(pre))score+=4.5;if(p.suffix2.has(suf))score+=5.5;}
  const rs=new Set();for(const x of v6Ngrams(r,2)){if(rs.has(x))score+=1.5;rs.add(x);if(p.roman2.has(x))score+=0.35;}
  // Avoid periodic-looking ABAB/ABCABC texture without banning any glyph.
  if(g.length>=4 && g[0]===g[2] && g[1]===g[3])score+=10;
  if(g.length>=6 && g.slice(0,3).join('')===g.slice(3,6).join(''))score+=14;
  return score;
}
function synthDiverse(source,minLetters=V6_LEXEME_MIN,maxLetters=V6_LEXEME_MAX){
  const key=identityTR(source);
  if(!key)return{roman:String(source??''),glyph:String(source??''),indices:[],noveltyPenalty:0};
  const profile=v6ReferenceProfile();
  const cacheKey=`V6D:${profile.fp}:${minLetters}:${maxLetters}:${key}`;
  if(state.lexemeCache.has(cacheKey))return state.lexemeCache.get(cacheKey);
  let best=null,bestPenalty=Infinity,bestTie='';
  const roots=[v6Lane(key,'A',0),v6Lane(key,'B',0),v6Lane(key,'C',0),v6Lane(key,'D',0)];
  for(let salt=0;salt<V6_CANDIDATES;salt++){
    const c=v6RawCandidate(key,salt,minLetters,maxLetters,roots),pen=v6CandidatePenalty(c,profile),tie=fnvHex(`tie|${key}|${salt}`);
    if(pen<bestPenalty || (pen===bestPenalty&&tie<bestTie)){best=c;bestPenalty=pen;bestTie=tie;}
  }
  const result={...best,noveltyPenalty:bestPenalty,identity:fingerprint128(`V6|${key}|${best.glyph}`)};
  state.lexemeCache.set(cacheKey,result);return result;
}

// Replace V5 root/function generators. Function words still remain the same word
// when repeated, as real lexical identity requires, but their forms no longer use
// the tiny legacy grammar generator.
synthLexeme = function(source){return synthDiverse('lex:'+source,5,13);};
functionForm = function(id){return synthDiverse('function:'+id,3,8);};
grammarForm = function(tag){return synthDiverse('grammar:'+tag,2,6);};
morphForm = function(tag){return grammarForm('legacy-morph:'+tag);};
lexemeForLemma = function(lemma){
  const n=normTR(lemma),exact=findExactPhrase(n);if(exact)return{roman:exact.roman,glyph:exact.glyph,source:'canon'};
  if(state.custom[n]){const e=normalizeCustomEntry(state.custom[n]);return{roman:e.roman,glyph:e.glyph,source:'custom'};}
  const syn=synthLexeme(n);return{...syn,source:'generated'};
};

function v6GlyphReadingString(glyph){
  const out=[];
  for(const ch of graphemes(glyph)){
    if(ch==='’'||ch==="'"||ch==='⟡'||ch==='-'||/\s/u.test(ch)){out.push(ch);continue;}
    let idx=GLYPH240.indexOf(ch);
    if(idx<0){const lo=ch.toLocaleLowerCase('tr-TR');idx=GLYPH240.indexOf(lo);}
    out.push(idx>=0?GLYPH240_READING[idx]:ch);
  }
  return out.join('');
}
function v6SurfaceBundle(lemma,morphemes,baseGlyph=''){
  const tags=(morphemes||[]).map(x=>x.tag); if(!tags.length)return null;
  // One fused surface allomorph is derived from the COMPLETE feature bundle and
  // lexical identity. A small deterministic candidate set also minimizes reuse
  // of the root's own glyphs, so the transformation does not visibly stutter.
  const baseSet=new Set(graphemes(baseGlyph).map(x=>x.toLocaleLowerCase('tr-TR'))),base2=new Set(v6Ngrams(graphemes(baseGlyph).map(x=>x.toLocaleLowerCase('tr-TR')),2));
  let best=null,bestScore=Infinity,bestTie='';
  for(let variant=0;variant<8;variant++){
    const x=synthDiverse(`surface:${lexemeId(lemma)}:${tags.join('+')}:v${variant}`,V6_SURFACE_MIN,V6_SURFACE_MAX);
    const gs=graphemes(x.glyph).map(c=>c.toLocaleLowerCase('tr-TR'));let score=x.noveltyPenalty||0;
    for(const c of gs)if(baseSet.has(c))score+=2.2;
    for(const bg of v6Ngrams(gs,2))if(base2.has(bg))score+=7;
    const tie=fnvHex(`surface-tie|${lemma}|${tags.join('+')}|${variant}`);
    if(score<bestScore||(score===bestScore&&tie<bestTie)){best=x;bestScore=score;bestTie=tie;}
  }
  return {...best,surfacePenalty:bestScore};
}
function v6DerivationalBase(base,lemma,morphemes){
  const tags=(morphemes||[]).map(x=>x.tag),deriv=tags.filter(t=>(MORPH_TAGS[t]||{}).kind==='derivation');
  if(!deriv.length||base.source!=='generated')return{...base,derivationMutations:0};
  const g=graphemes(base.glyph);if(g.length<3)return{...base,derivationMutations:0};
  const mutPool=synthDiverse(`mutation:${lexemeId(lemma)}:${deriv.join('+')}`,2,5),repl=graphemes(mutPool.glyph);
  const maxMut=Math.min(3,Math.max(1,Math.floor(g.length/3))),count=1+Number(v6Lane(`${lemma}|${deriv.join('+')}`,'MUTCOUNT',0)%BigInt(maxMut));
  const used=new Set();
  for(let i=0;i<count;i++){
    let pos=Number(v6Lane(`${lemma}|${deriv.join('+')}`,'MUTPOS',i)%BigInt(g.length)),guard=0;while(used.has(pos)&&guard++<g.length)pos=(pos+1)%g.length;used.add(pos);
    let r=repl[i%repl.length];if(r===g[pos])r=GLYPH240[(GLYPH240.indexOf(r)+1+((i*37)%239))%240];g[pos]=r;
  }
  const glyph=g.join('');return{...base,glyph,roman:v6GlyphReadingString(glyph),derivationMutations:count};
}

function v6FuseGenerated(base,tail,lemma,tags){
  const b=graphemes(base.glyph),t=graphemes(tail.glyph);if(!t.length)return{glyph:base.glyph,roman:base.roman,mode:'none'};
  const mode=Number(v6Lane(`${lemma}|${tags.join('+')}`,'FUSE',0)%4n);let g;
  if(!b.length||base.source!=='generated'){
    g=[...b,...t]; return{glyph:g.join(''),roman:String(base.roman||'')+tail.roman,mode:'canon-tail'};
  }
  if(mode===0)g=[...b,...t];
  else if(mode===1){const at=1+Number(v6Lane(lemma,'INFIX',tags.length)%BigInt(Math.max(1,b.length-1)));g=[...b.slice(0,at),...t,...b.slice(at)];}
  else if(mode===2){const cut=Math.max(1,Math.floor(t.length/2));g=[...t.slice(0,cut),...b,...t.slice(cut)];}
  else {const at=Number(v6Lane(lemma,'WEAVE',tags.length)%BigInt(b.length));g=[...b];g.splice(at,0,t[0]);if(t.length>1)g.push(...t.slice(1));}
  const glyph=g.join('');return{glyph,roman:v6GlyphReadingString(glyph),mode:['tail','infix','wrap','weave'][mode]};
}

translateProperUnknown = function(raw,stats){
  const policy=state.settings.properPolicy||'phonetic';
  if(policy==='preserve'){stats.proper++;return{roman:raw,glyph:raw,type:'proper-preserve',source:raw,lemma:normTR(raw),morphemes:[],pos:'proper',confidence:1};}
  if(policy==='synthesize'){
    const x=synthDiverse('proper:'+normTR(raw),5,12);stats.proper++;return{roman:capRoman(x.roman),glyph:titleCaseNativeGlyph(x.glyph),type:'proper-generated',source:raw,lemma:normTR(raw),morphemes:[],pos:'proper',confidence:1,noveltyPenalty:x.noveltyPenalty};
  }
  const roman=phoneticRomanTR(raw);stats.proper++;return{roman,glyph:romanToGlyph(roman),type:'proper-phonetic',source:raw,lemma:normTR(raw),morphemes:[],pos:'proper',confidence:1};
};

translateTurkishWord = function(word,stats){
  const raw=String(word??''),n=normTR(raw);if(!n)return{roman:raw,glyph:raw,type:'punct',source:raw};
  if(SACRED_TOKENS.has(raw.normalize('NFC'))||/[ꬲƣ]/u.test(raw)){stats.local++;return{roman:raw,glyph:raw,type:'sacred',source:raw,lemma:n,pos:'sacred',morphemes:[],confidence:1};}
  const exact=findExactPhrase(n);if(exact){stats.canon++;return{roman:exact.roman,glyph:exact.glyph,type:exact.custom?'custom':'canon',source:raw,lemma:n,pos:'canon',morphemes:[],confidence:1};}
  if(isMostlyLocalGlyph(raw)){stats.local++;return{roman:raw,glyph:raw,type:'local',source:raw,lemma:n,pos:'local',morphemes:[],confidence:1};}
  if(looksRomanized(raw)){const kr=knownRomanToken(raw);stats.roman++;return{roman:kr?kr.roman:raw,glyph:kr?kr.glyph:romanToGlyph(raw),type:'roman',source:raw,lemma:n,pos:'roman',morphemes:[],confidence:1};}
  if(FUNCTION_WORDS[n]){const f=functionForm(FUNCTION_WORDS[n]);stats.grammar++;return{roman:f.roman,glyph:f.glyph,type:'grammar',source:raw,lemma:n,pos:'function',morphemes:[],confidence:1,noveltyPenalty:f.noveltyPenalty};}
  if(isUnknownProper(raw)&&!/[’']/.test(raw))return translateProperUnknown(raw,stats);
  const morph=analyzeTurkishMorphology(raw);stats.morphAnalyzed++;stats.morphConfidenceSum+=morph.confidence;
  let base;
  if(state.custom[morph.lemma]){const e=normalizeCustomEntry(state.custom[morph.lemma]);base={roman:e.roman,glyph:e.glyph,source:'custom'};stats.custom++;}
  else if(FUNCTION_WORDS[morph.lemma]){const f=functionForm(FUNCTION_WORDS[morph.lemma]);base={...f,source:'grammar'};stats.grammar++;}
  else if(state.settings.unknown==='mark'){base={roman:'⟦'+morph.lemma+'⟧',glyph:'⟦'+morph.lemma+'⟧',source:'unknown'};stats.unknown++;}
  else if(state.settings.unknown==='phonetic'){const r=phoneticRomanTR(morph.lemma);base={roman:r,glyph:romanToGlyph(r),source:'loan'};stats.loan++;}
  else{base=lexemeForLemma(morph.lemma);stats.generated++;const gu=state.generatedUsage.get(morph.lemma)||{source:morph.lemma,roman:base.roman,glyph:base.glyph,count:0,pos:morph.pos};gu.count++;gu.pos=morph.pos;state.generatedUsage.set(morph.lemma,gu);}
  const tags=(morph.morphemes||[]).map(x=>x.tag);stats.suffix+=tags.length;
  const surfaceBase=v6DerivationalBase(base,morph.lemma,morph.morphemes);
  let roman=surfaceBase.roman,glyph=surfaceBase.glyph,surfaceMode=surfaceBase.derivationMutations?'derivation-mutation':'root',surfaceSignature='';
  if(tags.length){const tail=v6SurfaceBundle(morph.lemma,morph.morphemes,surfaceBase.glyph);const fused=v6FuseGenerated(surfaceBase,tail,morph.lemma,tags);roman=fused.roman;glyph=fused.glyph;surfaceMode=(surfaceBase.derivationMutations?'mutate+':'')+fused.mode;surfaceSignature=tail.identity||fingerprint128(tail.glyph);}
  return{roman,glyph,type:base.source==='generated'?'generated':base.source,source:raw,lemma:morph.lemma,pos:morph.pos,morphemes:morph.morphemes,role:morph.role,confidence:morph.confidence,familyKey:'lex:'+morph.lemma,surfaceMode,surfaceSignature,derivationMutations:surfaceBase.derivationMutations||0,ambiguityMargin:morph.ambiguityMargin,alternatives:morph.alternatives,ambiguous:morph.ambiguous};
};

function v6NoveltyMetrics(analysis){
  const byLemma=new Map();
  for(const a of analysis||[]){
    if(!a||!a.lemma||!['generated','grammar','custom','canon'].includes(a.type))continue;
    const k=`${a.type}|${a.lemma}`;if(!byLemma.has(k))byLemma.set(k,a);
  }
  const words=[...byLemma.values()].map(a=>graphemes(a.glyph).map(x=>x.toLocaleLowerCase('tr-TR')).filter(x=>GLYPH240_SET.has(x))).filter(x=>x.length);
  const gram=new Map();let total2=0,reused2=0;
  for(const w of words)for(const g of v6Ngrams(w,2)){total2++;gram.set(g,(gram.get(g)||0)+1);}
  for(const n of gram.values())if(n>1)reused2+=n-1;
  let pairSum=0,pairCount=0,maxPair=0;
  const sample=words.slice(0,120);
  for(let i=0;i<sample.length;i++)for(let j=i+1;j<sample.length;j++){
    const A=new Set(v6Ngrams(sample[i],2)),B=new Set(v6Ngrams(sample[j],2));let inter=0;for(const x of A)if(B.has(x))inter++;const uni=A.size+B.size-inter;const s=uni?inter/uni:0;pairSum+=s;pairCount++;if(s>maxPair)maxPair=s;
  }
  const sigs=(analysis||[]).map(a=>a.surfaceSignature).filter(Boolean),uniqSig=new Set(sigs).size;
  const ngramReuse=total2?reused2/total2:0,meanPair=pairCount?pairSum/pairCount:0,surfaceReuse=sigs.length?1-uniqSig/sigs.length:0;
  const score=Math.max(0,1-(ngramReuse*0.48+meanPair*0.32+surfaceReuse*0.20));
  return{score,ngramReuse,meanPairSimilarity:meanPair,maxPairSimilarity:maxPair,surfaceReuse,lexemes:words.length};
}

const __translateTextV5Polymorph = translateText;
translateText = function(input,mode='auto'){
  const r=__translateTextV5Polymorph(input,mode),nm=v6NoveltyMetrics(r.analysis||[]);
  r.stats.noveltyScore=nm.score;r.stats.ngramReuse=nm.ngramReuse;r.stats.meanPairSimilarity=nm.meanPairSimilarity;r.stats.maxPairSimilarity=nm.maxPairSimilarity;r.stats.surfaceReuse=nm.surfaceReuse;r.stats.noveltyLexemes=nm.lexemes;
  if(nm.score<0.86)r.warnings.push(`Özgünlük puanı ${(nm.score*100).toFixed(1)}%; yüksek tekrar varsa kanonik sözlüğe alınan eski biçimleri kontrol et.`);
  // Rebuild lock after POLYMORPH metrics/output path is final.
  r.lock=buildLock(String(input??''),r);r.stats.compileSignature=r.lock.compileSignature;return r;
};


// ============================================================
// UI
// ============================================================
// Meggy headless bridge: Tavern yalnız kanonik dönüşüm çekirdeğini kullanır.
// Kaynak uygulamanın bütün motor kodu yukarıda aynen korunur; kendi bağımsız
// arayüzü bu preload içinde çalıştırılmaz.
window.__ALEK_LORE_LANGUAGE__=Object.freeze({
  version:APP_VERSION,
  edition:ENGINE_EDITION,
  loreCoreVersion:LANGUAGE_CORE_VERSION,
  alphabetSize:GLYPH240.length,
  alphabet:Object.freeze([...GLYPH240]),
  translate(source,mode='turkish'){
    const input=String(source??'');
    if(!input.trim())return Object.freeze({source:input,roman:'',glyph:'',fingerprint:'',stats:Object.freeze({glyph240Distinct:0})});
    const result=translateText(input,mode==='roman'?'roman':'turkish');
    return Object.freeze({
      source:input,
      roman:String(result.roman||''),
      glyph:String(result.glyph||''),
      fingerprint:String(result.stats?.compileSignature||result.stats?.fingerprint||''),
      stats:Object.freeze({...result.stats})
    });
  }
});
try{window.dispatchEvent(new CustomEvent('alek:lore-language-ready',{detail:{version:APP_VERSION,alphabetSize:GLYPH240.length}}));}catch(_){ }
return;

loadState();

document.documentElement.style.background='#05070b';
document.body.innerHTML = `
<style>
  :root{--bg:#05070b;--panel:#0a1019;--panel2:#0d1622;--line:#233a56;--text:#eaf4ff;--muted:#8ba5bf;--cyan:#70c8ff;--gold:#e7c77d;--danger:#ff8d8d;--ok:#8fe3b1;--violet:#c6a7ff}
  *{box-sizing:border-box} body{margin:0;padding:0!important;background:radial-gradient(circle at 75% -20%,#0d3156 0,#08111d 25%,#05070b 62%);color:var(--text);font-family:'Segoe UI','Noto Sans',Arial,sans-serif;min-height:100vh;overflow:auto}
  button,input,select,textarea{font:inherit}.app{max-width:1720px;margin:0 auto;padding:20px}.top{display:flex;gap:18px;align-items:center;margin-bottom:14px}.sigil{width:58px;height:58px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#dbf5ff 0,#79caff 12%,#2879b8 36%,#09223d 68%,#02060b 72%);box-shadow:0 0 28px #3da7ff88,0 0 70px #246aa744}.title h1{margin:0;font-size:24px;letter-spacing:.4px}.title p{margin:4px 0 0;color:var(--muted)}.badge{margin-left:auto;border:1px solid var(--line);background:#07101a;padding:8px 12px;border-radius:999px;color:var(--cyan);font-size:12px}.apex{color:var(--gold);font-weight:700}
  .tabs{display:flex;gap:5px;border-bottom:1px solid var(--line);margin-bottom:14px;overflow:auto}.tab{white-space:nowrap;border:0;background:transparent;color:var(--muted);padding:10px 13px;cursor:pointer;border-bottom:2px solid transparent}.tab.active{color:var(--text);border-color:var(--cyan)}.view{display:none}.view.active{display:block}
  .toolbar{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-bottom:10px}.toolbar label{color:var(--muted);font-size:12px}.control{background:#08111b;color:var(--text);border:1px solid var(--line);border-radius:8px;padding:8px 9px}.btn{border:1px solid #2b5277;background:linear-gradient(#123250,#0c2237);color:#eaf7ff;padding:8px 12px;border-radius:8px;cursor:pointer}.btn:hover{filter:brightness(1.15)}.btn.gold{border-color:#745d31;background:linear-gradient(#443719,#28200e);color:#ffe7aa}.btn.ghost{background:#080d13;border-color:#263747;color:#a9bdd0}.btn.danger{border-color:#713535;background:#351818;color:#ffc0c0}.btn.ok{border-color:#356b50;background:#163425;color:#bfffd5}
  .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}.pane{background:linear-gradient(180deg,#0b121c,#080e15);border:1px solid var(--line);border-radius:12px;overflow:hidden;min-height:500px}.paneHead{height:42px;display:flex;align-items:center;padding:0 11px;border-bottom:1px solid var(--line);background:#0c1622;font-weight:600}.paneHead span{margin-left:auto;color:var(--muted);font-size:12px;font-weight:400}.text{width:100%;height:455px;resize:vertical;border:0;outline:none;background:transparent;color:var(--text);padding:13px;line-height:1.55;font-family:'Segoe UI','Noto Sans',Consolas,sans-serif}.glyphText{font-size:17px;letter-spacing:.2px}
  .status{margin-top:10px;background:#07101a;border:1px solid var(--line);border-radius:10px;padding:9px 11px;color:var(--muted);font-size:12px;display:flex;gap:8px;flex-wrap:wrap}.chip{padding:4px 8px;background:#0e1c2a;border-radius:999px}.chip b{color:var(--text)}.chip.gold{color:#ffe3a0}.chip.warn{color:#ffb1a8}
  .metrics{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:9px}.metric{background:#08111a;border:1px solid #1b3045;border-radius:9px;padding:9px}.metric .k{font-size:11px;color:var(--muted)}.metric .v{font-size:16px;margin-top:3px;color:#fff}.metric code{font-size:11px;color:#9fd8ff}.warnings{margin-top:8px;color:#ffc7a7;font-size:12px}
  .card{background:#09111a;border:1px solid var(--line);border-radius:12px;padding:15px;margin-bottom:11px}.card h3{margin:0 0 11px;font-size:16px}.row{display:flex;gap:9px;align-items:center;flex-wrap:wrap}.row input{min-width:190px;flex:1}.hint{font-size:12px;color:var(--muted);line-height:1.55}.dictionary{max-height:550px;overflow:auto;border:1px solid var(--line);border-radius:10px}.drow{display:grid;grid-template-columns:1.15fr 1fr 1fr auto;gap:9px;padding:8px 9px;border-bottom:1px solid #172637;align-items:center}.drow:last-child{border:0}.drow code{color:#cbeaff;overflow-wrap:anywhere}.drow .g{font-size:16px;color:#f1f6ff}.tag{font-size:10px;color:var(--gold)}
  .analysis{max-height:560px;overflow:auto}.arow{display:grid;grid-template-columns:1fr 1fr 1fr 110px;gap:9px;padding:7px 8px;border-bottom:1px solid #18283a;font-size:12px}.arow code{overflow-wrap:anywhere}.good{color:var(--ok)}.warn{color:var(--gold)}.bad{color:var(--danger)}
  .lettergrid{display:grid;grid-template-columns:repeat(8,minmax(125px,1fr));gap:6px}.lettercell{display:grid;grid-template-columns:32px 38px 1fr;align-items:center;gap:6px;padding:6px 7px;border:1px solid #1d3147;border-radius:8px;background:#07101a}.lettercell .n{color:#6888a5;font-size:10px}.lettercell .g{font-size:20px;text-align:center}.lettercell code{color:#bfe6ff;overflow-wrap:anywhere;font-size:11px}
  .batchlog,.testlog{white-space:pre-wrap;font-family:Consolas,monospace;background:#050a10;border:1px solid var(--line);border-radius:10px;padding:11px;min-height:230px;color:#bcd0e3}.spec{line-height:1.65;color:#c8d6e4}.spec code{color:#8ed4ff}.spec h3{color:#fff;margin-top:20px}.genrow{display:grid;grid-template-columns:1fr 1fr 1fr 65px auto;gap:8px;padding:7px;border-bottom:1px solid #18283a;align-items:center;font-size:12px}.pill{border:1px solid #31485f;border-radius:999px;padding:2px 7px;color:#a9c7df;font-size:10px}
  @media(max-width:1250px){.grid3{grid-template-columns:1fr}.pane{min-height:330px}.text{height:290px}.metrics{grid-template-columns:repeat(3,1fr)}.lettergrid{grid-template-columns:repeat(4,minmax(120px,1fr))}.badge{display:none}}
</style>
<div class='app'>
  <div class='top'><div class='sigil'></div><div class='title'><h1>Aꬲæŀɇꞎʏł’Qʏħʉŷɍɨř Language Engine <span class='apex'>POLYMORPH</span></h1><p>Tek yönlü deterministik dil derleyicisi · Anti-Pattern Forge → Polimorfik Morfoloji → SIR/2 → 240 bağımsız glif · Lore v17 kilitli</p></div><div class='badge'>v${APP_VERSION} · Lore ${LANGUAGE_CORE_VERSION} · Morph ${MORPHOLOGY_VERSION}</div><button class='btn danger' id='exitBtn'>Kapat</button></div>
  <div class='tabs'>
    <button class='tab active' data-view='translate'>Çeviri</button><button class='tab' data-view='batch'>Toplu / Korpus</button><button class='tab' data-view='dict'>Kanon Sözlüğü</button><button class='tab' data-view='generated'>Üretilen Sözlük</button><button class='tab' data-view='analysis'>Morfoloji / SIR</button><button class='tab' data-view='families'>Kelime Aileleri</button><button class='tab' data-view='letters'>240 Harf</button><button class='tab' data-view='health'>Kanon Sağlığı</button><button class='tab' data-view='diagnostics'>Tanılama</button><button class='tab' data-view='rules'>Kurallar</button>
  </div>

  <section class='view active' id='view-translate'>
    <div class='toolbar'>
      <label>Girdi</label><select id='mode' class='control'><option value='auto'>Otomatik</option><option value='turkish'>Türkçe</option><option value='roman'>Romanizasyon</option></select>
      <label>Bilinmeyen kök</label><select id='unknown' class='control'><option value='synthesize'>240 harften matematiksel üret</option><option value='phonetic'>Fonetik alıntı</option><option value='mark'>İşaretle</option></select>
      <label><input type='checkbox' id='canonLock' checked> Kanon Kilidi</label><label><input type='checkbox' id='preserveMd' checked> Markdown koru</label><label>Özel ad</label><select id='properPolicy' class='control'><option value='phonetic'>Telaffuzu koru</option><option value='synthesize'>240 harften üret</option><option value='preserve'>Dokunma</option></select><label><input type='checkbox' id='strictMorph' checked> Sıkı morfoloji</label><label><input type='checkbox' id='autoTranslate'> Canlı çeviri</label>
      <button class='btn gold' id='translateBtn'>ÇEVİR</button><button class='btn ghost' id='clearBtn'>Temizle</button><button class='btn' id='saveBtn'>Kaydet</button>
    </div>
    <div class='grid3'>
      <div class='pane'><div class='paneHead'>Türkçe / Latin Girdi<span>Ctrl+Enter</span></div><textarea id='input' class='text' spellcheck='false' placeholder='Lore metnini buraya yapıştır...'></textarea></div>
      <div class='pane'><div class='paneHead'>Latin / Okuma Aktarımı<span><button class='btn ghost' id='copyRoman' style='padding:4px 8px'>Kopyala</button></span></div><textarea id='romanOut' class='text' readonly></textarea></div>
      <div class='pane'><div class='paneHead'>Yerel 240-Glif Yazımı<span><button class='btn ghost' id='copyGlyph' style='padding:4px 8px'>Kopyala</button></span></div><textarea id='glyphOut' class='text glyphText' readonly></textarea></div>
    </div>
    <div class='status' id='status'><span class='chip'>Hazır.</span></div><div class='metrics' id='metrics'></div><div class='warnings' id='warnings'></div>
  </section>

  <section class='view' id='view-batch'>
    <div class='card'><h3>Toplu Korpus Derleyicisi</h3><p class='hint'>Input altındaki .md/.txt dosyalarını alt klasörleriyle tarar; kaynaklara dokunmadan morfoloji+korpus analizi yapar ve Output altında <code>.okuma</code> ve <code>.glif</code> sürümleri üretir. Her çalışmada manifest yazılır.</p><div class='row'><label>Girdi</label><input class='control' id='inputFolder' value='Input'><label>Çıktı</label><input class='control' id='outputFolder' value='Output'><label><input type='checkbox' id='batchDry'> Yalnız analiz</label><button class='btn gold' id='batchBtn'>KORPUSU DERLE</button></div></div><div class='batchlog' id='batchLog'>Bekleniyor…</div>
  </section>

  <section class='view' id='view-dict'>
    <div class='card'><h3>Özel Kanonik Sözlük</h3><p class='hint'>v6 sözlük kaydı üç şeyi birlikte dondurur: <b>kaynak + okunuş + gerçek glif</b>. Kanon Kilidi açıkken Lore v17 kayıtlarının üstüne yazılamaz.</p>
      <div class='row'><input class='control' id='dictSource' placeholder='Türkçe/Latin kaynak'><input class='control' id='dictRoman' placeholder='Sabit okunuş'><input class='control' id='dictGlyph' placeholder='Gerçek glif'><button class='btn' id='dictGenerate'>240’tan Üret</button><button class='btn gold' id='dictAdd'>Kanonlaştır</button><button class='btn ghost' id='dictExport'>Dışa Aktar</button><button class='btn ghost' id='dictImport'>Diskten Yenile</button></div><div class='hint' id='dictPreview' style='margin-top:8px'></div>
    </div><div class='row' style='margin-bottom:9px'><input class='control' id='dictSearch' placeholder='Sözlükte ara...'></div><div class='dictionary' id='dictList'></div>
  </section>

  <section class='view' id='view-generated'><div class='card'><h3>Oturumda Matematiksel Üretilen Kökler</h3><p class='hint'>Buradaki bir sözcüğü beğendiğinde <b>Kanonlaştır</b> diyerek gerçek glif dizisini özel sözlüğe kilitleyebilirsin. Sonraki sürümlerde bile sözlük kaydı değişmez.</p><div class='row'><input class='control' id='genSearch' placeholder='Üretilen köklerde ara...'><button class='btn ghost' id='genExport'>Snapshot Yaz</button></div><div class='dictionary' id='generatedList' style='margin-top:9px'></div></div></section>

  <section class='view' id='view-analysis'><div class='card'><h3>Morfoloji + Semantik Ara Yapı (SIR)</h3><p class='hint'>Kaynak biçim → lemma → sözcük türü → morfem zinciri → semantik rol → çıktı. Bu katman AI kullanmaz.</p><div class='analysis' id='analysisList'></div></div></section>

  <section class='view' id='view-families'><div class='card'><h3>Kelime Ailesi Laboratuvarı</h3><p class='hint'>Aynı Türkçe lemma aynı yerel kimliği taşır; yapım/çekim farkları sabit ortak ekler yerine lemma-özgü polimorfik yüzeylere dönüşür. Böylece <code>güç / güçlü / güçsüz / güçlenmek / güçlendirmek</code> beş alakasız hash sözcüğü olmaz.</p><div class='row'><input class='control' id='familyInput' value='güç' placeholder='Türkçe kök'><button class='btn gold' id='familyBtn'>AİLEYİ ÜRET</button></div><div class='dictionary' id='familyList' style='margin-top:10px'></div></div></section>

  <section class='view' id='view-letters'><div class='card'><h3>240 Bağımsız Harf</h3><div class='row'><input class='control' id='letterSearch' placeholder='Glif / okuma / sıra ara...'></div><p class='hint'>Her satır tek bir bağımsız harftir. Okuma değeri yalnız erişilebilirlik katmanıdır; kelime üretim kalıbı değildir.</p><div class='lettergrid' id='letterGrid'></div></div></section>


  <section class='view' id='view-health'><div class='card'><h3>Kanon Sağlığı + Build Lock</h3><p class='hint'>Kanon alias çakışmaları, sözlük gölgelemesi, SIR/2 belirsizlikleri ve son derlemenin yeniden üretilebilir Build Lock imzasını gösterir.</p><div class='row'><button class='btn gold' id='healthBtn'>TAM KONTROL</button><button class='btn' id='lockBtn'>BUILD LOCK YAZ</button></div></div><div class='testlog' id='healthLog'>Kontrol bekleniyor…</div></section>

  <section class='view' id='view-diagnostics'><div class='card'><h3>POLYMORPH Öz-Test, Özgünlük ve Tutarlılık Laboratuvarı</h3><p class='hint'>Motor kendi alfabe bütünlüğünü, deterministikliği, Lore v17 kanonunu, Markdown korumasını ve 240-harf dağılımını test eder.</p><div class='row'><button class='btn gold' id='selfTestBtn'>TAM ÖZ-TEST</button><button class='btn' id='snapshotBtn'>Motor Snapshot Yaz</button></div></div><div class='testlog' id='testLog'>Test bekleniyor…</div></section>

  <section class='view' id='view-rules'><div class='card spec'>
    <h3>1. Tek Yönlü Mimari</h3><p><code>Türkçe/Latin → Okuma Aktarımı → Yerel Glif</code>. Ters çeviri bilinçli olarak yoktur.</p>
    <h3>2. Lore v17 Kanon Kilidi</h3><p>24 halk, v17 karakter adları, hanedan, gemi, takvim ve yerleşmiş sistem terimleri doğrudan Lore v17’den gelir. Özel sözlük varsayılan olarak bunların üstüne yazamaz.</p>
    <h3>3. 240 Bağımsız Harf</h3><p>Matematiksel üretimde her pozisyon doğrudan 240 harften seçilir. Aeth/Naer türü üretken hece ailesi, başlangıç/orta/son bankası, ünlü-ünsüz şablonu veya komşuluk yasağı yoktur. Aynı harf tekrar edebilir.</p>
    <h3>4. Sözlük Dondurma</h3><p>Bir matematiksel kelime kanonlaştırıldığında hem okunuşu hem gerçek glif dizisi saklanır. Okunuştan glifi yeniden tahmin etmeye çalışılmaz.</p>
    <h3>5. Türkçe Morfoloji</h3><p>Türkçe sözcükler sonlu-durum benzeri morfoloji çözümlemesiyle lemma + yapım/çekim morfemlerine ayrılır. Ünsüz yumuşaması gibi yaygın yüzey değişimleri aile kökünü korumak için geri çözülür. Motor yapay zekâ değil, kurallı derleyicidir.</p>
    <h3>6. Semantik Ara Yapı</h3><p>Her sözcük için lemma, POS, morfem özellikleri, semantik rol ve köken kaydıyla <code>Alekrythae-SIR/1</code> düğümü üretilir. Çeviri bu ara yapının izlenebilir çıktısıdır.</p><h3>7. Polimorfik Kelime Aileleri</h3><p>Lemma tek bir kök kimliği taşır; ancak çekim/yapım dönüşümleri evrensel sabit ekler damgalamaz. Görünür yüzey, <b>lemma + bütün özellik demeti</b> üzerinden özgün bir allomorf olarak türetilir ve köke kuyruk, iç-ek, sarma veya dokuma biçimlerinden biriyle deterministik kaynaşır. Yapım morfolojisinde ayrıca kökün 1–3 glifi lemma-özgü biçimde değişebilir; çekimlerde kök daha güçlü korunur.</p><h3>7A. Anti-Tekrar Yasası</h3><p>Her yeni kök için 32 bağımsız 240-glif aday üretilir. Motor; kendi içindeki tekrarları, kanonik büyükram/trigram izlerini, ortak başlangıç/son dokularını ve romanizasyon tekrarlarını puanlayıp en düşük tekrar izine sahip adayı seçer. Hiçbir harf yasaklanmaz; sistem desen dayatmak yerine istatistiksel tekrar baskısını azaltır.</p><h3>8. Markdown Güvenliği</h3><p>Front matter, kod blokları, inline code, URL, HTML, wiki-link hedefleri, Markdown link hedefleri ve dosya yolları korunur.</p>
    <h3>9. Sürüm Sabitleme</h3><p>Çıktı parmak izi; Engine, Lore Core ve sözlük ile birlikte kaydedilebilir. Aynı sürüm + aynı sözlük + aynı girdi aynı çıktıyı üretir.</p>
    <h3>10. Morfoloji Kafesi</h3><p>Tek bir çözüm sessizce seçilmez; en güçlü alternatifler güven farkıyla tutulur. Düşük marjlı biçimler SIR/2 belirsizlik kuyruğuna düşer.</p><h3>11. SIR/2 Cümle Grafiği</h3><p>Hâl eklerinden nesne, hedef, kaynak, konum ve araç ilişkileri; yüklem ve olası özne bağları izlenebilir grafik olarak çıkarılır. Kaynak kelime sırası korunur çünkü Alekrythae için henüz ayrı kanonik cümle dizilimi tanımlanmamıştır.</p><h3>12. Build Lock</h3><p>Engine, Lore, gramer, morfoloji, sözlük, girdi ve üç çıktının fingerprintleri tek compile signature altında dondurulur.</p><h3>13. .alek</h3><p>Tek dosya uygulama olarak çalışır; Input/Output/LanguageData köprüleri mevcut Meggy Core .alek API’leri üzerinden kullanılır.</p>
  </div></section>
</div>`;

// Runtime diagnostics: Core loads .alek as an ES module. Surface any post-parse failure visibly.
window.addEventListener('error', (ev)=>{
  try { console.error('POLYMORPH runtime error:', ev.error||ev.message); } catch(_) {}
});
window.addEventListener('unhandledrejection', (ev)=>{
  try { console.error('POLYMORPH rejected promise:', ev.reason); } catch(_) {}
});

// ============================================================
// UI BEHAVIOR · POLYMORPH
// ============================================================
const $ = id => document.getElementById(id);
$('mode').value=state.settings.mode; $('unknown').value=state.settings.unknown; $('preserveMd').checked=state.settings.preserveMarkdown; $('canonLock').checked=state.settings.canonLock; $('autoTranslate').checked=state.settings.autoTranslate; $('properPolicy').value=state.settings.properPolicy||'phonetic'; $('strictMorph').checked=state.settings.strictMorph!==false;
function syncSettings(){state.settings.mode=$('mode').value;state.settings.unknown=$('unknown').value;state.settings.preserveMarkdown=$('preserveMd').checked;state.settings.canonLock=$('canonLock').checked;state.settings.autoTranslate=$('autoTranslate').checked;state.settings.properPolicy=$('properPolicy').value;state.settings.strictMorph=$('strictMorph').checked;persist();}

function pct(x){return `${(100*(x||0)).toFixed(1)}%`;}
function setStatus(r){
  const s=r.stats;
  $('status').innerHTML=[`Kanon <b>${s.canon}</b>`,`Özel <b>${s.custom}</b>`,`Gramer <b>${s.grammar}</b>`,`Dönüşüm <b>${s.suffix}</b>`,`Üretilen <b>${s.generated}</b>`,`Glif <b>${s.glyph240Distinct}/240</b>`,`Özgünlük <b>${pct(s.noveltyScore??1)}</b>`,`Belirsiz <b>${s.ambiguities||0}</b>`,`Build <b>${(s.compileSignature||s.fingerprint).slice(0,16)}…</b>`].map(x=>`<span class='chip'>${x}</span>`).join('');
  $('metrics').innerHTML=[['Kanon Kapsama',pct(s.canonCoverage)],['Yeni Sözlük',pct(s.generatedShare)],['Özgünlük',pct(s.noveltyScore??1)],['N-gram Tekrarı',pct(s.ngramReuse||0)],['Ort. Benzerlik',pct(s.meanPairSimilarity||0)],['Yüzey Tekrarı',pct(s.surfaceReuse||0)],['240-Glif',String(s.glyph240Distinct)+'/240'],['SIR/2 Belirsizlik',String(s.ambiguities||0)]].map(([k,v])=>`<div class='metric'><div class='k'>${k}</div><div class='v'>${v}</div></div>`).join('');
  $('warnings').innerHTML=(r.warnings||[]).map(x=>`⚠ ${esc(x)}`).join('<br>');
}
function runTranslate(){syncSettings();const r=translateText($('input').value,state.settings.mode);state.lastResult=r;$('romanOut').value=r.roman;$('glyphOut').value=r.glyph;setStatus(r);renderAnalysis();renderGenerated();return r;}
$('translateBtn').onclick=runTranslate;
$('input').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();runTranslate();} if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='c'){e.preventDefault();copyText($('glyphOut').value);}});
let autoTimer=null;$('input').addEventListener('input',()=>{if(!$('autoTranslate').checked)return;clearTimeout(autoTimer);autoTimer=setTimeout(runTranslate,250);});
$('clearBtn').onclick=()=>{$('input').value='';$('romanOut').value='';$('glyphOut').value='';state.lastResult=null;$('status').innerHTML="<span class='chip'>Hazır.</span>";$('metrics').innerHTML='';$('warnings').innerHTML='';renderAnalysis();};
for(const id of ['mode','unknown','preserveMd','canonLock','autoTranslate']) $(id).addEventListener('change',syncSettings);
async function copyText(text){try{await navigator.clipboard.writeText(text);}catch(e){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();}}
$('copyRoman').onclick=()=>copyText($('romanOut').value);$('copyGlyph').onclick=()=>copyText($('glyphOut').value);
$('exitBtn').onclick=async()=>{try{if(window.__alekAPI) await window.__alekAPI('app.exit',{}); else window.close();}catch(e){window.close();}};
window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveTranslation();}});

async function saveTranslation(){
  if(!state.lastResult) runTranslate(); if(!window.__alekWriteText){alert('Core dosya köprüsü bulunamadı.');return;}
  const stamp=new Date().toISOString().replace(/[:.]/g,'-'); const path=`Output/Translation-${stamp}.md`;const r=state.lastResult;
  const content=`# Aꬲæŀɇꞎʏł’Qʏħʉŷɍɨř Language Engine TRANSCENDENCE\n\n- Engine: ${APP_VERSION}\n- Lore Core: ${LANGUAGE_CORE_VERSION}\n- Grammar: ${GRAMMAR_VERSION}\n- Fingerprint: ${r.stats.fingerprint}
- Compile Signature: ${r.lock?.compileSignature||'-'}
- Dictionary Fingerprint: ${r.stats.dictionaryFingerprint||'-'}\n\n## Latin / Okuma\n\n${r.roman}\n\n## Yerel Glif\n\n${r.glyph}\n`;
  const res=await window.__alekWriteText(path,content);alert(res&&res.ok?`Kaydedildi: ${path}`:`Kaydedilemedi: ${(res&&res.error)||'bilinmeyen hata'}`);
}
$('saveBtn').onclick=saveTranslation;

// Tabs
function activateTab(name){document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===name));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id==='view-'+name));if(name==='dict')renderDictionary();if(name==='analysis')renderAnalysis();if(name==='letters')renderLetters();if(name==='generated')renderGenerated();if(name==='families')renderFamily();if(name==='health')renderHealth();}
document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>activateTab(btn.dataset.view));

// Dictionary
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function canonKeyExists(source){return aliasMap.has(normTR(source))||romanKnown.has(normTR(source));}
function renderDictionary(){
  const q=normTR($('dictSearch').value||''); const rows=[];
  for(const [roman,glyph,aliases] of CANON_ENTRIES) rows.push({source:aliases[0]||roman,roman,glyph,type:'LORE v17'});
  for(const [source,v] of Object.entries(state.custom)){const e=normalizeCustomEntry(v);rows.unshift({source,roman:e.roman,glyph:e.glyph,type:'ÖZEL'});}
  const filtered=rows.filter(r=>!q||normTR(r.source+' '+r.roman+' '+r.glyph).includes(q));
  $('dictList').innerHTML=filtered.map(r=>`<div class='drow'><code>${esc(r.source)}</code><code>${esc(r.roman)}</code><div class='g'>${esc(r.glyph)}</div><div class='tag'>${r.type}${r.type==='ÖZEL'?` <button class='btn danger deldict' data-key='${esc(r.source)}' style='padding:3px 6px'>×</button>`:''}</div></div>`).join('')||"<div class='hint' style='padding:14px'>Sonuç yok.</div>";
  document.querySelectorAll('.deldict').forEach(b=>b.onclick=()=>{delete state.custom[normTR(b.dataset.key)];persist();renderDictionary();});
}
$('dictSearch').oninput=renderDictionary;
function updateDictPreview(){$('dictPreview').textContent=$('dictGlyph').value?`Kilitlenecek glif: ${$('dictGlyph').value}`:($('dictRoman').value?`Eski transliteratör tahmini: ${romanToGlyph($('dictRoman').value)}`:'');}
$('dictRoman').oninput=updateDictPreview;$('dictGlyph').oninput=updateDictPreview;
$('dictGenerate').onclick=()=>{const src=normTR($('dictSource').value);if(!src){alert('Önce kaynak kelimeyi yaz.');return;}const x=synthLexeme(src);$('dictRoman').value=x.roman;$('dictGlyph').value=x.glyph;updateDictPreview();};
$('dictAdd').onclick=()=>{const src=normTR($('dictSource').value),rom=$('dictRoman').value.trim(),glyph=$('dictGlyph').value.trim();if(!src||!rom||!glyph){alert('Kaynak, okunuş ve gerçek glif gerekli.');return;}if(state.settings.canonLock&&canonKeyExists(src)){alert('Kanon Kilidi: Lore v17 kaydının üstüne yazılamaz.');return;}state.custom[src]={roman:rom,glyph,lemma:src,pos:'unknown',domain:'custom',status:'canon',version:APP_VERSION,aliases:[],note:'SINGULARITY özel kanon'};persist();$('dictSource').value='';$('dictRoman').value='';$('dictGlyph').value='';updateDictPreview();renderDictionary();};
$('dictExport').onclick=async()=>{if(!window.__alekWriteJson){alert('Core JSON köprüsü bulunamadı.');return;}const payload={schema:DICTIONARY_SCHEMA,engine:APP_VERSION,lore:LANGUAGE_CORE_VERSION,morphology:MORPHOLOGY_VERSION,entries:state.custom};const r=await window.__alekWriteJson('LanguageData/custom_dictionary.json',payload);alert(r&&r.ok?'custom_dictionary.json yazıldı.':'Dışa aktarma başarısız.');};
async function importDictionary(){if(!window.__alekReadText)return;const r=await window.__alekReadText('LanguageData/custom_dictionary.json');if(!r||!r.ok)return;try{const obj=JSON.parse(r.content);const entries=obj.entries||obj;for(const [k,v] of Object.entries(entries||{})){if(state.settings.canonLock&&canonKeyExists(k))continue;state.custom[normTR(k)]=normalizeCustomEntry(v);}persist();renderDictionary();}catch(e){alert('Sözlük JSON okunamadı: '+e.message);}}
$('dictImport').onclick=importDictionary;

// Generated lexicon
function renderGenerated(){const q=normTR(($('genSearch')&&$('genSearch').value)||'');const rows=Array.from(state.generatedUsage.values()).sort((a,b)=>b.count-a.count||a.source.localeCompare(b.source,'tr'));const f=rows.filter(x=>!q||normTR(x.source+' '+x.roman+' '+x.glyph).includes(q));$('generatedList').innerHTML=f.map(x=>`<div class='genrow'><code>${esc(x.source)}</code><code>${esc(x.roman)}</code><div class='g'>${esc(x.glyph)}</div><span class='pill'>×${x.count}</span><button class='btn ok promote' data-source='${esc(x.source)}'>Kanonlaştır</button></div>`).join('')||"<div class='hint' style='padding:14px'>Bu oturumda matematiksel kök üretilmedi.</div>";document.querySelectorAll('.promote').forEach(b=>b.onclick=()=>{const x=state.generatedUsage.get(b.dataset.source);if(!x)return;if(state.settings.canonLock&&canonKeyExists(x.source)){alert('Bu kaynak zaten Lore kanonunda.');return;}state.custom[normTR(x.source)]={roman:x.roman,glyph:x.glyph,lemma:x.source,pos:x.pos||'unknown',domain:'generated',status:'canon',version:APP_VERSION,aliases:[],note:'Üretilen sözlükten kanonlaştırıldı'};persist();renderDictionary();alert(`${x.source} özel sözlüğe kilitlendi.`);});}
$('genSearch').oninput=renderGenerated;
$('genExport').onclick=async()=>{if(!window.__alekWriteJson)return;const entries=Object.fromEntries(Array.from(state.generatedUsage.entries()));const r=await window.__alekWriteJson('LanguageData/generated_lexicon_snapshot.json',{engine:APP_VERSION,lore:LANGUAGE_CORE_VERSION,entries});alert(r&&r.ok?'Snapshot yazıldı.':'Snapshot yazılamadı.');};

// 240 letters
function renderLetters(){const q=normTR(($('letterSearch')&&$('letterSearch').value)||'');$('letterGrid').innerHTML=GLYPH240.map((g,i)=>({g,i,r:GLYPH240_READING[i]})).filter(x=>!q||normTR(`${x.i+1} ${x.g} ${x.r}`).includes(q)).map(x=>`<div class='lettercell'><span class='n'>${String(x.i+1).padStart(3,'0')}</span><span class='g'>${esc(x.g)}</span><code>${esc(x.r)}</code></div>`).join('');}
$('letterSearch').oninput=renderLetters;

// Analysis
function renderAnalysis(){if(!state.lastResult){$('analysisList').innerHTML="<div class='hint'>Henüz çeviri yok.</div>";return;}const nodes=state.lastResult.ir?.nodes||[];const rows=nodes.slice(0,500);$('analysisList').innerHTML=rows.map(n=>{const amb=n.ambiguity?.ambiguous?` ⚠${(n.ambiguity.alternatives||[]).length}`:'';const feats=(n.features||[]).join('+')||'kök';return `<div class='arow' title='${esc(feats)}'><code>${esc(n.source||'')}</code><code>${esc(n.lemma||'')}</code><code>${esc(n.output?.glyph||'')}</code><span class='${n.ambiguity?.ambiguous?'warn':'good'}'>${esc(n.pos||'')}${amb}</span></div>`;}).join('')+(nodes.length>500?`<div class='hint' style='padding:10px'>İlk 500 düğüm gösteriliyor.</div>`:'');}


function renderFamily(){
  if(!$('familyList'))return;const src=normTR(($('familyInput')&&$('familyInput').value)||'güç');
  const examples=[src,src+'lü',src+'süz',src+'lenmek',src+'lendirmek',src+'ler',src+'den'];
  const rows=examples.map(w=>{const st={canon:0,custom:0,grammar:0,generated:0,loan:0,unknown:0,roman:0,local:0,suffix:0,phrases:0,proper:0,morphAnalyzed:0,morphConfidenceSum:0};const r=translateTurkishWord(w,st);return{w,r};});
  $('familyList').innerHTML=rows.map(({w,r})=>`<div class='drow'><code>${esc(w)}</code><code>${esc(r.lemma||'')}</code><code>${esc((r.morphemes||[]).map(x=>x.tag).join('+')||'kök')}</code><div class='g'>${esc(r.glyph)}</div></div>`).join('');
}
if($('familyBtn'))$('familyBtn').onclick=renderFamily;if($('familyInput'))$('familyInput').oninput=()=>{};

// Recursive batch
async function collectFilesRecursive(path, depth=0){if(depth>10)return[];const r=await window.__alekList(path);if(!r||!r.ok)return[];let out=[];for(const it of (r.items||[])){const full=`${path}/${it.name}`;if(it.type==='file'&&/\.(md|txt)$/i.test(it.name))out.push({path:full,name:it.name,rel:full});else if(['dir','directory','folder'].includes(it.type))out=out.concat(await collectFilesRecursive(full,depth+1));}return out;}
$('batchBtn').onclick=async()=>{const log=[],$log=$('batchLog'),write=x=>{log.push(x);$log.textContent=log.join('\n');};if(!window.__alekList||!window.__alekReadText){write('Core dosya köprüsü bulunamadı.');return;}syncSettings();const inp=$('inputFolder').value.trim()||'Input',outRoot=$('outputFolder').value.trim()||'Output',dry=$('batchDry').checked;write(`Korpus taranıyor: ${inp}`);let files=await collectFilesRecursive(inp);if(!files.length){write('Çevrilecek .md/.txt bulunamadı.');return;}let ok=0;const manifest=[],results=[];for(const f of files){const rd=await window.__alekReadText(f.path);if(!rd||!rd.ok){write(`OKUNAMADI: ${f.path}`);continue;}const r=translateText(rd.content,state.settings.mode==='roman'?'auto':state.settings.mode);results.push(r);const rel=f.path.slice(inp.length).replace(/^\//,'');const ext=rel.match(/\.[^.]+$/)?.[0]||'.txt',base=rel.slice(0,-ext.length);const p1=`${outRoot}/${base}.okuma${ext}`,p2=`${outRoot}/${base}.glif${ext}`,p3=`${outRoot}/${base}.sir.json`;let wrote=true;if(!dry){const w1=await window.__alekWriteText(p1,r.roman),w2=await window.__alekWriteText(p2,r.glyph),w3=window.__alekWriteJson?await window.__alekWriteJson(p3,r.ir):await window.__alekWriteText(p3,JSON.stringify(r.ir,null,2));wrote=!!(w1&&w1.ok&&w2&&w2.ok&&w3&&w3.ok);}manifest.push({source:f.path,roman:p1,glyph:p2,sir:p3,fingerprint:r.stats.fingerprint,stats:r.stats});if(wrote){ok++;write(`✓ ${rel}  [${r.stats.fingerprint.slice(0,16)}…]`);}else write(`YAZMA HATASI: ${rel}`);}const corpus=corpusAggregateV5(results);const man={schema:6,engine:APP_VERSION,edition:ENGINE_EDITION,lore:LANGUAGE_CORE_VERSION,grammar:GRAMMAR_VERSION,morphology:MORPHOLOGY_VERSION,synthesis:SYNTHESIS_SCHEMA,dryRun:dry,created:new Date().toISOString(),files:manifest,corpusSummary:{tokens:corpus.tokens,canonCoverage:corpus.canonCoverage,generatedShare:corpus.generatedShare}};if(!dry){if(window.__alekWriteJson){await window.__alekWriteJson(`${outRoot}/POLYMORPH-manifest.json`,man);await window.__alekWriteJson(`${outRoot}/POLYMORPH-corpus-priority.json`,corpus);}else{await window.__alekWriteText(`${outRoot}/POLYMORPH-manifest.json`,JSON.stringify(man,null,2));await window.__alekWriteText(`${outRoot}/POLYMORPH-corpus-priority.json`,JSON.stringify(corpus,null,2));}}write(`\nBitti: ${ok}/${files.length}. Token: ${corpus.tokens}. Kanon: ${(corpus.canonCoverage*100).toFixed(1)}%. Yeni sözlük: ${(corpus.generatedShare*100).toFixed(1)}%.`);if(!dry)write(`Manifest + korpus öncelik listesi: ${outRoot}`);renderGenerated();};


function renderHealth(){
  if(!$('healthLog'))return;const h=canonHealth(),r=state.lastResult;const lines=[];
  lines.push(`Kanon kayıtları: ${h.canonCount}`);lines.push(`Özel sözlük: ${h.customCount}`);lines.push(`Sözlük fingerprint: ${h.dictionaryFingerprint}`);lines.push(`Engine fingerprint: ${engineFingerprint()}`);
  if(r){lines.push(`Son Build Lock: ${r.lock?.compileSignature||'-'}`);lines.push(`SIR/2: ${r.validation?.ok?'OK':'HATA'} · Belirsizlik: ${r.ir?.ambiguities?.length||0}`);}
  lines.push('');if(!h.issues.length)lines.push('✓ Kanon alias/glif tablosunda kritik çakışma yok.');else for(const x of h.issues)lines.push(`${x.severity==='error'?'✗':'⚠'} ${x.type}: ${JSON.stringify(x)}`);
  if(r?.ir?.ambiguities?.length){lines.push('\nMORFOLOJİ BELİRSİZLİK KUYRUĞU');for(const a of r.ir.ambiguities.slice(0,30))lines.push(`⚠ ${a.source} → ${a.chosen} | alternatif: ${(a.alternatives||[]).map(x=>x.lemma+' '+x.features.join('+')).join(' ; ')}`);}
  $('healthLog').textContent=lines.join('\n');
}
if($('healthBtn'))$('healthBtn').onclick=renderHealth;
if($('lockBtn'))$('lockBtn').onclick=async()=>{if(!state.lastResult)runTranslate();if(!window.__alekWriteJson){alert('Core JSON köprüsü bulunamadı.');return;}const r=await window.__alekWriteJson('LanguageData/POLYMORPH-build.lock.json',state.lastResult.lock);alert(r&&r.ok?'Build Lock yazıldı.':'Build Lock yazılamadı.');};

// Diagnostics
function assertTest(cond,name,rows){rows.push(`${cond?'✓':'✗'} ${name}`);return !!cond;}
function runSelfTests(){const rows=[];let pass=0,total=0;const T=(c,n)=>{total++;if(assertTest(c,n,rows))pass++;};T(GLYPH240.length===240,'Alfabe tam 240 harf');T(new Set(GLYPH240).size===240,'240 harfin tamamı benzersiz');T(GLYPH240_READING.length===240,'240 sabit okuma değeri mevcut');const a=synthLexeme('mekanizma'),b=synthLexeme('mekanizma');T(a.glyph===b.glyph&&a.roman===b.roman,'V6 anti-pattern lexeme sentezi deterministik');T(findExactPhrase('insan')?.glyph==='Ħǽɱ’Ŧʏǽɍŋ','Lore v17 Hæm’Tyærn kilidi');T(findExactPhrase('AF')?.glyph==='Ȧꬲṙɏƒẘ’Łǽîɳ','AF v17 kanonik adı');T(findExactPhrase('MV')?.glyph==='Ɱǽɬ’Ʋǽṙɏɳ','MV v17 kanonik adı');const md='---\ntitle: Test\n---\n`kod` https://example.com **metin**';const pr=protectMarkdown(md);T(restoreMarkdown(pr.text,pr.slots)===md,'Markdown koruma geri dönüşü kayıpsız');T(translateText('A̤ɐ͜ɨǣ́ꞎ͡ƣ','auto').glyph==='A̤ɐ͜ɨǣ́ꞎ͡ƣ','A̤ɐ͜ɨǣ́ꞎ͡ƣ parçalanmıyor');const fam=['güç','güçlü','güçsüz','güçlenmek','güçlendirmek'].map(analyzeTurkishMorphology);T(fam.every(x=>x.lemma==='güç'),'Kelime ailesi: güç/güçlü/güçsüz/güçlenmek/güçlendirmek → güç');T(analyzeTurkishMorphology('kitabı').lemma==='kitap','Ünsüz yumuşaması geri çözümü: kitabı → kitap');T(analyzeTurkishMorphology('ağacı').lemma==='ağaç','Ünsüz yumuşaması geri çözümü: ağacı → ağaç');T(analyzeTurkishMorphology('kraliçe').lemma==='kraliçe','Tek ünlü sonlu kök yanlış dative parçalanmıyor');const q=translateText('Güçlü savaşçı gemilerden kaleye gidecek.','turkish');T(q.ir&&q.ir.schema===IR_SCHEMA,'SIR/2 Semantik Ara Yapı üretiliyor');T(q.ir.graphs&&q.ir.graphs.length>=1,'SIR/2 cümle grafiği üretiliyor');T(q.validation&&q.validation.ok,'SIR/2 doğrulaması temiz');T(q.lock&&q.lock.compileSignature.length===32,'Build Lock compile signature üretildi');T(q.stats.fingerprint.length===32,'128-bit çıktı fingerprint üretildi');const seen=new Set(),used=new Set();let collisions=0;for(let i=0;i<20000;i++){const x=synthLexeme('öztest-kelime-'+i);if(seen.has(x.glyph))collisions++;seen.add(x.glyph);for(const ch of graphemes(x.glyph))if(GLYPH240_SET.has(ch))used.add(ch);}T(used.size===240,`20.000 örnekte 240/240 glif kullanıldı (${used.size}/240)`);T(collisions===0,`20.000 örnekte glif çakışması yok (${collisions})`);const p1=translateText('gemiler gemilerden gemilere gemide','turkish');const surfaces=p1.analysis.filter(x=>x.lemma==='gemi').map(x=>x.glyph);T(new Set(surfaces).size===surfaces.length,'Polimorfik dönüşümler aynı sabit eki tekrar etmiyor');T(!surfaces.some(x=>x.includes('’')),'Üretilmiş çekimlerde zorunlu apostrof şablonu yok');const nv=translateText('mekanizma gözlemevi mühendis düzenek araştırma gökyüzü kaplumbağa enerji kristal titreşim','turkish');T((nv.stats.noveltyScore||0)>0.82,`Özgünlük puanı yüksek (${((nv.stats.noveltyScore||0)*100).toFixed(1)}%)`);rows.push(`\nSONUÇ: ${pass}/${total} test geçti.`);$('testLog').textContent=rows.join('\n');}
$('selfTestBtn').onclick=runSelfTests;
$('snapshotBtn').onclick=async()=>{const snap={schema:6,engine:APP_VERSION,edition:ENGINE_EDITION,lore:LANGUAGE_CORE_VERSION,grammar:GRAMMAR_VERSION,morphology:MORPHOLOGY_VERSION,dictionarySchema:DICTIONARY_SCHEMA,synthesisSchema:SYNTHESIS_SCHEMA,seed:SYNTHESIS_SEED,lexemeSeed:V6_LEXEME_SEED,candidateCount:V6_CANDIDATES,alphabetCount:GLYPH240.length,canonEntries:CANON_ENTRIES.length,custom:state.custom,settings:state.settings,generated:Object.fromEntries(state.generatedUsage),created:new Date().toISOString()};if(window.__alekWriteJson){const r=await window.__alekWriteJson('LanguageData/POLYMORPH-engine-snapshot.json',snap);alert(r&&r.ok?'POLYMORPH snapshot yazıldı.':'Snapshot yazılamadı.');}else alert('Core JSON köprüsü bulunamadı.');};

async function startupDiskLoad(){try{await importDictionary();}catch(e){}}
$('input').value=`Kraliçe Uykusu sırasında Nature Sense güçlenir.\nAF ve MV, Hæm’Tyærn halkından farklı on iki kökün sezgilerini birlikte kullanabilir.\nRhyirun’Kharûn su hareketini okur; Mæřethi’Solayn biyokimyasal ritmi sezer.\nGüç, güçlü, güçsüz, güçlenmek ve güçlendirmek aynı kelime ailesini paylaşır.\nA̤ɐ͜ɨǣ́ꞎ͡ƣ akışı değişmeden kalır.`;
function __alekPolymorphSafeBoot(){
  try {
    renderDictionary();
    // 240-harf grid is rendered lazily when its tab is opened.
    startupDiskLoad();
    setTimeout(()=>{ try { runTranslate(); } catch(e) { console.error('POLYMORPH initial translate failed:',e); } }, 0);
  } catch(e) {
    console.error('POLYMORPH safe boot failed:',e);
    try {
      const box=document.createElement('div');
      box.style.cssText='position:fixed;inset:20px;z-index:99999;background:#120b0b;color:#ffd7d7;border:1px solid #8b3a3a;padding:18px;border-radius:12px;font-family:Consolas,monospace;white-space:pre-wrap;overflow:auto';
      box.textContent='Alekrythae Language Engine açılış hatası\n\n'+(e&&e.stack?e.stack:String(e));
      document.body.appendChild(box);
    } catch(_) {}
  }
}
setTimeout(__alekPolymorphSafeBoot,0);
})();
