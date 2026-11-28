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
    loadCatalog
  };
})();