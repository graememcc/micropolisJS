/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
import $ from "jquery";

import { Config } from './config.js';
import { QUERY_WINDOW_CLOSED } from './messages.ts';
import { ModalWindow } from './modalWindow.js';
import { MiscUtils } from './miscUtils.js';

var QueryWindow = ModalWindow(function() {
  this._debugToggled = false;
  $(queryFormID).on('submit', submit.bind(this));
});


var queryFormID = '#queryForm';
var queryOKID = '#queryOK';


var submit = function(e) {
  e.preventDefault();
  this.close();
};


QueryWindow.prototype.close = function() {
  this._toggleDisplay();
  this._emitEvent(QUERY_WINDOW_CLOSED);
};


QueryWindow.prototype.open = function() {
  if ((Config.debug || Config.queryDebug) && !this._debugToggled) {
    this._debugToggled = true;
    $('.queryDebug').removeClass('hidden');
  }

  this._toggleDisplay();
  $(queryOKID).focus();
};


export { QueryWindow };
