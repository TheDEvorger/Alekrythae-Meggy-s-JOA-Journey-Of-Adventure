# Ałek’ryŧhæ · Journey of Adventurer + Tavern
## User Guide — v1.0.0

> **Scope:** This guide was produced by reviewing the JOA v1.0.0 / architecture revision 215 source and the current user-facing behavior.  
> **Target host:** Ałek’ryŧhæ Core v2.0.0.  
> **Package entry file:** `Alekrythae.alek`. The manifest and test references are aligned to this stable filename.

---

# 1. What is JOA?

**Journey of Adventurer + Tavern (JOA)** is more than a map screen. Inside each Adventure it can:

- manage characters, locations, groups, mounts/vehicles and world cards,
- place cards inside other cards to form a real **entity/container hierarchy**,
- position entities as pawns across four world layers,
- track vision and discovered territory,
- prepare and execute travel routes that consume game time,
- manage Health, Mana, Stamina and Metanet,
- maintain items, giving, trading and stack splitting,
- keep Skills, Journal and Quest records,
- run Tavern encounters and dialogue logs,
- advance game time through speech, travel, waiting and rest,
- move data between releases through the `.alekdata` vault,
- recover accidentally removed entities from the **Forgotten Vault**.

The core design idea is: **“Anything in the world can be a card; cards can have position, relationships, containers, contents and persistent history.”**

---

# 2. Installation and launch

JOA should not be treated as a completely standalone Windows executable. The `.alek` package is hosted by Ałek’ryŧhæ Core.

## 2.1 Keep the package together

Do not separate the `.alek` file from `Alekrythae.App`. Modular JavaScript and CSS resources are loaded from that application folder.

Typical layout:

```text
Alekrythae.alek
Alekrythae.App/
Assets/
Musics/
manifest.json
...
```

## 2.2 Starting the application

Normal launch methods are:

1. Open the `.alek` file through Ałek’ryŧhæ Core.
For v1.0.0, the recommended path is to open `Alekrythae.alek` directly with Ałek’ryŧhæ Core v2.0.0.

## 2.3 First launch

The application opens an Adventure portal. Select an existing Adventure or create a new one.

Every Adventure is an independent save domain. Characters, Tavern messages, map state and world data from one Adventure are not intended to leak into another.

---

# 3. Primary surfaces

JOA uses four function keys as primary surface controls:

| Key | Surface |
|---|---|
| **F1** | Inventory / Entity Registry (`Mevcudat`) |
| **F2** | Map |
| **F3** | Assistant · GPT |
| **F4** | Blue Moon exit scene |

## The important Escape rule

`Esc` is **not** a “go to the main menu” key.

It closes or cancels the highest-priority temporary operation, such as:

- a confirmation modal,
- a character sheet,
- the taxonomy circle,
- a one-shot inventory command,
- a paint-region draft,
- pending map placement,
- travel preparation,
- portable container view,
- an open palette.

It does not silently switch F1/F2/F3 primary surfaces.

## Other global behavior

- **F11:** toggles the Core window’s true fullscreen mode.
- **Ctrl + mouse wheel:** blocked so it does not change WebView/UI scale.
- **Tab:** intentionally consumed/disabled by the JOA shortcut contract.
- **Backquote/quote menu switching:** legacy behavior is disabled.
- **Alt + G:** opens the Ałek’ryŧhæ Symbol/Emoji Palette.
- **Alt + S:** legacy runtime input that is silently consumed; it is not a user command.

---

# 4. Adventure Manager

An Adventure is the top-level container for an independent campaign/world.

The manager lets you:

- create a **New Adventure**,
- open an Adventure card,
- enter cover-edit mode,
- rename an Adventure,
- delete an Adventure,
- see which Adventure is active.

Opening an Adventure uses the Blue Moon portal transition. Required initial time configuration is completed before the application returns to the surface from which the Adventure was entered.

### Adventure covers

Adventures can use custom cover art. The canonical Ałek’ryŧhæ Adventure may fall back to bundled artwork.

### Independent save data

