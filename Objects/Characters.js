/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

"use strict";

class Character {
    constructor(name, healthMax, strengthBase, armorBase) {
        this.name = name;
        this.sprite = null;
        this.alive = true;
        this.actions = [];
        this.health = healthMax;
        this.healthMax = healthMax;
        this.strengthBase = strengthBase;
        this.strengthTurn = 0;
        this.strengthMax = 15;
        this.strength = Math.min(this.strengthMax, this.strengthBase + this.strengthTurn);
        this.armorBase = armorBase;
        this.armorTurn = 0;
        this.armorMax = 15;
        this.armor = Math.min(this.armorMax, this.armorBase + this.armorTurn);
        this.poison = 0;
        this.attackTweenStarted = false;
        this.scene = null;
        this.activeStatsDisplay = false
    }
    
    // Method for binding the instance to the current scene
    setScene(scene) {
        this.scene = scene;
        return this;
    }

    // Medhod for setting attributes based on sprite coordinates
    setSpriteAttributes() {
        if (!this.sprite) return;
        this.height = this.sprite.displayHeight;
        this.width = this.sprite.displayWidth;
        this.x = this.sprite.x;
        this.y = this.sprite.y;
        return this;
    }

    // Methods for activating and disabling stats displays
    activateStatsDisplay() {
        this.activeStatsDisplay = true;
        this.sprite.setInteractive();
        return;
    }
    disableStatsDisplay() {
        this.activeStatsDisplay = false;
        this.sprite.removeInteractive();
        return;
    }

    // Method for creating healthbars
    addHealthBar() {
        const textConfig = { fontSize: '16px', fill: '#000000' };

        // Account for the sword of the player sprite -> move the bar leftwards
        const x = this.x - (this.name === gameState.playerName ? 45 : 0)
        const y = this.y - this.height / 2 - 45;

        // Draw the background, frame and bar
        this.healthBarBackground = this.scene.add.graphics();
        this.healthBarBackground.fillStyle(0xFFFFFF, 0.5);
        this.healthBarBackground.fillRect(x - 60, y, 150, 15);
        this.healthBarBackground.setDepth(12);

        this.healthBarFrame = this.scene.add.graphics();
        this.healthBarFrame.lineStyle(3, 0x000000, 1);
        this.healthBarFrame.strokeRect(x - 60, y, 150, 15);
        this.healthBarFrame.setDepth(13);

        this.healthBar = this.scene.add.graphics();
        this.healthBar.fillStyle(this.healthBarColor, 1);
        this.healthBar.fillRect(x - 60, y, 150 * (this.health / this.healthMax), 15);
        this.healthBar.setDepth(14);

        // Add text to show health as a fraction of max health.
        // For health >= 100, the text should be shiftet slightly more leftwards
        const textDisplacementX = this.health >= 100 ? - 18 : - 30;
        this.healthBarText = this.scene.add.text(x + textDisplacementX, y + 8, `${this.health}/${this.healthMax}`, textConfig);
        this.healthBarText.setOrigin(0.5).setDepth(15);
        return this;
    }

    // Method for creating manabars. 
    // Keep this and addHealthBar as sepereate methods for the sake of readability
    addManaBar() {
        if (!this.mana) return this;
        const textConfig = { fontSize: '16px', fill: '#000000' };

        // Account for the sword -> move the bar leftwards for the player
        const height = this.height;
        const x = this.x - 105;
        const y = this.y - this.height / 2 - 70;
    
        this.manaBarBackground = this.scene.add.graphics();
        this.manaBarBackground.fillStyle(0xFFFFFF, 0.5);
        this.manaBarBackground.fillRect(x, y, 150, 15);
    
        this.manaBarFrame = this.scene.add.graphics();
        this.manaBarFrame.lineStyle(3, 0x000000, 1);
        this.manaBarFrame.strokeRect(x, y, 150, 15);
    
        this.manaBar = this.scene.add.graphics();
        this.manaBar.fillStyle(0x0000ff, 1);
        this.manaBar.fillRect(x, y, 150 * (this.mana / this.manaMax), 15);
    
        const textContent = `${this.mana}/${this.manaMax}`;
        this.manaBarText = this.scene.add.text(x + 20, y + 8, textContent, textConfig).setOrigin(0.5);
        return this;
    }

