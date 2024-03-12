/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

"use strict";

class LoadLazy extends BaseScene {
    constructor() {
        super('LoadLazy');
    }

    create() {
        const self = this

        let assets = [
            { key: 'circlePit', path: 'assets/images/cards/circlePit.jpg', loaded: false },
            { key: 'seppuku', path: 'assets/images/cards/seppuku.jpg', loaded: false },
            { key: 'katana', path: 'assets/images/cards/katana.jpg', loaded: false },
            { key: 'rocknRonin', path: 'assets/images/cards/rocknRonin.jpg', loaded: false },
            { key: 'powerChord', path: 'assets/images/cards/powerChord.jpg', loaded: false },
            { key: 'rawEnergy', path: 'assets/images/cards/rawEnergy.jpg', loaded: false },
            { key: 'pyromania', path: 'assets/images/cards/pyromania.jpg', loaded: false },
            { key: 'studdedLeather', path: 'assets/images/cards/studdedLeather.jpg', loaded: false },
            { key: 'boneShredder', path: 'assets/images/cards/boneShredder.jpg', loaded: false },
            { key: 'blackFumes', path: 'assets/images/cards/blackFumes.jpg', loaded: false },
            { key: 'masakari', path: 'assets/images/cards/masakari.jpg', loaded: false },
            { key: 'dogsOfWar', path: 'assets/images/cards/dogsOfWar.jpg', loaded: false },
            { key: 'roninsRot', path: 'assets/images/cards/roninsRot.jpg', loaded: false },
            { key: 'libertySpikes', path: 'assets/images/cards/libertySpikes.jpg', loaded: false },
            { key: 'moshpitMassacre', path: 'assets/images/cards/moshpitMassacre.jpg', loaded: false },
            { key: 'bladesBlight', path: 'assets/images/cards/bladesBlight.jpg', loaded: false },
            { key: 'scorchedSoul', path: 'assets/images/cards/scorchedSoul.jpg', loaded: false },
            { key: 'risingWakizashi', path: 'assets/images/cards/risingWakizashi.jpg', loaded: false },
            { key: 'deadCities', path: 'assets/images/cards/deadCities.jpg', loaded: false },
            { key: 'nastyNihonto', path: 'assets/images/cards/nastyNihonto.jpg', loaded: false },
            { key: 'crowdSurfer', path: 'assets/images/cards/crowdSurfer.jpg', loaded: false },
            { key: 'shogunShred', path: 'assets/images/cards/shogunShred.jpg', loaded: false },
            { key: 'rocknRejuvinate', path: 'assets/images/cards/rocknRejuvinate.jpg', loaded: false },
            { key: 'detox', path: 'assets/images/cards/detox.jpg', loaded: false },
            { key: 'dBeat', path: 'assets/images/cards/dBeat.jpg', loaded: false },
            { key: 'shikoroStrike', path: 'assets/images/cards/shikoroStrike.jpg', loaded: false },
            { key: 'rottenResonance', path: 'assets/images/cards/rottenResonance.jpg', loaded: false },
            { key: 'troopsOfTakamori', path: 'assets/images/cards/troopsOfTakamori.jpg', loaded: false },
            { key: 'bassSolo', path: 'assets/images/cards/bassSolo.jpg', loaded: false },
            { key: 'zenZine', path: 'assets/images/cards/zenZine.jpg', loaded: false },
            { key: 'kabutuOverdrive', path: 'assets/images/cards/kabutuOverdrive.jpg', loaded: false },
            { key: 'nenguStyle', path: 'assets/images/cards/nenguStyle.jpg', loaded: false },
            { key: 'canibalize', path: 'assets/images/cards/canibalize.jpg', loaded: false },
            { key: 'bloodOath', path: 'assets/images/cards/bloodOath.jpg', loaded: false },
            { key: 'roninMerc', path: 'assets/images/cards/roninMerc.jpg', loaded: false },
            { key: 'pyroPunk', path: 'assets/images/cards/pyroPunk.jpg', loaded: false },
            { key: 'pissDrunkBastards', path: 'assets/images/cards/pissDrunkBastards.jpg', loaded: false },
            { key: 'gutterGeisha', path: 'assets/images/cards/gutterGeisha.jpg', loaded: false },
            { key: 'noFuture', path: 'assets/images/cards/noFuture.jpg', loaded: false },
            { key: 'coverCharge', path: 'assets/images/cards/coverCharge.jpg', loaded: false },
            { key: 'wrathOfMoen', path: 'assets/images/cards/wrathOfMoen.jpg', loaded: false },
            { key: 'saisenBlaster', path: 'assets/images/cards/saisenBlaster.jpg', loaded: false },
            { key: 'riotRonin', path: 'assets/images/cards/riotRonin.jpg', loaded: false },
            { key: 'rebelLife', path: 'assets/images/cards/rebelLife.jpg', loaded: false },
            { key: 'satomiSubterfuge', path: 'assets/images/cards/satomiSubterfuge.jpg', loaded: false }
        ];

        assets.forEach(asset => {
            this.loadAssetWithRetry(asset, 'image', 0, 200); // asset, type, current attempt, max retries
        });
    }
}
