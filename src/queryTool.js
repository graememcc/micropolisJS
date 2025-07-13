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

import $ from "jquery";

import { BaseTool } from './baseTool.js';
import { Config } from './config.js';
import { EventEmitter } from './eventEmitter.js';
import { QUERY_WINDOW_NEEDED } from './messages.ts';
import { Text } from './text.js';
import * as TileValues from "./tileValues.ts";

var makeTool = BaseTool.makeTool;
var QueryTool = EventEmitter(makeTool(function(map) {
  this.init(0, map, false, false);
}));


QueryTool.prototype.classifyPopulationDensity = function(x, y, blockMaps) {
  var density = blockMaps.populationDensityMap.worldGet(x, y);
  if (Config.debug || Config.queryDebug)
    $('#queryDensityRaw').text(density);
  density = density >> 6;
  density = density & 3;
  $('#queryDensity').text(Text.densityStrings[density]);
};


QueryTool.prototype.classifyLandValue = function(x, y, blockMaps) {
   var landValue = blockMaps.landValueMap.worldGet(x, y);
   if (Config.debug || Config.queryDebug)
     $('#queryLandValueRaw').text(landValue);

   var i = 0;
   if (landValue >= 150)
     i = 3;
   else if (landValue >= 80)
     i = 2;
   else if (landValue >= 30)
     i = 1;

   var text = Text.landValueStrings[i];
   $('#queryLandValue').text(text);
};


QueryTool.prototype.classifyCrime = function(x, y, blockMaps) {
  var crime = blockMaps.crimeRateMap.worldGet(x, y);
  if (Config.debug || Config.queryDebug)
    $('#queryCrimeRaw').text(crime);
  crime = crime >> 6;
  crime = crime & 3;
  $('#queryCrime').text(Text.crimeStrings[crime]);
};


QueryTool.prototype.classifyPollution = function(x, y, blockMaps) {
  var pollution = blockMaps.pollutionDensityMap.worldGet(x, y);
  if (Config.debug || Config.queryDebug)
    $('#queryPollutionRaw').text(pollution);
  pollution = pollution >> 6;
  pollution = pollution & 3;
  $('#queryPollution').text(Text.pollutionStrings[pollution]);
};


QueryTool.prototype.classifyRateOfGrowth = function(x, y, blockMaps) {
  var rate = blockMaps.rateOfGrowthMap.worldGet(x, y);
  if (Config.debug || Config.queryDebug)
    $('#queryRateRaw').text(rate);
  rate = rate >> 6;
  rate = rate & 3;
  $('#queryRate').text(Text.rateStrings[rate]);
};


QueryTool.prototype.classifyDebug = function(x, y, blockMaps) {
  if (!Config.debug && !Config.queryDebug)
    return;
  $('#queryFireStationRaw').text(blockMaps.fireStationMap.worldGet(x, y));
  $('#queryFireStationEffectRaw').text(blockMaps.fireStationEffectMap.worldGet(x, y));
  $('#queryPoliceStationRaw').text(blockMaps.policeStationMap.worldGet(x, y));
  $('#queryPoliceStationEffectRaw').text(blockMaps.policeStationEffectMap.worldGet(x, y));
  $('#queryTerrainDensityRaw').text(blockMaps.terrainDensityMap.worldGet(x, y));
  $('#queryTrafficDensityRaw').text(blockMaps.trafficDensityMap.worldGet(x, y));
  $('#queryComRateRaw').text(blockMaps.cityCentreDistScoreMap.worldGet(x, y));
};


QueryTool.prototype.classifyZone = function(x, y) {
  var baseTiles = [
      TileValues.DIRT, TileValues.RIVER, TileValues.TREEBASE, TileValues.RUBBLE,
      TileValues.FLOOD, TileValues.RADTILE, TileValues.FIRE, TileValues.ROADBASE,
      TileValues.POWERBASE, TileValues.RAILBASE, TileValues.RESBASE, TileValues.COMBASE,
      TileValues.INDBASE, TileValues.PORTBASE, TileValues.AIRPORTBASE, TileValues.COALBASE,
      TileValues.FIRESTBASE, TileValues.POLICESTBASE, TileValues.STADIUMBASE, TileValues.NUCLEARBASE,
      TileValues.HBRDG0, TileValues.RADAR0, TileValues.FOUNTAIN, TileValues.INDBASE2,
      TileValues.FOOTBALLGAME1, TileValues.VBRDG0, 952];

  var tileValue = this._map.getTileValue(x, y);
  if (tileValue >= TileValues.COALSMOKE1 && tileValue < TileValues.FOOTBALLGAME1)
    tileValue = TileValues.COALBASE;

  var index, l;
  for (index = 0, l = baseTiles.length - 1; index < l; index++) {
    if (tileValue < baseTiles[index + 1])
      break;
  }

  $('#queryZoneType').text(Text.zoneTypes[index]);
};


QueryTool.prototype.doTool = function(x, y, blockMaps) {
  var text = 'Position (' + x + ', ' + y + ')';
  text += ' TileValue: ' + this._map.getTileValue(x, y);

  if (Config.debug || Config.queryDebug) {
    var tile = this._map.getTile(x, y);
    $('#queryTile').text([x,y].join(', '));
    $('#queryTileValue').text(tile.getValue());
    $('#queryTileBurnable').text(tile.isCombustible() ? '\u2714' : '\u2718');
    $('#queryTileBulldozable').text(tile.isBulldozable() ? '\u2714' : '\u2718');
    $('#queryTileCond').text(tile.isConductive() ? '\u2714' : '\u2718');
    $('#queryTileAnim').text(tile.isAnimated() ? '\u2714' : '\u2718');
    $('#queryTilePowered').text(tile.isPowered() ? '\u2714' : '\u2718');
    $('#queryTileZone').text(tile.isZone() ? '\u2714' : '\u2718');
  }

  this.classifyZone(x, y);
  this.classifyPopulationDensity(x, y, blockMaps);
  this.classifyLandValue(x, y, blockMaps);
  this.classifyCrime(x, y, blockMaps);
  this.classifyPollution(x, y, blockMaps);
  this.classifyRateOfGrowth(x, y, blockMaps);
  this.classifyDebug(x, y, blockMaps);

  this._emitEvent(QUERY_WINDOW_NEEDED);

  this.result = this.TOOLRESULT_OK;
};


export { QueryTool };
