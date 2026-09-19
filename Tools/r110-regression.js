#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const childProcess = require("child_process");

const root = path.resolve(__dirname, "..");
const appRoot = path.join(root, "Alekrythae.App");
const checks = [];
const failures = [];
const pass = (name, detail = "OK") => checks.push({ name, detail });
const fail = (name, error) => failures.push({ name, error: String(error?.message || error) });
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function filesBelow(directory, predicate) {
    const output = [];
    const visit = current => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const target = path.join(current, entry.name);
            if (entry.isDirectory()) visit(target);
            else if (predicate(target)) output.push(target);
        }
    };
    visit(directory);
    return output.sort();
}

function cssBalanced(source) {
    let depth = 0;
    let quote = "";
    let comment = false;
    for (let index = 0; index < source.length; index++) {
        const char = source[index], next = source[index + 1];
        if (comment) {
            if (char === "*" && next === "/") { comment = false; index++; }
            continue;
        }
        if (quote) {
            if (char === "\\") { index++; continue; }
            if (char === quote) quote = "";
            continue;
        }
        if (char === "/" && next === "*") { comment = true; index++; continue; }
        if (char === "\"" || char === "'") { quote = char; continue; }
        if (char === "{") depth++;
        else if (char === "}" && --depth < 0) return false;
    }
    return depth === 0 && !comment && !quote;
}

try {
    const sources = [path.join(root, "Alekrythae.alek"), ...filesBelow(appRoot, file => file.endsWith(".js")), ...filesBelow(path.join(root, "Tools"), file => file.endsWith(".js"))];
    for (const filename of sources) new vm.Script(fs.readFileSync(filename, "utf8"), { filename });
    pass("JavaScript sözdizimi", `${sources.length} dosya`);
} catch (error) { fail("JavaScript sözdizimi", error); }

let manifest;
try {
    const raw = childProcess.execFileSync(process.execPath, [path.join(appRoot, "tests/r112-boot-loader.test.js")], {encoding: "utf8"});
    const parsed = JSON.parse(raw);
    assert(parsed.ok === true && parsed.checks.length === 13, "Açılış yükleyici testi başarısız.");
    pass("Açılış: yerel dosya ve sanal adres", `${parsed.checks.length} senaryo · gerçek CSS · hata/eksik dosya yolları`);
} catch (error) { fail("Açılış: yerel dosya ve sanal adres", error); }

try {
    const rootManifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
    manifest = JSON.parse(fs.readFileSync(path.join(appRoot, "manifest.json"), "utf8"));
    assert(JSON.stringify(rootManifest) === JSON.stringify(manifest), "Kök ve uygulama manifestleri farklı.");
    assert(manifest.version === "1.0.0", `Beklenmeyen sürüm: ${manifest.version}`);
    assert(Number(manifest.architectureRevision) === 215, `Beklenmeyen mimari: ${manifest.architectureRevision}`);
    const appReferences = [...manifest.preloads, ...manifest.modules, ...manifest.styles, ...(manifest.postStyles || [])];
    const missing = appReferences.filter(relative => !fs.existsSync(path.join(appRoot, relative)));
    assert(!missing.length, `Eksik manifest girdileri: ${missing.join(", ")}`);
    assert(fs.existsSync(path.join(root, manifest.entry)), `Giriş dosyası eksik: ${manifest.entry}`);
    const entrySource = fs.readFileSync(path.join(root, manifest.entry), "utf8");
    assert(entrySource.includes('version:"1.0.0"') && entrySource.includes("architectureRevision:215"), "Gömülü fallback manifest v1.0.0/215 değil.");
    assert(appReferences.every(relative => entrySource.includes(`"${relative}"`)), "Gömülü fallback manifestte eksik yol var.");
    assert(entrySource.includes("window.__ALEK_EXTERNAL_MANIFEST__"), "Core manifest enjeksiyonu girişte tüketilmiyor.");
    pass("Manifest tek-kaynak ve dosya yolları", `${appReferences.length + 1} girdi`);
} catch (error) { fail("Manifest tek-kaynak ve dosya yolları", error); }

