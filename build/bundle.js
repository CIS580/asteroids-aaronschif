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

var masterLoop = function (timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
};
masterLoop(performance.now());

function update(elapsedTime) {
  player.update(elapsedTime);
  // TODO: Update the game objects
}

function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);
}

},{"./game.js":2,"./player.js":3}],2:[function(require,module,exports){
"use strict";

module.exports = exports = Game;

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

Game.prototype.pause = function (flag) {
  this.paused = flag == true;
};

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2dhbWUuanMiLCJzcmMvcGxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBOztBQUVBOztBQUNBLE1BQU0sT0FBTyxRQUFRLFdBQVIsQ0FBYjtBQUNBLE1BQU0sU0FBUyxRQUFRLGFBQVIsQ0FBZjs7QUFFQTtBQUNBLElBQUksU0FBUyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBYjtBQUNBLElBQUksT0FBTyxJQUFJLElBQUosQ0FBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLENBQVg7QUFDQSxJQUFJLFNBQVMsSUFBSSxNQUFKLENBQVcsRUFBQyxHQUFHLE9BQU8sS0FBUCxHQUFhLENBQWpCLEVBQW9CLEdBQUcsT0FBTyxNQUFQLEdBQWMsQ0FBckMsRUFBWCxFQUFvRCxNQUFwRCxDQUFiOztBQUVBLElBQUksYUFBYSxVQUFTLFNBQVQsRUFBb0I7QUFDbkMsT0FBSyxJQUFMLENBQVUsU0FBVjtBQUNBLFNBQU8scUJBQVAsQ0FBNkIsVUFBN0I7QUFDRCxDQUhEO0FBSUEsV0FBVyxZQUFZLEdBQVosRUFBWDs7QUFFQSxTQUFTLE1BQVQsQ0FBZ0IsV0FBaEIsRUFBNkI7QUFDM0IsU0FBTyxNQUFQLENBQWMsV0FBZDtBQUNBO0FBQ0Q7O0FBRUQsU0FBUyxNQUFULENBQWdCLFdBQWhCLEVBQTZCLEdBQTdCLEVBQWtDO0FBQ2hDLE1BQUksU0FBSixHQUFnQixPQUFoQjtBQUNBLE1BQUksUUFBSixDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsT0FBTyxLQUExQixFQUFpQyxPQUFPLE1BQXhDO0FBQ0EsU0FBTyxNQUFQLENBQWMsV0FBZCxFQUEyQixHQUEzQjtBQUNEOzs7QUMxQkQ7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQVUsSUFBM0I7O0FBRUEsU0FBUyxJQUFULENBQWMsTUFBZCxFQUFzQixjQUF0QixFQUFzQyxj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MUIsRUFBdUMsS0FBSyxRQUFMLENBQWMsQ0FBZCxJQUFtQixLQUFLLFdBQXhCO0FBQ3hDLENBekJEOztBQTJCQSxPQUFPLFNBQVAsQ0FBaUIsTUFBakIsR0FBMEIsVUFBUyxJQUFULEVBQWUsR0FBZixFQUFvQjtBQUM1QyxNQUFJLElBQUo7O0FBRUE7QUFDQSxNQUFJLFNBQUosQ0FBYyxLQUFLLFFBQUwsQ0FBYyxDQUE1QixFQUErQixLQUFLLFFBQUwsQ0FBYyxDQUE3QztBQUNBLE1BQUksTUFBSixDQUFXLENBQUMsS0FBSyxLQUFqQjtBQUNBLE1BQUksU0FBSjtBQUNBLE1BQUksTUFBSixDQUFXLENBQVgsRUFBYyxDQUFDLEVBQWY7QUFDQSxNQUFJLE1BQUosQ0FBVyxDQUFDLEVBQVosRUFBZ0IsRUFBaEI7QUFDQSxNQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWMsQ0FBZDtBQUNBLE1BQUksTUFBSixDQUFXLEVBQVgsRUFBZSxFQUFmO0FBQ0EsTUFBSSxTQUFKO0FBQ0EsTUFBSSxXQUFKLEdBQWtCLE9BQWxCO0FBQ0EsTUFBSSxNQUFKOztBQUVBO0FBQ0EsTUFBRyxLQUFLLFNBQVIsRUFBbUI7QUFDakIsUUFBSSxTQUFKO0FBQ0EsUUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFjLEVBQWQ7QUFDQSxRQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWMsRUFBZDtBQUNBLFFBQUksR0FBSixDQUFRLENBQVIsRUFBVyxFQUFYLEVBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQixLQUFLLEVBQTFCLEVBQThCLElBQTlCO0FBQ0EsUUFBSSxTQUFKO0FBQ0EsUUFBSSxXQUFKLEdBQWtCLFFBQWxCO0FBQ0EsUUFBSSxNQUFKO0FBQ0Q7QUFDRCxNQUFJLE9BQUo7QUFDRCxDQTFCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3Q7XCJcblxuLyogQ2xhc3NlcyAqL1xuY29uc3QgR2FtZSA9IHJlcXVpcmUoJy4vZ2FtZS5qcycpO1xuY29uc3QgUGxheWVyID0gcmVxdWlyZSgnLi9wbGF5ZXIuanMnKTtcblxuLyogR2xvYmFsIHZhcmlhYmxlcyAqL1xudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY3JlZW4nKTtcbnZhciBnYW1lID0gbmV3IEdhbWUoY2FudmFzLCB1cGRhdGUsIHJlbmRlcik7XG52YXIgcGxheWVyID0gbmV3IFBsYXllcih7eDogY2FudmFzLndpZHRoLzIsIHk6IGNhbnZhcy5oZWlnaHQvMn0sIGNhbnZhcyk7XG5cbnZhciBtYXN0ZXJMb29wID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gIGdhbWUubG9vcCh0aW1lc3RhbXApO1xuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1hc3Rlckxvb3ApO1xufVxubWFzdGVyTG9vcChwZXJmb3JtYW5jZS5ub3coKSk7XG5cbmZ1bmN0aW9uIHVwZGF0ZShlbGFwc2VkVGltZSkge1xuICBwbGF5ZXIudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgLy8gVE9ETzogVXBkYXRlIHRoZSBnYW1lIG9iamVjdHNcbn1cblxuZnVuY3Rpb24gcmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpIHtcbiAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gIHBsYXllci5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gR2FtZTtcblxuZnVuY3Rpb24gR2FtZShzY3JlZW4sIHVwZGF0ZUZ1bmN0aW9uLCByZW5kZXJGdW5jdGlvbikge1xuICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZUZ1bmN0aW9uO1xuICB0aGlzLnJlbmRlciA9IHJlbmRlckZ1bmN0aW9uO1xuXG4gIC8vIFNldCB1cCBidWZmZXJzXG4gIHRoaXMuZnJvbnRCdWZmZXIgPSBzY3JlZW47XG4gIHRoaXMuZnJvbnRDdHggPSBzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5iYWNrQnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIHRoaXMuYmFja0J1ZmZlci53aWR0aCA9IHNjcmVlbi53aWR0aDtcbiAgdGhpcy5iYWNrQnVmZmVyLmhlaWdodCA9IHNjcmVlbi5oZWlnaHQ7XG4gIHRoaXMuYmFja0N0eCA9IHRoaXMuYmFja0J1ZmZlci5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgdGhpcy5vbGRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIHRoaXMucGF1c2VkID0gZmFsc2U7XG59XG5cbkdhbWUucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oZmxhZykge1xuICB0aGlzLnBhdXNlZCA9IChmbGFnID09IHRydWUpO1xufVxuXG5HYW1lLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24obmV3VGltZSkge1xuICB2YXIgZ2FtZSA9IHRoaXM7XG4gIHZhciBlbGFwc2VkVGltZSA9IG5ld1RpbWUgLSB0aGlzLm9sZFRpbWU7XG4gIHRoaXMub2xkVGltZSA9IG5ld1RpbWU7XG5cbiAgaWYoIXRoaXMucGF1c2VkKSB0aGlzLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gIHRoaXMucmVuZGVyKGVsYXBzZWRUaW1lLCB0aGlzLmZyb250Q3R4KTtcblxuICAvLyBGbGlwIHRoZSBiYWNrIGJ1ZmZlclxuICB0aGlzLmZyb250Q3R4LmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIsIDAsIDApO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IE1TX1BFUl9GUkFNRSA9IDEwMDAvODtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gUGxheWVyO1xuXG5mdW5jdGlvbiBQbGF5ZXIocG9zaXRpb24sIGNhbnZhcykge1xuICB0aGlzLndvcmxkV2lkdGggPSBjYW52YXMud2lkdGg7XG4gIHRoaXMud29ybGRIZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuICB0aGlzLnN0YXRlID0gXCJpZGxlXCI7XG4gIHRoaXMucG9zaXRpb24gPSB7XG4gICAgeDogcG9zaXRpb24ueCxcbiAgICB5OiBwb3NpdGlvbi55XG4gIH07XG4gIHRoaXMudmVsb2NpdHkgPSB7XG4gICAgeDogMCxcbiAgICB5OiAwXG4gIH1cbiAgdGhpcy5hbmdsZSA9IDA7XG4gIHRoaXMucmFkaXVzICA9IDY0O1xuICB0aGlzLnRocnVzdGluZyA9IGZhbHNlO1xuICB0aGlzLnN0ZWVyTGVmdCA9IGZhbHNlO1xuICB0aGlzLnN0ZWVyUmlnaHQgPSBmYWxzZTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHdpbmRvdy5vbmtleWRvd24gPSBmdW5jdGlvbihldmVudCkge1xuICAgIHN3aXRjaChldmVudC5rZXkpIHtcbiAgICAgIGNhc2UgJ0Fycm93VXAnOiAvLyB1cFxuICAgICAgY2FzZSAndyc6XG4gICAgICAgIHNlbGYudGhydXN0aW5nID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBcnJvd0xlZnQnOiAvLyBsZWZ0XG4gICAgICBjYXNlICdhJzpcbiAgICAgICAgc2VsZi5zdGVlckxlZnQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOiAvLyByaWdodFxuICAgICAgY2FzZSAnZCc6XG4gICAgICAgIHNlbGYuc3RlZXJSaWdodCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHdpbmRvdy5vbmtleXVwID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBzd2l0Y2goZXZlbnQua2V5KSB7XG4gICAgICBjYXNlICdBcnJvd1VwJzogLy8gdXBcbiAgICAgIGNhc2UgJ3cnOlxuICAgICAgICBzZWxmLnRocnVzdGluZyA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93TGVmdCc6IC8vIGxlZnRcbiAgICAgIGNhc2UgJ2EnOlxuICAgICAgICBzZWxmLnN0ZWVyTGVmdCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOiAvLyByaWdodFxuICAgICAgY2FzZSAnZCc6XG4gICAgICAgIHNlbGYuc3RlZXJSaWdodCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbih0aW1lKSB7XG4gIC8vIEFwcGx5IGFuZ3VsYXIgdmVsb2NpdHlcbiAgaWYodGhpcy5zdGVlckxlZnQpIHtcbiAgICB0aGlzLmFuZ2xlICs9IHRpbWUgKiAwLjAwNTtcbiAgfVxuICBpZih0aGlzLnN0ZWVyUmlnaHQpIHtcbiAgICB0aGlzLmFuZ2xlIC09IDAuMTtcbiAgfVxuICAvLyBBcHBseSBhY2NlbGVyYXRpb25cbiAgaWYodGhpcy50aHJ1c3RpbmcpIHtcbiAgICB2YXIgYWNjZWxlcmF0aW9uID0ge1xuICAgICAgeDogTWF0aC5zaW4odGhpcy5hbmdsZSksXG4gICAgICB5OiBNYXRoLmNvcyh0aGlzLmFuZ2xlKVxuICAgIH1cbiAgICB0aGlzLnZlbG9jaXR5LnggLT0gYWNjZWxlcmF0aW9uLng7XG4gICAgdGhpcy52ZWxvY2l0eS55IC09IGFjY2VsZXJhdGlvbi55O1xuICB9XG4gIC8vIEFwcGx5IHZlbG9jaXR5XG4gIHRoaXMucG9zaXRpb24ueCArPSB0aGlzLnZlbG9jaXR5Lng7XG4gIHRoaXMucG9zaXRpb24ueSArPSB0aGlzLnZlbG9jaXR5Lnk7XG4gIC8vIFdyYXAgYXJvdW5kIHRoZSBzY3JlZW5cbiAgaWYodGhpcy5wb3NpdGlvbi54IDwgMCkgdGhpcy5wb3NpdGlvbi54ICs9IHRoaXMud29ybGRXaWR0aDtcbiAgaWYodGhpcy5wb3NpdGlvbi54ID4gdGhpcy53b3JsZFdpZHRoKSB0aGlzLnBvc2l0aW9uLnggLT0gdGhpcy53b3JsZFdpZHRoO1xuICBpZih0aGlzLnBvc2l0aW9uLnkgPCAwKSB0aGlzLnBvc2l0aW9uLnkgKz0gdGhpcy53b3JsZEhlaWdodDtcbiAgaWYodGhpcy5wb3NpdGlvbi55ID4gdGhpcy53b3JsZEhlaWdodCkgdGhpcy5wb3NpdGlvbi55IC09IHRoaXMud29ybGRIZWlnaHQ7XG59XG5cblBsYXllci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24odGltZSwgY3R4KSB7XG4gIGN0eC5zYXZlKCk7XG5cbiAgLy8gRHJhdyBwbGF5ZXIncyBzaGlwXG4gIGN0eC50cmFuc2xhdGUodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuICBjdHgucm90YXRlKC10aGlzLmFuZ2xlKTtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKDAsIC0xMCk7XG4gIGN0eC5saW5lVG8oLTEwLCAxMCk7XG4gIGN0eC5saW5lVG8oMCwgMCk7XG4gIGN0eC5saW5lVG8oMTAsIDEwKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xuICBjdHguc3Ryb2tlKCk7XG5cbiAgLy8gRHJhdyBlbmdpbmUgdGhydXN0XG4gIGlmKHRoaXMudGhydXN0aW5nKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8oMCwgMjApO1xuICAgIGN0eC5saW5lVG8oNSwgMTApO1xuICAgIGN0eC5hcmMoMCwgMTAsIDUsIDAsIE1hdGguUEksIHRydWUpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJztcbiAgICBjdHguc3Ryb2tlKCk7XG4gIH1cbiAgY3R4LnJlc3RvcmUoKTtcbn1cbiJdfQ==
