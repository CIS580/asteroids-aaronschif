(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
"use strict;";

/* Classes */

const Game = require('./game.js');
const Player = require('./player.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({ x: canvas.width / 2, y: canvas.height / 2 }, canvas);

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function (timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
};
masterLoop(performance.now());

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  player.update(elapsedTime);
  // TODO: Update the game objects
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);
}

},{"./game.js":2,"./player.js":3}],2:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */

module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function (flag) {
  this.paused = flag == true;
};

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function (newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if (!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
};

},{}],3:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000 / 8;

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
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

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
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

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2dhbWUuanMiLCJzcmMvcGxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBOztBQUVBOztBQUNBLE1BQU0sT0FBTyxRQUFRLFdBQVIsQ0FBYjtBQUNBLE1BQU0sU0FBUyxRQUFRLGFBQVIsQ0FBZjs7QUFFQTtBQUNBLElBQUksU0FBUyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBYjtBQUNBLElBQUksT0FBTyxJQUFJLElBQUosQ0FBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLENBQVg7QUFDQSxJQUFJLFNBQVMsSUFBSSxNQUFKLENBQVcsRUFBQyxHQUFHLE9BQU8sS0FBUCxHQUFhLENBQWpCLEVBQW9CLEdBQUcsT0FBTyxNQUFQLEdBQWMsQ0FBckMsRUFBWCxFQUFvRCxNQUFwRCxDQUFiOztBQUVBOzs7OztBQUtBLElBQUksYUFBYSxVQUFTLFNBQVQsRUFBb0I7QUFDbkMsT0FBSyxJQUFMLENBQVUsU0FBVjtBQUNBLFNBQU8scUJBQVAsQ0FBNkIsVUFBN0I7QUFDRCxDQUhEO0FBSUEsV0FBVyxZQUFZLEdBQVosRUFBWDs7QUFHQTs7Ozs7Ozs7QUFRQSxTQUFTLE1BQVQsQ0FBZ0IsV0FBaEIsRUFBNkI7QUFDM0IsU0FBTyxNQUFQLENBQWMsV0FBZDtBQUNBO0FBQ0Q7O0FBRUQ7Ozs7Ozs7QUFPQSxTQUFTLE1BQVQsQ0FBZ0IsV0FBaEIsRUFBNkIsR0FBN0IsRUFBa0M7QUFDaEMsTUFBSSxTQUFKLEdBQWdCLE9BQWhCO0FBQ0EsTUFBSSxRQUFKLENBQWEsQ0FBYixFQUFnQixDQUFoQixFQUFtQixPQUFPLEtBQTFCLEVBQWlDLE9BQU8sTUFBeEM7QUFDQSxTQUFPLE1BQVAsQ0FBYyxXQUFkLEVBQTJCLEdBQTNCO0FBQ0Q7OztBQy9DRDs7QUFFQTs7OztBQUdBLE9BQU8sT0FBUCxHQUFpQixVQUFVLElBQTNCOztBQUVB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Iiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3Q7XCJcblxuLyogQ2xhc3NlcyAqL1xuY29uc3QgR2FtZSA9IHJlcXVpcmUoJy4vZ2FtZS5qcycpO1xuY29uc3QgUGxheWVyID0gcmVxdWlyZSgnLi9wbGF5ZXIuanMnKTtcblxuLyogR2xvYmFsIHZhcmlhYmxlcyAqL1xudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY3JlZW4nKTtcbnZhciBnYW1lID0gbmV3IEdhbWUoY2FudmFzLCB1cGRhdGUsIHJlbmRlcik7XG52YXIgcGxheWVyID0gbmV3IFBsYXllcih7eDogY2FudmFzLndpZHRoLzIsIHk6IGNhbnZhcy5oZWlnaHQvMn0sIGNhbnZhcyk7XG5cbi8qKlxuICogQGZ1bmN0aW9uIG1hc3Rlckxvb3BcbiAqIEFkdmFuY2VzIHRoZSBnYW1lIGluIHN5bmMgd2l0aCB0aGUgcmVmcmVzaCByYXRlIG9mIHRoZSBzY3JlZW5cbiAqIEBwYXJhbSB7RE9NSGlnaFJlc1RpbWVTdGFtcH0gdGltZXN0YW1wIHRoZSBjdXJyZW50IHRpbWVcbiAqL1xudmFyIG1hc3Rlckxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgZ2FtZS5sb29wKHRpbWVzdGFtcCk7XG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobWFzdGVyTG9vcCk7XG59XG5tYXN0ZXJMb29wKHBlcmZvcm1hbmNlLm5vdygpKTtcblxuXG4vKipcbiAqIEBmdW5jdGlvbiB1cGRhdGVcbiAqIFVwZGF0ZXMgdGhlIGdhbWUgc3RhdGUsIG1vdmluZ1xuICogZ2FtZSBvYmplY3RzIGFuZCBoYW5kbGluZyBpbnRlcmFjdGlvbnNcbiAqIGJldHdlZW4gdGhlbS5cbiAqIEBwYXJhbSB7RE9NSGlnaFJlc1RpbWVTdGFtcH0gZWxhcHNlZFRpbWUgaW5kaWNhdGVzXG4gKiB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBwYXNzZWQgc2luY2UgdGhlIGxhc3QgZnJhbWUuXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZShlbGFwc2VkVGltZSkge1xuICBwbGF5ZXIudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgLy8gVE9ETzogVXBkYXRlIHRoZSBnYW1lIG9iamVjdHNcbn1cblxuLyoqXG4gICogQGZ1bmN0aW9uIHJlbmRlclxuICAqIFJlbmRlcnMgdGhlIGN1cnJlbnQgZ2FtZSBzdGF0ZSBpbnRvIGEgYmFjayBidWZmZXIuXG4gICogQHBhcmFtIHtET01IaWdoUmVzVGltZVN0YW1wfSBlbGFwc2VkVGltZSBpbmRpY2F0ZXNcbiAgKiB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBwYXNzZWQgc2luY2UgdGhlIGxhc3QgZnJhbWUuXG4gICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCB0aGUgY29udGV4dCB0byByZW5kZXIgdG9cbiAgKi9cbmZ1bmN0aW9uIHJlbmRlcihlbGFwc2VkVGltZSwgY3R4KSB7XG4gIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICBwbGF5ZXIucmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQG1vZHVsZSBleHBvcnRzIHRoZSBHYW1lIGNsYXNzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IEdhbWU7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yIEdhbWVcbiAqIENyZWF0ZXMgYSBuZXcgZ2FtZSBvYmplY3RcbiAqIEBwYXJhbSB7Y2FudmFzRE9NRWxlbWVudH0gc2NyZWVuIGNhbnZhcyBvYmplY3QgdG8gZHJhdyBpbnRvXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVGdW5jdGlvbiBmdW5jdGlvbiB0byB1cGRhdGUgdGhlIGdhbWVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlbmRlckZ1bmN0aW9uIGZ1bmN0aW9uIHRvIHJlbmRlciB0aGUgZ2FtZVxuICovXG5mdW5jdGlvbiBHYW1lKHNjcmVlbiwgdXBkYXRlRnVuY3Rpb24sIHJlbmRlckZ1bmN0aW9uKSB7XG4gIHRoaXMudXBkYXRlID0gdXBkYXRlRnVuY3Rpb247XG4gIHRoaXMucmVuZGVyID0gcmVuZGVyRnVuY3Rpb247XG5cbiAgLy8gU2V0IHVwIGJ1ZmZlcnNcbiAgdGhpcy5mcm9udEJ1ZmZlciA9IHNjcmVlbjtcbiAgdGhpcy5mcm9udEN0eCA9IHNjcmVlbi5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLmJhY2tCdWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgdGhpcy5iYWNrQnVmZmVyLndpZHRoID0gc2NyZWVuLndpZHRoO1xuICB0aGlzLmJhY2tCdWZmZXIuaGVpZ2h0ID0gc2NyZWVuLmhlaWdodDtcbiAgdGhpcy5iYWNrQ3R4ID0gdGhpcy5iYWNrQnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG5cbiAgLy8gU3RhcnQgdGhlIGdhbWUgbG9vcFxuICB0aGlzLm9sZFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gcGF1c2VcbiAqIFBhdXNlIG9yIHVucGF1c2UgdGhlIGdhbWVcbiAqIEBwYXJhbSB7Ym9vbH0gcGF1c2UgdHJ1ZSB0byBwYXVzZSwgZmFsc2UgdG8gc3RhcnRcbiAqL1xuR2FtZS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbihmbGFnKSB7XG4gIHRoaXMucGF1c2VkID0gKGZsYWcgPT0gdHJ1ZSk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIGxvb3BcbiAqIFRoZSBtYWluIGdhbWUgbG9vcC5cbiAqIEBwYXJhbXt0aW1lfSB0aGUgY3VycmVudCB0aW1lIGFzIGEgRE9NSGlnaFJlc1RpbWVTdGFtcFxuICovXG5HYW1lLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24obmV3VGltZSkge1xuICB2YXIgZ2FtZSA9IHRoaXM7XG4gIHZhciBlbGFwc2VkVGltZSA9IG5ld1RpbWUgLSB0aGlzLm9sZFRpbWU7XG4gIHRoaXMub2xkVGltZSA9IG5ld1RpbWU7XG5cbiAgaWYoIXRoaXMucGF1c2VkKSB0aGlzLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gIHRoaXMucmVuZGVyKGVsYXBzZWRUaW1lLCB0aGlzLmZyb250Q3R4KTtcblxuICAvLyBGbGlwIHRoZSBiYWNrIGJ1ZmZlclxuICB0aGlzLmZyb250Q3R4LmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIsIDAsIDApO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IE1TX1BFUl9GUkFNRSA9IDEwMDAvODtcblxuLyoqXG4gKiBAbW9kdWxlIGV4cG9ydHMgdGhlIFBsYXllciBjbGFzc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQbGF5ZXI7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yIFBsYXllclxuICogQ3JlYXRlcyBhIG5ldyBwbGF5ZXIgb2JqZWN0XG4gKiBAcGFyYW0ge1Bvc3RpdGlvbn0gcG9zaXRpb24gb2JqZWN0IHNwZWNpZnlpbmcgYW4geCBhbmQgeVxuICovXG5mdW5jdGlvbiBQbGF5ZXIocG9zaXRpb24sIGNhbnZhcykge1xuICB0aGlzLndvcmxkV2lkdGggPSBjYW52YXMud2lkdGg7XG4gIHRoaXMud29ybGRIZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuICB0aGlzLnN0YXRlID0gXCJpZGxlXCI7XG4gIHRoaXMucG9zaXRpb24gPSB7XG4gICAgeDogcG9zaXRpb24ueCxcbiAgICB5OiBwb3NpdGlvbi55XG4gIH07XG4gIHRoaXMudmVsb2NpdHkgPSB7XG4gICAgeDogMCxcbiAgICB5OiAwXG4gIH1cbiAgdGhpcy5hbmdsZSA9IDA7XG4gIHRoaXMucmFkaXVzICA9IDY0O1xuICB0aGlzLnRocnVzdGluZyA9IGZhbHNlO1xuICB0aGlzLnN0ZWVyTGVmdCA9IGZhbHNlO1xuICB0aGlzLnN0ZWVyUmlnaHQgPSBmYWxzZTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHdpbmRvdy5vbmtleWRvd24gPSBmdW5jdGlvbihldmVudCkge1xuICAgIHN3aXRjaChldmVudC5rZXkpIHtcbiAgICAgIGNhc2UgJ0Fycm93VXAnOiAvLyB1cFxuICAgICAgY2FzZSAndyc6XG4gICAgICAgIHNlbGYudGhydXN0aW5nID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBcnJvd0xlZnQnOiAvLyBsZWZ0XG4gICAgICBjYXNlICdhJzpcbiAgICAgICAgc2VsZi5zdGVlckxlZnQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOiAvLyByaWdodFxuICAgICAgY2FzZSAnZCc6XG4gICAgICAgIHNlbGYuc3RlZXJSaWdodCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHdpbmRvdy5vbmtleXVwID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBzd2l0Y2goZXZlbnQua2V5KSB7XG4gICAgICBjYXNlICdBcnJvd1VwJzogLy8gdXBcbiAgICAgIGNhc2UgJ3cnOlxuICAgICAgICBzZWxmLnRocnVzdGluZyA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93TGVmdCc6IC8vIGxlZnRcbiAgICAgIGNhc2UgJ2EnOlxuICAgICAgICBzZWxmLnN0ZWVyTGVmdCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOiAvLyByaWdodFxuICAgICAgY2FzZSAnZCc6XG4gICAgICAgIHNlbGYuc3RlZXJSaWdodCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cblxuXG5cbi8qKlxuICogQGZ1bmN0aW9uIHVwZGF0ZXMgdGhlIHBsYXllciBvYmplY3RcbiAqIHtET01IaWdoUmVzVGltZVN0YW1wfSB0aW1lIHRoZSBlbGFwc2VkIHRpbWUgc2luY2UgdGhlIGxhc3QgZnJhbWVcbiAqL1xuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbih0aW1lKSB7XG4gIC8vIEFwcGx5IGFuZ3VsYXIgdmVsb2NpdHlcbiAgaWYodGhpcy5zdGVlckxlZnQpIHtcbiAgICB0aGlzLmFuZ2xlICs9IHRpbWUgKiAwLjAwNTtcbiAgfVxuICBpZih0aGlzLnN0ZWVyUmlnaHQpIHtcbiAgICB0aGlzLmFuZ2xlIC09IDAuMTtcbiAgfVxuICAvLyBBcHBseSBhY2NlbGVyYXRpb25cbiAgaWYodGhpcy50aHJ1c3RpbmcpIHtcbiAgICB2YXIgYWNjZWxlcmF0aW9uID0ge1xuICAgICAgeDogTWF0aC5zaW4odGhpcy5hbmdsZSksXG4gICAgICB5OiBNYXRoLmNvcyh0aGlzLmFuZ2xlKVxuICAgIH1cbiAgICB0aGlzLnZlbG9jaXR5LnggLT0gYWNjZWxlcmF0aW9uLng7XG4gICAgdGhpcy52ZWxvY2l0eS55IC09IGFjY2VsZXJhdGlvbi55O1xuICB9XG4gIC8vIEFwcGx5IHZlbG9jaXR5XG4gIHRoaXMucG9zaXRpb24ueCArPSB0aGlzLnZlbG9jaXR5Lng7XG4gIHRoaXMucG9zaXRpb24ueSArPSB0aGlzLnZlbG9jaXR5Lnk7XG4gIC8vIFdyYXAgYXJvdW5kIHRoZSBzY3JlZW5cbiAgaWYodGhpcy5wb3NpdGlvbi54IDwgMCkgdGhpcy5wb3NpdGlvbi54ICs9IHRoaXMud29ybGRXaWR0aDtcbiAgaWYodGhpcy5wb3NpdGlvbi54ID4gdGhpcy53b3JsZFdpZHRoKSB0aGlzLnBvc2l0aW9uLnggLT0gdGhpcy53b3JsZFdpZHRoO1xuICBpZih0aGlzLnBvc2l0aW9uLnkgPCAwKSB0aGlzLnBvc2l0aW9uLnkgKz0gdGhpcy53b3JsZEhlaWdodDtcbiAgaWYodGhpcy5wb3NpdGlvbi55ID4gdGhpcy53b3JsZEhlaWdodCkgdGhpcy5wb3NpdGlvbi55IC09IHRoaXMud29ybGRIZWlnaHQ7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIHJlbmRlcnMgdGhlIHBsYXllciBpbnRvIHRoZSBwcm92aWRlZCBjb250ZXh0XG4gKiB7RE9NSGlnaFJlc1RpbWVTdGFtcH0gdGltZSB0aGUgZWxhcHNlZCB0aW1lIHNpbmNlIHRoZSBsYXN0IGZyYW1lXG4gKiB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggdGhlIGNvbnRleHQgdG8gcmVuZGVyIGludG9cbiAqL1xuUGxheWVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih0aW1lLCBjdHgpIHtcbiAgY3R4LnNhdmUoKTtcblxuICAvLyBEcmF3IHBsYXllcidzIHNoaXBcbiAgY3R4LnRyYW5zbGF0ZSh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XG4gIGN0eC5yb3RhdGUoLXRoaXMuYW5nbGUpO1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oMCwgLTEwKTtcbiAgY3R4LmxpbmVUbygtMTAsIDEwKTtcbiAgY3R4LmxpbmVUbygwLCAwKTtcbiAgY3R4LmxpbmVUbygxMCwgMTApO1xuICBjdHguY2xvc2VQYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSc7XG4gIGN0eC5zdHJva2UoKTtcblxuICAvLyBEcmF3IGVuZ2luZSB0aHJ1c3RcbiAgaWYodGhpcy50aHJ1c3RpbmcpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbygwLCAyMCk7XG4gICAgY3R4LmxpbmVUbyg1LCAxMCk7XG4gICAgY3R4LmFyYygwLCAxMCwgNSwgMCwgTWF0aC5QSSwgdHJ1ZSk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdvcmFuZ2UnO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgfVxuICBjdHgucmVzdG9yZSgpO1xufVxuIl19
