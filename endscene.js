function updateLeaderboard(username, score) {
    let leaderboardUrl = `http://dreamlo.com/lb/CBGhFikNak2i8KjH3UPThAfGJFnWo9A0O8mjvU19hS2Q/add/${username}/${score}`;

    fetch(leaderboardUrl)
        .then(response => response.text())
        .then(data => console.log(data))
        .catch( (error) => {
            console.error('Error:', error);
        })    
}

class Endscene extends Phaser.Scene {
    constructor() {
        super('Endscene');
    }

    async getTopScores() {
        try {
            const response = await fetch('http://dreamlo.com/lb/64c442f28f40bb8380e27ce7/json');
            
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard data');
            }
        
            const data = await response.json();
            let scores = data.dreamlo.leaderboard.entry;
            scores.sort((a, b) => b.score - a.score);
            return scores.slice(0, 5);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    preload() {
        this.load.image('endscene', 'assets/images/endscene.jpg');
    }

    create() {
        self = this;
        this.cameras.main.fadeIn(800, 0, 0, 0);
        this.input.keyboard.createCursorKeys();
        this.add.image(550,320, 'endscene').setScale(0.95).setOrigin(0.5, 0.5).on('pointerup', () => returnToMenu() );
        this.add.text(550, 110, '    Thanks for playing\nPunk Rock Samurai alpha v1.1', { fontSize: '57px', fill: '#a9a9a9', fontFamily: 'Rock Kapak' }).setOrigin(0.5, 0.5);
        
        gameState.score.totalScore = gameState.score.levelsCompleted > 0 ? gameState.score.levelsCompleted * ( 15 + Math.max(0, 7 - gameState.score.numberOfTurns / gameState.score.levelsCompleted) ): 0;

        let labels = {
            numberOfTurns: "Number of turns played",
            levelsCompleted: "Number of fights won",
            damageTaken: "Total damage taken",
            damageDealt: "Total damage dealt",
            totalScore: 'Your score'
        };
        
        let x = 280;
        let y = 200;
        let spacing = 20;
        
        async function displayLeaderBoard() {
            try {
                console.log(`displayLeaderBoard called`)
                let topScores = await self.getTopScores();
            
                const leaderboardBackground = self.add.graphics();
                leaderboardBackground.fillStyle(0xFFFFFF, 1).setAlpha(0.80); 
                leaderboardBackground.fillRect(x, y, 540, 420);

                self.add.text(x + 50, y + 50, 'Your Results', { fontSize: '25px', fill: '#000000' }).setOrigin(0);

                Object.entries(gameState.score).forEach(([key, value]) => {
                    console.log(`${key}: ${value}`);
                
                    if (labels[key]) { // if there is a matching label for the key
                        let text = `${labels[key]}: ${value}`;
                        self.add.text(x + 50, y + 90, text, { color: '#000', fontSize: '16px' });
                        y += spacing;
                    }
                })
                
                self.add.text(x + 50, y + 150, 'Leaderboard', { fontSize: '25px', fill: '#000000' }).setOrigin(0);
                if (topScores) {
                    topScores.forEach((score, index) => {
                        let dateOnly = score.date.split(' ')[0];  // Splitting the date string and keeping only the first part
                        let displayedScore = self.add.text(x + 50, y + 190, `${index + 1}. Name: ${score.name}, Score: ${score.score}, Date: ${dateOnly}`, { fontSize: '16px', fill: '#000000' }).setOrigin(0);
                        sceneState.displayedScoreArray.push(displayedScore);
                        y += spacing;
                    });
                } else {
                    self.add.text(x + 50, y + 190, 'Leaderboard is down for maintenance', { fontSize: '16px', fill: '#000000' }).setOrigin(0);
                }

            }  catch (error) {
                console.error("Error in displayLeaderBoard: ", error);
                self.add.text(x + 50, y + 190, 'Leaderboard is down for maintenance', { fontSize: '16px', fill: '#FF0000' }).setOrigin(0);
            }
        }

        function returnToMenu() {
            console.log(`returnto meny called`)
            self.cameras.main.shake(1500, .0015, false);
            self.cameras.main.flash(350);

            self.time.delayedCall(500, () => {
                self.cameras.main.fadeOut(1000);
                location.reload();
            })
        }
        
        if (gameState.playerName != 'admin') {
            updateLeaderboard(gameState.playerName, gameState.score.totalScore);
        }

        self.time.delayedCall(300, () => {  // Give time for leaderboard to update with players score  
            displayLeaderBoard();
         })

         self.time.delayedCall(7000, () => {
            console.log(`timeout`)
            returnToMenu() 
        }) 
         
   
    }; // End of create()
    
}; // End of scene