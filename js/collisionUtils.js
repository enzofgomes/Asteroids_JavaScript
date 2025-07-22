// js/collisionUtils.js

// Check if two circles are colliding
export function circleCollision(circle1, circle2) {
    const xDifference = circle2.position.x - circle1.position.x;
    const yDifference = circle2.position.y - circle1.position.y;

    const distance = Math.sqrt(
        xDifference * xDifference + yDifference * yDifference
    );

    if (distance <= circle1.radius + circle2.radius) {
        return true;
    }

    return false;
}

// Check if a circle is colliding with a triangle
export function circleTriangleCollision(circle, triangle) {
    // Check collision with each of the triangle's edges
    for (let i = 0; i < 3; i++) {
        const start = triangle[i];
        const end = triangle[(i + 1) % 3];

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const lengthSq = dx * dx + dy * dy; // Use squared length to avoid sqrt

        // Calculate the projection of the circle's center onto the line segment
        let t = ((circle.position.x - start.x) * dx + (circle.position.y - start.y) * dy) / lengthSq;

        // Clamp t to the [0, 1] range to find the closest point on the segment
        t = Math.max(0, Math.min(1, t));

        const closestX = start.x + t * dx;
        const closestY = start.y + t * dy;

        // Calculate the squared distance from the circle's center to this closest point
        const distX = closestX - circle.position.x;
        const distY = closestY - circle.position.y;
        const distanceSq = distX * distX + distY * distY;

        // If the distance is less than the circle's radius, there's a collision
        if (distanceSq <= circle.radius * circle.radius) {
            return true;
        }
    }

    // No collision
    return false;
}

