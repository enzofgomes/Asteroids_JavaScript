// js/asteroid.js

export class Asteroid {
    constructor({ position, velocity, radius, ctx }) { // Pass ctx
        this.position = position; // {x, y} position of the asteroid
        this.velocity = velocity; // {x, y} velocity of the asteroid
        this.radius = radius; // radius of the asteroid
        this.ctx = ctx; // Store context
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.closePath();
        this.ctx.fillStyle = 'gray';
        this.ctx.fill();
        this.ctx.strokeStyle = 'white ';
        this.ctx.stroke();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}