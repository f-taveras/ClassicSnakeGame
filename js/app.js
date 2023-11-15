'use strict';
/* ================> GLOBAL VARS ================> */
// const cl = (input) => {console.log(input);};
// Sound files and Variables
const gameOverSound = new Audio('game-over.mp3');
const gameStartSound = new Audio('game-start.mp3');
const snakeTurnSound = new Audio('snake-turn.mp3');
const snakeEatAppleSound = new Audio('snake-eat-apple.mp3');
gameStartSound.volume = 0.35;

// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const boxSize = 10;
const canvasSize = 600;

// Init beginning values
let scores = [];
let currentScore = 0;
let nIntervId;
let snake = [{ x: 10, y: 10 }];
let food = { x: 0, y: 0 };
let direction = 'right';
let playerObj;

//Get player's name
let playerName = prompt('What is your name, friend?');
playerName = validateName(playerName);

/* ================> GAME CLASS */
class Game {
  constructor(id, player, highestScore, gamesPlayed) {
    this.id = id;
    this.player = player;
    this.highestScore = highestScore;
    this.gamesPlayed = gamesPlayed;
  }
}

// Local storage
const storedScores = localStorage.getItem('snakeScores');
if(!storedScores){
  scores = [ new Game(0, playerName, 0, 0) ];
} else {
  const parsedScores = JSON.parse(storedScores);
  let newPlayer = {};

  scores = parsedScores.map(score => new Game(
    score.id,
    score.player,
    score.highestScore,
    score.gamesPlayed
  ));

  if(!scores.find(isPlayer)) {
    newPlayer = new Game(0, playerName, 0, 0);
    scores.push(newPlayer);
  }
}

playerObj = scores.find(isPlayer);

/* ================> FUNCTIONS ================> */
/* ================> SEARCH EXISTING PLAYER */
function isPlayer(game) {
  return game.player === playerName;
}

/* ================> GET PLAYER NAME */
function validateName(name) {
  // Input validation
  if (name && name.trim().length !== 0) {
    // Remove non-allowed characters
    name = name.replace(/[^a-zA-Z0-9\-_\.]/g, '');
    // Truncate to 10 characters if the name is longer
    if (name.length > 10) {
      name = name.substring(0, 10);
    }
  } else {
    name = 'AAA';
  }
  return name;
}

/* ================> DRAW FOOD AND SNAKE ON CANVAS */
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Draw the snake
  ctx.fillStyle = '#00FF00';
  for (let i = 0; i < snake.length; i++) {
    const isHead = i === 0;
    //Head is green, body is dark green
    ctx.fillStyle = isHead ? '#00FF00' : '#008000';
    ctx.beginPath();
    ctx.arc(
      (snake[i].x + 0.5) * boxSize,
      (snake[i].y + 0.5) * boxSize,
      boxSize / 2, 0, 2 * Math.PI
    );
    ctx.fill();
    ctx.closePath();
  }

  // Draw the food
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(
    (food.x + 0.5) * boxSize,
    (food.y + 0.5) * boxSize,
    boxSize / 2, 0, 2 * Math.PI
  );
  ctx.fill();
  ctx.closePath();
}

/* ================> GENERATE FOOD IN RAND LOC AND SET HIGH SCORE */
function generateFood() {
  food.x = Math.floor(Math.random() * (canvasSize / boxSize));
  food.y = Math.floor(Math.random() * (canvasSize / boxSize));
  updateHighScore();
}

