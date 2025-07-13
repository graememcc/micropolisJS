/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 * The name/term "MICROPOLIS" is a registered trademark of Micropolis (https://www.micropolis.com) GmbH
 * (Micropolis Corporation, the "licensor") and is licensed here to the authors/publishers of the "Micropolis"
 * city simulation game and its source code (the project or "licensee(s)") as a courtesy of the owner.
 *
 */

import { BaseSprite } from './baseSprite.js';
import { SPRITE_DYING, SPRITE_MOVED } from './messages.ts';
import { MiscUtils } from './miscUtils.js';
import { Random } from './random.ts';
import * as SpriteConstants from './spriteConstants.ts';
import { SpriteUtils } from './spriteUtils.js';

function TornadoSprite(map, spriteManager, x, y) {
  this.init(SpriteConstants.SPRITE_TORNADO, map, spriteManager, x, y);
  this.width = 48;
  this.height = 48;
  this.xOffset = -24;
  this.yOffset = -40;
  this.frame = 1;
  this.count = 200;
}


BaseSprite(TornadoSprite);


var xDelta = [2, 3, 2, 0, -2, -3];
var yDelta = [-2, 0, 2, 3, 2, 0];

TornadoSprite.prototype.move = function(spriteCycle, disasterManager, blockMaps) {
  var frame = this.frame;

  // If middle frame, move right or left
  // depending on the flag value
  // If frame = 1, perhaps die based on flag
  // value
  if (frame === 2) {
    if (this.flag)
      frame = 3;
    else
      frame = 1;
  } else {
    if (frame === 1)
      this.flag = 1;
    else
      this.flag = 0;

    frame = 2;
  }

  if (this.count > 0)
    this.count--;

  this.frame = frame;

  var spriteList = this.spriteManager.getSpriteList();
  for (var i = 0; i < spriteList.length; i++) {
    var s = spriteList[i];

    // Explode vulnerable sprites
    if (s.frame !== 0 &&
        (s.type === SpriteConstants.SPRITE_AIRPLANE || s.type === SpriteConstants.SPRITE_HELICOPTER ||
         s.type === SpriteConstants.SPRITE_SHIP || s.type === SpriteConstants.SPRITE_TRAIN) &&
      SpriteUtils.checkSpriteCollision(this, s)) {
      s.explodeSprite();
    }
  }

  frame = Random.getRandom(5);
  this.x += xDelta[frame];
  this.y += yDelta[frame];

  if (this.spriteNotInBounds())
    this.frame = 0;

  if (this.count !== 0 && Random.getRandom(500) === 0)
    this.frame = 0;

  if (this.frame === 0)
    this._emitEvent(SPRITE_DYING);

  SpriteUtils.destroyMapTile(this.spriteManager, this.map, blockMaps, this.x, this.y);
  this._emitEvent(SPRITE_MOVED, {x: this.worldX, y: this.worldY});
};


// Metadata for image loading
Object.defineProperties(TornadoSprite,
  {ID: MiscUtils.makeConstantDescriptor(6),
   width: MiscUtils.makeConstantDescriptor(48),
   frames: MiscUtils.makeConstantDescriptor(3)});


export { TornadoSprite };
