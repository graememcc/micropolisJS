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


  // Commercial tiles have 'populations' from 1 to 5,
  // and value from 0 to 3. The tiles are laid out in
  // increasing order of land value, cycling through
  // each population value
  var getZonePopulation = function(map, x, y, tileValue) {
    if (tileValue instanceof Tile)
      tileValue = tile.getValue();

    if (tileValue === Tile.COMCLEAR)
      return 0;

    return Math.floor((tileValue - Tile.CZB) / 9) % 5 + 1;
  };


  var placeCommercial = function(map, x, y, population, lpValue, zonePower) {
    var centreTile = ((lpValue * 5) + population) * 9 + Tile.CZB;
    ZoneUtils.putZone(map, x, y, centreTile, zonePower);
  };


  var doMigrationIn = function(map, x, y, blockMaps, population, lpValue, zonePower) {
    var landValue = blockMaps.landValueMap.worldGet(x, y);
    landValue = landValue >> 5;

    if (population > landValue)
      return;

    // Desirable zone: migrate
    if (population < 5) {
      placeCommercial(map, x, y, population, lpValue, zonePower);
      ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
    }
  };


  var doMigrationOut = function(map, x, y, blockMaps, population, lpValue, zonePower) {
    if (population > 1) {
      placeCommercial(map, x, y, population - 2, lpValue, zonePower);
      ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
      return;
    }

    if (population === 1) {
      ZoneUtils.putZone(map, x, y, Tile.COMCLR, zonePower);
      ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
    }
  };


  var evalCommercial = function(blockMaps, x, y, traffic) {
    if (traffic === Traffic.NO_ROAD_FOUND)
      return -3000;

    var cityCentreDistScore = blockMaps.cityCentreDistScoreMap.worldGet(x, y);
    return cityCentreDistScore;
  };


  var commercialFound = function(map, x, y, simData) {
    var lpValue;

    simData.census.comZonePop += 1;
    var tileValue = map.getTileValue(x, y);
    var tilePop = getZonePopulation(map, x, y, tileValue);
    simData.census.comPop += tilePop;
    var zonePower = map.getTile(x, y).isPowered();

    var trafficOK = Traffic.ROUTE_FOUND;
    if (tilePop > Random.getRandom(5)) {
      // Try driving from commercial to industrial
      trafficOK = simData.trafficManager.makeTraffic(x, y, simData.blockMaps, TileUtils.isIndustrial);

      // Trigger outward migration if not connected to road network
      if (trafficOK ===  Traffic.NO_ROAD_FOUND) {
          lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
          doMigrationOut(map, x, y, simData.blockMaps, tilePop, lpValue, zonePower);
          return;
      }
    }

    // Occasionally assess and perhaps modify the tile
    if (Random.getChance(7)) {
      var locationScore = evalCommercial(simData.blockMaps, x, y, trafficOK);
      var zoneScore = simData.valves.comValve + locationScore;

      if (!zonePower)
        zoneScore = -500;

      if (trafficOK && (zoneScore > -350) &&
          ((zoneScore - 26380) > Random.getRandom16Signed())) {
        lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
        doMigrationIn(map, x, y, simData.blockMaps, tilePop, lpValue, zonePower);
        return;
      }

      if (zoneScore < 350 &&
          ((zoneScore + 26380) < Random.getRandom16Signed())) {
        lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
        doMigrationOut(map, x, y, simData.blockMaps, tilePop, lpValue, zonePower);
      }
    }
  };


  var Commercial = {
    registerHandlers: function(mapScanner, repairManager) {
      mapScanner.addAction(TileUtils.isCommercialZone, commercialFound);
    },
    getZonePopulation: getZonePopulation
  };


  return Commercial;
});
