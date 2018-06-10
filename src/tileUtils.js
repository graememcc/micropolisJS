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
import * as TileValues from "./tileValues";

var unwrapTile = function(f) {
  return function(tile) {
    if (tile instanceof Tile)
      tile = tile.getValue();
    return f.call(null, tile);
  };
};


var canBulldoze = unwrapTile(function(tileValue) {
  return (tileValue >= TileValues.FIRSTRIVEDGE  && tileValue <= TileValues.LASTRUBBLE) ||
         (tileValue >= TileValues.POWERBASE + 2 && tileValue <= TileValues.POWERBASE + 12) ||
         (tileValue >= TileValues.TINYEXP       && tileValue <= TileValues.LASTTINYEXP + 2);
});


var isCommercial = unwrapTile(function(tile) {
  return tile >= TileValues.COMBASE && tile < TileValues.INDBASE;
});


var isCommercialZone = function(tile) {
  return tile.isZone() && isCommercial(tile);
};


var isDriveable = unwrapTile(function(tile) {
  return (tile >= TileValues.ROADBASE && tile <= TileValues.LASTROAD) ||
         (tile >= TileValues.RAILHPOWERV && tile <= TileValues.LASTRAIL);
});


var isFire = unwrapTile(function(tile) {
  return tile >= TileValues.FIREBASE && tile < TileValues.ROADBASE;
});


var isFlood = unwrapTile(function(tile) {
  return tile >= TileValues.FLOOD && tile < TileValues.LASTFLOOD;
});


var isIndustrial = unwrapTile(function(tile) {
  return tile >= TileValues.INDBASE && tile < TileValues.PORTBASE;
});


var isIndustrialZone = function(tile) {
  return tile.isZone() && isIndustrial(tile);
};


var isManualExplosion = unwrapTile(function(tile) {
  return tile >= TileValues.TINYEXP && tile <= TileValues.LASTTINYEXP;
});


var isRail = unwrapTile(function(tile) {
  return tile >= TileValues.RAILBASE && tile < TileValues.RESBASE;
});


var isResidential = unwrapTile(function(tile) {
  return tile >= TileValues.RESBASE && tile < TileValues.HOSPITALBASE;
});


var isResidentialZone = function(tile) {
  return tile.isZone() && isResidential(tile);
};


var isRoad = unwrapTile(function(tile) {
  return tile >= TileValues.ROADBASE && tile < TileValues.POWERBASE;
});


var normalizeRoad = unwrapTile(function(tile) {
  return (tile >= TileValues.ROADBASE && tile <= TileValues.LASTROAD + 1) ? (tile & 15) + 64 : tile;
});


var randomFire = function() {
  return new Tile(TileValues.FIRE + (Random.getRandom16() & 3), Tile.ANIMBIT);
};


var randomRubble = function() {
  return new Tile(TileValues.RUBBLE + (Random.getRandom16() & 3), Tile.BULLBIT);
};


var TileUtils = {
  canBulldoze: canBulldoze,
  isCommercial: isCommercial,
  isCommercialZone: isCommercialZone,
  isDriveable: isDriveable,
  isFire: isFire,
  isFlood: isFlood,
  isIndustrial: isIndustrial,
  isIndustrialZone: isIndustrialZone,
  isManualExplosion: isManualExplosion,
  isRail: isRail,
  isResidential: isResidential,
  isResidentialZone: isResidentialZone,
  isRoad: isRoad,
  normalizeRoad: normalizeRoad,
  randomFire: randomFire,
  randomRubble: randomRubble
};


export { TileUtils };
