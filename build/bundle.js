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

},{"./game.js":5}],2:[function(require,module,exports){
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
    }

    static create(world) {
        let t = new this(world, {
            x: world.width * Math.random() | 0,
            y: world.height * Math.random() | 0,
            r: Math.random() * 4,
            dx: (-.5 + Math.random()) * 4,
            dy: (-.5 + Math.random()) * 4,
            drot: (-.5 + Math.random()) * 4,
            scale: Math.random() * 5 | 0
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

},{"./common/actor":3}],3:[function(require,module,exports){
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

},{"./events.js":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

        this.astroids = [
        // new Astroid(this, {x:300, y:300, r:0, dx:-1, dy:0, dr:.1, scale: 2}),
        _astroid.Astroid.create(this), _astroid.Astroid.create(this), _astroid.Astroid.create(this)];
        this.player = new Player({ x: this.backBuffer.width / 2, y: this.backBuffer.height / 2 }, this.backBuffer);
    }

    pause(flag) {
        this.paused = flag == true;
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
        // TODO: Update the game objects
    }

    render(elapsedTime, ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.backBuffer.width, this.backBuffer.height);
        this.player.render(elapsedTime, ctx);

        for (let astroid of this.astroids) {
            astroid.render(elapsedTime, ctx);
        }
    }
}
exports.Game = Game;

},{"./astroid":2,"./player.js":6}],6:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000 / 8;

module.exports = exports = Player;

