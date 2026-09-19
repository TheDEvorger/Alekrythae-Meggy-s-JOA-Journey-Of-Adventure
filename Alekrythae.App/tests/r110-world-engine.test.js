"use strict";

const assert=require("assert");
const path=require("path");

global.window={AlekrythaeWorldProfile:{}};
require(path.resolve(__dirname,"../modules/world-map/chunk-generator.js"));

const world=window.AlekrythaeWorldMap;
const atlas=world.surfaceAtlas;
const seeds=[110,531,9001];
const results=[];

assert(world&&typeof world.sampleAt==="function"&&typeof world.visualSampleAt==="function","world API missing");
assert.strictEqual(atlas.unbounded,true,"world must be procedurally unbounded");
assert.strictEqual(atlas.revision,111,"R111 continent engine is not active");
assert.strictEqual(atlas.maxContinentDiameterMeters,240_000_000,"continent diameter contract changed");
assert.strictEqual(atlas.targetLandCoverage,.5,"surface land/water target changed");
assert.deepStrictEqual([...atlas.continentForms],["minor","shield","ribbon","crescent","fused","supercontinent"],"continent form catalog changed");

const approxUnitSum=(items,label)=>{
    assert(Array.isArray(items)&&items.length>1,`${label} influences missing`);
    const keys=new Set(items.map(item=>String(item.key??item.index)));
    assert.strictEqual(keys.size,items.length,`${label} influence keys repeat`);
    const sum=items.reduce((total,item)=>total+Number(item.weight||0),0);
    assert(Math.abs(sum-1)<1e-8,`${label} weights do not sum to one: ${sum}`);
};

for(const coordinate of [0,1e15,-1e15,1e100,-1e100]){
    const sample=world.sampleAt(110,coordinate,coordinate*.371,"surface");
    for(const field of ["height","moisture","warmth","arcana","landSignal"])
        assert(Number.isFinite(Number(sample[field])),`non-finite ${field} at ${coordinate}`);
}

