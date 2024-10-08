/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming by Erlend Kulander Kvitrud. Copyright 2023, all rights reserved.*/

"use strict";

let gameState = {};
const gameConfig = {};

gameState.version = "1.3.17";

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
    console.log(
        `%cWelcome to Punk Rock Samurai v${gameState.version}`, 'color: red; font-size: 26px; font-weight: bold; background-color: lightgray');
    console.log(`%cConsole log in on during beta testing`, 'color: red; font-size: 16px; font-weight: bold; background-color: lightgray')
} catch (e) {
    console.log(`Welcome to Punk Rock Samurai v${gameState.version}`); // Fallback without styling
    console.log(`Logging will me on during beta testing`); // Fallback without styling
}

class Preload extends BaseScene {
    constructor() {
        super('Preload');
    }

    preload() {
        const self = this;
        
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

        // Preload permanent cards and tokens
        const images = [
            // Starting cards
            { key: 'knuckleFist', path: '../assets/images/cards/knuckleFist.jpg', loaded: false },
            { key: 'kabutu', path: '../assets/images/cards/kabutu.jpg', loaded: false },
            { key: 'combatBoots', path: '../assets/images/cards/combatBoots.jpg', loaded: false },
            { key: 'tantoBlade', path: '../assets/images/cards/tantoBlade.jpg', loaded: false },
            { key: 'discontent', path: '../assets/images/cards/discontent.jpg', loaded: false },

            // // Permanents and tokens
            { key: 'soulSquatter', path: '../assets/images/cards/soulSquatter.jpg', loaded: false },
            { key: 'soulSquatterToken', path: '../assets/images/tokens/soulSquatterToken.png', loaded: false },
            { key: 'punksNotDead', path: '../assets/images/cards/punksNotDead.jpg', loaded: false },
            { key: 'punksNotDeadToken', path: '../assets/images/tokens/punksNotDeadToken.png', loaded: false },
            { key: 'lustForLife', path: '../assets/images/cards/lustForLife.jpg', loaded: false },
            { key: 'lustForLifeToken', path: '../assets/images/tokens/lustForLifeToken.png', loaded: false },
            { key: 'gundanSeizai', path: '../assets/images/cards/gundanSeizai.jpg', loaded: false },
            { key: 'gundanSeizaiToken', path: '../assets/images/tokens/gundanSeizaiToken.png', loaded: false },
            { key: 'deadTokugawas', path: '../assets/images/cards/deadTokugawas.jpg', loaded: false },
            { key: 'deadTokugawasToken', path: '../assets/images/tokens/deadTokugawasToken.png', loaded: false },
            { key: 'toxicFrets', path: '../assets/images/cards/toxicFrets.jpg', loaded: false },
            { key: 'toxicFretsToken', path: '../assets/images/tokens/toxicFretsToken.png', loaded: false },
            { key: 'ashenEncore', path: '../assets/images/cards/ashenEncore.jpg', loaded: false },
            { key: 'ashenEncoreToken', path: '../assets/images/tokens/ashenEncoreToken.png', loaded: false },
            { key: 'edoEruption', path: '../assets/images/cards/edoEruption.jpg', loaded: false },
            { key: 'edoEruptionToken', path: '../assets/images/tokens/edoEruptionToken.png', loaded: false },
            { key: 'steelToe', path: '../assets/images/cards/steelToe.jpg', loaded: false },
            { key: 'steelToe2', path: '../assets/images/cards/steelToe2.jpg', loaded: false },
            { key: 'steelToeToken', path: '../assets/images/tokens/steelToeToken.png', loaded: false },
            { key: 'foreverTrue', path: '../assets/images/cards/foreverTrue.jpg', loaded: false },
            { key: 'foreverTrueToken', path: '../assets/images/tokens/foreverTrueToken.png', loaded: false },
            { key: 'rebelSpirit', path: '../assets/images/cards/rebelSpirit.jpg', loaded: false },
            { key: 'rebelSpiritToken', path: '../assets/images/tokens/rebelSpiritToken.png', loaded: false },
            { key: 'rebelHeart', path: '../assets/images/cards/rebelHeart.jpg', loaded: false },
            { key: 'rebelHeartToken', path: '../assets/images/tokens/rebelHeartToken.png', loaded: false },
            { key: 'bushido', path: '../assets/images/cards/bushido.jpg', loaded: false },
            { key: 'bushidoToken', path: '../assets/images/tokens/bushidoToken.png', loaded: false },
            { key: 'toxicAvenger', path: '../assets/images/cards/toxicAvenger.jpg', loaded: false },
            { key: 'toxicAvengerToken', path: '../assets/images/tokens/toxicAvengerToken.png', loaded: false },
            { key: 'kirisuteGomen', path: '../assets/images/cards/kirisuteGomen.jpg', loaded: false },
            { key: 'kirisuteGomenToken', path: '../assets/images/tokens/kirisuteGomenToken.png', loaded: false },
            { key: 'hollidayInKamakura', path: '../assets/images/cards/hollidayInKamakura.jpg', loaded: false },
            { key: 'hollidayInKamakuraToken', path: '../assets/images/tokens/hollidayInKamakuraToken.png', loaded: false },
            { key: 'kamishimoUberAlles', path: '../assets/images/cards/kamishimoUberAlles.jpg', loaded: false },
            { key: 'kamishimoUberAllesToken', path: '../assets/images/tokens/kamishimoUberAllesToken.png', loaded: false },
            { key: 'bouncingSoles', path: '../assets/images/cards/bouncingSoles.jpg', loaded: false },
            { key: 'bouncingSoles2', path: '../assets/images/cards/bouncingSoles2.jpg', loaded: false },
            { key: 'bouncingSoles3', path: '../assets/images/cards/bouncingSoles3.jpg', loaded: false },
            { key: 'bouncingSoles4', path: '../assets/images/cards/bouncingSoles4.jpg', loaded: false },
            { key: 'bouncingSolesToken', path: '../assets/images/tokens/bouncingSolesToken.png', loaded: false },
            { key: 'enduringSpirit', path: '../assets/images/cards/enduringSpirit.jpg', loaded: false },
            { key: 'enduringSpiritToken', path: '../assets/images/tokens/enduringSpiritToken.png', loaded: false },
            { key: 'shogunsShell', path: '../assets/images/cards/shogunsShell.jpg', loaded: false },
            { key: 'shogunsShellToken', path: '../assets/images/tokens/shogunsShellToken.png', loaded: false },
            { key: 'chemicalWarfare', path: '../assets/images/cards/chemicalWarfare.jpg', loaded: false },
            { key: 'chemicalWarfareToken', path: '../assets/images/tokens/chemicalWarfareToken.png', loaded: false },
            { key: 'zaibatsuU', path: '../assets/images/cards/zaibatsuUnderground.jpg', loaded: false },
            { key: 'zaibatsuUndergroundToken', path: '../assets/images/tokens/zaibatsuUndergroundToken.png', loaded: false },
            { key: 'chintaiShunyu', path: '../assets/images/cards/chintaiShunyu.jpg', loaded: false },
            { key: 'chintaiShunyuToken', path: '../assets/images/tokens/chintaiShunyuToken.png', loaded: false },
            { key: 'stageInvasion', path: '../assets/images/cards/stageInvasion.jpg', loaded: false },
            { key: 'stageInvasionToken', path: '../assets/images/tokens/stageInvasionToken.png', loaded: false },
            { key: 'laidoSoho', path: '../assets/images/cards/laidoSoho.jpg', loaded: false },
            { key: 'laidoSohoToken', path: '../assets/images/tokens/laidoSohoToken.png', loaded: false },

            // UI Elements
            { key: 'bgLoadingScreen', path: '../assets/images/backgrounds/bgLoadingScreen.jpg', loaded: false },
            { key: 'shop1', path: '../assets/images/backgrounds/shop1.jpg', loaded: false },
            { key: 'goldCard', path: '../assets/images/ui/goldCard.jpg', loaded: false },
            { key: 'goldCoin', path: '../assets/images/ui/goldCoin.png', loaded: false },
            { key: 'listbox1', path: '../assets/images/ui/listbox1.png', loaded: false },
            { key: 'rectangularButton', path: '../assets/images/ui/stoneButtonInsetReady.png', loaded: false },
            { key: 'rectangularButtonHovered', path: '../assets/images/ui/stoneButtonInsetHovered.png', loaded: false },
            { key: 'rectangularButtonPressed', path: '../assets/images/ui/stoneButtonInsetPressed.png', loaded: false },
        ];
        
        const audios = [
            { key: 'titleTheme', path: '../assets/sounds/music/TitleTheme.mp3', loaded: false },
            { key: 'bossTune', path: '../assets/sounds/music/DecisiveBattle.mp3', loaded: false },
            { key: 'thundersound', path: '../assets/sounds/thundersound.mp3', loaded: false },
            { key: 'attackSound', path: '../assets/sounds/attacksound.wav', loaded: false },
            { key: 'powerUpSound', path: '../assets/sounds/powerupsound.wav', loaded: false },
            { key: 'healSound', path: '../assets/sounds/healsound.wav', loaded: false },
            { key: 'victorySound', path: '../assets/sounds/victorysound.mp3', loaded: false },
            { key: 'keyboardSound', path: '../assets/sounds/keyboardsound.mp3', loaded: false },
            { key: 'coinSound', path: '../assets/sounds/coinsound.mp3', loaded: false },
            { key: 'cardsDealtSound', path: '../assets/sounds/cardsdealt.wav', loaded: false },
            { key: 'buttonPressedSound', path: '../assets/sounds/buttonpressed.wav', loaded: false },
            { key: 'gunShotSound', path: '../assets/sounds/gunshot.mp3', loaded: false }   
        ];

        // Preload files the first time the game runs, not on restart
        if (!gameState.restartGame) {
            images.forEach(asset => {
                this.loadAssetWithRetry(asset, 'image', 1, 200);
            });

            audios.forEach(asset => {
                this.loadAssetWithRetry(asset, 'audio', 1, 200);
            });
        }
    }  

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
                
            this.add.image(800, 510, 'bgLoadingScreen').setScale(1.25).setInteractive();
            this.add.text(825, 895, 'Press to start', { fontSize: '90px', fill: '#9e2d20', fontWeight: 'bold' }).setOrigin(0.5); //825

            // Open Main Menu at the first keyboard or mouse buttonup
            this.input.keyboard.on('keydown', () => procedeToMainMenu());
            this.input.on('pointerup', () => procedeToMainMenu());

            function procedeToMainMenu() {
                if (self.screenClicked) return;

                const themeStartTime = 44
                self.screenClicked = true;
                gameConfig.thunder.play( {volume: 0.8, seek: 0.25 } ); 
                gameConfig.musicTheme.play({ loop: true, volume: 0.6, seek: 44.4 });
                self.cameras.main.shake(200, .002, false); 
                self.cameras.main.flash(100);

                self.time.delayedCall(100, () => {
                    self.cameras.main.fadeOut(100);
                }, [], this);
                    
                self.time.delayedCall(300, () => { //500
                    self.scene.launch('LoadLazy');
                    self.scene.launch('Buttons');
                    // self.scene.start('Buttons');
                }, [], this);
            };
        }

    displayPreloadSceen();

    } // End of create
} // End of scene