/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

class BaseScene extends Phaser.Scene {

    create() {
        this.scene.start('Preload');
    }

    // Initiaiate level

    baseCreate(backgoundImage, scale = 0.75) {
        this.add.image(0,0, backgoundImage).setScale(scale).setOrigin(0.02,0); 
        this.cameras.main.fadeIn(600, 0, 0, 0);   
        this.input.keyboard.createCursorKeys();
        
        gameConfig.targetingCursor = this.add.image(0, 0, 'targetingCursor').setDepth(200).setVisible(false);
        gameState.endGameMenyExited = false;
        gameState.playingCard = false;
        gameState.discardPile = [];
        gameState.drawPile = [];
        gameState.currentCards = [];
        gameState.cardImages = [];
        gameState.summonedEnemies = []; 

        gameState.redrawPrice = 1;
        gameState.skipIntro = false;
        gameState.fightStarted = false;

        // Reset Permanent effects
        gameState.kamishimoUberAlles = 0;
        gameState.shogunsShellCondition = 0; 
        gameState.kirisuteGomen = false; 
        gameState.toxicFrets = false;
        gameState.ashenEncore = false;
        gameState.edoEruption = false;
        gameState.steelToe = false;
        gameState.gundanSeizai = false;
        gameState.noFutureCondition = false;
        
        // Initiate sounds
        gameConfig.cardsDealtSound = this.sound.add('cardsDealtSound');
        gameConfig.victorySound = this.sound.add('victorySound');
        gameConfig.buttonPressedSound = this.sound.add('buttonPressedSound');
        gameConfig.attackSound = this.sound.add('attackSound');
        gameConfig.powerUpSound = this.sound.add('powerUpSound');
        gameConfig.healSound = this.sound.add('healSound');
        gameConfig.thunder = this.sound.add('thundersound');
        gameConfig.music = this.sound.add('bossTune');
        gameConfig.coinSound = this.sound.add('coinSound');
        gameConfig.keyboardSound = this.sound.add('keyboardSound');

        if (gameState.extraCards.length) {
            gameState.bonusCards.push(gameState.extraCards.pop());
        };
    }

    resetPlayer(player, scale, x=360, y=350) {
        player.sprite = this.add.image(x, y, 'player').setScale(scale).setFlipX(false).setInteractive(); // change to sprite when implementing sprite sheet
        player.stance = 'Neutral'; 
        player.poison = 0;
        player.stancePoints = 0;
        player.numCards = 5,
        player.numCardsBase = 5;
        player.numCardsStance = 0;
        player.manaBase = 3;
        player.manaStance = 0;
        player.manaCard = 0;
        player.mana = 3;
        player.strengthMax = 3;
        player.strength = 0;
        player.strengthBase = 0;
        player.strengthStance = 0;
        player.strengthCard = 0;
        player.strengthMax = 15;
        player.armor = 0;
        player.armorMax = 15;
        player.armorBase = 0;
        player.armorStance = 0;
        player.armorCard = 0;
        player.lifeStealBase = 0;
        player.lifeStealThisTurn = 0;
        player.lifeStealCounter = 0;
    };

    saveGameState(currentScene) {
        try {
            const saveData = {
                player: {
                    health: gameState.player.health,
                    healthMax: gameState.player.healthMax,
                    mana: gameState.player.mana,
                    manaMax: gameState.player.manaMax,
                    gold: gameState.player.gold,
                    goldMax: gameState.player.goldMax,
                    name: gameState.player.name,
                    alive: gameState.player.alive
                },

                deck: gameState.deck,
                bonusCards: gameState.bonusCards,
                extraCards: gameState.extraCards,
                minDeckSize: gameState.minDeckSize,
                latestDraw: gameState.latestDraw,
                taunts: gameState.taunts,
                ratTaunts: gameState.ratTaunts,
                extraTaunts: gameState.extraTaunts,
                permanents: gameState.permanents,
                permanentSlots: gameState.permanentSlots,
                enemy: gameState.enemy,
                playerName: gameState.playerName,
                version: gameState.version,
                score: gameState.score,

                savedScene: currentScene,
                loadedGame: true,
                
            };

            const serializedState = JSON.stringify(saveData);
            localStorage.setItem('gameState', serializedState);
            console.log('Game state saved successfully.');
        } catch (e) {
            console.error('Failed to save the game state.', e);
        }
    }
    

