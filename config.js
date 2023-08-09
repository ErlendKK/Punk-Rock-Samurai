const config = {
    type: Phaser.AUTO,
    width: 1100,
    height: 680,
    scene: [
        Preload, Mainmenu,
        Level1fight1, Level1fight2, Level1fight3,
        Level2fight1, Level2fight2, Level2fight3,
        Level3fight1, Level3fight2, Level3fight3,
        Endscene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom: {
        createContainer: true
    },
};


const game = new Phaser.Game(config);


/* ---------------------- CREDITS -----------------

Music by xDeviruchi
Punch sounds by @danielsoundsgood (https://danielsoundsgood.itch.io/free-deadly-kombat-sound-effects)
Healing sound: "Healing (Ripple)" by Dylan Kelk (https://freesound.org/people/SilverIllusionist/)
Power up sound by MATRIXXX (https://freesound.org/people/MATRIXXX_/)
Button Sprites by Ian Eborn.
Thunder sound by Josh74000MC (https://freesound.org/people/Josh74000MC/)
Victory music by  (https://pixabay.com/users/pixabay-1/)
Card image by Avery Ross

https://raw.githack.com/ErlendKK/Punk-Rock-Samurai/main/index.html
*/

