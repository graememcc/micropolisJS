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
import { Simulation } from './simulation';

var FieldWindow = ModalWindow(function() {
  $(fieldCancelID).on('click', cancel.bind(this));
  $(fieldFormID).on('submit', submit.bind(this));
}, fieldSelectID);


var fieldCancelID = '#fieldCancel';
var fieldFormID = '#fieldForm';
var fieldOKID = '#fieldOK';
var WWTPYesID = '#WWTPYes';
var WWTPNoID = '#WWTPNo';
var fieldSelectID = '#fieldSelect';



FieldWindow.prototype.close = function(actions) {
  actions = actions || [];
  this._emitEvent(Messages.FIELD_WINDOW_CLOSED, actions);
  this._toggleDisplay();
};


var submit = function(e) {
  e.preventDefault();

  var actions = [];

  var requestedField = $(fieldSelectID)[0].value;
  //this.close(requestedField);
  actions.push(requestedField);

  var shouldWWTP = $('.WWTPfield:checked').val();
  if (shouldWWTP === 'true')
    shouldWWTP = true;
  else
    shouldWWTP = false;
  actions.push({action: FieldWindow.WWTP, data: shouldWWTP});


  this.close(actions);
};


SettingsWindow.prototype.open = function(settingsData) {
  if (fieldData.WWTP)
    $(WWTPYesID).prop('checked', true);
  else
    $(WWTPNoID).prop('checked', true);

    var i;

    // Ensure options have right values
    $('#fieldPotato').attr('value', FieldWindow.FIELD_POTATO);
    $('#fieldCorn').attr('value', FieldWindow.FIELD_CORN);
    $('#fieldWheat').attr('value', FieldWindow.FIELD_WHEAT);
    $('#fieldOrchard').attr('value', FieldWindow.FIELD_ORCHARD);

  

  this._toggleDisplay();
};


var defineAction = (function() {
  var uid = 0;

  return function(name) {
    Object.defineProperty(FieldWindow, name, MiscUtils.makeConstantDescriptor(uid));
    uid += 1;
  };
})();


defineAction('WWTP');



export { SettingsWindow };
