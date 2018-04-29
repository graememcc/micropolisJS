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
import { MiscUtils } from './miscUtils';

var ScreenshotWindow = ModalWindow(function() {
  $(screenshotCancelID).on('click', cancel.bind(this));
  $(screenshotFormID).on('submit', submit.bind(this));
});


var screenshotCancelID = '#screenshotCancel';
var screenshotFormID = '#screenshotForm';
var screenshotOKID = '#screenshotOK';


ScreenshotWindow.prototype.close = function(action) {
  action = action || null;

  this._toggleDisplay();
  this._emitEvent(Messages.SCREENSHOT_WINDOW_CLOSED, action);
};


var cancel = function(e) {
  e.preventDefault();
  this.close(null);
};


var submit = function(e) {
  e.preventDefault();

  var action = null;

  // Get choice
  var screenshotType = $('.screenshotType:checked').val();
  if (screenshotType === 'visible')
    action = ScreenshotWindow.SCREENSHOT_VISIBLE;
  else
    action = ScreenshotWindow.SCREENSHOT_ALL;

  this.close(action);
};


ScreenshotWindow.prototype.open = function(screenshotData) {
  this._toggleDisplay();
};


var defineAction = (function() {
  var uid = 1;

  return function(name) {
    Object.defineProperty(ScreenshotWindow, name, MiscUtils.makeConstantDescriptor(uid));
    uid += 1;
  };
})();


defineAction('SCREENSHOT_VISIBLE');
defineAction('SCREENSHOT_ALL');


export { ScreenshotWindow };
