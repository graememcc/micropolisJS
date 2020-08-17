/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { MiscUtils } from './miscUtils';

var arrs = ['res', 'com', 'ind', 'crime',
            'money', 'pollution'];
function Census() {
  this.clearCensus();
  this.changed = false;
  this.crimeRamp = 0;
  this.pollutionRamp = 0;

  // Set externally
  this.landValueAverage = 0;
  this.pollutionAverage = 0;
  this.crimeAverage = 0;
  this.totalPop = 0;

  var createArray = function(arrName) {
    this[arrName] = [];
    for (var a = 0; a < 120; a++)
      this[arrName][a] = 0;
  };

  for (var i = 0; i < arrs.length; i++) {
    var name10 = arrs[i] + 'Hist10';
    var name120 = arrs[i] + 'Hist120';
    createArray.call(this, name10);
    createArray.call(this, name120);
  }
}


var rotate10Arrays = function() {
  for (var i = 0; i < arrs.length; i++) {
    var name10 = arrs[i] + 'Hist10';
    this[name10].pop();
    this[name10].unshift(0);
  }
};


var rotate120Arrays = function() {
  for (var i = 0; i < arrs.length; i++) {
    var name120 = arrs[i] + 'Hist120';
    this[name120].pop();
    this[name120].unshift(0);
  }
};


Census.prototype.clearCensus = function() {
  this.poweredZoneCount = 0;
  this.unpoweredZoneCount = 0;
  this.firePop = 0;
  this.roadTotal = 0;
  this.railTotal = 0;
  this.resPop = 0;
  this.comPop = 0;
  this.indPop = 0;
  this.resZonePop = 0;
  this.comZonePop = 0;
  this.indZonePop = 0;
  this.hospitalPop = 0;
  this.churchPop = 0;
  this.policeStationPop = 0;
  this.fireStationPop = 0;
  this.stadiumPop = 0;
  this.wwtpPowerPop = 0;
  this.coalPowerPop = 0;
  this.nuclearPowerPop = 0;
  this.seaportPop = 0;
  this.airportPop = 0;
};


var saveProps = ['resPop', 'comPop', 'indPop', 'crimeRamp', 'pollutionRamp', 'landValueAverage', 'pollutionAverage',
             'crimeAverage', 'totalPop', 'resHist10', 'resHist120', 'comHist10', 'comHist120', 'indHist10',
             'indHist120', 'crimeHist10', 'crimeHist120', 'moneyHist10', 'moneyHist120', 'pollutionHist10',
             'pollutionHist120'];

Census.prototype.save = function(saveData) {
  for (var i = 0, l = saveProps.length; i < l; i++)
    saveData[saveProps[i]] = this[saveProps[i]];
};


Census.prototype.load = function(saveData) {
  for (var i = 0, l = saveProps.length; i < l; i++)
    this[saveProps[i]] = saveData[saveProps[i]];
};


Census.prototype.take10Census = function(budget) {
  var resPopDenom = 8;

  rotate10Arrays.call(this);

  this.resHist10[0] = Math.floor(this.resPop / resPopDenom);
  this.comHist10[0] = this.comPop;
  this.indHist10[0] = this.indPop;

  this.crimeRamp += Math.floor((this.crimeAverage - this.crimeRamp) / 4);
  this.crimeHist10[0] = Math.min(this.crimeRamp, 255);

  this.pollutionRamp += Math.floor((this.pollutionAverage - this.pollutionRamp) / 4);
  this.pollutionHist10[0] = Math.min(this.pollutionRamp, 255);

  var x = Math.floor(budget.cashFlow / 20) + 128;
  this.moneyHist10[0] = MiscUtils.clamp(x, 0, 255);

  var resPopScaled = this.resPop >> 8;

  if (this.hospitalPop < this.resPopScaled)
    this.needHospital = 1;
  else if (this.hospitalPop > this.resPopScaled)
    this.needHospital = -1;
  else if (this.hospitalPop === this.resPopScaled)
    this.needHospital = 0;

  this.changed = true;
};


Census.prototype.take120Census = function() {
  rotate120Arrays.call(this);
  var resPopDenom = 8;

  this.resHist120[0] = Math.floor(this.resPop / resPopDenom);
  this.comHist120[0] = this.comPop;
  this.indHist120[0] = this.indPop;
  this.crimeHist120[0] = this.crimeHist10[0];
  this.pollutionHist120[0] = this.pollutionHist10[0];
  this.moneyHist120[0] = this.moneyHist10[0];
  this.changed = true;
};


export { Census };
