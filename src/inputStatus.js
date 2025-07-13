/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
import $ from "jquery";

import { EventEmitter } from './eventEmitter.js';
import { GameCanvas } from './gameCanvas.js';
import { GameTools } from './gameTools.js';
import * as Messages from './messages.ts';
import { MiscUtils } from './miscUtils.js';

var InputStatus = EventEmitter(function(map, tileWidth) {
  this.gameTools = new GameTools(map);

  this.gameTools.addEventListener(Messages.QUERY_WINDOW_NEEDED, MiscUtils.reflectEvent.bind(this, Messages.QUERY_WINDOW_NEEDED));

  this.canvasID = MiscUtils.normaliseDOMid(canvasID);

  this._tileWidth = tileWidth;

  // Keyboard Movement
  this.up = false;
  this.down = false;
  this.left = false;
  this.right = false;
  this.escape = false;

  // Mouse movement
  this.mouseX = -1;
  this.mouseY = -1;

  // Mouse drags
  this._dragging = false;
  this._lastdragX = -1;
  this._lastdragY = -1;

  // Tool buttons
  this.toolName = null;
  this.currentTool = null;
  this.toolWidth = 0;
  this.toolColour = '';

  // Add the listeners
  $(document).keydown(keyDownHandler.bind(this));
  $(document).keyup(keyUpHandler.bind(this));

  this.getRelativeCoordinates = getRelativeCoordinates.bind(this);
  $(this.canvasID).on('mouseenter', mouseEnterHandler.bind(this));
  $(this.canvasID).on('mouseleave', mouseLeaveHandler.bind(this));

  this.mouseDownHandler = mouseDownHandler.bind(this);
  this.mouseMoveHandler = mouseMoveHandler.bind(this);
  this.mouseUpHandler = mouseUpHandler.bind(this);
  this.canvasClickHandler = canvasClickHandler.bind(this);

  $('.toolButton').click(toolButtonHandler.bind(this));
  $('#budgetRequest').click(budgetHandler.bind(this));
  $('#evalRequest').click(evalHandler.bind(this));
  $('#disasterRequest').click(disasterHandler.bind(this));
  $('#pauseRequest').click(this.speedChangeHandler.bind(this));
  $('#screenshotRequest').click(screenshotHandler.bind(this));
  $('#settingsRequest').click(settingsHandler.bind(this));
  $('#saveRequest').click(saveHandler.bind(this));
  $('#debugRequest').click(debugHandler.bind(this));
});


var canvasID = '#' + GameCanvas.DEFAULT_ID;
var toolOutputID = '#toolOutput';


var keyDownHandler = function(e) {
  var handled = false;

  switch (e.keyCode) {
    case 38:
    case 87:
      this.up = true;
      handled = true;
      break;

    case 40:
    case 83:
      this.down = true;
      handled = true;
      break;

    case 39:
    case 68:
      this.right = true;
      handled = true;
      break;

    case 37:
    case 65:
      this.left = true;
      handled = true;
      break;

    case 27:
      this.escape = true;
      handled = true;
  }

  if (handled)
    e.preventDefault();
};


var keyUpHandler = function(e) {
  switch (e.keyCode) {
    case 38:
    case 87:
      this.up = false;
      break;

    case 40:
    case 83:
      this.down = false;
      break;

    case 39:
    case 68:
      this.right = false;
      break;

    case 37:
    case 65:
      this.left = false;
      break;

    case 27:
      this.escape = false;
  }
};


var getRelativeCoordinates = function(e) {
  var cRect = document.querySelector(this.canvasID).getBoundingClientRect();
  return {x: e.clientX - cRect.left, y: e.clientY - cRect.top};
};


var mouseEnterHandler = function(e) {
  if (this.currentTool === null)
    return;

  $(this.canvasID).on('mousemove', this.mouseMoveHandler);

  if (this.currentTool.isDraggable)
    $(this.canvasID).on('mousedown', this.mouseDownHandler);
  else
    $(this.canvasID).on('click', this.canvasClickHandler);
};


