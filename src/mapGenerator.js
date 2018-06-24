/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { forEachCardinalDirection, getRandomCardinalDirection, getRandomDirection } from './direction';
import { GameMap } from './gameMap';
import { Random } from './random';
import { BLBNBIT, BULLBIT } from "./tileFlags";
import { CHANNEL, DIRT, REDGE, RIVER, WATER_LOW, WATER_HIGH, WOODS, WOODS_LOW, WOODS_HIGH } from "./tileValues";

var TERRAIN_CREATE_ISLAND;
var TERRAIN_TREE_LEVEL = -1;
var TERRAIN_LAKE_LEVEL = -1;
var TERRAIN_CURVE_LEVEL = -1;
var ISLAND_RADIUS = 18;

var MapGenerator = function(w, h) {
  w = w || 120;
  h = h || 100;

  TERRAIN_CREATE_ISLAND = Random.getRandom(2) - 1;

  var map = new GameMap(w, h);
  // Construct land.
  if (TERRAIN_CREATE_ISLAND < 0) {
    if (Random.getRandom(100) < 10) {
      makeIsland(map);
      return map;
    }
  }

  if (TERRAIN_CREATE_ISLAND === 1)
    makeNakedIsland(map);
  else
    clearMap(map);

  // Lay a river.
  if (TERRAIN_CURVE_LEVEL !== 0) {
    var terrainXStart = 40 + Random.getRandom(map.width - 80);
    var terrainYStart = 33 + Random.getRandom(map.height - 67);

    var terrainPos = new map.Position(terrainXStart, terrainYStart);
    doRivers(map, terrainPos);
  }

  // Lay a few lakes.
  if (TERRAIN_LAKE_LEVEL !== 0)
      makeLakes(map);

  smoothRiver(map);

  // And add trees.
  if (TERRAIN_TREE_LEVEL !== 0)
      doTrees(map);

  return map;
};


var clearMap = function(map) {
  for (var x = 0; x < map.width; x++) {
    for (var y = 0; y < map.height; y++) {
      map.setTile(x, y, DIRT, 0);
    }
  }
};


var clearUnnatural = function(map) {
  for (var x = 0; x < map.width; x++) {
    for (var y = 0; y < map.height; y++) {
      var tileValue = map.getTileValue(x, y);
      if (tileValue > WOODS)
        map.setTile(x, y, DIRT, 0);
    }
  }
};


var makeNakedIsland = function(map) {
  var terrainIslandRadius = ISLAND_RADIUS;
  var x, y;

  for (x = 0; x < map.width; x++) {
    for (y = 0; y < map.height; y++) {
      if ((x < 5) || (x >= map.width - 5) ||
          (y < 5) || (y >= map.height - 5)) {
        map.setTile(x, y, RIVER, 0);
      } else {
        map.setTile(x, y, DIRT, 0);
      }
    }
  }

  for (x = 0; x < map.width - 5; x += 2) {
    var mapY = Random.getERandom(terrainIslandRadius);
    plopBRiver(map, new map.Position(x, mapY));

    mapY = (map.height - 10) - Random.getERandom(terrainIslandRadius);
    plopBRiver(map, new map.Position(x, mapY));

    plopSRiver(map, new map.Position(x, 0));
    plopSRiver(map, new map.Position(x, map.height - 6));
  }

  for (y = 0; y < map.height - 5; y += 2) {
    var mapX = Random.getERandom(terrainIslandRadius);
    plopBRiver(map, new map.Position(mapX, y));

    mapX = map.width - 10 - Random.getERandom(terrainIslandRadius);
    plopBRiver(map, new map.Position(mapX, y));

    plopSRiver(map, new map.Position(0, y));
    plopSRiver(map, new map.Position(map.width - 6, y));
  }
};


var makeIsland = function(map) {
  makeNakedIsland(map);
  smoothRiver(map);
  doTrees(map);
};