    definePermanentSlots() {
        const permanentX = 50;
        const permanentY = 50;
        const permanentSpacing = 75;

        gameState.permanentSlots = [
            { available: true, x: permanentX + 0 * permanentSpacing, y: permanentY, index: 0 },
            { available: true, x: permanentX + 1 * permanentSpacing, y: permanentY, index: 1 },
            { available: true, x: permanentX + 2 * permanentSpacing, y: permanentY, index: 2 },
            { available: true, x: permanentX + 3 * permanentSpacing, y: permanentY, index: 3 },
        ];
    }

    addHealthBar(character, color) {
        const textConfig = { fontSize: '11px', fill: '#000000' };
        const x = character.x;
        const y = character.y;
        const height = character.height;
       
        character.healthBarBackground = this.add.graphics();
        character.healthBarBackground.fillStyle(0xFFFFFF, 0.5);
        character.healthBarBackground.fillRect(x - 40, y - height / 2 - 30, 100, 10);
        character.healthBarBackground.setDepth(12);

        character.healthBarFrame = this.add.graphics();
        character.healthBarFrame.lineStyle(3, 0x000000, 1);
        character.healthBarFrame.strokeRect(x - 40, y - height / 2 - 30, 100, 10);
        character.healthBarFrame.setDepth(13);
        
        character.healthBar = this.add.graphics();
        character.healthBar.fillStyle(color, 1);
        character.healthBar.fillRect(x - 40, y - height / 2 - 30, 100 * (character.health / character.healthMax), 10);
        character.healthBar.setDepth(14);
        
        character.healthBarText = this.add.text(x - 18, y - height / 2 - 25, `${character.health}/${character.healthMax}`, textConfig);
        character.healthBarText.setOrigin(0.5).setDepth(15);  
    };

    addManaBar(character) {
        const textConfig = { fontSize: '11px', fill: '#000000' };
        const x = character.x;
        const y = character.y;
        const height = character.height; 

        character.manaBarBackground = this.add.graphics();
        character.manaBarBackground.lineStyle(3, 0x000000, 1);
        character.manaBarBackground.strokeRect(x - 40, y - height / 2 - 45, 100, 10);

        character.manaBarFrame = this.add.graphics();
        character.manaBarFrame.lineStyle(3, 0x000000, 1);
        character.manaBarFrame.strokeRect( character.x - 40,  character.y - height / 2 - 45, 100, 10); 
        
        character.manaBar = this.add.graphics();
        character.manaBar.fillStyle(0x0000ff, 1); 
        character.manaBar.fillRect( x - 40,  y - height / 2 - 45, 100 * (character.mana / character.manaMax), 10);
        
        character.manaBarText = this.add.text( x - 27,  y - height / 2 - 40, `${character.mana}/${character.manaMax}`, textConfig).setOrigin(0.5);
    };

    addStatsDisplay(character, y=420) {
        const textConfig = { fontSize: '11px', fill: '#FFFFFF' };
        const x = character.sprite.x;

        character.strengthAndArmorImage = this.add.image(x-20, y, 'strengthAndArmor').setScale(0.4).setInteractive().setDepth(20);
        character.armorText = this.add.text(x+13, y, `${character.armor}/${character.armorMax}`, textConfig).setDepth(25);
        character.strengthText = this.add.text(x-40, y, `${character.strength}/${character.strengthMax}`, textConfig).setDepth(25);
    };

