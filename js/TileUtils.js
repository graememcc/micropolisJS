/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Random', 'Tile'],
       function(Random, Tile) {
  "use strict";

  var unwrapTile = function(f) {
    return function(tile) {
      if (tile instanceof Tile)
        tile = tile.getValue();
      return f.call(null, tile);
    };
  };


  var canBulldoze = unwrapTile(function(tileValue) {
    return (tileValue >= Tile.FIRSTRIVEDGE  && tileValue <= Tile.LASTRUBBLE) ||
           (tileValue >= Tile.POWERBASE + 2 && tileValue <= Tile.POWERBASE + 12) ||
           (tileValue >= Tile.TINYEXP       && tileValue <= Tile.LASTTINYEXP + 2);
  });


  var isCommercial = unwrapTile(function(tile) {
    return tile >= Tile.COMBASE && tile < Tile.INDBASE;
  });


  var isCommercialZone = function(tile) {
    return tile.isZone() && isCommercial(tile);
  };


  var isDriveable = unwrapTile(function(tile) {
    return (tile >= Tile.ROADBASE && tile <= Tile.LASTRAIL) ||
           tile === Tile.RAILPOWERV || tile === Tile.RAILPOWERH;
  });


  var isFire = unwrapTile(function(tile) {
    return tile >= Tile.FIREBASE && tile < Tile.ROADBASE;
  });


  var isFlood = unwrapTile(function(tile) {
    return tile >= Tile.FLOOD && tile < Tile.LASTFLOOD;
  });


  var isIndustrial = unwrapTile(function(tile) {
    return tile >= Tile.INDBASE && tile < Tile.PORTBASE;
  });


  var isIndustrialZone = function(tile) {
    return tile.isZone() && isIndustrial(tile);
  };


  var isManualExplosion = unwrapTile(function(tile) {
    return tile >= Tile.TINYEXP && tile <= Tile.LASTTINYEXP;
  });


  var isRail = unwrapTile(function(tile) {
    return tile >= Tile.RAILBASE && tile < Tile.RESBASE;
  });


  var isResidential = unwrapTile(function(tile) {
    return tile >= Tile.RESBASE && tile < Tile.HOSPITALBASE;
  });


  var isResidentialZone = function(tile) {
    return tile.isZone() && isResidential(tile);
  };


  var isRoad = unwrapTile(function(tile) {
    return tile >= Tile.ROADBASE && tile <= Tile.POWERBASE;
  });


  var normalizeRoad = unwrapTile(function(tile) {
    return (tile >= Tile.ROADBASE && tile <= Tile.LASTROAD + 1) ? (tile & 15) + 64 : tile;
  });


  var randomFire = function() {
    return new Tile(Tile.FIRE + (Random.getRandom16() & 3), Tile.ANIMBIT);
  };


  var randomRubble = function() {
    return new Tile(Tile.RUBBLE + (Random.getRandom16() & 3), Tile.BULLBIT);
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


  return TileUtils;
});