var makeLakes = function(map) {
  var numLakes;
  if (TERRAIN_LAKE_LEVEL < 0)
      numLakes = Random.getRandom(10);
  else
      numLakes = TERRAIN_LAKE_LEVEL / 2;

  while (numLakes > 0) {
    var x = Random.getRandom(map.width - 21) + 10;
    var y = Random.getRandom(map.height - 20) + 10;

    makeSingleLake(map, new map.Position(x, y));
    numLakes--;
  }
};

var makeSingleLake = function(map, pos) {
  var numPlops = Random.getRandom(12) + 2;

  while (numPlops > 0) {
    var plopPos = new map.Position(pos, Random.getRandom(12) - 6, Random.getRandom(12) - 6);

    if (Random.getRandom(4))
        plopSRiver(map, plopPos);
    else
        plopBRiver(map, plopPos);

    numPlops--;
  }
};


var treeSplash = function(map, x, y) {
  var numTrees;

  if (TERRAIN_TREE_LEVEL < 0)
    numTrees = Random.getRandom(150) + 50;
  else
    numTrees = Random.getRandom(100 + (TERRAIN_TREE_LEVEL * 2)) + 50;

  var treePos = new map.Position(x, y);

  while (numTrees > 0) {
    var dir = getRandomDirection();
    treePos.move(dir);

    // XXX Should use the fact that positions return success/failure for moves
    if (!map.testBounds(treePos.x, treePos.y))
      return;

    if (map.getTileValue(treePos) === DIRT)
      map.setTile(treePos, WOODS, BLBNBIT);

    numTrees--;
  }
};


var doTrees = function(map) {
  var amount;

  if (TERRAIN_TREE_LEVEL < 0)
    amount = Random.getRandom(100) + 50;
  else
    amount = TERRAIN_TREE_LEVEL + 3;

  for (var x = 0; x < amount; x++) {
      var xloc = Random.getRandom(map.width - 1);
      var yloc = Random.getRandom(map.height - 1);
      treeSplash(map, xloc, yloc);
  }

  smoothTrees(map);
  smoothTrees(map);
};


var riverEdges = [
  13 | BULLBIT, 13 | BULLBIT, 17 | BULLBIT, 15 | BULLBIT,
  5 | BULLBIT, 2, 19 | BULLBIT, 17 | BULLBIT,
  9 | BULLBIT, 11 | BULLBIT, 2, 13 | BULLBIT,
  7 | BULLBIT, 9 | BULLBIT, 5 | BULLBIT, 2];

var smoothRiver = function(map) {
  var dx = [-1,  0,  1,  0];
  var dy = [0,  1,  0, -1];

  for (var x = 0; x < map.width; x++) {
    for (var y = 0; y < map.height; y++) {
      if (map.getTileValue(x, y) === REDGE) {
        var bitIndex = 0;

        for (var z = 0; z < 4; z++) {
          bitIndex = bitIndex << 1;
          var xTemp = x + dx[z];
          var yTemp = y + dy[z];
          if (map.testBounds(xTemp, yTemp) &&
              map.getTileValue(xTemp, yTemp) !== DIRT &&
              (map.getTileValue(xTemp, yTemp) < WOODS_LOW ||
               map.getTileValue(xTemp, yTemp) > WOODS_HIGH)) {
            bitIndex++;
          }
        }

        var temp = riverEdges[bitIndex & 15];
        if (temp !== RIVER && Random.getRandom(1))
          temp++;

        map.setTileValue(x, y, temp, 0);
      }
    }
  }
};


var isTree = function(tileValue) {
  return tileValue >= WOODS_LOW && tileValue <= WOODS_HIGH;
};


var smoothTrees = function(map) {
  for (var x = 0; x < map.width; x++) {
    for (var y = 0; y < map.height; y++) {
      if (isTree(map.getTileValue(x, y)))
        smoothTreesAt(map, x, y, false);
    }
  }
};


