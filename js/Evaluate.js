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
  var problemData = [];


  var Evaluation = EventEmitter(function(gameLevel) {
    this.problemVotes = [];
    this.problemOrder = [];
    this.evalInit();
    this.gameLevel = '' + gameLevel;
  });


  Evaluation.prototype.cityEvaluation = function(simData) {
    var census = simData.census;

    if (census.totalPop > 0) {
      for (var i = 0; i < NUMPROBLEMS; i++)
        problemData.push(0);

      this.getAssessedValue(census);
      this.doPopNum(census);
      this.doProblems(simData.census, simData.budget, simData.blockMaps);
      this.getScore(simData);
      this.doVotes();
    } else {
      this.evalInit();
      this.cityYes = 50;
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
      this.problemVotes[i] = {index: i, voteCount: 0};

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

    // Emit population now, to avoid inconsistency with front-end messages
    this._emitEvent(Messages.POPULATION_UPDATED, population);
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


  Evaluation.prototype.voteProblems = function() {
    for (var i = 0; i < NUMPROBLEMS; i++) {
      this.problemVotes[i].index = i;
      this.problemVotes[i].voteCount = 0;
    }

    var problem = 0;
    var voteCount = 0;
    var loopCount = 0;

    // Try to acquire up to 100 votes on problems, but bail if it takes too long
    while (voteCount < 100 && loopCount < 600) {
      var voterProblemTolerance = Random.getRandom(300);
      if (problemData[problem] > voterProblemTolerance) {
        // The voter is upset about this problem
        this.problemVotes[problem].voteCount += 1;
        voteCount++;
      }

      problem = (problem + 1) % NUMPROBLEMS;
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


  Evaluation.prototype.doProblems = function(census, budget, blockMaps) {
    problemData[Evaluation.CRIME]        = census.crimeAverage;
    problemData[Evaluation.POLLUTION]    = census.pollutionAverage;
    problemData[Evaluation.HOUSING]      = census.landValueAverage * 7 / 10;
    problemData[Evaluation.TAXES]        = budget.cityTax * 10;
    problemData[Evaluation.TRAFFIC]      = getTrafficAverage(blockMaps);
    problemData[Evaluation.UNEMPLOYMENT] = getUnemployment(census);
    problemData[Evaluation.FIRE]         = getFireSeverity(census);

    this.voteProblems();

    // Rank the problems
    this.problemVotes.sort(function(a, b) {
      return b.voteCount - a.voteCount;
    });

    this.problemOrder = this.problemVotes.map(function(pv, i) {
      if (i >= NUM_COMPLAINTS || pv.voteCount === 0)
        return null;

      return pv.index;
    });
  };


  Evaluation.prototype.getScore = function(simData) {
    var census = simData.census;
    var budget = simData.budget;
    var valves = simData.valves;

    var cityScoreLast = this.cityScore;
    var score = 0;

    for (var i = 0; i < NUMPROBLEMS; i++)
      score += problemData[i];

    score = Math.floor(score / 3);
    score = (250 - Math.min(score, 250)) * 4;

    // Penalise the player by 15% if demand for any type of zone is capped due
    // to lack of suitable buildings
    var demandPenalty = 0.85;

    if (valves.resCap)
      score = Math.round(score * demandPenalty);

    if (valves.comCap)
      score = Math.round(score * demandPenalty);

    if (valves.indCap)
      score = Math.round(score * demandPenalty);

    // Penalize if roads/rail underfunded
    if (budget.roadEffect < budget.MAX_ROAD_EFFECT)
      score -= budget.MAX_ROAD_EFFECT - budget.roadEffect;

    // Penalize player by up to 10% for underfunded police and fire services
    if (budget.policeEffect < budget.MAX_POLICE_STATION_EFFECT)
      score = Math.round(score * (0.9 + (budget.policeEffect / (10 * budget.MAX_POLICE_STATION_EFFECT))));

    if (budget.fireEffect < budget.MAX_FIRE_STATION_EFFECT)
      score = Math.round(score * (0.9 + (budget.fireEffect / (10 * budget.MAX_FIRE_STATION_EFFECT))));

    // Penalise the player by 15% if demand for any type of zone has collapsed due
    // to overprovision
    if (valves.resValve < -1000)
      score = Math.round(score * 0.85);

    if (valves.comValve < -1000)
      score = Math.round(score * 0.85);

    if (valves.indValve < -1000)
      score = Math.round(score * 0.85);

    var scale = 1.0;
    if (this.cityPop === 0 || this.cityPopDelta === 0 || this.cityPopDelta === this.cityPop) {
      // Leave score unchanged if city is empty, if there hasn't been any migration, if the
      // initial settlers have just arrived, or if the city has doubled in size
      scale = 1.0;
    } else if (this.cityPopDelta > 0) {
      // If the city is growing, scale score by percentage growth in population
      scale = (this.cityPopDelta / this.cityPop) + 1.0;
    } else if (this.cityPopDelta < 0) {
      // If the city is shrinking, scale down by up to 5% based on level of outward migration
      scale = 0.95 + Math.floor(this.cityPopDelta / (this.cityPop - this.cityPopDelta));
    }

    score = Math.round(score * scale);

    // Penalize player for having fires and a burdensome tax rate
    score = score - getFireSeverity(census) - budget.cityTax;

    // Penalize player based on ratio of unpowered zones to total zones
    scale = census.unpoweredZoneCount + census.poweredZoneCount;
    if (scale > 0)
      score = Math.round(score * (census.poweredZoneCount / scale));

    // Force in to range 0-1000. New score is average of last score and new computed value
    score = MiscUtils.clamp(score, 0, 1000);
    this.cityScore = Math.round((this.cityScore + score) / 2);

    this.cityScoreDelta = this.cityScore - cityScoreLast;

    if (this.cityScoreDelta !== 0)
      this._emitEvent(Messages.SCORE_UPDATED, this.cityScore);
  };


  Evaluation.prototype.doVotes = function() {
    // Survey 100 voters on the mayor's performance
    this.cityYes = 0;

    for (var i = 0; i < 100; i++) {
      var voterExpectation = Random.getRandom(1000);
      if (this.cityScore > voterExpectation)
        this.cityYes++;
    }
  };


  Evaluation.prototype.getProblemNumber = function(i) {
    if (i < 0 || i >= NUM_COMPLAINTS)
      return null;

    return this.problemOrder[i];
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
