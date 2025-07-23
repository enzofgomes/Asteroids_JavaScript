// js/gameConstants.js

// REMOVED: export let SPEED = 1.60;

export const ROTATIONAL_SPEED = 0.05; // How fast the player rotates
export const FRICTION = 0.97; // How quickly the player slows down
export const PROJECTILE_SPEED = 3; // How fast the projectiles move
export const ASTEROID_SPEED = 2; // How fast the asteroids move

export const SHOOT_COOLDOWN = 200; // milliseconds
export const STAR_COUNT = 100; // Number of stars

export const ASTEROID_MIN_INTERVAL = 100; // Hardest
export const ASTEROID_DECREASE_STEP = 50; // ms decrease per second

export const POWER_UP_SIZE = 10;
export const POWER_UP_TYPES = [
    { name: "shotgun", rarity: "rare" },
    { name: "speed", rarity: "common" },
    { name: "invincible", rarity: "rarest" },
    { name: "nuke", rarity: "rarest" }
];

export const POWER_UP_RARITY_WEIGHTS = {
    common: 70,
    rare: 25,
    rarest: 5
};