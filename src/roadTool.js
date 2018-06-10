/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { ConnectingTool } from './connectingTool';
import { Tile } from './tile';
import { TileUtils } from './tileUtils';
import * as TileValues from "./tileValues";

var RoadTool = ConnectingTool(function(map) {
  this.init(10, map, true, true);
});


RoadTool.prototype.layRoad = function(x, y) {
  this.doAutoBulldoze(x, y);
  var tile = this._worldEffects.getTileValue(x, y);
  var cost = this.toolCost;

  switch (tile) {
    case TileValues.DIRT:
      this._worldEffects.setTile(x, y, TileValues.ROADS, Tile.BULLBIT | Tile.BURNBIT);
      break;

    case TileValues.RIVER:
    case TileValues.REDGE:
    case TileValues.CHANNEL:
      cost = 50;

      if (x < this._map.width - 1) {
        tile = this._worldEffects.getTileValue(x + 1, y);
        tile = TileUtils.normalizeRoad(tile);

        if (tile === TileValues.VRAILROAD || tile === TileValues.HBRIDGE ||
            (tile >= TileValues.ROADS && tile <= TileValues.HROADPOWER)) {
          this._worldEffects.setTile(x, y, TileValues.HBRIDGE, Tile.BULLBIT);
          break;
        }
      }

      if (x > 0) {
        tile = this._worldEffects.getTileValue(x - 1, y);
        tile = TileUtils.normalizeRoad(tile);

        if (tile === TileValues.VRAILROAD || tile === TileValues.HBRIDGE ||
            (tile >= TileValues.ROADS && tile <= TileValues.INTERSECTION)) {
          this._worldEffects.setTile(x, y, TileValues.HBRIDGE, Tile.BULLBIT);
          break;
        }
      }

      if (y < this._map.height - 1) {
        tile = this._worldEffects.getTileValue(x, y + 1);
        tile = TileUtils.normalizeRoad(tile);

        if (tile === TileValues.HRAILROAD || tile === TileValues.VROADPOWER ||
            (tile >= TileValues.VBRIDGE && tile <= TileValues.INTERSECTION)) {
          this._worldEffects.setTile(x, y, TileValues.VBRIDGE, Tile.BULLBIT);
          break;
        }
      }

      if (y > 0) {
        tile = this._worldEffects.getTileValue(x, y - 1);
        tile = TileUtils.normalizeRoad(tile);

        if (tile === TileValues.HRAILROAD || tile === TileValues.VROADPOWER ||
            (tile >= TileValues.VBRIDGE && tile <= TileValues.INTERSECTION)) {
          this._worldEffects.setTile(x, y, TileValues.VBRIDGE, Tile.BULLBIT);
          break;
        }
      }

      return this.TOOLRESULT_FAILED;

    case TileValues.LHPOWER:
      this._worldEffects.setTile(x, y, TileValues.VROADPOWER | Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT);
      break;

    case TileValues.LVPOWER:
      this._worldEffects.setTile(x, y, TileValues.HROADPOWER | Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT);
      break;

    case TileValues.LHRAIL:
      this._worldEffects.setTile(x, y, TileValues.HRAILROAD | Tile.BURNBIT | Tile.BULLBIT);
      break;

    case TileValues.LVRAIL:
      this._worldEffects.setTile(x, y, TileValues.VRAILROAD | Tile.BURNBIT | Tile.BULLBIT);
      break;

    default:
      return this.TOOLRESULT_FAILED;
  }

  this.addCost(cost);
  this.checkZoneConnections(x, y);
  return this.TOOLRESULT_OK;
};


RoadTool.prototype.doTool = function(x, y, blockMaps) {
  this.result = this.layRoad(x, y);
};


export { RoadTool };
