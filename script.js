const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let food = { x: 15, y: 15 };
let fruit = { x: 5, y: 5 }; // Fruta
let score = 0;
let gameSpeed = 150; // Velocidade inicial mais lenta
let interval = null; // Mudar para null para que o jogo não inicie automaticamente
let gameRunning = false;

const eatSound = new Audio('eat.mp3'); // Som de comer
const collisionSound = new Audio('collision.mp3'); // Som de colisão
const startSound = new Audio('start.mp3'); // Som de início

// Carregar imagem da maçã
const fruitImage = new Image();
fruitImage.src = 'maça.png';

document.addEventListener('keydown', changeDirection);
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('pauseButton').addEventListener('click', pauseGame);

// Reproduzir o som de início quando a página for carregada
window.addEventListener('load', () => {
    startSound.play();
});

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        interval = setInterval(gameLoop, gameSpeed);
        document.getElementById('title').style.display = 'none'; // Ocultar o título
    }
}

function pauseGame() {
    if (gameRunning) {
        gameRunning = false;
        clearInterval(interval);
    }
}

function gameLoop() {
    moveSnake();
    checkCollisionWithFood();
    checkCollisionWithFruit(); // Verifica colisão com a fruta
    checkCollisionWithWalls();
    checkCollisionWithSelf();
    drawGame();
}

function moveSnake() {
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        score++;
        document.getElementById('score').textContent = `Score: ${score}`;
        eatSound.play(); // Reproduzir som ao comer a comida

        adjustSpeed(); // Ajustar a velocidade com base na pontuação
    } else {
        snake.pop();
    }
}

function checkCollisionWithFood() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        snake.push({});
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        score++;
        document.getElementById('score').textContent = `Score: ${score}`;
        eatSound.play(); // Reproduzir som ao comer a comida

        adjustSpeed(); // Ajustar a velocidade com base na pontuação
    }
}

function checkCollisionWithFruit() {
    if (snake[0].x === fruit.x && snake[0].y === fruit.y) {
        // Aumenta o tamanho da cobra e a pontuação
        snake.push({});
        fruit = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        score += 3; // Aumenta mais a pontuação para a fruta
        document.getElementById('score').textContent = `Score: ${score}`;
        eatSound.play(); // Reproduzir som ao comer a fruta
    }
}

function checkCollisionWithWalls() {
    if (snake[0].x < 0 || snake[0].x >= tileCount || snake[0].y < 0 || snake[0].y >= tileCount) {
        collisionSound.play(); // Reproduzir som ao colidir com as bordas
        resetGame();
    }
}

function checkCollisionWithSelf() {
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            collisionSound.play(); // Reproduzir som ao colidir com o próprio corpo
            resetGame();
        }
    }
}

function drawGame() {
    ctx.fillStyle = '#333'; // Cor de fundo escura
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar a comida usando a imagem
    ctx.drawImage(fruitImage, fruit.x * gridSize, fruit.y * gridSize, gridSize, gridSize);

    // Desenhar a comida normal usando a imagem
    ctx.drawImage(fruitImage, food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    // Desenhar a cobra com um efeito de brilho
    snake.forEach((segment, index) => {
        const gradient = ctx.createRadialGradient(
            segment.x * gridSize + gridSize / 2, 
            segment.y * gridSize + gridSize / 2, 
            gridSize / 4, 
            segment.x * gridSize + gridSize / 2, 
            segment.y * gridSize + gridSize / 2, 
            gridSize / 2
        );
        gradient.addColorStop(0, 'lime');
        gradient.addColorStop(1, 'darkgreen');

        ctx.beginPath();
        ctx.arc(segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    });
}

function changeDirection(event) {
    const { key } = event;
    if (key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -1 };
    if (key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: 1 };
    if (key === 'ArrowLeft' && direction.x === 0) direction = { x: -1, y: 0 };
    if (key === 'ArrowRight' && direction.x === 0) direction = { x: 1, y: 0 };
}

function adjustSpeed() {
    // Aumenta a velocidade a cada 5 pontos, começando do 10
    if (score >= 5 && score % 5 === 0) {
        gameSpeed = Math.max(50, gameSpeed - 10); // Não deixar a velocidade abaixo de 50ms
        clearInterval(interval);
        interval = setInterval(gameLoop, gameSpeed);
    }
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    food = { x: 15, y: 15 };
    fruit = { x: 5, y: 5 }; // Reposicionar a fruta
    score = 0;
    gameSpeed = 150; // Voltar à velocidade inicial
    clearInterval(interval);
    interval = null; // Pausar o jogo
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('title').style.display = 'block'; // Mostrar o título
}
