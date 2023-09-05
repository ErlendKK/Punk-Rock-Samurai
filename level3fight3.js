/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|

Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

class Level3Fight3 extends BaseScene {self
    constructor() {
        super('Level3Fight3');
    }

    preload() {
        this.load.image('bakgrunnLair3', 'assets/images/bakgrunnLair3.jpg');
        this.load.image('wraith1', 'assets/images/sprites/wraith1.png');
        this.load.image('wraith2', 'assets/images/sprites/wraith2.png');
    };

    create() {
        const self = this;      
        this.baseCreate('bakgrunnLair3', 0.70); //BaseScene method  
        this.resetPlayer(gameState.player, 0.35);
        this.addButtons();
        displayDrawPile();
        displayDiscardPile();

        gameState.kamishimoUberAlles = 0; 
        gameState.kirisuteGomen = false; 
        gameState.toxicFrets = false;
        gameState.ashenEncore = false;
        gameState.edoEruption = false;
        gameState.steelToe = false;
       
        gameState.currentCards = [];
        gameState.cardImages = [];

        gameState.enemy1 = Object.create(gameState.enemy);
        gameState.enemy1.name = 'Soulripper';
        gameState.enemy1.sprite = this.add.sprite(670, 340, 'wraith2').setScale(0.26).setFlipX(false).setInteractive(), //690 / 350 / .33
        gameState.enemy1.health = 60;
        gameState.enemy1.healthMax = 60;
        gameState.enemy1.armor = 2;

        gameState.enemy2 = Object.create(gameState.enemy);
        gameState.enemy2.name = 'Lord of Darkness';
        gameState.enemy2.sprite = this.add.sprite(890, 330, 'wraith1').setScale(0.27).setFlipX(false).setInteractive(), //910 / 310 / .25
        gameState.enemy2.health = 100;
        gameState.enemy2.healthMax = 100;
        gameState.enemy2.armor = 2;

        gameState.enemies = [gameState.enemy1, gameState.enemy2];
        gameState.characters = [...gameState.enemies, gameState.player];

        gameState.characters.forEach( character => {
            character.height = character.sprite.displayHeight;
            character.width = character.sprite.displayWidth;
            character.x = character.sprite.x;
            character.y = character.sprite.y;
            this.addHealthBar(character, character.healthBarColor);
            this.addStatsDisplay(character);
            this.describeCharacter(character, character.sprite); 
        });

        this.addManaBar(gameState.player);
        this.addStanceBar(gameState.player, '#a9a9a9');
        
        gameState.permanents.forEach(permanent => {
            const card = permanent.card;
            const slot = permanent.slot;

            if (card.key === 'kamishimoUberAlles' || card.key === 'hollidayInKamakura' ) {
                slot.available = true;

            } else { 
                card.tokenSprite = self.add.sprite(slot.x, slot.y, card.token).setScale(0.075).setInteractive(); 
                slot.available = false; 
                card.tokenSlot = slot;
                console.log(`Recreated permanent: ${card.key}\nfor slot ${slot.index}`);
                displayTokenCard(card);  
                activatePermanentFromToken(card);
            }
        });

        function startFight() {
            gameState.turn = 0;
            gameState.musicTheme.stop();
            self.shuffleDeck(gameState.drawPile);

            const { level, fight } = self.extractLevelFightFromName(self.scene.key);
            const startTextConfig = { fontSize: '60px', fill: '#ff0000', fontFamily: 'Rock Kapak' }
            gameState.startText = self.add.text(550, 300, `Level ${level}\nFight ${fight}!`, startTextConfig).setDepth(200).setOrigin(0.5);
                               
            self.time.delayedCall(350, () => {
                gameState.music.play( { loop: true, volume: 0.35 } );
            })
        
            self.time.delayedCall(3000, () => { //timer: 3000
                fadeOutGameObject(gameState.startText, 200);
                self.time.delayedCall(300, startPlayerTurn());
            });      
        }

        startFight()

    
    // ---------------------------------- PLAYERS TURN -------------------------------------    
    
    
        function startPlayerTurn() {
            let numCards = gameState.player.numCardsBase + gameState.player.numCardsStance;
            gameState.turn += 1;
            gameState.endOfTurnButtonPressed = false; // Plays a different role than gameStale.playersTurnStarted, so keep both!
            gameState.yourTurnText = self.add.text(550, 300, 'Your turn!', { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5);
            gameState.player.poisonText = self.add.text(570, 350, '', { fontSize: '25px', fill: '#ff0000' }).setOrigin(0.5);
            console.log(`player's turn number ${gameState.turn} has started`);

            gameState.player.armorCard = 0;
            gameState.player.strengthCard = 0;

            const manaMax = gameState.player.manaBase + gameState.player.manaStance
            gameState.player.manaMax = (gameState.rebelSpirit && gameState.turn % 3 === 0) ? manaMax + 1 : manaMax;
            gameState.player.mana = gameState.player.manaMax;

            if (gameState.foreverTrue && gameState.player.stancePoints > 0) { // NB! Stance must be reset/kept after mana
                gameState.player.manaMax += 1;
                gameState.player.mana += 1;
            } else {
                gameState.player.stancePoints = 0; 
            };

            self.updateStanceBar(gameState.player);
            self.updateManaBar(gameState.player);
            self.updateHealthBar(gameState.player);
            self.updatePoison(gameState.player);
            removeIfDead(gameState.player);
            updateStrengthAndArmor(gameState.player);

            self.time.delayedCall(2200, () => { //timer: 2200
                gameState.player.poisonText.destroy();
                fadeOutGameObject(gameState.yourTurnText, 200);
                drawCards(numCards);
                
                gameState.enemies.forEach( enemy => { // Must be done after gameState.turn is increased
                    updateEnemyActions();  
                    selectEnemyAction(enemy);
                    displayEnemyIntention(enemy);
                });
            });                  
        }

        // Create grid for cards
        const x = 550 - 4 * 80;
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

            const startSlotIndex = Math.floor((gameState.slots.length - numCards) / 2)
            
            for (let i = 0; i < numCards; i++) {
                self.time.delayedCall(i * 75, () => {
        
                    // Check and reshuffle the deck if necessary
                    if (gameState.drawPile.length === 0) {
                        gameState.drawPile = gameState.discardPile;
                        self.shuffleDeck(gameState.drawPile);    
                        gameState.discardPile = [];
                        gameState.discardPileText.setText(gameState.discardPile.length);
                    }
        
                    // Draw a card and create a sprite for it
                    const card = gameState.drawPile.pop();
                    const cardDepth = 10 + i + startSlotIndex;
                    //const cardIndex = gameSettings.cardFrameMapping[card.key];
                    //card.sprite = self.add.sprite(0, 0, 'cardSpriteSheet', cardIndex).setScale(0.35).setInteractive();
                    card.sprite = self.add.sprite(0, 0, card.key).setScale(0.35).setInteractive();
                    card.isBeingPlayed = false;
                    gameState.currentCards.push(card);
                    card.sprite.setDepth(cardDepth);
                    
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
                    
                    gameState.cardsDealtSound.play({ volume: 2.2 });
                    gameState.drawPileText.setText(gameState.drawPile.length);
                    self.animateCard(card, cardDepth) // Basescene Method

                    if (gameState.playersTurn) { // NB! Dont allow the player to click before all cards are dealt
                        card.sprite.on('pointerup', function() {
                            activateCard(card)
                        })
                    }
                })
            }

            gameState.playersTurn = true; // Only now should tokens be set interactive

        }
 
        function activateCard(card) {

            gameState.costPlayed = typeof card.cost === 'function' ? card.cost() : card.cost;
            gameState.typePlayed = typeof card.type === 'function' ? card.type() : card.type;

            if (gameState.player.mana >= gameState.costPlayed && gameState.playingCard === false) {
                gameState.player.mana -= gameState.costPlayed;
                self.updateManaBar(gameState.player);
                console.log(`activated card: ${card.key}\nCost: ${gameState.costPlayed}`)

                // FreedomBeforeCardPlayed is used in playCard() to detect changes in stance
                gameState.player.freedomBeforeCardPlayed = (gameState.player.stance === 'Freedom') ? true : false; 
                card.isBeingPlayed = true;
                gameState.currentCards = gameState.currentCards.filter(c => c !== card);
                
                if (card.slot) card.slot.available = true;

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
                        playCard(card, enemy, isLastEnemy)
                    }) 

                } else if (gameState.typePlayed === 'permanent') {
                    addPermanent(card) 

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

            gameState.playingCard = true
            fadeOutGameObject(card.sprite, 200);
            fadeOutGameObject(gameState.actionText, 50); 
            gameState.targetingCursor.setVisible(false);

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
                drawCardPlayed 
            } = normalizeCard(card, target, isLastEnemy);

