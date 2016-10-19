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
            }
            for (let bolt of this.bolts) {
                if (Math.pow(bolt.x - astroid.x, 2) + Math.pow(bolt.y - astroid.y, 2) < Math.pow(astroid.radius(), 2)) {
                    bolt._collect = true;
                    astroid.explode();
                    this.score += 10;
                }
            }
            i++;
            let is_colliding = false;
            for (let otherastroid of this.astroids.concat().splice(i)) {
                if (Math.pow(otherastroid.x - astroid.x, 2) + Math.pow(otherastroid.y - astroid.y, 2) < Math.pow(astroid.radius() + otherastroid.radius(), 2)) {
                    is_colliding = true;
                    if (astroid.collision_timeout < 1) {
                        ;[otherastroid.dx, astroid.dx, otherastroid.dy, astroid.dy] = [astroid.dx, otherastroid.dx, astroid.dy, otherastroid.dy];
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
    }
}
exports.Game = Game;

},{"./astroid":2,"./player.js":7}],7:[function(require,module,exports){
"use strict";

var _bolt = require("./bolt");

const MS_PER_FRAME = 1000 / 8;

module.exports = exports = Player;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2FzdHJvaWQuanMiLCJzcmMvYm9sdC5qcyIsInNyYy9jb21tb24vYWN0b3IuanMiLCJzcmMvY29tbW9uL2V2ZW50cy5qcyIsInNyYy9nYW1lLmpzIiwic3JjL3BsYXllci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBOztBQUVBLElBQUksU0FBUyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBYjtBQUNBLElBQUksT0FBTyxlQUFTLE1BQVQsQ0FBWDs7QUFFQSxJQUFJLGFBQWEsVUFBUyxTQUFULEVBQW9CO0FBQ25DLE9BQUssSUFBTCxDQUFVLFNBQVY7QUFDQSxTQUFPLHFCQUFQLENBQTZCLFVBQTdCO0FBQ0QsQ0FIRDtBQUlBLFdBQVcsWUFBWSxHQUFaLEVBQVg7Ozs7Ozs7Ozs7QUNYQTs7QUFFQSxTQUFTLFNBQVQsQ0FBbUIsSUFBbkIsRUFBeUI7QUFDckIsUUFBSSxRQUFRLElBQUksS0FBSixFQUFaO0FBQ0EsVUFBTSxHQUFOLEdBQWEsYUFBVyxJQUFLLE9BQTdCO0FBQ0EsV0FBTyxLQUFQO0FBQ0g7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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LEVBQWMsRUFBZDtBQUNBLFFBQUksTUFBSixDQUFXLENBQVgsRUFBYyxFQUFkO0FBQ0EsUUFBSSxHQUFKLENBQVEsQ0FBUixFQUFXLEVBQVgsRUFBZSxDQUFmLEVBQWtCLENBQWxCLEVBQXFCLEtBQUssRUFBMUIsRUFBOEIsSUFBOUI7QUFDQSxRQUFJLFNBQUo7QUFDQSxRQUFJLFdBQUosR0FBa0IsUUFBbEI7QUFDQSxRQUFJLE1BQUo7QUFDRDtBQUNELE1BQUksT0FBSjtBQUNELENBMUJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0dhbWV9IGZyb20gJy4vZ2FtZS5qcydcblxudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY3JlZW4nKTtcbnZhciBnYW1lID0gbmV3IEdhbWUoY2FudmFzKTtcblxudmFyIG1hc3Rlckxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgZ2FtZS5sb29wKHRpbWVzdGFtcCk7XG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobWFzdGVyTG9vcCk7XG59XG5tYXN0ZXJMb29wKHBlcmZvcm1hbmNlLm5vdygpKTtcbiIsImltcG9ydCB7QWN0b3J9IGZyb20gJy4vY29tbW9uL2FjdG9yJ1xuXG5mdW5jdGlvbiBsb2FkSW1hZ2UobmFtZSkge1xuICAgIGxldCBpbWFnZSA9IG5ldyBJbWFnZSgpXG4gICAgaW1hZ2Uuc3JjID0gYC4vYXNzZXRzLyR7bmFtZX0ucG5nYFxuICAgIHJldHVybiBpbWFnZVxufVxuXG4vLyBleHBvcnQgY2xhc3MgQXN0cm9pZCBleHRlbmRzIEFjdG9yIHtcbi8vICAgICBjb25zdHJ1Y3Rvcih3b3JsZCwge3gsIHksIHIsIGR4LCBkeSwgZHIsIHNjYWxlfSkge1xuLy8gICAgICAgICBzdXBlcih3b3JsZClcbi8vICAgICAgICAgdGhpcy54ID0geFxuLy8gICAgICAgICB0aGlzLnkgPSB5XG4vLyAgICAgICAgIHRoaXMucm90ID0gclxuLy9cbi8vICAgICAgICAgdGhpcy5keCA9IGR4XG4vLyAgICAgICAgIHRoaXMuZHkgPSBkeVxuLy8gICAgICAgICB0aGlzLmRyb3QgPSBkclxuLy9cbi8vICAgICAgICAgLy8gdGhpcy5wb2ludHMgPSBbXG4vLyAgICAgICAgIC8vICAgICB7eDogMSwgeTogMX0sXG4vLyAgICAgICAgIC8vICAgICB7eDogMSwgeTogMTJ9LFxuLy8gICAgICAgICAvLyAgICAge3g6IC0xMCwgeTogOH0sXG4vLyAgICAgICAgIC8vICAgICB7eDogLTE2LCB5OiAtMn0sXG4vLyAgICAgICAgIC8vICAgICB7eDogLTQsIHk6IC0xMH0sXG4vLyAgICAgICAgIC8vICAgICB7eDogOCwgeTogLTEwfSxcbi8vICAgICAgICAgLy8gICAgIHt4OiAxMiwgeTogMH0sXG4vLyAgICAgICAgIC8vIF1cbi8vICAgICAgICAgdGhpcy5wb2ludHMgPSBbXG4vLyAgICAgICAgICAgICB7eDogLTEyLCB5OiAtMTJ9LFxuLy8gICAgICAgICAgICAge3g6IC0xMiwgeTogMTJ9LFxuLy8gICAgICAgICAgICAge3g6IDEyLCB5OiAxMn0sXG4vLyAgICAgICAgICAgICB7eDogMTIsIHk6IC0xMn0sXG4vLyAgICAgICAgIF1cbi8vICAgICAgICAgdGhpcy5zY2FsZSA9IHNjYWxlXG4vLyAgICAgfVxuLy9cbi8vICAgICAqYmFzZUNvbnRyb2xTdGF0ZSgpIHtcbi8vICAgICAgICAgd2hpbGUgKHRydWUpIHtcbi8vICAgICAgICAgICAgIGxldCB7ZHR9ID0geWllbGRcbi8vICAgICAgICAgICAgIHRoaXMucm90ICs9IHRoaXMuZHJvdFxuLy8gICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMuZHhcbi8vICAgICAgICAgICAgIHRoaXMueSArPSB0aGlzLmR5XG4vL1xuLy8gICAgICAgICAgICAgbGV0IG9uX3NjcmVlbl94ID0gMFxuLy8gICAgICAgICAgICAgbGV0IG9uX3NjcmVlbl95ID0gMFxuLy8gICAgICAgICAgICAgZm9yIChsZXQge3gsIHl9IG9mIHRoaXMucG9pbnRzKSB7XG4vLyAgICAgICAgICAgICAgICAgeCA9IHRoaXMueCArIHgqdGhpcy5zY2FsZVxuLy8gICAgICAgICAgICAgICAgIHkgPSB0aGlzLnkgKyB5KnRoaXMuc2NhbGVcbi8vICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh4LCB5KVxuLy8gICAgICAgICAgICAgICAgIG9uX3NjcmVlbl94IHw9ICh4ID4gMCAmJiB4IDwgdGhpcy53b3JsZC53aWR0aCl8MFxuLy8gICAgICAgICAgICAgICAgIG9uX3NjcmVlbl95IHw9ICh5ID4gMCAmJiB5IDwgdGhpcy53b3JsZC5oZWlnaHQpfDBcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIGlmICghb25fc2NyZWVuX3gpIHtcbi8vICAgICAgICAgICAgICAgICBpZiAoKHRoaXMueCA8IDAgJiYgdGhpcy5keCA8IDApIHx8ICh0aGlzLnggPiB0aGlzLndvcmxkLndpZHRoICYmIHRoaXMuZHggPiAwKSkge1xuLy8gICAgICAgICAgICAgICAgICAgICB0aGlzLnggPSB0aGlzLndvcmxkLndpZHRoIC0gdGhpcy54XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgaWYgKCFvbl9zY3JlZW5feSkge1xuLy8gICAgICAgICAgICAgICAgIGlmICgodGhpcy55IDwgMCAmJiB0aGlzLmR5IDwgMCkgfHwgKHRoaXMueSA+IHRoaXMud29ybGQuaGVpZ2h0ICYmIHRoaXMuZHkgPiAwKSkge1xuLy8gICAgICAgICAgICAgICAgICAgICB0aGlzLnkgPSB0aGlzLndvcmxkLmhlaWdodCAtIHRoaXMueVxuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vXG4vLyAgICAgKmJhc2VSZW5kZXJTdGF0ZSgpIHtcbi8vICAgICAgICAgd2hpbGUgKHRydWUpIHtcbi8vICAgICAgICAgICAgIGxldCB7Y3R4LCBkdH0gPSB5aWVsZFxuLy8gICAgICAgICAgICAgbGV0IHBvaW50cyA9IHJvdGF0ZSh0aGlzLnJvdCwgdGhpcy5wb2ludHMpXG4vLyAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKClcbi8vICAgICAgICAgICAgIGN0eC5saW5lV2lkdGg9XCIyXCJcbi8vICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZT1cImdyZXlcIlxuLy9cbi8vICAgICAgICAgICAgIGxldCB7eCwgeX0gPSBwb2ludHNbMF1cbi8vICAgICAgICAgICAgIGN0eC5tb3ZlVG8odGhpcy54K3gqdGhpcy5zY2FsZSwgdGhpcy55K3kqdGhpcy5zY2FsZSlcbi8vICAgICAgICAgICAgIGZvciAobGV0IHt4LCB5fSBvZiBwb2ludHMpIHtcbi8vICAgICAgICAgICAgICAgICBjdHgubGluZVRvKHRoaXMueCt4KnRoaXMuc2NhbGUsIHRoaXMueSt5KnRoaXMuc2NhbGUpXG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICBjdHgubGluZVRvKHRoaXMueCt4KnRoaXMuc2NhbGUsIHRoaXMueSt5KnRoaXMuc2NhbGUpXG4vLyAgICAgICAgICAgICBjdHguc3Ryb2tlKClcbi8vICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAneWVsbG93J1xuLy8gICAgICAgICAgICAgY3R4LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCAyLCAyKVxuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gfVxuLy9cbi8vIGZ1bmN0aW9uIHJvdGF0ZShyb3QsIHBvaW50cykge1xuLy8gICAgIGxldCByZXN1bHQgPSBbXVxuLy8gICAgIGxldCBzaW4gPSBNYXRoLnNpbihyb3QpXG4vLyAgICAgbGV0IGNvcyA9IE1hdGguY29zKHJvdClcbi8vXG4vLyAgICAgZm9yIChsZXQge3gsIHl9IG9mIHBvaW50cykge1xuLy8gICAgICAgICByZXN1bHQucHVzaCh7XG4vLyAgICAgICAgICAgICB4OiB4KmNvcyAtIHkqc2luLFxuLy8gICAgICAgICAgICAgeTogeCpzaW4gKyB5KmNvcyxcbi8vICAgICAgICAgfSlcbi8vICAgICB9XG4vLyAgICAgcmV0dXJuIHJlc3VsdFxuLy8gfVxuXG5cbmNvbnN0IFNQUklURVMgPSBbXG4gICAgbG9hZEltYWdlKCdyb2lkMScpLFxuICAgIGxvYWRJbWFnZSgncm9pZDInKSxcbiAgICBsb2FkSW1hZ2UoJ3JvaWQzJyksXG4gICAgbG9hZEltYWdlKCdyb2lkNCcpLFxuICAgIGxvYWRJbWFnZSgncm9pZDUnKSxcbl1cbmNvbnN0IGJhc2Vfc2l6ZSA9IDIwXG5cbmV4cG9ydCBjbGFzcyBBc3Ryb2lkIGV4dGVuZHMgQWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHdvcmxkLCB7eCwgeSwgciwgZHgsIGR5LCBkciwgc2NhbGV9KSB7XG4gICAgICAgIHN1cGVyKHdvcmxkKVxuICAgICAgICB0aGlzLnggPSB4XG4gICAgICAgIHRoaXMueSA9IHlcbiAgICAgICAgdGhpcy5yb3QgPSByXG5cbiAgICAgICAgdGhpcy5keCA9IGR4XG4gICAgICAgIHRoaXMuZHkgPSBkeVxuICAgICAgICB0aGlzLmRyb3QgPSBkclxuXG4gICAgICAgIHRoaXMuc2NhbGUgPSBzY2FsZVxuICAgICAgICB0aGlzLmltYWdlID0gU1BSSVRFU1soTWF0aC5yYW5kb20oKSAqIFNQUklURVMubGVuZ3RoKXwwXVxuICAgICAgICB0aGlzLmNvbGxpc2lvbl90aW1lb3V0ID0gMFxuICAgICAgICB0aGlzLmNvbGxpc2lvbl9hZGp1c3RfdGltZW91dCA9IDBcbiAgICB9XG5cbiAgICByYWRpdXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNjYWxlICogYmFzZV9zaXplIC8gMlxuICAgIH1cblxuICAgIGV4cGxvZGUoKSB7XG5cbiAgICAgICAgbGV0IG5ld2EgPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzLndvcmxkLCB7XG4gICAgICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgICAgICB5OiB0aGlzLnksXG4gICAgICAgICAgICByOiAoLS41ICsgTWF0aC5yYW5kb20oKSkqNCxcbiAgICAgICAgICAgIGR4OiAoLS41ICsgTWF0aC5yYW5kb20oKSkqNCxcbiAgICAgICAgICAgIGR5OiAoLS41ICsgTWF0aC5yYW5kb20oKSkqNCxcbiAgICAgICAgICAgIGRyOiAoLS41ICsgTWF0aC5yYW5kb20oKSkvNCxcbiAgICAgICAgICAgIHNjYWxlOiAodGhpcy5zY2FsZSAvIDIpfDAsXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMud29ybGQuYXN0cm9pZHMucHVzaChuZXdhKVxuICAgICAgICB0aGlzLnNjYWxlID0gdGhpcy5zY2FsZSAtPSAxXG4gICAgfVxuXG4gICAgY29sbGVjdCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5zY2FsZSA8IDFcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKHdvcmxkKSB7XG4gICAgICAgIGxldCB0ID0gbmV3IHRoaXMod29ybGQsIHtcbiAgICAgICAgICAgIHg6ICh3b3JsZC53aWR0aCAqIE1hdGgucmFuZG9tKCkpfDAsXG4gICAgICAgICAgICB5OiAod29ybGQuaGVpZ2h0ICogTWF0aC5yYW5kb20oKSl8MCxcbiAgICAgICAgICAgIHI6ICgtLjUgKyBNYXRoLnJhbmRvbSgpKSo0LFxuICAgICAgICAgICAgZHg6ICgtLjUgKyBNYXRoLnJhbmRvbSgpKSo0LFxuICAgICAgICAgICAgZHk6ICgtLjUgKyBNYXRoLnJhbmRvbSgpKSo0LFxuICAgICAgICAgICAgZHI6ICgtLjUgKyBNYXRoLnJhbmRvbSgpKS80LFxuICAgICAgICAgICAgc2NhbGU6IChNYXRoLnJhbmRvbSgpKjUpfDAgKyAxLFxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gdFxuICAgIH1cblxuICAgICpiYXNlQ29udHJvbFN0YXRlKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdH0gPSB5aWVsZFxuICAgICAgICAgICAgdGhpcy5yb3QgKz0gdGhpcy5kcm90XG4gICAgICAgICAgICB0aGlzLnggKz0gdGhpcy5keFxuICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMuZHlcbiAgICAgICAgICAgIGxldCByYWRpdXMgPSBiYXNlX3NpemUgKiB0aGlzLnNjYWxlIC8gMlxuXG4gICAgICAgICAgICBpZiAoKHRoaXMueCArIHJhZGl1cyA8IDAgJiYgdGhpcy5keCA8IDApIHx8ICh0aGlzLnggLSByYWRpdXMgPiB0aGlzLndvcmxkLndpZHRoICYmIHRoaXMuZHggPiAwKSkge1xuICAgICAgICAgICAgICAgIHRoaXMueCA9IHRoaXMud29ybGQud2lkdGggLSB0aGlzLnhcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCh0aGlzLnkgKyByYWRpdXMgPCAwICYmIHRoaXMuZHkgPCAwKSB8fCAodGhpcy55IC0gcmFkaXVzID4gdGhpcy53b3JsZC5oZWlnaHQgJiYgdGhpcy5keSA+IDApKSB7XG4gICAgICAgICAgICAgICAgdGhpcy55ID0gdGhpcy53b3JsZC5oZWlnaHQgLSB0aGlzLnlcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgKmJhc2VSZW5kZXJTdGF0ZSgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7Y3R4LCBkdH0gPSB5aWVsZFxuICAgICAgICAgICAgbGV0IHJhZGl1cyA9IGJhc2Vfc2l6ZSAqIHRoaXMuc2NhbGUgLyAyXG4gICAgICAgICAgICBjdHguc2F2ZSgpXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KVxuICAgICAgICAgICAgY3R4LnJvdGF0ZSh0aGlzLnJvdClcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcy5pbWFnZSwgLXJhZGl1cywgLXJhZGl1cywgcmFkaXVzKjIsIHJhZGl1cyoyKVxuICAgICAgICAgICAgLy8gY3R4LnN0cm9rZVN0eWxlID0gJ3llbGxvdydcbiAgICAgICAgICAgIC8vIGN0eC5hcmMoMCwgMCwgcmFkaXVzLCAwLCA3KVxuICAgICAgICAgICAgLy8gY3R4LnN0cm9rZSgpXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQge0FjdG9yfSBmcm9tICcuL2NvbW1vbi9hY3RvcidcblxuXG5leHBvcnQgY2xhc3MgQm9sdCBleHRlbmRzIEFjdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCwge3gsIHksIHJ9KSB7XG4gICAgICAgIHN1cGVyKHdvcmxkKVxuICAgICAgICByICs9IE1hdGguUElcbiAgICAgICAgdGhpcy54ID0geFxuICAgICAgICB0aGlzLnkgPSB5XG4gICAgICAgIHRoaXMuZHggPSBNYXRoLnNpbihyKSo0XG4gICAgICAgIHRoaXMuZHkgPSBNYXRoLmNvcyhyKSo0XG4gICAgICAgIHRoaXMucm90ID0gclxuICAgICAgICB0aGlzLl9jb2xsZWN0ID0gZmFsc2VcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKHdvcmxkLCBwbGF5ZXIpIHtcbiAgICAgICAgbGV0IHQgPSBuZXcgdGhpcyh3b3JsZCwge1xuICAgICAgICAgICAgeDogcGxheWVyLnBvc2l0aW9uLngsXG4gICAgICAgICAgICB5OiBwbGF5ZXIucG9zaXRpb24ueSxcbiAgICAgICAgICAgIHI6IHBsYXllci5hbmdsZSxcbiAgICAgICAgfSlcbiAgICAgICAgd29ybGQuYm9sdHMucHVzaCh0KVxuICAgICAgICByZXR1cm4gdFxuICAgIH1cblxuICAgIGNvbGxlY3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb2xsZWN0XG4gICAgfVxuXG4gICAgKmJhc2VDb250cm9sU3RhdGUoKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0fSA9IHlpZWxkXG4gICAgICAgICAgICB0aGlzLnggKz0gdGhpcy5keFxuICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMuZHlcbiAgICAgICAgICAgIGxldCByYWRpdXMgPSA1XG5cbiAgICAgICAgICAgIGlmICgodGhpcy54ICsgcmFkaXVzIDwgMCAmJiB0aGlzLmR4IDwgMCkgfHwgKHRoaXMueCAtIHJhZGl1cyA+IHRoaXMud29ybGQud2lkdGggJiYgdGhpcy5keCA+IDApKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29sbGVjdCA9IHRydWVcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCh0aGlzLnkgKyByYWRpdXMgPCAwICYmIHRoaXMuZHkgPCAwKSB8fCAodGhpcy55IC0gcmFkaXVzID4gdGhpcy53b3JsZC5oZWlnaHQgJiYgdGhpcy5keSA+IDApKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29sbGVjdCA9IHRydWVcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgKmJhc2VSZW5kZXJTdGF0ZSgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7Y3R4LCBkdH0gPSB5aWVsZFxuICAgICAgICAgICAgY3R4LnNhdmUoKVxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICd5ZWxsb3cnXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAneWVsbG93J1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KVxuICAgICAgICAgICAgY3R4LnJvdGF0ZSgtdGhpcy5yb3QpXG4gICAgICAgICAgICBjdHgubW92ZVRvKDAsIC01KVxuICAgICAgICAgICAgY3R4LmxpbmVUbygwLCArNSlcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKVxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7RXZlbnRMaXN0ZW5lcn0gZnJvbSBcIi4vZXZlbnRzLmpzXCI7XG5cblxuZXhwb3J0IGNsYXNzIEFjdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG5cbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgICAgICB0aGlzLnggPSAwO1xuICAgICAgICB0aGlzLnkgPSAwO1xuICAgICAgICB0aGlzLndpZHRoID0gNjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gNjQ7XG5cbiAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSB0aGlzLmJhc2VDb250cm9sU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gdGhpcy5iYXNlUmVuZGVyU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgIH1cblxuICAgIGdldEhpdEJveGVzKCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29sbGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHVwZGF0ZShkdCkge1xuICAgICAgICBsZXQgY3VyID0gdGhpcy5jb250cm9sU3RhdGUubmV4dCh7ZHQ6IGR0fSk7XG4gICAgICAgIGlmIChjdXIudmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSBjdXIudmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VyLmRvbmUpIHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5iYXNlQ29udHJvbFN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcihkdCwgY3R4KSB7XG4gICAgICAgIGxldCBjdXIgPSB0aGlzLnJlbmRlclN0YXRlLm5leHQoe2R0OiBkdCwgY3R4OiBjdHh9KTtcbiAgICAgICAgaWYgKGN1ci52YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gY3VyLnZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gdGhpcy5iYXNlUmVuZGVyU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgKmJhc2VDb250cm9sU3RhdGUgKCkge31cbiAgICAqYmFzZVJlbmRlclN0YXRlICgpIHt9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuXG5leHBvcnQgY2xhc3MgRXZlbnRMaXN0ZW5lciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzID0ge307XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBmdW5jKSB7XG4gICAgICAgIGxldCBldmVudHMgPSB0aGlzLmV2ZW50c1tuYW1lXSB8fCBbXTtcbiAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBldmVudHM7XG5cbiAgICAgICAgZXZlbnRzLnB1c2goZnVuYyk7XG4gICAgfVxuXG4gICAgZW1pdChuYW1lLCBhcmdzKSB7XG4gICAgICAgIGxldCBldmVudHMgPSB0aGlzLmV2ZW50c1tuYW1lXSB8fCBbXTtcbiAgICAgICAgZm9yIChsZXQgZXYgb2YgZXZlbnRzKSB7XG4gICAgICAgICAgICBldihhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0FzdHJvaWR9IGZyb20gJy4vYXN0cm9pZCdcbmNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyLmpzJyk7XG5cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihzY3JlZW4pIHtcblxuICAgICAgICAvLyBTZXQgdXAgYnVmZmVyc1xuICAgICAgICB0aGlzLmZyb250QnVmZmVyID0gc2NyZWVuO1xuICAgICAgICB0aGlzLmZyb250Q3R4ID0gc2NyZWVuLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIud2lkdGggPSBzY3JlZW4ud2lkdGg7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlci5oZWlnaHQgPSBzY3JlZW4uaGVpZ2h0O1xuICAgICAgICB0aGlzLmJhY2tDdHggPSB0aGlzLmJhY2tCdWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICB0aGlzLndpZHRoID0gc2NyZWVuLndpZHRoXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gc2NyZWVuLmhlaWdodFxuXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgICAgICAgdGhpcy5vbGRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5hc3Ryb2lkcyA9IFtdXG4gICAgICAgIHRoaXMuYm9sdHMgPSBbXVxuICAgICAgICB0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIoe3g6IHRoaXMuYmFja0J1ZmZlci53aWR0aC8yLCB5OiB0aGlzLmJhY2tCdWZmZXIuaGVpZ2h0LzJ9LCB0aGlzLmJhY2tCdWZmZXIsIHRoaXMpO1xuICAgICAgICB0aGlzLnNjb3JlID0gMFxuICAgICAgICB0aGlzLmxldmVsID0gMFxuICAgICAgICB0aGlzLmxpdmVzID0gM1xuICAgIH1cblxuICAgIHBhdXNlKGZsYWcpIHtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSAoZmxhZyA9PSB0cnVlKTtcbiAgICB9XG5cbiAgICBjcmVhdGVBc3Ryb2lkcyhuKSB7XG4gICAgICAgIGZvciAobGV0IGk9MDsgaTxuOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYXN0cm9pZHMucHVzaChBc3Ryb2lkLmNyZWF0ZSh0aGlzKSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxvb3AobmV3VGltZSkge1xuICAgICAgICB2YXIgZ2FtZSA9IHRoaXM7XG4gICAgICAgIHZhciBlbGFwc2VkVGltZSA9IG5ld1RpbWUgLSB0aGlzLm9sZFRpbWU7XG4gICAgICAgIHRoaXMub2xkVGltZSA9IG5ld1RpbWU7XG5cbiAgICAgICAgaWYoIXRoaXMucGF1c2VkKSB0aGlzLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgICAgIHRoaXMucmVuZGVyKGVsYXBzZWRUaW1lLCB0aGlzLmJhY2tDdHgpO1xuICAgICAgICB0aGlzLmZyb250Q3R4LmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIsIDAsIDApO1xuICAgIH1cblxuXG4gICAgdXBkYXRlKGVsYXBzZWRUaW1lKSB7XG4gICAgICAgIHRoaXMucGxheWVyLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgICAgIGZvciAobGV0IGFzdHJvaWQgb2YgdGhpcy5hc3Ryb2lkcykge1xuICAgICAgICAgICAgYXN0cm9pZC51cGRhdGUoZWxhcHNlZFRpbWUpXG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgYm9sdHMgb2YgdGhpcy5ib2x0cykge1xuICAgICAgICAgICAgYm9sdHMudXBkYXRlKGVsYXBzZWRUaW1lKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXN0cm9pZHMgPSB0aGlzLmFzdHJvaWRzLmZpbHRlcigoZSk9PiFlLmNvbGxlY3QoKSlcbiAgICAgICAgdGhpcy5ib2x0cyA9IHRoaXMuYm9sdHMuZmlsdGVyKChlKT0+IWUuY29sbGVjdCgpKVxuICAgICAgICBpZiAodGhpcy5hc3Ryb2lkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQXN0cm9pZHMoMTApXG4gICAgICAgICAgICB0aGlzLmxldmVsICs9IDFcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpID0gMFxuICAgICAgICBmb3IgKGxldCBhc3Ryb2lkIG9mIHRoaXMuYXN0cm9pZHMpIHtcbiAgICAgICAgICAgIGlmIChNYXRoLnBvdyh0aGlzLnBsYXllci5wb3NpdGlvbi54IC0gYXN0cm9pZC54LCAyKSArIE1hdGgucG93KHRoaXMucGxheWVyLnBvc2l0aW9uLnkgLSBhc3Ryb2lkLnksIDIpIDwgTWF0aC5wb3coNSthc3Ryb2lkLnJhZGl1cygpLCAyKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubGl2ZXMgLT0gMVxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLnJlcG9zaXRpb24oKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgYm9sdCBvZiB0aGlzLmJvbHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKE1hdGgucG93KGJvbHQueCAtIGFzdHJvaWQueCwgMikgKyBNYXRoLnBvdyhib2x0LnkgLSBhc3Ryb2lkLnksIDIpIDwgTWF0aC5wb3coYXN0cm9pZC5yYWRpdXMoKSwgMikpIHtcbiAgICAgICAgICAgICAgICAgICAgYm9sdC5fY29sbGVjdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYXN0cm9pZC5leHBsb2RlKClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29yZSArPSAxMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgbGV0IGlzX2NvbGxpZGluZyA9IGZhbHNlXG4gICAgICAgICAgICBmb3IgKGxldCBvdGhlcmFzdHJvaWQgb2YgdGhpcy5hc3Ryb2lkcy5jb25jYXQoKS5zcGxpY2UoaSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5wb3cob3RoZXJhc3Ryb2lkLnggLSBhc3Ryb2lkLngsIDIpICsgTWF0aC5wb3cob3RoZXJhc3Ryb2lkLnkgLSBhc3Ryb2lkLnksIDIpIDwgTWF0aC5wb3coYXN0cm9pZC5yYWRpdXMoKStvdGhlcmFzdHJvaWQucmFkaXVzKCksIDIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzX2NvbGxpZGluZyA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFzdHJvaWQuY29sbGlzaW9uX3RpbWVvdXQgPCAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICA7W290aGVyYXN0cm9pZC5keCwgYXN0cm9pZC5keCwgb3RoZXJhc3Ryb2lkLmR5LCBhc3Ryb2lkLmR5XSA9IFthc3Ryb2lkLmR4LCBvdGhlcmFzdHJvaWQuZHgsIGFzdHJvaWQuZHksIG90aGVyYXN0cm9pZC5keV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzX2NvbGxpZGluZykge1xuICAgICAgICAgICAgICAgIGlmIChhc3Ryb2lkLmNvbGxpc2lvbl9hZGp1c3RfdGltZW91dCA8IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBhc3Ryb2lkLmNvbGxpc2lvbl9hZGp1c3RfdGltZW91dCsrXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXN0cm9pZC5jb2xsaXNpb25fYWRqdXN0X3RpbWVvdXQgPSAwXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZGp1c3QnKVxuICAgICAgICAgICAgICAgICAgICBhc3Ryb2lkLmR4ID0gKC0uNStNYXRoLnJhbmRvbSgpKSo1XG4gICAgICAgICAgICAgICAgICAgIGFzdHJvaWQuZHkgPSAoLS41K01hdGgucmFuZG9tKCkpKjVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXN0cm9pZC5jb2xsaXNpb25fdGltZW91dCArPSAxXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFzdHJvaWQuY29sbGlzaW9uX2FkanVzdF90aW1lb3V0ID0gMFxuICAgICAgICAgICAgICAgIGFzdHJvaWQuY29sbGlzaW9uX3RpbWVvdXQgLT0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXN0cm9pZC5jb2xsaXNpb25fdGltZW91dCA9IE1hdGgubWluKGFzdHJvaWQuY29sbGlzaW9uX3RpbWVvdXQsIDEwKVxuICAgICAgICAgICAgYXN0cm9pZC5jb2xsaXNpb25fdGltZW91dCA9IE1hdGgubWF4KGFzdHJvaWQuY29sbGlzaW9uX3RpbWVvdXQsIDApXG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcihlbGFwc2VkVGltZSwgY3R4KSB7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLmJhY2tCdWZmZXIud2lkdGgsIHRoaXMuYmFja0J1ZmZlci5oZWlnaHQpO1xuICAgICAgICB0aGlzLnBsYXllci5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCk7XG5cbiAgICAgICAgZm9yIChsZXQgYXN0cm9pZCBvZiB0aGlzLmFzdHJvaWRzKSB7XG4gICAgICAgICAgICBhc3Ryb2lkLnJlbmRlcihlbGFwc2VkVGltZSwgY3R4KVxuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGJvbHRzIG9mIHRoaXMuYm9sdHMpIHtcbiAgICAgICAgICAgIGJvbHRzLnJlbmRlcihlbGFwc2VkVGltZSwgY3R4KVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IE1TX1BFUl9GUkFNRSA9IDEwMDAvODtcblxuaW1wb3J0IHtCb2x0fSBmcm9tICcuL2JvbHQnXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFBsYXllcjtcblxuZnVuY3Rpb24gUGxheWVyKHBvc2l0aW9uLCBjYW52YXMsIHdvcmxkKSB7XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkXG4gIHRoaXMud29ybGRXaWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgdGhpcy53b3JsZEhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG4gIHRoaXMuc3RhdGUgPSBcImlkbGVcIjtcbiAgdGhpcy5wb3NpdGlvbiA9IHtcbiAgICB4OiBwb3NpdGlvbi54LFxuICAgIHk6IHBvc2l0aW9uLnlcbiAgfTtcbiAgdGhpcy52ZWxvY2l0eSA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfVxuICB0aGlzLmFuZ2xlID0gMDtcbiAgdGhpcy5yYWRpdXMgID0gNjQ7XG4gIHRoaXMudGhydXN0aW5nID0gZmFsc2U7XG4gIHRoaXMuc3RlZXJMZWZ0ID0gZmFsc2U7XG4gIHRoaXMuc3RlZXJSaWdodCA9IGZhbHNlO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgd2luZG93Lm9ua2V5ZG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc3dpdGNoKGV2ZW50LmtleSkge1xuICAgICAgY2FzZSAnQXJyb3dVcCc6IC8vIHVwXG4gICAgICBjYXNlICd3JzpcbiAgICAgICAgc2VsZi50aHJ1c3RpbmcgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93TGVmdCc6IC8vIGxlZnRcbiAgICAgIGNhc2UgJ2EnOlxuICAgICAgICBzZWxmLnN0ZWVyTGVmdCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQXJyb3dSaWdodCc6IC8vIHJpZ2h0XG4gICAgICBjYXNlICdkJzpcbiAgICAgICAgc2VsZi5zdGVlclJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICcgJzpcbiAgICAgICAgQm9sdC5jcmVhdGUod29ybGQsIHNlbGYpXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHdpbmRvdy5vbmtleXVwID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBzd2l0Y2goZXZlbnQua2V5KSB7XG4gICAgICBjYXNlICdBcnJvd1VwJzogLy8gdXBcbiAgICAgIGNhc2UgJ3cnOlxuICAgICAgICBzZWxmLnRocnVzdGluZyA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93TGVmdCc6IC8vIGxlZnRcbiAgICAgIGNhc2UgJ2EnOlxuICAgICAgICBzZWxmLnN0ZWVyTGVmdCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOiAvLyByaWdodFxuICAgICAgY2FzZSAnZCc6XG4gICAgICAgIHNlbGYuc3RlZXJSaWdodCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2MnOlxuICAgICAgICBzZWxmLnJlcG9zaXRpb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59XG5cblBsYXllci5wcm90b3R5cGUucmVwb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucG9zaXRpb24gPSB7XG4gICAgICB4OiB0aGlzLndvcmxkV2lkdGgqTWF0aC5yYW5kb20oKSxcbiAgICAgIHk6IHRoaXMud29ybGRXaWR0aCpNYXRoLnJhbmRvbSgpXG4gICAgfTtcbiAgICB0aGlzLnZlbG9jaXR5ID0ge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDBcbiAgICB9XG59XG5cblBsYXllci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24odGltZSkge1xuICAvLyBBcHBseSBhbmd1bGFyIHZlbG9jaXR5XG4gIGlmKHRoaXMuc3RlZXJMZWZ0KSB7XG4gICAgdGhpcy5hbmdsZSArPSB0aW1lICogMC4wMDU7XG4gIH1cbiAgaWYodGhpcy5zdGVlclJpZ2h0KSB7XG4gICAgdGhpcy5hbmdsZSAtPSAwLjE7XG4gIH1cbiAgLy8gQXBwbHkgYWNjZWxlcmF0aW9uXG4gIGlmKHRoaXMudGhydXN0aW5nKSB7XG4gICAgdmFyIGFjY2VsZXJhdGlvbiA9IHtcbiAgICAgIHg6IE1hdGguc2luKHRoaXMuYW5nbGUpLFxuICAgICAgeTogTWF0aC5jb3ModGhpcy5hbmdsZSlcbiAgICB9XG4gICAgdGhpcy52ZWxvY2l0eS54IC09IGFjY2VsZXJhdGlvbi54LzQ7XG4gICAgdGhpcy52ZWxvY2l0eS55IC09IGFjY2VsZXJhdGlvbi55LzQ7XG4gIH1cbiAgLy8gQXBwbHkgdmVsb2NpdHlcbiAgdGhpcy5wb3NpdGlvbi54ICs9IHRoaXMudmVsb2NpdHkueDtcbiAgdGhpcy5wb3NpdGlvbi55ICs9IHRoaXMudmVsb2NpdHkueTtcbiAgLy8gV3JhcCBhcm91bmQgdGhlIHNjcmVlblxuICBpZih0aGlzLnBvc2l0aW9uLnggPCAwKSB0aGlzLnBvc2l0aW9uLnggKz0gdGhpcy53b3JsZFdpZHRoO1xuICBpZih0aGlzLnBvc2l0aW9uLnggPiB0aGlzLndvcmxkV2lkdGgpIHRoaXMucG9zaXRpb24ueCAtPSB0aGlzLndvcmxkV2lkdGg7XG4gIGlmKHRoaXMucG9zaXRpb24ueSA8IDApIHRoaXMucG9zaXRpb24ueSArPSB0aGlzLndvcmxkSGVpZ2h0O1xuICBpZih0aGlzLnBvc2l0aW9uLnkgPiB0aGlzLndvcmxkSGVpZ2h0KSB0aGlzLnBvc2l0aW9uLnkgLT0gdGhpcy53b3JsZEhlaWdodDtcbn1cblxuUGxheWVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih0aW1lLCBjdHgpIHtcbiAgY3R4LnNhdmUoKTtcblxuICAvLyBEcmF3IHBsYXllcidzIHNoaXBcbiAgY3R4LnRyYW5zbGF0ZSh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XG4gIGN0eC5yb3RhdGUoLXRoaXMuYW5nbGUpO1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oMCwgLTEwKTtcbiAgY3R4LmxpbmVUbygtMTAsIDEwKTtcbiAgY3R4LmxpbmVUbygwLCAwKTtcbiAgY3R4LmxpbmVUbygxMCwgMTApO1xuICBjdHguY2xvc2VQYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSc7XG4gIGN0eC5zdHJva2UoKTtcblxuICAvLyBEcmF3IGVuZ2luZSB0aHJ1c3RcbiAgaWYodGhpcy50aHJ1c3RpbmcpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbygwLCAyMCk7XG4gICAgY3R4LmxpbmVUbyg1LCAxMCk7XG4gICAgY3R4LmFyYygwLCAxMCwgNSwgMCwgTWF0aC5QSSwgdHJ1ZSk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdvcmFuZ2UnO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgfVxuICBjdHgucmVzdG9yZSgpO1xufVxuIl19
