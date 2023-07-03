The application will be structured as follows:

1. **index.html**: This is the main HTML file that will set up the game environment. It will include a canvas element (with id 'gameCanvas'), and two div elements for the player's score (id 'playerScore') and AI's score (id 'aiScore'). It will also include links to the CSS and JavaScript files.

2. **styles.css**: This file will contain the styles for the game. It will include styles for the body (to center the canvas), the canvas (dimensions, border), the paddles and the ball (sizes, colors), and the score elements (positions, colors, fonts).

3. **main.js**: This is the main JavaScript file that will handle the game logic. It will include variables for the canvas, context, ball, paddles, scores, and game state. It will also include functions for initializing the game, updating the game state, rendering the game state, handling input, and running the game loop.

Here are the detailed descriptions:

- **index.html**
  - Elements:
    - Canvas: id = 'gameCanvas'
    - Score displays: id = 'playerScore', 'aiScore'

- **styles.css**
  - Styles:
    - body: centering the canvas
    - #gameCanvas: setting dimensions to 400x400px, border
    - .paddle: setting length to 100px, color to yellow
    - .ball: setting size to small, color to red
    - #playerScore, #aiScore: setting positions, colors, fonts

- **main.js**
  - Variables:
    - canvas: the canvas element
    - ctx: the 2D context for the canvas
    - ball: object with properties for position, velocity, radius, and color
    - playerPaddle, aiPaddle: objects with properties for position, velocity, length, and color
    - playerScore, aiScore: variables for the player's and AI's scores
    - gameState: object with properties for whether the game is running, paused, or over
  - Functions:
    - init(): initializes the game
    - update(): updates the game state
    - render(): renders the game state
    - handleInput(): handles keyboard input
    - gameLoop(): runs the game loop
  - Message names:
    - "Game Over": when the game ends
    - "Player Score": when the player scores a point
    - "AI Score": when the AI scores a point

This application doesn't use any data schemas as it's a simple game and doesn't require complex data structures or databases. The game state is stored in simple variables and objects in the JavaScript code. It doesn't use the import and export keywords as they're not supported in all browsers, and the application is meant to run in Chrome.