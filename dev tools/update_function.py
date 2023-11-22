old_code = """function updatePoison(character) {
            if (character.poison > 0) {
                const newHealth = Math.max(1, character.health - character.poison);
                const lostHP = character.health - newHealth
                const newPoisonText = `-${lostHP} HP from Poison`
                self.updateTextAndBackground(character.poisonText, character.poisonTextBackground, newPoisonText, 7, 20, 0.7);

                character.health = newHealth;
                self.updateHealthBar(character);
                character.poison -= 1;
            }
        };"""


new_code = """function updatePoison(character) {
            if (character.poison > 0) {
                const newHealth = Math.max(1, character.health - character.poison);
                const lostHP = character.health - newHealth
                const newPoisonText = `-${lostHP} HP from Poison`
                self.updateTextAndBackground(character.poisonText, character.poisonTextBackground, newPoisonText, 7, 20, 0.7);

                character.health = newHealth;
                self.updateHealthBar(character);
                character.poison -= 1;
            }
        };

        function animatePermanent(permanentKey) {
            gameState.permanents.forEach(perm => {
                if (perm.card.key === permanentKey) {
                    perm.sprite = perm.tokenSprite;
                    self.powerUpTweens(perm);
                }
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

