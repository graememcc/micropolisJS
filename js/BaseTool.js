/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Messages', 'MiscUtils', 'Tile', 'TileUtils', 'WorldEffects'],
       function(Messages, MiscUtils, Tile, TileUtils, WorldEffects) {
  "use strict";

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
    this.result = null;
  };


  var addCost = function(cost) {
    this._applicationCost += cost;
  };


  var doAutoBulldoze = function(x, y) {
    if (!this._shouldAutoBulldoze)
      return;

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


  var apply = function(budget, messageManager) {
    this._worldEffects.apply();
    budget.spend(this._applicationCost, messageManager);
    messageManager.sendMessage(Messages.DID_TOOL);
    this.clear();
  };


  var modifyIfEnoughFunding = function(budget, messageManager) {
    if (this.result !== this.TOOLRESULT_OK)
      return false;

    if (budget.totalFunds < this._applicationCost) {
      this.result = this.TOOLRESULT_NO_MONEY;
      return false;
    }

    apply.call(this, budget, messageManager);
    return true;
  };


  var TOOLRESULT_OK = 0;
  var TOOLRESULT_FAILED = 1;
  var TOOLRESULT_NO_MONEY = 2;
  var TOOLRESULT_NEEDS_BULLDOZE = 3;

  var BaseTool = {
    addCost: addCost,
    autoBulldoze: true,
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


  return {
    makeTool: function(toolConstructor) {
      toolConstructor.prototype = Object.create(BaseTool);
    },
    setAutoBulldoze: function(value) {
      BaseTool.autoBulldoze = value;
    }
  };
});