try {
    const cssFiles = filesBelow(appRoot, file => file.endsWith(".css"));
    for (const filename of cssFiles) assert(cssBalanced(fs.readFileSync(filename, "utf8")), `Dengesiz CSS: ${path.relative(root, filename)}`);
    const paletteCss = fs.readFileSync(path.join(appRoot, "modules/joa-world/joa-world.css"), "utf8");
    const mapJs = fs.readFileSync(path.join(appRoot, "modules/joa-world/joa-world.module.js"), "utf8");
    assert(paletteCss.includes('[data-layout-revision="r109"]'), "Kompakt palet uyumluluk yerleşimi yok.");
    assert(paletteCss.includes('[data-behavior-revision="r109"]'), "Kompakt palet uyumluluk davranışı yok.");
    assert(mapJs.includes('host.dataset.layoutRevision="r109";host.dataset.behaviorRevision="r109"'), "Palet çalışma anındaki uyumluluk sözleşmesi farklı.");
    assert(!paletteCss.includes("parchment-discovery"), "Emekliye ayrılan keşif-parşömeni CSS'i hâlâ yüklü.");
    pass("CSS ve kompakt palet sözleşmesi", `${cssFiles.length} CSS dosyası · ölü keşif stili yok`);
} catch (error) { fail("CSS ve kompakt palet sözleşmesi", error); }

