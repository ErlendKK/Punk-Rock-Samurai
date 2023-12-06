old_code = """if ('usesTillDepletion' in card) activateUsesTillDepletion(card);
        }

        function activateUsesTillDepletion(card) {
            gameState.infoBoxElements.forEach(element => {
                if (element) element.destroy();
            })
            gameState.infoBoxElements = [];
        
            const textConfig = { fontSize: '20px', fill: '#000000' };
            const textContent = card.usesTillDepletion > 0 ? `Remaining uses: ${card.usesTillDepletion}` : `Card depleted!`;
            
            let usesTillDepletionText = self.add.text(550, 100, "", textConfig).setOrigin(0.5).setDepth(21);
            let usesTillDepletionTextBackground = self.add.graphics();
            self.updateTextAndBackground(usesTillDepletionText, usesTillDepletionTextBackground, textContent);
            gameState.infoBoxElements.push(usesTillDepletionText, usesTillDepletionTextBackground);
            
            // Cancel the previous timer event if it exists
            if (gameState.usesTillDepletionTimer) {
                gameState.usesTillDepletionTimer.remove();
            }
        
            gameState.usesTillDepletionTimer = self.time.delayedCall(1700, () => {
                gameState.infoBoxElements.forEach(element => {
                    if (element) element.destroy();
                });
                gameState.usesTillDepletionTimer = null;
            });
        }"""



new_code = """if ('usesTillDepletion' in card) {
                const textContent = card.usesTillDepletion > 0 ? `Remaining uses: ${card.usesTillDepletion}` : `Card depleted!`;
                addInfoTextBox(textContent);
            }
        }

        function addInfoTextBox(textContent) {
            gameState.infoBoxElements.forEach(element => {
                if (element) element.destroy();
            })
            gameState.infoBoxElements = [];
            const textConfig = { fontSize: '20px', fill: '#000000' };
            
            let usesTillDepletionText = self.add.text(550, 100, "", textConfig).setOrigin(0.5).setDepth(21);
            let usesTillDepletionTextBackground = self.add.graphics();
            self.updateTextAndBackground(usesTillDepletionText, usesTillDepletionTextBackground, textContent);
            gameState.infoBoxElements.push(usesTillDepletionText, usesTillDepletionTextBackground);
            
            // Cancel the previous timer event if it exists
            if (gameState.usesTillDepletionTimer) {
                gameState.usesTillDepletionTimer.remove();
            }
        
            gameState.usesTillDepletionTimer = self.time.delayedCall(1700, () => {
                gameState.infoBoxElements.forEach(element => {
                    if (element) element.destroy();
                });
                gameState.usesTillDepletionTimer = null;
            });
        }"""


levels = [
    "Level1Fight1", "Level1Fight2", "Level1Fight3",
    "Level2Fight1", "Level2Fight2", "Level2Fight3",
    "Level3Fight1", "Level3Fight2", "Level3Fight3",
    "Level4Fight1", "Level4Fight2", "Level4Fight3",
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

