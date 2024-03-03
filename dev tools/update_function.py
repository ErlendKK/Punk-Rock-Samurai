old_code = """// Pointerover handler for token sprites
        function displayTokenCard(card) {
            card.tokenSprite.on('pointerover', function() {
                // Inform the player about the number of remaining available slots
                const numberOfSlots = gameState.permanentSlots.length;
                const numOfAvailableSlots = gameState.permanentSlots.filter(slot => slot.available === true).length;
                addInfoTextBox(`Available Permanent Slots: ${numOfAvailableSlots} / ${numberOfSlots}`, 2200);

                gameConfig.cardsDealtSound.play({ volume: 1.5, seek: 0.10 });
                card.permanentCardSprite = self.add.image(825, 450, card.key).setScale(0.83).setDepth(220);
            });
            card.tokenSprite.on('pointerout', function() {
                card.permanentCardSprite.destroy();
            });
        }"""


new_code = """// Pointerover handler for token sprites
        function displayTokenCard(card) {
            card.tokenSprite.on('pointerover', function() {
                // Inform the player about the number of remaining available slots
                const numberOfSlots = gameState.permanentSlots.length;
                const numOfAvailableSlots = gameState.permanentSlots.filter(slot => slot.available === true).length;
                addInfoTextBox(`Available Permanent Slots: ${numOfAvailableSlots} / ${numberOfSlots}`, 2000);

                gameConfig.cardsDealtSound.play({ volume: 1.5, seek: 0.10 });
                card.permanentCardSprite = self.add.image(825, 450, card.key).setScale(0.83).setDepth(220);
            });
            card.tokenSprite.on('pointerout', function() {
                card.permanentCardSprite.destroy();
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