            // NB "damageTotal" must be available to the scope in which "addTextAndTweens" gets called,
            // regardless of whether card.type = target or buff.  
            const damageModifyer = (1 + 0.10 * gameState.player.strength) * (1 - target.armor / 20);
            const damageTotal = Math.round( Math.max(0, firePlayed + damagePlayed * damageModifyer));

            if (target != gameState.player) {
                gameState.score.damageDealt += damageTotal;
                console.log(`${damagePlayed} Physical Damage and ${firePlayed} Fire Damage was dealt to ${target.name}`);
                
                target.strengthTurn -= reduceTargetStrengthPlayed;
                target.armor -= reduceTargetArmorPlayed;
                target.poison += poisonPlayed;
                target.health -= damageTotal;
            } 
            //NB! Dont use "else" here
            

            // ADD all cards that increase strength for the rest of the fight
            if (card.key === 'seppuku' || card.key === 'boneShredder') { 
                gameState.player.strengthBase += strengthPlayed;

            } else {
                gameState.player.strengthCard += strengthPlayed;
            }

            if (card.key === 'libertySpikes' && gameState.player.stancePoints > 0) {
                gameState.player.mana += 1;
                gameState.player.manaMax += 1;
                self.updateManaBar(gameState.player);
            }
        
            if (healPlayed) {
                gameState.player.health = Math.min(gameState.player.health + healPlayed, gameState.player.healthMax);
                self.updateHealthBar(gameState.player);
            }
            
