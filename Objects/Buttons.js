/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

"use strict";

class Button {
    constructor(scene, key, handler, x, y, z = 201, scaleX = 0.60, scaleY = 0.60) {
        this.scene = scene;
        this.key = key;

        // Creating the button sprite and label
        this.sprite = scene.add.image(x, y, 'rectangularButtonPressed');
        this.sprite.setScale(scaleX, scaleY).setDepth(z).setOrigin(0.5);             
        this.label = scene.add.text(x, y, key, { fontSize: '25px', fill: '#000000' });
        this.label.setDepth(z+1).setOrigin(0.5);

        // Setting up properties
        Object.assign(this, FadeOutBehavior);

        this.isActive = false;
        this.isHovered = false;
        this.isPressed = false;
        this.key = key;
        this.pointerText = '';
        this._pointerTextObjects = [];

        // Arguments for onclick event handler
        this.handlerArg = {}; 

        // Function for creating pointertexts
        const createPointerText = () => {
            const textConfig = { fontSize: '22px', fill: '#000000' };
            const pointerTextObj = scene.add.text(x, y + 75, this.pointerText, textConfig).setDepth(z+1).setOrigin(0.5, 0.5);
            
            const cornerRadius = 12;
            const alpha = 0.60;
            const bounds = pointerTextObj.getBounds();
            const backgroundWidth = bounds.width + 15; // 5px padding on each side
            const backgroundHeight = bounds.height + 15; // 5px padding on each side
            const backgroundX = bounds.x - 7.5; // 5px padding on the left
            const backgroundY = bounds.y - 7.5; // 5px padding on the top

            const pointerBackgroundObj = scene.add.graphics();
            pointerBackgroundObj.fillStyle(0xFFFFFF, 1).setAlpha(alpha).setDepth(z);
            pointerBackgroundObj.fillRoundedRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight, cornerRadius);

            this._pointerTextObjects.push(pointerTextObj, pointerBackgroundObj);
        }

        // Event listeners for pointerover, pointerout, pointerdown and pointerup
        this.sprite.on('pointerover', () => {
            if (!this.isActive) return;
            this.isHovered = true;
            this.sprite.setTexture('rectangularButtonHovered');
            if (this.pointerText) createPointerText();
        });
        this.sprite.on('pointerout', () => {
            if (this._pointerTextObjects.length) this.destroyPointerText();
            if (!this.isActive) return;
            this.isHovered = false;
            this.sprite.setTexture('rectangularButton'); 
        });
        this.sprite.on('pointerdown', () => {
            if (!this.isActive) return; 
            this.sprite.setTexture('rectangularButtonPressed');
        })
        this.sprite.on('pointerup', () => {
            if (!this.isActive) return;
            gameConfig.buttonPressedSound.play({ volume: 0.7 });
            this.sprite.setTexture('rectangularButtonHovered');
            handler(this.handlerArg)

            if (!this._pointerTextObjects.length) return;
            this.destroyPointerText(); 
            createPointerText();
        });
    }

    // Function for destroying pointer text and background
    destroyPointerText() {
        this._pointerTextObjects.forEach(obj => obj.destroy());
        this._pointerTextObjects = [];
    }

    // Method for setting the content of the pointerText
    setPointerText(newPointerText) {
        this.pointerText = newPointerText;
        return this;
    };

    // Method for activating the button
    activate() {
        if (this.isActive) return this;
        
        this.isActive = true;
        this.sprite.setInteractive();
        this.sprite.setTexture('rectangularButton');
        return this;
    }

    // Methods for deactivating the button. 
    // deactivate() disables click events. disable() also disables pointerover events.
    deactivate() {
        if (!this.isActive) return this;
        
        this.isActive = false;
        this.sprite.setTexture('rectangularButton');
        return this;
    }

    disable() {
        if (!this.isActive) return this;
        
        const isPointerText = () => this._pointerTextObjects && this._pointerTextObjects.length;
        if (isPointerText) this.destroyPointerText();
        this.isActive = false;
        this.sprite.removeInteractive();
        this.sprite.setTexture('rectangularButtonPressed');
        return this;
    }

    // Method for changing the font size and fill color of the button label
    updateFont(fontSize, fill='#000000') {
        this.label.setFontSize(fontSize);
        this.label.setFill(fill);
        return this;
    }

    // Method to set change the depth of the button sprite and label
    setDepth(depth) {
        this.sprite.setDepth(depth);
        this.label.setDepth(depth+1);
        return this;
    }

    // Mehod for scaling the button sprite
    setScale(x, y) {
        this.sprite.setScale(x, y);
        return this;
    }

    // Mehod for deleting the button sprite and label
    destroy() {
        this.sprite.destroy();
        this.label.destroy();
        return this;
    }

    // Calls the method fadeOutTarget, to fade out and destroy the button sprite and text
    fadeOut(duration = 200) {
        this.fadeOutTarget(this.scene, this.sprite, duration);
        this.fadeOutTarget(this.scene, this.label, duration);
    }

    addHandlerArg(...args) {
        args.forEach(arg => Object.assign(this.handlerArg, arg));
        return this;
    }

    setHandlerArg(arg) {
        this.handlerArg = arg;
        return this;
    }
}

class Buttons extends Phaser.Scene {
    constructor() {
        super('Buttons');
    }
    create() {
        console.log('Buttons loaded') 
        this.scene.start('Characters');
    }
}