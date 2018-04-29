/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { BlockMap } from './BlockMap';
import { Commercial } from './Commercial';
import { Industrial } from './Industrial';
import { MiscUtils } from './MiscUtils';
import { Random } from './Random';
import { Residential } from './Residential';
import { Tile } from './Tile';

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


// Over time, traffic density should ease.
var neutraliseTrafficMap = function(blockMaps) {
  var trafficDensityMap = blockMaps.trafficDensityMap;

  for (var x = 0, width = trafficDensityMap.width; x < width; x++) {
    for (var y = 0, height = trafficDensityMap.height; y < height; y++) {
      var trafficDensity = trafficDensityMap.get(x, y);
      if (trafficDensity === 0)
        continue;

      if (trafficDensity <= 24)
        trafficDensity = 0;
      else if (trafficDensity > 200)
        trafficDensity = trafficDensity - 34;
      else
        trafficDensity = trafficDensity - 24;

      trafficDensityMap.set(x, y, trafficDensity);
    }
  }
};


// Given a tileValue, score it on the pollution it generates, in the range 0-255
var getPollutionValue = function(tileValue) {
  if (tileValue < Tile.POWERBASE) {
    // Roads, fires and radiation lie below POWERBASE

    // Heavy traffic is bad
    if (tileValue >= Tile.HTRFBASE)
      return 75;

    // Low traffic not so much
    if (tileValue >= Tile.LTRFBASE)
      return 50;

    if (tileValue <  Tile.ROADBASE) {
      // Fire = carbon monoxide = a bad score for you
      if (tileValue > Tile.FIREBASE)
        return 90;

      // Radiation. Top of the charts.
      if (tileValue >= Tile.RADTILE)
        return 255;
    }

    // All other types of ground are pure.
    return 0;
  }

  // If we've reached this point, we're classifying some form of zone tile

  // Residential and commercial zones don't pollute
  if (tileValue <= Tile.LASTIND)
    return 0;

  // Industrial zones, however...
  if (tileValue < Tile.PORTBASE)
    return 50;

  // Coal power plants are bad
  if (tileValue <= Tile.LASTPOWERPLANT)
      return 100;

  return 0;
};


// Compute the Manhattan distance of the given point from the city centre, and force into the range 0-64
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


