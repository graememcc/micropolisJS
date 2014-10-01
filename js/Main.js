/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

require(['Config', 'SplashScreen', 'TileSet', 'TileSetURI'],
        function(Config, SplashScreen, TileSet, TileSetURI) {
  "use strict";


  var onTilesLoaded = function() {
    // Kick things off properly
    var sprites = $('#sprites')[0];
    $('#loadingBanner').css('display', 'none');
    var s = new SplashScreen(tileSet, sprites);
  };


  // XXX Replace with an error dialog
  var tileSetError = function() {
    alert('Failed to load tileset!');
  };


  // Check for debug parameter in URL
  Config.debug = window.location.search.slice(1).split('&').some(function(param) {
    return param.trim().toLowerCase() === 'debug=1';
  });


  var tiles = $('#tiles')[0];
  var tileSet = new TileSet(tiles, onTilesLoaded, tileSetError);
});
