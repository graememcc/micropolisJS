/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Messages', 'ModalWindow', 'MiscUtils'],
       function(Messages, ModalWindow, MiscUtils) {
  "use strict";

  var SettingsWindow = ModalWindow(function() {
    $(settingsCancelID).on('click', cancel.bind(this));
    $(settingsFormID).on('submit', submit.bind(this));
  });


  var settingsCancelID = '#settingsCancel';
  var settingsFormID = '#settingsForm';
  var settingsOKID = '#settingsOK';
  var autoBudgetYesID = '#autoBudgetYes';
  var autoBudgetNoID = '#autoBudgetNo';


  SettingsWindow.prototype.close = function(actions) {
    actions = actions || [];
    this._emitEvent(Messages.SETTINGS_WINDOW_CLOSED, actions);
    this._toggleDisplay();
  };


  var cancel = function(e) {
    e.preventDefault();
    this.close([]);
  };


  var submit = function(e) {
    e.preventDefault();

    var actions = [];

    // Get element values
    var shouldAutoBudget = $('.autoBudgetSetting:checked').val() && true;
    if (shouldAutoBudget === 'true')
      shouldAutoBudget = true;
    else
      shouldAutoBudget = false;
    actions.push({action: SettingsWindow.AUTOBUDGET, data: shouldAutoBudget});

    this.close(actions);
  };


  SettingsWindow.prototype.open = function(settingsData) {
    if (settingsData.autoBudget)
      $(autoBudgetYesID).prop('checked', true);
    else
      $(autoBudgetNoID).prop('checked', true);

    this._toggleDisplay();
  };


  var defineAction = (function() {
    var uid = 0;

    return function(name) {
      Object.defineProperty(SettingsWindow, name, MiscUtils.makeConstantDescriptor(uid));
      uid += 1;
    };
  })();


  defineAction('AUTOBUDGET');


  return SettingsWindow;
});