var mouseDownHandler = function(e) {
  if (e.which !== 1 || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey)
    return;

  var coords = this.getRelativeCoordinates(e);
  this.mouseX = coords.x;
  this.mouseY = coords.y;

  this._dragging = true;
  this._emitEvent(Messages.TOOL_CLICKED, {x: this.mouseX, y: this.mouseY});

  this._lastDragX = Math.floor(this.mouseX / this._tileWidth);
  this._lastDragY = Math.floor(this.mouseY / this._tileWidth);

  $(this.canvasID).on('mouseup', this.mouseUpHandler);
  e.preventDefault();
};


var mouseUpHandler = function(e) {
  this._dragging = false;
  this._lastDragX = -1;
  this._lastDragY = -1;
  $(this.canvasID).off('mouseup');
  e.preventDefault();
};


var mouseLeaveHandler = function(e) {
  $(this.canvasID).off('mousedown');
  $(this.canvasID).off('mousemove');
  $(this.canvasID).off('mouseup');

  // Watch out: we might have been mid-drag
  if (this._dragging) {
    this._dragging = false;
    this._lastDragX = -1;
    this._lastDragY = -1;
  }

  $(this.canvasID).off('click');

  this.mouseX = -1;
  this.mouseY = -1;
};


var mouseMoveHandler = function(e) {
  var coords = this.getRelativeCoordinates(e);
  this.mouseX = coords.x;
  this.mouseY = coords.y;

  if (this._dragging) {
    // XXX Work up how to patch up the path for fast mouse moves. My first attempt was too slow, and ended up missing
    // mouseUp events
    var x = Math.floor(this.mouseX / this._tileWidth);
    var y = Math.floor(this.mouseY / this._tileWidth);

    var lastX = this._lastDragX;
    var lastY = this._lastDragY;
    if (x !== lastX || y !== lastY) {
      this._emitEvent(Messages.TOOL_CLICKED, {x: this.mouseX, y: this.mouseY});
      this._lastDragX = x;
      this._lastDragY = y;
    }
  }
};


var canvasClickHandler = function(e) {
  if (e.which !== 1 || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || this.mouseX === -1 ||
     this._mouseY === -1 || this._dragging)
    return;

  this._emitEvent(Messages.TOOL_CLICKED, {x: this.mouseX, y: this.mouseY});
  e.preventDefault();
};


var toolButtonHandler = function(e) {
  // Remove highlight from last tool button
  $('.selected').each(function() {
    $(this).removeClass('selected');
    $(this).addClass('unselected');
  });

  // Add highlight
  $(e.target).removeClass('unselected');
  $(e.target).addClass('selected');

  this.toolName = $(e.target).attr('data-tool');
  this.toolWidth = $(e.target).attr('data-size');
  this.currentTool = this.gameTools[this.toolName];
  this.toolColour = $(e.target).attr('data-colour');
  $(toolOutputID).html('Tools');

  if (this.toolName !== 'query') {
    $(this.canvasID).removeClass('helpPointer');
    $(this.canvasID).addClass('pointer');
  } else {
    $(this.canvasID).removeClass('pointer');
    $(this.canvasID).addClass('helpPointer');
  }

  e.preventDefault();
};


InputStatus.prototype.speedChangeHandler = function(e) {
  var requestedSpeed = $('#pauseRequest').text();
  var newRequest = requestedSpeed === 'Pause' ? 'Play' : 'Pause';
  $('#pauseRequest').text(newRequest);
  this._emitEvent(Messages.SPEED_CHANGE, requestedSpeed);
};


InputStatus.prototype.clearTool = function() {
  if (this.toolName === 'query') {
    $(this.canvasID).removeClass('helpPointer');
    $(this.canvasID).addClass('pointer');
  }

  this.currentTool = null;
  this.toolWidth = 0;
  this.toolColour = '';
  $('.selected').removeClass('selected');
};


var makeHandler = function(message) {
  var m = Messages[message];

  return function(e) {
    this._emitEvent(m);
  };
};


var budgetHandler = makeHandler('BUDGET_REQUESTED');
var debugHandler = makeHandler('DEBUG_WINDOW_REQUESTED');
var disasterHandler = makeHandler('DISASTER_REQUESTED');
var evalHandler = makeHandler('EVAL_REQUESTED');
var screenshotHandler = makeHandler('SCREENSHOT_WINDOW_REQUESTED');
var settingsHandler = makeHandler('SETTINGS_WINDOW_REQUESTED');
var saveHandler = makeHandler('SAVE_REQUESTED');


export { InputStatus };
