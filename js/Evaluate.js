/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['EventEmitter', 'Messages', 'MiscUtils', 'Random'],
       function(EventEmitter, Messages, MiscUtils, Random) {
  "use strict";

  var PROBLEMS = ['CVP_CRIME', 'CVP_POLLUTION', 'CVP_HOUSING', 'CVP_TAXES',
                  'CVP_TRAFFIC', 'CVP_UNEMPLOYMENT', 'CVP_FIRE'];
  var NUMPROBLEMS = PROBLEMS.length;
  var NUM_COMPLAINTS = 4;


  function Evaluation(gameLevel) {
    this.problemVotes = [];
    this.problemOrder = [];
    this.evalInit();
    this.gameLevel = '' + gameLevel;
    this.changed = false;

    EventEmitter(this);
  }


  Evaluation.prototype.cityEvaluation = function(simData) {
    var census = simData.census;

    if (census.totalPop > 0) {
        var problemTable = [];
        for (var i = 0; i < NUMPROBLEMS; i++)
          problemTable.push(0);

      this.getAssessedValue(census);
      this.doPopNum(census);
      this.doProblems(simData.census, simData.budget, simData.blockMaps, problemTable);
      this.getScore(simData, problemTable);
      this.doVotes();
      this.changeEval();
    } else {
      this.evalInit();
      this.cityYes = 50;
      this.changeEval();
    }
  };


  Evaluation.prototype.evalInit = function() {
    this.cityYes = 0;
    this.cityPop = 0;
    this.cityPopDelta = 0;
    this.cityAssessedValue = 0;
    this.cityClass = Evaluation.CC_VILLAGE;
    this.cityScore = 500;
    this.cityScoreDelta = 0;
    for (var i = 0; i < NUMPROBLEMS; i++)
      this.problemVotes[i] = 0;

    for (i = 0; i < NUM_COMPLAINTS; i++)
      this.problemOrder[i] = NUMPROBLEMS;
  };


  Evaluation.prototype.getAssessedValue = function(census) {
    var value;

    value = census.roadTotal * 5;
    value += census.railTotal * 10;
    value += census.policeStationPop * 1000;
    value += census.fireStationPop * 1000;
    value += census.hospitalPop * 400;
    value += census.stadiumPop * 3000;
    value += census.seaportPop * 5000;
    value += census.airportPop * 10000;
    value += census.coalPowerPop * 3000;
    value += census.nuclearPowerPop * 6000;

    this.cityAssessedValue = value * 1000;
  };


  Evaluation.prototype.getPopulation = function(census) {
    var population = (census.resPop + (census.comPop + census.indPop) * 8) * 20;
    return population;
  };


  Evaluation.prototype.doPopNum = function(census) {
    var oldCityPop = this.cityPop;
    var oldCityClass = this.getCityClass(this.cityPop);

    this.cityPop = this.getPopulation(census);

    if (oldCityPop == -1)
        oldCityPop = this.cityPop;

    this.cityPopDelta = this.cityPop - oldCityPop;
    this.cityClass = this.getCityClass(this.cityPop);

    if (this.cityPopDelta !== 0)
      this._emitEvent(Messages.POPULATION_UPDATED, this.cityPop);
    if (this.cityClass !== oldCityClass)
      this._emitEvent(Messages.CLASSIFICATION_UPDATED, this.cityClass);
  };


  Evaluation.prototype.getCityClass = function(cityPopulation) {
    this.cityClassification = Evaluation.CC_VILLAGE;

    if (cityPopulation > 2000)
        this.cityClassification = Evaluation.CC_TOWN;

    if (this.cityPopulation > 10000)
        this.cityClassification = Evaluation.CC_CITY;

    if (this.cityPopulation > 50000)
        this.cityClassification = Evaluation.CC_CAPITAL;

    if (this.cityPopulation > 100000)
        this.cityClassification = Evaluation.CC_METROPOLIS;

    if (this.cityPopulation > 500000)
        this.cityClassification = Evaluation.CC_MEGALOPOLIS;


    return this.cityClassification;
  };


  Evaluation.prototype.voteProblems = function(problemTable) {
    for (var i = 0; i < NUMPROBLEMS; i++)
      this.problemVotes[i] = 0;

    var problem = 0;
    var voteCount = 0;
    var loopCount = 0;

    while (voteCount < 100 && loopCount < 600) {
      if (Random.getRandom(300) < problemTable[problem]) {
        this.problemVotes[problem]++;
        voteCount++;
      }

      problem++;
      if (problem > NUMPROBLEMS) {
        problem = 0;
      }

      loopCount++;
    }
  };


  var getTrafficAverage = function(blockMaps) {
    var trafficDensityMap = blockMaps.trafficDensityMap;
    var landValueMap = blockMaps.landValueMap;

    var trafficTotal = 0;
    var count = 1;

    for (var x = 0; x < landValueMap.mapWidth; x += landValueMap.blockSize) {
      for (var y = 0; y < landValueMap.mapHeight; y += landValueMap.blockSize) {
        if (landValueMap.worldGet(x, y) > 0) {
          trafficTotal += trafficDensityMap.worldGet(x, y);
          count++;
        }
      }
    }

    var trafficAverage = Math.floor(trafficTotal / count) * 2.4;

    return trafficAverage;
  };


  var getUnemployment = function(census) {
    var b = (census.comPop + census.indPop) * 8;

    if (b === 0)
        return 0;

    // Ratio total people / working. At least 1.
    var r = census.resPop / b;

    b = Math.round((r - 1) * 255);
    return Math.min(b, 255);
  };


  var getFireSeverity = function(census) {
    return Math.min(census.firePop * 5, 255);
  };


  Evaluation.prototype.doProblems = function(census, budget, blockMaps, problemTable) {
    var problemTaken = [];

    for (var i = 0; i < NUMPROBLEMS; i++) {
      problemTaken[i] = false;
      problemTable[i] = 0;
    }

    problemTable[Evaluation.CRIME]        = census.crimeAverage;
    problemTable[Evaluation.POLLUTION]    = census.pollutionAverage;
    problemTable[Evaluation.HOUSING]      = census.landValueAverage * 7 / 10;
    problemTable[Evaluation.TAXES]        = budget.cityTax * 10;
    problemTable[Evaluation.TRAFFIC]      = getTrafficAverage(blockMaps);
    problemTable[Evaluation.UNEMPLOYMENT] = getUnemployment(census);
    problemTable[Evaluation.FIRE]         = getFireSeverity(census);

    this.voteProblems(problemTable);

    for (i = 0; i < NUM_COMPLAINTS; i++) {
      // Find biggest problem not taken yet
      var maxVotes = 0;
      var bestProblem = NUMPROBLEMS;
      for (var j = 0; j < NUMPROBLEMS; j++) {
        if ((this.problemVotes[j] > maxVotes) && (!problemTaken[j])) {
          bestProblem = j;
          maxVotes = this.problemVotes[j];
        }
      }

      // bestProblem == NUMPROBLEMS means no problem found
      this.problemOrder[i] = bestProblem;
      if (bestProblem < NUMPROBLEMS) {
        problemTaken[bestProblem] = true;
      }
    }
  };


  Evaluation.prototype.getScore = function(simData, problemTable) {
    var census = simData.census;
    var budget = simData.budget;
    var valves = simData.valves;

    var cityScoreLast;

    cityScoreLast = this.cityScore;
    var score = 0;

    for (var i = 0; i < NUMPROBLEMS; i++)
        score += problemTable[i];

    score = Math.floor(score / 3);
    score = Math.min(score, 256);

    score = MiscUtils.clamp((256 - score) * 4, 0, 1000);

    if (valves.resCap)
        score = Math.round(score * 0.85);

    if (valves.comCap)
        score = Math.round(score * 0.85);

    if (valves.indCap)
        score = Math.round(score * 0.85);

    if (budget.roadEffect < budget.MAX_ROAD_EFFECT)
        score -= budget.MAX_ROAD_EFFECT - budget.roadEffect;

    if (budget.policeEffect < budget.MAX_POLICE_STATION_EFFECT) {
        score = Math.round(score * (0.9 + (budget.policeEffect / (10.0001 * budget.MAX_POLICE_STATION_EFFECT))));
    }

    if (budget.fireEffect < budget.MAX_FIRE_STATION_EFFECT) {
        score = Math.round(score * (0.9 + (budget.fireEffect / (10.0001 * budget.MAX_FIRE_STATION_EFFECT))));
    }

    if (valves.resValve < -1000)
        score = Math.round(score * 0.85);


    if (valves.comValve < -1000)
        score = Math.round(score * 0.85);


    if (valves.indValve < -1000)
        score = Math.round(score * 0.85);


    var scale = 1.0;
    if (this.cityPop === 0 || this.cityPopDelta === 0) {
      scale = 1.0; // there is nobody or no migration happened
    } else if (this.cityPopDelta == this.cityPop) {
      scale = 1.0; // city sprang into existence or doubled in size
    } else if (this.cityPopDelta > 0) {
      scale = (this.cityPopDelta / this.cityPop) + 1.0;
    } else if (this.cityPopDelta < 0) {
      scale = 0.95 + Math.floor(this.cityPopDelta / (this.cityPop - this.cityPopDelta));
    }

    score = Math.round(score * scale);
    score = score - getFireSeverity(census) - budget.cityTax; // dec score for fires and tax

    scale = census.unpoweredZoneCount + census.poweredZoneCount;   // dec score for unpowered zones
    if (scale > 0.0)
      score = Math.round(score * (census.poweredZoneCount / scale));

    score = MiscUtils.clamp(score, 0, 1000);

    this.cityScore = Math.round((this.cityScore + score) / 2);

    this.cityScoreDelta = this.cityScore - cityScoreLast;

    if (this.cityScoreDelta !== 0)
      this._emitEvent(Messages.SCORE_UPDATED, this.cityScore);
  };


  Evaluation.prototype.doVotes = function() {
    var i;

    this.cityYes = 0;

    for (i = 0; i < 100; i++) {
      if (Random.getRandom(1000) < this.cityScore)
        this.cityYes++;
    }
  };


  Evaluation.prototype.changeEval = function() {
    this.changed = true;
  };


  Evaluation.prototype.countProblems = function() {
    var i;
    for (i = 0; i < NUM_COMPLAINTS; i++) {
      if (this.problemOrder[i] === NUMPROBLEMS)
        break;
    }

    return i;
  };

  Evaluation.prototype.getProblemNumber = function(i) {
    if (i < 0 || i >= NUM_COMPLAINTS ||
        this.problemOrder[i] === NUMPROBLEMS)
        return -1;
    else
      return this.problemOrder[i];
  };


  Evaluation.prototype.getProblemVotes = function(i) {
    if (i < 0 || i >= NUM_COMPLAINTS ||
        this.problemOrder[i] == NUMPROBLEMS)
      return -1;
    else
      return this.problemVotes[this.problemOrder[i]];
  };


  Object.defineProperties(Evaluation,
    {CC_VILLAGE: MiscUtils.makeConstantDescriptor('VILLAGE'),
    CC_TOWN: MiscUtils.makeConstantDescriptor('TOWN'),
    CC_CITY: MiscUtils.makeConstantDescriptor('CITY'),
    CC_CAPITAL: MiscUtils.makeConstantDescriptor('CAPITAL'),
    CC_METROPOLIS: MiscUtils.makeConstantDescriptor('METROPOLIS'),
    CC_MEGALOPOLIS: MiscUtils.makeConstantDescriptor('MEGALOPOLIS'),
    CRIME: MiscUtils.makeConstantDescriptor(0),
    POLLUTION: MiscUtils.makeConstantDescriptor(1),
    HOUSING: MiscUtils.makeConstantDescriptor(2),
    TAXES: MiscUtils.makeConstantDescriptor(3),
    TRAFFIC: MiscUtils.makeConstantDescriptor(4),
    UNEMPLOYMENT: MiscUtils.makeConstantDescriptor(5),
    FIRE: MiscUtils.makeConstantDescriptor(6)});
  return Evaluation;
});
