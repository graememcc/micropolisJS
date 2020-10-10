/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Messages } from './messages';
import { MiscUtils } from './miscUtils';
import { Tile } from './tile';
import { TileUtils } from './tileUtils';
import { WorldEffects } from './worldEffects';

var init = function(cost, map, shouldAutoBulldoze, isDraggable) {
  isDraggable = isDraggable || false;
  Object.defineProperty(this, 'toolCost', MiscUtils.makeConstantDescriptor(cost));
  this.result = null;
  this.isDraggable = isDraggable;
  this._shouldAutoBulldoze = shouldAutoBulldoze;
  this._map = map;
  this._worldEffects = new WorldEffects(map);
  this._applicationCost = 0;
};


var clear = function() {
  this._applicationCost = 0;
  this._worldEffects.clear();
};


var addCost = function(cost) {
  this._applicationCost += cost;
};


var doAutoBulldoze = function(x, y) {
  var tile = this._worldEffects.getTile(x, y);
  if (tile.isBulldozable()) {
    tile = TileUtils.normalizeRoad(tile);
    if ((tile >= Tile.TINYEXP && tile <= Tile.LASTTINYEXP) ||
        (tile < Tile.HBRIDGE && tile !== Tile.DIRT)) {
      this.addCost(1);
      this._worldEffects.setTile(x, y, Tile.DIRT);
    }
  }
};

var cropcost = function(x, y) {
  var tile = this._worldEffects.getTile(x, y);
    tile = TileUtils.normalizeRoad(tile);
    switch (tile) {
      case Tile.CORN: 
      case Tile.FCORN:
        setCropCost(CORN_COST); break;

      case Tile.WHEAT:
      case Tile.FWHEAT:
        setCropCost(WHEAT_COST); break;

      case Tile.ORCHARD:
      case Tile.FORCHARD:
        setCropCost(ORCHARD_COST); break;

      case Tile.POTATO: 
      case Tile.FPOTATO: 
        setCropCost(POTATO_COST); break;
    }
};


var apply = function(budget) {
  this._worldEffects.apply();
  budget.spend(this._applicationCost);
  this.clear();
};


var modifyIfEnoughFunding = function(budget) {
  if (this.result !== this.TOOLRESULT_OK) {
    this.clear();
    return false;
  }

  if (budget.totalFunds < this._applicationCost) {
    this.result = this.TOOLRESULT_NO_MONEY;
    this.clear();
    return false;
  }

  apply.call(this, budget);
  this.clear();
  return true;
};

var CORN_COST = 50;
var WHEAT_COST = 100;
var ORCHARD_COST = 150;
var POTATO_COST = 200;

var TOOLRESULT_OK = 0;
var TOOLRESULT_FAILED = 1;
var TOOLRESULT_NO_MONEY = 2;
var TOOLRESULT_NEEDS_BULLDOZE = 3;

var BaseToolConstructor = {
  addCost: addCost,
  autoBulldoze: true,
  wwtp: true,
  cropcost: cropcost,
  bulldozerCost: 1,
  clear: clear,
  doAutoBulldoze: doAutoBulldoze,
  init: init,
  modifyIfEnoughFunding: modifyIfEnoughFunding,
  TOOLRESULT_OK: TOOLRESULT_OK,
  TOOLRESULT_FAILED: TOOLRESULT_FAILED,
  TOOLRESULT_NO_MONEY: TOOLRESULT_NO_MONEY,
  TOOLRESULT_NEEDS_BULLDOZE: TOOLRESULT_NEEDS_BULLDOZE
};


var save = function(saveData) {
  saveData.autoBulldoze = BaseToolConstructor.autoBulldoze;
};


var load = function(saveData) {
  BaseTool.autoBulldoze = saveData.autoBulldoze;
};


var makeTool = function(toolConstructor) {
  toolConstructor.prototype = Object.create(BaseToolConstructor);
  return toolConstructor;
};


var BaseTool = {
  makeTool: makeTool,
  setCropCost: function(value){
    BaseToolConstructor.cropcost = value;
},
  getCropCost: function() {
  return BaseToolConstructor.cropcost;
},
  setWWTP: function(value){
      BaseToolConstructor.wwtp = value;
  },
  getWWTP: function() {
    return BaseToolConstructor.wwtp;
  },
  setAutoBulldoze: function(value) {
    BaseToolConstructor.autoBulldoze = value;
  },
  getAutoBulldoze: function() {
    return BaseToolConstructor.autoBulldoze;
  },
  save: save,
  load: load,
  CORN_COST : CORN_COST,
  WHEAT_COST : WHEAT_COST,
  ORCHARD_COST : ORCHARD_COST,
  POTATO_COST : POTATO_COST
};

export { BaseTool };