    // Method for adding a stats display under each character.
    addStatsDisplay(y = 420) {
        const textConfig = { fontSize: '16px', fill: '#FFFFFF' };
        const x = this.x;
    
        this.strengthAndArmorImage = this.scene.add.image(x - 30, y, 'strengthAndArmor').setScale(0.6).setInteractive().setDepth(20);
        this.armorText = this.scene.add.text(x + 30, y + 5, `${this.armor}/${this.armorMax}`, textConfig).setDepth(25);
        this.strengthText = this.scene.add.text(x - 60, y + 5, `${this.strength}/${this.strengthMax}`, textConfig).setDepth(25);
        return this;
    }

    // Method for updating healthbars
    updateHealthBar() {
        this.healthBar.clear();
        this.health = Phaser.Math.Clamp(this.health, 0, this.healthMax);
        let x = this.x - (this.name === gameState.player.name ? 105 : 60);
        const y = this.y - this.height / 2 - 45;
        const barlength = 150 * (this.health / this.healthMax);
        
        // Text is red for player health < 10 and player, otherwise Black
        const textColor = (this === gameState.player && this.health < 10) ? '#ff0000' : '#000000';
        // x-coordinate of text as a function of character and current health
        const healthDisplacement = this.health >= 100 ? 18 : this.health >= 10 ? 27 : 30;
        const textCoordinateX = this.x - (this.name === gameState.player.name ? 45 : 0) - healthDisplacement;

        // Green bar for player, red bar for enermies.
        this.healthBar.fillStyle(this.healthBarColor, 1);
        this.healthBar.fillRect(x, y, barlength, 15);
        this.healthBarText.setText(`${this.health}/${this.healthMax}`);
        this.healthBarText.x = textCoordinateX;
        this.healthBarText.setColor(textColor);
        return this;
    }

    // Methods for healing, buffing and suffering Attack Effects from cards
    heal(hp, poisonReduction = 0 ) {
        this.health = Math.min(this.healthMax, this.health + hp);
        this.poison = Math.max(0, this.poison - poisonReduction);
        this.updateHealthBar();
        return this;
    }

    takeDamage(hp) {
        if (!hp) return this;

        this.health -= hp;
        this.updateHealthBar();
        return this;
    }

    sufferAttackEffect(cardEffects) {
        this.strengthBase -= cardEffects.reduceTargetStrengthPlayed;
        this.armorBase -= cardEffects.reduceTargetArmorPlayed;
        this.poison += cardEffects.poisonPlayed;
        this.health -= cardEffects.damageTotal;
    }

    // If the character is poisoned, reduce health and poison count, and update poison text. Otherwise, return.
    updatePoison() {
        if (!this.poison) return this;
        
        // Decrement health
        const newHealth = Math.max(1, this.health - this.poison);
        const lostHP = this.health - newHealth;
        this.health = newHealth;
        this.poison--;
        this.updateHealthBar();

        return lostHP;
    }

    // Tweens animations for power-ups
    powerUpTweens() {
        this.scene.tweens.add({
            targets: this.sprite,
            scaleY: this.sprite.scaleY * 1.125,
            scaleX: this.sprite.scaleX * 1.125,
            duration: 120,
            ease: 'Cubic',
            yoyo: true
        });
    }

    // Tweens animations for attacks
    attackTweens(distance) {
        if (this.attackTweenStarted) return;

        this.attackTweenStarted = true;
        this.scene.tweens.add({
            targets: this.sprite,
            x: this.x + distance,
            duration: 120,
            ease: 'Cubic',
            yoyo: true,
            onComplete: () => {
                this.attackTweenStarted = false;
            }
        });
    }

    // Fade out the character sprite and destroy all assoicated graphics.
    remove(ms=500) {
        if (!this.sprite) return;

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0, 
            ease: 'Power1',
            duration: ms,
            onComplete: () => { 
                this.sprite.destroy();
            }
        }, self);
                
        // Destroy any existing graphics associated with the character.
        const characterObjects = [
            this.healthBarBackground,
            this.healthBarFrame,
            this.healthBar,
            this.healthBarText,
            this.manaBarBackground,
            this.manaBarFrame,
            this.manaBar,
            this.manaBarText,
            this.strengthAndArmorImage,
            this.strengthText,
            this.armorText,
            this.descriptionBackground,
            this.descriptionText,
            this.intentionText,
            this.intentionBackground
        ];

        characterObjects.forEach( object => {
            if(object) object.destroy();
        })
    }
}

