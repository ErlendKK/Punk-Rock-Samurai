/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

const gameState = {};

window.addEventListener('error', function() {
    let errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'block';
});

class Preload extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    preload() {
        
        // Load font "Rock Kapak"
        WebFont.load({
            custom: { families: ['Rock Kapak'] },
            active: () => { this.fontLoaded = true }
        });
        
        // Create progress bar background
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const x = width / 2;
        const y = height / 2;
        
        const progressBox = this.add.graphics();
        const progressBar = this.add.graphics();     
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, 270, 320, 50);
       
        const loadingTextConfig = { font: '20px monospace', fill: '#ffffff' };
        const loadingText = this.add.text(x, y - 50, 'Loading...', loadingTextConfig).setOrigin(0.5, 0.5);
        const percentTextConfig = { font: '18px monospace', fill: '#ffffff' };
        const percentText = this.add.text(x, y - 5, '0%', percentTextConfig).setOrigin(0.5, 0.5);

        // Update progress bar as files are loaded
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, 280, 300 * value, 30);
        });

        // Once all assets are loaded
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });


        this.load.image('knuckleFist', 'assets/images/cards/knuckleFist.jpg');
        this.load.image('kabutu', 'assets/images/cards/kabutu.jpg');
        this.load.image('combatBoots', 'assets/images/cards/combatBoots.jpg');
        this.load.image('tantoBlade', 'assets/images/cards/tantoBlade.jpg');
        this.load.image('circlePit', 'assets/images/cards/circlePit.jpg');
        this.load.image('seppuku', 'assets/images/cards/seppuku.jpg');
        this.load.image('katana', 'assets/images/cards/katana.jpg');
        this.load.image('rocknRonin', 'assets/images/cards/rocknRonin.jpg');
        this.load.image('powerChord', 'assets/images/cards/powerChord.jpg');
        this.load.image('rawEnergy', 'assets/images/cards/rawEnergy.jpg');
        this.load.image('pyromania', 'assets/images/cards/pyromania.jpg');
        this.load.image('stageInvasion', 'assets/images/cards/stageInvasion.jpg');
        this.load.image('studdedLeather', 'assets/images/cards/studdedLeather.jpg'); 
        this.load.image('boneShredder', 'assets/images/cards/boneShredder.jpg');
        this.load.image('blackFumes', 'assets/images/cards/blackFumes.jpg');
        this.load.image('masakari', 'assets/images/cards/masakari.jpg');
        this.load.image('discontent', 'assets/images/cards/discontent.jpg');
        this.load.image('dogsOfWar', 'assets/images/cards/dogsOfWar.jpg');
        this.load.image('roninsRot', 'assets/images/cards/roninsRot.jpg');
        this.load.image('libertySpikes', 'assets/images/cards/libertySpikes.jpg');
        this.load.image('moshpitMassacre', 'assets/images/cards/moshpitMassacre.jpg');
        this.load.image('bladesBlight', 'assets/images/cards/bladesBlight.jpg');
        this.load.image('scorchedSoul', 'assets/images/cards/scorchedSoul.jpg');
        this.load.image('risingWakizashi', 'assets/images/cards/risingWakizashi.jpg');
        this.load.image('deadCities', 'assets/images/cards/deadCities.jpg');
     
        this.load.image('toxicFrets', 'assets/images/cards/toxicFrets.jpg');
        this.load.image('toxicFretsToken', 'assets/images/cards/toxicFretsToken.png');
        this.load.image('ashenEncore', 'assets/images/cards/ashenEncore.jpg');
        this.load.image('ashenEncoreToken', 'assets/images/cards/ashenEncoreToken.png');
        this.load.image('edoEruption', 'assets/images/cards/edoEruption.jpg');
        this.load.image('edoEruptionToken', 'assets/images/cards/edoEruptionToken.png');  
        this.load.image('steelToe', 'assets/images/cards/steelToe.jpg');
        this.load.image('steelToeToken', 'assets/images/cards/steelToeToken.png');
        this.load.image('foreverTrueToken', 'assets/images/cards/foreverTrueToken.png'); 
        this.load.image('foreverTrue', 'assets/images/cards/foreverTrue.jpg');
        this.load.image('rebelSpiritToken', 'assets/images/cards/rebelSpiritToken.png');
        this.load.image('rebelSpirit', 'assets/images/cards/rebelSpirit.jpg');
        this.load.image('rebelHeartToken', 'assets/images/cards/rebelHeartToken.png');
        this.load.image('rebelHeart', 'assets/images/cards/rebelHeart.jpg');
        this.load.image('bushidoToken', 'assets/images/cards/bushidoToken.png');
        this.load.image('bushido', 'assets/images/cards/bushido.jpg');
        this.load.image('toxicAvengerToken', 'assets/images/cards/toxicAvengerToken.png');
        this.load.image('toxicAvenger', 'assets/images/cards/toxicAvenger.jpg');
        this.load.image('kirisuteGomenToken', 'assets/images/cards/kirisuteGomenToken.png');
        this.load.image('kirisuteGomen', 'assets/images/cards/kirisuteGomen.jpg');
        this.load.image('hollidayInKamakuraToken', 'assets/images/cards/hollidayInKamakuraToken.png');
        this.load.image('hollidayInKamakura', 'assets/images/cards/hollidayInKamakura.jpg');
        this.load.image('kamishimoUberAllesToken', 'assets/images/cards/kamishimoUberAllesToken.png');
        this.load.image('kamishimoUberAlles', 'assets/images/cards/kamishimoUberAlles.jpg');
        
        this.load.image('player', 'assets/images/sprites/punkrock.png');
        this.load.image('deck', 'assets/images/cardback.jpg');
        this.load.image('strengthAndArmor', 'assets/images/strengthAndArmor.png');
        this.load.image('rectangularButton', 'assets/images/stoneButtonInsetReady.png');
        this.load.image('rectangularButtonHovered', 'assets/images/stoneButtonInsetHovered.png');
        this.load.image('rectangularButtonPressed', 'assets/images/stoneButtonInsetPressed.png');
        this.load.image('radioButtonRoundOn', 'assets/images/radioButtonRoundOn.png');
        this.load.image('radioButtonRoundOff', 'assets/images/radioButtonRoundOff.png');
        this.load.image('targetingCursor', 'assets/images/targetingCursor.png');
        this.load.image('targetingCursorReady', 'assets/images/targetingCursorReady.png');
        this.load.image('bgLoadingScreen', 'assets/images/bgLoadingScreen.jpg');
        this.load.image('endscene', 'assets/images/endscene.jpg');

        this.load.audio('cardsDealtSound', 'assets/sounds/cardsdealt.wav');
        this.load.audio('thundersound', 'assets/sounds/thundersound.mp3');
        this.load.audio('buttonPressedSound', 'assets/sounds/buttonpressed.wav');
        this.load.audio('attackSound', 'assets/sounds/attacksound.wav');
        this.load.audio('powerUpSound', 'assets/sounds/powerupsound.wav');
        this.load.audio('healSound', 'assets/sounds/healsound.wav');
        this.load.audio('victorySound', 'assets/sounds/victorysound.mp3');
        this.load.audio('bossTune', 'assets/sounds/music/DecisiveBattle.mp3');
        this.load.audio('titleTheme', 'assets/sounds/music/TitleTheme.mp3');
        this.load.audio('gunShotSound', 'assets/sounds/gunshot.mp3');
    };

    create() {
        self = this;

        gameState.score = {
            numberOfTurns: 0,
            levelsCompleted: 0,
            damageTaken: 0,
            damageDealt: 0,
            totaleScore: 0
        };

        gameState.player = {
            sprite: this.add.sprite(320, 350, 'player').setScale(0.38).setFlipX(true).setInteractive(), //320 / 330 / 0.41
            healthBarColor: '0x00ff00',
            alive: true,
            stance: 'Neutral', 
            poison: 0,
            stancePoints: 0,
            numCards: 5,
            numCardsBase: 5,
            numCardsStance: 0,
            health: 90,
            healthMax: 90,
            mana: 4,
            manaMax: 4,
            manaBase: 4,
            manaStance: 0,
            manaCard: 0,
            strength: 0, 
            strengthMax: 15,
            strengthBase: 0,
            strengthStance: 0,
            strengthCard: 0,
            armor: 0,
            armorMax: 15,
            armorBase: 0,
            armorStance: 0,
            armorCard: 0,               
        };

        gameState.enemy = {
            name: 'Name',
            sprite: '',
            healthBarColor: '0xff0000',
            alive: true,
            actions: [],         
            health: 40,
            healthMax: 40,
            strength: 0,
            strengthBase: 0,
            strengthTurn: 0,
            strengthMax: 15,  
            armor: 0,
            armorMax: 15,
            poison: 0
        }

        gameState.deck = [

            {key: 'knuckleFist', type: 'targetSelected', cost: 1, stancePoints: 1,  damage: 7, fire: 0, poison: () => gameState.toxicFrets ? 1 : 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'knuckleFist', type: 'targetSelected', cost: 1, stancePoints: 1,  damage: 7, fire: 0, poison: () => gameState.toxicFrets ? 1 : 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'knuckleFist', type: 'targetSelected', cost: 1, stancePoints: 1,  damage: 7, fire: 0, poison: () => gameState.toxicFrets ? 1 : 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'knuckleFist', type: 'targetSelected', cost: 1, stancePoints: 1,  damage: 7, fire: 0, poison: () => gameState.toxicFrets ? 1 : 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            
            {key: 'kabutu',      type: () => (gameState.edoEruption && gameState.player.stancePoints > 0) ? 'targetAll' : 'buff', cost: 1, stancePoints: -1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'kabutu',      type: () => (gameState.edoEruption && gameState.player.stancePoints > 0) ? 'targetAll' : 'buff', cost: 1, stancePoints: -1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'kabutu',      type: () => (gameState.edoEruption && gameState.player.stancePoints > 0) ? 'targetAll' : 'buff', cost: 1, stancePoints: -1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            
            {key: 'combatBoots', type: 'targetAll',      cost: 2, stancePoints: 0,  damage: 5, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: () => gameState.player.stancePoints > 0 ? 2 * gameState.player.stancePoints : 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'tantoBlade',  type: 'targetSelected', cost: 2, stancePoints: 0,  damage: () => gameState.player.stancePoints < 0 ? 12 - 2 * gameState.player.stancePoints : 12, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'discontent',  type: 'buff',           cost: 1, stancePoints: () => (gameState.player.stancePoints > 0) ? -2 : (gameState.player.stancePoints < 0) ? 2 : 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},

        ]; 
            
        gameState.bonusCards = [

            {key: 'kamishimoUberAlles', type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'kamishimoUberAllesToken'},
            {key: 'hollidayInKamakura', type: 'permanent',      cost: 0, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'hollidayInKamakuraToken'},
            {key: 'rebelSpirit',        type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'rebelSpiritToken'},
            {key: 'foreverTrue',        type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'foreverTrueToken'},
            {key: 'toxicFrets',         type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'toxicFretsToken'},
            {key: 'ashenEncore',        type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'ashenEncoreToken'},
            {key: 'edoEruption',        type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'edoEruptionToken'},
            
            {key: 'studdedLeather',     type: 'buff',           cost: 1, stancePoints: 2, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'rocknRonin',         type: 'buff',           cost: 0, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: () => gameState.player.strength, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'seppuku',            type: 'buff',           cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: -5, poisonRemove: 0, strength: () => gameState.player.stancePoints < 0 ? 1 - gameState.player.stancePoints : 1, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'rawEnergy',          type: 'buff',           cost: () => gameState.player.stancePoints > 0 ? -2 : -1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'powerChord',         type: 'buff',           cost: 1, stancePoints: () => gameState.player.stancePoints <= 0 ? 1 : 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: () => (gameState.player.stancePoints > 0) ? 3 : 0},
            
            {key: 'stageInvasion',      type: 'targetAll',      cost: 2, stancePoints: 0, damage: () => 2 * (gameState.currentCards.length + 1), fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'circlePit',          type: 'targetAll',      cost: () => gameState.player.mana, stancePoints: 0, damage: 0, fire: () => gameState.costPlayed * 4, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'moshpitMassacre',    type: 'targetAll',      cost: 2, stancePoints: 0,  damage: 8, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'blackFumes',         type: () => gameState.player.stancePoints >= 0 ? 'targetAll' : 'targetSelected', cost: 2, stancePoints: 0, damage: 0, fire: 0, poison: () => gameState.player.stancePoints > 0 ? 3 : gameState.player.stancePoints < 0 ? 5 : 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            
            {key: 'boneShredder',       type: 'targetSelected', cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 1, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 1, drawCard: 1},
            {key: 'masakari',           type: 'targetSelected', cost: 2, stancePoints: 0, damage: () => gameState.player.stancePoints < 0 ? 9 * (1 - gameState.player.stancePoints * gameState.player.strength / 10) : 9, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'pyromania',          type: 'targetSelected', cost: 2, stancePoints: 0, damage: 0, fire: 16, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'roninsRot',          type: 'targetSelected', cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: () => (gameState.player.stancePoints > 0) ? 1 : 0},
            {key: 'dogsOfWar',          type: 'targetSelected', cost: 1, stancePoints: 1, damage: 9, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'libertySpikes',      type: 'targetSelected', cost: 1, stancePoints: 0, damage: 5, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: () => gameState.player.stancePoints < 0 ? 2 : 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: () => (gameState.player.stancePoints > 0) ? 1 : 0},
            {key: 'bladesBlight',       type: 'targetSelected', cost: 3, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'scorchedSoul',       type: 'targetSelected', cost: 1, stancePoints: 0, damage: 0, fire: 8, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'katana',             type: 'targetSelected', cost: 3, stancePoints: 0, damage: () => gameState.player.stancePoints < 0 ? 13 * (1 - gameState.player.stancePoints * gameState.player.strength / 10) : 13, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'risingWakizashi',    type: 'targetSelected', cost: 1, stancePoints: -1, damage: 9, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'deadCities',         type: 'targetSelected', cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 3, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
           
        ];

        gameState.extraCards = [

            {key: 'kirisuteGomen',      type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'kirisuteGomenToken'},
            {key: 'rebelHeart',         type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'rebelHeartToken'},
            {key: 'bushido',            type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'bushidoToken'},
            {key: 'toxicAvenger',       type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'toxicAvengerToken'},
            {key: 'steelToe',           type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'steelToeToken'},
            
        ];
             
        let bgLoadingScreen = this.add.image(550,480, 'bgLoadingScreen').setScale(1.40).setInteractive();
        this.add.text(550, 170, 'Punk Rock Samurai', { fontSize: '100px', fill: '#000000', fontFamily: 'Rock Kapak' }).setOrigin(0.5);
        this.add.text(550, 500, 'Click to start', { fontSize: '45px', fill: '#ff0000', fontWeight: 'bold' }).setOrigin(0.5);
        let screenClicked = false;
        gameState.thunder = this.sound.add('thundersound');
        gameState.musicTheme = this.sound.add('titleTheme');

        bgLoadingScreen.on('pointerup', () => {
            if (!screenClicked) {
                screenClicked = true;
                gameState.thunder.play( {volume: 0.9, seek: 0.25 } ); 
                this.cameras.main.shake(200, .002, false); 
                this.cameras.main.flash(100);

                this.time.delayedCall(100, () => {
                    this.cameras.main.fadeOut(100);
                }, [], this);

                this.time.delayedCall(200, () => { //1000
                    gameState.musicTheme.play( { loop: true, volume: 0.30 } );
                    self.time.delayedCall(100, () => { //500
                        self.scene.start('Mainmenu');
                        console.log(`Mainmenu called`);
                    })
                }, [], this);
            };
        });

    } // End of create
} // End of scene
