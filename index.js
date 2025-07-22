// Select the canvas element from the HTML
const canvas = document.querySelector('canvas')
// Get the 2D drawing context for the canvas
const ctx = canvas.getContext('2d')

// Set the canvas size to fill the window
canvas.width = window.innerWidth
canvas.height = window.innerHeight

// Player class represents the spaceship
class Player {
    constructor({ position, velocity }) {
        this.position = position // {x, y} position of the player
        this.velocity = velocity // {x, y} velocity of the player
        this.rotation = 0 // rotation angle of the player
    }

    // Draw the player (spaceship) on the canvas
    draw() {
        ctx.save() // Save the current drawing state

        // Move and rotate the canvas to draw the player
        ctx.translate(this.position.x, this.position.y)
        ctx.rotate(this.rotation)
        ctx.translate(-this.position.x, -this.position.y)

        // Draw the triangle (spaceship)
        ctx.beginPath()
        ctx.moveTo(this.position.x + 30, this.position.y)
        ctx.lineTo(this.position.x - 10, this.position.y - 10)
        ctx.lineTo(this.position.x - 10, this.position.y + 10)
        ctx.closePath()

        ctx.fillStyle = 'yellow'
        ctx.fill()
        ctx.restore() // Restore the drawing state
    }

    // Update the player's position and draw it
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        // Prevent player from leaving the screen
        this.position.x = Math.max(0, Math.min(canvas.width, this.position.x));
        this.position.y = Math.max(0, Math.min(canvas.height, this.position.y));
    }

    // Get the vertices of the player (for collision detection)
    getVertices() {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)

        return [
            {
                x: this.position.x + cos * 30 - sin * 0,
                y: this.position.y + sin * 30 + cos * 0,
            },
            {
                x: this.position.x + cos * -10 - sin * 10,
                y: this.position.y + sin * -10 + cos * 10,
            },
            {
                x: this.position.x + cos * -10 - sin * -10,
                y: this.position.y + sin * -10 + cos * -10,
            },
        ]
    }
}

// Projectile class represents the bullets shot by the player
class Projectile {
    constructor({ position, velocity }) {
        this.position = position // {x, y} position of the projectile
        this.velocity = velocity // {x, y} velocity of the projectile
        this.radius = 5 // radius of the projectile
    }

    // Draw the projectile on the canvas
    draw() {
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        ctx.closePath()
        ctx.fillStyle = 'blue'
        ctx.fill()
    }

    // Update the projectile's position and draw it
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// Asteroid class represents the asteroids
class Asteroid {
    constructor({ position, velocity, radius }) {
        this.position = position // {x, y} position of the asteroid
        this.velocity = velocity // {x, y} velocity of the asteroid
        this.radius = radius // radius of the asteroid
    }

    // Draw the asteroid on the canvas
    draw() {
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        ctx.closePath()
        ctx.fillStyle = 'gray'
        ctx.fill()
        ctx.strokeStyle = 'white '
        ctx.stroke()
    }

    // Update the asteroid's position and draw it
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// Create the player in the center of the screen
const player = new Player({
    position: { x: canvas.width / 2, y: canvas.height / 2 },
    velocity: { x: 0, y: 0 },
})

// Object to keep track of which keys are pressed
const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
}

// Game constants
let SPEED = 1.60 // How fast the player moves (CHANGED TO LET)
const ROTATIONAL_SPEED = 0.05 // How fast the player rotates
const FRICTION = 0.97 // How quickly the player slows down
const PROJECTILE_SPEED = 3 // How fast the projectiles move
const ASTEROID_SPEED = 2 // How fast the asteroids move

let originalSpeed = SPEED; // ADDED: Store the initial speed here

// Arrays to store projectiles and asteroids
const projectiles = []
const asteroids = []

// Create an array to store stars
const STAR_COUNT = 100 // Number of stars
const stars = []
for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5 // random small radius
    })
}

// Timer and dynamic difficulty variables
let timeElapsed = 0;
const timerDiv = document.getElementById('timer');
let timerInterval;
let asteroidSpawnInterval = 2500; // Start at 2500ms
const ASTEROID_MIN_INTERVAL = 400; // Hardest
const ASTEROID_DECREASE_STEP = 50; // ms decrease per second

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
    const index = Math.floor(Math.random() * 4)
    let x, y
    let vx, vy
    let radius = 50 * Math.random() + 10
    switch (index) {
        case 0: // left side of the screen
            x = 0 - radius
            y = Math.random() * canvas.height
            vx = 1 * ASTEROID_SPEED
            vy = 0 * ASTEROID_SPEED
            break
        case 1: // bottom side of the screen
            x = Math.random() * canvas.width
            y = canvas.height + radius
            vx = 0 * ASTEROID_SPEED
            vy = -1 * ASTEROID_SPEED
            break
        case 2: // right side of the screen
            x = canvas.width + radius
            y = Math.random() * canvas.height
            vx = -1 * ASTEROID_SPEED
            vy = 0 * ASTEROID_SPEED
            break
        case 3: // top side of the screen
            x = Math.random() * canvas.width
            y = 0 - radius
            vx = 0 * ASTEROID_SPEED
            vy = 1 * ASTEROID_SPEED
            break
    }
    asteroids.push(
        new Asteroid({
            position: { x: x, y: y },
            velocity: { x: vx, y: vy },
            radius,
        })
    );
    // No interval reset here; handled by scheduleNextAsteroid
}
// Start both on game start
startTimerAndDifficulty();
startAsteroidInterval();

