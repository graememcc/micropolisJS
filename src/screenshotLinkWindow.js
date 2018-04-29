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

var ScreenshotLinkWindow = ModalWindow(function() {
  $(screenshotLinkFormID).on('submit', submit.bind(this));
});


var screenshotLinkFormID = '#screenshotLinkForm';
var screenshotLinkOKID = '#screenshotLinkOK';
var screenshotLinkID = '#screenshotLink';


ScreenshotLinkWindow.prototype.close = function() {
  this._toggleDisplay();
  this._emitEvent(Messages.SCREENSHOT_LINK_CLOSED);
};


var cancel = function(e) {
  e.preventDefault();
  this.close();
};


var submit = function(e) {
  e.preventDefault();
  this.close();
};


ScreenshotLinkWindow.prototype.open = function(screenshotLink) {
  $(screenshotLinkID).attr('href', screenshotLink);
  this._toggleDisplay();
};


export { ScreenshotLinkWindow };