for(const seed of seeds){
    const cells=121,step=2_000_000,offset=(cells-1)/2,landMask=new Uint8Array(cells*cells);
    let landCount=0,transitionCount=0,mountainRangeCount=0,mountainCrestCount=0,maxMountainStrength=0,mountainNeighborDelta=0,mountainNeighborPairs=0,maxRadius=0,minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
    for(let row=0;row<cells;row++){let previousMountain=null;for(let column=0;column<cells;column++){
        const x=(column-offset)*step,z=(row-offset)*step,sample=world.visualSampleAt(seed,x,z,"surface",8);
        approxUnitSum(sample.climateInfluences,"climate");
        approxUnitSum(sample.topographyInfluences,"topography");
        approxUnitSum(sample.oceanAtlasInfluences,"ocean");
        if(Number(sample.envelopeLandSignal)<=0){previousMountain=null;continue;}
        assert.strictEqual(sample.continentKey,"continent:0:0:0","origin circle captured another continent");
        assert.strictEqual(sample.continentForm,"supercontinent","origin family is not a supercontinent");
        assert(Number(sample.continentFamilyRadiusM)<=119_200_000,"family radius exceeds guarded 240,000 km diameter");
        const radius=Math.hypot(x-Number(sample.continentCenterX),z-Number(sample.continentCenterZ));
        assert(radius<=atlas.continentContainmentRadiusMeters+1,`land escaped continent circle: ${radius}`);
        maxRadius=Math.max(maxRadius,radius);landMask[row*cells+column]=1;landCount++;
        minX=Math.min(minX,x);maxX=Math.max(maxX,x);minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);
        const folk=sample.folkBiome?.influences||[];approxUnitSum(folk,"folk");
        if(Number(folk[1]?.weight)>.13)transitionCount++;
        const mountain=Number(sample.atlasMountainStrength)||0;maxMountainStrength=Math.max(maxMountainStrength,mountain);if(mountain>.28)mountainRangeCount++;if(mountain>.74)mountainCrestCount++;if(previousMountain!==null){mountainNeighborDelta+=Math.abs(mountain-previousMountain);mountainNeighborPairs++;}previousMountain=mountain;
    }}
    assert(landCount>900,`seed ${seed} produced island-sized origin land (${landCount} cells)`);
    const extent=Math.max(maxX-minX,maxZ-minZ);
    assert(extent>=135_000_000,`seed ${seed} origin mass is too small for a continent (${extent}m)`);
    assert(transitionCount/landCount>.08,`seed ${seed} lacks broad transition belts`);
    assert(maxMountainStrength>.82,`seed ${seed} lacks a continental mountain crest`);
    assert(mountainRangeCount/landCount>.08&&mountainRangeCount/landCount<.34,`seed ${seed} mountain range coverage is implausible`);
    assert(mountainCrestCount>60&&mountainCrestCount/landCount>.008,`seed ${seed} mountain chain has no readable crest`);
    assert(mountainNeighborDelta/Math.max(1,mountainNeighborPairs)<.08,`seed ${seed} atlas relief is noisy rather than continuous`);

    const visited=new Uint8Array(landMask.length),queue=new Int32Array(landMask.length);let largest=0,components=0;
    for(let start=0;start<landMask.length;start++){
        if(!landMask[start]||visited[start])continue;components++;let head=0,tail=0,count=0;queue[tail++]=start;visited[start]=1;
        while(head<tail){
            const index=queue[head++],row=Math.floor(index/cells),column=index-row*cells;count++;
            for(const next of [index-1,index+1,index-cells,index+cells]){
                if(next<0||next>=landMask.length||visited[next]||!landMask[next])continue;
                const nextRow=Math.floor(next/cells),nextColumn=next-nextRow*cells;
                if(Math.abs(nextRow-row)+Math.abs(nextColumn-column)!==1)continue;
                visited[next]=1;queue[tail++]=next;
            }
        }
        largest=Math.max(largest,count);
    }
    assert(largest/landCount>.70,`seed ${seed} has no dominant connected mainland (${largest}/${landCount})`);
    results.push({seed,landCells:landCount,mainlandShare:Number((largest/landCount).toFixed(3)),extentKm:Math.round(extent/1000),maxRadiusKm:Math.round(maxRadius/1000),components,transitionShare:Number((transitionCount/landCount).toFixed(3)),mountainRangeShare:Number((mountainRangeCount/landCount).toFixed(3)),mountainCrestShare:Number((mountainCrestCount/landCount).toFixed(3)),mountainNeighborDelta:Number((mountainNeighborDelta/Math.max(1,mountainNeighborPairs)).toFixed(4))});
}

let atlasLand=0,containmentViolations=0;const visibleForms=new Set(),visibleFamilies=new Set();
for(let z=-420_000_000;z<=420_000_000;z+=6_000_000)for(let x=-600_000_000;x<=600_000_000;x+=6_000_000){
    const sample=world.visualSampleAt(110,x,z,"surface",8);if(Number(sample.envelopeLandSignal)<=0)continue;atlasLand++;
    visibleForms.add(String(sample.continentForm||""));visibleFamilies.add(String(sample.continentKey||""));
    const radius=Math.hypot(x-Number(sample.continentCenterX),z-Number(sample.continentCenterZ));
    if(radius>atlas.continentContainmentRadiusMeters+1)containmentViolations++;
}
assert(atlasLand>300,"atlas scan found too little land");
assert.strictEqual(containmentViolations,0,"atlas scan found land outside its 240,000 km diameter circle");
assert(visibleForms.size>=5,`atlas scan found too few continent forms: ${[...visibleForms].join(", ")}`);
assert(visibleFamilies.size>=8,`atlas scan found too few continent families: ${visibleFamilies.size}`);

process.stdout.write(JSON.stringify({ok:true,atlasLand,containmentViolations,visibleForms:[...visibleForms].sort(),visibleFamilies:visibleFamilies.size,results},null,2)+"\n");
