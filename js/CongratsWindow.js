/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Messages', 'ModalWindow'],
       function(Messages, ModalWindow) {
  "use strict";


  var CongratsWindow = ModalWindow(function() {
    $(congratsFormID).on('submit', submit.bind(this));
  });


  var congratsFormID = "#congratsForm";
  var congratsMessageID = "#congratsMessage";
  var congratsOKID = "#congratsOK";


  var submit = function(e) {
    e.preventDefault();
    this.close();
  };


  CongratsWindow.prototype.close = function() {
    this._toggleDisplay();
    this._emitEvent(Messages.CONGRATS_WINDOW_CLOSED);
  };


  CongratsWindow.prototype.open = function(message) {
    this._toggleDisplay();
    $(congratsMessageID).text(message);
    $(congratsOKID).focus();
  };


  return CongratsWindow;
});
