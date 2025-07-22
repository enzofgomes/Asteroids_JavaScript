// js/main.js

import { Player } from './player.js';
import { Projectile } from './projectile.js';
import { Asteroid } from './asteroid.js';
import { circleCollision, circleTriangleCollision } from './collisionUtils.js';
import { getRandomPowerUp } from './powerup.js';
import { AudioPool } from './audioPool.js';
import {
    ROTATIONAL_SPEED, FRICTION, PROJECTILE_SPEED, ASTEROID_SPEED,
    SHOOT_COOLDOWN, STAR_COUNT, ASTEROID_MIN_INTERVAL, ASTEROID_DECREASE_STEP,
    POWER_UP_SIZE
} from './gameConstants.js'; // Removed SPEED from this import

// Select the canvas element from the HTML
const canvas = document.querySelector('canvas');
// Get the 2D drawing context for the canvas
const ctx = canvas.getContext('2d');

// Set the canvas size to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Declare and manage SPEED directly in main.js
let currentGlobalSpeed = 1.60; // This is the dynamic speed value
const initialPlayerSpeed = currentGlobalSpeed; // This is the permanent base speed


// Create the player in the center of the screen
const player = new Player({
    position: { x: canvas.width / 2, y: canvas.height / 2 },
    velocity: { x: 0, y: 0 },
    ctx: ctx, // Pass ctx to Player
    canvas: canvas // Pass canvas to Player for boundary checks
});

// Object to keep track of which keys are pressed
const keys = {
    w: { pressed: false },
    a: { pressed: false },
    d: { pressed: false },
};

// Arrays to store projectiles and asteroids
const projectiles = [];
const asteroids = [];

// Create an array to store stars
const stars = [];
for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5 // random small radius
    });
}

// Timer and dynamic difficulty variables
let timeElapsed = 0;
const timerDiv = document.getElementById('timer');
let timerInterval;
let asteroidSpawnInterval = 2500; // Start at 2500ms

function startTimerAndDifficulty() {
    if (timerInterval) clearInterval(timerInterval);
    timeElapsed = 0;
    asteroidSpawnInterval = 2500;
    timerDiv.textContent = 'Time: 0s';
    timerInterval = setInterval(() => {
        timeElapsed++;
        timerDiv.textContent = `Time: ${timeElapsed}s`;
        if (asteroidSpawnInterval > ASTEROID_MIN_INTERVAL) {
            asteroidSpawnInterval = Math.max(ASTEROID_MIN_INTERVAL, asteroidSpawnInterval - ASTEROID_DECREASE_STEP);
        }
    }, 1000);
}

// Create asteroids at dynamic intervals
let asteroidIntervalId;
function scheduleNextAsteroid() {
    spawnAsteroid();
    asteroidIntervalId = setTimeout(scheduleNextAsteroid, asteroidSpawnInterval);
}
function startAsteroidInterval() {
    if (asteroidIntervalId) clearTimeout(asteroidIntervalId);
    asteroidIntervalId = setTimeout(scheduleNextAsteroid, asteroidSpawnInterval);
}
function spawnAsteroid() {
    const index = Math.floor(Math.random() * 8); // Now 8 spawn points (4 edges + 4 corners)
    let x, y;
    let vx, vy;
    let radius = 50 * Math.random() + 10;
    switch (index) {
        case 0: // left side of the screen
            x = 0 - radius;
            y = Math.random() * canvas.height;
            vx = 1 * ASTEROID_SPEED;
            vy = 0;
            break;
        case 1: // bottom side of the screen
            x = Math.random() * canvas.width;
            y = canvas.height + radius;
            vx = 0;
            vy = -1 * ASTEROID_SPEED;
            break;
        case 2: // right side of the screen
            x = canvas.width + radius;
            y = Math.random() * canvas.height;
            vx = -1 * ASTEROID_SPEED;
            vy = 0;
            break;
        case 3: // top side of the screen
            x = Math.random() * canvas.width;
            y = 0 - radius;
            vx = 0;
            vy = 1 * ASTEROID_SPEED;
            break;
        case 4: // top-left corner
            x = 0 - radius;
            y = 0 - radius;
            vx = 1 * ASTEROID_SPEED;
            vy = 1 * ASTEROID_SPEED;
            break;
        case 5: // top-right corner
            x = canvas.width + radius;
            y = 0 - radius;
            vx = -1 * ASTEROID_SPEED;
            vy = 1 * ASTEROID_SPEED;
            break;
        case 6: // bottom-left corner
            x = 0 - radius;
            y = canvas.height + radius;
            vx = 1 * ASTEROID_SPEED;
            vy = -1 * ASTEROID_SPEED;
            break;
        case 7: // bottom-right corner
            x = canvas.width + radius;
            y = canvas.height + radius;
            vx = -1 * ASTEROID_SPEED;
            vy = -1 * ASTEROID_SPEED;
            break;
    }
    asteroids.push(
        new Asteroid({
            position: { x: x, y: y },
            velocity: { x: vx, y: vy },
            radius,
            ctx: ctx // Pass ctx to Asteroid
        })
    );
}
// Start both on game start
startTimerAndDifficulty();
startAsteroidInterval();

