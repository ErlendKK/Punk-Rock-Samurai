let gameState = {};

window.addEventListener('error', function() {
    let errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'block';
});

document.getElementById('bug-report-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const bugDescription = document.getElementById('bug-description').value;
    const consoleLog = document.getElementById('console-log').value;
    const mailtoLink = `mailto:erlendk@live.com?subject=Punk Rock Samurai - BUG REPORT&body=${encodeURIComponent(`Bug Description:\n\n${bugDescription}\n\nConsole Log:\n\n${consoleLog}`)}`;
    
    window.location.href = mailtoLink;
});

class BaseScene extends Phaser.Scene {

    baseCreate(backgoundImage) {
        this.add.image(0,0, backgoundImage).setScale(0.75).setOrigin(0.02,0); 
        this.cameras.main.fadeIn(600, 0, 0, 0);   
        this.input.keyboard.createCursorKeys();
        gameState.targetingCursor = this.add.sprite(0, 0, 'targetingCursor').setDepth(200).setVisible(false);
        gameState.endOfTurnButton = this.add.sprite(980, 610, 'rectangularButton').setScale(0.45).setOrigin(0.5);
        gameState.endOfTurnText = this.add.text(980, 610, 'End Turn', { fontSize: '20px', fill: '#000000' }).setOrigin(0.5);
        
        gameState.cardsDealtSound = this.sound.add('cardsDealtSound');
        gameState.victorySound = this.sound.add('victorySound');
        gameState.buttonPressedSound = this.sound.add('buttonPressedSound');
        gameState.attackSound = this.sound.add('attackSound');
        gameState.powerUpSound = this.sound.add('powerUpSound');
        gameState.healSound = this.sound.add('healSound');
        gameState.thunder = this.sound.add('thundersound');
        //gameState.gunShotSound = this.sound.add('gunShotSound');
        gameState.music = this.sound.add('bossTune');
    }