class Enemy extends Character {
    constructor(name, healthMax, strengthBase, armorBase, debuffKey = null) {
        super(name, healthMax, strengthBase, armorBase);

        this.debuffKey = debuffKey;
        this.healthBarColor = '0xff0000';
        this.actions = [];
        this.chosenAction = {};
        this.intentionText = '';
        this.intentionBackground = null;
        this.intentionDepth = 10;
        this.lifeStealText = null;
        this.lifeStealTextBackground = null;

        Object.assign(this, FadeOutBehavior);
    }

    // Method for removing dead enemies from the game
    removeIfDead(handleTroopsOfTakamori) {
        if (this.health > 0) return false;

        this.health = 0; // Avoids negative health.
        this.alive = false;
        this.sprite.removeInteractive();
        this.turnComplete = true;

        // Remove the enemy form gameState.characters and gameState.enemies 
        const characterArrays = [gameState.characters, gameState.enemies];
        for (let arr of characterArrays) {
            const index = arr.indexOf(this);
            if (index !== -1) {
                arr.splice(index, 1);
            }
        }

        // Earn gold if the enemy was killed with troopsOfTakamor 
        if (gameState.troopsOfTakamoriCondition) {
            handleTroopsOfTakamori();
        }

        this.remove();
        return true;
    }

    // Method for updating stats and the statsdisplay
    updateStats() {
        const strengthToxicAvenger = gameState.toxicAvenger && this.poison > 0 ? -4 : 0;
        this.strength = Math.min(this.strengthMax, this.strengthBase + this.strengthTurn + strengthToxicAvenger);
        this.armor = Math.min(this.armorMax, this.armorBase + this.armorTurn);
        
        this.armorText.setText(`${this.armor}/${this.armorMax}`);
        this.strengthText.setText(`${this.strength}/${this.strengthMax}`);
        return this;
    }

    // Placeholder until enemy mana mechanic is implemented
    updateManaBar() {
        return this;
    }

    gainStrengthAndArmor(strengthPlayed, armorPlayed) {
        if (strengthPlayed) this.strengthBase = Math.min(this.strengthMax, this.strengthBase + strengthPlayed);
        if (armorPlayed) this.armorBase = Math.min(this.armorMax, this.armor + armorPlayed);
        return;  
    }

    getValueOrInvoke(property) {
        return typeof property === 'function' ? property() : property;
    }

    normalizeActions() {
        let possibleActions;
        // For predermined turns: return an arr with the predetermined action. Else: return a list of all eligable actions
        if (this.actions.some(action => action.turn === gameState.turn)) {
             return this.actions.filter(action => action.turn === gameState.turn);
        }

        possibleActions = this.actions.filter(action => action.turn === null);

        // For actions that alternate in fixed patterns (whose probability is expressed by a string)
        const assignDynamicProbablity = (action) => {
            const probabilityLookUpTable = {    
                even: () => {action.probability = (gameState.turn % 2 === 0) ? 1 : 0},
                odd: () => {action.probability = (gameState.turn % 2 !== 0) ? 1 : 0},
                
                oneInThree: () => {action.probability = (gameState.turn % 3 === 0) ? 1 : 0},
                twoInThree: () => {action.probability = (gameState.turn % 3 === 1) ? 1 : 0},
                threeInThree: () => {action.probability = (gameState.turn % 3 === 2) ? 1 : 0},

                oneInFour: () => {action.probability = (gameState.turn % 4 === 1) ? 1 : 0},
                twoInFour: () => {action.probability = (gameState.turn % 4 === 2) ? 1 : 0},
                threeInFour: () => {action.probability = (gameState.turn % 4 === 3) ? 1 : 0},
                fourInFour: () => {action.probability = (gameState.turn % 4 === 0) ? 1 : 0},
            };

            // Check if the pattern is defined by a function
            const pattern = this.getValueOrInvoke(action.pattern);
            probabilityLookUpTable[pattern]();
        }

        possibleActions.forEach(action => {
            if (typeof this.getValueOrInvoke(action.pattern) === 'string') {
                assignDynamicProbablity(action);

            // Removes previously assigned probabilities in case the conditions of the function has changed, and the pattern is now 'none'
            } else if (typeof action.pattern === 'function') {
                action.probability = 0;
            }
        })

        // Deal with cases in which the probabilities !== 1
        const totalProbability = possibleActions.reduce((sum, action) => sum + this.getValueOrInvoke(action.probability), 0);
        console.log(`enemy: ${this.name} . TotalProbability: ${totalProbability}`);

        return possibleActions;
    }
    