// Power-up variables (these remain in main.js as they manage temporary game state)
let powerUp = null;
let powerUpIntervalId;
let powerUpPulseTime = 0;

let currentPowerUp = null;
let powerUpTimeout = null;
let isInvincible = false;
let shotgunActive = false;
let speedBoostActive = false;


function spawnPowerUp() {
    const x = Math.random() * (canvas.width - POWER_UP_SIZE * 2) + POWER_UP_SIZE;
    const y = Math.random() * (canvas.height - POWER_UP_SIZE * 2) + POWER_UP_SIZE;
    powerUp = { x, y };
}

function drawPowerUp() {
    if (!powerUp) return;
    ctx.save();
    // Calculate pulsating size
    powerUpPulseTime += 0.08;
    const pulse = Math.sin(powerUpPulseTime) * 4; // Pulsate by ±4px
    const size = POWER_UP_SIZE + pulse;
    ctx.beginPath();
    ctx.moveTo(powerUp.x, powerUp.y - size);
    ctx.lineTo(powerUp.x - size, powerUp.y + size);
    ctx.lineTo(powerUp.x + size, powerUp.y + size);
    ctx.closePath();
    ctx.fillStyle = 'purple';
    ctx.fill();
    ctx.restore();
}

function startPowerUpInterval() {
    if (powerUpIntervalId) clearInterval(powerUpIntervalId);
    spawnPowerUp();
    powerUpIntervalId = setInterval(spawnPowerUp, 12000);
}
startPowerUpInterval();

let isPaused = false;
function togglePause() {
    isPaused = !isPaused;
    if (!isPaused) animate(); // resume
}
window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') togglePause();
});

