/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

"use strict";

class BaseScene extends Phaser.Scene {

    create() {
        console.log('BaseScene loaded');
        this.scene.start('Preload');
    }

    // Initiaiate level
    baseCreate(backgroundImage, sceneKey, scale = 1.13) {
        this.add.image(0,0, backgroundImage).setScale(scale).setOrigin(0.02,0); 
        this.cameras.main.fadeIn(600, 0, 0, 0);   
        this.input.keyboard.createCursorKeys();
        
        // Reset State
        gameConfig.targetingCursor = this.add.image(0, 0, 'targetingCursor').setDepth(500).setVisible(false);
        gameState.turn = 0;
        gameState.redrawPrice = 1;
        gameState.endGameMenyExited = false;
        gameState.playingCard = false;
        gameState.skipIntro = false;
        gameState.fightStarted = false;

        // Reset arrays
        gameState.drawPile = [];
        gameState.discardPile = [];
        gameState.currentCards = [];
        gameState.cardImages = [];
        gameState.summonedEnemies = [];
        gameState.infoBoxElements = [];
        gameState.actionTextObjects = [];
        gameState.redrawButtonObjects = [];
        gameState.healButtonTextObjects = [];
        gameState.usesTillDepletionElements = [];

        // Reset Permanent effects
        gameState.kamishimoUberAlles = 0;
        gameState.chemicalWarfare = 0;
        gameState.shogunsShellCounter = 0; 
        gameState.zaibatsuMax = 0;
        gameState.steelToeCount = 0;
        gameState.strengthBushido = 0
        gameState.lustForLifeCost = 1;
        gameState.kirisuteGomen = false; 
        gameState.toxicFrets = false;
        gameState.ashenEncore = false;
        gameState.edoEruption = false;
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

        // Update lists of gameobjects if appropriate
        if (gameState.extraCards.length) {
            gameState.bonusCards.push(gameState.extraCards.pop());
        };
        if (gameState.taunts2.length && sceneKey !== 'Level1Fight1') {
            gameState.taunts.push(gameState.taunts2.pop());
        };
        if (!gameState.taunts) {
            gameState.taunts = gameState.extraTaunts 
        }
        if (gameState.permanentSlots) {
            gameState.permanentSlots.forEach(slot =>{
                slot.available = true;
            });
        }

        if (sceneKey.charAt(sceneKey.length - 1) === '1') {
            gameState.player.health = gameState.player.healthMax;
        }
    }

    resetPlayer(scale, x=360, y=350) {
        const player = gameState.player;

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
        player.manaMax = 3;
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

        player.name = gameState.playerName ? gameState.playerName : "Punk Rock Samurai";
    };

    saveGameState(currentScene) {
        try {
            const saveData = {

                player: {
                    healthMax: gameState.player.healthMax,
                    health: gameState.player.health,
                    manaMax: gameState.player.manaMax,
                    gold: gameState.player.gold,
                    name: gameState.player.name,
                    playerNamename: gameState.player.playerName,
                    strengthBase: gameState.player.strengthBase,
                    armorBase: gameState.player.armorBase,
                    manaBase: gameState.player.manaBase
                },

                difficulty: gameState.difficulty,
                playerName: gameState.playerName,
                version: gameState.version,
                score: gameState.score,
                savedScene: currentScene,
                loadedGame: true,

                deck: gameState.deck,
                bonusCards: gameState.bonusCards,
                extraCards: gameState.extraCards,
                latestDraw: gameState.latestDraw,

                permanents: gameState.permanents,
                steelToeCards: gameState.steelToeCards,
                zaibatsuCards: gameState.zaibatsuCards,
                bouncingSolesCards: gameState.bouncingSolesCards,
                lustForLifeCost: gameState.lustForLifeCost,
                activeChemicalWarfares: gameState.activeChemicalWarfares,
                punksNotDeadCard: gameState.punksNotDeadCard,

                permanentSlots: gameState.permanentSlots,
                bonusPermanentSlots: gameState.bonusPermanentSlots,
                
                lustForLifeCounter: gameState.lustForLifeCounter,
                enduringSpiritCounter: gameState.enduringSpiritCounter,      
                
                taunts: gameState.taunts,
                taunts2: gameState.taunts2,
                ratTaunts: gameState.ratTaunts,
                extraTaunts: gameState.extraTaunts,
                
            };

            const serializedState = JSON.stringify(saveData);
            localStorage.setItem('gameState', serializedState);
            console.log('Game state saved successfully.');
        } catch (e) {
            console.error('Failed to save the game state.', e);
        }
    }

