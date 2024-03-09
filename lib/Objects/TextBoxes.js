/*____              _      ____            _      ____                                  _ 
 |  _ \ _   _ _ __ | | __ |  _ \ ___   ___| | __ / ___|  __ _ _ __ ___  _   _ _ __ __ _(_)
 | |_) | | | | '_ \| |/ / | |_) / _ \ / __| |/ / \___ \ / _` | '_ ` _ \| | | | '__/ _` | |
 |  __/| |_| | | | |   <  |  _ < (_) | (__|   <   ___) | (_| | | | | | | |_| | | | (_| | |
 |_|    \__,_|_| |_|_|\_\ |_| \_\___/ \___|_|\_\ |____/ \__,_|_| |_| |_|\__,_|_|  \__,_|_|
                                                                                          
Game design and programming: Copyright 2023 Erlend Kulander Kvitrud, all rights reserved.*/

"use strict";

class TextBox {
  constructor(scene, textContent) {
    let argCoords = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    let textConfig = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    let backgroundAlpha = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.5;
    // Default properties for text coordinates and Configurations
    const defaultCoords = {
      x: 0,
      y: 0,
      z: 200
    };
    const defaultTextConfig = {
      fontSize: 50,
      fill: '#ff0000',
      fontWeight: ''
    };

    // Overwrite default properties by arguments
    const finalCoords = Object.assign({}, defaultCoords, argCoords);
    const finalTextConfig = Object.assign({}, defaultTextConfig, textConfig);

    // Class properties
    this.scene = scene;
    this.textContent = textContent;
    this.x = finalCoords.x;
    this.y = finalCoords.y;
    this.z = finalCoords.z;
    this.textConfig = finalTextConfig;
    this.displayed = true;

    // Assign behaviour
    Object.assign(this, FadeOutBehavior, argCoords, textConfig);

    // Create the text object
    this.textObj = this.scene.add.text(this.x, this.y, this.textContent, this.textConfig);
    this.textObj.setOrigin(0.5).setDepth(this.z);

    // Get the dimentions of the text object and add some margin on all sides
    const bounds = this.textObj.getBounds();
    const backgroundWidth = bounds.width + 15;
    const backgroundHeight = bounds.height + 15;
    const backgroundX = bounds.x - 7.5;
    const backgroundY = bounds.y - 7.5;

    // Create the text background
    this.cornerRadius = 10;
    this.backgroundColor = '0xFFFFFF';
    this.backgroundAlpha = backgroundAlpha;
    this.background = this.scene.add.graphics();
    this.background.fillStyle(this.backgroundColor, 1).setAlpha(this.backgroundAlpha).setDepth(this.z - 1);
    this.background.fillRoundedRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight, this.cornerRadius);
  }
  updateText(newText) {
    let z = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.z;
    this.textObj.setText(newText).setOrigin(0.5).setDepth(z);

    // Get the updated dimentions of the text object and add some margin on all sides
    const bounds = this.textObj.getBounds();
    const backgroundWidth = bounds.width + 10;
    const backgroundHeight = bounds.height + 10;
    const backgroundX = bounds.x - 5;
    const backgroundY = bounds.y - 5;

    // Update the text background with the new dimentions
    this.background.clear();
    this.background.fillStyle(this.backgroundColor, 1).setAlpha(this.backgroundAlpha).setDepth(z - 1);
    this.background.fillRoundedRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight, this.cornerRadius);
  }

  // Calls the method fadeOutTarget, to fade out and destroy the button sprite and text
  setConfig(configArg) {
    let radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 7;
    let alpha = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.40;
    this.textConfig = configArg;
    this.cornerRadius = radius;
    this.background.setAlpha(alpha);
    return this;
  }

  // Mehod for deleting the text and beckground
  destroy() {
    this.textObj.destroy();
    this.background.destroy();
    this.displayed = false;
    return this;
  }
  fadeOut() {
    let duration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 200;
    this.fadeOutTarget(this.scene, this.textObj, duration);
    this.fadeOutTarget(this.scene, this.background, duration);
    this.displayed = false;
  }
  get isDisplayed() {
    return this.displayed;
  }
}
class TextBoxes extends Phaser.Scene {
  constructor() {
    super('TextBoxes');
  }
  create() {
    console.log('TextBoxes loaded');
    this.scene.start('Mainmenu');
  }
}