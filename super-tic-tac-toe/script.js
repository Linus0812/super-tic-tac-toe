const mainGrid = document.getElementById('main-grid');
let currentPlayer = 'X';
let nextBigBox = null;  // Tracks which big box the player must play in

// Track mini-grid states (null, 'X', 'O' for each mini grid cell)
let miniGrids = Array(9).fill(null).map(() =>
    Array(3).fill(null).map(() => Array(3).fill(null))
);

// Track who won each big box (null, 'X', 'O' for each big box)
let bigBoxWinners = Array(9).fill(null);

// Event listener for clicks on any cell within the grid
mainGrid.addEventListener('click', handleMove);

function updateCurrentPlayer() {
    const playerSymbol = document.getElementById('player-symbol');
    playerSymbol.textContent = currentPlayer;
}

updateCurrentPlayer();
document.getElementById('reset-button').addEventListener('click', resetGame);

function handleMove(event) {
    const target = event.target;
    const bigBoxIndex = parseInt(target.parentElement.dataset.big);

    if (checkMainWin()) {
        return;
    }

    // Check if the next big box is won
    if (nextBigBox !== null && bigBoxWinners[nextBigBox] !== null) {
        nextBigBox = null; // Set nextBigBox to null here
    }

    // If the player tries to play in a big box that is not the next available one, return early
    if (nextBigBox !== null && bigBoxIndex !== nextBigBox) {
        if (bigBoxWinners[bigBoxIndex] !== null) {
            alert("You can play in any big box since this one is already won.");
            nextBigBox = null; // Set nextBigBox to null here
        } else {
            alert("You must play in big box " + (nextBigBox + 1));
            return;
        }
    }
    // If the big box is already won, block the move and set nextBigBox to null
    if (bigBoxWinners[bigBoxIndex] !== null) {
        alert("You cannot play in this big box because it is already won.");
        nextBigBox = null; // Set nextBigBox to null here
        return;
    }

    // If a nextBigBox restriction is in place, check if this move is valid
    if (nextBigBox !== null && bigBoxIndex !== nextBigBox) return;
    
    const miniBoxRow = Math.floor([...target.parentElement.children].indexOf(target) / 3);
    const miniBoxCol = [...target.parentElement.children].indexOf(target) % 3;
    
    // Check if the mini cell is empty before making a move
    if (miniGrids[bigBoxIndex][miniBoxRow][miniBoxCol] !== null) return;
    
    // Place current player's mark in the mini grid
    miniGrids[bigBoxIndex][miniBoxRow][miniBoxCol] = currentPlayer;
    target.textContent = currentPlayer;

// Check if the player won the mini grid
if (checkMiniWin(bigBoxIndex)) {
    document.querySelector(`[data-big="${bigBoxIndex}"]`).classList.add('winner');
    bigBoxWinners[bigBoxIndex] = currentPlayer;
    // Check if the next big box is the won box
    if (nextBigBox === bigBoxIndex) {
        nextBigBox = null; // Set nextBigBox to null here
    }
}

    // Check if the player won the overall game
    if (checkMainWin()) {
        document.getElementById('reset-button').textContent = 'Replay';
        document.getElementById('current-player').textContent = `Player ${currentPlayer} wins!`;
    } else {
        // Set the next big box based on the mini box position played
        nextBigBox = miniBoxRow * 3 + miniBoxCol;

        // Switch players
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

        // Highlight the active big box for the next player
        updateActiveBigBox();
    }
    updateCurrentPlayer();
}

