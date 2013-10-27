/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Direction', 'MiscUtils', 'Random', 'SpriteConstants', 'SpriteUtils', 'Tile', 'TileUtils'],
       function(Direction, MiscUtils, Random, SpriteConstants, SpriteUtils, Tile, TileUtils) {
  "use strict";

  function Traffic(map, spriteManager) {
    this._map = map;
    this._stack = [];
    this._spriteManager = spriteManager;
  }


  Traffic.prototype.makeTraffic = function(x, y, blockMaps, destFn) {
    this._stack = [];

    var pos = new this._map.Position(x, y);

    if (this.findPerimeterRoad(pos)) {
      if (this.tryDrive(pos, destFn)) {
        this.addToTrafficDensityMap(blockMaps);
        return Traffic.ROUTE_FOUND;
      }

      return Traffic.NO_ROUTE_FOUND;
    } else {
      return Traffic.NO_ROAD_FOUND;
    }
  };


  Traffic.prototype.addToTrafficDensityMap = function(blockMaps) {
    var trafficDensityMap = blockMaps.trafficDensityMap;

    while (this._stack.length > 0) {
      var pos = this._stack.pop();

      // Could this happen?!?
      if (!this._map.testBounds(pos.x, pos.y))
        continue;

      var tileValue = this._map.getTileValue(pos.x, pos.y);

      if (tileValue >= Tile.ROADBASE && tileValue < Tile.POWERBASE) {
        // Update traffic density.
        var traffic = trafficDensityMap.worldGet(pos.x, pos.y);
        traffic += 50;
        traffic = Math.min(traffic, 240);
        trafficDensityMap.worldSet(pos.x, pos.y, traffic);

        // Attract traffic copter to the traffic
        if (traffic >= 240 && Random.getRandom(5) === 0) {
          var sprite = this._spriteManager.getSprite(SpriteConstants.SPRITE_HELICOPTER);
          if (sprite !== null) {
            sprite.destX = SpriteUtils.worldToPix(pos.x);
            sprite.destY = SpriteUtils.worldToPix(pos.y);
          }
        }
      }
    }
  };


  var perimX = [-1, 0, 1, 2, 2, 2, 1, 0,-1,-2,-2,-2];
  var perimY = [-2,-2,-2,-1, 0, 1, 2, 2, 2, 1, 0,-1];

  Traffic.prototype.findPerimeterRoad = function(pos) {
    for (var i = 0; i < 12; i++) {
      var xx = pos.x + perimX[i];
      var yy = pos.y + perimY[i];

      if (this._map.testBounds(xx, yy)) {
        if (TileUtils.isDriveable(this._map.getTileValue(xx, yy))) {
          pos.x = xx;
          pos.y = yy;
          return true;
        }
      }
    }

    return false;
  };


  var MAX_TRAFFIC_DISTANCE = 30;

  Traffic.prototype.tryDrive = function(startPos, destFn) {
    var dirLast = Direction.INVALID;
    var drivePos = new this._map.Position(startPos);

    /* Maximum distance to try */
    for (var dist = 0; dist < MAX_TRAFFIC_DISTANCE; dist++) {
      var  dir = this.tryGo(drivePos, dirLast);
      if (dir != Direction.INVALID) {
        drivePos.move(dir);
        dirLast = Direction.rotate180(dir);

        if (dist & 1)
          this._stack.push(new this._map.Position(drivePos));

        if (this.driveDone(drivePos, destFn))
          return true;
      } else {
        if (this._stack.length > 0) {
          this._stack.pop();
          dist += 3;
        } else {
          return false;
        }
      }
    }

    return false;
  };


  Traffic.prototype.tryGo = function(pos, dirLast) {
    var  directions = [];

    // Find connections from current position.
    var dir = Direction.NORTH;
    var count = 0;

    for (var i = 0; i < 4; i++) {
      if (dir != dirLast && TileUtils.isDriveable(this._map.getTileFromMapOrDefault(pos, dir, Tile.DIRT))) {
        // found a road in an allowed direction
        directions[i] = dir;
        count++;
      } else {
        directions[i] = Direction.INVALID;
      }
      dir = Direction.rotate90(dir);
    }

    if (count === 0)
      return Direction.INVALID;

    if (count === 1) {
      for (i = 0; i < 4; i++) {
        if (directions[i] != Direction.INVALID)
          return directions[i];
      }
    }

    i = Random.getRandom16() & 3;
    while (directions[i] === Direction.INVALID)
        i = (i + 1) & 3;

    return directions[i];
  };


  Traffic.prototype.driveDone = function(pos, destFn) {
    if (pos.y > 0) {
      if (destFn(this._map.getTileValue(pos.x, pos.y - 1)))
        return true;
    }

    if (pos.x < (this._map.width - 1)) {
      if (destFn(this._map.getTileValue(pos.x + 1, pos.y)))
        return true;
    }

    if (pos.y < (this._map.height - 1)) {
      if (destFn(this._map.getTileValue(pos.x, pos.y + 1)))
        return true;
    }

    if (pos.x > 0) {
      if (destFn(this._map.getTileValue(pos.x - 1, pos.y)))
        return true;
    }

    return false;
  };


  Object.defineProperties(Traffic,
    {ROUTE_FOUND: MiscUtils.makeConstantDescriptor(1),
     NO_ROUTE_FOUND: MiscUtils.makeConstantDescriptor(0),
     NO_ROAD_FOUND: MiscUtils.makeConstantDescriptor(-1)});


  return Traffic;
});
