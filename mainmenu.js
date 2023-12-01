/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|

Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

const sceneState = {}

class Mainmenu extends Phaser.Scene {
    constructor() {
        super('Mainmenu');
    }

    async getTopScores() {
        try {
            const response = await fetch('https://www.dreamlo.com/lb/64c442f28f40bb8380e27ce7/json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            let scores = data.dreamlo.leaderboard.entry || [];
    
            if (scores.length > 1) {
                scores.sort((a, b) => b.score - a.score);
            }
    
            return scores.slice(0, 5);
        } catch (error) {
            console.error('Error fetching top scores:', error);
            return []; // Return an empty array or handle the error as appropriate
        }
    }
    

    preload() {
        this.load.image('player', 'assets/images/sprites/punkrock.png');
        this.load.image('deck', 'assets/images/cardback.jpg');
        this.load.image('strengthAndArmor', 'assets/images/strengthAndArmor.png');
        this.load.image('targetingCursor', 'assets/images/targetingCursor.png');
        this.load.image('targetingCursorReady', 'assets/images/targetingCursorReady.png');
        this.load.image('listbox1', 'assets/images/listbox1.png');

        this.load.image('rectangularButton', 'assets/images/stoneButtonInsetReady.png');
        this.load.image('rectangularButtonHovered', 'assets/images/stoneButtonInsetHovered.png');
        this.load.image('rectangularButtonPressed', 'assets/images/stoneButtonInsetPressed.png');
        this.load.image('rectangularFrame', 'assets/images/stoneButtonFrame.png');

        this.load.audio('cardsDealtSound', 'assets/sounds/cardsdealt.wav');
        this.load.audio('buttonPressedSound', 'assets/sounds/buttonpressed.wav');
     };
        

    create() {
        const self = this;
        this.cameras.main.fadeIn(600, 0, 0, 0);
        this.input.keyboard.createCursorKeys();
        this.add.image(550,480, 'bgLoadingScreen').setScale(1.40);
        this.add.text(15, 5, `Punk Rock Samurai Beta v${gameState.version}`, { fontSize: '12px', fill: '#ff0000'});
        let nextlevelstarting = false;
        gameState.isEnteringName = false;
        sceneState.name = '';

        sceneState.cardsDealtSound = this.sound.add('cardsDealtSound'); 
        sceneState.buttonPressedSound = this.sound.add('buttonPressedSound');     

        sceneState.newGameElements = [];
        sceneState.leaderboardElements = [];
        sceneState.creditsElements = [];
        sceneState.instructionsElements = [];
        sceneState.displayedScoreArray = [];
        sceneState.loadGameElements = [];

        const headlineConfig = { fontSize: '25px', fill: '#000000' }
        const textConfig = { fontSize: '14px', fill: '#000000' }
        const buttonTextConfig = { fontSize: '18px', fill: '#000000' }; 


        //implement menu buttons
        const x = 120;
        const y = 350;
        const offset = 65;
        
        const newGameButton = self.add.image(x, y, 'rectangularButton');
        const newGameText = self.add.text(x, y, 'New Game', buttonTextConfig).setOrigin(0.5);
        sceneState.newGameButtonClicked = false;

        const loadGameButton = self.add.image(x, y + offset * 1, 'rectangularButton');
        const loadGameTextColor = localStorage.getItem('gameState') ? '#000000' : '#a9a9a9'; 
        const loadGameText = self.add.text(x, y + offset * 1, 'Load Game', { fontSize: '16px', fill: loadGameTextColor }).setOrigin(0.5);
        let loadGameButtonClicked = false;

        const leaderBoardButton = self.add.image(x, y + offset * 2, 'rectangularButton');
        const leaderBoardText = self.add.text(x, y + offset * 2, 'Leaderboard', buttonTextConfig).setOrigin(0.5);
        let leaderBoardButtonClicked = false;

        const creditsButton = self.add.image(x, y + offset * 3, 'rectangularButton');
        const creditsText = self.add.text(x, y + offset * 3, 'Credits', buttonTextConfig).setOrigin(0.5);
        let creditsButtonClicked = false;

        const instructionsButton = self.add.image(x, y + offset * 4, 'rectangularButton');
        const instructionsText = self.add.text(x, y + offset * 4, 'Instructions', buttonTextConfig).setOrigin(0.5);
        let instructionsButtonClicked = false;

        sceneState.buttons = [
            newGameButton, 
            loadGameButton, 
            leaderBoardButton, 
            creditsButton, 
            instructionsButton
        ];

        sceneState.textArray = [
            newGameText, 
            loadGameText, 
            leaderBoardText, 
            creditsText, 
            instructionsText
        ];

        sceneState.menuElements = [
            ...sceneState.buttons,
            ...sceneState.textArray
        ];
                
        sceneState.buttons.forEach (button => {
            animateButton(button)
            button.setScale(0.8, 0.5).setInteractive().setOrigin(0.5);
        });


        // Initiate the on-screen keyboard for mobile devices
        function isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        };

        if (isMobileDevice()) {
            gameState.hiddenInput = document.createElement('input');
            gameState.hiddenInput.style.position = 'absolute';
            gameState.hiddenInput.style.opacity = '0';
            gameState.hiddenInput.style.zIndex = '-1';
            document.body.appendChild(gameState.hiddenInput);

            gameState.hiddenInput.addEventListener('input', function(event) {
                gameState.name = event.target.value;
            });            
        };

     
        // Implement New Game
        newGameButton.on('pointerdown', () => {
            if (!sceneState.newGameButtonClicked) {
                sceneState.buttonPressedSound.play({ volume: 0.7 });

                sceneState.newGameButtonClicked = true;
                loadGameButtonClicked = false;
                leaderBoardButtonClicked = false;
                creditsButtonClicked = false;
                instructionsButtonClicked = false;

                clearElements();
                
                gameState.name = 'Enter your name...';
                const nameTextConfig = { fontSize: '23px', fill: '#000000' };
                sceneState.nameText = this.add.text(420, 315, gameState.name, nameTextConfig ).setDepth(21);

                const buttonTextConfig = { fontSize: '28px', fill: '#000000' };
                sceneState.startGameButton = this.add.image(550, 400, 'rectangularButton').setScale(1.2, 0.60).setInteractive();
                sceneState.startGameText = this.add.text(470, 387, "Let\'s go!", buttonTextConfig );
                
                animateButton(sceneState.startGameButton);
                sceneState.startGameButton.on('pointerdown', () => {
                   gameState.isEnteringName = false;
                   saveNameAndExitMenu();
                });

                const formCursorConfig = { fontSize: '32px', fill: '#000000' };
                sceneState.formCursor = this.add.text(420, 310, '|', formCursorConfig).setDepth(21).setAlpha(0);

                sceneState.cursorTween = this.tweens.add({
                    targets: sceneState.formCursor,
                    alpha: 1,
                    duration: 300,
                    hold: 600,
                    yoyo: true,
                    repeat: -1,
                    paused: true
                });

                sceneState.formFrame = this.add.image(550, 325, 'rectangularFrame');
                sceneState.formFrame.setScale(1.2, 0.60).setInteractive().setDepth(22);
                sceneState.nameForm = this.add.graphics({x: 400, y: 290});
                sceneState.nameForm.fillStyle(0xFFFFFF, 1).setAlpha(0.90).setInteractive().setDepth(20);
                sceneState.nameForm.fillRect(0, 0, 300, 65);
                sceneState.nameForm.setInteractive(new Phaser.Geom.Rectangle(0, 0, 300, 65), Phaser.Geom.Rectangle.Contains);
                
                sceneState.newGameElements = [
                    sceneState.formCursor, 
                    sceneState.nameForm, 
                    sceneState.nameText,
                    sceneState.formFrame, 
                    sceneState.startGameButton, 
                    sceneState.startGameText
                ];

                activateNameForm(sceneState.nameForm);
                activateNameForm(sceneState.formFrame);
        
            } else {
                sceneState.newGameButtonClicked = false;
                clearElements();
            }
        });

        // Activate/ deactivate the input form
        function activateNameForm (gameObject) {   
            gameObject.on('pointerup', () => {

                if (!gameState.isEnteringName) { 

                    // isEnteringName is used to turn on and off the recording of key strokes, and 
                    // activate/ deactivate the cursor. 
                    gameState.isEnteringName = true;
                    console.log('isEnteringName has been activated');

                    if (gameState.name === 'Enter your name...') {
                        gameState.name = '';
                    }

                    sceneState.formCursor.setAlpha(0);
                    sceneState.cursorTween.resume();

                    // Activate the on-screen keyboard for mobile devices
                    try {
                        if (isMobileDevice()) {
                            gameState.hiddenInput.focus();
                        }
                    } catch (error) {
                        console.error("Onscreen keyboard failed to open", error);
                        gameState.isEnteringName = false;
                        saveNameAndExitMenu();
                    }

                    const enterKey = self.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
                    enterKey.once('down', function () {
                        gameState.isEnteringName = false;
                        saveNameAndExitMenu();
                    })
                    
                    // deactivateNameForm() must be called after a short delay to ensure that the pointerup  
                    // event that called activateNameForm() doesn't inadvertently call it as well.
                    self.time.delayedCall(200, () => {
                        deactivateNameForm();
                    })
                };
            })
        };

        function deactivateNameForm() {
            self.input.off('pointerup');
            self.input.once('pointerup', () => {

                if (gameState.isEnteringName) {
                    let delayTime = 0;
                    
                    // Reset form if it's empty
                    if (!gameState.name) {
                        gameState.name = 'Enter your name...';
                        delayTime = 100; // Gives Update() time to update the name field before !isEnteringName.
                    };

                    // Deactivates typing
                    self.time.delayedCall(delayTime, () => {
                        gameState.isEnteringName = false;
                        console.log('isEnteringName has been deactivated');
                    })

                    // Remove cursor
                    sceneState.formCursor.setAlpha(0);
                    sceneState.cursorTween.pause();

                    // Deactivate the on-screen keyboard for mobile devices
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
            });
        }
        
        this.input.keyboard.on('keydown', (event) => { // Log key strokes if isEnteringName === true
            if (gameState.isEnteringName) {

                const maxNameLength = 18 //  keep the text from overflowing the form
                // Implement backspace
                if (event.keyCode === 8 && gameState.name.length > 0) {
                    gameState.name = gameState.name.slice(0, -1);
                    
                // Add any other characters you want to allow    
                } else if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9\s\-_]/) && gameState.name.length < maxNameLength) {
                    gameState.name += event.key;

                } else if (gameState.name.length === maxNameLength) {
                    self.cameras.main.shake(30, .0010, false);
                }
            }    
        });

        function saveNameAndExitMenu() {
            if (gameState.name === 'Enter your name...' || gameState.name === '') {
                gameState.playerName = 'Punk Rock Samurai';

            } else {
                gameState.playerName = gameState.name;
            }

            console.log(`Playername: ${gameState.playerName}`);
            clearElements();

            sceneState.menuElements.forEach( element => {
                element.destroy();
            });

            self.time.delayedCall(600, () => {
                choosePermanent();
            });
        };    

        function choosePermanent() {
            const x = 320;
            const y = 430;
            const spacing = 220;
        
            shuffleDeck(gameState.extraCards);
            const bonusCards = gameState.extraCards.slice(0, 3);
            const bonusCardTextConfig = { fontSize: '50px', fill: '#ff0000' };
            const bonusCardText = self.add.text(550, 170, 'Choose 1 Free Permanent', bonusCardTextConfig).setOrigin(0.5).setDepth(21);

            const bonusCardTextBackground = self.add.graphics();
            updateTextAndBackground(bonusCardText, bonusCardTextBackground, 'Choose 1 Free Permanent');
    
            bonusCards.forEach( (bonusCard, index) => {
                bonusCard.sprite = self.add.sprite(x + index * spacing, y, bonusCard.key).setScale(0.45).setInteractive();
        
                bonusCard.sprite.on('pointerover', function() {
                    sceneState.cardsDealtSound.play({ volume: 0.8, seek: 0.12 });
                    cardTweens(bonusCard.sprite, 0.58, 200);
                }, this);
                
                bonusCard.sprite.on('pointerout', function() {
                    cardTweens(bonusCard.sprite, 0.45, 400);
                }, this);
        
                bonusCard.sprite.on('pointerup', function() {
                    sceneState.cardsDealtSound.play({ volume: 1.2, seek: 0.12 });

                    bonusCard.freePermanent = true;
                    gameState.deck.push(bonusCard);
                    gameState.extraCards.splice(gameState.extraCards.indexOf(bonusCard), 1);
                    shuffleDeck(gameState.extraCards);
        
                    // Remove all non-selected card sprites
                    bonusCards.forEach( card => {
                        card.sprite.removeInteractive(); 
                        if (card !== bonusCard) {
                            fadeOutGameObject(card.sprite, 200);
                        }
                    });
        
                    self.tweens.add({
                        targets: bonusCard.sprite,
                        x: self.cameras.main.centerX,
                        y: self.cameras.main.centerY + 100,
                        scaleX: 0.6,
                        scaleY: 0.6,
                        duration: 1000,
                        ease: 'Power2'
                    });
                     
                    bonusCardText.setText(`Permanent Selected`);
                    updateTextAndBackground(bonusCardText, bonusCardTextBackground, 'Permanent Selected');

                    self.time.delayedCall(2500, () => {
                        if (!nextlevelstarting) {
                            nextlevelstarting = true;
                            startNextLevel();
                        }    
                    });
        
                    self.input.on('pointerup', () => {
                        if (!nextlevelstarting) {
                            nextlevelstarting = true;
                            startNextLevel();
                        }
                    })

                    self.input.keyboard.on('keydown', () => {
                        if (!nextlevelstarting) {
                            nextlevelstarting = true;
                            startNextLevel();
                        }
                    })
        
                })
            })
        };

        function updateTextAndBackground(textObj, backgroundObj, newText, cornerRadius = 7) {
            textObj.setText(newText);
            
            const bounds = textObj.getBounds();
            const backgroundWidth = bounds.width + 10; 
            const backgroundHeight = bounds.height + 10; 
            const backgroundX = bounds.x - 5; 
            const backgroundY = bounds.y - 5; 
            
            backgroundObj.clear();
            backgroundObj.fillStyle(0xFFFFFF, 1).setAlpha(0.4).setDepth(20);
            backgroundObj.fillRoundedRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight, cornerRadius);
        }

        function startNextLevel() {
            self.cameras.main.fadeOut(1000);
            self.time.delayedCall(1000, () => {
                self.scene.start('Level1Fight1');
            })
        };

        function cardTweens(target, scale, duration) {
            self.tweens.add({
                targets: target,
                scaleX: scale,
                scaleY: scale,
                duration: duration,
                ease: 'Cubic'
            })
        };

        function fadeOutGameObject(gameObject, duration) {
            if (gameObject) {
                self.tweens.add({
                    targets: gameObject,
                    alpha: 0, 
                    ease: 'Power1',
                    duration: duration,
                    onComplete: () => { 
                        gameObject.destroy();
                    }
                })
            }
        };

        function animateButton(button) {
            button.on('pointerover', function () {
                this.setTexture('rectangularButtonHovered');
            });
                
            button.on('pointerout', function () {
                this.setTexture('rectangularButton');
            });
        };

        // implement load game
        loadGameButton.on('pointerup', function () {
            if (!loadGameButtonClicked) {
                sceneState.buttonPressedSound.play({ volume: 0.7 });

                sceneState.newGameButtonClicked = false;
                loadGameButtonClicked = true;
                leaderBoardButtonClicked = false;
                creditsButtonClicked = false;
                instructionsButtonClicked = false;

                clearElements();

                try {
                    const serializedState = localStorage.getItem('gameState');
                    if (serializedState === null) {
                        informNoSavedGame();
                    
                    } else {
                        const loadedState = JSON.parse(serializedState);
            
                        // Check if the game has been updated since the last save
                        if (loadedState.version !== gameState.version) {
                            const confirmLoad = confirm(`The game has been updated since this save was made (saved version: ${loadedState.version}, current version: ${gameState.version}). Loading this file might cause issues. Do you still want to load?`);
                            if (!confirmLoad) {
                                return;
                            }
                        }
                        
                        const deckList = [
                            loadedState.deck, 
                            loadedState.bonusCards,
                            loadedState.extraCards,
                        ];

                        deckList.forEach(deck => refreshDeck(deck));
                        gameState = loadedState;

                        console.log('Game state loaded successfully.');
                        self.scene.start(gameState.savedScene);
                    }

                } catch (e) {
                    console.error('Failed to load the game state.', e);
                    // TO DO: handle the error case
                }

            } else {
                loadGameButtonClicked = false;
                clearElements();
            }
        });

        function refreshDeck(deck) {
            deck.forEach(deckCard => {
                const matchingCard = gameConfig.allCards.find(card => card.key === deckCard.key);
            
                if (matchingCard) {
                    Object.assign(deckCard, matchingCard);
                }
            });
        }

        function informNoSavedGame() {
            const textContent = 'No saved game state found.'
            const textConfig = { fontSize: '40px', fill: '#000000' }
            const noSaveText = self.add.text(620, 350, textContent, textConfig).setOrigin(0.5).setDepth(21);
            
            const bounds = noSaveText.getBounds();
            const backgroundWidth = bounds.width + 10;
            const backgroundHeight = bounds.height + 10;
            const backgroundX = bounds.x - 10;
            const backgroundY = bounds.y - 5;
            
            const textBackground = self.add.graphics();
            textBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.8).setDepth(20);
            textBackground.fillRoundedRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight, 10);
            sceneState.loadGameElements.push(noSaveText, textBackground);

            console.log(textContent);
            self.cameras.main.shake(70, .002, false);
        }
        
        // implement leaderboard    
        leaderBoardButton.on('pointerup', async () => {
            sceneState.buttonPressedSound.play({ volume: 0.7 });
            if (!leaderBoardButtonClicked) {
                const topScores = await self.getTopScores();
                const x = 250;
                let y = 200;

                sceneState.newGameButtonClicked = false;
                loadGameButtonClicked = false;
                leaderBoardButtonClicked = true;
                creditsButtonClicked = false;
                instructionsButtonClicked = false;

                clearElements();

                sceneState.leaderboardsBackground = this.add.graphics();
                sceneState.leaderboardsBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9); 
                sceneState.leaderboardsBackground.fillRect(x, y, 810, 250);

                const headlineConfig = { fontSize: '25px', fill: '#000000' }
                sceneState.leaderboardHeadline = this.add.text(x + 20, y + 30, 'Leaderboard', headlineConfig).setOrigin(0);
                
                sceneState.displayedScoreArray = [];

                if (!topScores.length) {
                    const scoreText = `Failed to access leaderboard`;
                    const displayedScore = this.add.text(x + 30, y + 80, scoreText, textConfig).setOrigin(0);  
                    sceneState.displayedScoreArray.push(displayedScore);
                } else {

                    for(let i = 0; i < topScores.length; i++) {
                        const dateOnly = topScores[i].date.split(' ')[0];  // Splitting the date string and keeping only the first part
                        const scoreText = `${i + 1}. Name: ${topScores[i].name}, Score: ${topScores[i].score}, Date: ${dateOnly}`;
                        const displayedScore = this.add.text(x + 30, y + 80, scoreText, textConfig).setOrigin(0);
                        
                        sceneState.displayedScoreArray.push(displayedScore);
                        y += 20;
                    }
                }

                sceneState.leaderboardElements = [
                    sceneState.leaderboardsBackground, 
                    sceneState.leaderboardHeadline, 
                    sceneState.displayedScoreArray
                ];
            
            } else {
                leaderBoardButtonClicked = false;
                clearElements();
            }
        
        });

        // implement credits
        creditsButton.on('pointerup', function () {
            if (!creditsButtonClicked) {
                sceneState.buttonPressedSound.play({ volume: 0.7 });

                sceneState.newGameButtonClicked = false;
                loadGameButtonClicked = false;
                leaderBoardButtonClicked = false;
                creditsButtonClicked = true;
                instructionsButtonClicked = false;

                clearElements();

                sceneState.creditsBackground = self.add.graphics();
                sceneState.creditsBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9);
                sceneState.creditsBackground.fillRect(250, 200, 810, 340);
                
                sceneState.creditsHeadline = self.add.text(270, 230, 'Credits', headlineConfig).setOrigin(0);
                sceneState.creditsText = self.add.text(270, 280,

                    `Game Design and Programming by Erlend Kulander Kvitrud\n` +
                    `Music by Marllon Silva (xDeviruchi) (https://soundcloud.com/xdeviruchi)\n` +
                    `Punch sound by @danielsoundsgood (https://danielsoundsgood.itch.io/)\n` +
                    `Healing sound by Dylan Kelk (https://freesound.org/people/SilverIllusionist/)\n` +
                    `Power up sound by MATRIXXX (https://freesound.org/people/MATRIXXX_/)\n` +
                    `Gunshot sound by Fesliyan Studios (https://www.fesliyanstudios.com)\n` +
                    `Button Sprites by Ian Eborn (http://thaumaturge-art.com/)\n` +
                    `Armor and Strength symbols by Josepzin (https://opengameart.org/users/josepzin)\n` +
                    `Card sprites by Avery Ross (https://opengameart.org/users/averyre)\n` +
                    `Coin sound by ProjectsU012 (https://freesound.org/people/ProjectsU012/)\n`,
                    
                    textConfig
                );

                sceneState.creditsText.setLineSpacing(2);

                sceneState.creditsElements = [
                    sceneState.creditsBackground, 
                    sceneState.creditsHeadline, 
                    sceneState.creditsText
                ];
                
            } else {
                creditsButtonClicked = false;
                clearElements();
            }
        })


        // implement instructions
        instructionsButton.on('pointerup', function () {
            sceneState.buttonPressedSound.play({ volume: 0.7 });
            if (!instructionsButtonClicked) {
                
                sceneState.newGameButtonClicked = false;
                loadGameButtonClicked = false;
                leaderBoardButtonClicked = false;
                creditsButtonClicked = false;
                instructionsButtonClicked = true;

                clearElements();

                sceneState.instructionsBackground = self.add.graphics();
                sceneState.instructionsBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9).setDepth(20);
                sceneState.instructionsBackground.fillRect(250, 20, 810, 640);

                sceneState.instructionsHeadline = self.add.text(270, 50, 'Instructions', headlineConfig).setOrigin(0).setDepth(21);
                sceneState.instructionsText = self.add.text(270, 100, 

                    `The game consists of four levels, each of which consists of three fights.\n` +
                    `At the start of each turn, you gain 3 mana and draw 5 cards. You may then play any number\n` + 
                    `of cards before hitting "End Turn". Your remaining cards and mana are then depleted,\n` +
                    `and the enemy's turn begins. You win the fight by killing all enemies. Losing a fight\n` + 
                    `results in permadeath. Missing health carries over from fight to fight\n\n` +

                    `Decks consists of ${gameConfig.minDeckSize} - ${gameConfig.maxDeckSize} cards, and can include uptil ${gameConfig.maxCardExemplars} exemplars of the same card\n\n` +

                    `Stance represents the balance between Discipline and Freedom.\n` +
                    `-Positive Discipline during your turn: +3 Strength.\n` +
                    `-Positive Discipline at the end of your turn: +3 Armor.\n` +
                    `-Max Discipline at the end of your turn: -1 card next turn.\n\n` +
                    
                    `-Positive Freedom during your turn: +1 mana.\n` +
                    `-Positive Freedom at the end of your turn: 50/50 chance of +1 card or +1 mana next turn.\n` +
                    `-Max Freedom at the end of your turn:-2 Armor.\n\n` +
                    
                    `Physical damage is affected by the Strength of the attacker and the Armor of the defender\n` +
                    `-Each unit of Strength increases outgoing physical damage by 10 %.\n` +
                    `-Each unit of Armor blocks 5 % of incomming physical damage\n` +
                    `Armor and Strength are both capped at 15 units.\n\n` +
                    
                    `Fire damage is unaffected by Strength and Armor, but otherwise acts like physical damage.\n\n` +
                    
                    `Poison is unaffected by Strength and Armor. A poisoned character suffers damage at the start\n` +
                    `of their turn equal to their poison counter. At the end of the turn, this counter is reduced\n` +
                    `by 1. Unlike physical and fire damage, poison cannot reduce a characters health below 1 HP.\n\n` +
                
                    `Permanents are cards that can only be played once, and are then removed from your deck.\n` +
                    `After use, they remain active and provide passive bonuses. A maximum of 4 permanents may be\n` +
                    `active at any given time. Permanents can be depleted, which unleases powerful one-off\n` +
                    `effects and then removes them from the game. If there are no empty slots for new permanents,\n` +
                    `permanent cards may be played directly from hand for their depletion effects.\n\n` +

                    `Gold is earned by defeating enemies, and may be spent in the shop, or on in-fight bonuses.\n\n`,

                    textConfig
                );

                sceneState.instructionsText.setLineSpacing(1.5).setDepth(21);

                sceneState.instructionsElements = [
                    sceneState.instructionsBackground, 
                    sceneState.instructionsHeadline, 
                    sceneState.instructionsText
                ];

            } else {
                instructionsButtonClicked = false;
                clearElements();
            };

        });

        function clearElements() {
            let sceneElements = [
                ...sceneState.newGameElements,
                ...sceneState.loadGameElements,
                ...sceneState.leaderboardElements,
                ...sceneState.creditsElements,
                ...sceneState.instructionsElements,
                ...sceneState.displayedScoreArray
            ];
        
            sceneElements.forEach( element => {
                if (element && typeof element.destroy === 'function') {
                    element.destroy();
                } else {
                console.log(`${element} not phaser object`)
                }
            })
        };

        function shuffleDeck(deck) {
            for(let i = deck.length - 1; i > 0; i--){
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            return deck;
        };

    // ----   USED TO SKIP MENU WHEN TESTING ----
    // gameState.playerName = 'Admin';
    // const bonusCard = gameState.extraCards[0];
    // bonusCard.freePermanent = true;
    // gameState.deck.push(bonusCard);
    // gameState.extraCards.splice(gameState.extraCards.indexOf(bonusCard), 1);
    // self.scene.start('Level1Fight1');

    } // end of create()

    update() {
        let textWidth = 0;
        const offset = 7 

        if (gameState.isEnteringName && sceneState.newGameButtonClicked) {
            // Dynamically updates the displayed input text as it is being typed
            sceneState.nameText.setText(gameState.name);
            textWidth = sceneState.nameText.width;

            // Dynamically positions the cursor at the end of the typed text
            sceneState.formCursor.x = sceneState.nameText.x + textWidth - offset;
        }
    };

} // end of scene

/*
https://www.dreamlo.com/lb/CBGhFikNak2i8KjH3UPThAfGJFnWo9A0O8mjvU19hS2Q
*/
