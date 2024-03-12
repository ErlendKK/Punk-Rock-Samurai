/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

"use strict";

class Card {
  constructor(properties) {
    // Default values
    const defaults = {
      cost: 0,
      type: "",
      goldCost: 0,
      stancePoints: 0,
      damage: 0,
      fire: 0,
      poison: 0,
      heal: 0,
      poisonRemove: 0,
      strength: 0,
      armor: 0,
      reduceTargetArmor: 0,
      isActive: false,
      reduceTargetStrength: 0,
      drawCard: 0,
      oneShot: false,
      usedOneShot: false,
      token: null,
      permanent: {},
      freePermanent: false,
      reUseable: false,
      isGoldResetable: false,
      turnsToDepletion: -1,
      usesTillDepletion: -1,
      slot: {},
      angle: 0,
      sprite: null,
      isBeingPlayed: false,
      text: '',
      isPermanentAnimated: false,
      hoverOver: false
    };

    // Assign default values and then override with provided properties
    Object.assign(this, defaults, properties);
  }

  // Dynamic evaluation for properties that are functions
  getPropertyValue(property) {
    return typeof this[property] === 'function' ? this[property]() : this[property];
  }

  // Method for checking if the card is playable
  isPlayable() {
    const goldCostCondition = !this.goldCost || this.goldCost <= gameState.player.gold;
    const manaCostCondition = gameState.player.mana >= this.costPlayed;
    const tokenCondition = !gameConfig.tokenCardNames.some(item => item.key === this.key) || gameState.permanentSlots.some(slot => slot.available === true);
    const otherConditions = this.isActive && !this.isBeingPlayed && !this.usedOneShot && gameState.playersTurn;
    return goldCostCondition && manaCostCondition && tokenCondition && otherConditions;
  }
  isType(type) {
    return this.type == type;
  }
  configure(scale) {
    let z = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    this.sprite.setScale(scale);
    if (z !== null) this.sprite.setDepth(z);
    return this;
  }

  // Method for moving non-depleted cards to the discard pile
  discard() {
    this.disable();
    const isDepleted = () => this.usesTillDepletion === 0 || this.isType('debuff') && !this.reUseable;
    if (isDepleted()) return this;
    gameState.discardPile.push(this);
    gameState.discardPileText.setText(gameState.discardPile.length);
    return this;
  }

  // Methods for activating and disabling card sprites and special abilities
  activate() {
    if (!this.sprite) return this;
    this.isActive = true;
    this.isBeingPlayed = false;
    this.sprite.setInteractive();
    return this;
  }
  disable() {
    if (!this.sprite || !this.isActive) return this;
    this.isActive = false;
    this.isBeingPlayed = false;
    this.sprite.removeInteractive();
    this.hoverOver = false;
    return this;
  }
  reset() {
    if (this.usedOneShot) this.usedOneShot = false;
    if (this.isGoldResetable) this.goldCost = 0;
    if (this.isType('debuff')) {
      gameState.deck = gameState.deck.filter(c => c.key !== this.key);
    }
  }
  resetOneShot() {
    this.usedOneShot = false;
    return this;
  }

