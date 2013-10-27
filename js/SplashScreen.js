define(['Game', 'MapGenerator', 'SplashCanvas'],
       function(Game, MapGenerator, SplashCanvas) {
  "use strict";

  function SplashScreen(tileSet, spriteImages) {
    this.tileSet = tileSet;
    this.spriteImages = spriteImages;
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
    $('#splashGenerate').off('click');
    $('#splashPlay').off('click');
    $('#splashContainer').html('');

    // Actually launch the game
    var g = new Game(this.map, this.tileSet, this.spriteImages);
  };


  return SplashScreen;
});    