try {
    const registered = [];
    const sandbox = {
        console,
        setTimeout,
        clearTimeout,
        queueMicrotask,
        performance: { now: () => 0 },
        requestAnimationFrame: () => 1,
        cancelAnimationFrame: () => {},
        addEventListener: () => {},
        removeEventListener: () => {}
    };
    sandbox.window = sandbox;
    sandbox.Alekrythae = { registerModule: module => registered.push(module) };
    class FakeNode {
        constructor(tag) { this.tagName = tag; this.attributes = {}; this.dataset = {}; this.childNodes = []; this.textContent = ""; }
        setAttribute(key, value) { this.attributes[key] = String(value); }
        appendChild(child) { this.childNodes.push(child); return child; }
    }
    sandbox.document = { createElementNS: (_namespace, tag) => new FakeNode(tag) };
    const context = vm.createContext(sandbox);
    for (const relative of [
        "modules/world-map/alekrythae-world-profile.js",
        "modules/world-map/surface-taxonomy.js",
        "modules/world-map/chunk-generator.js",
        "modules/joa-world/joa-world.module.js"
    ]) vm.runInContext(fs.readFileSync(path.join(appRoot, relative), "utf8"), context, { filename: relative });

    const world = sandbox.AlekrythaeWorldMap;
    assert(world?.surfaceAtlas?.revision === 111, "Harita motoru R111 değil.");
    assert(world.surfaceAtlas.unbounded === true, "Yüzey atlası sınırsız değil.");
    assert(world.surfaceAtlas.maxContinentDiameterMeters === 240_000_000, "Kıta çapı 240.000 km değil.");
    assert(world.surfaceAtlas.continentContainmentRadiusMeters === 120_000_000, "Kıta kapsama yarıçapı 120.000 km değil.");
    assert(world.surfaceAtlas.targetLandCoverage === .5, "Kara/su hedefi %50/%50 değil.");
    assert(Array.isArray(world.surfaceAtlas.continentForms) && world.surfaceAtlas.continentForms.length === 6, "Altı kıta biçim ailesi yüklenmedi.");
    assert(world.surfaceFolkStyles?.length === 24, "24 diyar stili yüklenmedi.");
    assert(world.cosmicScale?.unbounded === true, "Kamera ürün tavanı hâlâ etkin.");
    assert(world.cosmicScale?.maxViewSpanMeters === Number.MAX_VALUE, "Kamera tavanı IEEE-754 sınırı değil.");
    const cameraDistance = world.cosmicScale.cameraDistanceForViewport(1920, 1080);
    assert(Number.isFinite(cameraDistance) && cameraDistance > 1e300, `Sayısal kamera emniyet tavanı yanlış: ${cameraDistance}`);

    const renderer = Object.create(world.VectorDiscoveryRenderer.prototype);
    renderer.layerKey = "surface";
    const definition = renderer.loreLayerDefinitions();
    const realmLayers = definition.layers.filter(layer => String(layer.id).startsWith("realm-"));
    const oceanLayers = definition.layers.filter(layer => String(layer.id).startsWith("ocean-atlas-"));
    const climateLayers = definition.layers.filter(layer => String(layer.id).startsWith("climate-") && layer.influenceGroup === "climate");
    const topographyLayers = definition.layers.filter(layer => String(layer.id).startsWith("topography-") && layer.influenceGroup === "topography");
    assert(realmLayers.length === 48, `Renderer diyar/geçiş katmanı sayısı: ${realmLayers.length}`);
    assert(oceanLayers.length === 8, `Renderer okyanus/geçiş katmanı sayısı: ${oceanLayers.length}`);
    assert(climateLayers.length === 18, `Renderer iklim/geçiş katmanı sayısı: ${climateLayers.length}`);
    assert(topographyLayers.length === 10, `Renderer topografya/geçiş katmanı sayısı: ${topographyLayers.length}`);
    assert(definition.layers.some(layer => layer.id === "continent-coastline" && layer.contourOnly === true), "Kıta sahil konturu çizgi-only değil.");
    const nonCoastContours = definition.layers.filter(layer => layer.contourOnly === true && layer.id !== "continent-coastline");
    assert(!nonCoastContours.length, `Yol gibi okunan atlas konturları geri geldi: ${nonCoastContours.map(layer => layer.id).join(", ")}`);
    renderer.vectorClipId = "r111-contract";
    const defs = renderer.installVectorDefs("http://www.w3.org/2000/svg", definition);
    const waterPaintIds = new Set(Object.keys(definition.paints).filter(id => /water|ocean|sea|lake|river|fjord|delta|spring|lagoon|pearl|aeth/.test(id) && !id.startsWith("realm-")));
    const waterPatterns = defs.childNodes.filter(node => node.tagName === "pattern" && waterPaintIds.has(String(node.attributes.id || "").replace("r111-contract-", "")));
    assert(waterPatterns.length === waterPaintIds.size, `Su boya tanımı eksik: ${waterPatterns.length}/${waterPaintIds.size}`);
    assert(waterPatterns.every(pattern => pattern.childNodes.every(node => node.tagName !== "path")), "Okyanus/su deseninde tekrar eden dalga çizgisi geri geldi.");
    const reliefPatterns = defs.childNodes.filter(node => node.tagName === "pattern" && /^r111-contract-atlas-(?:upland|mountain|snow|basin|ridge)-(?:shadow|face)$/.test(String(node.attributes.id || "")));
    assert(reliefPatterns.length === 10, `Atlas rölyef boya tanımı eksik: ${reliefPatterns.length}/10`);
    assert(reliefPatterns.every(pattern => pattern.childNodes.length === 1 && pattern.childNodes[0].tagName === "rect"), "Atlas rölyef boyasına tekrar eden sembol/çizgi geri geldi.");

    const columns = 120, rows = 72;
    // Örnekleme VM'in kendi bağlamında yapılır; binlerce host/VM sınır geçişi
    // QA süresini gereksiz yere onlarca saniyeye çıkarmasın.
    const samples = vm.runInContext(`(()=>{const output=[],columns=120,rows=72,span=2400000000,aspect=.60;for(let row=0;row<=rows;row++)for(let column=0;column<=columns;column++){const x=(column/columns-.5)*span,z=(row/rows-.5)*span*aspect;output.push(AlekrythaeWorldMap.visualSampleAt(2152295498,x,z,"surface",8));}return output;})()`, context);
    const labelGroup = new FakeNode("g");
    const labelCount = renderer.appendSurfaceRealmLabels("http://www.w3.org/2000/svg", labelGroup, samples, columns, rows, 0, 0, 1, 1, 8);
    assert(labelCount === 24, `Atlas diyar etiketi sayısı: ${labelCount}`);
    assert(registered.some(module => module.id === "joa.world-experience"), "JoA dünya modülü kayıt olmadı.");
    pass("Renderer/atlas sözleşmesi", "48 diyar + 8 okyanus + 18 iklim + 10 saydam rölyef katmanı · yalnız kıyı konturu · dalgasız su · 24 etiket");
} catch (error) { fail("Renderer/atlas sözleşmesi", error); }

try {
    const mapSource = fs.readFileSync(path.join(appRoot, "modules/joa-world/joa-world.module.js"), "utf8");
    assert(mapSource.includes("const WORLD_LAYERS=Object.freeze([\"surface\",\"sky\",\"underground\",\"cosmic\"]);"), "Dört dünya katmanı sözleşmesi yok.");
    assert(mapSource.includes("const view=this.renderer.lastView||this.renderer.viewport(),region=this.discoveryRegions()[0]||null;"), "Sis aktif piyon görüşüne bağlı değil.");
    assert(mapSource.includes('fog.style.background="#000";fog.style.opacity="1"'), "Görüş dışı tam siyah yedeği yok.");
    assert(!mapSource.includes("pointSeenByAnyPawn"), "Yerleştirme başka piyonların eski görüşünü hâlâ kullanıyor.");
    assert(!mapSource.includes("parchmentDiscovery") && !mapSource.includes("discoveryPointer"), "Ölü keşif-parşömeni durumu hâlâ bellekte.");
    assert(mapSource.includes("this.isDiscoveredPoint(target)"), "Yerleştirme aktif görüş alanını doğrulamıyor.");
    pass("Görüş, katman ve etkileşim sözleşmesi", "4 katman · aktif piyon dairesi · dışarısı #000");
} catch (error) { fail("Görüş, katman ve etkileşim sözleşmesi", error); }

