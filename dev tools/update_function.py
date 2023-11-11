old_code = """return {
                damagePlayed: moshpitMassacreCondition ? 11 : getValueOrInvoke(card.damage),
                firePlayed: kabutuEdoCondition ? 2 * stancePoints : (scorchedSoulCondition ? 13 : getValueOrInvoke(card.fire)),
                stancePointsPlayed: kabutuEdoCondition && isLastEnemy ? -1 : getValueOrInvoke(card.stancePoints),
                poisonPlayed: bladesBlightCondition ? target.poison : getValueOrInvoke(card.poison) + rottenResonanceOutcome,
                healPlayed: getValueOrInvoke(card.heal),
                strengthPlayed: getValueOrInvoke(card.strength),
                armorPlayed: knuckleFistEdoCondition ? - stancePoints : getValueOrInvoke(card.armor),
                reduceTargetArmorPlayed: steelToeCondition ? steelToeOutcome : getValueOrInvoke(card.reduceTargetArmor),
                reduceTargetStrengthPlayed: roninsRotCondition ? target.poison : getValueOrInvoke(card.reduceTargetStrength),
                drawCardPlayed: getValueOrInvoke(card.drawCard),
                poisonRemovePlayed: getValueOrInvoke(card.poisonRemove)
            };"""

new_code = """return {
                damagePlayed: moshpitMassacreCondition ? 11 : getValueOrInvoke(card.damage),
                firePlayed: kabutuEdoCondition ? 4 : (scorchedSoulCondition ? 13 : getValueOrInvoke(card.fire)),
                stancePointsPlayed: kabutuEdoCondition && isLastEnemy ? -1 : getValueOrInvoke(card.stancePoints),
                poisonPlayed: bladesBlightCondition ? target.poison : getValueOrInvoke(card.poison) + rottenResonanceOutcome,
                healPlayed: getValueOrInvoke(card.heal),
                strengthPlayed: getValueOrInvoke(card.strength),
                armorPlayed: knuckleFistEdoCondition ? 2 : getValueOrInvoke(card.armor),
                reduceTargetArmorPlayed: steelToeCondition ? steelToeOutcome : getValueOrInvoke(card.reduceTargetArmor),
                reduceTargetStrengthPlayed: roninsRotCondition ? target.poison : getValueOrInvoke(card.reduceTargetStrength),
                drawCardPlayed: getValueOrInvoke(card.drawCard),
                poisonRemovePlayed: getValueOrInvoke(card.poisonRemove)
            };"""

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



    