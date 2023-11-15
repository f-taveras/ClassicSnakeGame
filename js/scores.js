'use strict';
const scoresList = document.getElementById('high-scores-ul');
let scores = [];

// Local storage
const storedScores = localStorage.getItem('snakeScores');

function createLi(text, parent) {
  const li = document.createElement('li');
  li.textContent = text;
  parent.appendChild(li);
}

if(storedScores) {
  scores = JSON.parse(storedScores);
} else {
  scores = [
    {player: 'Ekow', highestScore: 50},
    {player: 'Felix', highestScore: 45},
    {player: 'Stephanie', highestScore: 40},
    {player: 'Latherio', highestScore: 35},
    {player: 'David', highestScore: 30}
  ];
}

const sortedScores = scores.slice().sort((a, b) => {
  return b.highestScore - a.highestScore;
});

sortedScores.forEach(score => {
  createLi(`${score.player}....${score.highestScore}`, scoresList);
});
