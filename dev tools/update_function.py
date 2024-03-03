old_code = """const textConfig = { fontSize: '60px', fill: '#000000' };
            let currentText = ``;
            const delay = 50;
            gameState.shopWelcomeText = self.add.text(825, 90, currentText, textConfig).setOrigin(0.5)
            gameState.shopTextBackground = self.add.graphics();
        
            // Loop based on the length of the text
            for (let i = 0; i < fullText.length; i++) {
                self.time.delayedCall(i * delay, () => {
                    currentText += fullText.charAt(i);
                    gameState.shopWelcomeText.setText(currentText);
                    self.updateTextAndBackground(gameState.shopWelcomeText, 
                        gameState.shopTextBackground, currentText, 7, 201
                    );
                });
            }
        }"""


new_code = """const textConfig = { fontSize: '60px', fill: '#000000' };
            let currentText = ``;
            const delay = 50;
            gameState.shopWelcomeText = self.add.text(825, 90, currentText, textConfig).setOrigin(0.5)
            gameState.shopTextBackground = self.add.graphics();
        
            // Loop based on the length of the text
            for (let i = 0; i < fullText.length; i++) {
                self.time.delayedCall(i * delay, () => {
                    // Try/catch => no crash if the player exits the shop during text generation
                    try {
                        if (!gameState.shopWelcomeText) return; 
                        currentText += fullText.charAt(i);
                        gameState.shopWelcomeText.setText(currentText);
                        self.updateTextAndBackground(gameState.shopWelcomeText, 
                            gameState.shopTextBackground, currentText, 7, 201
                        );
                    } catch (error) {
                        return;
                    }
                });
            }
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

