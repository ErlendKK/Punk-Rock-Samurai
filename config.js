/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|

Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

"use strict";

const config = {
    type: Phaser.AUTO,
    width: 1650,
    height: 1020,
    scene: [
        BaseScene, Preload, Mainmenu, Buttons, 
        Characters, Cards, TextBoxes, Actions, 
        Level1Fight1, Level1Fight2, Level1Fight3,
        Level2Fight1, Level2Fight2, Level2Fight3,
        Level3Fight1, Level3Fight2, Level3Fight3,
        Level4Fight1, Level4Fight2, Level4Fight3,
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


//https://raw.githack.com/ErlendKK/Punk-Rock-Samurai/main/index.html
// C:\Spill\Punk Rock Samurai\github\Punk-Rock-Samurai>terser preload.js basescene.js Cards.js Characters.js Buttons.js mainmenu.js TextBoxes.js Actions.js level*.js endscene.js config.js -c -m -o game.min.js