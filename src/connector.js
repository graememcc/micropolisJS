/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Tile } from './tile';
import { TileUtils } from './tileUtils';
import * as TileValues  from "./tileValues";

var RoadTable = [
  TileValues.ROADS, TileValues.ROADS2, TileValues.ROADS, TileValues.ROADS3,
  TileValues.ROADS2, TileValues.ROADS2, TileValues.ROADS4, TileValues.ROADS8,
  TileValues.ROADS, TileValues.ROADS6, TileValues.ROADS, TileValues.ROADS7,
  TileValues.ROADS5, TileValues.ROADS10, TileValues.ROADS9, TileValues.INTERSECTION
];

var RailTable = [
  TileValues.LHRAIL, TileValues.LVRAIL, TileValues.LHRAIL, TileValues.LVRAIL2,
  TileValues.LVRAIL, TileValues.LVRAIL, TileValues.LVRAIL3, TileValues.LVRAIL7,
  TileValues.LHRAIL, TileValues.LVRAIL5, TileValues.LHRAIL, TileValues.LVRAIL6,
  TileValues.LVRAIL4, TileValues.LVRAIL9, TileValues.LVRAIL8, TileValues.LVRAIL10
];

var WireTable = [
  TileValues.LHPOWER, TileValues.LVPOWER, TileValues.LHPOWER, TileValues.LVPOWER2,
  TileValues.LVPOWER, TileValues.LVPOWER, TileValues.LVPOWER3, TileValues.LVPOWER7,
  TileValues.LHPOWER, TileValues.LVPOWER5, TileValues.LHPOWER, TileValues.LVPOWER6,
  TileValues.LVPOWER4, TileValues.LVPOWER9, TileValues.LVPOWER8, TileValues.LVPOWER10
];


