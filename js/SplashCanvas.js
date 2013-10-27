/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['MouseBox', 'TileSet'],
       function(MouseBox, TileSet) {
  "use strict";

  function SplashCanvas(id, parentNode) {
    if (!(this instanceof SplashCanvas))
      return new SplashCanvas(id, parentNode);

    var e = new Error('Invalid parameter');

    if (arguments.length < 1)
      throw e;

    var height = SplashCanvas.DEFAULT_HEIGHT;
    var width = SplashCanvas.DEFAULT_WIDTH;

    if (typeof(parentNode) === 'string') {
      var orig = parentNode;
      parentNode = $('#' + parentNode);
      parentNode = parentNode.length === 0 ? null : parentNode[0];
      if (parentNode === null)
        throw new Error('Node ' + orig + ' not found');
    }

    this._canvas = document.createElement('canvas');
    this._canvas.id = id;
    this._canvas.width = width;
    this._canvas.height = height;

    // Remove any existing element with the same id
    var current = document.getElementById(id);
    if (current !== null) {
      if  (current.parentNode === parentNode)
        parentNode.replaceChild(this._canvas, current);
      else
        throw new Error('ID ' + id + ' already exists in document!');
    } else
      parentNode.appendChild(this._canvas);
  }


  SplashCanvas.prototype.init = function(map, tileSet) {
    if (!tileSet.loaded)
      throw new Error('TileSet not ready!');

    this._tileSet = tileSet;
    this.paint(map);
  };


  SplashCanvas.prototype._paintTile = function(tileVal, x, y, canvas) {
    canvas = canvas || this._canvas;
    var src = this._tileSet[tileVal];

    var ctx = canvas.getContext('2d');
    ctx.drawImage(src, x * 3, y * 3, 3, 3);
  };



  SplashCanvas.prototype.clearMap = function() {
    var ctx = this._canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
  };


  SplashCanvas.prototype.paint = function(map) {
    var ctx = this._canvas.getContext('2d');
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    for (var y = 0; y < map.height; y++) {
      for (var x = 0; x < map.width; x++) {
        this._paintTile(map.getTileValue(x, y), x, y);
      }
    }
  };


  SplashCanvas.DEFAULT_WIDTH = 360;
  SplashCanvas.DEFAULT_HEIGHT = 300;
  SplashCanvas.DEFAULT_ID = "SplashCanvas";

  return SplashCanvas;
});
