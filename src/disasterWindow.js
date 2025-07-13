/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 * The name/term "MICROPOLIS" is a registered trademark of Micropolis (https://www.micropolis.com) GmbH
 * (Micropolis Corporation, the "licensor") and is licensed here to the authors/publishers of the "Micropolis"
 * city simulation game and its source code (the project or "licensee(s)") as a courtesy of the owner.
 *
 */

import $ from "jquery";

import { DISASTER_WINDOW_CLOSED } from './messages.ts';
import { MiscUtils } from './miscUtils.js';
import { ModalWindow } from './modalWindow.js';

var disasterSelectID = '#disasterSelect';
var disasterCancelID = '#disasterCancel';
var disasterOKID = '#disasterOK';
var disasterFormID = '#disasterForm';


var DisasterWindow = ModalWindow(function() {
  $(disasterFormID).on('submit', submit.bind(this));
  $(disasterCancelID).on('click', cancel.bind(this));
}, disasterSelectID);


DisasterWindow.prototype.close = function(disaster) {
  disaster = disaster || DisasterWindow.DISASTER_NONE;
  this._toggleDisplay();
  this._emitEvent(DISASTER_WINDOW_CLOSED, disaster);
};


var cancel = function(e) {
  e.preventDefault();
  this.close();
};


var submit = function(e) {
  e.preventDefault();

  // Get element values
  var requestedDisaster = $(disasterSelectID)[0].value;
  this.close(requestedDisaster);
};


DisasterWindow.prototype.open = function() {
  var i;

  // Ensure options have right values
  $('#disasterNone').attr('value', DisasterWindow.DISASTER_NONE);
  $('#disasterMonster').attr('value', DisasterWindow.DISASTER_MONSTER);
  $('#disasterFire').attr('value', DisasterWindow.DISASTER_FIRE);
  $('#disasterFlood').attr('value', DisasterWindow.DISASTER_FLOOD);
  $('#disasterCrash').attr('value', DisasterWindow.DISASTER_CRASH);
  $('#disasterMeltdown').attr('value', DisasterWindow.DISASTER_MELTDOWN);
  $('#disasterTornado').attr('value', DisasterWindow.DISASTER_TORNADO);

  this._toggleDisplay();
};


Object.defineProperties(DisasterWindow,
  {DISASTER_NONE: MiscUtils.makeConstantDescriptor('None'),
   DISASTER_MONSTER: MiscUtils.makeConstantDescriptor('Monster'),
   DISASTER_FIRE: MiscUtils.makeConstantDescriptor('Fire'),
   DISASTER_FLOOD: MiscUtils.makeConstantDescriptor('Flood'),
   DISASTER_CRASH: MiscUtils.makeConstantDescriptor('Crash'),
   DISASTER_MELTDOWN: MiscUtils.makeConstantDescriptor('Meltdown'),
   DISASTER_TORNADO: MiscUtils.makeConstantDescriptor('Tornado')});


export { DisasterWindow };
