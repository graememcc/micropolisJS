define(['Game', 'MapGenerator', 'SplashCanvas'],
       function(Game, MapGenerator, SplashCanvas) {
  "use strict";

  function SplashScreen(tileSet, spriteSheet) {
    this.tileSet = tileSet;
    this.spriteSheet = spriteSheet;
    this.map = MapGenerator();

    $('#splashGenerate').click(this.regenerateMap.bind(this));
    $('#splashPlay').click(this.playMap.bind(this));

    this.splashCanvas = new SplashCanvas(SplashCanvas.DEFAULT_ID, 'splashContainer');
    this.splashCanvas.init(this.map, tileSet);
  }


  SplashScreen.prototype.regenerateMap = function() {
    this.splashCanvas.clearMap();
    this.map = MapGenerator();
    this.splashCanvas.paint(this.map);
  };


  SplashScreen.prototype.playMap = function() {
    var difficulty = $('input[name="difficulty"]:checked').val() - 0;
    $('#splashGenerate').off('click');
    $('#splashPlay').off('click');
    $('#splashContainer').html('');

    // Actually launch the game
    var g = new Game(this.map, this.tileSet, this.spriteSheet, difficulty);
  };


  return SplashScreen;
});    
