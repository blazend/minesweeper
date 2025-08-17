let gameContainer = document.getElementById("gameContainer");
let squareSize = 8;
let mineNumber = 10;
let mineCount = 0;
let gameOver = false;

gameContainer.style.gridTemplateColumns = `repeat(${squareSize}, 50px)`;

const offsets = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1]
];

function isMine(tile) {
  return tile.dataset.mine === "true";
}
function isFlagged(tile) {
  return tile.classList.contains("flagged");
}
function isCovered(tile) {
  return tile.classList.contains("covered");
}
function uncovered(tile) {
  return tile.classList.contains("uncovered");
}


function uncover(tile) {
  if (!isFlagged(tile) || !uncovered(tile)) {
    tile.classList.remove("covered");
    tile.classList.add("uncovered");
    tile.textContent = tile.dataset.clue;
  }
}

// make the board
for (let i = 0; i < squareSize; i++) {
  for (let j = 0; j < squareSize; j++) {
    const tile = document.createElement("div");
    tile.dataset.row = i;
    tile.dataset.col = j;
    let m1 = false;
    let m2 = false;

    tile.addEventListener("mousedown", function(e) {
      if (gameOver) return;
      if (e.button === 0) m1 = true;
      if (e.button === 2) m2 = true;  
      if (m1 && m2) {
        chording(this);
        checkWin();
      }
    });

    tile.addEventListener("mouseup", function(e) {
      if (gameOver) return;
      if (e.button === 0) m1 = false;
      if (e.button === 2) m2 = false;
      checkWin();
    });

    tile.addEventListener("click", function() {
      if (gameOver) return;
      if (isMine(this) && !isFlagged(this)) {
        this.classList.add("mines");
        gameOver = true;
        gameContainer.innerHTML = "lose";
      } else if (!isFlagged(this)) {
        uncover(this);
        clearZeros(this);
      }
      checkWin();
    });

    tile.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      if (gameOver) return;
      if (isCovered(this))
        this.classList.toggle("flagged");
      checkWin();
    });

    tile.classList.add("tiles", "covered");
    gameContainer.appendChild(tile);
  }
}

// set a mine
while (mineCount < mineNumber) {
  let row = Math.floor(Math.random() * squareSize);
  let col = Math.floor(Math.random() * squareSize);
  let tile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (!isMine(tile)) {
    tile.dataset.mine = "true";
    mineCount++;
  }
}

function getNeighbors(tile) {
  const neighbors = [];
  let row = parseInt(tile.dataset.row);
  let col = parseInt(tile.dataset.col);
  for (let [dx, dy] of offsets) {
    let neighborRow = row + dx;
    let neighborCol = col + dy;
    let neighbor = document.querySelector(
      `[data-row="${neighborRow}"][data-col="${neighborCol}"]`
    );
    if (neighbor) {
      neighbors.push(neighbor);
    }
  }
  return neighbors;
}

// generate clues
function generateClues() {
  let allTiles = document.querySelectorAll(".tiles");
  for (let tile of allTiles) {
    let count = 0;
    let neighbors = getNeighbors(tile);
    for (let neighbor of neighbors) {
      if (neighbor.dataset.mine === "true") {
        count++;
      }
    }
    tile.dataset.clue = count;
  }
}

function clearZeros(tile) {
  if (tile.dataset.clue === "0") {
    let neighbors = getNeighbors(tile);
    for (let neighbor of neighbors) {
      if (isCovered(neighbor)) {
        uncover(neighbor);
        if (neighbor.dataset.clue === "0") {
          clearZeros(neighbor);
        }
      }
    }
  }
}

function chording(tile) {
  let flagCount = 0;
  let neighbors = getNeighbors(tile);
  for (let neighbor of neighbors) {
    if (isFlagged(neighbor)) {
      flagCount++;
    }
  }
  if (parseInt(tile.dataset.clue) === flagCount) {
    for (let neighbor of neighbors) {
      if (isCovered(neighbor) && !isFlagged(neighbor)) {
        uncover(neighbor);
        if (neighbor.dataset.clue === "0") {
          clearZeros(neighbor);
        }
      }
    }
  }
}

function checkWin() {
  if (gameOver) return;
  let allTiles = document.querySelectorAll(".tiles");
  for (let tile of allTiles) {
    if (!isMine(tile) && isCovered(tile)) {
      return;
    }
  }
  gameOver = true;
  gameContainer.innerHTML = "win";
}

generateClues();