    // Randomly select among the possible actions, weighted by probabilities
    selectAction() {
        const actions = this.normalizeActions();
                    
        let cumProb = 0;
        for(let i = 0; i < actions.length; i++) {
            cumProb += this.getValueOrInvoke(actions[i].probability);
            actions[i].cumulativeProbability = cumProb;
        }
    
        const rand = Math.random();
        this.chosenAction = actions.find(action => rand < action.cumulativeProbability);
        return this;
    }

    displayIntention() {
        const chosenAction = this.chosenAction
        if (chosenAction.damage) chosenAction.updateDamage().setKey();
        console.log('chosenAction.key: ' + chosenAction.key)

        const textConfig = { fontSize: '18px', fill: '#000000' };
        this.intentionText = this.scene.add.text(this.x + 15, this.y - this.height / 2 - 63, `${chosenAction.key}`, textConfig);
        this.intentionText.setOrigin(0.5, 1).setDepth(this.intentionDepth + 1);
        
        const originalSpriteWidth = this.scene.textures.get('listbox1').getSourceImage().width;
        const scale = this.intentionText.width / originalSpriteWidth;
        this.intentionBackground = this.scene.add.image(this.x + 15, this.y - this.height / 2 - 50, 'listbox1').setScale(scale * 1.2, 1.50);
        this.intentionBackground.setInteractive().setOrigin(0.5, 1).setAlpha(0.85).setDepth(this.intentionDepth);
    };

    updateIntention() {
        const chosenAction = this.chosenAction
        if (chosenAction.damage) chosenAction.updateDamage().setKey();
        this.intentionText.setText(chosenAction.key);
        
        return this;
    }

    fadeOutIntentionText() {
        const duration = 200;
        this.fadeOutTarget(this.scene, this.intentionText, duration);
        this.fadeOutTarget(this.scene, this.intentionBackground, duration);
    }

    // Helper function for setting coordinates for poison text
    updatePoisonTextCoordinates(z) {
        return this.lifeStealText ? { x: 825, y: 630, z: z } : { x: 870, y: 570, z: z };
    }
}

class Player extends Character {
    constructor(name, healthMax, strengthBase, armorBase) {
        super(name, healthMax, strengthBase, armorBase);

        // New properties specific to Player
        this.stance = 'Neutral';
        this.healthBarColor = '0x00ff00'; 
        this.stancePoints = 0;
        this.gold = 0;
        this.goldMax = 99;
        this.numCards = 5;
        this.numCardsBase = 5;
        this.numCardsStance = 0;
        this.mana = 3;
        this.manaMax = 3;
        this.manaBase = 3;
        this.manaStance = 0;
        this.manaCard = 0;
        this.strengthStance = 0;
        this.strengthCard = 0;
        this.armorStance = 0;
        this.armorCard = 0;
        this.lifeStealBase = 0;
        this.lifeStealThisTurn = 0;
    }

    // Method for setting mana to 0
    depleteMana() {
        if (this.mana === 0) return this;
        
        this.mana = 0;
        this.manaMax = this.manaBase;
        this.updateManaBar();
        return this;
    }