    addGoldCoin() {
        const goldCoin = this.add.image(1040, 50, 'goldCoin').setScale(0.10).setDepth(220).setOrigin(0.5).setInteractive();
        gameState.goldCounter = this.add.text(1040, 50, gameState.player.gold, { fontSize: '60px', fill: '#000000'}).setDepth(221).setOrigin(0.5);
        let currentInput = "";

        goldCoin.on('pointerover', () => {
            gameState.goldCard = this.add.image(550, 300, 'goldCard').setScale(0.55).setDepth(220);
            
            this.input.keyboard.on('keydown', function (event) {
                currentInput += event.key; // appends the latest key pressed to currentInput

                if (currentInput === "showmethemoney") {
                    console.log("showmethemoney");
                    gameState.player.gold = 99;
                    gameState.player.goldMax = 99;
                    gameState.goldCounter.setText(gameState.player.gold);
                    if (gameState.playerName !== 'admin') gameState.playerName = "Cheater";
                    if (gameState.player.name !== 'admin') gameState.player.name = "Cheater";
                    currentInput = "";
                }

                // Limit the length of currentInput to avoid unnecessary memory usage
                if (currentInput.length > 30) {
                    currentInput = currentInput.substring(currentInput.length - 30);
                }
            });
        });

        goldCoin.on('pointerout', () => {
            gameState.goldCard.destroy();
            currentInput = "";
            this.input.keyboard.removeAllListeners('keydown');
        });
    }
    

    describeCharacter(character) {
        if (!gameConfig.targetingCursor.visible && character.alive === true) {
            character.sprite.on('pointerover', () => {
                const armorText = character.armor < 0 ? 'more' : 'less';
                const strengthText = character.strength < 0 ? 'less' : 'more';
                
                const fullText = `${character.name}\n\n${character.armor} armor: Take ${Math.round(Math.abs((character.armor / 20) * 100) )} %\n` + 
                `${armorText} physical damage\n\nMax armor: Take 75 %\nless physical damage \n\n${character.strength} Strength: Deal ` + 
                `${Math.abs(character.strength) * 10} %\n${strengthText} physical damage\n\nMax strength: Deal 150 %\nmore physical ` +
                `damage\n\nPoison: ${character.poison}\nPoison change per turn: ${character.poison > 0 ? -1 : 0}`;
                
                const x = character.sprite.x - character.width / 2;
                const y = 330;
        
                character.descriptionBackground = this.add.graphics({x: x - 200, y: y - 120});
                character.descriptionBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9).setInteractive().setDepth(30);
                character.descriptionBackground.fillRoundedRect(0, 0, 215, 250, 10);
                
                const textConfig = { fontSize: '12px', fill: '#000000' };
                character.descriptionText = this.add.text(x + 10 , y + 5, fullText, textConfig).setDepth(35).setOrigin(1, 0.5);
            })
        }

