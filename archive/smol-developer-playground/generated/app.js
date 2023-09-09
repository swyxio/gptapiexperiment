let board = Array(9).fill(null);
let currentPlayer = 'X';

const turnMessage = "Player X's turn";
const winMessage = "Player X wins";
const drawMessage = "It's a draw";

function initializeGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    document.getElementById('status').textContent = turnMessage.replace('X', currentPlayer);
    for(let i = 0; i < 9; i++){
        document.getElementById(`cell-${i}`).textContent = '';
    }
}

function handleClick(cellId) {
    const index = parseInt(cellId.split('-')[1]);
    if(!board[index]){
        board[index] = currentPlayer;
        document.getElementById(cellId).textContent = currentPlayer;
        if(checkWin()){
            document.getElementById('status').textContent = winMessage.replace('X', currentPlayer);
        } else if(checkDraw()){
            document.getElementById('status').textContent = drawMessage;
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            document.getElementById('status').textContent = turnMessage.replace('X', currentPlayer);
        }
    }
}

function checkWin() {
    const winCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    return winCombinations.some(combination => combination.every(index => board[index] === currentPlayer));
}

function checkDraw() {
    return board.every(cell => cell !== null);
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

document.getElementById('restart').addEventListener('click', initializeGame);
for(let i = 0; i < 9; i++){
    document.getElementById(`cell-${i}`).addEventListener('click', () => handleClick(`cell-${i}`));
}

initializeGame();