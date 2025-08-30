class TicTacToeAI {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = '';
        this.gameActive = false;
        this.gameStarted = false;
        this.winningPattern = null;
        this.isAIThinking = false;
        
        // Game symbols
        this.HUMAN = 'O';
        this.AI = 'X';
        
        // Score tracking
        this.scores = {
            playerWins: 0,
            aiWins: 0,
            draws: 0
        };
        
        // Timing constants
        this.AI_THINKING_DELAY = 800;
        this.AI_MOVE_DELAY = 1200;
        
        this.initializeElements();
        this.bindEvents();
        this.loadScores();
        this.updateScoreboard();
        
        // Initialize the board as disabled
        this.gameBoard.classList.add('disabled');
    }
    
    initializeElements() {
        this.gameBoard = document.getElementById('game-board');
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerText = document.getElementById('current-player-text');
        this.aiThinking = document.getElementById('ai-thinking');
        this.gameResult = document.getElementById('game-result');
        this.resultText = document.getElementById('result-text');
        this.resultCelebration = document.getElementById('result-celebration');
        
        // Controls
        this.playerFirstBtn = document.getElementById('player-first-btn');
        this.aiFirstBtn = document.getElementById('ai-first-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.resetStatsBtn = document.getElementById('reset-stats-btn');
        
        // Score elements
        this.playerWinsElement = document.getElementById('player-wins');
        this.aiWinsElement = document.getElementById('ai-wins');
        this.drawsElement = document.getElementById('draws');
        this.totalGamesElement = document.getElementById('total-games');
        this.winRateElement = document.getElementById('win-rate');
        this.playerWinsBar = document.getElementById('player-wins-bar');
        this.aiWinsBar = document.getElementById('ai-wins-bar');
        this.drawsBar = document.getElementById('draws-bar');
    }
    
    bindEvents() {
        // Game start controls
        this.playerFirstBtn.addEventListener('click', () => {
            console.log('Player first clicked');
            this.startGame(this.HUMAN);
        });
        this.aiFirstBtn.addEventListener('click', () => {
            console.log('AI first clicked');
            this.startGame(this.AI);
        });
        this.newGameBtn.addEventListener('click', () => {
            console.log('New game clicked');
            this.resetGame();
        });
        this.resetStatsBtn.addEventListener('click', () => {
            console.log('Reset stats clicked');
            this.resetStats();
        });
        
        // Cell clicks
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => {
                console.log(`Cell ${index} clicked, gameActive: ${this.gameActive}, currentPlayer: ${this.currentPlayer}, cellContent: '${this.board[index]}'`);
                this.handleCellClick(index);
            });
        });
    }
    
    startGame(firstPlayer) {
        console.log(`Starting game, first player: ${firstPlayer}`);
        this.resetBoard();
        this.currentPlayer = firstPlayer;
        this.gameActive = true;
        this.gameStarted = true;
        this.winningPattern = null;
        this.isAIThinking = false;
        
        // Update UI
        this.playerFirstBtn.disabled = true;
        this.aiFirstBtn.disabled = true;
        this.newGameBtn.disabled = false;
        this.gameBoard.classList.remove('disabled');
        this.gameResult.classList.add('hidden');
        this.hideAIThinking();
        
        this.updateGameStatus();
        
        // If AI goes first, make AI move
        if (firstPlayer === this.AI) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    resetGame() {
        console.log('Resetting game');
        this.resetBoard();
        this.gameActive = false;
        this.gameStarted = false;
        this.winningPattern = null;
        this.isAIThinking = false;
        
        // Reset UI
        this.playerFirstBtn.disabled = false;
        this.aiFirstBtn.disabled = false;
        this.newGameBtn.disabled = true;
        this.gameBoard.classList.add('disabled');
        this.gameResult.classList.add('hidden');
        this.hideAIThinking();
        this.currentPlayerText.textContent = 'Choose who goes first!';
    }
    
    resetBoard() {
        this.board = Array(9).fill('');
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
    }
    
    handleCellClick(index) {
        console.log(`Handling cell click: index=${index}, gameActive=${this.gameActive}, board[index]='${this.board[index]}', currentPlayer=${this.currentPlayer}, isAIThinking=${this.isAIThinking}`);
        
        // Check if move is valid
        if (!this.gameActive) {
            console.log('Move rejected: game not active');
            return;
        }
        
        if (this.board[index] !== '') {
            console.log('Move rejected: cell occupied');
            return;
        }
        
        if (this.currentPlayer !== this.HUMAN) {
            console.log('Move rejected: not human turn');
            return;
        }
        
        if (this.isAIThinking) {
            console.log('Move rejected: AI is thinking');
            return;
        }
        
        console.log('Making human move');
        this.makeMove(index, this.HUMAN);
        
        // Check if game is still active after human move
        if (this.gameActive && this.currentPlayer !== this.HUMAN) {
            // Switch to AI turn
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    makeMove(index, player) {
        console.log(`Making move: index=${index}, player=${player}`);
        this.board[index] = player;
        const cell = this.cells[index];
        cell.textContent = player;
        cell.classList.add('occupied', player === this.AI ? 'player-x' : 'player-o');
        
        const result = this.checkGameEnd();
        if (result) {
            console.log(`Game ended with result: ${result}`);
            this.endGame(result);
        } else {
            // Switch turns
            this.currentPlayer = this.currentPlayer === this.HUMAN ? this.AI : this.HUMAN;
            this.updateGameStatus();
        }
    }
    
    makeAIMove() {
        if (!this.gameActive) {
            console.log('AI move cancelled - game not active');
            return;
        }
        
        if (this.isAIThinking) {
            console.log('AI move cancelled - already thinking');
            return;
        }
        
        if (this.currentPlayer !== this.AI) {
            console.log('AI move cancelled - not AI turn');
            return;
        }
        
        console.log('AI starting to think...');
        this.isAIThinking = true;
        this.showAIThinking();
        
        // Add delay to show thinking animation
        setTimeout(() => {
            if (!this.gameActive) {
                console.log('AI move cancelled during thinking - game ended');
                this.isAIThinking = false;
                this.hideAIThinking();
                return;
            }
            
            const availableMoves = this.getAvailableMoves(this.board);
            if (availableMoves.length === 0) {
                console.log('No available moves for AI');
                this.isAIThinking = false;
                this.hideAIThinking();
                return;
            }
            
            const bestMove = this.minimax(this.board, this.AI, true, -Infinity, Infinity).index;
            console.log(`AI chose move: ${bestMove}`);
            
            this.isAIThinking = false;
            this.hideAIThinking();
            this.makeMove(bestMove, this.AI);
            
        }, this.AI_THINKING_DELAY);
    }
    
    // Minimax algorithm with alpha-beta pruning
    minimax(board, player, isMaximizing, alpha, beta) {
        const result = this.checkWinner(board);
        
        // Terminal states
        if (result === this.AI) return { score: 10 };
        if (result === this.HUMAN) return { score: -10 };
        if (this.isBoardFull(board)) return { score: 0 };
        
        const availableMoves = this.getAvailableMoves(board);
        
        if (availableMoves.length === 0) {
            return { score: 0, index: -1 };
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            let bestMove = availableMoves[0];
            
            for (let move of availableMoves) {
                const newBoard = [...board];
                newBoard[move] = this.AI;
                
                const score = this.minimax(newBoard, this.HUMAN, false, alpha, beta).score;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            
            return { score: bestScore, index: bestMove };
        } else {
            let bestScore = Infinity;
            let bestMove = availableMoves[0];
            
            for (let move of availableMoves) {
                const newBoard = [...board];
                newBoard[move] = this.HUMAN;
                
                const score = this.minimax(newBoard, this.AI, true, alpha, beta).score;
                
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            
            return { score: bestScore, index: bestMove };
        }
    }
    
    getAvailableMoves(board) {
        return board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    }
    
    checkGameEnd() {
        const winner = this.checkWinner(this.board);
        if (winner) return winner;
        if (this.isBoardFull(this.board)) return 'draw';
        return null;
    }
    
    checkWinner(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                this.winningPattern = pattern;
                return board[a];
            }
        }
        
        return null;
    }
    
    isBoardFull(board) {
        return board.every(cell => cell !== '');
    }
    
    endGame(result) {
        console.log(`Game ended: ${result}`);
        this.gameActive = false;
        this.isAIThinking = false;
        this.hideAIThinking();
        
        // Highlight winning cells if there's a winner
        if (result !== 'draw' && this.winningPattern) {
            this.winningPattern.forEach(index => {
                this.cells[index].classList.add('winning-cell');
            });
        }
        
        // Update scores
        if (result === this.HUMAN) {
            this.scores.playerWins++;
        } else if (result === this.AI) {
            this.scores.aiWins++;
        } else {
            this.scores.draws++;
        }
        
        this.updateScoreboard();
        this.showGameResult(result);
        
        // Disable board
        this.gameBoard.classList.add('disabled');
    }
    
    showGameResult(result) {
        let message, celebration, className;
        
        if (result === this.HUMAN) {
            message = 'Congratulations! You Won!';
            celebration = '🎉';
            className = 'winner';
        } else if (result === this.AI) {
            message = 'AI Wins! Try Again!';
            celebration = '🤖';
            className = 'loser';
        } else {
            message = 'It\'s a Draw!';
            celebration = '🤝';
            className = 'draw';
        }
        
        this.resultText.textContent = message;
        this.resultText.className = `result-text ${className}`;
        this.resultCelebration.textContent = celebration;
        this.gameResult.classList.remove('hidden');
        
        this.currentPlayerText.textContent = 'Game Over!';
    }
    
    updateGameStatus() {
        if (!this.gameActive || this.isAIThinking) return;
        
        const playerName = this.currentPlayer === this.HUMAN ? 'Your' : 'AI\'s';
        this.currentPlayerText.textContent = `${playerName} Turn`;
    }
    
    showAIThinking() {
        console.log('Showing AI thinking animation');
        this.aiThinking.classList.remove('hidden');
        this.currentPlayerText.textContent = '';
    }
    
    hideAIThinking() {
        console.log('Hiding AI thinking animation');
        this.aiThinking.classList.add('hidden');
    }
    
    updateScoreboard() {
        const totalGames = this.scores.playerWins + this.scores.aiWins + this.scores.draws;
        const winRate = totalGames > 0 ? Math.round((this.scores.playerWins / totalGames) * 100) : 0;
        
        // Update score displays
        this.playerWinsElement.textContent = this.scores.playerWins;
        this.aiWinsElement.textContent = this.scores.aiWins;
        this.drawsElement.textContent = this.scores.draws;
        this.totalGamesElement.textContent = totalGames;
        this.winRateElement.textContent = `${winRate}%`;
        
        // Update progress bars
        if (totalGames > 0) {
            const playerPercent = (this.scores.playerWins / totalGames) * 100;
            const aiPercent = (this.scores.aiWins / totalGames) * 100;
            const drawPercent = (this.scores.draws / totalGames) * 100;
            
            this.playerWinsBar.style.width = `${playerPercent}%`;
            this.aiWinsBar.style.width = `${aiPercent}%`;
            this.drawsBar.style.width = `${drawPercent}%`;
        } else {
            this.playerWinsBar.style.width = '0%';
            this.aiWinsBar.style.width = '0%';
            this.drawsBar.style.width = '0%';
        }
    }
    
    loadScores() {
        // Scores start at 0 for each session
        this.scores = {
            playerWins: 0,
            aiWins: 0,
            draws: 0
        };
    }
    
    resetStats() {
        this.scores = {
            playerWins: 0,
            aiWins: 0,
            draws: 0
        };
        this.updateScoreboard();
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game');
    const game = new TicTacToeAI();
});