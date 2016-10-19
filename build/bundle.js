(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _game = require('./game.js');

var canvas = document.getElementById('screen');
var game = new _game.Game(canvas);

var masterLoop = function (timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
};
masterLoop(performance.now());

},{"./game.js":6}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Astroid = undefined;

var _actor = require('./common/actor');

function loadImage(name) {
    let image = new Image();
    image.src = `./assets/${ name }.png`;
    return image;
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


const SPRITES = [loadImage('roid1'), loadImage('roid2'), loadImage('roid3'), loadImage('roid4'), loadImage('roid5')];
const base_size = 20;

class Astroid extends _actor.Actor {
    constructor(world, { x, y, r, dx, dy, dr, scale }) {
        super(world);
        this.x = x;
        this.y = y;
        this.rot = r;

        this.dx = dx;
        this.dy = dy;
        this.drot = dr;

        this.scale = scale;
        this.image = SPRITES[Math.random() * SPRITES.length | 0];
        this.collision_timeout = 0;
        this.collision_adjust_timeout = 0;
    }

    radius() {
        return this.scale * base_size / 2;
    }

    explode() {

        let newa = new this.constructor(this.world, {
            x: this.x,
            y: this.y,
            r: (-.5 + Math.random()) * 4,
            dx: (-.5 + Math.random()) * 4,
            dy: (-.5 + Math.random()) * 4,
            dr: (-.5 + Math.random()) / 4,
            scale: this.scale / 2 | 0
        });
        this.world.astroids.push(newa);
        this.scale = this.scale -= 1;
    }

    collect() {
        return this.scale < 1;
    }

    static create(world) {
        let t = new this(world, {
            x: world.width * Math.random() | 0,
            y: world.height * Math.random() | 0,
            r: (-.5 + Math.random()) * 4,
            dx: (-.5 + Math.random()) * 4,
            dy: (-.5 + Math.random()) * 4,
            dr: (-.5 + Math.random()) / 4,
            scale: Math.random() * 5 | 0 + 1
        });
        return t;
    }

    *baseControlState() {
        while (true) {
            let { dt } = yield;
            this.rot += this.drot;
            this.x += this.dx;
            this.y += this.dy;
            let radius = base_size * this.scale / 2;

            if (this.x + radius < 0 && this.dx < 0 || this.x - radius > this.world.width && this.dx > 0) {
                this.x = this.world.width - this.x;
            }

            if (this.y + radius < 0 && this.dy < 0 || this.y - radius > this.world.height && this.dy > 0) {
                this.y = this.world.height - this.y;
            }
        }
    }

    *baseRenderState() {
        while (true) {
            let { ctx, dt } = yield;
            let radius = base_size * this.scale / 2;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rot);
            ctx.drawImage(this.image, -radius, -radius, radius * 2, radius * 2);
            // ctx.strokeStyle = 'yellow'
            // ctx.arc(0, 0, radius, 0, 7)
            // ctx.stroke()
            ctx.restore();
        }
    }
}
exports.Astroid = Astroid;

},{"./common/actor":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Bolt = undefined;

var _actor = require('./common/actor');

class Bolt extends _actor.Actor {
    constructor(world, { x, y, r }) {
        super(world);
        r += Math.PI;
        this.x = x;
        this.y = y;
        this.dx = Math.sin(r) * 4;
        this.dy = Math.cos(r) * 4;
        this.rot = r;
        this._collect = false;
    }

    static create(world, player) {
        let t = new this(world, {
            x: player.position.x,
            y: player.position.y,
            r: player.angle
        });
        world.bolts.push(t);
        return t;
    }

    collect() {
        return this._collect;
    }

    *baseControlState() {
        while (true) {
            let { dt } = yield;
            this.x += this.dx;
            this.y += this.dy;
            let radius = 5;

            if (this.x + radius < 0 && this.dx < 0 || this.x - radius > this.world.width && this.dx > 0) {
                this._collect = true;
            }

            if (this.y + radius < 0 && this.dy < 0 || this.y - radius > this.world.height && this.dy > 0) {
                this._collect = true;
            }
        }
    }

    *baseRenderState() {
        while (true) {
            let { ctx, dt } = yield;
            ctx.save();
            ctx.fillStyle = 'yellow';
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            ctx.rotate(-this.rot);
            ctx.moveTo(0, -5);
            ctx.lineTo(0, +5);
            ctx.stroke();
            ctx.restore();
        }
    }
}
exports.Bolt = Bolt;

},{"./common/actor":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Actor = undefined;

var _events = require("./events.js");

class Actor {
    constructor(world) {
        this.events = new _events.EventListener();

        this.world = world;
        this.x = 0;
        this.y = 0;
        this.width = 64;
        this.height = 64;

        this.controlState = this.baseControlState.bind(this)();
        this.renderState = this.baseRenderState.bind(this)();
    }

    getHitBoxes() {
        return [];
    }

    collect() {
        return false;
    }

    update(dt) {
        let cur = this.controlState.next({ dt: dt });
        if (cur.value != null) {
            this.controlState = cur.value;
        } else if (cur.done) {
            this.controlState = this.baseControlState.bind(this)();
        }
    }

    render(dt, ctx) {
        let cur = this.renderState.next({ dt: dt, ctx: ctx });
        if (cur.value != null) {
            this.renderState = cur.value;
        } else if (cur.done) {
            this.renderState = this.baseRenderState.bind(this)();
        }
    }

    *baseControlState() {}
    *baseRenderState() {}
}
exports.Actor = Actor;

},{"./events.js":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
class EventListener {
    constructor() {
        this.events = {};
    }

    addEventListener(name, func) {
        let events = this.events[name] || [];
        this.events[name] = events;

        events.push(func);
    }

    emit(name, args) {
        let events = this.events[name] || [];
        for (let ev of events) {
            ev(args);
        }
    }
}
exports.EventListener = EventListener;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Game = undefined;

var _astroid = require('./astroid');

const Player = require('./player.js');

let soundEffect = new Audio(encodeURI('assets/bong.ogg'));

function swap(a, b) {
    let t = a.dx;
    a.dx = b.dx * b.scale / a.scale;
    b.dx = t * a.scale / b.scale;

    t = a.dy;
    a.dy = b.dy * b.scale / a.scale;
    b.dy = t * a.scale / b.scale;
}

class Game {
    constructor(screen) {

        // Set up buffers
        this.frontBuffer = screen;
        this.frontCtx = screen.getContext('2d');
        this.backBuffer = document.createElement('canvas');
        this.backBuffer.width = screen.width;
        this.backBuffer.height = screen.height;
        this.backCtx = this.backBuffer.getContext('2d');

        this.width = screen.width;
        this.height = screen.height;

        // Start the game loop
        this.oldTime = performance.now();
        this.paused = false;

        this.astroids = [];
        this.bolts = [];
        this.player = new Player({ x: this.backBuffer.width / 2, y: this.backBuffer.height / 2 }, this.backBuffer, this);
        this.score = 0;
        this.level = 0;
        this.lives = 3;
    }

    pause(flag) {
        this.paused = flag == true;
    }

    createAstroids(n) {
        for (let i = 0; i < n; i++) {
            this.astroids.push(_astroid.Astroid.create(this));
        }
    }

    loop(newTime) {
        var game = this;
        var elapsedTime = newTime - this.oldTime;
        this.oldTime = newTime;

        if (!this.paused) this.update(elapsedTime);
        this.render(elapsedTime, this.backCtx);
        this.frontCtx.drawImage(this.backBuffer, 0, 0);
    }

    update(elapsedTime) {
        this.player.update(elapsedTime);
        for (let astroid of this.astroids) {
            astroid.update(elapsedTime);
        }
        for (let bolts of this.bolts) {
            bolts.update(elapsedTime);
        }
        this.astroids = this.astroids.filter(e => !e.collect());
        this.bolts = this.bolts.filter(e => !e.collect());
        if (this.astroids.length === 0) {
            this.createAstroids(10);
            this.level += 1;
        }

        let i = 0;
        for (let astroid of this.astroids) {
            if (Math.pow(this.player.position.x - astroid.x, 2) + Math.pow(this.player.position.y - astroid.y, 2) < Math.pow(5 + astroid.radius(), 2)) {
                this.lives -= 1;
                this.player.reposition();
                soundEffect.play();
            }
            for (let bolt of this.bolts) {
                if (Math.pow(bolt.x - astroid.x, 2) + Math.pow(bolt.y - astroid.y, 2) < Math.pow(astroid.radius(), 2)) {
                    bolt._collect = true;
                    astroid.explode();
                    this.score += 10;
                    soundEffect.play();
                }
            }
            i++;
            let is_colliding = false;
            for (let otherastroid of this.astroids.concat().splice(i)) {
                if (Math.pow(otherastroid.x - astroid.x, 2) + Math.pow(otherastroid.y - astroid.y, 2) < Math.pow(astroid.radius() + otherastroid.radius(), 2)) {
                    is_colliding = true;
                    if (astroid.collision_timeout < 1) {
                        swap(astroid, otherastroid);
                    }
                }
            }

            if (is_colliding) {
                if (astroid.collision_adjust_timeout < 100) {
                    astroid.collision_adjust_timeout++;
                } else {
                    astroid.collision_adjust_timeout = 0;
                    console.log('adjust');
                    astroid.dx = (-.5 + Math.random()) * 5;
                    astroid.dy = (-.5 + Math.random()) * 5;
                }
                astroid.collision_timeout += 1;
            } else {
                astroid.collision_adjust_timeout = 0;
                astroid.collision_timeout -= 1;
            }
            astroid.collision_timeout = Math.min(astroid.collision_timeout, 10);
            astroid.collision_timeout = Math.max(astroid.collision_timeout, 0);
        }
    }

    render(elapsedTime, ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.backBuffer.width, this.backBuffer.height);
        this.player.render(elapsedTime, ctx);

        for (let astroid of this.astroids) {
            astroid.render(elapsedTime, ctx);
        }
        for (let bolts of this.bolts) {
            bolts.render(elapsedTime, ctx);
        }
        ctx.fillStyle = "yellow";
        ctx.fillText(`Score: ${ this.score }`, 20, 20);
        ctx.fillText(`Level: ${ this.level }`, 20, 40);
        ctx.fillText(`Lives: ${ this.lives }`, 20, 60);
        if (this.lives < 0) {

            ctx.fillStyle = `rgba(0, 0, 0, 0.8)`;
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = `rgba(255, 0, 0, 0.8)`;
            ctx.fillText("loser", 400, 200);
        }
    }
}
exports.Game = Game;

},{"./astroid":2,"./player.js":7}],7:[function(require,module,exports){
"use strict";

var _bolt = require('./bolt');

const MS_PER_FRAME = 1000 / 8;

module.exports = exports = Player;
let soundEffect = new Audio(encodeURI('assets/bong.ogg'));

function Player(position, canvas, world) {
  this.world = world;
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 0,
    y: 0
  };
  this.angle = 0;
  this.radius = 64;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;

  var self = this;
  window.onkeydown = function (event) {
    switch (event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = true;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = true;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = true;
        break;
      case ' ':
        _bolt.Bolt.create(world, self);
        soundEffect.play();
        break;
    }
  };

  window.onkeyup = function (event) {
    switch (event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = false;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = false;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = false;
        break;
      case 'c':
        self.reposition();
        break;
    }
  };
}

Player.prototype.reposition = function () {
  this.position = {
    x: this.worldWidth * Math.random(),
    y: this.worldWidth * Math.random()
  };
  this.velocity = {
    x: 0,
    y: 0
  };
};

Player.prototype.update = function (time) {
  // Apply angular velocity
  if (this.steerLeft) {
    this.angle += time * 0.005;
  }
  if (this.steerRight) {
    this.angle -= 0.1;
  }
  // Apply acceleration
  if (this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle),
      y: Math.cos(this.angle)
    };
    this.velocity.x -= acceleration.x / 4;
    this.velocity.y -= acceleration.y / 4;
  }
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if (this.position.x < 0) this.position.x += this.worldWidth;
  if (this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if (this.position.y < 0) this.position.y += this.worldHeight;
  if (this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
};

Player.prototype.render = function (time, ctx) {
  ctx.save();

  // Draw player's ship
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.strokeStyle = 'white';
  ctx.stroke();

  // Draw engine thrust
  if (this.thrusting) {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(5, 10);
    ctx.arc(0, 10, 5, 0, Math.PI, true);
    ctx.closePath();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }
  ctx.restore();
};

},{"./bolt":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2FzdHJvaWQuanMiLCJzcmMvYm9sdC5qcyIsInNyYy9jb21tb24vYWN0b3IuanMiLCJzcmMvY29tbW9uL2V2ZW50cy5qcyIsInNyYy9nYW1lLmpzIiwic3JjL3BsYXllci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBOztBQUVBLElBQUksU0FBUyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBYjtBQUNBLElBQUksT0FBTyxlQUFTLE1BQVQsQ0FBWDs7QUFFQSxJQUFJLGFBQWEsVUFBUyxTQUFULEVBQW9CO0FBQ25DLE9BQUssSUFBTCxDQUFVLFNBQVY7QUFDQSxTQUFPLHFCQUFQLENBQTZCLFVBQTdCO0FBQ0QsQ0FIRDtBQUlBLFdBQVcsWUFBWSxHQUFaLEVBQVg7Ozs7Ozs7Ozs7QUNYQTs7QUFFQSxTQUFTLFNBQVQsQ0FBbUIsSUFBbkIsRUFBeUI7QUFDckIsUUFBSSxRQUFRLElBQUksS0FBSixFQUFaO0FBQ0EsVUFBTSxHQUFOLEdBQWEsYUFBVyxJQUFLLE9BQTdCO0FBQ0EsV0FBTyxLQUFQO0FBQ0g7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QixLQUFLLEVBQTFCLEVBQThCLElBQTlCO0FBQ0EsUUFBSSxTQUFKO0FBQ0EsUUFBSSxXQUFKLEdBQWtCLFFBQWxCO0FBQ0EsUUFBSSxNQUFKO0FBQ0Q7QUFDRCxNQUFJLE9BQUo7QUFDRCxDQTFCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtHYW1lfSBmcm9tICcuL2dhbWUuanMnXG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NyZWVuJyk7XG52YXIgZ2FtZSA9IG5ldyBHYW1lKGNhbnZhcyk7XG5cbnZhciBtYXN0ZXJMb29wID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gIGdhbWUubG9vcCh0aW1lc3RhbXApO1xuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1hc3Rlckxvb3ApO1xufVxubWFzdGVyTG9vcChwZXJmb3JtYW5jZS5ub3coKSk7XG4iLCJpbXBvcnQge0FjdG9yfSBmcm9tICcuL2NvbW1vbi9hY3RvcidcblxuZnVuY3Rpb24gbG9hZEltYWdlKG5hbWUpIHtcbiAgICBsZXQgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxuICAgIGltYWdlLnNyYyA9IGAuL2Fzc2V0cy8ke25hbWV9LnBuZ2BcbiAgICByZXR1cm4gaW1hZ2Vcbn1cblxuLy8gZXhwb3J0IGNsYXNzIEFzdHJvaWQgZXh0ZW5kcyBBY3RvciB7XG4vLyAgICAgY29uc3RydWN0b3Iod29ybGQsIHt4LCB5LCByLCBkeCwgZHksIGRyLCBzY2FsZX0pIHtcbi8vICAgICAgICAgc3VwZXIod29ybGQpXG4vLyAgICAgICAgIHRoaXMueCA9IHhcbi8vICAgICAgICAgdGhpcy55ID0geVxuLy8gICAgICAgICB0aGlzLnJvdCA9IHJcbi8vXG4vLyAgICAgICAgIHRoaXMuZHggPSBkeFxuLy8gICAgICAgICB0aGlzLmR5ID0gZHlcbi8vICAgICAgICAgdGhpcy5kcm90ID0gZHJcbi8vXG4vLyAgICAgICAgIC8vIHRoaXMucG9pbnRzID0gW1xuLy8gICAgICAgICAvLyAgICAge3g6IDEsIHk6IDF9LFxuLy8gICAgICAgICAvLyAgICAge3g6IDEsIHk6IDEyfSxcbi8vICAgICAgICAgLy8gICAgIHt4OiAtMTAsIHk6IDh9LFxuLy8gICAgICAgICAvLyAgICAge3g6IC0xNiwgeTogLTJ9LFxuLy8gICAgICAgICAvLyAgICAge3g6IC00LCB5OiAtMTB9LFxuLy8gICAgICAgICAvLyAgICAge3g6IDgsIHk6IC0xMH0sXG4vLyAgICAgICAgIC8vICAgICB7eDogMTIsIHk6IDB9LFxuLy8gICAgICAgICAvLyBdXG4vLyAgICAgICAgIHRoaXMucG9pbnRzID0gW1xuLy8gICAgICAgICAgICAge3g6IC0xMiwgeTogLTEyfSxcbi8vICAgICAgICAgICAgIHt4OiAtMTIsIHk6IDEyfSxcbi8vICAgICAgICAgICAgIHt4OiAxMiwgeTogMTJ9LFxuLy8gICAgICAgICAgICAge3g6IDEyLCB5OiAtMTJ9LFxuLy8gICAgICAgICBdXG4vLyAgICAgICAgIHRoaXMuc2NhbGUgPSBzY2FsZVxuLy8gICAgIH1cbi8vXG4vLyAgICAgKmJhc2VDb250cm9sU3RhdGUoKSB7XG4vLyAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4vLyAgICAgICAgICAgICBsZXQge2R0fSA9IHlpZWxkXG4vLyAgICAgICAgICAgICB0aGlzLnJvdCArPSB0aGlzLmRyb3Rcbi8vICAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLmR4XG4vLyAgICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy5keVxuLy9cbi8vICAgICAgICAgICAgIGxldCBvbl9zY3JlZW5feCA9IDBcbi8vICAgICAgICAgICAgIGxldCBvbl9zY3JlZW5feSA9IDBcbi8vICAgICAgICAgICAgIGZvciAobGV0IHt4LCB5fSBvZiB0aGlzLnBvaW50cykge1xuLy8gICAgICAgICAgICAgICAgIHggPSB0aGlzLnggKyB4KnRoaXMuc2NhbGVcbi8vICAgICAgICAgICAgICAgICB5ID0gdGhpcy55ICsgeSp0aGlzLnNjYWxlXG4vLyAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coeCwgeSlcbi8vICAgICAgICAgICAgICAgICBvbl9zY3JlZW5feCB8PSAoeCA+IDAgJiYgeCA8IHRoaXMud29ybGQud2lkdGgpfDBcbi8vICAgICAgICAgICAgICAgICBvbl9zY3JlZW5feSB8PSAoeSA+IDAgJiYgeSA8IHRoaXMud29ybGQuaGVpZ2h0KXwwXG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICBpZiAoIW9uX3NjcmVlbl94KSB7XG4vLyAgICAgICAgICAgICAgICAgaWYgKCh0aGlzLnggPCAwICYmIHRoaXMuZHggPCAwKSB8fCAodGhpcy54ID4gdGhpcy53b3JsZC53aWR0aCAmJiB0aGlzLmR4ID4gMCkpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgdGhpcy54ID0gdGhpcy53b3JsZC53aWR0aCAtIHRoaXMueFxuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIGlmICghb25fc2NyZWVuX3kpIHtcbi8vICAgICAgICAgICAgICAgICBpZiAoKHRoaXMueSA8IDAgJiYgdGhpcy5keSA8IDApIHx8ICh0aGlzLnkgPiB0aGlzLndvcmxkLmhlaWdodCAmJiB0aGlzLmR5ID4gMCkpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgdGhpcy55ID0gdGhpcy53b3JsZC5oZWlnaHQgLSB0aGlzLnlcbi8vICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vL1xuLy8gICAgICpiYXNlUmVuZGVyU3RhdGUoKSB7XG4vLyAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4vLyAgICAgICAgICAgICBsZXQge2N0eCwgZHR9ID0geWllbGRcbi8vICAgICAgICAgICAgIGxldCBwb2ludHMgPSByb3RhdGUodGhpcy5yb3QsIHRoaXMucG9pbnRzKVxuLy8gICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4vLyAgICAgICAgICAgICBjdHgubGluZVdpZHRoPVwiMlwiXG4vLyAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGU9XCJncmV5XCJcbi8vXG4vLyAgICAgICAgICAgICBsZXQge3gsIHl9ID0gcG9pbnRzWzBdXG4vLyAgICAgICAgICAgICBjdHgubW92ZVRvKHRoaXMueCt4KnRoaXMuc2NhbGUsIHRoaXMueSt5KnRoaXMuc2NhbGUpXG4vLyAgICAgICAgICAgICBmb3IgKGxldCB7eCwgeX0gb2YgcG9pbnRzKSB7XG4vLyAgICAgICAgICAgICAgICAgY3R4LmxpbmVUbyh0aGlzLngreCp0aGlzLnNjYWxlLCB0aGlzLnkreSp0aGlzLnNjYWxlKVxuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgY3R4LmxpbmVUbyh0aGlzLngreCp0aGlzLnNjYWxlLCB0aGlzLnkreSp0aGlzLnNjYWxlKVxuLy8gICAgICAgICAgICAgY3R4LnN0cm9rZSgpXG4vLyAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3llbGxvdydcbi8vICAgICAgICAgICAgIGN0eC5maWxsUmVjdCh0aGlzLngsIHRoaXMueSwgMiwgMilcbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vIH1cbi8vXG4vLyBmdW5jdGlvbiByb3RhdGUocm90LCBwb2ludHMpIHtcbi8vICAgICBsZXQgcmVzdWx0ID0gW11cbi8vICAgICBsZXQgc2luID0gTWF0aC5zaW4ocm90KVxuLy8gICAgIGxldCBjb3MgPSBNYXRoLmNvcyhyb3QpXG4vL1xuLy8gICAgIGZvciAobGV0IHt4LCB5fSBvZiBwb2ludHMpIHtcbi8vICAgICAgICAgcmVzdWx0LnB1c2goe1xuLy8gICAgICAgICAgICAgeDogeCpjb3MgLSB5KnNpbixcbi8vICAgICAgICAgICAgIHk6IHgqc2luICsgeSpjb3MsXG4vLyAgICAgICAgIH0pXG4vLyAgICAgfVxuLy8gICAgIHJldHVybiByZXN1bHRcbi8vIH1cblxuXG5jb25zdCBTUFJJVEVTID0gW1xuICAgIGxvYWRJbWFnZSgncm9pZDEnKSxcbiAgICBsb2FkSW1hZ2UoJ3JvaWQyJyksXG4gICAgbG9hZEltYWdlKCdyb2lkMycpLFxuICAgIGxvYWRJbWFnZSgncm9pZDQnKSxcbiAgICBsb2FkSW1hZ2UoJ3JvaWQ1JyksXG5dXG5jb25zdCBiYXNlX3NpemUgPSAyMFxuXG5leHBvcnQgY2xhc3MgQXN0cm9pZCBleHRlbmRzIEFjdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCwge3gsIHksIHIsIGR4LCBkeSwgZHIsIHNjYWxlfSkge1xuICAgICAgICBzdXBlcih3b3JsZClcbiAgICAgICAgdGhpcy54ID0geFxuICAgICAgICB0aGlzLnkgPSB5XG4gICAgICAgIHRoaXMucm90ID0gclxuXG4gICAgICAgIHRoaXMuZHggPSBkeFxuICAgICAgICB0aGlzLmR5ID0gZHlcbiAgICAgICAgdGhpcy5kcm90ID0gZHJcblxuICAgICAgICB0aGlzLnNjYWxlID0gc2NhbGVcbiAgICAgICAgdGhpcy5pbWFnZSA9IFNQUklURVNbKE1hdGgucmFuZG9tKCkgKiBTUFJJVEVTLmxlbmd0aCl8MF1cbiAgICAgICAgdGhpcy5jb2xsaXNpb25fdGltZW91dCA9IDBcbiAgICAgICAgdGhpcy5jb2xsaXNpb25fYWRqdXN0X3RpbWVvdXQgPSAwXG4gICAgfVxuXG4gICAgcmFkaXVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zY2FsZSAqIGJhc2Vfc2l6ZSAvIDJcbiAgICB9XG5cbiAgICBleHBsb2RlKCkge1xuXG4gICAgICAgIGxldCBuZXdhID0gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcy53b3JsZCwge1xuICAgICAgICAgICAgeDogdGhpcy54LFxuICAgICAgICAgICAgeTogdGhpcy55LFxuICAgICAgICAgICAgcjogKC0uNSArIE1hdGgucmFuZG9tKCkpKjQsXG4gICAgICAgICAgICBkeDogKC0uNSArIE1hdGgucmFuZG9tKCkpKjQsXG4gICAgICAgICAgICBkeTogKC0uNSArIE1hdGgucmFuZG9tKCkpKjQsXG4gICAgICAgICAgICBkcjogKC0uNSArIE1hdGgucmFuZG9tKCkpLzQsXG4gICAgICAgICAgICBzY2FsZTogKHRoaXMuc2NhbGUgLyAyKXwwLFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLndvcmxkLmFzdHJvaWRzLnB1c2gobmV3YSlcbiAgICAgICAgdGhpcy5zY2FsZSA9IHRoaXMuc2NhbGUgLT0gMVxuICAgIH1cblxuICAgIGNvbGxlY3QoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NhbGUgPCAxXG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZSh3b3JsZCkge1xuICAgICAgICBsZXQgdCA9IG5ldyB0aGlzKHdvcmxkLCB7XG4gICAgICAgICAgICB4OiAod29ybGQud2lkdGggKiBNYXRoLnJhbmRvbSgpKXwwLFxuICAgICAgICAgICAgeTogKHdvcmxkLmhlaWdodCAqIE1hdGgucmFuZG9tKCkpfDAsXG4gICAgICAgICAgICByOiAoLS41ICsgTWF0aC5yYW5kb20oKSkqNCxcbiAgICAgICAgICAgIGR4OiAoLS41ICsgTWF0aC5yYW5kb20oKSkqNCxcbiAgICAgICAgICAgIGR5OiAoLS41ICsgTWF0aC5yYW5kb20oKSkqNCxcbiAgICAgICAgICAgIGRyOiAoLS41ICsgTWF0aC5yYW5kb20oKSkvNCxcbiAgICAgICAgICAgIHNjYWxlOiAoTWF0aC5yYW5kb20oKSo1KXwwICsgMSxcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHRcbiAgICB9XG5cbiAgICAqYmFzZUNvbnRyb2xTdGF0ZSgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHR9ID0geWllbGRcbiAgICAgICAgICAgIHRoaXMucm90ICs9IHRoaXMuZHJvdFxuICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMuZHhcbiAgICAgICAgICAgIHRoaXMueSArPSB0aGlzLmR5XG4gICAgICAgICAgICBsZXQgcmFkaXVzID0gYmFzZV9zaXplICogdGhpcy5zY2FsZSAvIDJcblxuICAgICAgICAgICAgaWYgKCh0aGlzLnggKyByYWRpdXMgPCAwICYmIHRoaXMuZHggPCAwKSB8fCAodGhpcy54IC0gcmFkaXVzID4gdGhpcy53b3JsZC53aWR0aCAmJiB0aGlzLmR4ID4gMCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnggPSB0aGlzLndvcmxkLndpZHRoIC0gdGhpcy54XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgodGhpcy55ICsgcmFkaXVzIDwgMCAmJiB0aGlzLmR5IDwgMCkgfHwgKHRoaXMueSAtIHJhZGl1cyA+IHRoaXMud29ybGQuaGVpZ2h0ICYmIHRoaXMuZHkgPiAwKSkge1xuICAgICAgICAgICAgICAgIHRoaXMueSA9IHRoaXMud29ybGQuaGVpZ2h0IC0gdGhpcy55XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgICpiYXNlUmVuZGVyU3RhdGUoKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2N0eCwgZHR9ID0geWllbGRcbiAgICAgICAgICAgIGxldCByYWRpdXMgPSBiYXNlX3NpemUgKiB0aGlzLnNjYWxlIC8gMlxuICAgICAgICAgICAgY3R4LnNhdmUoKVxuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSlcbiAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5yb3QpXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKHRoaXMuaW1hZ2UsIC1yYWRpdXMsIC1yYWRpdXMsIHJhZGl1cyoyLCByYWRpdXMqMilcbiAgICAgICAgICAgIC8vIGN0eC5zdHJva2VTdHlsZSA9ICd5ZWxsb3cnXG4gICAgICAgICAgICAvLyBjdHguYXJjKDAsIDAsIHJhZGl1cywgMCwgNylcbiAgICAgICAgICAgIC8vIGN0eC5zdHJva2UoKVxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHtBY3Rvcn0gZnJvbSAnLi9jb21tb24vYWN0b3InXG5cblxuZXhwb3J0IGNsYXNzIEJvbHQgZXh0ZW5kcyBBY3RvciB7XG4gICAgY29uc3RydWN0b3Iod29ybGQsIHt4LCB5LCByfSkge1xuICAgICAgICBzdXBlcih3b3JsZClcbiAgICAgICAgciArPSBNYXRoLlBJXG4gICAgICAgIHRoaXMueCA9IHhcbiAgICAgICAgdGhpcy55ID0geVxuICAgICAgICB0aGlzLmR4ID0gTWF0aC5zaW4ocikqNFxuICAgICAgICB0aGlzLmR5ID0gTWF0aC5jb3MocikqNFxuICAgICAgICB0aGlzLnJvdCA9IHJcbiAgICAgICAgdGhpcy5fY29sbGVjdCA9IGZhbHNlXG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZSh3b3JsZCwgcGxheWVyKSB7XG4gICAgICAgIGxldCB0ID0gbmV3IHRoaXMod29ybGQsIHtcbiAgICAgICAgICAgIHg6IHBsYXllci5wb3NpdGlvbi54LFxuICAgICAgICAgICAgeTogcGxheWVyLnBvc2l0aW9uLnksXG4gICAgICAgICAgICByOiBwbGF5ZXIuYW5nbGUsXG4gICAgICAgIH0pXG4gICAgICAgIHdvcmxkLmJvbHRzLnB1c2godClcbiAgICAgICAgcmV0dXJuIHRcbiAgICB9XG5cbiAgICBjb2xsZWN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29sbGVjdFxuICAgIH1cblxuICAgICpiYXNlQ29udHJvbFN0YXRlKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdH0gPSB5aWVsZFxuICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMuZHhcbiAgICAgICAgICAgIHRoaXMueSArPSB0aGlzLmR5XG4gICAgICAgICAgICBsZXQgcmFkaXVzID0gNVxuXG4gICAgICAgICAgICBpZiAoKHRoaXMueCArIHJhZGl1cyA8IDAgJiYgdGhpcy5keCA8IDApIHx8ICh0aGlzLnggLSByYWRpdXMgPiB0aGlzLndvcmxkLndpZHRoICYmIHRoaXMuZHggPiAwKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbGxlY3QgPSB0cnVlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgodGhpcy55ICsgcmFkaXVzIDwgMCAmJiB0aGlzLmR5IDwgMCkgfHwgKHRoaXMueSAtIHJhZGl1cyA+IHRoaXMud29ybGQuaGVpZ2h0ICYmIHRoaXMuZHkgPiAwKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbGxlY3QgPSB0cnVlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgICpiYXNlUmVuZGVyU3RhdGUoKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2N0eCwgZHR9ID0geWllbGRcbiAgICAgICAgICAgIGN0eC5zYXZlKClcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAneWVsbG93J1xuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ3llbGxvdydcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSlcbiAgICAgICAgICAgIGN0eC5yb3RhdGUoLXRoaXMucm90KVxuICAgICAgICAgICAgY3R4Lm1vdmVUbygwLCAtNSlcbiAgICAgICAgICAgIGN0eC5saW5lVG8oMCwgKzUpXG4gICAgICAgICAgICBjdHguc3Ryb2tlKClcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKClcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0V2ZW50TGlzdGVuZXJ9IGZyb20gXCIuL2V2ZW50cy5qc1wiO1xuXG5cbmV4cG9ydCBjbGFzcyBBY3RvciB7XG4gICAgY29uc3RydWN0b3Iod29ybGQpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRMaXN0ZW5lcigpO1xuXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy53aWR0aCA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuXG4gICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5iYXNlQ29udHJvbFN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMuYmFzZVJlbmRlclN0YXRlLmJpbmQodGhpcykoKTtcbiAgICB9XG5cbiAgICBnZXRIaXRCb3hlcygpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbGxlY3QoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB1cGRhdGUoZHQpIHtcbiAgICAgICAgbGV0IGN1ciA9IHRoaXMuY29udHJvbFN0YXRlLm5leHQoe2R0OiBkdH0pO1xuICAgICAgICBpZiAoY3VyLnZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gY3VyLnZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xTdGF0ZSA9IHRoaXMuYmFzZUNvbnRyb2xTdGF0ZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoZHQsIGN0eCkge1xuICAgICAgICBsZXQgY3VyID0gdGhpcy5yZW5kZXJTdGF0ZS5uZXh0KHtkdDogZHQsIGN0eDogY3R4fSk7XG4gICAgICAgIGlmIChjdXIudmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IGN1ci52YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIuZG9uZSkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMuYmFzZVJlbmRlclN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICpiYXNlQ29udHJvbFN0YXRlICgpIHt9XG4gICAgKmJhc2VSZW5kZXJTdGF0ZSAoKSB7fVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cblxuZXhwb3J0IGNsYXNzIEV2ZW50TGlzdGVuZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IHt9O1xuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZnVuYykge1xuICAgICAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHNbbmFtZV0gfHwgW107XG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gZXZlbnRzO1xuXG4gICAgICAgIGV2ZW50cy5wdXNoKGZ1bmMpO1xuICAgIH1cblxuICAgIGVtaXQobmFtZSwgYXJncykge1xuICAgICAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHNbbmFtZV0gfHwgW107XG4gICAgICAgIGZvciAobGV0IGV2IG9mIGV2ZW50cykge1xuICAgICAgICAgICAgZXYoYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtBc3Ryb2lkfSBmcm9tICcuL2FzdHJvaWQnXG5jb25zdCBQbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllci5qcycpO1xuXG5sZXQgc291bmRFZmZlY3QgPSBuZXcgQXVkaW8oZW5jb2RlVVJJKCdhc3NldHMvYm9uZy5vZ2cnKSk7XG5cbmZ1bmN0aW9uIHN3YXAoYSwgYikge1xuICAgIGxldCB0ID0gYS5keFxuICAgIGEuZHggPSBiLmR4KmIuc2NhbGUvYS5zY2FsZVxuICAgIGIuZHggPSB0KmEuc2NhbGUvYi5zY2FsZVxuXG4gICAgdCA9IGEuZHlcbiAgICBhLmR5ID0gYi5keSpiLnNjYWxlL2Euc2NhbGVcbiAgICBiLmR5ID0gdCphLnNjYWxlL2Iuc2NhbGVcbn1cblxuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3Ioc2NyZWVuKSB7XG5cbiAgICAgICAgLy8gU2V0IHVwIGJ1ZmZlcnNcbiAgICAgICAgdGhpcy5mcm9udEJ1ZmZlciA9IHNjcmVlbjtcbiAgICAgICAgdGhpcy5mcm9udEN0eCA9IHNjcmVlbi5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5iYWNrQnVmZmVyLndpZHRoID0gc2NyZWVuLndpZHRoO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIuaGVpZ2h0ID0gc2NyZWVuLmhlaWdodDtcbiAgICAgICAgdGhpcy5iYWNrQ3R4ID0gdGhpcy5iYWNrQnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IHNjcmVlbi53aWR0aFxuICAgICAgICB0aGlzLmhlaWdodCA9IHNjcmVlbi5oZWlnaHRcblxuICAgICAgICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gICAgICAgIHRoaXMub2xkVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuYXN0cm9pZHMgPSBbXVxuICAgICAgICB0aGlzLmJvbHRzID0gW11cbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyKHt4OiB0aGlzLmJhY2tCdWZmZXIud2lkdGgvMiwgeTogdGhpcy5iYWNrQnVmZmVyLmhlaWdodC8yfSwgdGhpcy5iYWNrQnVmZmVyLCB0aGlzKTtcbiAgICAgICAgdGhpcy5zY29yZSA9IDBcbiAgICAgICAgdGhpcy5sZXZlbCA9IDBcbiAgICAgICAgdGhpcy5saXZlcyA9IDNcbiAgICB9XG5cbiAgICBwYXVzZShmbGFnKSB7XG4gICAgICAgIHRoaXMucGF1c2VkID0gKGZsYWcgPT0gdHJ1ZSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQXN0cm9pZHMobikge1xuICAgICAgICBmb3IgKGxldCBpPTA7IGk8bjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmFzdHJvaWRzLnB1c2goQXN0cm9pZC5jcmVhdGUodGhpcykpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb29wKG5ld1RpbWUpIHtcbiAgICAgICAgdmFyIGdhbWUgPSB0aGlzO1xuICAgICAgICB2YXIgZWxhcHNlZFRpbWUgPSBuZXdUaW1lIC0gdGhpcy5vbGRUaW1lO1xuICAgICAgICB0aGlzLm9sZFRpbWUgPSBuZXdUaW1lO1xuXG4gICAgICAgIGlmKCF0aGlzLnBhdXNlZCkgdGhpcy51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAgICAgICB0aGlzLnJlbmRlcihlbGFwc2VkVGltZSwgdGhpcy5iYWNrQ3R4KTtcbiAgICAgICAgdGhpcy5mcm9udEN0eC5kcmF3SW1hZ2UodGhpcy5iYWNrQnVmZmVyLCAwLCAwKTtcbiAgICB9XG5cblxuICAgIHVwZGF0ZShlbGFwc2VkVGltZSkge1xuICAgICAgICB0aGlzLnBsYXllci51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAgICAgICBmb3IgKGxldCBhc3Ryb2lkIG9mIHRoaXMuYXN0cm9pZHMpIHtcbiAgICAgICAgICAgIGFzdHJvaWQudXBkYXRlKGVsYXBzZWRUaW1lKVxuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGJvbHRzIG9mIHRoaXMuYm9sdHMpIHtcbiAgICAgICAgICAgIGJvbHRzLnVwZGF0ZShlbGFwc2VkVGltZSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFzdHJvaWRzID0gdGhpcy5hc3Ryb2lkcy5maWx0ZXIoKGUpPT4hZS5jb2xsZWN0KCkpXG4gICAgICAgIHRoaXMuYm9sdHMgPSB0aGlzLmJvbHRzLmZpbHRlcigoZSk9PiFlLmNvbGxlY3QoKSlcbiAgICAgICAgaWYgKHRoaXMuYXN0cm9pZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUFzdHJvaWRzKDEwKVxuICAgICAgICAgICAgdGhpcy5sZXZlbCArPSAxXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaSA9IDBcbiAgICAgICAgZm9yIChsZXQgYXN0cm9pZCBvZiB0aGlzLmFzdHJvaWRzKSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5wb3codGhpcy5wbGF5ZXIucG9zaXRpb24ueCAtIGFzdHJvaWQueCwgMikgKyBNYXRoLnBvdyh0aGlzLnBsYXllci5wb3NpdGlvbi55IC0gYXN0cm9pZC55LCAyKSA8IE1hdGgucG93KDUrYXN0cm9pZC5yYWRpdXMoKSwgMikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpdmVzIC09IDFcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5yZXBvc2l0aW9uKClcbiAgICAgICAgICAgICAgICBzb3VuZEVmZmVjdC5wbGF5KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IGJvbHQgb2YgdGhpcy5ib2x0cykge1xuICAgICAgICAgICAgICAgIGlmIChNYXRoLnBvdyhib2x0LnggLSBhc3Ryb2lkLngsIDIpICsgTWF0aC5wb3coYm9sdC55IC0gYXN0cm9pZC55LCAyKSA8IE1hdGgucG93KGFzdHJvaWQucmFkaXVzKCksIDIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvbHQuX2NvbGxlY3QgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGFzdHJvaWQuZXhwbG9kZSgpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcmUgKz0gMTBcbiAgICAgICAgICAgICAgICAgICAgc291bmRFZmZlY3QucGxheSgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBsZXQgaXNfY29sbGlkaW5nID0gZmFsc2VcbiAgICAgICAgICAgIGZvciAobGV0IG90aGVyYXN0cm9pZCBvZiB0aGlzLmFzdHJvaWRzLmNvbmNhdCgpLnNwbGljZShpKSkge1xuICAgICAgICAgICAgICAgIGlmIChNYXRoLnBvdyhvdGhlcmFzdHJvaWQueCAtIGFzdHJvaWQueCwgMikgKyBNYXRoLnBvdyhvdGhlcmFzdHJvaWQueSAtIGFzdHJvaWQueSwgMikgPCBNYXRoLnBvdyhhc3Ryb2lkLnJhZGl1cygpK290aGVyYXN0cm9pZC5yYWRpdXMoKSwgMikpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNfY29sbGlkaW5nID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXN0cm9pZC5jb2xsaXNpb25fdGltZW91dCA8IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3YXAoYXN0cm9pZCwgb3RoZXJhc3Ryb2lkKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNfY29sbGlkaW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFzdHJvaWQuY29sbGlzaW9uX2FkanVzdF90aW1lb3V0IDwgMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzdHJvaWQuY29sbGlzaW9uX2FkanVzdF90aW1lb3V0KytcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhc3Ryb2lkLmNvbGxpc2lvbl9hZGp1c3RfdGltZW91dCA9IDBcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FkanVzdCcpXG4gICAgICAgICAgICAgICAgICAgIGFzdHJvaWQuZHggPSAoLS41K01hdGgucmFuZG9tKCkpKjVcbiAgICAgICAgICAgICAgICAgICAgYXN0cm9pZC5keSA9ICgtLjUrTWF0aC5yYW5kb20oKSkqNVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhc3Ryb2lkLmNvbGxpc2lvbl90aW1lb3V0ICs9IDFcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXN0cm9pZC5jb2xsaXNpb25fYWRqdXN0X3RpbWVvdXQgPSAwXG4gICAgICAgICAgICAgICAgYXN0cm9pZC5jb2xsaXNpb25fdGltZW91dCAtPSAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhc3Ryb2lkLmNvbGxpc2lvbl90aW1lb3V0ID0gTWF0aC5taW4oYXN0cm9pZC5jb2xsaXNpb25fdGltZW91dCwgMTApXG4gICAgICAgICAgICBhc3Ryb2lkLmNvbGxpc2lvbl90aW1lb3V0ID0gTWF0aC5tYXgoYXN0cm9pZC5jb2xsaXNpb25fdGltZW91dCwgMClcblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpIHtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuYmFja0J1ZmZlci53aWR0aCwgdGhpcy5iYWNrQnVmZmVyLmhlaWdodCk7XG4gICAgICAgIHRoaXMucGxheWVyLnJlbmRlcihlbGFwc2VkVGltZSwgY3R4KTtcblxuICAgICAgICBmb3IgKGxldCBhc3Ryb2lkIG9mIHRoaXMuYXN0cm9pZHMpIHtcbiAgICAgICAgICAgIGFzdHJvaWQucmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpXG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgYm9sdHMgb2YgdGhpcy5ib2x0cykge1xuICAgICAgICAgICAgYm9sdHMucmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpXG4gICAgICAgIH1cbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwieWVsbG93XCI7XG4gICAgICAgIGN0eC5maWxsVGV4dChgU2NvcmU6ICR7dGhpcy5zY29yZX1gLCAyMCwgMjApXG4gICAgICAgIGN0eC5maWxsVGV4dChgTGV2ZWw6ICR7dGhpcy5sZXZlbH1gLCAyMCwgNDApXG4gICAgICAgIGN0eC5maWxsVGV4dChgTGl2ZXM6ICR7dGhpcy5saXZlc31gLCAyMCwgNjApXG4gICAgICAgIGlmICh0aGlzLmxpdmVzIDwgMCkge1xuXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gYHJnYmEoMCwgMCwgMCwgMC44KWBcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodClcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBgcmdiYSgyNTUsIDAsIDAsIDAuOClgXG4gICAgICAgICAgICBjdHguZmlsbFRleHQoXCJsb3NlclwiLCA0MDAsIDIwMClcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBNU19QRVJfRlJBTUUgPSAxMDAwLzg7XG5cbmltcG9ydCB7Qm9sdH0gZnJvbSAnLi9ib2x0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQbGF5ZXI7XG5sZXQgc291bmRFZmZlY3QgPSBuZXcgQXVkaW8oZW5jb2RlVVJJKCdhc3NldHMvYm9uZy5vZ2cnKSk7XG5cbmZ1bmN0aW9uIFBsYXllcihwb3NpdGlvbiwgY2FudmFzLCB3b3JsZCkge1xuICAgIHRoaXMud29ybGQgPSB3b3JsZFxuICB0aGlzLndvcmxkV2lkdGggPSBjYW52YXMud2lkdGg7XG4gIHRoaXMud29ybGRIZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuICB0aGlzLnN0YXRlID0gXCJpZGxlXCI7XG4gIHRoaXMucG9zaXRpb24gPSB7XG4gICAgeDogcG9zaXRpb24ueCxcbiAgICB5OiBwb3NpdGlvbi55XG4gIH07XG4gIHRoaXMudmVsb2NpdHkgPSB7XG4gICAgeDogMCxcbiAgICB5OiAwXG4gIH1cbiAgdGhpcy5hbmdsZSA9IDA7XG4gIHRoaXMucmFkaXVzICA9IDY0O1xuICB0aGlzLnRocnVzdGluZyA9IGZhbHNlO1xuICB0aGlzLnN0ZWVyTGVmdCA9IGZhbHNlO1xuICB0aGlzLnN0ZWVyUmlnaHQgPSBmYWxzZTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHdpbmRvdy5vbmtleWRvd24gPSBmdW5jdGlvbihldmVudCkge1xuICAgIHN3aXRjaChldmVudC5rZXkpIHtcbiAgICAgIGNhc2UgJ0Fycm93VXAnOiAvLyB1cFxuICAgICAgY2FzZSAndyc6XG4gICAgICAgIHNlbGYudGhydXN0aW5nID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBcnJvd0xlZnQnOiAvLyBsZWZ0XG4gICAgICBjYXNlICdhJzpcbiAgICAgICAgc2VsZi5zdGVlckxlZnQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOiAvLyByaWdodFxuICAgICAgY2FzZSAnZCc6XG4gICAgICAgIHNlbGYuc3RlZXJSaWdodCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnICc6XG4gICAgICAgIEJvbHQuY3JlYXRlKHdvcmxkLCBzZWxmKVxuICAgICAgICBzb3VuZEVmZmVjdC5wbGF5KClcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgd2luZG93Lm9ua2V5dXAgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHN3aXRjaChldmVudC5rZXkpIHtcbiAgICAgIGNhc2UgJ0Fycm93VXAnOiAvLyB1cFxuICAgICAgY2FzZSAndyc6XG4gICAgICAgIHNlbGYudGhydXN0aW5nID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQXJyb3dMZWZ0JzogLy8gbGVmdFxuICAgICAgY2FzZSAnYSc6XG4gICAgICAgIHNlbGYuc3RlZXJMZWZ0ID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQXJyb3dSaWdodCc6IC8vIHJpZ2h0XG4gICAgICBjYXNlICdkJzpcbiAgICAgICAgc2VsZi5zdGVlclJpZ2h0ID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYyc6XG4gICAgICAgIHNlbGYucmVwb3NpdGlvbigpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cblxuUGxheWVyLnByb3RvdHlwZS5yZXBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHtcbiAgICAgIHg6IHRoaXMud29ybGRXaWR0aCpNYXRoLnJhbmRvbSgpLFxuICAgICAgeTogdGhpcy53b3JsZFdpZHRoKk1hdGgucmFuZG9tKClcbiAgICB9O1xuICAgIHRoaXMudmVsb2NpdHkgPSB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMFxuICAgIH1cbn1cblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbih0aW1lKSB7XG4gIC8vIEFwcGx5IGFuZ3VsYXIgdmVsb2NpdHlcbiAgaWYodGhpcy5zdGVlckxlZnQpIHtcbiAgICB0aGlzLmFuZ2xlICs9IHRpbWUgKiAwLjAwNTtcbiAgfVxuICBpZih0aGlzLnN0ZWVyUmlnaHQpIHtcbiAgICB0aGlzLmFuZ2xlIC09IDAuMTtcbiAgfVxuICAvLyBBcHBseSBhY2NlbGVyYXRpb25cbiAgaWYodGhpcy50aHJ1c3RpbmcpIHtcbiAgICB2YXIgYWNjZWxlcmF0aW9uID0ge1xuICAgICAgeDogTWF0aC5zaW4odGhpcy5hbmdsZSksXG4gICAgICB5OiBNYXRoLmNvcyh0aGlzLmFuZ2xlKVxuICAgIH1cbiAgICB0aGlzLnZlbG9jaXR5LnggLT0gYWNjZWxlcmF0aW9uLngvNDtcbiAgICB0aGlzLnZlbG9jaXR5LnkgLT0gYWNjZWxlcmF0aW9uLnkvNDtcbiAgfVxuICAvLyBBcHBseSB2ZWxvY2l0eVxuICB0aGlzLnBvc2l0aW9uLnggKz0gdGhpcy52ZWxvY2l0eS54O1xuICB0aGlzLnBvc2l0aW9uLnkgKz0gdGhpcy52ZWxvY2l0eS55O1xuICAvLyBXcmFwIGFyb3VuZCB0aGUgc2NyZWVuXG4gIGlmKHRoaXMucG9zaXRpb24ueCA8IDApIHRoaXMucG9zaXRpb24ueCArPSB0aGlzLndvcmxkV2lkdGg7XG4gIGlmKHRoaXMucG9zaXRpb24ueCA+IHRoaXMud29ybGRXaWR0aCkgdGhpcy5wb3NpdGlvbi54IC09IHRoaXMud29ybGRXaWR0aDtcbiAgaWYodGhpcy5wb3NpdGlvbi55IDwgMCkgdGhpcy5wb3NpdGlvbi55ICs9IHRoaXMud29ybGRIZWlnaHQ7XG4gIGlmKHRoaXMucG9zaXRpb24ueSA+IHRoaXMud29ybGRIZWlnaHQpIHRoaXMucG9zaXRpb24ueSAtPSB0aGlzLndvcmxkSGVpZ2h0O1xufVxuXG5QbGF5ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHRpbWUsIGN0eCkge1xuICBjdHguc2F2ZSgpO1xuXG4gIC8vIERyYXcgcGxheWVyJ3Mgc2hpcFxuICBjdHgudHJhbnNsYXRlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcbiAgY3R4LnJvdGF0ZSgtdGhpcy5hbmdsZSk7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4Lm1vdmVUbygwLCAtMTApO1xuICBjdHgubGluZVRvKC0xMCwgMTApO1xuICBjdHgubGluZVRvKDAsIDApO1xuICBjdHgubGluZVRvKDEwLCAxMCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcbiAgY3R4LnN0cm9rZSgpO1xuXG4gIC8vIERyYXcgZW5naW5lIHRocnVzdFxuICBpZih0aGlzLnRocnVzdGluZykge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgubW92ZVRvKDAsIDIwKTtcbiAgICBjdHgubGluZVRvKDUsIDEwKTtcbiAgICBjdHguYXJjKDAsIDEwLCA1LCAwLCBNYXRoLlBJLCB0cnVlKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ29yYW5nZSc7XG4gICAgY3R4LnN0cm9rZSgpO1xuICB9XG4gIGN0eC5yZXN0b3JlKCk7XG59XG4iXX0=
