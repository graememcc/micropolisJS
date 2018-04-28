/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(function(require, exports, module) {
  "use strict";


  var BaseTool = require('./BaseTool');
  var Random = require('./Random');
  var Tile = require('./Tile');
  var TileUtils = require('./TileUtils');

  var makeTool = BaseTool.makeTool;
  var ParkTool = makeTool(function(map) {
    this.init(10, map, true);
  });


  ParkTool.prototype.doTool = function(x, y, blockMaps) {
    if (this._worldEffects.getTileValue(x, y) !== Tile.DIRT) {
      this.result = this.TOOLRESULT_NEEDS_BULLDOZE;
      return;
    }

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