var treeTable = [
  0,  0,  0,  34,
  0,  0,  36, 35,
  0,  32, 0,  33,
  30, 31, 29, 37];

var smoothTreesAt = function(map, x, y, preserve) {
  var dx = [-1,  0,  1,  0 ];
  var dy = [ 0,  1,  0, -1 ];
  if (!isTree(map.getTileValue(x, y)))
      return;

  var bitIndex = 0;
  for (var i = 0; i < 4; i++) {
    bitIndex = bitIndex << 1;
    var xTemp = x + dx[i];
    var yTemp = y + dy[i];
    if (map.testBounds(xTemp, yTemp) &&
        isTree(map.getTileValue(xTemp, yTemp)))
      bitIndex++;
  }

  var temp = treeTable[bitIndex & 15];
  if (temp) {
    if (temp !== WOODS) {
      if ((x + y) & 1)
          temp = temp - 8;
    }
    map.setTile(x, y, temp, BLBNBIT);
  } else {
    if (!preserve)
      map.setTileValue(x, y, temp, 0);
  }
};



var doRivers = function(map, terrainPos) {
  var riverDir = getRandomCardinalDirection();
  doBRiver(map, terrainPos, riverDir, riverDir);

  riverDir = riverDir.oppositeDirection();
  var terrainDir = doBRiver(map, terrainPos, riverDir, riverDir);

  riverDir = getRandomCardinalDirection();
  doSRiver(map, terrainPos, riverDir, terrainDir);
};


var doBRiver = function(map, riverPos, riverDir, terrainDir) {
  var rate1, rate2;

  if (TERRAIN_CURVE_LEVEL < 0) {
    rate1 = 100;
    rate2 = 200;
  } else {
    rate1 = TERRAIN_CURVE_LEVEL + 10;
    rate2 = TERRAIN_CURVE_LEVEL + 100;
  }

  var pos = new map.Position(riverPos);

  while (map.testBounds(pos.x + 4, pos.y + 4)) {
    plopBRiver(map, pos);
    if (Random.getRandom(rate1) < 10) {
      terrainDir = riverDir;
    } else {
      if (Random.getRandom(rate2) > 90)
        terrainDir = terrainDir.rotateClockwise();
      if (Random.getRandom(rate2) > 90)
        terrainDir = terrainDir.rotateCounterClockwise();
    }
    pos.move(terrainDir);
  }

  return terrainDir;
};


var doSRiver = function(map, riverPos, riverDir, terrainDir) {
  var rate1, rate2;

  if (TERRAIN_CURVE_LEVEL < 0) {
    rate1 = 100;
    rate2 = 200;
  } else {
    rate1 = TERRAIN_CURVE_LEVEL + 10;
    rate2 = TERRAIN_CURVE_LEVEL + 100;
  }

  var pos = new map.Position(riverPos);

  while (map.testBounds(pos.x + 3, pos.y + 3)) {
    plopSRiver(map, pos);
    if (Random.getRandom(rate1) < 10) {
      terrainDir = riverDir;
    } else {
      if (Random.getRandom(rate2) > 90)
        terrainDir = terrainDir.rotateClockwise();
      if (Random.getRandom(rate2) > 90)
        terrainDir = terrainDir.rotateCounterClockwise();
    }
    pos.move(terrainDir);
  }

  return terrainDir;
};


var putOnMap = function(map, newVal, x, y) {
  if (newVal === 0)
    return;

  if (!map.testBounds(x, y))
    return;

  var tileValue = map.getTileValue(x, y);

  if (tileValue !== DIRT) {
    if (tileValue === RIVER) {
      if (newVal !== CHANNEL)
          return;
    }
    if (tileValue === CHANNEL)
      return;
  }
  map.setTile(x, y, newVal, 0);
};