try {
    const raw = childProcess.execFileSync(process.execPath, [path.join(appRoot, "tests/r110-ui-contract.test.js")], { encoding: "utf8" });
    const parsed = JSON.parse(raw);
    assert(parsed.ok === true, "UI sözleşme testi başarısız.");
    assert(Array.isArray(parsed.checks) && parsed.checks.length === 11, `Beklenen 11 UI doğrulama başlığı yerine ${parsed.checks?.length || 0} bulundu.`);
    pass("Kısayol, modal ve katman CRUD", `${parsed.checks.length} başlık · uygulama+JoA tuşları · 17 düğme · 15 listener çifti`);
} catch (error) { fail("Kısayol, modal ve katman CRUD", error); }

try {
    const mapSource = fs.readFileSync(path.join(appRoot, "modules/joa-world/joa-world.module.js"), "utf8");
    const legacySource = fs.readFileSync(path.join(appRoot, "legacy/legacy-app.js"), "utf8");
    const bridgeStart = legacySource.indexOf("window.__ALEK_LEGACY_BRIDGE__=Object.freeze({");
    assert(bridgeStart >= 0, "Legacy köprü nesnesi bulunamadı.");
    const bridgeSource = legacySource.slice(bridgeStart);
    const bridgeCalls = [...new Set([...mapSource.matchAll(/this\.bridge\.([A-Za-z_$][\w$]*)/g)].map(match => match[1]))].sort();
    const missing = bridgeCalls.filter(name => !(new RegExp(`\\n\\s*(?:async\\s+)?${name}\\s*\\(`)).test(bridgeSource));
    assert(!missing.length, `JoA çağrısı için köprü metodu yok: ${missing.join(", ")}`);
    assert(!bridgeSource.includes("ensureAdventureParty(){return null;}"), "Boş Adventure Party köprü stub'ı hâlâ mevcut.");
    pass("JoA ↔ Legacy köprü paritesi", `${bridgeCalls.length} çağrı · 0 eksik metot · 0 boş stub`);
} catch (error) { fail("JoA ↔ Legacy köprü paritesi", error); }

