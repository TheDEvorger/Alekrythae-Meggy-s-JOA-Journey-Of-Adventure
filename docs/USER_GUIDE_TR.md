# Ałek’ryŧhæ · Journey of Adventurer + Tavern
## Kullanıcı Kılavuzu — v1.0.0

> **Kapsam:** Bu kılavuz JOA v1.0.0 / mimari revizyon 215 kaynak kodu ve mevcut kullanıcı arayüzü incelenerek hazırlanmıştır.  
> **Core:** Ałek’ryŧhæ Core v2.0.0 hedeflenir.  
> **Paket giriş dosyası:** `Alekrythae.alek`. Manifest ve test referansları bu kararlı adla eşlenmiştir.

---

# 1. JOA nedir?

**Journey of Adventurer + Tavern (JOA)** yalnızca bir harita ekranı değildir. Aynı Adventure içinde:

- karakter, mekân, grup, binek/taşıt ve dünya kartlarını yönetir,
- bunları birbirinin içine yerleştirerek gerçek bir **mevcudat hiyerarşisi** kurar,
- dört farklı dünya katmanında piyonlarla konumlandırır,
- görüş ve keşif alanlarını takip eder,
- rota hazırlayıp oyun zamanı tüketerek seyahat ettirir,
- karakterlerin Can, Mana, Takat ve Metanet kaynaklarını yönetir,
- eşya, takas, verme ve bölme işlemlerini tutar,
- Journal, Görevler ve Yetenekler kayıtlarını saklar,
- Tavern’da karşılaşma ve diyalog günlüğü oluşturur,
- oyun içi zamanı konuşma, seyahat, bekleme ve dinlenmeyle ilerletir,
- Adventure verisini sürümler arası `.alekdata` kasasıyla taşıyabilir,
- yanlışlıkla silinen mevcudatı **Unutulmuşlar Mahzeni** üzerinden geri çağırabilir.

JOA’nın temel fikri şudur: **“Dünyadaki her şey bir kart olabilir; kartlar konumlanabilir, ilişkilendirilebilir, başka kartların içinde yaşayabilir ve zaman içinde değişebilir.”**

---

# 2. Kurulum ve çalıştırma

JOA tek başına bağımsız Windows programı gibi düşünülmemelidir. `.alek` paketi, Ałek’ryŧhæ Core tarafından çalıştırılır.

## 2.1 Dosya düzeni

`.alek` dosyası ile `Alekrythae.App` klasörünü birbirinden ayırma. Modüler JS/CSS kaynakları çalışma sırasında bu klasörden yüklenir.

Örnek:

```text
Alekrythae.alek
Alekrythae.App/
Assets/
Musics/
manifest.json
...
```

## 2.2 Başlatma

İki normal yol vardır:

1. `.alek` dosyasını Ałek’ryŧhæ Core ile açmak.
JOA v1.0.0 paketinde önerilen yol `Alekrythae.alek` dosyasını doğrudan Ałek’ryŧhæ Core v2.0.0 ile açmaktır.

## 2.3 İlk açılış

Uygulama açıldığında Adventure seçme geçidi gelir. Buradan mevcut macerayı açabilir veya yeni Adventure oluşturabilirsin.

Her Adventure kendi kayıt alanına sahiptir. Bir Adventure’daki karakterler, Tavern mesajları, dünya konumları ve diğer oyun durumu başka Adventure’ın kayıtlarıyla karışmaz.

---

# 3. Ana yüzey mantığı

JOA’da dört ana fonksiyon tuşu “yüzey değiştirici” gibi çalışır:

| Tuş | Yüzey |
|---|---|
| **F1** | Mevcudat |
| **F2** | Map |
| **F3** | Assistant · GPT |
| **F4** | Mavi Ay çıkış sahnesi |

## Esc’in önemli kuralı

`Esc` bir “ana menüye dön” tuşu değildir.

Öncelikle açık olan geçici işlemi kapatır veya iptal eder. Örneğin:

- onay penceresi,
- karakter kağıdı,
- taksonomi penceresi,
- tek kullanımlık Mevcudat komutu,
- boya bölgesi çizimi,
- harita yerleştirme,
- seyahat hazırlığı,
- taşınabilir iç konteyner,
- açık palet.

Bu davranış kasıtlıdır; `Esc` bastığında F1/F2/F3 yüzeyi kendiliğinden değişmez.

## Diğer global davranışlar

