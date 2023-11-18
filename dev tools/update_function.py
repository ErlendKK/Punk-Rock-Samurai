old_code = """function initiateVictory() {
            gameState.score.numberOfTurns += gameState.turn;
            gameState.score.levelsCompleted += 1;
            gameConfig.music.stop();
            self.updateManaBar(gameState.player);
            addHandtoDeck();
            gameState.characters.forEach(char => fadeOutGameObject(char.sprite, 200));

            gameState.deck.forEach(card => {
                if (card.usedOneShot) {
                    card.usedOneShot = false;
                }
                if (card.type === 'debuff') {
                    gameState.deck = gameState.deck.filter(c => c != card);
                }
                if (card.key === 'riotRonin') {
                    card.goldCost = 0;
                }    
            });
            
            const gundanSeizaiIncome = gameState.gundanSeizai ? 1 : 0;
            const zaibatsuUndergroundIncome = gameState.zaibatsuUnderground ? Math.min(3, Math.floor(gameState.player.gold * 0.10)) : 0;
            const totalIncome = gundanSeizaiIncome + zaibatsuUndergroundIncome;

            self.time.delayedCall(600, () => {
                if (gameConfig.attackSound.isPlaying) {
                    gameConfig.attackSound.stop();
                }
                if (totalIncome) {
                    earnGold(totalIncome);
                }
                gameConfig.victorySound.play( { volume: 0.9, rate: 1, seek: 0.05 } );
                self.clearBoard();
            });
        
            if (gameState.actionText) fadeOutGameObject(gameState.actionText, 200);
            if (gameState.actionTextBackground) fadeOutGameObject(gameState.actionTextBackground, 200);
            gameState.actionTextObjects.forEach(obj => fadeOutGameObject(obj, 200));

            const victoryTextConfig = { fontSize: '100px', fill: '#ff0000', fontFamily: 'Rock Kapak' };
            let victoryText = self.add.text(550, 300, "Victory!", victoryTextConfig).setOrigin(0.5).setDepth(21);
            const { level, fight } = self.extractLevelFightFromName(self.scene.key);
            const delayTime = fight === 3 ? 3000 : 100;
            const levelCompleteText = fight === 3 ? `You have cleared Level ${level}\nHealth is resorted to ${gameState.player.healthMax}/${gameState.player.healthMax}` : "";
            
            self.time.delayedCall(1600, () => {
                gameConfig.musicTheme.play( { loop: true, volume: 0.30 } );
                victoryText.setText(levelCompleteText);
                victoryText.setStyle({
                    fontSize: '60px',
                    // fontFamily: 'Arial',
                });

                self.time.delayedCall(delayTime, () => {
                    victoryText.destroy();
                    chooseReward();
                })
            })
        }"""


new_code = """async function initiateVictory() { // NB! Modified for level 2-2
            gameState.score.numberOfTurns += gameState.turn;
            gameState.score.levelsCompleted += 1;
            gameConfig.music.stop();
            self.updateManaBar(gameState.player);
            addHandtoDeck();
            
            if (gameState.actionText) fadeOutGameObject(gameState.actionText, 200);
            if (gameState.actionTextBackground) fadeOutGameObject(gameState.actionTextBackground, 200);
            gameState.actionTextObjects.forEach(obj => fadeOutGameObject(obj, 200));
            gameState.characters.forEach(char => fadeOutGameObject(char.sprite, 200));

            gameState.deck.forEach(card => {
                if (card.usedOneShot) {
                    card.usedOneShot = false;
                }
                if (card.type === 'debuff') {
                    gameState.deck = gameState.deck.filter(c => c != card);
                }
                if (card.key === 'riotRonin') {
                    card.goldCost = 0;
                }    
            });

            await self.delay(600);
            if (gameConfig.attackSound.isPlaying) gameConfig.attackSound.stop();

            await self.delay(200);
            const gundanSeizaiIncome = gameState.gundanSeizai ? 1 : 0;
            const zaibatsuUndergroundIncome = gameState.zaibatsuUnderground ? Math.min(3, Math.floor(gameState.player.gold * 0.10)) : 0;
            const totalIncome = gundanSeizaiIncome + zaibatsuUndergroundIncome;
            if (totalIncome) earnGold(totalIncome);
            
            if (gameState.gundanSeizai || gameState.zaibatsuUnderground) {
                gameState.permanents.forEach(perm => {
                    if (perm.card.key === 'gundanSeizai' || perm.card.key === 'zaiUnderground') {
                        perm.sprite = perm.tokenSprite;
                        self.powerUpTweens(perm);
                    }
                });
            }
            
            gameConfig.victorySound.play( { volume: 0.9, rate: 1, seek: 0.05 } );
            self.clearBoard();

            const victoryTextConfig = { fontSize: '100px', fill: '#ff0000', fontFamily: 'Rock Kapak' };
            let victoryText = self.add.text(550, 300, "Victory!", victoryTextConfig).setOrigin(0.5).setDepth(21);
            const { level, fight } = self.extractLevelFightFromName(self.scene.key);
            const levelCompleteText = fight === 3 ? `You have completed Level ${level}\nHealth is resorted to Health Max` : "";
            
            const delayBeforeRemoveText = totalIncome ? 1500 : 1200;
            self.time.delayedCall(delayBeforeRemoveText, () => {
                gameConfig.musicTheme.play( { loop: true, volume: 0.30 } );
                victoryText.setText(levelCompleteText);
                victoryText.setStyle({fontSize: '60px'});

                const delayBeforeEndFight = fight === 3 ? 3000 : 100;
                self.time.delayedCall(delayBeforeEndFight, () => {
                    victoryText.destroy();
                    chooseReward();
                })
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