Each Adventure is designed to own its own game database and Adventure-local media. A GitHub source package is therefore not the same thing as a user’s live save directory.

---

# 5. Mevcudat — the living entity tree

Press **F1** to open Mevcudat.

Mevcudat is not merely a character list. It is the world’s entity tree, tracking:

- what a card is,
- which card/container it belongs to,
- which child cards it contains,
- its map representation,
- its personal records.

## 5.1 Current controls

| Action | Result |
|---|---|
| **K** | Opens creation/taxonomy flow |
| **Left click** | Opens a card/detail sheet |
| **Right click** | Expands/collapses the card subtree |
| **Drag & drop** | Moves a card into another card or reorders hierarchy |
| **Ctrl + Left click** | Adds/removes the card from multi-selection |
| **Ctrl + Alt** | Clears accumulated JOA multi-selection |
| **Delete** | Starts removal/Forgotten Vault flow for selected entities |
| **Ctrl + E** | Arms one-shot **Place on Map**; then click a card |
| **Ctrl + F** | Arms one-shot **Find/Focus on Map**; then click a card |
| **Esc** | Cancels an armed command or current selection |

### Important: the old `E + Left Click` wording

The v1.0.0 release patch updates the built-in guide to the current **Ctrl + E → click a card** one-shot placement command. The stale `E + Left Click` wording has been removed.

## 5.2 Removing a pawn is not deleting a card

The **“× Haritadan” / Remove from Map** action removes the map pawn while leaving the underlying entity card intact.

Think of them as different operations:

- **Remove from Map:** card survives.
- **Delete / Vault:** entity is removed from the active world tree through the protected removal flow.

## 5.3 Nested containers

JOA allows main cards to physically contain other cards.

Examples:

- characters carrying sub-entities/items,
- locations containing characters,
- ships containing crew,
- groups containing people and mounts,
- lands containing settlements.

Moving a card into a container changes its Mevcudat hierarchy and may also affect whether it appears directly on the Map.

---

# 6. The 24-card Taxonomy Circle

JOA is not restricted to “Character” and “Location.” The Taxonomy Circle exposes 24 world-card types.

## I. Living Beings and Lineages

1. **Character**
2. **Being**
3. **Species**
4. **People**
5. **Group**
6. **Dynasty**

## II. Societies and Orders

7. **Society**
8. **Sovereignty**
9. **Civilization**
10. **Settlement**
11. **Land**
12. **Plane**

## III. Places and Cosmos

13. **Location**
14. **Structure**
15. **Geography**
16. **Habitat**
17. **Celestial Body/Formation**
18. **Flying Island**

## IV. Objects and Systems

19. **Item**
20. **Mount / Vehicle**
21. **Mechanism**
22. **Facility**
23. **Resource**
24. **Network**

The Taxonomy UI also contains guidance describing **when to use a card type, what kind of story pressure it creates, which cards it naturally links to, and what it can contain**.

---

# 7. Character / Being / Location sheets

The full detail surface can expose:

- **Sheet**
- **Bag**
- **Skills**
- **Journal**
- **Quests**
- **Mevcudat**

Locations and other compatible card families can reuse the same shared renderers where appropriate.

## 7.1 Identity

Identity data can include name, title, gender, race/origin, portrait and narrative fields.

Normalized gender modes are:

- Male
- Female
- Genderless

## 7.2 Race system

Ałek’ryŧhæ provides **24 canonical races**. A character may:

- select a canonical race,
- become a **Hybrid** from two or more roots,
- use an **Outer Realm** free-form origin.

The 24 canonical names are stored in the original Ałek’ryŧhæ orthography:

