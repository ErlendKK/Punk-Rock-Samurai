/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

class BaseScene extends Phaser.Scene {

    preload() {
        this.load.image('listbox1', 'assets/images/listbox1.png');
        this.load.image('listbox2', 'assets/images/listbox2.png');
    }

    create() {
        this.scene.start('Preload');
    }


    // Initiaiate level

    baseCreate(backgoundImage, scale = 0.75) {
        this.add.image(0,0, backgoundImage).setScale(scale).setOrigin(0.02,0); 
        this.cameras.main.fadeIn(600, 0, 0, 0);   
        this.input.keyboard.createCursorKeys();
        
        gameState.targetingCursor = this.add.sprite(0, 0, 'targetingCursor').setDepth(200).setVisible(false);
        gameState.playingCard = false;
        gameState.drawPile = [...gameState.deck];
        gameState.discardPile = [];
        
        gameState.cardsDealtSound = this.sound.add('cardsDealtSound');
        gameState.victorySound = this.sound.add('victorySound');
        gameState.buttonPressedSound = this.sound.add('buttonPressedSound');
        gameState.attackSound = this.sound.add('attackSound');
        gameState.powerUpSound = this.sound.add('powerUpSound');
        gameState.healSound = this.sound.add('healSound');
        gameState.thunder = this.sound.add('thundersound');
        gameState.gunShotSound = this.sound.add('gunShotSound');
        gameState.music = this.sound.add('bossTune');
    }

    resetPlayer(player, scale) {
        player.sprite = this.add.sprite(320, 350, 'player').setScale(scale).setFlipX(true).setInteractive(); //320 / 330 / 0.41
        player.stance = 'Neutral'; 
        player.poison = 0;
        player.stancePoints = 0;
        player.numCardsBase = 5;
        player.numCardsStance = 0;
        player.manaBase = 4;
        player.manaStance = 0;
        player.manaCard = 0;
        player.mana = 4;
        player.manaMax = 4;
        player.strengthBase = 0;
        player.strengthStance = 0;
        player.strengthCard = 0;
        player.strengthMax = 15;
        player.armorBase = 0;
        player.armorStance = 0;
        player.armorCard = 0;
    };

    addHealthBar(character, color) {
        const textConfig = { fontSize: '11px', fill: '#000000' };
        const x = character.x;
        const y = character.y;
        const height = character.height;

        character.healthBarBackground = this.add.graphics();
        character.healthBarBackground.lineStyle(3, 0x000000, 1);
        character.healthBarBackground.strokeRect(x - 40, y - height / 2 - 30, 100, 10);    
        character.healthBar = this.add.graphics();
        character.healthBar.fillStyle(color, 1);
        character.healthBar.fillRect(x - 40, y - height / 2 - 30, 100 * (character.health / character.healthMax), 10);
        character.healthBarText = this.add.text(x - 18, y - height / 2 - 25, `${character.health}/${character.healthMax}`, textConfig).setOrigin(0.5);      
    };

    addManaBar(character) {
        const textConfig = { fontSize: '11px', fill: '#000000' };
        const x = character.x;
        const y = character.y;
        const height = character.height; 

        character.manaBarBackground = this.add.graphics();
        character.manaBarBackground.lineStyle(3, 0x000000, 1);
        character.manaBarBackground.strokeRect( character.x - 40,  character.y - height / 2 - 45, 100, 10); 
        character.manaBar = this.add.graphics();
        character.manaBar.fillStyle(0x0000ff, 1); 
        character.manaBar.fillRect( x - 40,  y - height / 2 - 45, 100 * (character.mana / character.manaMax), 10);
        character.manaBarText = this.add.text( x - 27,  y - height / 2 - 40, `${character.mana}/${character.manaMax}`, textConfig).setOrigin(0.5);
    };

    addStatsDisplay(character) {
        let textConfig = { fontSize: '11px', fill: '#FFFFFF' };
        character.strengthAndArmorImage = this.add.sprite(character.sprite.x - 20, 460, 'strengthAndArmor').setScale(0.4).setInteractive().setDepth(20);
        character.armorText = this.add.text(character.sprite.x + 13, 462, `${character.armor}/${character.armorMax}`, textConfig).setDepth(25);
        character.strengthText = this.add.text(character.sprite.x - 40, 462, `${character.strength}/${character.strengthMax}`, textConfig).setDepth(25);
    };

