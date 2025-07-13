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

import { ANIMBIT, POWERBIT } from "./tileFlags.ts";
import { FOOTBALLGAME1, FOOTBALLGAME2, FULLSTADIUM, STADIUM } from "./tileValues.ts";

var emptyStadiumFound = function(map, x, y, simData) {
  simData.census.stadiumPop += 1;

  if (map.getTile(x, y).isPowered()) {
    // Occasionally start the big game
    if (((simData.cityTime + x + y) & 31) === 0) {
      map.putZone(x, y, FULLSTADIUM, 4);
      map.addTileFlags(x, y, POWERBIT);
      map.setTile(x + 1, y, FOOTBALLGAME1, ANIMBIT);
      map.setTile(x + 1, y + 1, FOOTBALLGAME2, ANIMBIT);
    }
  }
};


var fullStadiumFound = function(map, x, y, simData) {
  simData.census.stadiumPop += 1;
  var isPowered = map.getTile(x, y).isPowered();

  if (((simData.cityTime + x + y) & 7) === 0) {
    map.putZone(x, y, STADIUM, 4);
    if (isPowered)
      map.addTileFlags(x, y, POWERBIT);
  }
};


var Stadia = {
  registerHandlers: function(mapScanner, repairManager) {
    mapScanner.addAction(STADIUM, emptyStadiumFound);
    mapScanner.addAction(FULLSTADIUM, fullStadiumFound);
    repairManager.addAction(STADIUM, 15, 4);
  }
};


export { Stadia };
