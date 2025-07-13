/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { TILE_COUNT } from "./tileValues.ts";

// Tiles must be 16px square
var TILE_SIZE = 16;
var TILES_PER_ROW = Math.sqrt(TILE_COUNT);
var ACCEPTABLE_DIMENSION = TILES_PER_ROW * TILE_SIZE;


function TileSet(image, callback, errorCallback) {
  if (!(this instanceof TileSet))
    return new TileSet(image, callback, errorCallback);

  if (callback === undefined || errorCallback === undefined) {
    if (callback === undefined && errorCallback === undefined)
      throw new Error('Tileset constructor called with no callback or errorCallback');
    else
      throw new Error('Tileset constructor called with no ' + (callback === undefined ? 'callback' : 'errorCallback'));
  }

  this.isValid = false;

  if (!(image instanceof Image)) {
    // Spin the event loop
    window.setTimeout(errorCallback, 0);
    return;
  }

  this._verifyImage(image, callback, errorCallback);
}


TileSet.prototype._verifyImage = function(image, callback, errorCallback) {
  var width = image.width;
  var height = image.height;

  // We expect tilesets to be square, and of the required width/height
  if (width !== height || width !== ACCEPTABLE_DIMENSION) {
    // Spin the event loop
    window.setTimeout(errorCallback, 0);
    return;
  }

  var tileWidth = this.tileWidth = TILE_SIZE;

  // We paint the image onto a canvas so we can split it up
  var c = document.createElement('canvas');
  c.width = tileWidth;
  c.height = tileWidth;
  var cx = c.getContext('2d');

  // Count how many tiles we have created
  var tileCount = TILE_COUNT;
  var notifications = 0;
  var self = this;

  // Callback triggered by an image load. Checks to see if we are done creating images,
  // and if so notifies the caller.
  var imageLoad = function() {
    notifications++;

    if (notifications === tileCount) {
      self.isValid = true;
      // Spin the event loop
      window.setTimeout(callback, 0);
      return;
    }
  };

  // Break up the source image into tiles by painting each tile onto a canvas, computing the dataURI
  // of the canvas, and using that to create a new image, which we install on ourselves as a new property
  for (var i = 0; i < tileCount; i++) {
    cx.clearRect(0, 0, tileWidth, tileWidth);

    var sourceX = i % TILES_PER_ROW * tileWidth;
    var sourceY = Math.floor(i / TILES_PER_ROW) * tileWidth;
    cx.drawImage(image, sourceX, sourceY, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth);

    this[i] = new Image();
    this[i].onload = imageLoad;
    this[i].src = c.toDataURL();
  }
};


export { TileSet };