            gameState.player.armorCard += armorPlayed;
            gameState.player.poison = Math.max(0, gameState.player.poison - card.poisonRemove); 

            addTextAndTweens(damageTotal, poisonPlayed, strengthPlayed, armorPlayed);

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
                if (gameState.actionText) gameState.actionText.destroy();
            });
        };

        function addTextAndTweens(damageTotal, poisonPlayed, strengthPlayed, armorPlayed) {
            const actionTextConfig = { fontSize: '32px', fill: '#ff0000' };

            if (gameState.typePlayed === 'targetSelected' || gameState.typePlayed === 'targetAll') {                
                self.cameras.main.shake(100, .003, false);
                gameState.attackSound.play({ volume: 0.8 });
                
                const actionTextAttack = (damageTotal > 0) ?  `Deals ${damageTotal} damage`  : '';
                const actionTextPoison = (poisonPlayed > 0) ? `Deals ${poisonPlayed} Poison` : ''; 
                const actionTextTarget = `${actionTextAttack}\n\n${actionTextPoison}`;
                
                gameState.actionText = self.add.text(550, 300, actionTextTarget, actionTextConfig).setOrigin(0.5);
                self.attackTweens(gameState.player, 60);
                
            } else if (strengthPlayed > 0) {
                gameState.powerUpSound.play({ volume: 0.15 });
                gameState.actionText = self.add.text(550, 300, `Gains ${strengthPlayed} Strength`, actionTextConfig).setOrigin(0.5);
                self.powerUpTweens(gameState.player);

            } else if (armorPlayed > 0) {
                gameState.powerUpSound.play({ volume: 0.15 });
                gameState.actionText = self.add.text(550, 300, `Gains ${armorPlayed} Armor`, actionTextConfig).setOrigin(0.5);
                self.powerUpTweens(gameState.player);
            };
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
                addHandtoDeck();
                updateStrengthAndArmor(gameState.player);
                updateEnemyActions();

                // adds health if rebelHeart is active
                if (gameState.rebelHeart) { 
                    gameState.player.health = Math.min(
                        gameState.player.healthMax, gameState.player.health + Math.abs(gameState.player.stancePoints) 
                    );
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
            enemy.turnText = self.add.text(550, 300, 'Enemy turn!', { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5);               
    
            self.time.delayedCall(1800, () => {
                fadeOutGameObject(enemy.turnText, 200);
            }) 
        }
        
        enemy.turnComplete = false;
        performEnemyAction(enemy);           
    }

    function performEnemyAction(enemy) {

        enemy.poisonText = self.add.text(570, 350, '', { fontSize: '30px', fill: '#ff0000' }).setOrigin(0.5);
        self.updatePoison(enemy);
        if (gameState.toxicAvenger && enemy.poison > 0) {
            updateStats(enemy);
        };
    
        const delaytime = (enemy.poisonText._text === '' && !enemy.turnText) ? 800 : 1800;
    
        self.time.delayedCall(delaytime, () => {
            enemy.poisonText.destroy();
    
            // Perform the chosen action
            const chosenAction = enemy.chosenAction;
            const actionTextConfig = { fontSize: '32px', fill: '#ff0000' }
            gameState.player.poison += chosenAction.poison;
            enemy.health = Math.min(enemy.health + chosenAction.heal, enemy.healthMax);
            enemy.strengthBase = Math.min(enemy.strengthBase + chosenAction.strength, enemy.strengthMax);
            updateStats(enemy);
            enemy.armor = Math.min(enemy.armor + chosenAction.armor, enemy.armorMax);    
    
            if (chosenAction.damage > 0 || chosenAction.fire > 0) {
                const damageModifyer = (1 + 0.1 * enemy.strength) * (1 - gameState.player.armor / 20)
                self.cameras.main.shake(120, .005, false);
                gameState.attackSound.play({ volume: 0.8 });
                console.log(`enemy.damageTotal: ${enemy.damageTotal}`)

                enemy.damageTotal = Math.round( Math.max(0, chosenAction.fire + chosenAction.damage * damageModifyer) );
                gameState.player.health -= enemy.damageTotal;
                gameState.score.damageTaken += enemy.damageTotal;
                gameState.actionText = self.add.text(550, 300, `Deals ${enemy.damageTotal} damage`, actionTextConfig).setOrigin(0.5);
                
                self.tweens.add({
                    targets: enemy.sprite,
                    x: enemy.sprite.x - 60,
                    duration: 120,
                    ease: 'Cubic',
                    yoyo: true
                })
    
            } else if (chosenAction.heal > 0) {
                gameState.healSound.play({ volume: 0.5 });
                gameState.actionText = self.add.text(550, 300, chosenAction.text, actionTextConfig).setOrigin(0.5);
                self.powerUpTweens(enemy);
                
    
            } else if (chosenAction.strength > 0 || chosenAction.armor > 0 || chosenAction.poison > 0)  {
                gameState.powerUpSound.play({ volume: 0.2 });
                gameState.actionText = self.add.text(550, 300, chosenAction.text, actionTextConfig).setOrigin(0.5);
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
        
        self.time.delayedCall(1500, () => {
            fadeOutGameObject(gameState.actionText, 200);
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

        gameState.enemy1.actions = [ 
            {key: `Intends to\nDeal 5 fire damage`, damage: 0, fire: 5, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: `Deals 5 fire damage`, probability: 0.10 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
            {key: () => `Intends to\nDeal ${Math.round(15 * (1 + 0.10 * gameState.enemy1.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 15, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 15 damage', probability: 0.235 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
            {key: () => `Intends to\nDeal ${Math.round(20 * (1 + 0.10 * gameState.enemy1.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 20, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 20 damage', probability: 0.17 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
            {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 15, poisonRemove: 0, strength: 0, armor: 1, text: 'Heals 15 HP\nGains 1 armor', probability: (gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0 : 0.17},
            {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 25, poisonRemove: 0, strength: 0, armor: 0, text: 'Heals 25 HP', probability: (gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0 : 0.05},
            {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 3, armor: 0, text: 'Gains 3 strenght', probability: 0.125 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
            {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 4, text: 'Gains 4 armor', probability: 0.15 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
            {key: `Intends to\nPoison you`, damage: 0, fire: 0, poison: 5, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 5 poison', probability: 0.00}
        ]
    
        gameState.enemy2.actions = [ 
            {key: `Intends to\nDeal 10 fire damage`, damage: 0, fire: 10, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 10 fire damage', probability: 0.10 + ((gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0.22 : 0) / 5},
            {key: () => `Intends to\nDeal ${Math.round(15 * (1 + 0.10 * gameState.enemy2.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 15, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 15 damage', probability: 0.235 + ((gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0.22 : 0) / 5},
            {key: () => `Intends to\nDeal ${Math.round(20 * (1 + 0.10 * gameState.enemy2.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 20, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 20 damage', probability: 0.17 + ((gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0.22 : 0) / 5},
            {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 15, poisonRemove: 0, strength: 0, armor: 1, text: 'Heals 15 HP\nGains 1 armor', probability: (gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0 : 0.17},
            {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 25, poisonRemove: 0, strength: 0, armor: 0, text: 'Heals 25 HP', probability: (gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0 : 0.05},
            {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 3, armor: 0, text: 'Gains 3 strenght', probability: 0.125 + ((gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0.22 : 0) / 5},
            {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 4, text: 'Gains 4 armor', probability: 0.15 + ((gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0.22 : 0) / 5},
            {key: `Intends to\nPoison you`, damage: 0, fire: 0, poison: 5, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 5 poison', probability: 0.00}
        ]
    
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
            gameState.music.stop();
            gameState.endOfTurnButton.destroy();
    
            if (gameState.actionText) {
                fadeOutGameObject(gameState.actionText, 200);
            }

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

                    self.time.delayedCall(2500, () => {
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
            
            self.time.delayedCall(600, () => {
                if (gameState.attackSound.isPlaying) {
                    gameState.attackSound.stop();
                }

                gameState.victorySound.play( { volume: 0.9, rate: 1 } );
                self.clearBoard();
            })
        
            if (gameState.actionText) {
                gameState.actionText.destroy();
                console.log(`gameState.actionText still existed at initiateVictory and got destroyed`);
            }
            const victoryTextConfig = { fontSize: '100px', fill: '#ff0000', fontFamily: 'Rock Kapak' };
            const victoryText = self.add.text(550, 300, 'Victory!', victoryTextConfig).setOrigin(0.5);
            
            self.time.delayedCall(2000, () => {
                gameState.musicTheme.play( { loop: true, volume: 0.30 } );
                victoryText.destroy();
                chooseReward();
            })
        }
        
        function chooseReward() {
            self.shuffleDeck(gameState.bonusCards);
            const gameOverTextConfig = { fontSize: '40px', fill: '#000000' };
            const rewardTextConfig = { fontSize: '25px', fill: '#000000' };
            gameState.gameOverText = self.add.text(550, 180, 'Choose a reward', gameOverTextConfig).setOrigin(0.5).setDepth(103);

            gameState.rewardAddCardsButton = self.add.image(550, 350, 'rectangularButton');
            gameState.rewardAddCardsButton.setScale(1.2).setInteractive().setOrigin(0.5).setDepth(102); // Dept > 100 is to ensure that it stays on top of card sprites that fail to clear                   
            gameState.rewardAddCardsText = self.add.text(550, 350, 'Add 1 card\nto your deck', rewardTextConfig).setOrigin(0.5).setDepth(103);
            
            gameState.rewardRemoveCardButton = self.add.image(550, 500, 'rectangularButton')
            gameState.rewardRemoveCardButton.setScale(1.2).setInteractive().setOrigin(0.5).setDepth(102);
            gameState.rewardRemoveCardText = self.add.text(550, 500, 'Remove 1 card\nfrom your deck', rewardTextConfig).setOrigin(0.5).setDepth(103);

            gameState.rewardButtons = [ gameState.rewardAddCardsButton, gameState.rewardRemoveCardButton ];
            gameState.rewardTexts =[ gameState.rewardAddCardsText, gameState.rewardRemoveCardText, gameState.gameOverText ];
            
            gameState.rewardButtons.forEach( button => {
                button.on('pointerover', function() {
                    this.setTexture('rectangularButtonHovered');
                });
                button.on('pointerout', function() {
                    this.setTexture('rectangularButton');
                });
            })
            
            gameState.rewardAddCardsButton.on('pointerup', function() {
                gameState.rewardTexts.forEach( text => text.destroy() );
                gameState.rewardButtons.forEach( button => button.destroy() );
                rewardAddCard();
            })

            gameState.rewardRemoveCardButton.on('pointerup', function() {
                gameState.rewardTexts.forEach( text => text.destroy() );
                gameState.rewardButtons.forEach( button => button.destroy() );
                gameState.rewardAddCardsButton.destroy();
                rewardRemoveCard(); 
            });
        }

         
        function rewardAddCard() {
            console.log(`rewardAddCard called`)
            gameState.gameOverText.destroy();     
            
            const x = 320;
            const y = 300;
            const spacing = 220;
        
            let bonusCards = gameState.bonusCards.slice(0, 3);
            console.log(`bonusCards: ${bonusCards.key}`);
        
            bonusCards.forEach( (bonusCard, index) => {
                //let cardIndex = gameSettings.cardFrameMapping[bonusCard.key];
                //bonusCard.sprite = self.add.sprite(x + index * spacing, y, 'cardSpriteSheet', cardIndex).setScale(0.45).setInteractive();
                bonusCard.sprite = self.add.sprite(x + index * spacing, y, bonusCard.key);
                bonusCard.sprite.setScale(0.45).setInteractive().setDepth(102);
    
                console.log(`bonusCardsprite added for: ${bonusCard.key}`);
        
                bonusCard.sprite.on('pointerover', () => {
                    gameState.cardsDealtSound.play({ volume: 0.6 });
                    self.cardTweens(bonusCard.sprite, 0.58, 200);
                }, self);
                
                bonusCard.sprite.on('pointerout', () => {
                    self.cardTweens(bonusCard.sprite, 0.45, 400);
                }, self);
        
                bonusCard.sprite.on('pointerup', () => {
                    let nextlevelstarting = false;
                    gameState.deck.push(bonusCard);

                    if (bonusCard.type === 'permanent') {
                        gameState.bonusCards.splice(gameState.bonusCards.indexOf(bonusCard), 1);
                    };
        
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
                     
                    self.add.text(550, 180, 'Gained 1 card', { fontSize: '40px', fill: '#000000' }).setOrigin(0.5);
                            
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
        
                })
            })
        }

        function rewardRemoveCard() {
            console.log(`button pressed`);
            gameState.rewardButtons.forEach( button => button.destroy() );
            gameState.rewardTexts.forEach( text => text.destroy() );  
        
            const cardsPerRow = 4;
            const x = 300; 
            const y = 250; 
            const spacing = 120;
            const deck = gameState.deck;
            deck.forEach( card => console.log(card.key)); 
        
            deck.forEach( (deckCard, index) => {
                let xPos = x + (index % cardsPerRow) * spacing;
                let yPos = y + Math.floor(index / cardsPerRow) * spacing;
                let cardDepth = 110 + index;
                
                deckCard.sprite = self.add.sprite(xPos, yPos, deckCard.key).setScale(0.27).setInteractive().setDepth(cardDepth);
        
                deckCard.sprite.on('pointerover', function() {
                    gameState.cardsDealtSound.play({ volume: 0.6 });
                    self.cardTweens(deckCard.sprite, 0.40, 200);
                    deckCard.sprite.setDepth(200);
                }, this);
        
                deckCard.sprite.on('pointerout', function() {
                    self.cardTweens(deckCard.sprite, 0.27, 400);
                    deckCard.sprite.setDepth(cardDepth);
                }, this);
        
                deckCard.sprite.on('pointerup', function() {
                    let nextlevelstarting = false;
                    console.log(`Deck length before removal: ${gameState.deck.length}`);
                    deck.splice(deck.indexOf(deckCard), 1);
        
                    deck.forEach( (card) => {
                        card.sprite.removeInteractive(); 
                        if (card !== deckCard) {
                            fadeOutGameObject(deckCard.sprite, 200);
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
        
                    self.add.text(550, 180, 'Removed 1 card', { fontSize: '40px', fill: '#000000' }).setOrigin(0.5);
                    console.log(`Deck length after removal: ${gameState.deck.length}`);
                   
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
        };

        function startNextLevel() {
            self.cameras.main.fadeOut(1000);
            self.time.delayedCall(1000, () => {
            self.scene.start('Level4Fight1');
            });
        }


    // ---------------------------------- PERMANENTS-------------------------------------      

        
            function addPermanent(card) {       
                const slot = gameState.permanentSlots.find(slot => slot.available);   
                if (slot) { // GameState.permanentSlots.find(slot => slot.available) will return undefined if no slots are available.
                    
                    if (card.key === 'kamishimoUberAlles' || card.key === 'hollidayInKamakura' ) {  // NB! Add all cards that are not depleted upon use
                        gameState.discardPile.push(card);
                        gameState.discardPileText.setText(gameState.discardPile.length);
    
                    } else {
                         // filter out the specific card from the deck
                         gameState.deck = gameState.deck.filter(c => c !== card);
                    }
    
                    card.slot.available = true;
                    card.sprite.destroy(); 
                    card.tokenSprite = self.add.sprite(slot.x, slot.y, card.token).setScale(0.075).setInteractive();
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
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteForeverTrue(card); 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    }) 
                    
    
                } else if (card.key === 'rebelSpirit') {
                    gameState.rebelSpirit = true;
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteRebelSpirit(card); 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })
    
                } else if (card.key === 'rebelHeart') {
                    gameState.rebelHeart = true;
    
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteRebelHeart(card);
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })
    
                } else if (card.key === 'bushido') {
                    gameState.bushido = true;
                    updateStrengthAndArmor(gameState.player);
    
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteBushido(card);
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })
    
                } else if (card.key === 'toxicAvenger') {
                    gameState.toxicAvenger = true;
                    gameState.enemies.forEach(enemy => updateStats(enemy));
    
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteToxicAvenger(card); 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })
 
                } else if (card.key === 'kirisuteGomen') {
                    gameState.player.strengthMax += 5;
                    updateStrengthAndArmor(gameState.player);
                
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn && gameState.enemies.some(enemy => enemy.health < 30)) { // Deactivate tokens during the enemys turn
                            depleteKirisuteGomen(card); 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })

                } else if (card.key === 'toxicFrets') {
                    gameState.toxicFrets = true;
                    
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteToxicFrets(card); 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })

                } else if (card.key === 'ashenEncore') {
                    gameState.ashenEncore = true;
                    
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteAshenEncore(card); 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })

                } else if (card.key === 'edoEruption') {
                    gameState.edoEruption = true;
                    
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteEdoEruption(card); 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    }) 

                } else if (card.key === 'steelToe') {
                    gameState.steelToe = true;
                    
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteSteelToe(card); 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    }) 

                
                } else if (card.key === 'kamishimoUberAlles') {
                    // Store current references to tokenSprite and tokenSlot in local variables. 
                    // These will be closed over in the event callback function, ensuring that 
                    // the correct sprite and slot are manipulated when the sprite is clicked, 
                    // even if the card object is later updated with new sprite and slot references.
                    const tokenSprite = card.tokenSprite;
                    const tokenSlot = card.tokenSlot;
                    gameState.kamishimoUberAlles += 1;
                    updateStrengthAndArmor(gameState.player);
    
                    tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
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
                    case 'kamishimoUberAlles': // NB! Add any card that is not allowed to deplete from hand
                    case 'hollidayInKamakura':
                        gameState.currentCards.push(card); 
                        card.slot.available = false;
                        break;
                }
            }    
    
            function displayTokenCard(card) {
    
                card.tokenSprite.on('pointerover', function() {
                    gameState.cardsDealtSound.play({ volume: 1.5 });
                    card.permanentCardSprite = self.add.sprite(550, 300, card.key).setScale(0.55).setDepth(26);
                });
    
                card.tokenSprite.on('pointerout', function() {
                    card.permanentCardSprite.destroy();
                });
            }
    
            function depleteForeverTrue(card) { 
                gameState.foreverTrue = false;
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy();
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                gameState.deck = gameState.deck.filter(c => c !== card); 
                drawNewCards(8);
            }
    
            function depleteRebelSpirit(card) {
                gameState.rebelSpirit = false;
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy();
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                gameState.deck = gameState.deck.filter(c => c !== card);
               
                gameState.player.mana += 3;
                gameState.player.manaMax += 3;
                self.updateManaBar(gameState.player);
            }
    
            function depleteRebelHeart(card) {
                gameState.rebelHeart = false;
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy();
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                gameState.deck = gameState.deck.filter(c => c !== card);
                
                gameState.player.health = Math.min(gameState.player.healthMax, gameState.player.health + 12);
                self.updateHealthBar(gameState.player);
            }
    
            function depleteBushido(card) {
                gameState.bushido = false;
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy();
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                gameState.deck = gameState.deck.filter(c => c !== card);
               
                gameState.player.strengthBase += 6;
                updateStrengthAndArmor(gameState.player);
            }
    
            function depleteToxicAvenger(card) {
                gameState.toxicAvenger = false;
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy();
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                gameState.deck = gameState.deck.filter(c => c !== card);
                
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

                                if (card.sprite) card.sprite.destroy();
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
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy();
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                gameState.deck = gameState.deck.filter(c => c !== card);
               
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
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy();
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                gameState.deck = gameState.deck.filter(c => c !== card);

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
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy(); // Removes the card sprite incase the deplete effect was activated directely
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                gameState.deck = gameState.deck.filter(c => c !== card);
            } 

            function depleteSteelToe(card) {
                gameState.steelToe = false;
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy(); // Removes the card sprite incase the deplete effect was activated directely
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                gameState.deck = gameState.deck.filter(c => c !== card);

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
                character.sprite.removeInteractive();
                character.alive = false;
                character.turnComplete = true;

                if (character != gameState.player) {
                    const indexEnemies = gameState.enemies.indexOf(character);
                    const indexCharacters = gameState.characters.indexOf(character);
                    
                    if (indexEnemies !== -1) {
                    gameState.enemies.splice(indexEnemies, 1);
                    };

                    if (indexCharacters !== -1) {
                        gameState.characters.splice(indexCharacters, 1);
                    };
                };

                const characterObjects = [
                    character.sprite, 
                    character.healthBarBackground,
                    character.healthBar,
                    character.healthBarText,
                    character.manaBarBackground,
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
                    fadeOutGameObject(object, 500);
                })  
            }
        };

        function addHandtoDeck() {    
            while(gameState.currentCards.length > 0) {
                let card = gameState.currentCards.pop();
                if (!card.slot.available) card.slot.available = true;
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
                            //let cardIndex = gameSettings.cardFrameMapping[card.key];
                            //card.sprite = self.add.sprite(0, 0, 'cardSpriteSheet', cardIndex).setScale(0.35).setInteractive();
                            card.sprite = self.add.sprite(0, 0, card.key).setScale(0.35).setInteractive(); //0.35
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

                            gameState.cardsDealtSound.play({ volume: 2.2 });
                            gameState.drawPileText.setText(gameState.drawPile.length);

                            if (gameState.ashenEncore) {
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
            
            enemy.intentionBackground = self.add.sprite(enemy.x + 10, enemy.y - enemy.height / 2 - 33, 'listbox1').setScale(scale * 1.05, 1);
            enemy.intentionBackground.setInteractive().setOrigin(0.5, 1).setAlpha(0.85).setDepth(10);
        };

        function getValueOrInvoke(cardProperty) {
            return typeof cardProperty === 'function' ? cardProperty() : cardProperty;
        }
        
        function normalizeCard(card, target, isLastEnemy = false) {
            const moshpitMassacreCondition = (card.key === 'moshpitMassacre' && gameState.player.stancePoints > 0 && target.poison > 0);
            const scorchedSoulCondition = (card.key === 'scorchedSoul' && target.poison > 0);
            const bladesBlightCondition = (card.key === 'bladesBlight' && target.poison > 0);
            const roninsRotCondition = (card.key === 'roninsRot' && target.poison > 0);
            const kabutuEdoCondition = (card.key === 'kabutu' && gameState.edoEruption && gameState.player.stancePoints > 0);
            const steelToeCondition = (card.key === 'combatBoots' && gameState.steelToe);
            const knuckleFistEdoCondition = (card.key === 'knuckleFist' && gameState.edoEruption && gameState.player.stancePoints < 0)
            
            const steelToeOutcome = gameState.player.stancePoints > 0 ? 2 * (1 + gameState.player.stancePoints) : 2

            //NB! LEVEL-SPECIFIC INCREASE OF FIRE DAMAGE
            return {
                damagePlayed: moshpitMassacreCondition ? 11 : getValueOrInvoke(card.damage),
                firePlayed: 1.5 * ( kabutuEdoCondition ? 2 * gameState.player.stancePoints : scorchedSoulCondition ? 12 : getValueOrInvoke(card.fire) ),
                stancePointsPlayed: kabutuEdoCondition && isLastEnemy ? -1  : getValueOrInvoke(card.stancePoints),
                poisonPlayed: bladesBlightCondition ? target.poison : getValueOrInvoke(card.poison),
                healPlayed: getValueOrInvoke(card.heal),
                strengthPlayed: getValueOrInvoke(card.strength),
                armorPlayed: knuckleFistEdoCondition ? - gameState.player.stancePoints : getValueOrInvoke(card.armor),
                reduceTargetArmorPlayed: steelToeCondition ? steelToeOutcome : getValueOrInvoke(card.reduceTargetArmor),
                reduceTargetStrengthPlayed: roninsRotCondition ? target.poison : getValueOrInvoke(card.reduceTargetStrength),
                drawCardPlayed: getValueOrInvoke(card.drawCard)
            };
        }
        
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
    
                    const cardsPerRow = gameState.drawPile.length < 12 ? 4 : 6;
                    const cardSpacing = 105;
                    const startX = gameState.drawPile.length < 12 ? 400 : 250;
                    const startY = 150;
                    
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
    
                        const cardsPerRow = gameState.discardPile.length < 12 ? 4 : 6;
                        const cardSpacing = 105;
                        const startX = gameState.discardPile.length < 12 ? 400 : 250;
                        const startY = 150;
                        
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
            });
        }


        function addAdminTools() {
            if (gameState.playerName === 'admin') { // For testing purposes
                
                // Get mana
                gameState.getManaButton = self.add.sprite(550, 200, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();
                gameState.getManaText = self.add.text(550, 200, `Get Mana`, { fontSize: '15px', fill: '#ff0000' }).setOrigin(0.5);
                gameState.getManaButton.on('pointerup', () => {
                    if (gameState.playersTurn) {
                        gameState.player.mana = gameState.player.manaMax;
                        self.updateManaBar(gameState.player);
                        console.log('mana gained');
                    }
                })

                //Draw cards
                gameState.drawCardButton = self.add.sprite(550, 300, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();
                gameState.drawCardText = self.add.text(550, 300, `Draw Card`, { fontSize: '15px', fill: '#ff0000' }).setOrigin(0.5);
                gameState.drawCardButton.on('pointerup', () => {
                    if (gameState.playersTurn) {
                        drawNewCards(1);
                        console.log('card drawn');
                    }
                })
    
                //Kill enemy
                gameState.killEnemyButton = self.add.sprite(550, 400, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();
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