// Main game loop
function animate() {
    if (isPaused) return;
    const animationId = window.requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    player.update(); // Player update no longer needs speed passed directly

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.update();

        if (
            projectile.position.x + projectile.radius < 0 ||
            projectile.position.x - projectile.radius > canvas.width ||
            projectile.position.y - projectile.radius > canvas.height ||
            projectile.position.y + projectile.radius < 0
        ) {
            projectiles.splice(i, 1);
        }
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.update();

        // Check for collision between asteroid and player (uses isInvincible flag)
        if (!isInvincible && circleTriangleCollision(asteroid, player.getVertices())) {
            explosionPool.play();
            showGameOver();
            window.cancelAnimationFrame(animationId);
            clearInterval(timerInterval); // Also clear timer on game over
            clearTimeout(asteroidIntervalId);
            clearInterval(powerUpIntervalId); // Clear power-up interval on game over
            return; // Exit animate loop if game over
        }

        if (
            asteroid.position.x + asteroid.radius < 0 ||
            asteroid.position.x - asteroid.radius > canvas.width ||
            asteroid.position.y - asteroid.radius > canvas.height ||
            asteroid.position.y + asteroid.radius < 0
        ) {
            asteroids.splice(i, 1);
        }

        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j];

            if (circleCollision(asteroid, projectile)) {
                explosionPool.play();
                asteroids.splice(i, 1);
                projectiles.splice(j, 1);
                score += 5;
                scoreDiv.textContent = 'Score: ' + score;
            }
        }
    }

    // Move the player forward if 'w' is pressed (uses currentGlobalSpeed)
    if (keys.w.pressed) {
        player.velocity.x = Math.cos(player.rotation) * currentGlobalSpeed;
        player.velocity.y = Math.sin(player.rotation) * currentGlobalSpeed;
    } else if (!keys.w.pressed) {
        player.velocity.x *= FRICTION;
        player.velocity.y *= FRICTION;
    }

    if (keys.d.pressed) player.rotation += ROTATIONAL_SPEED;
    else if (keys.a.pressed) player.rotation -= ROTATIONAL_SPEED;

    drawPowerUp();

    // Check for power-up collection
    if (powerUp) {
        const dx = player.position.x - powerUp.x;
        const dy = player.position.y - powerUp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 25) { // 25px threshold for collection
            powerUp = null;
            currentPowerUp = getRandomPowerUp();
            showCollectedMsg(currentPowerUp);
            updatePowerUpDisplay();
            powerupPool.play(); // Play powerup sound

            // Clear any previous power-up effects
            if (powerUpTimeout) clearTimeout(powerUpTimeout);
            isInvincible = false;
            shotgunActive = false;
            speedBoostActive = false;
            currentGlobalSpeed = initialPlayerSpeed; // Reset global speed before applying new power-up

            // Apply power-up effect (UPDATED LOGIC)
            switch (currentPowerUp.name) {
                case "speed":
                    currentGlobalSpeed = initialPlayerSpeed * 3; // Update the global speed variable
                    speedBoostActive = true;
                    powerUpTimeout = setTimeout(() => {
                        currentGlobalSpeed = initialPlayerSpeed; // Reset global speed
                        speedBoostActive = false;
                        currentPowerUp = null;
                        updatePowerUpDisplay();
                    }, 3000); // Speed lasts for 3 seconds
                    break;
                case "shotgun":
                    shotgunActive = true;
                    powerUpTimeout = setTimeout(() => {
                        shotgunActive = false;
                        currentPowerUp = null;
                        updatePowerUpDisplay();
                    }, 5000); // Shotgun lasts for 5 seconds
                    break;
                case "invincible":
                    isInvincible = true;
                    powerUpTimeout = setTimeout(() => {
                        isInvincible = false;
                        currentPowerUp = null;
                        updatePowerUpDisplay();
                    }, 5000); // Invincibility lasts for 5 seconds
                    break;
                case "nuke":
                    asteroids.length = 0; // Clears all asteroids immediately
                    currentPowerUp = null; // Nuke is an instant effect, no timer needed for it to "wear off"
                    updatePowerUpDisplay();
                    break;
            }
        }
    }
}

// Event Listeners (remains in main.js as they interact with global game state)
window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            if (!keys.w.pressed) {
                soundMove.currentTime = 0;
                soundMove.play();
            }
            keys.w.pressed = true;
            break;
        case 'KeyA':
            keys.a.pressed = true;
            break;
        case 'KeyD':
            keys.d.pressed = true;
            break;
        case 'Space':
            if (canShoot) {
                shootPool.play();
                // Check shotgunActive flag here
                if (shotgunActive) {
                    for (let angleOffset of [-0.2, 0, 0.2]) {
                        projectiles.push(
                            new Projectile({
                                position: {
                                    x: player.position.x + Math.cos(player.rotation + angleOffset) * 30,
                                    y: player.position.y + Math.sin(player.rotation + angleOffset) * 30,
                                },
                                velocity: {
                                    x: Math.cos(player.rotation + angleOffset) * PROJECTILE_SPEED,
                                    y: Math.sin(player.rotation + angleOffset) * PROJECTILE_SPEED,
                                },
                                ctx: ctx // Pass ctx to Projectile
                            })
                        );
                    }
                } else {
                    projectiles.push(
                        new Projectile({
                            position: {
                                x: player.position.x + Math.cos(player.rotation) * 30,
                                y: player.position.y + Math.sin(player.rotation) * 30,
                            },
                            velocity: {
                                x: Math.cos(player.rotation) * PROJECTILE_SPEED,
                                y: Math.sin(player.rotation) * PROJECTILE_SPEED,
                            },
                            ctx: ctx // Pass ctx to Projectile
                        })
                    );
                }
                canShoot = false;
                setTimeout(() => { canShoot = true; }, SHOOT_COOLDOWN);
            }
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w.pressed = false;
            soundMove.pause();
            soundMove.currentTime = 0;
            break;
        case 'KeyA':
            keys.a.pressed = false;
            break;
        case 'KeyD':
            keys.d.pressed = false;
            break;
    }
});

