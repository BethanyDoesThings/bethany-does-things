(() => {
  "use strict";
  const DEFAULT_PALETTE = {
    1:"#fff0e8", 2:"#f21a9b", 3:"#8c19d7",
    4:"#1267ef", 5:"#08c9ec", 6:"#082b91"
  };

  function hexToRgb(hex) {
    const value=hex.replace("#","");
    return [0,2,4].map(i=>parseInt(value.slice(i,i+2),16));
  }
  function nearestColour(rgb,palette) {
    let bestId=null,bestDistance=Infinity;
    for(const [id,hex] of Object.entries(palette)) {
      const p=hexToRgb(hex);
      const distance=(rgb[0]-p[0])**2+(rgb[1]-p[1])**2+(rgb[2]-p[2])**2;
      if(distance<bestDistance){bestDistance=distance;bestId:Number(id);}
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
    convertImageToGrid,
    loadCatalog
  };
})();