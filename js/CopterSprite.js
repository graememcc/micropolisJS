/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['BaseSprite', 'Messages', 'MiscUtils', 'Random', 'SpriteConstants', 'SpriteUtils', 'Tile'],
       function(BaseSprite, Messages, MiscUtils, Random, SpriteConstants, SpriteUtils, Tile) {
  "use strict";


  function CopterSprite(map, spriteManager, x, y) {
    this.init(SpriteConstants.SPRITE_HELICOPTER, map, spriteManager, x, y);
    this.width = 32;
    this.height = 32;
    this.xOffset = -16;
    this.yOffset = -16;
    this.frame = 5;
    this.count = 1500;
    this.destX = Random.getRandom(SpriteUtils.worldToPix(map.width)) + 8;
    this.destY = Random.getRandom(SpriteUtils.worldToPix(map.height)) + 8;
    this.origX = x;
    this.origY = y;
  }


  BaseSprite(CopterSprite);


  var xDelta = [0, 0, 3, 5, 3, 0, -3, -5, -3];
  var yDelta = [0, -5, -3, 0, 3, 5, 3, 0, -3];

  CopterSprite.prototype.move = function(spriteCycle, disasterManager, blockMaps) {
    if (this.soundCount > 0)
      this.soundCount--;

    if (this.count > 0)
      this.count--;

    if (this.count === 0) {
      // Head towards a monster, and certain doom
      var s = this.spriteManager.getSprite(SpriteConstants.SPRITE_MONSTER);

      if (s !== null) {
        this.destX = s.x;
        this.destY = s.y;
      } else {
        // No monsters. Hm. I bet flying near that tornado is sensible
        s = this.spriteManager.getSprite(SpriteConstants.SPRITE_TORNADO);

        if (s !== null) {
            this.destX = s.x;
            this.destY = s.y;
        } else {
            this.destX = this.origX;
            this.destY = this.origY;
        }
      }

      // If near destination, let's get her on the ground
      var absDist = SpriteUtils.absoluteDistance(this.x, this.y, this.origX, this.origY);
      if (absDist < 30) {
        this.frame = 0;
        return;
      }
    }

    if (this.soundCount === 0) {
        var x = this.worldX;
        var y = this.worldY;

        if (x >= 0 && x < this.map.width && y >= 0 && y < this.map.height) {
          if (blockMaps.trafficDensityMap.worldGet(x, y) > 170 && (Random.getRandom16() & 7) === 0) {
            this._emitEvent(Messages.HEAVY_TRAFFIC, {x: x, y: y});
            this._emitEvent(Messages.SOUND_HEAVY_TRAFFIC);
            this.soundCount = 200;
        }
      }
    }

    var frame = this.frame;

    if ((spriteCycle & 3) === 0) {
      var dir = SpriteUtils.getDir(this.x, this.y, this.destX, this.destY);
      frame = SpriteUtils.turnTo(frame, dir);
      this.frame = frame;
    }

    this.x += xDelta[frame];
    this.y += yDelta[frame];
  };


  CopterSprite.prototype.explodeSprite = function() {
    this.frame = 0;
    this.spriteManager.makeExplosionAt(this.x, this.y);
    this._emitEvent(Messages.HELICOPTER_CRASHED, {x: this.worldX, y: this.worldY});
  };


  // Metadata for image loading
  Object.defineProperties(CopterSprite,
    {ID: MiscUtils.makeConstantDescriptor(2),
     width: MiscUtils.makeConstantDescriptor(32),
     frames: MiscUtils.makeConstantDescriptor(8)});


  return CopterSprite;
});
