import {Actor} from './common/actor'

function loadImage(name) {
    let image = new Image()
    image.src = `./assets/${name}.png`
    return image
}

// export class Astroid extends Actor {
//     constructor(world, {x, y, r, dx, dy, dr, scale}) {
//         super(world)
//         this.x = x
//         this.y = y
//         this.rot = r
//
//         this.dx = dx
//         this.dy = dy
//         this.drot = dr
//
//         // this.points = [
//         //     {x: 1, y: 1},
//         //     {x: 1, y: 12},
//         //     {x: -10, y: 8},
//         //     {x: -16, y: -2},
//         //     {x: -4, y: -10},
//         //     {x: 8, y: -10},
//         //     {x: 12, y: 0},
//         // ]
//         this.points = [
//             {x: -12, y: -12},
//             {x: -12, y: 12},
//             {x: 12, y: 12},
//             {x: 12, y: -12},
//         ]
//         this.scale = scale
//     }
//
//     *baseControlState() {
//         while (true) {
//             let {dt} = yield
//             this.rot += this.drot
//             this.x += this.dx
//             this.y += this.dy
//
//             let on_screen_x = 0
//             let on_screen_y = 0
//             for (let {x, y} of this.points) {
//                 x = this.x + x*this.scale
//                 y = this.y + y*this.scale
//                 // console.log(x, y)
//                 on_screen_x |= (x > 0 && x < this.world.width)|0
//                 on_screen_y |= (y > 0 && y < this.world.height)|0
//             }
//             if (!on_screen_x) {
//                 if ((this.x < 0 && this.dx < 0) || (this.x > this.world.width && this.dx > 0)) {
//                     this.x = this.world.width - this.x
//                 }
//             }
//             if (!on_screen_y) {
//                 if ((this.y < 0 && this.dy < 0) || (this.y > this.world.height && this.dy > 0)) {
//                     this.y = this.world.height - this.y
//                 }
//             }
//         }
//     }
//
//     *baseRenderState() {
//         while (true) {
//             let {ctx, dt} = yield
//             let points = rotate(this.rot, this.points)
//             ctx.beginPath()
//             ctx.lineWidth="2"
//             ctx.strokeStyle="grey"
//
//             let {x, y} = points[0]
//             ctx.moveTo(this.x+x*this.scale, this.y+y*this.scale)
//             for (let {x, y} of points) {
//                 ctx.lineTo(this.x+x*this.scale, this.y+y*this.scale)
//             }
//             ctx.lineTo(this.x+x*this.scale, this.y+y*this.scale)
//             ctx.stroke()
//             ctx.fillStyle = 'yellow'
//             ctx.fillRect(this.x, this.y, 2, 2)
//         }
//     }
// }
//
// function rotate(rot, points) {
//     let result = []
//     let sin = Math.sin(rot)
//     let cos = Math.cos(rot)
//
//     for (let {x, y} of points) {
//         result.push({
//             x: x*cos - y*sin,
//             y: x*sin + y*cos,
//         })
//     }
//     return result
// }


const SPRITES = [
    loadImage('roid1'),
    loadImage('roid2'),
    loadImage('roid3'),
    loadImage('roid4'),
    loadImage('roid5'),
]
const base_size = 20

export class Astroid extends Actor {


    constructor(world, {x, y, r, dx, dy, dr, scale}) {
        super(world)
        this.x = x
        this.y = y
        this.rot = r

        this.dx = dx
        this.dy = dy
        this.drot = dr

        this.scale = scale
        this.image = SPRITES[(Math.random() * SPRITES.length)|0]
    }

    static create(world) {
        let t = new this(world, {
            x: (world.width * Math.random())|0,
            y: (world.height * Math.random())|0,
            r: Math.random()*4,
            dx: (-.5 + Math.random())*4,
            dy: (-.5 + Math.random())*4,
            drot: (-.5 + Math.random())*4,
            scale: (Math.random()*5)|0,
        })
        return t
    }

    *baseControlState() {
        while (true) {
            let {dt} = yield
            this.rot += this.drot
            this.x += this.dx
            this.y += this.dy
            let radius = base_size * this.scale / 2

            if ((this.x + radius < 0 && this.dx < 0) || (this.x - radius > this.world.width && this.dx > 0)) {
                this.x = this.world.width - this.x
            }

            if ((this.y + radius < 0 && this.dy < 0) || (this.y - radius > this.world.height && this.dy > 0)) {
                this.y = this.world.height - this.y
            }

        }
    }

    *baseRenderState() {
        while (true) {
            let {ctx, dt} = yield
            let radius = base_size * this.scale / 2
            ctx.save()
            ctx.translate(this.x, this.y)
            ctx.rotate(this.rot)
            ctx.drawImage(this.image, -radius, -radius, radius*2, radius*2)
            // ctx.strokeStyle = 'yellow'
            // ctx.arc(0, 0, radius, 0, 7)
            // ctx.stroke()
            ctx.restore()
        }
    }
}
