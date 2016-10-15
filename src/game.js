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

        this.astroids = [
            new Astroid(this, {x:300, y:300, r:0, dx:-1, dy:0, dr:.1, scale: 2}),
            // new Astroid(this, {x:30, y:300, r:0, dx:1, dy:0, dr:.1, scale: 3}),
        ]
        this.player = new Player({x: this.backBuffer.width/2, y: this.backBuffer.height/2}, this.backBuffer);
    }

    pause(flag) {
        this.paused = (flag == true);
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
        // TODO: Update the game objects
    }

    render(elapsedTime, ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.backBuffer.width, this.backBuffer.height);
        this.player.render(elapsedTime, ctx);

        for (let astroid of this.astroids) {
            astroid.render(elapsedTime, ctx)
        }
    }
}
