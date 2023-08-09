sceneState = {}

class Mainmenu extends Phaser.Scene {
    constructor() {
        super('Mainmenu');
    }

    async getTopScores() {
        const response = await fetch('http://dreamlo.com/lb/64c442f28f40bb8380e27ce7/json');
        const data = await response.json();
        let scores = data.dreamlo.leaderboard.entry;
        scores.sort((a, b) => b.score - a.score);
        return scores.slice(0, 5);
    }

    create() {
       
        this.cameras.main.fadeIn(600, 0, 0, 0)
        this.input.keyboard.createCursorKeys();
        let self = this;
        this.add.image(550,480, 'bgLoadingScreen').setScale(1.40); 
        sceneState.cardsDealtSound = this.sound.add('cardsDealtSound'); 
        sceneState.buttonPressedSound = this.sound.add('buttonPressedSound');     
        console.log(`menu open`)

        sceneState.startGameElements = [];
        sceneState.leaderboardElements = [];
        sceneState.creditsElements = [];
        sceneState.instructionsElements = [];
        sceneState.buttons = [];
        sceneState.textArray = [];
        sceneState.displayedScoreArray = [];

        this.add.text(15, 5, `Punk Rock Samurai Alpha v1.1`, { fontSize: '11px', fill: '#ff0000'})

        //implement menu buttons
        let x = 120;
        let y = 350;
        let offset = 65;

        let newGameButton = self.add.image(x, y, 'rectangularButton').setScale(0.8, 0.5).setInteractive().setOrigin(0.5);
        let newGameText = self.add.text(x, y, 'New Game', { fontSize: '18px', fill: '#000000' }).setOrigin(0.5);
        let newGameButtonClicked = false;

        let loadGameButton = self.add.image(x, y + offset * 1, 'rectangularButton').setScale(0.8, 0.5).setInteractive().setOrigin(0.5);
        let loadGameText = self.add.text(x, y + offset * 1, 'Load Game', { fontSize: '18px', fill: '#a9a9a9' }).setOrigin(0.5);
        let loadGameButtonClicked = false;

        let leaderBoardButton = self.add.image(x, y + offset * 2, 'rectangularButton').setScale(0.8, 0.5).setInteractive().setOrigin(0.5);
        let leaderBoardText = self.add.text(x, y + offset * 2, 'Leaderboard', { fontSize: '18px', fill: '#000000' }).setOrigin(0.5);
        let leaderBoardButtonClicked = false;

        let creditsButton = self.add.image(x, y + offset * 3, 'rectangularButton').setScale(0.8, 0.5).setInteractive().setOrigin(0.5);
        let creditsText = self.add.text(x, y + offset * 3, 'Credits', { fontSize: '18px', fill: '#000000' }).setOrigin(0.5);
        let creditsButtonClicked = false;

        let instructionsButton = self.add.image(x, y + offset * 4, 'rectangularButton').setScale(0.8, 0.5).setInteractive().setOrigin(0.5);
        let instructionsText = self.add.text(x, y + offset * 4, 'Instructions', { fontSize: '18px', fill: '#000000' }).setOrigin(0.5);
        let instructionsButtonClicked = false;

        sceneState.buttons = [newGameButton, loadGameButton, leaderBoardButton, creditsButton, instructionsButton];
        sceneState.textArray = [newGameText, loadGameText, leaderBoardText, creditsText, instructionsText];

        // Implement input fields for player's name
        let nameForm = document.getElementById("nameform");
        let nameField = document.getElementById("nameField");
        let playButton = document.getElementById("playButton");
    
        const nameElement = this.add.dom(350, 300, nameField).setVisible(false).setAlpha(0.85); // Hide these elements initially
        const buttonElement = this.add.dom(350, 350, playButton).setVisible(false).setAlpha(0.85);
        

        let resizeForm = () => {

                let canvas = this.sys.game.canvas;
                let scale = this.sys.game.scale;
        
                // Calculate form size as a fraction of canvas size
                let formWidth = canvas.width * 0.25; 
                let formHeight = canvas.height * 0.06; 
        
                // Calculate form position to be center of canvas
                let formX = scale.displaySize.width / 2.9 - formWidth / 2;
                let formY = scale.displaySize.height / 3.8 - formHeight / 2;
        
                // Apply new size and position
                nameForm.style.width = formWidth + 'px';
                nameForm.style.height = formHeight + 'px';
                nameForm.style.left = formX + 'px';
                nameForm.style.top = formY + 'px';

                nameField.style.width = formWidth + 'px';
                playButton.style.width = formWidth + 'px';
        
                nameElement.setPosition(formX, formY);
                buttonElement.setPosition(formX, formY + 50);

        };
    
        resizeForm(); // Apply initial size and position
    
        // Listen to Phaser's resize event to resize form
        this.scale.on('resize', resizeForm);
    
        // Implement New Game
        newGameButton.on('pointerup', () => {
            sceneState.buttonPressedSound.play({ volume: 0.7 });
            newGameButtonClicked = true;
            loadGameButtonClicked = false;
            leaderBoardButtonClicked = false;
            creditsButtonClicked = false;
            instructionsButtonClicked = false;
            clearElements();
            
            nameForm.style.display = 'block'; // Show the form
            nameElement.setVisible(true);
            buttonElement.setVisible(true);
        });
    
        buttonElement.addListener('click');
        buttonElement.on('click', function () {
            gameState.playerName = nameElement.node.value; // Store the entered name
            console.log(gameState.playerName);
            nameForm.style.display = 'none'; // Hide the form
            nameElement.setVisible(false);
            buttonElement.setVisible(false);
            sceneState.buttons.forEach( button => button.destroy());
            sceneState.textArray.forEach( text => text.destroy());
           
            choosePermanent()
        }, this);


        function choosePermanent() {
            
            const x = 320;
            const y = 430;
            const spacing = 220;
        
            let bonusCards = gameState.extraCards.slice(0, 3);
            let bonusCardText = self.add.text(550, 170, 'Choose 1 Free Permanent', { fontSize: '50px', fill: '#ff0000' }).setOrigin(0.5);
        
            bonusCards.forEach( (bonusCard, index) => {
                bonusCard.sprite = self.add.sprite(x + index * spacing, y, bonusCard.key).setScale(0.45).setInteractive();
                console.log(`bonusCardsprite added for: ${bonusCard.key}`)
        
                bonusCard.sprite.on('pointerover', function() {
                    sceneState.cardsDealtSound.play({ volume: 0.8 })
                    cardTweens(bonusCard.sprite, 0.58, 200)
                }, this)
                
                bonusCard.sprite.on('pointerout', function() {
                    cardTweens(bonusCard.sprite, 0.45, 400);
                }, this);
        
                bonusCard.sprite.on('pointerup', function() {
                    let nextlevelstarting = false;
                    sceneState.cardsDealtSound.play({ volume: 1.8 })
                    gameState.deck.push(bonusCard);
                    gameState.extraCards.splice(gameState.extraCards.indexOf(bonusCard), 1);
        
                    // Remove all non-selected card sprites
                    bonusCards.forEach( card => {
                        card.sprite.removeInteractive(); 
                        if (card !== bonusCard) {
                            fadeOutGameObject(card.sprite, 200);
                        }
                    })
        
                    self.tweens.add({
                        targets: bonusCard.sprite,
                        x: self.cameras.main.centerX,
                        y: self.cameras.main.centerY + 100,
                        scaleX: 0.6,
                        scaleY: 0.6,
                        duration: 1000,
                        ease: 'Power2'
                    })
                     
                    bonusCardText.setText(`Permanent Selected`);
                            
                    self.time.delayedCall(2500, () => {
                        if (!nextlevelstarting) {
                            nextlevelstarting = true;
                            startNextLevel();
                        }    
                    })
        
                    self.input.on('pointerup', () => {
                        if (!nextlevelstarting) {
                            nextlevelstarting = true;
                            startNextLevel();
                        }
                    })
        
                })
            })
        }

        // NOTE: Move startNextLevel, cardTweens, and fadeOutGameObject to the global scope?
        function startNextLevel() {
           self.cameras.main.fadeOut(1000);
            self.time.delayedCall(1000, () => {
                self.scene.start('Level1fight1');
            });
        }

        function cardTweens(target, scale, duration) {
            self.tweens.add({
                targets: target,
                scaleX: scale,
                scaleY: scale,
                duration: duration,
                ease: 'Cubic'
            });
        }

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
                });
            }
        };
        
        sceneState.buttons.forEach (button => {
            button.on('pointerover', function () {
                this.setTexture('rectangularButtonHovered');
            });
                
            button.on('pointerout', function () {
                this.setTexture('rectangularButton');
            });
        })

        // implement load game
        loadGameButton.on('pointerup', function () {
            self.cameras.main.shake(70, .002, false);
        });
        
        // implement leaderboard    
        leaderBoardButton.on('pointerup', async () => {
            sceneState.buttonPressedSound.play({ volume: 0.7 });
            if (!leaderBoardButtonClicked) {
                let topScores = await self.getTopScores();
                let x = 230;
                let y = 200;
                newGameButtonClicked = false;
                loadGameButtonClicked = false;
                leaderBoardButtonClicked = true;
                creditsButtonClicked = false;
                instructionsButtonClicked = false;
                nameElement.setVisible(false);
                buttonElement.setVisible(false);
                clearElements();

                sceneState.leaderboardsBackground = this.add.graphics();
                sceneState.leaderboardsBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9); 
                sceneState.leaderboardsBackground.fillRect(x, y, 835, 250);
                sceneState.leaderBoardHeadline = this.add.text(x + 20, y + 30, 'Leaderboard', { fontSize: '25px', fill: '#000000' }).setOrigin(0);
                sceneState.displayedScoreArray = [];

                for(let i = 0; i < topScores.length; i++) {
                    let dateOnly = topScores[i].date.split(' ')[0];  // Splitting the date string and keeping only the first part
                    let displayedScore = this.add.text(x + 30, y + 80, `${i + 1}. Name: ${topScores[i].name}, Score: ${topScores[i].score}, Date: ${dateOnly}`, { fontSize: '12px', fill: '#000000' }).setOrigin(0);
                    sceneState.displayedScoreArray.push(displayedScore);
                    y += 20;
                }

                sceneState.leaderboardElements = [sceneState.leaderboardsBackground, sceneState.leaderBoardHeadline, sceneState.displayedScoreArray];
            
            } else {
                leaderBoardButtonClicked = false;
                clearElements();
            }
        
        });

        // implement credits
       creditsButton.on('pointerup', function () {
            if (!creditsButtonClicked) {
                sceneState.buttonPressedSound.play({ volume: 0.7 });
                newGameButtonClicked = false;
                loadGameButtonClicked = false;
                leaderBoardButtonClicked = false;
                creditsButtonClicked = true;
                instructionsButtonClicked = false;
                nameElement.setVisible(false);
                buttonElement.setVisible(false);
                clearElements();

                sceneState.creditsBackground = self.add.graphics();
                sceneState.creditsBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9);
                sceneState.creditsBackground.fillRect(230, 200, 835, 340);
                sceneState.creditsHeadline = self.add.text(250, 230, 'Credits', { fontSize: '25px', fill: '#000000' }).setOrigin(0);
            
                sceneState.creditsText = self.add.text(250, 280, 
`Game Design and Programming by Erlend Kulander Kvitrud\n
Music by Marllon Silva (xDeviruchi) (https://soundcloud.com/xdeviruchi)\n
Punch sound by @danielsoundsgood (https://danielsoundsgood.itch.io/)\n
Healing sound by Dylan Kelk (https://freesound.org/people/SilverIllusionist/)\n
Power up sound by MATRIXXX (https://freesound.org/people/MATRIXXX_/)\n
Gunshot sound by Fesliyan Studios (https://www.fesliyanstudios.com)\n
Button Sprites by Ian Eborn (http://thaumaturge-art.com/)\n
Armor and Strength symbols by Josepzin (https://opengameart.org/users/josepzin)\n
Character sprites and backgrounds were generated with MidJourney`, 
                { fontSize: '12px', fill: '#000000' } 
                );

                sceneState.creditsElements = [sceneState.creditsBackground, sceneState.creditsHeadline, sceneState.creditsText];
                
            } else {
                creditsButtonClicked = false;
                clearElements();
            }
        })


        // implement instructions
        instructionsButton.on('pointerup', function () {
            sceneState.buttonPressedSound.play({ volume: 0.7 });
            if (!instructionsButtonClicked) {
                
                newGameButtonClicked = false;
                loadGameButtonClicked = false;
                leaderBoardButtonClicked = false;
                creditsButtonClicked = false;
                instructionsButtonClicked = true;
                nameElement.setVisible(false);
                buttonElement.setVisible(false);
                clearElements();

                sceneState.instructionsBackground = self.add.graphics();
                sceneState.instructionsBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9);
                sceneState.instructionsBackground.fillRect(230, 20, 835, 650);
                sceneState.instructionsHeadline = self.add.text(250, 50, 'Instructions', { fontSize: '25px', fill: '#000000' }).setOrigin(0);
            
                sceneState.instructionsText = self.add.text(250, 100, 
`At the start of your turn, gain 4 mana and draw 5 cards. You may hold a maximum of 8 cards on your hand at any\n
given time. During your turn, you may play any number of cards before hitting "End Turn". Your remaining cards\n
and mana are then depleted. There are three different types of attacks: physical, fire and poison\n\n

Physical: damage is affected by the Strength of the attacker and the Armor of the defender\n
-Each unit of Strength increases outgoing damage by 10 %.\n
-Each unit of Armor blocks 5 % of incomming damage\n
Armor and Strength are both capped at 15 units.\n\n

Fire: damage is unaffected by Strength and Armor, but otherwise acts like physical damage.\n

Poison: damage is unaffected by Strength and Armor. A poisoned character suffers damage each round equal to\n
his poison counter. At the end of the poisoned characters' turn, this counter is reduced by 1.\n 
Unlike physical and fire damage, poison cannot reduce a characters health below 1 HP.\n\n

Permanents are cards that can only be played once, and are then removed from your deck. After use, they remain\n
active and provide passive bonuses. A maximum of 3 permanents may be active at any given time. Permanents can be\n
depleted, which unleases powerful one-off effects and then removes them from the game. If there are no empty\n
slots for new permanents, permanent cards may be played directly from hand for their depletion effects.\n\n

Stance represents the balance between Discipline and Freedom.\n
-Positive Discipline during your turn: +3 Strength.\n
-Positive Discipline at the end of your turn: +3 Armor.\n
-Max Discipline at the end of your turn: -1 card next turn.\n\n

-Positive Freedom during your turn: +1 mana.\n
-Positive Freedom at the end of your turn: +1 card and +1 mana next turn.\n
-Max Freedom at the end of your turn:-2 Armor.`,
{ fontSize: '11px', fill: '#000000' } 
                ).setLineSpacing(-2);

                sceneState.instructionsElements = [sceneState.instructionsBackground, sceneState.instructionsHeadline, sceneState.instructionsText];

            } else {
                instructionsButtonClicked = false;
                clearElements();
            }

        });

    } // end of create()

   /* resetMenu(nameForm, nameField, nameElement, buttonElement) {
        if (nameForm) nameForm.style.display = 'none';
        if (nameField) nameField.value = '';
        if (nameElement) nameElement.setVisible(false);
        if (buttonElement) buttonElement.setVisible(false);
    };

    resetMenu() {
        nameForm.style.display = 'none';
        nameField.value = '';
        nameElement.setVisible(false);
        buttonElement.setVisible(false);
    }*/

} // end of scene


function clearElements() {
    sceneElements = []
    sceneState.leaderboardElements.forEach( element => sceneElements.push(element) );
    sceneState.creditsElements.forEach( element => sceneElements.push(element) );
    sceneState.instructionsElements.forEach( element => sceneElements.push(element) );
    sceneState.displayedScoreArray.forEach( score => sceneElements.push(score) );  

    sceneElements.forEach( element => {
        if (element && typeof element.destroy === 'function') {
            element.destroy();
        }
        console.log(`${element} not phaser object`)
    })
}


/*
http://dreamlo.com/lb/CBGhFikNak2i8KjH3UPThAfGJFnWo9A0O8mjvU19hS2Q
*/