/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|

Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

"use strict";

// Defined globally to be available to scene.update() 
const sceneState = {};
const menuButtons = [];
const willSkipMenu = false;
class Mainmenu extends Phaser.Scene {
  constructor() {
    super('Mainmenu');
  }
  async getTopScores() {
    try {
      // Fetch leaderboard
      const response = await fetch('https://www.dreamlo.com/lb/64c442f28f40bb8380e27ce7/json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      let scores = data.dreamlo.leaderboard.entry || [];

      // Return the top 5 scores
      if (scores.length > 1) {
        scores.sort((a, b) => b.score - a.score);
      }
      return scores.slice(0, 5);
    } catch (error) {
      console.error('Error fetching top scores:', error);
      return [];
    }
  }
  preload() {
    this.load.image('player', '../assets/images/sprites/punkrock.png');
    this.load.image('deck', '../assets/images/ui/cardback.jpg');
    this.load.image('strengthAndArmor', '../assets/images/ui/strengthAndArmor.png');
    this.load.image('targetingCursor', '../assets/images/ui/targetingCursor.png');
    this.load.image('targetingCursorReady', '../assets/images/ui/targetingCursorReady.png');
    this.load.image('rectangularFrame', '../assets/images/ui/stoneButtonFrame.png');
  }
  create() {
    const self = this;
    const sceneElements = [];
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.input.keyboard.createCursorKeys();
    this.add.image(825, 720, 'bgLoadingScreen').setScale(2.1);
    const versionTextConfig = {
      fontSize: '17px',
      fill: '#ff0000'
    };
    this.add.text(23, 8, "Punk Rock Samurai Beta v".concat(gameState.version), versionTextConfig);
    const textBox = {
      x: 390,
      xSpan: 1210,
      textOffsetX: 45,
      textOffsetY: 120,
      headlineOffsetY: 45,
      radius: 10
    };
    gameConfig.cardsDealtSound = this.sound.add('cardsDealtSound');
    gameConfig.buttonPressedSound = this.sound.add('buttonPressedSound');
    let nextlevelstarting = false;
    gameState.isEnteringName = false;
    sceneState.name = '';
    const textConfig = {
      fontSize: '21px',
      fill: '#000000'
    };
    const headlineConfig = {
      fontSize: '38px',
      fill: '#000000'
    };

    //create and position menu buttons
    const x = 190;
    const y = 480;
    const offset = 115;
    let i = 0;
    console.log('Scene status:', self.scene.key, self.scene.isActive());
    let delayTime;
    const newGameButton = new Button(self, 'New Game', InitiatetNewGame, x, y + offset * i++);
    const loadGameButton = new Button(self, 'Load Game', initiateLoadGame, x, y + offset * i++);
    const leaderBoardButton = new Button(self, 'Leaderboard', displayLeaderboard, x, y + offset * i++);
    const creditsButton = new Button(self, 'Credits', displayCredits, x, y + offset * i++);
    const instructionsButton = new Button(self, 'Instructions', displayInstructions, x, y + offset * i++);
    while (menuButtons.length) {
      menuButtons.pop();
    }
    menuButtons.push(newGameButton, loadGameButton, leaderBoardButton, creditsButton, instructionsButton);
    menuButtons.forEach(button => button.activate().setScale(1.28, 0.80).updateFont(35, '#000000'));
    if (!localStorage.getItem('gameState')) {
      loadGameButton.updateFont(30, '#a9a9a9');
    }

    // Check if the player is on a mobile device
    function isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    ;

    // If so, initiate the on-screen keyboard
    if (isMobileDevice()) {
      gameState.hiddenInput = document.createElement('input');
      gameState.hiddenInput.style.position = 'absolute';
      gameState.hiddenInput.style.opacity = '0';
      gameState.hiddenInput.style.zIndex = '-1';
      document.body.appendChild(gameState.hiddenInput);
      gameState.hiddenInput.addEventListener('input', function (event) {
        gameState.name = event.target.value;
      });
    }
    ;
    skipMenu(willSkipMenu); // Keep for testing

    /**
    * -------------------------------------------------------------------------------------------------------------------
    * NEW GAME
    * -------------------------------------------------------------------------------------------------------------------
    */

    // Handler for newGameButton pointerup
    function InitiatetNewGame() {
      clearElements();
      newGameButton.isPressed = !newGameButton.isPressed;
      if (!newGameButton.isPressed) return;
      menuButtons.filter(button => button !== newGameButton).forEach(button => button.isPressed = false);

      // Create form for entering name.
      gameState.name = 'Enter your name...';
      const nameTextConfig = {
        fontSize: '35px',
        fill: '#000000'
      };
      sceneState.nameText = self.add.text(630, 475, gameState.name, nameTextConfig).setDepth(21);
      sceneState.formFrame = self.add.image(825, 490, 'rectangularFrame');
      sceneState.formFrame.setScale(1.8, 0.90).setInteractive().setDepth(22);
      sceneState.nameForm = self.add.graphics({
        x: 600,
        y: 435
      });
      sceneState.nameForm.fillStyle(0xFFFFFF, 1).setAlpha(0.90).setInteractive().setDepth(20);
      sceneState.nameForm.fillRect(0, 0, 450, 100);
      sceneState.nameForm.setInteractive(new Phaser.Geom.Rectangle(0, 0, 450, 100), Phaser.Geom.Rectangle.Contains);
      const startGameButton = new Button(self, "Let\'s go!", saveNameAndExitMenu, 825, 600);
      startGameButton.setScale(1.8, 0.90).updateFont(42).activate();
      sceneElements.push(sceneState.nameForm, sceneState.nameText, sceneState.formFrame, startGameButton);
      implementCursor();
      activateNameForm(sceneState.nameForm);
      activateNameForm(sceneState.formFrame);
    }
    ;

    // Helper function for creating and animating the text-box cursor
    function implementCursor() {
      const formCursorConfig = {
        fontSize: '48px',
        fill: '#000000'
      };
      sceneState.formCursor = self.add.text(630, 465, '|', formCursorConfig).setDepth(21).setAlpha(0);
      sceneElements.push(sceneState.formCursor);
      sceneState.cursorTween = self.tweens.add({
        targets: sceneState.formCursor,
        alpha: 1,
        duration: 300,
        hold: 600,
        yoyo: true,
        repeat: -1,
        paused: true
      });
    }

    // Activate/ deactivate the input form, using isEnteringName to start/stop the recording of key strokes, and the cursor. 
    function activateNameForm(gameObject) {
      gameObject.on('pointerup', () => {
        if (gameState.isEnteringName) return;
        gameState.isEnteringName = true;
        if (gameState.name === 'Enter your name...') gameState.name = '';
        sceneState.formCursor.setAlpha(0);
        sceneState.cursorTween.resume();

        // Try to activate the on-screen keyboard for mobile devices. If this fails, proceed to level 1.
        try {
          if (isMobileDevice()) gameState.hiddenInput.focus();
        } catch (error) {
          console.error("Onscreen keyboard failed to open", error);
          gameState.isEnteringName = false;
          saveNameAndExitMenu();
        }
        const enterKey = self.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        enterKey.once('down', function () {
          gameState.isEnteringName = false;
          saveNameAndExitMenu();
        });

        // deactivateNameForm() must be called after a short delay to ensure that the pointerup  
        // event that called activateNameForm() doesn't inadvertently call it as well.
        self.time.delayedCall(200, () => deactivateNameForm());
      });
    }
    function deactivateNameForm() {
      self.input.off('pointerup');
      self.input.once('pointerup', () => {
        if (!gameState.isEnteringName) return;
        let delayTime = 0;

        // Reset form if it's empty
        if (!gameState.name) {
          gameState.name = 'Enter your name...';
          delayTime = 100; // Gives Update() time to update the name field before !isEnteringName.
        }
        ;

        // Deactivates typing
        self.time.delayedCall(delayTime, () => {
          gameState.isEnteringName = false;
          console.log('isEnteringName has been deactivated');
        });

        // Remove cursor
        sceneState.formCursor.setAlpha(0);
        sceneState.cursorTween.pause();
        diableOnScreenKeyboard();
      });
    }

    // Deactivate the on-screen keyboard for mobile devices
    function diableOnScreenKeyboard() {
      try {
        if (isMobileDevice()) {
          gameState.hiddenInput.blur();
        }
      } catch (error) {
        console.error("Onscreen keyboard failed to close", error);
        gameState.isEnteringName = false;
        saveNameAndExitMenu();
      }
    }

    // Log key strokes if isEnteringName === true
    this.input.keyboard.on('keydown', event => {
      if (!gameState.isEnteringName) return;
      const maxNameLength = 18; //  keep the text from overflowing the form

      if (event.keyCode === 8 && gameState.name.length > 0) {
        // Implement backspace
        gameState.name = gameState.name.slice(0, -1);

        // Add other characters   
      } else if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9\s\-_]/) && gameState.name.length < maxNameLength) {
        gameState.name += event.key;
      } else if (gameState.name.length === maxNameLength) {
        self.cameras.main.shake(30, .0010, false);
      }
    });

    // Store chocen name as gameState.playerName, remove menu items and initate Permanent selection
    function saveNameAndExitMenu() {
      gameState.isEnteringName = false;

      // Set 'Punk Rock Samurai' as the default name if no name is entered
      const isEnteredName = gameState.name !== 'Enter your name...' && gameState.name !== '';
      gameState.playerName = isEnteredName ? gameState.name : 'Punk Rock Samurai';
      clearElements();
      menuButtons.forEach(button => button.disable().fadeOut(300));
      self.time.delayedCall(200, () => selectDifficulty());
    }
    function selectDifficulty() {
      const x = 825;
      const y = 480;
      const offset = 150;
      let i = 0;
      const textCoordinates = {
        x: x,
        y: 225,
        z: 201
      };
      sceneState.heading = new TextBox(self, 'Select Difficulty', textCoordinates);
      const easyButton = new Button(self, 'Easy', handleDifficultySelected, x, y + offset * i++);
      const mediumButton = new Button(self, 'Medium', handleDifficultySelected, x, y + offset * i++);
      const hardcoreButton = new Button(self, 'HARDCORE', handleDifficultySelected, x, y + offset * i++);
      sceneState.difficultyButtons = [easyButton, mediumButton, hardcoreButton];
      sceneState.difficultyButtons.forEach(button => {
        button.setScale(1.5, 1.05).activate().setHandlerArg(button.key).updateFont(35);
      });
    }

    // Store selected difficulty level as gameState.difficulty === 1, 2, or 3.
    async function handleDifficultySelected(keyOfClickedButton) {
      gameState.difficulty = keyOfClickedButton;
      sceneState.heading.updateText('Difficulty Selected!');

      // Disable and fade out button sprites
      const clickedButton = sceneState.difficultyButtons.find(button => button.key === keyOfClickedButton);
      const otherButtons = sceneState.difficultyButtons.filter(button => button.key !== keyOfClickedButton);
      sceneState.difficultyButtons.forEach(button => button.disable());
      otherButtons.forEach(button => button.fadeOut(300));
      clickedButton.fadeOut(600);

      // transition to permanent selection after a short delay
      await delay(700);
      selectPermanent();
    }

    // Draw 3 random Permanent cards from extraCards; chose one to be autimatically activated in Level1Fight1
    function selectPermanent() {
      sceneState.heading.updateText('Choose one Free Permanent');
      const x = 480;
      const y = 615;
      const spacing = 330;

      // Shuffle the extraCards deck, draw 3 random cards
      shuffleDeck(gameState.extraCards);
      const bonusCards = gameState.extraCards.slice(0, 3);

      // Event listeners for pointerover, pointerout and pointerup
      bonusCards.forEach((bonusCard, idx) => {
        bonusCard.sprite = self.add.image(x + idx * spacing, y, bonusCard.key).setScale(0.67);
        bonusCard.activate();
        bonusCard.sprite.on('pointerover', () => bonusCard.resize(self, 0.87, 200));
        bonusCard.sprite.on('pointerout', () => bonusCard.resize(self, 0.67, 400));
        bonusCard.sprite.on('pointerup', () => transitionToLevel(bonusCard, bonusCards));
      });
    }

    // Add bonusCard to deck and call startNextLevel() after a delay or if any button is pressed. 
    async function transitionToLevel(bonusCard, bonusCards) {
      gameConfig.cardsDealtSound.play({
        volume: 1.2,
        seek: 0.12
      });
      sceneState.heading.updateText('Permanent Selected');
      bonusCard.freePermanent = true;
      gameState.deck.push(bonusCard);

      // Add all rejected cards back into bonusCards
      gameState.extraCards.splice(gameState.extraCards.indexOf(bonusCard), 1);
      shuffleDeck(gameState.extraCards);

      // Set Card sprites Remove the sprites of all rejected cards
      bonusCard.disable().center(self);
      bonusCards.filter(card => card !== bonusCard).forEach(card => card.disable().fadeOut(self));

      // Start Level 1 in 2500 ms or if any key is pressed.
      await delay(100);
      self.time.delayedCall(2400, () => startNextLevel());
      self.input.on('pointerup', () => startNextLevel());
      self.input.keyboard.on('keydown', () => startNextLevel());
    }

    // Start Level1Fight1
    function startNextLevel() {
      if (nextlevelstarting) return;
      nextlevelstarting = true;
      self.cameras.main.fadeOut(1200);
      self.time.delayedCall(1200, () => {
        self.scene.start('Level1Fight1');
      });
    }
    ;

    /**
    * -------------------------------------------------------------------------------------------------------------------
    * LOAD GAME
    * -------------------------------------------------------------------------------------------------------------------
    */

    // Implement load game
    function initiateLoadGame() {
      clearElements();
      loadGameButton.isPressed = !loadGameButton.isPressed;
      if (!loadGameButton.isPressed) return;
      menuButtons.filter(button => button !== loadGameButton).forEach(button => button.isPressed = false);
      try {
        // Inform the player if there are no saved gamestate
        const serializedState = localStorage.getItem('gameState');
        if (serializedState === null) {
          informNoSavedGame();
          return;
        }

        // Check if the game has been updated since the last save and let player decide
        const loadedState = JSON.parse(serializedState);
        if (!controlVersion(loadedState)) return;

        // Otherwise load the game normally
        const deckList = [loadedState.deck, loadedState.bonusCards, loadedState.extraCards, loadedState.latestDraw];
        deckList.forEach(deck => refreshDeck(deck));
        gameState = loadedState;
        refreshPlayer(gameState.player);
        console.log('Game state loaded successfully.');
        self.scene.start(gameState.savedScene);
      } catch (e) {
        console.error('Failed to load the game state.', e);
        informNoSavedGame();
      }
    }
    ;

    // Check if the saved game was played on the current patch. If not, ask if the player still want to load it.
    function controlVersion(loadedState) {
      if (loadedState.version === gameState.version) return true;
      const confimaMessage = "The game has been updated since this save was made (saved version: ".concat(loadedState.version, ", ") + "current version: ".concat(gameState.version, "). Loading this file might cause issues. Do you still want to load?");
      const confirmLoad = confirm(confimaMessage);
      return confirmLoad;
    }

    // Helper function for setting player stats when loading a game
    function refreshPlayer(player) {
      const restoredPlayer = new Player(player.name, player.healthMax, player.strengthBase, player.armorBase);
      restoredPlayer.gold = player.gold;
      restoredPlayer.playerName = player.playerName;
      restoredPlayer.manaMax = player.manaMax;
      restoredPlayer.manaBase = player.manaBase;
      restoredPlayer.health = player.health;
      gameState.player = restoredPlayer;
    }

    // Creates a new instance of each card in the deck.
    function refreshDeck(deck) {
      deck.forEach((deckCard, idx) => {
        const args = gameConfig.cardDefinitions.find(item => item.key === deckCard.key);

        // Ensures that aquired attributes are not reset.
        if (deckCard.turnsToDepletion || deckCard.usesTillDepletion || deckCard.freePermanent) {
          Object.assign(args, {
            turnsToDepletion: deckCard.turnsToDepletion,
            usesTillDepletion: deckCard.usesTillDepletion,
            freePermanent: deckCard.freePermanent
          });
        }
        deck[idx] = new Card(args);
      });
    }

    // Inform the player that no saved gamestate was found
    function informNoSavedGame() {
      const textContent = 'No saved game state found.';
      const textConfig = {
        fontSize: '60px',
        fill: '#000000'
      };
      const noSaveText = self.add.text(930, 525, textContent, textConfig).setOrigin(0.5).setDepth(21);
      const bounds = noSaveText.getBounds();
      const backgroundWidth = bounds.width + 15;
      const backgroundHeight = bounds.height + 15;
      const backgroundX = bounds.x - 15;
      const backgroundY = bounds.y - 7.5;
      const textBackground = self.add.graphics();
      textBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.8).setDepth(20);
      textBackground.fillRoundedRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight, 15);
      sceneElements.push(noSaveText, textBackground);
      console.log(textContent);
      self.cameras.main.shake(70, .002, false);
    }

    // Display Leaderboard
    async function displayLeaderboard() {
      clearElements();
      leaderBoardButton.isPressed = !leaderBoardButton.isPressed;
      if (!leaderBoardButton.isPressed) return;
      menuButtons.filter(button => button !== leaderBoardButton).forEach(button => button.isPressed = false);
      const topScores = await self.getTopScores();
      const {
        x,
        xSpan,
        textOffsetX,
        textOffsetY,
        headlineOffsetY,
        radius
      } = textBox;
      const y = 400;
      const ySpan = 300;
      const leaderboardsBackground = self.add.graphics().fillRoundedRect(x, y, xSpan, ySpan, radius);
      leaderboardsBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9);
      const leaderboardHeadline = self.add.text(x + textOffsetX, y + headlineOffsetY, 'Leaderboard', headlineConfig).setOrigin(0);
      sceneElements.push(leaderboardsBackground, leaderboardHeadline);

      // Display error message if getTopScores() returned an empty array
      if (!topScores.length) {
        const scoreText = "Failed to access leaderboard";
        const displayedScore = self.add.text(x + textOffsetX, y + textOffsetY, scoreText, textConfig).setOrigin(0);
        sceneElements.push(displayedScore);
        return;
      }

      // Otherwise, display the top 5 scores
      displayTopFive(topScores, x, y);
    }
    function displayTopFive(topScores, x, y) {
      topScores.forEach((score, idx) => {
        // Split the date string and keep only the first part
        const dateOnly = score.date.split(' ')[0];
        const scoreText = "".concat(idx + 1, ". Name: ").concat(score.name, ", Score: ").concat(score.score, ", Date: ").concat(dateOnly);
        const displayedScore = self.add.text(x + 45, y + 120, scoreText, textConfig).setOrigin(0);
        sceneElements.push(displayedScore);
        y += 30;
      });
    }

    /**
    * -------------------------------------------------------------------------------------------------------------------
    * CREDITS
    * -------------------------------------------------------------------------------------------------------------------
    */

    // Display Credits
    function displayCredits() {
      clearElements();
      creditsButton.isPressed = !creditsButton.isPressed;
      if (!creditsButton.isPressed) return;
      menuButtons.filter(button => button !== creditsButton).forEach(button => button.isPressed = false);
      const {
        x,
        xSpan,
        textOffsetX,
        textOffsetY,
        headlineOffsetY,
        radius
      } = textBox;
      const y = 350;
      const ySpan = 400;
      const creditsBackground = self.add.graphics().fillRoundedRect(x, y, xSpan, ySpan, radius);
      creditsBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9);
      const creditsHeadline = self.add.text(x + textOffsetX, y + headlineOffsetY, 'Credits', headlineConfig).setOrigin(0);
      const creditsText = self.add.text(x + textOffsetX, y + textOffsetY, "Game Design and Programming by Erlend Kulander Kvitrud\n" + "Music by Marllon Silva (xDeviruchi) (https://soundcloud.com/xdeviruchi)\n" + "Punch sound by @danielsoundsgood (https://danielsoundsgood.itch.io/)\n" + "Healing sound by Dylan Kelk (https://freesound.org/people/SilverIllusionist/)\n" + "Power up sound by MATRIXXX (https://freesound.org/people/MATRIXXX_/)\n" + "Gunshot sound by Fesliyan Studios (https://www.fesliyanstudios.com)\n" + "Button Sprites by Ian Eborn (http://thaumaturge-art.com/)\n" + "Armor and Strength symbols by Josepzin (https://opengameart.org/users/josepzin)\n" + "Card sprites by Avery Ross (https://opengameart.org/users/averyre)\n" + "Coin sound by ProjectsU012 (https://freesound.org/people/ProjectsU012/)\n", textConfig);
      creditsText.setLineSpacing(2.5);
      sceneElements.push(creditsBackground, creditsHeadline, creditsText);
    }

    /**
     * -------------------------------------------------------------------------------------------------------------------
     * INSTRUCTIONS
     * -------------------------------------------------------------------------------------------------------------------
     */

    // Display Instructions
    function displayInstructions() {
      clearElements();
      instructionsButton.isPressed = !instructionsButton.isPressed;
      if (!instructionsButton.isPressed) return;
      menuButtons.filter(button => button !== instructionsButton).forEach(button => button.isPressed = false);
      const {
        x,
        xSpan,
        textOffsetX,
        textOffsetY,
        headlineOffsetY,
        radius
      } = textBox;
      const y = 30;
      const ySpan = 960;
      const instructionsBackground = self.add.graphics().fillRoundedRect(x, y, xSpan, ySpan, radius);
      instructionsBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9);
      const instructionsHeadline = self.add.text(x + textOffsetX, y + headlineOffsetY, 'Instructions', headlineConfig).setOrigin(0);
      const instructionsText = self.add.text(x + textOffsetX, y + textOffsetY, "The game consists of four levels, each of which consists of three fights. At the start\n" + "of each turn, you gain 3 mana and draw 5 cards. You may then play any number of cards\n" + "before hitting \"End Turn\". Your remaining cards and mana are then depleted, and the\n" + "enemy's turn begins. You win the fight by killing all enemies. Losing a fight results in\n" + "permadeath. Missing health carries over from fight to fight\n\n" + "Decks consists of ".concat(gameConfig.minDeckSize, " - ").concat(gameConfig.maxDeckSize, " cards, and can include ") + "at most ".concat(gameConfig.maxCardExemplars, " instances of the same card\n\n") + "Stance represents the balance between Discipline and Freedom.\n" + "-Positive Discipline during your turn: +3 Strength.\n" + "-Positive Discipline at the end of your turn: +3 Armor.\n" + "-Max Discipline at the end of your turn: -1 card next turn.\n\n" + "-Positive Freedom during your turn: +1 mana.\n" + "-Positive Freedom at the end of your turn: 50/50 chance of +1 card or +1 mana next turn.\n" + "-Max Freedom at the end of your turn:-2 Armor.\n\n" + "Physical damage is affected by Strength and Armor\n" + "-Each unit of Strength increases outgoing physical damage by 10 %.\n" + "-Each unit of Armor blocks 5 % of incomming physical damage\n" + "Armor and Strength are both capped at 15 units.\n\n" + "Fire damage is unaffected by Strength and Armor, but otherwise acts like physical damage.\n\n" + "Poison is unaffected by Strength and Armor. A poisoned character suffers damage at the\n" + "start of their turn equal to their poison counter. At the end of the turn, this counter\n" + "is reduced by 1. Unlike physical and fire damage, poison cannot reduce a characters\n" + "health below 1 HP.\n\n" + "Permanents are cards that can only be played once, and are then removed from your deck.\n" + "After use, they remain active and provide passive bonuses. A maximum of 4 permanents may\n" + "be active at any given time. Permanents can be depleted, which triggers powerful one-off\n" + "effects and then removes them from the game. If there are no empty permanent slots\n" + ", permanent cards may be played directly from hand for their depletion effects.\n\n" + "Gold is earned by defeating enemies, and may be spent in the shop, or on in-fight bonuses.\n\n", textConfig);
      instructionsText.setLineSpacing(1.9).setDepth(21);
      sceneElements.push(instructionsBackground, instructionsHeadline, instructionsText);
    }

    /**
     * -------------------------------------------------------------------------------------------------------------------
     * UTILITIES
     * -------------------------------------------------------------------------------------------------------------------
     */

    // Helper function for destroying all menu elements except for buttons
    function clearElements() {
      sceneElements.forEach(element => {
        if (!element || typeof element.destroy !== 'function') {
          console.log("".concat(element, " not phaser object"));
          return;
        }
        element.destroy();
      });
    }

    // Helper function for delaying excecution of function
    function delay(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    }

    // Helper function for shuffling extraCards
    function shuffleDeck(deck) {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
    }

    // Method for skipping the level during play-testing
    function skipMenu(willSkipMenu) {
      if (!willSkipMenu) return;
      gameState.playerName = 'admin';
      gameState.player.name = 'PRS';
      gameState.difficulty = 'Medium';
      const rndIndex = Math.floor(Math.random() * gameState.extraCards.length);
      const bonusCard = gameState.extraCards[0];
      bonusCard.freePermanent = true;
      gameState.deck.push(bonusCard);
      gameState.extraCards.splice(gameState.extraCards.indexOf(bonusCard), 1);
      self.scene.start('Level1Fight1');
    }
  } // end of create()

  update() {
    let textWidth = 0;
    const offset = 7;

    // Dynamically update the displayed input text as it is being typed
    if (gameState.isEnteringName && menuButtons.find(button => button.key === 'New Game').isPressed) {
      sceneState.nameText.setText(gameState.name);
      textWidth = sceneState.nameText.width;

      // Dynamically position the cursor at the end of the typed text
      sceneState.formCursor.x = sceneState.nameText.x + textWidth - offset;
    }
  }
  onLoadingComplete() {
    console.log('Assets loaded, ready to start the game!');
  }
} // end of scene

/*
https://www.dreamlo.com/lb/CBGhFikNak2i8KjH3UPThAfGJFnWo9A0O8mjvU19hS2Q
*/