// This monster function fills up the landValueMap, the terrainDensityMap and the pollutionDensityMap based
// on values found by iterating over the map.
//
// Factors that affect land value:
//   * Distance from the city centre
//   * High crime
//   * High pollution
//   * Proximity to undeveloped terrain (who doesn't love a good view?)
//
// Pollution is completely determined by the tile types in the block
var pollutionTerrainLandValueScan = function(map, census, blockMaps) {
  // We record raw pollution readings for each tile into tempMap1, and then use tempMap2 and tempMap1 to smooth
  // out the pollution in order to construct the new values for the populationDensityMap
  var tempMap1 = blockMaps.tempMap1;
  var tempMap2 = blockMaps.tempMap2;

  // tempMap3 will be used to record raw terrain information, i.e. if the the land is developed. This will be
  // smoothed in to terrainDensityMap later
  var tempMap3 = blockMaps.tempMap3;
  tempMap3.clear();

  var landValueMap = blockMaps.landValueMap;
  var terrainDensityMap = blockMaps.terrainDensityMap;
  var pollutionDensityMap = blockMaps.pollutionDensityMap;
  var crimeRateMap = blockMaps.crimeRateMap;

  var x, y, width, height;

  var totalLandValue = 0;
  var developedTileCount = 0;

  for (x = 0, width = landValueMap.width; x < width; x++) {
    for (y = 0, height = landValueMap.height; y < height; y++) {
      var pollutionLevel = 0;
      var developed = false;

      // The land value map has a chunk size of 2
      var worldX = x * 2;
      var worldY = y * 2;

      for (var mapX = worldX; mapX <= worldX + 1; mapX++) {
        for (var mapY = worldY; mapY <= worldY + 1; mapY++) {
          var tileValue = map.getTileValue(mapX, mapY);

          if (tileValue === Tile.DIRT)
            continue;

          if (tileValue < Tile.RUBBLE) {
            // Undeveloped land: record in tempMap3. Each undeveloped piece of land scores 15.
            // tempMap3 has a chunk size of 4, so each square in tempMap3 will ultimately contain a
            // maximum value of 240
            var terrainValue = tempMap3.worldGet(mapX, mapY);
            tempMap3.worldSet(mapX, mapY, terrainValue + 15);
            continue;
          }

          pollutionLevel += getPollutionValue(tileValue);
          if (tileValue >= Tile.ROADBASE)
            developed = true;
        }
      }

      // Clamp pollution in range 0-255 (at the moment it's range is 0-1020) and record it for later.
      pollutionLevel = Math.min(pollutionLevel, 255);
      tempMap1.set(x, y, pollutionLevel);

      if (developed) {
        // getCityCentreDistance returns a score in the range 0-64, so, after shifting, landValue will be in
        // range 8-136
        var landValue = 34 - Math.floor(getCityCentreDistance(map, worldX, worldY) / 2);
        landValue = landValue << 2;

        // Land in the same neighbourhood as unspoiled land is more valuable...
        landValue += terrainDensityMap.get(x >> 1, y >> 1);

        // ... and polluted land obviously is less valuable
        landValue -= pollutionDensityMap.get(x, y);

        // ... getting mugged won't help either
        if (crimeRateMap.get(x, y) > 190)
          landValue -= 20;

        // Clamp in range 1-250 (0 represents undeveloped land)
        landValue = MiscUtils.clamp(landValue, 1, 250);
        landValueMap.set(x, y, landValue);

        totalLandValue += landValue;
        developedTileCount++;
      } else {
        landValueMap.set(x, y, 0);
      }
    }
  }

  if (developedTileCount > 0)
    census.landValueAverage = Math.floor(totalLandValue / developedTileCount);
  else
    census.landValueAverage = 0;
    
  // Smooth the pollution map twice
  smoothMap(tempMap1, tempMap2, SMOOTH_ALL_THEN_CLAMP);
  smoothMap(tempMap2, tempMap1, SMOOTH_ALL_THEN_CLAMP);

  var maxPollution = 0;
  var pollutedTileCount = 0;
  var totalPollution = 0;

  // We iterate over the now-smoothed pollution map rather than using the block map's copy routines
  // so that we can compute the average and total pollution en-route
  for (x = 0, width = map.width; x < width; x += pollutionDensityMap.blockSize) {
    for (y = 0, height = map.height; y < height; y += pollutionDensityMap.blockSize)  {
      // Copy the values into pollutionDensityMap
      var pollution = tempMap1.worldGet(x, y);
      pollutionDensityMap.worldSet(x, y, pollution);

      if (pollution !== 0) {
        pollutedTileCount++;
        totalPollution += pollution;

        // Note the most polluted location: any monsters will be drawn there (randomly choosing one
        // if we have multiple competitors for most polluted)
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


// Computes the coverage radius of police stations, and scores each neighbourhood in the map on its crime rate.
// Factors that attract crime are:
//    * The zone has a low value
//    * The zone is a slum
//    * The zone is far away from those pesky police
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

  // Scan the map, looking for developed land, as it can attract crime.
  for (var x = 0, width = crimeRateMap.mapWidth, blockSize = crimeRateMap.blockSize; x < width; x += blockSize) {
    for (var y = 0, height = crimeRateMap.mapHeight, b; y < height; y += blockSize) {
      // Remember: landValueMap values are in the range 0-250
      var value = landValueMap.worldGet(x, y);

      if (value > 0) {
        crimeZoneCount += 1;

        // Force value in the range -122 to 128. Lower valued pieces of land attract more crime.
        value = 128 - value;

        // Add population density (a value between 0 and 510). value now lies in range -260 - 382.
        // Denser areas attract more crime.
        value += populationDensityMap.worldGet(x, y);

        // Clamp in range -260 to 300
        value = Math.min(value, 300);

        // If the police are nearby, there's no point committing the crime of the century
        value -= policeStationMap.worldGet(x, y);

        // Force in to range 0-250
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


// Iterate over the map, and score each neighbourhood on its distance from the city centre. Scores are in the range
// -64 to 64. This affects the growth of commercial zones within that neighbourhood.
var fillCityCentreDistScoreMap = function(map, blockMaps) {
  var cityCentreDistScoreMap = blockMaps.cityCentreDistScoreMap;

  for (var x = 0, width = cityCentreDistScoreMap.width; x < width; x++) {
    for (var y = 0, height = cityCentreDistScoreMap.height; y < height; y++) {
      // First, we compute the Manhattan distance of the top-left hand corner of the neighbourhood to the city centre
      // and half that value. This leaves us a value in the range 0 - 32
      var value = Math.floor(getCityCentreDistance(map, x * 8, y * 8) / 2);
      // Now, we scale up by a factor of 4. We're in the range 0 - 128
      value = value * 4;
      // And finally, subtract from 64, leaving us a score in the range -64 to 64
      value = 64 - value;
      cityCentreDistScoreMap.set(x, y, value);
    }
  }
};


// Dispatch to the correct zone type to get the population value for that zone
var getPopulationDensity = function(map, x, y, tile) {
  if (tile < Tile.COMBASE)
    return Residential.getZonePopulation(map, x, y, tile);

  if (tile < Tile.INDBASE)
    return Commercial.getZonePopulation(map, x, y, tile) * 8;

  if (tile < Tile.PORTBASE)
    return Industrial.getZonePopulation(map, x, y, tile) * 8;

  return 0;
};


// Iterate over the map, examining each zone for population. We then smooth the results into a population density
// map, which is used when deciding to grow residential zones. At the same time, we also note the most populous area
// (in terms of zones) to calculate our city centre. Finally, we score each area of the map on its distance from the
// city centre.
var populationDensityScan = function(map, blockMaps) {
  // We will build the initial unsmoothed map in tempMap1, and smooth it in to tempMap2
  var tempMap1 = blockMaps.tempMap1;
  var tempMap2 = blockMaps.tempMap2;
  var populationDensityMap = blockMaps.populationDensityMap;

  // We will sum all the coordinates that contain zones into xTot and yTot. They are used in our city centre
  // heuristic.
  var xTot = 0;
  var yTot = 0;
  var zoneTotal = 0;
    
  tempMap1.clear();

  for (var x = 0, width = map.width; x < width; x++) {
    for (var y = 0, height = map.height; y < height; y++) {
      var tile = map.getTile(x, y);
      if (tile.isZone()) {
        var tileValue = tile.getValue();

        // Ask the zone to calculate its population, scale it up, then clamp in the range 0-254
        var population = getPopulationDensity(map, x, y, tileValue) * 8;
        population = Math.min(population, 254);

        // The block size of population density is 2x2, so there can only be 1 zone per block
        tempMap1.worldSet(x, y, population);

        xTot += x;
        yTot += y;
        zoneTotal++;
      }
    }
  }

  smoothMap(tempMap1, tempMap2, SMOOTH_ALL_THEN_CLAMP);
  smoothMap(tempMap2, tempMap1, SMOOTH_ALL_THEN_CLAMP);
  smoothMap(tempMap1, tempMap2, SMOOTH_ALL_THEN_CLAMP);
  blockMaps.populationDensityMap.copyFrom(tempMap2, function(x) {return x * 2;});

  // XXX This follows the original Micropolis source, but it feels weird to me that we score the entire map
  // based on city centre proximity, and then potentially move the city centre. I think these should be
  // swapped.
  fillCityCentreDistScoreMap(map, blockMaps);

  // Compute new city centre
  if (zoneTotal > 0) {
    map.cityCentreX = Math.floor(xTot / zoneTotal);
    map.cityCentreY = Math.floor(yTot / zoneTotal);
  } else {
    map.cityCentreX = Math.floor(map.width / 2);
    map.cityCentreY = Math.floor(map.height / 2);
  }
};


// Compute the radius of coverage for the firestations found during the map scan
var fireAnalysis = function(blockMaps) {
  var fireStationMap = blockMaps.fireStationMap;
  var fireStationEffectMap = blockMaps.fireStationEffectMap;

  smoothMap(fireStationMap, fireStationEffectMap, SMOOTH_NEIGHBOURS_THEN_BLOCK);
  smoothMap(fireStationEffectMap, fireStationMap, SMOOTH_NEIGHBOURS_THEN_BLOCK);
  smoothMap(fireStationMap, fireStationEffectMap, SMOOTH_NEIGHBOURS_THEN_BLOCK);
};


var BlockMapUtils = {
  crimeScan: crimeScan,
  fireAnalysis: fireAnalysis,
  neutraliseRateOfGrowthMap: neutraliseRateOfGrowthMap,
  neutraliseTrafficMap: neutraliseTrafficMap,
  pollutionTerrainLandValueScan: pollutionTerrainLandValueScan,
  populationDensityScan: populationDensityScan
};


export { BlockMapUtils };