    // Method for updating stats. Checks for bushido and kamishimoUberAlles and animates the permanents if active.
    updateStats() {
        const isPlayersTurn = gameState.playersTurn;
        const isShogunsShell = gameState.shogunsShellCounter && this.stancePoints < 0;
        const isKamishimo = gameState.kamishimoUberAlles && this.stancePoints < 0; 

        // Update strength; Account for Bushido and Kamishimo
        const strengthBushido = gameState.bushido ? Math.floor(this.armor / 3) : 0;
        const strengthKamishimo = isKamishimo ? -1 * gameState.player.stancePoints * gameState.kamishimoUberAlles : 0
        const strengthPlayed = this.strengthBase + this.strengthStance + (isPlayersTurn ? this.strengthCard : 0);
        this.strength = Math.min(this.strengthMax, strengthPlayed + strengthBushido + strengthKamishimo);

        // Update strength; Account for shogunsShell. If players turn has ended, account for stance
        const armorPlayed = this.armorBase + this.armorCard + (isPlayersTurn ? 0 : this.armorStance);
        const armorShogunsShell = isShogunsShell ? -1 * this.stancePoints * gameState.shogunsShellCounter : 0
        this.armor = Math.min(this.armorMax, armorPlayed + armorShogunsShell);
        
        // Animate Bushido and Kamishimo if active and update gameState.strengthBushido
        const isStrongerBushido = strengthBushido > gameState.strengthBushido;
        if (isStrongerBushido && isPlayersTurn) this.scene.animatePermanent('bushido');
        if (isKamishimo && isPlayersTurn) this.scene.animatePermanent('kamishimoUberAlles');
        gameState.strengthBushido = strengthBushido;

        // Update stats display
        this.armorText.setText(`${this.armor}/${this.armorMax}`);
        this.strengthText.setText(`${this.strength}/${this.strengthMax}`);
        return this;
    }

    // Method for updating manabars
    updateManaBar() {
        this.mana = Phaser.Math.Clamp(this.mana, 0, this.manaMax);
        const x = this.x - 105;
        const y = this.y - this.height / 2 - 70;
        const barlength = 150 * (this.mana / this.manaMax);

        this.manaBar.clear();
        this.manaBar.fillStyle(0x0000ff, 1); // Blue color for mana.
        this.manaBar.fillRect(x, y, barlength, 15);
        this.manaBarText.setText(`${this.mana}/${this.manaMax}`);
        return this;
    }

    // Method for reseting the strength and armor gained from cards played the previous turn 
    resetStrengthAndArmor() {
        this.armorCard = 0;
        this.strengthCard = 0;
        return this;
    }

    // Method for reseting stance and mana at the start of the players turn
    resetStanceAndMana() {
        // Account for rebelSpirit and foreverTrue
        const isForeverTrue = gameState.foreverTrue && this.stancePoints > 0;
        const manaForeverTrue = isForeverTrue ? 1 : 0;
        const isRebelSpirit = gameState.rebelSpirit && gameState.turn % 3 === 0;  
        const manaRebelSpirit = isRebelSpirit ? 1 : 0;
        
        // Animate Tokens if present
        if (isForeverTrue) this.scene.animatePermanent('foreverTrue');
        if (isRebelSpirit) this.scene.animatePermanent('rebelSpirit');

        // Reset mana and manaMax
        this.handleFreedomLastTurnEffects();
        this.manaMax =this.manaBase +this.manaStance + manaRebelSpirit + manaForeverTrue;
        this.mana = this.manaMax; 

        // Stance is reset after mana to avoid doublecounting
        this.stancePoints = gameState.foreverTrue ? this.stancePoints : 0;

        this.updateStance();
        return this;
    }

     // If stance was positive the previous round, randomly increment either manaStance or numCardsStance
    handleFreedomLastTurnEffects() {
        const points = this.stancePoints;
        // If Stance was not Freedom at the end of the previous turn, reset manaStance and numCardsStance and return
        if (points <= 0) {
            this.manaStance = 0;
            this.numCardsStance = points === -3 ? -1 : 0;
            this.numCards = this.numCardsBase + this.numCardsStance
            return;
        }

        // Otherwise its 50/50 chance of incrementing either by 1.
        const rand = Math.random();
        if (rand > 0.5) {
            this.manaStance = 1;
            this.numCardsStance = 0;
        } else {
            this.manaStance = 0;
            this.numCardsStance = 1;
        }
        this.numCards = this.numCardsBase + this.numCardsStance
    }

