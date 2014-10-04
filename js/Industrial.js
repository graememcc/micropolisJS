/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Random', 'Tile', 'TileUtils', 'Traffic', 'ZoneUtils'],
       function(Random, Tile, TileUtils, Traffic, ZoneUtils) {
  "use strict";


  // There are 8 types of industrial zone aside from the empty zone. They are categorized by population and value.
  // There are 4 levels of population (1-4), and 2 levels of value.
  //
  // Population level 1/low value corresponds to the 9 tiles starting at tile 621. This is followed by the tiles
  // for population level 2/low value, and so on.


  // Given the centre of an industrial zone, compute it's population level (a number in the range 0-4)
  var getZonePopulation = function(map, x, y, tileValue) {
    if (tileValue === Tile.INDCLR)
      return 0;

    return Math.floor((tileValue - Tile.IZB) / 9) % 4 + 1;
  };


  // Takes a map and coordinates, a population category in the range 1-4, a value category in the range 0-1, and places
  // the appropriate industrial zone on the map
  var placeIndustrial = function(map, x, y, populationCategory, valueCategory, zonePower) {
    var centreTile = ((valueCategory * 4) + populationCategory) * 9 + Tile.IZB;
    ZoneUtils.putZone(map, x, y, centreTile, zonePower);
  };


  var growZone = function(map, x, y, blockMaps, population, valueCategory, zonePower) {
    // Switch to the next category of zone
    if (population < 4) {
      placeIndustrial(map, x, y, population, valueCategory, zonePower);
      ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
    }
  };


  var degradeZone = function(map, x, y, blockMaps, populationCategory, valueCategory, zonePower) {
    // Note that we special case empty zones here, rather than having to check population value on every
    // call to placeIndustrial (which we anticipate will be called more often)
    if (populationCategory > 1)
      placeIndustrial(map, x, y, populationCategory - 2, valueCategory, zonePower);
    else
      ZoneUtils.putZone(map, x, y, Tile.INDCLR, zonePower);

    ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
  };


  var animated = [true, false, true, true, false, false, true, true];
  var xDelta = [-1, 0, 1, 0, 0, 0, 0, 1];
  var yDelta = [-1, 0, -1, -1, 0, 0, -1, -1];


  // Takes a map and coordinates, the tile value of the centre of the zone, and a boolean indicating whether
  // the zone has power, and sets or unsets the animation bit in the appropriate part of the zone
  var setAnimation = function(map, x, y, tileValue, isPowered) {
    // The empty zone is not animated
    if (tileValue < Tile.IZB)
      return;

    // There are only 8 different types of populated industrial zones. We always have tileValue - IZB < 8x9 (=72),
    // so (tileValue - IZB) >> 3 effectively divides (tileValue - IZB) by 9, forcing into the range 0-7
    var i = (tileValue - Tile.IZB) >> 3;

    // If the tile is animated and powered we set animated, conductive, combustible. Otherwise we set burnable and
    // conductive.
    if (animated[i] && isPowered) {
      map.addTileFlags(x + xDelta[i], y + yDelta[i], Tile.ASCBIT);
    } else {
      map.addTileFlags(x + xDelta[i], y + yDelta[i], Tile.BNCNBIT);

      // Ensure we drop the animation bit if we've only recently lost power
      map.removeTileFlags(x + xDelta[i], y + yDelta[i], Tile.ANIMBIT);
    }
  };


  // Called by the map scanner when it finds the centre of an industrial zone
  var industrialFound = function(map, x, y, simData) {
    // Notify the census
    simData.census.indZonePop += 1;

    // Calculate the population level for this tile, and add to census
    var tileValue = map.getTileValue(x, y);
    var population = getZonePopulation(map, x, y, tileValue);
    simData.census.indPop += population;

    // Set animation bit if appropriate
    var zonePower = map.getTile(x, y).isPowered();
    setAnimation(map, x, y, tileValue, zonePower);

    // Occasionally check to see if the zone is connected to the transport network (the chance of this happening
    // increases as the population increases). Growth naturally stalls if workers cannot reach the factories.
    // Note in particular, we will never take this branch if the zone is empty.
    var trafficOK = Traffic.ROUTE_FOUND;
    if (population > Random.getRandom(5)) {
      // Try to find a route from here to a residential zone
      trafficOK = simData.trafficManager.makeTraffic(x, y, simData.blockMaps, TileUtils.isResidential);

      // Trigger outward migration if not connected to road network (unless the zone is already empty)
      if (trafficOK === Traffic.NO_ROAD_FOUND) {
        var newValue = Random.getRandom16() & 1;
        degradeZone(map, x, y, simData.blockMaps, population, newValue, zonePower);
        return;
      }
    }

    // Occasionally assess and perhaps modify the tile
    if (Random.getChance(7)) {
      var zoneScore = simData.valves.indValve + (trafficOK === Traffic.NO_ROAD_FOUND ? -1000 : 0);

      // Unpowered zones should of course be penalized
      if (!zonePower)
        zoneScore = -500;

      // The industrial demand valve has range -1500 to 1500, so taking into account the "no traffic" and
      // "no power" modifiers above, zoneScore must lie in the range -3000 - 1500

      // First: observe that if there are no roads we will never take this branch, as zoneScore will be <= -1000.
      // Given the comment above about ranges for zoneScore, zoneScore - 26380, will be in the range -26729 to -24880.
      // getRandom16() has a range of 65536 possible numbers, in the range -32768 to 32767.
      // Of those, 9.2% will always be below zoneScore and hence will always take this branch and trigger zone growth.
      // 87.9% of them are above -24880, so nearly 88% of the time, we will never take this branch.
      // Thus, there's approximately a 2.9% chance that the value will be in the range, and we *might* grow.
      // This has the nice effect of not preventing an individual unit from growing even if overall demand has collapsed
      // (the business itself might still be growing.
      if (zoneScore > -350 && (zoneScore - 26380) > Random.getRandom16Signed()) {
        growZone(map, x, y, simData.blockMaps, population, Random.getRandom16() & 1, zonePower);
        return;
      }

      // Again, given the  above, zoneScore + 26380 must lie in the range 23380 - 27880.
      // There is a 7.4% chance of getRandom16() always yielding a number > 27880 which would take this branch.
      // There is a 85.6% chance of the number being below 23380 thus never triggering this branch, which leaves a
      // 9% chance of this branch being conditional on zoneScore.
      if (zoneScore < 350 && (zoneScore + 26380) < Random.getRandom16Signed())
        degradeZone(map, x, y, simData.blockMaps, population, Random.getRandom16() & 1, zonePower);
    }
  };


  var Industrial = {
    registerHandlers: function(mapScanner, repairManager) {
      mapScanner.addAction(TileUtils.isIndustrialZone, industrialFound);
    },
    getZonePopulation: getZonePopulation
  };


  return Industrial;
});
