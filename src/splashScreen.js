/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
import $ from "jquery";

import { Config } from './config.js';
import { Game } from './game.js';
import { MapGenerator } from './mapGenerator.js';
import { Simulation } from './simulation.js';
import { SplashCanvas } from './splashCanvas.js';
import { Storage } from './storage.js';

/*
 *
 * The SplashScreen is the first screen the player will see on launch. It is responsible for map generation,
 * placing UI on screen to allow the player to select a map or load a game, and finally launching the game.
 * This should not be called until the tiles and sprites have been loaded.
 *
 */

var onresize = null;


// If the window is initially too small, try and relaunch if it gets bigger
var makeResizeListener = function(tileSet, spriteSheet) {
  return function(tileSet, spriteSheet, e) {
    $(window).off('resize');
    var s = new SplashScreen(tileSet, spriteSheet);
  }.bind(null, tileSet, spriteSheet);
};


function SplashScreen(tileSet, snowTileSet, spriteSheet) {
  // We don't launch the game if the screen is too small, however, we should retain the right to do so
  // should the situation change...
  if ($('#tooSmall').is(':visible')) {
    onresize = makeResizeListener(tileSet, spriteSheet);
    $(window).on('resize', onresize);
    return;
  }

  this.tileSet = tileSet;
  this.snowTileSet = snowTileSet;
  this.spriteSheet = spriteSheet;
  this.map = MapGenerator();

  // Set up listeners on buttons. When play is clicked, we will move on to get the player's desired
  // difficulty level and city name before launching the game properly
  $('#splashGenerate').click(regenerateMap.bind(this));
  $('#splashPlay').click(acquireNameAndDifficulty.bind(this));
  $('#splashLoad').click(handleLoad.bind(this));

  // Conditionally enable load/save buttons
  $('#saveRequest').prop('disabled', !Storage.canStore);
  $('#splashLoad').prop('disabled', !(Storage.canStore && Storage.getSavedGame() !== null));

  // Paint the minimap
  this.splashCanvas = new SplashCanvas('splashContainer', tileSet);
  this.splashCanvas.paint(this.map);

  // Let's get some bits on screen!
  $('.awaitGeneration').toggle();
  $('#splashPlay').focus();
}


// Generate a new map at the user's request, and paint it
var regenerateMap = function(e) {
  e.preventDefault();

  this.map = MapGenerator();
  this.splashCanvas.paint(this.map);
};


// Fetches game data from the storage manager, and launches the game. We won't return from here
var handleLoad = function(e) {
  e.preventDefault();

  var savedGame = Storage.getSavedGame();

  if (savedGame === null)
    return;

  // Remove installed event listeners
  $('#splashLoad').off('click');
  $('#splashGenerate').off('click');
  $('#splashPlay').off('click');

  // Hide the splashscreen UI
  $('#splash').toggle();

  // Launch
  var g = new Game(savedGame, this.tileSet, this.snowTileSet, this.spriteSheet, Simulation.LEVEL_EASY, name);
};


// After a map has been selected, call this function to display a form asking the user for
// a city name and difficulty level.
var acquireNameAndDifficulty = function(e) {
  e.preventDefault();

  // Remove the initial event listeners
  $('#splashLoad').off('click');
  $('#splashGenerate').off('click');
  $('#splashPlay').off('click');

  // Get rid of the initial splash screen
  $('#splash').toggle();

  // As a convenience, the city name is not mandatory in debug mode
  if (Config.debug)
    $('#nameForm').removeAttr('required');

  // When the form is submitted, we'll be ready to launch the game
  $('#playForm').submit(play.bind(this));

  // Display the name and difficulty form
  $('#start').toggle();
  $('#nameForm').focus();
};


// This function should be called after the name/difficulty form has been submitted. The game will now be launched
// with the map selected earlier.
var play = function(e) {
  e.preventDefault();

  // As usual, uninstall event listeners, and hide the UI
  $('#playForm').off('submit');
  $('#start').toggle();

  // What values did the player specify?
  var difficulty = $('.difficulty:checked').val() - 0;
  var name = $('#nameForm').val();

  // Launch a new game
  var g = new Game(this.map, this.tileSet, this.snowTileSet, this.spriteSheet, difficulty, name);
};


export { SplashScreen };
