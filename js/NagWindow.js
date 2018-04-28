/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(function(require, exports, module) {
  "use strict";


  var Messages = require('./Messages');
  var ModalWindow = require('./ModalWindow');

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
    this._emitEvent(Messages.NAG_WINDOW_CLOSED);
  };


  NagWindow.prototype.open = function() {
    this._toggleDisplay();
    $(nagOKID).focus();
  };


  return NagWindow;
});
