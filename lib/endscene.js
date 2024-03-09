/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|

Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

"use strict";

function updateLeaderboard(username, score) {
  let leaderboardUrl = "https://www.dreamlo.com/lb/CBGhFikNak2i8KjH3UPThAfGJFnWo9A0O8mjvU19hS2Q/add/".concat(username, "/").concat(score);
  fetch(leaderboardUrl).then(response => response.text()).then(data => console.log(data)).catch(error => {
    console.error('Error:', error);
  });
}
class Endscene extends Phaser.Scene {
  constructor() {
    super('Endscene');
  }
  async getTopScores() {
    try {
      const response = await fetch('https://www.dreamlo.com/lb/64c442f28f40bb8380e27ce7/json');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      const data = await response.json();
      let scores = data.dreamlo.leaderboard.entry;
      scores.sort((a, b) => b.score - a.score);
      return scores.slice(0, 5);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  preload() {
    this.load.image('endscene', '../assets/images/backgrounds/endscene.jpg');
  }
  create() {
    const self = this;
    const mainTextConfig = {
      fontSize: '65px',
      fill: '#a9a9a9',
      fontFamily: 'Rock Kapak'
    };
    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.input.keyboard.createCursorKeys();
    this.add.image(825, 480, 'endscene').setScale(1.43).setOrigin(0.5, 0.5).on('pointerup', () => returnToMenu());
    this.add.text(825, 165, 'Thanks for playing\nPunk Rock Samurai', mainTextConfig).setOrigin(0.5, 0.5);
    gameState.score.totalScore = gameState.score.levelsCompleted > 0 ? gameState.score.levelsCompleted * (15 + Math.max(0, 7 - gameState.score.numberOfTurns / gameState.score.levelsCompleted)) : 0;
    let labels = {
      numberOfTurns: "Number of turns played",
      levelsCompleted: "Number of fights won",
      damageTaken: "Total damage taken",
      damageDealt: "Total damage dealt",
      totalScore: 'Your score'
    };
    let x = 375;
    let y = 300;
    let spacing = 30;
    async function displayLeaderBoard() {
      try {
        console.log("displayLeaderBoard called");
        let topScores = await self.getTopScores();
        const leaderboardBackground = self.add.graphics();
        leaderboardBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.70);
        leaderboardBackground.fillRect(x, y, 900, 630);
        self.add.text(x + 75, y + 75, 'Your Results', {
          fontSize: '40px',
          fill: '#000000'
        }).setOrigin(0);
        Object.entries(gameState.score).forEach(_ref => {
          let [key, value] = _ref;
          console.log("".concat(key, ": ").concat(value));
          if (labels[key]) {
            // if there is a matching label for the key
            let resultsText = "".concat(labels[key], ": ").concat(value);
            self.add.text(x + 75, y + 135, resultsText, {
              color: '#000',
              fontSize: '16px'
            });
            y += spacing;
          }
        });
        const textConfig = {
          fontSize: '16px',
          fill: '#000000'
        };
        self.add.text(x + 75, y + 225, 'Leaderboard', {
          fontSize: '40px',
          fill: '#000000'
        }).setOrigin(0);
        if (topScores) {
          topScores.forEach((score, index) => {
            let dateOnly = score.date.split(' ')[0]; // Splitting the date string and keeping only the first part
            const scoreText = "".concat(index + 1, ". Name: ").concat(score.name, ", Score: ").concat(score.score, ", Date: ").concat(dateOnly);
            self.add.text(x + 75, y + 285, scoreText, textConfig).setOrigin(0);
            y += spacing;
          });
        } else {
          self.add.text(x + 75, y + 285, 'Leaderboard is down for maintenance', textConfig).setOrigin(0);
        }
      } catch (error) {
        console.error("Error in displayLeaderBoard: ", error);
        const errorTextConfig = {
          fontSize: '25px',
          fill: '#FF0000'
        };
        self.add.text(x + 75, y + 285, 'Leaderboard is down for maintenance', errorTextConfig).setOrigin(0);
      }
    }
    function returnToMenu() {
      if (returnToMenuCalled) return;
      returnToMenuCalled = true;
      console.log("returnto meny called");
      gameState.name = '';
      gameState.playerName = '';
      self.cameras.main.shake(1500, .0015, false);
      self.cameras.main.flash(500);
      self.time.delayedCall(500, () => {
        self.cameras.main.fadeOut(1000);
        gameState.restartGame = true;
        gameConfig.levels.forEach(level => {
          if (level !== "Endscene") {
            self.scene.stop(level);
          }
        });
        gameConfig.preLevelsScenes.forEach(level => self.scene.stop(level));
        self.scene.start('Preload');
      });
    }
    if (gameState.playerName != 'admin' && gameState.playerName != 'Cheater') {
      const scoreModifyer = gameState.difficulty === "Easy" ? 0.8 : gameState.difficulty === "Medium" ? 1 : 1.2;
      gameState.score.totalScore *= scoreModifyer;
      updateLeaderboard(gameState.playerName, gameState.score.totalScore);
    }

    // Give time for leaderboard to update with players score 
    self.time.delayedCall(600, displayLeaderBoard);
    let returnToMenuCalled = false;
    this.time.delayedCall(8000, returnToMenu);
    this.input.on('pointerup', returnToMenu);
  }
}
;