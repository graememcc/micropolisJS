/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
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

  function BoatSprite(map, spriteManager, x, y) {
    this.init(SpriteConstants.SPRITE_SHIP, map, spriteManager, x, y);
    this.width = 48;
    this.height = 48;
    this.xOffset = -24;
    this.yOffset = -24;

    if (x < SpriteUtils.worldToPix(4))
      this.frame = 3;
    else if (x >= SpriteUtils.worldToPix(map.width - 4))
      this.frame = 7;
    else if (y < SpriteUtils.worldToPix(4))
      this.frame = 5;
    else if (y >= SpriteUtils.worldToPix(map.height - 4))
      this.frame = 1;
    else
      this.frame = 3;

    this.newDir = this.frame;
    this.dir = 10;
    this.count = 1;
  }


  BaseSprite(BoatSprite);


  // This is an odd little function. It returns true if
  // oldDir is 180° from newDir and tileValue is underwater
  // rail or wire, and returns false otherwise
  var oppositeAndUnderwater = function(tileValue, oldDir, newDir) {
    var opposite = oldDir + 4;

    if (opposite > 8)
      opposite -= 8;

    if (newDir != opposite)
      return false;

    if (tileValue == Tile.POWERBASE || tileValue == Tile.POWERBASE + 1 ||
        tileValue == Tile.RAILBASE || tileValue == Tile.RAILBASE + 1)
      return true;

    return false;
  };


  var tileDeltaX = [0,  0,  1,  1,  1,  0, -1, -1, -1];
  var tileDeltaY = [0, -1, -1,  0,  1,  1,  1,  0, -1];
  var xDelta = [0,  0,  2,  2,  2,  0, -2, -2, -2];
  var yDelta = [0, -2, -2,  0,  2,  2,  2,  0, -2];
  var tileWhiteList = [Tile.RIVER, Tile.CHANNEL, Tile.POWERBASE,
                  Tile.POWERBASE + 1, Tile.RAILBASE,
                  Tile.RAILBASE + 1, Tile.BRWH, Tile.BRWV];

  var CANTMOVE = 10;

  BoatSprite.prototype.move = function(spriteCycle, messageManager, disasterManager, blockMaps) {
    var tile = Tile.RIVER;

    if (this.soundCount > 0)
      this.soundCount--;

    if (this.soundCount === 0) {
      if ((Random.getRandom16() & 3) === 1) {
        // TODO Scenarios
        // TODO Sound
        messageManager.sendMessage(Messages.SOUND_HONKHONK);
      }

      this.soundCount = 200;
    }

    if (this.count > 0)
        this.count--;

    if (this.count === 0) {
      // Ships turn slowly: only 45° every 9 cycles
      this.count = 9;

      // If already executing a turn, continue to do so
      if (this.frame !== this.newDir) {
        this.frame = SpriteUtils.turnTo(this.frame, this.newDir);
        return;
      }

      // Otherwise pick a new direction
      // Choose a random starting direction to search from
      // 0 = N, 1 = NE, ... 7 = NW
      startDir = Random.getRandom16() & 7;

      for (var dir = startDir; dir < (startDir + 8); dir++) {
        frame = (dir & 7) + 1;

        if (frame === this.dir)
          continue;

        x = SpriteUtils.pixToWorld(this.x) + tileDeltaX[frame];
        y = SpriteUtils.pixToWorld(this.y) + tileDeltaY[frame];

        if (this.map.testBounds(x, y)) {
          var tileValue = this.map.getTileValue(x, y);

          // Test for a suitable water tile
          if (tileValue === Tile.CHANNEL || tileValue === Tile.BRWH ||
             tileValue === Tile.BRWV || underwaterOrOpposite(tileValue, this.dir, frame)) {
            this.newDir = frame;
            this.frame = SpriteUtils.turnTo(this.frame, this.newDir);
            this.dir = frame + 4;

            if (this.dir > 8)
              this.dir -= 8;
            break;
          }
        }
      }

      if (dir === (startDir + 8)) {
        this.dir = CANTMOVE;
        this.newDir = (Random.getRandom16() & 7) + 1;
      }
    } else {
      frame = this.frame;

      if (frame === this.newDir)  {
        this.x += xDelta[frame];
        this.y += yDelta[frame];
      }
    }

    if (this.spriteNotInBounds()) {
      this.frame = 0;
      return;
    }

    // If we didn't find a new direction, we might explode
    // depending on the last tile we looked at.
    for (i = 0; i < 8; i++) {
      if (t === tileWhiteList[i]) {
        break;
      }

      if (i === 7) {
        this.explodeSprite(messageManager);
        SpriteUtils.destroyMapTile(this.spriteManager, this.map, blockMaps, this.x, this.y);
      }
    }
  };


  BoatSprite.prototype.explodeSprite = function(messageManager) {
    this.frame = 0;
    this.spriteManager.makeExplosionAt(this.x, this.y);
    messageManager.sendMessage(Messages.SHIP_CRASHED);
  };


  // Metadata for image loading
  Object.defineProperties(BoatSprite,
    {ID: MiscUtils.makeConstantDescriptor(4),
     frames: MiscUtils.makeConstantDescriptor(8)});


  return BoatSprite;
});
