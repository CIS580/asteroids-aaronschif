"use strict";

import {Game} from './game.js'

var canvas = document.getElementById('screen');
var game = new Game(canvas);

var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());
