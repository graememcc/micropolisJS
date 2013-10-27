/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['MiscUtils'],
       function(MiscUtils) {
  "use strict";

  function DisasterWindow(opacityLayerID, disasterWindowID) {
    this._opacityLayer =  '#' + opacityLayerID;
    this._disasterWindowID = '#' + disasterWindowID;
    this._requestedDisaster = DisasterWindow.DISASTER_NONE;
  }


  var disasterSelectID = 'disasterSelect';
  var disasterCancelID = 'disasterCancel';
  var disasterOKID = 'disasterOK';
  var disasterFormID = 'disasterForm';


  var cancel = function(e) {
    e.preventDefault();
    $('#' + disasterFormID).off();
    this._toggleDisplay();
    this._callback(DisasterWindow.DISASTER_NONE);
  };


  var submit = function(e) {
    e.preventDefault();

    // Get element values
    var requestedDisaster = $('#' + disasterSelectID)[0].value;
    $('#' + disasterFormID).off();
    this._toggleDisplay();
    this._callback(requestedDisaster);
  };


  DisasterWindow.prototype._toggleDisplay = function() {
    var opacityLayer = $(this._opacityLayer);
    opacityLayer = opacityLayer.length === 0 ? null : opacityLayer;
    if (opacityLayer === null)
      throw new Error('Node ' + orig + ' not found');

    var disasterWindow = $(this._disasterWindowID);
    disasterWindow = disasterWindow.length === 0 ? null : disasterWindow;
    if (disasterWindow === null)
      throw new Error('Node ' + orig + ' not found');

    opacityLayer.toggle();
    disasterWindow.toggle();
  };


  DisasterWindow.prototype._registerButtonListeners = function() {
    $('#' + disasterCancelID).one('click', cancel.bind(this));
    $('#' + disasterFormID).one('submit', submit.bind(this));
  };


  DisasterWindow.prototype.open = function(callback) {
    var i;
    this._callback = callback;

    // Ensure options have right values
    $('#disasterNone').attr('value', DisasterWindow.DISASTER_NONE);
    $('#disasterMonster').attr('value', DisasterWindow.DISASTER_MONSTER);
    $('#disasterFire').attr('value', DisasterWindow.DISASTER_FIRE);
    $('#disasterFlood').attr('value', DisasterWindow.DISASTER_FLOOD);
    $('#disasterCrash').attr('value', DisasterWindow.DISASTER_CRASH);
    $('#disasterMeltdown').attr('value', DisasterWindow.DISASTER_MELTDOWN);
    $('#disasterTornado').attr('value', DisasterWindow.DISASTER_TORNADO);

    this._registerButtonListeners();
    this._toggleDisplay();
  };


  Object.defineProperties(DisasterWindow,
    {DISASTER_NONE: MiscUtils.makeConstantDescriptor('None'),
     DISASTER_MONSTER: MiscUtils.makeConstantDescriptor('Monster'),
     DISASTER_FIRE: MiscUtils.makeConstantDescriptor('Fire'),
     DISASTER_FLOOD: MiscUtils.makeConstantDescriptor('Flood'),
     DISASTER_CRASH: MiscUtils.makeConstantDescriptor('Crash'),
     DISASTER_MELTDOWN: MiscUtils.makeConstantDescriptor('Meltdown'),
     DISASTER_TORNADO: MiscUtils.makeConstantDescriptor('Tornado')});


  return DisasterWindow;
});
