/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['EventEmitter', 'GameCanvas', 'Messages'],
       function(EventEmitter, GameCanvas, Messages) {
  "use strict";


  var TIMEOUT_SECS = 20;


  var MonsterTV = function(map, tileSet, spriteSheet, animationManager) {
    this.isOpen = false;
    this._tracking = null;

    // Need to quickly flick on the canvas container so the canvas picks up the correct dimensions (this is a bit of a
    // hack as we're reusing the same GameCanvas that paints the main map, but it avoids a lot of duplication)
    $(monsterTVID).toggle();

    this.canvas = new GameCanvas(monsterTVCanvasID, monsterTVContainerID);
    this.canvas.init(map, tileSet, spriteSheet, animationManager);
    this.canvas.disallowOffMap();

    this._onMove = onMove.bind(this);
    this._onDie = onDie.bind(this);
    this._timeout = null;

    $(monsterTVID).toggle();
    this.close = close.bind(this);
    $(monsterTVFormID).on('submit', this.close);
  };


  var monsterTVFormID = '#monsterTVForm';
  var monsterTVContainerID = '#tvContainer';
  var monsterTVCanvasID = '#tvCanvas';
  var monsterTVID = '#monstertv';


  var close = function(e) {
    if (e)
      e.preventDefault();

    this.isOpen = false;
    $(monsterTVID).toggle();
  };


  MonsterTV.prototype.paint = function(sprite, isPaused) {
    if (!this.isOpen)
      return;

    this.canvas.paint(null, sprite, isPaused);
  };


  onMove = function(event) {
    var min = this.canvas.getTileOrigin();
    var max = this.canvas.getMaxTile();

    if (event.x < min.x || event.y < min.y || event.x >= max.x || event.y >= max.y)
      this.canvas.centreOn(event.x, event.y);
  };


  onDie = function(event) {
    this._tracking.removeEventListener(Messages.SPRITE_MOVE, this._onMove);
    this._tracking.removeEventListener(Messages.SPRITE_DYING, this._onDie);
    this._tracking = null;

    this._timeout = window.setTimeout(function() {this._timeout = null; this.close();}.bind(this), TIMEOUT_SECS * 1000);
  };


  MonsterTV.prototype.track = function(x, y, sprite) {
    if (this._tracking !== null) {
      this._tracking.removeEventListener(Messages.SPRITE_MOVE, this._onMove);
      this._tracking.removeEventListener(Messages.SPRITE_DYING, this._onDie);
    }

    this._tracking = sprite;
    sprite.addEventListener(Messages.SPRITE_MOVED, this._onMove);
    sprite.addEventListener(Messages.SPRITE_DYING, this._onDie);
    this.canvas.centreOn(x, y);

    if (this._timeout !== null) {
      window.clearTimeout(this._timeout);
      this._timeout = null;
    }

    if (this.isOpen)
      return;

    this.open();
  };


  MonsterTV.prototype.show = function(x, y) {
    this.canvas.centreOn(x, y);

    if (this._timeout !== null) {
      window.clearTimeout(this._timeout);
      this._timeout = null;
    }

    if (this.isOpen)
      return;

    this.open();
  };


  MonsterTV.prototype.open = function(message) {
    this.isOpen = true;
    $(monsterTVID).toggle();
  };


  return MonsterTV;
});
