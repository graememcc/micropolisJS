/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['EventEmitter', 'GameCanvas'],
       function(EventEmitter, GameCanvas) {
  "use strict";


  var MonsterTV = function(map, tileSet, spriteSheet, animationManager) {
    this.isOpen = false;
    $(monsterTVID).toggle();
    this.canvas = new GameCanvas(monsterTVCanvasID, monsterTVContainerID);
    this.canvas.init(map, tileSet, spriteSheet, animationManager);

    $(monsterTVID).toggle();
    $(monsterTVFormID).on('submit', close.bind(this));
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


  MonsterTV.prototype.show = function(x, y) {
    this.canvas.centreOn(x, y);

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
