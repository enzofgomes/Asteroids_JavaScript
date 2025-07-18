const canvas =document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.fillStyle = 'black'
ctx.fillRect(0,0,canvas.width,canvas.height);

// Classe PLayer

class Player {
    constructor({position, velocity}) {
        this.position = position // {x,y}
        this.velocity = velocity 
    }

 draw() {
    ctx.moveTo(this.position.x + 30, this.position.y)
    ctx.lineTo(this.position.x - 10, this.position.y - 10)
    ctx.lineTo(this.position.x - 10, this.position.y + 10)
    ctx.closePath()
    
    canvas.strokeStyle= 'white'
    ctx.stroke()
 }
}

const player1 = new Player({
    position: { x: canvas.width / 2, y: canvas.height / 2 },
    velocity: { x: 0, y: 0 },
 })

 player1.draw()

 console.log(player1)

 