try {
    const manifestScripts = new Set([...(manifest.preloads || []), ...(manifest.modules || [])]);
    const registered = [];
    for (const filename of filesBelow(appRoot, file => file.endsWith(".js"))) {
        const source = fs.readFileSync(filename, "utf8");
        const relative = path.relative(appRoot, filename).split(path.sep).join("/");
        const ids = [...source.matchAll(/registerModule\s*\(\s*\{\s*id\s*:\s*"([^"]+)"/g)].map(match => match[1]);
        if (ids.length) assert(manifestScripts.has(relative), `Modül kayıt ediyor ama manifestte yok: ${relative}`);
        ids.forEach(id => registered.push({ id, relative }));
    }
    const duplicateIds = registered.filter((item, index) => registered.findIndex(other => other.id === item.id) !== index);
    assert(!duplicateIds.length, `Yinelenen modül kimliği: ${duplicateIds.map(item => item.id).join(", ")}`);
    assert(registered.length === 10, `Beklenen 10 çalışma modülü yerine ${registered.length} bulundu.`);
    assert(!fs.existsSync(path.join(appRoot, "modules/joa-world/grid-system.js")), "Manifest dışı eski grid sistemi hâlâ kaynakta.");
    pass("Modül bağlantı denetimi", `${registered.length} benzersiz çalışma modülü · manifest dışı kayıt yok`);
} catch (error) { fail("Modül bağlantı denetimi", error); }

try {
    const testRoot = path.join(appRoot, "tests") + path.sep;
    const sourceFiles = [path.join(root, "Alekrythae.alek"), ...filesBelow(appRoot, file => /\.(?:js|css)$/i.test(file) && !file.startsWith(testRoot))];
    const missing = [];
    let literalCount = 0;
    for (const filename of sourceFiles) {
        const source = fs.readFileSync(filename, "utf8");
        for (const match of source.matchAll(/https:\/\/alek-assets\.local\/([^\s"'`)<>{}]+)/g)) {
            const relative = decodeURIComponent(match[1].split(/[?#]/)[0]);
            if (relative.includes("$")) continue;
            literalCount++;
            if (!fs.existsSync(path.join(root, relative))) missing.push(`${path.relative(root, filename)} → ${relative}`);
        }
    }
    assert(!missing.length, `Eksik yerel varlık: ${missing.join(", ")}`);
    pass("Yerel görsel/medya yolları", `${literalCount} sabit başvuru · 0 eksik dosya`);
} catch (error) { fail("Yerel görsel/medya yolları", error); }

try {
    const raw = childProcess.execFileSync(process.execPath, [path.join(appRoot, "tests/r110-world-engine.test.js")], { encoding: "utf8" });
    const parsed = JSON.parse(raw);
    assert(parsed.ok === true && parsed.containmentViolations === 0, "Kıta motoru sözleşme testi başarısız.");
    assert(parsed.visibleForms?.length === 6, `Kıta biçimleri eksik: ${parsed.visibleForms?.join(", ") || "yok"}`);
    pass("240.000 km kıta sözleşmesi", `${parsed.results.length} çekirdek · ${parsed.visibleForms.length}/6 biçim · ${parsed.visibleFamilies} aile · ${parsed.atlasLand} kara örneği · 0 taşma`);
} catch (error) { fail("240.000 km kıta sözleşmesi", error); }

const mapReports = [];
try {
    for (const seed of [1, 24, 42, 314159, 8675309, 2152295498]) {
        const raw = childProcess.execFileSync(process.execPath, [
            path.join(__dirname, "map-engine-diagnostics.js"),
            "--assert", "--seed", String(seed), "--span-km", "10000000", "--width", "240", "--height", "144"
        ], { encoding: "utf8" });
        const parsed = JSON.parse(raw);
        assert(parsed.ok === true, `Seed ${seed} başarısız.`);
        mapReports.push(parsed.report);
    }
    const land = mapReports.map(report => report.landPercent);
    assert(mapReports.every(report => report.visibleRealmCount >= 20), "Bir veya daha fazla seed yeterli diyar çeşitliliği göstermiyor.");
    assert(mapReports.every(report => report.containmentViolations === 0 && report.farCoordinatesFinite), "Bir seed kıta sınırı/uzak koordinat sözleşmesini bozuyor.");
    assert(mapReports.every(report => report.targetLandCoverage === .5), "Bir veya daha fazla seed %50/%50 hedefini yayımlamıyor.");
    assert(mapReports.every(report => report.visibleContinentForms?.length === 6), "Bir veya daha fazla seed altı kıta biçimini göstermiyor.");
    assert(mapReports.every(report => report.visibleContinentSizeClasses?.length === 3), "Bir veya daha fazla seed üç kıta boyut sınıfını göstermiyor.");
    assert(mapReports.every(report => report.stochasticPhaseBins >= 12), "Bir veya daha fazla seed düzenli/sıralı merkez dağılımına düştü.");
    pass("Çoklu-seed harita regresyonu", `%${Math.min(...land).toFixed(2)}-%${Math.max(...land).toFixed(2)} kara · 6/6 seed · 6/6 biçim · 3/3 boyut · 0 kıta taşması`);
} catch (error) { fail("Çoklu-seed harita regresyonu", error); }

const output = {
    ok: failures.length === 0,
    version: manifest?.version || "unknown",
    checks,
    failures,
    mapReports: mapReports.map(report => ({
        seed: report.seed,
        landPercent: report.landPercent,
        waterPercent: report.waterPercent,
        targetLandCoverage: report.targetLandCoverage,
        significantContinents: report.significantContinentFamilies,
        continentForms: report.visibleContinentForms,
        continentSizeClasses: report.visibleContinentSizeClasses,
        supercontinents: report.supercontinentFamilies,
        stochasticPhaseBins: report.stochasticPhaseBins,
        visibleRealms: report.visibleRealmCount,
        oceanBasins: report.visibleOceanBasins,
        containmentViolations: report.containmentViolations,
        folkTransitionPercent: report.folkTransitionPercent,
        climateTransitionPercent: report.climateTransitionPercent,
        topographyTransitionPercent: report.topographyTransitionPercent,
        deterministic: report.deterministic,
        farCoordinatesFinite: report.farCoordinatesFinite,
        originWalkable: report.originIsWalkable
    }))
};
console.log(JSON.stringify(output, null, 2));
if (failures.length) process.exitCode = 1;
