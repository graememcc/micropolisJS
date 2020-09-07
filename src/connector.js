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

var RoadTable = [
  Tile.ROADS, Tile.ROADS2, Tile.ROADS, Tile.ROADS3,
  Tile.ROADS2, Tile.ROADS2, Tile.ROADS4, Tile.ROADS8,
  Tile.ROADS, Tile.ROADS6, Tile.ROADS, Tile.ROADS7,
  Tile.ROADS5, Tile.ROADS10, Tile.ROADS9, Tile.INTERSECTION
];

var RailTable = [
  Tile.LHRAIL, Tile.LVRAIL, Tile.LHRAIL, Tile.LVRAIL2,
  Tile.LVRAIL, Tile.LVRAIL, Tile.LVRAIL3, Tile.LVRAIL7,
  Tile.LHRAIL, Tile.LVRAIL5, Tile.LHRAIL, Tile.LVRAIL6,
  Tile.LVRAIL4, Tile.LVRAIL9, Tile.LVRAIL8, Tile.LVRAIL10
];

var WireTable = [
  Tile.LHPOWER, Tile.LVPOWER, Tile.LHPOWER, Tile.LVPOWER2,
  Tile.LVPOWER, Tile.LVPOWER, Tile.LVPOWER3, Tile.LVPOWER7,
  Tile.LHPOWER, Tile.LVPOWER5, Tile.LHPOWER, Tile.LVPOWER6,
  Tile.LVPOWER4, Tile.LVPOWER9, Tile.LVPOWER8, Tile.LVPOWER10
];

var ChannelTable = [         
  Tile.LHTUBE, Tile.LVTUBE, Tile.LHTUBE, Tile.LVTUBE2,
  Tile.LVTUBE, Tile.LVTUBE, Tile.LVTUBE3, Tile.LVTUBE7,
  Tile.LHTUBE, Tile.LVTUBE5, Tile.LHTUBE, Tile.LVTUBE6,
  Tile.LVTUBE4, Tile.LVTUBE9, Tile.LVTUBE8, Tile.LVTUBE10
];

