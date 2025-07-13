/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
import $ from "jquery";

import { NAG_WINDOW_CLOSED } from './messages.ts';
import { ModalWindow } from './modalWindow.js';

var NagWindow = ModalWindow(function() {
  $(nagFormID).on('submit', submit.bind(this));
});


var nagFormID = '#nagForm';
var nagOKID = '#nagOK';


var submit = function(e) {
  e.preventDefault();
  this.close();
};


NagWindow.prototype.close = function() {
  this._toggleDisplay();
  this._emitEvent(NAG_WINDOW_CLOSED);
};


NagWindow.prototype.open = function() {
  this._toggleDisplay();
  $(nagOKID).focus();
};


export { NagWindow };
