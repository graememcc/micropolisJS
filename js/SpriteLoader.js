/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['AirplaneSprite', 'BoatSprite', 'CopterSprite', 'ExplosionSprite', 'MonsterSprite', 'MiscUtils', 'TornadoSprite', 'TrainSprite'],
       function(AirplaneSprite, BoatSprite, CopterSprite, ExplosionSprite, MonsterSprite, MiscUtils, TornadoSprite, TrainSprite) {
  "use strict";

  function SpriteLoader() {
    this._loadCallback = null;
    this._errorCallback = null;
  }


  SpriteLoader.prototype._postLoad = function() {
    var callback = this._loadCallback;
    this._loadCallback = null;
    this._errorCallback = null;
    callback(this._loadedSprites);
  };


  SpriteLoader.prototype._errorCB = function() {
    var callback = this._errorCallback;
    this._loadCallback = null;
    this._errorCallback = null;
    this._loadedSprites = {};
    callback();
  };


  SpriteLoader.prototype._loadCB = function(filename, canonical, loadedImage) {
    Object.defineProperty(this._loadedSprites, canonical, MiscUtils.makeConstantDescriptor(loadedImage));
    if (this._filesToLoad.length === 0) {
      this._postLoad();
      return;
    }

    filename = this._filesToLoad.pop();
    canonical = this._canonicalNames.pop();

    this._loadOne(filename, canonical);
  };


  SpriteLoader.prototype._loadOne = function(filename, canonical) {
    var i = new Image();
    i.onload = this._loadCB.bind(this, filename, canonical, i);
    i.onerror = this._errorCB.bind(this);
    i.src = filename;
  };


  SpriteLoader.prototype.load = function(loadCallback, errorCallback) {
    this._loadCallback = loadCallback;
    this._errorCallback = errorCallback;

    var sprites = [AirplaneSprite, BoatSprite, CopterSprite, ExplosionSprite,
                   MonsterSprite, TornadoSprite, TrainSprite];
    this._filesToLoad = [];
    this._canonicalNames = [];

    for (var i = 0, l = sprites.length; i < l; i++) {
      var id = sprites[i].ID;
      var frames = sprites[i].frames;

      for (var j = 0; j < frames; j++) {
        this._filesToLoad.push(['sprites/obj', id, '-', j, '.png'].join(''));
        this._canonicalNames.push(['obj', id, '-', j].join(''));
      }
    }

    this._loadedSprites = {};
    var file = this._filesToLoad.pop();
    var canonical = this._canonicalNames.pop();
    this._loadOne(file, canonical);
  };


  return SpriteLoader;
});
