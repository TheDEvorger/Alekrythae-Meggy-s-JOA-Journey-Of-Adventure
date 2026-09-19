# Ałek’ryŧhæ JOA v1.0.0 — Dahili Rehber / Built-in Guide Audit

## Sonuç / Result

**TR:** v1.0.0 release patch’i ile dahili `Kısayol Rehberi / Komuta Atlası` güncellendi. Eski `E + Sol Tık` metni kaldırıldı; modern Mevcudat, Map, seyahat, kartografya, Tavern/zaman ve veri-kurtarma komutları eklendi.

**EN:** The v1.0.0 release patch updates the built-in `Shortcut Guide / Command Atlas`. The stale `E + Left Click` wording is removed and modern Mevcudat, Map, travel, cartography, Tavern/time and data-recovery commands are included.

---

## Doğru kalan maddeler / Still-valid items

- F1 Mevcudat
- F2 Map
- F3 Assistant · GPT
- F4 Blue Moon exit, Esc cancels
- F11 Core fullscreen
- Ctrl + mouse wheel does not zoom the UI
- Esc closes/cancels temporary surfaces instead of switching the primary surface
- left-click detail opening
- right-click hierarchy collapse/expand
- drag/drop containment
- K creation concept
- Map middle-button pan
- Map wheel zoom
- prepared travel via Space
- double-click pawn pin/unpin
- Meggy navigation gates
- Class / Stat / Journey module toggles
- Bag Give / Trade

---

## Düzeltilen eski madde / Resolved stale item

### Mevcudat: `E + Sol Tık`
**Current code:** `Ctrl + E` arms a one-shot Place command; the user then clicks the card.

The in-app text has been changed to:

**TR:** `Ctrl + E` — “Tek kullanımlık Map’e yerleştirme komutunu hazırlar; ardından bir karta tıkla. Esc iptal eder.”

**EN:** `Ctrl + E` — “Arms one-shot Place on Map; then click a card. Esc cancels.”

---

## Patch ile rehbere eklenen büyük özellikler / Major features added by the patch

| Alan / Area | Eksik / Missing |
|---|---|
| Mevcudat | Ctrl+E, Ctrl+F, Ctrl-click multi-select, Ctrl+Alt clear, Delete, Remove from Map |
| Taxonomy | 24-card taxonomy circle and its usage guidance |
| Map layers | 1 Surface, 2 Sky, 3 Underground, 4 Cosmic |
| Map commands | F focus, G Travel Group, T Time Hearth, B Encounter |
| Travel | internal-container destination intent with E, Travel Group portable contents/disband |
| Cartography | short Shift palette, A/F/E tools, Ctrl+Z, 24 brushes, regions/layers/images |
| Discovery | vision range, discovered regions, fog |
| Character resources | Health, Mana, Stamina, Metanet, collapse and recovery behavior |
| Bag | Split mode |
| Sheet | Skills, Journal, Quests, race/hybrid details, death/immortality |
| Tavern | speech-time cost, Meggy time-free speech, image messages, Metanet gate |
| Data | `.alekdata` export/import and migration safety |
| Recovery | Forgotten Vault |
| Adventure | Adventure Manager, cover/rename/delete |
| Advanced | Alt+G Symbol Palette, Tab disabled, legacy quote/backquote disabled |

---

## Önerilen uygulama içi bölüm yapısı / Recommended in-app section layout

1. Ana Yüzeyler / Primary Surfaces
2. Mevcudat
3. Taksonomi / Taxonomy
4. Map
5. Seyahat / Travel
6. Kartografya / Cartography
7. Karakter Kağıdı / Character Sheet
8. Çanta / Bag
9. Tavern
10. Vakit Ocağı / Time Hearth
11. Veri Kasası ve Mahzen / Data & Forgotten Vault
12. Gelişmiş Kısayollar / Advanced Shortcuts

---

## Bakım önerisi / Maintenance recommendation

The built-in guide remains a hard-coded `SHORTCUT_GUIDE_SECTIONS` array, so documentation drift is still possible unless code and guide are maintained together.

For future releases, treat the shortcut definition as release-critical data:

- change a shortcut,
- update the command handler,
- update the in-app guide in the same commit,
- update both GitHub user guides,
- add a regression check that verifies the documented key exists in the active command map.

This would prevent another “feature exists, guide forgot it” situation.
