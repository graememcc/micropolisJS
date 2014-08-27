/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['EventEmitter', 'Messages', 'Text'],
       function(EventEmitter, Messages, Text) {
  "use strict";

  function EvaluationWindow(opacityLayerID, evaluationWindowID) {
    this._opacityLayer =  '#' + opacityLayerID;
    this._evaluationWindowID = '#' + evaluationWindowID;
    $('#' + evaluationFormID).on('submit', submit.bind(this));
    $('#' + evaluationOKID).on('click', submit.bind(this));
    EventEmitter(this);
  }

  var evaluationFormID = "evaluationForm";
  var evaluationOKID = "evalOK";

  var submit = function(e) {
    e.preventDefault();

    // TODO Fix for enter keypress: submit isn't fired on FF due to form
    // only containing the submit button
    this._emitEvent(Messages.EVAL_WINDOW_CLOSED);
    this._toggleDisplay();
  };


  EvaluationWindow.prototype._toggleDisplay = function() {
    var opacityLayer = $(this._opacityLayer);
    opacityLayer = opacityLayer.length === 0 ? null : opacityLayer;
    if (opacityLayer === null)
      throw new Error('Node ' + orig + ' not found');

    var evaluationWindow = $(this._evaluationWindowID);
    evaluationWindow = evaluationWindow.length === 0 ? null : evaluationWindow;
    if (evaluationWindow === null)
      throw new Error('Node ' + orig + ' not found');

    opacityLayer.toggle();
    evaluationWindow.toggle();
  };


  EvaluationWindow.prototype._populateWindow = function(evaluation) {
    $('#evalYes').text(evaluation.cityYes);
    $('#evalNo').text(100 - evaluation.cityYes);
    for (var i = 0; i < 4; i++) {
      var problemNo = evaluation.getProblemNumber(i);
      var text = '';
      if (problemNo !== -1)
        text = Text.problems[problemNo];
      $('#evalProb' + (i + 1)).text(text);
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


  return EvaluationWindow;
});
