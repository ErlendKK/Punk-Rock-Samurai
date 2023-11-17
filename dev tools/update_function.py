old_code = """const zaibatsuUndergroundIncome = gameState.zaibatsuUnderground ? Math.min(4, Math.floor(gameState.player.gold * 0.12)) : 0;"""


new_code = """const zaibatsuUndergroundIncome = gameState.zaibatsuUnderground ? Math.min(3, Math.floor(gameState.player.gold * 0.10)) : 0;"""

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

