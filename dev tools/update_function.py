old_code = """await self.delay(200);
            const gundanIncome = gameState.gundanSeizai ? 1 : 0;
            if (gundanIncome) self.animatePermanent('gundanSeizai');

            const zaibatsuIncome = gameState.zaibatsuMax ? Math.min(gameState.zaibatsuMax, Math.floor(gameState.player.gold * 0.10)) : 0;
            if (zaibatsuIncome) self.animatePermanent('zaibatsuU');
            
            const totalIncome = gundanIncome + zaibatsuIncome;
            if (totalIncome) earnGold(totalIncome);"""



new_code = """await self.delay(600);
            if (gameConfig.attackSound.isPlaying) gameConfig.attackSound.stop();
            
            await self.delay(200);
            if (gameState.gundanSeizai) {
                earnGold(1);
                self.animatePermanent('gundanSeizai');
                zaibatsuDelay = 200;
            }

            await self.delay(zaibatsuDelay);
            const zaibatsuIncome = gameState.zaibatsuMax ? Math.min(gameState.zaibatsuMax, Math.floor(gameState.player.gold * 0.10)) : 0;
            if (zaibatsuIncome) {
                earnGold(zaibatsuIncome);
                self.animatePermanent('zaibatsuU');
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

