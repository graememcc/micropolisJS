/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { BaseTool } from './baseTool';
import { Config } from './config';
import { PowerManager } from './powerManager';
import { Random } from './random';
import { Tile } from './tile';
import { TileUtils } from './tileUtils';
import { Traffic } from './traffic';
import { ZoneUtils } from './zoneUtils';

// Field tiles have 'populations' of 16, 24, 32 or 40, and value from 0 to 3. The tiles are laid out in
// increasing order of land value, cycling through each population value
var placeField = function(map, x, y, population, lpValue, zoneIrrigate, centreTile) {
  //var centreTile = ((lpValue * 4) + population) * 9 + Tile.FZB;
  var zonePower = false; // dava errore se non dichiarato
  ZoneUtils.putZone(map, x, y, centreTile, zonePower, zoneIrrigate);
};


// Look for farming in the adjacent 8 tiles
var getFreeZonePopulation = function(map, x, y, tileValue) { 
  var count = 0;
  for (var xx = x - 1; xx <= x + 1; xx++) {
    for (var yy = y - 1; yy <= y + 1; yy++) {
   //   if (xx === x && yy === y) continue;
      tileValue = map.getTileValue(xx, yy);
      if (tileValue >= Tile.CORN && tileValue <= Tile.POTATO)
        count += 1;
    }
  }

  return count;
};


var getZonePopulation = function(map, x, y, tileValue) { 
  if (tileValue instanceof Tile)
    tileValue = tile.getValue();

  if (tileValue === Tile.FREEF || (tileValue >= Tile.CORN && tileValue <= Tile.POTATO)) 
    return getFreeZonePopulation(map, x, y, tileValue);

  var populationIndex = Math.floor((tileValue - Tile.FZB) / 9) % 4 + 1; 
  return populationIndex * 8 + 16;
};


// Assess a tile for suitability for a farm. Prefers tiles near roads
var evalLot = function(map, x, y) {
  var xDelta = [0, 1, 0, -1];
  var yDelta = [-1, 0, 1, 0];

  if (!map.testBounds(x, y))
    return -1;

  var tileValue = map.getTileValue(x, y);
  if (tileValue < Tile.FIELDBASE || tileValue > Tile.FIELDBASE + 8)
    return -1;

  var score = 1;
  for (var i = 0; i < 4; i++) {
    var edgeX = x + xDelta[i];
    var edgeY = y + yDelta[i];

    if (edgeX < 0 || edgeX >= map.width || edgeY < 0 || edgeY >= map.height)
      continue;

    tileValue = map.getTileValue(edgeX, edgeY);
    if (tileValue !== Tile.DIRT && tileValue <= Tile.LASTROAD)
      score += 1;
  }

  return score;
};


var buildFarm = function(map, x, y, lpValue) { 
  var best = 0;
  var bestScore = 0;

  //  Deliberately ordered so that the centre tile is at index 0
  var xDelta = [0, -1, 0, 1, -1, 1, -1, 0, 1];
  var yDelta = [0, -1, -1, -1, 0, 0, 1, 1, 1];

  for (var i = 0; i < 9; i++) {
    var xx = x + xDelta[i];
    var yy = y + yDelta[i];

    var score = evalLot(map, xx, yy);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    } else if (score === bestScore && Random.getChance(7)) {
      // Ensures we don't always select the same position when we
      // have a choice
      best = i;
    }
  }

  if (best > 0 && map.testBounds(x + xDelta[best], y + yDelta[best]))
    map.setTile(x + xDelta[best], y + yDelta[best],
              Tile.FARM + Random.getRandom(2) + lpValue * 3, Tile.BLBNHYBIT);
};


var growZone = function(map, x, y, blockMaps, population, lpValue, zoneIrrigate) {
  var pollution = blockMaps.pollutionDensityMap.worldGet(x, y);

  // Cough! Too polluted! No-one wants to move here!
  if (pollution > 128)
    return;

  var tileValue = map.getTileValue(x, y);

  switch(tileValue){
    case Tile.FCORN:
      tileValue = Tile.CORN;
      placeField(map, x, y, 0, lpValue, zoneIrrigate, tileValue);
      break;

    case Tile.FWHEAT:
      tileValue = Tile.WHEAT;
      placeField(map, x, y, 0, lpValue, zoneIrrigate, tileValue);
      break;

    case Tile.FORCHARD:
      tileValue = Tile.ORCHARD;
      placeField(map, x, y, 0, lpValue, zoneIrrigate, tileValue);
      break;

    case Tile.FPOTATO:
      tileValue = Tile.POTATO;
      placeField(map, x, y, 0, lpValue, zoneIrrigate, tileValue);
      break;
    
    default:
      return;

  }

  return;

  /*if (tileValue === Tile.FREEF) {
    
    if (population < 8) {
      // Zone capacity not yet reached: build another farm
      buildFarm(map, x, y, lpValue);
      ZoneUtils.incRateOfGrowth(blockMaps, x, y, 1);
    } else if (blockMaps.populationDensityMap.worldGet(x, y) > 64) {
      // There is local demand for higher density farming
      placeField(map, x, y, 0, lpValue, zoneIrrigate);
      ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
    }

    return;
  }*/

};


