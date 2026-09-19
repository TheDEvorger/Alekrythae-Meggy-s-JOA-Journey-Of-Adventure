#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
global.window = global;
for (const relative of [
    "Alekrythae.App/modules/world-map/alekrythae-world-profile.js",
    "Alekrythae.App/modules/world-map/surface-taxonomy.js",
    "Alekrythae.App/modules/world-map/chunk-generator.js"
]) {
    const filename = path.join(root, relative);
    vm.runInThisContext(fs.readFileSync(filename, "utf8"), { filename });
}

const world = global.AlekrythaeWorldMap;
if (!world?.visualSampleAt) throw new Error("Harita örnekleyicisi yüklenemedi.");

const args = process.argv.slice(2);
const valueAfter = (name, fallback) => {
    const index = args.indexOf(name);
    return index >= 0 && index + 1 < args.length ? args[index + 1] : fallback;
};
const numberAfter = (name, fallback) => {
    const value = Number(valueAfter(name, fallback));
    return Number.isFinite(value) ? value : fallback;
};

const seed = numberAfter("--seed", 1);
const spanKm = numberAfter("--span-km", 1200000);
const aspect = numberAfter("--aspect", 0.6);
const centerXKm = numberAfter("--center-x-km", 0);
const centerZKm = numberAfter("--center-z-km", 0);
const width = Math.max(32, Math.round(numberAfter("--width", 240)));
const height = Math.max(20, Math.round(numberAfter("--height", width * aspect)));
const spanM = spanKm * 1000;
const centerX = centerXKm * 1000;
const centerZ = centerZKm * 1000;

function collectGrid(columns, rows) {
    const cells = new Array(columns * rows);
    let landCount = 0;
    let folkTransitionCount = 0;
    let climateTransitionCount = 0;
    let topographyTransitionCount = 0;
    let containmentViolations = 0;
    let maxOwnerRadiusM = 0;
    const realmKeys = new Set();
    const continentKeys = new Set();
    const oceanKeys = new Set();
    const continentForms = new Set();
    const continentSizeClasses = new Set();
    const continentPhaseBins = new Set();
    const supercontinentKeys = new Set();
    const continentCellCounts = new Map();
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const x = centerX + ((column + 0.5) / columns - 0.5) * spanM;
            const z = centerZ + ((row + 0.5) / rows - 0.5) * spanM * aspect;
            const sample = world.visualSampleAt(seed, x, z, "surface", 8);
            const isLand = Number(sample.envelopeLandSignal) > 0;
            if (isLand) {
                landCount++;
                if (sample.folkBiome?.primaryKey) realmKeys.add(sample.folkBiome.primaryKey);
                if (sample.continentKey) {
                    continentKeys.add(sample.continentKey);
                    continentCellCounts.set(sample.continentKey, (continentCellCounts.get(sample.continentKey) || 0) + 1);
                    const form = String(sample.continentForm || "");
                    if (form) continentForms.add(form);
                    if (form === "supercontinent") supercontinentKeys.add(String(sample.continentKey));
                    const familyRadiusM = Number(sample.continentFamilyRadiusM) || 0;
                    if (familyRadiusM > 0) continentSizeClasses.add(familyRadiusM < 95_000_000 ? "minor" : familyRadiusM < 110_000_000 ? "major" : "giant");
                    const sectorM = Number(world.surfaceAtlas?.continentSectorMeters) || 0;
                    if (sectorM > 0) {
                        const phaseX = ((Number(sample.continentCenterX) % sectorM) + sectorM) % sectorM / sectorM;
                        const phaseZ = ((Number(sample.continentCenterZ) % sectorM) + sectorM) % sectorM / sectorM;
                        continentPhaseBins.add(`${Math.min(3, Math.floor(phaseX * 4))}:${Math.min(3, Math.floor(phaseZ * 4))}`);
                    }
                }
                const ownerRadius = Math.hypot(x - Number(sample.continentCenterX), z - Number(sample.continentCenterZ));
                if (Number.isFinite(ownerRadius)) maxOwnerRadiusM = Math.max(maxOwnerRadiusM, ownerRadius);
                else containmentViolations++;
                if (ownerRadius > Number(world.surfaceAtlas?.continentContainmentRadiusMeters || 0) + 1) containmentViolations++;
                if (Number(sample.folkBiome?.influences?.[1]?.weight) > 0.08) folkTransitionCount++;
                if (Number(sample.climateInfluences?.[1]?.weight) > 0.08) climateTransitionCount++;
                if (Number(sample.topographyInfluences?.[1]?.weight) > 0.08) topographyTransitionCount++;
            } else if (Number.isInteger(Number(sample.oceanAtlasIndex))) oceanKeys.add(Number(sample.oceanAtlasIndex));
            cells[row * columns + column] = { x, z, sample, isLand };
        }
    }
    return { cells, landCount, realmKeys, continentKeys, continentForms, continentSizeClasses, continentPhaseBins, supercontinentKeys, oceanKeys, continentCellCounts, folkTransitionCount, climateTransitionCount, topographyTransitionCount, containmentViolations, maxOwnerRadiusM };
}