    // Update stance and associated stats
    updateStance() {    
        const points = this.stancePoints;
        switch (points) {
            case -3:
                this.armorStance = 3;
                this.strengthStance = 3;
                this.numCardsStance = -1;
                this.stance = 'Discipline';
                break;
            case -2:
            case -1:
                this.armorStance = 3;
                this.strengthStance = 3;
                this.numCardsStance = 0;
                this.stance = 'Discipline';
                break;
            case 0:
                this.armorStance = 0;
                this.strengthStance = 0;
                this.numCardsStance = 0;
                this.stance = 'Neutral';
                break;
            case 1:
            case 2:
                this.armorStance = 0;
                this.strengthStance = 0;
                this.stance = 'Freedom';
                break;
            case 3:
                this.armorStance = -2;
                this.strengthStance = 0;
                this.stance = 'Freedom';
                break;
            default:
                console.error(`Unexpected value for points: ${points}`);
                return this;
        };

        this.updateStanceBar(points);
        return this;
    }

    // Helper method for updating the stance bar and stance text
    updateStanceBar(points) {
        gameState.stanceBar.clear();
        // Offset leftwards if stance points are negative 
        const startXOffset = points < 0 ? points * 100 : 0;
        
        // Update stance bar and stance text
        gameState.stanceBar.fillRect(
            gameState.stanceBarStartX + 300 + startXOffset, 
            gameState.stanceBarMargin, 
            Math.abs(points) * 100, 
            gameState.stanceBarHeight
        );

        // Update stance text with updated stance
        gameState.stanceText.setText(`Stance: ${this.stance}`);
    }

    // Check if player is dead. If so, activate PunksNotDead or remove the player from the game.
    removeIfDead(handlePunksNotDead) {
        if (this.health > 0) return false;
        const punksNotDeadCondition = gameState.punksNotDeadCondition;

        this.health = 0; // Avoids negative health.

        if (punksNotDeadCondition) {
            this.resurrected = true;
            handlePunksNotDead();
            return false;
        
        } else {
            this.alive = false;
            this.sprite.removeInteractive();
            this.turnComplete = true;
            this.remove();
            return true;
        }
    }

    updateState() {
        return this
            .resetStanceAndMana() // NB! Call this first!
            .resetStrengthAndArmor()
            .updateManaBar()
            .updateHealthBar()
            .updateStats()
    }

    // Part of the Character Interface
    updatePoisonTextCoordinates() {
        return { x: 810, y: 570 }
    }

    buff(key, strength, armor) {
        if (gameConfig.strengthBaseCards.includes(key)) { 
            this.strengthBase += strength;
        } else {
            this.strengthCard += strength;
        }

        this.armorCard += armor;
    }

    sufferDebuffDamage(damage) {
        this.health -= damage;
        this.updateHealthBar();
        return this
    }

    increaseHealthMax(number) {
        this.healthMax += number;
        gameConfig.powerUpSound.play({ volume: 0.15 });
        this.updateHealthBar();
        this.powerUpTweens();
        return this
    }

    incrementLifeStealCounter(cardEffects) {
        if (!cardEffects.lifeStealPlayed) return this;
        this.lifeStealCounter += cardEffects.damagePlayed * cardEffects.damageModifier * cardEffects.lifeStealPlayed;
    }

    increaseStance(points) {
        const tentativeStance = this.stancePoints + points;
        gameState.player.stancePoints = (tentativeStance < -3) ? -3 : (tentativeStance > 3) ? 3 : tentativeStance
    }

    // Increment player.stancePoints by stancePointsPlayed, capped at +/- 3 points.
    // if stance changed to freemdom, increment mana and mana max
    updateStanceAfterCard(cardEffects) {
        const stancePointsPlayed = cardEffects.stancePointsPlayed;
        const newStance = this.stancePoints + stancePointsPlayed;
        this.stancePoints = (newStance < -3) ? -3 : (newStance > 3) ? 3 : newStance;
        this.updateStance();

        // Return if stance did not change to freedom
        // Helper function for checking if stance swiched from Disicpline to Freedom.
        const didStanceChangeToFreedom = () => {
            this.freedomAfterCardPlayed = this.stance === 'Freedom' ? true : false;  
            return !this.freedomBeforeCardPlayed && this.freedomAfterCardPlayed;
        }
        if (!didStanceChangeToFreedom()) return;
    
        // Otherwise increment mana and max mana
        this.mana++;
        this.manaMax++;
        this.updateManaBar();
    }
}

class Characters extends Phaser.Scene {
    constructor() {
        super('Characters');
    }
    create() {
        // Initiaize player instance
        console.log('Characters loaded');
        gameState.player = new Player(gameState.playerName, 100, 0, 0);
        this.scene.start('Cards');
    }
}