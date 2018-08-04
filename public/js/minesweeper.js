const table = document.querySelector('#minesweeper');
const size = document.querySelector("form input[name=size]");
const nMines = document.querySelector("form input[name=nMines]");
const submit = document.querySelector("form #submit");
const result = document.getElementById("result");
let cells = NodeList;
let mines = NodeList;

function uniqueRandomPair(used, s) {
  const pair = [Math.floor(Math.random() * s), Math.floor(Math.random() * s)];
  if (used.includes(pair)) uniqueRandomPair(used);
  used.push(pair);
  return pair;
}

function buildTable() {
  result.classList.remove("won");
  result.classList.remove("lost");
  const s = parseInt(size.value, 10);
  const n = parseInt(nMines.value, 10);
  table.innerHTML = "";
  Array(s).fill().forEach(() => {
    const row = document.createElement("tr");
    Array(s).fill().forEach(() => {
      const cell = document.createElement("td");
      cell.classList.add("unopened");
      cell.setAttribute('data-number', 0);
      row.appendChild(cell);
    });
    table.appendChild(row);
  });
  const usedPairs = [];
  Array(n).fill().forEach(() => {
    const pair = uniqueRandomPair(usedPairs, s);
    table.rows[pair[0]].cells[pair[1]].classList.add("mine");
  });
}

function getAdjacentCells(cell, filter) {
  const cellX = cell.cellIndex;
  const cellY = cell.parentElement.rowIndex;
  const nextCells = [];
  cells = Array.from(cells).filter(filter);
  cells.forEach((c) => {
    const cX = c.cellIndex;
    const cY = c.parentElement.rowIndex;
    const diffX = Math.abs(cX - cellX);
    const diffY = Math.abs(cY - cellY);
    if ((diffX + diffY === 1) || ((diffY === 1) && (diffX === 1))) nextCells.push(c);
  });
  return nextCells;
}

function expand(cell) {
  cell.classList.remove("unopened");
  cell.classList.add("opened");
  if ((parseInt(cell.getAttribute('data-number'), 10) === 0) && (!cell.classList.contains("mine"))) {
    getAdjacentCells(cell, c => !c.classList.contains("opened")).forEach(el => expand(el));
  }
}

const rightClickEvent = (e) => {
  e.preventDefault();
  if (!e.target.classList.contains("unopened")) return;
  if (e.target.classList.contains("flagged")) {
    e.target.classList.remove("flagged");
    e.target.classList.add("question");
  } else if (e.target.classList.contains("question")) {
    e.target.classList.remove("question");
  } else {
    e.target.classList.add("flagged");
  }
  checkStatus(); /*eslint-disable-line*/
};

const leftClickEvent = (e) => {
  expand(e.target);
  checkStatus(); /*eslint-disable-line*/
};

function checkStatus() {
  cells.forEach((cell) => {
    if ((cell.classList.contains("mine")) && (cell.classList.contains("opened"))) {
      result.classList.add("lost");
      cells.forEach((c) => {
        c.removeEventListener("click", leftClickEvent);
        c.removeEventListener('contextmenu', rightClickEvent);
      });
    }
  });
  cells = Array.from(cells);
  const allFlagged = cells.filter(cell => cell.classList.contains("mine")).every(cell => cell.classList.contains("flagged"));
  const allOpenned = cells.filter(cell => !cell.classList.contains("mine")).every(cell => cell.classList.contains("opened"));
  if (allFlagged && allOpenned) result.classList.add("won");
}

submit.addEventListener("click", (e) => {
  e.preventDefault();
  buildTable();
  cells = document.querySelectorAll("td");
  cells.forEach((cell) => {
    cell.addEventListener("click", leftClickEvent);
    cell.addEventListener('contextmenu', rightClickEvent);
  });
  mines = document.querySelectorAll(".mine");
  mines.forEach((mine) => {
    const nextCells = getAdjacentCells(mine, () => true);
    nextCells.forEach(cell => cell.setAttribute('data-number', parseInt(cell.getAttribute('data-number'), 10) + 1));
  });
  cells.forEach((cell) => {
    if (!cell.classList.contains("mine") && (parseInt(cell.getAttribute('data-number'), 10) !== 0)) {
      cell.classList.add(`mine-neighbour-${cell.getAttribute('data-number')}`);
    }
  });
});
