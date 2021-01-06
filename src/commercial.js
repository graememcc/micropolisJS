/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Random } from './random';
import { Tile } from './tile';
import { TileUtils } from './tileUtils';
import { Traffic } from './traffic';
import { ZoneUtils } from './zoneUtils';

// There are 20 types of commercial zone aside from the empty zone. They reflect 5 different categories of
// population, and 4 grades of land value/pollution. Population value 1/low value corresponds to the 9 tiles
// starting at 428, population value 2/low follows at 437, and so on.


// Given the centre of a commercial zone, compute it's population level (a number in the range 0-5)
var getZonePopulation = function(map, x, y, tileValue) {
  if (tileValue === Tile.COMCLEAR)
    return 0;

  return Math.floor((tileValue - Tile.CZB) / 9) % 5 + 1;
};


// Takes a map and coordinates, a population category in the range 1-5, a value category in the range 0-3, and places
// the appropriate industrial zone on the map
var placeCommercial = function(map, x, y, population, lpValue, zonePower, zoneIrrigate) {
  var centreTile = ((lpValue * 5) + population) * 9 + Tile.CZB;
  ZoneUtils.putZone(map, x, y, centreTile, zonePower, zoneIrrigate);
};


var growZone = function(map, x, y, blockMaps, population, lpValue, zonePower, zoneIrrigate) {
  // landValueMap contains values in the range 0-250, representing the desirability of the land.
  // Thus, after shifting, landValue will be in the range 0-7.
  var landValue = blockMaps.landValueMap.worldGet(x, y);
  landValue = landValue >> 5;

  if (population > landValue)
    return;

  // This zone is desirable, and seemingly not to crowded. Switch to the next category of zone.
  if (population < 5) {
    placeCommercial(map, x, y, population, lpValue, zonePower, zoneIrrigate);
    ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
  }
};


var degradeZone = function(map, x, y, blockMaps, populationCategory, lpCategory, zonePower, zoneIrrigate) {
  // Note that we special case empty zones here, rather than having to check population value on every
  // call to placeIndustrial (which we anticipate will be called more often)
  if (populationCategory > 1) {
    placeCommercial(map, x, y, populationCategory - 2, lpCategory, zonePower, zoneIrrigate);
  } else {
    ZoneUtils.putZone(map, x, y, Tile.COMCLR, zonePower, zoneIrrigate);
  }

  ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
};


// Called by the map scanner when it finds the centre of an commercial zone
var commercialFound = function(map, x, y, simData) {
  // lpValue will be filled if we actually decide to trigger growth/decay. It will be an index of the land/pollution
  // value in the range 0-3
  var lpValue;

  // Notify the census
  simData.census.comZonePop += 1;

  // Calculate the population level for this tile, and add to census
  var tileValue = map.getTileValue(x, y);
  var population = getZonePopulation(map, x, y, tileValue);
  simData.census.comPop += population;

  var zonePower = map.getTile(x, y).isPowered();
  var zoneIrrigate = map.getTile(x, y).isIrrigated();

  // Occasionally check to see if the zone is connected to the transport network (the chance of this happening
  // increases as the population increases). Growth naturally stalls if consumers cannot reach the shops.
  // Note in particular, we will never take this branch if the zone is empty.
  var trafficOK = Traffic.ROUTE_FOUND;
  if (population > Random.getRandom(5)) {
    // Try to find a route from here to an industrial zone
    trafficOK = simData.trafficManager.makeTraffic(x, y, simData.blockMaps, TileUtils.isIndustrial);

    // Trigger outward migration if not connected to road network
    if (trafficOK === Traffic.NO_ROAD_FOUND) {
      lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
      degradeZone(map, x, y, simData.blockMaps, population, lpValue, zonePower, zoneIrrigate);
      return;
    }
  }

  // Occasionally assess and perhaps modify the tile
  if (Random.getChance(7)) {
    var locationScore = trafficOK === Traffic.NO_ROAD_FOUND ? -3000 :
                        simData.blockMaps.cityCentreDistScoreMap.worldGet(x, y);
    var zoneScore = simData.valves.comValve + locationScore;

    // Unpowered zones should of course be penalized
    if (!zonePower)
      zoneScore = -500;

    // The commercial demand valve has range -1500 to 1500, so taking into account the "no traffic" and
    // "no power" modifiers above, zoneScore must lie in the range -5064 - 1564. (The comRateMap, which scores
    // commercial neighbourhoods based on their distance from the city centre, has range -64 to 64).

    // First: observe that if there are no roads we will never take this branch, as zoneScore will be <= -3000.
    // Given the comment above about ranges for zoneScore, zoneScore - 26380, will be in the range -26729 to -24816.
    // getRandom16() has a range of 65536 possible numbers, in the range -32768 to 32767.
    // Of those, 9.2% will always be below zoneScore and hence will always take this branch and trigger zone growth.
    // 87.8% of them are above -24816, so nearly 88% of the time, we will never take this branch.
    // Thus, there's approximately a 3% chance that the value will be in the range, and we *might* grow.
    // This has the nice effect of not preventing an individual unit from growing even if overall demand has collapsed
    // (the business itself might still be growing.
    if (zonePower && zoneScore > -350 && (zoneScore - 26380) > Random.getRandom16Signed()) {
      lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
      growZone(map, x, y, simData.blockMaps, population, lpValue, zonePower, zoneIrrigate);
      return;
    }

    // Again, given the  above, zoneScore + 26380 must lie in the range 21316 - 27944.
    // There is a 7.3% chance of getRandom16() always yielding a number > 27994 which would take this branch.
    // There is a 82.5% chance of the number being below 21316 thus never triggering this branch, which leaves a
    // 10.1% chance of this branch being conditional on zoneScore.
    if (zoneScore < 350 && (zoneScore + 26380) < Random.getRandom16Signed()) {
      lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
      degradeZone(map, x, y, simData.blockMaps, population, lpValue, zonePower, zoneIrrigate);
    }
  }
};


var Commercial = {
  registerHandlers: function(mapScanner, repairManager) {
    mapScanner.addAction(TileUtils.isCommercialZone, commercialFound);
  },
  getZonePopulation: getZonePopulation
};


export { Commercial };
