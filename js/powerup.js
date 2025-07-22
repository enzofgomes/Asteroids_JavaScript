// js/powerup.js

import { POWER_UP_TYPES, POWER_UP_RARITY_WEIGHTS } from './gameConstants.js';

export function getRandomPowerUp() {
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