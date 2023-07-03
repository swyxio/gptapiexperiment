// Variables
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let ball = { x: 200, y: 200, dx: 2, dy: 2, radius: 10, color: 'red' };
let playerPaddle = { x: 0, y: 150, width: 10, height: 100, dy: 2, color: 'yellow' };
let aiPaddle = { x: 390, y: 150, width: 10, height: 100, dy: 2, color: 'yellow' };
let playerScore = 0;
let aiScore = 0;
let gameState = { running: true, paused: false, over: false };

// Functions
function init() {
    canvas.width = 400;
    canvas.height = 400;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function update() {
    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Collision detection
    if(ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Player paddle movement
    if(window.event && window.event.keyCode == 38 && playerPaddle.y > 0) { // Up Arrow
        playerPaddle.y -= playerPaddle.dy;
    } else if(window.event && window.event.keyCode == 40 && playerPaddle.y + playerPaddle.height < canvas.height) { // Down Arrow
        playerPaddle.y += playerPaddle.dy;
    }

    // AI paddle movement
    if(ball.y < aiPaddle.y && aiPaddle.y > 0) {
        aiPaddle.y -= aiPaddle.dy;
    } else if(ball.y > aiPaddle.y + aiPaddle.height && aiPaddle.y + aiPaddle.height < canvas.height) {
        aiPaddle.y += aiPaddle.dy;
    }

    // Ball and paddle collision
    if(ball.dx < 0 && ball.x - ball.radius < playerPaddle.x + playerPaddle.width && ball.y > playerPaddle.y && ball.y < playerPaddle.y + playerPaddle.height) {
        ball.dx *= -1;
    } else if(ball.dx > 0 && ball.x + ball.radius > aiPaddle.x && ball.y > aiPaddle.y && ball.y < aiPaddle.y + aiPaddle.height) {
        ball.dx *= -1;
    }

    // Scoring
    if(ball.x + ball.radius < 0) {
        aiScore += 1;
        ball.x = 200;
        ball.y = 200;
    } else if(ball.x - ball.radius > canvas.width) {
        playerScore += 1;
        ball.x = 200;
        ball.y = 200;
    }

    // Game over
    if(playerScore == 10 || aiScore == 10) {
        gameState.over = true;
        gameState.running = false;
    }
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();

    // Draw paddles
    ctx.fillStyle = playerPaddle.color;
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    ctx.fillStyle = aiPaddle.color;
    ctx.fillRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);

    // Draw scores
    ctx.font = '20px Arial';
    ctx.fillText(playerScore, canvas.width / 2 - 50, 50);
    ctx.fillText(aiScore, canvas.width / 2 + 50, 50);
}

function gameLoop() {
    if(gameState.running) {
        update();
        render();
    } else if(gameState.over) {
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    }

    requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener('keydown', function(e) {
    window.event = e;
});

window.onload = function() {
    init();
    gameLoop();
};