var fixSingle = function(x, y) {
  var adjTile = 0;
  var tile = this._worldEffects.getTile(x, y);

  tile = TileUtils.normalizeRoad(tile);

  if (tile >= TileValues.ROADS && tile <= TileValues.INTERSECTION) {
    if (y > 0) {
      tile = this._worldEffects.getTile(x, y - 1);
      tile = TileUtils.normalizeRoad(tile);

      if ((tile === TileValues.HRAILROAD || (tile >= TileValues.ROADBASE && tile <= TileValues.VROADPOWER)) &&
           tile !== TileValues.HROADPOWER && tile !== TileValues.VRAILROAD &&
           tile !== TileValues.ROADBASE)
        adjTile |= 1;
    }

    if (x < this._map.width - 1) {
      tile = this._worldEffects.getTile(x + 1, y);
      tile = TileUtils.normalizeRoad(tile);

      if ((tile === TileValues.VRAILROAD || (tile >= TileValues.ROADBASE && tile <= TileValues.VROADPOWER)) &&
          tile !== TileValues.VROADPOWER && tile !== TileValues.HRAILROAD &&
          tile !== TileValues.VBRIDGE)
        adjTile |= 2;
    }

    if (y < this._map.height - 1) {
      tile = this._worldEffects.getTile(x, y + 1);
      tile = TileUtils.normalizeRoad(tile);

      if ((tile === TileValues.HRAILROAD || (tile >= TileValues.ROADBASE && tile <= TileValues.VROADPOWER)) &&
          tile !== TileValues.HROADPOWER && tile !== TileValues.VRAILROAD &&
          tile !== TileValues.ROADBASE)
        adjTile |= 4;
    }

    if (x > 0) {
      tile = this._worldEffects.getTile(x - 1, y);
      tile = TileUtils.normalizeRoad(tile);

      if ((tile === TileValues.VRAILROAD || (tile >= TileValues.ROADBASE && tile <= TileValues.VROADPOWER)) &&
          tile !== TileValues.VROADPOWER && tile !== TileValues.HRAILROAD &&
          tile !== TileValues.VBRIDGE)
        adjTile |= 8;
    }

    this._worldEffects.setTile(x, y, RoadTable[adjTile] | Tile.BULLBIT | Tile.BURNBIT);
    return;
  }

  if (tile >= TileValues.LHRAIL && tile <= TileValues.LVRAIL10) {
      if (y > 0) {
        tile = this._worldEffects.getTile(x, y - 1);
        tile = TileUtils.normalizeRoad(tile);
        if (tile >= TileValues.RAILHPOWERV && tile <= TileValues.VRAILROAD &&
            tile !== TileValues.RAILHPOWERV && tile !== TileValues.HRAILROAD &&
            tile !== TileValues.HRAIL)
          adjTile |= 1;
      }

      if (x < this._map.width - 1) {
        tile = this._worldEffects.getTile(x + 1, y);
        tile = TileUtils.normalizeRoad(tile);
        if (tile >= TileValues.RAILHPOWERV && tile <= TileValues.VRAILROAD &&
            tile !== TileValues.RAILVPOWERH && tile !== TileValues.VRAILROAD &&
            tile !== TileValues.VRAIL)
          adjTile |= 2;
      }

      if (y < this._map.height - 1) {
        tile = this._worldEffects.getTile(x, y + 1);
        tile = TileUtils.normalizeRoad(tile);
        if (tile >= TileValues.RAILHPOWERV && tile <= TileValues.VRAILROAD &&
            tile !== TileValues.RAILHPOWERV && tile !== TileValues.HRAILROAD &&
            tile !== TileValues.HRAIL)
          adjTile |= 4;
      }

      if (x > 0) {
        tile = this._worldEffects.getTile(x - 1, y);
        tile = TileUtils.normalizeRoad(tile);
        if (tile >= TileValues.RAILHPOWERV && tile <= TileValues.VRAILROAD &&
            tile !== TileValues.RAILVPOWERH && tile !== TileValues.VRAILROAD &&
            tile !== TileValues.VRAIL)
          adjTile |= 8;
      }

    this._worldEffects.setTile(x, y, RailTable[adjTile] | Tile.BULLBIT | Tile.BURNBIT);
    return;
  }

  if (tile >= TileValues.LHPOWER && tile <= TileValues.LVPOWER10) {
    if (y > 0) {
      tile = this._worldEffects.getTile(x, y - 1);
      if (tile.isConductive()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== TileValues.VPOWER && tile !== TileValues.VROADPOWER && tile !== TileValues.RAILVPOWERH)
          adjTile |= 1;
      }
    }

    if (x < this._map.width - 1) {
      tile = this._worldEffects.getTile(x + 1, y);
      if (tile.isConductive()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== TileValues.HPOWER && tile !== TileValues.HROADPOWER && tile !== TileValues.RAILHPOWERV)
          adjTile |= 2;
      }
    }

    if (y < this._map.height - 1) {
      tile = this._worldEffects.getTile(x, y + 1);
      if (tile.isConductive()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== TileValues.VPOWER && tile !== TileValues.VROADPOWER && tile !== TileValues.RAILVPOWERH)
          adjTile |= 4;
      }
    }

    if (x > 0) {
      tile = this._worldEffects.getTile(x - 1, y);
      if (tile.isConductive()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== TileValues.HPOWER && tile !== TileValues.HROADPOWER && tile !== TileValues.RAILHPOWERV)
          adjTile |= 8;
      }
    }

    this._worldEffects.setTile(x, y, WireTable[adjTile] | Tile.BLBNCNBIT);
    return;
  }
};


var checkZoneConnections = function(x, y) {
  this.fixSingle(x, y);

  if (y > 0)
    this.fixSingle(x, y - 1);

  if (x < this._map.width - 1)
    this.fixSingle(x + 1, y);

  if (y < this._map.height - 1)
    this.fixSingle(x, y + 1);

  if (x > 0)
    this.fixSingle(x - 1, y);
};


var checkBorder = function(x, y, size) {
  // Adjust to top left tile
  x = x - 1;
  y = y - 1;

  var i;

  for (i = 0; i < size; i++)
    this.fixZone(x + i, y - 1);

  for (i = 0; i < size; i++)
    this.fixZone(x - 1, y + i);

  for (i = 0; i < size; i++)
    this.fixZone(x + i, y + size);

  for (i = 0; i < size; i++)
    this.fixZone(x + size, y + i);
};


// Note that this differs in style from BaseTool. After BaseTool has been called
// on an implementation, we have the following prototype chain:
//   toolConstructor -> {<prototype: empty object>} -> BaseToolImpl
// Following that idiom again would lead to difficulties regarding where to interpose
// the Connector implementation in the prototype chain, as really the BaseTool implementation
// and the Connector implementation should be singleton objects. Instead, we just add the required
// functions to the newly minted prototype
var Connector = function(toolConstructor) {
  toolConstructor.prototype.checkZoneConnections = checkZoneConnections;
  toolConstructor.prototype.fixSingle = fixSingle;
  toolConstructor.prototype.checkBorder = checkBorder;
  return toolConstructor;
};


export { Connector };