- **F11:** Core gerçek tam ekranını açıp kapatır.
- **Ctrl + fare tekerleği:** UI/WebView zoomunu değiştirmemesi için engellenmiştir.
- **Tab:** JOA kısayol sözleşmesinde devre dışıdır.
- **` / ' menü değiştirme:** eski davranışlar devre dışıdır.
- **Alt + G:** Ałek’ryŧhæ İmge Paleti’ni açar.
- **Alt + S:** eski runtime kısayolu olarak sessizce tüketilir; kullanıcı işlevi değildir.

---

# 4. Adventure yöneticisi

Adventure, birbirinden bağımsız oyun dünyalarının üst kabıdır.

Yönetici ekranında:

- **Yeni Macera** oluşturabilirsin.
- Bir Adventure kartına tıklayıp açabilirsin.
- Kapak görselini düzenleyebilirsin.
- Adventure adını değiştirebilirsin.
- Adventure silebilirsin.
- Aktif Adventure kartı işaretlenir.

Adventure açılırken Mavi Ay geçiş animasyonu oynatılır. İlk gerekli zaman yapılandırması tamamlanınca kullanıcı geldiği ana yüzeye geri yönlendirilir.

### Adventure kapakları

Adventure özel kapak kullanabilir. Kanonik Ałek’ryŧhæ Adventure’ı paket içi logo/kapak politikasını kullanabilir.

### Bağımsız kayıt

Her Adventure kendi `game.db` verisini ve Adventure’a ait medya alanını kullanabilecek şekilde tasarlanmıştır. Bu nedenle GitHub kaynağı ile kullanıcı oyun kaydı aynı şey değildir.

---

# 5. Mevcudat — dünyanın canlı veri ağacı

**F1**, Mevcudat ana yüzeyini açar.

Mevcudat yalnızca “karakter listesi” değildir. JOA dünyasındaki kartların:

- kim olduğunu,
- kimin/neyin içinde bulunduğunu,
- içindeki alt kartları,
- haritadaki karşılığını,
- kişisel kayıtlarını

bir ağaç düzeninde yönetir.

## 5.1 Temel kontroller

| İşlem | Davranış |
|---|---|
| **K** | Taksonomi / yeni kart oluşturma akışını açar |
| **Sol tık** | Kartın ayrıntısını/kağıdını açar |
| **Sağ tık** | Alt ağacı açar veya kapatır |
| **Sürükle-bırak** | Kartı başka kartın içine taşır veya hiyerarşiyi düzenler |
| **Ctrl + Sol tık** | Çoklu seçim ekler/çıkarır |
| **Ctrl + Alt** | Birikmiş çoklu seçimi temizler |
| **Delete** | Seçili mevcudatı silme/mahzen akışına gönderir |
| **Ctrl + E** | Tek kullanımlık “Map’e yerleştir” komutunu hazırlar; ardından karta tıklanır |
| **Ctrl + F** | Tek kullanımlık “Map’te bul/odakla” komutunu hazırlar; ardından karta tıklanır |
| **Esc** | Hazır komutu veya seçimi iptal eder |

### Çok önemli: eski `E + Sol Tık` bilgisi

v1.0.0 patch’i ile dahili Kısayol Rehberi de güncel **Ctrl + E → karta tıkla** davranışını gösterir. Eski `E + Sol Tık` metni kaldırılmıştır.

## 5.2 Haritadan kaldırmak, silmek değildir

Bir kart üzerindeki **“× Haritadan”** işlemi piyonun Map üzerindeki konumunu kaldırır, fakat Mevcudat kartını silmez.

Bu ayrım önemlidir:

- **Haritadan kaldır:** veri kartı yaşamaya devam eder.
- **Delete / Mahzen:** mevcudat kaydını dünya ağacından kaldırma akışıdır.

## 5.3 İç içe konteyner mantığı

JOA’da ana kartların fiziksel içerik taşıması mümkündür.

Örnekler:

- Karakterin içinde eşya/alt kayıt,
- Mekânın içinde karakterler,
- Geminin içinde mürettebat,
- Grubun içinde karakter ve binekler,
- Bir diyarın içinde yerleşkeler ve başka kartlar.

Kart başka bir konteynerin içine taşındığında Mevcudat hiyerarşisinde onun altına girer. Haritadaki görünürlüğü de konteyner durumuna göre değişebilir.

---

# 6. 24 kartlık Taksonomi Dairesi

JOA dünyayı yalnız “karakter” ve “mekân” olarak sınırlamaz. Taksonomi Dairesi 24 ana kart türü sunar.

## I. Canlılar ve Soylar

1. **Karakter** — bireysel kişi.
2. **Varlık** — insan dışı bireysel yaratık/varlık.
3. **Tür** — biyolojik/kalıtsal köken.
4. **Halk** — kültürel kimlik/topluluk.
5. **Grup** — takım, birlik, mürettebat, sürü veya kervan.
6. **Hanedan** — soy, veraset ve aile kurumu.

## II. Toplumlar ve Düzenler

7. **Cemiyet** — lonca, akademi, şirket, tarikat veya örgüt.
8. **Hükümranlık** — iktidar/yönetim yapısı.
9. **Medeniyet** — çağlara yayılan kültür, bilgi ve miras.
10. **Yerleşke** — köy, şehir, koloni, kamp, istasyon.
11. **Diyar** — bölgesel dünya alanı.
12. **Âlem** — farklı fizik/zaman/gerçeklik düzeni.

## III. Yerler ve Kozmos

13. **Mekân** — oda, mağara, sokak, sahne alanı.
14. **Yapı** — ev, kale, kule, saray, megayapı.
15. **Coğrafya** — dağ, nehir, deniz, çöl, orman vb.
16. **Yaşam Alanı** — biyom veya yapay biyosfer.
17. **Göksel Oluşum** — gezegen, yıldız, uydu, kozmik anomali.
18. **Uçan Ada** — hareket eden/uçan/gezen dünya parçası.

## IV. Nesneler ve Sistemler

19. **Öğe** — izlenebilir genel nesne.
20. **Binek / Taşıt** — at, gemi, araç, uzay taşıtı vb.
21. **Düzenek** — makine, mekanizma, çalışan sistem.
22. **Tesis** — fabrika, laboratuvar, üs, üretim kompleksi.
23. **Kaynak** — su, maden, enerji, besin rezervi vb.
24. **Ağ** — yol, portal, iletişim, enerji ağı.

Taksonomi ekranı kart türlerinin yalnız adını değil, **ne zaman kullanılması gerektiğini, hikâyeye ne kattığını, hangi kartlarla doğal bağ kurduğunu ve ne tür içerik barındırabildiğini** açıklayan rehber metinlerine de sahiptir.

---

# 7. Karakter / Varlık / Mekân kağıtları

Ayrıntı panelinde kullanılabilen ana sekmeler:

- **Kağıt**
- **Çanta**
- **Yetenekler**
- **Journal**
- **Görevler**
- **Mevcudat**

Mekân ve bazı diğer bireysel/kollektif kartlar da uygun olduğunda aynı ortak renderer’lardan yararlanır.

## 7.1 Kimlik

Karakter kimliği içinde ad, unvan, cinsiyet, ırk/köken, görsel ve ilgili anlatı alanları bulunur.

Cinsiyet normalizasyonu:

- Erkek
- Kadın
- Cinsiyetsiz

## 7.2 Irk sistemi

Ałek’ryŧhæ için **24 kanonik ırk** bulunur. Karakter ayrıca:

- kanonik bir ırka bağlanabilir,
- en az iki kökten **Melez** olarak oluşturulabilir,
- “Öte Diyar” kökeniyle serbest dış ırk tanımlayabilir.

Kanonik ırk adları kaynakta özgün Ałek’ryŧhæ yazımıyla saklanır:

`ħǽɱ’Ʋǽɍʏŋ`, `ḓɐꞎ’ʁɨɱ`, `ɵɍʏ’ƙǽŋ`, `ʁʏɨɍʉŋ’χɐɍűŋ`, `þɐꞎɐśś’ɱǿɍʏɴ`, `ɱǽṙɇþɨ’śɵꞎɐʏŋ`, `þɨɍ’ŋɵčŧ`, `ḓɍɐỿ’žűɍχǽɍ`, `ǽþ’Ʋǽɍʏŋ`, `ʐɐṙ’χɐɍžűŋ`, `ɐʉ’ƀɇŋ`, `žɨꞎ’ƙɍɐŧ`, `χɐʉɍ’ǥɐþ`, `ɱʉɵ’ŋþɨɍ`, `ɨśƙǽɬ’Ʋǽɍʏþ`, `ƙɐꞎʏŧɨ’ʏħɍǽ`, `þǽ’ɍʏŋ`, `ŋɇɍǽþ’Ʋǽꞎűŋɐ`, `ǥɵɍűɱ’ɱǽχɍʏþ`, `Ʋɇƙþɐɍ’ŋűɱʏɍ`, `þʏɍɐ’Ʋɇƙűɍʏŋ`, `śʏꞎ’ŋɇþɍǿþ`, `ɐśŧɇɍʏŋ’Ʋɇʏɍχɐ`, `Ʋħɐṙǥǽþ’ɍűŋ`.

## 7.3 Kağıt modülleri

Üç modül karakter bazında ayrı ayrı açılıp kapatılabilir:

- **Class**
- **Stat**
- **Yolculuk ve Yenilenme**

Bir modülü kapatmak o karakter için ilgili alt sistemi pasifleştirir. Özellikle Yolculuk modülü pasifse harita görüşü, seyahat ve kişisel yenilenme sistemi kullanılmaz.

---

# 8. 24 Stat Dairesi

Stat modülü açıldığında 24 temel stat kullanılabilir.

| Küme | Statlar |
|---|---|
| Yapı / dayanıklılık | Dayanım, Denge, Kapasite |
| Fiziksel icra | Kudret, Çeviklik, Hareketlilik |
| Zihin | Kavrayış, Odak, Bellek |
| İrade / kontrol | İrade, Kontrol, Üretkenlik |
| Savunma | Soğurma, Saptırma, Koruma |
| Etki | Etki, İsabet, Erişim |
| Algı | Algı, Hassasiyet, Farkındalık |
| Sosyal/ifade | İfade, Nüfuz, Eşgüdüm |

Varsayılan stat değeri 8’dir. Sistem ek özel alan/stat kayıtlarına da izin verir.

---

# 9. Can, Mana, Takat ve Metanet

JOA’da dört ana kişisel kaynak havuzu vardır:

1. **Can**
2. **Mana / Ałek enerjisi**
3. **Takat**
4. **Metanet**

Bunlar kollektif kartlarda bile kişi başına bağımsız tutulur; bir grubun bütün üyeleri tek ortak Can havuzu paylaşmaz.

## 9.1 Can

Hasar ve iyileşme işlemlerini, maksimum değeri ve doğal saatlik yenilenmeyi takip eder.

## 9.2 Mana

Harcanabilir mana/Arcana rezervi, geri kazanım ve maksimum değer içerir.

## 9.3 Takat

Fiziksel eylem ve seyahat için önemlidir. Takat tamamen tükenirse karakter fiziksel eylem yapamaz. Kağıt, Çanta, Journal, Görevler ve Mevcudat kayıtları yine açılabilir.

## 9.4 Metanet

Uyanık geçirilen oyun zamanında dünya kuralına göre azalabilir. Dinlenme/uyku ile toparlanabilir.

Metanet tamamen çöktüğünde karakter Tavern konuşmasına katılamaz. Metanet **en az %50** seviyesine döndüğünde konuşma yeniden açılır.

## 9.5 Ölüm ve ölümsüzlük

Karakter kağıdında ölümsüzlük ve yaşam/ölüm mühürleri bulunur.

Ölüm mührü uygulandığında:

- karakter ölü durumuna geçer,
- Can, Mana rezervi, Takat ve Metanet sıfırlanır,
- ölüm öncesi değerlerin geri çağırma için saklanabildiği yaşam kaydı korunur.

Ölümsüz/korumalı bazı sistem kartları silme ve mahzen işlemlerinden korunur.

---

# 10. Yolculuk ve yenilenme ayarları

Karakter bazında:

- **Hareket hızı (m/s)**
- **Görüş mesafesi (m)**
- **Can yenilenmesi / saat**
- **Mana yenilenmesi / saat**
- **Takat yenilenmesi / saat**
- **Metanet yenilenmesi / saat**

değerleri ayarlanabilir.

Bunlar yalnız süs bilgi değildir; Map’in görüş/keşif ve zaman motoru davranışında kullanılır.

---

# 11. Çanta ve eşya sistemi

Çanta sistemi 24 kanonik eşya sınıfı içerir:

**Silah, Zırh, Alet, Mühimmat, Giysi, Aksesuar, Muhafaza, Erzak, İçecek, İlaç, İksir, Malzeme, Cevher, Bitki, Bileşen, Cihaz, Anahtar, Belge, Kitap, Harita, Para, Mücevher, Artefakt, Diğer.**

Her türün kendine ait fantastik mühür görseli vardır.

## 11.1 Eşya işlemleri

- Yeni eşya oluşturma
- Eşyayı düzenleme
- Miktar tutma
- Eşyayı atma/silme
- Birden fazla eşyayı seçme
- **Ver:** karşılıksız başka hedefe aktarma
- **Takas:** iki tarafın seçilen eşyalarını değiştirme
- **Böl:** miktarı 1’den büyük tek bir yığını ikiye ayırma

Çanta işlem modlarında:

- `Space` sonraki/onay adımına ilerler.
- `Esc` işlemi iptal eder.

Ver/Takas hedefi Mevcudat üzerinden başka uygun **Karakter veya Mekân** olarak seçilebilir.

---

# 12. Yetenekler

Yetenek sekmesi karaktere özel beceri kayıtları tutar.

Desteklenen davranışlar arasında:

- kategori yapısı,
- yeni yetenek ekleme,
- ad ve açıklama düzenleme,
- EXP değeri,
- yetenek görseli ekleme/değiştirme/kaldırma,
- yeteneği düzenleme kilidiyle koruma

bulunur.

Bu kayıtlar karakter kağıdının kalıcı parçasıdır.

---

# 13. Journal ve Görevler

## Journal

Journal için varsayılan geniş kategori aileleri bulunur:

- Kişisel Notlar
- Keşifler
- Lore ve Tarih

Kullanıcı yeni ana kategori ve alt kategori oluşturabilir.

Her kayıt:

- başlık,
- lore/not metni,
- alt maddeler/checklist,
- tarih,
- kategori

tutabilir.

## Görevler

Görev sistemi ayrıntılı FRP kategori şablonlarıyla gelir. Örnek ana aileler:

- Yolculuğun Çağrısı
- Kahramanın Ağıtı
- Ebedi Yeminler
- Melezlerin Meyveleri
- Yoldaş ve Kan Bağı
- Lonca ve Cemiyet
- Diyarımın Dört Bir Yanı
- Karanlık ve Yasaklı
- Engin Sular ve Rüzgârlı Yelken
- Örs, Ticaret ve Sikke

Ana/alt kategori eklenebilir; görev içine ayrı maddeler/checklist eklenebilir.

---

# 14. Map — yaşayan dünya yüzeyi

**F2**, Map’i açar.

JOA Map dört ayrı dünya katmanına sahiptir:

| Tuş | Katman |
|---|---|
| **1** | Yerküre / Surface |
| **2** | Uçan Ada / Sky |
| **3** | Yeraltı / Underground |
| **4** | Kozmik Ada / Cosmic |

Katmanların kamera/dünya durumu birbirinden ayrıdır.

## 14.1 Piyon boyutları

Arayüzde temel boyut sözleşmesi:

- Karakter: **1 × 1 m**
- Grup: **3 × 3 m**
- Mekân: **5 × 5 m**

## 14.2 Temel Map kontrolleri

- **Sol tık:** piyon seçimi / dünya etkileşimi.
- **Çift tık:** piyon sabitleme veya serbest bırakma.
- **Orta tuş + sürükle:** haritayı kaydırma.
- **Fare tekerleği:** zoom.
- **Ctrl + tekerlek:** UI zoomu olmadığı için etkisiz.
- **F basılı + hedef:** odak/focus davranışı.
- **K:** yeni Mekân oluşturur ve yerleştirme akışını başlatır.
- **G:** bağımsız Seyahat Grubu oluşturur.
- **T:** Vakit Ocağı’nı açar.
- **B:** karşılaşma başlatır.
- **S:** seyahat modunu açar/kapatır.
- **Space:** hazırlanmış seyahat rotalarını çalıştırır.
- **E basılı:** “hedef konteynerin içine gir” değiştiricisi.
- **Ctrl + E:** Mevcudat’a geçip tek kullanımlık yerleştirme komutunu hazırlar.
- **Ctrl + F:** Mevcudat’a geçip tek kullanımlık bul/odakla komutunu hazırlar.
- **Delete:** uygun seçili harita öğesini kaldırma/silme akışını çalıştırır.
- **Esc:** o anda aktif en üst harita işlemini iptal eder.

---

# 15. Keşif, görüş ve sis

Map’te görüş yalnız dekoratif değildir.

Karakterlerin **Görüş Mesafesi**:

- keşfedilmiş alanların oluşmasına,
- harita sisinin açılmasına,
- hareket boyunca yeni bölgenin görünür hâle gelmesine

katkı sağlar.

Keşif alanları kalıcı dünya durumu olarak saklanabilir. Böylece görülen ve görülmeyen dünya arasında ayrım yapılır.

Karakterin Yolculuk modülü kapalıysa görüş üretmemesi amaçlanmıştır.

---

# 16. Harita seyahati

Seyahat sistemi “piyonu anında teleport et” mantığından daha kapsamlıdır.

Genel akış:

1. `S` ile seyahat modunu aç.
2. Seyahat edecek piyon/üyeleri ve rota/hedefi hazırla.
3. Gerekirse `E` değiştiricisiyle hedef kartın **içine giriş** niyeti ver.
4. Birden fazla hazır rota oluşturulabilir.
5. `Space` ile hazır seyahatleri başlat.

Seyahat:

- karakter hareket hızını kullanır,
- mesafeyi hesaba katar,
- Takat tüketimiyle etkileşir,
- oyun zamanını ilerletir,
- görüş/keşif alanını güncelleyebilir.

`Esc`, aktif/hazır seyahati iptal etmek için öncelikli kapıdır.

---

# 17. Seyahat Grupları

`G` ile haritada bağımsız bir **Seyahat Grubu** oluşturulabilir.

Grup:

- birden fazla mevcudatı birlikte hareket ettirmeye,
- grup içeriğini taşınabilir konteyner olarak görmeye,
- toplu seyahat yürütmeye

yarar.

Önemli etkileşimler:

- **Orta tık:** piyonun/seyahat grubunun İç Konteynerler görünümünü açabilir.
- **Sağ tık:** bağımsız Seyahat Grubunu dağıtabilir.
- İç listede uygun öğeye **sağ tık:** içteki mevcudatı taşıyıcının yaklaşık çevresine çıkarabilir.

---

# 18. İç Konteynerler

Map’te bir piyonun “içinde ne var?” sorusunun ayrı yüzeyi vardır.

Örneğin:

- bir geminin yolcuları,
- bir grubun üyeleri,
- bir mekânın içindeki karakterler,
- bir karakter/taşıyıcının alt kartları

taşınabilir İç Konteynerler penceresinde gösterilebilir.

Bu pencere Map’ten çıkmadan içeriği yönetmeyi kolaylaştırır.

---

# 19. Kartografya / Boya Paleti

Bu, mevcut dahili Kısayol Rehberi’nde neredeyse hiç anlatılmayan en büyük özelliklerden biridir.

## 19.1 Paleti açma

**Shift tuşuna kısa dokun** ve bırak. Uzun modifier kullanımı değil, kısa tap algılanır.

## 19.2 Palet kısayolları

Palet açıkken:

- **F:** Boya
- **E:** Silgi
- **A:** Damlalık / haritadan renk al
- **Ctrl + Z:** Son boya işlemini geri al

## 19.3 24 fırça

Mevcut kaynakta 24 fırça tanımı vardır:

1. Sert Kare
2. Sert Daire
3. Sert Elmas
4. Artı Uç
5. Yumuşak Daire
6. Yumuşak Kare
7. İnce Sprey
8. Geniş Sprey
9. Seyrek Tram
10. Yoğun Tram
11. Yatay Tarama
12. Kaba Serpinti
13. İnce Keski
14. Geniş Keski
15. Saydam Yıkama
16. Yumuşak Geniş
17. İnce Gren
18. Dağınık Nokta
19. Çapraz Tarama
20. Hava Fırçası
21. Bulanıklaştır
22. Çok Yumuşak
23. Kontur Ucu
24. Dolu Blok

## 19.4 Fırça ayarları

Palet; kullanılan araca göre şu değerleri yönetebilir:

- renk,
- hue,
- saturation,
- lightness,
- opacity,
- fırça boyutu,
- yumuşaklık.

Palet açıkken harita üzerinde **Alt + sol sürükleme** fırça boyutunu, **Alt + sağ sürükleme** yumuşaklığı hızlı ayarlamak için kullanılır.

## 19.5 Bölge ve katman sistemi

Kartografya yalnız tek raster yüzey değildir.

- Bölgeler oluşturulabilir.
- Bölgeye sınır çizilebilir.
- Bölge sınırı bir köşeden karşı köşeye sürüklenerek belirlenir.
- Katmanlar bölgelere taşınabilir.
- Katman/bölge sırası sürüklenerek değiştirilebilir.
- Görünürlük ayrı ayrı kapatılabilir.
- Aktif katman seçilebilir.
- Bölge dışına yeni boya eklenmesi engellenebilir.

## 19.6 Resim katmanları

Haritaya dış görsel eklenebilir ve bir resim katmanına bağlanabilir.

Resim:

- konumlandırılabilir,
- sürüklenebilir,
- boyutlandırılabilir,
- görünürlükle gizlenebilir,
- kilitlenebilir,
- kilidi açıldıktan sonra kaldırılabilir.

“Resmi kaldır” kaynak fotoğraf dosyasını silmez; harita katmanından bağlantıyı kaldırır.

---

# 20. Vakit Ocağı ve oyun zamanı

`T`, **Vakit Ocağı · Dinlenme ve Zaman Atlama** penceresini açar.

JOA zamanı gerçek dünya saatine otomatik bağlı değildir; ana progression **action-driven** yapıdadır.

Kanonik Ałek’ryŧhæ zaman ölçeği:

- **24 oyun saniyesi = 1 oyun dakikası**
- **240 dakika = 1 saat**
- **36 saat = 1 gün**
- **24 gün = 1 ay**
- **24 ay = 1 yıl**

## Dinlenme türleri

### Bekleme
- Can ×1
- Mana ×1
- Takat ×0
- Metanet yenilenmesi ×0
- uyanık Metanet azalması devam eder.

### İlk Yardım
- Can ×1,75
- Mana ×1,10
- Takat ×0
- Metanet yenilenmesi ×0
- uyanık Metanet azalması devam eder.

### Kamp Kurma
- Can ×2,25
- Mana ×1,75
- Takat ×1,15
- Metanet ×1,60
- uyku sırasında sabit Metanet azalması durur.

### Yatak / Han
- Can ×3
- Mana ×2,50
- Takat ×1,60
- Metanet ×2,00
- en güçlü doğal toparlanma modudur.

Gün, saat ve dakika girilerek zaman ilerletilebilir.

---

# 21. Tavern

Tavern, JOA’nın karşılaşma/diyalog sahnesidir.

## 21.1 Karşılaşma başlatma

Map’te **B** ile yeni encounter/karşılaşma başlatılabilir. Uygun seçili katılımcılar Tavern sahnesine taşınır.

Mevcudat üzerindeki **Konuşma Mührü** de bir karakteri Tavern konuşmacısı yapmaya yarar.

## 21.2 Konuşma

Tavern’da:

- ortadaki yazı alanına konuşma/anlatım/sahne hareketi yazılır,
- Meggy küresine tıklarsan metin Meggy adına gönderilir,
- sağdaki konuşmacıya tıklarsan o karakter adına gönderilir,
- konuşmacıya sağ tıklarsan sahneden çıkarılır.

### Oyun zamanı ve konuşma

Karakter konuşmaları metin uzunluğuna göre yaklaşık konuşma süresi hesaplayarak oyun zamanını ilerletebilir.

**Meggy konuşmaları “vakit dışı”dır**, oyun zamanını ilerletmez.

Yalnız görsel iletisinde de “vakit geçmez” davranışı vardır.

## 21.3 Metanet kapısı

Metaneti çökmüş karakter konuşamaz. Metanet %50 veya üstüne çıktığında Tavern konuşması yeniden açılır.

## 21.4 Tavern görselleri

Mesaja görsel eklenebilir.

- Yazı alanında **G** görsel seçimini açar.
- Yazı alanında normal `G` harfi yazman gerektiğinde **Shift + G** kullanımı görsel komutu olarak ayrılmıştır.
- Görsel önizlemeden kaldırılabilir.
- Gönderilmiş görsel büyütülebilir.

## 21.5 Mesaj geçmişi

Mesajlar seçili oyun gününe bağlı saklanır.

Mesaj:

- konuşmacı,
- metin,
- lore/glyph dönüşümü,
- görsel,
- tahmini süre

bilgilerini taşıyabilir.

Mesaj silme korumalı onay/parola akışından geçer.

---

# 22. Assistant · GPT

**F3**, JOA içindeki Assistant yüzeyini açar.

Bu yüzey normal HTML iframe gibi davranmak yerine Core’un SafeAI/native pencere köprüsüyle çalışacak şekilde tasarlanmıştır. Core özelliği kullanılamıyorsa uygulama hata/fallback ekranı gösterebilir.

Assistant oyun kayıtlarının otomatik sahibi değildir; JOA içinden ayrı bir yardımcı yüzeydir.

---

# 23. Unutulmuşlar Mahzeni

Üst yardımcı araçlardaki **◌** simgesi Unutulmuşlar Mahzeni’ni açar.

Delete ile kaldırılan uygun mevcudat, doğrudan geri döndürülemez biçimde yok edilmek yerine bir **geri çağrılabilir batch** olarak Mahzen’e taşınabilir.

Bir kök kart Mahzen’e gönderildiğinde altındaki mevcudat da birlikte mühürlenebilir.

Mahzende:

- **Geri Çağır:** batch’i tekrar dünyaya döndürür.
- **Sonsuza Sil:** geri dönüşsüz temizleme akışını başlatır.

Özel/kanonik/ölümsüz veya undeletable kayıtlar Mahzen’e gönderilmekten korunabilir.

### Not

Eski bazı ekran metinlerinde “Q + tık” seçimi yazsa da güncel JoA Mevcudat yüzeyinde çoklu seçim **Ctrl + sol tık** üzerinden yürür. Bu da mevcut yardım metinlerinin tamamının tek sürümde senkron olmadığını gösteren bir örnektir.

---

# 24. `.alekdata` Veri Kasası

Üst araçlarda:

- **↥ Dışarı Aktar**
- **↧ İçeri Aktar**

bulunur.

## Dışarı Aktarma

Açık Adventure önce kaydedilir. Ardından oyun verisi sürümden bağımsız `.alekdata` kasasına aktarılabilir.

## İçeri Aktarma

Native Core veri geçidi mevcutsa sistem aşağıdaki eski/yeni kaynakları tanımak üzere tasarlanmıştır:

- `.alekdata`
- eski Meggy `.zip` paketleri
- `meggy.db`
- `game.db`
- eski `.json` kayıtları

İçe aktarma sırasında:

1. mevcut veri önce yedeklenir,
2. eski şema güncel veri katmanına uyarlanır,
3. ad/klasör çakışmalarında güvenli yeni kopya oluşturulabilir,
4. işlem tamamlanınca uygulama yeni veriyi açmak için yenilenebilir.

Portable JSON fallback paketlerinde dosya boyutu ve **SHA-256 bütünlük kontrolü** yapılır; güvensiz `../` yolları reddedilir.

---

# 25. Otomatik kayıt

JOA birçok düzenleme için gecikmeli otomatik kayıt kullanır.

Bunun pratik sonucu:

- her küçük alan değişiminde ayrı “Kaydet” aramak gerekmez,
- Adventure geçişi/veri aktarımı gibi kritik noktalarda kayıt zorlanır,
- veri import sırasında otomatik kayıt geçici olarak kilitlenir.

Uygulamayı Windows’tan zorla öldürmek yerine normal **F4 → Mavi Ay** çıkış akışını kullanmak daha güvenli çalışma alışkanlığıdır.

---

# 26. Mavi Ay çıkışı

**F4**, doğrudan “kapat” değildir.

Bir Mavi Ay veda sahnesi açar.

- `Esc`: çıkışı iptal eder.
- Mavi Ay’a tıklama / Enter / Space: final çıkışını onaylar.
- Final animasyonu tamamlandığında Core’a `app.exit` gönderilir.

Bu tasarım yanlışlıkla F4’e basıldığında oyunun anında kapanmasını engeller.

---

# 27. Ałek’ryŧhæ İmge Paleti

**Alt + G** ile İmge Paleti açılır.

Bu panel yazı alanlarına:

- glif,
- simge,
- Ałek’ryŧhæ alfabesi/işaretleri,
- adlandırılmış özel semboller

eklemek için kullanılabilir.

Panel sürüklenebilir ve açık/konum durumu saklanabilir.

Bu özellik özellikle Journal, görev, lore ve diğer serbest metin alanlarında işe yarar.

---

# 28. Lore Language Engine — paket içindeki gelişmiş dil motoru

`lore-language.module.js` paket açılışında pre-load edilen gerçek bir modüldür. Kaynakta:

- Latin/roman/glyph dönüşümleri,
- 240 işaretlik alfabe altyapısı,
- sözlük,
- üretilmiş lexicon,
- kelime ailesi analizi,
- batch `.md/.txt` dönüştürme,
- özel sözlük içe/dışa aktarma,
- snapshot/manifest üretme,
- kopyalama ve kaydetme akışları

bulunur.

Ancak **v1.0.0’ın ana F1/F2/F3 yüzeylerinde tam bağımsız bir “Dil Motoru” giriş düğmesi açıkça sunulmuyor**. Bu nedenle bu kılavuzda “pakette etkin modül” olarak belgelenir fakat ana oyun akışının zorunlu yüzeyi sayılmaz.

---

# 29. Kodda bulunan fakat v1.0.0 ana yüzeyinde ön planda olmayan sistemler

Kaynak kodda daha eski/geniş Ałek’ryŧhæ çalışma alanlarından kalan gelişmiş sistemler de bulunur:

- Lore arşiv/ağaç editörleri,
- Reverie hikâye kayıtları,
- Tide of Aia ilişki/bağ çalışma alanı,
- eski Cartographer çalışma masası,
- Harmonizer / ambiance / Bard medya yönetimi,
- Voiceforge / RVC ses deney araçları,
- harita kütüphanesi ve eski çizim çalışma alanları.

**Önemli:** Bunların kodda bulunması, JOA v1.0.0’ın mevcut ana yüzeyinde hepsinin kullanıcıya erişilebilir olduğu anlamına gelmez. v1.0.0 ana navigasyonu F1 Mevcudat, F2 Map, F3 Assistant, Tavern ve yardımcı araçlara odaklanmıştır. Bu nedenle bu sistemler “legacy/embedded” olarak değerlendirilmelidir; kullanıcı rehberinde aktif ana özelliklerle karıştırılmamalıdır.

---

# 30. Dahili Kısayol Rehberi şu anda güncel mi?

**Evet. v1.0.0 release patch’i ile ana komutlar güncel davranışlarla eşlendi.**

Dahili Komuta Atlası artık özet olarak şunları kapsar:

- F1 / F2 / F3 / F4 ve F11,
- Esc ve Ctrl + tekerlek davranışı,
- Alt + G İmge Paleti,
- Mevcudat’ta Ctrl + E / Ctrl + F, Ctrl + sol tık, Ctrl + Alt ve Delete,
- Map katmanları 1–4, focus, pin, İç Konteynerler ve haritadan kaldırma,
- S / E / Space seyahat akışı, G Seyahat Grubu, T Vakit Ocağı ve B Encounter,
- kısa Shift ile Kartografya Paleti, A/F/E araçları, Ctrl + Z ve hızlı fırça ayarları,
- karakter kaynakları, Çanta Ver/Takas/Böl, Journal/Görevler/Yetenekler,
- Tavern, Metanet konuşma kapısı, veri kasası ve Mahzen özetleri.

Dahili rehber kasıtlı olarak **hızlı komuta atlası** olarak tutulur. 24 Taksonomi türünün tamamı, 24 fırçanın adları, ayrıntılı zaman katsayıları, veri göçü kuralları ve sistemlerin davranış açıklamaları bu tam User Guide’da bulunur.

---

# 31. Dahili rehber ile tam User Guide arasındaki görev ayrımı

Uygulama içindeki rehber, oyun sırasında hızla bakılacak kısa komut kartıdır. GitHub’daki bu dosya ise ayrıntılı referanstır. Yeni bir kısayol veya kullanıcıya açık davranış değiştiğinde kod, dahili `SHORTCUT_GUIDE_SECTIONS` ve iki User Guide aynı release içinde birlikte güncellenmelidir.

---

# 32. Hızlı kısayol özeti

| Kısayol | İşlev |
|---|---|
| F1 | Mevcudat |
| F2 | Map |
| F3 | Assistant |
| F4 | Mavi Ay çıkışı |
| F11 | Core tam ekran |
| Esc | Geçici üst işlemi iptal/kapat |
| Alt+G | İmge Paleti |
| Ctrl+E | Mevcudat üzerinden Map’e yerleştir |
| Ctrl+F | Mevcudat üzerinden Map’te bul |
| Ctrl+Alt | JoA çoklu seçimini temizle |
| 1 / 2 / 3 / 4 | Map katmanları |
| F basılı | Map focus |
| K | Mevcudat: kart oluştur / Map: Mekân oluştur |
| G | Seyahat Grubu |
| T | Vakit Ocağı |
| B | Encounter |
| S | Seyahat modu |
| E basılı | Hedef konteynerin içine girme niyeti |
| Space | Hazır seyahati çalıştır / çanta akışında ilerle |
| Delete | Seçili mevcudat işlemi |
| Kısa Shift | Kartografya Paleti |
| A (palet) | Damlalık |
| F (palet) | Boya |
| E (palet) | Silgi |
| Ctrl+Z (palet) | Boya geri al |
| Orta tuş + sürükle | Map pan |
| Tekerlek | Map zoom |
| Çift tık piyon | Sabitle/serbest |
| Orta tık piyon | İç Konteynerler |
| Ctrl+sol tık kart | Çoklu seçim |

---

# 33. Sorun giderme

## F1/F2/F3/F4 çalışmıyor

Önünde “hard modal” veya onay penceresi olabilir. Önce `Esc` ile üst pencereyi kapat.

## Ctrl+E yaptım ama hiçbir şey olmadı

Ctrl+E bir **tek kullanımlık komut** hazırlar. Sonra Mevcudat kartına tıklaman gerekir. `Esc` komutu iptal eder.

## Kart Map’te yok ama silinmemiş

Kart başka bir konteynerin içinde olabilir veya yalnızca “Haritadan kaldırılmış” olabilir. F1 → Ctrl+F ile kartı bulmayı dene, sonra Ctrl+E ile yeniden yerleştir.

## Karakter Tavern’da konuşamıyor

Metanet tamamen çökmüş olabilir. Metanet en az %50’ye gelince konuşma yeniden açılır.

## Takat sıfır

Fiziksel eylemler kilitlenebilir. `T` ile Kamp veya Yatak/Han dinlenmesi kullan.

## Boya yapamıyorum

Shift’e kısa dokunarak paleti aç, aktif bölge/katman görünürlüğünü kontrol et ve boya aracını seç.

## Resim katmanını taşıyamıyorum

Katman aktif değil veya görsel kilitli olabilir. İlgili resim katmanını aktif et ve kilidi aç.

## Import sonrası görünüm değişmedi

Veri geçidi tamamlandıktan sonra uygulama yeni veriyi açmak için bir kez yenilenebilir.

## Core olmadan F3 / dosya seçme / veri kasası sınırlı

Bazı native özellikler Core köprüsüne bağlıdır. Browser benzetimi tüm Windows/WebView2 davranışlarını temsil etmez.

---

# 34. Kılavuzun bakım kuralı

Yeni release çıkarırken şu dört alan birlikte güncellenmelidir:

1. `manifest.json` sürümü ve `entry`
2. GitHub `USER_GUIDE_TR.md`
3. GitHub `USER_GUIDE_EN.md`
4. Uygulama içindeki `SHORTCUT_GUIDE_SECTIONS`

Yeni bir kısayol eklenip yalnız koda yazılırsa, mevcut durumda olduğu gibi rehber birkaç release sonra geride kalır.

---

**Belge sürümü:** JOA v1.0.0 Guide Revision 1  
**Amaç:** Gerçek v1.0.0 kaynak kodunda kullanıcı tarafından erişilebilen davranışları belgelemek; kodda duran fakat ana yüzeyde sunulmayan legacy sistemleri ayrı işaretlemek.