`ħǽɱ’Ʋǽɍʏŋ`, `ḓɐꞎ’ʁɨɱ`, `ɵɍʏ’ƙǽŋ`, `ʁʏɨɍʉŋ’χɐɍűŋ`, `þɐꞎɐśś’ɱǿɍʏɴ`, `ɱǽṙɇþɨ’śɵꞎɐʏŋ`, `þɨɍ’ŋɵčŧ`, `ḓɍɐỿ’žűɍχǽɍ`, `ǽþ’Ʋǽɍʏŋ`, `ʐɐṙ’χɐɍžűŋ`, `ɐʉ’ƀɇŋ`, `žɨꞎ’ƙɍɐŧ`, `χɐʉɍ’ǥɐþ`, `ɱʉɵ’ŋþɨɍ`, `ɨśƙǽɬ’Ʋǽɍʏþ`, `ƙɐꞎʏŧɨ’ʏħɍǽ`, `þǽ’ɍʏŋ`, `ŋɇɍǽþ’Ʋǽꞎűŋɐ`, `ǥɵɍűɱ’ɱǽχɍʏþ`, `Ʋɇƙþɐɍ’ŋűɱʏɍ`, `þʏɍɐ’Ʋɇƙűɍʏŋ`, `śʏꞎ’ŋɇþɍǿþ`, `ɐśŧɇɍʏŋ’Ʋɇʏɍχɐ`, `Ʋħɐṙǥǽþ’ɍűŋ`.

## 7.3 Per-character sheet modules

Three modules can be enabled/disabled independently:

- **Class**
- **Stats**
- **Journey & Recovery**

Disabling Journey & Recovery makes that character opt out of map vision, travel and personal recovery behavior.

---

# 8. The 24-Stat Circle

The canonical stat system contains 24 stats:

| Family | Stats |
|---|---|
| Structural | Durability, Balance, Capacity |
| Physical execution | Might, Agility, Mobility |
| Cognition | Comprehension, Focus, Memory |
| Will/control | Will, Control, Productivity |
| Defense | Absorption, Deflection, Protection |
| Effect | Impact, Accuracy, Reach |
| Perception | Perception, Sensitivity, Awareness |
| Expression/social | Expression, Influence, Coordination |

The source default value is 8. The data model can also accommodate additional/custom fields.

---

# 9. Health, Mana, Stamina and Metanet

JOA has four primary personal resource pools:

1. **Health**
2. **Mana / Ałek reserve**
3. **Stamina (Takat)**
4. **Metanet**

Even collective cards keep these as **per-person pools** rather than merging everyone into a single group health bar.

## 9.1 Health

Tracks damage, healing, maximum and natural hourly recovery.

## 9.2 Mana

Tracks spendable magical reserve, regeneration and maximum.

## 9.3 Stamina

Physical action and travel depend on Stamina. When exhausted, physical action can be locked while Sheet, Bag, Journal, Quests and Mevcudat remain available.

## 9.4 Metanet

Metanet can drain while awake according to the world rule and recover through sleep/rest.

A character whose Metanet has fully collapsed cannot speak in Tavern. Dialogue becomes available again at **50% or higher**.

## 9.5 Death and immortality

Character sheets include immortality and life/death seal behavior.

Applying the death seal:

- marks the character dead,
- zeros Health, Mana reserve, Stamina and Metanet,
- preserves pre-death values for the life-seal restoration path.

Certain canonical, immortal or protected records cannot be removed through ordinary deletion/vault flows.

---

# 10. Journey and recovery settings

Per character, JOA can store:

- **Travel speed (meters/second)**
- **Vision range (meters)**
- **Health recovery/hour**
- **Mana recovery/hour**
- **Stamina recovery/hour**
- **Metanet recovery/hour**

These values feed real map/travel/time behavior; they are not merely descriptive fields.

---

# 11. Bag and item system

The Bag defines 24 canonical item classes:

**Weapon, Armor, Tool, Ammunition, Clothing, Accessory, Container, Food, Drink, Medicine, Potion, Material, Ore, Plant, Component, Device, Key, Document, Book, Map, Currency, Jewel, Relic, Other.**

Each item class has its own fantasy sigil.

## 11.1 Item operations

The system supports:

- creating an item,
- editing an item,
- quantities,
- discarding/removing,
- selecting multiple items,
- **Give** to another target,
- **Trade** selected items between parties,
- **Split** one stack whose quantity is greater than 1.

While an inventory flow is active:

- `Space` advances/confirms the flow.
- `Esc` cancels the flow.

Give/Trade target selection can use Mevcudat and accepts appropriate other **Character or Location** cards.

