// js/audioPool.js

/**
 * Manages a pool of audio elements to allow for overlapping sound playback
 * without the performance overhead of creating new Audio objects on the fly.
 */
export class AudioPool {
    constructor(sound, size = 10) {
        this.pool = [];
        this.next = 0;
        for (let i = 0; i < size; i++) {
            this.pool.push(sound.cloneNode());
        }
    }

    play() {
        const audio = this.pool[this.next];
        audio.currentTime = 0;
        audio.play();
        this.next = (this.next + 1) % this.pool.length;
    }
}