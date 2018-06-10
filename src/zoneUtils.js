/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { MiscUtils } from './miscUtils';
import { Tile } from './tile';
import * as TileValues from "./tileValues";

var checkBigZone = function(tileValue) {
  var result;

  switch (tileValue) {

    case TileValues.POWERPLANT:
    case TileValues.PORT:
    case TileValues.NUCLEAR:
    case TileValues.STADIUM:
      result = {zoneSize: 4, deltaX: 0, deltaY: 0};
      break;

    case TileValues.POWERPLANT + 1:
    case TileValues.COALSMOKE3:
    case TileValues.COALSMOKE3 + 1:
    case TileValues.COALSMOKE3 + 2:
    case TileValues.PORT + 1:
    case TileValues.NUCLEAR + 1:
    case TileValues.STADIUM + 1:
      result = {zoneSize: 4, deltaX: -1, deltaY: 0};
      break;

    case TileValues.POWERPLANT + 4:
    case TileValues.PORT + 4:
    case TileValues.NUCLEAR + 4:
    case TileValues.STADIUM + 4:
      result = {zoneSize: 4, deltaX: 0, deltaY: -1};
      break;

    case TileValues.POWERPLANT + 5:
    case TileValues.PORT + 5:
    case TileValues.NUCLEAR + 5:
    case TileValues.STADIUM + 5:
      result = {zoneSize: 4, deltaX: -1, deltaY: -1};
      break;

    case TileValues.AIRPORT:
      result = {zoneSize: 6, deltaX: 0, deltaY: 0};
      break;

    case TileValues.AIRPORT + 1:
      result = {zoneSize: 6, deltaX: -1, deltaY: 0};
      break;

    case TileValues.AIRPORT + 2:
      result = {zoneSize: 6, deltaX: -2, deltaY: 0};
      break;

    case TileValues.AIRPORT + 3:
      result = {zoneSize: 6, deltaX: -3, deltaY: 0};
      break;

    case TileValues.AIRPORT + 6:
      result = {zoneSize: 6, deltaX: 0, deltaY: -1};
      break;

    case TileValues.AIRPORT + 7:
      result = {zoneSize: 6, deltaX: -1, deltaY: -1};
      break;

    case TileValues.AIRPORT + 8:
      result = {zoneSize: 6, deltaX: -2, deltaY: -1};
      break;

    case TileValues.AIRPORT + 9:
      result = {zoneSize: 6, deltaX: -3, deltaY: -1};
      break;

    case TileValues.AIRPORT + 12:
      result = {zoneSize: 6, deltaX: 0, deltaY: -2};
      break;

    case TileValues.AIRPORT + 13:
      result = {zoneSize: 6, deltaX: -1, deltaY: -2};
      break;

    case TileValues.AIRPORT + 14:
      result = {zoneSize: 6, deltaX: -2, deltaY: -2};
      break;

    case TileValues.AIRPORT + 15:
      result = {zoneSize: 6, deltaX: -3, deltaY: -2};
      break;

    case TileValues.AIRPORT + 18:
      result = {zoneSize: 6, deltaX: 0, deltaY: -3};
      break;

    case TileValues.AIRPORT + 19:
      result = {zoneSize: 6, deltaX: -1, deltaY: -3};
      break;

    case TileValues.AIRPORT + 20:
      result = {zoneSize: 6, deltaX: -2, deltaY: -3};
      break;

    case TileValues.AIRPORT + 21:
      result = {zoneSize: 6, deltaX: -3, deltaY: -3};
      break;

    default:
      result = {zoneSize: 0, deltaX: 0, deltaY: 0};
      break;
  }

  return result;
};


var checkZoneSize = function(tileValue) {
  if ((tileValue >= TileValues.RESBASE - 1        && tileValue <= TileValues.PORTBASE - 1) ||
      (tileValue >= TileValues.LASTPOWERPLANT + 1 && tileValue <= TileValues.POLICESTATION + 4) ||
      (tileValue >= TileValues.CHURCH1BASE && tileValue <= TileValues.CHURCH7LAST)) {
    return 3;
  }

  if ((tileValue >= TileValues.PORTBASE    && tileValue <= TileValues.LASTPORT) ||
      (tileValue >= TileValues.COALBASE    && tileValue <= TileValues.LASTPOWERPLANT) ||
      (tileValue >= TileValues.STADIUMBASE && tileValue <= TileValues.LASTZONE)) {
    return 4;
  }

  return 0;
};


var fireZone = function(map, x, y, blockMaps) {
  var tileValue = map.getTileValue(x, y);
  var zoneSize = 2;

  // A zone being on fire naturally hurts growth
  var value = blockMaps.rateOfGrowthMap.worldGet(x, y);
  value = MiscUtils.clamp(value - 20, -200, 200);
  blockMaps.rateOfGrowthMap.worldSet(x, y, value);

  if (tileValue === TileValues.AIRPORT)
    zoneSize = 5;
  else if (tileValue >= TileValues.PORTBASE)
    zoneSize = 3;
  else if (tileValue < TileValues.PORTBASE)
      zoneSize = 2;

  // Make remaining tiles of the zone bulldozable
  for (var xDelta = -1; xDelta < zoneSize; xDelta++) {
    for (var yDelta = -1; yDelta < zoneSize; yDelta++) {
      var xTem = x + xDelta;
      var yTem = y + yDelta;

      if (!map.testBounds(xTem, yTem))
        continue;

      if (map.getTileValue(xTem, yTem >= TileValues.ROADBASE))
        map.addTileFlags(xTem, yTem, Tile.BULLBIT);
    }
  }
};


var getLandPollutionValue = function(blockMaps, x, y) {
  var landValue = blockMaps.landValueMap.worldGet(x, y);
  landValue -= blockMaps.pollutionDensityMap.worldGet(x, y);

  if (landValue < 30)
    return 0;
  if (landValue < 80)
    return 1;
  if (landValue < 150)
    return 2;

  return 3;
};


var incRateOfGrowth = function(blockMaps, x, y, growthDelta) {
  var currentRate = blockMaps.rateOfGrowthMap.worldGet(x, y);
  // TODO why the scale of 4 here
  var newValue = MiscUtils.clamp(currentRate + growthDelta * 4, -200, 200);
  blockMaps.rateOfGrowthMap.worldSet(x, y, newValue);
};


// Calls map.putZone after first checking for flood, fire
// and radiation. Should be called with coordinates of centre tile.
var putZone = function(map, x, y, centreTile, isPowered) {
  for (var dY = -1; dY < 2; dY++) {
    for (var dX = -1; dX < 2; dX++) {
      var tileValue = map.getTileValue(x + dX, y + dY);
      if (tileValue >= TileValues.FLOOD && tileValue < TileValues.ROADBASE)
        return;
    }
  }
  map.putZone(x, y, centreTile, 3);
  map.addTileFlags(x, y, Tile.BULLBIT);
  if (isPowered)
    map.addTileFlags(x, y, Tile.POWERBIT);
};


var ZoneUtils = {
  checkBigZone: checkBigZone,
  checkZoneSize: checkZoneSize,
  fireZone: fireZone,
  getLandPollutionValue: getLandPollutionValue,
  incRateOfGrowth: incRateOfGrowth,
  putZone: putZone
};


export { ZoneUtils };