---

# 12. Skills

The Skills tab provides persistent per-entity skill records.

Supported behavior includes:

- skill categories,
- adding new skills,
- editing names/descriptions,
- EXP values,
- skill images,
- changing/removing skill artwork,
- edit locking/protection.

---

# 13. Journal and Quests

## Journal

Default families include:

- Personal Notes
- Discoveries
- Lore and History

Users can add custom main categories and subcategories.

Each entry can hold:

- title,
- lore/notes,
- checklist items,
- date,
- category.

## Quests

The Quest system ships with rich fantasy-RPG category presets, including families equivalent to:

- Call of the Journey
- Lament of the Hero
- Eternal Vows
- Fruits of the Hybrids
- Companions and Blood Bonds
- Guilds and Societies
- Across My Realm
- Dark and Forbidden
- Open Waters and Windy Sails
- Forge, Trade and Coin

Users can extend both main and subcategories and add checklist items inside entries.

---

# 14. Map — the living world surface

Press **F2** to open Map.

JOA Map has four world layers:

| Key | Layer |
|---|---|
| **1** | Surface |
| **2** | Sky / Flying Island |
| **3** | Underground |
| **4** | Cosmic Island |

Camera/world state is layer-aware.

## 14.1 Pawn size contract

The UI communicates these base footprints:

- Character: **1 × 1 m**
- Group: **3 × 3 m**
- Location: **5 × 5 m**

## 14.2 Core Map controls

- **Left click:** select/interact with a pawn.
- **Double click:** pin/unpin pawn.
- **Middle mouse drag:** pan camera.
- **Mouse wheel:** zoom.
- **Ctrl + wheel:** intentionally does not zoom the UI.
- **Hold F + target:** focus behavior.
- **K:** create a new Location and enter placement.
- **G:** create an independent Travel Group.
- **T:** open Time Hearth.
- **B:** start an encounter.
- **S:** toggle travel mode.
- **Space:** execute prepared travel routes.
- **Hold E:** “enter target container” modifier.
- **Ctrl + E:** jump to Mevcudat with one-shot Place command armed.
- **Ctrl + F:** jump to Mevcudat with one-shot Find command armed.
- **Delete:** remove/delete the appropriate selected map/entity target.
- **Esc:** cancel the highest-priority active map operation.

---

# 15. Vision, discovery and fog

Vision is functional, not decorative.

A character’s **Vision Range** contributes to:

- discovered regions,
- revealing map fog,
- opening new territory while moving.

Discovery can be persisted as world state.

If a character’s Journey module is disabled, it is intended not to generate map vision.

---

# 16. Travel

Travel is more than instant teleporting.

Typical flow:

1. Press `S` to enter travel mode.
2. Choose the moving pawn(s) and prepare route/destination.
3. If required, use the `E` modifier to mark **enter the destination container**.
4. Multiple routes may be prepared.
5. Press `Space` to execute prepared travel.

Travel can:

- use character travel speed,
- account for distance,
- interact with Stamina,
- advance game time,
- update vision/discovery.

`Esc` is the priority cancellation route for active/prepared travel.

---

# 17. Travel Groups

Press `G` to create an independent **Travel Group**.

Travel Groups help:

- move multiple entities together,
- treat the party as a portable container,
- execute group travel.

Important interactions:

- **Middle click:** can open Portable/Internal Containers.
- **Right click on an independent Travel Group:** disbands it.
- **Right click an entity inside the portable list:** can eject it near the carrier.

---

# 18. Portable / Internal Containers

The Map can answer “what is inside this pawn?” without leaving the world surface.

Examples include:

- passengers inside a ship,
- members inside a group,
- characters inside a location,
- nested entities inside a carrier.

Portable Containers make this hierarchy manageable directly from Map.

---

# 19. Cartography / Paint Palette

This is one of the largest real features missing from the current built-in shortcut guide.

## 19.1 Opening the palette

**Tap Shift briefly and release it.** The code distinguishes a short Shift tap from normal modifier use.

## 19.2 Palette keyboard controls

While the palette is open:

