const turnIndicator = document.getElementById("turnIndicator");
const winnerDisplay = document.getElementById("winnerDisplay");
const winnerMessage = document.getElementById("winnerMessage");
const playAgainButton = document.getElementById("playAgainButton");
const player1ScoreSpan = document.getElementById("player1Score");
const player2ScoreSpan = document.getElementById("player2Score");

function countMarkers(player) {
  return cells.filter(cell => {
    const marker = cell.querySelector(".marker");
    return marker && parseInt(marker.dataset.player) === player;
  }).length;
}


function updateScoreBoard() {
  const p1Color = getPlayerColor(1);
  const p2Color = getPlayerColor(2);
  const p1Count = countMarkers(1);
  const p2Count = countMarkers(2);

  const p1ScoreNum = document.getElementById("player1ScoreNum");
  const p2ScoreNum = document.getElementById("player2ScoreNum");
  p1ScoreNum.textContent = p1Count;
  p2ScoreNum.textContent = p2Count;
  p1ScoreNum.className = "score-num " + p1Color.toLowerCase();
  p2ScoreNum.className = "score-num " + p2Color.toLowerCase();

  // Update dot scores (total dots as digits)
  const p1DotScore = document.getElementById("player1DotScore");
  const p2DotScore = document.getElementById("player2DotScore");
  if (p1DotScore) p1DotScore.textContent = `(${countPlayerDots(1)})`;
  if (p2DotScore) p2DotScore.textContent = `(${countPlayerDots(2)})`;
}



let currentPlayer = 1;
let turnsPlayed = 0;
let player1FirstMove = true;
let player2FirstMove = true;

// Tracks if we are on the toggled game (after clicking Play Again)
let isAlternateGame = false;

const gridSize = 6;
const cells = [];

const grid = document.getElementById("gameGrid");

// Build Grid
for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize; col++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.row = row;
    cell.dataset.col = col;
    grid.appendChild(cell);
    cells.push(cell);
  }
}

function getPlayerColor(player) {
  // Player colors toggle on isAlternateGame
  if (player === 1) return isAlternateGame ? "Red" : "Blue";
  else return isAlternateGame ? "Blue" : "Red";
}

function getPlayerClass(player) {
  // CSS class for player coloring (used in markers)
  return isAlternateGame
    ? player === 1 ? "player2" : "player1" // switched classes when toggled
    : player === 1 ? "player1" : "player2";
}

function updateTurnDisplay() {
  document.body.classList.remove("player1-turn", "player2-turn");
  // Add correct class according to toggling
  const bodyClass = isAlternateGame
    ? currentPlayer === 1 ? "player2-turn" : "player1-turn"
    : currentPlayer === 1 ? "player1-turn" : "player2-turn";
  document.body.classList.add(bodyClass);

  const colorName = getPlayerColor(currentPlayer);
  turnIndicator.textContent = `Player ${currentPlayer}'s Turn (${colorName})`;
}

function getCell(row, col) {
  return cells.find(c => +c.dataset.row === row && +c.dataset.col === col);
}

function playerHasMarker(player) {
  // Check if any cell has marker of this player
  return cells.some(cell => {
    const marker = cell.querySelector(".marker");
    return marker && parseInt(marker.dataset.player) === player;
  });
}

function updateScore(marker, score, delay = 150) {
  marker.dataset.score = score;
  marker.innerHTML = "";

  setTimeout(() => {
    const container = document.createElement("div");
    container.classList.add("score-container", `score-${score}`);
    for (let i = 0; i < score; i++) {
      const dot = document.createElement("div");
      dot.classList.add("score-dot");
      container.appendChild(dot);
    }
    marker.appendChild(container);
  }, delay);
}


function createNewMarker(cell, player, isChild = false, customScore = null, fromCell = null) {
  const marker = document.createElement("div");
  marker.classList.add("marker");

  // Add correct player class based on toggle
  marker.classList.add(getPlayerClass(player));

  if (fromCell) {
  const fromRect = fromCell.getBoundingClientRect();
  const toRect = cell.getBoundingClientRect();
  const translateX = fromRect.left - toRect.left;
  const translateY = fromRect.top - toRect.top;

  marker.style.transition = 'none';
  marker.style.transform = `translate(${translateX}px, ${translateY}px)`;
  marker.classList.add('moving');

  requestAnimationFrame(() => {
    marker.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    marker.style.transform = 'translate(0, 0)';
  });

  setTimeout(() => {
    marker.classList.remove('moving');
    marker.style.transform = '';
  }, 600);
}

  marker.dataset.player = player;
  const score = customScore !== null ? customScore : (isChild ? 1 : 3);
  updateScore(marker, score, 150); // Delay only for new markers
  cell.innerHTML = "";
  cell.appendChild(marker);
  cell.classList.remove("player1-cell", "player2-cell");

  // Apply correct cell class based on toggle
  if (isAlternateGame) {
    cell.classList.add(player === 1 ? "player2-cell" : "player1-cell");
  } else {
    cell.classList.add(player === 1 ? "player1-cell" : "player2-cell");
  }

  updateScoreBoard();
  return marker;
}