    resetPlayer(player) {
        gameState.player.sprite = this.add.sprite(320, 350, 'player').setScale(0.38).setFlipX(true).setInteractive(); //320 / 330 / 0.41
        player.stance = 'Neutral'; 
        player.poison = 0;
        player.stancePoints = 0;
        player.numCardsBase = 5;
        player.numCardsStance = 0;
        player.manaBase = 4;
        player.manaStance = 0;
        player.manaCard = 0;
        player.mana = 4;
        player.manaMax = 4;
        player.strengthBase = 0;
        player.strengthStance = 0;
        player.strengthCard = 0;
        player.armorBase = 0;
        player.armorStance = 0;
        player.armorCard = 0;
    };

} // End of scene

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
        let width = this.cameras.main.width;
        let height = this.cameras.main.height;
        
        let progressBox = this.add.graphics();
        let progressBar = this.add.graphics();     
        progressBox.fillStyle(0x222222, 0.8)
        progressBox.fillRect(width / 2 - 160, 270, 320, 50);
       
        let loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', { font: '20px monospace', fill: '#ffffff' }).setOrigin(0.5, 0.5);
        let percentText = this.add.text(width / 2, height / 2 - 5, '0%', { font: '18px monospace', fill: '#ffffff' }).setOrigin(0.5, 0.5);

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
        this.load.image('listbox1', 'assets/images/listbox1.png');
        this.load.image('listbox2', 'assets/images/listbox2.png');
        this.load.image('bgLoadingScreen', 'assets/images/bgLoadingScreen.jpg');
        this.load.image('endscene', 'assets/images/endscene.jpg');

        this.load.audio('cardsDealtSound', 'assets/sounds/cardsdealt.wav');
        this.load.audio('thundersound', 'assets/sounds/thundersound.ogg');
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

        gameState.score = {
            numberOfTurns: 0,
            levelsCompleted: 0,
            damageTaken: 0,
            damageDealt: 0,
            totaleScore: 0
        }

        gameState.player = {
            name: gameState.playerName ? gameState.playerName : 'Punk Rock Samurai',
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
        }

        gameState.deck = [

            {key: 'knuckleFist', type: 'targetSelected', cost: 1, stancePoints: 1,  damage: 7, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'knuckleFist', type: 'targetSelected', cost: 1, stancePoints: 1,  damage: 7, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'knuckleFist', type: 'targetSelected', cost: 1, stancePoints: 1,  damage: 7, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'knuckleFist', type: 'targetSelected', cost: 1, stancePoints: 1,  damage: 7, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'kabutu',      type: 'buff',           cost: 1, stancePoints: -1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'kabutu',      type: 'buff',           cost: 1, stancePoints: -1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'kabutu',      type: 'buff',           cost: 1, stancePoints: -1, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'combatBoots', type: 'targetAll',      cost: 2, stancePoints: 0,  damage: 5, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: () => gameState.player.stancePoints > 0 ? 2 * gameState.player.stancePoints : 0, reduceTargetStrength: 0},
            {key: 'tantoBlade',  type: 'targetSelected', cost: 2, stancePoints: 0,  damage: () => gameState.player.stancePoints < 0 ? 12 - 2 * gameState.player.stancePoints : 12, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'discontent',  type: 'buff',           cost: 1, stancePoints: () => gameState.player.stancePoints > 0 ? -2 : gameState.player.stancePoints < 0 ? 2 : 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
     
        ];
            
        gameState.bonusCards = [  
            {key: 'kamishimoUberAlles', type: 'permanent',  cost: 0, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, token: 'kamishimoUberAllesToken'},
            {key: 'hollidayInKamakura', type: 'permanent',  cost: 0, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, token: 'hollidayInKamakuraToken'},
            {key: 'rebelSpirit',        type: 'permanent',  cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, token: 'rebelSpiritToken'},
            {key: 'foreverTrue',        type: 'permanent',  cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, token: 'foreverTrueToken'},
           
            {key: 'studdedLeather', type: 'buff',           cost: 1, stancePoints: 2, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 5, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'rocknRonin',     type: 'buff',           cost: 0, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: () => gameState.player.strength, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'seppuku',        type: 'buff',           cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: -5, poisonRemove: 0, strength: () => gameState.player.stancePoints < 0 ? 1 - gameState.player.stancePoints : 1, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'rawEnergy',      type: 'buff',           cost: () => gameState.player.stancePoints > 0 ? -2 : -1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'powerChord',     type: 'buff',           cost: 1, stancePoints: () => gameState.player.stancePoints <= 0 ? 1 : 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
           
            {key: 'stageInvasion',  type: 'targetAll',      cost: 2, stancePoints: 0, damage: () => 2 * (gameState.currentCards.length + 1), fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'circlePit',      type: 'targetAll',      cost: () => gameState.player.mana, stancePoints: 0, damage: 0, fire: () => gameState.costPlayed * 3, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'blackFumes',         type: () => gameState.player.stancePoints >= 0 ? 'targetAll' : 'targetSelected', cost: 2, stancePoints: 0, damage: 0, fire: 0, poison: () => gameState.player.stancePoints > 0 ? 3 : gameState.player.stancePoints < 0 ? 5 : 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'boneShredder',   type: 'targetSelected', cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 1, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 1},
            {key: 'masakari',       type: 'targetSelected', cost: 2, stancePoints: 0, damage: () => gameState.player.stancePoints < 0 ? 10 * (1 - gameState.player.stancePoints * gameState.player.strength / 10) : 10, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'katana',         type: 'targetSelected', cost: 3, stancePoints: 0, damage: () => gameState.player.stancePoints < 0 ? 15 * (1 - gameState.player.stancePoints * gameState.player.strength / 10) : 15, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
            {key: 'pyromania',      type: 'targetSelected', cost: 2, stancePoints: 0, damage: 0, fire: 12, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0},
        ];

        gameState.extraCards = [
            {key: 'kirisuteGomen',  type: 'permanent',  cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, token: 'kirisuteGomenToken'},
            {key: 'rebelHeart',     type: 'permanent',  cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, token: 'rebelHeartToken'},
            {key: 'bushido',        type: 'permanent',  cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, token: 'bushidoToken'},
            {key: 'toxicAvenger',   type: 'permanent',  cost: 1, stancePoints: 0, damage: 0, fire: 0, poison: 0, heal: 0, poisonRemove: 0, strength: 0, armor: 0, reduceTargetArmor: 0, reduceTargetStrength: 0, token: 'toxicAvengerToken'},
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
                gameState.thunder.play( {volume: 0.9, seek: 0.25 } )    
                this.cameras.main.shake(1500, .002, false); 
                this.cameras.main.flash(500);

                this.time.delayedCall(500, () => {
                    this.cameras.main.fadeOut(1000);
                }, [], this);

                this.time.delayedCall(1200, () => { //1000
                    gameState.musicTheme.play( { loop: true, volume: 0.30 } );
                    this.time.delayedCall(300, () => { //500
                        this.scene.start('Mainmenu');
                    })
                }, [], this);
            };
        });

    } // End of create
} // End of scene

/* ---------------------- CREDITS -----------------

Music by xDeviruchi
Punch sounds by @danielsoundsgood (https://danielsoundsgood.itch.io/free-deadly-kombat-sound-effects)
Healing sound: "Healing (Ripple)" by Dylan Kelk (https://freesound.org/people/SilverIllusionist/)
Power up sound by MATRIXXX (https://freesound.org/people/MATRIXXX_/)
Button Sprites by Ian Eborn.
*/
