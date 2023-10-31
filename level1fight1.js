/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|

Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

class Level1Fight1 extends BaseScene {self
    constructor() {
        super('Level1Fight1');
    }

    preload() {
        this.load.image('theCity', 'assets/images/theCity.jpg');
        this.load.image('bakgrunnCity1', 'assets/images/bakgrunnCity1.jpg');
        this.load.image('shop1', 'assets/images/shop1.jpg'); 
        this.load.image('nazi', 'assets/images/sprites/nazi.png');

        this.load.image('goldCard', 'assets/images/goldCard.jpg');
        this.load.image('goldCoin', 'assets/images/goldCoin.png');

        this.load.audio('bossTune', 'assets/sounds/music/DecisiveBattle.mp3');
        this.load.audio('attackSound', 'assets/sounds/attacksound.wav');
        this.load.audio('powerUpSound', 'assets/sounds/powerupsound.wav');
        this.load.audio('healSound', 'assets/sounds/healsound.wav');
        this.load.audio('victorySound', 'assets/sounds/victorysound.mp3');
        this.load.audio('keyboardSound', 'assets/sounds/keyboardsound.mp3');
        this.load.audio('coinSound', 'assets/sounds/coinsound.mp3');
    }; 

    create() {
        const self = this;      
        this.baseCreate('bakgrunnCity1');
        this.resetPlayer(gameState.player, 0.45, 370, 350); //l1f1:0.28 -- l1f2: 0.24, 360, 300 (liten:0.48, 360, 280)
        this.addEndOfTurnButton();
        this.addRedrawButton();
        this.addGoldCoin(); //must be called after resetPlayer()
        this.definePermanentSlots() // NB! Only for Level1Fight1
        displayDrawPile();
        displayDiscardPile();

        gameState.redrawPrice = 1;
        gameState.kamishimoUberAlles = 0; 
        gameState.kirisuteGomen = false; 
        gameState.toxicFrets = false;
        gameState.ashenEncore = false;
        gameState.edoEruption = false;
        gameState.steelToe = false;
        gameState.gundanSeizai = false;
        gameState.noFutureCondition = false;
       
        gameState.currentCards = [];
        gameState.cardImages = [];
        gameState.permanents = []; // NB! Only for Level1Fight1

        gameState.player.name = gameState.playerName ? gameState.playerName : 'Punk Rock Samurai';

        gameState.enemy1 = Object.create(gameState.enemy);
        gameState.enemy1.name = 'Nazi Punk';
        gameState.enemy1.sprite = this.add.image(740, 355, 'nazi').setScale(0.42).setFlipX(false).setInteractive(); //740 / 360 / .42
        gameState.enemy1.health = 50;
        gameState.enemy1.healthMax = 50;

        gameState.enemies = [gameState.enemy1]; //NB! Add all enemies!
        gameState.characters = [...gameState.enemies, gameState.player];

        gameState.characters.forEach( character => {
            character.height = character.sprite.displayHeight;
            character.width = character.sprite.displayWidth;
            character.x = character.sprite.x;
            character.y = character.sprite.y;
            this.addHealthBar(character, character.healthBarColor);
            this.addStatsDisplay(character, 470);
        });

        addPermanent(gameState.freePermanent); // NB! Only for Level1Fight1. Must be called after characters and gameState.permanents are initiated.
        gameState.drawPile = [...gameState.deck];

        this.addManaBar(gameState.player);
        this.addStanceBar(gameState.player, '#303030'); // light:#a9a9a9 - medium:#808080 - dark:#696969 - vdark:#303030
        
        const levelTextConfig = { fontSize: '100px', fill: '#ff0000', fontFamily: 'Rock Kapak' };   
        const levelimage = this.add.image(0,0, 'theCity').setScale(0.87).setOrigin(0.02,0).setDepth(300);
        const leveltextTop = this.add.text(550, 270, 'Level 1:', levelTextConfig).setDepth(301).setOrigin(0.5);
        const leveltextBottom = this.add.text(550, 430, 'On City Streets', levelTextConfig).setDepth(301).setOrigin(0.5); 
        let levelStarting = false;

        self.time.delayedCall(4000, () => { //timer: 4000
            if (!levelStarting) {
                levelStarting = true
                fadeOutGameObject(levelimage, 2000); 
                fadeOutGameObject(leveltextTop, 2000);
                fadeOutGameObject(leveltextBottom, 2000);
                self.time.delayedCall( 2200, startFight() );
            }
        })

        self.input.on('pointerup', () => {
            if (!levelStarting) {
                levelStarting = true;
                fadeOutGameObject(levelimage, 2000);
                fadeOutGameObject(leveltextTop, 2000);
                fadeOutGameObject(leveltextBottom, 2000);
                self.time.delayedCall( 2200, startFight() );
            }
        })

        function startFight() {
            gameState.turn = 0;
            gameState.musicTheme.stop();
            self.shuffleDeck(gameState.drawPile);
            activateRedrawButton();
            gameState.redrawButton.removeInteractive();

            const { level, fight } = self.extractLevelFightFromName(self.scene.key);
            const startTextConfig = { fontSize: '60px', fill: '#ff0000', fontFamily: 'Rock Kapak' };
            gameState.startText = self.add.text(550, 300, `Level ${level}\nFight ${fight}!`, startTextConfig).setDepth(29).setOrigin(0.5);
                               
            self.time.delayedCall(350, () => {
                gameState.music.play( { loop: true, volume: 0.35 } );
            })
        
            self.time.delayedCall(2300, () => { //timer: 2300
                fadeOutGameObject(gameState.startText, 200);
                self.time.delayedCall(300, startPlayerTurn());
            });
        }

        function activateRedrawButton() {
            gameState.redrawButton.on('pointerup', () => {
                if (gameState.player.gold >= gameState.redrawPrice && gameState.redrawEnabled) {
                    spendGold(gameState.redrawPrice);
                    gameState.redrawPrice += 1;

                    if (gameState.redrawButtonDescriptionText) {
                        gameState.redrawButtonDescriptionText.setText(`Redraw your hand\n Cost: ${gameState.redrawPrice} gold`)
                    }
                    
                    let numOfCards = 0
                    gameState.currentCards.forEach(card => {
                        card.slot.available = true;
                        card.sprite.destroy();
                        gameState.discardPile.push(card);
                        gameState.discardPileText.setText(gameState.discardPile.length);
                        numOfCards +=1
                    });

                    gameState.currentCards = [];
                    drawCards(numOfCards);
                
                } else {
                    self.cameras.main.shake(70, .002, false);
                }
            })
        }

    
    // ---------------------------------- PLAYERS TURN -------------------------------------    
    
    
        function startPlayerTurn() {
            let numCards = gameState.player.numCardsBase + gameState.player.numCardsStance;
            gameState.turn += 1;
            gameState.endOfTurnButtonPressed = false; // Plays a different role than gameStale.playersTurnStarted, so keep both!

            const yourTurnTextContent = 'Your turn!'
            const yourTurnText = self.add.text(550, 300, "", { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5).setDepth(21);
            const yourTurnTextBackground = self.add.graphics();
            self.updateTextAndBackground(yourTurnText, yourTurnTextBackground, yourTurnTextContent);
            
            gameState.player.poisonText = self.add.text(540, 380, '', { fontSize: '30px', fill: '#ff0000' }).setOrigin(0.5);
            gameState.player.poisonTextBackground = self.add.graphics();
            console.log(`player's turn number ${gameState.turn} has started`);

            resetStats() // NB! Call this first!
            self.updateStanceBar(gameState.player);
            updatePoison(gameState.player);
            self.updateManaBar(gameState.player);
            self.updateHealthBar(gameState.player);
            removeIfDead(gameState.player);
            checkGameOver();
            updateStrengthAndArmor(gameState.player);
            self.shuffleDeck(gameState.drawPile);

            const delaytime = (gameState.player.poisonText._text) ? 2500 : 1700;
            self.time.delayedCall(delaytime, () => {
                const objectsToDestroy = [
                    gameState.player.poisonText,
                    gameState.player.poisonTextBackground,
                    yourTurnText,
                    yourTurnTextBackground
                ]

                objectsToDestroy.forEach(object => fadeOutGameObject(object, 200));

                if (gameState.turn === 1) {
                    gameState.characters.forEach( character => self.describeCharacter(character, character.sprite)); 
                }
                    
                // NB! These functions should run after gameState.turn has been increased
                gameState.enemies.forEach( enemy => {
                    updateEnemyActions();  
                    selectEnemyAction(enemy);
                    displayEnemyIntention(enemy);
                });
                
                drawCards(numCards);

            });                  
        }

        function resetStats() {
            gameState.player.armorCard = 0;
            gameState.player.strengthCard = 0;

            const manaMax = gameState.player.manaBase + gameState.player.manaStance;
            gameState.player.manaMax = (gameState.rebelSpirit && gameState.turn % 3 === 0) ? manaMax + 1 : manaMax;
            gameState.player.mana = gameState.player.manaMax;

            if (gameState.foreverTrue && gameState.player.stancePoints > 0) { // NB! Stance must be reset/kept after mana
                gameState.player.manaMax += 1;
                gameState.player.mana += 1;
            } else {
                gameState.player.stancePoints = 0; 
            };

            if (gameState.noFutureCondition) gameState.player.health -= 2;
        }

        // Create grid for cards
        const x = 250;
        const y = 580;
        const spacing = 90;
        const cardAngle = 4;
        const hightAdjustment = 10

        gameState.slots = [
            { available: true, x: x + 0 * spacing, y: y + 6 * hightAdjustment, index: 0, angle: -3 * cardAngle },
            { available: true, x: x + 1 * spacing, y: y + 3 * hightAdjustment, index: 1, angle: -2 * cardAngle },
            { available: true, x: x + 2 * spacing, y: y + 1 * hightAdjustment, index: 2, angle: -1 * cardAngle },
            { available: true, x: x + 3 * spacing, y: y + 0 * hightAdjustment, index: 3, angle: 0 * cardAngle  },
            { available: true, x: x + 4 * spacing, y: y + 1 * hightAdjustment, index: 4, angle: 1 * cardAngle },
            { available: true, x: x + 5 * spacing, y: y + 3 * hightAdjustment, index: 5, angle: 2 * cardAngle },
            { available: true, x: x + 6 * spacing, y: y + 6 * hightAdjustment, index: 6, angle: 3 * cardAngle },
            { available: true, x: x + 7 * spacing, y: y + 9 * hightAdjustment, index: 7, angle: 4 * cardAngle },
        ];
        
        function drawCards(numCards) {
            gameState.endOfTurnButton.setTexture('rectangularButton');
            gameState.endOfTurnButton.setInteractive();
            const startSlotIndex = Math.floor((gameState.slots.length - numCards) / 2);
            
            for (let i = 0; i < numCards; i++) {
                self.time.delayedCall(i * 75, () => {
        
                    // Check and reshuffle the deck if necessary
                    if (gameState.drawPile.length === 0) {
                        console.log("Draw pile is empty. Reshuffling...");
                        if (gameState.discardPile.length === 0) {
                            console.error("Both draw and discard piles are empty. Cannot continue.");
                            return;
                        }

                        gameState.drawPile = gameState.discardPile;
                        self.shuffleDeck(gameState.drawPile);    
                        gameState.discardPile = [];
                        gameState.discardPileText.setText(gameState.discardPile.length);
                    }
        
                    // Draw a card and create a sprite for it
                    const card = gameState.drawPile.pop();
                    const cardDepth = 10 + i + startSlotIndex;
                    card.sprite = self.add.image(0, 0, card.key).setScale(0.35).setInteractive();
                    card.isBeingPlayed = false;
                    gameState.currentCards.push(card);
                    card.sprite.setDepth(cardDepth);
                    if (card.usedOneShot) card.sprite.setTint(0x808080);
                    
                    // Position the sprite
                    const slot = gameState.slots[startSlotIndex + i];
                    if (slot) {
                        card.sprite.x = slot.x;
                        card.sprite.y = slot.y;
                        card.startHeight = card.sprite.y;
                        card.angle = slot.angle;
                        card.sprite.setAngle(card.angle);
                        slot.available = false;
                        card.slot = slot;
                    }
                    
                    gameState.cardsDealtSound.play({ volume: 2.2, seek: 0.10 });
                    gameState.drawPileText.setText(gameState.drawPile.length);
                    self.animateCard(card, cardDepth);


                    if (gameState.playersTurn) { // NB! Dont allow the player to click before all cards are dealt
                        card.sprite.on('pointerup', function() {
                            
                            // Disable redraw after the first card has been played but before activateCard is called
                            if (gameState.redrawEnabled) {
                                gameState.redrawEnabled = false
                                gameState.redrawButton.removeInteractive();
                                gameState.redrawButton.setTexture('rectangularButtonPressed');
                            }

                            activateCard(card);
                        })
                    }
                })
            };

            gameState.playersTurn = true; // Sets tokens interactive
            gameState.redrawEnabled = true;
            gameState.redrawButton.setInteractive();
            gameState.redrawButton.setTexture('rectangularButton');
        }

        function activateCard(card) {
            gameState.typePlayed = typeof card.type === 'function' ? card.type() : card.type; 

            if (card.dBeat) {
                delete card.dBeat;
                gameState.costPlayed = 0;

            } else {
                gameState.costPlayed = typeof card.cost === 'function' ? card.cost() : card.cost;   
            }

            const goldCostCondition = !card.goldCost || card.goldCost < gameState.player.gold;
            const manaCostCondition = gameState.player.mana >= gameState.costPlayed
            const otherConditions = gameState.playingCard === false && !card.usedOneShot

            if (goldCostCondition && manaCostCondition && otherConditions) {
                gameState.player.mana -= gameState.costPlayed;
                if (card.goldCost) spendGold(card.goldCost);
                self.updateManaBar(gameState.player);
                console.log(`activated card: ${card.key}\nCost: ${gameState.costPlayed}`);

                // FreedomBeforeCardPlayed is used in playCard() to detect changes in stance
                gameState.player.freedomBeforeCardPlayed = (gameState.player.stance === 'Freedom') ? true : false; 
                card.isBeingPlayed = true;
                gameState.currentCards = gameState.currentCards.filter(c => c !== card);
                
                if (card.slot) card.slot.available = true;
                if (card.oneShot) card.usedOneShot = true;

                // Select mode of activation based on card type
                if (gameState.typePlayed === 'targetSelected') {
                    targetEnemy(card, gameState.currentCards);

                } else if (gameState.typePlayed === 'targetAll') {
                    gameState.discardPile.push(card);
                    gameState.discardPileText.setText(gameState.discardPile.length);

                    // Makes a shallow copy to ensure that playCard() continues for enemy2 even if enemy1
                    // gets killed and thus removed from gameState.enemies by removeIfDead().
                    // Save enemiesCopy.length in gameState to make it available to normalizeCard().
                    const enemiesCopy = [...gameState.enemies];
                    gameState.enemiesLength = enemiesCopy.length;
                    
                    enemiesCopy.forEach( (enemy, index) => {
                        const isLastEnemy = index === enemiesCopy.length - 1;
                        playCard(card, enemy, isLastEnemy);
                    }) 

                } else if (gameState.typePlayed === 'permanent') {
                    addPermanent(card);

                } else {
                    gameState.discardPile.push(card);
                    gameState.discardPileText.setText(gameState.discardPile.length);
                    playCard(card, gameState.player);
                };    

            } else {
                self.cameras.main.shake(70, .002, false);
            };
        }
                                    
        function targetEnemy(card, handOfCards) {        
            gameState.targetingCursor.setVisible(true);
            gameState.thisTurn = gameState.turn; 

            // Turn the other cards non-interactive while targeting an enemy
            for (let cardOnHand of handOfCards) { 
                if (cardOnHand.sprite && cardOnHand.sprite.scene) {
                    cardOnHand.sprite.removeInteractive();
                }
            }
            
            for (let enemy of gameState.enemies) {
                enemy.sprite.on('pointerover', function() {
                    gameState.targetingCursor.setTexture('targetingCursorReady');
                });
        
                enemy.sprite.on('pointerout', function() {
                    gameState.targetingCursor.setTexture('targetingCursor');
                });
        
                enemy.sprite.on('pointerup', function() {
                    if (card.isBeingPlayed && gameState.playersTurn && gameState.thisTurn === gameState.turn) {
                        card.isBeingPlayed = false;
                        gameState.discardPile.push(card);
                        gameState.discardPileText.setText(gameState.discardPile.length);
                        playCard(card, enemy);
                    }
                
                    // Turn the other cards interactive again once an enemy has been targeted
                    for (let cardOnHand of handOfCards) { 
                        if (cardOnHand.sprite && cardOnHand.sprite.scene) {
                            cardOnHand.sprite.setInteractive(); 
                        }
                    }   
                });
            }
        }      
        
        function playCard(card, target, isLastEnemy = false) {

            gameState.playingCard = true;
            gameState.targetingCursor.setVisible(false);

            fadeOutGameObject(card.sprite, 200);
            if (gameState.actionText) gameState.actionText.destroy();
            if (gameState.actionTextBackground) gameState.actionTextBackground.destroy();

            const { 
                damagePlayed, 
                firePlayed, 
                stancePointsPlayed, 
                poisonPlayed, 
                healPlayed, 
                strengthPlayed, 
                armorPlayed, 
                reduceTargetArmorPlayed, 
                reduceTargetStrengthPlayed,
                drawCardPlayed,
                poisonRemovePlayed 
            } = normalizeCard(card, target, isLastEnemy);

            // NB "damageTotal" must be available to the scope in which "addTextAndTweens" gets called,
            // regardless of whether card.type = target or buff.  
            const damageModifyer = (1 + 0.10 * gameState.player.strength) * (1 - target.armor / 20);
            const damageTotal = Math.round( Math.max(0, firePlayed + damagePlayed * damageModifyer));  
            gameState.player.lifeSteal += gameState.canibalizeCondition ? damagePlayed * damageModifyer * 0.2 : 0;     

            if (target != gameState.player) {
                gameState.score.damageDealt += damageTotal;
                console.log(`${damagePlayed} Physical Damage and ${firePlayed} Fire Damage was dealt to ${target.name}`);
                
                target.strengthTurn -= reduceTargetStrengthPlayed;
                target.armor -= reduceTargetArmorPlayed;
                target.poison += poisonPlayed;
                target.health -= damageTotal;
            } 
            // NB! Dont use "else" here
            // ADD all cards that increase strength for the rest of the fight
            if (card.key === 'seppuku' || card.key === 'boneShredder') { 
                gameState.player.strengthBase += strengthPlayed;

            } else {
                gameState.player.strengthCard += strengthPlayed;
            }
            activateSpecialCards(target, card, gameState.costPlayed);
        
            if (healPlayed) {
                gameState.player.health = Math.min(gameState.player.health + healPlayed, gameState.player.healthMax);
                self.updateHealthBar(gameState.player);
            }
            
            gameState.player.armorCard += armorPlayed;
            gameState.player.poison = Math.max(0, gameState.player.poison - poisonRemovePlayed);

            addTextAndTweens(damageTotal, poisonPlayed, strengthPlayed, armorPlayed, poisonRemovePlayed);

            if (gameState.player.stancePoints + stancePointsPlayed >= -3 && gameState.player.stancePoints + stancePointsPlayed <= 3) {
                gameState.player.stancePoints += stancePointsPlayed;
                self.updateStanceBar(gameState.player); 
            }

            gameState.player.freedomAfterCardPlayed = gameState.player.stance === 'Freedom' ? true : false; 
            
            if (!gameState.player.freedomBeforeCardPlayed && gameState.player.freedomAfterCardPlayed) {
                gameState.player.mana += 1;
                gameState.player.manaMax += 1;
                self.updateManaBar(gameState.player);
            }

            // NB! These functions must run after Stance, Armor and Strength has been updated, and tweens have fired.
            updateStats(target);
            self.updateHealthBar(target);
            updateStrengthAndArmor(gameState.player);
            removeIfDead(target);
            checkGameOver();
            updateEnemyActions();
            drawNewCards(drawCardPlayed);

            gameState.enemies.forEach( enemy => {
                self.updateEnemyIntention(enemy);
            })

            //Give time for tweens to finnish before the next card is played
            self.time.delayedCall(260, () => {  
                gameState.playingCard = false;
            });  

            self.time.delayedCall(1500, () => {   
                if (gameState.actionText) fadeOutGameObject(gameState.actionText, 200);
                if (gameState.actionTextBackground) fadeOutGameObject(gameState.actionTextBackground, 200);
            });
        };

        function activateSpecialCards(target, card, costPlayed) {    
            if (card.key === 'dBeat') activateDBeat();
            if (card.key === 'bassSolo' && gameState.currentCards.length > 0) activateBassSolo();
            if (card.key === 'nenguStyle' && gameState.currentCards.length > 0) earnGold(1);
            if (card.key === 'coverCharge' && gameState.player.stancePoints > 1) earnGold(1);
            
            if (card.key === 'pissDrunkBastards' && target.health <= 18) {
                gameState.score.damageDealt += target.health;
                target.health = 0;
            }
            if (card.key === 'canibalize') {
                gameState.canibalizeCondition = true;
                gameState.powerUpSound.play({ volume: 0.15 });
                self.powerUpTweens(gameState.player);
            }
            if (card.key === 'zenZine') {
                gameState.player.healthMax += 2 * costPlayed;
                gameState.player.health += 2 * costPlayed;
                gameState.powerUpSound.play({ volume: 0.15 });
                self.updateHealthBar(gameState.player);
                self.powerUpTweens(gameState.player);
            }
            if (card.key === 'bloodOath') {
                gameState.player.manaMax += 1;
                gameState.player.mana += 1;
                gameState.player.manaBase += 1;
                gameState.player.health -= 4
                self.updateManaBar(gameState.player);

                if (gameState.player.alive) {
                    gameState.powerUpSound.play({ volume: 0.15 });
                    self.powerUpTweens(gameState.player);
                }
            }
            if (card.key === 'libertySpikes' && gameState.player.stancePoints > 0) {
                gameState.player.mana += 1;
                gameState.player.manaMax += 1;
                gameState.powerUpSound.play({ volume: 0.15 });
                self.updateManaBar(gameState.player);
                self.powerUpTweens(gameState.player);
            }
            if (card.key === 'noFuture') {
                gameState.noFutureCondition = true;
                gameState.player.healthMax += 5;
                gameState.player.health += 5;
                gameState.powerUpSound.play({ volume: 0.15 });
                self.powerUpTweens(gameState.player);
                self.updateHealthBar(target);
            }
        }

        function addTextAndTweens(damageTotal, poisonPlayed, strengthPlayed, armorPlayed, poisonRemovePlayed) {
            const actionTextConfig = { fontSize: '32px', fill: '#ff0000' };
            gameState.actionText = self.add.text(550, 300, "", actionTextConfig).setOrigin(0.5).setDepth(21);
            gameState.actionTextBackground = self.add.graphics(); 

            if (gameState.typePlayed === 'targetSelected' || gameState.typePlayed === 'targetAll') {                
                self.cameras.main.shake(100, .003, false);
                gameState.attackSound.play({ volume: 0.8 });
                const actionTextAttack = (damageTotal > 0) ?  `Deals ${damageTotal} damage`  : '';
                const actionTextPoison = (poisonPlayed > 0) ? `Deals ${poisonPlayed} Poison` : ''; 
                const actionTextTarget = (poisonPlayed > 0) ? `${actionTextAttack}\n\n${actionTextPoison}` : actionTextAttack;
                self.updateTextAndBackground(gameState.actionText, gameState.actionTextBackground, actionTextTarget);
                self.attackTweens(gameState.player, 60);
                
            } else if (strengthPlayed > 0) {
                gameState.powerUpSound.play({ volume: 0.15 });
                const actionTextContent = `Gains ${strengthPlayed} Strength`;
                self.updateTextAndBackground(gameState.actionText, gameState.actionTextBackground, actionTextContent);
                self.powerUpTweens(gameState.player);

            } else if (armorPlayed > 0) {
                gameState.powerUpSound.play({ volume: 0.15 });
                const actionTextContent = `Gains ${armorPlayed} Armor`;
                self.updateTextAndBackground(gameState.actionText, gameState.actionTextBackground, actionTextContent);
                self.powerUpTweens(gameState.player);

            } else if (poisonRemovePlayed > 0) {
                gameState.powerUpSound.play({ volume: 0.15 });
                const actionTextContent = `Heals ${poisonRemovePlayed} Poison`;
                self.updateTextAndBackground(gameState.actionText, gameState.actionTextBackground, actionTextContent);
                self.powerUpTweens(gameState.player);
            }
        }

        function getValueOrInvoke(cardProperty) {
            return typeof cardProperty === 'function' ? cardProperty() : cardProperty;
        }
        
        function normalizeCard(card, target, isLastEnemy = false) {
            const stancePoints = gameState.player.stancePoints;

            const moshpitMassacreCondition = (card.key === 'moshpitMassacre' && stancePoints > 0 && target.poison > 0);
            const scorchedSoulCondition = (card.key === 'scorchedSoul' && target.poison > 0);
            const bladesBlightCondition = (card.key === 'bladesBlight' && target.poison > 0);
            const rottenResonanceCondition = (card.key === 'rottenResonance' && target.poison === 0);
            const roninsRotCondition = (card.key === 'roninsRot' && target.poison > 0);
            const kabutuEdoCondition = (card.key === 'kabutu' && gameState.edoEruption && stancePoints > 0);
            const steelToeCondition = (card.key === 'combatBoots' && gameState.steelToe);
            const knuckleFistEdoCondition = (card.key === 'knuckleFist' && gameState.edoEruption && stancePoints < 0)
            
            gameState.troopsOfTakamoriCondition = (card.key === 'troopsOfTakamori' ? true : false);
            
            const steelToeOutcome = stancePoints > 0 ? 2 * (1 + stancePoints) : 2;
            const rottenResonanceOutcome = rottenResonanceCondition ? 1 : 0    

            return {
                damagePlayed: moshpitMassacreCondition ? 11 : getValueOrInvoke(card.damage),
                firePlayed: kabutuEdoCondition ? 2 * stancePoints : (scorchedSoulCondition ? 12 : getValueOrInvoke(card.fire)),
                stancePointsPlayed: kabutuEdoCondition && isLastEnemy ? -1 : getValueOrInvoke(card.stancePoints),
                poisonPlayed: bladesBlightCondition ? target.poison : getValueOrInvoke(card.poison) + rottenResonanceOutcome,
                healPlayed: getValueOrInvoke(card.heal),
                strengthPlayed: getValueOrInvoke(card.strength),
                armorPlayed: knuckleFistEdoCondition ? - stancePoints : getValueOrInvoke(card.armor),
                reduceTargetArmorPlayed: steelToeCondition ? steelToeOutcome : getValueOrInvoke(card.reduceTargetArmor),
                reduceTargetStrengthPlayed: roninsRotCondition ? target.poison : getValueOrInvoke(card.reduceTargetStrength),
                drawCardPlayed: getValueOrInvoke(card.drawCard),
                poisonRemovePlayed: getValueOrInvoke(card.poisonRemove)
            };
        }
        
        function activateDBeat() {
            if (gameState.discardPile.length > 0) {
                const discardImages = []
                const cardsPerRow = gameState.discardPile.length < 12 ? 4 : 6;
                const cardSpacing = 105;
                const startX = gameState.discardPile.length < 12 ? 400 : 250;
                const startY = 150;
                
                gameState.discardPile.forEach( (card, index) => {
                    let cardX = startX + (index % cardsPerRow) * cardSpacing;
                    let cardY = startY + Math.floor(index / cardsPerRow) * 1.5 * cardSpacing;

                    let cardImage = self.add.image(cardX, cardY, card.key).setScale(0.27).setDepth(200).setInteractive();
                    discardImages.push(cardImage);
                    cardImage.on('pointerup', () => {
                        if (gameState.player.stancePoints > 0) {
                            card.dBeat = true;
                        }
                        fadeOutGameObject(cardImage, 300)
                        self.time.delayedCall(400, () => {   
                            discardImages.forEach( image => {
                                image.destroy()
                            })
                            gameState.discardPile.splice(gameState.discardPile.indexOf(card), 1);
                            gameState.drawPile.push(card)
                            drawNewCards(1)
                        })
                        
                    })
                })
            }
        }

        function activateBassSolo() {
            const randomIndex = Math.floor(Math.random() * gameState.currentCards.length);
            const randomCard = gameState.currentCards[randomIndex];
            fadeOutGameObject(randomCard.sprite, 250);
            gameState.currentCards = gameState.currentCards.filter(c => c != randomCard);
            if (card.type !== 'debuff') gameState.discardPile.push(randomCard);
        }
        
        gameState.endOfTurnButton.on('pointerup', function () {
            gameState.currentEnemyIndex = 0; 
            if (gameState.targetingCursor.visible || !gameState.playersTurn) {
                self.cameras.main.shake(70, .002, false);

            } else {    
                this.setTexture('rectangularButtonPressed');
                this.removeInteractive();
                gameState.buttonPressedSound.play();
                gameState.endOfTurnButtonPressed = true;
                gameState.redrawEnabled = false;
                addHandtoDeck();
                updateStrengthAndArmor(gameState.player);
                updateEnemyActions();

                // adds health if rebelHeart is active
                if (gameState.rebelHeart) { 
                    gameState.player.health = Math.min(gameState.player.healthMax, gameState.player.health + Math.abs(gameState.player.stancePoints) );
                    self.updateHealthBar(gameState.player);
                }

                gameState.enemies.forEach( enemy => {
                    enemy.turnComplete = enemy.alive ? false : true;
                    fadeOutGameObject(enemy.intentionText, 200);
                    fadeOutGameObject(enemy.intentionBackground, 200);
                })

                if (gameState.player.mana != 0) {
                    gameState.player.mana = 0;
                    self.updateManaBar(gameState.player);
                }

                self.time.delayedCall(100, () => {   
                    if (gameState.actionText) gameState.actionText.destroy();
                    if (gameState.actionTextBackground) gameState.actionTextBackground.destroy();
                    initiateEnemiesTurn();
                });
            }
        });

        function initiateEnemiesTurn() {
            if (gameState.enemies.length === 0) return;

            if (gameState.enemies[gameState.currentEnemyIndex].alive) {
                startEnemyTurn(gameState.enemies[gameState.currentEnemyIndex]);

            } else {
                gameState.currentEnemyIndex++;
                initiateEnemiesTurn();
            }
        }    

    
    // ---------------------------------- ENEMY'S TURN -------------------------------------      
     
        function startEnemyTurn(enemy) {

            // The conditional ensures that "Enemy turn" is only declared when the first enemy starts their turn.
            if (gameState.playersTurn) { 
                gameState.playersTurn = false;
                const enemyTurnTextContent = "Enemy's turn!"
                enemy.turnText = self.add.text(550, 300, enemyTurnTextContent, { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5).setDepth(21);
                const enemyTurnTextBackground = self.add.graphics();
                self.updateTextAndBackground(enemy.turnText, enemyTurnTextBackground, enemyTurnTextContent);               
                const enemyTurnTexts = [enemy.turnText, enemyTurnTextBackground]
                
                if (gameState.canibalizeCondition) {
                    const stolenHealth = Math.floor(gameState.player.lifeSteal);
                    const newHealthDefault = gameState.player.health + stolenHealth;
                    const stolenHealthRealized = newHealthDefault < gameState.player.healthMax ? stolenHealth : gameState.player.healthMax - roundgameState.player.health;
                    gameState.player.health += stolenHealthRealized;
                    self.updateHealthBar(gameState.player);
                    gameState.canibalizeCondition = false;
                    gameState.player.lifeSteal = 0;

                    const lifeStealTextContent = `You stole ${stolenHealthRealized} HP`
                    const lifeStealText = self.add.text(550, 380, lifeStealTextContent, { fontSize: '30px', fill: '#ff0000' }).setOrigin(0.5);
                    const lifeStealTextBackground = self.add.graphics();
                    self.updateTextAndBackground(lifeStealText, lifeStealTextBackground, lifeStealTextContent);       
                    enemyTurnTexts.push(lifeStealText, lifeStealTextBackground);
                }

                self.time.delayedCall(1700, () => {
                    enemyTurnTexts.forEach( text => {
                        fadeOutGameObject(text, 100);
                    })
                }) 
            }
            
            enemy.turnComplete = false;
            performEnemyAction(enemy);           
        }

        function performEnemyAction(enemy) {

            enemy.poisonText = self.add.text(570, 320, '', {fontSize: '30px', fill: '#ff0000'}).setOrigin(0.5).setDepth(21);
            enemy.poisonTextBackground = self.add.graphics();
            updatePoison(enemy);

            if (gameState.toxicAvenger && enemy.poison > 0) {
                updateStats(enemy);
            };
        
            const delaytime = (enemy.poisonText._text === '' && !enemy.turnText) ? 700 : 1800;
        
            self.time.delayedCall(delaytime, () => {
                fadeOutGameObject(enemy.poisonText);
                fadeOutGameObject(enemy.poisonTextBackground);

                // Perform the chosen action
                const chosenAction = enemy.chosenAction;
                const actionTextConfig = {fontSize: '32px', fill: '#ff0000'};
                gameState.actionText = self.add.text(550, 300, "", actionTextConfig).setOrigin(0.5).setDepth(21);
                gameState.actionTextBackground = self.add.graphics();
                
                gameState.player.poison += chosenAction.poison;
                enemy.health = Math.min(enemy.health + chosenAction.heal, enemy.healthMax);
                enemy.strengthBase = Math.min(enemy.strengthBase + chosenAction.strength, enemy.strengthMax);
                updateStats(enemy);
                enemy.armor = Math.min(enemy.armor + chosenAction.armor, enemy.armorMax);    
        
                if (chosenAction.damage > 0 || chosenAction.fire > 0 || chosenAction.poison > 0) {
                    const damageModifyer = (1 + 0.1 * enemy.strength) * (1 - gameState.player.armor / 20);
                    self.cameras.main.shake(120, .005, false);
                    gameState.attackSound.play({ volume: 0.8 });
                    console.log(`enemy.damageTotal: ${enemy.damageTotal}`);

                    enemy.damageTotal = Math.round( Math.max(0, chosenAction.fire + chosenAction.damage * damageModifyer) );
                    gameState.player.health -= enemy.damageTotal;
                    gameState.score.damageTaken += enemy.damageTotal;
                    let actionTextContent = chosenAction.poison > 0 ? chosenAction.text : `Deals ${enemy.damageTotal} damage`
                    self.updateTextAndBackground(gameState.actionText , gameState.actionTextBackground, actionTextContent);
                    
                    self.tweens.add({
                        targets: enemy.sprite,
                        x: enemy.sprite.x - 60,
                        duration: 120,
                        ease: 'Cubic',
                        yoyo: true
                    })
        
                } else if (chosenAction.heal > 0) {
                    gameState.healSound.play({ volume: 0.5 });
                    self.updateTextAndBackground(gameState.actionText, gameState.actionTextBackground, chosenAction.text);
                    self.powerUpTweens(enemy);
                    
        
                } else if (chosenAction.strength > 0 || chosenAction.armor > 0)  {
                    gameState.powerUpSound.play({ volume: 0.2 });
                    self.updateTextAndBackground(gameState.actionText, gameState.actionTextBackground, chosenAction.text);
                    self.powerUpTweens(enemy);
                }
        
                // NB! enemy.strengthTurn must be reset before concludeEnemyAction() (or an extra call to updateStats() will be required)
                enemy.strengthTurn = 0; 
                concludeEnemyAction(enemy);
            })
        }

        function concludeEnemyAction(enemy) {
            [gameState.player, enemy].forEach(character => {
                self.updateHealthBar(character);
                removeIfDead(character);
                updateStats(character);
            })
            
            self.time.delayedCall(1300, () => {
                if (gameState.actionText) fadeOutGameObject(gameState.actionText, 200);
                if (gameState.actionTextBackground) fadeOutGameObject(gameState.actionTextBackground, 200);
                enemy.turnComplete = true;
        
                if (!checkGameOver()) {
                    // if the last enemy completed their turn or is not alive
                    if (gameState.enemies[gameState.currentEnemyIndex].turnComplete || !gameState.enemies[gameState.currentEnemyIndex].alive) {
                        gameState.currentEnemyIndex++;
                        if (gameState.currentEnemyIndex < gameState.enemies.length) {
                            initiateEnemiesTurn();
                        } else {
                            gameState.currentEnemyIndex = 0;
                            startPlayerTurn();
                        }
                    }
                }
            })
        };

        function updateEnemyActions() {

            if (gameState.turn === 1) {
                gameState.enemy1.actions = [
                    {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 7, text: 'Gains 7 armor', probability: 1},
                ] 

            } else if (gameState.turn === 2) {
                gameState.enemy1.actions = [
                    {key: () => `Intends to\nDeal ${Math.round(12 * (1 + 0.10 * gameState.enemy1.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 12, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 12 damage', probability: 1},
                ]
                
            } else if (gameState.turn === 3) {
                gameState.enemy1.actions = [
                    {key: () => `Intends to\nDeal ${Math.round(15 * (1 + 0.10 * gameState.enemy1.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 15, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 15 damage', probability: 1},
                ]
        
            } else {

                gameState.enemy1.actions = [ 
                    {key: `Intends to\nDeal 5 fire damage`, damage: 0, fire: 5, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: `Deals 5 fire damage`, probability: 0.10 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
                    {key: () => `Intends to\nDeal ${Math.round(12 * (1 + 0.10 * gameState.enemy1.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 12, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 12 damage', probability: 0.27 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
                    {key: () => `Intends to\nDeal ${Math.round(17 * (1 + 0.10 * gameState.enemy1.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 17, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 17 damage', probability: 0.18 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
                    {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 15, poisonRemove: 0, strength: 0, armor: 2, text: 'Heals 15 HP\nGains 2 armor', probability: (gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0 : 0.17},
                    {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 25, poisonRemove: 0, strength: 0, armor: 1, text: 'Heals 25 HP\nGains 1 armor', probability: (gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0 : 0.06},
                    {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 4, armor: 0, text: 'Gains 4 strenght', probability: 0.12 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
                    {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, text: 'Gains 5 armor', probability: 0.10 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
                    {key: `Intends to\nPoison you`, damage: 0, fire: 0, poison: 5, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 5 poison', probability: 0.00}
                ]
            }  
        }

        function normalizeProbabilities(enemy) {
            const totalProbability = enemy.actions.reduce((sum, action) => sum + action.probability, 0);
        
            if (totalProbability !== 1) {
                const scalingFactor = 1 / totalProbability;
                for (let action of enemy.actions) {
                    action.probability *= scalingFactor;
                }
            }
        }
        
        function selectEnemyAction(enemy) {
            normalizeProbabilities(enemy);
                        
            let cumProb = 0;
            for(let i = 0; i < enemy.actions.length; i++) {
                cumProb += enemy.actions[i].probability;
                enemy.actions[i].cumulativeProbability = cumProb;
            }
        
            const rand = Math.random();
            enemy.chosenAction = enemy.actions.find(action => rand < action.cumulativeProbability);
        }    
   
    
        // ---------------------------------- END OF GAME -------------------------------------      
    
    
        function checkGameOver() {  

            if (!gameState.player.alive) {
                gameState.playersTurn = false;
                initiateDefeat();
                return true;
            
            } else if (!gameState.enemies.some( enemy => enemy.alive)) {
                gameState.playersTurn = false;
                initiateVictory();
                return true;

            } else {
                return false;
            }   
        }

        function initiateDefeat() {
            gameState.player.health = 0; // Avoids negative life
            self.updateManaBar(gameState.player);
            addHandtoDeck();
            fadeOutGameObject(gameState.actionText, 200);
            fadeOutGameObject(gameState.actionTextBackground, 200); 
            gameState.music.stop();
            gameState.endOfTurnButton.destroy();

            gameState.score.numberOfTurns += gameState.turn;

            gameState.gameOverText = self.add.text(550, 300, ' Defeat!', { fontSize: '100px', fill: '#ff0000', fontFamily: 'Rock Kapak' }).setOrigin(0.5);
            gameState.gameOverText.setInteractive();
            let scenetransitionstarted = false;

            self.time.delayedCall(400, () => {
                gameState.musicTheme.play( { loop: true, volume: 0.30 } );

                if (!scenetransitionstarted) {
                    gameState.gameOverText.on('pointerup', () => {
                        scenetransitionstarted = true;
                        self.scene.start('Endscene');
                    });

                    self.time.delayedCall(2400, () => {
                        scenetransitionstarted = true;
                        self.scene.start('Endscene');
                    });
                }
            })     
        };
        
        function initiateVictory() {
            gameState.score.numberOfTurns += gameState.turn;
            gameState.score.levelsCompleted += 1;
            gameState.music.stop();
            self.updateManaBar(gameState.player);
            addHandtoDeck();

            gameState.deck.forEach(card => {
                if (card.usedOneShot) {
                    card.usedOneShot = false;
                }
                if (card.type === 'debuff') {
                    gameState.deck = gameState.deck.filter(c => c != card);
                }      
            })
            
            self.time.delayedCall(600, () => {
                if (gameState.attackSound.isPlaying) {
                    gameState.attackSound.stop();
                }
                if (gameState.gundanSeizai && gameState.player.gold < gameState.player.goldMax) {
                    earnGold(1);
                }
                gameState.victorySound.play( { volume: 0.9, rate: 1, seek: 0.05 } );
                self.clearBoard();
            })
        
            if (gameState.actionText) fadeOutGameObject(gameState.actionText, 200);
            if (gameState.actionTextBackground) fadeOutGameObject(gameState.actionTextBackground, 200);

            const victoryTextConfig = { fontSize: '100px', fill: '#ff0000', fontFamily: 'Rock Kapak' };
            const victoryText = self.add.text(550, 300, "Victory!", victoryTextConfig).setOrigin(0.5).setDepth(21);
            
            self.time.delayedCall(1600, () => {
                gameState.musicTheme.play( { loop: true, volume: 0.30 } );
                victoryText.destroy();
                chooseReward();
            })
        }
        
        function chooseReward() {
            const rewardTextConfig = { fontSize: '22px', fill: '#000000' };
            const goldAmount = 3;
            const y = 250;
            const spacing = 100;
            gameState.goldCollected = false;

            const gameOverTextContent = '  Collect loot and get\nready for your next fight!';
            const gameOverTextConfig = { fontSize: '40px', fill: '#ff0000' };
            const gameOverText = self.add.text(550, 130, gameOverTextContent, gameOverTextConfig).setOrigin(0.5).setDepth(103);
            const gameOverTextBackground = self.add.graphics();
            self.updateTextAndBackground(gameOverText, gameOverTextBackground, gameOverTextContent);

            gameState.rewardCollectGoldButton = self.add.image(550, y, 'rectangularButton');
            gameState.rewardCollectGoldText = self.add.text(550, y, `Collect ${goldAmount} Gold`, rewardTextConfig).setOrigin(0.5).setDepth(103);

            gameState.enterShopButton = self.add.image(550, y + spacing, 'rectangularButton');
            gameState.enterShopText = self.add.text(550, y + spacing, `Enter Shop`, rewardTextConfig).setOrigin(0.5).setDepth(103);
            
            gameState.rewardAddCardsButton = self.add.image(550, y + spacing * 2, 'rectangularButton');
            gameState.rewardAddCardsText = self.add.text(550, y + spacing * 2, 'Collect free card\n  and continue', rewardTextConfig).setOrigin(0.5).setDepth(103);
 
            gameState.rewardButtons = [gameState.rewardCollectGoldButton, gameState.enterShopButton, gameState.rewardAddCardsButton];
            const rewardTexts = [gameState.rewardCollectGoldText,  gameState.enterShopText, gameState.rewardAddCardsText];

            gameState.rewardButtons.forEach(button => {
                configureButton(button, 103, 1.1, 0.7);
            }); 

            gameState.rewardCollectGoldButton.on('pointerup', function() {
                if (!gameState.goldCollected) {
                    gameState.goldCollected = true;
                    earnGold(goldAmount);

                } else {
                    self.cameras.main.shake(50, .0015, false);
                };
            })

            gameState.enterShopButton.on('pointerup', function() {
                gameState.enterShopButton.setTexture('rectangularButtonPressed');
                gameState.rewardButtons.forEach(button => {
                    button.removeInteractive();
                });
                initiateShop();
            })

            gameState.rewardAddCardsButton.on('pointerup', function() {
                gameState.rewardButtons.forEach(button => button.setDepth(1));
                const gameOverObjects = [...gameState.rewardButtons, ...rewardTexts, gameOverText, gameOverTextBackground];
                console.log("Destroying objects:", gameOverObjects);
                gameOverObjects.forEach(object => {
                    object.destroy();
                    console.log(`gameOverObjects.length: ${gameOverObjects.length}`);
                })
                gameState.endGameMenyExited = true;
                pickCardAndAddToDeck();
            })
        }

        function pickCardAndAddToDeck(depth=102) {
            const x = 340;
            const y = 340;
            const spacing = 210;
            const redrawCost = 1;

            self.shuffleDeck(gameState.bonusCards);
            let bonusCards = gameState.bonusCards.splice(0, 3);

            if (gameState.latestDraw) { 
                gameState.latestDraw.forEach(card => {
                    gameState.bonusCards.push(card);
                });
            };
            gameState.latestDraw = [...bonusCards];
       
            bonusCards.forEach( (bonusCard, index) => {
                console.log(`bonusCard.key: ${bonusCard.key}`)
                bonusCard.sprite = self.add.image(x + index * spacing, y, bonusCard.key);
                bonusCard.sprite.setScale(0.45).setInteractive().setDepth(depth);

                bonusCard.sprite.on('pointerover', () => {
                    gameState.cardsDealtSound.play({ volume: 0.6, seek: 0.10 });
                    self.cardTweens(bonusCard.sprite, 0.58, 200);
                }, self);
                
                bonusCard.sprite.on('pointerout', () => {
                    self.cardTweens(bonusCard.sprite, 0.45, 400);
                }, self);
        
                bonusCard.sprite.on('pointerup', () => {
                    gameState.nextlevelstarting = false;
                    const bonusCardCopy = Object.assign({}, bonusCard); // make a shallow copy to avoid multiple copies on hand refering to the same object
                    gameState.deck.push(bonusCardCopy);
        
                    // Remove all non-selected card sprites
                    bonusCards.forEach( card => {
                        card.sprite.removeInteractive(); 
                        if (card !== bonusCard) {
                            fadeOutGameObject(card.sprite, 200);
                        }
                    })

                    gameState.latestDraw.forEach(card => { // Avoids adding selected permanents back into bonusCards
                        if (card === bonusCard && card.type === 'permanent') {
                            gameState.latestDraw = gameState.latestDraw.filter(c => c != bonusCard);
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
                    });

                    if (gameState.redrawButtonObjects) {
                        gameState.redrawButtonObjects.forEach( object => {
                            fadeOutGameObject(object, 200);
                        })
                    }
                    
                    const gainedCardTextContent = "Gained 1 card";
                    const textConfig = {fontSize: '40px', fill: '#000000'};
                    const gainedCardText = self.add.text(550, 180, gainedCardTextContent, textConfig).setOrigin(0.5).setDepth(211);
                    const gainedCardTextBackground = self.add.graphics();
                    self.updateTextAndBackground(gainedCardText, gainedCardTextBackground, gainedCardTextContent, 7, 210);
                    
                    if (gameState.endGameMenyExited) {
                        initiateNextLevel()
                    }

                    else {
                        gainedCardText.destroy();
                        gainedCardTextBackground.destroy();
                        self.time.delayedCall(350, () => {
                            fadeOutGameObject(bonusCard.sprite, 200);

                            self.time.delayedCall(200, () => { //Enable shop buttons after fadeOut animation is completed
                                if (gameState.shopButtonPressed) {
                                    gameState.shopButtonPressed = false;
                                }
                            });

                        })
                    }
                })
            })
            initiateRedrawCardsButton(y, redrawCost, bonusCards, depth);
        }

        function pickCardAndRemoveFromDeck(depth=220) {
            const deck = gameState.deck;
            const spacing = 120;          
            const cardsPerRow = deck.length < 12 ? 4 : 6;
            const x = deck.length < 12 ? 400 : 250;
            const y = 250;
                    
        
            deck.forEach((deckCard, index) => {
                let xPos = x + (index % cardsPerRow) * spacing;
                let yPos = y + Math.floor(index / cardsPerRow) * spacing;
                let cardDepth = depth + index;
                
                deckCard.sprite = self.add.image(xPos, yPos, deckCard.key).setScale(0.27).setInteractive().setDepth(cardDepth);
        
                deckCard.sprite.on('pointerover', function() {
                    gameState.cardsDealtSound.play({ volume: 0.6 });
                    self.cardTweens(deckCard.sprite, 0.40, 200);
                    deckCard.sprite.setDepth(250);
                }, this);
        
                deckCard.sprite.on('pointerout', function() {
                    self.cardTweens(deckCard.sprite, 0.27, 400);
                    deckCard.sprite.setDepth(cardDepth);
                }, this);
        
                deckCard.sprite.on('pointerup', function() {
                    console.log(`Deck length before removal: ${gameState.deck.length}`);
                    deck.splice(deck.indexOf(deckCard), 1);
        
                    deck.forEach( (card) => {
                        card.sprite.removeInteractive(); 
                        if (card !== deckCard) {
                            fadeOutGameObject(card.sprite, 200);
                        }
                    });
        
                    self.tweens.add({
                        targets: deckCard.sprite,
                        x: self.cameras.main.centerX,
                        y: self.cameras.main.centerY + 100,
                        scaleX: 0.6,
                        scaleY: 0.6,
                        duration: 1000,
                        ease: 'Power2',
                    });

                    self.time.delayedCall(600, () => {
                        fadeOutGameObject(deckCard.sprite, 250);
                    })
        
                    const removedCardTextContent = 'Removed 1 card';
                    const removedCardText = self.add.text(550, 180, removedCardTextContent, { fontSize: '40px', fill: '#000000' }).setOrigin(0.5).setDepth(211);
                    const removedCardTextBackground = self.add.graphics();
                    self.updateTextAndBackground(removedCardText, removedCardTextBackground, removedCardTextContent, 7, 210);
                    gameState.shopButtonPressed = false;
                    
                    self.time.delayedCall(1000, () => {
                        removedCardText.destroy();
                        removedCardTextBackground.destroy();
                    })
                })
            })
        }

        function initiateRedrawCardsButton(y, redrawCost, bonusCards, depth) {
            const rewardTextConfig = { fontSize: '23px', fill: '#000000' };
            const redrawCardsButton = self.add.image(550, y+220, 'rectangularButton');
            const redrawCardsText = self.add.text(550,  y+220, `   Redraw\nCost: ${redrawCost} Gold`, rewardTextConfig).setOrigin(0.5).setDepth(202);
            gameState.redrawButtonObjects = [redrawCardsButton, redrawCardsText];
            configureButton(redrawCardsButton, 201);

            redrawCardsButton.on('pointerup', function() {
                if (gameState.player.gold >= redrawCost) {
                    spendGold(redrawCost)
                    gameState.redrawButtonObjects.forEach(object => {
                        object.destroy();
                    })
                    bonusCards.forEach(card => {
                        if (card.sprite) {
                            card.sprite.destroy();
                        }
                    })
                    pickCardAndAddToDeck(depth);
                } else {
                    self.cameras.main.shake(50, .0015, false);
                };
            })
        }
        
        function initiateNextLevel() {
            self.time.delayedCall(2500, () => {
                if (!gameState.nextlevelstarting) {
                    gameState.nextlevelstarting = true;
                    startNextLevel();
                };    
            });

            self.input.on('pointerup', () => {
                if (!gameState.nextlevelstarting) {
                    gameState.nextlevelstarting = true;
                    startNextLevel();
                };
            });
        }

        function startNextLevel() {
            let nextLevel;
            for (let i = 0; i < gameState.levels.length; i++) {
                if (self.scene.key === gameState.levels[i]) {
                    if (i + 1 < gameState.levels.length) {
                        nextLevel = gameState.levels[i + 1];
                    } else {
                        nextLevel = 'Endscene'
                    }
                    break;
                }
            }
            
            if (nextLevel) {
                self.cameras.main.fadeOut(1000);
                self.time.delayedCall(1000, () => {
                    self.scene.start(nextLevel);
                });
            } else {
                console.error('Current level not found in gameState.levels');
            }
        }

        function configureButton(button, depth, x=1.1, y=0.9) {
            button.setScale(x, y).setOrigin(0.5).setDepth(depth);        
            if (button != gameState.rewardCollectGoldButton || !gameState.goldCollected) {
                button.setInteractive();
                button.on('pointerover', function() {
                    button.setTexture('rectangularButtonHovered');
                });
                button.on('pointerout', function() {
                    button.setTexture('rectangularButton');
                });

            } else {
                button.removeInteractive();
                button.setTexture('rectangularButtonPressed');
            }
        }

        function initiateShop() {
            self.cameras.main.shake(100, .0015, false);
            self.cameras.main.flash(350);
        
            self.time.delayedCall(150, () => {
                gameState.shopBackground = self.add.image(0, 0, 'shop1').setScale(0.80).setOrigin(0.02, 0).setDepth(200);
                enterShop();
            });
        }

        function enterShop() {
            const x = 170;
            const y = 280;
            const spacing = 80;
            const healAmount = 8;
            const healCost = 2;
            const addCardCost = 2
            const removeCardCost = 3
            const textConfig = { fontSize: '50px', fill: '#ff0000' };
            const buttonTextConfig = { fontSize: '17px', fill: '#000000' };
            gameState.shopButtonPressed = false

            const shopHealButton = self.add.image(x, y, 'rectangularButton');
            const shopHealText = self.add.text(x, y, ` Gain ${healAmount} HP\nCost: ${healCost} Gold`, buttonTextConfig);
            const shopAddCardButton = self.add.image(x, y + spacing * 1, 'rectangularButton');
            const shopAddCardText = self.add.text(x, y + spacing * 1, ` Buy 1 Card\nCost: ${addCardCost} Gold`, buttonTextConfig);

            const shopRemoveCardButton = self.add.image(x, y + spacing * 2, 'rectangularButton')
            const shopRemoveCardText = self.add.text(x, y + spacing * 2, `Deplete 1 card\n Cost: ${removeCardCost} Gold`, buttonTextConfig);

            const shopExitButton = self.add.image(x, y + spacing * 3, 'rectangularButton');
            const shopExitText = self.add.text(x, y + spacing * 3, `Exit Shop`, buttonTextConfig);
            
            let buyTexts = []
            const shopButtons = [shopHealButton, shopExitButton, shopAddCardButton, shopRemoveCardButton];
            const shopTexts = [shopHealText, shopExitText, shopAddCardText, shopRemoveCardText];
            let shopObjects = [...shopButtons, ...shopTexts, gameState.shopBackground];
            
            shopButtons.forEach(button => {
                if (!gameState.shopButtonPressed) {
                    button.setInteractive().setScale(0.9, 0.6).setOrigin(0.5).setDepth(201);
                    button.on('pointerover', function() {
                        button.setTexture('rectangularButtonHovered');
                    });
                    button.on('pointerout', function() {
                        button.setTexture('rectangularButton');
                    });
                }
            })

            shopTexts.forEach(text => text.setOrigin(0.5).setDepth(202))

            welcomeToShop()
            shopObjects.push(gameState.shopWelcomeText, gameState.shopTextBackground)

            // Buy HP
            shopHealButton.on('pointerup', function() {
                if (gameState.player.gold >= healCost && !gameState.shopButtonPressed && gameState.player.health < gameState.player.healthMax) {
                    gameState.shopButtonPressed = true
                    shopButtons.forEach(button => button.removeInteractive());
                    shopHealButton.setTexture('rectangularButtonPressed');
                    spendGold(healCost);
                    gameState.player.health = Math.min(gameState.player.health + healAmount, gameState.player.healthMax);
                    
                    self.time.delayedCall(200, () => {
                        shopButtons.forEach(button => button.setInteractive());
                    })

                    buyTexts.forEach(text => {
                        if (text) text.destroy();
                    });
                    
                    const textContent = `    You bought ${healAmount} HP\nTotal health: ${gameState.player.health}/${gameState.player.healthMax}`;
                    const boughtHealthText = self.add.text(550, 150, textContent, textConfig).setOrigin(0.5).setDepth(205);
                    console.log(`health: ${gameState.player.health}\nhealthMax: ${gameState.player.healthMax}`);
                    const boughtHealthTextBackground = self.add.graphics();
                    buyTexts.push(boughtHealthText, boughtHealthTextBackground);
                    shopObjects.push(boughtHealthText, boughtHealthTextBackground);
                    self.updateTextAndBackground(boughtHealthText, boughtHealthTextBackground, textContent, 7, 204);
                    
                    self.time.delayedCall(2000, () => {
                        if (boughtHealthText) {
                            buyTexts = buyTexts.filter( text => text != boughtHealthText && text != boughtHealthTextBackground);
                            shopObjects = shopObjects.filter( text => text != boughtHealthText && text != boughtHealthTextBackground);
                            boughtHealthText.destroy();
                            boughtHealthTextBackground.destroy();
                        }
                    })
                    gameState.shopButtonPressed = false
                
                } else {
                    self.cameras.main.shake(50, .0015, false);
                };
            })            

            // Buy New Card
            shopAddCardButton.on('pointerup', function() {
                if (gameState.player.gold >= addCardCost && !gameState.shopButtonPressed) {
                    gameState.shopButtonPressed = true;
                    shopButtons.forEach(button => button.removeInteractive());
                    shopAddCardButton.setTexture('rectangularButtonPressed');
                    spendGold(addCardCost);

                    buyTexts.forEach(text => {
                        if (text) text.destroy();
                    });

                    pickCardAndAddToDeck(210);

                    self.time.delayedCall(200, () => {
                        shopButtons.forEach(button => button.setInteractive())
                    })

                } else {
                    self.cameras.main.shake(50, .0015, false);
                };
            })

            shopRemoveCardButton.on('pointerup', function() {
                if (gameState.player.gold >= removeCardCost && !gameState.shopButtonPressed && gameState.deck.length > gameState.minDeckSize) {
                    gameState.shopButtonPressed = true;
                    shopButtons.forEach(button => button.removeInteractive());
                    shopAddCardButton.setTexture('rectangularButtonPressed');
                    spendGold(removeCardCost);

                    buyTexts.forEach(text => {
                        if (text) text.destroy();
                    });

                    pickCardAndRemoveFromDeck();

                    self.time.delayedCall(200, () => {
                        shopButtons.forEach(button => button.setInteractive())
                    })

                } else {
                    self.cameras.main.shake(50, .0015, false);
                };
            })

            // Exit shop
            shopExitButton.on('pointerup', function() {
                if (!gameState.shopButtonPressed) {
                    gameState.shopButtonPressed = true;
                    shopButtons.forEach(button => button.removeInteractive());
                    self.cameras.main.shake(100, .001, false); 
                    self.cameras.main.flash(300);

                    if (gameState.redrawButtonObjects) {
                        gameState.redrawButtonObjects.forEach( object => {
                            fadeOutGameObject(object, 200);
                        })
                    }

                    self.time.delayedCall(250, () => {
                        shopObjects.forEach(object => {
                            if (object) object.destroy();
                        });
                        self.time.delayedCall(100, () => { // Add some delay before reactivating buttons.
                            gameState.rewardButtons.forEach(button => button.setInteractive());
                        })
                    });

                } else {
                    self.cameras.main.shake(50, .0015, false);
                };
            })
        }

        function welcomeToShop() {
            const fullText = "Welcome to my shop";
            let currentText = "";
            gameState.shopWelcomeText = self.add.text(550, 60, currentText, { fontSize: '40px', fill: '#000000' }).setOrigin(0.5).setDepth(202);
            gameState.shopTextBackground = self.add.graphics();
    
            // Loop based on the length of the text
            for (let i = 0; i < fullText.length; i++) {
                self.time.delayedCall(i * 30, () => {
                    currentText += fullText[i];
                    gameState.shopWelcomeText.setText(currentText);
                    self.updateTextAndBackground(gameState.shopWelcomeText, gameState.shopTextBackground, currentText, 7, 201);
                });
            }
        }

        function earnGold(goldAmount) {    
            for (let i = 1; i <= goldAmount; i++) {
                self.time.delayedCall(i * 75, () => {
                    gameState.player.gold = Math.min(gameState.player.gold + 1, gameState.player.goldMax);
                    gameState.goldCounter.setText(gameState.player.gold);
                    gameState.coinSound.play({ volume: 0.8, seek: 0.02 });
                });
            }
        }
    
        function spendGold(cost) {
                for (let i = 1; i <= cost; i++) {
                    self.time.delayedCall(i * 75, () => {
                        gameState.player.gold -= 1;
                        gameState.goldCounter.setText(gameState.player.gold);
                    });
                }
        }

    // ---------------------------------- PERMANENTS-------------------------------------      

        
        function addPermanent(card) {       
            const slot = gameState.permanentSlots.find(slot => slot.available);

            // NB!! Add all cards that are not depleted upon use to the conditional!!
            if (card.key === 'kamishimoUberAlles' || card.key === 'hollidayInKamakura' ) {
                gameState.discardPile.push(card);
                gameState.discardPileText.setText(gameState.discardPile.length);

            } else {
                    gameState.deck = gameState.deck.filter(c => c !== card);
            }

            // The conditional avoids error if no slots are available.
            if (slot) { 

                if (card != gameState.freePermanent) { // Only relevant for Level1Fight1
                    card.slot.available = true;
                    card.sprite.destroy();
                }

                card.tokenSprite = self.add.image(slot.x, slot.y, card.token).setScale(1).setDepth(210).setInteractive();
                slot.available = false;
                card.tokenSlot = slot;
                gameState.permanents.push({ card: card, slot: slot, tokenSprite: card.tokenSprite }); 

                displayTokenCard(card);
                activatePermanentFromToken(card);
            
            } else {
                activatePermanentFromHand(card);
            }
        } 
        
        function activatePermanentFromToken(card) {
            
            if (card.key === 'foreverTrue') {
                gameState.foreverTrue = true;

                card.tokenSprite.on( 'pointerup', () => {
                    // Deactivate tokens during the enemys turn
                    if (gameState.playersTurn) {
                        depleteForeverTrue(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                }) 
                

            } else if (card.key === 'rebelSpirit') {
                gameState.rebelSpirit = true;
                card.tokenSprite.on( 'pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteRebelSpirit(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })

            } else if (card.key === 'rebelHeart') {
                gameState.rebelHeart = true;

                card.tokenSprite.on( 'pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteRebelHeart(card);
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })

            } else if (card.key === 'bushido') {
                gameState.bushido = true;
                updateStrengthAndArmor(gameState.player);

                card.tokenSprite.on( 'pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteBushido(card);
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })

            } else if (card.key === 'toxicAvenger') {
                gameState.toxicAvenger = true;
                gameState.enemies.forEach(enemy => updateStats(enemy));

                card.tokenSprite.on( 'pointerup', () => {
                    if (gameState.playersTurn) { 
                        depleteToxicAvenger(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })

            } else if (card.key === 'kirisuteGomen') {
                gameState.player.strengthMax += 5;
                updateStrengthAndArmor(gameState.player);
            
                card.tokenSprite.on( 'pointerup', () => {
                    if (gameState.playersTurn && gameState.enemies.some(enemy => enemy.health < 30)) { 
                        depleteKirisuteGomen(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })

            } else if (card.key === 'toxicFrets') {
                gameState.toxicFrets = true;
                
                card.tokenSprite.on( 'pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteToxicFrets(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })

            } else if (card.key === 'ashenEncore') {
                gameState.ashenEncore = true;
                
                card.tokenSprite.on( 'pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteAshenEncore(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })

            } else if (card.key === 'edoEruption') {
                gameState.edoEruption = true;
                
                card.tokenSprite.on( 'pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteEdoEruption(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })
                
            } else if (card.key === 'steelToe') {
                gameState.steelToe = true;
                
                card.tokenSprite.on( 'pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteSteelToe(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                }) 

            } else if (card.key === 'gundanSeizai') {
                gameState.gundanSeizai = true;
                
                card.tokenSprite.on( 'pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteGundanSeizai(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })
                
            } else if (card.key === 'deadTokugawas') {
                gameState.redrawPrice = Math.max(0, gameState.redrawPrice - 1);
                
                card.tokenSprite.on( 'pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteDeadTokugawas(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })
                
            } else if (card.key === 'lustForLife') {
                let healCost = 1;
                const healAmount = 6
                const x = 900;
                const y = 150;
                const textConfig = { fontSize: '12px', fill: '#000000' };

                gameState.healButton = self.add.image(x, y, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();
                gameState.healText = self.add.text(x, y, 'Heal', { fontSize: '20px', fill: '#000000' }).setOrigin(0.5);

                gameState.healButton.on('pointerover', () => {
                    const textContent = `  Heal ${healAmount} HP\n Cost: ${healCost} gold`;
                    gameState.healButton.setTexture('rectangularButtonHovered');
                    gameState.healButtonDescriptionBackground = self.add.graphics();
                    gameState.healButtonDescriptionBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.8).setDepth(122);
                    gameState.healButtonDescriptionBackground.fillRoundedRect(x-65, y+30, 130, 40, 5);
                    gameState.healButtonDescriptionText = self.add.text(x, y+50, textContent, textConfig).setDepth(123).setOrigin(0.5, 0.5);
                });
                
                gameState.healButton.on('pointerout', () => {
                    gameState.healButton.setTexture('rectangularButton');
                    if (gameState.healButtonDescriptionBackground) gameState.healButtonDescriptionBackground.destroy();
                    if (gameState.healButtonDescriptionText) gameState.healButtonDescriptionText.destroy();
                });
                
                gameState.healButton.on('pointerup', () => {
                    if (gameState.player.gold >= healCost && gameState.playersTurn) {
                        spendGold(healCost) ;
                        healCost += 1;
                        gameState.player.health = Math.min(gameState.player.healthMax, gameState.player.health + healAmount);
                        self.updateHealthBar(gameState.player);
    
                        if (gameState.healButtonDescriptionText) {
                            const textContent = `  Heal ${healAmount} HP\n Cost: ${healCost} gold`;
                            gameState.healButtonDescriptionText.setText(textContent);
                        }
                    }
                })
                
                card.tokenSprite.on('pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteLustForLife(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })
                
            } else if (card.key === 'punksNotDead') {
                gameState.punksNotDeadCondition = true;
                gameState.punksNotDeadCard = card;

                card.tokenSprite.on('pointerup', () => {
                    if (gameState.playersTurn) {
                        depletePunksNotDead(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })
            
            // -------------- NON-DEPLETED TOKEN-CARDS -----------------------------------
            // For non-depleted cards, store current references to tokenSprite and tokenSlot in local variables. 
            // These will be closed over in the event callback function, ensuring that 
            // the correct sprite and slot are manipulated when the sprite is clicked, 
            // even if the card object is later updated with new sprite and slot references.
            
            } else if (card.key === 'kamishimoUberAlles') {

                    const tokenSprite = card.tokenSprite;
                    const tokenSlot = card.tokenSlot;
                    gameState.kamishimoUberAlles += 1;
                    updateStrengthAndArmor(gameState.player);

                    tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) {
                            depleteKamishimoUberAlles(card, tokenSprite,tokenSlot); 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })

                } else if (card.key === 'hollidayInKamakura') {
                    let tokenSprite = card.tokenSprite;
                    let tokenSlot = card.tokenSlot;
                    // No effect until depletion
                    // Depletion is disabled for the turn in which the card was played.
                    const turnplayed = gameState.turn
                    const fightplayed = gameState.score.levelsCompleted

                    tokenSprite.on( 'pointerup', () => {
                        const depletedDifferentTurn = (turnplayed != gameState.turn || fightplayed != gameState.score.levelsCompleted)
                        console.log(`depletedDifferentTurn: ${depletedDifferentTurn}\nturnplayed: ${turnplayed}\ngameState.turn: ${gameState.turn }\nfightplayed: ${fightplayed}\ngameState.score.levelsCompleted: ${gameState.score.levelsCompleted}\ngameState.playersTurn: ${gameState.playersTurn}`)
                        if (gameState.playersTurn && depletedDifferentTurn) {
                            depleteHollidayInKamakura(card, tokenSprite, tokenSlot);
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })
                }
            } 
        
        function activatePermanentFromHand(card) {
            // No slots available => direct activation of deplete effect
            self.cameras.main.shake(70, .002, false);
            card.isBeingPlayed = false;
            console.log(`No available slot for permanent card ${card.key}`);

            switch(card.key) {
                case 'foreverTrue':
                    depleteForeverTrue(card);
                    break;
                case 'rebelSpirit':
                    depleteRebelSpirit(card);
                    break;
                case 'rebelHeart':
                    depleteRebelHeart(card);
                    break;
                case 'bushido':
                    depleteBushido(card);
                    break;
                case 'toxicAvenger':
                    depleteToxicAvenger(card);
                    break;
                case 'kirisuteGomen':
                    depleteKirisuteGomen(card);    
                case 'toxicFrets':
                    depleteToxicFrets(card);
                    break;
                case 'ashenEncore':
                    depleteAshenEncore(card);
                    break;
                case 'edoEruption':
                    depleteEdoEruption(card); 
                    break;
                case 'steelToe':
                    depleteSteelToe(card); 
                    break; 
                case 'deadTokugawas':
                    depleteDeadTokugawas(card); 
                    break;
                case 'gundanSeizai':
                    depleteGundanSeizai(card); 
                    break;
                case 'LustForLife':
                    depleteLustForLife(card); 
                    break;
                case 'PunksNotDead':
                    depletePunksNotDead(card);
                    break;
                
                // NB! Add any card that is not allowed to deplete from hand
                case 'kamishimoUberAlles': 
                case 'hollidayInKamakura':
                    gameState.currentCards.push(card); 
                    card.slot.available = false;
                    break;
            }
        }    

        function displayTokenCard(card) {
            card.tokenSprite.on('pointerover', function() {
                gameState.cardsDealtSound.play({ volume: 1.5, seek: 0.10 });
                card.permanentCardSprite = self.add.image(550, 300, card.key).setScale(0.55).setDepth(220);
            });
            card.tokenSprite.on('pointerout', function() {
                card.permanentCardSprite.destroy();
            });
        }

        function destroyToken(card) {
            if (card.tokenSlot) card.tokenSlot.available = true;
            if (card.sprite) card.sprite.destroy(); // Removes the card sprite if deplete was played from hand
            if (card.tokenSprite) card.tokenSprite.destroy();
            if (card.permanentCardSprite) card.permanentCardSprite.destroy();
            gameState.permanents = gameState.permanents.filter(c => c.card !== card);
            gameState.deck = gameState.deck.filter(c => c !== card); 
        }

        function depleteForeverTrue(card) { 
            gameState.foreverTrue = false;
            destroyToken(card);
            drawNewCards(8);
        }

        function depleteRebelSpirit(card) {
            gameState.rebelSpirit = false;
            destroyToken(card);
            gameState.player.mana += 3;
            gameState.player.manaMax += 3;
            self.updateManaBar(gameState.player);
        }

        function depleteRebelHeart(card) {
            gameState.rebelHeart = false;
            destroyToken(card);
            const player = gameState.player;        
            player.health = Math.min(player.healthMax, player.health + 12);
            gameState.healSound.play({ volume: 0.5 });
            self.updateHealthBar(player);
            self.powerUpTweens(player); 
        }

        function depleteBushido(card) {
            gameState.bushido = false;
            destroyToken(card);               
            gameState.player.strengthBase += 6;
            updateStrengthAndArmor(gameState.player);
        }

        function depleteToxicAvenger(card) {
            gameState.toxicAvenger = false;
            destroyToken(card);     

            gameState.enemies.forEach(enemy => {
                enemy.poison += 4;
                updateStats(enemy);
            });
        }

        function depleteKirisuteGomen(card) { 
            if (gameState.enemies.some(enemy => enemy.health < 30)) {
                gameState.deck = gameState.deck.filter(c => c !== card);
                gameState.targetingCursor.setVisible(true);
                let functionActive = true;

                gameState.enemies.forEach (enemy => {
                    enemy.sprite.on('pointerover', function() {
                        gameState.targetingCursor.setTexture('targetingCursorReady');
                    });

                    enemy.sprite.on('pointerout', function() {
                        gameState.targetingCursor.setTexture('targetingCursor');
                    });

                    enemy.sprite.on('pointerup', function() {
                        if (enemy.health < 30 && functionActive) {
                            enemy.health = 0;
                            gameState.attackSound.play({ volume: 1 });
                            self.cameras.main.shake(120, .025, false);    
                            
                            if (card.tokenSlot) {
                                card.tokenSlot.available = true;
                                gameState.player.strengthMax -= 5
                            }

                            if (card.sprite) card.sprite.destroy(); // Removes the card sprite incase the deplete effect was activated directely
                            if (card.tokenSprite) card.tokenSprite.destroy();
                            if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                            gameState.permanents = gameState.permanents.filter(c => c.card !== card);

                            removeIfDead(enemy);
                            checkGameOver();
                            updateStrengthAndArmor(gameState.player);

                        } else {
                            self.cameras.main.shake(70, .002, false);
                            functionActive = false;
                        }
                    
                    gameState.targetingCursor.setVisible(false);    
                
                    });
                })

            } else {
                self.cameras.main.shake(70, .002, false);
                card.slot.available = false

                // The condition prevents multiple copies if the card is clicked repeatedly
                if ( !gameState.currentCards.some( card => card.key === 'kirisuteGomen') ) {
                    gameState.currentCards.push(card)
                    gameState.player.mana += 1;
                    self.updateManaBar(gameState.player);
                }
            }
        }

        function depleteToxicFrets(card) {
            gameState.toxicFrets = false;
            destroyToken(card);
            
            gameState.enemies.forEach( enemy => {
                if (enemy.poison > 0) {
                    enemy.health -= enemy.poison * 2;
                    self.updateHealthBar(enemy);
                    removeIfDead(enemy);
                    checkGameOver();
                };
            })
        }

        function depleteAshenEncore(card) {
            gameState.ashenEncore = false;
            destroyToken(card);

            const ashenEncoreConfig = { fontSize: '32px', fill: '#ff0000' };
            const ashenEncoreDepleteText = self.add.text(550, 350, 'Deals 12 firedamage\n to all enemies', ashenEncoreConfig).setOrigin(0.5);
            self.cameras.main.shake(100, .003, false);
            gameState.attackSound.play({ volume: 0.8 });
            
            self.time.delayedCall(1500, () => {   
                ashenEncoreDepleteText.destroy();
            });
            
            gameState.enemies.forEach( enemy => {
                enemy.health -= 12;
                self.updateHealthBar(enemy);
                removeIfDead(enemy);
                checkGameOver();
            })
        }

        function depleteEdoEruption(card) {
            gameState.edoEruption = false;
            destroyToken(card);
        } 

        function depleteSteelToe(card) {
            gameState.steelToe = false;
            destroyToken(card);

            gameState.targetingCursor.setVisible(true);
            let depleteSteelToeActive = true;

            gameState.enemies.forEach (enemy => {
                enemy.sprite.on('pointerover', function() {
                    gameState.targetingCursor.setTexture('targetingCursorReady');
                });

                enemy.sprite.on('pointerout', function() {
                    gameState.targetingCursor.setTexture('targetingCursor');
                });

                enemy.sprite.on('pointerup', function() {
                    if (depleteSteelToeActive) {
                        enemy.armor -= 7;
                        updateStats(enemy);
                        gameState.attackSound.play({ volume: 0.6 });
                        self.cameras.main.shake(100, .012, false);
                        gameState.targetingCursor.setVisible(false);   
                        depleteSteelToeActive = false; 
                    }
                })
            })   
        
        }

        function depleteDeadTokugawas(card) {
            gameState.redrawPrice += 1;
            destroyToken(card);
        } 

        function depleteGundanSeizai(card) {
            gameState.gundanSeizai = false;
            earnGold(3)
            destroyToken(card);
        }

        function depleteLustForLife(card) {
            gameState.lustForLife = false;
            destroyToken(card);
            const player = gameState.player;
            player.health = player.stancePoints > 0 ? Math.min(player.healthMax, player.health + 5 * player.StancePoints) : player.health;
            gameState.healSound.play({ volume: 0.5 });
            self.powerUpTweens(player);
            self.updateHealthBar(player);
        }

        function depletePunksNotDead(card) {
            gameState.punksNotDeadCondition = false;
            if (!gameState.player.alive) {
                gameState.player.alive = true;
                gameState.player.health = Math.round(gameState.player.healthMax * 0.2);
                gameState.healSound.play({ volume: 0.5 });
                self.updateHealthBar(gameState.player);
            }
            destroyToken(card);
        }
        
        // Non-depleted cards
        function depleteKamishimoUberAlles(card, tokenSprite, tokenSlot) {
            if (tokenSlot) tokenSlot.available = true;
            if (tokenSprite) tokenSprite.destroy();
            if (card.permanentCardSprite) card.permanentCardSprite.destroy();
            gameState.permanents = gameState.permanents.filter(p => p.tokenSprite !== tokenSprite);
            gameState.kamishimoUberAlles -= 1;
            updateStrengthAndArmor(gameState.player);
        }

        function depleteHollidayInKamakura(card, tokenSprite, tokenSlot) {
            if (tokenSlot) tokenSlot.available = true;
            if (tokenSprite) tokenSprite.destroy();
            if (card.permanentCardSprite) card.permanentCardSprite.destroy();
            gameState.permanents = gameState.permanents.filter(p => p.tokenSprite !== tokenSprite);
            gameState.player.manaMax += 1;
            gameState.player.mana += 1;
            self.updateManaBar(gameState.player);
            drawNewCards(1);
        }
    
    
    // ---------------------------------- UTILITIES-------------------------------------      

        // NB! Should only be used for character = player. The argument is keept in place for a future revision to multiple player characters.
        function updateStrengthAndArmor(character) { 
            let strengthBushido = 0

            if (gameState.endOfTurnButtonPressed) {
                character.armor = Math.min(character.armorMax, character.armorBase + character.armorCard + character.armorStance);
                strengthBushido = gameState.bushido ? Math.floor(character.armor / 4) : 0; // Account for Bushido
                
                character.strength = Math.min(
                    character.strengthMax, character.strengthBase + character.strengthStance + strengthBushido
                );
            
            } else {
                character.armor = Math.min(character.armorMax, character.armorBase + character.armorCard);
                strengthBushido = gameState.bushido ? Math.floor(character.armor / 4) : 0; // Account for Bushido
                
                character.strength = Math.min(
                    character.strengthMax, character.strengthBase + character.strengthStance + character.strengthCard + strengthBushido
                ); 
            }

            if (gameState.kamishimoUberAlles > 0 && gameState.player.stancePoints < 0) { // Adjust for Strength tokens
                
                character.strength = Math.min(
                    character.strengthMax, character.strength - gameState.player.stancePoints * gameState.kamishimoUberAlles
                );
            }

            updateStats(character)
        }

        function updateStats(character) {
            
            if (character != gameState.player) { 
                character.strength = character.strengthBase + character.strengthTurn
                
                if (gameState.toxicAvenger && character.poison > 0) { 
                    character.strength -= 4; // Account for Toxic Avenger
                }
            }
            
            character.armorText.setText(`${character.armor}/${character.armorMax}`);
            character.strengthText.setText(`${character.strength}/${character.strengthMax}`);
        }

        function removeIfDead(character) {
            if (character.health <= 0) {
                character.health = 0; // Avoids negative health.
                character.alive = false;

                if (character === gameState.player && gameState.punksNotDeadCondition) {
                    depletePunksNotDead(gameState.punksNotDeadCard)
                    return
                }

                character.sprite.removeInteractive();
                character.turnComplete = true;
                fadeOutGameObject(character.sprite, 500);

                if (character != gameState.player) {
                    const indexEnemies = gameState.enemies.indexOf(character);
                    const indexCharacters = gameState.characters.indexOf(character);
                    
                    if (indexEnemies !== -1) {
                    gameState.enemies.splice(indexEnemies, 1);
                    };

                    if (indexCharacters !== -1) {
                        gameState.characters.splice(indexCharacters, 1);
                    };

                    if (gameState.troopsOfTakamoriCondition) {
                        earnGold(1)
                        gameState.troopsOfTakamoriCondition = false
                    }
                }
                
                const characterObjects = [
                    character.healthBarBackground,
                    character.healthBarFrame,
                    character.healthBar,
                    character.healthBarText,
                    character.manaBarBackground,
                    character.manaBarFrame,
                    character.manaBar,
                    character.manaBarText,
                    character.strengthAndArmorImage,
                    character.strengthText,
                    character.armorText,
                    character.descriptionBackground,
                    character.descriptionText,
                    character.intentionText,
                    character.intentionBackground
                ];

                characterObjects.forEach( object => {
                    if(object) object.destroy();
                })
            }
        };

        function addHandtoDeck() {    
            while(gameState.currentCards.length > 0) {
                let card = gameState.currentCards.pop();
                if (!card.slot.available) card.slot.available = true;
                if (card.dBeat) delete card.dBeat
                gameState.discardPile.push(card);
                gameState.discardPileText.setText(gameState.discardPile.length);
                fadeOutGameObject(card.sprite, 200);
            }
        };

        function drawNewCards(numCards) {

            // Avoids error if gameState.deck.length < max number of cards on hand)
            const numCardsLimit = Math.min(gameState.deck.length, 8); 
            const numOfFreeSlots = gameState.slots.filter(slot => slot.available).length;
            numCards = (numOfFreeSlots < numCards) ? numOfFreeSlots : numCards;
            
            for (let i = 0; i < numCards; i++) {
                self.time.delayedCall(i * 75, () => {
                    if (gameState.currentCards.length < numCardsLimit) {
        
                        // Check and reshuffle the deck if necessary
                        if (gameState.drawPile.length === 0) {
                            gameState.drawPile = gameState.discardPile;
                            self.shuffleDeck(gameState.drawPile);    
                            gameState.discardPile = [];
                            gameState.discardPileText.setText(gameState.discardPile.length);
                        }
            
                        // Draw a card and create a sprite for it
                            let card = gameState.drawPile.pop();
                            card.sprite = self.add.image(0, 0, card.key).setScale(0.35).setInteractive(); //0.35
                            if (card.usedOneShot) card.sprite.setTint(0x808080);
                            console.log(`card added: ${card.key}`);
                            card.isBeingPlayed = false;
                            gameState.currentCards.push(card);

                            // Position the sprite
                            let availableSlots = gameState.slots.filter(slot => slot.available);
                            let slot = availableSlots[Math.floor(availableSlots.length / 2)];
                            if (slot) {
                                card.sprite.x = slot.x;
                                card.sprite.y = slot.y;
                                card.startHeight = card.sprite.y;
                                card.angle = slot.angle;
                                card.sprite.setAngle(card.angle);
                                slot.available = false;
                                card.slot = slot;
                                let cardDepth = 10 + slot.index;
                                card.sprite.setDepth(cardDepth);
                                self.animateCard(card, cardDepth);
                            };

                            gameState.cardsDealtSound.play({ volume: 2.2, seek: 0.10 });
                            gameState.drawPileText.setText(gameState.drawPile.length);

                            if (gameState.ashenEncore && !card.dBeat) {
                                dealAshenDmgOnDrawCard();
                            };

                            if (gameState.playersTurn) {
                                card.sprite.on('pointerup', function() {
                                    activateCard(card);
                                })
                            };

                    } else {
                        self.cameras.main.shake(70, .002, false);
                    } 
                });
            }  
        };

        function dealAshenDmgOnDrawCard() {
            gameState.enemies.forEach( enemy => {
                const ashenDamage = 4;
                enemy.health -= ashenDamage;
                self.updateHealthBar(enemy);
                removeIfDead(enemy);
                checkGameOver();
                
                // The conditional deals with cases where multiple cards are drawn.
                if (typeof ashenEncoreText === "undefined" || !ashenEncoreText) { 
                    const ashenEncoreConfig = { fontSize: '32px', fill: '#ff0000' };
                    const ashenEncoreKey = `Deals ${ashenDamage} fire damage to all enemies`;
                    const ashenEncoreDrawText = self.add.text(550, 350, ashenEncoreKey, ashenEncoreConfig).setOrigin(0.5);
                    self.cameras.main.shake(100, .003, false);
                    gameState.attackSound.play({ volume: 0.8 });
                    
                    self.time.delayedCall(1500, () => {   
                        ashenEncoreDrawText.destroy();
                    });
                }
            })
        }

        function displayEnemyIntention(enemy) {
            const actionKey = typeof enemy.chosenAction.key === 'function' ? enemy.chosenAction.key() : enemy.chosenAction.key;
            const textConfig = { fontSize: '13px', fill: '#000000' };
            enemy.intentionText = self.add.text(enemy.x + 10, enemy.y - enemy.height / 2 - 40, `${actionKey}`, textConfig);
            enemy.intentionText.setOrigin(0.5, 1).setDepth(11);
            
            const originalSpriteWidth = self.textures.get('listbox1').getSourceImage().width;
            const scale = enemy.intentionText.width / originalSpriteWidth;
            
            enemy.intentionBackground = self.add.image(enemy.x + 10, enemy.y - enemy.height / 2 - 33, 'listbox1').setScale(scale * 1.05, 1);
            enemy.intentionBackground.setInteractive().setOrigin(0.5, 1).setAlpha(0.85).setDepth(10);
        };
        
        function fadeOutGameObject(gameObject, duration) { //NB! Keep it here. Moving it to base => bugs!
            if (gameObject) {
                self.tweens.add({
                    targets: gameObject,
                    alpha: 0, 
                    ease: 'Power1',
                    duration: duration,
                    onComplete: () => { 
                        gameObject.destroy();
                    }
                }, self);
            }
        }

        function displayDrawPile() {
            gameState.drawPileImage = self.add.image(120, 600, 'deck');
            gameState.drawPileImage.setScale(0.13).setOrigin(.5,.5).setInteractive();
                
            const deckTextConfig = { fontSize: '45px', fill: '#000000', fontWeight: 'bold' };
            gameState.drawPileText = self.add.text(120, 600, gameState.drawPile.length, deckTextConfig);
            gameState.drawPileText.setDepth(100).setOrigin(.5,.5);
            

            gameState.drawPileImage.on('pointerover', function() {
                if (gameState.drawPile.length > 0) {
                    gameState.stanceText.setAlpha(0);
    
                    const cardsPerRow = gameState.drawPile.length < 12 ? 4 : 6;
                    const cardSpacing = 105;
                    const startX = gameState.drawPile.length < 12 ? 400 : 250;
                    const startY = 150;

                    const drawPileText = self.add.text(550, startY-110, "", { fontSize: '60px', fill: '#000000' }).setOrigin(0.5).setDepth(201);
                    const drawPileTextBackground = self.add.graphics();
                    self.updateTextAndBackground(drawPileText, drawPileTextBackground, 'Draw Pile', 7, 200, 0.95);
                    gameState.cardImages.push(drawPileText, drawPileTextBackground);
                    
                    gameState.drawPile.forEach( (card, index) => {
                        let cardX = startX + (index % cardsPerRow) * cardSpacing;
                        let cardY = startY + Math.floor(index / cardsPerRow) * 1.5 * cardSpacing;
    
                        let cardImage = self.add.image(cardX, cardY, card.key).setScale(0.27).setDepth(200);
                        gameState.cardImages.push(cardImage);
                    })
                };
            })
    
            gameState.drawPileImage.on('pointerout', function() {
                gameState.cardImages.forEach(cardImage => {
                    fadeOutGameObject(cardImage, 200);
                });
                gameState.cardImages = [];
                gameState.stanceText.setAlpha(1);
            });
        };

        function displayDiscardPile() {
            const deckTextConfig = { fontSize: '45px', fill: '#000000', fontWeight: 'bold' };
            gameState.discardPileText = self.add.text(980, 600, gameState.discardPile.length, deckTextConfig)
            gameState.discardPileText.setDepth(100).setOrigin(.5,.5);

            gameState.discardPileImage = self.add.image(980, 600, 'deck');
            gameState.discardPileImage.setScale(0.13).setOrigin(.5,.5).setInteractive().setTint(0xff0000);
            
            gameState.discardPileImage.on('pointerover', function() {
                    if (gameState.discardPile.length > 0) {
                        gameState.stanceText.setAlpha(0);
    
                        const cardsPerRow = gameState.discardPile.length < 12 ? 4 : 6;
                        const cardSpacing = 105;
                        const startX = gameState.discardPile.length < 12 ? 400 : 250;
                        const startY = 150;

                        const discardPileText = self.add.text(550, startY-110, "", { fontSize: '60px', fill: '#000000' }).setOrigin(0.5).setDepth(201);
                        const discardPileTextBackground = self.add.graphics();
                        self.updateTextAndBackground(discardPileText, discardPileTextBackground, 'Discard Pile', 7, 200, 0.80);
                        gameState.cardImages.push(discardPileText, discardPileTextBackground);
                        
                        gameState.discardPile.forEach( (card, index) => {
                            let cardX = startX + (index % cardsPerRow) * cardSpacing;
                            let cardY = startY + Math.floor(index / cardsPerRow) * 1.5 * cardSpacing;
        
                            let cardImage = self.add.image(cardX, cardY, card.key).setScale(0.27).setDepth(200);
                            gameState.cardImages.push(cardImage);
                        })
                    }
                });
    
            gameState.discardPileImage.on('pointerout', function() {
                gameState.cardImages.forEach(cardImage => {
                    fadeOutGameObject(cardImage, 200);
                });
                gameState.cardImages = [];
                gameState.stanceText.setAlpha(1);
            });
        }

        function updatePoison(character) {
            if (character.poison > 0) {
                console.log(`character.poison > 0`)
                character.health = Math.max(1, character.health - character.poison);
                if (character.poisonText) {
                    console.log(`character.poisonText exists`)
                    const lostHP = (character.health + 1 > character.poison) ? character.poison : character.health - 1
                    const newPoisonText = `-${lostHP} HP from Poison`               
                    self.updateTextAndBackground(character.poisonText, character.poisonTextBackground, newPoisonText, 7, 20, 0.7);
                }
                character.poison -= 1;
            }
        };


        function addAdminTools() {
            if (gameState.playerName === 'admin') { // For testing purposes
                
                // Get mana
                gameState.getManaButton = self.add.image(550, 200, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();
                gameState.getManaText = self.add.text(550, 200, `Get Mana`, { fontSize: '15px', fill: '#ff0000' }).setOrigin(0.5);
                gameState.getManaButton.on('pointerup', () => {
                    if (gameState.playersTurn) {
                        gameState.player.mana = gameState.player.manaMax;
                        self.updateManaBar(gameState.player);
                        console.log('mana gained');
                    }
                })

                //Draw cards
                gameState.drawCardButton = self.add.image(550, 300, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();
                gameState.drawCardText = self.add.text(550, 300, `Draw Card`, { fontSize: '15px', fill: '#ff0000' }).setOrigin(0.5);
                gameState.drawCardButton.on('pointerup', () => {
                    if (gameState.playersTurn) {
                        drawNewCards(1);
                        console.log('card drawn');
                    }
                })
    
                //Kill enemy
                gameState.killEnemyButton = self.add.image(550, 400, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();
                gameState.killEnemyText = self.add.text(550, 400, `Kill Enemy`, { fontSize: '15px', fill: '#ff0000' }).setOrigin(0.5);
                gameState.killEnemyButton.on('pointerup', () => {
                    // The conditional statement is needed to avoid a TypeError when both enemies are dead.
                    if ( gameState.enemies.some( enemy => enemy.health > 0 && gameState.playersTurn) ) {
                        const enemy = gameState.enemies.find( enemy => enemy.health > 0);
                        enemy.health = 0;
                        removeIfDead(enemy);
                        checkGameOver();
                        console.log(`${enemy.name} killed`);
                    }
                })
            
            }
        }

        addAdminTools();

    }; //End of create

    update() {
        if (gameState.targetingCursor.visible) {
            gameState.targetingCursor.x = this.input.mousePointer.x;
            gameState.targetingCursor.y = this.input.mousePointer.y;
        }
    }
} //end of scene
