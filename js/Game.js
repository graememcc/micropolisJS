/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['BudgetWindow', 'DisasterWindow', 'GameCanvas', 'EvaluationWindow', 'InfoBar', 'InputStatus', 'Messages', 'Notification', 'QueryWindow', 'RCI', 'Simulation', 'Text'],
       function(BudgetWindow, DisasterWindow, GameCanvas, EvaluationWindow, InfoBar, InputStatus, Messages, Notification, QueryWindow, RCI, Simulation, Text) {
  "use strict";


  function Game(gameMap, tileSet, spriteSheet, difficulty) {
    difficulty = difficulty || 0;

    this.gameMap = gameMap;
    this.tileSet = tileSet;
    this.simulation = new Simulation(this.gameMap, difficulty, 1);
    this.rci = new RCI('RCIContainer', this.simulation);

    // Note: must init canvas before inputStatus
    this.gameCanvas = new GameCanvas('canvasContainer');
    this.gameCanvas.init(this.gameMap, this.tileSet, spriteSheet);
    this.inputStatus = new InputStatus(this.gameMap);

    // Hook up listeners to open/close evaluation window
    this.evalShowing = false;
    this.evalWindow = new EvaluationWindow('opaque', 'evalWindow');
    this.evalWindow.addEventListener(Messages.EVAL_WINDOW_CLOSED, this.handleEvalWindowClosure.bind(this));
    this.inputStatus.addEventListener(Messages.EVAL_REQUESTED, this.handleEvalRequest.bind(this));

    // ... and similarly for the budget window
    this.budgetShowing = false;
    this.budgetWindow = new BudgetWindow('opaque', 'budget');
    this.budgetWindow.addEventListener(Messages.BUDGET_WINDOW_CLOSED, this.handleBudgetWindowClosure.bind(this));
    this.inputStatus.addEventListener(Messages.BUDGET_REQUESTED, this.handleBudgetRequest.bind(this));

    // ... and also the disaster window
    this.disasterShowing = false;
    this.disasterWindow = new DisasterWindow('opaque', 'disasterWindow');
    this.disasterWindow.addEventListener(Messages.DISASTER_WINDOW_CLOSED, this.handleDisasterWindowClosure.bind(this));
    this.inputStatus.addEventListener(Messages.DISASTER_REQUESTED, this.handleDisasterRequest.bind(this));

    // ... and finally the query window
    this.queryShowing = false;
    this.queryWindow = new QueryWindow('opaque', 'queryWindow');
    this.queryWindow.addEventListener(Messages.QUERY_WINDOW_CLOSED, this.handleQueryWindowClosure.bind(this));
    this.inputStatus.addEventListener(Messages.QUERY_WINDOW_NEEDED, this.handleQueryRequest.bind(this));

    // Listen for front end messages
    this.simulation.addEventListener(Messages.FRONT_END_MESSAGE, this.processFrontEndMessage.bind(this));

    // Listen for budget messages
    this.simulation.addEventListener(Messages.BUDGET_NEEDED, this.handleMandatoryBudget.bind(this));

    // Listen for tool clicks
    this.inputStatus.addEventListener(Messages.TOOL_CLICKED, this.handleTool.bind(this));

    this.infoBar = InfoBar('cclass', 'population', 'score', 'funds', 'date');
    this.infoBar(this.simulation);

    this.mouse = null;
    this.sprites = null;
    this.lastCoord = null;

    // Unhide controls
    this.revealControls();

    this.simNeedsBudget = false;
    this.isPaused = false;

    this.tick();
    this.animate();
  }


  var nextFrame =
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame;


  Game.prototype.revealControls = function() {
   $('.initialHidden').each(function(e) {
     $(this).removeClass('initialHidden');
   });

   Notification.news(Text.neutralMessages[Messages.WELCOME]);
   this.rci.update({residential: 0, commerical: 0, industrial: 0});
  };


  Game.prototype.handleDisasterWindowClosure = function(request) {
    this.disasterShowing = false;
    if (request === DisasterWindow.DISASTER_NONE)
      return;

    switch (request) {
      case DisasterWindow.DISASTER_MONSTER:
        this.simulation.spriteManager.makeMonster();
        break;

      case DisasterWindow.DISASTER_FIRE:
        this.simulation.disasterManager.makeFire();
        break;

      case DisasterWindow.DISASTER_FLOOD:
        this.simulation.disasterManager.makeFlood();
        break;

      case DisasterWindow.DISASTER_CRASH:
        this.simulation.disasterManager.makeCrash();
        break;

      case DisasterWindow.DISASTER_MELTDOWN:
        this.simulation.disasterManager.makeMeltdown();
        break;

      case DisasterWindow.DISASTER_TORNADO:
        this.simulation.spriteManager.makeTornado();
    }
  };


  Game.prototype.handleEvalWindowClosure = function() {
    this.evalShowing = false;
  };


  Game.prototype.handleQueryWindowClosure = function() {
    this.queryShowing = false;
  };


  Game.prototype.handleBudgetWindowClosure = function(data) {
    this.budgetShowing = false;
    if (!data.cancelled) {
      this.simulation.budget.roadPercent = data.roadPercent / 100;
      this.simulation.budget.firePercent = data.firePercent / 100;
      this.simulation.budget.policePercent = data.policePercent / 100;
      this.simulation.budget.setTax(data.taxPercent);
      if (this.simNeededBudget) {
        this.simulation.budget.doBudget();
        this.simNeededBudget = false;
      } else {
        this.simulation.budget.updateFundEffects();
      }
    }
  };


  Game.prototype.handleDisasterRequest = function() {
    if (this.disasterShowing) {
      console.warn('Request was made to open disaster window. It is already open!');
      return;
    }

    this.disasterShowing = true;
    this.disasterWindow.open();
    nextFrame(this.tick.bind(this));
  };


  Game.prototype.handleEvalRequest = function() {
    if (this.evalShowing) {
      console.warn('Request was made to open eval window. It is already open!');
      return;
    }

    this.evalShowing = true;
    this.evalWindow.open(this.simulation.evaluation);
    nextFrame(this.tick.bind(this));
  };


  Game.prototype.handleQueryRequest = function() {
    if (this.queryShowing) {
      console.warn('Request was made to open query window. It is already open!');
      return;
    }

    this.queryShowing = true;
    this.queryWindow.open();
    nextFrame(this.tick.bind(this));
  };


  Game.prototype.handleBudgetRequest = function() {
    if (this.budgetShowing) {
      console.warn('Request was made to open budget window. It is already open!');
      return;
    }

    this.budgetShowing = true;

    var budgetData = {
      roadFund: this.simulation.budget.roadFund,
      roadRate: Math.floor(this.simulation.budget.roadPercent * 100),
      fireFund: this.simulation.budget.fireFund,
      fireRate: Math.floor(this.simulation.budget.firePercent * 100),
      policeFund: this.simulation.budget.policeFund,
      policeRate: Math.floor(this.simulation.budget.policePercent * 100),
      taxRate: this.simulation.budget.cityTax,
      totalFunds: this.simulation.budget.totalFunds,
      taxesCollected: this.simulation.budget.taxFund};

    this.budgetWindow.open(budgetData);
    nextFrame(this.tick.bind(this));
  };


  Game.prototype.handleMandatoryBudget = function() {
    this.simNeededBudget = true;
    this.handleBudgetRequest();
  };


  Game.prototype.handleTool = function(data) {
    var x = data.x;
    var y = data.y;

    // Were was the tool clicked?
    var tileCoords = this.gameCanvas.canvasCoordinateToTileCoordinate(x, y);

    if (tileCoords === null)
      return;

    var tool = this.inputStatus.currentTool;

    var budget = this.simulation.budget;
    var evaluation = this.simulation.evaluation;

    // do it!
    tool.doTool(tileCoords.x, tileCoords.y, this.simulation.blockMaps);

    tool.modifyIfEnoughFunding(budget);
    switch (tool.result) {
      case tool.TOOLRESULT_NEEDS_BULLDOZE:
        $('#toolOutput').text(Text.toolMessages.needsDoze);
        break;

      case tool.TOOLRESULT_NO_MONEY:
        $('#toolOutput').text(Text.toolMessages.noMoney);
        break;

      default:
        $('#toolOutput').html('&nbsp;');
    }
  };


  Game.prototype.handleSpeedChange = function() {
    // XXX Currently only offer pause and run to the user
    // No real difference among the speeds until we optimise
    // the sim
    this.isPaused = !this.isPaused;

    if (this.isPaused)
      this.simulation.setSpeed(Simulation.SPEED_PAUSED);
    else
      this.simulation.setSpeed(Simulation.SPEED_SLOW);

    this.inputStatus.speedChangeHandled();
  };


  Game.prototype.handleInput = function() {
    if (this.inputStatus.speedChangeRequested) {
      this.handleSpeedChange();
      return;
    }

    // Handle keyboard movement
    if (this.inputStatus.left)
      this.gameCanvas.moveWest();
    else if (this.inputStatus.up)
      this.gameCanvas.moveNorth();
    else if (this.inputStatus.right)
      this.gameCanvas.moveEast();
    else if (this.inputStatus.down)
      this.gameCanvas.moveSouth();
  };


  Game.prototype.processFrontEndMessage = function(message) {
    var subject = message.subject;

    if (Text.goodMessages[subject] !== undefined) {
      Notification.goodNews(Text.goodMessages[subject]);
      return;
    }

    if (Text.badMessages[subject] !== undefined) {
      Notification.badNews(Text.badMessages[subject]);
      return;
    }

    if (Text.neutralMessages[subject] !== undefined) {
      Notification.news(Text.neutralMessages[subject]);
      return;
    }

    console.warn('Unexpected message: ', subject);
  };


  Game.prototype.calculateMouseForPaint = function() {
    // Determine whether we need to draw a tool outline in the
    // canvas
    var mouse = null;

    if (this.inputStatus.mouseX !== -1 && this.inputStatus.toolWidth > 0) {
      var tileCoords = this.gameCanvas.canvasCoordinateToTileOffset(this.inputStatus.mouseX, this.inputStatus.mouseY);
      if (tileCoords !== null) {
        mouse = {};

        mouse.x = tileCoords.x;
        mouse.y = tileCoords.y;

        // The inputStatus fields came from DOM attributes, so will be strings.
        // Coerce back to numbers.
        mouse.width = this.inputStatus.toolWidth - 0;
        mouse.height = this.inputStatus.toolWidth - 0;
        mouse.colour = this.inputStatus.toolColour || 'yellow';
      }
    }

    return mouse;
  };


  Game.prototype.calculateSpritesForPaint = function() {
    var origin = this.gameCanvas.getTileOrigin();
    var end = this.gameCanvas.getMaxTile();
    var spriteList = this.simulation.spriteManager.getSpritesInView(origin.x, origin.y, end.x + 1, end.y + 1);

    if (spriteList.length === 0)
      return null;

    return spriteList;
  };


  Game.prototype.tick = function() {
    this.handleInput();

    if (this.budgetShowing || this.queryShowing || this.disasterShowing ||
        this.evalShowing) {
      window.setTimeout(this.tick.bind(this), 0);
      return;
    }

    if (!this.simulation.isPaused()) {
      // Run the sim
      this.simulation.simTick();
    }

    // Run this even when paused: you can still build when paused
    this.mouse = this.calculateMouseForPaint();

    window.setTimeout(this.tick.bind(this), 0);
  };


  Game.prototype.animate = function() {
    // Don't run on blur - bad things seem to happen
    // when switching back to our tab in Fx
    if (this.budgetShowing || this.queryShowing ||
        this.disasterShowing || this.evalShowing) {
      nextFrame(this.animate.bind(this));
      return;
    }

    // TEMP
    this.frameCount++;

    var date = new Date();
    var elapsed = Math.floor((date - this.animStart) / 1000);

    // TEMP
    if (elapsed > 0)
      this.d.textContent = Math.floor(this.frameCount/elapsed) + ' fps';

    if (!this.isPaused)
      this.simulation.spriteManager.moveObjects(this.simulation._constructSimData());

    this.sprite = this.calculateSpritesForPaint();
    this.gameCanvas.paint(this.mouse, this.sprite, this.isPaused);

    nextFrame(this.animate.bind(this));
  };


  return Game;
});
