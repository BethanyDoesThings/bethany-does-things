(() => {
  "use strict";
  const board = document.querySelector("#puzzle-board");
  const boardWrap = document.querySelector(".board-wrap");
  const status = document.querySelector("#game-status");
  const undoButton = document.querySelector("#undo-button");
  const difficultySelect = document.querySelector("#difficulty-select");
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
  function makeEasyPuzzle() {
    return {size:5, solution:[0,0,2,0,0, 0,0,2,0,0, 0,0,3,4,0, 0,0,0,2,0, 0,0,0,2,0], rowClues:[1,1,2,1,1], colClues:[0,0,3,3,0], locked:[2,23], description:"5×5 beginner puzzle with one continuous route."};
  }
  function makeSingleRoutePuzzle(size) {
    const routeRow=Math.floor(Math.random()*size);
    const solution=Array(size*size).fill(0),rowClues=Array(size).fill(0),colClues=Array(size).fill(0);
    const locked=[routeRow*size,routeRow*size+size-1];
    rowClues[routeRow]=size;
    colClues.fill(1);
    for(let col=0;col<size;col++)solution[routeRow*size+col]=7;
    return {size,solution,rowClues,colClues,locked,description:size+"×"+size+" puzzle with one continuous route."};
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
    if(level==="easy") puzzle=makeEasyPuzzle();
    else if(level==="normal") puzzle=makeSingleRoutePuzzle(8);
    else puzzle=makeSingleRoutePuzzle(10);
    if(window.TrainTrackArt) window.TrainTrackArt.configure(puzzle.solution,puzzle.size,puzzle.locked);
    cells=Array(puzzle.size*puzzle.size).fill(0);
    locked=new Set(puzzle.locked); puzzle.locked.forEach(i=>cells[i]=puzzle.solution[i]);
    initial=cells.slice(); history.length=0; clearFeedback();
    status.className="status"; status.textContent=""; render();
  }
  difficultySelect.addEventListener("change",()=>setDifficulty(difficultySelect.value));
  newPuzzleButton.addEventListener("click",()=>setDifficulty(difficultySelect.value));
  document.querySelector("#undo-button").addEventListener("click",undo);
  document.querySelector("#reset-button").addEventListener("click",reset);
  document.querySelector("#check-button").addEventListener("click",check);
  window.addEventListener("resize",()=>{if(puzzle){const gridFootprint=Math.min(500,Math.max(180,boardWrap.clientWidth-44));board.style.setProperty("--cell",(gridFootprint/puzzle.size)+"px");}});
  setDifficulty("easy");
})();