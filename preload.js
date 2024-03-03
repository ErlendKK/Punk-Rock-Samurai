/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming by Erlend Kulander Kvitrud. Copyright 2023, all rights reserved.*/

"use strict";

let gameState = {};
const gameConfig = {};

gameState.version = "1.3.11";

gameConfig.levels = [
    "Level1Fight1", "Level1Fight2", "Level1Fight3",
    "Level2Fight1", "Level2Fight2", "Level2Fight3",
    "Level3Fight1", "Level3Fight2", "Level3Fight3",
    "Level4Fight1", "Level4Fight2", "Level4Fight3",
    "Endscene"
];

gameConfig.preLevelsScenes = [
    "BaseScene", "Preload", "Mainmenu", 
];
// "Buttons", 
//     "Characters", "Cards", "TextBoxes", "Actions", 

const FadeOutBehavior = {
    fadeOutTarget(scene, target, duration = 200) {
        if (!target) return;

        scene.tweens.add({
            targets: target,
            alpha: 0, 
            ease: 'Power1',
            duration: duration,
            onComplete: () => { 
                target.destroy();
            }
        }, this);
    }
};

try {
    console.log(`%cWelcome to Punk Rock Samurai v${gameState.version}`, 'color: red; font-size: 24px; font-weight: bold; background-color: lightgray');
    console.log(`%cLogging will be on during beta testing`, 'color: red; font-size: 16px; font-weight: bold; background-color: lightgray')
} catch (e) {
    console.log(`Welcome to Punk Rock Samurai v${gameState.version}`); // Fallback without styling
    console.log(`Logging will me on during beta testing`); // Fallback without styling
}

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
        progressBox.fillRect(width / 2 - 240, 405, 480, 75);
       
        const loadingTextConfig = { font: '30px monospace', fill: '#ffffff' };
        const loadingText = this.add.text(x, y - 75, 'Loading...', loadingTextConfig).setOrigin(0.5, 0.5);
        const percentTextConfig = { font: '27px monospace', fill: '#ffffff' };
        const percentText = this.add.text(x, y - 7.5, '0%', percentTextConfig).setOrigin(0.5, 0.5);

        const fileLoadingTextConfig = { font: '24px monospace', fill: '#ffffff' };
        const fileLoadingText = this.add.text(x, y + 45, '', fileLoadingTextConfig).setOrigin(0.5, 0.5);

        // Update progress bar as files are loaded
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 225, 420, 450 * value, 45);
        });

        this.load.on('fileprogress', function (file) {
            fileLoadingText.setText('Loading: ' + file.key);
        });

        // Once all assets are loaded, destroy progress bar
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            fileLoadingText.destroy();
        });

        // Preload files the first time the game runs, not on restart
        if (!gameState.restartGame) {

            // Preload cards
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
            this.load.image('rebelLife', 'assets/images/cards/rebelLife.jpg');
            this.load.image('satomiSubterfuge', 'assets/images/cards/satomiSubterfuge.jpg');
            
            // Preload permanent cards and tokens
            this.load.image('soulSquatter', 'assets/images/cards/soulSquatter.jpg');
            this.load.image('soulSquatterToken', 'assets/images/tokens/soulSquatterToken.png');
            this.load.image('punksNotDead', 'assets/images/cards/punksNotDead.jpg');
            this.load.image('punksNotDeadToken', 'assets/images/tokens/punksNotDeadToken.png');
            this.load.image('lustForLifeToken', 'assets/images/tokens/lustForLifeToken.png');
            this.load.image('lustForLife', 'assets/images/cards/lustForLife.jpg');
            this.load.image('gundanSeizaiToken', 'assets/images/tokens/gundanSeizaiToken.png');
            this.load.image('gundanSeizai', 'assets/images/cards/gundanSeizai.jpg');
            this.load.image('deadTokugawasToken', 'assets/images/tokens/deadTokugawasToken.png');
            this.load.image('deadTokugawas', 'assets/images/cards/deadTokugawas.jpg');
            this.load.image('toxicFrets', 'assets/images/cards/toxicFrets.jpg');
            this.load.image('toxicFretsToken', 'assets/images/tokens/toxicFretsToken.png');
            this.load.image('ashenEncore', 'assets/images/cards/ashenEncore.jpg');
            this.load.image('ashenEncoreToken', 'assets/images/tokens/ashenEncoreToken.png');
            this.load.image('edoEruption', 'assets/images/cards/edoEruption.jpg');
            this.load.image('edoEruptionToken', 'assets/images/tokens/edoEruptionToken.png');  
            this.load.image('steelToe', 'assets/images/cards/steelToe.jpg');
            this.load.image('steelToe2', 'assets/images/cards/steelToe2.jpg');
            this.load.image('steelToeToken', 'assets/images/tokens/steelToeToken.png');
            this.load.image('foreverTrueToken', 'assets/images/tokens/foreverTrueToken.png'); 
            this.load.image('foreverTrue', 'assets/images/cards/foreverTrue.jpg');
            this.load.image('rebelSpiritToken', 'assets/images/tokens/rebelSpiritToken.png');
            this.load.image('rebelSpirit', 'assets/images/cards/rebelSpirit.jpg');
            this.load.image('rebelHeartToken', 'assets/images/tokens/rebelHeartToken.png');
            this.load.image('rebelHeart', 'assets/images/cards/rebelHeart.jpg');
            this.load.image('bushidoToken', 'assets/images/tokens/bushidoToken.png');
            this.load.image('bushido', 'assets/images/cards/bushido.jpg');
            this.load.image('toxicAvengerToken', 'assets/images/tokens/toxicAvengerToken.png');
            this.load.image('toxicAvenger', 'assets/images/cards/toxicAvenger.jpg');
            this.load.image('kirisuteGomenToken', 'assets/images/tokens/kirisuteGomenToken.png');
            this.load.image('kirisuteGomen', 'assets/images/cards/kirisuteGomen.jpg');
            this.load.image('hollidayInKamakuraToken', 'assets/images/tokens/hollidayInKamakuraToken.png');
            this.load.image('hollidayInKamakura', 'assets/images/cards/hollidayInKamakura.jpg');
            this.load.image('kamishimoUberAllesToken', 'assets/images/tokens/kamishimoUberAllesToken.png');
            this.load.image('kamishimoUberAlles', 'assets/images/cards/kamishimoUberAlles.jpg');
            this.load.image('bouncingSolesToken', 'assets/images/tokens/bouncingSolesToken.png');
            this.load.image('bouncingSoles', 'assets/images/cards/bouncingSoles.jpg');
            this.load.image('bouncingSoles2', 'assets/images/cards/bouncingSoles2.jpg');
            this.load.image('bouncingSoles3', 'assets/images/cards/bouncingSoles3.jpg');
            this.load.image('bouncingSoles4', 'assets/images/cards/bouncingSoles4.jpg');
            this.load.image('enduringSpiritToken', 'assets/images/tokens/enduringSpiritToken.png');
            this.load.image('enduringSpirit', 'assets/images/cards/enduringSpirit.jpg');
            this.load.image('shogunsShellToken', 'assets/images/tokens/shogunsShellToken.png');
            this.load.image('shogunsShell', 'assets/images/cards/shogunsShell.jpg');
            this.load.image('chemicalWarfareToken', 'assets/images/tokens/chemicalWarfareToken.png');
            this.load.image('chemicalWarfare', 'assets/images/cards/chemicalWarfare.jpg');
            this.load.image('zaibatsuUndergroundToken', 'assets/images/tokens/zaibatsuUndergroundToken.png');
            this.load.image('zaibatsuU', 'assets/images/cards/zaibatsuUnderground.jpg');
            this.load.image('chintaiShunyuToken', 'assets/images/tokens/chintaiShunyuToken.png');
            this.load.image('chintaiShunyu', 'assets/images/cards/chintaiShunyu.jpg'); 
            this.load.image('stageInvasionToken', 'assets/images/tokens/stageInvasionToken.png');
            this.load.image('stageInvasion', 'assets/images/cards/stageInvasion.jpg'); 
            this.load.image('laidoSoho', 'assets/images/cards/laidoSoho.jpg');
            this.load.image('laidoSohoToken', 'assets/images/tokens/laidoSohoToken.png');
            
            // Preload basic background
            this.load.image('bgLoadingScreen', 'assets/images/backgrounds/bgLoadingScreen.jpg');
            this.load.image('shop1', 'assets/images/backgrounds/shop1.jpg');

            // Preload ui elements
            this.load.image('goldCard', 'assets/images/ui/goldCard.jpg');
            this.load.image('goldCoin', 'assets/images/ui/goldCoin.png');
            this.load.image('listbox1', 'assets/images/ui/listbox1.png');
            this.load.image('rectangularButton', 'assets/images/ui/stoneButtonInsetReady.png');
            this.load.image('rectangularButtonHovered', 'assets/images/ui/stoneButtonInsetHovered.png');
            this.load.image('rectangularButtonPressed', 'assets/images/ui/stoneButtonInsetPressed.png');

            // Preload sounds
            this.load.audio('titleTheme', 'assets/sounds/music/TitleTheme.mp3');
            this.load.audio('bossTune', 'assets/sounds/music/DecisiveBattle.mp3');
            this.load.audio('thundersound', 'assets/sounds/thundersound.mp3');
            this.load.audio('attackSound', 'assets/sounds/attacksound.wav');
            this.load.audio('powerUpSound', 'assets/sounds/powerupsound.wav');
            this.load.audio('healSound', 'assets/sounds/healsound.wav');
            this.load.audio('victorySound', 'assets/sounds/victorysound.mp3');
            this.load.audio('keyboardSound', 'assets/sounds/keyboardsound.mp3');
            this.load.audio('coinSound', 'assets/sounds/coinsound.mp3');
            this.load.audio('cardsDealtSound', 'assets/sounds/cardsdealt.wav');
            this.load.audio('buttonPressedSound', 'assets/sounds/buttonpressed.wav');
        }
    };

    create() {
        self = this;
        this.input.keyboard.createCursorKeys();
        gameConfig.thunder = this.sound.add('thundersound');
        gameConfig.musicTheme = this.sound.add('titleTheme');
        gameConfig.buttonPressedSound = this.sound.add('buttonPressedSound');   

        // Initiaize score as 0
        gameState.score = {
            numberOfTurns: 0,
            levelsCompleted: 0,
            damageTaken: 0,
            damageDealt: 0,
            totaleScore: 0
        };

        gameConfig.tokenCardNames = [
            { key: 'chemicalWarfare', type: 'permanent', cost: 2, turnsToDepletion: 3, token: 'chemicalWarfareToken' },
            { key: 'kamishimoUberAlles', type: 'permanent', cost: 1, token: 'kamishimoUberAllesToken' },
            { key: 'hollidayInKamakura', type: 'permanent', cost: 0, token: 'hollidayInKamakuraToken', specialDepletion: true },
            { key: 'chintaiShunyu', type: 'permanent', cost: 1, token: 'chintaiShunyuToken' },
            { key: 'stageInvasion', type: 'permanent', cost: 2, token: 'stageInvasionToken' },
            { key: 'laidoSoho', type: 'permanent', cost: 1, token: 'laidoSohoToken' }
        ];

        // List of debuff cards with description to be displayed when used.
        gameConfig.debuffCards = {
            infestation: {name: 'infestation', cost: 1},
            hellFire: {name: 'Hell Fire', cost: 1},
            rooted: {name: "Rooted", cost: 2},
            monstrosity: {name: "Monstrosity", cost: 0},
        };

        // Add all cards that increase strength for the rest of the fight
        gameConfig.strengthBaseCards = ['seppuku', 'boneShredder']; 

        // Limitations on cards and decks
        gameConfig.minDeckSize = 10;
        gameConfig.maxDeckSize = 40;
        gameConfig.maxCardExemplars = 2;

        // Initaializing lists and state.
        gameState.latestDraw = [];
        gameState.permanents = [];
        gameState.activeChemicalWarfares = []; // will hold all active instances of 'Chemical Warfare'
        gameState.lustForLifeCounter = 0;
        gameState.enduringSpiritCounter = 0;
        gameState.punksNotDeadCard = null

        // Pool of bonus permanent slots that can be added to gameState.permanentSlots
        gameState.bonusPermanentSlots = [
            { available: true, x: 75,  y: 180, index: 5 },
            { available: true, x: 170, y: 180, index: 6 },
            { available: true, x: 265, y: 180, index: 7 },
            { available: true, x: 360, y: 180, index: 8 },
            { available: true, x: 455, y: 180, index: 9 },
        ];

        // Main pool of taunts
        gameState.taunts = [
            {key: 1, enemy: `A punk rock samurai?\nWhat's next?\nA disco knight?`, player: `What's next, is me\nusing your bones\nas my drumsticks!`},
            {key: 2, enemy: `A Samurai punk rocker?\nIs this some kind of joke?`, player: `The only joke here will be\nyour attempt to survive!` },
            {key: 3, enemy: `You must be lost, samurai boy.\nThe cosplay convention is\ndown the street.`, player: `The only thing lost today\nwill be your head\nfrom your shoulders!`},
            {key: 5, enemy: `Nice samurai outfit, punk!\nWhen does the\ncostume party begin?`, player: `The only party you'll\nbe attending today\nis your own funeral!` },
            {key: 6, enemy: `A Samurai punk rocker?\nHow's that midlife\ncrisis going for you?`, player: `The only crisis happening\ntoday is for the janitor\nwho has to clean up\nwhat's left of you.` }, 
            {key: 7, enemy: `Samurai and punk rocker?\nSchizophrenia's a bitch, huh?`, player: `The only bitch here is\nthe one whose about to\nbe begging me for mercy!` },
            {key: 8, enemy: `What's with the big sword?\nCompensating for something?`, player: `The only things small here\nare your chances of survival!` },
            {key: 9, enemy: `Nice clown costume.\nDo you do childrens\nbirthdays and\nbar mitzvahs?`, player: `Just funerals.\nYours is next\non the list!` },
            {key: 10, enemy: `A samurai in the 21st century?\nI want whatever your smoking!`, player: `Soon enough, the\nonly thing you'll be\nwanting, is mercy!` },
        ];

        // Extra taunts to be added to the main pool
        gameState.taunts2 = [
            {key: 11, enemy: `What's with the flex?\ndid they run out\nof shirts your size?`, player: `I'm saving my shirt\nfor your funeral wake!` },   
            {key: 12, enemy: `What's with the flex?\nAre you here to fight\nor to pose for\nGay Times?`, player: `The only posing happening\ntoday, will be for your\npost-mortem photography!` },      
        ];
         
        // Special taunts for level1fight2
        gameState.ratTaunts = [
            {key: 201, enemy: `Hsss..\nYou'll make a fine\nmeal for my pups!`, player: `Tell them not to wait up.\nDaddy's not comming home tonight!` },
            {key: 202, enemy: `Hsss..\nYou come here to fight\nor to display your\nHalloween costume?`, player: `The only thing on\ndisplay today\nwill be your entrails!` },
        ];
        
        gameState.extraTaunts = [
            {key: 101, enemy: `You really believe\nyou're a samurai, huh?`, player: `You believe in ghosts?\nBecause you're\nabout to become one!` },
            {key: 103, enemy: `Must be hard, living\na deluded fantasy.`, player: `Not as hard as what's\ncoming for you!` },
            {key: 104, enemy: `Punk and Samurai?\nTwo failures in one!`, player: `I'll silence that laughter\nwith the sound of\nyour gurgling blood!`},
            {key: 106, enemy: `You're a relic in a world that's moved on.`, player: `You won't be moving much soon!` },
            {key: 107, enemy: `Is that sword real,\nor are you just cosplaying hard?`, player: `It's as real as the pain\nyou're about to experience!` },
            {key: 108, enemy: `Hey, Samurai punk,\nthe circus called,\nthey want their clown back`, player: `Sorry, I'm booked up\nmopping your entrails\noff the floor!` },   
            {key: 109, enemy: `Still holding onto\npunk's corpse, I see`, player: `The only corpse here\nwill be the one\nI leave behind!` },
            {key: 110, enemy: `Your delusions of grandeur\nare quite entertaining.`, player: `The only entertainment tonight\nwill be your cries of agony!` },
            {key: 111, enemy: `I've seen better costumes\nat a kid's party.`, player: `And I've seen better\nfighters in a retirement home!` },
            {key: 112, enemy: `That haircut's\na cry for help.`, player: `The only one crying\nfor help will be you!` },      
            {key: 16, enemy: `What's with the\nsilly haircut,\nsamurai wannabe?`, player: `Not as silly as your\nentrails will look\nsprawled all over the ground!` },
            {key: 15, enemy: `You take this Samurai gig\npretty seriously, huh??`, player: `As serious as the grave\nyou're about to fill!` },
            {key: 17, enemy: `Whats with the outfit?\nYou look like you\nraided a costume store`, player: `And you look like\nsomeone whose about to\nhave a very bad day!` },
            {key: 14, enemy: `Trying to be a samurai\nor just lost a bet?`, player: `The only thing worth\nbetting on today is\nwhich part of you\nhits the ground first!` },
            {key: 4, enemy: `You look like a kid who\nfound his grandpa's armor.`, player: `And you'll look like\nyour grandpa's corpse\nwhen I'm done here!` },
            {key: 18, enemy: `You look like an\nantagonist from a bad\nMad Max movie`, player: `And you look like\nthe first stunt\nto get taken out!` },
        ];  

        const displayPreloadSceen = () => {
            if (gameState.restartGame) {
                this.scene.start('Buttons');
                return;
            }
                
            this.add.image(825, 720, 'bgLoadingScreen').setScale(2).setInteractive();
            this.add.text(825, 255, 'Punk Rock Samurai', { fontSize: '135px', fill: '#000000', fontFamily: 'Rock Kapak' }).setOrigin(0.5);
            this.add.text(825, 750, 'Click to start', { fontSize: '60px', fill: '#ff0000', fontWeight: 'bold' }).setOrigin(0.5); 

            // Open Main Menu at the first keyboard or mouse buttonup
            this.input.keyboard.on('keydown', () => procedeToMainMenu());
            this.input.on('pointerup', () => procedeToMainMenu());

            function procedeToMainMenu() {
                if (self.screenClicked) return;
                self.screenClicked = true;
                gameConfig.thunder.play( {volume: 0.9, seek: 0.25 } ); 
                self.cameras.main.shake(200, .002, false); 
                self.cameras.main.flash(100);

                self.time.delayedCall(100, () => {
                    self.cameras.main.fadeOut(100);
                }, [], this);

                self.time.delayedCall(200, () => { //1000
                    gameConfig.musicTheme.play( { loop: true, volume: 0.30 } );
                    self.time.delayedCall(100, () => { //500
                        self.scene.start('Buttons');
                    })
                }, [], this);
            };
    }

    displayPreloadSceen();

    } // End of create
} // End of scene