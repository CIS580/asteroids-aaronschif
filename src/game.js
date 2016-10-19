"use strict";

import {Astroid} from './astroid'
const Player = require('./player.js');

export class Game {
    constructor(screen) {

        // Set up buffers
        this.frontBuffer = screen;
        this.frontCtx = screen.getContext('2d');
        this.backBuffer = document.createElement('canvas');
        this.backBuffer.width = screen.width;
        this.backBuffer.height = screen.height;
        this.backCtx = this.backBuffer.getContext('2d');

        this.width = screen.width
        this.height = screen.height

        // Start the game loop
        this.oldTime = performance.now();
        this.paused = false;

        this.astroids = []
        this.bolts = []
        this.player = new Player({x: this.backBuffer.width/2, y: this.backBuffer.height/2}, this.backBuffer, this);
        this.score = 0
        this.level = 0
        this.lives = 3
    }

    pause(flag) {
        this.paused = (flag == true);
    }

    createAstroids(n) {
        for (let i=0; i<n; i++) {
            this.astroids.push(Astroid.create(this))
        }
    }

    loop(newTime) {
        var game = this;
        var elapsedTime = newTime - this.oldTime;
        this.oldTime = newTime;

        if(!this.paused) this.update(elapsedTime);
        this.render(elapsedTime, this.backCtx);
        this.frontCtx.drawImage(this.backBuffer, 0, 0);
    }


    update(elapsedTime) {
        this.player.update(elapsedTime);
        for (let astroid of this.astroids) {
            astroid.update(elapsedTime)
        }
        for (let bolts of this.bolts) {
            bolts.update(elapsedTime)
        }
        this.astroids = this.astroids.filter((e)=>!e.collect())
        this.bolts = this.bolts.filter((e)=>!e.collect())
        if (this.astroids.length === 0) {
            this.createAstroids(10)
            this.level += 1
        }

        let i = 0
        for (let astroid of this.astroids) {
            if (Math.pow(this.player.position.x - astroid.x, 2) + Math.pow(this.player.position.y - astroid.y, 2) < Math.pow(5+astroid.radius(), 2)) {
                this.lives -= 1
                this.player.reposition()
            }
            for (let bolt of this.bolts) {
                if (Math.pow(bolt.x - astroid.x, 2) + Math.pow(bolt.y - astroid.y, 2) < Math.pow(astroid.radius(), 2)) {
                    bolt._collect = true
                    astroid.explode()
                    this.score += 10
                }
            }
            i++
            let is_colliding = false
            for (let otherastroid of this.astroids.concat().splice(i)) {
                if (Math.pow(otherastroid.x - astroid.x, 2) + Math.pow(otherastroid.y - astroid.y, 2) < Math.pow(astroid.radius()+otherastroid.radius(), 2)) {
                    is_colliding = true
                    if (astroid.collision_timeout < 1) {
                        ;[otherastroid.dx, astroid.dx, otherastroid.dy, astroid.dy] = [astroid.dx, otherastroid.dx, astroid.dy, otherastroid.dy]
                    }
                }
            }

            if (is_colliding) {
                if (astroid.collision_adjust_timeout < 100) {
                    astroid.collision_adjust_timeout++
                } else {
                    astroid.collision_adjust_timeout = 0
                    console.log('adjust')
                    astroid.dx = (-.5+Math.random())*5
                    astroid.dy = (-.5+Math.random())*5
                }
                astroid.collision_timeout += 1
            } else {
                astroid.collision_adjust_timeout = 0
                astroid.collision_timeout -= 1
            }
            astroid.collision_timeout = Math.min(astroid.collision_timeout, 10)
            astroid.collision_timeout = Math.max(astroid.collision_timeout, 0)

        }
    }

    render(elapsedTime, ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.backBuffer.width, this.backBuffer.height);
        this.player.render(elapsedTime, ctx);

        for (let astroid of this.astroids) {
            astroid.render(elapsedTime, ctx)
        }
        for (let bolts of this.bolts) {
            bolts.render(elapsedTime, ctx)
        }
    }
}
