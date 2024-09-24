old_code = """await self.delay(400);
            if (gameConfig.attackSound.isPlaying) gameConfig.attackSound.stop();
            await self.delay(200);
            gameConfig.victorySound.play( { volume: 0.8, rate: 1, seek: 0.05 } );
            await self.delay(750);
            gameConfig.musicTheme.play({ loop: true, volume: 0.6, seek: 44.4 });
            await self.delay(300);"""

new_code = """await self.delay(400);
            if (gameConfig.attackSound.isPlaying) gameConfig.attackSound.stop();
            await self.delay(200);
            gameConfig.victorySound.play( { volume: 0.8, rate: 1, seek: 0.05 } );
            await self.delay(780);
            gameConfig.musicTheme.play({ loop: true, volume: 0.6, seek: 44.4 });
            await self.delay(300);"""

levels = [
    "Level1Fight1", "Level1Fight2", "Level1Fight3",
    "Level2Fight1", "Level2Fight2", "Level2Fight3",
    "Level3Fight1", "Level3Fight2", "Level3Fight3",
    "Level4Fight1", "Level4Fight2", "Level4Fight3",
    "basescene", "preload", "mainmenu", "endscene"
]

for level in levels:
    with open(f'src/{level.lower()}.js', 'r') as file:
        content = file.read()

    if content.find(old_code) != -1:
        updated_content = content.replace(old_code, new_code)
        with open(f'src/{level.lower()}.js', 'w') as file:
            file.write(updated_content)
        print(f'Code successfully updated for {level}')
    
    else:
        print(f'Old code not found in {level}')