function Player(position, canvas) {
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
    }
  };
}

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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2FzdHJvaWQuanMiLCJzcmMvY29tbW9uL2FjdG9yLmpzIiwic3JjL2NvbW1vbi9ldmVudHMuanMiLCJzcmMvZ2FtZS5qcyIsInNyYy9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7QUFFQSxJQUFJLFNBQVMsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQWI7QUFDQSxJQUFJLE9BQU8sZUFBUyxNQUFULENBQVg7O0FBRUEsSUFBSSxhQUFhLFVBQVMsU0FBVCxFQUFvQjtBQUNuQyxPQUFLLElBQUwsQ0FBVSxTQUFWO0FBQ0EsU0FBTyxxQkFBUCxDQUE2QixVQUE3QjtBQUNELENBSEQ7QUFJQSxXQUFXLFlBQVksR0FBWixFQUFYOzs7Ozs7Ozs7O0FDWEE7O0FBRUEsU0FBUyxTQUFULENBQW1CLElBQW5CLEVBQXlCO0FBQ3JCLFFBQUksUUFBUSxJQUFJLEtBQUosRUFBWjtBQUNBLFVBQU0sR0FBTixHQUFhLGFBQVcsSUFBSyxPQUE3QjtBQUNBLFdBQU8sS0FBUDtBQUNIOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBLE1BQU0sVUFBVSxDQUNaLFVBQVUsT0FBVixDQURZLEVBRVosVUFBVSxPQUFWLENBRlksRUFHWixVQUFVLE9BQVYsQ0FIWSxFQUlaLFVBQVUsT0FBVixDQUpZLEVBS1osVUFBVSxPQUFWLENBTFksQ0FBaEI7QUFPQSxNQUFNLFlBQVksRUFBbEI7O0FBRU8sTUFBTSxPQUFOLHNCQUE0Qjs7QUFHL0IsZ0JBQVksS0FBWixFQUFtQixFQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLEVBQVYsRUFBYyxFQUFkLEVBQWtCLEVBQWxCLEVBQXNCLEtBQXRCLEVBQW5CLEVBQWlEO0FBQzdDLGNBQU0sS0FBTjtBQUNBLGFBQUssQ0FBTCxHQUFTLENBQVQ7QUFDQSxhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxHQUFMLEdBQVcsQ0FBWDs7QUFFQSxhQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsYUFBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLGFBQUssSUFBTCxHQUFZLEVBQVo7O0FBRUEsYUFBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLGFBQUssS0FBTCxHQUFhLFFBQVMsS0FBSyxNQUFMLEtBQWdCLFFBQVEsTUFBekIsR0FBaUMsQ0FBekMsQ0FBYjtBQUNIOztBQUVELFdBQU8sTUFBUCxDQUFjLEtBQWQsRUFBcUI7QUFDakIsWUFBSSxJQUFJLElBQUksSUFBSixDQUFTLEtBQVQsRUFBZ0I7QUFDcEIsZUFBSSxNQUFNLEtBQU4sR0FBYyxLQUFLLE1BQUwsRUFBZixHQUE4QixDQURiO0FBRXBCLGVBQUksTUFBTSxNQUFOLEdBQWUsS0FBSyxNQUFMLEVBQWhCLEdBQStCLENBRmQ7QUFHcEIsZUFBRyxLQUFLLE1BQUwsS0FBYyxDQUhHO0FBSXBCLGdCQUFJLENBQUMsQ0FBQyxFQUFELEdBQU0sS0FBSyxNQUFMLEVBQVAsSUFBc0IsQ0FKTjtBQUtwQixnQkFBSSxDQUFDLENBQUMsRUFBRCxHQUFNLEtBQUssTUFBTCxFQUFQLElBQXNCLENBTE47QUFNcEIsa0JBQU0sQ0FBQyxDQUFDLEVBQUQsR0FBTSxLQUFLLE1BQUwsRUFBUCxJQUFzQixDQU5SO0FBT3BCLG1CQUFRLEtBQUssTUFBTCxLQUFjLENBQWYsR0FBa0I7QUFQTCxTQUFoQixDQUFSO0FBU0EsZUFBTyxDQUFQO0FBQ0g7O0FBRUQsS0FBQyxnQkFBRCxHQUFvQjtBQUNoQixlQUFPLElBQVAsRUFBYTtBQUNULGdCQUFJLEVBQUMsRUFBRCxLQUFPLEtBQVg7QUFDQSxpQkFBSyxHQUFMLElBQVksS0FBSyxJQUFqQjtBQUNBLGlCQUFLLENBQUwsSUFBVSxLQUFLLEVBQWY7QUFDQSxpQkFBSyxDQUFMLElBQVUsS0FBSyxFQUFmO0FBQ0EsZ0JBQUksU0FBUyxZQUFZLEtBQUssS0FBakIsR0FBeUIsQ0FBdEM7O0FBRUEsZ0JBQUssS0FBSyxDQUFMLEdBQVMsTUFBVCxHQUFrQixDQUFsQixJQUF1QixLQUFLLEVBQUwsR0FBVSxDQUFsQyxJQUF5QyxLQUFLLENBQUwsR0FBUyxNQUFULEdBQWtCLEtBQUssS0FBTCxDQUFXLEtBQTdCLElBQXNDLEtBQUssRUFBTCxHQUFVLENBQTdGLEVBQWlHO0FBQzdGLHFCQUFLLENBQUwsR0FBUyxLQUFLLEtBQUwsQ0FBVyxLQUFYLEdBQW1CLEtBQUssQ0FBakM7QUFDSDs7QUFFRCxnQkFBSyxLQUFLLENBQUwsR0FBUyxNQUFULEdBQWtCLENBQWxCLElBQXVCLEtBQUssRUFBTCxHQUFVLENBQWxDLElBQXlDLEtBQUssQ0FBTCxHQUFTLE1BQVQsR0FBa0IsS0FBSyxLQUFMLENBQVcsTUFBN0IsSUFBdUMsS0FBSyxFQUFMLEdBQVUsQ0FBOUYsRUFBa0c7QUFDOUYscUJBQUssQ0FBTCxHQUFTLEtBQUssS0FBTCxDQUFXLE1BQVgsR0FBb0IsS0FBSyxDQUFsQztBQUNIO0FBRUo7QUFDSjs7QUFFRCxLQUFDLGVBQUQsR0FBbUI7QUFDZixlQUFPLElBQVAsRUFBYTtBQUNULGdCQUFJLEVBQUMsR0FBRCxFQUFNLEVBQU4sS0FBWSxLQUFoQjtBQUNBLGdCQUFJLFNBQVMsWUFBWSxLQUFLLEtBQWpCLEdBQXlCLENBQXRDO0FBQ0EsZ0JBQUksSUFBSjtBQUNBLGdCQUFJLFNBQUosQ0FBYyxLQUFLLENBQW5CLEVBQXNCLEtBQUssQ0FBM0I7QUFDQSxnQkFBSSxNQUFKLENBQVcsS0FBSyxHQUFoQjtBQUNBLGdCQUFJLFNBQUosQ0FBYyxLQUFLLEtBQW5CLEVBQTBCLENBQUMsTUFBM0IsRUFBbUMsQ0FBQyxNQUFwQyxFQUE0QyxTQUFPLENBQW5ELEVBQXNELFNBQU8sQ0FBN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBSSxPQUFKO0FBQ0g7QUFDSjtBQTlEOEI7UUFBdEIsTyxHQUFBLE87OztBQy9HYjs7Ozs7OztBQUVBOztBQUdPLE1BQU0sS0FBTixDQUFZO0FBQ2YsZ0JBQVksS0FBWixFQUFtQjtBQUNmLGFBQUssTUFBTCxHQUFjLDJCQUFkOztBQUVBLGFBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxhQUFLLE1BQUwsR0FBYyxFQUFkOztBQUVBLGFBQUssWUFBTCxHQUFvQixLQUFLLGdCQUFMLENBQXNCLElBQXRCLENBQTJCLElBQTNCLEdBQXBCO0FBQ0EsYUFBSyxXQUFMLEdBQW1CLEtBQUssZUFBTCxDQUFxQixJQUFyQixDQUEwQixJQUExQixHQUFuQjtBQUNIOztBQUVELGtCQUFjO0FBQ1YsZUFBTyxFQUFQO0FBQ0g7O0FBRUQsY0FBVTtBQUNOLGVBQU8sS0FBUDtBQUNIOztBQUVELFdBQU8sRUFBUCxFQUFXO0FBQ1AsWUFBSSxNQUFNLEtBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixFQUFDLElBQUksRUFBTCxFQUF2QixDQUFWO0FBQ0EsWUFBSSxJQUFJLEtBQUosSUFBYSxJQUFqQixFQUF1QjtBQUNuQixpQkFBSyxZQUFMLEdBQW9CLElBQUksS0FBeEI7QUFDSCxTQUZELE1BRU8sSUFBSSxJQUFJLElBQVIsRUFBYztBQUNqQixpQkFBSyxZQUFMLEdBQW9CLEtBQUssZ0JBQUwsQ0FBc0IsSUFBdEIsQ0FBMkIsSUFBM0IsR0FBcEI7QUFDSDtBQUNKOztBQUVELFdBQU8sRUFBUCxFQUFXLEdBQVgsRUFBZ0I7QUFDWixZQUFJLE1BQU0sS0FBSyxXQUFMLENBQWlCLElBQWpCLENBQXNCLEVBQUMsSUFBSSxFQUFMLEVBQVMsS0FBSyxHQUFkLEVBQXRCLENBQVY7QUFDQSxZQUFJLElBQUksS0FBSixJQUFhLElBQWpCLEVBQXVCO0FBQ25CLGlCQUFLLFdBQUwsR0FBbUIsSUFBSSxLQUF2QjtBQUNILFNBRkQsTUFFTyxJQUFJLElBQUksSUFBUixFQUFjO0FBQ2pCLGlCQUFLLFdBQUwsR0FBbUIsS0FBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLElBQTFCLEdBQW5CO0FBQ0g7QUFDSjs7QUFFRCxLQUFDLGdCQUFELEdBQXFCLENBQUU7QUFDdkIsS0FBQyxlQUFELEdBQW9CLENBQUU7QUF6Q1A7UUFBTixLLEdBQUEsSzs7O0FDTGI7Ozs7O0FBR08sTUFBTSxhQUFOLENBQW9CO0FBQ3ZCLGtCQUFjO0FBQ1YsYUFBSyxNQUFMLEdBQWMsRUFBZDtBQUNIOztBQUVELHFCQUFpQixJQUFqQixFQUF1QixJQUF2QixFQUE2QjtBQUN6QixZQUFJLFNBQVMsS0FBSyxNQUFMLENBQVksSUFBWixLQUFxQixFQUFsQztBQUNBLGFBQUssTUFBTCxDQUFZLElBQVosSUFBb0IsTUFBcEI7O0FBRUEsZUFBTyxJQUFQLENBQVksSUFBWjtBQUNIOztBQUVELFNBQUssSUFBTCxFQUFXLElBQVgsRUFBaUI7QUFDYixZQUFJLFNBQVMsS0FBSyxNQUFMLENBQVksSUFBWixLQUFxQixFQUFsQztBQUNBLGFBQUssSUFBSSxFQUFULElBQWUsTUFBZixFQUF1QjtBQUNuQixlQUFHLElBQUg7QUFDSDtBQUNKO0FBakJzQjtRQUFkLGEsR0FBQSxhOzs7QUNIYjs7Ozs7OztBQUVBOztBQUNBLE1BQU0sU0FBUyxRQUFRLGFBQVIsQ0FBZjs7QUFFTyxNQUFNLElBQU4sQ0FBVztBQUNkLGdCQUFZLE1BQVosRUFBb0I7O0FBRWhCO0FBQ0EsYUFBSyxXQUFMLEdBQW1CLE1BQW5CO0FBQ0EsYUFBSyxRQUFMLEdBQWdCLE9BQU8sVUFBUCxDQUFrQixJQUFsQixDQUFoQjtBQUNBLGFBQUssVUFBTCxHQUFrQixTQUFTLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBbEI7QUFDQSxhQUFLLFVBQUwsQ0FBZ0IsS0FBaEIsR0FBd0IsT0FBTyxLQUEvQjtBQUNBLGFBQUssVUFBTCxDQUFnQixNQUFoQixHQUF5QixPQUFPLE1BQWhDO0FBQ0EsYUFBSyxPQUFMLEdBQWUsS0FBSyxVQUFMLENBQWdCLFVBQWhCLENBQTJCLElBQTNCLENBQWY7O0FBRUEsYUFBSyxLQUFMLEdBQWEsT0FBTyxLQUFwQjtBQUNBLGFBQUssTUFBTCxHQUFjLE9BQU8sTUFBckI7O0FBRUE7QUFDQSxhQUFLLE9BQUwsR0FBZSxZQUFZLEdBQVosRUFBZjtBQUNBLGFBQUssTUFBTCxHQUFjLEtBQWQ7O0FBRUEsYUFBSyxRQUFMLEdBQWdCO0FBQ1o7QUFDQSx5QkFBUSxNQUFSLENBQWUsSUFBZixDQUZZLEVBR1osaUJBQVEsTUFBUixDQUFlLElBQWYsQ0FIWSxFQUlaLGlCQUFRLE1BQVIsQ0FBZSxJQUFmLENBSlksQ0FBaEI7QUFPQSxhQUFLLE1BQUwsR0FBYyxJQUFJLE1BQUosQ0FBVyxFQUFDLEdBQUcsS0FBSyxVQUFMLENBQWdCLEtBQWhCLEdBQXNCLENBQTFCLEVBQTZCLEdBQUcsS0FBSyxVQUFMLENBQWdCLE1BQWhCLEdBQXVCLENBQXZELEVBQVgsRUFBc0UsS0FBSyxVQUEzRSxDQUFkO0FBQ0g7O0FBRUQsVUFBTSxJQUFOLEVBQVk7QUFDUixhQUFLLE1BQUwsR0FBZSxRQUFRLElBQXZCO0FBQ0g7O0FBRUQsU0FBSyxPQUFMLEVBQWM7QUFDVixZQUFJLE9BQU8sSUFBWDtBQUNBLFlBQUksY0FBYyxVQUFVLEtBQUssT0FBakM7QUFDQSxhQUFLLE9BQUwsR0FBZSxPQUFmOztBQUVBLFlBQUcsQ0FBQyxLQUFLLE1BQVQsRUFBaUIsS0FBSyxNQUFMLENBQVksV0FBWjtBQUNqQixhQUFLLE1BQUwsQ0FBWSxXQUFaLEVBQXlCLEtBQUssT0FBOUI7QUFDQSxhQUFLLFFBQUwsQ0FBYyxTQUFkLENBQXdCLEtBQUssVUFBN0IsRUFBeUMsQ0FBekMsRUFBNEMsQ0FBNUM7QUFDSDs7QUFHRCxXQUFPLFdBQVAsRUFBb0I7QUFDaEIsYUFBSyxNQUFMLENBQVksTUFBWixDQUFtQixXQUFuQjtBQUNBLGFBQUssSUFBSSxPQUFULElBQW9CLEtBQUssUUFBekIsRUFBbUM7QUFDL0Isb0JBQVEsTUFBUixDQUFlLFdBQWY7QUFDSDtBQUNEO0FBQ0g7O0FBRUQsV0FBTyxXQUFQLEVBQW9CLEdBQXBCLEVBQXlCO0FBQ3JCLFlBQUksU0FBSixHQUFnQixPQUFoQjtBQUNBLFlBQUksUUFBSixDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsS0FBSyxVQUFMLENBQWdCLEtBQW5DLEVBQTBDLEtBQUssVUFBTCxDQUFnQixNQUExRDtBQUNBLGFBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsV0FBbkIsRUFBZ0MsR0FBaEM7O0FBRUEsYUFBSyxJQUFJLE9BQVQsSUFBb0IsS0FBSyxRQUF6QixFQUFtQztBQUMvQixvQkFBUSxNQUFSLENBQWUsV0FBZixFQUE0QixHQUE1QjtBQUNIO0FBQ0o7QUEzRGE7UUFBTCxJLEdBQUEsSTs7O0FDTGI7O0FBRUEsTUFBTSxlQUFlLE9BQUssQ0FBMUI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQVUsTUFBM0I7O0FBRUEsU0FBUyxNQUFULENBQWdCLFFBQWhCLEVBQTBCLE1BQTFCLEVBQWtDO0FBQ2hDLE9BQUssVUFBTCxHQUFrQixPQUFPLEtBQXpCO0FBQ0EsT0FBSyxXQUFMLEdBQW1CLE9BQU8sTUFBMUI7QUFDQSxPQUFLLEtBQUwsR0FBYSxNQUFiO0FBQ0EsT0FBSyxRQUFMLEdBQWdCO0FBQ2QsT0FBRyxTQUFTLENBREU7QUFFZCxPQUFHLFNBQVM7QUFGRSxHQUFoQjtBQUlBLE9BQUssUUFBTCxHQUFnQjtBQUNkLE9BQUcsQ0FEVztBQUVkLE9BQUc7QUFGVyxHQUFoQjtBQUlBLE9BQUssS0FBTCxHQUFhLENBQWI7QUFDQSxPQUFLLE1BQUwsR0FBZSxFQUFmO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLEtBQWxCOztBQUVBLE1BQUksT0FBTyxJQUFYO0FBQ0EsU0FBTyxTQUFQLEdBQW1CLFVBQVMsS0FBVCxFQUFnQjtBQUNqQyxZQUFPLE1BQU0sR0FBYjtBQUNFLFdBQUssU0FBTCxDQURGLENBQ2tCO0FBQ2hCLFdBQUssR0FBTDtBQUNFLGFBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNBO0FBQ0YsV0FBSyxXQUFMLENBTEYsQ0FLb0I7QUFDbEIsV0FBSyxHQUFMO0FBQ0UsYUFBSyxTQUFMLEdBQWlCLElBQWpCO0FBQ0E7QUFDRixXQUFLLFlBQUwsQ0FURixDQVNxQjtBQUNuQixXQUFLLEdBQUw7QUFDRSxhQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDQTtBQVpKO0FBY0QsR0FmRDs7QUFpQkEsU0FBTyxPQUFQLEdBQWlCLFVBQVMsS0FBVCxFQUFnQjtBQUMvQixZQUFPLE1BQU0sR0FBYjtBQUNFLFdBQUssU0FBTCxDQURGLENBQ2tCO0FBQ2hCLFdBQUssR0FBTDtBQUNFLGFBQUssU0FBTCxHQUFpQixLQUFqQjtBQUNBO0FBQ0YsV0FBSyxXQUFMLENBTEYsQ0FLb0I7QUFDbEIsV0FBSyxHQUFMO0FBQ0UsYUFBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0E7QUFDRixXQUFLLFlBQUwsQ0FURixDQVNxQjtBQUNuQixXQUFLLEdBQUw7QUFDRSxhQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDQTtBQVpKO0FBY0QsR0FmRDtBQWdCRDs7QUFFRCxPQUFPLFNBQVAsQ0FBaUIsTUFBakIsR0FBMEIsVUFBUyxJQUFULEVBQWU7QUFDdkM7QUFDQSxNQUFHLEtBQUssU0FBUixFQUFtQjtBQUNqQixTQUFLLEtBQUwsSUFBYyxPQUFPLEtBQXJCO0FBQ0Q7QUFDRCxNQUFHLEtBQUssVUFBUixFQUFvQjtBQUNsQixTQUFLLEtBQUwsSUFBYyxHQUFkO0FBQ0Q7QUFDRDtBQUNBLE1BQUcsS0FBSyxTQUFSLEVBQW1CO0FBQ2pCLFFBQUksZUFBZTtBQUNqQixTQUFHLEtBQUssR0FBTCxDQUFTLEtBQUssS0FBZCxDQURjO0FBRWpCLFNBQUcsS0FBSyxHQUFMLENBQVMsS0FBSyxLQUFkO0FBRmMsS0FBbkI7QUFJQSxTQUFLLFFBQUwsQ0FBYyxDQUFkLElBQW1CLGFBQWEsQ0FBYixHQUFlLENBQWxDO0FBQ0EsU0FBSyxRQUFMLENBQWMsQ0FBZCxJQUFtQixhQUFhLENBQWIsR0FBZSxDQUFsQztBQUNEO0FBQ0Q7QUFDQSxPQUFLLFFBQUwsQ0FBYyxDQUFkLElBQW1CLEtBQUssUUFBTCxDQUFjLENBQWpDO0FBQ0EsT0FBSyxRQUFMLENBQWMsQ0FBZCxJQUFtQixLQUFLLFFBQUwsQ0FBYyxDQUFqQztBQUNBO0FBQ0EsTUFBRyxLQUFLLFFBQUwsQ0FBYyxDQUFkLEdBQWtCLENBQXJCLEVBQXdCLEtBQUssUUFBTCxDQUFjLENBQWQsSUFBbUIsS0FBSyxVQUF4QjtBQUN4QixNQUFHLEtBQUssUUFBTCxDQUFjLENBQWQsR0FBa0IsS0FBSyxVQUExQixFQUFzQyxLQUFLLFFBQUwsQ0FBYyxDQUFkLElBQW1CLEtBQUssVUFBeEI7QUFDdEMsTUFBRyxLQUFLLFFBQUwsQ0FBYyxDQUFkLEdBQWtCLENBQXJCLEVBQXdCLEtBQUssUUFBTCxDQUFjLENBQWQsSUFBbUIsS0FBSyxXQUF4QjtBQUN4QixNQUFHLEtBQUssUUFBTCxDQUFjLENBQWQsR0FBa0IsS0FBSyxXQUExQixFQUF1QyxLQUFLLFFBQUwsQ0FBYyxDQUFkLElBQW1CLEtBQUssV0FBeEI7QUFDeEMsQ0F6QkQ7O0FBMkJBLE9BQU8sU0FBUCxDQUFpQixNQUFqQixHQUEwQixVQUFTLElBQVQsRUFBZSxHQUFmLEVBQW9CO0FBQzVDLE1BQUksSUFBSjs7QUFFQTtBQUNBLE1BQUksU0FBSixDQUFjLEtBQUssUUFBTCxDQUFjLENBQTVCLEVBQStCLEtBQUssUUFBTCxDQUFjLENBQTdDO0FBQ0EsTUFBSSxNQUFKLENBQVcsQ0FBQyxLQUFLLEtBQWpCO0FBQ0EsTUFBSSxTQUFKO0FBQ0EsTUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFjLENBQUMsRUFBZjtBQUNBLE1BQUksTUFBSixDQUFXLENBQUMsRUFBWixFQUFnQixFQUFoQjtBQUNBLE1BQUksTUFBSixDQUFXLENBQVgsRUFBYyxDQUFkO0FBQ0EsTUFBSSxNQUFKLENBQVcsRUFBWCxFQUFlLEVBQWY7QUFDQSxNQUFJLFNBQUo7QUFDQSxNQUFJLFdBQUosR0FBa0IsT0FBbEI7QUFDQSxNQUFJLE1BQUo7O0FBRUE7QUFDQSxNQUFHLEtBQUssU0FBUixFQUFtQjtBQUNqQixRQUFJLFNBQUo7QUFDQSxRQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWMsRUFBZDtBQUNBLFFBQUksTUFBSixDQUFXLENBQVgsRUFBYyxFQUFkO0FBQ0EsUUFBSSxHQUFKLENBQVEsQ0FBUixFQUFXLEVBQVgsRUFBZSxDQUFmLEVBQWtCLENBQWxCLEVBQXFCLEtBQUssRUFBMUIsRUFBOEIsSUFBOUI7QUFDQSxRQUFJLFNBQUo7QUFDQSxRQUFJLFdBQUosR0FBa0IsUUFBbEI7QUFDQSxRQUFJLE1BQUo7QUFDRDtBQUNELE1BQUksT0FBSjtBQUNELENBMUJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0dhbWV9IGZyb20gJy4vZ2FtZS5qcydcblxudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY3JlZW4nKTtcbnZhciBnYW1lID0gbmV3IEdhbWUoY2FudmFzKTtcblxudmFyIG1hc3Rlckxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgZ2FtZS5sb29wKHRpbWVzdGFtcCk7XG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobWFzdGVyTG9vcCk7XG59XG5tYXN0ZXJMb29wKHBlcmZvcm1hbmNlLm5vdygpKTtcbiIsImltcG9ydCB7QWN0b3J9IGZyb20gJy4vY29tbW9uL2FjdG9yJ1xuXG5mdW5jdGlvbiBsb2FkSW1hZ2UobmFtZSkge1xuICAgIGxldCBpbWFnZSA9IG5ldyBJbWFnZSgpXG4gICAgaW1hZ2Uuc3JjID0gYC4vYXNzZXRzLyR7bmFtZX0ucG5nYFxuICAgIHJldHVybiBpbWFnZVxufVxuXG4vLyBleHBvcnQgY2xhc3MgQXN0cm9pZCBleHRlbmRzIEFjdG9yIHtcbi8vICAgICBjb25zdHJ1Y3Rvcih3b3JsZCwge3gsIHksIHIsIGR4LCBkeSwgZHIsIHNjYWxlfSkge1xuLy8gICAgICAgICBzdXBlcih3b3JsZClcbi8vICAgICAgICAgdGhpcy54ID0geFxuLy8gICAgICAgICB0aGlzLnkgPSB5XG4vLyAgICAgICAgIHRoaXMucm90ID0gclxuLy9cbi8vICAgICAgICAgdGhpcy5keCA9IGR4XG4vLyAgICAgICAgIHRoaXMuZHkgPSBkeVxuLy8gICAgICAgICB0aGlzLmRyb3QgPSBkclxuLy9cbi8vICAgICAgICAgLy8gdGhpcy5wb2ludHMgPSBbXG4vLyAgICAgICAgIC8vICAgICB7eDogMSwgeTogMX0sXG4vLyAgICAgICAgIC8vICAgICB7eDogMSwgeTogMTJ9LFxuLy8gICAgICAgICAvLyAgICAge3g6IC0xMCwgeTogOH0sXG4vLyAgICAgICAgIC8vICAgICB7eDogLTE2LCB5OiAtMn0sXG4vLyAgICAgICAgIC8vICAgICB7eDogLTQsIHk6IC0xMH0sXG4vLyAgICAgICAgIC8vICAgICB7eDogOCwgeTogLTEwfSxcbi8vICAgICAgICAgLy8gICAgIHt4OiAxMiwgeTogMH0sXG4vLyAgICAgICAgIC8vIF1cbi8vICAgICAgICAgdGhpcy5wb2ludHMgPSBbXG4vLyAgICAgICAgICAgICB7eDogLTEyLCB5OiAtMTJ9LFxuLy8gICAgICAgICAgICAge3g6IC0xMiwgeTogMTJ9LFxuLy8gICAgICAgICAgICAge3g6IDEyLCB5OiAxMn0sXG4vLyAgICAgICAgICAgICB7eDogMTIsIHk6IC0xMn0sXG4vLyAgICAgICAgIF1cbi8vICAgICAgICAgdGhpcy5zY2FsZSA9IHNjYWxlXG4vLyAgICAgfVxuLy9cbi8vICAgICAqYmFzZUNvbnRyb2xTdGF0ZSgpIHtcbi8vICAgICAgICAgd2hpbGUgKHRydWUpIHtcbi8vICAgICAgICAgICAgIGxldCB7ZHR9ID0geWllbGRcbi8vICAgICAgICAgICAgIHRoaXMucm90ICs9IHRoaXMuZHJvdFxuLy8gICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMuZHhcbi8vICAgICAgICAgICAgIHRoaXMueSArPSB0aGlzLmR5XG4vL1xuLy8gICAgICAgICAgICAgbGV0IG9uX3NjcmVlbl94ID0gMFxuLy8gICAgICAgICAgICAgbGV0IG9uX3NjcmVlbl95ID0gMFxuLy8gICAgICAgICAgICAgZm9yIChsZXQge3gsIHl9IG9mIHRoaXMucG9pbnRzKSB7XG4vLyAgICAgICAgICAgICAgICAgeCA9IHRoaXMueCArIHgqdGhpcy5zY2FsZVxuLy8gICAgICAgICAgICAgICAgIHkgPSB0aGlzLnkgKyB5KnRoaXMuc2NhbGVcbi8vICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh4LCB5KVxuLy8gICAgICAgICAgICAgICAgIG9uX3NjcmVlbl94IHw9ICh4ID4gMCAmJiB4IDwgdGhpcy53b3JsZC53aWR0aCl8MFxuLy8gICAgICAgICAgICAgICAgIG9uX3NjcmVlbl95IHw9ICh5ID4gMCAmJiB5IDwgdGhpcy53b3JsZC5oZWlnaHQpfDBcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIGlmICghb25fc2NyZWVuX3gpIHtcbi8vICAgICAgICAgICAgICAgICBpZiAoKHRoaXMueCA8IDAgJiYgdGhpcy5keCA8IDApIHx8ICh0aGlzLnggPiB0aGlzLndvcmxkLndpZHRoICYmIHRoaXMuZHggPiAwKSkge1xuLy8gICAgICAgICAgICAgICAgICAgICB0aGlzLnggPSB0aGlzLndvcmxkLndpZHRoIC0gdGhpcy54XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgaWYgKCFvbl9zY3JlZW5feSkge1xuLy8gICAgICAgICAgICAgICAgIGlmICgodGhpcy55IDwgMCAmJiB0aGlzLmR5IDwgMCkgfHwgKHRoaXMueSA+IHRoaXMud29ybGQuaGVpZ2h0ICYmIHRoaXMuZHkgPiAwKSkge1xuLy8gICAgICAgICAgICAgICAgICAgICB0aGlzLnkgPSB0aGlzLndvcmxkLmhlaWdodCAtIHRoaXMueVxuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vXG4vLyAgICAgKmJhc2VSZW5kZXJTdGF0ZSgpIHtcbi8vICAgICAgICAgd2hpbGUgKHRydWUpIHtcbi8vICAgICAgICAgICAgIGxldCB7Y3R4LCBkdH0gPSB5aWVsZFxuLy8gICAgICAgICAgICAgbGV0IHBvaW50cyA9IHJvdGF0ZSh0aGlzLnJvdCwgdGhpcy5wb2ludHMpXG4vLyAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKClcbi8vICAgICAgICAgICAgIGN0eC5saW5lV2lkdGg9XCIyXCJcbi8vICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZT1cImdyZXlcIlxuLy9cbi8vICAgICAgICAgICAgIGxldCB7eCwgeX0gPSBwb2ludHNbMF1cbi8vICAgICAgICAgICAgIGN0eC5tb3ZlVG8odGhpcy54K3gqdGhpcy5zY2FsZSwgdGhpcy55K3kqdGhpcy5zY2FsZSlcbi8vICAgICAgICAgICAgIGZvciAobGV0IHt4LCB5fSBvZiBwb2ludHMpIHtcbi8vICAgICAgICAgICAgICAgICBjdHgubGluZVRvKHRoaXMueCt4KnRoaXMuc2NhbGUsIHRoaXMueSt5KnRoaXMuc2NhbGUpXG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICBjdHgubGluZVRvKHRoaXMueCt4KnRoaXMuc2NhbGUsIHRoaXMueSt5KnRoaXMuc2NhbGUpXG4vLyAgICAgICAgICAgICBjdHguc3Ryb2tlKClcbi8vICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAneWVsbG93J1xuLy8gICAgICAgICAgICAgY3R4LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCAyLCAyKVxuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gfVxuLy9cbi8vIGZ1bmN0aW9uIHJvdGF0ZShyb3QsIHBvaW50cykge1xuLy8gICAgIGxldCByZXN1bHQgPSBbXVxuLy8gICAgIGxldCBzaW4gPSBNYXRoLnNpbihyb3QpXG4vLyAgICAgbGV0IGNvcyA9IE1hdGguY29zKHJvdClcbi8vXG4vLyAgICAgZm9yIChsZXQge3gsIHl9IG9mIHBvaW50cykge1xuLy8gICAgICAgICByZXN1bHQucHVzaCh7XG4vLyAgICAgICAgICAgICB4OiB4KmNvcyAtIHkqc2luLFxuLy8gICAgICAgICAgICAgeTogeCpzaW4gKyB5KmNvcyxcbi8vICAgICAgICAgfSlcbi8vICAgICB9XG4vLyAgICAgcmV0dXJuIHJlc3VsdFxuLy8gfVxuXG5cbmNvbnN0IFNQUklURVMgPSBbXG4gICAgbG9hZEltYWdlKCdyb2lkMScpLFxuICAgIGxvYWRJbWFnZSgncm9pZDInKSxcbiAgICBsb2FkSW1hZ2UoJ3JvaWQzJyksXG4gICAgbG9hZEltYWdlKCdyb2lkNCcpLFxuICAgIGxvYWRJbWFnZSgncm9pZDUnKSxcbl1cbmNvbnN0IGJhc2Vfc2l6ZSA9IDIwXG5cbmV4cG9ydCBjbGFzcyBBc3Ryb2lkIGV4dGVuZHMgQWN0b3Ige1xuXG5cbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCwge3gsIHksIHIsIGR4LCBkeSwgZHIsIHNjYWxlfSkge1xuICAgICAgICBzdXBlcih3b3JsZClcbiAgICAgICAgdGhpcy54ID0geFxuICAgICAgICB0aGlzLnkgPSB5XG4gICAgICAgIHRoaXMucm90ID0gclxuXG4gICAgICAgIHRoaXMuZHggPSBkeFxuICAgICAgICB0aGlzLmR5ID0gZHlcbiAgICAgICAgdGhpcy5kcm90ID0gZHJcblxuICAgICAgICB0aGlzLnNjYWxlID0gc2NhbGVcbiAgICAgICAgdGhpcy5pbWFnZSA9IFNQUklURVNbKE1hdGgucmFuZG9tKCkgKiBTUFJJVEVTLmxlbmd0aCl8MF1cbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKHdvcmxkKSB7XG4gICAgICAgIGxldCB0ID0gbmV3IHRoaXMod29ybGQsIHtcbiAgICAgICAgICAgIHg6ICh3b3JsZC53aWR0aCAqIE1hdGgucmFuZG9tKCkpfDAsXG4gICAgICAgICAgICB5OiAod29ybGQuaGVpZ2h0ICogTWF0aC5yYW5kb20oKSl8MCxcbiAgICAgICAgICAgIHI6IE1hdGgucmFuZG9tKCkqNCxcbiAgICAgICAgICAgIGR4OiAoLS41ICsgTWF0aC5yYW5kb20oKSkqNCxcbiAgICAgICAgICAgIGR5OiAoLS41ICsgTWF0aC5yYW5kb20oKSkqNCxcbiAgICAgICAgICAgIGRyb3Q6ICgtLjUgKyBNYXRoLnJhbmRvbSgpKSo0LFxuICAgICAgICAgICAgc2NhbGU6IChNYXRoLnJhbmRvbSgpKjUpfDAsXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiB0XG4gICAgfVxuXG4gICAgKmJhc2VDb250cm9sU3RhdGUoKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0fSA9IHlpZWxkXG4gICAgICAgICAgICB0aGlzLnJvdCArPSB0aGlzLmRyb3RcbiAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLmR4XG4gICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy5keVxuICAgICAgICAgICAgbGV0IHJhZGl1cyA9IGJhc2Vfc2l6ZSAqIHRoaXMuc2NhbGUgLyAyXG5cbiAgICAgICAgICAgIGlmICgodGhpcy54ICsgcmFkaXVzIDwgMCAmJiB0aGlzLmR4IDwgMCkgfHwgKHRoaXMueCAtIHJhZGl1cyA+IHRoaXMud29ybGQud2lkdGggJiYgdGhpcy5keCA+IDApKSB7XG4gICAgICAgICAgICAgICAgdGhpcy54ID0gdGhpcy53b3JsZC53aWR0aCAtIHRoaXMueFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKHRoaXMueSArIHJhZGl1cyA8IDAgJiYgdGhpcy5keSA8IDApIHx8ICh0aGlzLnkgLSByYWRpdXMgPiB0aGlzLndvcmxkLmhlaWdodCAmJiB0aGlzLmR5ID4gMCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSB0aGlzLndvcmxkLmhlaWdodCAtIHRoaXMueVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqYmFzZVJlbmRlclN0YXRlKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtjdHgsIGR0fSA9IHlpZWxkXG4gICAgICAgICAgICBsZXQgcmFkaXVzID0gYmFzZV9zaXplICogdGhpcy5zY2FsZSAvIDJcbiAgICAgICAgICAgIGN0eC5zYXZlKClcbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpXG4gICAgICAgICAgICBjdHgucm90YXRlKHRoaXMucm90KVxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlLCAtcmFkaXVzLCAtcmFkaXVzLCByYWRpdXMqMiwgcmFkaXVzKjIpXG4gICAgICAgICAgICAvLyBjdHguc3Ryb2tlU3R5bGUgPSAneWVsbG93J1xuICAgICAgICAgICAgLy8gY3R4LmFyYygwLCAwLCByYWRpdXMsIDAsIDcpXG4gICAgICAgICAgICAvLyBjdHguc3Ryb2tlKClcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKClcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0V2ZW50TGlzdGVuZXJ9IGZyb20gXCIuL2V2ZW50cy5qc1wiO1xuXG5cbmV4cG9ydCBjbGFzcyBBY3RvciB7XG4gICAgY29uc3RydWN0b3Iod29ybGQpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRMaXN0ZW5lcigpO1xuXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy53aWR0aCA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuXG4gICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5iYXNlQ29udHJvbFN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMuYmFzZVJlbmRlclN0YXRlLmJpbmQodGhpcykoKTtcbiAgICB9XG5cbiAgICBnZXRIaXRCb3hlcygpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbGxlY3QoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB1cGRhdGUoZHQpIHtcbiAgICAgICAgbGV0IGN1ciA9IHRoaXMuY29udHJvbFN0YXRlLm5leHQoe2R0OiBkdH0pO1xuICAgICAgICBpZiAoY3VyLnZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gY3VyLnZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xTdGF0ZSA9IHRoaXMuYmFzZUNvbnRyb2xTdGF0ZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoZHQsIGN0eCkge1xuICAgICAgICBsZXQgY3VyID0gdGhpcy5yZW5kZXJTdGF0ZS5uZXh0KHtkdDogZHQsIGN0eDogY3R4fSk7XG4gICAgICAgIGlmIChjdXIudmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IGN1ci52YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIuZG9uZSkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMuYmFzZVJlbmRlclN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICpiYXNlQ29udHJvbFN0YXRlICgpIHt9XG4gICAgKmJhc2VSZW5kZXJTdGF0ZSAoKSB7fVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cblxuZXhwb3J0IGNsYXNzIEV2ZW50TGlzdGVuZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IHt9O1xuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZnVuYykge1xuICAgICAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHNbbmFtZV0gfHwgW107XG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gZXZlbnRzO1xuXG4gICAgICAgIGV2ZW50cy5wdXNoKGZ1bmMpO1xuICAgIH1cblxuICAgIGVtaXQobmFtZSwgYXJncykge1xuICAgICAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHNbbmFtZV0gfHwgW107XG4gICAgICAgIGZvciAobGV0IGV2IG9mIGV2ZW50cykge1xuICAgICAgICAgICAgZXYoYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtBc3Ryb2lkfSBmcm9tICcuL2FzdHJvaWQnXG5jb25zdCBQbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllci5qcycpO1xuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3Ioc2NyZWVuKSB7XG5cbiAgICAgICAgLy8gU2V0IHVwIGJ1ZmZlcnNcbiAgICAgICAgdGhpcy5mcm9udEJ1ZmZlciA9IHNjcmVlbjtcbiAgICAgICAgdGhpcy5mcm9udEN0eCA9IHNjcmVlbi5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5iYWNrQnVmZmVyLndpZHRoID0gc2NyZWVuLndpZHRoO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIuaGVpZ2h0ID0gc2NyZWVuLmhlaWdodDtcbiAgICAgICAgdGhpcy5iYWNrQ3R4ID0gdGhpcy5iYWNrQnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IHNjcmVlbi53aWR0aFxuICAgICAgICB0aGlzLmhlaWdodCA9IHNjcmVlbi5oZWlnaHRcblxuICAgICAgICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gICAgICAgIHRoaXMub2xkVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuYXN0cm9pZHMgPSBbXG4gICAgICAgICAgICAvLyBuZXcgQXN0cm9pZCh0aGlzLCB7eDozMDAsIHk6MzAwLCByOjAsIGR4Oi0xLCBkeTowLCBkcjouMSwgc2NhbGU6IDJ9KSxcbiAgICAgICAgICAgIEFzdHJvaWQuY3JlYXRlKHRoaXMpLFxuICAgICAgICAgICAgQXN0cm9pZC5jcmVhdGUodGhpcyksXG4gICAgICAgICAgICBBc3Ryb2lkLmNyZWF0ZSh0aGlzKSxcbiAgICAgICAgICAgIC8vIG5ldyBBc3Ryb2lkKHRoaXMsIHt4OjMwLCB5OjMwMCwgcjowLCBkeDoxLCBkeTowLCBkcjouMSwgc2NhbGU6IDN9KSxcbiAgICAgICAgXVxuICAgICAgICB0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIoe3g6IHRoaXMuYmFja0J1ZmZlci53aWR0aC8yLCB5OiB0aGlzLmJhY2tCdWZmZXIuaGVpZ2h0LzJ9LCB0aGlzLmJhY2tCdWZmZXIpO1xuICAgIH1cblxuICAgIHBhdXNlKGZsYWcpIHtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSAoZmxhZyA9PSB0cnVlKTtcbiAgICB9XG5cbiAgICBsb29wKG5ld1RpbWUpIHtcbiAgICAgICAgdmFyIGdhbWUgPSB0aGlzO1xuICAgICAgICB2YXIgZWxhcHNlZFRpbWUgPSBuZXdUaW1lIC0gdGhpcy5vbGRUaW1lO1xuICAgICAgICB0aGlzLm9sZFRpbWUgPSBuZXdUaW1lO1xuXG4gICAgICAgIGlmKCF0aGlzLnBhdXNlZCkgdGhpcy51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAgICAgICB0aGlzLnJlbmRlcihlbGFwc2VkVGltZSwgdGhpcy5iYWNrQ3R4KTtcbiAgICAgICAgdGhpcy5mcm9udEN0eC5kcmF3SW1hZ2UodGhpcy5iYWNrQnVmZmVyLCAwLCAwKTtcbiAgICB9XG5cblxuICAgIHVwZGF0ZShlbGFwc2VkVGltZSkge1xuICAgICAgICB0aGlzLnBsYXllci51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAgICAgICBmb3IgKGxldCBhc3Ryb2lkIG9mIHRoaXMuYXN0cm9pZHMpIHtcbiAgICAgICAgICAgIGFzdHJvaWQudXBkYXRlKGVsYXBzZWRUaW1lKVxuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IFVwZGF0ZSB0aGUgZ2FtZSBvYmplY3RzXG4gICAgfVxuXG4gICAgcmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpIHtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuYmFja0J1ZmZlci53aWR0aCwgdGhpcy5iYWNrQnVmZmVyLmhlaWdodCk7XG4gICAgICAgIHRoaXMucGxheWVyLnJlbmRlcihlbGFwc2VkVGltZSwgY3R4KTtcblxuICAgICAgICBmb3IgKGxldCBhc3Ryb2lkIG9mIHRoaXMuYXN0cm9pZHMpIHtcbiAgICAgICAgICAgIGFzdHJvaWQucmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3QgTVNfUEVSX0ZSQU1FID0gMTAwMC84O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQbGF5ZXI7XG5cbmZ1bmN0aW9uIFBsYXllcihwb3NpdGlvbiwgY2FudmFzKSB7XG4gIHRoaXMud29ybGRXaWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgdGhpcy53b3JsZEhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG4gIHRoaXMuc3RhdGUgPSBcImlkbGVcIjtcbiAgdGhpcy5wb3NpdGlvbiA9IHtcbiAgICB4OiBwb3NpdGlvbi54LFxuICAgIHk6IHBvc2l0aW9uLnlcbiAgfTtcbiAgdGhpcy52ZWxvY2l0eSA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfVxuICB0aGlzLmFuZ2xlID0gMDtcbiAgdGhpcy5yYWRpdXMgID0gNjQ7XG4gIHRoaXMudGhydXN0aW5nID0gZmFsc2U7XG4gIHRoaXMuc3RlZXJMZWZ0ID0gZmFsc2U7XG4gIHRoaXMuc3RlZXJSaWdodCA9IGZhbHNlO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgd2luZG93Lm9ua2V5ZG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc3dpdGNoKGV2ZW50LmtleSkge1xuICAgICAgY2FzZSAnQXJyb3dVcCc6IC8vIHVwXG4gICAgICBjYXNlICd3JzpcbiAgICAgICAgc2VsZi50aHJ1c3RpbmcgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93TGVmdCc6IC8vIGxlZnRcbiAgICAgIGNhc2UgJ2EnOlxuICAgICAgICBzZWxmLnN0ZWVyTGVmdCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQXJyb3dSaWdodCc6IC8vIHJpZ2h0XG4gICAgICBjYXNlICdkJzpcbiAgICAgICAgc2VsZi5zdGVlclJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgd2luZG93Lm9ua2V5dXAgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHN3aXRjaChldmVudC5rZXkpIHtcbiAgICAgIGNhc2UgJ0Fycm93VXAnOiAvLyB1cFxuICAgICAgY2FzZSAndyc6XG4gICAgICAgIHNlbGYudGhydXN0aW5nID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQXJyb3dMZWZ0JzogLy8gbGVmdFxuICAgICAgY2FzZSAnYSc6XG4gICAgICAgIHNlbGYuc3RlZXJMZWZ0ID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQXJyb3dSaWdodCc6IC8vIHJpZ2h0XG4gICAgICBjYXNlICdkJzpcbiAgICAgICAgc2VsZi5zdGVlclJpZ2h0ID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgLy8gQXBwbHkgYW5ndWxhciB2ZWxvY2l0eVxuICBpZih0aGlzLnN0ZWVyTGVmdCkge1xuICAgIHRoaXMuYW5nbGUgKz0gdGltZSAqIDAuMDA1O1xuICB9XG4gIGlmKHRoaXMuc3RlZXJSaWdodCkge1xuICAgIHRoaXMuYW5nbGUgLT0gMC4xO1xuICB9XG4gIC8vIEFwcGx5IGFjY2VsZXJhdGlvblxuICBpZih0aGlzLnRocnVzdGluZykge1xuICAgIHZhciBhY2NlbGVyYXRpb24gPSB7XG4gICAgICB4OiBNYXRoLnNpbih0aGlzLmFuZ2xlKSxcbiAgICAgIHk6IE1hdGguY29zKHRoaXMuYW5nbGUpXG4gICAgfVxuICAgIHRoaXMudmVsb2NpdHkueCAtPSBhY2NlbGVyYXRpb24ueC80O1xuICAgIHRoaXMudmVsb2NpdHkueSAtPSBhY2NlbGVyYXRpb24ueS80O1xuICB9XG4gIC8vIEFwcGx5IHZlbG9jaXR5XG4gIHRoaXMucG9zaXRpb24ueCArPSB0aGlzLnZlbG9jaXR5Lng7XG4gIHRoaXMucG9zaXRpb24ueSArPSB0aGlzLnZlbG9jaXR5Lnk7XG4gIC8vIFdyYXAgYXJvdW5kIHRoZSBzY3JlZW5cbiAgaWYodGhpcy5wb3NpdGlvbi54IDwgMCkgdGhpcy5wb3NpdGlvbi54ICs9IHRoaXMud29ybGRXaWR0aDtcbiAgaWYodGhpcy5wb3NpdGlvbi54ID4gdGhpcy53b3JsZFdpZHRoKSB0aGlzLnBvc2l0aW9uLnggLT0gdGhpcy53b3JsZFdpZHRoO1xuICBpZih0aGlzLnBvc2l0aW9uLnkgPCAwKSB0aGlzLnBvc2l0aW9uLnkgKz0gdGhpcy53b3JsZEhlaWdodDtcbiAgaWYodGhpcy5wb3NpdGlvbi55ID4gdGhpcy53b3JsZEhlaWdodCkgdGhpcy5wb3NpdGlvbi55IC09IHRoaXMud29ybGRIZWlnaHQ7XG59XG5cblBsYXllci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24odGltZSwgY3R4KSB7XG4gIGN0eC5zYXZlKCk7XG5cbiAgLy8gRHJhdyBwbGF5ZXIncyBzaGlwXG4gIGN0eC50cmFuc2xhdGUodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuICBjdHgucm90YXRlKC10aGlzLmFuZ2xlKTtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKDAsIC0xMCk7XG4gIGN0eC5saW5lVG8oLTEwLCAxMCk7XG4gIGN0eC5saW5lVG8oMCwgMCk7XG4gIGN0eC5saW5lVG8oMTAsIDEwKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xuICBjdHguc3Ryb2tlKCk7XG5cbiAgLy8gRHJhdyBlbmdpbmUgdGhydXN0XG4gIGlmKHRoaXMudGhydXN0aW5nKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8oMCwgMjApO1xuICAgIGN0eC5saW5lVG8oNSwgMTApO1xuICAgIGN0eC5hcmMoMCwgMTAsIDUsIDAsIE1hdGguUEksIHRydWUpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJztcbiAgICBjdHguc3Ryb2tlKCk7XG4gIH1cbiAgY3R4LnJlc3RvcmUoKTtcbn1cbiJdfQ==
