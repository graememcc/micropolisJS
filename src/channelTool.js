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

var ChannelTool = ConnectingTool(function(map) {
  this.init(5, map, true, true);
});


ChannelTool.prototype.layChannel = function(x, y) {
  this.doAutoBulldoze(x, y);
  var cost = this.toolCost;

  var tile = this._worldEffects.getTileValue(x, y);
  tile = TileUtils.normalizeRoad(tile);

  switch (tile) {
    case Tile.DIRT:
      this._worldEffects.setTile(x, y, Tile.LHPOWER, Tile.IRRIGIT | Tile.BURNBIT | Tile.BULLBIT); 
      break;                  //cambiare lhpower con un tile che sia del canale di irrigaz

    case Tile.RIVER:
    case Tile.REDGE:
    case Tile.CHANNEL:
      cost = 25;

      if (x < this._map.width - 1) {
        tile = this._worldEffects.getTile(x + 1, y);
        if (tile.isHydraulic()) {
          tile = tile.getValue();
          tile = TileUtils.normalizeRoad(tile);
          if (tile != Tile.HROADPOWER && tile != Tile.RAILHPOWERV && tile != Tile.HPOWER) { ////cambio tile
            this._worldEffects.setTile(x, y, Tile.VPOWER, Tile.HYDRABIT | Tile.BULLBIT);
            break;
          }
        }
      }

      if (x > 0) {
        tile = this._worldEffects.getTile(x - 1, y);
        if (tile.isHydraulic()) {
          tile = tile.getValue();
          tile = TileUtils.normalizeRoad(tile);
          if (tile != Tile.HROADPOWER && tile != Tile.RAILHPOWERV && tile != Tile.HPOWER) {
            this._worldEffects.setTile(x, y, Tile.VPOWER, Tile.HYDRABIT | Tile.BULLBIT);
            break;
          }
        }
      }

      if (y < this._map.height - 1) {
        tile = this._worldEffects.getTile(x, y + 1);
        if (tile.isHydraulic()) {
          tile = tile.getValue();
          tile = TileUtils.normalizeRoad(tile);
          if (tile != Tile.VROADPOWER && tile != Tile.RAILVPOWERH && tile != Tile.VPOWER) {
            this._worldEffects.setTile(x, y, Tile.HPOWER, Tile.HYDRABIT | Tile.BULLBIT);
            break;
          }
        }
      }

      if (y > 0) {
        tile = this._worldEffects.getTile(x, y - 1);
        if (tile.isHydraulic()) {
          tile = tile.getValue();
          tile = TileUtils.normalizeRoad(tile);
          if (tile != Tile.VROADPOWER && tile != Tile.RAILVPOWERH && tile != Tile.VPOWER) {
            this._worldEffects.setTile(x, y, Tile.HPOWER, Tile.HYDRABIT | Tile.BULLBIT);
            break;
          }
        }
      }

      return this.TOOLRESULT_FAILED;
      ///cambio tile
    case Tile.ROADS:
      this._worldEffects.setTile(x, y, Tile.HROADPOWER, Tile.HYDRABIT | Tile.BURNBIT | Tile.BULLBIT);
      break;

    case Tile.ROADS2:
      this._worldEffects.setTile(x, y, Tile.VROADPOWER, Tile.HYDRABIT | Tile.BURNBIT | Tile.BULLBIT);
      break;

    case Tile.LHRAIL:
      this._worldEffects.setTile(x, y, Tile.RAILHPOWERV, Tile.HYDRABIT | Tile.BURNBIT | Tile.BULLBIT);
      break;

    case Tile.LVRAIL:
      this._worldEffects.setTile(x, y, Tile.RAILVPOWERH, Tile.HYDRABIT | Tile.BURNBIT | Tile.BULLBIT);
      break;

    default:
      return this.TOOLRESULT_FAILED;
  }

  this.addCost(cost);
  this.checkZoneConnections(x, y);
  return this.TOOLRESULT_OK;
};


ChannelTool.prototype.doTool = function(x, y, blockMaps) {
  this.result = this.layChannel(x, y);
};


export { ChannelTool };