//var freeZone = [0, 3, 6, 1, 4, 7, 2, 5, 8];

var degradeZone = function(map, x, y, blockMaps, population, lpValue, zoneIrrigate) {
  //var xx, yy;
  var tileValue = map.getTileValue(x, y);

  switch(tileValue){
    case Tile.CORN:
      tileValue = Tile.FCORN;
      map.setTile(x, y, tileValue, Tile.BLBNHYBIT);
      break;

    case Tile.WHEAT:
      tileValue = Tile.FWHEAT;
      map.setTile(x, y, tileValue, Tile.BLBNHYBIT);
      break;

    case Tile.ORCHARD:
      tileValue = Tile.FORCHARD;
      map.setTile(x, y, tileValue, Tile.BLBNHYBIT);
      break;

    case Tile.POTATO:
      tileValue = Tile.FPOTATO;
      map.setTile(x, y, tileValue, Tile.BLBNHYBIT);
      break;

  }

  return;


  /*if (population === 0)
    return;

  if (population > 16) {
    // Degrade to a lower density block
    placeField(map, x, y, Math.floor((population - 24) / 8), lpValue, zoneIrrigate);
    ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
    return;
  }

  if (population === 16) {
    // Already at lowest density: degrade to 8 individual farms
    map.setTile(x, y, Tile.FREEF, Tile.BLBNHYBIT | Tile.ZONEBIT); 

    for (yy = y - 1; yy <= y + 1; yy++) {
      for (xx = x - 1; xx <= x + 1; xx++) {
        if (xx === x && yy === y) continue;
        map.setTile(x, y, Tile.FFARM + lpValue + Random.getRandom(2), Tile.BLBNHYBIT);
      }
    }

    ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
    return;
  } 

  // Already down to individual farms. Remove one
  var i = 0;
  ZoneUtils.incRateOfGrowth(blockMaps, x, y, -1);

  for (xx = x - 1; xx <= x + 1; xx++) {
    for (yy = y - 1; yy <= y + 1; yy++, i++) {
      var currentValue = map.getTileValue(xx, yy);
      if (currentValue >= Tile.FFARM && currentValue <= Tile.LFARM) {
        // We've found a farm. Replace it with the normal free zone tile
        map.setTile(xx, yy, freeZone[i] + Tile.FIELDBASE, Tile.BLBNHYBIT);
        return;
      }
    }
  }*/
};


// Returns a score for the zone in the range -3000 - 3000
var evalField = function(blockMaps, x, y, traffic) {
  if (traffic === Traffic.NO_ROAD_FOUND)
    return -3000;

  var landValue = blockMaps.landValueMap.worldGet(x, y);
  landValue -= blockMaps.pollutionDensityMap.worldGet(x, y);

  if (landValue < 0)
    landValue = 0;
  else
    landValue = Math.min(landValue * 32, 6000);

  return landValue - 3000;
};


