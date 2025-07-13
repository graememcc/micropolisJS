/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { ConnectingTool } from './connectingTool.js';
import { BULLBIT, BURNBIT, CONDBIT } from "./tileFlags.ts";
import { TileUtils } from './tileUtils.js';
import * as TileValues from "./tileValues.ts";

var RailTool = ConnectingTool(function(map) {
  this.init(20, map, true, true);
});


RailTool.prototype.layRail = function(x, y) {
  this.doAutoBulldoze(x, y);
  var tile = this._worldEffects.getTileValue(x, y);
  tile = TileUtils.normalizeRoad(tile);
  var cost = this.toolCost;

  switch (tile) {
    case TileValues.DIRT:
      this._worldEffects.setTile(x, y, TileValues.LHRAIL, BULLBIT | BURNBIT);
      break;

    case TileValues.RIVER:
    case TileValues.REDGE:
    case TileValues.CHANNEL:
        cost = 100;

        if (x < this._map.width - 1) {
          tile = this._worldEffects.getTileValue(x + 1, y);
          tile = TileUtils.normalizeRoad(tile);
          if (tile == TileValues.RAILHPOWERV || tile == TileValues.HRAIL ||
              (tile >= TileValues.LHRAIL && tile <= TileValues.HRAILROAD)) {
            this._worldEffects.setTile(x, y, TileValues.HRAIL, BULLBIT);
            break;
          }
        }

        if (x > 0) {
          tile = this._worldEffects.getTileValue(x - 1, y);
          tile = TileUtils.normalizeRoad(tile);
          if (tile == TileValues.RAILHPOWERV || tile == TileValues.HRAIL ||
              (tile > TileValues.VRAIL && tile < TileValues.VRAILROAD)) {
            this._worldEffects.setTile(x, y, TileValues.HRAIL, BULLBIT);
            break;
          }
        }

        if (y < this._map.height - 1) {
          tile = this._worldEffects.getTileValue(x, y + 1);
          tile = TileUtils.normalizeRoad(tile);
          if (tile == TileValues.RAILVPOWERH || tile == TileValues.VRAILROAD ||
              (tile > TileValues.HRAIL && tile < TileValues.HRAILROAD)) {
            this._worldEffects.setTile(x, y, TileValues.VRAIL, BULLBIT);
            break;
          }
        }

        if (y > 0) {
          tile = this._worldEffects.getTileValue(x, y - 1);
          tile = TileUtils.normalizeRoad(tile);
          if (tile == TileValues.RAILVPOWERH || tile == TileValues.VRAILROAD ||
              (tile > TileValues.HRAIL && tile < TileValues.HRAILROAD)) {
            this._worldEffects.setTile(x, y, TileValues.VRAIL, BULLBIT);
            break;
          }
        }

        return this.TOOLRESULT_FAILED;

      case TileValues.LHPOWER:
        this._worldEffects.setTile(x, y, TileValues.RAILVPOWERH, CONDBIT | BURNBIT | BULLBIT);
        break;

      case TileValues.LVPOWER:
        this._worldEffects.setTile(x, y, TileValues.RAILHPOWERV, CONDBIT | BURNBIT | BULLBIT);
        break;

      case TileValues.ROADS:
        this._worldEffects.setTile(x, y, TileValues.VRAILROAD, BURNBIT | BULLBIT);
        break;

      case TileValues.ROADS2:
        this._worldEffects.setTile(x, y, TileValues.HRAILROAD, BURNBIT | BULLBIT);
        break;

      default:
        return this.TOOLRESULT_FAILED;
    }

    this.addCost(cost);
    this.checkZoneConnections(x, y);
    return this.TOOLRESULT_OK;
};



RailTool.prototype.doTool = function(x, y, blockMaps) {
  this.result = this.layRail(x, y);
};


export { RailTool };
