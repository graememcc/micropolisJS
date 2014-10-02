/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['BlockMap', 'Commercial', 'Industrial', 'MiscUtils', 'Random', 'Residential', 'Tile'],
       function(BlockMap, Commercial, Industrial, MiscUtils, Random, Residential, Tile) {
  "use strict";


  // Smoothing styles for map smoothing
  var SMOOTH_NEIGHBOURS_THEN_BLOCK = 0;
  var SMOOTH_ALL_THEN_CLAMP = 1;


  // Smooth the map src into dest. The way in which the map is smoothed depends on the value of smoothStyle.
  // The meanings are as follows:
  //
  // SMOOTH_NEIGHBOURS_THEN_BLOCK
  // ============================
  // For each square in src, sum the values of its immediate neighbours, and take the average, then take the average of
  // that result and the square's value. This result is the new value of the square in dest.
  //
  // SMOOTH_ALL_THEN_CLAMP
  // =====================
  // For each square in src, sum the values of that square and it's four immediate neighbours, and take an average
  // rounding down. Clamp the resulting value in the range 0-255. This clamped value is the square's new value in dest.
  var smoothMap = function(src, dest, smoothStyle) {
    for (var x = 0, width = src.width; x < width; x++) {
      for (var y = 0, height = src.height; y < height; y++) {
        var edges = 0;

        if (x > 0)
          edges += src.get(x - 1, y);

        if (x < src.width - 1)
          edges += src.get(x + 1, y);

        if (y > 0)
          edges += src.get(x, y - 1);

        if (y < src.height - 1)
          edges += src.get(x, y + 1);

        if (smoothStyle === SMOOTH_NEIGHBOURS_THEN_BLOCK) {
          edges = src.get(x, y) + Math.floor(edges / 4);
          dest.set(x, y, Math.floor(edges/2));
        } else {
          edges = (edges + src.get(x, y)) >> 2;
          if (edges > 255)
            edges = 255;
          dest.set(x, y, edges);
        }
      }
    }
  };


  // Over time, the rate of growth of a neighbourhood should trend towards zero (stable)
  var neutraliseRateOfGrowthMap = function(blockMaps) {
    var rateOfGrowthMap = blockMaps.rateOfGrowthMap;
    for (var x = 0, width = rateOfGrowthMap.width; x < width; x++) {
      for (var y = 0, height = rateOfGrowthMap.height; y < height; y++) {
        var rate = rateOfGrowthMap.get(x, y);
        if (rate === 0)
          continue;

        if (rate > 0)
          rate--;
        else
          rate++;

        rate = MiscUtils.clamp(rate, -200, 200);
        rateOfGrowthMap.set(x, y, rate);
      }
    }
  };


  var decTrafficMap = function(blockMaps) {
    var trafficDensityMap = blockMaps.trafficDensityMap;

    for (var x = 0; x < trafficDensityMap.gameMapWidth; x += trafficDensityMap.blockSize) {
      for (var y = 0; y < trafficDensityMap.gameMapHeight; y += trafficDensityMap.blockSize) {
        var trafficDensity = trafficDensityMap.worldGet(x, y);
        if (trafficDensity === 0)
          continue;

        if (trafficDensity <= 24) {
          trafficDensityMap.worldSet(x, y, 0);
          continue;
        }

        if (trafficDensity > 200)
          trafficDensityMap.worldSet(x, y, trafficDensity - 34);
        else
          trafficDensityMap.worldSet(x, y, trafficDensity - 24);
      }
    }
  };


  var getPollutionValue = function(tileValue) {
    if (tileValue < Tile.POWERBASE) {
      if (tileValue >= Tile.HTRFBASE)
        return 75;

      if (tileValue >= Tile.LTRFBASE)
        return 50;

      if (tileValue <  Tile.ROADBASE) {
        if (tileValue > Tile.FIREBASE)
          return 90;

        if (tileValue >= Tile.RADTILE)
          return 255;
      }

      return 0;
    }

    if (tileValue <= Tile.LASTIND)
      return 0;

    if (tileValue < Tile.PORTBASE)
      return 50;

    if (tileValue <= Tile.LASTPOWERPLANT)
        return 100;

    return 0;
  };


  var getCityCentreDistance = function(map, x, y) {
    var xDis, yDis;

    if (x > map.cityCentreX)
      xDis = x - map.cityCentreX;
    else
      xDis = map.cityCentreX - x;

    if (y > map.cityCentreY)
      yDis = y - map.cityCentreY;
    else
      yDis = map.cityCentreY - y;

    return Math.min(xDis + yDis, 64);
  };


  var pollutionTerrainLandValueScan = function(map, census, blockMaps) {
    var tempMap1 = blockMaps.tempMap1;
    var tempMap2 = blockMaps.tempMap2;
    var tempMap3 = blockMaps.tempMap3;
    var landValueMap = blockMaps.landValueMap;
    var terrainDensityMap = blockMaps.terrainDensityMap;
    var pollutionDensityMap = blockMaps.pollutionDensityMap;
    var crimeRateMap = blockMaps.crimeRateMap;
    var x, y;

    // tempMap3 is a map of development density, smoothed into terrainMap.
    tempMap3.clear();

    var totalLandValue = 0;
    var numLandValueTiles = 0;

    for (x = 0; x < landValueMap.width; x++) {
      for (y = 0; y < landValueMap.height; y++) {
        var pollutionLevel = 0;
        var developed = false;
        var worldX = x * 2;
        var worldY = y * 2;

        for (var mapX = worldX; mapX <= worldX + 1; mapX++) {
          for (var mapY = worldY; mapY <= worldY + 1; mapY++) {
            var tileValue = map.getTileValue(mapX, mapY);
            if (tileValue > Tile.DIRT) {
              if (tileValue < Tile.RUBBLE) {
                // Undeveloped land: record in tempMap3
                var value = tempMap3.get(x >> 1, y >> 1);
                tempMap3.set(x >> 1, y >> 1, value + 15);
                continue;
              }

              pollutionLevel += getPollutionValue(tileValue);
              if (tileValue >= Tile.ROADBASE) {
                developed = true;
              }
            }
          }
        }

        pollutionLevel = Math.min(pollutionLevel, 255);
        tempMap1.set(x, y, pollutionLevel);

        if (developed) {
          var dis = 34 - Math.floor(getCityCentreDistance(map, worldX, worldY) / 2);
          dis = dis << 2;
          dis += terrainDensityMap.get(x >> 1, y >> 1);
          dis -= pollutionDensityMap.get(x, y);
          if (crimeRateMap.get(x, y) > 190) {
            dis -= 20;
          }
          dis = MiscUtils.clamp(dis, 1, 250);
          landValueMap.set(x, y, dis);
          totalLandValue += dis;
          numLandValueTiles++;
        } else {
          landValueMap.set(x, y, 0);
        }
      }
    }

    if (numLandValueTiles > 0)
      census.landValueAverage = Math.floor(totalLandValue / numLandValueTiles);
    else
      census.landValueAverage = 0;

    smoothMap(tempMap1, tempMap2, SMOOTH_ALL_THEN_CLAMP);
    smoothMap(tempMap2, tempMap1, SMOOTH_ALL_THEN_CLAMP);

    var maxPollution = 0;
    var pollutedTileCount = 0;
    var totalPollution = 0;

    for (x = 0; x < pollutionDensityMap.gameMapWidth; x += pollutionDensityMap.blockSize) {
      for (y = 0; y < pollutionDensityMap.gameMapHeight; y += pollutionDensityMap.blockSize)  {
        var pollution = tempMap1.worldGet(x, y);
        pollutionDensityMap.worldSet(x, y, pollution);

        if (pollution !== 0) {
          pollutedTileCount++;
          totalPollution += pollution;

          // note location of max pollution for monster
          if (pollution > maxPollution || (pollution === maxPollution && Random.getChance(3))) {
            maxPollution = pollution;
            map.pollutionMaxX = x;
            map.pollutionMaxY = y;
          }
        }
      }
    }

    if (pollutedTileCount)
      census.pollutionAverage = Math.floor(totalPollution / pollutedTileCount);
    else
      census.pollutionAverage = 0;

    smoothMap(tempMap3, terrainDensityMap, SMOOTH_NEIGHBOURS_THEN_BLOCK);
  };


  var crimeScan = function(census, blockMaps) {
    var policeStationMap = blockMaps.policeStationMap;
    var policeStationEffectMap = blockMaps.policeStationEffectMap;
    var crimeRateMap = blockMaps.crimeRateMap;
    var landValueMap = blockMaps.landValueMap;
    var populationDensityMap = blockMaps.populationDensityMap;

    smoothMap(policeStationMap, policeStationEffectMap, SMOOTH_NEIGHBOURS_THEN_BLOCK);
    smoothMap(policeStationEffectMap, policeStationMap, SMOOTH_NEIGHBOURS_THEN_BLOCK);
    smoothMap(policeStationMap, policeStationEffectMap, SMOOTH_NEIGHBOURS_THEN_BLOCK);

    var totalCrime = 0;
    var crimeZoneCount = 0;

    for (var x = 0; x < crimeRateMap.gameMapWidth; x += crimeRateMap.blockSize) {
      for (var y = 0; y < crimeRateMap.gameMapHeight; y += crimeRateMap.blockSize) {
        var value = landValueMap.worldGet(x, y);

        if (value > 0) {
          ++crimeZoneCount;
          value = 128 - value;
          value += populationDensityMap.worldGet(x, y);
          value = Math.min(value, 300);
          value -= policeStationMap.worldGet(x, y);
          value = MiscUtils.clamp(value, 0, 250);
          crimeRateMap.worldSet(x, y, value);
          totalCrime += value;
        } else {
          crimeRateMap.worldSet(x, y, 0);
        }
      }
    }

    if (crimeZoneCount > 0)
        census.crimeAverage = Math.floor(totalCrime / crimeZoneCount);
    else
        census.crimeAverage = 0;
  };


  var computeComRateMap = function(map, blockMaps) {
    var comRateMap = blockMaps.comRateMap;

    for (var x = 0; x < comRateMap.width; x++) {
      for (var y = 0; y < comRateMap.height; y++) {
        var value = Math.floor(getCityCentreDistance(map, x * 8, y * 8) / 2);
        value = value * 4;
        value = 64 - value;
        comRateMap.set(x, y, value);
      }
    }
  };


  var getPopulationDensity = function(map, x, y, tile) {
    if (tile < Tile.COMBASE)
      return Residential.getZonePopulation(map, x, y, tile);

    if (tile < Tile.INDBASE)
      return Commercial.getZonePopulation(map, x, y, tile) * 8;

    if (tile < Tile.PORTBASE)
      return Industrial.getZonePopulation(map, x, y, tile) * 8;

    return 0;
  };


  var populationDensityScan = function(map, blockMaps) {
    var tempMap1 = blockMaps.tempMap1;
    var tempMap2 = blockMaps.tempMap2;
    var populationDensityMap = blockMaps.populationDensityMap;
    tempMap1.clear();

    var Xtot = 0;
    var Ytot = 0;
    var zoneTotal = 0;

    for (var x = 0; x < map.width; x++) {
      for (var y = 0; y < map.height; y++) {
        var tile = map.getTile(x, y);
        if (tile.isZone()) {
          var tileValue = tile.getValue();

          var population = getPopulationDensity(map, x, y, tileValue) * 8;
          population = Math.min(population, 254);

          tempMap1.worldSet(x, y, population);
          Xtot += x;
          Ytot += y;
          zoneTotal++;
        }
      }
    }

    smoothMap(tempMap1, tempMap2, SMOOTH_ALL_THEN_CLAMP);
    smoothMap(tempMap2, tempMap1, SMOOTH_ALL_THEN_CLAMP);
    smoothMap(tempMap1, tempMap2, SMOOTH_ALL_THEN_CLAMP);

    // Copy tempMap2 to populationDensityMap, multiplying by 2
    blockMaps.populationDensityMap.copyFrom(tempMap2, function(x) {return x * 2;});

    computeComRateMap(map, blockMaps);

    // Compute new city center
    if (zoneTotal > 0) {
      map.cityCentreX = Math.floor(Xtot / zoneTotal);
      map.cityCentreY = Math.floor(Ytot / zoneTotal);
    } else {
      map.cityCentreX = Math.floor(map.width / 2);
      map.cityCentreY = Math.floor(map.height / 2);
    }
  };


  var fireAnalysis = function(blockMaps) {
    var fireStationMap = blockMaps.fireStationMap;
    var fireStationEffectMap = blockMaps.fireStationEffectMap;

    smoothMap(fireStationMap, fireStationEffectMap, SMOOTH_NEIGHBOURS_THEN_BLOCK);
    smoothMap(fireStationEffectMap, fireStationMap, SMOOTH_NEIGHBOURS_THEN_BLOCK);
    smoothMap(fireStationMap, fireStationEffectMap, SMOOTH_NEIGHBOURS_THEN_BLOCK);
  };


  var BlockMapUtils = {
    crimeScan: crimeScan,
    decTrafficMap: decTrafficMap,
    fireAnalysis: fireAnalysis,
    neutraliseRateOfGrowthMap: neutraliseRateOfGrowthMap,
    pollutionTerrainLandValueScan: pollutionTerrainLandValueScan,
    populationDensityScan: populationDensityScan
  };


  return BlockMapUtils;
});
