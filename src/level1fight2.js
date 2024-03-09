/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|

Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

"use strict";

class Level1Fight2 extends BaseScene {
    constructor() {
        super('Level1Fight2');
    }

    preload() {
        const assets = [
            { key: 'bakgrunnCity2', path: '../assets/images/backgrounds/bakgrunnCity2.jpg', loaded: false },
            { key: 'rat1', path: '../assets/images/sprites/rat1.png', loaded: false },
            { key: 'rat2', path: '../assets/images/sprites/rat2.png', loaded: false },
            { key: 'infestation', path: '../assets/images/cards/infestation.jpg', loaded: false }
        ];

        assets.forEach(asset => {
            this.loadAssetWithRetry(asset, 'image', 0, 5);
        });
    }; 

    create() {
        // Initialize level
        const self = this;
        const sceneKey = self.scene.key;
        const testing = false;
        this.saveGameState(sceneKey);    
        this.baseCreate('bakgrunnCity2', sceneKey);
        this.resetPlayer(0.70, 540, 435);
        this.addGoldCounter();
        this.defineCardSlots();

        // Initialize buttons
        gameState.endOfTurnButton = new Button(self, 'End Turn', activateEndOfTurnButton, 1350, 750);
        gameState.endOfTurnButton.setPointerText(`Press to end your turn`);

        gameState.redrawButton = new Button(self, 'Redraw', activateRedrawButton, 1350, 68);
        gameState.redrawButton.setPointerText(`Redraw your hand\n Cost: ${gameState.redrawPrice} gold`);
        gameState.buttons = [gameState.endOfTurnButton, gameState.redrawButton];

        if (gameState.lustForLifeCounter >= 5) {
            gameState.endOfTurnButton = new Button(self, 'Heal', activateHealButton, 1350, 195, 8);
            gameState.endOfTurnButton.setPointerText(` Heal 7 HP\nCost: ${gameState.lustForLifeCost} gold`);
            gameState.buttons.push(gameState.endOfTurnButton);
        }

        gameState.buttons.forEach(button => button.disable());

        // Initialize characters
        gameState.enemy1 = new Enemy('City Rat Jr.', 40, 0, 0, 'infestation');
        gameState.enemy1.sprite = this.add.image(945, 505, 'rat1').setScale(0.58).setFlipX(true);

        gameState.enemy1.actions = [
            // Predetermined turns
            new Action({ enemy: 1, turn: 1, poison: 5 }).setKey(`Intends to\nPoison you`),
            new Action({ enemy: 1, turn: 2, heal: 10, armor: 4 }).setKey('Intends to\nApply a buff'),
            new Action({ enemy: 1, turn: 3, poison: 4 }).setKey(`Intends to\nPoison you`),
            new Action({ enemy: 1, turn: 4, poison: 4 }).setKey('Intends to\nPoison you'),

            // Random turns
            new Action({ enemy: 1, poison: 5, probability: 0.50 }).setKey('Intends to\nPoison you'),
            new Action({ enemy: 1, damage: 15, probability: 0.30 }).setKey(""),
            new Action({ enemy: 1, heal: 15, armor: 3, probability: 0.20 }).setKey(`Intends to\nApply a buff`),
        ];

        const enemy2health = self.adjustForDifficulty(45, 50, 55);
        gameState.enemy2 = new Enemy('City Rat Sr.', enemy2health, 0, 0, 'infestation');
        gameState.enemy2.sprite = this.add.image(1185, 535, 'rat2').setScale(0.61).setFlipX(true)

        gameState.enemy2.actions = [
            // Predetermined turns
            new Action({ enemy: 2, turn: 1, debuffCard: 'draw' }).setKey(`Intends to\nInfect you`),
            new Action({ enemy: 2, turn: 2, heal: 10, armor: 4 }).setKey('Intends to\nApply a buff'),
            new Action({ enemy: 2, turn: 3, debuffCard: 'discard' }).setKey(`Intends to\nInfect you`),
            new Action({ enemy: 2, turn: 4, poison: 4 }).setKey('Intends to\nPoison you'),

            // Random turns
            new Action({ enemy: 2, poison: 4, probability: 0.50 }).setKey('Intends to\nPoison you'),
            new Action({ enemy: 2, debuffCard: 'draw', probability: 0.30 }).setKey(`Intends to\nInfect you`),
            new Action({ enemy: 2, heal: 15, armor: 3, probability: 0.20 }).setKey(`Intends to\nApply a buff`),
        ];

        gameState.enemies = [gameState.enemy1, gameState.enemy2];
        gameState.characters = [...gameState.enemies, gameState.player];
        
        gameState.characters.forEach((character) => { 
            character.setScene(this).setSpriteAttributes().addHealthBar().addManaBar().addStatsDisplay(635);
            self.describeCharacter(character);
        });

        // Initialize cards and permanents
        this.addStanceBar(gameState.player, '#303030'); // colors: light:#a9a9a9 - medium:#808080 - dark:#696969 - vdark:#303030
        // self.scene.start('Level3Fight2'); // Keep for testing purposes!  
        this.restorePermanents(addPermanent);
        gameState.drawPile = [...gameState.deck];
        displayCardPiles();
        const levelSequenceFunction = testing ? initiatePlayerTurn : initializeFight; 
        levelSequenceFunction();
 

        /**
         * -------------------------------------------------------------------------------------------------------------------
         * INTRO
         * -------------------------------------------------------------------------------------------------------------------
         */


        // Introduce the new level. Transition to the fight after a short delay or if the player presses any button.
        function welcomePlayerToLevel() {
            const levelimage = self.add.image(0, 0, 'theCity');
            levelimage.setScale(1.31).setOrigin(0.02, 0).setDepth(300);
            const levelSequenceFunction = testing ? initiatePlayerTurn : initializeFight;

            const levelTextConfig = { fontSize: '120px', fill: '#ff0000', fontFamily: 'Rock Kapak' };   
            const leveltextTop = self.add.text(825, 405, 'Level 1:', levelTextConfig);
            const leveltextBottom = self.add.text(825, 645, 'On City Streets', levelTextConfig);
            [leveltextTop, leveltextBottom].forEach(text => text.setDepth(301).setOrigin(0.5));
            
            let levelStarting = false; // Flag for avoiding multiples calls to initializeFight().
            const startLevelSequence = () => {
                if (levelStarting) return;
                levelStarting = true;
                fadeOutGameObject(levelimage, 2000); 
                fadeOutGameObject(leveltextTop, 1300);
                fadeOutGameObject(leveltextBottom, 1300);
                self.time.delayedCall(500, levelSequenceFunction);
            };
        
            self.time.delayedCall(4000, startLevelSequence);
            self.input.on('pointerup', startLevelSequence);
            self.input.keyboard.on('keydown', startLevelSequence);
        }

        // Initaialize fight variables, transition to taunt exchange, and set listeners for skipIntro
        async function initializeFight() {
            gameState.startFightObjects = [];

            handleMusicTransition();
            await handleStartFightText();

            exchangeTaunts();
            self.input.keyboard.on('keydown', skipIntro, this);
            self.input.on('pointerup', skipIntro, this);
        }

        // Stop the theme music. Then start the fight music after a short delay
        async function handleMusicTransition() {
            self.sound.stopAll();
            await self.delay(300);
            gameConfig.music.play({ loop: true, volume: 0.35 });
        }
        
        // Display text informing the player about the level and fight number
        async function handleStartFightText() {
            const textDuration = 2300;
            const { level, fight } = self.extractLevelFightFromName(self.scene.key);
            const startTextConfig = { fontSize: '100px', fill: '#ff0000', fontFamily: 'Rock Kapak' };
            const startTextContent = `Level ${level}\nFight ${fight}!`;
            
            gameState.startText = self.add.text(825, 480, startTextContent, startTextConfig).setOrigin(0.5);
            gameState.startFightObjects.push(gameState.startText);

            await self.delay(textDuration);

            gameState.startText.setText("Fight!");
            gameState.startText.setStyle({ fontSize: '150px' });
            self.time.delayedCall(textDuration, () => {
                fadeOutGameObject(gameState.startText, 500);
            });
        }


        /**
         * -------------------------------------------------------------------------------------------------------------------
         * EXCHANGE TAUNTS
         * -------------------------------------------------------------------------------------------------------------------
         */


        // Main function for pre-fight exchange of taunts.
        async function exchangeTaunts() {
            // Select random taunt-combination
            const randomIndex = Math.floor(Math.random() * gameState.ratTaunts.length);
            const randomTaunt = gameState.ratTaunts.splice(randomIndex, 1)[0];
            gameState.enemy1.taunt = randomTaunt.enemy;
            gameState.player.taunt = randomTaunt.player;         
        
            // Display taunts and let them fade out 
            await manageTaunt(gameState.enemy1);
            await manageTaunt(gameState.player);
            gameState.startFightObjects.forEach(obj => fadeOutGameObject(obj));
            if (gameState.skipIntro) return;
            await self.delay(200); // Wait for startFightObjects to fade out

            // call initiatePlayerTurn() and ensure it is not called twice
            self.input.keyboard.off('keydown', skipIntro, this);
            self.time.removeAllEvents();
            await self.delay(50);

            if (!gameState.fightStarted) initiatePlayerTurn();
        }

        // Function for managing the creation and destruction of taunts.
        async function manageTaunt(character) {
            const x = character.x;
            const y = character.y - 300;
            const delayTimeBeforeSpeech = character === gameState.player ? 100 : 800;

            const textConfig = { fontSize: '30px', fill: '#000000' };
            let tauntText = self.add.text(x, y, "", textConfig).setOrigin(0.5)
            const tauntTextBackground = self.add.graphics();
            gameState.startFightObjects.push(tauntText, tauntTextBackground);

            await self.delay(delayTimeBeforeSpeech);
            if (gameState.skipIntro) return;
        
            await displaySpeech(tauntText, tauntTextBackground, character.taunt);
            if (gameState.skipIntro) return;
            
            await self.delay(1000);
            if (gameState.skipIntro) return;

            fadeOutGameObject(tauntText);
            fadeOutGameObject(tauntTextBackground);
        }
      
        // Function for skipping taunts if the player presses any key
        async function skipIntro() {
            if (gameState.skipIntro) return
            
            gameState.skipIntro = true;
            gameState.startFightObjects.forEach(obj => fadeOutGameObject(obj));

            await self.delay(300);
            if (gameState.fightStarted) return
            
            self.input.keyboard.off('keydown', skipIntro, this);
            self.time.removeAllEvents();
            initiatePlayerTurn();
        };
        
        // Function for displaying the taunts on screen
        async function displaySpeech(textObject, textBackground, textContent) {
            return new Promise((resolve) => {
                let index = 0;
                let currentText = "";
                const depth = 301;
                const radius = 7;
                const delay = 35;
        
                // Recursive loop for adding characters to the screen, one by one, untill the entire text is displayed.
                const addNextLetter = () => {
                    if (gameState.skipIntro) {
                        resolve();
                    } else if (index < textContent.length) {
                        currentText += textContent.charAt(index);
                        textObject.setText(currentText);
                        self.updateTextAndBackground(textObject, textBackground, currentText, radius, depth);
                        index++;
                        self.time.delayedCall(delay, addNextLetter);
                    } else {
                        resolve(); // All letters are added, resolve the promise
                    }
                };
        
                addNextLetter();
            });
        }
 

        /**
         * -------------------------------------------------------------------------------------------------------------------
         * PLAYERS TURN
         * -------------------------------------------------------------------------------------------------------------------
         */ 
    

        // Function for reseting scene variables and graphics and preparing for players turn to begin
        async function initiatePlayerTurn() {
            self.shuffleDeck(gameState.drawPile);
            gameState.fightStarted = true; 
            gameState.turn ++;

            // Reset player stats and graphics
            updateAndDisplyPoisonCount(gameState.player, 2000);
            gameState.player.updateState();
            gameState.player.removeIfDead(handlePunksNotDead);

            // If the game is not over, set the number of cards to be drawn and handle special conditions.
            if (endFightIfGameOver()) return;
            if (gameState.chemicalWarfare) activateChemicalWarfare();
            if (gameState.noFutureCondition) gameState.player.health -= 2;
            
            // drawing cards and displaying enemy intentions
            await handlePlayersTurnText();

            gameState.enemies.forEach( enemy => {
                enemy.selectAction().displayIntention();
            });

            if (gameState.turn === 1) await initiatePlayersTurnOneEvent();
            gameState.characters.forEach( character => character.activateStatsDisplay()); 
            drawCards(gameState.player.numCards);            
        }


        // Fight specific text that may or may not be displayed at the start of the players first turn
        async function initiatePlayersTurnOneEvent() {
            self.delay(300);

            const textConfig = { fontSize: '57px', fill: '#ff0000', fontWeight: 'bold' };
            const textCoordinates = { x: 825, y: 420, z: 201 };
            const turnOneText = new TextBox(self, "Heads up: Rats\nare infectious!", textCoordinates, textConfig);

            await self.delay(2500);
            turnOneText.fadeOut();
        }

        // Function for informing the player that their turn has begun and that they have x amount of poison.
        async function handlePlayersTurnText() {
            const textCoordinates = { x: 825, y: 450, z: 21 };
            const textConfig = { fontSize: '90px', fill: '#ff0000' };
            const yourTurnText = new TextBox(self, 'Your turn!', textCoordinates, textConfig);

            const delaytime = (gameState.player.poison && gameState.player.health) ? 2000 : 1500;
            await self.delay(delaytime);
            yourTurnText.fadeOut();
        }

        // Function managing chemical warfare it it is active
        function activateChemicalWarfare() {
            gameState.enemies.forEach(enemy => {
                enemy.poison += gameState.chemicalWarfare;
            });

            // Display text and let it fade out after a short delay
            const textContent = `Enemies get +${gameState.chemicalWarfare} Poison`;
            const textConfig = { fontSize: '45px', fill: '#ff0000' };
            const textCoordinates = { x: 810, y: 675, z: 35 };
            const chemicalWarText = new TextBox(self, textContent, textCoordinates, textConfig);
            self.time.delayedCall(1500, () => chemicalWarText.fadeOut());

            self.animatePermanent('chemicalWarfare');
        }
        
        async function drawCards(numCards) {
            const isDrawPossible = (slot) => slot && (gameState.drawPile.length || reshuffleDrawPile());
            
            const startSlotIndex = Math.floor((gameState.slots.length - numCards) / 2);
            const tweensDuration = 110;
            const delay = 7;

            for (let i = 0; i < numCards; i++) {
                const slot = gameState.slots[startSlotIndex + i];
                const tweensDelay = tweensDuration + i * delay;

                if (!isDrawPossible(slot)) {
                    numCards = i+1;
                    startPlayersTurn(tweensDelay, numCards);
                    return;
                }

                // Draw a card and position the card sprite
                const { card, cardDepth } = drawCardAndCreateSprite(i, startSlotIndex);
                card.slot = slot;
                card.startHeight = slot.y;
                card.animateDraw(self, tweensDelay);

                gameConfig.cardsDealtSound.play({ volume: 2, seek: 0.10 });
                gameState.drawPileText.setText(gameState.drawPile.length);
                card.animatePointer(self, cardDepth);
                card.sprite.on('pointerup', () => initiateCardActivation(card));

                // Start players turn when all cards are dealt
                if (i === numCards - 1) startPlayersTurn(tweensDelay);

                // Otherwise wait for the previous animation to finnish 
                await self.delay(tweensDelay); 
            }
        }

        async function startPlayersTurn(tweensDelay) {            
            await self.delay(2 * tweensDelay);
            
            gameState.playersTurn = true; // Sets tokens interactive
            console.log(`gameState.playersTurn: ${gameState.playersTurn}`);
            gameState.buttons.forEach(button => button.activate());
            gameState.currentCards.forEach(card => card.activate());
        }

        function reshuffleDrawPile() {
            if (!gameState.discardPile.length) {
                console.log("Both draw and discard piles are empty. Cannot continue drawing.");
                return false;
            }

            gameState.drawPile = gameState.discardPile;
            self.shuffleDeck(gameState.drawPile);    
            gameState.discardPile = [];
            gameState.discardPileText.setText(gameState.discardPile.length);
            return true;
        }

        function drawCardAndCreateSprite(i, startSlotIndex=null) {
            const card = gameState.drawPile.pop();
            const x = 180;
            const y = 900;

            card.sprite = self.add.image(x, y, card.key).setScale(0).setInteractive();
            gameState.currentCards.push(card);
            
            if (card.usedOneShot) card.sprite.setTint(0x808080);

            // if the function is called by drawNewCards() -> startSlotIndex === null -> return only card
            if (startSlotIndex === null) return card;

            // Otherwise return card and cardDepth
            const cardDepth = 10 + i + startSlotIndex;
            card.sprite.setDepth(cardDepth);
            return { card, cardDepth };
        }

        function initiateCardActivation(card) {
            card.typePlayed = getValueOrInvoke(card.type);
            card.costPlayed = card.dBeat ? 0 : getValueOrInvoke(card.cost);
            
            if (!card.isPlayable()) {
                self.cameras.main.shake(70, .002, false);
                return;
            }

            gameState.player.mana -= card.costPlayed;
            
            if (card.goldCost) spendGold(card.goldCost);
            if (card.slot) card.slot.available = true;
            if (card.oneShot) card.usedOneShot = true;
            if (card.dBeat) delete card.dBeat;
            if (card.usesTillDepletion) card.usesTillDepletion--;
            
            gameState.redrawButton.disable();
            gameState.player.updateManaBar();
            card.isBeingPlayed = true;

            gameState.currentCards = gameState.currentCards.filter(c => c !== card);
            gameState.player.freedomBeforeCardPlayed = (gameState.player.stance === 'Freedom') ? true : false; 
            console.log(`activated card: ${card.key}\nCost: ${card.costPlayed}`);

            selectActivationMode(card);
        }

        // Get the appropriate function and call it, or call the default action
        function selectActivationMode(card) {
            console.log('selectActivationMode called') // Remove this
            const activationStrategies = {
                'targetSelected': () => targetEnemy(card),
                'targetAll': () => targetAll(card),
                'permanent': () => addPermanent(card),
                'default': () => { // Handles buffs and debuffs
                    card.discard(); // Leave this outside playCard to prevent bugs with targetAll
                    playCard(card, gameState.player);
                }
            };

            (activationStrategies[card.typePlayed] || activationStrategies['default'])();
        }

        function targetEnemy(card) {
            gameConfig.targetingCursor.setVisible(true);
            gameState.thisTurn = gameState.turn; 
            deactivateCardSprites();
    
            gameState.enemies.forEach(enemy => {
                enemy.sprite.on('pointerup', () => handlePointerUpOnEnemy(card, enemy));
            })
        }
        
        function handlePointerUpOnEnemy(card, enemy) {
            enemy.sprite.off('pointerup'); // Remove any existing pointerup listeners to prevent stacking
            const isEnemyTargetable = () => card.isBeingPlayed && gameState.playersTurn && gameState.thisTurn === gameState.turn;
            if (!isEnemyTargetable()) return;
            
            card.discard(); // Leave this outside playCard to prevent bugs with targetAll
            playCard(card, enemy);
            reactivateCardSprites(); // Turn the other cards interactive again once an enemy has been targeted
        }

        // Makes a shallow copy to ensure that playCard() continues for enemy2 even if enemy1 gets killed and thus removed from gameState.enemies.
        // Save enemiesCopy.length in gameState to make it available to normalizeCard().
        function targetAll(card) {
            card.discard(); // Leave this outside playCard to prevent bugs with targetAll
            const enemiesCopy = [...gameState.enemies];
            gameState.enemiesLength = enemiesCopy.length;
            console.log('gameState.enemiesLength: ' + gameState.enemiesLength); // Remove this
            
            enemiesCopy.forEach((enemy, index) => {
                const isLastEnemy = index === enemiesCopy.length - 1;
                playCard(card, enemy, isLastEnemy);
            });
        }

        // Helper functions for deactivating and reactivaing sprites in the current hand of card.
        function deactivateCardSprites() {
            const currentCards = gameState.currentCards;
            currentCards.forEach(card => { 
                if (card.sprite && card.sprite.scene) {
                    card.sprite.removeInteractive();
                }
            })
        }
        
        function reactivateCardSprites() {
            const currentCards = gameState.currentCards;
            currentCards.forEach(card => { 
                if (card.sprite && card.sprite.scene) {
                    card.sprite.setInteractive(); 
                }
            })
        }

        // Main function for playing cards
        async function playCard(card, target, isLastEnemy=false) {
            gameConfig.targetingCursor.setVisible(false);

            card.fadeOut(self, 200);
            gameState.actionTextObjects.forEach(object => object.destroy());

            const cardEffects = handleCardEffects(card, target, isLastEnemy);

            target.removeIfDead(handleTroopsOfTakamori); 
            if (endFightIfGameOver()) return;
            drawNewCards(cardEffects.drawCardPlayed);
            gameState.enemies.forEach( enemy => enemy.updateIntention());

            // Reactivate cards after a shor delay
            await self.delay(260);

            // Make a shallow copy to avoid prematurely destroying the actiontext of the next card played.
            const currentActionTextObjects = [...gameState.actionTextObjects];
            self.time.delayedCall(1200, () => {
                currentActionTextObjects.forEach(object => {
                    fadeOutGameObject(object);
                })
            });
        }

        function handleCardEffects(card, target, isLastEnemy) {
            activateSpecialCards(target, card); // Call this before normalizeCard to activate functions that incluence card stats before normalization
            const cardEffects = normalizeCard(card, target, isLastEnemy);
        
            // NB "damageTotal" must be available to the scope in which "addActionText" gets called, regardless of card.type
            cardEffects.damageModifier = (1 + 0.10 * gameState.player.strength) * (1 - target.armor / 20);
            const damageNominal = cardEffects.firePlayed + cardEffects.damagePlayed * cardEffects.damageModifier;
            cardEffects.damageTotal = Math.round(Math.max(0, damageNominal));  
        
            const { isBuffPlayed, isAttackPlayed } = isBuffOrAttackPlayed(cardEffects, target);
            if (isBuffPlayed) handleBuffEffects(cardEffects, card);
            if (isAttackPlayed) handleAttackEffects(cardEffects, target);
            addActionText(card, cardEffects);

            target.updateStats();
            target.updateHealthBar();
            gameState.player.updateStanceAfterCard(cardEffects);
            gameState.player.updateStats();
        
            return cardEffects;
        }

        function isBuffOrAttackPlayed(cardEffects, target) {
            const c = cardEffects;
            const isBuffPlayed = c.healPlayed || c.strengthPlayed || c.armorPlayed || c.poisonRemovePlayed;
            const isPlayerTarget = target === gameState.player
            const isAttackPlayed = !isPlayerTarget  && (c.damageTotal || c.reduceTargetStrengthPlayed || c.reduceTargetArmorPlayed || c.poisonPlayed);
            
            return { isBuffPlayed, isAttackPlayed };
        }

        function handleAttackEffects(cardEffects, target) {
            self.cameras.main.shake(100, .003, false);
            gameConfig.attackSound.play({ volume: 0.8 });
            gameState.player.attackTweens(60);

            gameState.score.damageDealt += cardEffects.damageTotal;
            console.log(`${cardEffects.damagePlayed} Physical Damage and ${cardEffects.firePlayed} Fire Damage was dealt to ${target.name}`);
            target.sufferAttackEffect(cardEffects);
            gameState.player.incrementLifeStealCounter(cardEffects);
        }

        function handleBuffEffects(cardEffects, card) {
            const { strengthPlayed, armorPlayed, poisonRemovePlayed, healPlayed } = cardEffects;
            gameState.player.powerUpTweens();
            gameState.player.heal(healPlayed, poisonRemovePlayed);
            gameState.player.buff(card.key, strengthPlayed, armorPlayed);

            // Play sound based on card effect played
            const soundToPlay = (poisonRemovePlayed || healPlayed) ? 'healSound' : 'powerUpSound';
            const soundVolume = (poisonRemovePlayed || healPlayed) ? 0.5 : 0.15;
            gameConfig[soundToPlay].play({ volume: soundVolume });
        }

        function activateSpecialCards(target, card) {

            // Lookup table for special card-keys
            const cardActions = {
                'dBeat': () => activateDBeat(),
                'bassSolo': () => activateBassSolo(),
                'nenguStyle': () => earnGold(1),
                'coverCharge': () => { gameState.player.stancePoints > 1 ? earnGold(1) : null },
                'pissDrunkBastards': () => activatePissDrunkBastards(target),
                'canibalize': () => activateCanibalize(),
                'zenZine': () => gameState.player.increaseHealthMax(2 * card.costPlayed),
                'bloodOath': () => activateBloodOath(),
                'libertySpikes': () => activateLibertySpikes(),
                'noFuture': () => activateNoFuture(),
                'riotRonin': () => activateRiotRonin(card, target),
                'hellFire': () => gameState.player.sufferDebuffDamage(2),
                'circlePit': () => { card.fire = card.costPlayed * 4 },
                'satomiSubterfuge': () => activateSatomiSubterfuge(card), 
            };
        
            // Execute the function if it exists in the lookup table
            if (card.key in cardActions) {
                cardActions[card.key]();
            }
        
            // add 'usesTillDepletion' text if applicable
            // The actual depletion is handled by card.discard()
            if (card.usesTillDepletion >= 0) {
                const textContent = card.usesTillDepletion > 0 ? `Remaining uses: ${card.usesTillDepletion}` : `Card depleted!`;
                addInfoTextBox(textContent);
            }
        }

        function activateSatomiSubterfuge(card) {
            if (!gameState.bonusPermanentSlots.length) {
                addInfoTextBox('Maximum number of Permanent Slots Reached');
                gameState.player.gold += card.goldCost;
                gameState.goldCounter.setText(gameState.player.gold);
                return;
            }
            
            card.goldCost ++;
            const newSlot = gameState.bonusPermanentSlots.shift();
            newSlot.singleFight = true;
            gameState.permanentSlots.push(newSlot);

            addInfoTextBox('Gained 1 Permanent Slot this fight');
        }

        function activateRiotRonin(card, target) {
            card.goldCost ++;
            target.chosenAction = new Action({enemy: target, skip: true}).setKey(`Intends to\nSkip a Turn`);          
        }

        function activateCanibalize() {
            gameState.player.lifeStealThisTurn += 0.2;
            gameConfig.powerUpSound.play({ volume: 0.15 });
            gameState.player.powerUpTweens();
        }

        function activatePissDrunkBastards(target) {
            if (target.health >= 18) return;
            gameState.score.damageDealt += target.health;
            target.health = 0;
        }

        function activateDBeat() {
            const cardsForSecelcion = gameState.discardPile.filter(card => card.key != 'dBeat');
            if (!cardsForSecelcion.length) return;
            
            const discardImages = []
            const length = cardsForSecelcion.length;
            const cardsPerRow = length > 32 ? 10 : length > 24 ? 8 : length > 12 ? 6 : 4;
            const cardSpacing = 158;
            const startX =  length > 32 ? 117 : length > 24 ? 275 : length > 12 ? 431 : 590;
            const startY = 225;

            // helper function for moving card from the discard pile to hand
            const handleDrawDBeatCard = (card, cardImage) => {
                if (gameState.player.stancePoints > 0) {
                    card.dBeat = true;
                }
                fadeOutGameObject(cardImage, 300);

                self.time.delayedCall(400, () => {   
                    discardImages.forEach( image => image.destroy());
                    gameState.discardPile.splice(gameState.discardPile.indexOf(card), 1);
                    gameState.drawPile.push(card);
                    drawNewCards(1);
                })
            }
            
            // Display the content of the discard pile and enable selection
            cardsForSecelcion.forEach( (card, index) => {
                let cardX = startX + (index % cardsPerRow) * cardSpacing;
                let cardY = startY + Math.floor(index / cardsPerRow) * 1.5 * cardSpacing;

                let cardImage = self.add.image(cardX, cardY, card.key).setScale(0.41).setDepth(200).setInteractive();
                discardImages.push(cardImage);

                cardImage.on('pointerover', () => cardImage.setScale(0.43).setDepth(201));
                cardImage.on('pointerout', () => cardImage.setScale(0.41).setDepth(200));

                cardImage.on('pointerup', () => {
                    handleDrawDBeatCard(card, cardImage)
                })
            })
        }

        function activateBassSolo() {
            if (!gameState.currentCards.length || gameState.bassSoloPlayed) {
                return;
            }

            gameState.bassSoloPlayed = true;

            // pick a random card on hand and discard it: move it from hand to discardpile and fade out sprite
            const randomIndex = Math.floor(Math.random() * gameState.currentCards.length);
            const randomCard = gameState.currentCards[randomIndex];
            fadeOutGameObject(randomCard.sprite, 250);
            gameState.currentCards = gameState.currentCards.filter(c => c != randomCard);
            if (!randomCard.isType('debuff')) gameState.discardPile.push(randomCard);
        }

        function activateBloodOath() {
            gameState.player.manaMax ++;
            gameState.player.manaBase ++;
            gameState.player.health -= 6;
            gameState.player.updateManaBar();
            if (gameState.player.health) {
                gameConfig.powerUpSound.play({ volume: 0.15 });
                gameState.player.powerUpTweens();
            }
        }

        function activateLibertySpikes() {
            if (gameState.player.stancePoints <= 0) return;
            
            gameState.player.mana ++;
            gameState.player.manaMax ++;
            gameConfig.powerUpSound.play({ volume: 0.15 });
            gameState.player.updateManaBar();
            gameState.player.powerUpTweens();
        }

        function activateNoFuture() {
            gameState.noFutureCondition = true;
            gameState.player.increaseHealthMax(5);
        }

        // Select action text based on card effect and display it.
        function addActionText(card, cardEffects) {
            const actionTextConfig = { fontSize: '48px', fill: '#ff0000' };
            let actionText = self.add.text(825, 450, "", actionTextConfig).setOrigin(0.5).setDepth(21);
            let actionTextBackground = self.add.graphics();
            const actionTextContent = [];
            gameState.actionTextObjects.push(actionText, actionTextBackground);

            const { damageTotal, poisonPlayed, strengthPlayed, armorPlayed, poisonRemovePlayed, healPlayed } = cardEffects;
        
            if (card.text) actionTextContent.push(card.text);
            if (damageTotal) actionTextContent.push(`Deals ${damageTotal} damage`);
            if (poisonPlayed) actionTextContent.push(`Deals ${poisonPlayed} Poison`)
            if (strengthPlayed) actionTextContent.push(`Gains ${strengthPlayed} Strength`);
            if (armorPlayed) actionTextContent.push(`Gains ${armorPlayed} Armor`);
            if (healPlayed) actionTextContent.push(`Heals ${healPlayed} HP`);
            if (poisonRemovePlayed) actionTextContent.push(`Heals ${poisonRemovePlayed} Poison`);

            if (!actionTextContent.length) {
                actionTextContent.push(`Card activated`);
            }
            
            self.updateTextAndBackground(actionText, actionTextBackground, actionTextContent.join('\n'));
        }

        function getValueOrInvoke(property) {
            return typeof property === 'function' ? property() : property;
        }
        
        // Update card effect based on state.
        function normalizeCard(card, target, isLastEnemy = false) {
            const stancePoints = gameState.player.stancePoints;

            const moshpitMassacreCondition = (card.key === 'moshpitMassacre' && stancePoints > 0 && target.poison > 0);
            const scorchedSoulCondition = (card.key === 'scorchedSoul' && target.poison > 0);
            const bladesBlightCondition = (card.key === 'bladesBlight' && target.poison > 0);
            const rottenResonanceCondition = (card.key === 'rottenResonance' && target.poison === 0);
            const roninsRotCondition = (card.key === 'roninsRot' && target.poison > 0);
            const kabutuEdoCondition = (card.key === 'kabutu' && gameState.edoEruption && stancePoints > 0);
            const steelToeCondition = (card.key === 'combatBoots' && gameState.steelToeCount);
            const knuckleFistEdoCondition = (card.key === 'knuckleFist' && gameState.edoEruption && stancePoints < 0)
            
            gameState.troopsOfTakamoriCondition = (card.key === 'troopsOfTakamori' ? true : false);
            
            const steelToeOutcome = stancePoints > 0 ? gameState.steelToeCount + stancePoints + 1 : gameState.steelToeCount + 1;
            const rottenResonanceOutcome = rottenResonanceCondition ? 1 : 0;

            if (knuckleFistEdoCondition || kabutuEdoCondition) self.animatePermanent('edoEruption');
            if (steelToeCondition) self.animatePermanent('steelToe');

            return {
                damagePlayed: moshpitMassacreCondition ? 11 : getValueOrInvoke(card.damage),
                firePlayed: kabutuEdoCondition ? 3 : (scorchedSoulCondition ? 10 : getValueOrInvoke(card.fire)),
                stancePointsPlayed: (kabutuEdoCondition && isLastEnemy) ? -1 : (kabutuEdoCondition && !isLastEnemy) ? 0 : getValueOrInvoke(card.stancePoints),
                poisonPlayed: bladesBlightCondition ? target.poison : getValueOrInvoke(card.poison) + rottenResonanceOutcome,
                healPlayed: getValueOrInvoke(card.heal),
                strengthPlayed: getValueOrInvoke(card.strength),
                armorPlayed: knuckleFistEdoCondition ? 2 : getValueOrInvoke(card.armor),
                reduceTargetArmorPlayed: steelToeCondition ? steelToeOutcome : getValueOrInvoke(card.reduceTargetArmor),
                reduceTargetStrengthPlayed: roninsRotCondition ? target.poison : getValueOrInvoke(card.reduceTargetStrength),
                drawCardPlayed: getValueOrInvoke(card.drawCard),
                poisonRemovePlayed: getValueOrInvoke(card.poisonRemove),
                lifeStealPlayed: gameState.player.lifeStealBase + gameState.player.lifeStealThisTurn
            };
        }
        
        // Handler for end of turn button
        async function activateEndOfTurnButton() {
            if (gameConfig.targetingCursor.visible || !gameState.playersTurn) {
                self.cameras.main.shake(70, .002, false);
                return;
            }

            // Reset stats
            gameState.player.depleteMana();
            gameState.player.lifeStealThisTurn = 0;
            gameState.currentEnemyIndex = 0;
            gameState.bassSoloPlayed = false;

            // NB! Particular for level1fight2
            const infestationSuffered = 2 * gameState.currentCards.filter(card => card.key === 'infestation').length;
            gameState.player.poison += infestationSuffered;
            // NB! Particular for level1fight2

            // Disable buttons, destroy card sprites and move cards to discardpile, update enemy action
            gameState.buttons.forEach(button => button.disable());
            addHandtoDiscardPile();
            handleRebelHearth();
            
            // After a shor delay, fadeout any existing actiontext, disable statsdisplayes, and begin enemy turn
            await self.delay(50);
            gameState.actionTextObjects.forEach(object => object.destroy());
            gameState.characters.forEach(character => character.disableStatsDisplay());

            // NB! Keep this here, so its not called recursively in initiateEnemiesTurn();
            gameState.enemies.forEach(enemy => {
                enemy.turnComplete = enemy.alive ? false : true;
                enemy.fadeOutIntentionText()
            });

            initiateEnemiesTurn();
        }

        // Increment players health based on rebel hearth if its preconditionis are met
        function handleRebelHearth() {
            const isRebelHearthActive = gameState.rebelHeart && gameState.player.health < gameState.player.healthMax && gameState.player.stancePoints !== 0;
            if (!isRebelHearthActive) return;

            const missingHealth = gameState.player.healthMax - gameState.player.health;
            const rebelHearthHealth = Math.abs(gameState.player.stancePoints);
            const realizedHealthGain = rebelHearthHealth < missingHealth ? rebelHearthHealth : missingHealth;
            
            if (!realizedHealthGain) return;

            gameState.player.heal(realizedHealthGain);
            gameConfig.healSound.play({ volume: 0.5 });
            self.animatePermanent('rebelHeart');

            const textContent = `Rebel Hearth healed ${realizedHealthGain} HP`;
            addInfoTextBox(textContent);
        }


        /**
        * -------------------------------------------------------------------------------------------------------------------
        * ENEMYS TURN
        * -------------------------------------------------------------------------------------------------------------------
        */ 


        function initiateEnemiesTurn() {
            if (gameState.enemies.length === 0) return;

            if (gameState.enemies[gameState.currentEnemyIndex].alive) {
                startEnemyTurn(gameState.enemies[gameState.currentEnemyIndex]);

            } else {
                gameState.currentEnemyIndex++;
                initiateEnemiesTurn();
            }
        }    

        async function startEnemyTurn(enemy) {
            // The conditional ensures that "Enemy turn" is only declared when the first enemy starts their turn.
            if (gameState.playersTurn) { 
                gameState.playersTurn = false;

                // Display text and handle life steal
                const textCoordinates = { x: 825, y: 450, z: 21 };
                const textConfig = { fontSize: '90px', fill: '#ff0000' };
                gameState.enemyTurnText = new TextBox(self, "Enemy's turn!", textCoordinates, textConfig);
                self.time.delayedCall(1500, () => gameState.enemyTurnText.fadeOut(50));
                
                handleLifeSteal();
                gameState.player.lifeStealCounter = 0;
                gameState.player.updateStats();
            
                // Fight-specific logic; adjust per level.
                // if (gameState.turn === 1) {
                //     await initiateEnemyTurnOneEvent();
                //     initiatePlayerTurn();
                //     return;
                // }
            }

            enemy.turnComplete = false;
            updateAndDisplyPoisonCount(enemy, 1500);
            initializeActionText();
            performEnemyAction(enemy);           
        }

        // Handle fight-specific events at the start of the enemies first turn
        async function initiateEnemyTurnOneEvent() {
            const firstDelayTime = 1500;
            const secondDelayTime = 3500;
            const thirdDelayTime = 4000;
            const textConfig = {fontSize: '45px', fill: '#ff0000', fontWeight: 'bold' };
            const textCoordinates = { x: 825, y: 450, z: 201 };

            await self.delay(firstDelayTime);
            const textContent  = '   The cops are\ncalling for backup!';
            const enemTurnOneText = new TextBox(self, textContent, textCoordinates, textConfig);

            await self.delay(secondDelayTime);
            enemTurnOneText.destroy();
            const policeTextContent = 'Police snipers\n will hit you\n  in 5 turns!'
            const policeText = new TextBox(self, policeTextContent, textCoordinates, textConfig);

            await self.delay(thirdDelayTime);
            policeText.fadeout();
        }

        // Increase players health if life steal was played this round
        function handleLifeSteal() {
            if (!gameState.player.lifeStealCounter) return;
            const player = gameState.player
            
            // Increase player.health by the amount of health stolen
            const stolenHealthRealized = () => {
                const stolenHealth = Math.floor(player.lifeStealCounter);
                const newHealthDefault = player.health + stolenHealth;
                return newHealthDefault < player.healthMax ? stolenHealth : player.healthMax - player.health;
            };

            if (!stolenHealthRealized()) return;

            // Display text, play heal sound, and animate soulSquatter.
            player.heal(stolenHealthRealized());
            gameConfig.healSound.play({ volume: 0.5 });
            self.animatePermanent('soulSquatter');
            
            const textContent = `You stole ${stolenHealthRealized()} HP`;
            const textConfig = { fontSize: '45px', fill: '#ff0000' };
            const textCoordinates = { x: 825, y: 570, z: 21 };
            const lifeStealText = new TextBox(self, textContent, textCoordinates, textConfig);
            self.time.delayedCall(1500, () => lifeStealText.fadeOut(50));           
        }

        // Initialize attack describing enemy action, to be updated later.
        function initializeActionText() {
            const actionTextConfig = {fontSize: '48px', fill: '#ff0000'};
            gameState.actionText = self.add.text(825, 450, "", actionTextConfig).setOrigin(0.5).setDepth(21);
            gameState.actionTextBackground = self.add.graphics();
            gameState.actionTextObjects.push(gameState.actionText, gameState.actionTextBackground);
        }

        async function performEnemyAction(enemy) {
            // enemy.updateStats();
            await self.delay(setDelayTimeBeforeAction());
            
            // Perform the chosen action
            enemy.chosenAction.updateDamage();
            const chosenAction = enemy.chosenAction;
            gameState.player.poison += chosenAction.poison;
            enemy.heal(chosenAction.heal);
            enemy.gainStrengthAndArmor(chosenAction.strength, chosenAction.armor)
            enemy.updateStats();
            
            // Choose activation sound and animation based on type of action.
            const { attackConditions, healConditions, buffConditions } = isEnemyEffectPlayed(chosenAction) 
    
            if (attackConditions) {
                handleEnemyAttack(enemy, chosenAction);
    
            } else if (healConditions) {
                gameConfig.healSound.play({ volume: 0.5 });
                self.updateTextAndBackground(gameState.actionText, gameState.actionTextBackground, chosenAction.text);
                enemy.powerUpTweens();        
    
            } else if (buffConditions) {
                gameConfig.powerUpSound.play({ volume: 0.2 });
                self.updateTextAndBackground(gameState.actionText, gameState.actionTextBackground, chosenAction.text);
                enemy.powerUpTweens();

            } else if (chosenAction.skip) {
                self.updateTextAndBackground(gameState.actionText, gameState.actionTextBackground, chosenAction.text);
            
            } else if (chosenAction.summonEnemy) {
                summonNewEnemy(chosenAction.summonEnemy);
            }

            // Call insertDebuffCard to activate debuff cards.
            initializeOrResetDebuff(enemy, chosenAction)

            // NB! enemy.strengthTurn must be reset before concludeEnemyAction() (or an extra call to updateStats() will be required)
            enemy.strengthTurn = 0; 
            concludeEnemyAction(enemy, chosenAction);
        }

        // Helper function for setting delay time based on whether there are any existing texts. Adds 1000ms if the previous card was a debuff.
        function setDelayTimeBeforeAction() {
            const isTextDisplayed = () => (gameState.enemyTurnText && gameState.enemyTurnText.isDisplayed);
            let delayTime = isTextDisplayed() ? 1500 : 350;
            if (!gameState.debuffCardPlayed) return delayTime

            return delayTime += 1000;
        }

        // Helper function for selecting the appropriate effect-handling functions
        function isEnemyEffectPlayed(chosenAction) {
            const attackConditions = chosenAction.damage > 0 || chosenAction.fire > 0 || chosenAction.poison > 0;
            const healConditions = chosenAction.heal > 0;
            const buffConditions = chosenAction.strength > 0 || chosenAction.armor > 0;

            return { attackConditions, healConditions, buffConditions };
        }

        // Call insertDebuffCard to activate debuff cards.
        function initializeOrResetDebuff(enemy, chosenAction) {
            if (chosenAction.debuffCard === 'doubleDiscard') {
                handleDoubleDiscard(enemy, chosenAction);
            
            } else if (chosenAction.debuffCard) {
                insertDebuffCard(enemy, chosenAction);
            
            } else {
                gameState.debuffCardPlayed = false;
            }
        }

        // Handle 2 calls to insertDebuffCard
        async function handleDoubleDiscard(enemy, chosenAction) {
            chosenAction.debuffCard = "discard";
            insertDebuffCard(enemy, chosenAction);
            chosenAction.debuffCard = 'doubleDiscard';
            
            await self.delay(2200);
            self.updateTextAndBackground(gameState.actionText , gameState.actionTextBackground, "");

            self.time.delayedCall(400, () => {
                chosenAction.debuffCard = "discard";
                insertDebuffCard(enemy, chosenAction);
            });
        }

        // Method for handling enemy attacks. Reduce players health, update attack text, and animate enemy.
        function handleEnemyAttack(enemy, chosenAction) {
            
            self.cameras.main.shake(120, .005, false);
            gameConfig.attackSound.play({ volume: 0.8 });

            enemy.damageTotal = Math.round( Math.max(0, chosenAction.fire + chosenAction.damage) );
            console.log(`enemy.damageTotal: ${enemy.damageTotal}`);
            gameState.player.health -= enemy.damageTotal;
            gameState.score.damageTaken += enemy.damageTotal;
            
            let actionTextContent = chosenAction.poison > 0 ? chosenAction.text : `Deals ${enemy.damageTotal} damage`;
            self.updateTextAndBackground(gameState.actionText , gameState.actionTextBackground, actionTextContent);
            
            const tweensDistance = -60;
            enemy.attackTweens(tweensDistance);
        }

        async function concludeEnemyAction(enemy) {
            // Update characters stats and graphics after the enemy has completed their turn
            [gameState.player, enemy].forEach(character => {
                const removeIfDeadHandler = () => character === enemy ? handleTroopsOfTakamori : handlePunksNotDead;
                
                character.updateHealthBar();
                character.removeIfDead(removeIfDeadHandler);
                character.updateStats();
            })

            const delaytime = enemy.chosenAction.debuffCard === "doubleDiscard" ? 4200 : gameState.debuffCardPlayed ? 1800 : 900;
            await self.delay(delaytime);

            gameState.actionTextObjects.forEach(obj => fadeOutGameObject(obj, 50));
            enemy.turnComplete = true;
            if (endFightIfGameOver()) return;

            // Start next characters turn. If the last enemy completed their turn or is not alive, start players turn
            if (gameState.enemies[gameState.currentEnemyIndex].turnComplete || !gameState.enemies[gameState.currentEnemyIndex].alive) {
                gameState.currentEnemyIndex++;
                if (gameState.currentEnemyIndex < gameState.enemies.length) {
                    initiateEnemiesTurn();

                } else {
                    gameState.currentEnemyIndex = 0;
                    // Add any summoned enemies to gameState.enemies and characters.
                    gameState.summonedEnemies.forEach( enemy => {
                        if (enemy.alive && !gameState.enemies.includes(enemy)) {
                            gameState.enemies.unshift(enemy);
                            gameState.characters.unshift(enemy);
                        }
                    });

                    await self.delay(150);
                    gameState.debuffCardPlayed = false; // Set false to avoid long delay next turn
                    initiatePlayerTurn();
                }
            }
        };
        
        function insertDebuffCard(enemy, chosenAction ) {
            return new Promise( async (resolve) => { 
                enemy.attackTweens(-60);
                gameConfig.attackSound.play({ volume: 0.8 });   
                gameState.debuffCardPlayed = true;
                    
                const cardKey = enemy.debuffKey;
                const cardData = gameConfig.debuffCards[cardKey];
                const x = 675;
                const y = 675;
                const z = 450;
                const offset = 300;
                let i = 0;
                let scale = 0.68;
                const pile = chosenAction.debuffCard === 'draw' ? gameState.drawPile : gameState.discardPile;
                const pileName = chosenAction.debuffCard === 'draw' ? 'Draw pile' : 'Discard Pile';

                // create debuff cards and add them to the relevant pile
                const addedDebuffCards = [
                    new Card({ key: cardKey, type: 'debuff', cost: cardData.cost}),
                    new Card({ key: cardKey, type: 'debuff', cost: cardData.cost}),
                ];

                addedDebuffCards.forEach(card => card.sprite = self.add.image(x + offset * i++, y, cardKey).setOrigin(0.5));
                addedDebuffCards.forEach(card => card.configure(scale, z));
                pile.push( ...addedDebuffCards);

                // Inform the player
                let actionTextContent = `Adds 2 ${cardData.name} to your ${pileName}`;
                gameState.actionText.y = y - 450;
                self.updateTextAndBackground(gameState.actionText , gameState.actionTextBackground, actionTextContent);
            
                // Animate the debuff card flowing to the relevant pile.
                const delayBeforeAnimation = 2300;
                let completedTweens = 0;
                const endXCoord = chosenAction.debuffCard === 'draw' ? 180 : 1470; 
                const endYCoord = 900;
                const tweensDuration = 600;
                
                await self.delay(delayBeforeAnimation);

                addedDebuffCards.forEach((card) => {
                    self.tweens.add({
                        targets: card.sprite,
                        x: endXCoord,
                        y: endYCoord,
                        scaleX: 0,
                        scaleY: 0,
                        ease: 'Cubic',
                        duration: tweensDuration,
                        onComplete: function () {
                            card.fadeOut(self, 100);
                            gameState.discardPileText.setText(gameState.discardPile.length);
                            gameState.drawPileText.setText(gameState.drawPile.length);
                            completedTweens++;
                            if (completedTweens === addedDebuffCards.length) {
                                resolve();
                            }
                        },
                    });
                });
            });
        } 

        function summonNewEnemy(summonEnemy) {
            const { x, y, health, name, ID } = summonEnemy;
            const NamePropper = name.charAt(0).toUpperCase() + name.slice(1)
            
            // Create new enemy object and assign it sprites, actions, and properties.
            gameState[ID] = new Enemy(NamePropper, health, 0, 0, name);
            gameState[ID].sprite = self.add.image(x, y, name).setScale(0.45).setAlpha(0).setFlipX(false);

            gameState[ID].actions = [
                // Random turns
                new Action({ enemy: gameState[ID], damage: 15, probability: 0.40 }).setKey(""),
                new Action({ enemy: gameState[ID], damage: 17, probability: 0.20 }).setKey(""),
                new Action({ enemy: gameState[ID], heal: 15, armor: 3, probability: 0.10 }).setKey(`Intends to\nApply a buff`),
                new Action({ enemy: gameState[ID], heal: 10, armor: 5, probability: 0.15 }).setKey(`Intends to\nApply a buff`),
                new Action({ enemy: gameState[ID], heal: 10, strength: 3, probability: 0.15 }).setKey(`Intends to\nApply a buff`),
            ]

            let actionTextContent = `Summons a ${name}`;
            self.updateTextAndBackground(gameState.actionText , gameState.actionTextBackground, actionTextContent);

            fadeInEnemy(gameState[ID], 500);
        }

        function fadeInEnemy(enemy, duration) {
            self.tweens.add({
                targets: enemy.sprite,
                alpha: 1, 
                ease: 'Power1',
                duration: duration,
                onComplete: function () {
                    console.log("fade-in complete");
                    enemy.setScene(self).setSpriteAttributes().addHealthBar().addStatsDisplay(705);
                    self.describeCharacter(enemy);
                    gameState.summonedEnemies.push(enemy);
                },
            }, self);
        }
     

        /**
         * -------------------------------------------------------------------------------------------------------------------
         * END OF GAME
         * -------------------------------------------------------------------------------------------------------------------
         */
    

        function endFightIfGameOver() {  
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

        // Handle Defeat: Fade out graphics, display defeat text, play theme, and transition to Endscene.
        async function initiateDefeat() {
            gameState.player.health = 0; // Avoids negative life
            gameState.player.updateManaBar();
            addHandtoDiscardPile();
            fadeOutGameObject(gameState.actionText, 200);
            fadeOutGameObject(gameState.actionTextBackground, 200);
            gameState.actionTextObjects.forEach(obj => fadeOutGameObject(obj, 200));

            gameConfig.music.stop();
            gameState.buttons.forEach(button => button.destroy());
            gameState.score.numberOfTurns += gameState.turn;
            const textConfig = { fontSize: '150px', fill: '#ff0000', fontFamily: 'Rock Kapak' };

            gameState.gameOverText = self.add.text(825, 450, 'Defeat!', textConfig).setOrigin(0.5);
            gameState.gameOverText.setInteractive();
            let scenetransitionstarted = false;

            await self.delay(400);
            gameConfig.musicTheme.play( { loop: true, volume: 0.30 } );

            const transitionToEndScene = () => {
                if (scenetransitionstarted) return;
                scenetransitionstarted = true;
                self.scene.start('Endscene');
            }

            gameState.gameOverText.on('pointerup', () => transitionToEndScene());
            self.time.delayedCall(2400, () => transitionToEndScene());
        };
        
        // Handle Victory
        async function initiateVictory() { // NB! Modified for level 2-2
            gameState.score.numberOfTurns += gameState.turn;
            gameState.score.levelsCompleted ++;
            gameConfig.music.stop();
            gameState.player.updateManaBar();
            self.addTokensToDeck();
            addHandtoDiscardPile();
            // Reset cards with special abilities. Remove debuffs from deck.
            gameState.deck.forEach(card => card.reset());
            
            // Fade out any remaining action text objects
            if (gameState.actionText) fadeOutGameObject(gameState.actionText, 200);
            if (gameState.actionTextBackground) fadeOutGameObject(gameState.actionTextBackground, 200);
            gameState.actionTextObjects.forEach(obj => fadeOutGameObject(obj, 200));
            gameState.enemies.forEach(enemy => fadeOutGameObject(enemy.sprite, 200));
            self.time.delayedCall(250, () => self.clearBoard());            

            // Pause -> stop music -> pause again -> play victory sound
            await self.delay(400);
            if (gameConfig.attackSound.isPlaying) gameConfig.attackSound.stop();
            await self.delay(200);
            gameConfig.victorySound.play( { volume: 0.9, rate: 1, seek: 0.05 } );
            
            // If gold is earned, call earnGoldUponWinningFight and wait while it runs
            const isGoldEarned = await earnGoldUponWinningFight();

            // Display victory text
            const victoryTextConfig = { fontSize: '150px', fill: '#ff0000', fontFamily: 'Rock Kapak' };
            let victoryText = self.add.text(825, 450, "Victory!", victoryTextConfig).setOrigin(0.5).setDepth(21);
            const { level, fight } = self.extractLevelFightFromName(self.scene.key);
            const levelCompleteText = fight === 3 ? `You have completed Level ${level}\nHealth is resorted to ${gameState.player.healthMax}/${gameState.player.healthMax}` : "";
            
            // After a short delay, play theme music and update the text
            const delayBeforeRemoveText = isGoldEarned ? 1500 : 1200;
            await self.delay(delayBeforeRemoveText);
            gameConfig.musicTheme.play( { loop: true, volume: 0.30 } );
            victoryText.setText(levelCompleteText);
            victoryText.setStyle({fontSize: '90px'});

            // After another short delay, fade out the text and call createEndOfFightMenu();
            const delayBeforeEndFight = fight === 3 ? 3000 : 100;
            await self.delay(delayBeforeEndFight);
            victoryText.destroy();
            createEndOfFightMenu();
        }

        // Earn gold if gundanSeizai or zaibatsu is active and conditions are met.
        async function earnGoldUponWinningFight() {
            let zaibatsuDelay = 0;
            
            // Handle gundanSeizai
            if (gameState.gundanSeizai) {
                earnGold(1);
                self.animatePermanent('gundanSeizai');
                zaibatsuDelay = 200;
            }

            // Handle zaibatsu
            await self.delay(zaibatsuDelay);
            // Limit gold earnings to zaibatsuMax
            const tentativeZaibatsuIncome = Math.floor(gameState.player.gold * 0.15)
            const zaibatsuIncome = gameState.zaibatsuMax ? Math.min(gameState.zaibatsuMax, tentativeZaibatsuIncome) : 0;
            if (zaibatsuIncome) {
                earnGold(zaibatsuIncome);
                self.animatePermanent('zaibatsuU');
            }

            // return true if gold was earned 
            return gameState.gundanSeizai || zaibatsuIncome;
        }
        
        // initialize end of fight menu
        function createEndOfFightMenu() {
            // initialize victoryElements with the properties level and fight = level and fight number
            const victoryElements = self.extractLevelFightFromName(self.scene.key);
            victoryElements.goldAmount = victoryElements.fight === 3 ? 5 : 3;
            gameState.goldCollected = false;
            displayEndOfFightText(victoryElements);
            
            // Set properties of menu buttons
            const collectGoldText = `Collect ${victoryElements.goldAmount} Gold`;
            const nextLevelText = gameState.deck.length < gameConfig.maxDeckSize ? 'Collect free card\n  and continue' : 'Maximum deck size\n    continue'
            const x = 825;
            const y = 375;
            const offset = 150;
            let i = 0;

            // Create and configure menu buttons
            victoryElements.rewardCollectGoldButton = new Button(self, collectGoldText, handleCollectGoldPointerup, x, y + offset * i++, 103);
            victoryElements.enterShopButton = new Button(self, `Enter Shop`, handleEnterShopPointerup, x, y + offset * i++, 103);
            victoryElements.rewardAddCardsButton = new Button(self, nextLevelText, handleAddCardsPointerup, x, y + offset * i++, 103);
            victoryElements.rewardButtons = [victoryElements.rewardCollectGoldButton, victoryElements.enterShopButton, victoryElements.rewardAddCardsButton];

            victoryElements.rewardButtons.forEach(button => {
                button.activate().setScale(1.3, 1.0).updateFont(24).setHandlerArg(victoryElements);
            });

            victoryElements.gameOverObjects = [
                ...victoryElements.rewardButtons, 
                victoryElements.gameOverText, 
            ]
        }

        // Display text and store it in endOffFightElements.
        function displayEndOfFightText(victoryElements) {
            const { level, fight } = victoryElements;
            const newLevelText = `Collect loot and get\nready for Level ${level +1}!`
            const newFightText = '  Collect loot and get\nready for your next fight!'
            const gameOverTextContent = fight === 3 ? newLevelText : newFightText;

            const textConfig = { fontSize: '60px', fill: '#ff0000' };
            const textCoordinates = { x: 825, y: 180, z: 103 };
            victoryElements.gameOverText = new TextBox(self, gameOverTextContent, textCoordinates, textConfig);
        }

        // IF gold has already been collected, shake the screen and return. Otherwise, collect gold.
        function handleCollectGoldPointerup(victoryElements) {
            if (gameState.goldCollected) {
                self.cameras.main.shake(50, .0015, false);
                return;
            }

            gameState.goldCollected = true;
            earnGold(victoryElements.goldAmount);
            victoryElements.rewardCollectGoldButton.setPointerText('Gold has allready been collected');
        }

        // Disable all reward buttons and initate shop
        function handleEnterShopPointerup(victoryElements) {
            victoryElements.rewardButtons.forEach(button => button.disable());
            initiateShop(victoryElements);
        }

        // Destroy all end of fight menu objects. If deck is less than max size, proceed to pick free card. Otherwise start next level.
        function handleAddCardsPointerup(victoryElements) {
            gameState.endGameMenyExited = true;
            victoryElements.rewardButtons.forEach(button => button.setDepth(1));
            victoryElements.gameOverObjects.forEach(object => object.destroy());

            if (gameState.deck.length < gameConfig.maxDeckSize) {
                pickCardAndAddToDeck();
            } else {
                self.input.on('pointerup', () => startNextLevel());
                self.time.delayedCall(2500, () => startNextLevel());
            }
        }

        // Draw three random rards from bonusCards, and select one card to add to deck.
        function pickCardAndAddToDeck(depth=102) {
            const x = 510;
            const y = 510;
            const spacing = 315;
            const redrawCost = 1;

            self.shuffleDeck(gameState.bonusCards);
            let bonusCards = gameState.bonusCards.splice(0, 3);

            // latestDraw ensures that the same card does not appear twice in a row
            gameState.latestDraw?.forEach(card => {
                    gameState.bonusCards.push(card);
            });
            gameState.latestDraw = [...bonusCards];
       
            // animate card sprites and initiate selection upon pointerup
            bonusCards.forEach((bonusCard, idx) => {
                bonusCard.sprite = self.add.image(x + idx * spacing, y, bonusCard.key);
                configureBonusCard(bonusCards, bonusCard, depth);
            })
            initiatAddCardRedrawButton(y, redrawCost, bonusCards);
        }

        function configureBonusCard(bonusCards, bonusCard, depth) {
            const scaleDefault = 0.68;
            const scaleZoomedIn = 0.87;
            const zoomDurationBase = 200;

            bonusCard.activate().configure(scaleDefault, depth);

            // Event listeners for pointerover/out/up
            bonusCard.sprite.on('pointerover', () => {
                // console.log(pointerOver)
                bonusCard.resize(self, scaleZoomedIn, zoomDurationBase);
            }, self);
            
            bonusCard.sprite.on('pointerout', () => {
                bonusCard.resize(self, scaleDefault, zoomDurationBase * 2);
            }, self);
    
            bonusCard.sprite.on('pointerup', () => {
                handleAddCardPointerup(bonusCards, bonusCard);
            })
        }

        function handleAddCardPointerup(bonusCards, bonusCard) {
            gameState.nextlevelstarting = false;
            bonusCard.center(self);

            // make a new instance to avoid multiple copies on hand refering to the same object
            const bonusCardCopy = new Card(bonusCard); 
            gameState.deck.push(bonusCardCopy);

            // Remove all non-selected card sprites
            bonusCards.forEach( card => {
                card.disable();
                if (card !== bonusCard) card.fadeOut(self, 200);
            })

            // Filter out cards that should not be added to gameState.deck
            const maxExemplarsCondition = gameState.deck.filter(c => c.key === bonusCard.key).length >= gameConfig.maxCardExemplars;
            const permanentCondition = bonusCard.type === 'permanent';
            if (maxExemplarsCondition || permanentCondition) {
                gameState.latestDraw = gameState.latestDraw.filter(c => c !== bonusCard);
            }

            if (gameState.redrawCardsButton) gameState.redrawCardsButton.destroy();
            const gainedCardText = addGainedCardText();
            
            // If the function was called by selecting free card at the end of the fight, initate next level
            // Otherwise return to shop
            if (!gameState.endGameMenyExited) {
                returnFromAddCardToShop(gainedCardText, bonusCard);
                return;
            }

            self.input.on('pointerup', () => startNextLevel());
            self.time.delayedCall(2500, () => startNextLevel());
        }

        // Helper function for informing the player that a card for added to deck
        function addGainedCardText() {
            const textContent = "Gained 1 card";
            const textConfig = {fontSize: '60px', fill: '#000000'};
            const textCoordinates = { x: 825, y: 270, z: 211 };

            return new TextBox(self, textContent, textCoordinates, textConfig);
        }

        // Function for removing all remaining sprites from add cards, and reenabling shop buttons
        async function returnFromAddCardToShop(gainedCardText, bonusCard) {
            gainedCardText.fadeOut();
            self.time.delayedCall(1000, () => bonusCard.fadeOut(self, 500));

            await self.delay(1500);
            if (gameState.shopButtonPressed) {
                gameState.shopButtonPressed = false;
            }
        }

        // Main function for the shopRemoveCardButton handler: display and configure card sprites
        function pickCardAndRemoveFromDeck(depth=220) {
            const spacing = 180;          
            const cardsPerRow = gameState.deck.length < 12 ? 4 : 6;
            const x = gameState.deck.length < 12 ? 600 : 375;
            const y = 375;
            const cardScale = 0.38
        
            // Create and position card sprites
            gameState.deck.forEach((deckCard, index) => {
                let xPos = x + (index % cardsPerRow) * spacing;
                let yPos = y + Math.floor(index / cardsPerRow) * spacing;
                let cardDepth = depth + index;
                
                deckCard.sprite = self.add.image(xPos, yPos, deckCard.key);
                if (deckCard.isActive) deckCard.disable(); // Resets card for new activation
                deckCard.configure(cardScale, cardDepth).activate();
        
                // Hanlders for pointerover/out/up
                deckCard.sprite.on('pointerover', function() {
                    gameConfig.cardsDealtSound.play({ volume: 0.6 });
                    self.cardTweens(deckCard.sprite, 0.55, 200);
                    deckCard.sprite.setDepth(250);
                }, this);
        
                deckCard.sprite.on('pointerout', function() {
                    self.cardTweens(deckCard.sprite, 0.38, 400);
                    deckCard.sprite.setDepth(cardDepth);
                }, this);
        
                deckCard.sprite.on('pointerup', function() {
                    handleRemoveCardPointerup(deckCard);
                })
            })
        }

        // Handler for remove card sprite button up
        function handleRemoveCardPointerup(removedCard) {
            // Remove the selected card from deck, center it on the screen and let it fade out after a short delay
            console.log(`Deck length before removal: ${gameState.deck.length}`);
            gameState.deck = gameState.deck.filter(card => card !== removedCard);
            removedCard.center(self).disable();
            self.time.delayedCall(600, () => removedCard.fadeOut(self));

            // Disable and fade out all other cards
            gameState.deck.forEach( (card) => {
                card.disable().fadeOut(self);
            });

            // Display text informing the player that the card was removed.
            const removedCardTextContent = 'Removed 1 card';
            const textConfig = { fontSize: '60px', fill: '#000000' };
            const textCoordinates = { x: 825, y: 270, z: 210 };

            const removedCardText = new TextBox(self, removedCardTextContent, textCoordinates, textConfig);
            gameState.shopButtonPressed = false;
            
            // fade out the text after a short delay
            self.time.delayedCall(1000, () => removedCardText.destroy())
        }

        // Create and configure redrawCardsButton for the addCardToDeck function
        function initiatAddCardRedrawButton(y, redrawCost, bonusCards) {
            const depth = 202;
            const handlerArgs = {y: y, redrawCost: redrawCost, bonusCards: bonusCards, depth: depth}
            const redrawText = `   Redraw\nCost: ${redrawCost} Gold`

            gameState.redrawCardsButton = new Button(self, redrawText, activateAddCardRedrawButton, 825, y + 330, depth);
            gameState.redrawCardsButton.activate().setScale(1.6, 1.2).updateFont(35).setHandlerArg(handlerArgs)
        }

        // Handler for redrawCardsButton pointer up.
        function activateAddCardRedrawButton(args) {
            if (gameState.player.gold < args.redrawCost) {
                self.cameras.main.shake(50, .0015, false);
                return;
            }

            spendGold(args.redrawCost)
            gameState.redrawCardsButton.destroy();
            args.bonusCards.forEach(card => card.fadeOut(self, 50));

            pickCardAndAddToDeck(args.depth);
        }

        // find the next level in gameState.level, and start transitioning.
        function startNextLevel() {
            if (gameState.nextlevelstarting) return;
            gameState.nextlevelstarting = true;

            self.updatePermanentSlots(); // Delay this until here => no permaenents are lost during shopping etc.

            let nextLevel;
            for (let i = 0; i < gameConfig.levels.length; i++) {
                if (self.scene.key === gameConfig.levels[i]) {
                    if (i + 1 < gameConfig.levels.length) {
                        nextLevel = gameConfig.levels[i + 1];
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
                console.error('Current level not found in gameConfig.levels');
            }
        }


        /**
         * -------------------------------------------------------------------------------------------------------------------
         * END OF FIGHT SHOP
         * -------------------------------------------------------------------------------------------------------------------
         */


        async function initiateShop(victoryElements) {
            // Visals when entering the shop
            self.cameras.main.shake(100, .0015, false);
            self.cameras.main.flash(350);

            // Initialize/reset shop state and the shopElements body
            gameState.shopButtonPressed = false;
            const shopElements = { victoryElements };
            shopElements.buyTexts = [];
            shopElements.shopSprites = [];
        
            // After a short delay create the shop and welcome the player.
            await self.delay(150);
            gameState.shopBackground = self.add.image(0, 0, 'shop1').setScale(1.275).setInteractive().setOrigin(0.02, 0).setDepth(200);
            // gameState.shopBackground = self.add.image(0, 0, 'shop1').setScale(1,5).setInteractive().setOrigin(0.02, 0).setDepth(200);
            createShop(shopElements);
            welcomeToShop();
            shopElements.shopSprites.push(gameState.shopWelcomeText, gameState.shopTextBackground, gameState.shopBackground);
        }

        function createShop(shopElements) {
            shopElements.healAmount = 8;
            shopElements.healCost = self.adjustForDifficulty(1, 2, 2);
            shopElements.addCardCost = 2;
            shopElements.removeCardCost = 2;
            shopElements.textConfig = { fontSize: '75px', fill: '#ff0000' };

            const healDescription = ` Gain ${shopElements.healAmount} HP\nCost: ${shopElements.healCost} Gold`;
            const addCardDescription = ` Buy 1 Card\nCost: ${shopElements.addCardCost} Gold`;
            const removeCardDescription = `Deplete 1 card\n Cost: ${shopElements.removeCardCost} Gold`;
            const x = 255;
            const y = 410;
            const offset = 130;
            let i = 0;
            
            shopElements.shopHealButton = new Button(self, healDescription, handleShopHealPointerup, x, y + offset * i++);
            shopElements.shopAddCardButton = new Button(self, addCardDescription, handleShopAddCardPointerup, x, y + offset * i++);
            shopElements.shopRemoveCardButton = new Button(self, removeCardDescription, handleShopRemoveCardPointerup, x, y + offset * i++);
            shopElements.shopExitButton = new Button(self, `Exit Shop`, handleShopExitPointerup, x, y + offset * i++);
           
            shopElements.shopButtons = [
                shopElements.shopHealButton, shopElements.shopExitButton, 
                shopElements.shopAddCardButton, shopElements.shopRemoveCardButton
            ];
            shopElements.shopButtons.forEach(button => {
                button.activate().setScale(1.35, 0.9).setHandlerArg(shopElements);
            });
            shopElements.shopSprites.push(...shopElements.shopButtons, ...shopElements.buyTexts);

            // levelComplete -> Inform the player that health was reset => no need to buy health!
            const { level, fight } = self.extractLevelFightFromName(self.scene.key);
            if (fight === '3') {
                shopHealButton.diable();
                shopElements.levelComplete = true;
                informAboutHealthReset(level);
                shopElements.shopButtons.shift();
            }
        }

        // Buy health: Handler for pointer up on the but health button
        function handleShopHealPointerup(sE) {
            // Check if the button is playable, proceed if it is. Otherwise, shake the screen and return.
            const { isHealEnabled } = IsShopButtonEnabled(sE.healCost, sE.levelComplete);
                if (!isHealEnabled) {
                    self.cameras.main.shake(50, .0015, false);
                    return;
                }

            // Increment health, pay the price, and deactivate all shop buttons
            let { shopButtons, healCost, healAmount, textConfig, buyTexts, shopSprites } = sE;
            handleShopButtonClicked(healCost, sE);
            gameState.player.health = Math.min(gameState.player.healthMax, gameState.player.health + healAmount);
            
            // Display text informing the player about the successful purchace.
            const textCoordinates = { x: 825, y: 225, z: 205 };
            const healthFraction = `${gameState.player.health}/${gameState.player.healthMax}`;
            const textContent = `    You bought ${healAmount} HP\nTotal health: ${healthFraction}`;
            const boughtHealthText = new TextBox(self, textContent, textCoordinates, textConfig);    

            buyTexts.push(boughtHealthText);
            shopSprites.push(boughtHealthText);
            
            // Distroy the text after a fixed time delay
            self.time.delayedCall(2000, () => {
                if (boughtHealthText) {
                    buyTexts = buyTexts.filter( item => item != boughtHealthText);
                    shopSprites = shopSprites.filter( item => item != boughtHealthText);
                    boughtHealthText.fadeOut();
                }
            })

            // reactivate shop buttons.
            gameState.shopButtonPressed = false; 
            reactivateShopButtons(shopButtons);
        }

        // Add card to deck
        function handleShopAddCardPointerup(sE) {
            const { isAddCardEnabled } = IsShopButtonEnabled(sE.addCardCost);
            if (!isAddCardEnabled) {
                self.cameras.main.shake(50, .0015, false);
                return;
            }
            handleShopButtonClicked(sE.addCardCost, sE);
            pickCardAndAddToDeck(210);
            reactivateShopButtons(sE.shopButtons);
        }

        // handler for shopRemoveCardButton pointeerup
        function handleShopRemoveCardPointerup(sE) {
            const { isRemoveCardEnabled } = IsShopButtonEnabled(sE.removeCardCost);
            if (!isRemoveCardEnabled) {
                self.cameras.main.shake(50, .0015, false);
                return;
            }
            handleShopButtonClicked(sE.removeCardCost, sE);
            pickCardAndRemoveFromDeck(210);
            reactivateShopButtons(sE.shopButtons);
        }

        // Exit shop
        async function handleShopExitPointerup(sE) {
            // Check if the button is clickable
            if (gameState.shopButtonPressed) {
                self.cameras.main.shake(50, .0015, false);
                return;
            }

            // Fade out or destroy all shop elements.
            gameState.shopButtonPressed = true;
            sE.shopButtons.forEach(button => button.disable());
            self.cameras.main.shake(100, .001, false); 
            self.cameras.main.flash(300);
            if (sE.redrawCardsButton) sE.redrawCardsButton.destroy();

            // wait a little bit, and then destroy all other shop buttons.
            await self.delay(250);
            sE.shopSprites.forEach(object => {if (object) object.destroy()});

            // Add some delay before reactivating Reward Buttons.
            self.time.delayedCall(100, () => { 
                sE.victoryElements.rewardButtons.forEach(button => button.activate());
            })
        }

        // If this was the final fight in a level, inform the player that health was reset -> no need to buy health.
        function informAboutHealthReset() {

            shopHealButton.on('pointerover', function() {
                const { level, _ } = self.extractLevelFightFromName(self.scene.key);

                const textConfig = {fontSize: '38px', fill: '#000000'};
                const textCoordinates = { x: 855, y: 420, z: 26 };
                const textContent = `Health was reset to Max Health\n  Upon completion of Level ${level}`;
                gameState.healthResetText = new TextBox(self, textContent, textCoordinates, textConfig);

            });

            shopHealButton.on('pointerout', () => {
                shopHealButton.setTexture('rectangularButton');
                if (gameState.healthResetText) gameState.healthResetText.destroy();
            });
        }

        // Check if the shop buttons are playable
        function IsShopButtonEnabled(cost, levelComplete=null) {
            const costConditions = gameState.player.gold >= cost;
            const buttonConditions = !gameState.shopButtonPressed;
            const removeCardConditions = gameState.deck.length > gameConfig.minDeckSize;
            const addCardConditions = gameState.deck.length < gameConfig.maxDeckSize;
            const healConditions = gameState.player.health < gameState.player.healthMax && !levelComplete;

            const isAddCardEnabled = costConditions && buttonConditions && addCardConditions;
            const isRemoveCardEnabled = costConditions && buttonConditions && removeCardConditions;
            const isHealEnabled = costConditions && buttonConditions && healConditions;

            return { isAddCardEnabled, isRemoveCardEnabled, isHealEnabled };
        }

        // Common functionalities for all the shop elements
        function handleShopButtonClicked(cost, shopElements) {
            const { shopButtons, buyTexts } = shopElements;
            gameState.shopButtonPressed = true;
            shopButtons.forEach(button => button.disable());
            spendGold(cost);

            buyTexts.forEach(text => {
                if (text) text.destroy();
            });
        }

        // Reactivate shop buttons after a short delay
        function reactivateShopButtons(buttons) {
            self.time.delayedCall(200, () => {
                buttons.forEach(button => button.activate());
            })
        }

        // Display a text welcomming the player to the shop
        function welcomeToShop() {
            const fullText = `Welcome to my shop,\n${gameState.player.name}!`;
            const textConfig = { fontSize: '60px', fill: '#000000' };
            let currentText = ``;
            const delay = 50;
            gameState.shopWelcomeText = self.add.text(825, 90, currentText, textConfig).setOrigin(0.5)
            gameState.shopTextBackground = self.add.graphics();
        
            // Loop based on the length of the text
            for (let i = 0; i < fullText.length; i++) {
                self.time.delayedCall(i * delay, () => {
                    // Try/catch => no crash if the player exits the shop during text generation
                    try {
                        if (!gameState.shopWelcomeText) return; 
                        currentText += fullText.charAt(i);
                        gameState.shopWelcomeText.setText(currentText);
                        self.updateTextAndBackground(gameState.shopWelcomeText, 
                            gameState.shopTextBackground, currentText, 7, 201
                        );
                    } catch (error) {
                        return;
                    }
                });
            }
        }

        // Helper functions for incrementing/ reducing gameState.player.gold and updating the gold counder
        function earnGold(goldAmount) {    
            for (let i = 1; i <= goldAmount; i++) {
                self.time.delayedCall(i * 75, () => {
                    gameState.player.gold = Math.min(gameState.player.gold + 1, gameState.player.goldMax);
                    gameState.goldCounter.setText(gameState.player.gold);
                    gameConfig.coinSound.play({ volume: 0.8, seek: 0.02 });
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
  

        /**
         * -------------------------------------------------------------------------------------------------------------------
         * PERMANENTS
         * -------------------------------------------------------------------------------------------------------------------
         */
 

        // Main function for handling permanents: alloctates slots; handles special cases; creates and activates permanent tokens
        function addPermanent(card) {   
            // Allocate the leftmost available permanent slot. If none are available, activate the permanent for its depletion effect    
            let slot = gameState.permanentSlots.find(slot => slot.available);
             if (!slot) {
                activatePermanentFromHand(card);
                return;
            }

            // Remove the permanent-card from deck. For token-cards; put a new instance of the card into discardPile
            processTokenCards(card);
            gameState.deck = gameState.deck.filter(c => c !== card);
            
            // steelToe2 replaces steelToe => its function (which removed the existing tokenSprite) must run before new tokenSprite is created.
            if (card.key === 'steelToe2') { slot = handleSteelToe2(slot); }

            // For all cards except freePermanents; destroy the card sprite and free up its slot
            if (gameState.fightStarted) { 
                card.slot.available = true;
                card.sprite?.destroy();
            }

            // Display the permanent's token-sprite in the allocated permanent-slot 
            card.tokenSprite = self.add.image(slot.x, slot.y, card.token);
            card.tokenSprite.setScale(0.80).setDepth(210).setInteractive();
            slot.available = false;
            card.tokenSlot = slot;

            const permanent = { card: card, slot: slot, tokenSprite: card.tokenSprite };
            if (!gameState.permanents.some(p => p.card.key === permanent.card.key )) {
                gameState.permanents.push(permanent);
            }

            // Store current references to tokenSprite and tokenSlot in local variables to correctly handle non-depleted cards. 
            // These will be closed over in the event callback function => the correct sprite and slot are manipulated when the sprite is clicked, 
            // even if the card object is later updated with new sprite and slot references.
            const tokenSprite = card.tokenSprite;
            const tokenSlot = card.tokenSlot;

            displayTokenCard(card);
            activatePermanentFromToken(card);

            card.tokenSprite.on( 'pointerup', () => {
                if (gameState.playersTurn) {
                    depletePermanentFromToken(card, tokenSprite, tokenSlot);
                } else {
                    self.cameras.main.shake(70, .002, false);
                }
            })
        }

        // Search for a matching key in the tokenCardNames
        // If a matching key is found, create a new Card and add it to the discard pile
        function processTokenCards(card) {       
            const properties = gameConfig.tokenCardNames.find(tokenCard => tokenCard.key === card.key); 
            if (!properties) return;
    
            let newCard = new Card(properties);
            gameState.deck.push(newCard);
            gameState.discardPile.push(newCard);
            gameState.discardPileText.setText(gameState.discardPile.length);
        }

        // Registry of the depletion functions of each permanent. Function is called based on card.key.
        const depleteFunctionRegistry = {
            depleteForeverTrue: (card) => depleteForeverTrue(card),
            depleteRebelSpirit: (card) => depleteRebelSpirit(card),
            depleteRebelHeart: (card) => depleteRebelHeart(card),
            depleteBushido: (card) => depleteBushido(card),
            depleteToxicAvenger: (card) => depleteToxicAvenger(card),
            depleteKirisuteGomen: (card) => depleteKirisuteGomen(card),
            depleteToxicFrets: (card) => depleteToxicFrets(card),
            depleteAshenEncore: (card) => depleteAshenEncore(card),
            depleteEdoEruption: (card) => depleteEdoEruption(card), 
            depleteSteelToe: (card) => depleteSteelToe(card),
            depleteDeadTokugawas: (card) => depleteDeadTokugawas(card) , 
            depleteGundanSeizai: (card) => depleteGundanSeizai(card),
            depleteLustForLife: (card) => depleteLustForLife(card),
            depletePunksNotDead: (card) => depletePunksNotDead(card),
            depleteSoulSquatter: (card) => depleteSoulSquatter(card),
            depleteBouncingSoles: (card) => depleteBouncingSoles(card) ,
            depleteEnduringSpirit: (card) => destroyToken(card),
            depleteShogunsShell: (card) => depleteShogunsShell(card) ,
            depleteZaibatsuU: (card) => depleteZaibatsuU(card),
            
            // Non-depleted token cards
            depleteKamishimoUberAlles: function(card, tokenSprite, tokenSlot) {
                if (tokenSlot) tokenSlot.available = true;
                if (tokenSprite) tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(p => p.tokenSprite !== tokenSprite);
                gameState.kamishimoUberAlles -= 1;
                gameState.player.updateStats();
            },
        
            depleteHollidayInKamakura: function(card, tokenSprite, tokenSlot) {
                if (tokenSlot) tokenSlot.available = true;
                if (tokenSprite) tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(p => p.tokenSprite !== tokenSprite);
                gameState.player.manaMax += 1;
                gameState.player.mana += 1;
                gameState.player.updateManaBar();
                drawNewCards(1);
            },
        
            depleteChemicalWarfare: function(card, tokenSprite, tokenSlot) {
                if (card.isDepleted) return;
                card.isDepleted = true;
                if (tokenSlot) tokenSlot.available = true;
                if (tokenSprite) tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(p => p.tokenSprite !== tokenSprite);
                gameState.chemicalWarfare -= 2;
                console.log(`depleteChemicalWarfare called`);
            },
        
            depleteChintaiShunyu: function(card, tokenSprite, tokenSlot) {
                if (tokenSlot) tokenSlot.available = true;
                if (tokenSprite) tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(p => p.tokenSprite !== tokenSprite);
                gameState.zaibatsuMax = Math.max(0, gameState.zaibatsuMax - 1);
            },

            depleteStageInvasion: function(card, tokenSprite, tokenSlot) {
                if (tokenSlot) tokenSlot.available = true;
                if (tokenSprite) tokenSprite.destroy();
                if (card.permanentCardSprite) card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(p => p.tokenSprite !== tokenSprite);
                
                self.cameras.main.shake(100, .003, false);
                gameConfig.attackSound.play({ volume: 0.8 });

                const textConfig = { fontSize: '48px', fill: '#ff0000' };
                const textCoordinates = { x: 825, y: 525, z: 201 };
                const textContent =`Damages to all enemies`;
                const depleteText = new TextBox(self, textContent, textCoordinates, textConfig);
                self.time.delayedCall(1800, () => depleteText.destroy());  

                gameState.enemies.forEach(enemy => {
                    const damageModifyer = (1 + 0.10 * gameState.player.strength) * (1 - enemy.armor / 20);
                    const dmg = Math.round(2 * gameState.currentCards.length * damageModifyer);
                    enemy.takeDamage(dmg);
                    enemy.removeIfDead(handleTroopsOfTakamori);
                });

                endFightIfGameOver();
            },

            depleteLaidoSoho: function(card, tokenSprite, tokenSlot) {
                console.log('laido soho token clicked') // Remove this
                gameConfig.targetingCursor.setVisible(true);
                
                // handlers for pointerover/out/up.
                gameState.enemies.forEach (enemy => {
                    enemy.sprite.on('pointerover', function() {
                        gameConfig.targetingCursor.setTexture('targetingCursorReady');
                    });
            
                    enemy.sprite.on('pointerout', function() {
                        gameConfig.targetingCursor.setTexture('targetingCursor');
                    });
            
                    enemy.sprite.on('pointerup', function() {
                        gameState.enemies.forEach(enemy => enemy.sprite.off('pointerup')); 
                        handleLaidoSohoPointerup(enemy, card, tokenSprite, tokenSlot);
                        return;
                    });
                })
            }
        };

        function handleLaidoSohoPointerup(enemy, card, tokenSprite, tokenSlot) {
            const dmg = Math.round(gameState.player.armor * (1 + 0.10 * gameState.player.strength) * (1 - enemy.armor / 20));
            gameConfig.targetingCursor.setVisible(false);
            gameConfig.attackSound.play({ volume: 1 });
            self.cameras.main.shake(120, .020, false);

            if (card.sprite) card.sprite.destroy(); // Removes the card sprite incase the deplete effect was activated directely
            if (tokenSlot) tokenSlot.available = true;
            if (tokenSprite) tokenSprite.destroy();
            if (card.permanentCardSprite) card.permanentCardSprite.destroy();
            gameState.permanents = gameState.permanents.filter(p => p.tokenSprite !== tokenSprite);
        
            enemy.takeDamage(dmg).removeIfDead(handleTroopsOfTakamori);
            addInfoTextBox(`Dealt ${dmg} Physical Damage!`);   
            if (endFightIfGameOver()) return;
        }

        function depletePermanentFromToken(card, tokenSprite, tokenSlot) {
            let functionName = 'deplete' + card.key.charAt(0).toUpperCase() + card.key.slice(1);
            functionName = functionName.replace(/\d+$/, ''); // Remove trailing numbers (e.g. "steeToe2")
        
            // Deactivate tokens during the enemys turn. Otherwise, check if the function exists in the registry and call it
            const functionCondition = typeof depleteFunctionRegistry[functionName] === 'function'
            if (!card.specialDepletion && functionCondition) {
                
                // Add other cards with special depletion texts
                if (card.key !== 'kirisuteGomen' && card.key !== 'laidoSoho') {
                    addInfoTextBox(`Permanent depleted.`);
                }

                depleteFunctionRegistry[functionName](card, tokenSprite,tokenSlot);

            } else {
                self.cameras.main.shake(70, .002, false);
            }

            gameState.permanentSlots.forEach(slot => console.log('slot available: ' + slot.available)); // Remove this
        }

        function handleSteelToe2(currentSlot) {
            const depletedToken = gameState.permanents.find(p => p.card.key === 'steelToe');
            if (depletedToken) {
                const newSlot = depletedToken.slot; // Use the slot from the depleted token
                depleteFunctionRegistry.depleteSteelToe(depletedToken, false);
                return newSlot;
            } else {
                console.error('Error: steelToe token not found for depletion.');
                return currentSlot; // Return the original slot if no depleted token is found
            }
        }
        
        function depleteKirisuteGomen(card) { 
            if (!gameState.enemies.some(enemy => enemy.health < 30)) {
                handleKirisuteGomenNotPlayable(card);
                return;
            }
        
            gameState.deck = gameState.deck.filter(c => c !== card);
            gameConfig.targetingCursor.setVisible(true);
            let functionActive = true;
        
            // handlers for pointerover/out/up.
            gameState.enemies.forEach (enemy => {
                enemy.sprite.on('pointerover', function() {
                    gameConfig.targetingCursor.setTexture('targetingCursorReady');
                });
        
                enemy.sprite.on('pointerout', function() {
                    gameConfig.targetingCursor.setTexture('targetingCursor');
                });
        
                // If valid target; kill it. Otherwise; inform the player and return.
                enemy.sprite.on('pointerup', function() {
                    if (enemy.health <= 30 && functionActive) {
                        handleKirisuteGomenValidTarget(enemy, card);
                        return;
                    } else {
                        functionActive = false;
                        handleKirisuteGomenInvalidTarget();
                    }
                });
            })
        }

        function handleKirisuteGomenNotPlayable(card) {
            self.cameras.main.shake(70, .002, false);
            card.slot.available = false
        
            // This check prevents multiple copies if the card is clicked repeatedly
            if (!gameState.currentCards.some( card => card.key === 'kirisuteGomen')) {
                gameState.currentCards.push(card)
                gameState.player.mana ++;
                gameState.player.updateManaBar();
            }

            addInfoTextBox(`No viable target`);
        }

        // Shake the scree, inform the player that the targit is invalid; then let the text fade out
        function handleKirisuteGomenInvalidTarget() {
            self.cameras.main.shake(70, .002, false);
            addInfoTextBox(`Inviable target`);

            const textCoordinates = { x: 825, y: 525, z: 201 };
            const textConfig = { fontSize: '48px', fill: '#ff0000' };
            const depleteText = new TextBox(self, 'Target is not valid', textCoordinates, textConfig);
            self.time.delayedCall(1600, () => depleteText.fadeOut());
        }
            
        function handleKirisuteGomenValidTarget(enemy, card) {
            enemy.health = 0;
            gameConfig.attackSound.play({ volume: 1 });
            self.cameras.main.shake(120, .025, false);
            gameConfig.targetingCursor.setVisible(false);
            addInfoTextBox(`Enemy killed!`);   
            
            if (card.tokenSlot) {
                card.tokenSlot.available = true;
                gameState.player.strengthMax -= 5;
                gameState.player.strengt = Math.min(gameState.player.strengt, gameState.player.strengthMax);
            }
        
            if (card.sprite) card.sprite.destroy(); // Removes the card sprite incase the deplete effect was activated directely
            if (card.tokenSprite) card.tokenSprite.destroy();
            if (card.permanentCardSprite) card.permanentCardSprite.destroy();
            gameState.permanents = gameState.permanents.filter(c => c.card !== card);
        
            enemy.removeIfDead(handleTroopsOfTakamori);
            if (endFightIfGameOver()) return;
            gameState.player.updateStats();
        }
        
        function depleteSteelToe(card, depletionTriggeredByActivation=true) {
            destroyToken(card);
            removeSteelToe2FromGame();
            gameState.steelToeCount = 0;   
    
            // Reduce target's armor if depletion was triggered by clicking the token or playing the card from hand
            if (!depletionTriggeredByActivation) return;
            let depleteSteelToeActive = true;
            gameConfig.targetingCursor.setVisible(true);

            // Update cursor at pointerover and pointerout
            gameState.enemies.forEach(enemy => {
                enemy.sprite.on('pointerover', function() {
                    gameConfig.targetingCursor.setTexture('targetingCursorReady');
                });

                enemy.sprite.on('pointerout', function() {
                    gameConfig.targetingCursor.setTexture('targetingCursor');
                });

                // Event listeners for pointerup. Reduce targets arbor.
                enemy.sprite.on('pointerup', function() {
                    gameConfig.targetingCursor.setVisible(false);   
                    if (!depleteSteelToeActive) return;
                    
                    const armorReduction = card.key === 'steelToe' ? 7 : 9;
                    enemy.armorBase -= armorReduction;
                    enemy.updateStats();
                    gameConfig.attackSound.play({ volume: 0.6 });
                    self.cameras.main.shake(100, .012, false);
                    depleteSteelToeActive = false;  
                });
            });
            
        }

        function removeSteelToe2FromGame() {
            // Handle fade out for 'steelToe2' in currentCards
            gameState.currentCards.forEach(c => {
                if (c.key === 'steelToe2') {
                    fadeOutGameObject(c.sprite);
                }
            });
            
            // Remove the card from any existing decks.
            const deckKeys = ['currentCards', 'deck', 'drawPile', 'discardPile', 
                'bonusCards', 'extraCards'
            ];
            deckKeys.forEach(deckKey => self.removeCardFromDeck(deckKey, 'steelToe2'));

            // Update text for drawPile and discardPile if needed
            gameState.drawPileText.setText(gameState.drawPile.length);
            gameState.discardPileText.setText(gameState.discardPile.length);
        }

        function depleteRebelHeart(card) {
            gameState.rebelHeart = false;
            destroyToken(card);
            const player = gameState.player;        
            player.health = Math.min(player.healthMax, player.health + 12);
            gameConfig.healSound.play({ volume: 0.5 });
            player.updateHealthBar();
            player.powerUpTweens(); 
        }

        function depleteBushido(card) {
            gameState.bushido = false;
            destroyToken(card);               
            gameState.player.strengthBase += 6;
            gameState.player.updateStats();
        }

        function depleteRebelSpirit(card)  {
            gameState.rebelSpirit = false;
            destroyToken(card);
            gameState.player.mana += 3;
            gameState.player.manaMax += 3;
            gameState.player.updateManaBar();
        }

        function depleteForeverTrue(card) { 
            gameState.foreverTrue = false;
            // Keep destroyToken in methods due to cards with special conditions for token destruction
            destroyToken(card);
            drawNewCards(8);
        }

        // If the permanent was manually depleted, destroy the heal button and set counter to 0.
        function depleteLustForLife(card) {
            destroyToken(card);
            if (gameState.lustForLifeCounter >= 5) return;
            gameState.lustForLifeCounter = 0;
            const healButton = gameState.buttons.find(button => button.key === 'Heal');
            fadeOutGameObject(healButton, 200);
            gameState.buttons = gameState.buttons.filter(button => button.key !== 'Heal');
        }

        function depletePunksNotDead(card) {
            gameState.punksNotDeadCondition = false;
            destroyToken(card);
            if (!gameState.player.resurrected) return;

            gameState.player.alive = true;
            gameState.player.name += " The Undead";
            gameState.player.heal(Math.floor(gameState.player.healthMax * 0.2));
            gameConfig.healSound.play({ volume: 0.5 });
        }

        function depleteBouncingSoles(card) {
            if (gameState.bonusPermanentSlots.length) {
                gameState.permanentSlots.push(gameState.bonusPermanentSlots.shift());
            }
            if (gameState.bouncingSolesCards.length) {
                gameState.extraCards.push(gameState.bouncingSolesCards.shift());
                gameState.extraCards.forEach(c => console.log(c.key))
            }    
            destroyToken(card);
        }

        function depleteShogunsShell(card) {
            gameState.shogunsShellCounter = 0;
            gameState.player.armorCard = 15;
            gameState.player.powerUpTweens();
            gameState.player.updateStats();
            destroyToken(card);
        }

        function depleteSoulSquatter(card) {
            gameState.player.lifeStealBase -= 0.15;
            gameState.player.lifeStealThisTurn += 0.3;
            gameState.player.powerUpTweens();
            destroyToken(card);
        }

        function depleteGundanSeizai(card) {
            gameState.gundanSeizai = false;
            earnGold(3)
            destroyToken(card);
        }

        function depleteEdoEruption(card) {
            gameState.edoEruption = false;
            destroyToken(card);
        }

        function depleteZaibatsuU(card) {
            gameState.zaibatsuMax = 0;
            destroyToken(card);
        }

        function depleteDeadTokugawas(card) {
            gameState.redrawPrice += 1;
            destroyToken(card);
        }
        
        // Deal 4 poison to all enemies, and display text
        function depleteToxicAvenger(card) {
            gameState.toxicAvenger = false;
            destroyToken(card);
            self.cameras.main.shake(100, .003, false);
            gameConfig.attackSound.play({ volume: 0.8 });

            const textConfig = { fontSize: '48px', fill: '#ff0000' };
            const textCoordinates = { x: 825, y: 525, z: 201 };
            const textContent ='Deals 4 Poison\nto all enemies';
            const depleteText = new TextBox(self, textContent, textCoordinates, textConfig);
            self.time.delayedCall(1600, () => depleteText.destroy());    
    
            gameState.enemies.forEach(enemy => {
                enemy.poison += 4;
                enemy.updateStats();
            });
        }

        function depleteToxicFrets(card) {
            gameState.toxicFrets = false;
            destroyToken(card);
            self.cameras.main.shake(100, .003, false);
            gameConfig.attackSound.play({ volume: 0.8 });

            const textConfig = { fontSize: '48px', fill: '#ff0000' };
            const textCoordinates = { x: 825, y: 525, z: 201 };          
            const textContent ='   Damage all\npoisoned enemies';
            const depleteText = new TextBox(self, textContent, textCoordinates, textConfig);
            self.time.delayedCall(1600, () => depleteText.destroy());   
            
            gameState.enemies.forEach( enemy => {
                if (enemy.poison > 0) {
                    enemy.health -= enemy.poison * 2;
                    enemy.updateHealthBar();
                    enemy.removeIfDead(handleTroopsOfTakamori);
                    endFightIfGameOver();
                };
            })
        };
    
        function depleteAshenEncore(card) {
            gameState.ashenEncore = false;
            destroyToken(card);
            self.cameras.main.shake(100, .003, false);
            gameConfig.attackSound.play({ volume: 0.8 });

            const textConfig = { fontSize: '48px', fill: '#ff0000' };
            const textCoordinates = { x: 825, y: 525, z: 201 }; 
            const textContent ='Deals 12 fire damage\n   to all enemies';         
            const depleteText = new TextBox(self, textContent, textCoordinates, textConfig);
            self.time.delayedCall(1600, () => depleteText.destroy());  
            
            gameState.enemies.forEach( enemy => {
                enemy.health -= 12;
                enemy.updateHealthBar();
                enemy.removeIfDead(handleTroopsOfTakamori);
                endFightIfGameOver();
            })
        };
        
        // Activate token; call effect or activation-function based on key.
        function activatePermanentFromToken(card) {
            if (!card.freePermanent) {
                const textContent = `Permanent activated.`;
                addInfoTextBox(textContent);
            }
        
            const cardActions = {
                'foreverTrue': () => { gameState.foreverTrue = true; },
                'rebelSpirit': () => { gameState.rebelSpirit = true; },
                'rebelHeart': () => { gameState.rebelHeart = true; },
                'bushido': () => {
                    gameState.bushido = true;
                    gameState.player.updateStats();
                },
                'toxicAvenger': () => {
                    gameState.toxicAvenger = true;
                    gameState.enemies.forEach(enemy => enemy.updateStats());
                },
                'kirisuteGomen': () => {
                    gameState.player.strengthMax += 5;
                    gameState.player.updateStats();
                },
                'toxicFrets': () => { gameState.toxicFrets = true; },
                'ashenEncore': () => { gameState.ashenEncore = true; },
                'edoEruption': () => { gameState.edoEruption = true; },
                'steelToe': () => handleSteelToe(1),
                'steelToe2': () => handleSteelToe(2),
                'gundanSeizai': () => { gameState.gundanSeizai = true; },
                'deadTokugawas': () => handleDeadTokugawas(),
                'lustForLife': () => handleLustForLife(card),
                'punksNotDead': () => {
                    gameState.punksNotDeadCondition = true;
                    gameState.punksNotDeadCard = card;
                },
                'soulSquatter': () => { gameState.player.lifeStealBase += 0.15; },
                'enduringSpirit': () => handleEnduringSpirit(card),
                'shogunsShell': () => { gameState.shogunsShellCounter = 2; },
                'zaibatsuU': () => handleZaibatsuU(),
                'kamishimoUberAlles': () => {
                    gameState.kamishimoUberAlles ++;
                    gameState.player.updateStats();
                },
                'hollidayInKamakura': () => handleHollidayInKamakura(card),
                'chemicalWarfare': () => handleChemicalWarfare(card),
                'stageInvasion': () => null,
                'laidoSoho': () => null,
                'chintaiShunyu': () => {
                    if (gameState.zaibatsuMax) {
                        gameState.zaibatsuMax += 2;
                    }
                }
            };
        
            if (cardActions[card.key]) {
                cardActions[card.key]();
            } else {
                self.cameras.main.shake(70, .002, false);
                console.log('unable to activate ${card.key}');
            }
        }

        function handleDeadTokugawas() {
            gameState.redrawPrice = Math.max(0, gameState.redrawPrice - 1);
            const redrawPointerText = `Redraw your hand\n Cost: ${gameState.redrawPrice} gold`;
            gameState.redrawButton.setPointerText(redrawPointerText);
        }

        // Increase the amount of armor destroyed by combat boots; add upgraded version of steel toe into extra cards pile.
        function handleSteelToe(count) {
            gameState.steelToeCount = count;
            if (gameState.steelToeCards.length) {
                gameState.extraCards.push(gameState.steelToeCards.shift());
            }
        }
        
        // Add and activate in-fight health shop; self-deplete and make shop permanent after 5 fights.
        function handleLustForLife(card) {
            gameState.lustForLifeCounter ++;

            gameState.lustForLifeButton = new Button(self, 'Heal', activateHealButton, 1350, 195, 8);
            gameState.lustForLifeButton.setPointerText(` Heal 7 HP\nCost: ${gameState.lustForLifeCost} gold`);
            
            if (gameState.lustForLifeCounter === 1) {
                self.time.delayedCall(100, () => gameState.lustForLifeButton.activate());
            }

            gameState.buttons.push(gameState.lustForLifeButton);
        
            if (gameState.lustForLifeCounter >= 5) {
                destroyToken(card);
            }
        }
        
        // Increment Health Max at the start of each fight; deplete after 8 fights.
        function handleEnduringSpirit(card) {
            if (gameState.fightStarted) return;
            gameState.player.healthMax += 4;
            gameState.player.updateHealthBar();
            gameState.enduringSpiritCounter ++;

            if (gameState.enduringSpiritCounter < 8) return;
            destroyToken(card);
        }
        
        function handleZaibatsuU() {
            gameState.zaibatsuMax = 3;
            if (gameState.zaibatsuCards.length) {
                gameState.extraCards.push(gameState.zaibatsuCards.shift());
            }
        }
        
        // No activation effect; Depletion => +1 card and +1 mana; Cannot be depleted the same turn it was played.
        function handleHollidayInKamakura(card) {
            let tokenSprite = card.tokenSprite;
            let tokenSlot = card.tokenSlot;
            const turnPlayed = gameState.turn;
            const fightPlayed = gameState.score.levelsCompleted;
        
            tokenSprite.on('pointerup', () => {
                const depletedDifferentTurn = () => turnPlayed !== gameState.turn || fightPlayed !== gameState.score.levelsCompleted;

                if (gameState.playersTurn && depletedDifferentTurn()) {
                    depleteFunctionRegistry.depleteHollidayInKamakura(card, tokenSprite, tokenSlot);
                } else {
                    self.cameras.main.shake(70, .002, false);
                }
            });
        }
        
        // Increase chemicalWarfare counter by 2; each enemy gains this number of poison every turn.
        function handleChemicalWarfare(card) {
            gameState.chemicalWarfare += 2;
        
            gameState.activeChemicalWarfares.push({
                card: card,
                turnPlayed: gameState.turn,
                tokenSprite: card.tokenSprite,
                tokenSlot: card.tokenSlot
            });
        }        
        
        function activatePermanentFromHand(card) {
            // No slots available => direct activation of deplete effect
            self.cameras.main.shake(70, .002, false);
            card.isBeingPlayed = false;
            const textContent = `No slots available. Depletion activated.`
            addInfoTextBox(textContent);

            let functionName = 'deplete' + card.key.charAt(0).toUpperCase() + card.key.slice(1);
            functionName = functionName.replace(/\d+$/, ''); // Remove trailing numbers
        
            // Check if the function exists in the registry and call it
            if (typeof depleteFunctionRegistry[functionName] === 'function') {
                depleteFunctionRegistry[functionName](card);
            } else {
                console.log(`Unknown card key: ${card.key}`);
            }
        }

        // Pointerover handler for token sprites
        function displayTokenCard(card) {
            card.tokenSprite.on('pointerover', function() {
                // Inform the player about the number of remaining available slots
                const numberOfSlots = gameState.permanentSlots.length;
                const numOfAvailableSlots = gameState.permanentSlots.filter(slot => slot.available === true).length;
                addInfoTextBox(`Available Permanent Slots: ${numOfAvailableSlots} / ${numberOfSlots}`, 2000);

                gameConfig.cardsDealtSound.play({ volume: 1.5, seek: 0.10 });
                card.permanentCardSprite = self.add.image(825, 450, card.key).setScale(0.83).setDepth(220);
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
            gameState.permanents = gameState.permanents.filter(p => p.card !== card);
            gameState.deck = gameState.deck.filter(c => c !== card); 
        } 
   

        /**
         * -------------------------------------------------------------------------------------------------------------------
         * UTILITIES
         * -------------------------------------------------------------------------------------------------------------------
         */

        
        // Handler for heal button pointerup -> Pay gold, gain HP, increment cost
        function activateHealButton() {
            const healCost = gameState.lustForLifeCost;
            const healAmount = 7;

            // Return if conditions for buying health are not met
            const costCondition = gameState.player.gold >= healCost;
            const healthCondition = gameState.player.health < gameState.player.healthMax;
            if (!costCondition || !healthCondition || !gameState.playersTurn) {
                self.cameras.main.shake(70, .002, false);
                return;
            }

            // Otherwise, heal, spend gold and increment heal cost
            spendGold(healCost);
            gameState.player.heal(healAmount);
            gameState.lustForLifeCost ++; 
            gameState.lustForLifeButton.setPointerText(` Heal 7 HP
Cost: ${gameState.lustForLifeCost} gold`);

            const textContent = `Bought ${healAmount} HP`;
            addInfoTextBox(textContent);
        }

        // Event handler for redraw button pointer up
        async function activateRedrawButton() {
            // Check if the redraw button is playable. If its not, shake the screen and return.
            const isPlayable = () => gameState.player.gold >= gameState.redrawPrice && gameState.redrawButton.isActive;
            if (!isPlayable()) {
                self.cameras.main.shake(70, .002, false);
                return;
            }

            gameState.buttons.forEach(button => button.deactivate());
            spendGold(gameState.redrawPrice++);
            const redrawPointerText = `Redraw your hand\n Cost: ${gameState.redrawPrice} gold`;
            gameState.redrawButton.setPointerText(redrawPointerText);
            self.animatePermanent('deadTokugawas');
            
            const numOfCards = gameState.currentCards.length;
            discardAllCardsFromHand();
            drawCards(numOfCards);

            const textContent = `Redrew your hand`
            addInfoTextBox(textContent);

            await self.delay(1000);
            gameState.buttons.forEach(button => button.activate());
        }

        // Helper function for discarding the hand upon redrawing.
        function discardAllCardsFromHand() {
            gameState.currentCards.forEach(card => {
                card.slot.available = true;
                card.sprite.destroy();
                gameState.discardPile.push(card);
                gameState.discardPileText.setText(gameState.discardPile.length);
            });
            gameState.currentCards = [];
        }

        // Method for discarding the whole hand. Used for redrawing and end of turn.
        function addHandtoDiscardPile() {    
            while (gameState.currentCards.length) {
                let card = gameState.currentCards.pop();
                if (!card.slot.available) card.slot.available = true;
                if (card.dBeat) delete card.dBeat
                gameState.discardPile.push(card);
                gameState.discardPileText.setText(gameState.discardPile.length);
                fadeOutGameObject(card.sprite, 200);
            }
        };

        function addInfoTextBox(textContent, delayTilDestruction = 1700) {
            // Destroy any existing text to avoid overlap
            gameState.infoBoxElements.forEach(element => {
                if (element) element.destroy();
            })

            // Create new text
            gameState.infoBoxElements = [];
            const textConfig = { fontSize: '30px', fill: '#000000' };
            const textCoordinates = { x: 825, y: 150, z: 21 };
            const textObject = new TextBox(self, textContent, textCoordinates, textConfig);
            gameState.infoBoxElements.push(textObject);
            
            // Cancel the previous timer event if it exists
            if (gameState.textBoxDepletionTimer) {
                gameState.textBoxDepletionTimer.remove();
            }
        
            // Destroy the textbox after a fixed timedelay
            gameState.textBoxDepletionTimer = self.time.delayedCall(delayTilDestruction, () => {
                gameState.infoBoxElements.forEach(element => {
                    if (element) element.destroy();
                });
                gameState.textBoxDepletionTimer = null;
            });
        }

        function updateAndDisplyPoisonCount(character, delayBeforeFadeOut) {
            if (!character.poison) return;

            const lostHP = character.updatePoison();
            const posionTextContent = `${character.name} takes ${lostHP} damage from Poison`;
            addInfoTextBox(posionTextContent, delayBeforeFadeOut);
        }

        function drawNewCards(numCards) {

            // Avoids error if gameState.deck.length < max number of cards on hand)
            const numCardsLimit = Math.min(gameState.deck.length, 8); 
            const numOfFreeSlots = gameState.slots.filter(slot => slot.available).length;
            numCards = (numOfFreeSlots < numCards) ? numOfFreeSlots : numCards;
            
            for (let i = 0; i < numCards; i++) {
                self.time.delayedCall(i * 75, () => {
                    if (gameState.currentCards.length >= numCardsLimit) {
                        self.cameras.main.shake(70, .002, false);
                        return;
                    }
        
                    // Check and reshuffle the deck if necessary
                    if (!gameState.drawPile.length) reshuffleDrawPile();
        
                    // Draw a card and create a sprite for it
                    let card = gameState.drawPile.pop();
                    card.sprite = self.add.image(0, 0, card.key).setScale(0.53).setInteractive(); //0.35
                    if (card.usedOneShot) card.sprite.setTint(0x808080);
                    console.log(`card added: ${card.key}`);
                    card.activate();
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
                        card.animatePointer(self, cardDepth);
                    };

                    gameConfig.cardsDealtSound.play({ volume: 2.2, seek: 0.10 });
                    gameState.drawPileText.setText(gameState.drawPile.length);

                    if (gameState.ashenEncore && !card.dBeat) {
                        dealAshenDmgOnDrawCard();
                    };

                    if (gameState.playersTurn) {
                        card.sprite.on('pointerup', function() {
                            console.log('card.sprite.on( pointerup') // Remove this
                            initiateCardActivation(card);
                        })
                    };
                });
            }  
        };

        async function dealAshenDmgOnDrawCard() {
            const ashenDamage = 4;
            self.animatePermanent('ashenEncore');
            self.cameras.main.shake(100, .003, false);
            gameConfig.attackSound.play({ volume: 0.8 });

            const textContent = `Deals ${ashenDamage} fire damage to all enemies`;
            addInfoTextBox(textContent);

            gameState.enemies.forEach( enemy => {
                enemy.health -= ashenDamage;
                enemy.updateHealthBar();
                enemy.removeIfDead(handleTroopsOfTakamori);
            })

            await self.delay(100);
            endFightIfGameOver();
        }

        function handleTroopsOfTakamori() {
            gameState.player.gold = Math.min(gameState.player.goldMax, gameState.player.gold + 1);
            gameState.goldCounter.setText(gameState.player.gold);
            gameConfig.coinSound.play({ volume: 0.8, seek: 0.02 });
            gameState.troopsOfTakamoriCondition = false;
        }

        function handlePunksNotDead() {
            self.animatePermanent('punksNotDead');
            const card = gameState.punksNotDeadCard;
            depletePermanentFromToken(card, card.tookenSprite, card.tokenSlot);
        }
        
        function fadeOutGameObject(gameObject, duration=200) { //NB! Keep it here. Moving it to base => bugs!
            if (!gameObject) return;

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

        // Functions for displaying the content of the draw and discard piles when their symbols are hovered over
        function displayCardPiles() {
            // Create base sprite and text for the deck
            const deckTextConfig = { fontSize: '68px', fill: '#000000', fontWeight: 'bold' };
            gameState.drawPileImage = self.add.image(180, 900, 'deck');
            gameState.discardPileImage = self.add.image(1470, 900, 'deck').setTint(0xff0000);
            
            const cardPileImages = [gameState.drawPileImage, gameState.discardPileImage];
            cardPileImages.forEach(image => image.setScale(0.20).setOrigin(.5,.5).setInteractive());
                
            gameState.drawPileText = self.add.text(180, 900, gameState.drawPile.length, deckTextConfig);
            gameState.discardPileText = self.add.text(1470, 900, gameState.discardPile.length, deckTextConfig);
            [gameState.drawPileText, gameState.discardPileText].forEach(text => text.setDepth(100).setOrigin(.5,.5));

            // Set event listeners for pointer over and pointerout
            gameState.drawPileImage.on('pointerover', () => handlePilePointerOver('drawPile'));
            gameState.discardPileImage.on('pointerover', () => handlePilePointerOver('discardPile'));
            cardPileImages.forEach(image => image.on('pointerout', handlePilePointerOut));
        }

        function handlePilePointerOver(pile) {
            gameState.stanceText.setAlpha(0); // Set stance text invicible so it doesnt overlap the pile title
                
            const length = gameState[pile].length;
            const cardsPerRow = length > 32 ? 10 : length > 24 ? 8 : length > 12 ? 6 : 4;
            const cardSpacing = 158;
            const startX =  length > 32 ? 117 : length > 24 ? 275 : length > 12 ? 431 : 590;
            const startY = 225;

            // Display heading
            const titleContent = self.camelCaseToTitle(pile) 
            const pileTitleConfig = { fontSize: '90px', fill: '#000000' };
            const textCoordinates = { x: 825, y: startY - 165, z: 200 };
            gameState.pileTitle = new TextBox(self, titleContent, textCoordinates, pileTitleConfig, 0.90);

            if (!gameState[pile].length) return;
            
            // Position the card sprites
            gameState[pile].forEach( (card, index) => {
                let cardX = startX + (index % cardsPerRow) * cardSpacing;
                let cardY = startY + Math.floor(index / cardsPerRow) * 1.5 * cardSpacing;

                let cardImage = self.add.image(cardX, cardY, card.key).setScale(0.4).setDepth(200);
                gameState.cardImages.push(cardImage);
            })
        }

        function handlePilePointerOut() {
            gameState.pileTitle.fadeOut();
            gameState.cardImages.forEach(image => fadeOutGameObject(image));
            gameState.cardImages = [];

            gameState.stanceText.setAlpha(1); // Set stance text visible again
        }

        // For testing purposes
        function addAdminTools() {
            const textConfig = { fontSize: '23px', fill: '#ff0000' }

            // Get mana
            gameState.getManaButton = self.add.image(825, 300, 'rectangularButton');
            gameState.getManaButton.setScale(0.68).setOrigin(0.5).setInteractive();
            gameState.getManaText = self.add.text(825, 300, `Get Mana`, textConfig).setOrigin(0.5);
            gameState.getManaButton.on('pointerup', () => {
                if (gameState.playersTurn) {
                    gameState.player.mana = gameState.player.manaMax;
                    gameState.player.updateManaBar();
                    console.log('mana gained');
                }
            })

            //Draw cards
            gameState.drawCardButton = self.add.image(825, 450, 'rectangularButton');
            gameState.drawCardButton.setScale(0.68).setOrigin(0.5).setInteractive();
            gameState.drawCardText = self.add.text(825, 450, `Draw Card`, textConfig).setOrigin(0.5);
            gameState.drawCardButton.on('pointerup', () => {
                if (gameState.playersTurn) {
                    drawNewCards(1);
                    console.log('card drawn');
                }
            })

            //Kill enemy
            gameState.killEnemyButton = self.add.image(825, 600, 'rectangularButton');
            gameState.killEnemyButton.setScale(0.68).setOrigin(0.5).setInteractive();
            gameState.killEnemyText = self.add.text(825, 600, `Kill Enemy`, textConfig).setOrigin(0.5);
            gameState.killEnemyButton.on('pointerup', () => {
                // The conditional statement is needed to avoid a TypeError when both enemies are dead.
                if ( gameState.enemies.some( enemy => enemy.health > 0 && gameState.playersTurn) ) {
                    const enemy = gameState.enemies.find( enemy => enemy.health > 0);
                    enemy.health = 0;
                    enemy.removeIfDead(handleTroopsOfTakamori);
                    endFightIfGameOver();
                    console.log(`${enemy.name} killed`);
                }
            })
        }

        if (gameState.playerName === 'admin') addAdminTools();

    }; //End of create

    update() {
        // Activate /deactivate / animate targeting cursor
        if (gameConfig.targetingCursor.visible) {
            gameConfig.targetingCursor.x = this.input.mousePointer.x;
            gameConfig.targetingCursor.y = this.input.mousePointer.y;

            gameState.enemies.forEach(enemy => {
                enemy.sprite.on('pointerover', function() {
                    gameConfig.targetingCursor.setTexture('targetingCursorReady');
                });
                enemy.sprite.on('pointerout', function() {
                    gameConfig.targetingCursor.setTexture('targetingCursor');
                });
            })
        }
        
        for (let i = gameState.activeChemicalWarfares.length - 1; i >= 0; i--) {
            const cw = gameState.activeChemicalWarfares[i];
            if (gameState.turn === cw.turnPlayed + 3) {
                depleteChemicalWarfare(cw.card, cw.tokenSprite, cw.tokenSlot);
                gameState.activeChemicalWarfares.splice(i, 1); // Remove from the array
            }
        }

        function depleteChemicalWarfare(card, tokenSprite, tokenSlot) {
            if (card.isDepleted) return;
            card.isDepleted = true;

            if (tokenSlot) tokenSlot.available = true;
            if (tokenSprite) tokenSprite.destroy();
            if (card.permanentCardSprite) card.permanentCardSprite.destroy();
            gameState.permanents = gameState.permanents.filter(p => p.tokenSprite !== tokenSprite);
            gameState.chemicalWarfare -= 2;
            console.log(`depleteChemicalWarfare called`);
        }
    }
} //end of scene
