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


  var Config = require('./Config');
  var Messages = require('./Messages');
  var ModalWindow = require('./ModalWindow');
  var MiscUtils = require('./MiscUtils');

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
    this._emitEvent(Messages.QUERY_WINDOW_CLOSED);
  };


  QueryWindow.prototype.open = function() {
    if ((Config.debug || Config.queryDebug) && !this._debugToggled) {
      this._debugToggled = true;
      $('.queryDebug').removeClass('hidden');
    }

    this._toggleDisplay();
    $(queryOKID).focus();
  };


  return QueryWindow;
});
