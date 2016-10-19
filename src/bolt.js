import {Actor} from './common/actor'


export class Bolt extends Actor {
    constructor(world, {x, y, r}) {
        super(world)
        r += Math.PI
        this.x = x
        this.y = y
        this.dx = Math.sin(r)*4
        this.dy = Math.cos(r)*4
        this.rot = r
        this._collect = false
    }

    static create(world, player) {
        let t = new this(world, {
            x: player.position.x,
            y: player.position.y,
            r: player.angle,
        })
        world.bolts.push(t)
        return t
    }

    collect() {
        return this._collect
    }

    *baseControlState() {
        while (true) {
            let {dt} = yield
            this.x += this.dx
            this.y += this.dy
            let radius = 5

            if ((this.x + radius < 0 && this.dx < 0) || (this.x - radius > this.world.width && this.dx > 0)) {
                this._collect = true
            }

            if ((this.y + radius < 0 && this.dy < 0) || (this.y - radius > this.world.height && this.dy > 0)) {
                this._collect = true
            }

        }
    }

    *baseRenderState() {
        while (true) {
            let {ctx, dt} = yield
            ctx.save()
            ctx.fillStyle = 'yellow'
            ctx.strokeStyle = 'yellow'
            ctx.beginPath()
            ctx.translate(this.x, this.y)
            ctx.rotate(-this.rot)
            ctx.moveTo(0, -5)
            ctx.lineTo(0, +5)
            ctx.stroke()
            ctx.restore()
        }
    }
}
