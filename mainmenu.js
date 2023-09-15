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
        const response = await fetch('https://www.dreamlo.com/lb/64c442f28f40bb8380e27ce7/json');
        const data = await response.json();
        let scores = data.dreamlo.leaderboard.entry;
        
        if (scores.length > 1) {
            scores.sort((a, b) => b.score - a.score);
        }

        return scores.slice(0, 5);
    }

    preload() {
        this.load.image('rectangularFrame', 'assets/images/stoneButtonFrame.png');
    };
        

    create() {
        const self = this;
        this.cameras.main.fadeIn(600, 0, 0, 0);
        this.input.keyboard.createCursorKeys();
        this.add.image(550,480, 'bgLoadingScreen').setScale(1.40);
        this.add.text(15, 5, `Punk Rock Samurai Beta v1.00`, { fontSize: '12px', fill: '#ff0000'});
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
        const loadGameText = self.add.text(x, y + offset * 1, 'Load Game', { fontSize: '16px', fill: '#a9a9a9' }).setOrigin(0.5);
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

                    // Reset name form
                    if (gameState.name === 'Enter your name...') {
                        gameState.name = '';
                    }

                    // Add blinking cursor
                    sceneState.formCursor.setAlpha(0);
                    sceneState.cursorTween.resume();
                    
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
                }
            });
        }
        
        // Log key strokes if isEnteringName === true
        this.input.keyboard.on('keydown', (event) => {
            if (gameState.isEnteringName) {

                // Cap the name length to keep the text from overflowing the form
                const maxNameLength = 16
                
                // Implement backspace
                if (event.keyCode === 8 && gameState.name.length > 0) {
                    gameState.name = gameState.name.slice(0, -1);
                    
                // Add any other characters you want to allow    
                } else if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9\s\-_]/) && gameState.name.length < maxNameLength) {
                    gameState.name += event.key;

                // Gently informs the player that its time to stop typing
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
        
            const bonusCards = gameState.extraCards.slice(0, 3);
            const bonusCardTextConfig = { fontSize: '50px', fill: '#ff0000' };
            const bonusCardText = self.add.text(550, 170, 'Choose 1 Free Permanent', bonusCardTextConfig).setOrigin(0.5);
        
            bonusCards.forEach( (bonusCard, index) => {
                bonusCard.sprite = self.add.sprite(x + index * spacing, y, bonusCard.key).setScale(0.45).setInteractive();
                console.log(`bonusCardsprite added for: ${bonusCard.key}`);
        
                bonusCard.sprite.on('pointerover', function() {
                    sceneState.cardsDealtSound.play({ volume: 0.8 });
                    cardTweens(bonusCard.sprite, 0.58, 200);
                }, this);
                
                bonusCard.sprite.on('pointerout', function() {
                    cardTweens(bonusCard.sprite, 0.45, 400);
                }, this);
        
                bonusCard.sprite.on('pointerup', function() {
                    sceneState.cardsDealtSound.play({ volume: 1.8 });

                    gameState.deck.push(bonusCard);
                    gameState.extraCards.splice(gameState.extraCards.indexOf(bonusCard), 1);
        
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
                            
                    self.time.delayedCall(2500, () => {
                        if (!nextlevelstarting) {
                            nextlevelstarting = true;
                            startNextLevel();
                        }    
                    });
        
                    self.input.on('pointerup', () => { // IMPLEMENT: Or pressed enter!
                        if (!nextlevelstarting) {
                            nextlevelstarting = true;
                            startNextLevel();
                        }
                    })
        
                })
            })
        };

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
            self.cameras.main.shake(70, .002, false);
        });
        
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

                for(let i = 0; i < topScores.length; i++) {
                    const dateOnly = topScores[i].date.split(' ')[0];  // Splitting the date string and keeping only the first part
                    const scoreText = `${i + 1}. Name: ${topScores[i].name}, Score: ${topScores[i].score}, Date: ${dateOnly}`;
                    const displayedScore = this.add.text(x + 30, y + 80, scoreText, textConfig).setOrigin(0);
                    
                    sceneState.displayedScoreArray.push(displayedScore);
                    y += 20;
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
                    `Character sprites and backgrounds were generated with MidJourney`,
                    
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
                sceneState.instructionsBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9);
                sceneState.instructionsBackground.fillRect(250, 20, 810, 650);

                sceneState.instructionsHeadline = self.add.text(270, 50, 'Instructions', headlineConfig).setOrigin(0);
                sceneState.instructionsText = self.add.text(270, 100, 

                    `The game consists of four levels, each of which consists of three fights.\n` +
                    `At the start of your turn, you gain 4 mana and draw 5 cards. You may then play any number\n` + 
                    `of cards before hitting "End Turn". Your remaining cards and mana are then depleted,\n` +
                    `and the enemy's turn begins. You win the fight by killing all enemies. Losing a fight\n` + 
                    `results in permadeath. Missing health carries over from fight to fight, but is reset at\n` +
                    `the beginning of each new level\n\n` +
                    
                    `There are three different kinds of attack: physical damage, fire damage and poison.\n\n` +
                    
                    `Physical damage is affected by the Strength of the attacker and the Armor of the defender\n` +
                    `-Each unit of Strength increases outgoing physical damage by 10 %.\n` +
                    `-Each unit of Armor blocks 5 % of incomming physical damage\n` +
                    `Armor and Strength are both capped at 15 units.\n\n` +
                    
                    `Fire damage is unaffected by Strength and Armor, but otherwise acts like physical damage.\n\n` +
                    
                    `Poison is unaffected by Strength and Armor. A poisoned character suffers damage each\n` +
                    `round equal to his poison counter. At the end of his turn, this counter is reduced by 1. \n` +
                    `Unlike physical and fire damage, poison cannot reduce a characters health below 1 HP.\n\n` +
                    
                    `Permanents are cards that can only be played once, and are then removed from your deck.\n` +
                    `After use, they remain active and provide passive bonuses. A maximum of 4 permanents may be\n` +
                    `active at any given time. Permanents can be depleted, which unleases powerful one-off\n` +
                    `effects and then removes them from the game. If there are no empty slots for new permanents,\n` +
                    `permanent cards may be played directly from hand for their depletion effects.\n\n` +
                    
                    `Stance represents the balance between Discipline and Freedom.\n` +
                    `-Positive Discipline during your turn: +3 Strength.\n` +
                    `-Positive Discipline at the end of your turn: +3 Armor.\n` +
                    `-Max Discipline at the end of your turn: -1 card next turn.\n\n` +
                    
                    `-Positive Freedom during your turn: +1 mana.\n` +
                    `-Positive Freedom at the end of your turn: +1 card and +1 mana next turn.\n` +
                    `-Max Freedom at the end of your turn:-2 Armor.`, 
                    
                    textConfige
                );

                sceneState.instructionsText.setLineSpacing(1.5);

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

    } // end of create()

    update() {
        let textWidth = 0;

        if (gameState.isEnteringName && sceneState.newGameButtonClicked) {
            // Dynamically updates the displayed input text as it is being typed
            sceneState.nameText.setText(gameState.name);
            textWidth = sceneState.nameText.width;

            // Dynamically positions the cursor at the end of the typed text
            sceneState.formCursor.x = sceneState.nameText.x + textWidth - 7;
        }
    };

} // end of scene

/*
https://www.dreamlo.com/lb/CBGhFikNak2i8KjH3UPThAfGJFnWo9A0O8mjvU19hS2Q
*/
