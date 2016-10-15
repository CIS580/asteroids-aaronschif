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
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Astroid = undefined;

var _actor = require("./common/actor");

class Astroid extends _actor.Actor {
    constructor(world, { x, y, r, dx, dy, dr, scale }) {
        super(world);
        this.x = x;
        this.y = y;
        this.rot = r;

        this.dx = dx;
        this.dy = dy;
        this.drot = dr;

        // this.points = [
        //     {x: 1, y: 1},
        //     {x: 1, y: 12},
        //     {x: -10, y: 8},
        //     {x: -16, y: -2},
        //     {x: -4, y: -10},
        //     {x: 8, y: -10},
        //     {x: 12, y: 0},
        // ]
        this.points = [{ x: -12, y: -12 }, { x: -12, y: 12 }, { x: 12, y: 12 }, { x: 12, y: -12 }];
        this.scale = scale;
    }

    *baseControlState() {
        while (true) {
            let { dt } = yield;
            this.rot += this.drot;
            this.x += this.dx;
            this.y += this.dy;

            let on_screen_x = 0;
            let on_screen_y = 0;
            for (let { x, y } of this.points) {
                x = this.x + x * this.scale;
                y = this.y + y * this.scale;
                // console.log(x, y)
                on_screen_x |= (x > 0 && x < this.world.width) | 0;
                on_screen_y |= (y > 0 && y < this.world.height) | 0;
            }
            if (!on_screen_x) {
                if (this.x < 0 && this.dx < 0 || this.x > this.world.width && this.dx > 0) {
                    this.x = this.world.width - this.x;
                }
            }
            if (!on_screen_y) {
                if (this.y < 0 && this.dy < 0 || this.y > this.world.height && this.dy > 0) {
                    this.y = this.world.height - this.y;
                }
            }
        }
    }

    *baseRenderState() {
        while (true) {
            let { ctx, dt } = yield;
            let points = rotate(this.rot, this.points);
            ctx.beginPath();
            ctx.lineWidth = "2";
            ctx.strokeStyle = "grey";

            let { x, y } = points[0];
            ctx.moveTo(this.x + x * this.scale, this.y + y * this.scale);
            for (let { x, y } of points) {
                ctx.lineTo(this.x + x * this.scale, this.y + y * this.scale);
            }
            ctx.lineTo(this.x + x * this.scale, this.y + y * this.scale);
            ctx.stroke();
            ctx.fillStyle = 'yellow';
            ctx.fillRect(this.x, this.y, 2, 2);
        }
    }
}