    // Create grid for cards
    defineCardSlots() {
        const x = 480; // 375
        const y = 870;
        const spacing = 115;
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
    }

    definePermanentSlots() {
        const permanentX = 75;
        const permanentY = 75;
        const permanentSpacing = 95;

        gameState.permanentSlots = [
            { available: true, x: permanentX + 0 * permanentSpacing, y: permanentY, index: 0 },
            { available: true, x: permanentX + 1 * permanentSpacing, y: permanentY, index: 1 },
            { available: true, x: permanentX + 2 * permanentSpacing, y: permanentY, index: 2 },
            { available: true, x: permanentX + 3 * permanentSpacing, y: permanentY, index: 3 },
            { available: true, x: permanentX + 4 * permanentSpacing, y: permanentY, index: 4 },
        ];
    }

    // Display the amount of gold the player has
    addGoldCounter() {
        const goldCoin = this.add.image(1570, 75, 'goldCoin').setScale(.12).setDepth(220).setOrigin(.5).setInteractive();
        gameState.goldCounter = this.add.text(1570, 76, gameState.player.gold, { fontSize: '70px', fill: '#000000'}).setDepth(221).setOrigin(.5);
        let currentInput = "";

        goldCoin.on('pointerover', () => {
            gameState.goldCard = this.add.image(825, 450, 'goldCard').setScale(0.83).setDepth(220);
            
            this.input.keyboard.on('keydown', function (event) {
                currentInput += event.key; // appends the latest key pressed to currentInput

                // Cheat code for testing purpooses -> get 99 Gold.
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
        character.sprite.on('pointerover', () => {
            const isDescribable = !gameConfig.targetingCursor.visible && character.alive && character.activeStatsDisplay;
            if (!isDescribable) return;

            const armorText = character.armor < 0 ? 'more' : 'less';
            const strengthText = character.strength < 0 ? 'less' : 'more';
            
            const fullText = `${character.name}\n\n${character.armor} armor: Take ${Math.round(Math.abs((character.armor / 20) * 100) )} %\n` + 
            `${armorText} physical damage\n\nMax armor: Take 75 %\nless physical damage \n\n${character.strength} Strength: Deal ` + 
            `${Math.abs(character.strength) * 10} %\n${strengthText} physical damage\n\nMax strength: Deal 150 %\nmore physical ` +
            `damage\n\nPoison: ${character.poison}\nPoison change per turn: ${character.poison > 0 ? -1 : 0}`;
                
            const textCoordinates = { x: character.sprite.x - character.width / 2 - 100, y: 490, z: 30 };
            const textConfig = { fontSize: '18px', fill: '#000000' };
            const backgroundAlpha = 0.9
            character.descriptionText = new TextBox(this, fullText, textCoordinates, textConfig, backgroundAlpha);

        })

        character.sprite.on('pointerout', function() {
            // The conditional is needed incase the player points the cursor over a sprite before describeCharacter() is called
            if (character.descriptionText) character.descriptionText.destroy();
        });
    };

    addStanceBar(character, textColor) {
        character.stancePoints = 0;

        let screenCenterX = this.cameras.main.width / 2;
        let barWidth = 600;
        gameState.stanceBarHeight = 30;
        gameState.stanceBarMargin = 90;
        gameState.stanceBarStartX = screenCenterX - barWidth / 2;

        gameState.stanceBarBackground = this.add.graphics();
        gameState.stanceBarBackground.lineStyle(3, 0x000000, 1);
        gameState.stanceBarBackground.strokeRect(gameState.stanceBarStartX, gameState.stanceBarMargin, barWidth, gameState.stanceBarHeight).setDepth(20);

        for(let i = 1; i < 6; i++) { // draw internal lines
            gameState.stanceBarBackground.moveTo(gameState.stanceBarStartX + i *100, gameState.stanceBarMargin);
            gameState.stanceBarBackground.lineTo(gameState.stanceBarStartX + i * 100, gameState.stanceBarMargin + 30);
            gameState.stanceBarBackground.strokePath();
        }

        gameState.stanceBar = this.add.graphics();
        gameState.stanceBar.fillStyle(0x00ff00, 1);
        
        let stanceTextConfig = { fontSize: '40px', fill: textColor, fontWeight: 'bold' }; 
        gameState.stanceText = this.add.text(825, gameState.stanceBarMargin - 45, `Stance: ${gameState.player.stance}`, stanceTextConfig).setOrigin(0.5).setInteractive();      
        
        gameState.stanceText.on('pointerover', () => {
            console.log(`Stance: ${gameState.player.stance}`)

            const stanceText = `Stance represents the balance between\nDiscipline and Freedom.\n\n` +
                `Positive Discipline during your turn:\n+3 Strength\n\n` +
                `Positive Discipline at the end of your turn:\n+3 Armor\n\nMax Discipline at the end of your turn:\n` +
                `-1 card next turn\n\nPositive Freedom during your turn:\n+1 mana\n\nPositive Freedom at the end of your turn:\n` + 
                `50% chance of +1 card next turn\n50% chance of +1 mana next turn\n\nMax Freedom at the end of your turn:\n-2 Armor`;
            
            const stanceTextConfig = { fontSize: '20px', fill: '#000000' };
            gameState.stanceDescriptionText = this.add.text(825, gameState.stanceBarBackground.y + 105, stanceText, stanceTextConfig).setDepth(25).setOrigin(0.5, 0);
        
            const bounds = gameState.stanceDescriptionText.getBounds();
            const backgroundWidth = bounds.width + 15; // 7.5px padding on each side
            const backgroundHeight = bounds.height + 15; // 7.5px padding on each side
            const backgroundX = bounds.x - 7.5; // 7.5px padding on the left
            const backgroundY = bounds.y - 7.5; // 7.5px padding on the top

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

    // Tweens Animations for cards and permanents
    cardTweens(target, scale, duration) {
        this.tweens.add({
            targets: target,
            scaleX: scale,
            scaleY: scale,
            duration: duration,
            ease: 'Cubic'
        }, this);
    }

    animatePermanent(permanentKey) {
        gameState.permanents.forEach(p => {
            if (p.card.key === permanentKey && !p.card.isPermanentAnimated) {  
                this.tweens.add({
                    targets: p.card.tokenSprite,
                    scaleY: p.card.tokenSprite.scaleX * 1.125,
                    scaleX: p.card.tokenSprite.scaleY * 1.125,
                    duration: 120,
                    ease: 'Cubic',
                    yoyo: true,
                    onStart: () => p.card.isPermanentAnimated = true,
                    onComplete: () => p.card.isPermanentAnimated = false
                }, this);
            }
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
            gameState.drawPileImage,
            gameState.discardPileImage,
            gameState.drawPileText,
            gameState.discardPileText,
            gameState.stanceBar,
            gameState.stanceText,
            gameState.stanceBarBackground,
            gameState.endOfTurnButton,
            gameState.redrawButton,
            gameState.healButton,
            gameState.actionText
        ];
        
        gameObjectsToDestroy.forEach(object => {
            if (object) object.destroy();
        });
    };
    
    shuffleDeck(deck) {
        for(let i = deck.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    };

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

    addTokensToDeck() {
        // Remove any remant of any active chemical warfare instants
        gameState.permanents.forEach(p => {
            console.log(p.card.key)
            if (p.card.key === 'ChemicalWarfare') {
                if (p.tokenSlot) p.tokenSlot.available = true;
                if (p.tokenSprite) p.tokenSprite.destroy();
                if (p.permanentCardSprite) p.card.permanentCardSprite.destroy();
                gameState.permanents = gameState.permanents.filter(p => p.tokenSprite !== tokenSprite);
                gameState.chemicalWarfare = 0;
            }
        })

        // If any active decks contain a token card, add a new instance of this card to gameState.deck
        const activeCards = [...gameState.drawPile, ...gameState.discardPile, ...gameState.currentCards];
        activeCards.forEach(activeCard => {
            // Check if deckCard.key is in gameConfig.tokenCardNames and gameState.deck
            const tokenCardProperties = gameConfig.tokenCardNames.find(tokenCard => tokenCard.key === activeCard.key);
            const isInDeck = gameState.deck.some(deckInstance => deckInstance.key === activeCard.key);
    
            // If the key is found in gameConfig.TokenCardNames but not gameState.deck, add a new instant to gameState.deck
            if (tokenCardProperties && !isInDeck) {
                let newCard = new Card(tokenCardProperties);
                gameState.deck.push(newCard);
            }
        })
    }

    // Restore active non-token permanents from the previous level.
    // If there are no remaining availabel permanent slots, remove the permanent from the array
    // This is to account for cases in which the number of slots are reduced.
    restorePermanents(addPermanent) {
        gameState.permanentSlots.forEach(slot => slot.available = true);

        gameState.permanents.forEach(permanent => {
            if (gameState.permanentSlots.some(slot => slot.available)) {
                const card = permanent.card;

                if (!gameConfig.tokenCardNames.some(item => item.key === card.key)) {
                    console.log(`Recreated permanent: ${card.key}\nfor slot ${card.slot.index}`);
                    addPermanent(card);
                }

            } else {
                gameState.permanents = gameState.permanents.filter(p => p != permanent);
            }
        })
    }

    // Remove slots that were only avaiable for the completed level, and add them back into bonusPermanentSlots
    updatePermanentSlots() {
        const slots = gameState.permanentSlots;
        let numberOfSlotsToRemove = slots.filter(slot => slot.singleFight).length;
        slots.forEach(slot => slot.singleFight = false);

        // Move the last slot in permanentSlots to the start of bonusPermanentSlots
        while (numberOfSlotsToRemove > 0) {
            const removedSlot = slots.pop();
            removedSlot.available = true;
            gameState.bonusPermanentSlots.unshift(removedSlot);
            numberOfSlotsToRemove--;
        }
    }

    addHealButton(scene, activateHealButton) {
        const x = 900;
        const y = 130;
        const textContent = ` Heal 7 HP\nCost: ${gameState.lustForLifeCost} gold`;

        gameState.endOfTurnButton = new Button(scene, 'Heal', activateHealButton, x, y, 8);
        gameState.endOfTurnButton.setPointerText(textContent).disable();
        gameState.buttons.push(gameState.endOfTurnButton);
    }

    // Helper function to create a delay using a Promise
    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    removeCardFromDeck(deckKey, cardKey) {
        gameState[deckKey] = gameState[deckKey].filter(c => c.key !== cardKey);
    }

    // Insert a space before each uppercase letter and split into words
    // Capitalize the first letter of each word
    camelCaseToTitle(camelCaseStr) {
        let words = camelCaseStr.replace(/([A-Z])/g, ' $1').trim().split(' ');
        let title = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        return title;
    }

    adjustForDifficulty(a, b, c) {
        if (gameState.difficulty === 'Easy') return a;
        if (gameState.difficulty === 'Medium') return b;
        if (gameState.difficulty === 'HARDCORE') return c;
    }
    

} // End of scene