- **F:** Paint
- **E:** Erase
- **A:** Eyedropper / sample map color
- **Ctrl + Z:** undo latest paint operation

## 19.3 The 24 brushes

The current source defines 24 brush presets:

1. Hard Square
2. Hard Circle
3. Hard Diamond
4. Cross Tip
5. Soft Circle
6. Soft Square
7. Fine Spray
8. Wide Spray
9. Light Dither
10. Dense Dither
11. Horizontal Hatch
12. Rough Scatter
13. Thin Chisel
14. Wide Chisel
15. Transparent Wash
16. Soft Wide
17. Fine Grain
18. Scattered Dot
19. Cross Hatch
20. Air Brush
21. Blur
22. Very Soft
23. Outline Tip
24. Filled Block

## 19.4 Brush controls

Depending on tool, the palette manages:

- color,
- hue,
- saturation,
- lightness,
- opacity,
- size,
- softness.

With the palette open, **Alt + left drag** adjusts brush size and **Alt + right drag** adjusts softness.

## 19.5 Regions and paint layers

The cartography system supports:

- regions,
- rectangular region boundaries,
- layer activation,
- independent visibility,
- moving layers between regions,
- reordering layers/regions by drag,
- preventing new paint outside the active region boundary.

## 19.6 Image layers

External images can be attached to map/image layers.

Images can be:

- positioned,
- dragged,
- resized,
- hidden through layer visibility,
- locked/unlocked,
- removed from the layer.

Removing an image from the map layer does not delete the original source image file.

---

# 20. Time Hearth and game time

Press `T` for **Time Hearth · Rest and Time Skip**.

JOA progression is primarily **action-driven**, not tied directly to wall-clock time.

Canonical Ałek’ryŧhæ time scale:

- **24 game seconds = 1 game minute**
- **240 minutes = 1 hour**
- **36 hours = 1 day**
- **24 days = 1 month**
- **24 months = 1 year**

## Rest modes

### Wait
- Health ×1
- Mana ×1
- Stamina ×0
- Metanet recovery ×0
- awake Metanet drain continues.

### First Aid
- Health ×1.75
- Mana ×1.10
- Stamina ×0
- Metanet recovery ×0
- awake Metanet drain continues.

### Camp
- Health ×2.25
- Mana ×1.75
- Stamina ×1.15
- Metanet ×1.60
- sleep suppresses fixed Metanet drain.

### Bed / Inn
- Health ×3
- Mana ×2.50
- Stamina ×1.60
- Metanet ×2.00
- strongest natural rest mode.

Days, hours and minutes can be entered for the time jump.

---

# 21. Tavern

Tavern is JOA’s encounter/dialogue stage.

## 21.1 Starting an encounter

Press **B** on Map to begin a new encounter using appropriate selected participants.

The **Conversation Seal** in Mevcudat can also place a character on the Tavern speaker stage.

## 21.2 Speaking

In Tavern:

- type dialogue/narration/action into the center composer,
- click Meggy to send as Meggy,
- click a speaker card to send as that character,
- right-click a speaker to remove them from the stage.

### Speech and time

Character dialogue estimates speech duration from text length and may advance game time.

**Meggy is outside game-time speech cost**, so Meggy messages do not advance time.

Image-only messages also do not advance time.

## 21.3 Metanet gate

A character with collapsed Metanet cannot speak. Speech unlocks again at 50% or higher.

## 21.4 Tavern images

Messages can include images.

- `G` can invoke image selection in the Tavern context.
- While typing, **Shift + G** is used for the image shortcut behavior so normal text input is not accidentally hijacked.
- Pending images have a preview and can be removed.
- Sent images can be enlarged.

## 21.5 Message history

Messages are persisted against the selected game day and may include:

- speaker,
- text,
- lore/glyph rendering,
- image,
- estimated duration.

Message deletion is protected by a confirmation/password flow.

---

# 22. Assistant · GPT

Press **F3** for the Assistant surface.

It is designed around the Core SafeAI/native-window bridge rather than behaving like a simple embedded web iframe. If the Core capability is unavailable, JOA can display a fallback/error state.

