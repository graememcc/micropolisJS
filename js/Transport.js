/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Random', 'SpriteConstants', 'Tile', 'TileUtils'],
       function(Random, SpriteConstants, Tile, TileUtils) {
  "use strict";


  var railFound = function(map, x, y, simData) {
    simData.census.railTotal += 1;
    simData.spriteManager.generateTrain(simData.census, x, y);

    if (simData.budget.shouldDegradeRoad()) {
      if (Random.getChance(511)) {
        var currentTile = map.getTile(x, y);

        // Don't degrade tiles with power lines
        if (currentTile.isConductive())
          return;

        if (simData.budget.roadEffect < (Random.getRandom16() & 31)) {
          var mapValue = currentTile.getValue();

          // Replace bridge tiles with water, otherwise rubble
          if (mapValue < Tile.RAILBASE + 2)
            map.setTile(x, y, Tile.RIVER, 0);
          else
            map.setTo(x, y, TileUtils.randomRubble());
        }
      }
    }
  };


  var airportFound = function(map, x, y, simData) {
    simData.census.airportPop += 1;

    var tile = map.getTile(x, y);
    if (tile.isPowered()) {
      if (map.getTileValue(x + 1, y - 1) === Tile.RADAR)
        map.setTile(x + 1, y - 1, Tile.RADAR0, Tile.CONDBIT | Tile.ANIMBIT | Tile.BURNBIT);

      if (Random.getRandom(5) === 0) {
        simData.spriteManager.generatePlane(x, y);
        return;
      }

      if (Random.getRandom(12) === 0)
        simData.spriteManager.generateCopter(x, y);
    } else {
        map.setTile(x + 1, y - 1, Tile.RADAR, Tile.CONDBIT | Tile.BURNBIT);
    }
  };


  var portFound = function(map, x, y, simData) {
    simData.census.seaportPop += 1;

    var tile = map.getTile(x, y);
    if (tile.isPowered() &&
        simData.spriteManager.getSprite(SpriteConstants.SPRITE_SHIP) === null)
      simData.spriteManager.generateShip();
  };


  var Transport = {
    registerHandlers: function(mapScanner, repairManager) {
      mapScanner.addAction(TileUtils.isRail, railFound);
      mapScanner.addAction(Tile.PORT, portFound);
      mapScanner.addAction(Tile.AIRPORT, airportFound);

      repairManager.addAction(Tile.PORT, 15, 4);
      repairManager.addAction(Tile.AIRPORT, 7, 6);
    }
  };


  return Transport;
});
