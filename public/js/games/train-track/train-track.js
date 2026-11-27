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
  function clearFeedback(){board.querySelectorAll(".cell").forEach(c=>c.classList.remove("correct","incorrect"));}
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
  function check(){
    const actualRows=Array(puzzle.size).fill(0),actualCols=Array(puzzle.size).fill(0);
    cells.forEach((v,i)=>{if(v>=2){actualRows[Math.floor(i/puzzle.size)]++;actualCols[i%puzzle.size]++;}});
    const cluesMatch=actualRows.every((v,i)=>v===puzzle.rowClues[i])&&actualCols.every((v,i)=>v===puzzle.colClues[i]);
    const routeMatches=cells.every((v,i)=>v===puzzle.solution[i]||(puzzle.solution[i]===0&&(v===0||v===1)));
    board.querySelectorAll(".cell").forEach((el,i)=>el.classList.add(cells[i]===puzzle.solution[i]||(puzzle.solution[i]===0&&cells[i]===1)?"correct":"incorrect"));
    if(cluesMatch&&routeMatches){status.className="status success";status.textContent="All aboard! You solved it!";}
    else if(!cluesMatch){status.className="status error";status.textContent="Some row or column totals don't match yet. Check the clues.";}
    else{status.className="status error";status.textContent="The totals match, but check the route pieces and connections.";}
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