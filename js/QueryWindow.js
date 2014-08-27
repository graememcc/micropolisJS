/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Config', 'EventEmitter', 'Messages'],
       function(Config, EventEmitter, Messages) {
  "use strict";


  var QueryWindow = EventEmitter(function(opacityLayerID, queryWindowID) {
    this._opacityLayer =  '#' + opacityLayerID;
    this._queryWindowID = '#' + queryWindowID;
    this._debugToggled = false;
    $('#' + queryFormID).on('submit', submit.bind(this));
    $('#' + queryOKID).on('click', submit.bind(this));
  });

  var queryFormID = "queryForm";
  var queryOKID = "queryForm";


  var submit = function(e) {
    e.preventDefault();
    this._toggleDisplay();
    this._emitEvent(Messages.QUERY_WINDOW_CLOSED);
  };


  QueryWindow.prototype._toggleDisplay = function() {
    var opacityLayer = $(this._opacityLayer);
    opacityLayer = opacityLayer.length === 0 ? null : opacityLayer;
    if (opacityLayer === null)
      throw new Error('Node ' + orig + ' not found');

    var queryWindow = $(this._queryWindowID);
    queryWindow = queryWindow.length === 0 ? null : queryWindow;
    if (queryWindow === null)
      throw new Error('Node ' + orig + ' not found');

    opacityLayer.toggle();
    queryWindow.toggle();
    if ((Config.debug || Config.queryDebug) && !this.debugToggled) {
      $('#queryDebug').removeClass('hidden');
      this.debugToggled = true;
    }
  };


  QueryWindow.prototype.open = function() {
    this._toggleDisplay();
  };


  return QueryWindow;
});
