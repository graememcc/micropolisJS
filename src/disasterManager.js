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

import { EventEmitter } from './eventEmitter.js';
import * as Messages from './messages.ts';
import { MiscUtils } from './miscUtils.js';
import { Random } from './random.ts';
import { SPRITE_AIRPLANE } from './spriteConstants.ts';
import { TileUtils } from './tileUtils.js';
import * as TileValues from "./tileValues.ts";
import { ZoneUtils } from './zoneUtils.js';

var DisasterManager = EventEmitter(function(map, spriteManager, gameLevel) {
  this._map = map;
  this._spriteManager = spriteManager;
  this._gameLevel = gameLevel;

  this._floodCount = 0;
  this.disastersEnabled = false;
});


var DisChance = [479, 239, 59];

DisasterManager.prototype.doDisasters = function(census) {
  if (this._floodCount)
      this._floodCount--;

  // TODO Scenarios

  if (!this.disastersEnabled)
      return;

  if (!Random.getRandom(DisChance[this._gameLevel])) {
    switch (Random.getRandom(8)) {
      case 0:
      case 1:
        this.setFire();
        break;

      case 2:
      case 3:
        this.makeFlood();
        break;

      case 4:
        break;

      case 5:
        this._spriteManager.makeTornado();
        break;

      case 6:
        // TODO Earthquakes
        //this.makeEarthquake();
        break;

      case 7:
      case 8:
        if (census.pollutionAverage > 60)
          this._spriteManager.makeMonster();
        break;
    }
  }
};


DisasterManager.prototype.scenarioDisaster = function() {
  // TODO Scenarios
};


// User initiated meltdown: need to find the plant first
DisasterManager.prototype.makeMeltdown = function() {
  for (var x = 0; x < (this._map.width - 1); x++) {
    for (var y = 0; y < (this._map.height - 1); y++) {
      if (this._map.getTileValue(x, y) === TileValues.NUCLEAR) {
        this.doMeltdown(x, y);
        return;
      }
    }
  }
};


var vulnerable = function(tile) {
  var tileValue = tile.getValue();

  if (tileValue < TileValues.RESBASE || tileValue > TileValues.LASTZONE || tile.isZone())
    return false;

  return true;
};


// User initiated earthquake
DisasterManager.prototype.makeEarthquake = function() {
  var strength = Random.getRandom(700) + 300;
  this.doEarthquake(strength);

  this._emitEvent(Messages.EARTHQUAKE, {x: this._map.cityCenterX, y: this._map.cityCenterY});

  for (var i = 0; i < strength; i++)  {
    var x = Random.getRandom(this._map.width - 1);
    var y = Random.getRandom(this._map.height - 1);

    if (!this._map.testBounds(x, y))
      continue;

    if (vulnerable(this._map.getTile(x, y))) {
      if ((i & 0x3) !== 0)
        this._map.setTo(x, y, TileUtils.randomRubble());
      else
        this._map.setTo(x, y, TileUtils.randomFire());
    }
  }
};


DisasterManager.prototype.setFire = function(times, zonesOnly) {
  times = times || 1;
  zonesOnly = zonesOnly || false;

  for (var i = 0; i < times; i++) {
    var x = Random.getRandom(this._map.width - 1);
    var y = Random.getRandom(this._map.height - 1);

    if (!this._map.testBounds(x, y))
      continue;

    var tile = this._map.getTile(x, y);

    if (!tile.isZone()) {
      tile = tile.getValue();
      var lowerLimit = zonesOnly ? TileValues.LHTHR : TileValues.TREEBASE;
      if (tile > lowerLimit && tile < TileValues.LASTZONE) {
        this._map.setTo(x, y, TileUtils.randomFire());
        this._emitEvent(Messages.FIRE_REPORTED, {showable: true, x: x, y: y});
        return;
      }
    }
  }
};


