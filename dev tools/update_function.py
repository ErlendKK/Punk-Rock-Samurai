old_code = """function updateStrengthAndArmor(character) { 
            let strengthBushido = 0

            if (gameState.endOfTurnButtonPressed) {
                character.armor = Math.min(character.armorMax, character.armorBase + character.armorCard + character.armorStance);
                strengthBushido = gameState.bushido ? Math.floor(character.armor / 4) : 0; // Account for Bushido
                
                character.strength = Math.min(
                    character.strengthMax, character.strengthBase + character.strengthStance + strengthBushido
                );
            
            } else {
                character.armor = Math.min(character.armorMax, character.armorBase + character.armorCard);
                strengthBushido = gameState.bushido ? Math.floor(character.armor / 4) : 0; // Account for Bushido
                
                character.strength = Math.min(
                    character.strengthMax, character.strengthBase + character.strengthStance + character.strengthCard + strengthBushido
                ); 
            }

            if (gameState.kamishimoUberAlles > 0 && gameState.player.stancePoints < 0) { // Adjust for Strength tokens
                
                character.strength = Math.min(
                    character.strengthMax, character.strength - gameState.player.stancePoints * gameState.kamishimoUberAlles
                );
            }

            updateStats(character)
        }"""

new_code = """function updateStrengthAndArmor(character) { 
            let strengthBushido = 0

            if (gameState.endOfTurnButtonPressed) {
                character.armor = Math.min(character.armorMax, character.armorBase + character.armorCard + character.armorStance);
                strengthBushido = gameState.bushido ? Math.floor(character.armor / 4) : 0; // Account for Bushido
                character.strength = Math.min(character.strengthMax, character.strengthBase + character.strengthStance + strengthBushido);
            
            } else {
                character.armor = Math.min(character.armorMax, character.armorBase + character.armorCard);
                strengthBushido = gameState.bushido ? Math.floor(character.armor / 4) : 0; // Account for Bushido
                character.strength = Math.min(character.strengthMax, character.strengthBase + character.strengthStance + character.strengthCard + strengthBushido); 
            }

            if (gameState.kamishimoUberAlles && gameState.player.stancePoints < 0) { // Adjust for Strength tokens
                character.strength = Math.min(character.strengthMax, character.strength - gameState.player.stancePoints * gameState.kamishimoUberAlles);
            }

            if (gameState.shogunsShellCondition && gameState.player.stancePoints < 0) { //Account for Shogun's Shell
                character.armor = Math.min(character.armorMax, character.armor - gameState.player.stancePoints * gameState.shogunsShellCondition);
            }

            updateStats(character)
        }"""

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



    