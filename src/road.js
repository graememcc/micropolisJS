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

import { Random } from './random.ts';
import { Tile } from "./tile.ts";
import { ANIMBIT, BIT_MASK, BULLBIT } from "./tileFlags.ts";
import * as TileValues from "./tileValues.ts";
import { TileUtils } from './tileUtils.js';

var openBridge = function(map, origX, origY, xDelta, yDelta, oldTiles, newTiles) {
  for (var i = 0; i < 7; i++) {
    var x = origX + xDelta[i];
    var y = origY + yDelta[i];

    if (map.testBounds(x, y)) {
      if (map.getTileValue(x, y) === (oldTiles[i] & BIT_MASK))
        map.setTileValue(x, y, newTiles[i]);
    }
  }
};


var closeBridge = function(map, origX, origY, xDelta, yDelta, oldTiles, newTiles) {
  for (var i = 0; i < 7; i++) {
    var x = origX + xDelta[i];
    var y = origY + yDelta[i];

    if (map.testBounds(x, y)) {
      var tileValue = map.getTileValue(x, y);
      if (tileValue === TileValues.CHANNEL || (tileValue & 15) === (oldTiles[i] & 15))
        map.setTileValue(x, y, newTiles[i]);
    }
  }
};


var verticalDeltaX = [0,  1,  0,  0,  0,  0,  1];
var verticalDeltaY = [-2, -2, -1,  0,  1,  2,  2];
var openVertical = [
      TileValues.VBRDG0 | BULLBIT, TileValues.VBRDG1 | BULLBIT,
      TileValues.RIVER, TileValues.BRWV | BULLBIT,
      TileValues.RIVER, TileValues.VBRDG2 | BULLBIT, TileValues.VBRDG3 | BULLBIT];
var closeVertical = [
      TileValues.VBRIDGE | BULLBIT, TileValues.RIVER, TileValues.VBRIDGE | BULLBIT,
      TileValues.VBRIDGE | BULLBIT, TileValues.VBRIDGE | BULLBIT,
      TileValues.VBRIDGE | BULLBIT, TileValues.RIVER];
var horizontalDeltaX = [-2,  2, -2, -1,  0,  1,  2];
var horizontalDeltaY = [ -1, -1,  0,  0,  0,  0,  0];
var openHorizontal = [
    TileValues.HBRDG1 | BULLBIT, TileValues.HBRDG3 | BULLBIT,
    TileValues.HBRDG0 | BULLBIT, TileValues.RIVER, TileValues.BRWH | BULLBIT,
    TileValues.RIVER, TileValues.HBRDG2 | BULLBIT
];
var closeHorizontal = [
    TileValues.RIVER, TileValues.RIVER, TileValues.HBRIDGE | BULLBIT,
    TileValues.HBRIDGE | BULLBIT, TileValues.HBRIDGE | BULLBIT,
    TileValues.HBRIDGE | BULLBIT, TileValues.HBRIDGE | BULLBIT
];


var doBridge = function(map, x, y, currentTile, simData) {
  if (currentTile === TileValues.BRWV) {
    // We have an open vertical bridge. Possibly close it.
    if (Random.getChance(3) && simData.spriteManager.getBoatDistance(x, y) > 340)
      closeBridge(map, x, y, verticalDeltaX, verticalDeltaY, openVertical, closeVertical);

    return true;
  }

  if (currentTile == TileValues.BRWH) {
    // We have an open horizontal bridge. Possibly close it.
    if (Random.getChance(3) && simData.spriteManager.getBoatDistance(x, y) > 340)
      closeBridge(map, x, y, horizontalDeltaX, horizontalDeltaY, openHorizontal, closeHorizontal);

    return true;
  }

  if (simData.spriteManager.getBoatDistance(x, y) < 300 || Random.getChance(7)) {
    if (currentTile & 1) {
      if (x < map.width - 1) {
        if (map.getTileValue(x + 1, y) === TileValues.CHANNEL) {
          // We have a closed vertical bridge. Open it.
          openBridge(map, x, y, verticalDeltaX, verticalDeltaY, closeVertical, openVertical);
          return true;
        }
      }
      return false;
    } else {
      if (y > 0) {
        if (map.getTileValue(x, y - 1) === TileValues.CHANNEL) {
          // We have a closed horizontal bridge. Open it.
          openBridge(map, x, y, horizontalDeltaX, horizontalDeltaY, closeHorizontal, openHorizontal);
          return true;
        }
      }
    }
  }

  return false;
};


var densityTable = [TileValues.ROADBASE, TileValues.LTRFBASE, TileValues.HTRFBASE];

var roadFound = function(map, x, y, simData) {
  simData.census.roadTotal += 1;

  var currentTile = map.getTile(x, y);
  var tileValue = currentTile.getValue();

  if (simData.budget.shouldDegradeRoad()) {
    if (Random.getChance(511)) {
      currentTile = map.getTile(x, y);

      // Don't degrade tiles with power lines
      if (!currentTile.isConductive()) {
        if (simData.budget.roadEffect < (Random.getRandom16() & 31)) {
          var mapValue = currentTile.getValue();

          // Replace bridge tiles with water, otherwise rubble
          if ((tileValue & 15) < 2 || (tileValue & 15) === 15)
            map.setTile(x, y, TileValues.RIVER, 0);
          else
            map.setTo(x, y, TileUtils.randomRubble());

          return;
        }
      }
    }
  }

  // Bridges are not combustible
  if (!currentTile.isCombustible()) {
    // The comment in the original Micropolis code states bridges count for 4
    // However, with the increment above, it's actually 5. Bug?
    simData.census.roadTotal += 4;
    if (doBridge(map, x, y, tileValue, simData))
      return;
  }

  // Examine traffic density, and modify tile to represent last scanned traffic
  // density
  var density = 0;
  if (tileValue < TileValues.LTRFBASE) {
    density = 0;
  } else if (tileValue < TileValues.HTRFBASE) {
    density = 1;
  } else {
    // Heavy traffic counts as two tiles with regards to upkeep cost
    // Note, if this is heavy traffic on a bridge, and it wasn't handled above,
    // it actually counts for 7 road tiles
    simData.census.roadTotal += 1;
    density = 2;
  }

  // Force currentDensity in range 0-3 (trafficDensityMap values are capped at 240)
  var currentDensity = simData.blockMaps.trafficDensityMap.worldGet(x, y) >> 6;
  if (currentDensity > 1)
    currentDensity -= 1;

  if (currentDensity === density)
    return;

  var newValue = ((tileValue - TileValues.ROADBASE) & 15) + densityTable[currentDensity];
  // Preserve all bits except animation
  var newFlags = currentTile.getFlags() & ~ANIMBIT;
  if (currentDensity > 0)
   newFlags |= ANIMBIT;

  map.setTo(x, y, new Tile(newValue, newFlags));
};


var Road = {
  registerHandlers: function(mapScanner, repairManager) {
    mapScanner.addAction(TileUtils.isRoad, roadFound);
  }
};


export { Road };
