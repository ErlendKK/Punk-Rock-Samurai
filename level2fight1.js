class Level2fight1 extends BaseScene {
    constructor() {
        super('Level2fight1');
    }

    preload() {
        this.load.image('theForest', 'assets/images/theForest.jpg');
        this.load.image('bakgrunnForest1', 'assets/images/bakgrunnForest1.jpg');
        this.load.image('tree1', 'assets/images/sprites/tree1.png');
        this.load.image('tree2', 'assets/images/sprites/tree2.png');
        };

    create() {   
        let self = this;      
        this.baseCreate('bakgrunnForest1');  

        // Set up characters
        this.resetPlayer(gameState.player); //BaseScene
        gameState.player.health = gameState.player.healthMax;

        gameState.enemy1 = {
            name: 'Timbermaw\nLoses Armor when attacked\nTakes 2x damage from Fire',
            sprite: this.add.sprite(690, 330, 'tree1').setScale(0.29).setFlipX(false).setInteractive(), //690 / 350 / .33
            alive: true,
            actions: [],         
            health: 60,
            healthMax: 60,
            strength: 0,
            strengthBase: 0,
            strengthMax: 15,  
            armor: 15,
            armorMax: 15,
            poison: 0
        }
        
        gameState.enemy2 = {
            name: 'Mossbite\nLoses Armor when attacked\nTakes 2x damage from Fire',
            sprite: this.add.sprite(920, 330, 'tree2').setScale(0.29).setFlipX(false).setInteractive(), //910 / 310 / .25
            alive: true,
            actions: [],        
            health: 65, // Set = 0 to reduce the number of enemies to 1
            healthMax: 65,
            strength: 0,
            strengthBase: 0,
            strengthMax: 15, 
            armor: 15,
            armorMax: 15,
            poison: 0
        }

        gameState.enemies = [gameState.enemy1, gameState.enemy2];
        gameState.characters = [...gameState.enemies, gameState.player];
        let statsTextConfig = { fontSize: '11px', fill: '#FFFFFF' }
        
        gameState.characters.forEach( (character) => {
            character.height = character.sprite.displayHeight;
            character.width = character.sprite.displayWidth;

            character.strengthAndArmorImage = this.add.sprite(character.sprite.x - 20, 460, 'strengthAndArmor').setScale(0.4).setInteractive().setDepth(20);
            character.armorText = this.add.text(character.sprite.x + 13, 462, `${character.armor}/${character.armorMax}`, statsTextConfig).setDepth(25);
            character.strengthText = this.add.text(character.sprite.x - 40, 462, `${character.strength}/${character.strengthMax}`, statsTextConfig).setDepth(25);
        })


        // Add health and mana bars
        function addHealthBar(character, color) {
            character.healthBarBackground = self.add.graphics();
            character.healthBarBackground.lineStyle(3, 0x000000, 1);
            character.healthBarBackground.strokeRect(character.sprite.x - 40, character.sprite.y - character.height / 2 - 30, 100, 10);    
            character.healthBar = self.add.graphics();
            character.healthBar.fillStyle(color, 1);
            character.healthBar.fillRect(character.sprite.x - 40, character.sprite.y - character.height / 2 - 30, 100 * (character.health / character.healthMax), 10);
            character.healthBarText = self.add.text(character.sprite.x - 18, character.sprite.y - character.height / 2 - 25, `${character.health}/${character.healthMax}`, { fontSize: '11px', fill: '#000000' }).setOrigin(0.5);      
        };

        addHealthBar(gameState.player, '0x00ff00');
        addHealthBar(gameState.enemy1, '0xff0000');
        addHealthBar(gameState.enemy2, '0xff0000');

        gameState.player.manaBarBackground = this.add.graphics();
        gameState.player.manaBarBackground.lineStyle(3, 0x000000, 1);
        gameState.player.manaBarBackground.strokeRect(gameState.player.sprite.x - 40, gameState.player.sprite.y - gameState.player.height / 2 - 45, 100, 10); 
        gameState.player.manaBar = this.add.graphics();
        gameState.player.manaBar.fillStyle(0x0000ff, 1); 
        gameState.player.manaBar.fillRect(gameState.player.sprite.x - 40, gameState.player.sprite.y - gameState.player.height / 2 - 45, 100 * (gameState.player.mana / gameState.player.manaMax), 10);
        gameState.player.manaBarText = this.add.text(gameState.player.sprite.x - 27, gameState.player.sprite.y - gameState.player.height / 2 - 40, `${gameState.player.mana}/${gameState.player.manaMax}`, { fontSize: '11px', fill: '#000000' }).setOrigin(0.5);


        // Add Stancebar
        gameState.player.stancePoints = 0;

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
        
        let stanceTextConfig = { fontSize: '30px', fill: '#a9a9a9' }      
        gameState.stanceText = self.add.text(550, gameState.stanceBarMargin - 25, `Stance: ${gameState.player.stance}`, stanceTextConfig).setOrigin(0.5).setInteractive();      
        

        // Add description boxes for pointerover
        gameState.stanceText.on('pointerover', function() {
                let stanceText = `Stance represents the ever-shifting balance\nbetween the conflicting ideals of the\npunk rock samurai: Discipline and Freedom.\n\nPositive Discipline during your turn:\n+3 Strength\n\nPositive Discipline at the end of your turn:\n+3 Armor\n\nMax Discipline at the end of your turn:\n-1 card next turn\n\nPositive Freedom during your turn:\n+1 mana\n\nPositive Freedom at the end of your turn:\n+1 card next turn\n+1 mana next turn\n\nMax Freedom at the end of your turn:\n-2 Armor`; 
                gameState.stanceDescriptionBackground = self.add.sprite(550, gameState.stanceBarBackground.y + 50, 'listbox2').setScale(2.9, 7.4).setInteractive().setDepth(20).setOrigin(0.5, 0).setAlpha(0.85);
                gameState.stanceDescriptionText = self.add.text(550, gameState.stanceBarBackground.y + 97, stanceText, { fontSize: '14px', fill: '#5A5A5A' }).setDepth(25).setOrigin(0.5, 0);
        })

        gameState.stanceText.on('pointerout', function() {
            gameState.stanceDescriptionBackground.destroy();
            gameState.stanceDescriptionText.destroy();
        })

        function describeCharacter(character) {
            if (!gameState.targetingCursor.visible && character.alive === true) {
                character.sprite.on('pointerover', function() {
                    let armorText = character.armor < 0 ? "more" : "less";
                    let strengthText = character.strength < 0 ? "less" : "more";
                    let fullText = `${character.name}\n\n${character.armor} armor: Take ${Math.abs((character.armor / 20) * 100)} %\n${armorText} physical damage\n\nMax armor: Take 75 %\nless physical damage \n\n${character.strength} Strength: Deal ${Math.abs(character.strength) * 10} %\n${strengthText} physical damage\n\nMax strength: Deal 150 %\nmore physical damage\n\nPoison: ${character.poison}\nPoison change per turn: ${character.poison > 0 ? -1 : 0}`
                    const x = character.sprite.x - character.width / 2
                    const y = 330
            
                    character.descriptionBackground = self.add.graphics({x: x - 190, y: y - 120});
                    character.descriptionBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.9).setInteractive().setDepth(30)
                    character.descriptionBackground.fillRect(0, 0, 230, 260);
                    character.descriptionText = self.add.text(x + 10 , y + 5, fullText, { fontSize: '12px', fill: '#000000' }).setDepth(35).setOrigin(1, 0.5);
                })
            }

            character.sprite.on('pointerout', function() {
                // The conditional is needed incase the player points the cursor over a sprite before describeCharacter() is called
                if (character.descriptionBackground) character.descriptionBackground.destroy();
                if (character.descriptionText) character.descriptionText.destroy();
            })
        }

        gameState.characters.forEach( character => describeCharacter(character) );


        // Initiate decks and permanents
             
        gameState.drawPile = [...gameState.deck];
        gameState.discardPile = [];

        gameState.kamishimoUberAlles = 0;

        gameState.permanents.forEach(permanent => {
            let card = permanent.card;
            let slot = permanent.slot;
            card.tokenSprite = self.add.sprite(slot.x, slot.y, card.token).setScale(0.08).setInteractive(); 
            slot.available = false; 
            card.tokenSlot = slot;
            displayTokenCard(card);  
            activatePermanentFromToken(card);
        });


        //Ready.. Fight!
        function startFight() {
            gameState.turn = 0;
            let startTextConfig = { fontSize: '60px', fill: '#ff0000', fontFamily: 'Rock Kapak' }
            gameState.startText = self.add.text(550, 300, 'Level 2\nFight 1!', startTextConfig).setDepth(200).setOrigin(0.5); 
            gameState.musicTheme.stop();
            updateHealthBar(gameState.enemy2); // Removes the enemy if health is set = 0
            shuffleDeck(gameState.drawPile);
                               
            self.time.delayedCall(350, () => {    
               gameState.music.play( { loop: true, volume: 0.35 } );
            })
        
            self.time.delayedCall(3000, () => { //timer: 3000
                fadeOutGameObject(gameState.startText, 200);
                self.time.delayedCall(600, startPlayerTurn());
            });      
        }

        let levelTextConfig = { fontSize: '100px', fill: '#ff0000', fontFamily: 'Rock Kapak' };   
        let level3image = this.add.image(0,0, 'theForest').setScale(0.87).setOrigin(0.02,0).setDepth(300);
        let level3textTop = this.add.text(550, 270, 'Level 2:', levelTextConfig).setDepth(301).setOrigin(0.5);
        let level3textBottom = this.add.text(550, 430, 'The Forest', levelTextConfig).setDepth(301).setOrigin(0.5);
        let levelStarting = false; 
        
        self.time.delayedCall(4000, () => { //timer: 2300
            if (!levelStarting) {
                levelStarting = true
                fadeOutGameObject(level3image, 2000); 
                fadeOutGameObject(level3textTop, 2000);
                fadeOutGameObject(level3textBottom, 2000);
                self.time.delayedCall( 2200, startFight() );
            }
        })

        self.input.on('pointerup', () => {
            if (!levelStarting) {
                levelStarting = true
                fadeOutGameObject(level3image, 2000);
                fadeOutGameObject(level3textTop, 2000);
                fadeOutGameObject(level3textBottom, 2000);
                self.time.delayedCall( 2200, startFight() );
            }
        })
    
    // ---------------------------------- PLAYERS TURN -------------------------------------    
    
    
        function startPlayerTurn() { //NB! LEVEL-SPECIFIC FUNCTION: don't copy elsewhere!
            let numCards = gameState.player.numCardsBase + gameState.player.numCardsStance;
            gameState.turn += 1;
            gameState.endOfTurnButtonPressed = false; // Plays a different role than gameStale.playersTurnStarte, so keep both!
            gameState.yourTurnText = self.add.text(550, 300, 'Your turn!', { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5);
            gameState.player.poisonText = self.add.text(570, 350, '', { fontSize: '25px', fill: '#ff0000' }).setOrigin(0.5);
            console.log(`player's turn number ${gameState.turn} has started`);

            gameState.player.armorCard = 0;
            gameState.player.strengthCard = 0;

            gameState.player.manaMax = (gameState.rebelSpirit && gameState.turn % 3 === 0) ? 1 + gameState.player.manaBase + gameState.player.manaStance : gameState.player.manaBase + gameState.player.manaStance 
            gameState.player.mana = gameState.player.manaMax;

            if (gameState.foreverTrue && gameState.player.stancePoints > 0) {
                gameState.player.manaMax += 1;
                gameState.player.mana += 1;
            } else {
                gameState.player.stancePoints = 0; // Stance must be reset after mana
            };

            updateStanceBar(gameState.player);
            updateManaBar(gameState.player);
            posionMechanic(gameState.player);
            updateHealthBar(gameState.player);
            updateStrengthAndArmor(gameState.player);

            self.time.delayedCall(1800, () => { //timer: 2000
                
                fadeOutGameObject(gameState.yourTurnText, 200);
                gameState.player.poisonText.destroy();
                if (gameState.turn === 1) {
                    let textConfig = { fontSize: '38px', fill: '#ff0000', fontWeight: 'bold' };
                    let treesInfoText  = self.add.text(550, 300, `Trees start with full\narmor, and lose 1 Armor\n  when attacked`, textConfig).setOrigin(0.5).setDepth(201);
                    let textWidth = treesInfoText.width;
                    let textHeight = treesInfoText.height;
                    let paddingX = 20;
                    let paddingY = 20;
                    const treesInfoTextBackground = self.add.graphics();
                    treesInfoTextBackground.fillStyle(0xFFFFFF, 0.70);
                    treesInfoTextBackground.fillRect(treesInfoText.x - (textWidth / 2) - paddingX, treesInfoText.y - (textHeight / 2) - paddingY, textWidth + 2 * paddingX, textHeight + 2 * paddingY).setDepth(200);
                    
                    self.time.delayedCall(4500, () => {
                        fadeOutGameObject(treesInfoText, 200);
                        fadeOutGameObject(treesInfoTextBackground, 200);
                        drawCards(numCards);
                    
                        gameState.enemies.forEach( enemy => {
                            updateEnemyActions();  
                            selectEnemyAction(enemy);
                            displayEnemyIntention(enemy);
                        });
                    });     
                } else {
                    drawCards(numCards);
                    
                    gameState.enemies.forEach( enemy => {
                        updateEnemyActions();  
                        selectEnemyAction(enemy);
                        displayEnemyIntention(enemy);
                    });
                }
            })
        };

        // Create grid for cards
        let x = 550 - 4 * 80;
        let y = 580;
        let spacing = 90;
        let cardAngle = 4;
        let hightAdjustment = 10

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

            let startSlotIndex = Math.floor((gameState.slots.length - numCards) / 2);
            
            for (let i = 0; i < numCards; i++) {
                self.time.delayedCall(i * 75, () => {
        
                    // Check and reshuffle the deck if necessary
                    if (gameState.drawPile.length === 0) {
                        gameState.drawPile = gameState.discardPile;
                        shuffleDeck(gameState.drawPile);    
                        gameState.discardPile = [];
                    }
        
                    // Draw a card and create a sprite for it
                    let card = gameState.drawPile.pop();
                    let cardDepth = 10 + i + startSlotIndex;
                    card.sprite = self.add.sprite(0, 0, card.key).setScale(0.35).setInteractive();
                    card.isBeingPlayed = false;
                    gameState.currentCards.push(card);
                    card.sprite.setDepth(cardDepth);
                    
                    // Position the sprite
                    let slot = gameState.slots[startSlotIndex + i];
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
                    updateDeckImageText();
                    animateCard(card, cardDepth)

                    if (gameState.playersTurn) { // NB! Dont allow the player to click before all cards are dealt
                        card.sprite.on('pointerup', function() {
                            activateCard(card)
                        })
                    }
                })
            }

            gameState.playersTurn = true; // Only now should tokens be set interactive

        }
 
        function animateCard(card, depth) {
            card.sprite.on('pointerover', function() {
                gameState.cardsDealtSound.play({ volume: 0.6 })
                self.tweens.add({
                    targets: card.sprite,
                    y: 500,
                    angle: 0,
                    scaleX: 0.50, // 0.5
                    scaleY: 0.50,
                    duration: 300,
                    ease: 'Cubic'
                });
                card.sprite.setDepth(100);
            }, this);

            card.sprite.on('pointerout', function() {
                if (!card.isBeingPlayed) {
                    self.tweens.add({
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
        
        function activateCard(card) {

            gameState.costPlayed = typeof card.cost === 'function' ? card.cost() : card.cost;
            gameState.typePlayed = typeof card.type === 'function' ? card.type() : card.type;

            if (gameState.player.mana >= gameState.costPlayed) {
                gameState.player.mana -= gameState.costPlayed;
                updateManaBar(gameState.player);
                console.log(`activated card: ${card.key}\nCost: ${gameState.costPlayed}`)
                gameState.player.freedomBeforeCardPlayed = (gameState.player.stance === 'Freedom') ? true : false; // Used in playCard() to detect changes in stance
                card.isBeingPlayed = true;
                gameState.currentCards = gameState.currentCards.filter(c => c !== card);
                
                // Make the card slot available again
                if (card.slot) card.slot.available = true;

                // Select mode of activation based on card type
                if (gameState.typePlayed === 'targetSelected') {
                    targetEnemy(card, gameState.currentCards);
                    console.log('played attack card');

                } else if (gameState.typePlayed === 'targetAll') {
                    gameState.discardPile.unshift(card);
                    console.log(`gameState.typePlayed === 'targetAll'`)

                    // Makes a shallow copy to ensure that playCard() continues for enemy2 even if enemy1 gets killed and thus removed from gameState.enemies by checkIfDead()
                    let enemiesCopy = [...gameState.enemies]; 
                    enemiesCopy.forEach( enemy => playCard(card, enemy)); 

                } else if (gameState.typePlayed === 'permanent') {
                    addPermanent(card)
                    console.log(`gameState.typePlayed === 'permanent'`)    

                } else {
                    gameState.discardPile.unshift(card);
                    playCard(card, gameState.player);
                    console.log('played non-attack card');
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
                        gameState.discardPile.unshift(card);
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
        
        function playCard(card, target) {
            let damagePlayed = typeof card.damage === 'function' ? card.damage() : card.damage;
            let firePlayed = typeof card.fire === 'function' ? card.fire() : card.fire;
            let stancePointsPlayed = typeof card.stancePoints === 'function' ? card.stancePoints() : card.stancePoints;
            let poisonPlayed = typeof card.poison === 'function' ? card.poison() : card.poison;
            let healPlayed = typeof card.heal === 'function' ? card.heal() : card.heal;
            //let poisonRemovePlayed = typeof card.poisonRemove === 'function' ? card.poisonRemove() : card.poisonRemove;
            let strengthPlayed = typeof card.strength === 'function' ? card.strength() : card.strength;
            let armorPlayed = typeof card.armor === 'function' ? card.armor() : card.armor;
            let reduceTargetArmorPlayed = typeof card.reduceTargetArmor === 'function' ? card.reduceTargetArmor() : card.reduceTargetArmor;
            let reduceTargetStrengthPlayed = typeof card.reduceTargetStrength === 'function' ? card.reduceTargetStrength() : card.reduceTargetStrength;
            let damageTotal = Math.round(Math.max(0, 2 * firePlayed + damagePlayed * (1 + 0.10 * gameState.player.strength) * (1 - target.armor / 20)));
            gameState.score.damageDealt += damageTotal;
                
            gameState.player.health = Math.min(gameState.player.health + healPlayed, gameState.player.healthMax);
            target.health -= damageTotal;
            console.log(`playCard started\ndamagePlayed: ${damagePlayed} to enemy ${target.name}\nfirePlayed: ${firePlayed} to enemy ${target.name}`);
            fadeOutGameObject(card.sprite, 200); 
            gameState.targetingCursor.setVisible(false);

            if (gameState.actionText) {
                fadeOutGameObject(gameState.actionText, 200);
            }            
             
            // Special cards
            if (card.key === 'seppuku' || card.key === 'boneShredder') { // Permanent tokens that increase strength for the rest of the fight
                gameState.player.strengthBase += strengthPlayed;
            } else {
                gameState.player.strengthCard += strengthPlayed;
            }

            if (card.key === 'powerChord' && gameState.player.stancePoints > 0) { 
                drawNewCards(3); 
                }

            if (card.key === 'boneShredder' && gameState.player.stancePoints > 0) { 
                drawNewCards(1); 
            }  

            
            // Normal cards    
            gameState.player.armorCard += armorPlayed;
            gameState.player.poison = Math.max(0, gameState.player.poison - card.poisonRemove); 

            if (target != gameState.player) {
                target.strengthBase -= reduceTargetStrengthPlayed;
                target.armor -= reduceTargetArmorPlayed;
                target.poison += poisonPlayed;
            }

            if (gameState.typePlayed === 'targetSelected' || gameState.typePlayed === 'targetAll') {
                self.cameras.main.shake(100, .003, false);
                gameState.attackSound.play({ volume: 0.8 });
                gameState.actionText = (poisonPlayed > 0) ? self.add.text(550, 300, `Deals ${poisonPlayed} Poison`, { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5) : self.add.text(550, 300, `Deals ${damageTotal} damage`, { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5);
                
                self.tweens.add({
                    targets: gameState.player.sprite,
                    x: gameState.player.sprite.x + 60,
                    duration: 120,
                    ease: 'Cubic',
                    yoyo: true
                });

            } else if (strengthPlayed > 0) {
                gameState.powerUpSound.play({ volume: 0.15 });
                gameState.actionText = self.add.text(550, 300, `Gains ${strengthPlayed} Strength`, { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5);
                powerUpTweens(gameState.player);

            } else if (armorPlayed > 0) {
                gameState.powerUpSound.play({ volume: 0.15 });
                gameState.actionText = self.add.text(550, 300, `Gains ${armorPlayed} Armor`, { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5);
                powerUpTweens(gameState.player);
            }

            if (gameState.player.stancePoints + stancePointsPlayed >= -3 && gameState.player.stancePoints + stancePointsPlayed <= 3) {
                gameState.player.stancePoints += stancePointsPlayed;
                updateStanceBar(gameState.player); 
            }

            gameState.player.freedomAfterCardPlayed = gameState.player.stance === 'Freedom' ? true : false; // Checking if stance changed from non-freedom to freedom
            console.log(`freedomAfterCardPlayed: ${gameState.player.freedomAfterCardPlayed}`)
            if (!gameState.player.freedomBeforeCardPlayed && gameState.player.freedomAfterCardPlayed) {
                gameState.player.mana += 1;
                gameState.player.manaMax += 1;
                updateManaBar(gameState.player)
                console.log(`stance changed\nmana: ${gameState.player.mana}\nmax mana: ${gameState.player.manaMax} `)
            }

            updateHealthBar(gameState.player);
            updateStrengthAndArmor(gameState.player);

            if (damagePlayed > 0 && target.armor > 0) { //NB! LEVEL-SPECIFIC CONDITION FOR LEVEL 2-1 AND 2-3
                target.armor -= 1;
            }

            if (target != gameState.player) { // This must be done for gameState.player anyways. This condition avoids unnecesary operations.
                updateStats(target);
                updateHealthBar(target);
            }

            checkGameOver();
            gameState.enemies.forEach( enemy => updateEnemyIntention(enemy) )

            self.time.delayedCall(1500, () => {   
                if (gameState.actionText) {gameState.actionText.destroy()};
            })
            

            console.log(`${card.key} played. Available slots: ${gameState.slots.filter(c => c.available).length}`)
                console.log(`gameState.current.length: ${gameState.currentCards.length}`)

        }
        
        // Initiate endOfTurnButton      
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
        
        gameState.endOfTurnButton.on('pointerup', function () {
            if (gameState.targetingCursor.visible) {
                self.cameras.main.shake(70, .002, false)

            } else {    
                this.setTexture('rectangularButtonPressed');
                this.removeInteractive()
                gameState.buttonPressedSound.play();
                gameState.endOfTurnButtonPressed = true;
                addHandtoDeck();
                updateStrengthAndArmor(gameState.player)
                updateEnemyActions()

                if (gameState.rebelHeart) { // add health if rebelHeart is active
                    gameState.player.health = Math.min(gameState.player.healthMax, gameState.player.health + Math.abs(gameState.player.stancePoints) );
                    updateHealthBar(gameState.player);
                }

                gameState.enemies.forEach( enemy => {
                    enemy.turnComplete = enemy.alive ? false : true;
                    fadeOutGameObject(enemy.intentionText, 200)
                    fadeOutGameObject(enemy.intentionBackground, 200) 
                })

                if (gameState.player.mana != 0) { 
                    gameState.player.mana = 0;
                    updateManaBar(gameState.player);
                }

                if (gameState.actionText) {
                    fadeOutGameObject(gameState.actionText, 200);
                }
                
                if (gameState.enemy1.alive) {
                    startEnemyTurn(gameState.enemy1);

                } else if (gameState.enemy2.alive) {
                    startEnemyTurn(gameState.enemy2);
                }
            }
        });
    
    
    // ---------------------------------- ENEMY'S TURN -------------------------------------      
     
    function startEnemyTurn(enemy) {
        if (gameState.playersTurn) { // This is called here to ensure that "Enemy turn" is only declared once eventhough multiple enemies play their turns.
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
        posionMechanic(enemy);
    
        let delaytime = (enemy.poisonText._text === '' && !enemy.turnText) ? 800 : 1800;
    
        self.time.delayedCall(delaytime, () => {
            enemy.poisonText.destroy();
    
            // Perform the chosen action
            let chosenAction = enemy.chosenAction;
            gameState.player.poison += chosenAction.poison;
            enemy.health = Math.min(enemy.health + chosenAction.heal, enemy.healthMax);
            enemy.strengthBase = Math.min(enemy.strengthBase + chosenAction.strength, enemy.strengthMax);
            updateStats(enemy);
            enemy.armor = Math.min(enemy.armor + chosenAction.armor, enemy.armorMax);    
    
            if (chosenAction.damage > 0 || chosenAction.fire > 0) {
                self.cameras.main.shake(120, .005, false);
                gameState.attackSound.play({ volume: 0.8 });
                console.log(`chosenAction.damage: ${chosenAction.damage}`)
                console.log(`chosenAction.fire: ${chosenAction.fire}`)
                console.log(`enemy.damageTotal: ${enemy.damageTotal}`)
                console.log(`enemy.damageTotal: ${gameState.player.health}`)

                enemy.damageTotal = Math.round( Math.max(0, chosenAction.fire + chosenAction.damage * (1 + 0.1 * enemy.strength) * (1 - gameState.player.armor / 20)) );
                gameState.player.health -= enemy.damageTotal;
                gameState.score.damageTaken += enemy.damageTotal;
                gameState.actionText = self.add.text(550, 300, `Deals ${enemy.damageTotal} damage`, { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5);
                
                self.tweens.add({
                    targets: enemy.sprite,
                    x: enemy.sprite.x - 60,
                    duration: 120,
                    ease: 'Cubic',
                    yoyo: true
                })
    
            } else if (chosenAction.heal > 0) {
                gameState.healSound.play({ volume: 0.5 });
                gameState.actionText = self.add.text(550, 300, chosenAction.text, { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5);
                powerUpTweens(enemy);
                
    
            } else if (chosenAction.strength > 0 || chosenAction.armor > 0 || chosenAction.poison > 0)  {
                gameState.powerUpSound.play({ volume: 0.2 });
                gameState.actionText = self.add.text(550, 300, chosenAction.text, { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5);
                powerUpTweens(enemy);
            }
    
            concludeEnemyAction(enemy);
        })
    }

    function concludeEnemyAction(enemy) {
        updateHealthBar(gameState.player);
        console.log(`enemy: ${enemy}\nplayer health: ${gameState.player.health}`)
        updateHealthBar(enemy);
        updateStats(gameState.player);
        updateStats(enemy);
        updateEnemyActions();  
        selectEnemyAction(enemy)
        
        self.time.delayedCall(1500, () => {
            fadeOutGameObject(gameState.actionText, 200);
            enemy.turnComplete = true;
    
            if (!checkGameOver() && gameState.enemy1.turnComplete && gameState.enemy2.alive && !gameState.enemy2.turnComplete) {
                startEnemyTurn(gameState.enemy2);
            } else if ( !checkGameOver() && gameState.enemies.every( enemy => enemy.turnComplete) ) {
                startPlayerTurn();
            }
        })
    };

    function updateEnemyActions() {

        if (gameState.turn === 1) {
            gameState.enemy1.actions = [
                {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 3, armor: 0, text: 'Gains 3 Strength', probability: 1},
            ]
            
            gameState.enemy2.actions = [
                {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 3, armor: 0, text: 'Gains 3 Strength', probability: 1},
            ]
            
        } else if (gameState.turn === 2) {
            gameState.enemy1.actions = [
                {key: `Intends to\nRest`, damage: 0, fire: 0, poison: 0, heal: 10, poisonRemove: 0, strength: 0, armor: 0, text: 'Heals 10 HP', probability: 1},
            ]
            
            gameState.enemy2.actions = [
                {key: `Intends to\nRest`, damage: 0, fire: 0, poison: 0, heal: 10, poisonRemove: 0, strength: 0, armor: 0, text: 'Heals 10 HP', probability: 1},
            ]
            
        } else if (gameState.turn === 3) {
            gameState.enemy1.actions = [
                {key: () => `Intends to\nDeal ${Math.round(13 * (1 + 0.10 * gameState.enemy1.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 13, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 13 damage', probability: 1},
            ]
            
            gameState.enemy2.actions = [
                {key: () => `Intends to\nDeal ${Math.round(13 * (1 + 0.10 * gameState.enemy2.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 13, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 13 damage', probability: 1},
            ]

        } else if (gameState.turn === 4) {
            gameState.enemy1.actions = [
                {key: `Intends to\nRest`, damage: 0, fire: 0, poison: 0, heal: 5, poisonRemove: 0, strength: 0, armor: 0, text: 'Heals 10 HP', probability: 1},
            ]
            
            gameState.enemy2.actions = [
                {key: `Intends to\nRest`, damage: 0, fire: 0, poison: 0, heal: 5, poisonRemove: 0, strength: 0, armor: 0, text: 'Heals 10 HP', probability: 1},
            ]

        } else {

            gameState.enemy1.actions = [ 
                {key: `Intends to\nDeal 5 fire damage`, damage: 0, fire: 5, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: `Deals 5 fire damage`, probability: 0.10 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
                {key: () => `Intends to\nDeal ${Math.round(12 * (1 + 0.10 * gameState.enemy1.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 12, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 12 damage', probability: 0.235 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
                {key: () => `Intends to\nDeal ${Math.round(16 * (1 + 0.10 * gameState.enemy1.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 16, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 16 damage', probability: 0.17 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
                {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 15, poisonRemove: 0, strength: 0, armor: 1, text: 'Heals 15 HP\nGains 1 armor', probability: (gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0 : 0.17},
                {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 25, poisonRemove: 0, strength: 0, armor: 0, text: 'Heals 25 HP', probability: (gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0 : 0.05},
                {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 2, armor: 0, text: 'Gains 2 strenght', probability: 0.125 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
                {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 3, text: 'Gains 3 armor', probability: 0.15 + ((gameState.enemy1.health >= gameState.enemy1.healthMax) ? 0.22 : 0) / 5},
                {key: `Intends to\nPoison you`, damage: 0, fire: 0, poison: 5, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 5 poison', probability: 0.00}
            ]
        
            gameState.enemy2.actions = [ 
                {key: `Intends to\nDeal 10 fire damage`, damage: 0, fire: 10, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 10 fire damage', probability: 0.10 + ((gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0.22 : 0) / 5},
                {key: () => `Intends to\nDeal ${Math.round(15 * (1 + 0.10 * gameState.enemy2.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 15, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 15 damage', probability: 0.23 + ((gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0.22 : 0) / 5},
                {key: () => `Intends to\nDeal ${Math.round(20 * (1 + 0.10 * gameState.enemy2.strength) * (1 - gameState.player.armor / 20))} damage`, damage: 20, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 20 damage', probability: 0.15 + ((gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0.22 : 0) / 5},
                {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 15, poisonRemove: 0, strength: 0, armor: 1, text: 'Heals 15 HP\nGains 1 armor', probability: (gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0 : 0.17},
                {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 25, poisonRemove: 0, strength: 0, armor: 0, text: 'Heals 25 HP', probability: (gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0 : 0.05},
                {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 3, armor: 0, text: 'Gains 3 strenght', probability: 0.13 + ((gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0.22 : 0) / 5},
                {key: `Intends to\nApply a buff`, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 3, text: 'Gains 3 armor', probability: 0.17 + ((gameState.enemy2.health >= gameState.enemy2.healthMax) ? 0.22 : 0) / 5},
                {key: `Intends to\nPoison you`, damage: 0, fire: 0, poison: 5, heal: 0, poisonRemove: 0, strength: 0, armor: 0, text: 'Deals 5 poison', probability: 0.00}
            ]
        }
    
    }    

    function selectEnemyAction(enemy) {
                  
        // Calculate the cumulative probabilities
        let cumProb = 0;
        for(let i = 0; i < enemy.actions.length; i++) {
            cumProb += enemy.actions[i].probability;
            enemy.actions[i].cumulativeProbability = cumProb;
        }
    
        let rand = Math.random();
        enemy.chosenAction = enemy.actions.find(action => rand < action.cumulativeProbability);
    }    
   
    
        // ---------------------------------- END OF GAME -------------------------------------      
    
    
        function checkGameOver() {  

            if (!gameState.player.alive) {
                gameState.playersTurn = false;
                initiateDefeat();
                return true;
            
            } else if (!gameState.enemy1.alive && !gameState.enemy2.alive) {
                gameState.playersTurn = false;
                initiateVictory();
                return true;

            } else {
                return false;
            }   
        }

        function initiateDefeat() {
            gameState.player.health = 0; // Avoids negative life
            updateManaBar(gameState.player);
            addHandtoDeck()
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
            updateManaBar(gameState.player);
            addHandtoDeck()
            
            self.time.delayedCall(600, () => {
                if (gameState.attackSound.isPlaying) {
                    gameState.attackSound.stop();
                }
                gameState.victorySound.play( { volume: 0.9, rate: 1 } );
                clearBoard();
                console.log('board cleared');
            })
        
            //fadeOutGameObject(gameState.actionText, 200);
            if (gameState.actionText) {
                gameState.actionText.destroy()
                console.log(`gameState.actionText still existed at initiateVictory and got destroyed`)
            }
            let victoryText = self.add.text(550, 300, 'Victory!', { fontSize: '100px', fill: '#ff0000', fontFamily: 'Rock Kapak' }).setOrigin(0.5);
            
            self.time.delayedCall(2000, () => {
                gameState.musicTheme.play( { loop: true, volume: 0.30 } );
                victoryText.destroy()
                chooseReward();
            })
        }
        
        function chooseReward() {
            shuffleDeck(gameState.bonusCards);
            gameState.gameOverText = self.add.text(550, 180, 'Choose a reward', { fontSize: '40px', fill: '#000000' }).setOrigin(0.5).setDepth(103);
            gameState.rewardAddCardsButton = self.add.image(550, 400, 'rectangularButton').setScale(1.2).setInteractive().setOrigin(0.5).setDepth(102); // Dept > 100 is to ensure that it stays on top of card sprites that fail to clear
            gameState.rewardAddCardsText = self.add.text(550, 400, 'Add 1 card\nto your deck', { fontSize: '25px', fill: '#000000' }).setOrigin(0.5).setDepth(103);


            gameState.rewardAddCardsButton.on('pointerover', function() {
                this.setTexture('rectangularButtonHovered');
            });

            gameState.rewardAddCardsButton.on('pointerout', function() {
                this.setTexture('rectangularButton');
            });
            
            gameState.rewardAddCardsButton.on('pointerup', function() {
                gameState.rewardAddCardsText.destroy();
                gameState.gameOverText.destroy();
                gameState.rewardAddCardsButton.destroy();
                rewardAddCard();
            })
        }

         
        function rewardAddCard() {
            console.log(`rewardAddCard called`)
            gameState.gameOverText.destroy();     
            
            const x = 320;
            const y = 300;
            const spacing = 220;
        
            let bonusCards = gameState.bonusCards.slice(0, 3);
            console.log(`bonusCards: ${bonusCards.key}`)
        
            bonusCards.forEach( (bonusCard, index) => {
                bonusCard.sprite = self.add.sprite(x + index * spacing, y, bonusCard.key).setScale(0.45).setInteractive().setDepth(102);;
                console.log(`bonusCardsprite added for: ${bonusCard.key}`)
        
                bonusCard.sprite.on('pointerover', function() {
                    gameState.cardsDealtSound.play({ volume: 0.6 })
                    cardTweens(bonusCard.sprite, 0.58, 200)
                }, this)
                
                bonusCard.sprite.on('pointerout', function() {
                    cardTweens(bonusCard.sprite, 0.45, 400)
                }, this)
        
                bonusCard.sprite.on('pointerup', function() {
                    let nextlevelstarting = false
                    gameState.deck.push(bonusCard);
                    gameState.bonusCards.splice(gameState.bonusCards.indexOf(bonusCard), 1);
        
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
                     
                    self.add.text(550, 180, 'Gained 1 card', { fontSize: '40px', fill: '#000000' }).setOrigin(0.5);
                            
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

        function startNextLevel() {
            self.cameras.main.fadeOut(1000);
            self.time.delayedCall(1000, () => {
            self.scene.start('Level2fight2');
            });
        }


    // ---------------------------------- PERMANENTS-------------------------------------      

        
            function addPermanent(card) {       
                let slot = gameState.permanentSlots.find(slot => slot.available);   
                if (slot) { // GameState.permanentSlots.find(slot => slot.available) will return undefined if no slots are available.
                    
                    if (card.key === 'kamishimoUberAlles' || card.key === 'hollidayInKamakura' ) {  // NB! Add all cards that are not depleted upon use
                        gameState.discardPile.push(card);
    
                    } else {
                         // filter out the specific card from the deck
                         gameState.deck = gameState.deck.filter(c => c !== card);
                    }
    
                    card.slot.available = true;
                    card.sprite.destroy(); 
                    card.tokenSprite = self.add.sprite(slot.x, slot.y, card.token).setScale(0.08).setInteractive();
                    slot.available = false;
                    card.tokenSlot = slot;
                    gameState.permanents.push({ card: card, slot: slot }); 
    
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
                            depleteRebelHeart(card) 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })
    
                } else if (card.key === 'bushido') {
                    gameState.bushido = true;
                    updateStrengthAndArmor(gameState.player);
    
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteBushido(card) 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })
    
                } else if (card.key === 'toxicAvenger') {
                    gameState.toxicAvenger = true;
                    gameState.enemies.forEach(enemy => updateStats(enemy));
    
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteToxicAvenger(card) 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })
                
                } else if (card.key === 'kirisuteGomen') {
                    gameState.player.strengthMax += 5;
                    updateStrengthAndArmor(gameState.player);
    
                    card.tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn && gameState.enemies.some(enemy => enemy.health < 30)) { // Deactivate tokens during the enemys turn
                            depleteKirisuteGomen(card) 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })
                
                } else if (card.key === 'kamishimoUberAlles') {
                    // Store current references to tokenSprite and tokenSlot in local variables. 
                    // These will be closed over in the event callback function, ensuring that 
                    // the correct sprite and slot are manipulated when the sprite is clicked, 
                    // even if the card object is later updated with new sprite and slot references.
                    //let tokenSprite = card.tokenSprite;
                    //let tokenSlot = card.tokenSlot
                    let tokenSprite = card.tokenSprite
                    let tokenSlot = card.tokenSlot
                    gameState.kamishimoUberAlles += 1;
                    updateStrengthAndArmor(gameState.player);
    
                    tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteKamishimoUberAlles(card, tokenSprite,tokenSlot); 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })
    
                } else if (card.key === 'hollidayInKamakura') {  // No effect until depletion
                    let tokenSprite = card.tokenSprite;
                    let tokenSlot = card.tokenSlot
    
                    tokenSprite.on( 'pointerup', () => {
                        if (gameState.playersTurn) { // Deactivate tokens during the enemys turn
                            depleteHollidayInKamakura(card, tokenSprite, tokenSlot) 
                        } else {
                            self.cameras.main.shake(70, .002, false);
                        }
                    })
                }
    
                gameState.permanent
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
                        break;
                    case 'kamishimoUberAlles': // NB! Add all cards that are not allowed to activate depletion effects directly
                    case 'hollidayInKamakura':
                        gameState.currentCards.push(card);
                        card.slot.available = false;
                        break;
                }
            }    
    
            function displayTokenCard(card) {
    
                card.tokenSprite.on('pointerover', function() {
                    gameState.cardsDealtSound.play({ volume: 1.5 });
                    card.permanentCardSprite = self.add.sprite(550, 300, card.key).setScale(0.55);
                })
    
                card.tokenSprite.on('pointerout', function() {
                    card.permanentCardSprite.destroy();
                })
            }
    
            function depleteForeverTrue(card) { 
                gameState.foreverTrue = false;
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy(); // Removes the card sprite incase the deplete effect was activated directely
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                
                drawNewCards(8);
            }
    
            function depleteRebelSpirit(card) {
                gameState.rebelSpirit = false;
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy(); // Removes the card sprite incase the deplete effect was activated directely
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
               
                gameState.player.mana += 3;
                gameState.player.manaMax += 3;
                updateManaBar(gameState.player);
            }
    
            function depleteRebelHeart(card) {
                gameState.rebelHeart = false;
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy(); // Removes the card sprite incase the deplete effect was activated directely
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                
                gameState.player.health = Math.min(gameState.player.healthMax, gameState.player.health + 12);
                updateHealthBar(gameState.player);
            }
    
            function depleteBushido(card) {
                gameState.bushido = false;
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy(); // Removes the card sprite incase the deplete effect was activated directely
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
               
                gameState.player.strengthBase += 6;
                updateStrengthAndArmor(gameState.player);
            }
    
            function depleteToxicAvenger(card) {
                gameState.toxicAvenger = false;
                if (card.tokenSlot) card.tokenSlot.available = true;
                if (card.sprite) card.sprite.destroy(); // Removes the card sprite incase the deplete effect was activated directely
                if (card.tokenSprite) card.tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
                
                gameState.enemies.forEach(enemy => {
                    enemy.poison += 5;
                    updateStats(enemy);
                });
            }
    
            function depleteKirisuteGomen(card) { 
                if (gameState.enemies.some(enemy => enemy.health < 30)) {
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
                                self.cameras.main.shake(150, .02, false);    
                                gameState.player.strengthMax -= 5
                                checkIfDead(enemy);
                                checkGameOver();
                                updateStrengthAndArmor(gameState.player)
                                
                                if (card.tokenSlot) card.tokenSlot.available = true;
                                if (card.sprite) card.sprite.destroy(); // Removes the card sprite incase the deplete effect was activated directely
                                if (card.tokenSprite) card.tokenSprite.destroy();
                                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
    
                            } else {
                                self.cameras.main.shake(70, .002, false);
                                functionActive = false
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
                    }
                }
    
            }
    
            function depleteKamishimoUberAlles(card, tokenSprite, tokenSlot) {
                if (tokenSlot) tokenSlot.available = true;
                if (tokenSprite) tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
    
                gameState.kamishimoUberAlles -= 1;
                updateStrengthAndArmor(gameState.player);
            }
    
            function depleteHollidayInKamakura(card, tokenSprite, tokenSlot) {
                if (tokenSlot) tokenSlot.available = true;
                if (tokenSprite) tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(c => c.card !== card);
    
                gameState.player.manaMax += 1;
                gameState.player.mana += 1;
                updateManaBar(gameState.player);
                drawNewCards(1);
            }
    
    
    // ---------------------------------- UTILITIES-------------------------------------      
    

        // Initiate mute button
        let muteButton = this.add.sprite(1050, 40, 'radioButtonRoundOff').setScale(0.5).setInteractive();
        gameState.muteText = this.add.text(875, 30, 'Mute music', { fontSize: '25px', fill: '#5A5A5A' });    

        muteButton.on('pointerup', () => {

            if (gameState.music.mute) {
                gameState.music.mute = false;
                muteButton.setTexture('radioButtonRoundOff');
            } else {
                gameState.music.mute = true;
                muteButton.setTexture('radioButtonRoundOn');
            }
        });

        // Initiate deck image
        gameState.deckImage = this.add.image(100,600, 'deck').setScale(0.15).setOrigin(.5,.5).setInteractive();
            
        let numOfCardsTextConfig = { fontSize: '45px', fill: '#000000', fontWeight: 'bold' };
        gameState.numOfCardsText = this.add.text(100, 600, gameState.drawPile.length, numOfCardsTextConfig).setDepth(100).setOrigin(.5,.5);

        if (gameState.drawPile.length > 0) {
            gameState.deckImage.on('pointerover', function() {

                const cardsPerRow = 4;
                const cardSpacing = 105;
                const startX = 400;
                const startY = 200;
                
                gameState.drawPile.forEach( (card, index) => {
                    let cardX = startX + (index % cardsPerRow) * cardSpacing;
                    let cardY = startY + Math.floor(index / cardsPerRow) * 1.5 * cardSpacing;

                    let cardImage = self.add.image(cardX, cardY, card.key).setScale(0.27).setDepth(200);
                    gameState.cardImages.push(cardImage);
                })
            });

            gameState.deckImage.on('pointerout', function() {
                gameState.cardImages.forEach(cardImage => {
                    fadeOutGameObject(cardImage, 200);
                });
                gameState.cardImages = [];
            });
        }

        function updateStrengthAndArmor(character) { // Should only be used for character = player. The argument is keept in place for a future revision to multiple player characters.
            let strengthBushido = 0

            if (gameState.endOfTurnButtonPressed) {
                character.armor = Math.min(character.armorMax, character.armorBase + character.armorCard + character.armorStance);
                strengthBushido = gameState.bushido ? Math.floor(character.armor / 4) : 0; // Account for Bushido
                character.strength = Math.min(character.strengthMax, character.strengthBase + character.strengthStance + strengthBushido);
            
            } else {
                character.armor = Math.min(character.armorMax, character.armorBase + character.armorCard);
                strengthBushido = gameState.bushido ? Math.floor(character.armor / 4) : 0; // Account for Bushido
                character.strength = Math.min(character.strengthMax, character.strengthBase + character.strengthStance + character.strengthCard + strengthBushido); 
            }

            if (gameState.kamishimoUberAlles > 0 && gameState.player.stancePoints < 0) { // Adjust for Strength tokens
                character.strength = Math.min(character.strengthMax, character.strength - gameState.player.stancePoints * gameState.kamishimoUberAlles);
            }

            updateStats(character)
        }

        function updateStats(character) {
            
            if (character != gameState.player) { // Account for Toxic Avenger
                character.strength = (gameState.toxicAvenger && character.poison > 0) ? character.strengthBase - 5 : character.strengthBase; 
            };

            // Update displayed stats
            character.armorText.setText(`${character.armor}/${character.armorMax}`);
            character.strengthText.setText(`${character.strength}/${character.strengthMax}`);
        }

        function updateStanceBar(character) {
            let points = gameState.player.stancePoints;
            
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
            }
        
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

        function updateDeckImageText() {
            gameState.numOfCardsText.setText(gameState.drawPile.length);
        }

        function updateHealthBar(character) {
            character.health = Phaser.Math.Clamp(character.health, 0, character.healthMax);
            character.healthBar.clear();
            character.healthBar.fillStyle(character === gameState.player ? 0x00ff00 : 0xff0000, 1);
            character.healthBar.fillRect(character.sprite.x - 40, character.sprite.y - character.height / 2 - 30, 100 * (character.health / character.healthMax), 10);
            character.healthBarText.setText(`${character.health}/${character.healthMax}`);
            
            checkIfDead(character);
        }
        
        function checkIfDead(character) {
            if (character.health <= 0) {
                character.health = 0;
                character.sprite.removeInteractive();
                character.alive = false;
                character.turnComplete = true;

                if (character != gameState.player) {
                    let indexEnemies = gameState.enemies.indexOf(character);
                    let indexCharacters = gameState.characters.indexOf(character);
                    fadeOutGameObject(character.intentionText, 500);
                    fadeOutGameObject(character.intentionBackground, 500);

                    if (character.descriptionBackground) {
                        fadeOutGameObject(character.descriptionBackground, 500);
                        fadeOutGameObject(character.descriptionText, 500);
                    }
                    
                    if (indexEnemies !== -1) {
                    gameState.enemies.splice(indexEnemies, 1);
                    }

                    if (indexCharacters !== -1) {
                        gameState.characters.splice(indexCharacters, 1);
                    }
                }

                fadeOutGameObject(character.sprite, 500);
                fadeOutGameObject(character.healthBarBackground, 500);
                fadeOutGameObject(character.healthBar, 500);
                fadeOutGameObject(character.healthBarText, 500);
                fadeOutGameObject(character.strengthAndArmorImage, 500);
                fadeOutGameObject(character.strengthText, 500);
                fadeOutGameObject(character.armorText, 500);

            }

        };

        function updateManaBar(character) {
            character.mana = Phaser.Math.Clamp(character.mana, 0, character.manaMax);
            character.manaBar.clear();
            character.manaBar.fillStyle(0x0000ff, 1); // Blue color for mana.
            character.manaBar.fillRect(character.sprite.x - 40, character.sprite.y - character.height / 2 - 45, 100 * (character.mana / character.manaMax), 10);
            character.manaBarText.setText(`${character.mana}/${character.manaMax}`);
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
                });
            }
        };

        function powerUpTweens(character) {
            self.tweens.add({
                targets: character.sprite,
                scaleY: character.sprite.scaleX * 1.125,
                scaleX: character.sprite.scaleY * 1.125,
                duration: 120,
                ease: 'Cubic',
                yoyo: true
            });
        };


        function shuffleDeck(deck) {
            for(let i = deck.length - 1; i > 0; i--){
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            return deck;
        };
    
        function addHandtoDeck() {    
            while(gameState.currentCards.length > 0) {
                let card = gameState.currentCards.pop();
                if (!card.slot.available) card.slot.available = true;
                gameState.discardPile.unshift(card);
                fadeOutGameObject(card.sprite, 200);
            }
        };

        function drawNewCards(numCards) { // used for cards/permanents that give "draw [numCards] cards"
            let numCardsLimit = Math.min(gameState.deck.length, 8) // 8 cards is maximum number of cards on hand, use gameState.deck.length as floor to avoid error if gameState.deck.length < 8
            let numOfFreeSlots = gameState.slots.filter(slot => slot.available).length
            numCards = (numOfFreeSlots < numCards) ? numOfFreeSlots : numCards;
            for (let i = 0; i < numCards; i++) {
                self.time.delayedCall(i * 75, () => {
                    if (gameState.currentCards.length < numCardsLimit) {
        
                        // Check and reshuffle the deck if necessary
                        if (gameState.drawPile.length === 0) {
                            gameState.drawPile = gameState.discardPile;
                            shuffleDeck(gameState.drawPile);    
                            gameState.discardPile = [];
                        }
            
                        // Draw a card and create a sprite for it
                            let card = gameState.drawPile.pop();
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
                                animateCard(card, cardDepth) 
                            }

                            gameState.cardsDealtSound.play({ volume: 2.2 });
                            updateDeckImageText();
                            console.log(`DealNewCards played, gameState.slots.length: ${gameState.slots.filter(c => c.available).length}`)
                            console.log(`gameState.current.length: ${gameState.currentCards.length}`)

                            card.sprite.on('pointerup', function() {
                                activateCard(card)    
                            })
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    } 
                });
            }
            
        };
    
        function clearBoard() {

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
            gameState.deckImage.destroy();
            gameState.numOfCardsText.destroy();
            gameState.stanceBar.destroy();
            gameState.stanceText.destroy();
            gameState.stanceBarBackground.destroy();

            if (gameState.actionText) {
                gameState.actionText.destroy();
            };
        };

        function displayEnemyIntention(enemy) {
            const actionKey = typeof enemy.chosenAction.key === 'function' ? enemy.chosenAction.key() : enemy.chosenAction.key;
            enemy.intentionText = self.add.text(enemy.sprite.x + 10, enemy.sprite.y - enemy.height / 2 - 40, `${actionKey}`, { fontSize: '13px', fill: '#000000' }).setOrigin(0.5, 1).setDepth(11);
            const originalSpriteWidth = self.textures.get('listbox1').getSourceImage().width;
            const scale = enemy.intentionText.width / originalSpriteWidth;
            enemy.intentionBackground = self.add.sprite(enemy.sprite.x + 10, enemy.sprite.y - enemy.height / 2 - 33, 'listbox1').setScale(scale * 1.05, 1).setInteractive().setOrigin(0.5, 1).setAlpha(0.85).setDepth(10);
        }

        function updateEnemyIntention(enemy) {
            let actionKey = typeof enemy.chosenAction.key === 'function' ? enemy.chosenAction.key() : enemy.chosenAction.key;
            enemy.intentionText.setText(`${actionKey}`);
        }

        function posionMechanic(character) {
            if (character.poison > 0) {
                updateStats(character);
                character.health = Math.max(1, character.health - character.poison);
                character.poisonText.setText(`Poison: -${character.poison} HP`);
                character.poison -= 1;
            }
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

        function addAdminTools() {
            if (gameState.playerName === 'admin') { // For testing purposes
                    
                gameState.getManaButton = self.add.sprite(550, 200, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();
                gameState.getManaText = self.add.text(550, 200, `Get Mana`, { fontSize: '15px', fill: '#ff0000' }).setOrigin(0.5);
                gameState.getManaButton.on('pointerup', () => {
                    if(gameState.playersTurn) {
                    gameState.player.mana = gameState.player.manaMax;
                    updateManaBar(gameState.player);
                    console.log('mana gained');
                    }
                })
    
                gameState.drawCardButton = self.add.sprite(550, 300, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();
                gameState.drawCardText = self.add.text(550, 300, `Draw Card`, { fontSize: '15px', fill: '#ff0000' }).setOrigin(0.5);
                gameState.drawCardButton.on('pointerup', () => {
                    if(gameState.playersTurn) {
                        drawNewCards(1);
                        console.log('card drawn');
                    }
                })
    
                gameState.killEnemyButton = self.add.sprite(550, 400, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();
                gameState.killEnemyText = self.add.text(550, 400, `Kill Enemy`, { fontSize: '15px', fill: '#ff0000' }).setOrigin(0.5);
                gameState.killEnemyButton.on('pointerup', () => {
                    // The conditional statement is needed to avoid a TypeError when both enemies are dead.
                    if ( gameState.enemies.some( enemy => enemy.health > 0 && gameState.playersTurn) ) {
                        let enemy = gameState.enemies.find( enemy => enemy.health > 0);
                        enemy.health = 0;
                        checkIfDead(enemy);
                        checkGameOver();
                        console.log(`${enemy.name} killed`);
                    }
                })
            
            }
        }
        addAdminTools() 
    
    }; //End of create

    update() {
        if (gameState.targetingCursor.visible) {
            gameState.targetingCursor.x = this.input.mousePointer.x;
            gameState.targetingCursor.y = this.input.mousePointer.y;
        }
    }
} //end of scene


