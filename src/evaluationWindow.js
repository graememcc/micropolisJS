/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 * The name/term "MICROPOLIS" is a registered trademark of Micropolis (https://www.micropolis.com) GmbH
 * (Micropolis Corporation, the "licensor") and is licensed here to the authors/publishers of the "Micropolis"
 * city simulation game and its source code (the project or "licensee(s)") as a courtesy of the owner.
 *
 */

import $ from "jquery";

import { ModalWindow } from './modalWindow.js';
import { EVAL_WINDOW_CLOSED } from './messages.ts';
import { Text } from './text.js';

var EvaluationWindow = ModalWindow(function() {
  $(evaluationFormID).on('submit', submit.bind(this));
});


var evaluationFormID = '#evalButtons';
var evaluationOKID = '#evalOK';


EvaluationWindow.prototype.close = function() {
  this._emitEvent(EVAL_WINDOW_CLOSED);
  this._toggleDisplay();
};


var submit = function(e) {
  e.preventDefault();
  this.close();
};


EvaluationWindow.prototype._populateWindow = function(evaluation) {
  $('#evalYes').text(evaluation.cityYes);
  $('#evalNo').text(100 - evaluation.cityYes);
  for (var i = 0; i < 4; i++) {
    var problemNo = evaluation.getProblemNumber(i);
    if (problemNo !== null) {
      var text = Text.problems[problemNo];
      $('#evalProb' + (i + 1)).text(text);
      $('#evalProb' + (i + 1)).show();
    } else {
      $('#evalProb' + (i + 1)).hide();
    }
  }

  $('#evalPopulation').text(evaluation.cityPop);
  $('#evalMigration').text(evaluation.cityPopDelta);
  $('#evalValue').text(evaluation.cityAssessedValue);
  $('#evalLevel').text(Text.gameLevel[evaluation.gameLevel]);
  $('#evalClass').text(Text.cityClass[evaluation.cityClass]);
  $('#evalScore').text(evaluation.cityScore);
  $('#evalScoreDelta').text(evaluation.cityScoreDelta);
};


EvaluationWindow.prototype.open = function(evaluation) {
  this._populateWindow(evaluation);
  this._toggleDisplay();
};


export { EvaluationWindow };