// Power-up variables
let powerUp = null;
let powerUpIntervalId;
const POWER_UP_SIZE = 10;
let powerUpPulseTime = 0;
// Power-up types with rarity
const POWER_UP_TYPES = [
    { name: "shotgun", rarity: "rare" },
    { name: "speed", rarity: "common" },
    { name: "invincible", rarity: "rarest" },
    { name: "nuke", rarity: "rarest" }
];

// Rarity weights
const POWER_UP_RARITY_WEIGHTS = {
    common: 70,
    rare: 25,
    rarest: 5
};

// Weighted random selection function
function getRandomPowerUp() {
    // Build weighted list
    const weightedList = [];
    for (const p of POWER_UP_TYPES) {
        const weight = POWER_UP_RARITY_WEIGHTS[p.rarity] || 1;
        for (let i = 0; i < weight; i++) {
            weightedList.push(p);
        }
    }
    // Pick random
    const idx = Math.floor(Math.random() * weightedList.length);
    return weightedList[idx];
}

let currentPowerUp = null;
let powerUpTimeout = null;
let isInvincible = false;
let shotgunActive = false;
let speedBoostActive = false;
// originalSpeed is now declared globally above

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

// Check if two circles are colliding
function circleCollision(circle1, circle2) {
    const xDifference = circle2.position.x - circle1.position.x
    const yDifference = circle2.position.y - circle1.position.y

    const distance = Math.sqrt(
        xDifference * xDifference + yDifference * yDifference
    )

    if (distance <= circle1.radius + circle2.radius) {
        return true
    }

    return false
}

// Check if a circle is colliding with a triangle
function circleTriangleCollision(circle, triangle) {
    // Check if the circle is colliding with any of the triangle's edges
    for (let i = 0; i < 3; i++) {
        let start = triangle[i]
        let end = triangle[(i + 1) % 3]

        let dx = end.x - start.x
        let dy = end.y - start.y
        let length = Math.sqrt(dx * dx + dy * dy)

        let dot =
            ((circle.position.x - start.x) * dx +
                (circle.position.y - start.y) * dy) /
            Math.pow(length, 2)

        let closestX = start.x + dot * dx
        let closestY = start.y + dot * dy

        if (!isPointOnLineSegment(closestX, closestY, start, end)) {
            closestX = closestX < start.x ? start.x : end.x
            closestY = closestY < start.y ? start.y : end.y
        }

        dx = closestX - circle.position.x
        dy = closestY - circle.position.y

        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= circle.radius) {
            return true
        }
    }

    // No collision
    return false
}

