/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

require(['Game', 'SpriteLoader', 'TileSet', 'TileSetURI'],
        function(Game, SpriteLoader, TileSet, TileSetURI) {

  var i, tileSet;

  var spritesLoaded = function(spriteImages) {
    // Launch the game
    var g = new Game(tileSet, spriteImages);
  };


  var spriteError = function() {
    alert('Failed to load sprites');
  };


  var loadSprites = function() {
    var sl = new SpriteLoader();
    sl.load(spritesLoaded, spriteError);
  };


  var tileSetError = function() {
    alert('Failed to load tileset!');
  };


  var loadTileSet = function() {
    tileSet = new TileSet(i, loadSprites, tileSetError);
  };


  var imgError = function() {
    alert('Failed to load tile images!');
  };


  var i = new Image();
  i.onload = loadTileSet;
  i.onerror = imgError;
  i.src = 'images/tiles.png';
});
