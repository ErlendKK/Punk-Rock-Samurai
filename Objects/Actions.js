/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

"use strict";

class Action {
    constructor(properties) {
        // Standard values
        const defaults = {
            enemy: null,
            turn: null,
            pattern: null,
            probability: 1,
            stealStrength: 0,
            stealArmor: 0,
            damage: 0,
            fire: 0,
            poison: 0,
            heal: 0,
            poisonRemove: 0,
            strength: 0,
            armor: 0,
            debuffCard: '',
            debuffRepeat: false,
            teamEffect: false,
            summonEnemy: null,
            skip: false
        };

        // Assign default values and then override with provided properties
        Object.assign(this, defaults, properties);

        // Update based on difficulty level and character
        this.fire = this.adjust(this.fire);
        this.poison = this.adjust(this.poison);
        this.heal = this.adjust(this.heal);
        this.poisonRemove = this.adjust(this.poisonRemove);
        this.strength = this.adjust(this.strength);
        this.armor = this.adjust(this.armor);

        // Assign this.enemy to the enemy object and update damage based on enemy.strength and player.armor.
        this.enemy = typeof this.enemy === 'number' ? gameState['enemy' + this.enemy] : this.enemy;
        this.damageBase = this.damage;
        this.updateDamage();
    }

    // Helper function for adjusting action effects in light of difficulty level
    adjust(num) {
        const difficulty = gameState.difficulty;
        const adjustment = difficulty === 'Easy' ? 0.8 : difficulty === 'Medium' ? 1 : 1.3;
        return Math.round(num * adjustment);
    }

    updateDamage() {
        if (!this.damageBase) return this;

        const damage = this.adjust(this.damageBase);
        const damageModifyer = (1 + 0.1 * this.enemy.strength) * (1 - gameState.player.armor / 20);
        this.damage = Math.round( Math.max(0, damage * damageModifyer) );
        return this;
    }

    // If text is specified, set it as key, otherwise piece together key from action effects.
    setKey(str) {
        if (str) {
            this.key = str;
            return this;
        }

        let textOutput = [];
        if (this.damage ||  this.fire) textOutput.push(`Intends to\nDeal ${this.damage + this.fire} damage`);
        if (this.poison) textOutput.push(`Intends to\nDeal ${this.poison} poison`);
        if (this.stealStrength) textOutput.push(`Intends to\nSteal ${this.stealStrength} Strength`);
        if (this.summonEnemy) textOutput.push(`Intends to\nSummon a ${this.summonEnemy.name}`);
        if (this.debuffCard) textOutput.push(`Intends to\napply a debuff`)
        this.key = textOutput.join('\n');

        return this;
    } 

    get text() {
        let textOutput = [];

        if (this.damage || this.fire) textOutput.push(`Deals ${this.damage + this.fire} Damage`);
        if (this.poison) textOutput.push(`Deals ${this.poison} Poison`);
        if (this.heal) textOutput.push(`Heals ${this.heal} HP`);
        if (this.strength) textOutput.push(`Gains ${this.strength} Strength`);
        if (this.armor) textOutput.push(`Gains ${this.armor} Armor`);
        if (this.debuffCard) textOutput.push(`Applies a debuff`);
        if (this.skip) textOutput.push('Skips a Turn');
        if (this.summon) textOutput.push(`Summons\na ${this.summonEnemy.name}`);
        if (this.stealStrength) textOutput.push(`Steals ${this.stealStrength} Strength`);
        if (this.stealArmor) textOutput.push(`Steals ${this.stealArmor} Armor`);
        if (this.teamEffect && this.heal) textOutput.push(`Heals allies ${this.heal} HP`);
        if (this.teamEffect && (this.armor || this.strength)) textOutput.push(`Buffs allies`);
    
        return textOutput.join('\n');
    }
    

}

class Actions extends Phaser.Scene {
    constructor() {
        super('Actions');
    }
    create() {
        console.log('Actions loaded');
        this.scene.start('Cards');
    }
}