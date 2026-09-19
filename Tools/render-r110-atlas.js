#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const appRoot = path.join(root, "Alekrythae.App");
const args = process.argv.slice(2);
const valueAfter = (name, fallback) => {
    const index = args.indexOf(name);
    return index >= 0 && index + 1 < args.length ? args[index + 1] : fallback;
};
const numberAfter = (name, fallback) => {
    const value = Number(valueAfter(name, fallback));
    return Number.isFinite(value) ? value : fallback;
};

const seed = numberAfter("--seed", 2152295498);
const width = Math.max(320, Math.round(numberAfter("--width", 1280)));
const height = Math.max(180, Math.round(numberAfter("--height", 768)));
const columns = Math.max(96, Math.round(numberAfter("--columns", 196)));
const rows = Math.max(54, Math.round(columns * height / width));
const spanMeters = Math.max(1, numberAfter("--span-km", 900000) * 1000);
const output = path.resolve(valueAfter("--output", path.join(root, "R111-ATLAS-PREVIEW.svg")));

const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;"
}[char]));

class SvgNode {
    constructor(tag) { this.tagName = tag; this.attributes = {}; this.dataset = {}; this.childNodes = []; this.textContent = ""; }
    setAttribute(key, value) { this.attributes[key] = String(value); }
    appendChild(child) { this.childNodes.push(child); return child; }
    serialize() {
        const attributes = Object.entries(this.attributes).map(([key, value]) => ` ${key}="${escapeXml(value)}"`).join("");
        const data = Object.entries(this.dataset).map(([key, value]) => ` data-${key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}="${escapeXml(value)}"`).join("");
        const content = `${this.textContent ? escapeXml(this.textContent) : ""}${this.childNodes.map(child => child.serialize()).join("")}`;
        return content ? `<${this.tagName}${attributes}${data}>${content}</${this.tagName}>` : `<${this.tagName}${attributes}${data}/>`;
    }
}

global.window = global;
global.document = { createElementNS: (_namespace, tag) => new SvgNode(tag) };
global.Alekrythae = { registerModule: () => {} };
global.requestAnimationFrame = () => 1;
global.cancelAnimationFrame = () => {};
global.addEventListener = () => {};
global.removeEventListener = () => {};
for (const relative of [
    "modules/world-map/alekrythae-world-profile.js",
    "modules/world-map/surface-taxonomy.js",
    "modules/world-map/chunk-generator.js",
    "modules/joa-world/joa-world.module.js"
]) vm.runInThisContext(fs.readFileSync(path.join(appRoot, relative), "utf8"), { filename: relative });

const world = global.AlekrythaeWorldMap;
const renderer = Object.create(world.VectorDiscoveryRenderer.prototype);
renderer.layerKey = "surface";
renderer.vectorClipId = `r111-atlas-${Math.abs(seed)}`;

const namespace = "http://www.w3.org/2000/svg";
const svg = new SvgNode("svg");
svg.setAttribute("xmlns", namespace);
svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
svg.setAttribute("width", width);
svg.setAttribute("height", height);
svg.setAttribute("role", "img");
svg.setAttribute("aria-label", `Ałek’ryŧhæ R111 atlas · seed ${seed}`);

const definition = renderer.loreLayerDefinitions();
const defs = renderer.installVectorDefs(namespace, definition);
const group = new SvgNode("g");
const background = new SvgNode("rect");
background.setAttribute("x", 0); background.setAttribute("y", 0);
background.setAttribute("width", width); background.setAttribute("height", height);
background.setAttribute("fill", renderer.vectorPaintUrl(definition.base));
group.appendChild(background);

const aspect = height / width;
const samples = new Array((columns + 1) * (rows + 1));
for (let row = 0; row <= rows; row++) for (let column = 0; column <= columns; column++) {
    const x = (column / columns - .5) * spanMeters, z = (row / rows - .5) * spanMeters * aspect;
    samples[row * (columns + 1) + column] = world.visualSampleAt(seed, x, z, "surface", 8);
}

const cellWidth = width / columns, cellHeight = height / rows;
const presentInfluences = { folk: new Set(), ocean: new Set(), climate: new Set(), topography: new Set() };
for (const sample of samples) {
    for (const item of sample?.folkBiome?.influences || []) if (Number(item?.weight) > .04) presentInfluences.folk.add(String(item?.key));
    for (const item of sample?.oceanAtlasInfluences || []) if (Number(item?.weight) > .04) presentInfluences.ocean.add(String(item?.index));
    for (const item of sample?.climateInfluences || []) if (Number(item?.weight) > .04) presentInfluences.climate.add(String(item?.key));
    for (const item of sample?.topographyInfluences || []) if (Number(item?.weight) > .04) presentInfluences.topography.add(String(item?.key));
}
const layers = definition.layers.filter(layer => 8 <= Number(layer.maxTier ?? 3) && !String(layer.id || "").startsWith("biome-") && (!layer.influenceGroup || presentInfluences[layer.influenceGroup]?.has(String(layer.influenceKey))));
for (const layer of layers) {
    const d = layer.contourOnly
        ? renderer.vectorContourPathFor(samples, columns, rows, 0, 0, cellWidth, cellHeight, layer.value)
        : renderer.vectorPathFor(samples, columns, rows, 0, 0, cellWidth, cellHeight, layer.value);
    if (!d) continue;
    const paint = definition.paints[layer.paint] || {};
    const node = new SvgNode("path");
    node.setAttribute("d", d);
    node.setAttribute("fill", layer.contourOnly ? "none" : renderer.vectorPaintUrl(layer.paint));
    node.setAttribute("fill-opacity", layer.contourOnly ? 0 : (layer.fillOpacity ?? 1));
    node.setAttribute("stroke", layer.stroke || paint.base || "#111820");
    node.setAttribute("stroke-opacity", layer.strokeOpacity ?? 0);
    node.setAttribute("stroke-width", layer.strokeWidth ?? .46);
    node.setAttribute("stroke-linejoin", "round");
    node.setAttribute("stroke-linecap", "round");
    node.setAttribute("vector-effect", "non-scaling-stroke");
    group.appendChild(node);
}
const labelCount = renderer.appendSurfaceRealmLabels(namespace, group, samples, columns, rows, 0, 0, cellWidth, cellHeight, 8);
svg.appendChild(defs);
svg.appendChild(group);
fs.writeFileSync(output, `<?xml version="1.0" encoding="UTF-8"?>\n${svg.serialize()}\n`, "utf8");
console.log(JSON.stringify({ ok: true, output, seed, width, height, spanKm: spanMeters / 1000, columns, rows, renderedLayers: layers.length, labelCount }, null, 2));
