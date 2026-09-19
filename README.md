# Ałek’ryŧhæ · Meggy JOA

**Release:** `v1.0.0`  
**Architecture revision:** `215`  
**Runtime:** Ałek’ryŧhæ Core `v2.0.0`

Journey of Adventurer + Tavern (JOA) is the stable Ałek’ryŧhæ adventure workspace for Mevcudat, living-world mapping, travel, Tavern encounters, character resources, cartography and portable game data.

## Start

Keep `Alekrythae.alek` and the `Alekrythae.App` folder side by side, then open `Alekrythae.alek` with **Ałek’ryŧhæ Core v2.0.0**.

Do not move the `.alek` file away from `Alekrythae.App`; the application loads its modular JavaScript and CSS resources from that folder.

## User Guides

- [Türkçe Kullanıcı Kılavuzu](docs/USER_GUIDE_TR.md)
- [English User Guide](docs/USER_GUIDE_EN.md)
- [In-App Guide Audit](docs/IN_APP_GUIDE_AUDIT_TR_EN.md)

## Compatibility

The package uses the Core file bridge, portable SQLite game store, graphics selection, external-media bridge, SafeAI window bridge and host exit API provided by Core v2.0.0.

## Save Data

Runtime/user data such as `Data/`, `Games/`, `Backups/`, SQLite WAL/SHM files and exported `.alekdata` packages are intentionally excluded by `.gitignore`. The canonical empty template at `Templates/Alekrytha/game.db` remains tracked.

## Release Identity

Public application version: **v1.0.0**  
Internal architecture revision: **215**
