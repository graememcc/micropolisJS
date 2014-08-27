/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['BlockMap', 'BlockMapUtils', 'Budget', 'Census', 'Commercial', 'DisasterManager', 'EventEmitter', 'EmergencyServices', 'Evaluate', 'Industrial', 'MapScanner', 'Messages', 'MessageManager', 'MiscTiles', 'MiscUtils', 'PowerManager', 'RepairManager', 'Residential', 'Road', 'SpriteManager', 'Stadia', 'Traffic', 'Transport', 'Valves'],
        function(BlockMap, BlockMapUtils, Budget, Census, Commercial, DisasterManager, EventEmitter, EmergencyServices, Evaluate, Industrial, MapScanner, Messages, MessageManager, MiscTiles, MiscUtils, PowerManager, RepairManager, Residential, Road, SpriteManager, Stadia, Traffic, Transport, Valves) {
  "use strict";

  function Simulation(gameMap, gameLevel, speed) {
    if (gameLevel !== Simulation.LEVEL_EASY &&
        gameLevel !== Simulation.LEVEL_MED &&
        gameLevel !== Simulation.LEVEL_HARD)
      throw new Error('Invalid level!');

    if (speed !== Simulation.SPEED_PAUSED &&
        speed !== Simulation.SPEED_SLOW &&
        speed !== Simulation.SPEED_MED &&
        speed !== Simulation.SPEED_FAST)
      throw new Error('Invalid speed!');

    this._map = gameMap;
    this._gameLevel = gameLevel;

    this._speed = speed;
    this._speedCycle = 0;
    this._phaseCycle = 0;
    this._simCycle = 0;
    this._doInitialEval = true;
    this._cityTime = 50;
    this._cityPopLast = 0;
    this._messageLast = Messages.VILLAGE_REACHED;
    this._startingYear = 1900;

    // Last valves updated to the user
    this._resValveLast = 0;
    this._comValveLast = 0;
    this._indValveLast = 0;

    // Last date sent to front end
    this._cityYearLast = -1;
    this._cityMonthLast = -1;

    // And now, the main cast of characters
    this.evaluation = new Evaluate(this._gameLevel);
    this._valves = new Valves();
    this.budget = new Budget();
    this._census = new Census();
    this._messageManager = new MessageManager();
    this._powerManager = new PowerManager(this._map);
    this.spriteManager = new SpriteManager(this._map);
    this._mapScanner = new MapScanner(this._map);
    this._repairManager = new RepairManager(this._map);
    this._traffic = new Traffic(this._map, this.spriteManager);
    this.disasterManager = new DisasterManager(this._map, this.spriteManager, this._gameLevel);

    this.blockMaps = {
      comRateMap: new BlockMap(this._map.width, this._map.height, 8, 0),
      crimeRateMap: new BlockMap(this._map.width, this._map.height, 2, 0),
      fireStationMap: new BlockMap(this._map.width, this._map.height, 8, 0),
      fireStationEffectMap: new BlockMap(this._map.width, this._map.height, 8, 0),
      landValueMap: new BlockMap(this._map.width, this._map.height, 2, 0),
      policeStationMap: new BlockMap(this._map.width, this._map.height, 8, 0),
      policeStationEffectMap: new BlockMap(this._map.width, this._map.height, 8, 0),
      pollutionDensityMap: new BlockMap(this._map.width, this._map.height, 2, 0),
      populationDensityMap: new BlockMap(this._map.width, this._map.height, 2, 0),
      rateOfGrowthMap: new BlockMap(this._map.width, this._map.height, 8, 0),
      tempMap1: new BlockMap(this._map.width, this._map.height, 2, 0),
      tempMap2: new BlockMap(this._map.width, this._map.height, 2, 0),
      tempMap3: new BlockMap(this._map.width, this._map.height, 4, 0),
      terrainDensityMap: new BlockMap(this._map.width, this._map.height, 4, 0),
      trafficDensityMap: new BlockMap(this._map.width, this._map.height, 2, 0)
    };


    this.init();
  }


  Simulation.prototype.setSpeed = function(s) {
    if (s!== Simulation.SPEED_PAUSED &&
        s!== Simulation.SPEED_SLOW &&
        s!== Simulation.SPEED_MED &&
        s!== Simulation.SPEED_FAST)
      throw new Error('Invalid speed!');

    this._speed = s;
  };


  Simulation.prototype.isPaused = function() {
    return this._speed === Simulation.SPEED_PAUSED;
  };


  Simulation.prototype.simTick = function() {
    this._simFrame();
    // Move sprite objects
    //this.spriteManager.moveObjects(this._constructSimData());
    this._updateTime();
    // TODO Graphs
    return this._messageManager.getMessages();
  };


  Simulation.prototype._simFrame = function() {
    if (this.budget.awaitingValues)
      return;

    if (this._speed === 0)
      return;

    if (this._speed === 1 && (this._speedCycle % 5) !== 0)
      return;

    if (this._speed === 2 && (this._speedCycle % 3) !== 0)
      return;

    this._messageManager.clear();
    var simData = this._constructSimData();
    this._simulate(simData);
  };


  Simulation.prototype._clearCensus = function() {
    this._census.clearCensus();
    this._powerManager.clearPowerStack();
    this.blockMaps.fireStationMap.clear();
    this.blockMaps.policeStationMap.clear();
  };


  Simulation.prototype._constructSimData = function() {
    return {
      blockMaps: this.blockMaps,
      budget: this.budget,
      census: this._census,
      cityTime: this._cityTime,
      disasterManager: this.disasterManager,
      gameLevel: this._gameLevel,
      messageManager: this._messageManager,
      repairManager: this._repairManager,
      powerManager: this._powerManager,
      simulator: this,
      spriteManager: this.spriteManager,
      trafficManager: this._traffic,
      valves: this._valves
    };
  };


  Simulation.prototype.init = function() {
    EventEmitter(this);

    // Add various listeners that we will in turn transmit upwards
    var evaluationEvents = ['CLASSIFICATION_UPDATED', 'POPULATION_UPDATED', 'SCORE_UPDATED'].map(function(m) {
      return Messages[m];
    });
    for (var i = 0, l = evaluationEvents.length; i < l; i++)
      this.evaluation.addEventListener(evaluationEvents[i], MiscUtils.reflectEvent.bind(this, evaluationEvents[i]));

    this.budget.addEventListener(Messages.FUNDS_CHANGED, MiscUtils.reflectEvent.bind(this, Messages.FUNDS_CHANGED));

    this._valves.addEventListener(Messages.VALVES_UPDATED, this._onValveChange.bind(this));

    for (i = 0, l = Messages.disasterMessages.length; i < l; i++) {
      this.spriteManager.addEventListener(Messages.disasterMessages[i], this._onDisasterMessage.bind(this, Messages.disasterMessages[i]));
      this.disasterManager.addEventListener(Messages.disasterMessages[i], this._onDisasterMessage.bind(this, Messages.disasterMessages[i]));
    }
    for (i = 0, l = Messages.crashes.length; i < l; i++)
      this.spriteManager.addEventListener(Messages.crashes[i], this._onDisasterMessage.bind(this, Messages.crashes[i]));

    // Register actions
    Commercial.registerHandlers(this._mapScanner, this._repairManager);
    EmergencyServices.registerHandlers(this._mapScanner, this._repairManager);
    Industrial.registerHandlers(this._mapScanner, this._repairManager);
    MiscTiles.registerHandlers(this._mapScanner, this._repairManager);
    this._powerManager.registerHandlers(this._mapScanner, this._repairManager);
    Road.registerHandlers(this._mapScanner, this._repairManager);
    Residential.registerHandlers(this._mapScanner, this._repairManager);
    Stadia.registerHandlers(this._mapScanner, this._repairManager);
    Transport.registerHandlers(this._mapScanner, this._repairManager);

    this.budget.setFunds(20000);
    var simData = this._constructSimData();
    this.evaluation.evalInit();
    this._valves.setValves(this._gameLevel, this._census, this.budget);
    this._clearCensus();
    this._mapScanner.mapScan(0, this._map.width, simData);
    this._powerManager.doPowerScan(this._census, this._messageManager);
    BlockMapUtils.pollutionTerrainLandValueScan(this._map, this._census, this.blockMaps);
    BlockMapUtils.crimeScan(this._census, this.blockMaps);
    BlockMapUtils.populationDensityScan(this._map, this.blockMaps);
    BlockMapUtils.fireAnalysis(this.blockMaps);
    this._census.totalPop = 1;
  };


  var speedPowerScan = [2, 4, 5];
  var speedPollutionTerrainLandValueScan = [2, 7, 17];
  var speedCrimeScan = [1, 8, 18];
  var speedPopulationDensityScan = [1, 9,19];
  var speedFireAnalysis = [1, 10, 20];
  var CENSUS_FREQUENCY_10 = 4;
  var CENSUS_FREQUENCY_120 = CENSUS_FREQUENCY_10 * 10;
  var TAX_FREQUENCY = 48;


  Simulation.prototype._simulate = function(simData) {
    this._phaseCycle &= 15;
    var speedIndex = this._speed - 1;

    switch (this._phaseCycle)  {
      case 0:
        if (++this._simCycle > 1023)
            this._simCycle = 0;

        if (this._doInitialEval) {
          this._doInitialEval = false;
          this.evaluation.cityEvaluation(simData);
        }

        this._cityTime++;

        if ((this._simCycle & 1) === 0)
          this._valves.setValves(this._gameLevel, this._census, this.budget);

        this._clearCensus();
        break;

      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        this._mapScanner.mapScan((this._phaseCycle - 1) * this._map.width / 8,
                                  this._phaseCycle * this._map.width / 8, simData);
        break;

      case 9:
        if (this._cityTime % CENSUS_FREQUENCY_10 === 0)
          this._census.take10Census(budget);

        if (this._cityTime % CENSUS_FREQUENCY_120 === 0)
          this._census.take120Census(budget);

        if (this._cityTime % TAX_FREQUENCY === 0)  {
          this.budget.collectTax(this._gameLevel, this._census, this._messageManager);
          this.evaluation.cityEvaluation(simData);
        }

        break;

      case 10:
        if ((this._simCycle % 5) === 0)
          BlockMapUtils.decRateOfGrowthMap(simData.blockMaps);

        BlockMapUtils.decTrafficMap(this.blockMaps);
        this._sendMessages();
        break;

      case 11:
        if ((this._simCycle % speedPowerScan[speedIndex]) === 0)
          this._powerManager.doPowerScan(this._census, this._messageManager);
        break;

      case 12:
        if ((this._simCycle % speedPollutionTerrainLandValueScan[speedIndex]) === 0)
          BlockMapUtils.pollutionTerrainLandValueScan(this._map, this._census, this.blockMaps);
        break;

      case 13:
        if ((this._simCycle % speedCrimeScan[speedIndex]) === 0)
          BlockMapUtils.crimeScan(this._census, this.blockMaps);
        break;

      case 14:
        if ((this._simCycle % speedPopulationDensityScan[speedIndex]) === 0)
          BlockMapUtils.populationDensityScan(this._map, this.blockMaps);
        break;

      case 15:
        if ((this._simCycle % speedFireAnalysis[speedIndex]) === 0)
          BlockMapUtils.fireAnalysis(this.blockMaps);

        this.disasterManager.doDisasters(this._census, this._messageManager);
        break;
    }

    // Go on the the next phase.
    this._phaseCycle = (this._phaseCycle + 1) & 15;
  };


  Simulation.prototype._onDisasterMessage = function(message, data) {
    this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: message, data: data});
  };


  Simulation.prototype._sendMessages = function() {
    this._checkGrowth();

    var totalZonePop = this._census.resZonePop + this._census.comZonePop +
                       this._census.indZonePop;
    var powerPop = this._census.nuclearPowerPop + this._census.coalPowerPop;

    switch (this._cityTime & 63) {
      case 1:
        if (Math.floor(totalZonePop / 4) >= this._census.resZonePop)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.NEED_MORE_RESIDENTIAL});
        break;

      case 5:
        if (Math.floor(totalZonePop / 8) >= this._census.comZonePop)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.NEED_MORE_COMMERCIAL});
        break;

      case 10:
        if (Math.floor(totalZonePop / 8) >= this._census.indZonePop)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.NEED_MORE_INDUSTRIAL});
        break;

      case 14:
        if (totalZonePop > 10 && totalZonePop * 2 > this._census.roadTotal)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.NEED_MORE_ROADS});
        break;

      case 18:
        if (totalZonePop > 50 && totalZonePop > this._census.railTotal)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.NEED_MORE_RAILS});
        break;

      case 22:
        if (totalZonePop > 10 && powerPop == 0)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.NEED_ELECTRICITY});
        break;

      case 26:
        if (this._census.resPop > 500 && this._census.stadiumPop === 0) {
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.MESSAGE_NEED_STADIUM});
          this._valves.resCap = true;
        } else {
          this._valves.resCap = false;
        }
        break;

      case 28:
        if (this._census.indPop > 70 && this._census.seaportPop === 0) {
            this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.NEED_SEAPORT});
          this._valves.indCap = true;
        } else {
          this._valves.indCap = false;
        }
        break;

      case 30:
        if (this._census.comPop > 100 && this._census.airportPop === 0) {
            this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages._NEED_AIRPORT});
          this._valves.comCap = true;
        } else {
          this._valves.comCap = false;
        }
        break;

      case 32:
        var zoneCount = this._census.unpoweredZoneCount + this._census.poweredZoneCount;
        if (zoneCount > 0) {
          if (this._census.poweredZoneCount / zoneCount < 0.7)
            this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.BLACKOUTS_REPORTED});
        }
        break;

      case 35:
        if (this._census.pollutionAverage > 60)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.HIGH_POLLUTION});
        break;

      case 42:
        if (this._census.crimeAverage > 100)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.HIGH_CRIME});
        break;

      case 45:
        if (this._census.totalPop > 60 && this._census.fireStationPop === 0)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.NEED_FIRE_STATION});
        break;

      case 48:
        if (this._census.totalPop > 60 && this._census.policeStationPop === 0)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.NEED_POLICE_STATION});
        break;

      case 51:
        if (this.budget.cityTax > 12)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.TAX_TOO_HIGH});
        break;

      case 54:
        if (this.budget.roadEffect < Math.floor(5 * this.budget.MAX_ROAD_EFFECT / 8) && this._census.roadTotal > 30)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.ROAD_NEEDS_FUNDING});
        break;

      case 57:
        if (this.budget.fireEffect < Math.floor(7 * this.budget.MAX_FIRE_STATION_EFFECT / 10) && this._census.totalPop > 20)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.FIRE_STATION_NEEDS_FUNDING});
        break;

      case 60:
        if (this.budget.policeEffect < Math.floor(7 * this.budget.MAX_POLICE_STATION_EFFECT / 10) && this._census.totalPop > 20)
          this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.POLICE_NEEDS_FUNDING});
        break;

    case 63:
      if (this._census.trafficAverage > 60)
        this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: Messages.TRAFFIC_JAMS});
      break;
    }
  };


  Simulation.prototype._checkGrowth = function() {
    if ((this._cityTime & 3) === 0) {
      var message = '';
      var thisCityPop = this.evaluation.getPopulation(this._census);

      if (this._cityPopLast > 0) {
        var lastClass = this.evaluation.getCityClass(this._cityPopLast);
        var newClass = this.evaluation.getCityClass(thisCityPop);

        if (lastClass !== newClass) {
          switch (newClass) {
            case Evaluate.CC_VILLAGE:
              // Don't mention it.
              break;

            case Evaluate.CC_TOWN:
              message = Messages.REACHED_TOWN;
              break;

            case Evaluate.CC_CITY:
              message = Messages.REACHED_CITY;
              break;

            case Evaluate.CC_CAPITAL:
              message = Messages.REACHED_CAPITAL;
                break;

            case Evaluate.CC_METROPOLIS:
              message = Messages.REACHED_METROPOLIS;
              break;

            case Evaluate.CC_MEGALOPOLIS:
              message = Messages.REACHED_MEGALOPOLIS;
              break;

            default:
                break;
          }
        }
      }

      if (message !== '' && message !== this._messageLast) {
        this._emitEvent(Messages.FRONT_END_MESSAGE, {subject: message});
        this._messageLast = message;
      }

      this._cityPopLast = thisCityPop;
    }
  };


  Simulation.prototype._onValveChange  = function() {
    // XXX Examine whether we need to keep the previous values
    this._resLast = this._valves.resValve;
    this._comLast = this._valves.comValve;
    this._indLast = this._valves.indValve;

    // XXX When this was in updateFrontEnd it had a comment that updating
    // the valves updated the population. It seems I was talking nonsense
    this._emitEvent(Messages.VALVES_UPDATED, {residential: this._valves.resValve,
                                              commercial: this._valves.comValve,
                                              industrial: this._valves.indValve});
  };


  Simulation.prototype._setYear = function(year) {
    if (year < this._startingYear)
      year = this._startingYear;

    year = (year - this._startingYear) - (this._cityTime / 48);
    this._cityTime += year * 48;
    this._updateTime();
  };


  Simulation.prototype._updateTime = function() {
    var megalinium = 1000000;
    var cityYear = Math.floor(this._cityTime / 48) + this._startingYear;
    var cityMonth = Math.floor(this._cityTime % 48) >> 2;

    if (cityYear >= megalinium) {
      this.setYear(startingYear);
      return;
    }

    if (this._cityYearLast !== cityYear || this._cityMonthLast !== cityMonth) {
      this._cityYearLast = cityYear;
      this._cityMonthLast = cityMonth;
      this._emitEvent(Messages.DATE_UPDATED, {month: cityMonth, year: cityYear});
    }
  };


  Object.defineProperties(Simulation,
    {LEVEL_EASY: MiscUtils.makeConstantDescriptor(0),
    LEVEL_MED:  MiscUtils.makeConstantDescriptor(1),
    LEVEL_HARD: MiscUtils.makeConstantDescriptor(2),
    SPEED_PAUSED: MiscUtils.makeConstantDescriptor(0),
    SPEED_SLOW:  MiscUtils.makeConstantDescriptor(1),
    SPEED_MED: MiscUtils.makeConstantDescriptor(2),
    SPEED_FAST: MiscUtils.makeConstantDescriptor(3),
  });


  return Simulation;
});