    describeCharacter(character) {
        if (!gameState.targetingCursor.visible && character.alive === true) {
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
                character.descriptionBackground.fillRect(0, 0, 215, 250);
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
        
        let stanceTextConfig = { fontSize: '30px', fill: textColor }; // GREY FOR LEVEL 1-1     
        gameState.stanceText = this.add.text(550, gameState.stanceBarMargin - 25, `Stance: ${gameState.player.stance}`, stanceTextConfig).setOrigin(0.5).setInteractive();      
        
        gameState.stanceText.on('pointerover', () => {

            const stanceText = `Stance represents the ever-shifting balance\nbetween the conflicting ideals of the\n` + 
                `punk rock samurai: Discipline and Freedom.\n\nPositive Discipline during your turn:\n+3 Strength\n\n` +
                `Positive Discipline at the end of your turn:\n+3 Armor\n\nMax Discipline at the end of your turn:\n` +
                `-1 card next turn\n\nPositive Freedom during your turn:\n+1 mana\n\nPositive Freedom at the end of your turn:\n` + 
                `+1 card next turn\n+1 mana next turn\n\nMax Freedom at the end of your turn:\n-2 Armor`;
            
            const stanceTextConfig = { fontSize: '14px', fill: '#000000' }

            gameState.stanceDescriptionBackground = this.add.sprite(550, gameState.stanceBarBackground.y + 50, 'listbox2').setScale(2.9, 7.3)
            gameState.stanceDescriptionBackground.setInteractive().setDepth(20).setOrigin(0.5, 0).setAlpha(0.85);
            gameState.stanceDescriptionText = this.add.text(550, gameState.stanceBarBackground.y + 105, stanceText, stanceTextConfig).setDepth(25).setOrigin(0.5, 0);
        })

        gameState.stanceText.on('pointerout', () => {
            this.time.delayedCall(20, () => {
                gameState.stanceDescriptionBackground.destroy();
                gameState.stanceDescriptionText.destroy();
            })
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
    }

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
            gameState.cardsDealtSound.play({ volume: 0.6 });
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

    addButtons() {
        //Add Mutebutton
        const muteButton = this.add.sprite(1050, 40, 'radioButtonRoundOff').setScale(0.5).setInteractive();
        gameState.muteText = this.add.text(875, 30, 'Mute music', { fontSize: '25px', fill: '#000000' });    

        muteButton.on('pointerup', () => {

            if (gameState.music.mute) {
                gameState.music.mute = false;
                muteButton.setTexture('radioButtonRoundOff');

            } else {
                gameState.music.mute = true;
                muteButton.setTexture('radioButtonRoundOn');
            }
        });

        //Add End-of-turn Button
        gameState.endOfTurnButton = this.add.sprite(870, 510, 'rectangularButton').setScale(0.45).setOrigin(0.5);
        gameState.endOfTurnText = this.add.text(870, 510, 'End Turn', { fontSize: '20px', fill: '#000000' }).setOrigin(0.5);
        
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

    clearBoard() {
        gameState.characters.forEach( (character) => {
            character.sprite.destroy();
            character.strengthAndArmorImage.destroy();
            character.armorText.destroy();
            character.strengthText.destroy();
            character.strengthAndArmorImage.destroy();
            character.healthBarBackground.destroy();
            character.healthBar.destroy();
            character.healthBarText.destroy();
        });

        gameState.player.manaBarBackground.destroy();
        gameState.player.manaBar.destroy();
        gameState.player.manaBarText.destroy();
        gameState.endOfTurnButton.destroy();
        gameState.endOfTurnText.destroy();
        gameState.drawPileImage.destroy();
        gameState.discardPileImage.destroy();
        gameState.drawPileText.destroy();
        gameState.discardPileText.destroy();
        gameState.stanceBar.destroy();
        gameState.stanceText.destroy();
        gameState.stanceBarBackground.destroy();

        if (gameState.actionText) {
            gameState.actionText.destroy();
        };

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
        character.healthBar.clear();
        character.healthBar.fillStyle(character === gameState.player ? 0x00ff00 : 0xff0000, 1);
        character.healthBar.fillRect(character.x - 40, character.y - character.height / 2 - 30, 100 * (character.health / character.healthMax), 10);
        character.healthBarText.setText(`${character.health}/${character.healthMax}`);
    };
    
    updateManaBar(character) {
        character.mana = Phaser.Math.Clamp(character.mana, 0, character.manaMax);
        character.manaBar.clear();
        character.manaBar.fillStyle(0x0000ff, 1); // Blue color for mana.
        character.manaBar.fillRect(character.x - 40, character.y - character.height / 2 - 45, 100 * (character.mana / character.manaMax), 10);
        character.manaBarText.setText(`${character.mana}/${character.manaMax}`);
    };

    updatePoison(character) {
        if (character.poison > 0) {
            console.log(`character.poison > 0`)
            character.health = Math.max(1, character.health - character.poison);
            if (character.poisonText) {
                console.log(`character.poisonText exists`)
                character.poisonText.setText(`Poison: -${character.poison} HP`); // NB! Must be called before the poison counter is reduced.
            }
            character.poison -= 1;
        }
    };

    updateStanceBar(character) {       
        const points = gameState.player.stancePoints;
        
        // Update stance and associated stats
        switch (points) {
            case -3:
                character.armorStance = 3;
                character.strengthStance = 3;
                character.manaStance = 0;
                character.numCardsStance = -1;
                character.stance = 'Discipline';
                break;
            case -2:
            case -1:
                character.armorStance = 3;
                character.strengthStance = 3;
                character.manaStance = 0;
                character.numCardsStance = 0;
                character.stance = 'Discipline';
                break;
            case 0:
                character.armorStance = 0;
                character.strengthStance = 0;
                character.manaStance = 0;
                character.numCardsStance = 0;
                character.stance = 'Neutral';
                break;
            case 1:
            case 2:
                character.armorStance = 0;
                character.strengthStance = 0;
                character.manaStance = 1;
                character.numCardsStance = 1;
                character.stance = 'Freedom';
                break;
            case 3:
                character.armorStance = -2;
                character.strengthStance = 0;
                character.manaStance = 1;
                character.numCardsStance = 1;
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

} // End of scene
