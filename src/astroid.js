import {Actor} from './common/actor'

export class Astroid extends Actor {
    constructor() {

    }

    *baseControlState() {

    }

    *baseRenderState() {
        let {ctx, dt} = yield
        ctx.fillRect(20, 20, 20, 20)
    }
}