var plopBRiver = function(map, pos) {
  var BRMatrix = [
   [0, 0, 0, REDGE, REDGE, REDGE, 0, 0, 0],
   [0, 0, REDGE, RIVER, RIVER, RIVER, REDGE, 0, 0],
   [0, REDGE, RIVER, RIVER, RIVER, RIVER, RIVER, REDGE, 0],
   [REDGE, RIVER, RIVER, RIVER, RIVER, RIVER, RIVER, RIVER, REDGE],
   [REDGE, RIVER, RIVER, RIVER, CHANNEL, RIVER, RIVER, RIVER, REDGE],
   [REDGE, RIVER, RIVER, RIVER, RIVER, RIVER, RIVER, RIVER, REDGE],
   [0, REDGE, RIVER, RIVER, RIVER, RIVER, RIVER, REDGE, 0],
   [0, 0, REDGE, RIVER, RIVER, RIVER, REDGE, 0, 0],
   [0, 0, 0, REDGE, REDGE, REDGE, 0, 0, 0]];

  for (var x = 0; x < 9; x++) {
    for (var y = 0; y < 9; y++) {
      putOnMap(map, BRMatrix[y][x], pos.x + x, pos.y + y);
    }
  }
};


var plopSRiver = function(map, pos) {
  var SRMatrix = [
    [0, 0, REDGE, REDGE, 0, 0],
    [0, REDGE, RIVER, RIVER, REDGE, 0],
    [REDGE, RIVER, RIVER, RIVER, RIVER, REDGE],
    [REDGE, RIVER, RIVER, RIVER, RIVER, REDGE],
    [0, REDGE, RIVER, RIVER, REDGE, 0],
    [0, 0, REDGE, REDGE, 0, 0]];

  for (var x = 0; x < 6; x++) {
    for (var y = 0; y < 6; y++) {
      putOnMap(map, SRMatrix[y][x], pos.x + x, pos.y + y);
    }
  }
};


var smoothWater = function(map) {
  var x, y, tile, pos, dir;

  for (x = 0; x < map.width; x++) {
    for (y = 0; y < map.height; y++) {
      tile = map.getTileValue(x, y);

      if (tile >= WATER_LOW && tile <= WATER_HIGH) {
        pos = new map.Position(x, y);
        let stop = false;

        forEachCardinalDirection(dir => {
          if (stop) {
            return;
          }

          tile = map.getTileFromMap(pos, dir, WATER_LOW);

          /* If nearest object is not water: */
          if (tile < WATER_LOW || tile > WATER_HIGH) {
            map.setTileValue(x, y, REDGE, 0); /* set river edge */
            stop = true; // Continue with next tile
          }
        });
      }
    }
  }

  for (x = 0; x < map.width; x++) {
    for (y = 0; y < map.height; y++) {
      tile = map.getTileValue(x, y);

      if (tile !== CHANNEL && tile >= WATER_LOW && tile <= WATER_HIGH) {
        var makeRiver = true;

        pos = new map.Position(x, y);

        forEachCardinalDirection(dir => {
          if (!makeRiver) {
            return;
          }

          tile = map.getTileFromMap(pos, dir, WATER_LOW);

          if (tile < WATER_LOW || tile > WATER_HIGH) {
            makeRiver = false;
          }
        });

        if (makeRiver)
          map.setTileValue(x, y, RIVER, 0);
      }
    }
  }

  for (x = 0; x < map.width; x++) {
    for (y = 0; y < map.height; y++) {
      tile = map.getTileValue(x, y);

      if (tile >= WOODS_LOW && tile <= WOODS_HIGH) {
        pos = new map.Position(x, y);
        let stop = false;

        forEachCardinalDirection(dir => {
          if (stop) {
            return;
          }

          tile = map.getTileFromMap(pos, dir, TILE_INVALID);

          if (tile === RIVER || tile === CHANNEL) {
            map.setTileValue(x, y, REDGE, 0); /* make it water's edge */
            stop = true;
          }
        });
      }
    }
  }
};


export { MapGenerator };
