/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define([],
       function() {
  "use strict";

  function SpriteLoader() {
    this._loadCallback = null;
    this._errorCallback = null;
  }


  SpriteLoader.prototype._loadCB = function() {
    var callback = this._loadCallback;
    this._loadCallback = null;
    this._errorCallback = null;
    callback(this._spriteSheet);
  };


  SpriteLoader.prototype._errorCB = function() {
    var callback = this._errorCallback;
    this._loadCallback = null;
    this._errorCallback = null;
    this._spriteSheet = null;
    callback();
  };


  SpriteLoader.prototype.load = function(loadCallback, errorCallback) {
    this._loadCallback = loadCallback;
    this._errorCallback = errorCallback;

    this._spriteSheet = new Image();
    this._spriteSheet.onerror = this._errorCB.bind(this);
    this._spriteSheet.onload = this._loadCB.bind(this);
    this._spriteSheet.src = 'images/sprites.png';
  };


  return SpriteLoader;
});
