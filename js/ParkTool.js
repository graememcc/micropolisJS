/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['BaseTool', 'Random', 'Tile', 'TileUtils'],
       function(BaseTool, Random, Tile, TileUtils) {
  "use strict";

  function ParkTool(map) {
    this.init(10, map, true);
  }


  BaseTool.makeTool(ParkTool);


  ParkTool.prototype.doTool = function(x, y, messageManager, blockMaps) {
    var value = Random.getRandom(4);
    var tileFlags = Tile.BURNBIT | Tile.BULLBIT;
    var tileValue;

    if (value === 4) {
      tileValue = Tile.FOUNTAIN;
      tileFlags |= Tile.ANIMBIT;
    } else {
      tileValue = value + Tile.WOODS2;
    }

    this._worldEffects.setTile(x, y, tileValue, tileFlags);
    this.addCost(10);
    this.result = this.TOOLRESULT_OK;
  };


  return ParkTool;
});
