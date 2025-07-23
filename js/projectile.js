// js/projectile.js

export class Projectile {
    constructor({ position, velocity, ctx }) { // Pass ctx
        this.position = position; // {x, y} position of the projectile
        this.velocity = velocity; // {x, y} velocity of the projectile
        this.radius = 5; // radius of the projectile
        this.ctx = ctx; // Store context
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.closePath();
        this.ctx.fillStyle = 'blue';
        this.ctx.fill();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}