var fixSingle = function(x, y) {
  var adjTile = 0;
  var tile = this._worldEffects.getTile(x, y);

  tile = TileUtils.normalizeRoad(tile);

  if (tile >= Tile.ROADS && tile <= Tile.INTERSECTION) {
    if (y > 0) {
      tile = this._worldEffects.getTile(x, y - 1);
      tile = TileUtils.normalizeRoad(tile);

      if ((tile === Tile.HRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) &&
           tile !== Tile.HROADPOWER && tile !== Tile.VRAILROAD &&
           tile !== Tile.ROADBASE)
        adjTile |= 1;
    }

    if (x < this._map.width - 1) {
      tile = this._worldEffects.getTile(x + 1, y);
      tile = TileUtils.normalizeRoad(tile);

      if ((tile === Tile.VRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) &&
          tile !== Tile.VROADPOWER && tile !== Tile.HRAILROAD &&
          tile !== Tile.VBRIDGE)
        adjTile |= 2;
    }

    if (y < this._map.height - 1) {
      tile = this._worldEffects.getTile(x, y + 1);
      tile = TileUtils.normalizeRoad(tile);

      if ((tile === Tile.HRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) &&
          tile !== Tile.HROADPOWER && tile !== Tile.VRAILROAD &&
          tile !== Tile.ROADBASE)
        adjTile |= 4;
    }

    if (x > 0) {
      tile = this._worldEffects.getTile(x - 1, y);
      tile = TileUtils.normalizeRoad(tile);

      if ((tile === Tile.VRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) &&
          tile !== Tile.VROADPOWER && tile !== Tile.HRAILROAD &&
          tile !== Tile.VBRIDGE)
        adjTile |= 8;
    }

    this._worldEffects.setTile(x, y, RoadTable[adjTile] | Tile.BULLBIT | Tile.BURNBIT);
    return;
  }
/*
  if (tile >= Tile.LHRAIL && tile <= Tile.LVRAIL10) {
      if (y > 0) {
        tile = this._worldEffects.getTile(x, y - 1);
        tile = TileUtils.normalizeRoad(tile);
        if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD &&
            tile !== Tile.RAILHPOWERV && tile !== Tile.HRAILROAD &&
            tile !== Tile.HRAIL)
          adjTile |= 1;
      }

      if (x < this._map.width - 1) {
        tile = this._worldEffects.getTile(x + 1, y);
        tile = TileUtils.normalizeRoad(tile);
        if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD &&
            tile !== Tile.RAILVPOWERH && tile !== Tile.VRAILROAD &&
            tile !== Tile.VRAIL)
          adjTile |= 2;
      }

      if (y < this._map.height - 1) {
        tile = this._worldEffects.getTile(x, y + 1);
        tile = TileUtils.normalizeRoad(tile);
        if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD &&
            tile !== Tile.RAILHPOWERV && tile !== Tile.HRAILROAD &&
            tile !== Tile.HRAIL)
          adjTile |= 4;
      }

      if (x > 0) {
        tile = this._worldEffects.getTile(x - 1, y);
        tile = TileUtils.normalizeRoad(tile);
        if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD &&
            tile !== Tile.RAILVPOWERH && tile !== Tile.VRAILROAD &&
            tile !== Tile.VRAIL)
          adjTile |= 8;
      }

    this._worldEffects.setTile(x, y, RailTable[adjTile] | Tile.BULLBIT | Tile.BURNBIT);
    return;
  }
*/
  if (tile >= Tile.LHPOWER && tile <= Tile.LVPOWER10) {
    if (y > 0) {
      tile = this._worldEffects.getTile(x, y - 1);
      if (tile.isConductive()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== Tile.VPOWER && tile !== Tile.VROADPOWER && tile !== Tile.RAILVPOWERH)
          adjTile |= 1;
      }
    }

    if (x < this._map.width - 1) {
      tile = this._worldEffects.getTile(x + 1, y);
      if (tile.isConductive()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== Tile.HPOWER && tile !== Tile.HROADPOWER && tile !== Tile.RAILHPOWERV)
          adjTile |= 2;
      }
    }

    if (y < this._map.height - 1) {
      tile = this._worldEffects.getTile(x, y + 1);
      if (tile.isConductive()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== Tile.VPOWER && tile !== Tile.VROADPOWER && tile !== Tile.RAILVPOWERH)
          adjTile |= 4;
      }
    }

    if (x > 0) {
      tile = this._worldEffects.getTile(x - 1, y);
      if (tile.isConductive()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== Tile.HPOWER && tile !== Tile.HROADPOWER && tile !== Tile.RAILHPOWERV)
          adjTile |= 8;
      }
    }

    this._worldEffects.setTile(x, y, WireTable[adjTile] | Tile.BLBNCNBIT);
    return;
  }

  if (tile >= Tile.LHTUBE && tile <= Tile.LVTUBE10) { 
    if (y > 0) {
      tile = this._worldEffects.getTile(x, y - 1);
      if (tile.isHydraulic()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== Tile.VTUBE && tile !== Tile.VROADTUBE && tile !== Tile.RAILVTUBEH)
          adjTile |= 1;
      }
    }

    if (x < this._map.width - 1) {
      tile = this._worldEffects.getTile(x + 1, y);
      if (tile.isHydraulic()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== Tile.HTUBE && tile !== Tile.HROADTUBE && tile !== Tile.RAILHTUBEV)
          adjTile |= 2;
      }
    }

    if (y < this._map.height - 1) {
      tile = this._worldEffects.getTile(x, y + 1);
      if (tile.isHydraulic()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== Tile.VTUBE && tile !== Tile.VROADTUBE && tile !== Tile.RAILVTUBEH)
          adjTile |= 4;
      }
    }

    if (x > 0) {
      tile = this._worldEffects.getTile(x - 1, y);
      if (tile.isHydraulic()) {
        tile = tile.getValue();
        tile = TileUtils.normalizeRoad(tile);
        if (tile !== Tile.HTUBE && tile !== Tile.HROADTUBE && tile !== Tile.RAILHTUBEV)
          adjTile |= 8;
      }
    }

    this._worldEffects.setTile(x, y, ChannelTable[adjTile] | Tile.BLBNHYBIT);
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