var fieldFound = function(map, x, y, simData) {
  // If we choose to grow this zone, we will fill it with an index in the range 0-3 reflecting the land value and
  // pollution scores (higher is better). This is then used to select the variant to build
  var lpValue;

  
  
  var tile = map.getTileValue(x, y);
  var zoneIrrigate = map.getTile(x, y).isIrrigated();
  //var prevTile = map.getTileValue(x-1, y);
  var cost = 0;
  //if( prevTile !== (Tile.FREEINDF-1))
  //{
  if(zoneIrrigate) {
    // Notify the census
    simData.census.fieldZonePop += 1;
    cost = simData.powerManager.costFieldMap.get(x, y);
    switch(cost){
      case BaseTool.CORN_COST: 
        tile = Tile.CORN;
        break;

      case BaseTool.WHEAT_COST:
        tile = Tile.WHEAT;
        break;

      case BaseTool.ORCHARD_COST:
        tile = Tile.ORCHARD; 
        break;

      case BaseTool.POTATO_COST: 
        tile  = Tile.POTATO;  
        break;

      default: break;  
    }
  }
  else{
    tile = Tile.FREEF;
    }
  
    map.setTile(x, y, tile, Tile.BLBNHYBIT | Tile.ZONEBIT);

  //var tileValue = map.getTileValue(x, y);
  //var population = getZonePopulation(map, x, y, tileValue); 
  //simData.census.fieldPop += population;

  var population = 0;
  if(tile != Tile.FREEF) { 
  if(simData.budget.shouldDegradeField()){
    if (Random.getChance(511)) {
    lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
    degradeZone(map, x, y, simData.blockMaps, population, lpValue, zoneIrrigate);
    return;
    }
  }else{
    if(Random.getChance(511)){
      lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
      growZone(map, x, y, simData.blockMaps, population, lpValue, zoneIrrigate);
      return;
    }
  //}
}
}
  

  // Also, notify the census of our population
  /*var tileValue = map.getTileValue(x, y);
  var population = getZonePopulation(map, x, y, tileValue);
  simData.census.fieldPop += population;

  

  var trafficOK = Traffic.ROUTE_FOUND;*/


/*  // Occasionally check to see if the zone is connected to the road network. The chance of this happening increases
  // as the zone's population increases. Note: we will never execute this conditional if the zone is empty, as zero
  // will never be be bigger than any of the values Random will generate
  if (population > Random.getRandom(35)) {
    // Is there a route from this zone to a commercial zone?
    trafficOK = simData.trafficManager.makeTraffic(x, y, simData.blockMaps, TileUtils.isResidential);

    // If we're not connected to the road network, then going shopping will be a pain. Move out.
    if (trafficOK === Traffic.NO_ROAD_FOUND) {
      lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
      degradeZone(map, x, y, simData.blockMaps, population, lpValue, zoneIrrigate);
      return;
    }
  }

  // Sometimes we will randomly choose to assess this block. However, always assess it if it's empty or contains only
  // single farms.
  if (tileValue === Tile.FREEF || Random.getChance(7)) {
    // First, score the individual zone. This is a value in the range -3000 to 3000
    // Then take into account global demand for farming.
    var locationScore = evalField(simData.blockMaps, x, y, trafficOK);
    var zoneScore = simData.valves.fieldValve + locationScore;

    // Naturally unirrigated zones should be penalized
    if (!zoneIrrigate)
      zoneScore = -500;

    // The field demand valve has range -2000 to 2000, so taking into account the "no traffic" and
    // "no irrigation" modifiers above, zoneScore must lie in the range -5500 - 5000.

    // Now, observe that if there are no roads we will never take this branch, as zoneScore will equal -3000.
    // Given the comment above about ranges for zoneScore, zoneScore - 26380, will be in the range -26729 to -20880.
    // getRandom16() has a range of 65536 possible numbers, in the range -32768 to 32767.
    // Of those, 9.2% will always be below zoneScore and hence will always take this branch and trigger zone growth.
    // 81.8% of them are above -20880, so nearly 82% of the time, we will never take this branch.
    // Thus, there's approximately a 9% chance that the value will be in the range, and we *might* grow.
    if (zoneScore > -350 && (zoneScore - 26380) > Random.getRandom16Signed()) {

      // If this zone is empty, and field demand is strong, we might make a hospital
      if (population === 0 && Random.getChance(3)) {
        makeHospital(map, x, y, simData, zonePower);
        return;
      }

      // Get an index in the range 0-3 scoring the land desirability and pollution, and grow the zone to the next
      // population rank
      lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
      growZone(map, x, y, simData.blockMaps, population, lpValue, zoneIrrigate);
      return;
    }

    // Again, given the above, zoneScore + 26380 must lie in the range 20880 - 26030.
    // There is a 10.2% chance of getRandom16() always yielding a number > 27994 which would take this branch.
    // There is a 89.7% chance of the number being below 20880 thus never triggering this branch, which leaves a
    // 0.1% chance of this branch being conditional on zoneScore.
    if (zoneScore < 350 && (zoneScore + 26380) < Random.getRandom16Signed()) {
      // Get an index in the range 0-3 scoring the land desirability and pollution, and degrade to the next
      // lower ranked zone
      lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
      degradeZone(map, x, y, simData.blockMaps, population, lpValue, zoneIrrigate);
    }
  }
  */
};





var Field = {
  registerHandlers: function(mapScanner, repairManager) {
    mapScanner.addAction(TileUtils.isFieldZone, fieldFound);
  },
  getZonePopulation: getZonePopulation
};


export { Field };
