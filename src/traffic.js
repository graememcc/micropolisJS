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

import { forEachCardinalDirection } from './direction.ts';
import { MiscUtils } from './miscUtils.js';
import { Position } from './position.ts';
import { Random } from './random.ts';
import { SPRITE_HELICOPTER } from './spriteConstants.ts';
import { SpriteUtils } from './spriteUtils.js';
import { TileUtils } from './tileUtils.js';
import { DIRT, POWERBASE, ROADBASE } from "./tileValues.ts";

function Traffic(map, spriteManager) {
  this._map = map;
  this._stack = [];
  this._spriteManager = spriteManager;
}


Traffic.prototype.makeTraffic = function(x, y, blockMaps, destFn) {
  this._stack = [];

  var pos = new Position(x, y);

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

    if (tileValue >= ROADBASE && tileValue < POWERBASE) {
      // Update traffic density.
      var traffic = trafficDensityMap.worldGet(pos.x, pos.y);
      traffic += 50;
      traffic = Math.min(traffic, 240);
      trafficDensityMap.worldSet(pos.x, pos.y, traffic);

      // Attract traffic copter to the traffic
      if (traffic >= 240 && Random.getRandom(5) === 0) {
        var sprite = this._spriteManager.getSprite(SPRITE_HELICOPTER);
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
  var dirLast;
  var drivePos = new Position(startPos);

  /* Maximum distance to try */
  for (var dist = 0; dist < MAX_TRAFFIC_DISTANCE; dist++) {
    var  dir = this.tryGo(drivePos, dirLast);
    if (dir) {
      drivePos = Position.move(pos, dir);
      dirLast = dir.oppositeDirection();

      if (dist & 1)
        this._stack.push(new Position(drivePos));

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
  var directions = [];

  // Find connections from current position.
  var count = 0;

  forEachCardinalDirection(dir => {
    if (dir != dirLast && TileUtils.isDriveable(this._map.getTileFromMapOrDefault(pos, dir, DIRT))) {
      directions.push(dir);
      count++;
    }
  });

  if (count === 0) {
    return;
  }

  if (count === 1) {
    return directions[0];
  }

  const index = Random.getRandom(directions.length - 1);
  return directions[index];
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


export { Traffic };
