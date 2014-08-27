/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['EventEmitter', 'Messages', 'MiscUtils'],
       function(EventEmitter, Messages, MiscUtils) {
  "use strict";

  function Budget() {
    Object.defineProperties(this,
     {MAX_ROAD_EFFECT: MiscUtils.makeConstantDescriptor(32),
      MAX_POLICESTATION_EFFECT: MiscUtils.makeConstantDescriptor(1000),
      MAX_FIRESTATION_EFFECT:  MiscUtils.makeConstantDescriptor(1000)});

    this.roadEffect = this.MAX_ROAD_EFFECT;
    this.policeEffect = this.MAX_POLICESTATION_EFFECT;
    this.fireEffect = this.MAX_FIRESTATION_EFFECT;
    this.totalFunds = 0;
    this.cityTax = 7;
    this.cashFlow = 0;
    this.taxFund = 0;

    // The 'fund's respresent the cost of funding all these services on
    // the map 100%
    this.roadFund = 0;
    this.fireFund = 0;
    this.policeFund = 0;

    // Percentage of budget used
    this.roadPercent = 1;
    this.firePercent = 1;
    this.policePercent = 1;

    // Cash value of spending. Should equal Math.round(_Fund * _Percent)
    this.roadSpend = 0;
    this.fireSpend = 0;
    this.policeSpend = 0;

    this.autoBudget = true;

    EventEmitter(this);
  }


  var RLevels = [0.7, 0.9, 1.2];
  var FLevels = [1.4, 1.2, 0.8];

  Budget.prototype.doBudget = function(messageManager) {
    return this.doBudgetNow(false, messageManager);
  };


  // User initiated budget
  Budget.prototype.doBudgetMenu = function(messageManager) {
    return this.doBudgetNow(false, messageManager);
  };


  Budget.prototype.doBudgetNow = function(fromWindow, messageManager) {
    // How much would we be spending based on current percentages?
    this.roadSpend = Math.round(this.roadFund * this.roadPercent);
    this.fireSpend = Math.round(this.fireFund * this.firePercent);
    this.policeSpend = Math.round(this.policeFund * this.policePercent);
    var total = this.roadSpend + this.fireSpend + this.policeSpend;

    // If we don't have any services on the map, we can bail early
    if (total === 0) {
      this.roadPercent = 1;
      this.firePercent = 1;
      this.policePercent = 1;
      this.roadEffect = this.MAX_ROAD_EFFECT;
      this.policeEffect = this.MAX_POLICESTATION_EFFECT;
      this.fireEffect = this.MAX_FIRESTATION_EFFECT;
    }

    var cashAvailable = this.totalFunds + this.taxFund;
    var cashRemaining = cashAvailable;

    // How much are we actually going to spend?
    var roadValue = 0;
    var fireValue = 0;
    var policeValue = 0;

    // Spending priorities: road, fire, police
    if (cashRemaining >= this.roadSpend)
      roadValue = this.roadSpend;
    else
      roadValue = cashRemaining;
    cashRemaining -= roadValue;

    if (cashRemaining >= this.fireSpend)
      fireValue = this.fireSpend;
    else
      fireValue = cashRemaining;
    cashRemaining -= fireValue;

    if (cashRemaining >= this.policeSpend)
      policeValue = this.policeSpend;
    else
      policeValue = cashRemaining;
    cashRemaining -= policeValue;

    if (this.roadFund > 0)
      this.roadPercent = new Number(roadValue / this.roadFund).toPrecision(2) - 0;
    else
      this.roadPercent = 1;

    if (this.fireFund > 0)
      this.firePercent = new Number(fireValue / this.fireFund).toPrecision(2) - 0;
    else
      this.fireFund = 1;

    if (this.policeFund > 0)
      this.policePercent = new Number(policeValue / this.policeFund).toPrecision(2) - 0;
    else
      this.policeFund = 1;

    if (!this.autoBudget || fromWindow) {
      // If we were called as the result of a manual budget,
      // go ahead and spend the money
      if (!fromWindow) {
        this.doBudgetSpend(roadValue, fireValue, policeValue, this.cityTax, messageManager);
      }
      return;
    }

    // Autobudget
    if (cashAvailable >= total) {
      // We were able to fully fund services. Go ahead and spend
      this.doBudgetSpend(roadValue, fireValue, policeValue, this.cityTax, messageManager);
      return;
    }

    // Uh-oh. Not enough money. Make this the user's problem.
    // They don't know it yet, but they're about to get a budget window.
    this.autoBudget = false;
    this._emitEvent(Messages.AUTOBUDGET_CHANGED, this.autoBudget);
    this._emitEvent(Messages.BUDGET_NEEDED);
    this._emitEvent(Messages.NO_MONEY);
  };


  Budget.prototype.doBudgetSpend = function(roadValue, fireValue, policeValue, taxRate, messageManager) {
    this.roadSpend = roadValue;
    this.fireSpend = fireValue;
    this.policeSpend = policeValue;
    this.setTax(taxRate);
    var total = this.roadSpend + this.fireSpend + this.policeSpend;

    this.spend(-(this.taxFund - total), messageManager);
    this.updateFundEffects();
  };


  Budget.prototype.updateFundEffects = function() {
    // Update effects
    this.roadEffect = this.MAX_ROAD_EFFECT;
    this.policeEffect = this.MAX_POLICESTATION_EFFECT;
    this.fireEffect = this.MAX_FIRESTATION_EFFECT;

    if (this.roadFund > 0)
      this.roadEffect = Math.floor(this.roadEffect * this.roadSpend / this.roadFund);

    if (this.fireFund > 0)
      this.fireEffect = Math.floor(this.fireEffect * this.fireSpend / this.fireFund);

    if (this.policeFund > 0)
      this.policeEffect = Math.floor(this.policeEffect * this.policeSpend / this.policeFund);
  };


  Budget.prototype.collectTax = function(gameLevel, census, messageManager) {
    this.cashFlow = 0;

    this.policeFund = census.policeStationPop * 100;
    this.fireFund = census.fireStationPop * 100;
    this.roadFund = Math.floor((census.roadTotal + (census.railTotal * 2)) * RLevels[gameLevel]);
    this.taxFund = Math.floor(Math.floor(census.totalPop * census.landValueAverage / 120) * this.cityTax * FLevels[gameLevel]);

    if (census.totalPop > 0) {
      this.cashFlow = this.taxFund - (this.policeFund + this.fireFund + this.roadFund);
      this.doBudget(messageManager);
    } else {
      // We don't want roads etc deteriorating when population hasn't yet been established
      // (particularly early game)
      this.roadEffect   = this.MAX_ROAD_EFFECT;
      this.policeEffect = this.MAX_POLICESTATION_EFFECT;
      this.fireEffect   = this.MAX_FIRESTATION_EFFECT;
    }
  };


  Budget.prototype.setTax = function(amount, messageManager) {
    if (amount === this.cityTax)
      return;

    this.cityTax = amount;
  };


  Budget.prototype.setFunds = function(amount, messageManager) {
    if (amount === this.totalFunds)
      return;

    this.totalFunds = Math.max(0, amount);

    this._emitEvent(Messages.FUNDS_CHANGED, this.totalFunds);
  };


  Budget.prototype.spend = function(amount, messageManager) {
    this.setFunds(this.totalFunds - amount, messageManager);
  };


  Budget.prototype.shouldDegradeRoad = function() {
    return this.roadEffect < Math.floor(15 * this.MAX_ROAD_EFFECT / 16);
  };


  return Budget;
});