The Assistant is a separate helper surface; it does not automatically become the owner of your game data.

---

# 23. Forgotten Vault

The top utility **◌** opens the Forgotten Vault.

Eligible entities removed through the protected delete flow can be archived as a **recoverable batch** instead of being immediately destroyed.

If a root card is vaulted, its contained subtree can be stored with it.

The Vault offers:

- **Restore / Geri Çağır**
- **Delete Forever / Sonsuza Sil**

Canonical, immortal, special or explicitly undeletable records may be protected from this process.

### Stale UI wording

Some older text still mentions `Q + click` selection. The current JOA Mevcudat implementation uses **Ctrl + left click** for multi-selection. This is another sign that all help text has not yet been synchronized with v1.0.0 behavior.

---

# 24. `.alekdata` Data Vault

The top utility dock contains:

- **↥ Export**
- **↧ Import**

## Export

The currently open Adventure is saved first, then game data can be exported into a version-independent `.alekdata` vault.

## Import

When the native Core data bridge is available, the importer is designed to recognize:

- `.alekdata`
- older Meggy `.zip` packages
- `meggy.db`
- `game.db`
- legacy `.json` saves

Import behavior is designed to:

1. create a backup of current data first,
2. migrate old schema/data keys,
3. avoid destructive name/folder collisions by creating a safe imported copy,
4. reload once when the new data is ready.

Portable fallback packages verify file size and **SHA-256 integrity** and reject unsafe paths such as traversal with `..`.

---

# 25. Autosave

JOA uses delayed/debounced autosave for many editing operations.

Practical consequences:

- users do not need a Save button for every tiny field,
- critical transitions such as Adventure switching/export force data to disk,
- import temporarily locks autosave while data is being replaced/migrated.

Prefer the normal **F4 → Blue Moon** exit flow instead of forcibly terminating the host process.

---

# 26. Blue Moon exit

**F4** does not instantly terminate the app.

It opens a Blue Moon farewell scene.

- `Esc`: cancel exit.
- Click Moon / Enter / Space: confirm final exit.
- After the final animation, JOA asks Core to exit through `app.exit`.

This prevents accidental instant shutdown.

---

# 27. Ałek’ryŧhæ Symbol Palette

Press **Alt + G** to open the Symbol/Emoji Palette.

It can insert:

- glyphs,
- symbols,
- Ałek’ryŧhæ alphabet marks,
- named special signs

into compatible text fields.

The panel is draggable and can persist its open/position state.

---

# 28. Lore Language Engine

`lore-language.module.js` is a real preload module included in the v1.0.0 manifest.

The source contains support for:

- roman/glyph transformations,
- a 240-symbol alphabet framework,
- dictionaries,
- generated lexicon,
- word-family analysis,
- batch `.md/.txt` conversion,
- custom dictionary import/export,
- snapshot/manifest generation,
- copy/save workflows.

However, **v1.0.0 does not expose a clear standalone Language Engine entry button among the primary F1/F2/F3 surfaces**. It is therefore documented as an active package module rather than a mandatory primary gameplay screen.

---

# 29. Embedded/legacy systems not currently foregrounded

The source still contains broader historical Ałek’ryŧhæ workspaces, including:

- Lore archive/tree tools,
- Reverie story records,
- Tide of Aia relationship/link workspace,
- older Cartographer workspace,
- Harmonizer / Ambiance / Bard media tooling,
- Voiceforge / RVC voice experimentation,
- map-library and older drawing tools.

**Source presence does not guarantee current primary-surface accessibility.** JOA v1.0.0 foregrounds F1 Mevcudat, F2 Map, F3 Assistant, Tavern and the utility dock. These older systems should therefore be described as **legacy/embedded**, not advertised as guaranteed primary features.

---

# 30. Is the built-in Shortcut Guide up to date?

**Yes. The v1.0.0 release patch aligns the primary command atlas with the current handlers.**

The built-in Command Atlas now summarizes:

- F1 / F2 / F3 / F4 and F11,
- Escape and Ctrl-wheel behavior,
- Alt + G Symbol Palette,
- Ctrl + E / Ctrl + F, Ctrl-click, Ctrl + Alt and Delete in Mevcudat,
- Map layers 1–4, focus, pinning, Internal Containers and remove-from-map behavior,
- S / E / Space travel flow, G Travel Group, T Time Hearth and B Encounter,
- short-Shift Cartography Palette, A/F/E tools, Ctrl + Z and quick brush adjustment,
- character resources, Bag Give/Trade/Split, Journal/Quests/Skills,
- Tavern, the Metanet speech gate, Data Vault and Forgotten Vault summaries.

The in-app guide is intentionally a **quick command atlas**. The complete 24-card taxonomy, all 24 brush names, detailed time multipliers, migration rules and behavioral explanations remain in this full User Guide.

---

# 31. Role of the in-app guide vs. the full User Guide

The in-app guide is the fast reference used during play. This GitHub document is the exhaustive reference. Whenever a user-facing shortcut or behavior changes, the command handler, in-app `SHORTCUT_GUIDE_SECTIONS` and both User Guides should be updated in the same release.

---

# 32. Shortcut cheat sheet

| Shortcut | Function |
|---|---|
| F1 | Mevcudat |
| F2 | Map |
| F3 | Assistant |
| F4 | Blue Moon exit |
| F11 | Core fullscreen |
| Esc | Close/cancel top temporary operation |
| Alt+G | Symbol Palette |
| Ctrl+E | Place-on-Map command through Mevcudat |
| Ctrl+F | Find-on-Map command through Mevcudat |
| Ctrl+Alt | Clear JOA multi-selection |
| 1 / 2 / 3 / 4 | Map layers |
| Hold F | Map focus |
| K | Create card in Mevcudat / Location on Map |
| G | Travel Group |
| T | Time Hearth |
| B | Encounter |
| S | Travel mode |
| Hold E | Enter-target-container intent |
| Space | Execute prepared travel / advance Bag flow |
| Delete | Selected entity operation |
| Short Shift tap | Cartography Palette |
| A (palette) | Eyedropper |
| F (palette) | Paint |
| E (palette) | Erase |
| Ctrl+Z (palette) | Paint undo |
| Middle mouse drag | Map pan |
| Mouse wheel | Map zoom |
| Double-click pawn | Pin/unpin |
| Middle-click pawn | Internal Containers |
| Ctrl+left click card | Multi-select |

---

# 33. Troubleshooting

## F1/F2/F3/F4 does nothing

A hard/blocking modal may be open. Press `Esc` to close the top blocking window first.

## Ctrl+E appears to do nothing

It arms a **one-shot command**. After pressing Ctrl+E, click the desired Mevcudat card. `Esc` cancels the command.

## A card exists but is not visible on Map

It may be inside another container or simply removed from Map. Use F1 → Ctrl+F to locate it, or Ctrl+E to place it again.

## Character cannot talk in Tavern

Check Metanet. Collapsed Metanet blocks dialogue until it recovers to at least 50%.

## Stamina is empty

Physical actions may be blocked. Use `T` and choose Camp or Bed/Inn rest.

## Paint does not apply

Short-tap Shift to open the palette. Verify the active region/layer is visible and select Paint.

## Image layer will not move

The image may be locked or its layer may not be active. Activate the image layer and unlock it.

## Import completed but the old view remains

Data import may intentionally trigger one reload so the migrated data becomes the active runtime state.

## F3 / native file picking / native data vault is limited outside Core

Some features depend on the Core bridge. Browser-only simulation is not equivalent to real Windows/WebView2 execution.

---

# 34. Documentation maintenance rule

For every release, update these together:

1. `manifest.json` version and `entry`
2. `USER_GUIDE_TR.md`
3. `USER_GUIDE_EN.md`
4. in-app `SHORTCUT_GUIDE_SECTIONS`

If a shortcut exists only in code, the help system will drift again.

---

**Document revision:** JOA v1.0.0 User Guide Revision 1  
**Goal:** document user-facing behavior supported by the actual v1.0.0 source, while clearly separating embedded legacy code that is not guaranteed to be exposed through the current primary UI.