exports.Astroid = Astroid;
function rotate(rot, points) {
    let result = [];
    let sin = Math.sin(rot);
    let cos = Math.cos(rot);

    for (let { x, y } of points) {
        result.push({
            x: x * cos - y * sin,
            y: x * sin + y * cos
        });
    }
    return result;
}

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

        this.astroids = [new _astroid.Astroid(this, { x: 300, y: 300, r: 0, dx: -1, dy: 0, dr: .1, scale: 2 })];
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
    this.velocity.x -= acceleration.x;
    this.velocity.y -= acceleration.y;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2FzdHJvaWQuanMiLCJzcmMvY29tbW9uL2FjdG9yLmpzIiwic3JjL2NvbW1vbi9ldmVudHMuanMiLCJzcmMvZ2FtZS5qcyIsInNyYy9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7QUFFQSxJQUFJLFNBQVMsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQWI7QUFDQSxJQUFJLE9BQU8sZUFBUyxNQUFULENBQVg7O0FBRUEsSUFBSSxhQUFhLFVBQVMsU0FBVCxFQUFvQjtBQUNuQyxPQUFLLElBQUwsQ0FBVSxTQUFWO0FBQ0EsU0FBTyxxQkFBUCxDQUE2QixVQUE3QjtBQUNELENBSEQ7QUFJQSxXQUFXLFlBQVksR0FBWixFQUFYOzs7Ozs7Ozs7O0FDWEE7O0FBRU8sTUFBTSxPQUFOLHNCQUE0QjtBQUMvQixnQkFBWSxLQUFaLEVBQW1CLEVBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsRUFBVixFQUFjLEVBQWQsRUFBa0IsRUFBbEIsRUFBc0IsS0FBdEIsRUFBbkIsRUFBaUQ7QUFDN0MsY0FBTSxLQUFOO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUssQ0FBTCxHQUFTLENBQVQ7QUFDQSxhQUFLLEdBQUwsR0FBVyxDQUFYOztBQUVBLGFBQUssRUFBTCxHQUFVLEVBQVY7QUFDQSxhQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsYUFBSyxJQUFMLEdBQVksRUFBWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLLE1BQUwsR0FBYyxDQUNWLEVBQUMsR0FBRyxDQUFDLEVBQUwsRUFBUyxHQUFHLENBQUMsRUFBYixFQURVLEVBRVYsRUFBQyxHQUFHLENBQUMsRUFBTCxFQUFTLEdBQUcsRUFBWixFQUZVLEVBR1YsRUFBQyxHQUFHLEVBQUosRUFBUSxHQUFHLEVBQVgsRUFIVSxFQUlWLEVBQUMsR0FBRyxFQUFKLEVBQVEsR0FBRyxDQUFDLEVBQVosRUFKVSxDQUFkO0FBTUEsYUFBSyxLQUFMLEdBQWEsS0FBYjtBQUNIOztBQUVELEtBQUMsZ0JBQUQsR0FBb0I7QUFDaEIsZUFBTyxJQUFQLEVBQWE7QUFDVCxnQkFBSSxFQUFDLEVBQUQsS0FBTyxLQUFYO0FBQ0EsaUJBQUssR0FBTCxJQUFZLEtBQUssSUFBakI7QUFDQSxpQkFBSyxDQUFMLElBQVUsS0FBSyxFQUFmO0FBQ0EsaUJBQUssQ0FBTCxJQUFVLEtBQUssRUFBZjs7QUFFQSxnQkFBSSxjQUFjLENBQWxCO0FBQ0EsZ0JBQUksY0FBYyxDQUFsQjtBQUNBLGlCQUFLLElBQUksRUFBQyxDQUFELEVBQUksQ0FBSixFQUFULElBQW1CLEtBQUssTUFBeEIsRUFBZ0M7QUFDNUIsb0JBQUksS0FBSyxDQUFMLEdBQVMsSUFBRSxLQUFLLEtBQXBCO0FBQ0Esb0JBQUksS0FBSyxDQUFMLEdBQVMsSUFBRSxLQUFLLEtBQXBCO0FBQ0E7QUFDQSwrQkFBZSxDQUFDLElBQUksQ0FBSixJQUFTLElBQUksS0FBSyxLQUFMLENBQVcsS0FBekIsSUFBZ0MsQ0FBL0M7QUFDQSwrQkFBZSxDQUFDLElBQUksQ0FBSixJQUFTLElBQUksS0FBSyxLQUFMLENBQVcsTUFBekIsSUFBaUMsQ0FBaEQ7QUFDSDtBQUNELGdCQUFJLENBQUMsV0FBTCxFQUFrQjtBQUNkLG9CQUFLLEtBQUssQ0FBTCxHQUFTLENBQVQsSUFBYyxLQUFLLEVBQUwsR0FBVSxDQUF6QixJQUFnQyxLQUFLLENBQUwsR0FBUyxLQUFLLEtBQUwsQ0FBVyxLQUFwQixJQUE2QixLQUFLLEVBQUwsR0FBVSxDQUEzRSxFQUErRTtBQUMzRSx5QkFBSyxDQUFMLEdBQVMsS0FBSyxLQUFMLENBQVcsS0FBWCxHQUFtQixLQUFLLENBQWpDO0FBQ0g7QUFDSjtBQUNELGdCQUFJLENBQUMsV0FBTCxFQUFrQjtBQUNkLG9CQUFLLEtBQUssQ0FBTCxHQUFTLENBQVQsSUFBYyxLQUFLLEVBQUwsR0FBVSxDQUF6QixJQUFnQyxLQUFLLENBQUwsR0FBUyxLQUFLLEtBQUwsQ0FBVyxNQUFwQixJQUE4QixLQUFLLEVBQUwsR0FBVSxDQUE1RSxFQUFnRjtBQUM1RSx5QkFBSyxDQUFMLEdBQVMsS0FBSyxLQUFMLENBQVcsTUFBWCxHQUFvQixLQUFLLENBQWxDO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7O0FBRUQsS0FBQyxlQUFELEdBQW1CO0FBQ2YsZUFBTyxJQUFQLEVBQWE7QUFDVCxnQkFBSSxFQUFDLEdBQUQsRUFBTSxFQUFOLEtBQVksS0FBaEI7QUFDQSxnQkFBSSxTQUFTLE9BQU8sS0FBSyxHQUFaLEVBQWlCLEtBQUssTUFBdEIsQ0FBYjtBQUNBLGdCQUFJLFNBQUo7QUFDQSxnQkFBSSxTQUFKLEdBQWMsR0FBZDtBQUNBLGdCQUFJLFdBQUosR0FBZ0IsTUFBaEI7O0FBRUEsZ0JBQUksRUFBQyxDQUFELEVBQUksQ0FBSixLQUFTLE9BQU8sQ0FBUCxDQUFiO0FBQ0EsZ0JBQUksTUFBSixDQUFXLEtBQUssQ0FBTCxHQUFPLElBQUUsS0FBSyxLQUF6QixFQUFnQyxLQUFLLENBQUwsR0FBTyxJQUFFLEtBQUssS0FBOUM7QUFDQSxpQkFBSyxJQUFJLEVBQUMsQ0FBRCxFQUFJLENBQUosRUFBVCxJQUFtQixNQUFuQixFQUEyQjtBQUN2QixvQkFBSSxNQUFKLENBQVcsS0FBSyxDQUFMLEdBQU8sSUFBRSxLQUFLLEtBQXpCLEVBQWdDLEtBQUssQ0FBTCxHQUFPLElBQUUsS0FBSyxLQUE5QztBQUNIO0FBQ0QsZ0JBQUksTUFBSixDQUFXLEtBQUssQ0FBTCxHQUFPLElBQUUsS0FBSyxLQUF6QixFQUFnQyxLQUFLLENBQUwsR0FBTyxJQUFFLEtBQUssS0FBOUM7QUFDQSxnQkFBSSxNQUFKO0FBQ0EsZ0JBQUksU0FBSixHQUFnQixRQUFoQjtBQUNBLGdCQUFJLFFBQUosQ0FBYSxLQUFLLENBQWxCLEVBQXFCLEtBQUssQ0FBMUIsRUFBNkIsQ0FBN0IsRUFBZ0MsQ0FBaEM7QUFDSDtBQUNKO0FBNUU4Qjs7UUFBdEIsTyxHQUFBLE87QUErRWIsU0FBUyxNQUFULENBQWdCLEdBQWhCLEVBQXFCLE1BQXJCLEVBQTZCO0FBQ3pCLFFBQUksU0FBUyxFQUFiO0FBQ0EsUUFBSSxNQUFNLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBVjtBQUNBLFFBQUksTUFBTSxLQUFLLEdBQUwsQ0FBUyxHQUFULENBQVY7O0FBRUEsU0FBSyxJQUFJLEVBQUMsQ0FBRCxFQUFJLENBQUosRUFBVCxJQUFtQixNQUFuQixFQUEyQjtBQUN2QixlQUFPLElBQVAsQ0FBWTtBQUNSLGVBQUcsSUFBRSxHQUFGLEdBQVEsSUFBRSxHQURMO0FBRVIsZUFBRyxJQUFFLEdBQUYsR0FBUSxJQUFFO0FBRkwsU0FBWjtBQUlIO0FBQ0QsV0FBTyxNQUFQO0FBQ0g7OztBQzdGRDs7Ozs7OztBQUVBOztBQUdPLE1BQU0sS0FBTixDQUFZO0FBQ2YsZ0JBQVksS0FBWixFQUFtQjtBQUNmLGFBQUssTUFBTCxHQUFjLDJCQUFkOztBQUVBLGFBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxhQUFLLE1BQUwsR0FBYyxFQUFkOztBQUVBLGFBQUssWUFBTCxHQUFvQixLQUFLLGdCQUFMLENBQXNCLElBQXRCLENBQTJCLElBQTNCLEdBQXBCO0FBQ0EsYUFBSyxXQUFMLEdBQW1CLEtBQUssZUFBTCxDQUFxQixJQUFyQixDQUEwQixJQUExQixHQUFuQjtBQUNIOztBQUVELGtCQUFjO0FBQ1YsZUFBTyxFQUFQO0FBQ0g7O0FBRUQsY0FBVTtBQUNOLGVBQU8sS0FBUDtBQUNIOztBQUVELFdBQU8sRUFBUCxFQUFXO0FBQ1AsWUFBSSxNQUFNLEtBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixFQUFDLElBQUksRUFBTCxFQUF2QixDQUFWO0FBQ0EsWUFBSSxJQUFJLEtBQUosSUFBYSxJQUFqQixFQUF1QjtBQUNuQixpQkFBSyxZQUFMLEdBQW9CLElBQUksS0FBeEI7QUFDSCxTQUZELE1BRU8sSUFBSSxJQUFJLElBQVIsRUFBYztBQUNqQixpQkFBSyxZQUFMLEdBQW9CLEtBQUssZ0JBQUwsQ0FBc0IsSUFBdEIsQ0FBMkIsSUFBM0IsR0FBcEI7QUFDSDtBQUNKOztBQUVELFdBQU8sRUFBUCxFQUFXLEdBQVgsRUFBZ0I7QUFDWixZQUFJLE1BQU0sS0FBSyxXQUFMLENBQWlCLElBQWpCLENBQXNCLEVBQUMsSUFBSSxFQUFMLEVBQVMsS0FBSyxHQUFkLEVBQXRCLENBQVY7QUFDQSxZQUFJLElBQUksS0FBSixJQUFhLElBQWpCLEVBQXVCO0FBQ25CLGlCQUFLLFdBQUwsR0FBbUIsSUFBSSxLQUF2QjtBQUNILFNBRkQsTUFFTyxJQUFJLElBQUksSUFBUixFQUFjO0FBQ2pCLGlCQUFLLFdBQUwsR0FBbUIsS0FBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLElBQTFCLEdBQW5CO0FBQ0g7QUFDSjs7QUFFRCxLQUFDLGdCQUFELEdBQXFCLENBQUU7QUFDdkIsS0FBQyxlQUFELEdBQW9CLENBQUU7QUF6Q1A7UUFBTixLLEdBQUEsSzs7O0FDTGI7Ozs7O0FBR08sTUFBTSxhQUFOLENBQW9CO0FBQ3ZCLGtCQUFjO0FBQ1YsYUFBSyxNQUFMLEdBQWMsRUFBZDtBQUNIOztBQUVELHFCQUFpQixJQUFqQixFQUF1QixJQUF2QixFQUE2QjtBQUN6QixZQUFJLFNBQVMsS0FBSyxNQUFMLENBQVksSUFBWixLQUFxQixFQUFsQztBQUNBLGFBQUssTUFBTCxDQUFZLElBQVosSUFBb0IsTUFBcEI7O0FBRUEsZUFBTyxJQUFQLENBQVksSUFBWjtBQUNIOztBQUVELFNBQUssSUFBTCxFQUFXLElBQVgsRUFBaUI7QUFDYixZQUFJLFNBQVMsS0FBSyxNQUFMLENBQVksSUFBWixLQUFxQixFQUFsQztBQUNBLGFBQUssSUFBSSxFQUFULElBQWUsTUFBZixFQUF1QjtBQUNuQixlQUFHLElBQUg7QUFDSDtBQUNKO0FBakJzQjtRQUFkLGEsR0FBQSxhOzs7QUNIYjs7Ozs7OztBQUVBOztBQUNBLE1BQU0sU0FBUyxRQUFRLGFBQVIsQ0FBZjs7QUFFTyxNQUFNLElBQU4sQ0FBVztBQUNkLGdCQUFZLE1BQVosRUFBb0I7O0FBRWhCO0FBQ0EsYUFBSyxXQUFMLEdBQW1CLE1BQW5CO0FBQ0EsYUFBSyxRQUFMLEdBQWdCLE9BQU8sVUFBUCxDQUFrQixJQUFsQixDQUFoQjtBQUNBLGFBQUssVUFBTCxHQUFrQixTQUFTLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBbEI7QUFDQSxhQUFLLFVBQUwsQ0FBZ0IsS0FBaEIsR0FBd0IsT0FBTyxLQUEvQjtBQUNBLGFBQUssVUFBTCxDQUFnQixNQUFoQixHQUF5QixPQUFPLE1BQWhDO0FBQ0EsYUFBSyxPQUFMLEdBQWUsS0FBSyxVQUFMLENBQWdCLFVBQWhCLENBQTJCLElBQTNCLENBQWY7O0FBRUEsYUFBSyxLQUFMLEdBQWEsT0FBTyxLQUFwQjtBQUNBLGFBQUssTUFBTCxHQUFjLE9BQU8sTUFBckI7O0FBRUE7QUFDQSxhQUFLLE9BQUwsR0FBZSxZQUFZLEdBQVosRUFBZjtBQUNBLGFBQUssTUFBTCxHQUFjLEtBQWQ7O0FBRUEsYUFBSyxRQUFMLEdBQWdCLENBQ1oscUJBQVksSUFBWixFQUFrQixFQUFDLEdBQUUsR0FBSCxFQUFRLEdBQUUsR0FBVixFQUFlLEdBQUUsQ0FBakIsRUFBb0IsSUFBRyxDQUFDLENBQXhCLEVBQTJCLElBQUcsQ0FBOUIsRUFBaUMsSUFBRyxFQUFwQyxFQUF3QyxPQUFPLENBQS9DLEVBQWxCLENBRFksQ0FBaEI7QUFJQSxhQUFLLE1BQUwsR0FBYyxJQUFJLE1BQUosQ0FBVyxFQUFDLEdBQUcsS0FBSyxVQUFMLENBQWdCLEtBQWhCLEdBQXNCLENBQTFCLEVBQTZCLEdBQUcsS0FBSyxVQUFMLENBQWdCLE1BQWhCLEdBQXVCLENBQXZELEVBQVgsRUFBc0UsS0FBSyxVQUEzRSxDQUFkO0FBQ0g7O0FBRUQsVUFBTSxJQUFOLEVBQVk7QUFDUixhQUFLLE1BQUwsR0FBZSxRQUFRLElBQXZCO0FBQ0g7O0FBRUQsU0FBSyxPQUFMLEVBQWM7QUFDVixZQUFJLE9BQU8sSUFBWDtBQUNBLFlBQUksY0FBYyxVQUFVLEtBQUssT0FBakM7QUFDQSxhQUFLLE9BQUwsR0FBZSxPQUFmOztBQUVBLFlBQUcsQ0FBQyxLQUFLLE1BQVQsRUFBaUIsS0FBSyxNQUFMLENBQVksV0FBWjtBQUNqQixhQUFLLE1BQUwsQ0FBWSxXQUFaLEVBQXlCLEtBQUssT0FBOUI7QUFDQSxhQUFLLFFBQUwsQ0FBYyxTQUFkLENBQXdCLEtBQUssVUFBN0IsRUFBeUMsQ0FBekMsRUFBNEMsQ0FBNUM7QUFDSDs7QUFHRCxXQUFPLFdBQVAsRUFBb0I7QUFDaEIsYUFBSyxNQUFMLENBQVksTUFBWixDQUFtQixXQUFuQjtBQUNBLGFBQUssSUFBSSxPQUFULElBQW9CLEtBQUssUUFBekIsRUFBbUM7QUFDL0Isb0JBQVEsTUFBUixDQUFlLFdBQWY7QUFDSDtBQUNEO0FBQ0g7O0FBRUQsV0FBTyxXQUFQLEVBQW9CLEdBQXBCLEVBQXlCO0FBQ3JCLFlBQUksU0FBSixHQUFnQixPQUFoQjtBQUNBLFlBQUksUUFBSixDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsS0FBSyxVQUFMLENBQWdCLEtBQW5DLEVBQTBDLEtBQUssVUFBTCxDQUFnQixNQUExRDtBQUNBLGFBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsV0FBbkIsRUFBZ0MsR0FBaEM7O0FBRUEsYUFBSyxJQUFJLE9BQVQsSUFBb0IsS0FBSyxRQUF6QixFQUFtQztBQUMvQixvQkFBUSxNQUFSLENBQWUsV0FBZixFQUE0QixHQUE1QjtBQUNIO0FBQ0o7QUF4RGE7UUFBTCxJLEdBQUEsSTs7O0FDTGI7O0FBRUEsTUFBTSxlQUFlLE9BQUssQ0FBMUI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQVUsTUFBM0I7O0FBRUEsU0FBUyxNQUFULENBQWdCLFFBQWhCLEVBQTBCLE1BQTFCLEVBQWtDO0FBQ2hDLE9BQUssVUFBTCxHQUFrQixPQUFPLEtBQXpCO0FBQ0EsT0FBSyxXQUFMLEdBQW1CLE9BQU8sTUFBMUI7QUFDQSxPQUFLLEtBQUwsR0FBYSxNQUFiO0FBQ0EsT0FBSyxRQUFMLEdBQWdCO0FBQ2QsT0FBRyxTQUFTLENBREU7QUFFZCxPQUFHLFNBQVM7QUFGRSxHQUFoQjtBQUlBLE9BQUssUUFBTCxHQUFnQjtBQUNkLE9BQUcsQ0FEVztBQUVkLE9BQUc7QUFGVyxHQUFoQjtBQUlBLE9BQUssS0FBTCxHQUFhLENBQWI7QUFDQSxPQUFLLE1BQUwsR0FBZSxFQUFmO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLEtBQWxCOztBQUVBLE1BQUksT0FBTyxJQUFYO0FBQ0EsU0FBTyxTQUFQLEdBQW1CLFVBQVMsS0FBVCxFQUFnQjtBQUNqQyxZQUFPLE1BQU0sR0FBYjtBQUNFLFdBQUssU0FBTCxDQURGLENBQ2tCO0FBQ2hCLFdBQUssR0FBTDtBQUNFLGFBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNBO0FBQ0YsV0FBSyxXQUFMLENBTEYsQ0FLb0I7QUFDbEIsV0FBSyxHQUFMO0FBQ0UsYUFBSyxTQUFMLEdBQWlCLElBQWpCO0FBQ0E7QUFDRixXQUFLLFlBQUwsQ0FURixDQVNxQjtBQUNuQixXQUFLLEdBQUw7QUFDRSxhQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDQTtBQVpKO0FBY0QsR0FmRDs7QUFpQkEsU0FBTyxPQUFQLEdBQWlCLFVBQVMsS0FBVCxFQUFnQjtBQUMvQixZQUFPLE1BQU0sR0FBYjtBQUNFLFdBQUssU0FBTCxDQURGLENBQ2tCO0FBQ2hCLFdBQUssR0FBTDtBQUNFLGFBQUssU0FBTCxHQUFpQixLQUFqQjtBQUNBO0FBQ0YsV0FBSyxXQUFMLENBTEYsQ0FLb0I7QUFDbEIsV0FBSyxHQUFMO0FBQ0UsYUFBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0E7QUFDRixXQUFLLFlBQUwsQ0FURixDQVNxQjtBQUNuQixXQUFLLEdBQUw7QUFDRSxhQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDQTtBQVpKO0FBY0QsR0FmRDtBQWdCRDs7QUFFRCxPQUFPLFNBQVAsQ0FBaUIsTUFBakIsR0FBMEIsVUFBUyxJQUFULEVBQWU7QUFDdkM7QUFDQSxNQUFHLEtBQUssU0FBUixFQUFtQjtBQUNqQixTQUFLLEtBQUwsSUFBYyxPQUFPLEtBQXJCO0FBQ0Q7QUFDRCxNQUFHLEtBQUssVUFBUixFQUFvQjtBQUNsQixTQUFLLEtBQUwsSUFBYyxHQUFkO0FBQ0Q7QUFDRDtBQUNBLE1BQUcsS0FBSyxTQUFSLEVBQW1CO0FBQ2pCLFFBQUksZUFBZTtBQUNqQixTQUFHLEtBQUssR0FBTCxDQUFTLEtBQUssS0FBZCxDQURjO0FBRWpCLFNBQUcsS0FBSyxHQUFMLENBQVMsS0FBSyxLQUFkO0FBRmMsS0FBbkI7QUFJQSxTQUFLLFFBQUwsQ0FBYyxDQUFkLElBQW1CLGFBQWEsQ0FBaEM7QUFDQSxTQUFLLFFBQUwsQ0FBYyxDQUFkLElBQW1CLGFBQWEsQ0FBaEM7QUFDRDtBQUNEO0FBQ0EsT0FBSyxRQUFMLENBQWMsQ0FBZCxJQUFtQixLQUFLLFFBQUwsQ0FBYyxDQUFqQztBQUNBLE9BQUssUUFBTCxDQUFjLENBQWQsSUFBbUIsS0FBSyxRQUFMLENBQWMsQ0FBakM7QUFDQTtBQUNBLE1BQUcsS0FBSyxRQUFMLENBQWMsQ0FBZCxHQUFrQixDQUFyQixFQUF3QixLQUFLLFFBQUwsQ0FBYyxDQUFkLElBQW1CLEtBQUssVUFBeEI7QUFDeEIsTUFBRyxLQUFLLFFBQUwsQ0FBYyxDQUFkLEdBQWtCLEtBQUssVUFBMUIsRUFBc0MsS0FBSyxRQUFMLENBQWMsQ0FBZCxJQUFtQixLQUFLLFVBQXhCO0FBQ3RDLE1BQUcsS0FBSyxRQUFMLENBQWMsQ0FBZCxHQUFrQixDQUFyQixFQUF3QixLQUFLLFFBQUwsQ0FBYyxDQUFkLElBQW1CLEtBQUssV0FBeEI7QUFDeEIsTUFBRyxLQUFLLFFBQUwsQ0FBYyxDQUFkLEdBQWtCLEtBQUssV0FBMUIsRUFBdUMsS0FBSyxRQUFMLENBQWMsQ0FBZCxJQUFtQixLQUFLLFdBQXhCO0FBQ3hDLENBekJEOztBQTJCQSxPQUFPLFNBQVAsQ0FBaUIsTUFBakIsR0FBMEIsVUFBUyxJQUFULEVBQWUsR0FBZixFQUFvQjtBQUM1QyxNQUFJLElBQUo7O0FBRUE7QUFDQSxNQUFJLFNBQUosQ0FBYyxLQUFLLFFBQUwsQ0FBYyxDQUE1QixFQUErQixLQUFLLFFBQUwsQ0FBYyxDQUE3QztBQUNBLE1BQUksTUFBSixDQUFXLENBQUMsS0FBSyxLQUFqQjtBQUNBLE1BQUksU0FBSjtBQUNBLE1BQUksTUFBSixDQUFXLENBQVgsRUFBYyxDQUFDLEVBQWY7QUFDQSxNQUFJLE1BQUosQ0FBVyxDQUFDLEVBQVosRUFBZ0IsRUFBaEI7QUFDQSxNQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWMsQ0FBZDtBQUNBLE1BQUksTUFBSixDQUFXLEVBQVgsRUFBZSxFQUFmO0FBQ0EsTUFBSSxTQUFKO0FBQ0EsTUFBSSxXQUFKLEdBQWtCLE9BQWxCO0FBQ0EsTUFBSSxNQUFKOztBQUVBO0FBQ0EsTUFBRyxLQUFLLFNBQVIsRUFBbUI7QUFDakIsUUFBSSxTQUFKO0FBQ0EsUUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFjLEVBQWQ7QUFDQSxRQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWMsRUFBZDtBQUNBLFFBQUksR0FBSixDQUFRLENBQVIsRUFBVyxFQUFYLEVBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQixLQUFLLEVBQTFCLEVBQThCLElBQTlCO0FBQ0EsUUFBSSxTQUFKO0FBQ0EsUUFBSSxXQUFKLEdBQWtCLFFBQWxCO0FBQ0EsUUFBSSxNQUFKO0FBQ0Q7QUFDRCxNQUFJLE9BQUo7QUFDRCxDQTFCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtHYW1lfSBmcm9tICcuL2dhbWUuanMnXG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NyZWVuJyk7XG52YXIgZ2FtZSA9IG5ldyBHYW1lKGNhbnZhcyk7XG5cbnZhciBtYXN0ZXJMb29wID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gIGdhbWUubG9vcCh0aW1lc3RhbXApO1xuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1hc3Rlckxvb3ApO1xufVxubWFzdGVyTG9vcChwZXJmb3JtYW5jZS5ub3coKSk7XG4iLCJpbXBvcnQge0FjdG9yfSBmcm9tICcuL2NvbW1vbi9hY3RvcidcblxuZXhwb3J0IGNsYXNzIEFzdHJvaWQgZXh0ZW5kcyBBY3RvciB7XG4gICAgY29uc3RydWN0b3Iod29ybGQsIHt4LCB5LCByLCBkeCwgZHksIGRyLCBzY2FsZX0pIHtcbiAgICAgICAgc3VwZXIod29ybGQpXG4gICAgICAgIHRoaXMueCA9IHhcbiAgICAgICAgdGhpcy55ID0geVxuICAgICAgICB0aGlzLnJvdCA9IHJcblxuICAgICAgICB0aGlzLmR4ID0gZHhcbiAgICAgICAgdGhpcy5keSA9IGR5XG4gICAgICAgIHRoaXMuZHJvdCA9IGRyXG5cbiAgICAgICAgLy8gdGhpcy5wb2ludHMgPSBbXG4gICAgICAgIC8vICAgICB7eDogMSwgeTogMX0sXG4gICAgICAgIC8vICAgICB7eDogMSwgeTogMTJ9LFxuICAgICAgICAvLyAgICAge3g6IC0xMCwgeTogOH0sXG4gICAgICAgIC8vICAgICB7eDogLTE2LCB5OiAtMn0sXG4gICAgICAgIC8vICAgICB7eDogLTQsIHk6IC0xMH0sXG4gICAgICAgIC8vICAgICB7eDogOCwgeTogLTEwfSxcbiAgICAgICAgLy8gICAgIHt4OiAxMiwgeTogMH0sXG4gICAgICAgIC8vIF1cbiAgICAgICAgdGhpcy5wb2ludHMgPSBbXG4gICAgICAgICAgICB7eDogLTEyLCB5OiAtMTJ9LFxuICAgICAgICAgICAge3g6IC0xMiwgeTogMTJ9LFxuICAgICAgICAgICAge3g6IDEyLCB5OiAxMn0sXG4gICAgICAgICAgICB7eDogMTIsIHk6IC0xMn0sXG4gICAgICAgIF1cbiAgICAgICAgdGhpcy5zY2FsZSA9IHNjYWxlXG4gICAgfVxuXG4gICAgKmJhc2VDb250cm9sU3RhdGUoKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0fSA9IHlpZWxkXG4gICAgICAgICAgICB0aGlzLnJvdCArPSB0aGlzLmRyb3RcbiAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLmR4XG4gICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy5keVxuXG4gICAgICAgICAgICBsZXQgb25fc2NyZWVuX3ggPSAwXG4gICAgICAgICAgICBsZXQgb25fc2NyZWVuX3kgPSAwXG4gICAgICAgICAgICBmb3IgKGxldCB7eCwgeX0gb2YgdGhpcy5wb2ludHMpIHtcbiAgICAgICAgICAgICAgICB4ID0gdGhpcy54ICsgeCp0aGlzLnNjYWxlXG4gICAgICAgICAgICAgICAgeSA9IHRoaXMueSArIHkqdGhpcy5zY2FsZVxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHgsIHkpXG4gICAgICAgICAgICAgICAgb25fc2NyZWVuX3ggfD0gKHggPiAwICYmIHggPCB0aGlzLndvcmxkLndpZHRoKXwwXG4gICAgICAgICAgICAgICAgb25fc2NyZWVuX3kgfD0gKHkgPiAwICYmIHkgPCB0aGlzLndvcmxkLmhlaWdodCl8MFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFvbl9zY3JlZW5feCkge1xuICAgICAgICAgICAgICAgIGlmICgodGhpcy54IDwgMCAmJiB0aGlzLmR4IDwgMCkgfHwgKHRoaXMueCA+IHRoaXMud29ybGQud2lkdGggJiYgdGhpcy5keCA+IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueCA9IHRoaXMud29ybGQud2lkdGggLSB0aGlzLnhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW9uX3NjcmVlbl95KSB7XG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLnkgPCAwICYmIHRoaXMuZHkgPCAwKSB8fCAodGhpcy55ID4gdGhpcy53b3JsZC5oZWlnaHQgJiYgdGhpcy5keSA+IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA9IHRoaXMud29ybGQuaGVpZ2h0IC0gdGhpcy55XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgKmJhc2VSZW5kZXJTdGF0ZSgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7Y3R4LCBkdH0gPSB5aWVsZFxuICAgICAgICAgICAgbGV0IHBvaW50cyA9IHJvdGF0ZSh0aGlzLnJvdCwgdGhpcy5wb2ludHMpXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgICAgIGN0eC5saW5lV2lkdGg9XCIyXCJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZT1cImdyZXlcIlxuXG4gICAgICAgICAgICBsZXQge3gsIHl9ID0gcG9pbnRzWzBdXG4gICAgICAgICAgICBjdHgubW92ZVRvKHRoaXMueCt4KnRoaXMuc2NhbGUsIHRoaXMueSt5KnRoaXMuc2NhbGUpXG4gICAgICAgICAgICBmb3IgKGxldCB7eCwgeX0gb2YgcG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyh0aGlzLngreCp0aGlzLnNjYWxlLCB0aGlzLnkreSp0aGlzLnNjYWxlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3R4LmxpbmVUbyh0aGlzLngreCp0aGlzLnNjYWxlLCB0aGlzLnkreSp0aGlzLnNjYWxlKVxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3llbGxvdydcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCh0aGlzLngsIHRoaXMueSwgMiwgMilcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcm90YXRlKHJvdCwgcG9pbnRzKSB7XG4gICAgbGV0IHJlc3VsdCA9IFtdXG4gICAgbGV0IHNpbiA9IE1hdGguc2luKHJvdClcbiAgICBsZXQgY29zID0gTWF0aC5jb3Mocm90KVxuXG4gICAgZm9yIChsZXQge3gsIHl9IG9mIHBvaW50cykge1xuICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICB4OiB4KmNvcyAtIHkqc2luLFxuICAgICAgICAgICAgeTogeCpzaW4gKyB5KmNvcyxcbiAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7RXZlbnRMaXN0ZW5lcn0gZnJvbSBcIi4vZXZlbnRzLmpzXCI7XG5cblxuZXhwb3J0IGNsYXNzIEFjdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG5cbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgICAgICB0aGlzLnggPSAwO1xuICAgICAgICB0aGlzLnkgPSAwO1xuICAgICAgICB0aGlzLndpZHRoID0gNjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gNjQ7XG5cbiAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSB0aGlzLmJhc2VDb250cm9sU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gdGhpcy5iYXNlUmVuZGVyU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgIH1cblxuICAgIGdldEhpdEJveGVzKCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29sbGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHVwZGF0ZShkdCkge1xuICAgICAgICBsZXQgY3VyID0gdGhpcy5jb250cm9sU3RhdGUubmV4dCh7ZHQ6IGR0fSk7XG4gICAgICAgIGlmIChjdXIudmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSBjdXIudmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VyLmRvbmUpIHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5iYXNlQ29udHJvbFN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcihkdCwgY3R4KSB7XG4gICAgICAgIGxldCBjdXIgPSB0aGlzLnJlbmRlclN0YXRlLm5leHQoe2R0OiBkdCwgY3R4OiBjdHh9KTtcbiAgICAgICAgaWYgKGN1ci52YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gY3VyLnZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gdGhpcy5iYXNlUmVuZGVyU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgKmJhc2VDb250cm9sU3RhdGUgKCkge31cbiAgICAqYmFzZVJlbmRlclN0YXRlICgpIHt9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuXG5leHBvcnQgY2xhc3MgRXZlbnRMaXN0ZW5lciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzID0ge307XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBmdW5jKSB7XG4gICAgICAgIGxldCBldmVudHMgPSB0aGlzLmV2ZW50c1tuYW1lXSB8fCBbXTtcbiAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBldmVudHM7XG5cbiAgICAgICAgZXZlbnRzLnB1c2goZnVuYyk7XG4gICAgfVxuXG4gICAgZW1pdChuYW1lLCBhcmdzKSB7XG4gICAgICAgIGxldCBldmVudHMgPSB0aGlzLmV2ZW50c1tuYW1lXSB8fCBbXTtcbiAgICAgICAgZm9yIChsZXQgZXYgb2YgZXZlbnRzKSB7XG4gICAgICAgICAgICBldihhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0FzdHJvaWR9IGZyb20gJy4vYXN0cm9pZCdcbmNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyLmpzJyk7XG5cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihzY3JlZW4pIHtcblxuICAgICAgICAvLyBTZXQgdXAgYnVmZmVyc1xuICAgICAgICB0aGlzLmZyb250QnVmZmVyID0gc2NyZWVuO1xuICAgICAgICB0aGlzLmZyb250Q3R4ID0gc2NyZWVuLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIud2lkdGggPSBzY3JlZW4ud2lkdGg7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlci5oZWlnaHQgPSBzY3JlZW4uaGVpZ2h0O1xuICAgICAgICB0aGlzLmJhY2tDdHggPSB0aGlzLmJhY2tCdWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICB0aGlzLndpZHRoID0gc2NyZWVuLndpZHRoXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gc2NyZWVuLmhlaWdodFxuXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgICAgICAgdGhpcy5vbGRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5hc3Ryb2lkcyA9IFtcbiAgICAgICAgICAgIG5ldyBBc3Ryb2lkKHRoaXMsIHt4OjMwMCwgeTozMDAsIHI6MCwgZHg6LTEsIGR5OjAsIGRyOi4xLCBzY2FsZTogMn0pLFxuICAgICAgICAgICAgLy8gbmV3IEFzdHJvaWQodGhpcywge3g6MzAsIHk6MzAwLCByOjAsIGR4OjEsIGR5OjAsIGRyOi4xLCBzY2FsZTogM30pLFxuICAgICAgICBdXG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IFBsYXllcih7eDogdGhpcy5iYWNrQnVmZmVyLndpZHRoLzIsIHk6IHRoaXMuYmFja0J1ZmZlci5oZWlnaHQvMn0sIHRoaXMuYmFja0J1ZmZlcik7XG4gICAgfVxuXG4gICAgcGF1c2UoZmxhZykge1xuICAgICAgICB0aGlzLnBhdXNlZCA9IChmbGFnID09IHRydWUpO1xuICAgIH1cblxuICAgIGxvb3AobmV3VGltZSkge1xuICAgICAgICB2YXIgZ2FtZSA9IHRoaXM7XG4gICAgICAgIHZhciBlbGFwc2VkVGltZSA9IG5ld1RpbWUgLSB0aGlzLm9sZFRpbWU7XG4gICAgICAgIHRoaXMub2xkVGltZSA9IG5ld1RpbWU7XG5cbiAgICAgICAgaWYoIXRoaXMucGF1c2VkKSB0aGlzLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgICAgIHRoaXMucmVuZGVyKGVsYXBzZWRUaW1lLCB0aGlzLmJhY2tDdHgpO1xuICAgICAgICB0aGlzLmZyb250Q3R4LmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIsIDAsIDApO1xuICAgIH1cblxuXG4gICAgdXBkYXRlKGVsYXBzZWRUaW1lKSB7XG4gICAgICAgIHRoaXMucGxheWVyLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgICAgIGZvciAobGV0IGFzdHJvaWQgb2YgdGhpcy5hc3Ryb2lkcykge1xuICAgICAgICAgICAgYXN0cm9pZC51cGRhdGUoZWxhcHNlZFRpbWUpXG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogVXBkYXRlIHRoZSBnYW1lIG9iamVjdHNcbiAgICB9XG5cbiAgICByZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCkge1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5iYWNrQnVmZmVyLndpZHRoLCB0aGlzLmJhY2tCdWZmZXIuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5wbGF5ZXIucmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpO1xuXG4gICAgICAgIGZvciAobGV0IGFzdHJvaWQgb2YgdGhpcy5hc3Ryb2lkcykge1xuICAgICAgICAgICAgYXN0cm9pZC5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eClcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBNU19QRVJfRlJBTUUgPSAxMDAwLzg7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFBsYXllcjtcblxuZnVuY3Rpb24gUGxheWVyKHBvc2l0aW9uLCBjYW52YXMpIHtcbiAgdGhpcy53b3JsZFdpZHRoID0gY2FudmFzLndpZHRoO1xuICB0aGlzLndvcmxkSGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgdGhpcy5zdGF0ZSA9IFwiaWRsZVwiO1xuICB0aGlzLnBvc2l0aW9uID0ge1xuICAgIHg6IHBvc2l0aW9uLngsXG4gICAgeTogcG9zaXRpb24ueVxuICB9O1xuICB0aGlzLnZlbG9jaXR5ID0ge1xuICAgIHg6IDAsXG4gICAgeTogMFxuICB9XG4gIHRoaXMuYW5nbGUgPSAwO1xuICB0aGlzLnJhZGl1cyAgPSA2NDtcbiAgdGhpcy50aHJ1c3RpbmcgPSBmYWxzZTtcbiAgdGhpcy5zdGVlckxlZnQgPSBmYWxzZTtcbiAgdGhpcy5zdGVlclJpZ2h0ID0gZmFsc2U7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB3aW5kb3cub25rZXlkb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBzd2l0Y2goZXZlbnQua2V5KSB7XG4gICAgICBjYXNlICdBcnJvd1VwJzogLy8gdXBcbiAgICAgIGNhc2UgJ3cnOlxuICAgICAgICBzZWxmLnRocnVzdGluZyA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQXJyb3dMZWZ0JzogLy8gbGVmdFxuICAgICAgY2FzZSAnYSc6XG4gICAgICAgIHNlbGYuc3RlZXJMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBcnJvd1JpZ2h0JzogLy8gcmlnaHRcbiAgICAgIGNhc2UgJ2QnOlxuICAgICAgICBzZWxmLnN0ZWVyUmlnaHQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB3aW5kb3cub25rZXl1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc3dpdGNoKGV2ZW50LmtleSkge1xuICAgICAgY2FzZSAnQXJyb3dVcCc6IC8vIHVwXG4gICAgICBjYXNlICd3JzpcbiAgICAgICAgc2VsZi50aHJ1c3RpbmcgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBcnJvd0xlZnQnOiAvLyBsZWZ0XG4gICAgICBjYXNlICdhJzpcbiAgICAgICAgc2VsZi5zdGVlckxlZnQgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBcnJvd1JpZ2h0JzogLy8gcmlnaHRcbiAgICAgIGNhc2UgJ2QnOlxuICAgICAgICBzZWxmLnN0ZWVyUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59XG5cblBsYXllci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24odGltZSkge1xuICAvLyBBcHBseSBhbmd1bGFyIHZlbG9jaXR5XG4gIGlmKHRoaXMuc3RlZXJMZWZ0KSB7XG4gICAgdGhpcy5hbmdsZSArPSB0aW1lICogMC4wMDU7XG4gIH1cbiAgaWYodGhpcy5zdGVlclJpZ2h0KSB7XG4gICAgdGhpcy5hbmdsZSAtPSAwLjE7XG4gIH1cbiAgLy8gQXBwbHkgYWNjZWxlcmF0aW9uXG4gIGlmKHRoaXMudGhydXN0aW5nKSB7XG4gICAgdmFyIGFjY2VsZXJhdGlvbiA9IHtcbiAgICAgIHg6IE1hdGguc2luKHRoaXMuYW5nbGUpLFxuICAgICAgeTogTWF0aC5jb3ModGhpcy5hbmdsZSlcbiAgICB9XG4gICAgdGhpcy52ZWxvY2l0eS54IC09IGFjY2VsZXJhdGlvbi54O1xuICAgIHRoaXMudmVsb2NpdHkueSAtPSBhY2NlbGVyYXRpb24ueTtcbiAgfVxuICAvLyBBcHBseSB2ZWxvY2l0eVxuICB0aGlzLnBvc2l0aW9uLnggKz0gdGhpcy52ZWxvY2l0eS54O1xuICB0aGlzLnBvc2l0aW9uLnkgKz0gdGhpcy52ZWxvY2l0eS55O1xuICAvLyBXcmFwIGFyb3VuZCB0aGUgc2NyZWVuXG4gIGlmKHRoaXMucG9zaXRpb24ueCA8IDApIHRoaXMucG9zaXRpb24ueCArPSB0aGlzLndvcmxkV2lkdGg7XG4gIGlmKHRoaXMucG9zaXRpb24ueCA+IHRoaXMud29ybGRXaWR0aCkgdGhpcy5wb3NpdGlvbi54IC09IHRoaXMud29ybGRXaWR0aDtcbiAgaWYodGhpcy5wb3NpdGlvbi55IDwgMCkgdGhpcy5wb3NpdGlvbi55ICs9IHRoaXMud29ybGRIZWlnaHQ7XG4gIGlmKHRoaXMucG9zaXRpb24ueSA+IHRoaXMud29ybGRIZWlnaHQpIHRoaXMucG9zaXRpb24ueSAtPSB0aGlzLndvcmxkSGVpZ2h0O1xufVxuXG5QbGF5ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHRpbWUsIGN0eCkge1xuICBjdHguc2F2ZSgpO1xuXG4gIC8vIERyYXcgcGxheWVyJ3Mgc2hpcFxuICBjdHgudHJhbnNsYXRlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcbiAgY3R4LnJvdGF0ZSgtdGhpcy5hbmdsZSk7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4Lm1vdmVUbygwLCAtMTApO1xuICBjdHgubGluZVRvKC0xMCwgMTApO1xuICBjdHgubGluZVRvKDAsIDApO1xuICBjdHgubGluZVRvKDEwLCAxMCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcbiAgY3R4LnN0cm9rZSgpO1xuXG4gIC8vIERyYXcgZW5naW5lIHRocnVzdFxuICBpZih0aGlzLnRocnVzdGluZykge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgubW92ZVRvKDAsIDIwKTtcbiAgICBjdHgubGluZVRvKDUsIDEwKTtcbiAgICBjdHguYXJjKDAsIDEwLCA1LCAwLCBNYXRoLlBJLCB0cnVlKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ29yYW5nZSc7XG4gICAgY3R4LnN0cm9rZSgpO1xuICB9XG4gIGN0eC5yZXN0b3JlKCk7XG59XG4iXX0=