function checkMiniWin(bigBoxIndex) {
    const miniGrid = miniGrids[bigBoxIndex];
    const lastMoveRow = [...miniGrid].findIndex(row => row.includes(currentPlayer));
    const lastMoveCol = miniGrid[lastMoveRow].indexOf(currentPlayer);
    if (checkWin(miniGrid, lastMoveRow, lastMoveCol)) {
        bigBoxWinners[bigBoxIndex] = currentPlayer;
        console.log(`Mini win declared for big box ${bigBoxIndex} by player ${currentPlayer}`);
        // Add the winner class to the big box
        if (bigBoxWinners[bigBoxIndex] === 'X') {
            document.querySelector(`[data-big="${bigBoxIndex}"]`).classList.add('winner', 'X');
        } else if (bigBoxWinners[bigBoxIndex] === 'O') {
            document.querySelector(`[data-big="${bigBoxIndex}"]`).classList.add('winner', 'O');
        }
    }
    console.log(`bigBoxWinners: ${bigBoxWinners}`);
    return checkWin(miniGrid, lastMoveRow, lastMoveCol);
}

function checkMainWin() {
    console.log(`Checking main win for player ${currentPlayer}`);
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let pattern of winPatterns) {
        if (pattern.every(index => bigBoxWinners[index] !== null && bigBoxWinners[index] === currentPlayer)) {
            console.log(`Main win declared for player ${currentPlayer} with pattern ${pattern}`);
            return true;
        }
    }

    console.log(`No main win declared for player ${currentPlayer}`);
    return false;
}

function checkWin(grid, row, col) {
    // Check rows, columns, and diagonals for a win
    const winPatterns = [
        // Rows
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        // Columns
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        // Diagonals
        [0, 4, 8], [2, 4, 6]
    ];

    for (let pattern of winPatterns) {
        if (pattern.includes(row * 3 + col) &&
            grid[Math.floor(pattern[0] / 3)][pattern[0] % 3] === currentPlayer &&
            grid[Math.floor(pattern[1] / 3)][pattern[1] % 3] === currentPlayer &&
            grid[Math.floor(pattern[2] / 3)][pattern[2] % 3] === currentPlayer) {
            return true;
        }
    }

    
    return false;
}

function isMiniGridFull(bigBoxIndex) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (miniGrids[bigBoxIndex][i][j] === null) {
                return false;
            }
        }
    }
    return true;
}

function updateActiveBigBox() {
    console.log('updateActiveBigBox called');
    console.log('nextBigBox:', nextBigBox);
    console.log('bigBoxWinners:', bigBoxWinners);

    // Remove active and available classes from all big boxes
    document.querySelectorAll('.big-box').forEach(box => {
        box.classList.remove('active');
        box.classList.remove('available');
    });

    // If nextBigBox is null, highlight all available big boxes
    if (nextBigBox === null) {
        console.log('Highlighting all available big boxes');
        document.querySelectorAll('.big-box').forEach(box => {
            const bigBoxIndex = parseInt(box.dataset.big);
            if (bigBoxWinners[bigBoxIndex] === null) {
                console.log('Adding available class to big box', bigBoxIndex);
                box.classList.add('available');
            }
        });
    } else {
        // If nextBigBox is won, highlight all available big boxes
        if (bigBoxWinners[nextBigBox] !== null) {
            console.log('Next big box is won, highlighting all available big boxes');
            document.querySelectorAll('.big-box').forEach(box => {
                const bigBoxIndex = parseInt(box.dataset.big);
                if (bigBoxWinners[bigBoxIndex] === null) {
                    console.log('Adding available class to big box', bigBoxIndex);
                    box.classList.add('active');
                }
            });
        } else {
            // Highlight the next active big box
            console.log('Highlighting next active big box');
            document.querySelector(`[data-big="${nextBigBox}"]`).classList.add('active');
        }
    }
}
function resetGame() {
    miniGrids = Array(9).fill(null).map(() =>
        Array(3).fill(null).map(() => Array(3).fill(null))
    );
    bigBoxWinners = Array(9).fill(null);
    document.querySelectorAll('.big-box').forEach(box => {
        box.classList.remove('winner', 'active');
        box.querySelectorAll('div').forEach(cell => (cell.textContent = ''));
    });
    currentPlayer = 'X';
    nextBigBox = null;
    document.getElementById('reset-button').textContent = 'Reset';
    document.getElementById('player-symbol').textContent = currentPlayer;
}