// User initiated plane crash
DisasterManager.prototype.makeCrash = function() {
  var s = this._spriteManager.getSprite(SPRITE_AIRPLANE);
  if (s !== null) {
    s.explodeSprite();
    return;
  }

  var x = Random.getRandom(this._map.width - 1);
  var y = Random.getRandom(this._map.height - 1);
  this._spriteManager.generatePlane(x, y);
  s = this._spriteManager.getSprite(SPRITE_AIRPLANE);
  s.explodeSprite();
};


// User initiated fire
DisasterManager.prototype.makeFire = function() {
  this.setFire(40, false);
};


var Dx = [ 0, 1, 0, -1];
var Dy = [-1, 0, 1, 0];

DisasterManager.prototype.makeFlood = function() {
  for (var i = 0; i < 300; i++) {
    var x = Random.getRandom(this._map.width - 1);
    var y = Random.getRandom(this._map.height - 1);
    if (!this._map.testBounds(x, y))
      continue;

    var tileValue = this._map.getTileValue(x, y);

    if (tileValue > TileValues.CHANNEL && tileValue <= TileValues.WATER_HIGH) {
      for (var j = 0; j < 4; j++) {
        var xx = x + Dx[j];
        var yy = y + Dy[j];

        if (!this._map.testBounds(xx, yy))
          continue;

        var tile = this._map.getTile(xx, yy);
        tileValue = tile.getValue();

        if (tile === TileValues.DIRT || (tile.isBulldozable() && tile.isCombustible)) {
          this._map.setTile(xx, yy, TileValues.FLOOD, 0);
          this._floodCount = 30;
          this._emitEvent(Messages.FLOODING_REPORTED, {showable: true, x: xx, y: yy});
          return;
        }
      }
    }
  }
};


DisasterManager.prototype.doFlood = function(x, y, blockMaps) {
  if (this._floodCount > 0) {
    // Flood is not over yet
    for (var i = 0; i < 4; i++) {
      if (Random.getChance(7)) {
        var xx = x + Dx[i];
        var yy = y + Dy[i];

        if (this._map.testBounds(xx, yy)) {
          var tile = this._map.getTile(xx, yy);
          var tileValue = tile.getValue();

          if (tile.isCombustible() || tileValue === TileValues.DIRT ||
              (tileValue >= TileValues.WOODS5 && tileValue < TileValues.FLOOD)) {
            if (tile.isZone())
              ZoneUtils.fireZone(this._map, xx, yy, blockMaps);

            this._map.setTile(xx, yy, TileValues.FLOOD + Random.getRandom(2), 0);
          }
        }
      }
    }
  } else {
    if (Random.getChance(15))
      this._map.setTile(x, y, TileValues.DIRT, 0);
  }
};


DisasterManager.prototype.doMeltdown = function(x, y) {
  this._spriteManager.makeExplosion(x - 1, y - 1);
  this._spriteManager.makeExplosion(x - 1, y + 2);
  this._spriteManager.makeExplosion(x + 2, y - 1);
  this._spriteManager.makeExplosion(x + 2, y + 2);

  var dY, dX;

  // Whole power plant is on fire
  for (dX = x - 1; dX < x + 3; dX++) {
    for (dY = y - 1; dY < y + 3; dY++) {
      this._map.setTo(dX, dY, TileUtils.randomFire());
    }
  }

  // Add lots of radiation tiles around the plant
  for (var i = 0; i < 200; i++)  {
    dX = x - 20 + Random.getRandom(40);
    dY = y - 15 + Random.getRandom(30);

    if (!this._map.testBounds(dX, dY))
      continue;

    var tile = this._map.getTile(dX, dY);

    if (tile.isZone())
        continue;

    if (tile.isCombustible() || tile.getValue() === TileValues.DIRT)
        this._map.setTile(dX, dY, TileValues.RADTILE, 0);
  }

  // Report disaster to the user
  this._emitEvent(Messages.NUCLEAR_MELTDOWN, {showable: true, x: x, y: y});
};


export { DisasterManager };
