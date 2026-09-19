# Takat barı asset klasörü

Bu klasör yalnız **Takat** kaynağına aittir. Takat artık `skill/` klasörünü ödünç kullanmaz.

Dosya adı biçimi:

```text
TK-GÖRÜNÜRLÜK-SANİYE[-VARYANT].png
```

Örnekler:

```text
TK-100-12.png
TK-75-8.png
TK-50-4.png
TK-25-2.png
TK-25-2-02.png
```

- `GÖRÜNÜRLÜK`: `0–100` arası katman opaklığıdır.
- `SANİYE`: Bir tam akış turunun süresidir; sayı küçüldükçe katman hızlanır.
- `VARYANT`: İsteğe bağlıdır; aynı görünürlük ve hızda birden fazla doku eklemeyi sağlar.
- PNG/WebP görsel yatay hazırlanır; dikey Takat barında renderer görseli otomatik çevirir.

Dosyaları değiştirdikten sonra paket kökündeki `RESOURCE_BAR_INDEX_GUNCELLE.ps1` çalıştırılmalıdır.
