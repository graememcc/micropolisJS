/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['EventEmitter', 'GameCanvas', 'GameTools', 'Messages', 'MiscUtils'],
       function(EventEmitter, GameCanvas, GameTools, Messages, MiscUtils) {
  "use strict";

  var InputStatus = EventEmitter(function(map, tileWidth) {
    this.gameTools = new GameTools(map);

    this.gameTools.addEventListener(Messages.QUERY_WINDOW_NEEDED, MiscUtils.reflectEvent.bind(this, Messages.QUERY_WINDOW_NEEDED));

    this.canvasID = canvasID;

    this._tileWidth = tileWidth;

    // Keyboard Movement
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;

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
  });


  var canvasID = '#' + GameCanvas.DEFAULT_ID;


  var keyDownHandler = function(e) {
    var handled = false;

    if (e.keyCode == 38) {
      this.up = true;
      handled = true;
    } else if (e.keyCode == 40) {
      this.down = true;
      handled = true;
    } else if (e.keyCode == 39) {
      this.right = true;
      handled = true;
    } else if (e.keyCode == 37) {
      this.left = true;
      handled = true;
    }

    if (handled)
      e.preventDefault();
  };


  var keyUpHandler = function(e) {
    if (e.keyCode == 38)
      this.up = false;
    if (e.keyCode == 40)
      this.down = false;
    if (e.keyCode == 39)
      this.right = false;
    if (e.keyCode == 37)
      this.left = false;
  };


  var getRelativeCoordinates = function(e) {
    var x;
    var y;

    if (e.x !== undefined && e.y !== undefined) {
      x = e.x;
      y = e.y;
    } else {
      x = e.clientX + document.body.scrollLeft +
        document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop +
        document.documentElement.scrollTop;
     }

     var canvas = $(canvasID)[0];
     x -= canvas.offsetLeft;
     y -= canvas.offsetTop;
     return {x: x, y: y};
  };


  var mouseEnterHandler = function(e) {
    if (this.currentTool === null)
      return;

    $(this.canvasID).on('mousemove', this.mouseMoveHandler);
    $(this.canvasID).on('click', this.canvasClickHandler);

    if (this.currentTool.isDraggable)
      $(this.canvasID).on('mousedown', this.mouseDownHandler);
  };


  var mouseDownHandler = function(e) {
    if (e.button !== 0 || e.buttons !== 1)
      return;

    var coords = getRelativeCoordinates(e);
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
    $(this.canvasID).off('click');

    this.mouseX = -1;
    this.mouseY = -1;
  };


  var mouseMoveHandler = function(e) {
    var coords = getRelativeCoordinates(e);
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
    if (e.button === 0 && e.buttons === 1 && this.mouseX !== -1 && this.mouseY !== -1 && !this._dragging)
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

    e.preventDefault();
  };


  InputStatus.prototype.speedChangeHandler = function(e) {
    var requestedSpeed = $('#pauseRequest').text();
    var newRequest = requestedSpeed === 'Pause' ? 'Play' : 'Pause';
    $('#pauseRequest').text(newRequest);
    this._emitEvent(Messages.SPEED_CHANGE, requestedSpeed);
  };


  var disasterHandler = function(e) {
    this._emitEvent(Messages.DISASTER_REQUESTED);
  };


  var evalHandler = function(e) {
    this._emitEvent(Messages.EVAL_REQUESTED);
  };


  var budgetHandler = function(e) {
    this._emitEvent(Messages.BUDGET_REQUESTED);
  };


  return InputStatus;
});