  // Method for fading out card sprite
  fadeOut(scene) {
    let duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;
    if (!this.sprite) return this;
    scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      ease: 'Power1',
      duration: duration,
      onComplete: () => {
        this.sprite.destroy();
        this.hoverOver = false;
      }
    });
    return this;
  }
  // Method for animating cards being drawn from a pile
  animateDraw(scene, tweensDelay) {
    const scale = 0.47;
    const slot = this.slot;
    scene.tweens.add({
      targets: this.sprite,
      x: slot.x,
      y: slot.y,
      scaleX: scale,
      scaleY: scale,
      angle: slot.angle,
      duration: tweensDelay,
      ease: 'Circ.easeInOut',
      onComplete: () => {
        slot.available = false;
      }
    });
  }

  // Event listeners for pointerover and pointerout
  animatePointer(scene, depth) {
    this.sprite.on('pointerover', () => {
      this.focusCardSprite(scene);
    }, scene);
    this.sprite.on('pointerout', () => {
      this.focusCardSprite(scene, depth);
    }, scene);

    // !!!!  TO DO: Finnish function   !!!!!

    // Animate the next card when the curser approaches the edge of the card to get a more smooth transition
    // scene.input.on('pointermove', (pointer) => {
    //     if (this.hoverOver) {
    //         const spriteBounds = this.sprite.getBounds();
    //         const distanceToLeftBorder = Math.abs(pointer.x - spriteBounds.x);
    //         const distanceToRightBorder = Math.abs(pointer.x - (spriteBounds.x + spriteBounds.width));

    //         const x = 10; // Threshold for triggering the border proximity event

    //         if (distanceToLeftBorder <= x) {
    //             console.log('Cursor is within', x, 'pixels of its left border');
    //             const prevCard = gameState.currentCards.find(card => card.slot.index === this.slot.index - 1)
    //             if (!prevCard) return;

    //             prevCard.focusCardSprite(scene);
    //             this.deFocusCardSprite(scene);
    //         }

    //         if (distanceToRightBorder <= x) {
    //             console.log('Cursor is within', x, 'pixels of its right border');
    //             const nextCard = gameState.currentCards.find(card => card.slot.index === this.slot.index + 1)
    //             if (!nextCard) return;

    //             nextCard.focusCardSprite(scene);
    //             this.deFocusCardSprite(scene);
    //         }
    //     }
    // });
  }
  focusCardSprite(scene) {
    this.hoverOver = true;
    gameConfig.cardsDealtSound.play({
      volume: 0.6,
      seek: 0.08
    });
    scene.tweens.add({
      targets: this.sprite,
      y: 740,
      angle: 0,
      scaleX: 0.60,
      scaleY: 0.60,
      duration: 300,
      ease: 'Cubic'
    });
    this.sprite.setDepth(100);
  }
  deFocusCardSprite(scene, depth) {
    this.hoverOver = false;
    if (this.isBeingPlayed) return;
    scene.tweens.add({
      targets: this.sprite,
      y: this.startHeight,
      angle: this.slot.angle,
      scaleX: 0.47,
      // 0.35
      scaleY: 0.47,
      duration: 300,
      ease: 'Cubic'
    });
    this.sprite.setDepth(depth);
  }

  // Method for animating resizes
  resize(scene, scale, duration) {
    if (!this.isActive) return;
    gameConfig.cardsDealtSound.play({
      volume: 0.6,
      seek: 0.08
    });
    scene.tweens.add({
      targets: this.sprite,
      scaleX: scale,
      scaleY: scale,
      duration: duration,
      ease: 'Cubic'
    });
  }

  // Method for moving card sprite to the center of the screen
  center(scene) {
    scene.tweens.add({
      targets: this.sprite,
      x: scene.cameras.main.centerX,
      y: scene.cameras.main.centerY + 100,
      scaleX: 0.85,
      scaleY: 0.85,
      duration: 1200,
      ease: 'Power2'
    });
    return this;
  }
}
class Cards extends Phaser.Scene {
  constructor() {
    super('Cards');
  }
  create() {
    const startingDeckDefinitions = [{
      key: 'knuckleFist',
      type: 'targetSelected',
      cost: 1,
      stancePoints: 1,
      damage: 7,
      poison: () => gameState.toxicFrets ? 1 : 0
    }, {
      key: 'knuckleFist',
      type: 'targetSelected',
      cost: 1,
      stancePoints: 1,
      damage: 7,
      poison: () => gameState.toxicFrets ? 1 : 0
    }, {
      key: 'knuckleFist',
      type: 'targetSelected',
      cost: 1,
      stancePoints: 1,
      damage: 7,
      poison: () => gameState.toxicFrets ? 1 : 0
    }, {
      key: 'knuckleFist',
      type: 'targetSelected',
      cost: 1,
      stancePoints: 1,
      damage: 7,
      poison: () => gameState.toxicFrets ? 1 : 0
    }, {
      key: 'kabutu',
      type: () => gameState.edoEruption && gameState.player.stancePoints > 0 ? 'targetAll' : 'buff',
      cost: 1,
      stancePoints: -1,
      armor: 5
    }, {
      key: 'kabutu',
      type: () => gameState.edoEruption && gameState.player.stancePoints > 0 ? 'targetAll' : 'buff',
      cost: 1,
      stancePoints: -1,
      armor: 5
    }, {
      key: 'kabutu',
      type: () => gameState.edoEruption && gameState.player.stancePoints > 0 ? 'targetAll' : 'buff',
      cost: 1,
      stancePoints: -1,
      armor: 5
    }, {
      key: 'tantoBlade',
      type: 'targetSelected',
      cost: 2,
      damage: () => gameState.player.stancePoints < 0 ? 12 - 2 * gameState.player.stancePoints : 12
    }, {
      key: 'combatBoots',
      type: 'targetAll',
      cost: 2,
      damage: 5,
      reduceTargetArmor: () => gameState.player.stancePoints > 0 ? 1 + gameState.player.stancePoints : 1
    }, {
      key: 'discontent',
      type: 'buff',
      cost: 1,
      stancePoints: () => gameState.player.stancePoints < 0 ? 2 : gameState.player.stancePoints > 0 ? -2 : 0
    }];
    const bonusCardDefinitions = [
    // bonuscards: Permanents
    {
      key: 'rebelSpirit',
      type: 'permanent',
      cost: 1,
      token: 'rebelSpiritToken'
    }, {
      key: 'foreverTrue',
      type: 'permanent',
      cost: 1,
      token: 'foreverTrueToken'
    }, {
      key: 'toxicFrets',
      type: 'permanent',
      cost: 1,
      token: 'toxicFretsToken'
    }, {
      key: 'ashenEncore',
      type: 'permanent',
      cost: 1,
      token: 'ashenEncoreToken'
    }, {
      key: 'punksNotDead',
      type: 'permanent',
      cost: 1,
      token: 'punksNotDeadToken'
    }, {
      key: 'toxicAvenger',
      type: 'permanent',
      cost: 1,
      token: 'toxicAvengerToken'
    }, {
      key: 'bushido',
      type: 'permanent',
      cost: 1,
      token: 'bushidoToken'
    }, {
      key: 'bouncingSoles',
      type: 'permanent',
      cost: 3,
      goldCost: 3,
      token: 'bouncingSolesToken'
    }, {
      key: 'shogunsShell',
      type: 'permanent',
      cost: 1,
      token: 'shogunsShellToken'
    }, {
      key: 'steelToe',
      type: 'permanent',
      cost: 1,
      token: 'steelToeToken'
    }, {
      key: 'edoEruption',
      type: 'permanent',
      cost: 1,
      token: 'edoEruptionToken'
    },
    // Token Cards
    {
      key: 'kamishimoUberAlles',
      type: 'permanent',
      cost: 1,
      token: 'kamishimoUberAllesToken'
    }, {
      key: 'hollidayInKamakura',
      type: 'permanent',
      cost: 0,
      token: 'hollidayInKamakuraToken',
      specialDepletion: true
    }, {
      key: 'chemicalWarfare',
      type: 'permanent',
      cost: 2,
      turnsToDepletion: 3,
      token: 'chemicalWarfareToken'
    }, {
      key: 'zaibatsuU',
      type: 'permanent',
      cost: 1,
      token: 'zaibatsuUndergroundToken'
    }, {
      key: 'laidoSoho',
      type: 'permanent',
      cost: 1,
      token: 'laidoSohoToken'
    }, {
      key: 'stageInvasion',
      type: 'permanent',
      cost: 2,
      token: 'stageInvasionToken'
    },
    // bonuscards: Buffs
    {
      key: 'studdedLeather',
      type: 'buff',
      cost: 1,
      stancePoints: 2,
      armor: 5
    }, {
      key: 'rocknRonin',
      type: 'buff',
      cost: 0,
      strength: () => gameState.player.strength > 0 ? gameState.player.strength : 0
    }, {
      key: 'rawEnergy',
      type: 'buff',
      cost: () => gameState.player.stancePoints > 0 ? -2 : -1
    }, {
      key: 'powerChord',
      type: 'buff',
      cost: 1,
      stancePoints: () => gameState.player.stancePoints <= 0 ? 1 : 0,
      drawCard: () => gameState.player.stancePoints > 0 ? 3 : 0
    }, {
      key: 'crowdSurfer',
      type: 'buff',
      cost: 1,
      heal: () => gameState.player.stancePoints < 0 ? -2 * gameState.player.stancePoints : 0,
      drawCard: () => gameState.player.stancePoints > 0 ? gameState.player.stancePoints : 0
    }, {
      key: 'rocknRejuvinate',
      type: 'buff',
      cost: 3,
      heal: 10,
      poisonRemove: () => gameState.player.stancePoints > 0 ? 3 : 0,
      armor: () => gameState.player.stancePoints < 0 ? 3 : 0
    }, {
      key: 'detox',
      type: 'buff',
      cost: 2,
      heal: 4,
      poisonRemove: 4
    }, {
      key: 'dBeat',
      type: 'buff',
      cost: 2
    }, {
      key: 'shogunShred',
      type: 'buff',
      cost: 0,
      stancePoints: -1,
      drawCard: () => gameState.player.stancePoints > 0 ? 1 : 0
    }, {
      key: 'bloodOath',
      type: 'buff',
      cost: 2,
      oneShot: true,
      text: 'Gains +1 mana this fight'
    }, {
      key: 'kabutuOverdrive',
      type: 'buff',
      cost: 1,
      stancePoints: -3,
      armor: 15,
      oneShot: true
    }, {
      key: 'nenguStyle',
      type: 'buff',
      cost: 2,
      oneShot: true,
      text: 'Gains 1 Gold'
    }, {
      key: 'zenZine',
      type: 'buff',
      cost: () => gameState.player.mana,
      oneShot: true,
      usesTillDepletion: 4
    }, {
      key: 'gutterGeisha',
      type: 'buff',
      cost: 1,
      armor: () => Math.floor((gameState.player.healthMax - gameState.player.health) * 0.1)
    }, {
      key: 'noFuture',
      type: 'buff',
      cost: 2,
      oneShot: true,
      text: 'Gains 5 Max Health'
    }, {
      key: 'coverCharge',
      type: 'buff',
      cost: 1,
      oneShot: true
    }, {
      key: 'seppuku',
      type: 'buff',
      cost: 1,
      heal: () => -Math.round(gameState.player.healthMax * 0.05),
      strength: () => gameState.player.stancePoints < 0 ? 1 - gameState.player.stancePoints : 1
    }, {
      key: 'canibalize',
      type: 'buff',
      cost: 1
    }, {
      key: 'saisenBlaster',
      type: 'buff',
      cost: 1,
      goldCost: 1,
      stancePoints: -2,
      armor: 10
    }, {
      key: 'rebelLife',
      type: 'buff',
      cost: 0,
      stancePoints: 1,
      heal: () => gameState.player.stancePoints < 0 ? 2 : 0
    }, {
      key: 'satomiSubterfuge',
      type: 'buff',
      cost: 2,
      goldCost: 0,
      isGoldResetable: true
    },
    // bonuscards: Target All
    {
      key: 'rottenResonance',
      type: 'targetAll',
      cost: 1,
      poison: 1
    }, {
      key: 'pissDrunkBastards',
      type: 'targetAll',
      cost: 2,
      stancePoints: 1
    }, {
      key: 'circlePit',
      type: 'targetAll',
      cost: () => gameState.player.mana
    }, {
      key: 'moshpitMassacre',
      type: 'targetAll',
      cost: 2,
      damage: 8
    }, {
      key: 'blackFumes',
      type: () => gameState.player.stancePoints >= 0 ? 'targetAll' : 'targetSelected',
      cost: 2,
      poison: () => gameState.player.stancePoints > 0 ? 3 : gameState.player.stancePoints < 0 ? 5 : 0
    }, {
      key: 'deadCities',
      type: 'targetSelected',
      cost: 1,
      poison: 3
    },
    // bonuscards: Target Selected
    {
      key: 'boneShredder',
      type: 'targetSelected',
      cost: 1,
      strength: 1,
      reduceTargetStrength: 1,
      drawCard: () => gameState.player.stancePoints > 0 ? 1 : 0
    }, {
      key: 'masakari',
      type: 'targetSelected',
      cost: 2,
      damage: () => gameState.player.stancePoints < 0 ? 10 * (1 - gameState.player.stancePoints * gameState.player.strength / 10) : 10
    }, {
      key: 'pyromania',
      type: 'targetSelected',
      cost: 2,
      fire: 15
    }, {
      key: 'roninsRot',
      type: 'targetSelected',
      cost: 1,
      drawCard: () => gameState.player.stancePoints > 0 ? 1 : 0
    }, {
      key: 'dogsOfWar',
      type: 'targetSelected',
      cost: 1,
      stancePoints: 1,
      damage: 9
    }, {
      key: 'libertySpikes',
      type: 'targetSelected',
      cost: 1,
      damage: 5,
      armor: () => gameState.player.stancePoints < 0 ? 2 : 0,
      drawCard: () => gameState.player.stancePoints > 0 ? 1 : 0
    }, {
      key: 'bladesBlight',
      type: 'targetSelected',
      cost: 3
    }, {
      key: 'scorchedSoul',
      type: 'targetSelected',
      cost: 1,
      fire: 7
    }, {
      key: 'katana',
      type: 'targetSelected',
      cost: 3,
      damage: () => gameState.player.stancePoints < 0 ? 13 * (1 - gameState.player.stancePoints * gameState.player.strength / 10) : 13
    }, {
      key: 'risingWakizashi',
      type: 'targetSelected',
      cost: 1,
      stancePoints: -1,
      damage: 9
    }, {
      key: 'nastyNihonto',
      type: 'targetSelected',
      cost: 2,
      damage: 10,
      poison: () => gameState.player.stancePoints > 0 ? 2 * gameState.player.stancePoints : 0
    }, {
      key: 'shikoroStrike',
      type: 'targetSelected',
      cost: 1,
      damage: () => gameState.player.stancePoints < 0 ? 8 : 0,
      reduceTargetArmor: () => gameState.player.stancePoints > 0 ? 3 : 0
    }, {
      key: 'roninMerc',
      type: 'targetSelected',
      cost: 1,
      goldCost: 1,
      damage: 18
    }, {
      key: 'pyroPunk',
      type: 'targetSelected',
      cost: 1,
      fire: () => Math.round((gameState.player.healthMax - gameState.player.health) * 0.15)
    }, {
      key: 'troopsOfTakamori',
      type: 'targetSelected',
      cost: 1,
      damage: 7
    }, {
      key: 'wrathOfMoen',
      type: 'targetSelected',
      cost: 2,
      damage: 24,
      oneShot: true
    }, {
      key: 'riotRonin',
      type: 'targetSelected',
      cost: 2,
      goldCost: 0,
      isGoldResetable: true,
      text: "Target skips a turn"
    }];
    const extraCardDefinitions = [{
      key: 'enduringSpirit',
      type: 'permanent',
      cost: 1,
      token: 'enduringSpiritToken'
    }, {
      key: 'lustForLife',
      type: 'permanent',
      cost: 1,
      token: 'lustForLifeToken'
    }, {
      key: 'soulSquatter',
      type: 'permanent',
      cost: 1,
      token: 'soulSquatterToken'
    }, {
      key: 'gundanSeizai',
      type: 'permanent',
      cost: 1,
      token: 'gundanSeizaiToken'
    }, {
      key: 'rebelHeart',
      type: 'permanent',
      cost: 1,
      token: 'rebelHeartToken'
    }, {
      key: 'kirisuteGomen',
      type: 'permanent',
      cost: 1,
      token: 'kirisuteGomenToken'
    }, {
      key: 'deadTokugawas',
      type: 'permanent',
      cost: 1,
      token: 'deadTokugawasToken'
    }];

    // Special card pools to be drawn from at special occations
    const bouncingSolesCardDefinitions = [{
      key: 'bouncingSoles2',
      type: 'permanent',
      cost: 4,
      goldCost: 4,
      token: 'bouncingSolesToken'
    }, {
      key: 'bouncingSoles3',
      type: 'permanent',
      cost: 5,
      goldCost: 5,
      token: 'bouncingSolesToken'
    }, {
      key: 'bouncingSoles4',
      type: 'permanent',
      cost: 6,
      goldCost: 6,
      token: 'bouncingSolesToken'
    }];
    const steelToeCardDefinitions = [{
      key: 'steelToe2',
      type: 'permanent',
      cost: 1,
      goldCost: 1,
      token: 'steelToeToken'
    }];
    const zaibatsuCardDefinitions = [{
      key: 'chintaiShunyu',
      type: 'permanent',
      cost: 1,
      token: 'chintaiShunyuToken'
    }];
    function createCardsFromDefinitions(cardDefinitions) {
      return cardDefinitions.map(cardDef => new Card(cardDef));
    }

    // decks
    gameState.deck = createCardsFromDefinitions(startingDeckDefinitions);
    gameState.bonusCards = createCardsFromDefinitions(bonusCardDefinitions);
    gameState.extraCards = createCardsFromDefinitions(extraCardDefinitions);
    gameState.bouncingSolesCards = createCardsFromDefinitions(bouncingSolesCardDefinitions);
    gameState.steelToeCards = createCardsFromDefinitions(steelToeCardDefinitions);
    gameState.zaibatsuCards = createCardsFromDefinitions(zaibatsuCardDefinitions);

    // All card definitions
    gameConfig.cardDefinitions = [...startingDeckDefinitions, ...bonusCardDefinitions, ...extraCardDefinitions, ...bouncingSolesCardDefinitions, ...steelToeCardDefinitions, ...zaibatsuCardDefinitions];

    // All cards in the game
    gameConfig.allCards = [...gameState.deck, ...gameState.bonusCards, ...gameState.extraCards, ...gameState.bouncingSolesCards, ...gameState.steelToeCards, ...gameState.zaibatsuCards];
    console.log('Cards loaded');
    this.scene.start('TextBoxes');
  }
}