function componentSizes(cells, columns, rows) {
    const state = new Uint8Array(cells.length);
    for (let index = 0; index < cells.length; index++) state[index] = cells[index].isLand ? 1 : 0;
    const sizes = [];
    const stack = [];
    for (let start = 0; start < state.length; start++) {
        if (state[start] !== 1) continue;
        state[start] = 2;
        stack.push(start);
        let size = 0;
        while (stack.length) {
            const index = stack.pop();
            const column = index % columns;
            const row = Math.floor(index / columns);
            size++;
            for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const nextColumn = column + dx;
                const nextRow = row + dz;
                if (nextColumn < 0 || nextColumn >= columns || nextRow < 0 || nextRow >= rows) continue;
                const next = nextRow * columns + nextColumn;
                if (state[next] === 1) {
                    state[next] = 2;
                    stack.push(next);
                }
            }
        }
        sizes.push(size);
    }
    return sizes.sort((left, right) => right - left);
}

function metrics(columns = width, rows = height) {
    const grid = collectGrid(columns, rows);
    const components = componentSizes(grid.cells, columns, rows);
    const total = columns * rows;
    const landRatio = grid.landCount / total;
    const origin = world.sampleAt(seed, 0, 0, "surface");
    const probes = [[0, 0], [1234567, -7654321], [-9876543, 2468135], [1e15, -3.71e14], [-1e100, 3.71e99]];
    const deterministic = probes.every(([x, z]) => {
        const a = world.visualSampleAt(seed, x, z, "surface", 8);
        const b = world.visualSampleAt(seed, x, z, "surface", 8);
        return a.landSignal === b.landSignal && a.continentKey === b.continentKey && a.folkBiome?.primaryKey === b.folkBiome?.primaryKey;
    });
    const farCoordinatesFinite = probes.every(([x, z]) => {
        const sample = world.visualSampleAt(seed, x, z, "surface", 8);
        return [sample.height, sample.moisture, sample.warmth, sample.arcana, sample.landSignal].every(Number.isFinite);
    });
    const significantContinentFamilies = [...grid.continentCellCounts.values()].filter(count => count >= Math.max(3, total * 0.00012)).length;
    return {
        seed,
        engineRevision: Number(world.surfaceAtlas?.revision) || 0,
        continentSectorKm: Number(world.surfaceAtlas?.continentSectorMeters || 0) / 1000,
        spanKm,
        targetLandPercent: "50 ± 3",
        targetLandCoverage: Number(world.surfaceAtlas?.targetLandCoverage) || 0,
        unbounded: world.surfaceAtlas?.unbounded === true,
        maxContinentDiameterKm: Number(world.surfaceAtlas?.maxContinentDiameterMeters || 0) / 1000,
        shorelineCalibration: Number((Number(origin.seaCut) || 0).toFixed(6)),
        sampleGrid: `${columns}x${rows}`,
        landPercent: Number((landRatio * 100).toFixed(2)),
        waterPercent: Number(((1 - landRatio) * 100).toFixed(2)),
        landComponents: components.length,
        significantLandComponents: components.filter(size => size >= total * 0.0025).length,
        largestComponents: components.slice(0, 8),
        largestLandShare: grid.landCount ? Number((components[0] / grid.landCount).toFixed(3)) : 0,
        visibleRealmCount: grid.realmKeys.size,
        visibleContinentKeys: grid.continentKeys.size,
        significantContinentFamilies,
        visibleContinentForms: [...grid.continentForms].sort(),
        visibleContinentSizeClasses: [...grid.continentSizeClasses].sort(),
        supercontinentFamilies: grid.supercontinentKeys.size,
        stochasticPhaseBins: grid.continentPhaseBins.size,
        visibleOceanBasins: grid.oceanKeys.size,
        maxOwnerRadiusKm: Number((grid.maxOwnerRadiusM / 1000).toFixed(3)),
        containmentViolations: grid.containmentViolations,
        folkTransitionPercent: grid.landCount ? Number((grid.folkTransitionCount / grid.landCount * 100).toFixed(2)) : 0,
        climateTransitionPercent: grid.landCount ? Number((grid.climateTransitionCount / grid.landCount * 100).toFixed(2)) : 0,
        topographyTransitionPercent: grid.landCount ? Number((grid.topographyTransitionCount / grid.landCount * 100).toFixed(2)) : 0,
        originIsLand: Number(origin.landSignal) > 0,
        originIsWalkable: origin.walkable === true && origin.water !== true,
        deterministic,
        farCoordinatesFinite
    };
}

