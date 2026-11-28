(() => {
  "use strict";
  const PALETTES = {
  easy: {
    1: "#fff0e8",
    2: "#f21a9b",
    3: "#8c19d7",
    4: "#1267ef",
    5: "#08c9ec",
    6: "#082b91"
  },
  standard: {
    1: "#fff0e8",
    2: "#f7b6d2",
    3: "#ed3b91",
    4: "#a91b78",
    5: "#e8b8ff",
    6: "#b66be0",
    7: "#7415b5",
    8: "#a9d9ff",
    9: "#3985e8",
    10: "#102f83"
  },
  hard: {
    1: "#fff4e8",
    2: "#f8c7a0",
    3: "#ed8b55",
    4: "#d94b36",
    5: "#f4b7d5",
    6: "#e94a9a",
    7: "#a92872",
    8: "#e2c8ff",
    9: "#b48be8",
    10: "#793db8",
    11: "#b7e8f5",
    12: "#55bddb",
    13: "#347cba",
    14: "#173c78"
  }
};
  const DEFAULT_PALETTE = PALETTES.easy;
  function getPaletteForDifficulty(level) {
    return {...(PALETTES[level] || DEFAULT_PALETTE)};
  }

  function hexToRgb(hex) {
    const value=hex.replace("#","");
    return [0,2,4].map(i=>parseInt(value.slice(i,i+2),16));
  }
  function nearestColour(rgb,palette) {
    let bestId=null,bestDistance=Infinity;
    for(const [id,hex] of Object.entries(palette)) {
      const p=hexToRgb(hex);
      const distance=(rgb[0]-p[0])**2+(rgb[1]-p[1])**2+(rgb[2]-p[2])**2;
      if(distance<bestDistance){bestDistance=distance;bestId=Number(id);}
    }
    return bestId;
  }
  function loadImage(url) {
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.crossOrigin="anonymous";
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error("Could not load puzzle artwork: "+url));
      image.src=url;
    });
  }
  async function convertImageToGrid(url,gridSize,palette=DEFAULT_PALETTE) {
    const image=await loadImage(url);
    const canvas=document.createElement("canvas");
    canvas.width=gridSize;canvas.height=gridSize;
    const context=canvas.getContext("2d",{willReadFrequently:true});
    if(!context)throw new Error("Canvas is unavailable in this browser.");
    context.fillStyle="#ffffff";
    context.fillRect(0,0,gridSize,gridSize);

    // Crop to a centred square so every puzzle has a consistent grid.
    const side=Math.min(image.naturalWidth,image.naturalHeight);
    const sx=(image.naturalWidth-side)/2,sy=(image.naturalHeight-side)/2;
    context.imageSmoothingEnabled=true;
    context.imageSmoothingQuality="high";
    context.drawImage(image,sx,sy,side,side,0,0,gridSize,gridSize);

    const pixels=context.getImageData(0,0,gridSize,gridSize).data;
    const solution=new Array(gridSize*gridSize);
    for(let i=0;i<solution.length;i++) {
      const offset=i*4;
      solution[i]=nearestColour([pixels[offset],pixels[offset+1],pixels[offset+2]],palette);
    }
    return {gridSize,solution,palette:{...palette}};
  }

  function rgbToHex(rgb) {
    return "#"+rgb.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");
  }
  function buildAdaptivePalette(pixels,count) {
    const samples=[];
    for(let i=0;i<pixels.length;i+=4) {
      if(pixels[i+3]<24) continue;
      samples.push([pixels[i],pixels[i+1],pixels[i+2]]);
    }
    if(!samples.length) return getPaletteForDifficulty("easy");
    const boxes=[samples];
    while(boxes.length<count) {
      let chosen=-1,chosenScore=-1,channel=0;
      for(let b=0;b<boxes.length;b++) {
        const box=boxes[b];if(box.length<2)continue;
        const ranges=[0,1,2].map(c=>{
          let min=255,max=0;for(const p of box){if(p[c]<min)min=p[c];if(p[c]>max)max=p[c];}
          return max-min;
        });
        const c=ranges.indexOf(Math.max(...ranges));
        const score=ranges[c]*Math.log2(box.length+1);
        if(score>chosenScore){chosen=b;chosenScore=score;channel=c;}
      }
      if(chosen<0)break;
      const box=boxes.splice(chosen,1)[0].sort((a,b)=>a[channel]-b[channel]);
      const half=box.length>>1;
      boxes.push(box.slice(0,half),box.slice(half));
    }
    const colours=boxes.map(box=>{
      const sum=[0,0,0];for(const p of box){sum[0]+=p[0];sum[1]+=p[1];sum[2]+=p[2];}
      return sum.map(v=>v/box.length);
    });
    colours.sort((a,b)=>(a[0]*.2126+a[1]*.7152+a[2]*.0722)-(b[0]*.2126+b[1]*.7152+b[2]*.0722));
    const palette={};colours.forEach((rgb,i)=>palette[i+1]=rgbToHex(rgb));
    return palette;
  }
  function nearestAdaptiveColour(rgb,palette) {
    let best=1,distance=Infinity;
    for(const [id,hex] of Object.entries(palette)) {
      const p=hexToRgb(hex);
      const dr=rgb[0]-p[0],dg=rgb[1]-p[1],db=rgb[2]-p[2];
      const score=2*dr*dr+4*dg*dg+3*db*db;
      if(score<distance){distance=score;best=Number(id);}
    }
    return best;
  }
  async function prepareImage(url,level) {
    const settings={easy:{size:30,colours:6,blur:0.7},standard:{size:50,colours:10,blur:0.25},hard:{size:70,colours:14,blur:0}};
    const preset=settings[level]||settings.standard;
    const image=await loadImage(url);
    const canvas=document.createElement("canvas");
    canvas.width=preset.size;canvas.height=preset.size;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    if(!ctx)throw new Error("Canvas is unavailable in this browser.");
    ctx.fillStyle="#fff";ctx.fillRect(0,0,preset.size,preset.size);
    const side=Math.min(image.naturalWidth,image.naturalHeight);
    const sx=(image.naturalWidth-side)/2,sy=(image.naturalHeight-side)/2;
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
    if(preset.blur)ctx.filter="blur("+preset.blur+"px)";
    ctx.drawImage(image,sx,sy,side,side,0,0,preset.size,preset.size);
    ctx.filter="none";
    const imageData=ctx.getImageData(0,0,preset.size,preset.size);
    const palette=buildAdaptivePalette(imageData.data,preset.colours);
    const solution=new Array(preset.size*preset.size);
    for(let i=0;i<solution.length;i++){
      const o=i*4;solution[i]=nearestAdaptiveColour([imageData.data[o],imageData.data[o+1],imageData.data[o+2]],palette);
    }
    return {gridSize:preset.size,solution,palette,level,colourCount:Object.keys(palette).length};
  }
  async function loadCatalog(url="../../data/diamond-art/catalog.json") {
    const response=await fetch(url,{cache:"no-cache"});
    if(!response.ok)throw new Error("Diamond Art catalogue could not be loaded.");
    const catalog=await response.json();
    if(!Array.isArray(catalog.puzzles))throw new Error("Diamond Art catalogue has an invalid format.");
    return catalog;
  }
  window.DiamondArtEngine={
    defaultPalette:DEFAULT_PALETTE,
    palettes:PALETTES,
    getPaletteForDifficulty,
    convertImageToGrid,
    buildAdaptivePalette,
    prepareImage,
    loadCatalog
  };
})();