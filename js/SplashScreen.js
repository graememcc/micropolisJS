/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Config', 'Game', 'MapGenerator', 'Simulation', 'SplashCanvas', 'Storage'],
       function(Config, Game, MapGenerator, Simulation, SplashCanvas, Storage) {
  "use strict";


  function SplashScreen(tileSet, spriteSheet) {
    this.tileSet = tileSet;
    this.spriteSheet = spriteSheet;
    this.map = MapGenerator();

    $('#splashGenerate').click(this.regenerateMap.bind(this));
    $('#splashPlay').click(this.acquireNameAndDifficulty.bind(this));

    this.splashCanvas = new SplashCanvas(SplashCanvas.DEFAULT_ID, 'splashContainer');

    // Conditionally enable load/save buttons
    $('#saveRequest').prop('disabled', !Storage.canStore);
    $('#splashLoad').prop('disabled', !(Storage.canStore && Storage.getSavedGame() !== null));

    this.splashCanvas.init(this.map, tileSet);

    $('#splashLoad').click(this.handleLoad.bind(this));
    $('.awaitGeneration').toggle();
    $('#splashPlay').focus();
  }


  SplashScreen.prototype.regenerateMap = function(e) {
    e.preventDefault();

    this.splashCanvas.clearMap();
    this.map = MapGenerator();
    this.splashCanvas.paint(this.map);
  };


  SplashScreen.prototype.handleLoad = function(e) {
    e.preventDefault();

    var savedGame = Storage.getSavedGame();

    if (savedGame === null)
      return;

    $('#splashLoad').off('click');
    $('#splashGenerate').off('click');
    $('#splashPlay').off('click');
    $('#splash').toggle();
    var g = new Game(savedGame, this.tileSet, this.spriteSheet, Simulation.LEVEL_EASY, name);
  };


  SplashScreen.prototype.acquireNameAndDifficulty = function(e) {
    e.preventDefault();

    $('#splashLoad').off('click');
    $('#splashGenerate').off('click');
    $('#splashPlay').off('click');
    $('#splash').toggle();

    $('#playForm').submit(this.playMap.bind(this));
    $('#start').toggle();

    if (Config.debug)
      $('#nameForm').removeAttr('required');

    $('#nameForm').focus();
  };


  SplashScreen.prototype.playMap = function(e) {
    e.preventDefault();

    $('#playForm').off('submit');
    $('#start').toggle();
    var difficulty = $('.difficulty:checked').val() - 0;
    var name = $('#nameForm').val();
    var g = new Game(this.map, this.tileSet, this.spriteSheet, difficulty, name);
  };


  return SplashScreen;
});
