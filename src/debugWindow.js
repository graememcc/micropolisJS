/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
import $ from "jquery";

import { DEBUG_WINDOW_CLOSED } from './messages.ts';
import { ModalWindow } from './modalWindow.js';
import { MiscUtils } from './miscUtils.js';

var DebugWindow = ModalWindow(function() {
  $(debugCancelID).on('click', cancel.bind(this));
  $(debugFormID).on('submit', submit.bind(this));
});


var debugCancelID = '#debugCancel';
var debugFormID = '#debugForm';
var debugOKID = '#debugOK';


DebugWindow.prototype.close = function(actions) {
  actions = actions || [];
  this._emitEvent(DEBUG_WINDOW_CLOSED, actions);
  this._toggleDisplay();
};


var cancel = function(e) {
  e.preventDefault();
  this.close([]);
};


var submit = function(e) {
  e.preventDefault();

  var actions = [];

  // Get element values
  var shouldAdd = $('.debugAdd:checked').val();
  if (shouldAdd === 'true')
    actions.push({action: DebugWindow.ADD_FUNDS, data: {}});

  this.close(actions);
};


DebugWindow.prototype.open = function() {
  this._toggleDisplay();
};


var defineAction = (function() {
  var uid = 0;

  return function(name) {
    Object.defineProperty(DebugWindow, name, MiscUtils.makeConstantDescriptor(uid));
    uid += 1;
  };
})();


defineAction('ADD_FUNDS');


export { DebugWindow };
