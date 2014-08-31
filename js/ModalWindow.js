/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['EventEmitter'],
       function(EventEmitter) {
  "use strict";


  var ModalWindow = function(constructorFunction, focusID) {
    focusID = focusID || null;

    var newConstructor = function(opacityLayerID, windowID) {
      this._opacityLayer =  '#' + opacityLayerID;
      this._windowID = '#' + windowID;
      constructorFunction.call(this);
    };


    newConstructor.prototype._toggleDisplay = function() {
      var opacityLayer = $(this._opacityLayer);
      opacityLayer = opacityLayer.length === 0 ? null : opacityLayer;
      if (opacityLayer === null)
        throw new Error('Node ' + orig + ' not found');

      var modalWindow = $(this._windowID);
      modalWindow = modalWindow.length === 0 ? null : modalWindow;
      if (modalWindow === null)
        throw new Error('Node ' + orig + ' not found');

      opacityLayer.toggle();
      modalWindow.toggle();

      if (focusID !== null)
        $('#' + focusID).focus();
      else
        $(this._windowID + ' input[type="submit"]').focus()
    };


    return EventEmitter(newConstructor);
  };


  return ModalWindow;
});
