#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appRoot = path.resolve(__dirname, "..");
const checks = [];
const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};
const pass = (name, detail = "OK") => checks.push({ name, detail });

class FakeNode {
    constructor(tag = "div") {
        this.tagName = String(tag).toUpperCase();
        this.dataset = {};
        this.attributes = {};
        this.childNodes = [];
        this.listeners = new Map();
        this.style = { setProperty() {}, removeProperty() {} };
        this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
        this.isConnected = true;
    }
    getContext() { return {}; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    addEventListener(type, listener) { const list = this.listeners.get(type) || []; list.push(listener); this.listeners.set(type, list); }
    removeEventListener(type, listener) { const list = this.listeners.get(type) || []; this.listeners.set(type, list.filter(item => item !== listener)); }
    append(...children) { for (const child of children) this.appendChild(child); }
    appendChild(child) { this.childNodes.push(child); return child; }
    contains(target) { return target === this || this.childNodes.some(child => child?.contains?.(target)); }
    focus() { this.focused = true; }
    click() { return this.onclick?.({ target: this }); }
    remove() { this.isConnected = false; }
}

function makeKeyEvent({ key = "", code = key, target = null, ...extra } = {}) {
    const event = {
        key,
        code,
        keyCode: 0,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        repeat: false,
        target: target || { matches: () => false, isContentEditable: false },
        prevented: false,
        stopped: false,
        immediateStopped: false,
        preventDefault() { this.prevented = true; },
        stopPropagation() { this.stopped = true; },
        stopImmediatePropagation() { this.immediateStopped = true; },
        ...extra
    };
    return event;
}

async function testApplicationShortcuts() {
    const registered = [];
    const listeners = new Map();
    const routes = [];
    let hardBlocked = false;
    let joaOpen = false;
    let emojiOpen = false;
    let primaryOpen = false;
    let moonCancelled = false;
    let farewellCount = 0;
    let emojiCloseCount = 0;
    let now = 1000;
    const sandbox = {
        console,
        performance: { now: () => now },
        addEventListener(type, listener) { listeners.set(type, listener); },
        removeEventListener(type, listener) { if (listeners.get(type) === listener) listeners.delete(type); }
    };
    sandbox.window = sandbox;
    sandbox.document = {
        querySelector(selector) {
            if (selector === ".joa-world-shell") return joaOpen ? {} : null;
            if (selector === ".alek-emoji-keyboard") return emojiOpen ? {} : null;
            return null;
        }
    };
    sandbox.Alekrythae = { registerModule: module => registered.push(module) };
    sandbox.__alekHasHardBlockingWindow = () => hardBlocked;
    sandbox.__alekIsAnyPrimarySurfaceOpen = () => primaryOpen;
    sandbox.__alekIsPrimarySurfaceOpen = () => false;
    sandbox.__alekNavigatePrimarySurface = target => routes.push(target);
    sandbox.__alekMoonFarewellExit = () => { farewellCount++; };
    sandbox.__alekCancelMoonFarewell = () => moonCancelled;
    sandbox.__alekCloseEmojiKeyboard = () => { emojiOpen = false; emojiCloseCount++; };
    sandbox.__alekDismissPrimaryNavigationOverlays = () => { if (emojiOpen) sandbox.__alekCloseEmojiKeyboard(); };

    const filename = path.join(appRoot, "modules/application/shortcuts.module.js");
    vm.runInContext(fs.readFileSync(filename, "utf8"), vm.createContext(sandbox), { filename });
    const module = registered.find(item => item.id === "application.shortcuts");
    assert(module, "application.shortcuts modülü kayıt olmadı.");
    await module.start({ eventBus: { emit() {} } });
    const dispatch = event => { const handler = listeners.get("keydown"); assert(handler, "keydown listener yok."); handler(event); return event; };

    for (const [key, route] of [["F1", "inventory"], ["F2", "map"], ["F3", "ai"]]) {
        now += 250;
        const event = dispatch(makeKeyEvent({ key, code: key }));
        assert(event.prevented && event.immediateStopped, `${key} tüketilmedi.`);
        assert(routes.at(-1) === route, `${key} yanlış yüzeye gitti.`);
    }
    now += 250;
    dispatch(makeKeyEvent({ key: "F4", code: "F4" }));
    assert(farewellCount === 1, "F4 çıkış sahnesini çağırmadı.");

    const routeCount = routes.length;
    hardBlocked = true;
    now += 250;
    const blockedF1 = dispatch(makeKeyEvent({ key: "F1", code: "F1" }));
    assert(blockedF1.prevented && routes.length === routeCount, "Sert modal F1 yüzey geçişini engellemedi.");
    const modalEscape = dispatch(makeKeyEvent({ key: "Escape", code: "Escape" }));
    assert(!modalEscape.prevented, "Esc sert modalın kendi kapatma işleyicisine bırakılmadı.");
    hardBlocked = false;

    const editor = { matches: selector => selector.includes("input"), isContentEditable: false };
    const tab = dispatch(makeKeyEvent({ key: "Tab", code: "Tab", target: editor }));
    assert(tab.prevented, "Tab kilidi yazı alanında uygulanmadı.");
    const quote = dispatch(makeKeyEvent({ key: "'", code: "Quote" }));
    assert(quote.prevented, "Quote/Backquote ana yüzey kilidi uygulanmadı.");
    const editorQuote = dispatch(makeKeyEvent({ key: "i", code: "Quote", target: editor }));
    assert(!editorQuote.prevented, "Türkçe Q klavye yazı alanında Quote fiziksel kodu engellendi.");

    emojiOpen = true;
    const emojiEscape = dispatch(makeKeyEvent({ key: "Escape", code: "Escape" }));
    assert(emojiEscape.prevented && emojiCloseCount === 1 && !emojiOpen, "Esc İmge Klavyesi'ni kapatmadı.");
    emojiOpen = true;
    now += 250;
    dispatch(makeKeyEvent({ key: "F2", code: "F2" }));
    assert(emojiCloseCount === 2 && !emojiOpen, "Ana yüzey geçişi İmge Klavyesi'ni kapatmadı.");

    joaOpen = true;
    const joaEscape = dispatch(makeKeyEvent({ key: "Escape", code: "Escape" }));
    assert(!joaEscape.prevented, "Esc JoA geçici durum işleyicisine bırakılmadı.");
    joaOpen = false;
    primaryOpen = true;
    const primaryEscape = dispatch(makeKeyEvent({ key: "Escape", code: "Escape" }));
    assert(primaryEscape.prevented, "Boş ana yüzeyde Esc yanlışlıkla uygulama dışına sızdı.");
    moonCancelled = true;
    const moonEscape = dispatch(makeKeyEvent({ key: "Escape", code: "Escape" }));
    assert(moonEscape.prevented, "Mavi Ay çıkış iptali Esc ile tüketilmedi.");

    await module.stop();
    assert(!listeners.has("keydown") && sandbox.__ALEK_WORLD_MAP_SHORTCUT_OWNED__ === undefined, "Kısayol listener'ı stop sırasında temizlenmedi.");
    pass("Uygulama kısayolları", "F1–F4, Tab, Quote/Backquote, İmge Klavyesi, Esc önceliği ve stop temizliği");
}

function paletteEvent(dataset) {
    const button = { dataset: { ...dataset } };
    return {
        detail: 1,
        target: {
            closest(selector) {
                if (selector === "input") return null;
                if (selector === "button") return button;
                return null;
            }
        }
    };
}

async function testLayerCrudAndImages() {
    const registered = [];
    let now = 5000;
    const sandbox = {
        console,
        setTimeout,
        clearTimeout,
        queueMicrotask,
        performance: { now: () => now },
        requestAnimationFrame: () => 1,
        cancelAnimationFrame: () => {},
        addEventListener() {},
        removeEventListener() {},
        innerWidth: 1920,
        innerHeight: 1080,
        Notice() {}
    };
    sandbox.window = sandbox;
    sandbox.document = {
        body: new FakeNode("body"),
        documentElement: { clientWidth: 1920, clientHeight: 1080 },
        activeElement: null,
        createElement: tag => new FakeNode(tag),
        createElementNS: (_namespace, tag) => new FakeNode(tag),
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener() {},
        removeEventListener() {}
    };
    sandbox.AlekrythaeWorldMap = {};
    sandbox.Alekrythae = { registerModule: module => registered.push(module) };
    const filename = path.join(appRoot, "modules/joa-world/joa-world.module.js");
    vm.runInContext(fs.readFileSync(filename, "utf8"), vm.createContext(sandbox), { filename });
    const module = registered.find(item => item.id === "joa.world-experience");
    assert(module, "joa.world-experience modülü kayıt olmadı.");
    await module.start({ bridge: {}, eventBus: { emit() {} } });
    const controller = module.controller;
    assert(controller, "JoA controller oluşturulmadı.");

    controller.state = { layerKey: "surface", pixelPaint: { surface: [] }, pixelPaintMeta: {}, mapImages: [] };
    controller.overlay = new FakeNode("section");
    controller.renderPalette = () => {};
    controller.renderMapImages = () => {};
    controller.renderPaint = () => {};
    controller.renderLegend = () => {};
    controller.scheduleSave = () => {};
    controller.syncPaletteLiveControls = () => {};
    controller.setPaintMode = value => { controller.paintMode = !!value; };
    controller.confirmRune = async () => true;
    let imagePickerLayer = null, imagePickerCalls = 0;
    const realOpenMapImagePicker = controller.openMapImagePicker.bind(controller);
    controller.openMapImagePicker = layerId => { imagePickerLayer = Number(layerId); imagePickerCalls++; return true; };

    const keyCalls = { layers: [], createLocation: 0, createEntity: 0, group: 0, time: 0, encounter: 0, travel: 0, execute: 0, deleteInventory: 0, cancelTravel: 0, closePalette: 0 };
    controller.switchLayer = layer => { keyCalls.layers.push(layer); return true; };
    controller.createMekanForPlacement = () => { keyCalls.createLocation++; return true; };
    controller.createVarlik = () => { keyCalls.createEntity++; return true; };
    controller.createTravelGroup = () => { keyCalls.group++; };
    controller.startEncounter = () => { keyCalls.encounter++; };
    controller.toggleTravel = () => { keyCalls.travel++; };
    controller.executeTravel = () => { keyCalls.execute++; };
    controller.deleteSelectedInventory = () => { keyCalls.deleteInventory++; };
    controller.cancelAllTravel = () => { keyCalls.cancelTravel++; };
    controller.renderInventory = () => {};
    controller.createMarkers = () => {};
    controller.renderOverlay = () => {};
    controller.renderEmptyState = () => {};
    controller.drawFog = () => {};
    controller.setPaletteOpen = force => { controller.paletteOpen = force === undefined ? !controller.paletteOpen : !!force; if (!controller.paletteOpen) keyCalls.closePalette++; return controller.paletteOpen; };
    sandbox.__ALEK_JOURNEY_SIMULATION__ = { openTimeCamp: () => { keyCalls.time++; return { shade: new FakeNode("div") }; } };

    for (const [digit, layer] of Object.entries({ 1: "surface", 2: "sky", 3: "underground", 4: "cosmic" })) {
        const event = makeKeyEvent({ key: digit, code: `Digit${digit}` });
        controller.onKeyDown(event);
        assert(event.prevented && keyCalls.layers.at(-1) === layer, `${digit} dünya katmanı kısayolu çalışmadı.`);
    }
    controller.onKeyDown(makeKeyEvent({ key: "f", code: "KeyF" }));
    assert(controller.focusHeld === true, "F odak basılı durumu kurulmadı.");
    controller.onKeyDown(makeKeyEvent({ key: "e", code: "KeyE" }));
    assert(controller.ePlaceHeld === true && controller.ePlaceIntentUntil > 0, "E yerleştirme niyeti kurulmadı.");
    controller.onKeyDown(makeKeyEvent({ key: "k", code: "KeyK" }));
    controller.onKeyDown(makeKeyEvent({ key: "g", code: "KeyG" }));
    controller.onKeyDown(makeKeyEvent({ key: "t", code: "KeyT" }));
    controller.onKeyDown(makeKeyEvent({ key: "b", code: "KeyB" }));
    controller.onKeyDown(makeKeyEvent({ key: "s", code: "KeyS" }));
    controller.travelMode = true;
    controller.onKeyDown(makeKeyEvent({ key: " ", code: "Space" }));
    assert(keyCalls.createLocation === 1 && keyCalls.group === 1 && keyCalls.time === 1 && keyCalls.encounter === 1 && keyCalls.travel === 1 && keyCalls.execute === 1, "JoA K/G/T/B/S/Space işlem kısayollarından biri çalışmadı.");
    controller.travelMode = false;

    controller.paletteOpen = true;
    controller.onKeyDown(makeKeyEvent({ key: "Escape", code: "Escape" }));
    assert(controller.paletteOpen === false && keyCalls.closePalette === 1, "Esc açık boya paletini kapatmadı.");
    controller.pendingPlacement = { sourceKey: "character:1" };
    controller.onKeyDown(makeKeyEvent({ key: "Escape", code: "Escape" }));
    assert(controller.pendingPlacement === null, "Esc bekleyen piyon yerleştirmesini iptal etmedi.");
    controller.travelMode = true;
    controller.onKeyDown(makeKeyEvent({ key: "Escape", code: "Escape" }));
    assert(keyCalls.cancelTravel === 1, "Esc seyahat durumunu iptal etmedi.");
    controller.travelMode = false;
    controller.worldSelected.add("character:1");
    controller.onKeyDown(makeKeyEvent({ key: "Escape", code: "Escape" }));
    assert(controller.worldSelected.size === 0, "Esc dünya seçimini temizlemedi.");

    controller.inventoryPage = true;
    const ctrlPlace = makeKeyEvent({ key: "e", code: "KeyE", ctrlKey: true });
    controller.onKeyDown(ctrlPlace);
    assert(ctrlPlace.prevented && controller.inventoryPlaceIntent === true && controller.inventoryFocusIntent === false, "Mevcudat Ctrl+E tek kullanımlık yerleştirme komutunu kurmadı.");
    controller.onKeyDown(makeKeyEvent({ key: "Escape", code: "Escape" }));
    assert(controller.inventoryPlaceIntent === false && controller.inventoryFocusIntent === false, "Esc Mevcudat yerleştirme komutunu iptal etmedi.");
    const ctrlFocus = makeKeyEvent({ key: "f", code: "KeyF", ctrlKey: true });
    controller.onKeyDown(ctrlFocus);
    assert(ctrlFocus.prevented && controller.inventoryFocusIntent === true && controller.inventoryPlaceIntent === false, "Mevcudat Ctrl+F tek kullanımlık bul komutunu kurmadı.");
    controller.setInventoryCommand("");
    controller.onKeyDown(makeKeyEvent({ key: "k", code: "KeyK" }));
    assert(keyCalls.createEntity === 1, "Mevcudat K yeni karakter kısayolu çalışmadı.");
    controller.inventorySelected.add("character:2");
    controller.onKeyDown(makeKeyEvent({ key: "Delete", code: "Delete" }));
    assert(keyCalls.deleteInventory === 1, "Mevcudat Delete kısayolu silme akışını çağırmadı.");
    const editEvent = makeKeyEvent({ key: "k", code: "KeyK", target: { matches: selector => selector.includes("input"), isContentEditable: false } });
    controller.onKeyDown(editEvent);
    assert(!editEvent.prevented && keyCalls.createEntity === 1, "Yazı alanında K yanlışlıkla karakter oluşturdu.");
    controller.inventoryPage = false;
    controller.inventorySelected.clear();
    controller.focusHeld = false;
    controller.ePlaceHeld = false;
    const originalSave = controller.save, originalClose = controller.close, originalOpen = controller.open;
    let routedInventory = null;
    controller.save = () => {};
    controller.close = () => { controller.overlay = null; };
    controller.open = options => { routedInventory = options; return true; };
    const mapCtrlPlace = makeKeyEvent({ key: "e", code: "KeyE", ctrlKey: true });
    controller.onKeyDown(mapCtrlPlace);
    await Promise.resolve();
    assert(mapCtrlPlace.prevented && routedInventory?.inventoryOnly === true && routedInventory?.inventoryCommand === "place", "Map Ctrl+E Mevcudat yerleştirme komutuna yönlenmedi.");
    controller.save = originalSave;controller.close = originalClose;controller.open = originalOpen;controller.overlay = new FakeNode("section");
    pass("JoA iç kısayolları", "1–4, F/E/K/G/T/B/S/Space/Delete · Ctrl+E/Ctrl+F tek-atım · Esc öncelikleri");

    let meta = controller.currentPaintMeta();
    assert(meta.regions.length === 1 && Object.keys(meta.layers).length === 1, "Boş kayıtta bir başlangıç bölgesi/katmanı kurulmadı.");
    assert(meta.regionOrder.length === 1 && meta.regions[0].layerOrder.length === 1, "Başlangıç katman ağacı tutarsız.");

    const initialRegionId = meta.regionOrder[0], initialLayerId = meta.activeLayerId;
    controller.paletteOpen = true;
    await controller.onPaletteClick(paletteEvent({ action: "close-palette" }));
    assert(controller.paletteOpen === false, "Palet kapatma düğmesi çalışmadı.");
    await controller.onPaletteClick(paletteEvent({ action: "toggle-brushes" }));
    assert(controller.brushPanelOpen === true && controller.layerPanelOpen === false, "Fırça paneli açılmadı.");
    await controller.onPaletteClick(paletteEvent({ action: "toggle-layers" }));
    assert(controller.layerPanelOpen === true && controller.brushPanelOpen === false, "Katman paneli açılmadı veya fırça paneli kapanmadı.");
    await controller.onPaletteClick(paletteEvent({ action: "toggle-region", regionId: initialRegionId }));
    assert(controller.regionById(meta, initialRegionId).collapsed === true, "Bölge ağacı daraltılmadı.");
    await controller.onPaletteClick(paletteEvent({ action: "toggle-region", regionId: initialRegionId }));
    await controller.onPaletteClick(paletteEvent({ action: "set-region-bounds", regionId: initialRegionId }));
    assert(controller.paintRegionDraft?.regionId === initialRegionId && controller.paintTool === "region", "Bölge sınırı çizim modu başlamadı.");
    controller.cancelRegionBoundary();
    await controller.onPaletteClick(paletteEvent({ action: "toggle-layer-kind", layerId: String(initialLayerId) }));
    assert(meta.layers[String(initialLayerId)].kind === "image" && imagePickerLayer === initialLayerId, "Çizim katmanı Resim türüne geçmedi.");
    const pickerCallsBeforeGallery = imagePickerCalls;
    await controller.onPaletteClick(paletteEvent({ action: "pick-layer-image" }));
    assert(imagePickerLayer === initialLayerId && imagePickerCalls === pickerCallsBeforeGallery + 1, "Resim katmanı galeri düğmesi görsel seçiciyi açmadı.");
    await controller.onPaletteClick(paletteEvent({ action: "toggle-layer-kind", layerId: String(initialLayerId) }));
    assert(meta.layers[String(initialLayerId)].kind === "paint", "Resim katmanı Çizim türüne dönemedi.");
    const legendBefore = controller.legendCollapsed;
    controller.onLegendClick({ target: { closest: selector => selector === "button" ? { dataset: { action: "toggle-legend" } } : null } });
    assert(controller.legendCollapsed !== legendBefore && controller.state.legendOpen === !controller.legendCollapsed, "Lejant aç/kapat düğmesi state'i güncellemedi.");

    await controller.onPaletteClick(paletteEvent({ action: "add-region" }));
    meta = controller.currentPaintMeta();
    assert(meta.regions.length === 2 && Object.keys(meta.layers).length === 2, "Bölge ekleme bölge+zemin katmanı üretmedi.");
    const secondRegionId = meta.activeRegionId;
    const secondLayerId = meta.activeLayerId;
    controller.cancelRegionBoundary();

    await controller.onPaletteClick(paletteEvent({ action: "select-region", regionId: initialRegionId }));
    assert(meta.activeRegionId === initialRegionId, "Bölge seçme düğmesi aktif bölgeyi değiştirmedi.");
    await controller.onPaletteClick(paletteEvent({ action: "select-layer", layerId: String(initialLayerId) }));
    assert(meta.activeLayerId === initialLayerId, "Katman seçme düğmesi aktif katmanı değiştirmedi.");

    const firstRegionId = meta.regionOrder.find(id => id !== secondRegionId);
    await controller.onPaletteClick(paletteEvent({ action: "add-layer", regionId: firstRegionId }));
    meta = controller.currentPaintMeta();
    const movedLayerId = meta.activeLayerId;
    assert(meta.layers[String(movedLayerId)]?.regionId === firstRegionId, "Katman istenen bölgeye eklenmedi.");

    controller.onPaletteInput({ target: { dataset: { regionName: firstRegionId }, value: "Kuzey Kuşağı" } });
    controller.onPaletteInput({ target: { dataset: { layerName: String(movedLayerId) }, value: "Dağ Dokusu" } });
    assert(controller.regionById(meta, firstRegionId).name === "Kuzey Kuşağı", "Bölge adı kaydedilmedi.");
    assert(meta.layers[String(movedLayerId)].name === "Dağ Dokusu", "Katman adı kaydedilmedi.");

    const firstLayerId = controller.regionById(meta, firstRegionId).layerOrder.find(id => id !== movedLayerId);
    await controller.onPaletteClick(paletteEvent({ action: "region-visibility", regionId: firstRegionId }));
    assert(controller.regionById(meta, firstRegionId).visible === false, "Bölge görünürlüğü kapanmadı.");
    await controller.onPaletteClick(paletteEvent({ action: "region-visibility", regionId: firstRegionId }));
    await controller.onPaletteClick(paletteEvent({ action: "layer-visibility", layerId: String(firstLayerId) }));
    assert(meta.layers[String(firstLayerId)].visible === false, "Katman görünürlüğü kapanmadı.");
    await controller.onPaletteClick(paletteEvent({ action: "layer-visibility", layerId: String(firstLayerId) }));

    const moved = controller.commitPaintTreeDrop({ type: "layer", layerId: movedLayerId }, secondRegionId, secondLayerId, true);
    assert(moved === true, "Katman sürükle-bırak işlemi reddedildi.");
    meta = controller.currentPaintMeta();
    assert(meta.layers[String(movedLayerId)].regionId === secondRegionId, "Katmanın regionId alanı taşıma sonrası güncellenmedi.");
    assert(controller.regionById(meta, secondRegionId).layerOrder.includes(movedLayerId), "Taşınan katman hedef bölgede yok.");
    // Sürükleme biterken oluşan sentetik click'in aynı düğmeyi yanlışlıkla
    // çalıştırmaması için üretim kodunda 300 ms bastırma penceresi vardır.
    now += 400;

    controller.state.pixelPaint.surface.push({ paintLayer: firstLayerId, x: 1, z: 1 }, { paintLayer: movedLayerId, x: 2, z: 2 });
    controller.state.mapImages = [
        { id: "keep", path: "keep.png", layerKey: "surface", paintLayer: firstLayerId },
        { id: "clear", path: "clear.png", layerKey: "surface", paintLayer: movedLayerId }
    ];
    await controller.onPaletteClick(paletteEvent({ action: "clear-layer", layerId: String(movedLayerId) }));
    assert(controller.currentPaintRecords().every(record => Number(record.paintLayer) !== movedLayerId), "Katman temizleme boya kaydını bırakmış.");
    assert(controller.currentMapImages().every(image => Number(image.paintLayer) !== movedLayerId), "Katman temizleme görsel kaydını bırakmış.");
    assert(controller.currentPaintRecords().some(record => Number(record.paintLayer) === firstLayerId), "Katman temizleme başka katmanın boyasını sildi.");

    controller.state.pixelPaint.surface.push({ paintLayer: movedLayerId, x: 3, z: 3 });
    controller.state.mapImages.push({ id: "delete-with-layer", path: "delete.png", layerKey: "surface", paintLayer: movedLayerId });
    await controller.onPaletteClick(paletteEvent({ action: "delete-layer", layerId: String(movedLayerId) }));
    meta = controller.currentPaintMeta();
    assert(!meta.layers[String(movedLayerId)], "Katman silinemedi.");
    assert(!controller.currentPaintRecords().some(record => Number(record.paintLayer) === movedLayerId), "Silinen katmanın boyası kaldı.");
    assert(!controller.currentMapImages().some(image => Number(image.paintLayer) === movedLayerId), "Silinen katmanın görseli kaldı.");

    await controller.onPaletteClick(paletteEvent({ action: "delete-layer", layerId: String(secondLayerId) }));
    meta = controller.currentPaintMeta();
    assert(meta.layers[String(secondLayerId)], "Bölgenin son katmanı silinerek minimum sözleşmesi bozuldu.");
    controller.state.pixelPaint.surface.push({ paintLayer: secondLayerId, x: 4, z: 4 });
    controller.state.mapImages.push({ id: "region-image", path: "region.png", layerKey: "surface", paintLayer: secondLayerId });
    await controller.onPaletteClick(paletteEvent({ action: "delete-region", regionId: secondRegionId }));
    meta = controller.currentPaintMeta();
    assert(meta.regions.length === 1 && !meta.layers[String(secondLayerId)], "Bölge ve bağlı katmanı silinemedi.");
    assert(!controller.currentPaintRecords().some(record => Number(record.paintLayer) === secondLayerId), "Silinen bölgenin boyası kaldı.");
    assert(!controller.currentMapImages().some(image => Number(image.paintLayer) === secondLayerId), "Silinen bölgenin görseli kaldı.");
    await controller.onPaletteClick(paletteEvent({ action: "delete-region", regionId: firstRegionId }));
    assert(controller.currentPaintMeta().regions.length === 1, "Son bölge silinerek minimum sözleşmesi bozuldu.");

    meta = controller.currentPaintMeta();
    const imageLayerId = meta.activeLayerId;
    meta.layers[String(imageLayerId)].kind = "image";
    controller.openMapImagePicker = realOpenMapImagePicker;
    controller.bridge.openJoAMapImagePicker = () => { imagePickerCalls++; return true; };
    controller.renderer = { localInteractionReady: () => false, lastView: { halfW: 450_000_000 }, camera: { targetX: 0, targetZ: 0 } };
    controller.imageAspect = async () => 2;
    controller.state.mapImages = [];
    assert(controller.openMapImagePicker(imageLayerId) === true, "Uzak atlas görünümünde resim seçicisi gereksiz yerel-zoom kapısına takıldı.");
    assert(await controller.addMapImage("atlas-wide.png", imageLayerId) === true, "Uzak atlas görünümünde görsel katmana eklenemedi.");
    const atlasImage = controller.mapImageForLayer(imageLayerId);
    assert(atlasImage?.widthM === 324_000_000 && atlasImage?.heightM === 162_000_000, `Atlas görseli kadraja göre boyutlanmadı: ${atlasImage?.widthM}×${atlasImage?.heightM}`);
    controller.state.mapImages = [];
    meta.layers[String(imageLayerId)].imageId = "locked-image";
    controller.state.mapImages = [{ id: "locked-image", path: "locked.png", layerKey: "surface", paintLayer: imageLayerId, locked: false }];
    assert(await controller.onMapImageAction("locked-image", "lock") === true, "Görsel kilitlenemedi.");
    assert(controller.mapImageRecord("locked-image").locked === true, "Görsel kilit durumu kayda yazılmadı.");
    assert(await controller.onMapImageAction("locked-image", "delete") === false, "Kilitli görsel silindi.");
    assert(await controller.onMapImageAction("locked-image", "lock") === true, "Görsel kilidi açılamadı.");
    assert(await controller.onMapImageAction("locked-image", "delete") === true, "Kilidi açık görsel silinemedi.");
    assert(controller.currentMapImages().length === 0 && meta.layers[String(imageLayerId)].imageId === "", "Görsel silme katman bağını temizlemedi.");

    meta.layers[String(imageLayerId)].kind = "image";
    controller.setPaintTool("paint");
    assert(controller.paintTool === "image", "Resim katmanı çizim aracına geçirilebildi.");
    assert(controller.beginPaintStroke() === false, "Resim katmanında boya darbesi başladı.");
    meta.layers[String(imageLayerId)].kind = "paint";
    controller.setPaintTool("not-a-tool");
    assert(controller.paintTool === "paint", "Geçersiz araç güvenli varsayılana dönmedi.");

    controller.onPaletteInput({ target: { dataset: { role: "lightness" }, value: "999" } });
    controller.onPaletteInput({ target: { dataset: { role: "opacity" }, value: "-5" } });
    controller.onPaletteInput({ target: { dataset: { role: "brush-size" }, value: "-5" } });
    controller.onPaletteInput({ target: { dataset: { role: "softness" }, value: "999" } });
    assert(controller.paintLightness === 96 && controller.paintOpacity === 0 && controller.paintBrush === 1 && controller.paintSoftness === 100, "Palet slider sınırları uygulanmadı.");
    pass("Bölge/katman CRUD", "ekle, adlandır, göster/gizle, taşı, temizle, sil ve minimum koruması");
    pass("JoA menü eylemleri", "17/17 düğme yolu: aç/kapat, galeri, seç, tür, sınır, görünürlük, CRUD ve lejant");
    pass("Resim katmanı", "gerçek galeri çağrısı · uzak atlas ekleme · kadraj boyutu · kilit/silme/bağ koruması");
    pass("Palet değerleri", "ışık, opaklık, fırça ve yumuşaklık sınırları");
}

async function testCommonModalRuntime() {
    const legacySource = fs.readFileSync(path.join(appRoot, "legacy/legacy-app.js"), "utf8");
    const start = legacySource.indexOf("const showV2Modal =");
    const end = legacySource.indexOf("// Sürümden bağımsız veri taşıma kasası", start);
    assert(start >= 0 && end > start, "showV2Modal kaynağı ayrıştırılamadı.");
    const mainPanel = new FakeNode("main");
    const document = {
        activeElement: null,
        createElement: tag => new FakeNode(tag)
    };
    const sandbox = {
        mainPanel,
        document,
        requestAnimationFrame(callback) { callback(); return 1; }
    };
    sandbox.window = sandbox;
    const context = vm.createContext(sandbox);
    vm.runInContext(`${legacySource.slice(start, end)}\nglobalThis.__showV2ModalForTest=showV2Modal;`, context, { filename: "showV2Modal.extract.js" });
    const show = sandbox.__showV2ModalForTest;
    assert(typeof show === "function", "showV2Modal test fonksiyonu yüklenmedi.");

    let customCancelCount = 0;
    let modal = show({ title: "Test", body: new FakeNode("div") });
    const actions = modal.box.childNodes.at(-1);
    const cancel = actions.childNodes.at(-2);
    cancel.onclick = () => { customCancelCount++; modal.shade.remove(); };
    const escapeHandler = modal.shade.listeners.get("keydown")?.[0];
    assert(typeof escapeHandler === "function", "Ortak modal keydown listener'ı kurulmadı.");
    escapeHandler(makeKeyEvent({ key: "Escape", code: "Escape" }));
    assert(customCancelCount === 1 && !modal.shade.isConnected, "Esc gerçek İptal callback'ini çalıştırmadı.");

    modal = show({ title: "Backdrop", body: "İçerik" });
    const backdropActions = modal.box.childNodes.at(-1), backdropCancel = backdropActions.childNodes.at(-2);
    backdropCancel.onclick = () => { customCancelCount++; modal.shade.remove(); };
    modal.shade.onclick({ target: modal.shade });
    assert(customCancelCount === 2 && !modal.shade.isConnected, "Dış yüzeye tıklama gerçek İptal callback'ini çalıştırmadı.");

    let saveAllowed = false, saveAttempts = 0;
    modal = show({ title: "Save", body: "İçerik", onSave: () => { saveAttempts++; return saveAllowed; } });
    await modal.save.onclick();
    assert(modal.shade.isConnected && saveAttempts === 1, "onSave=false modalı açık tutmadı.");
    saveAllowed = true;
    await modal.save.onclick();
    assert(!modal.shade.isConnected && saveAttempts === 2, "Başarılı kayıt modalı kapatmadı.");
    pass("Ortak modal davranışı", "Esc/backdrop özel İptal callback'i · başarısız kayıt açık · başarılı kayıt kapalı");
}

function testStaticUiCoverage() {
    const joaSource = fs.readFileSync(path.join(appRoot, "modules/joa-world/joa-world.module.js"), "utf8");
    const shortcutSource = fs.readFileSync(path.join(appRoot, "modules/application/shortcuts.module.js"), "utf8");
    const legacySource = fs.readFileSync(path.join(appRoot, "legacy/legacy-app.js"), "utf8");

    const renderedActions = [...new Set([...joaSource.matchAll(/data-action="([^"]+)"/g)].map(match => match[1]))].sort();
    const handledActions = new Set([...joaSource.matchAll(/button\.dataset\.action==="([^"]+)"/g)].map(match => match[1]));
    const missingActions = renderedActions.filter(action => !handledActions.has(action));
    assert(!missingActions.length, `İşleyicisi olmayan JoA düğmeleri: ${missingActions.join(", ")}`);
    assert(renderedActions.length === 17, `Beklenen 17 JoA data-action yerine ${renderedActions.length} bulundu.`);
    assert(renderedActions.includes("pick-layer-image") && joaSource.includes('button.dataset.action==="pick-layer-image"'), "Resim katmanı galeri düğmesi gerçek picker eylemine bağlı değil.");
    assert(joaSource.includes("this.onGlobalKeyUp=()=>{};") && !joaSource.includes('if(event.code==="KeyF")this.inventoryFocusIntent=false'), "Ctrl+E/Ctrl+F komutu keyup sırasında hâlâ düşürülüyor.");
    assert(joaSource.includes('inventoryOnly:true,inventoryCommand') && joaSource.includes('this.setInventoryCommand("place")'), "Map → Mevcudat Ctrl komut yönlendirmesi eksik.");
    assert(joaSource.includes("const JOA_MAP_IMAGE_MAX_M=Number.MAX_VALUE/64") && joaSource.includes("Number(view.halfW)*.72"), "Resim katmanı hâlâ 100.000 m ürün tavanına bağlı.");

    const imageActions = [...new Set([...joaSource.matchAll(/data-image-action="([^"]+)"/g)].map(match => match[1]))].sort();
    assert(JSON.stringify(imageActions) === JSON.stringify(["delete", "lock", "resize"]), "Resim düğmesi sözleşmesi değişmiş.");
    assert(joaSource.includes('if(action==="lock")') && joaSource.includes('if(action==="delete")') && joaSource.includes('mode=action==="resize"?"resize":"move"'), "Resim lock/delete/resize işleyicisi eksik.");

    const worldLayerButtons = [...joaSource.matchAll(/data-world-layer="(surface|sky|underground|cosmic)"/g)].map(match => match[1]);
    assert(new Set(worldLayerButtons).size === 4, "Dört dünya katmanı düğmesi yok.");
    for (const [digit, layer] of Object.entries({ 1: "surface", 2: "sky", 3: "underground", 4: "cosmic" })) {
        assert(joaSource.includes(`${digit}:"${layer}"`) || joaSource.includes(`${digit}:\"${layer}\"`), `${digit} → ${layer} klavye eşlemesi yok.`);
    }

    const globalListenerPairs = [
        ["resize", "onResize"],
        ["alek:resource-state", "onResource"],
        ["keydown", "onGlobalKeyDown"],
        ["keyup", "onGlobalKeyUp"],
        ["pointermove", "onGlobalPointerMove"],
        ["pointerup", "onGlobalPointerUp"],
        ["pointercancel", "onGlobalPointerUp"],
        ["blur", "onPaintWindowBlur"],
        ["visibilitychange", "onPaintVisibilityChange"],
        ["alek:joa-entity-updated", "onEntityUpdate"],
        ["alek:joa-travel-progress", "onTravelProgress"],
        ["alek:joa-route-cancelled", "onRouteCancelled"],
        ["alek:joa-time-refreshed", "onTimeRefreshed"],
        ["alek:joa-travel-groups-changed", "onTravelGroupsChanged"],
        ["alek:joa-map-image-selected", "onMapImageSelected"]
    ];
    for (const [type, property] of globalListenerPairs) {
        assert(joaSource.includes(`addEventListener("${type}",this.${property}`), `${type}/${property} listener kurulumu yok.`);
        assert(joaSource.includes(`removeEventListener("${type}",this.${property}`), `${type}/${property} listener temizliği yok.`);
    }

    const modalStart = legacySource.indexOf("const showV2Modal =");
    const modalEnd = legacySource.indexOf("// Sürümden bağımsız veri taşıma kasası", modalStart);
    const modalSource = legacySource.slice(modalStart, modalEnd);
    assert(modalSource.includes('e.key !== "Escape"') && modalSource.includes("cancel.click()"), "Ortak modal Esc ile gerçek İptal yolundan kapanmıyor.");
    assert(modalSource.includes("if(e.target === shade) cancel.click()"), "Ortak modal dış yüzeye tıklamada İptal yolunu çalıştırmıyor.");
    assert(shortcutSource.includes("if(blocked())return; // Kağıt/modal/drawer/palet kendi Esc işleyicisine ulaşsın."), "Uygulama Esc önceliği ortak modal ile uyumlu değil.");
    assert(shortcutSource.includes('document.querySelector(".alek-emoji-keyboard")') && shortcutSource.includes("window.__alekCloseEmojiKeyboard?.()"), "İmge Klavyesi merkezi Esc yoluna bağlı değil.");
    assert(legacySource.includes("window.__alekCloseEmojiKeyboard=()") && legacySource.includes("window.__alekDismissPrimaryNavigationOverlays") && legacySource.includes("window.__alekCloseEmojiKeyboard?.();"), "İmge Klavyesi ana yüzey geçişi temizliğine bağlı değil.");
    assert(legacySource.includes("Yeni Mekân oluşturur ve 5 × 5 m piyonla yerleştirme moduna alır"), "Kısayol rehberindeki mekân ölçeği 5×5 m değil.");

    pass("Düğme/işleyici kapsaması", `${renderedActions.length} JoA eylemi · 0 sahipsiz düğme · ${imageActions.length} resim eylemi`);
    pass("Dört katman klavyesi", "1–4 düğme ve tuş eşleşmeleri");
    pass("Global listener yaşam döngüsü", `${globalListenerPairs.length} kurulum/temizlik çifti`);
    pass("Ortak modal yaşam döngüsü", "Esc ve dış tıklama gerçek İptal yolu · İmge Klavyesi temizliği · rehber 5×5 m");
}

(async () => {
    await testApplicationShortcuts();
    await testLayerCrudAndImages();
    await testCommonModalRuntime();
    testStaticUiCoverage();
    console.log(JSON.stringify({ ok: true, checks }, null, 2));
})().catch(error => {
    console.error(JSON.stringify({ ok: false, checks, error: String(error?.stack || error) }, null, 2));
    process.exitCode = 1;
});
