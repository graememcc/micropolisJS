/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['BudgetWindow', 'DisasterWindow', 'GameCanvas', 'EvaluationWindow', 'InfoBar', 'InputStatus', 'Messages', 'MessageManager', 'Notification', 'QueryWindow', 'RCI', 'Simulation', 'Text'],
       function(BudgetWindow, DisasterWindow, GameCanvas, EvaluationWindow, InfoBar, InputStatus, Messages, MessageManager, Notification, QueryWindow, RCI, Simulation, Text) {
  "use strict";


  function Game(gameMap, tileSet, spriteSheet, difficulty) {
    difficulty = difficulty || 0;

    this.gameMap = gameMap;
    this.tileSet = tileSet;
    this.simulation = new Simulation(this.gameMap, difficulty, 1);
    this.rci = new RCI('RCIContainer');
    this.budgetWindow = new BudgetWindow('opaque', 'budget');
    this.queryWindow = new QueryWindow('opaque', 'queryWindow');
    this.evalWindow = new EvaluationWindow('opaque', 'evalWindow');
    this.disasterWindow = new DisasterWindow('opaque', 'disasterWindow');

    this.gameCanvas = new GameCanvas('canvasContainer');
    this.gameCanvas.init(this.gameMap, this.tileSet, spriteSheet);
    this.inputStatus = new InputStatus(this.gameMap);
    this.mouse = null;
    this.sprites = null;
    this.lastCoord = null;

    // Unhide controls
    this.revealControls();

    this.budgetShowing = false;
    this.queryShowing = false;
    this.evalShowing = false;
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
   this.rci.update(0, 0, 0);
  };


  Game.prototype.handleDisasterClosed = function(request) {
    this.disasterShowing = false;
    if (request === DisasterWindow.DISASTER_NONE)
      return;

    var m = new MessageManager();
    switch (request) {
      case DisasterWindow.DISASTER_MONSTER:
        this.simulation.spriteManager.makeMonster(m);
        break;

      case DisasterWindow.DISASTER_FIRE:
        this.simulation.disasterManager.makeFire(m);
        break;

      case DisasterWindow.DISASTER_FLOOD:
        this.simulation.disasterManager.makeFlood(m);
        break;

      case DisasterWindow.DISASTER_CRASH:
        this.simulation.disasterManager.makeCrash(m);
        break;

      case DisasterWindow.DISASTER_MELTDOWN:
        this.simulation.disasterManager.makeMeltdown(m);
        break;

      case DisasterWindow.DISASTER_TORNADO:
        this.simulation.spriteManager.makeTornado(m);
    }

    this.processMessages(m.getMessages());
  };


  Game.prototype.handleEvalClosed = function() {
    this.evalShowing = false;
  };


  Game.prototype.handleQueryClosed = function() {
    this.queryShowing = false;
  };


  Game.prototype.handleBudgetClosed = function(cancelled, data) {
    this.budgetShowing = false;
    if (!cancelled) {
      this.simulation.budget.roadPercent = data.roadPercent / 100;
      this.simulation.budget.firePercent = data.firePercent / 100;
      this.simulation.budget.policePercent = data.policePercent / 100;
      this.simulation.budget.setTax(data.taxPercent);
      if (this.simNeededBudget) {
        this.simulation.budget.doBudget(new MessageManager());
        this.simNeededBudget = false;
      } else {
        this.simulation.budget.updateFundEffects();
      }
    }
  };


  Game.prototype.handleDisasterRequest = function() {
    this.disasterShowing = true;
    this.disasterWindow.open(this.handleDisasterClosed.bind(this));

    // Let the input know we handled this request
    this.inputStatus.disasterHandled();
    nextFrame(this.tick.bind(this));
  };


  Game.prototype.handleEvalRequest = function() {
    this.evalShowing = true;
    this.evalWindow.open(this.handleEvalClosed.bind(this), this.simulation.evaluation);

    // Let the input know we handled this request
    this.inputStatus.evalHandled();
    nextFrame(this.tick.bind(this));
  };


  Game.prototype.handleBudgetRequest = function() {
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

    this.budgetWindow.open(this.handleBudgetClosed.bind(this), budgetData);

    // Let the input know we handled this request
    this.inputStatus.budgetHandled();

    nextFrame(this.tick.bind(this));
  };


  Game.prototype.handleTool = function(x, y) {
    // Were was the tool clicked?
    var tileCoords = this.gameCanvas.canvasCoordinateToTileCoordinate(x, y);

    if (tileCoords === null) {
      this.inputStatus.clickHandled();
      return;
    }

    var tool = this.inputStatus.currentTool;

    var budget = this.simulation.budget;
    var evaluation = this.simulation.evaluation;
    var messageMgr = new MessageManager();

    // do it!
    tool.doTool(tileCoords.x, tileCoords.y, messageMgr, this.simulation.blockMaps);

    tool.modifyIfEnoughFunding(budget, messageMgr);
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

    this.processMessages(messageMgr.getMessages());
    this.inputStatus.clickHandled();
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
    if (this.inputStatus.budgetRequested) {
      this.handleBudgetRequest();
      return;
    }

    if (this.inputStatus.evalRequested) {
      this.handleEvalRequest();
      return;
    }

    if (this.inputStatus.disasterRequested) {
      this.handleDisasterRequest();
      return;
    }

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

    // Was a tool clicked?
    if (this.inputStatus.currentTool !== null && this.inputStatus.clickX !== -1 &&
        this.inputStatus.clickY !== -1)
      this.handleTool(this.inputStatus.clickX, this.inputStatus.clickY);
  };


  Game.prototype.processMessages = function(messages) {
    // Don't want to output more than one user message
    var messageOutput = false;

    for (var i = 0, l = messages.length; i < l; i++) {
      var m = messages[i];

      switch (m.message) {
        case Messages.BUDGET_NEEDED:
          this.simNeededBudget = true;
          this.handleBudgetRequest();
          break;

        case Messages.QUERY_WINDOW_NEEDED:
          this.queryWindow.open(this.handleQueryClosed.bind(this));
          break;

        case Messages.DATE_UPDATED:
          InfoBar.setDate(m.data.month, m.data.year);
          break;

        case Messages.EVAL_UPDATED:
          InfoBar.setClass(Text.cityClass[m.data.classification]);
          InfoBar.setScore(m.data.score);
          InfoBar.setPopulation(m.data.population);
          break;

        case Messages.FUNDS_CHANGED:
          InfoBar.setFunds(m.data);
          break;

        case Messages.VALVES_UPDATED:
          this.rci.update(m.data.residential, m.data.commercial, m.data.industrial);
          break;

        default:
          if (!messageOutput && Text.goodMessages[m.message] !== undefined) {
            messageOutput = true;
            Notification.goodNews(Text.goodMessages[m.message]);
            break;
          }

          if (!messageOutput && Text.badMessages[m.message] !== undefined) {
            messageOutput = true;
            Notification.badNews(Text.badMessages[m.message]);
            break;
          }

          if (!messageOutput && Text.neutralMessages[m.message] !== undefined) {
            messageOutput = true;
            Notification.news(Text.neutralMessages[m.message]);
            break;
          }
      }
    }
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
      var messages = this.simulation.simTick();
      this.processMessages(messages);
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
