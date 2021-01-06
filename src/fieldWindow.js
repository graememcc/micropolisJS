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
import { Game } from './game';

var FieldWindow = ModalWindow(function() {
  $(fieldFormID).on('submit', submit.bind(this));
},);


var cropCornID = '#cropCorn';
var cropPotatoID = '#cropPotato';
var cropWheatID = '#cropWheat';
var cropOrchardID = '#cropOrchard';
var fieldFormID = '#fieldForm';
var fieldOKID = '#fieldOK';
var WWTPYesID = '#WWTPYes';
var WWTPNoID = '#WWTPNo';



FieldWindow.prototype.close = function(actions) {
  actions = actions || [];
  this._emitEvent(Messages.FIELD_WINDOW_CLOSED, actions);
  this._toggleDisplay();
};

var submit = function(e) {
  e.preventDefault();

  var actions = [];

  var shouldWWTP = $('.WWTPField:checked').val();
  if (shouldWWTP === 'true')
    shouldWWTP = true;
  else
    shouldWWTP = false;
  actions.push({action: FieldWindow.WWTP, data: shouldWWTP});

  var cropSelect = $('.cropSetting:checked').val() - 0;
  actions.push({action: FieldWindow.CROP, data: cropSelect});
  this.close(actions);
};


FieldWindow.prototype.open = function(fieldData) {
    $(WWTPYesID).prop('checked', true);

    $(cropCornID).prop('checked', true);

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
defineAction('CROP');

export { FieldWindow };
