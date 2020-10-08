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

var BuildingTool = ConnectingTool(function(cost, centreTile, map, size, animated) {
  this.init(cost, map, false);
  this.centreTile = centreTile;
  this.size = size;
  this.animated = animated;
});


BuildingTool.prototype.putBuilding = function(leftX, topY) {
  var posX, posY, tileValue, tileFlags;
 // var baseTile = this.centreTile - this.size - 1;
 var baseTile;

 /* if(this.centreTile == Tile.FREEF || this.centreTile == Tile.FREEINDF){
    if(!confirm("Building a WWTP field?")){
        this.centreTile = Tile.FREEINDF;
    }else this.centreTile = Tile.FREEF;
  }*/
  baseTile = this.centreTile - this.size - 1;

  for (var dy = 0; dy < this.size; dy++) {
    posY = topY + dy;

    for (var dx = 0; dx < this.size; dx++) {
      posX = leftX + dx;
      tileValue = baseTile;

      if(TileUtils.isIndField(tileValue)){
        tileFlags = Tile.BNHYBIT;
      }else{
      if (TileUtils.isField(tileValue) || (tileValue>=Tile.WWTPBASE && tileValue<=Tile.LASTWWTP))
        tileFlags = Tile.BNHYBIT;
      else
        tileFlags = Tile.BNCNBIT;
      }
            
      if (dx === 1) {
        if (dy === 1)
          tileFlags |= Tile.ZONEBIT;
        else if (dy === 2 && this.animated)
          tileFlags |= Tile.ANIMBIT;
      }

      this._worldEffects.setTile(posX, posY, tileValue, tileFlags);

      baseTile++;
    }
  }
};


BuildingTool.prototype.prepareBuildingSite = function(leftX, topY) {
  // Check that the entire site is on the map
  if (leftX < 0 || leftX + this.size > this._map.width)
    return this.TOOLRESULT_FAILED;

  if (topY < 0 || topY + this.size > this._map.height)
    return this.TOOLRESULT_FAILED;

  var posX, posY, tileValue;

  // Check whether the tiles are clear
  for (var dy = 0; dy < this.size; dy++) {
    posY = topY + dy;

    for (var dx = 0; dx < this.size; dx++) {
      posX = leftX + dx;

      tileValue = this._worldEffects.getTileValue(posX, posY);

      if (tileValue === Tile.DIRT)
        continue;

      if (!this.autoBulldoze) {
        // No Tile.DIRT and no bull-dozer => not buildable
        return this.TOOLRESULT_NEEDS_BULLDOZE;
      }

      if (!TileUtils.canBulldoze(tileValue)) {
        // tilevalue cannot be auto-bulldozed
        return this.TOOLRESULT_NEEDS_BULLDOZE;
      }

      this._worldEffects.setTile(posX, posY, Tile.DIRT);
      this.addCost(this.bulldozerCost);
    }
  }

  return this.TOOLRESULT_OK;
};


BuildingTool.prototype.buildBuilding = function(x, y) {
  // Correct to top left
  x--;
  y--;

  var prepareResult = this.prepareBuildingSite(x, y);
  if (prepareResult !== this.TOOLRESULT_OK)
    return prepareResult;

  this.addCost(this.toolCost);

  this.putBuilding(x, y);

  this.checkBorder(x, y);

  return this.TOOLRESULT_OK;
};


BuildingTool.prototype.doTool = function(x, y, blockMaps) {
  this.result = this.buildBuilding(x, y);
};


export { BuildingTool };