        character.sprite.on('pointerout', function() {
            // The conditional is needed incase the player points the cursor over a sprite before describeCharacter() is called
            if (character.descriptionBackground) character.descriptionBackground.destroy();
            if (character.descriptionText) character.descriptionText.destroy();
        });
    };

    addStanceBar(character, textColor) {
        character.stancePoints = 0;

        let screenCenterX = this.cameras.main.width / 2;
        let barWidth = 440;
        gameState.stanceBarHeight = 20;
        gameState.stanceBarMargin = 60;
        gameState.stanceBarStartX = screenCenterX - barWidth / 2;

        gameState.stanceBarBackground = this.add.graphics();
        gameState.stanceBarBackground.lineStyle(3, 0x000000, 1);
        gameState.stanceBarBackground.strokeRect(gameState.stanceBarStartX, gameState.stanceBarMargin, barWidth, gameState.stanceBarHeight).setDepth(20);

        for(let i = 1; i < 6; i++) { // draw internal lines
            gameState.stanceBarBackground.moveTo(gameState.stanceBarStartX + i * 73.33, gameState.stanceBarMargin);
            gameState.stanceBarBackground.lineTo(gameState.stanceBarStartX + i * 73.33, gameState.stanceBarMargin + 20);
            gameState.stanceBarBackground.strokePath();
        }

        gameState.stanceBar = this.add.graphics();
        gameState.stanceBar.fillStyle(0x00ff00, 1);
        
        let stanceTextConfig = { fontSize: '28px', fill: textColor }; 
        gameState.stanceText = this.add.text(550, gameState.stanceBarMargin - 25, `Stance: ${gameState.player.stance}`, stanceTextConfig).setOrigin(0.5).setInteractive();      
        
        gameState.stanceText.on('pointerover', () => {

            const stanceText = `Stance represents the ever-shifting balance\nbetween the conflicting ideals of the\n` + 
                `punk rock samurai: Discipline and Freedom.\n\nPositive Discipline during your turn:\n+3 Strength\n\n` +
                `Positive Discipline at the end of your turn:\n+3 Armor\n\nMax Discipline at the end of your turn:\n` +
                `-1 card next turn\n\nPositive Freedom during your turn:\n+1 mana\n\nPositive Freedom at the end of your turn:\n` + 
                `50% chance of +1 card next turn\n50% chance of +1 mana next turn\n\nMax Freedom at the end of your turn:\n-2 Armor`;
            
            const stanceTextConfig = { fontSize: '14px', fill: '#000000' };
            gameState.stanceDescriptionText = this.add.text(550, gameState.stanceBarBackground.y + 105, stanceText, stanceTextConfig).setDepth(25).setOrigin(0.5, 0);
        
            const bounds = gameState.stanceDescriptionText.getBounds();
            const backgroundWidth = bounds.width + 10; // 5px padding on each side
            const backgroundHeight = bounds.height + 10; // 5px padding on each side
            const backgroundX = bounds.x - 5; // 5px padding on the left
            const backgroundY = bounds.y - 5; // 5px padding on the top

            gameState.stanceTextBackground = this.add.graphics();
            gameState.stanceTextBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.90).setDepth(24);
            gameState.stanceTextBackground.fillRoundedRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight, 7);
        })

        gameState.stanceText.on('pointerout', () => {
            gameState.stanceTextBackground.destroy();
            gameState.stanceDescriptionText.destroy();
        });
    };

    extractLevelFightFromName(name) {
        const match = /Level(\d+)Fight(\d+)/.exec(name);
        if (match) {
            return {
                level: parseInt(match[1], 10),
                fight: parseInt(match[2], 10)
            };
        }
        return { level: null, fight: null };
    };

    // Tweens Animations

    powerUpTweens(character) {
        this.tweens.add({
            targets: character.sprite,
            scaleY: character.sprite.scaleX * 1.125,
            scaleX: character.sprite.scaleY * 1.125,
            duration: 120,
            ease: 'Cubic',
            yoyo: true
        }, this);
    };

    attackTweens(character, distance) {
        if (typeof attackTweenStarted === "undefined" || !attackTweenStarted) {   
            let attackTweenStarted = true;
            
            this.tweens.add({
                targets: character.sprite,
                x: character.x + distance,
                duration: 120,
                ease: 'Cubic',
                yoyo: true,
                onComplete: () => attackTweenStarted = false
            }, this);
        }
    };

    cardTweens(target, scale, duration) {
        this.tweens.add({
            targets: target,
            scaleX: scale,
            scaleY: scale,
            duration: duration,
            ease: 'Cubic'
        }, this);
    }

    animateCard(card, depth) {
        card.sprite.on('pointerover', () => {
            gameConfig.cardsDealtSound.play({ volume: 0.6, seek: 0.08 });
            this.tweens.add({
                targets: card.sprite,
                y: 470,
                angle: 0,
                scaleX: 0.46, // 0.5
                scaleY: 0.46,
                duration: 300,
                ease: 'Cubic'
            });
            card.sprite.setDepth(100);
        }, this);

        card.sprite.on('pointerout', () => {
            if (!card.isBeingPlayed) {
                this.tweens.add({
                    targets: card.sprite,
                    y: card.startHeight,
                    angle: card.angle,
                    scaleX: 0.35, // 0.35
                    scaleY: 0.35,
                    duration: 300,
                    ease: 'Cubic'
                });
                card.sprite.setDepth(depth);
            }
        }, this);
    }

    // Support functions

    addEndOfTurnButton(y=500) {
        gameState.endOfTurnButton = this.add.image(900, y, 'rectangularButton').setScale(0.45).setOrigin(0.5);
        gameState.endOfTurnText = this.add.text(900, y, 'End Turn', { fontSize: '18px', fill: '#000000' }).setOrigin(0.5);
        
        gameState.endOfTurnButton.on('pointerover', function () {
            if (!gameState.endOfTurnButtonPressed) {
                this.setTexture('rectangularButtonHovered');
            }
        });
        
        gameState.endOfTurnButton.on('pointerout', function () {
            if (!gameState.endOfTurnButtonPressed) {
                this.setTexture('rectangularButton');
            }
        });
    };

    addRedrawButton() {
        const x = 900;
        const y = 52;
        gameState.redrawButton = this.add.image(x, y, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();;
        gameState.redrawText = this.add.text(x, y, 'Redraw', { fontSize: '18px', fill: '#000000' }).setOrigin(0.5);

        gameState.redrawButton.on('pointerover', () => {
            gameState.redrawButton.setTexture('rectangularButtonHovered');
            gameState.redrawButtonDescriptionBackground = this.add.graphics();
            gameState.redrawButtonDescriptionBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.8).setDepth(122);
            gameState.redrawButtonDescriptionBackground.fillRoundedRect(x-65, y+30, 130, 40, 5);

            const textConfig = { fontSize: '12px', fill: '#000000' };
            const fullText = `Redraw your hand\n Cost: ${gameState.redrawPrice} gold`;
            gameState.redrawButtonDescriptionText = this.add.text(x, y+50, fullText, textConfig).setDepth(123).setOrigin(0.5, 0.5);
        });
        
        gameState.redrawButton.on('pointerout', () => {
            gameState.redrawButton.setTexture('rectangularButton');
            if (gameState.redrawButtonDescriptionBackground) gameState.redrawButtonDescriptionBackground.destroy();
            if (gameState.redrawButtonDescriptionText) gameState.redrawButtonDescriptionText.destroy();
        });
    }

    clearBoard() {
        gameState.characters.forEach( (character) => {
            character.sprite.destroy();
            character.strengthAndArmorImage.destroy();
            character.armorText.destroy();
            character.strengthText.destroy();
            character.strengthAndArmorImage.destroy();
            character.healthBarBackground.destroy();
            character.healthBarFrame.destroy();
            character.healthBar.destroy();
            character.healthBarText.destroy();
        });

        const gameObjectsToDestroy = [
            gameState.player.manaBarBackground,
            gameState.player.manaBarFrame,
            gameState.player.manaBar,
            gameState.player.manaBarText,
            gameState.endOfTurnButton,
            gameState.endOfTurnText,
            gameState.drawPileImage,
            gameState.discardPileImage,
            gameState.drawPileText,
            gameState.discardPileText,
            gameState.stanceBar,
            gameState.stanceText,
            gameState.stanceBarBackground,
            gameState.redrawButton,
            gameState.redrawText,
            gameState.healButton,
            gameState.healText,
            gameState.actionText
        ];
        
        gameObjectsToDestroy.forEach(object => {
            if (object) object.destroy();
        });

        console.log('board cleared');
    };
    
    shuffleDeck(deck) {
        for(let i = deck.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    };

    updateEnemyIntention(enemy) {
        let actionKey = typeof enemy.chosenAction.key === 'function' ? enemy.chosenAction.key() : enemy.chosenAction.key;
        enemy.intentionText.setText(`${actionKey}`);
    };

    updateHealthBar(character) {
        character.health = Phaser.Math.Clamp(character.health, 0, character.healthMax);
        // const textColor = character == gameState.player && character.health < 10 ? '#ff0000' : '#000000'; // Red if health < 10, otherwise Black
        const textColor = '#000000';

        character.healthBar.clear();
        character.healthBar.fillStyle(character === gameState.player ? 0x00ff00 : 0xff0000, 1);
        character.healthBar.fillRect(character.x - 40, character.y - character.height / 2 - 30, 100 * (character.health / character.healthMax), 10);
        
        character.healthBarText.setText(`${character.health}/${character.healthMax}`);
        character.healthBarText.setColor(textColor);
    };
    
    updateManaBar(character) {
        character.mana = Phaser.Math.Clamp(character.mana, 0, character.manaMax);
       
        character.manaBar.clear();
        character.manaBar.fillStyle(0x0000ff, 1); // Blue color for mana.
        character.manaBar.fillRect(character.x - 40, character.y - character.height / 2 - 45, 100 * (character.mana / character.manaMax), 10);
       
        character.manaBarText.setText(`${character.mana}/${character.manaMax}`);
    };

    updateStanceBar(character) {       
        const points = gameState.player.stancePoints;
        if (points > 0) {
            const rand = Math.random();
            if (rand > 0.5) {
                character.manaStance = 1;
                character.numCardsStance = 0;
            } else {
                character.manaStance = 0;
                character.numCardsStance = 1;
            }
        } else {
            character.manaStance = 0;
        }
        
        // Update stance and associated stats
        switch (points) {
            case -3:
                character.armorStance = 3;
                character.strengthStance = 3;
                character.numCardsStance = -1;
                character.stance = 'Discipline';
                break;
            case -2:
            case -1:
                character.armorStance = 3;
                character.strengthStance = 3;
                character.numCardsStance = 0;
                character.stance = 'Discipline';
                break;
            case 0:
                character.armorStance = 0;
                character.strengthStance = 0;
                character.numCardsStance = 0;
                character.stance = 'Neutral';
                break;
            case 1:
            case 2:
                character.armorStance = 0;
                character.strengthStance = 0;
                character.stance = 'Freedom';
                break;
            case 3:
                character.armorStance = -2;
                character.strengthStance = 0;
                character.stance = 'Freedom';
                break;
            default:
                console.error(`Unexpected value for points: ${points}`);
                return;
        };
    
        gameState.stanceBar.clear();
        
        // Update stance bar and stance text
        if (points < 0) {
            gameState.stanceBar.fillRect(
                gameState.stanceBarStartX + 220 + points * 73.33, 
                gameState.stanceBarMargin, 
                Math.abs(points) * 73.33, 
                gameState.stanceBarHeight
            );

        } else {
            gameState.stanceBar.fillRect(
                gameState.stanceBarStartX + 220, 
                gameState.stanceBarMargin, 
                points * 73.33, 
                gameState.stanceBarHeight
            );
        }
    
        gameState.stanceText.setText(`Stance: ${character.stance}`);
    }

    updateTextAndBackground(textObj, backgroundObj, newText, cornerRadius = 7, depth=20, alpha=0.60) {
        textObj.setText(newText);
        textObj.setDepth(depth+1);
        
        const bounds = textObj.getBounds();
        const backgroundWidth = bounds.width + 10; // 5px padding on each side
        const backgroundHeight = bounds.height + 10; // 5px padding on each side
        const backgroundX = bounds.x - 5; // 5px padding on the left
        const backgroundY = bounds.y - 5; // 5px padding on the top
        
        backgroundObj.clear();
        backgroundObj.fillStyle(0xFFFFFF, 1).setAlpha(alpha).setDepth(depth);
        backgroundObj.fillRoundedRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight, cornerRadius);
    }

    // Helper function to create a delay using a Promise
    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
    

} // End of scene
