/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Messages } from './messages';
import { ModalWindow } from './modalWindow';

var TouchWarnWindow = ModalWindow(function() {
  $(touchFormID).on('submit', submit.bind(this));
});


var touchFormID = '#touchForm';
var touchOKID = '#touchOK';


var submit = function(e) {
  e.preventDefault();
  this.close();
};


TouchWarnWindow.prototype.close = function() {
  this._toggleDisplay();
  this._emitEvent(Messages.TOUCH_WINDOW_CLOSED);
};


TouchWarnWindow.prototype.open = function() {
  this._toggleDisplay();
  $(touchOKID).focus();
};


export { TouchWarnWindow };