/* ================> UPDATE SNAKE MOVEMENT AND UPDATE FOOD */
function update() {
  // Move the snake
  let newHead = { x: snake[0].x, y: snake[0].y };
  switch (direction) {
    case 'up':
      newHead.y--;
      updateScore();
      updateHighScore();
      break;
    case 'down':
      newHead.y++;
      updateScore();
      updateHighScore();
      break;
    case 'left':
      newHead.x--;
      updateScore();
      updateHighScore();
      break;
    case 'right':
      newHead.x++;
      updateScore();
      updateHighScore();
      break;
  }

  // Check for collision with food
  if (newHead.x === food.x && newHead.y === food.y) {
    snake.unshift({ x: food.x, y: food.y });
    generateFood();
    // Play eating sound
    snakeEatAppleSound.play();
    currentScore += 5;
  } else {
    // Remove the tail if no collision with food
    snake.pop();
  }

  // Check for collision with walls
  if (newHead.x < 0
    || newHead.x * boxSize >= canvasSize
    || newHead.y < 0
    || newHead.y * boxSize >= canvasSize
  ) {
    // Game over Sound effect
    gameOver();
    currentScore = 0;
    return;
  }

  // Check for collision with itself
  for (let i = 1; i < snake.length; i++) {
    if (newHead.x === snake[i].x
      && newHead.y === snake[i].y
    ) {
      // Game over Sound effect
      gameOver();
      currentScore = 0;
      return;
    }
  }
  // Add the new head to the snake
  snake.unshift(newHead);
  // Draw the updated game state
  draw();
}

/* ================> PAUSE & RESET GAME */
function resetGame() {
  snake = [{ x: 10, y: 10 }];
  generateFood();
  direction = 'right';
  updateHighScore();
}

/* ================> START GAME */
function startGame() {
  if (!nIntervId) {
    nIntervId = setInterval(update, 100);
    // Play Start Game Sound
    gameStartSound.currentTime = 0;
    gameStartSound.play();
  }
}

/* ================> STOP GAME */
function stopGame() {
  if (currentScore > playerObj.highestScore) {
    playerObj.highestScore = currentScore;
  }

  const gameNumber = scores.reduce(
    (accumulator,currentValue) => accumulator+currentValue.gamesPlayed,0
  );

  playerObj.id = gameNumber + 1;
  playerObj.gamesPlayed++;

  localStorage.setItem('snakeScores', JSON.stringify(scores));
  clearInterval(nIntervId);
  // Stop playing background music
  gameStartSound.pause();
  // release our intervalID from the variable
  nIntervId = null;
  resetGame();
}

/* ================> GAME OVER, RESET GAME, AND STOP/START SOUNDS */
function gameOver() {
  // Game over Sound effect
  gameStartSound.pause();
  gameStartSound.currentTime = 0;
  gameOverSound.play();

  alert(`Game Over! Your score ${currentScore}`);
  stopGame();
}

/* ================> UPDATE SCORES */
function updateHighScore() {
  const highScore = document.getElementById('highScore');
  if (currentScore > playerObj.highestScore) {
    playerObj.highestScore = currentScore;
  }
  highScore.textContent = `High Score  ${playerObj.highestScore}`;
}

function updateScore() {
  document.getElementById('currentScore').textContent = `Score: ${currentScore}`;
}


/* HANDLE ARROW KEY CONTROLS */
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      direction = 'up';
      // Play snake turn sound
      snakeTurnSound.play();
      break;
    case 'ArrowDown':
      direction = 'down';
      // Play snake turn sound
      snakeTurnSound.play();
      break;
    case 'ArrowLeft':
      direction = 'left';
      // Play snake turn sound
      snakeTurnSound.play();
      break;
    case 'ArrowRight':
      direction = 'right';
      // Play snake turn sound
      snakeTurnSound.play();
      break;
  }
});

/* ================> INIT ================> */
// Start and Stop button event listener
document.getElementById('start').addEventListener('click', startGame);
document.getElementById('reset').addEventListener('click', stopGame);
// Init game
updateHighScore();
generateFood();

//Toggle Tutorial Function for Game HTML
function toggleTutorial() {
    let tutorialContainer = document.getElementById("tutorialContainer");
    let button = document.querySelector(".toggle-tutorial");
  
    if (tutorialContainer.style.display === "none") {
      tutorialContainer.style.display = "block";
      button.innerText = "Hide Tutorial";
    } else {
      tutorialContainer.style.display = "none";
      button.innerText = "How To Play";
    }
  }

//});

