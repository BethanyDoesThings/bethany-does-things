(() => {
  "use strict";
  const size = 5;
  // Verified route: enters at the top, turns right, then exits at the bottom.
  const solution = [
    0,0,2,0,0,
    0,0,2,0,0,
    0,0,3,4,0,
    0,0,0,2,0,
    0,0,0,2,0
  ];
  const rowClues = [1,1,2,1,1];
  const colClues = [0,0,3,3,0];
  const locked = new Set([2,23]);
  const names = ["blank","no track","vertical straight","north-east corner","south-east corner","south-west corner","north-west corner","horizontal straight"];
  const svgShapes = {
    2:"<path class='track' d='M30 5 V55'/>",
    3:"<path class='track' d='M30 5 V30 H55'/>",
    4:"<path class='track' d='M55 30 H30 V55'/>",
    5:"<path class='track' d='M30 55 V30 H5'/>",
    6:"<path class='track' d='M5 30 H30 V5'/>",
    7:"<path class='track' d='M5 30 H55'/>"
  };
  const board = document.querySelector("#puzzle-board");
  const status = document.querySelector("#game-status");
  const undoButton = document.querySelector("#undo-button");
  const history = [];
  let cells = Array(size * size).fill(0);
  cells[2] = 2; cells[23] = 2; // The two known edge endpoints are supplied clues.
  const initial = cells.slice();

  function cellSvg(value) {
    if (value === 1) return "<svg viewBox='0 0 60 60' aria-hidden='true'><text class='x-mark' x='30' y='39' text-anchor='middle'>×</text></svg>";
    return "<svg viewBox='0 0 60 60' aria-hidden='true'>" + (svgShapes[value] || "") + "</svg>";
  }
  function render() {
    board.innerHTML = "";
    board.append(makeClue(""));
    colClues.forEach(n => board.append(makeClue(n)));
    for (let row=0; row<size; row++) {
      board.append(makeClue(rowClues[row]));
      for (let col=0; col<size; col++) {
        const index = row*size+col;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "cell" + (locked.has(index) ? " locked" : "");
        button.innerHTML = cellSvg(cells[index]);
        button.setAttribute("aria-label", "Row " + (row+1) + ", column " + (col+1) + ": " + names[cells[index]] + (locked.has(index) ? ", fixed clue" : ""));
        button.disabled = locked.has(index);
        button.addEventListener("click", () => cycle(index));
        board.append(button);
      }
    }
    undoButton.disabled = history.length === 0;
  }
  function makeClue(value) {
    const el = document.createElement("div");
    el.className = "clue";
    el.textContent = value === "" ? "" : value;
    return el;
  }
  function cycle(index) {
    history.push(cells.slice());
    cells[index] = (cells[index] + 1) % 8;
    clearFeedback();
    status.className = "status";
    status.textContent = "Selected: " + names[cells[index]] + ". Keep following the clues.";
    render();
  }
  function clearFeedback() {
    board.querySelectorAll(".cell").forEach(c => c.classList.remove("correct","incorrect"));
  }
  function undo() {
    if (!history.length) return;
    cells = history.pop();
    clearFeedback();
    status.className = "status";
    status.textContent = "Last move undone.";
    render();
  }
  function reset() {
    cells = initial.slice();
    history.length = 0;
    clearFeedback();
    status.className = "status";
    status.textContent = "Board reset. The route is ready when you are.";
    render();
  }
  function check() {
    const actualRows = Array(size).fill(0), actualCols = Array(size).fill(0);
    cells.forEach((v,i) => { if (v>=2) { actualRows[Math.floor(i/size)]++; actualCols[i%size]++; } });
    const cluesMatch = actualRows.every((v,i)=>v===rowClues[i]) && actualCols.every((v,i)=>v===colClues[i]);
    const routeMatches = cells.every((v,i)=>v===solution[i] || (solution[i]===0 && (v===0 || v===1)));
    const pieces = [...board.querySelectorAll(".cell")];
    pieces.forEach((el,i)=>el.classList.add(cells[i]===solution[i] || (solution[i]===0 && cells[i]===1) ? "correct" : "incorrect"));
    if (cluesMatch && routeMatches) {
      status.className = "status success";
      status.textContent = "All aboard! You solved it!";
    } else if (!cluesMatch) {
      status.className = "status error";
      status.textContent = "Some row or column totals don't match yet. Check the clues.";
    } else {
      status.className = "status error";
      status.textContent = "The totals match, but check the route pieces and connections.";
    }
  }
  document.querySelector("#undo-button").addEventListener("click",undo);
  document.querySelector("#reset-button").addEventListener("click",reset);
  document.querySelector("#check-button").addEventListener("click",check);
  render();
})();