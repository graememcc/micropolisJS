/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { EventEmitter } from './eventEmitter';
import { SpriteUtils } from './spriteUtils';

var init = function(type, map, spriteManager, x, y) {
  this.type = type;
  this.map = map;
  this.spriteManager = spriteManager;

  var pixX = x;
  var pixY = y;
  var worldX = x >> 4;
  var worldY = y >> 4;

  Object.defineProperty(this, 'x',
    {configurable: false,
     enumerable: true,
     set: function(val) {
       // XXX These getters have implicit knowledge of tileWidth: need to decide whether to disallow non 16px tiles
       pixX = val;
       worldX = val >> 4;
     },
     get: function() {
      return pixX;
     }
  });

  Object.defineProperty(this, 'y',
    {configurable: false,
     enumerable: true,
     set: function(val) {
       pixY = val;
       worldY = val >> 4;
     },
     get: function() {
      return pixY;
     }
  });

  Object.defineProperty(this, 'worldX',
    {configurable: false,
     enumerable: true,
     set: function(val) {
       worldX = val;
       pixX = val << 4;
     },
     get: function() {
      return worldX;
     }
  });

  Object.defineProperty(this, 'worldY',
    {configurable: false,
     enumerable: true,
     set: function(val) {
       worldY = val;
       pixY = val << 4;
     },
     get: function() {
      return worldY;
     }
  });

  this.origX = 0;
  this.origY = 0;
  this.destX = 0;
  this.destY = 0;
  this.count = 0;
  this.soundCount = 0;
  this.dir = 0;
  this.newDir = 0;
  this.step = 0;
  this.flag = 0;
  this.turn = 0;
  this.accel = 0;
  this.speed = 100;
};


var getFileName = function() {
  return ['obj', this.type, '-', this.frame - 1].join('');
};


var spriteNotInBounds = function() {
  var x = this.worldX;
  var y = this.worldY;

  return x < 0 || y < 0 || x >= this.map.width || y >= this.map.height;
};


var base = {
  init: init,
  getFileName: getFileName,
  spriteNotInBounds: spriteNotInBounds
};


var BaseSprite = function(spriteConstructor) {
  spriteConstructor.prototype = Object.create(base);
  EventEmitter(spriteConstructor);
};


export { BaseSprite };
