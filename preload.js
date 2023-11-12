/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

let gameState = {};
gameState.version = 1.305;

let gameConfig = {};
gameConfig.levels = [
    "Level1Fight1", "Level1Fight2", "Level1Fight3",
    "Level2Fight1", "Level2Fight2", "Level2Fight3",
    "Level3Fight1", "Level3Fight2", "Level3Fight3",
    "Level4Fight1", "Level4Fight2", "Level4Fight3",
    "Endscene"
];

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
        if (!gameState.restartGame) {
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
            this.load.image('nastyNihonto', 'assets/images/cards/nastyNihonto.jpg');
            this.load.image('crowdSurfer', 'assets/images/cards/crowdSurfer.jpg');
            this.load.image('shogunShred', 'assets/images/cards/shogunShred.jpg');  
            this.load.image('rocknRejuvinate', 'assets/images/cards/rocknRejuvinate.jpg');
            this.load.image('detox', 'assets/images/cards/detox.jpg');
            this.load.image('laidoSoho', 'assets/images/cards/laidoSoho.jpg');
            this.load.image('dBeat', 'assets/images/cards/dBeat.jpg');
            this.load.image('shikoroStrike', 'assets/images/cards/shikoroStrike.jpg');
            this.load.image('rottenResonance', 'assets/images/cards/rottenResonance.jpg');
            this.load.image('troopsOfTakamori', 'assets/images/cards/troopsOfTakamori.jpg');
            this.load.image('bassSolo', 'assets/images/cards/bassSolo.jpg');
            this.load.image('zenZine', 'assets/images/cards/zenZine.jpg'); 
            this.load.image('kabutuOverdrive', 'assets/images/cards/kabutuOverdrive.jpg');
            this.load.image('nenguStyle', 'assets/images/cards/nenguStyle.jpg');
            this.load.image('canibalize', 'assets/images/cards/canibalize.jpg');
            this.load.image('bloodOath', 'assets/images/cards/bloodOath.jpg');
            this.load.image('roninMerc', 'assets/images/cards/roninMerc.jpg');
            this.load.image('pyroPunk', 'assets/images/cards/pyroPunk.jpg');
            this.load.image('pissDrunkBastards', 'assets/images/cards/pissDrunkBastards.jpg');
            this.load.image('gutterGeisha', 'assets/images/cards/gutterGeisha.jpg');
            this.load.image('noFuture', 'assets/images/cards/noFuture.jpg');
            this.load.image('coverCharge', 'assets/images/cards/coverCharge.jpg');
            this.load.image('wrathOfMoen', 'assets/images/cards/wrathOfMoen.jpg');
            this.load.image('saisenBlaster', 'assets/images/cards/saisenBlaster.jpg');
            this.load.image('riotRonin', 'assets/images/cards/riotRonin.jpg');
            
            this.load.image('soulSquatter', 'assets/images/cards/soulSquatter.jpg');
            this.load.image('soulSquatterToken', 'assets/images/cards/soulSquatterToken.png');
            this.load.image('punksNotDead', 'assets/images/cards/punksNotDead.jpg');
            this.load.image('punksNotDeadToken', 'assets/images/cards/punksNotDeadToken.png');
            this.load.image('lustForLifeToken', 'assets/images/cards/lustForLifeToken.png');
            this.load.image('lustForLife', 'assets/images/cards/lustForLife.jpg');
            this.load.image('gundanSeizaiToken', 'assets/images/cards/gundanSeizaiToken.png');
            this.load.image('gundanSeizai', 'assets/images/cards/gundanSeizai.jpg');
            this.load.image('deadTokugawasToken', 'assets/images/cards/deadTokugawasToken.png');
            this.load.image('deadTokugawas', 'assets/images/cards/deadTokugawas.jpg');
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
            this.load.image('bouncingSolesToken', 'assets/images/cards/bouncingSolesToken.png');
            this.load.image('bouncingSoles', 'assets/images/cards/bouncingSoles.jpg');
            this.load.image('bouncingSoles2', 'assets/images/cards/bouncingSoles2.jpg');
            this.load.image('enduringSpiritToken', 'assets/images/cards/enduringSpiritToken.png');
            this.load.image('enduringSpirit', 'assets/images/cards/enduringSpirit.jpg');
            this.load.image('shogunsShellToken', 'assets/images/cards/shogunsShellToken.png');
            this.load.image('shogunsShell', 'assets/images/cards/shogunsShell.jpg');
            this.load.image('chemicalWarfareToken', 'assets/images/cards/chemicalWarfareToken.png');
            this.load.image('chemicalWarfare', 'assets/images/cards/chemicalWarfare.jpg');

            

            this.load.image('bgLoadingScreen', 'assets/images/bgLoadingScreen.jpg');
            this.load.audio('titleTheme', 'assets/sounds/music/TitleTheme.mp3');
            this.load.audio('thundersound', 'assets/sounds/thundersound.mp3');

            this.load.image('shop1', 'assets/images/shop1.jpg'); 
            this.load.audio('bossTune', 'assets/sounds/music/DecisiveBattle.mp3');
            this.load.audio('attackSound', 'assets/sounds/attacksound.wav');
            this.load.audio('powerUpSound', 'assets/sounds/powerupsound.wav');
            this.load.audio('healSound', 'assets/sounds/healsound.wav');
            this.load.audio('victorySound', 'assets/sounds/victorysound.mp3');
            this.load.audio('keyboardSound', 'assets/sounds/keyboardsound.mp3');
            this.load.audio('coinSound', 'assets/sounds/coinsound.mp3');
            this.load.image('goldCard', 'assets/images/goldCard.jpg');
            this.load.image('goldCoin', 'assets/images/goldCoin.png');
        }
    };

    create() {
        self = this;
        this.input.keyboard.createCursorKeys();

        gameState.score = {
            numberOfTurns: 0,
            levelsCompleted: 0,
            damageTaken: 0,
            damageDealt: 0,
            totaleScore: 0
        };

        gameState.player = {
            healthBarColor: '0x00ff00',
            alive: true,
            stance: 'Neutral',
            stancePoints: 0,
            gold: 0,
            goldMax: 99,
            poison: 0,
            numCards: 5,
            numCardsBase: 5,
            numCardsStance: 0,
            health: 100,
            healthMax: 100,
            mana: 3,
            manaMax: 3,
            manaBase: 3,
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
            lifeStealBase: 0,
            lifeStealThisTurn: 0               
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
            {key: 'knuckleFist', type: 'targetSelected', cost: 1, stancePoints: 1,  damage: 7, fire: 0, poison: () => gameState.toxicFrets ? 1 : 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            
            {key: 'kabutu',      type: () => (gameState.edoEruption && gameState.player.stancePoints > 0) ? 'targetAll' : 'buff', cost: 1, stancePoints: -1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'kabutu',      type: () => (gameState.edoEruption && gameState.player.stancePoints > 0) ? 'targetAll' : 'buff', cost: 1, stancePoints: -1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'kabutu',      type: () => (gameState.edoEruption && gameState.player.stancePoints > 0) ? 'targetAll' : 'buff', cost: 1, stancePoints: -1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'kabutu',      type: () => (gameState.edoEruption && gameState.player.stancePoints > 0) ? 'targetAll' : 'buff', cost: 1, stancePoints: -1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            
            {key: 'combatBoots', type: 'targetAll',      cost: 2, stancePoints: 0,  damage: 5, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: () => gameState.player.stancePoints > 0 ? 1 + gameState.player.stancePoints : 1, reduceTargetStrength: 0, drawCard: 0},
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
            {key: 'punksNotDead',       type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'punksNotDeadToken'},
            {key: 'toxicAvenger',       type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'toxicAvengerToken'},
            {key: 'bushido',            type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'bushidoToken'},
            {key: 'bouncingSoles',      type: 'permanent',      cost: 3, goldCost: 3, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'bouncingSolesToken'},
            {key: 'shogunsShell',       type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'shogunsShellToken'},
            {key: 'steelToe',           type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'steelToeToken'},
            {key: 'chemicalWarfare',    type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'chemicalWarfareToken'},
            
            {key: 'studdedLeather',     type: 'buff',           cost: 1, stancePoints: 2, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'rocknRonin',         type: 'buff',           cost: 0, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: () => gameState.player.strength, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'rawEnergy',          type: 'buff',           cost: () => gameState.player.stancePoints > 0 ? -2 : -1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'powerChord',         type: 'buff',           cost: 1, stancePoints: () => gameState.player.stancePoints <= 0 ? 1 : 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: () => (gameState.player.stancePoints > 0) ? 3 : 0},
            {key: 'crowdSurfer',        type: 'buff',           cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: () => (gameState.player.stancePoints < 0) ? 2 * gameState.player.stancePoints : 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: () => (gameState.player.stancePoints > 0) ? gameState.player.stancePoints : 0},
            {key: 'rocknRejuvinate',    type: 'buff',           cost: 3, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 10, poisonRemove: () => gameState.player.stancePoints > 0 ? 3 : 0, strength: 0, armor: () => gameState.player.stancePoints < 0 ? 3 : 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'detox',              type: 'buff',           cost: 2, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 4, strength: 0, armor: 4, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'dBeat',              type: 'buff',           cost: 2, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'shogunShred',        type: 'buff',           cost: 0, stancePoints: -1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: () => (gameState.player.stancePoints > 0) ? 1 : 0},
            {key: 'bloodOath',          type: 'buff',           cost: 2, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, oneShot: true},
            {key: 'kabutuOverdrive',    type: 'buff',           cost: 1, stancePoints: -3, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 15, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, oneShot: true},
            {key: 'nenguStyle',         type: 'buff',           cost: 3, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, oneShot: true},
            {key: 'zenZine',            type: 'buff',           cost: () => gameState.player.mana, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, oneShot: true},
            {key: 'gutterGeisha',       type: 'buff',           cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: () => Math.floor((gameState.player.healthMax - gameState.player.health) * 0.1), reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'noFuture',           type: 'buff',           cost: 2, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, oneShot: true},
            {key: 'coverCharge',        type: 'buff',           cost: 2, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, oneShot: true},
            {key: 'seppuku',            type: 'buff',           cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: -5, poisonRemove: 0, strength: () => gameState.player.stancePoints < 0 ? 1 - gameState.player.stancePoints : 1, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'canibalize',         type: 'buff',           cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'saisenBlaster',      type: 'buff',           cost: 1, goldCost: 1, stancePoints: -2, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 10, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
           
            {key: 'bassSolo',           type: 'targetAll',      cost: 1, stancePoints: 0, damage: 6, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'rottenResonance',    type: 'targetAll',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 1, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'pissDrunkBastards',  type: 'targetAll',      cost: 2, stancePoints: 1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'stageInvasion',      type: 'targetAll',      cost: 2, stancePoints: 0, damage: () => 4 * (gameState.currentCards.length + 1), fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'circlePit',          type: 'targetAll',      cost: () => gameState.player.mana, stancePoints: 0, damage: 0, fire: () => gameState.costPlayed * 4, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'moshpitMassacre',    type: 'targetAll',      cost: 2, stancePoints: 0,  damage: 8, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'blackFumes',         type: () => gameState.player.stancePoints >= 0 ? 'targetAll' : 'targetSelected', cost: 2, stancePoints: 0, damage: 0, fire: 0, poison: () => gameState.player.stancePoints > 0 ? 3 : gameState.player.stancePoints < 0 ? 5 : 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            
            {key: 'deadCities',         type: 'targetSelected', cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 3, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'boneShredder',       type: 'targetSelected', cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 1, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 1, drawCard: () => (gameState.player.stancePoints > 0) ? 1 : 0},
            {key: 'masakari',           type: 'targetSelected', cost: 2, stancePoints: 0, damage: () => gameState.player.stancePoints < 0 ? 10 * (1 - gameState.player.stancePoints * gameState.player.strength / 10) : 10, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'pyromania',          type: 'targetSelected', cost: 2, stancePoints: 0, damage: 0, fire: 15, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'roninsRot',          type: 'targetSelected', cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: () => (gameState.player.stancePoints > 0) ? 1 : 0},
            {key: 'dogsOfWar',          type: 'targetSelected', cost: 1, stancePoints: 1, damage: 9, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'libertySpikes',      type: 'targetSelected', cost: 1, stancePoints: 0, damage: 5, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: () => gameState.player.stancePoints < 0 ? 2 : 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: () => (gameState.player.stancePoints > 0) ? 1 : 0},
            {key: 'bladesBlight',       type: 'targetSelected', cost: 3, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'scorchedSoul',       type: 'targetSelected', cost: 1, stancePoints: 0, damage: 0, fire: 7, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'katana',             type: 'targetSelected', cost: 3, stancePoints: 0, damage: () => gameState.player.stancePoints < 0 ? 13 * (1 - gameState.player.stancePoints * gameState.player.strength / 10) : 13, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'risingWakizashi',    type: 'targetSelected', cost: 1, stancePoints: -1, damage: 9, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'nastyNihonto',       type: 'targetSelected', cost: 2, stancePoints: 0, damage: 10, fire: 0, poison: () => gameState.player.stancePoints > 0 ? 2 * gameState.player.stancePoints : 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'shikoroStrike',      type: 'targetSelected', cost: 1, stancePoints: 0, damage: () => gameState.player.stancePoints < 0 ? 8 : 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: () => gameState.player.stancePoints > 0 ? 3 : 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'laidoSoho',          type: 'targetSelected', cost: 1, stancePoints: 0, damage: () => gameState.player.armor > 0 ? gameState.player.armor : 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},    
            {key: 'roninMerc',          type: 'targetSelected', cost: 0, goldCost: 1, stancePoints: 0,  damage: 18, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'pyroPunk',           type: 'targetSelected', cost: 1, stancePoints: 0,  damage: 0, fire: () => Math.round((gameState.player.healthMax - gameState.player.health) * 0.15), poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'troopsOfTakamori',   type: 'targetSelected', cost: 1, stancePoints: 0,  damage: 6, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
            {key: 'wrathOfMoen',        type: 'targetSelected', cost: 2, stancePoints: 0,  damage: 24, fire: 0, poison: () => gameState.toxicFrets ? 1 : 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, oneShot: true},
            {key: 'riotRonin',          type: 'targetSelected',  cost: 2, goldCost: 0, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0},
           
        ];

        gameState.extraCards = [

            {key: 'kirisuteGomen',      type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'kirisuteGomenToken'},
            {key: 'rebelHeart',         type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'rebelHeartToken'},
            {key: 'gundanSeizai',       type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'gundanSeizaiToken'},
            {key: 'lustForLife',        type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'lustForLifeToken'},
            {key: 'soulSquatter',       type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'soulSquatterToken'},
            {key: 'enduringSpirit',     type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'enduringSpiritToken'},
            {key: 'edoEruption',        type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'edoEruptionToken'},
            {key: 'deadTokugawas',      type: 'permanent',      cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, drawCard: 0, token: 'deadTokugawasToken'},
           
        ];

        gameConfig.allCards = [
            ...gameState.deck,
            ...gameState.bonusCards,
            ...gameState.extraCards,
            {key: 'bouncingSoles2', type: 'permanent', cost: 4, goldCost: 4, token: 'bouncingSolesToken'}
        ];

        gameState.minDeckSize = 8
        gameState.latestDraw = [];

        gameState.taunts = [
            {key: 1, enemy: `A punk rock samurai?\nWhat's next?\nA disco knight?`, player: `What's next, is me\nusing your bones\nas my drumsticks!`},
            {key: 3, enemy: `A Samurai punk rocker?\nIs this some kind of joke?`, player: `The only joke here\nwill be your attempt\nat survival!` },
            {key: 5, enemy: `Got lost on your way\nto a cosplay,\nSamurai boy?`, player: `The only thing lost today\nwill be your head\nfrom your shoulders!`},
            {key: 6, enemy: `You look like a kid who\nfound his granddad's armor.`, player: `And you'll look like\nyour granddad's corpse\nwhen I'm done with you!` },
            {key: 8, enemy: `Nice samurai outfit, kid!\nWhen does the\ncostume party begin?`, player: `The only party you'll\nbe attending today\nis your own funeral!` },
            {key: 9, enemy: `A Samurai punk rocker?\nHow's that midlife crisis going?`, player: `The only crisis happening\ntoday is for the janitor\nwho has to clean up\nwhat's left of you.` }, 
            {key: 12, enemy: `Samurai and punk rocker?\nSchizophrenia's a bitch, huh?`, player: `The only bitch here\nis the one whose about to\nbe begging me for mercy!` },
            {key: 13, enemy: `What's with the big sword?\nCompensating for something?`, player: `The only things small here\nare your chances of survival!` },
            {key: 14, enemy: `Nice costume, boy.\nDo you do birthdays\nand bar mitzvahs too?`, player: `Just funerals.\nYours is next\non the list.` },
        ];
         
        gameState.ratTaunts = [
            {key: 11, enemy: `Hsss..\nYou’ll make a fine\nmeal for my pups!`, player: `Tell them not to wait up.\nDaddy's not comming home tonight!` },
            {key: 11, enemy: `Hsss..\nYou come here to fight\nor to display your\nHalloween costume?`, player: `The only thing on\ndisplay today\nwill be your entrails!` },
        ]
        
        
        gameState.extraTaunts = [
            {key: 4, enemy: `You really believe\nyou're a samurai, huh?`, player: `You believe in ghosts?\nBecause you're\nabout to become one!` },
            {key: 11, enemy: `A Samurai in the\n21st century?\nAre you on drugs?`, player: `The only thing I'm\non is the path\nto your annihilation!` },
            {key: 12, enemy: `Childish music\nand childish fantasies.\nGrow up!`, player: `I'll make sure you\nnever grow old.` },
            {key: 13, enemy: `Must be hard, living\na deluded fantasy.`, player: `Not as hard as what's\ncoming for you.` },
            {key: 10, enemy: `Punk and Samurai?\nTwo failures in one!`, player: `I'll silence that laughter\nwith the sound of\nyour gurgling blood!`},
            {key: 2, enemy: `Chasing fantasies while\nthe world laughs at you?`, player: `I'll silence that laughter\nwith the sound of\nyour gurgling blood!`},
            {key: 11, enemy: `You're a relic in a world that's moved on.`, player: `You won't be moving much soon.!` },
            {key: 11, enemy: `You take this Samurai gig\nseriously, huh?`, player: `Serious as the grave\nI'm about to dig for you!` },
            {key: 11, enemy: `Is that sword real,\nor are you just cosplaying hard?`, player: `It's as real as the blood\nit will draw from your corpse!` },
            {key: 11, enemy: `Hey, Samurai punk,\nthe circus called,\nthey want their clown back`, player: `Sorry, I'm booked up\nmopping your entrails\noff the floor` },   
            // {key: 11, enemy: `Look what's dragging\nthrough my sewers...\na samurai in studded leather.?`, player: `The only thing dragging here\nwill be your dead cold body.` },
            {key: 7, enemy: `Still holding onto\npunk's corpse, I see`, player: `The only corpse here\nwill be the one\nI leave behind!` },
            {key: 10, enemy: `Your delusions of grandeur\nare quite entertaining.`, player: `The only entertainment tonight\nwill be your cries of agony!` },
        ];

        if (gameState.restartGame) self.scene.start('Mainmenu');
             
        let bgLoadingScreen = this.add.image(550,480, 'bgLoadingScreen').setScale(1.40).setInteractive();
        this.add.text(550, 170, 'Punk Rock Samurai', { fontSize: '100px', fill: '#000000', fontFamily: 'Rock Kapak' }).setOrigin(0.5);
        this.add.text(550, 500, 'Click to start', { fontSize: '45px', fill: '#ff0000', fontWeight: 'bold' }).setOrigin(0.5);
        let screenClicked = false;
        gameConfig.thunder = this.sound.add('thundersound');
        gameConfig.musicTheme = this.sound.add('titleTheme'); 

        bgLoadingScreen.on('pointerup', () => {
            if (!screenClicked) {
                screenClicked = true;
                openMainMenu();
            }
        })

        this.input.keyboard.on('keydown', () => {
            if (!screenClicked) {
                screenClicked = true;
                openMainMenu();
            }
        })

        function openMainMenu() {
            gameConfig.thunder.play( {volume: 0.9, seek: 0.25 } ); 
            self.cameras.main.shake(200, .002, false); 
            self.cameras.main.flash(100);

            self.time.delayedCall(100, () => {
                self.cameras.main.fadeOut(100);
            }, [], this);

            self.time.delayedCall(200, () => { //1000
                gameConfig.musicTheme.play( { loop: true, volume: 0.30 } );
                self.time.delayedCall(100, () => { //500
                    self.scene.start('Mainmenu');
                    console.log(`Mainmenu called`);
                })
            }, [], this);
        };


    } // End of create
} // End of scene