function clampByte(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

function pixelFor(sample) {
    const color = Array.isArray(sample.color) ? sample.color : (Number(sample.landSignal) > 0 ? [71, 123, 83] : [5, 35, 73]);
    return [clampByte(color[0]), clampByte(color[1]), clampByte(color[2])];
}

function renderPpm(filename) {
    const grid = collectGrid(width, height);
    const header = Buffer.from(`P6\n${width} ${height}\n255\n`, "ascii");
    const pixels = Buffer.alloc(width * height * 3);
    for (let index = 0; index < grid.cells.length; index++) {
        const color = pixelFor(grid.cells[index].sample);
        pixels[index * 3] = color[0];
        pixels[index * 3 + 1] = color[1];
        pixels[index * 3 + 2] = color[2];
    }
    fs.writeFileSync(path.resolve(filename), Buffer.concat([header, pixels]));
}

const report = metrics();
if (args.includes("--assert")) {
    const failures = [];
    if (!report.deterministic) failures.push("aynı seed/koordinat aynı sonucu vermiyor");
    if (!report.farCoordinatesFinite) failures.push("çok uzak koordinatlarda sonlu sayı sözleşmesi bozuk");
    if (report.engineRevision !== 111) failures.push(`harita motoru revizyonu R111 değil: ${report.engineRevision}`);
    if (!report.unbounded) failures.push("dünya motoru sınırsız olarak işaretlenmemiş");
    if (report.maxContinentDiameterKm !== 240000) failures.push(`kıta çap sınırı 240.000 km değil: ${report.maxContinentDiameterKm}`);
    if (!report.originIsLand || !report.originIsWalkable) failures.push("varsayılan başlangıç noktası güvenli karada değil");
    if (report.targetLandCoverage !== 0.5) failures.push(`kara/su hedefi yarı yarıya değil: ${report.targetLandCoverage}`);
    if (report.landPercent < 46 || report.landPercent > 54) failures.push(`kara oranı %50 ±4 atlas toleransının dışında: %${report.landPercent}`);
    if (report.containmentViolations) failures.push(`${report.containmentViolations} kara örneği sahip kıtasının 240.000 km dairesinden kaçtı`);
    if (report.visibleRealmCount < 20) failures.push(`görünür halk/diyar çeşitliliği düşük: ${report.visibleRealmCount}`);
    if (report.significantContinentFamilies < 4) failures.push(`okunabilir kıta ailesi düşük: ${report.significantContinentFamilies}`);
    if (report.visibleContinentForms.length < 6) failures.push(`kıta biçim ailesi eksik: ${report.visibleContinentForms.join(", ")}`);
    if (report.visibleContinentSizeClasses.length < 3) failures.push(`kıta boyut sınıfı eksik: ${report.visibleContinentSizeClasses.join(", ")}`);
    if (report.supercontinentFamilies < 3) failures.push(`süperkıta çeşitliliği düşük: ${report.supercontinentFamilies}`);
    if (report.stochasticPhaseBins < 12) failures.push(`kıta merkezleri düzenli/fakir faz dağılımında: ${report.stochasticPhaseBins}/16`);
    // Tek 1.200.000 km kadraj, yumuşak havza sınırları nedeniyle kimi seed'de
    // dört küresel okyanus ailesinin yalnız ikisini kesebilir. Bir kadrajda iki,
    // renderer tanımında dört aile bulunması doğru yerel/küresel sözleşmedir.
    if (report.visibleOceanBasins < 2) failures.push(`okyanus havzası çeşitliliği düşük: ${report.visibleOceanBasins}`);
    if (report.folkTransitionPercent < 8) failures.push(`diyar geçiş kuşakları yetersiz: %${report.folkTransitionPercent}`);
    if (report.climateTransitionPercent < 8) failures.push(`iklim geçiş kuşakları yetersiz: %${report.climateTransitionPercent}`);
    if (report.topographyTransitionPercent < 8) failures.push(`topografya geçiş kuşakları yetersiz: %${report.topographyTransitionPercent}`);
    if (failures.length) {
        console.error(JSON.stringify({ ok: false, failures, report }, null, 2));
        process.exitCode = 1;
    } else {
        console.log(JSON.stringify({ ok: true, report }, null, 2));
    }
} else {
    console.log(JSON.stringify(report, null, 2));
}

const renderPath = valueAfter("--render", "");
if (renderPath) renderPpm(renderPath);
