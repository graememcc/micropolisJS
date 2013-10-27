/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define([],
       function() {
  "use strict";

  function BudgetWindow(opacityLayerID, budgetWindowID) {
    this._opacityLayer =  '#' + opacityLayerID;
    this._budgetWindowID = '#' + budgetWindowID;
  }


  var dataKeys = ['roadFund', 'fireFund', 'policeFund'];
  var spendKeys = ['roadRate', 'fireRate', 'policeRate'];
  var budgetResetID = 'budgetReset';
  var budgetCancelID = 'budgetCancel';
  var budgetOKID = 'budgetOK';
  var budgetFormID = 'budgetForm';


  var setSpendRangeText = function(element, percentage, totalSpend) {
    var labelID = element + 'Label';
    var cash = Math.floor(totalSpend * (percentage / 100));
    var text = [percentage, '% of $', totalSpend, ' = $', cash].join('');
    $('#' + labelID).text(text);
  };


  var onFundingUpdate = function(elementID, e) {
    var element = $('#' + elementID)[0];
    var percentage = element.value - 0;
    var dataSource = element.getAttribute('data-source');
    setSpendRangeText(elementID, percentage, this[dataSource]);
  };


  var onTaxUpdate = function(e) {
    var elem = $('#taxRateLabel')[0];
    var sourceElem = $('#taxRate')[0];
    $(elem).text(['Tax rate: ', sourceElem.value, '%'].join(''));
  };


  var resetItems = function(e) {
    for (var i = 0; i < spendKeys.length; i++) {
      var original = this['original' + spendKeys[i]];
      $('#' + spendKeys[i])[0].value = original;
      setSpendRangeText(spendKeys[i], original, this[dataKeys[i]]);
    }
    $('#taxRate')[0].value = this.originaltaxRate;
    onTaxUpdate();

    e.preventDefault();
  };


  var cancel = function(e) {
    e.preventDefault();
    this._callback(true, null);

    var toRemove = [budgetResetID, budgetOKID, 'taxRate',
                    'roadRate', 'fireRate', 'policeRate'];

    for (var i = 0, l = toRemove.length; i < l; i++)
      $('#' + toRemove[i]).off();

    this._toggleDisplay();
  };


  var submit = function(e) {
    e.preventDefault();

    // Get element values
    var roadPercent = $('#roadRate')[0].value;
    var firePercent = $('#fireRate')[0].value;
    var policePercent = $('#policeRate')[0].value;
    var taxPercent = $('#taxRate')[0].value;

    this._callback(false, {roadPercent: roadPercent, firePercent: firePercent,
                          policePercent: policePercent, taxPercent: taxPercent});

    var toRemove = [budgetResetID, budgetCancelID, 'taxRate',
                    'roadRate', 'fireRate', 'policeRate'];

    for (var i = 0, l = toRemove.length; i < l; i++)
      $('#' + toRemove[i]).off();

    this._toggleDisplay();
  };


  BudgetWindow.prototype._toggleDisplay = function() {
    var opacityLayer = $(this._opacityLayer);
    opacityLayer = opacityLayer.length === 0 ? null : opacityLayer;
    if (opacityLayer === null)
      throw new Error('Node ' + orig + ' not found');

    var budgetWindow = $(this._budgetWindowID);
    budgetWindow = budgetWindow.length === 0 ? null : budgetWindow;
    if (budgetWindow === null)
      throw new Error('Node ' + orig + ' not found');

    opacityLayer.toggle();
    budgetWindow.toggle();
  };


  BudgetWindow.prototype._registerButtonListeners = function() {
    $('#' + budgetResetID).on('click', resetItems.bind(this));
    $('#' + budgetCancelID).one('click', cancel.bind(this));
    $('#' + budgetFormID).one('submit', submit.bind(this));
  };


  BudgetWindow.prototype.open = function(callback, budgetData) {
    var i, elem;
    this._callback = callback;

    // Store max funding levels
    for (i = 0; i < dataKeys.length; i++) {
      if (budgetData[dataKeys[i]] === undefined)
        throw new Error('Missing budget data');
      this[dataKeys[i]] = budgetData[dataKeys[i]];
    }

    // Update form elements with percentages, and set up listeners
    for (i = 0; i < spendKeys.length; i++) {
      if (budgetData[spendKeys[i]] === undefined)
        throw new Error('Missing budget data');

      elem = spendKeys[i];
      this['original' + elem] = budgetData[elem];
      setSpendRangeText(elem, budgetData[spendKeys[i]], this[dataKeys[i]]);
      elem = $('#' + elem);
      elem.on('input', onFundingUpdate.bind(this, spendKeys[i]));
      elem = elem[0];
      elem.value = budgetData[spendKeys[i]];
    }

    if (budgetData.taxRate === undefined)
      throw new Error('Missing budget data');

    this.originalTaxRate = budgetData.taxRate;
    elem = $('#taxRate');
    elem.on('input', onTaxUpdate);
    elem = elem[0];
    elem.value = budgetData.taxRate;
    onTaxUpdate();

    // Update static parts
    var previousFunds = budgetData.totalFunds;
    if (previousFunds === undefined)
      throw new Error('Missing budget data');

    var taxesCollected = budgetData.taxesCollected;
    if (taxesCollected === undefined)
      throw new Error('Missing budget data');

    var cashFlow = taxesCollected - this.roadFund - this.fireFund - this.policeFund;
    var currentFunds = previousFunds + cashFlow;
    $('#taxesCollected').text('$' + taxesCollected);
    $('#cashFlow').text((cashFlow < 0 ? '-$' : '$') + cashFlow);
    $('#previousFunds').text((previousFunds < 0 ? '-$' : '$') + previousFunds);
    $('#currentFunds').text('$' + currentFunds);

    this._registerButtonListeners();
    this._toggleDisplay();
  };


  return BudgetWindow;
});