// Load sound effects
const soundBackground = new Audio('sounds/spacetravel.mp3');
soundBackground.loop = true;
soundBackground.volume = 0.5;

const soundMove = new Audio('sounds/PlayerMovement.mp3');
soundMove.loop = true;

const soundShoot = new Audio('sounds/shoot.mp3');

const soundExplosion = new Audio('sounds/spaceexplosion.mp3');

const soundPowerup = new Audio('sounds/powerup.mp3'); // NEW POWERUP SOUND

// Create audio pools for sound effects to prevent performance issues from rapid cloning
const shootPool = new AudioPool(soundShoot, 10);
const explosionPool = new AudioPool(soundExplosion, 15);
const powerupPool = new AudioPool(soundPowerup, 5);

let canShoot = true;

let score = 0;
const scoreDiv = document.getElementById('score');
const gameOverMenu = document.getElementById('gameOverMenu');
const finalScoreDiv = document.getElementById('finalScore');
const highestScoreDiv = document.getElementById('highestScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const collectedMsgDiv = document.getElementById('collectedMsg');
const powerUpDisplayDiv = document.getElementById('powerUpDisplay'); // Ensure you have this div in your HTML
let collectedMsgTimeout = null;
let gameOver = false;
let highestScore = localStorage.getItem('highestScore') ? parseInt(localStorage.getItem('highestScore')) : 0;

function showGameOver() {
    gameOver = true;
    finalScoreDiv.textContent = 'Score: ' + score;
    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('highestScore', highestScore);
    }
    highestScoreDiv.textContent = 'Highest Score: ' + highestScore;
    gameOverMenu.style.display = 'flex';
    clearInterval(timerInterval);
    clearTimeout(asteroidIntervalId);
    clearInterval(powerUpIntervalId);
}

function showCollectedMsg(powerUpObj) {
    if (powerUpObj && powerUpObj.name) {
        collectedMsgDiv.textContent = `collected: ${powerUpObj.name} (${powerUpObj.rarity})`;
        collectedMsgDiv.style.display = 'block';
        if (collectedMsgTimeout) clearTimeout(collectedMsgTimeout);
    } else {
        collectedMsgDiv.textContent = 'collected';
        collectedMsgDiv.style.display = 'block';
        if (collectedMsgTimeout) clearTimeout(collectedMsgTimeout);
        collectedMsgTimeout = setTimeout(() => {
            collectedMsgDiv.style.display = 'none';
            collectedMsgDiv.textContent = 'collected';
        }, 2000);
    }
}

function updatePowerUpDisplay() {
    if (currentPowerUp && currentPowerUp.name) {
        powerUpDisplayDiv.textContent = `Power-up: ${currentPowerUp.name} (${currentPowerUp.rarity})`;
    } else {
        powerUpDisplayDiv.textContent = '';
    }
}

function resetGame() {
    score = 0;
    scoreDiv.textContent = 'Score: 0';
    gameOverMenu.style.display = 'none';
    finalScoreDiv.textContent = '';
    highestScoreDiv.textContent = '';
    projectiles.length = 0;
    asteroids.length = 0;
    player.position.x = canvas.width / 2;
    player.position.y = canvas.height / 2;
    player.velocity.x = 0;
    player.velocity.y = 0;
    player.rotation = 0;
    gameOver = false;
    currentGlobalSpeed = initialPlayerSpeed; // Ensure SPEED is reset
    
    // Clear any active power-up effects and display
    if (powerUpTimeout) clearTimeout(powerUpTimeout);
    isInvincible = false;
    shotgunActive = false;
    speedBoostActive = false;
    currentPowerUp = null;
    updatePowerUpDisplay();

    // Reset background music to the beginning
    soundBackground.currentTime = 0;

    animate();
    startTimerAndDifficulty();
    startAsteroidInterval();
    startPowerUpInterval();
    collectedMsgDiv.style.display = 'none';
    collectedMsgDiv.textContent = 'collected';
}

// Start the main game loop
animate();
playAgainBtn.addEventListener('click', resetGame);

function startBackgroundMusic() {
    soundBackground.play();
    window.removeEventListener('keydown', startBackgroundMusic);
    window.removeEventListener('mousedown', startBackgroundMusic);
}
window.addEventListener('keydown', startBackgroundMusic);
window.addEventListener('mousedown', startBackgroundMusic);