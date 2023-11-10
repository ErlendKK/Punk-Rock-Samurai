old_code = """} else if (card.key === 'lustForLife') {
                let healCost = 1;
                const healAmount = 7
                const x = 900;
                const y = 130;
                const textConfig = { fontSize: '12px', fill: '#000000' };

                gameState.healButton = self.add.image(x, y, 'rectangularButton').setScale(0.45).setOrigin(0.5).setInteractive();
                gameState.healText = self.add.text(x, y, 'Heal', { fontSize: '20px', fill: '#000000' }).setOrigin(0.5);

                gameState.healButton.on('pointerover', () => {
                    const textContent = `  Heal ${healAmount} HP\n Cost: ${healCost} gold`;
                    gameState.healButton.setTexture('rectangularButtonHovered').setDepth(122);
                    gameState.healText.setDepth(123)

                    gameState.healButtonDescriptionBackground = self.add.graphics();
                    gameState.healButtonDescriptionBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.8).setDepth(122);
                    gameState.healButtonDescriptionBackground.fillRoundedRect(x-65, y+30, 130, 40, 5);
                    gameState.healButtonDescriptionText = self.add.text(x, y+50, textContent, textConfig).setDepth(123).setOrigin(0.5, 0.5);
                });
                
                gameState.healButton.on('pointerout', () => {
                    gameState.healButton.setTexture('rectangularButton').setDepth(10);
                    gameState.healText.setDepth(11)
                    if (gameState.healButtonDescriptionBackground) gameState.healButtonDescriptionBackground.destroy();
                    if (gameState.healButtonDescriptionText) gameState.healButtonDescriptionText.destroy();
                });
                
                gameState.healButton.on('pointerup', () => {
                    if (gameState.player.gold >= healCost && gameState.playersTurn) {
                        spendGold(healCost);
                        gameState.player.health = Math.min(gameState.player.healthMax, gameState.player.health + healAmount);
                        self.updateHealthBar(gameState.player);
    
                        if (gameState.healButtonDescriptionText) {
                            const textContent = `  Heal ${healAmount} HP\n Cost: ${healCost} gold`;
                            gameState.healButtonDescriptionText.setText(textContent);
                        }
                    }
                })
                
                card.tokenSprite.on('pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteLustForLife(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })"""

new_code = """} else if (card.key === 'lustForLife') {
                let healCost = 1;
                const healAmount = 7
                const x = 900;
                const y = 130;
                const textConfig = { fontSize: '12px', fill: '#000000' };

                gameState.healButton = self.add.image(x, y, 'rectangularButton');
                gameState.healButton.setScale(0.45).setOrigin(0.5).setDepth(10).setInteractive();
                gameState.healText = self.add.text(x, y, 'Heal', { fontSize: '20px', fill: '#000000' }).setOrigin(0.5).setDepth(11);

                gameState.healButton.on('pointerover', () => {
                    const textContent = `  Heal ${healAmount} HP\n Cost: ${healCost} gold`;
                    gameState.healButton.setTexture('rectangularButtonHovered').setDepth(122);
                    gameState.healText.setDepth(123)

                    gameState.healButtonDescriptionBackground = self.add.graphics();
                    gameState.healButtonDescriptionBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.8).setDepth(122);
                    gameState.healButtonDescriptionBackground.fillRoundedRect(x-65, y+30, 130, 40, 5);
                    gameState.healButtonDescriptionText = self.add.text(x, y+50, textContent, textConfig).setDepth(123).setOrigin(0.5, 0.5);
                });

                gameState.healButtonObjects = [gameState.healButton, gameState.healText, gameState.healButtonDescriptionBackground]
                
                gameState.healButton.on('pointerout', () => {
                    gameState.healButton.setTexture('rectangularButton').setDepth(10);
                    gameState.healText.setDepth(11)
                    if (gameState.healButtonDescriptionBackground) gameState.healButtonDescriptionBackground.destroy();
                    if (gameState.healButtonDescriptionText) gameState.healButtonDescriptionText.destroy();
                });
                
                gameState.healButton.on('pointerup', () => {
                    if (gameState.player.gold >= healCost && gameState.playersTurn) {
                        spendGold(healCost) ;
                        gameState.player.health = Math.min(gameState.player.healthMax, gameState.player.health + healAmount);
                        self.updateHealthBar(gameState.player);
    
                        if (gameState.healButtonDescriptionText) {
                            const textContent = `  Heal ${healAmount} HP\n Cost: ${healCost} gold`;
                            gameState.healButtonDescriptionText.setText(textContent);
                        }
                    }
                })
                
                card.tokenSprite.on('pointerup', () => {
                    if (gameState.playersTurn) {
                        depleteLustForLife(card); 
                    } else {
                        self.cameras.main.shake(70, .002, false);
                    }
                })"""

levels = [
    "Level1Fight1", "Level1Fight2", "Level1Fight3",
    "Level2Fight1", "Level2Fight2", "Level2Fight3",
    "Level3Fight1", "Level3Fight2", "Level3Fight3",
    # "Level4Fight1", "Level4Fight2", "Level4Fight3",
    "basescene", "preload", "mainmenu", "endscene"
]

for level in levels:
    with open(f'{level.lower()}.js', 'r') as file:
        content = file.read()

    if content.find(old_code) != -1:
        updated_content = content.replace(old_code, new_code)
        with open(f'{level.lower()}.js', 'w') as file:
            file.write(updated_content)
        print(f'Code successfully updated for {level}')
    
    else:
        print(f'Old code not found in {level}')



    