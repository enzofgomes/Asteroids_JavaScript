// js/player.js

export class Player {
    constructor({ position, velocity, ctx, canvas }) {
        this.position = position; // {x, y} position of the player
        this.velocity = velocity; // {x, y} velocity of the player
        this.rotation = 0; // rotation angle of the player
        this.ctx = ctx; // Store context
        this.canvas = canvas; // Store canvas
    }

    draw() {
        this.ctx.save(); // Save the current drawing state

        // Move and rotate the canvas to draw the player
        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(this.rotation);
        this.ctx.translate(-this.position.x, -this.position.y);

        // Draw the triangle (spaceship)
        this.ctx.beginPath();
        this.ctx.moveTo(this.position.x + 30, this.position.y);
        this.ctx.lineTo(this.position.x - 10, this.position.y - 10);
        this.ctx.lineTo(this.position.x - 10, this.position.y + 10);
        this.ctx.closePath();

        this.ctx.fillStyle = 'yellow';
        this.ctx.fill();
        this.ctx.restore(); // Restore the drawing state
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        // Prevent player from leaving the screen
        this.position.x = Math.max(0, Math.min(this.canvas.width, this.position.x));
        this.position.y = Math.max(0, Math.min(this.canvas.height, this.position.y));
    }

    getVertices() {
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const center = this.position;

        // Local coordinates of the triangle points relative to the center
        const p1 = { x: 30, y: 0 }; // Tip of the ship
        const p2 = { x: -10, y: -10 }; // Bottom-left wing
        const p3 = { x: -10, y: 10 }; // Top-left wing

        return [
            { // Apply rotation formula: x' = x*cos - y*sin, y' = x*sin + y*cos
                x: center.x + p1.x * cos - p1.y * sin,
                y: center.y + p1.x * sin + p1.y * cos,
            },
            {
                x: center.x + p2.x * cos - p2.y * sin,
                y: center.y + p2.x * sin + p2.y * cos,
            },
            {
                x: center.x + p3.x * cos - p3.y * sin,
                y: center.y + p3.x * sin + p3.y * cos,
            },
        ];
    }
}