function incrementScore(cell, player) {
  const marker = cell.querySelector(".marker");
  let score = parseInt(marker.dataset.score);
  if (score === 4) return;
  updateScore(marker, score + 1, 150); 
  if (score + 1 === 4) {
    setTimeout(() => {
      explode(cell, player);
    }, 300);
  }
  updateScoreBoard();
}

function explode(cell, player) {
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  cell.innerHTML = "";
  cell.classList.remove("player1-cell", "player2-cell");

  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0]
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
      const targetCell = getCell(newRow, newCol);
      const targetMarker = targetCell.querySelector(".marker");
      let newScore = 1;

      if (targetMarker) {
        const targetPlayer = parseInt(targetMarker.dataset.player);
        const targetScore = parseInt(targetMarker.dataset.score);
        newScore = 1 + targetScore;
        createNewMarker(targetCell, player, true, newScore, cell);
      } else {
        createNewMarker(targetCell, player, true, newScore, cell);
      }

      const newMarker = targetCell.querySelector(".marker");
     
      if (parseInt(newMarker.dataset.score) === 4) {
  setTimeout(() => explode(targetCell, player), 600); 
}
    }
  }

  setTimeout(() => checkWinner(), 200);
}

function checkWinner() {
  if (turnsPlayed < 2) return;
  const p1 = playerHasMarker(1);
  const p2 = playerHasMarker(2);
  if (p1 && !p2) showWinner(1);
  else if (p2 && !p1) showWinner(2);
}


function showWinner(player) {
  const color = getPlayerColor(player); 
  winnerMessage.textContent = `${color} Wins!`;
  winnerMessage.classList.remove("player1-win", "player2-win");
  if (color === "Blue") {
    winnerMessage.classList.add("player1-win");
  } else {
    winnerMessage.classList.add("player2-win");
  }
  // Show winner display after some time
  setTimeout(() => {
    winnerDisplay.classList.remove("hidden");
  }, 1200); 
}


function resetGame() {
  cells.forEach(cell => {
    cell.innerHTML = "";
    cell.classList.remove("player1-cell", "player2-cell");
  });

  currentPlayer = 1;
  turnsPlayed = 0;
  player1FirstMove = true;
  player2FirstMove = true;

  isAlternateGame = !isAlternateGame; // Toggle colors on each reset

  winnerDisplay.classList.add("hidden");
  winnerMessage.classList.remove("player1-win", "player2-win");

  updateTurnDisplay();
  updateScoreBoard();
}

function countPlayerDots(player) {
  // Sums up all dots (score) for the given player
  return cells.reduce((sum, cell) => {
    const marker = cell.querySelector(".marker");
    if (marker && parseInt(marker.dataset.player) === player) {
      return sum + parseInt(marker.dataset.score);
    }
    return sum;
  }, 0);
}

// Event Listeners
cells.forEach(cell => {
  cell.addEventListener("click", () => {
    if (!winnerDisplay.classList.contains("hidden")) return;

    const marker = cell.querySelector(".marker");
    const isFirstMove = currentPlayer === 1 ? player1FirstMove : player2FirstMove;
    const ownsCell = cell.classList.contains(getPlayerClass(currentPlayer) + "-cell");

    if (!marker) {
      if (isFirstMove || ownsCell) {
        createNewMarker(cell, currentPlayer);

        if (currentPlayer === 1) player1FirstMove = false;
        else player2FirstMove = false;

        turnsPlayed++;
        checkWinner();
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateTurnDisplay();
      }
    } else {
      const owner = parseInt(marker.dataset.player);
      if (owner === currentPlayer) {
        incrementScore(cell, currentPlayer);
        turnsPlayed++;
        checkWinner();
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateTurnDisplay();
      }
    }
  });
});

playAgainButton.addEventListener("click", resetGame);

updateTurnDisplay();
updateScoreBoard();