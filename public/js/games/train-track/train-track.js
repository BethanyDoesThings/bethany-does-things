(() => {
  "use strict";
  const board = document.querySelector("#puzzle-board");
  const boardWrap = document.querySelector(".board-wrap");
  const status = document.querySelector("#game-status");
  const undoButton = document.querySelector("#undo-button");
  const difficultyOptions = [...document.querySelectorAll(".difficulty-option")];
  let selectedDifficulty = "easy";
  const newPuzzleButton = document.querySelector("#new-puzzle-button");
  const names = ["blank","no track","vertical straight","north-east corner","south-east corner","south-west corner","north-west corner","horizontal straight"];
  const svgShapes = {
    2:"<path class='track' d='M30 5 V55'/>",
    3:"<path class='track' d='M30 5 V30 H55'/>",
    4:"<path class='track' d='M55 30 H30 V55'/>",
    5:"<path class='track' d='M30 55 V30 H5'/>",
    6:"<path class='track' d='M5 30 H30 V5'/>",
    7:"<path class='track' d='M5 30 H55'/>"
  };
  let puzzle, cells, initial, locked, history=[];
  const DIRS = [
    {dr:-1,dc:0,bit:1,name:"N"},
    {dr:0,dc:1,bit:2,name:"E"},
    {dr:1,dc:0,bit:4,name:"S"},
    {dr:0,dc:-1,bit:8,name:"W"}
  ];
  const PIECE_BY_MASK = {5:2,3:3,6:4,12:5,9:6,10:7};
  function shuffled(items) {
    const result=items.slice();
    for(let i=result.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
  }
  function edgeCells(size) {
    const edges=[];
    for(let c=1;c<size-1;c++){
      edges.push({r:0,c,side:"top",inward:{r:1,c},outward:0});
      edges.push({r:size-1,c,side:"bottom",inward:{r:size-2,c},outward:2});
    }
    for(let r=1;r<size-1;r++){
      edges.push({r,c:0,side:"left",inward:{r,c:1},outward:3});
      edges.push({r,c:size-1,side:"right",inward:{r,c:size-2},outward:1});
    }
    return edges;
  }
  function countTurns(path) {
    let turns=0,last=null;
    for(let i=1;i<path.length;i++){
      const direction=[path[i].r-path[i-1].r,path[i].c-path[i-1].c].join(",");
      if(last!==null&&direction!==last)turns++;
      last=direction;
    }
    return turns;
  }
  function findInteriorPath(size,start,target,minLength,maxLength,minTurns) {
    const visited=new Set([start.r+","+start.c]);
    const path=[start];
    let result=null,steps=0;
    function walk(cell) {
      if(result||steps++>18000)return;
      const key=cell.r+","+cell.c;
      if(cell.r===target.r&&cell.c===target.c) {
        if(path.length>=minLength&&path.length<=maxLength&&countTurns(path)>=minTurns)result=path.slice();
        return;
      }
      if(path.length>=maxLength)return;
      const options=shuffled(DIRS.map(d=>({r:cell.r+d.dr,c:cell.c+d.dc})).filter(n=>
        n.r>0&&n.r<size-1&&n.c>0&&n.c<size-1&&!visited.has(n.r+","+n.c)
      ));
      for(const next of options) {
        const nextKey=next.r+","+next.c;
        visited.add(nextKey);path.push(next);walk(next);path.pop();visited.delete(nextKey);
        if(result)return;
      }
    }
    walk(start);
    return result;
  }
  function directionIndex(from,to) {
    const dr=to.r-from.r,dc=to.c-from.c;
    return DIRS.findIndex(d=>d.dr===dr&&d.dc===dc);
  }
  function makePuzzle(size,level) {
    const settings={
      easy:{minInterior:3,maxInterior:8,minTurns:1},
      normal:{minInterior:8,maxInterior:24,minTurns:3},
      difficult:{minInterior:14,maxInterior:48,minTurns:5}
    }[level];
    const edges=shuffled(edgeCells(size));
    let route=null,startEdge=null,endEdge=null;
    for(let attempt=0;attempt<160&&!route;attempt++){
      const start=edges[attempt%edges.length];
      const candidates=shuffled(edges.filter(e=>e.side!==start.side&&!(e.r===start.r&&e.c===start.c)));
      for(const end of candidates.slice(0,Math.min(10,candidates.length))) {
        const interior=findInteriorPath(size,start.inward,end.inward,settings.minInterior,Math.min(settings.maxInterior,(size-2)*(size-2)),settings.minTurns);
        if(interior){route=[{r:start.r,c:start.c},...interior,{r:end.r,c:end.c}];startEdge=start;endEdge=end;break;}
      }
    }
    if(!route) {
      // Guaranteed valid fallback: a straight route across the centre row.
      const row=Math.floor(size/2);
      route=Array.from({length:size},(_,c)=>({r:row,c}));
      startEdge={r:row,c:0,outward:3};endEdge={r:row,c:size-1,outward:1};
    }
    const solution=Array(size*size).fill(0);
    route.forEach((cell,i)=>{
      const connections=[];
      if(i===0)connections.push(startEdge.outward);
      else connections.push(directionIndex(cell,route[i-1]));
      if(i===route.length-1)connections.push(endEdge.outward);
      else connections.push(directionIndex(cell,route[i+1]));
      const mask=connections.reduce((sum,d)=>sum+(1<<d),0);
      solution[cell.r*size+cell.c]=PIECE_BY_MASK[mask]||0;
    });
    const rowClues=Array(size).fill(0),colClues=Array(size).fill(0);
    solution.forEach((value,index)=>{
      if(value>=2){rowClues[Math.floor(index/size)]++;colClues[index%size]++;}
    });
    return {
      size,solution,rowClues,colClues,
      locked:[route[0].r*size+route[0].c,route[route.length-1].r*size+route[route.length-1].c],
      description:size+"×"+size+" single-route puzzle",
      routeLength:route.length,
      turnCount:countTurns(route)
    };
  }
  function cellSvg(value,index) { return window.TrainTrackArt ? window.TrainTrackArt.render(value,index) : ""; }
  function makeClue(value) {
    const el=document.createElement("div"); el.className="clue"; el.textContent=value===""?"":value; return el;
  }
  function render() {
    board.innerHTML="";
    board.style.setProperty("--size",puzzle.size);
    const gridFootprint=Math.min(500,Math.max(180,boardWrap.clientWidth-44));
    board.style.setProperty("--cell",(gridFootprint/puzzle.size)+"px");
    board.append(makeClue(""));
    puzzle.colClues.forEach(n=>board.append(makeClue(n)));
    for(let row=0;row<puzzle.size;row++) {
      board.append(makeClue(puzzle.rowClues[row]));
      for(let col=0;col<puzzle.size;col++) {
        const index=row*puzzle.size+col, button=document.createElement("button");
        button.type="button"; button.className="cell"+(locked.has(index)?" locked":"")+(row===0?" edge-top":"")+(row===puzzle.size-1?" edge-bottom":"")+(col===0?" edge-left":"")+(col===puzzle.size-1?" edge-right":"");
        button.innerHTML=cellSvg(cells[index],index);
        button.setAttribute("aria-label","Row "+(row+1)+", column "+(col+1)+": "+names[cells[index]]+(locked.has(index)?", fixed clue":""));
        button.disabled=locked.has(index);
        button.addEventListener("click",()=>cycle(index));
        button.addEventListener("contextmenu",event=>{event.preventDefault();markNoTrack(index);});
        board.append(button);
      }
    }
    undoButton.disabled=history.length===0;
  }
  function clearFeedback(){board.querySelectorAll(".cell").forEach(c=>c.classList.remove("correct","incorrect"));boardWrap.querySelector(".train-animation-layer")?.remove();}
  function cycle(index){
    history.push(cells.slice());
    const cycleOrder=[7,2,3,4,5,6];
    const current=cycleOrder.indexOf(cells[index]);
    cells[index]=current===-1?cycleOrder[0]:(current===cycleOrder.length-1?0:cycleOrder[current+1]);
    clearFeedback();
    status.className="status"; status.textContent=""; render();
  }
  function markNoTrack(index){
    history.push(cells.slice());
    cells[index]=cells[index]===1?0:1;
    clearFeedback();
    status.className="status"; status.textContent="";
    render();
  }
  function undo(){
    if(!history.length)return; cells=history.pop(); clearFeedback();
    status.className="status"; status.textContent=""; render();
  }
  function reset(){
    cells=initial.slice(); history.length=0; clearFeedback();
    status.className="status"; status.textContent=""; render();
  }
  function orderedTrackRoute(){
    const size=puzzle.size,masks={2:5,3:3,4:6,5:12,6:9,7:10};
    const directions=[{dr:-1,dc:0,bit:1,opposite:4},{dr:0,dc:1,bit:2,opposite:8},{dr:1,dc:0,bit:4,opposite:1},{dr:0,dc:-1,bit:8,opposite:2}];
    const tracks=[];
    cells.forEach((value,index)=>{if(value>=2)tracks.push(index);});
    const neighbors=new Map(),boundary=[];
    for(const index of tracks){
      const row=Math.floor(index/size),col=index%size,mask=masks[cells[index]],linked=[];
      for(const d of directions){
        if(!(mask&d.bit))continue;
        const nr=row+d.dr,nc=col+d.dc;
        if(nr<0||nr>=size||nc<0||nc>=size){boundary.push({index,bit:d.bit});continue;}
        const next=nr*size+nc;
        if(cells[next]>=2&&(masks[cells[next]]&d.opposite))linked.push(next);
      }
      neighbors.set(index,linked);
    }
    if(boundary.length!==2||!tracks.length)return null;
    const start=boundary[0].index,route=[start],seen=new Set([start]);
    let previous=-1,current=start;
    while(true){
      const next=(neighbors.get(current)||[]).find(index=>index!==previous&&!seen.has(index));
      if(next===undefined)break;
      route.push(next);seen.add(next);previous=current;current=next;
    }
    return seen.size===tracks.length?route:null;
  }
  function playTrain(){
    const route=orderedTrackRoute();
    if(!route)return;
    boardWrap.querySelector(".train-animation-layer")?.remove();
    const wrapRect=boardWrap.getBoundingClientRect();
    const points=route.map(index=>{
      const cell=board.querySelectorAll(".cell")[index];
      const rect=cell.getBoundingClientRect();
      return {x:rect.left-wrapRect.left+rect.width/2,y:rect.top-wrapRect.top+rect.height/2};
    });
    if(points.length<2)return;
    const radius=Math.min(14,Math.max(7,(board.querySelector(".cell")?.getBoundingClientRect().width||50)*.25));
    let d="M "+points[0].x+" "+points[0].y;
    for(let i=1;i<points.length-1;i++){
      const a=points[i-1],b=points[i],next=points[i+1];
      const inLen=Math.hypot(b.x-a.x,b.y-a.y),outLen=Math.hypot(next.x-b.x,next.y-b.y);
      const r=Math.min(radius,inLen/2,outLen/2);
      const before={x:b.x-(b.x-a.x)/inLen*r,y:b.y-(b.y-a.y)/inLen*r};
      const after={x:b.x+(next.x-b.x)/outLen*r,y:b.y+(next.y-b.y)/outLen*r};
      d+=" L "+before.x+" "+before.y+" Q "+b.x+" "+b.y+" "+after.x+" "+after.y;
    }
    const last=points[points.length-1];d+=" L "+last.x+" "+last.y;
    const layer=document.createElementNS("http://www.w3.org/2000/svg","svg");
    layer.setAttribute("class","train-animation-layer");
    layer.setAttribute("viewBox","0 0 "+boardWrap.clientWidth+" "+boardWrap.clientHeight);
    layer.setAttribute("aria-hidden","true");
    layer.innerHTML=`
      <defs>
        <linearGradient id="purple-engine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3c4ff"/><stop offset=".42" stop-color="#a94be0"/><stop offset="1" stop-color="#57208f"/></linearGradient>
        <filter id="train-glow"><feGaussianBlur stdDeviation="2.2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path id="train-motion-path" d="${d}" fill="none" stroke="none"/>
      <g class="purple-train" filter="url(#train-glow)">
        <!-- Two passenger coaches follow the locomotive along the same route. -->
        <g>
          <rect x="-91" y="-11" width="39" height="17" rx="5" fill="#7b35b5" stroke="#43156e" stroke-width="2"/>
          <rect x="-84" y="-8" width="10" height="9" rx="2" fill="#f6d8ff" stroke="#43156e" stroke-width="1.3"/>
          <rect x="-69" y="-8" width="10" height="9" rx="2" fill="#f6d8ff" stroke="#43156e" stroke-width="1.3"/>
          <path d="M-95 4 H-49 L-47 9 H-97Z" fill="#dba5f4" stroke="#43156e" stroke-width="1.5"/>
          <circle cx="-82" cy="9" r="5" fill="#352044" stroke="#f1c7ff" stroke-width="2"/>
          <circle cx="-59" cy="9" r="5" fill="#352044" stroke="#f1c7ff" stroke-width="2"/>
          <path d="M-52 -3 H-43" stroke="#e7b9ff" stroke-width="3" stroke-linecap="round"/>
          <animateMotion dur="5s" begin="-1.05s" fill="freeze" rotate="auto"><mpath href="#train-motion-path"/></animateMotion>
        </g>
        <g>
          <rect x="-151" y="-11" width="39" height="17" rx="5" fill="#9b55d0" stroke="#43156e" stroke-width="2"/>
          <rect x="-144" y="-8" width="10" height="9" rx="2" fill="#f6d8ff" stroke="#43156e" stroke-width="1.3"/>
          <rect x="-129" y="-8" width="10" height="9" rx="2" fill="#f6d8ff" stroke="#43156e" stroke-width="1.3"/>
          <path d="M-155 4 H-109 L-107 9 H-157Z" fill="#e3b5fa" stroke="#43156e" stroke-width="1.5"/>
          <circle cx="-142" cy="9" r="5" fill="#352044" stroke="#f1c7ff" stroke-width="2"/>
          <circle cx="-119" cy="9" r="5" fill="#352044" stroke="#f1c7ff" stroke-width="2"/>
          <path d="M-112 -3 H-103" stroke="#e7b9ff" stroke-width="3" stroke-linecap="round"/>
          <animateMotion dur="5s" begin="-2.1s" fill="freeze" rotate="auto"><mpath href="#train-motion-path"/></animateMotion>
        </g>
        <!-- Purple steam locomotive at the front of the train. -->
        <g>
          <rect x="-27" y="-13" width="43" height="20" rx="5" fill="url(#purple-engine)" stroke="#43156e" stroke-width="2"/>
          <rect x="-17" y="-25" width="19" height="15" rx="4" fill="#c77af0" stroke="#43156e" stroke-width="2"/>
          <rect x="-14" y="-32" width="12" height="8" rx="2" fill="#542080"/>
          <rect x="10" y="-19" width="8" height="9" rx="2" fill="#f4d5ff" stroke="#542080" stroke-width="1.5"/>
          <path d="M-29 2 H19 L23 8 H-31Z" fill="#f4b5ff" stroke="#43156e" stroke-width="1.5"/>
          <circle cx="-16" cy="10" r="6.5" fill="#352044" stroke="#f1c7ff" stroke-width="2"/>
          <circle cx="12" cy="10" r="6.5" fill="#352044" stroke="#f1c7ff" stroke-width="2"/>
          <circle cx="-16" cy="10" r="2.3" fill="#d99cff"/><circle cx="12" cy="10" r="2.3" fill="#d99cff"/>
          <path d="M-5 -22 Q-11 -30 -4 -36 Q2 -42 -3 -48" fill="none" stroke="#d8c7e6" stroke-width="3.5" stroke-linecap="round" opacity=".85"/>
          <circle cx="-4" cy="-46" r="4.5" fill="#e9d9f5" opacity=".5"/>
        </g>
        <animateMotion dur="5s" fill="freeze" rotate="auto"><mpath href="#train-motion-path"/></animateMotion>
      </g>`;
    boardWrap.append(layer);
    layer.addEventListener("animationend",()=>{}, {once:true});
  }
  function check(){
    const size=puzzle.size;
    const actualRows=Array(size).fill(0),actualCols=Array(size).fill(0);
    const masks={2:5,3:3,4:6,5:12,6:9,7:10};
    const trackCells=[];
    cells.forEach((value,index)=>{
      if(value>=2){
        actualRows[Math.floor(index/size)]++;
        actualCols[index%size]++;
        trackCells.push(index);
      }
    });
    const cluesMatch=actualRows.every((value,i)=>value===puzzle.rowClues[i])&&actualCols.every((value,i)=>value===puzzle.colClues[i]);
    const directions=[{dr:-1,dc:0,bit:1},{dr:0,dc:1,bit:2},{dr:1,dc:0,bit:4},{dr:0,dc:-1,bit:8}];
    let boundaryEnds=0,connectionsValid=trackCells.length>0;
    const adjacency=new Map();
    for(const index of trackCells){
      const row=Math.floor(index/size),col=index%size,mask=masks[cells[index]],neighbors=[];
      let degree=0;
      for(const direction of directions){
        if(!(mask&direction.bit))continue;
        degree++;
        const nr=row+direction.dr,nc=col+direction.dc;
        if(nr<0||nr>=size||nc<0||nc>=size){
          boundaryEnds++;
          continue;
        }
        const next=nr*size+nc,nextMask=masks[cells[next]];
        if(!nextMask||!(nextMask&(direction.bit===1?4:direction.bit===2?8:direction.bit===4?1:2))){
          connectionsValid=false;
        } else neighbors.push(next);
      }
      if(degree!==2)connectionsValid=false;
      adjacency.set(index,neighbors);
    }
    let connected=false;
    if(trackCells.length){
      const seen=new Set([trackCells[0]]),queue=[trackCells[0]];
      while(queue.length){
        for(const next of (adjacency.get(queue.shift())||[])){
          if(!seen.has(next)){seen.add(next);queue.push(next);}
        }
      }
      connected=seen.size===trackCells.length;
    }
    const routeValid=connectionsValid&&connected&&boundaryEnds===2;
    board.querySelectorAll(".cell").forEach((el,i)=>{
      el.classList.remove("correct","incorrect");
      if(cells[i]>=2)el.classList.add(routeValid?"correct":"incorrect");
      else el.classList.add("correct");
    });
    if(cluesMatch&&routeValid){
      status.className="status success";
      status.textContent="All aboard! You solved it!";
      playTrain();
    } else if(!cluesMatch){
      status.className="status error";
      status.textContent="Some row or column totals don't match yet. Check the clues.";
    } else {
      status.className="status error";
      status.textContent="The totals match, but check for gaps, branches, or extra track ends.";
    }
  }
  function setDifficulty(level){
    selectedDifficulty=level;
    difficultyOptions.forEach(button=>{
      const active=button.dataset.difficulty===level;
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-pressed",String(active));
    });
    const size=level==="easy"?5:(level==="normal"?8:10);
    puzzle=makePuzzle(size,level);
    if(window.TrainTrackArt) window.TrainTrackArt.configure(puzzle.solution,puzzle.size,puzzle.locked);
    cells=Array(puzzle.size*puzzle.size).fill(0);
    locked=new Set(puzzle.locked); puzzle.locked.forEach(i=>cells[i]=puzzle.solution[i]);
    initial=cells.slice(); history.length=0; clearFeedback();
    status.className="status"; status.textContent=""; render();
  }
  difficultyOptions.forEach(button=>button.addEventListener("click",()=>setDifficulty(button.dataset.difficulty)));
  newPuzzleButton.addEventListener("click",()=>setDifficulty(selectedDifficulty));
  document.querySelector("#undo-button").addEventListener("click",undo);
  document.querySelector("#reset-button").addEventListener("click",reset);
  document.querySelector("#check-button").addEventListener("click",check);
  window.addEventListener("resize",()=>{if(puzzle){const gridFootprint=Math.min(500,Math.max(180,boardWrap.clientWidth-44));board.style.setProperty("--cell",(gridFootprint/puzzle.size)+"px");}});
  setDifficulty("easy");
})();