// Helper function to check if a point is on a line segment
function isPointOnLineSegment(x, y, start, end) {
    return (
        x >= Math.min(start.x, end.x) &&
        x <= Math.max(start.x, end.x) &&
        y >= Math.min(start.y, end.y) &&
        y <= Math.max(start.y, end.y)
    )
}

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
    // Request the next frame to keep the game running
    const animationId = window.requestAnimationFrame(animate)
    // Fill the background with black
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw stars (white dots)
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i]
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false)
        ctx.closePath()
        ctx.fillStyle = 'white'
        ctx.fill()
    }

    // Update and draw the player
    player.update()

    // Update and draw all projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i]
        projectile.update()

        // Remove projectiles that go off screen
        if (
            projectile.position.x + projectile.radius < 0 ||
            projectile.position.x - projectile.radius > canvas.width ||
            projectile.position.y - projectile.radius > canvas.height ||
            projectile.position.y + projectile.radius < 0
        ) {
            projectiles.splice(i, 1)
        }
    }

    // Update and draw all asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i]
        asteroid.update()

        // Check for collision between asteroid and player
        if (!isInvincible && circleTriangleCollision(asteroid, player.getVertices())) {
            soundExplosion.currentTime = 0; // rewind to start
            soundExplosion.play();
            showGameOver();
            window.cancelAnimationFrame(animationId)
            clearTimeout(asteroidIntervalId)
        }

        // Remove asteroids that go off screen
        if (
            asteroid.position.x + asteroid.radius < 0 ||
            asteroid.position.x - asteroid.radius > canvas.width ||
            asteroid.position.y - asteroid.radius > canvas.height ||
            asteroid.position.y + asteroid.radius < 0
        ) {
            asteroids.splice(i, 1)
        }

        // Check for collision between asteroids and projectiles
        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j]

            if (circleCollision(asteroid, projectile)) {
                soundExplosion.currentTime = 0; // rewind to start
                soundExplosion.play();
                asteroids.splice(i, 1)
                projectiles.splice(j, 1)
                score += 5;
                scoreDiv.textContent = 'Score: ' + score;
            }
        }
    }

    // Move the player forward if 'w' is pressed
    if (keys.w.pressed) {
        player.velocity.x = Math.cos(player.rotation) * SPEED
        player.velocity.y = Math.sin(player.rotation) * SPEED
    } else if (!keys.w.pressed) {
        // Apply friction to slow down the player
        player.velocity.x *= FRICTION
        player.velocity.y *= FRICTION
    }

    // Rotate the player if 'a' or 'd' is pressed
    if (keys.d.pressed) player.rotation += ROTATIONAL_SPEED
    else if (keys.a.pressed) player.rotation -= ROTATIONAL_SPEED

    drawPowerUp();

    // Check for power-up collection
    if (powerUp) {
        const dx = player.position.x - powerUp.x;
        const dy = player.position.y - powerUp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 25) { // 25px threshold for collection
            powerUp = null;
            // Weighted random power-up selection
            currentPowerUp = getRandomPowerUp();
            showCollectedMsg(currentPowerUp);
            updatePowerUpDisplay();
            // Clear any previous power-up effects
            if (powerUpTimeout) clearTimeout(powerUpTimeout);
            isInvincible = false;
            shotgunActive = false;
            speedBoostActive = false;
            SPEED = originalSpeed; // Reset SPEED to original before applying new power-up

            // Apply power-up effect (UPDATED LOGIC)
            switch (currentPowerUp.name) {
                case "speed":
                    SPEED = originalSpeed * 3; // Increase speed by 3x
                    speedBoostActive = true;
                    powerUpTimeout = setTimeout(() => {
                        SPEED = originalSpeed; // Reset speed
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

animate() // Start the game loop

// Listen for keydown events (when a key is pressed)
window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            if (!keys.w.pressed) {
                soundMove.currentTime = 0; // rewind to start
                soundMove.play();
            }
            keys.w.pressed = true
            break
        case 'KeyA':
            keys.a.pressed = true
            break
        case 'KeyD':
            keys.d.pressed = true
            break
        case 'Space':
            // Shoot a projectile when space is pressed
            if (canShoot) {
                soundShoot.currentTime = 0; // rewind to start
                soundShoot.play();
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
                        })
                    );
                }
                canShoot = false;
                setTimeout(() => { canShoot = true; }, SHOOT_COOLDOWN);
            }
            break
    }
})

// Listen for keyup events (when a key is released)
window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w.pressed = false
            soundMove.pause();
            soundMove.currentTime = 0;
            break
        case 'KeyA':
            keys.a.pressed = false
            break
        case 'KeyD':
            keys.d.pressed = false
            break
    }
})

// Load sound effects
const soundBackground = new Audio('sounds/background.mp3');
soundBackground.loop = true;
soundBackground.volume = 0.5;

// Load player movement sound
const soundMove = new Audio('sounds/PlayerMovement.mp3');
soundMove.loop = true;

// Load shooting sound
const soundShoot = new Audio('sounds/shoot.mp3');

// Load asteroid explosion sound
const soundExplosion = new Audio('sounds/spaceexplosion.mp3');

// Shooting cooldown variables
let canShoot = true;
const SHOOT_COOLDOWN = 200; // milliseconds

// Score variable
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
        // Do not auto-hide for power-up collection
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
    // Reset all game state
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
    // Ensure SPEED is reset to its original value on game reset
    SPEED = originalSpeed; 
    
    // Clear any active power-up effects and display
    if (powerUpTimeout) clearTimeout(powerUpTimeout);
    isInvincible = false;
    shotgunActive = false;
    speedBoostActive = false;
    currentPowerUp = null;
    updatePowerUpDisplay();

    animate();
    startTimerAndDifficulty();
    startAsteroidInterval();
    startPowerUpInterval();
    collectedMsgDiv.style.display = 'none';
    collectedMsgDiv.textContent = 'collected';
}
playAgainBtn.addEventListener('click', resetGame);

// Play background music after first user interaction
function startBackgroundMusic() {
    soundBackground.play();
    // Remove the event listeners so it only runs once
    window.removeEventListener('keydown', startBackgroundMusic);
    window.removeEventListener('mousedown', startBackgroundMusic);
}
window.addEventListener('keydown', startBackgroundMusic);
window.addEventListener('mousedown', startBackgroundMusic);