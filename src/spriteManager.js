/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { AirplaneSprite } from './airplaneSprite.js';
import { BoatSprite } from './boatSprite.js';
import { CopterSprite } from './copterSprite.js';
import { EventEmitter } from './eventEmitter.js';
import { ExplosionSprite } from './explosionSprite.js';
import * as Messages from './messages.ts';
import { MiscUtils } from './miscUtils.js';
import { MonsterSprite } from './monsterSprite.js';
import { Random } from './random.ts';
import * as SpriteConstants from './spriteConstants.ts';
import { SpriteUtils } from './spriteUtils.js';
import { CHANNEL, RIVER } from "./tileValues.ts";
import { TornadoSprite } from './tornadoSprite.js';
import { TrainSprite } from './trainSprite.js';

var SpriteManager = EventEmitter(function(map) {
  this.spriteList = [];
  this.map = map;
  this.spriteCycle = 0;
});


SpriteManager.prototype.getSprite = function(type) {
  var filteredList = this.spriteList.filter(function (s) {
    return s.frame !== 0 && s.type === type;
  });

  if (filteredList.length === 0)
    return null;

  return filteredList[0];
};


SpriteManager.prototype.getSpriteList = function() {
  return this.spriteList.slice();
};


SpriteManager.prototype.getSpritesInView = function(startX, startY, pixelWidth, pixelHeight) {
  var sprites = [];
  startX = SpriteUtils.worldToPix(startX);
  startY = SpriteUtils.worldToPix(startY);
  var lastX = startX + pixelWidth;
  var lastY = startY + pixelHeight;

  return this.spriteList.filter(function(s) {
    var spriteLeft = s.x + s.xOffset;
    var spriteTop = s.y + s.yOffset;
    var spriteRight = s.x + s.xOffset + s.width;
    var spriteBottom = s.y + s.yOffset + s.width;

    var leftInBounds = spriteLeft >= startX && spriteLeft < lastX;
    var rightInBounds = spriteRight >= startX && spriteRight < lastX;
    var topInBounds = spriteTop >= startY && spriteTop < lastY;
    var bottomInBounds = spriteBottom >= startY && spriteBottom < lastY;

    return (leftInBounds || rightInBounds) && (topInBounds || bottomInBounds);
  });
};


SpriteManager.prototype.moveObjects = function(simData) {
  var disasterManager = simData.disasterManager;
  var blockMaps = simData.blockMaps;

  this.spriteCycle += 1;

  var list = this.spriteList.slice();

  for (var i = 0, l = list.length; i < l; i++) {
    var sprite = list[i];

    if (sprite.frame === 0)
      continue;

    sprite.move(this.spriteCycle, disasterManager, blockMaps);
  }

  this.pruneDeadSprites();
};


SpriteManager.prototype.makeSprite = function(type, x, y) {
  var newSprite = new constructors[type](this.map, this, x, y);

  // Listen for crashes
  for (var i = 0, l = Messages.CRASHES.length; i < l; i++)
    newSprite.addEventListener(Messages.CRASHES[i], MiscUtils.reflectEvent.bind(this, Messages.CRASHES[i]));

  if (type == SpriteConstants.SPRITE_HELICOPTER)
    newSprite.addEventListener(Messages.HEAVY_TRAFFIC, MiscUtils.reflectEvent.bind(this, Messages.HEAVY_TRAFFIC));

  this.spriteList.push(newSprite);
  return newSprite;
};


SpriteManager.prototype.makeTornado = function() {
  var sprite = this.getSprite(SpriteConstants.SPRITE_TORNADO);
  if (sprite !== null) {
    sprite.count = 200;
    this._emitEvent(Messages.TORNADO_SIGHTED, {trackable: true, x: sprite.worldX, y: sprite.worldY, sprite: sprite});
    return;
  }

  var x = Random.getRandom(SpriteUtils.worldToPix(this.map.width) - 800) + 400;
  var y = Random.getRandom(SpriteUtils.worldToPix(this.map.height) - 200) + 100;

  sprite = this.makeSprite(SpriteConstants.SPRITE_TORNADO, x, y);
  this._emitEvent(Messages.TORNADO_SIGHTED, {trackable: true, x: sprite.worldX, y: sprite.worldY, sprite: sprite});
};


SpriteManager.prototype.makeExplosion = function(x, y) {
  if (this.map.testBounds(x, y))
    this.makeExplosionAt(SpriteUtils.worldToPix(x), SpriteUtils.worldToPix(y));
};


SpriteManager.prototype.makeExplosionAt = function(x, y) {
  this.makeSprite(SpriteConstants.SPRITE_EXPLOSION, x, y);
};


SpriteManager.prototype.generatePlane = function(x, y) {
  if (this.getSprite(SpriteConstants.SPRITE_AIRPLANE) !== null)
    return;

  this.makeSprite(SpriteConstants.SPRITE_AIRPLANE,
                  SpriteUtils.worldToPix(x),
                  SpriteUtils.worldToPix(y));
};


SpriteManager.prototype.generateTrain = function(census, x, y) {
  if (census.totalPop > 10 &&
      this.getSprite(SpriteConstants.SPRITE_TRAIN) === null &&
      Random.getRandom(25) === 0)
    this.makeSprite(SpriteConstants.SPRITE_TRAIN,
                    SpriteUtils.worldToPix(x) + 8,
                    SpriteUtils.worldToPix(y) + 8);
};


SpriteManager.prototype.generateShip = function() {
  // XXX This code is borked. The map generator will never
  // place a channel tile on the edges of the map
  var x,y;

  if (Random.getChance(3)) {
    for (x = 4; x < this.map.width - 2; x++) {
      if (this.map.getTileValue(x, 0) === CHANNEL)  {
        this.makeShipHere(x, 0);
        return;
      }
    }
  }

  if (Random.getChance(3)) {
    for (y = 1; y < this.map.height - 2; y++) {
      if (this.map.getTileValue(0, y) === CHANNEL)  {
        this.makeShipHere(0, y);
        return;
      }
    }
  }

  if (Random.getChance(3)) {
    for (x = 4; x < this.map.width - 2; x++) {
      if (this.map.getTileValue(x, this.map.height - 1) === CHANNEL)  {
        this.makeShipHere(x, this.map.height - 1);
        return;
      }
    }
  }

  if (Random.getChance(3)) {
    for (y = 1; y < this.map.height - 2; y++) {
      if (this.map.getTileValue(this.map.width - 1, y) === CHANNEL)  {
        this.makeShipHere(this.map.width - 1, y);
        return;
      }
    }
  }
};


SpriteManager.prototype.getBoatDistance = function(x, y) {
  var dist = 99999;
  var pixelX = SpriteUtils.worldToPix(x) + 8;
  var pixelY = SpriteUtils.worldToPix(y) + 8;

  for (var i = 0, l = this.spriteList.length; i < l; i++) {
    var sprite = this.spriteList[i];
    if (sprite.type === SpriteConstants.SPRITE_SHIP && sprite.frame !== 0) {
      var sprDist = Math.abs(sprite.x - pixelX) + Math.abs(sprite.y - pixelY);

      dist = Math.min(dist, sprDist);
    }
  }

  return dist;
};


SpriteManager.prototype.makeShipHere = function(x, y) {
  this.makeSprite(SpriteConstants.SPRITE_SHIP,
                  SpriteUtils.worldToPix(x),
                  SpriteUtils.worldToPix(y));
};


SpriteManager.prototype.generateCopter = function(x, y) {
  if (this.getSprite(SpriteConstants.SPRITE_HELICOPTER) !== null)
    return;

  this.makeSprite(SpriteConstants.SPRITE_HELICOPTER,
                  SpriteUtils.worldToPix(x),
                  SpriteUtils.worldToPix(y));
};


SpriteManager.prototype.makeMonsterAt = function(x, y) {
  var sprite = this.makeSprite(SpriteConstants.SPRITE_MONSTER,
                  SpriteUtils.worldToPix(x),
                  SpriteUtils.worldToPix(y));
  this._emitEvent(Messages.MONSTER_SIGHTED, {trackable: true, x: x, y: y, sprite: sprite});
};


SpriteManager.prototype.makeMonster = function() {
  var sprite = this.getSprite(SpriteConstants.SPRITE_MONSTER);
  if (sprite !== null) {
    sprite.soundCount = 1;
    sprite.count = 1000;
    sprite.destX = SpriteUtils.worldToPix(this.map.pollutionMaxX);
    sprite.destY = SpriteUtils.worldToPix(this.map.pollutionMaxY);
  }

  var done = 0;
  for (var i = 0; i < 300; i++)  {
    var x = Random.getRandom(this.map.width - 20) + 10;
    var y = Random.getRandom(this.map.height - 10) + 5;

    var tile = this.map.getTile(x, y);
    if (tile.getValue() === RIVER) {
      this.makeMonsterAt(x, y);
      done = 1;
      break;
    }
  }

  if (done === 0)
    this.makeMonsterAt(60, 50);
};


SpriteManager.prototype.pruneDeadSprites = function(type) {
  this.spriteList = this.spriteList.filter(function (s) {
    return s.frame !== 0;
  });
};


var constructors = {};
constructors[SpriteConstants.SPRITE_TRAIN] = TrainSprite;
constructors[SpriteConstants.SPRITE_SHIP] = BoatSprite;
constructors[SpriteConstants.SPRITE_MONSTER] = MonsterSprite;
constructors[SpriteConstants.SPRITE_HELICOPTER] = CopterSprite;
constructors[SpriteConstants.SPRITE_AIRPLANE] = AirplaneSprite;
constructors[SpriteConstants.SPRITE_TORNADO] = TornadoSprite;
constructors[SpriteConstants.SPRITE_EXPLOSION] = ExplosionSprite;


export { SpriteManager };
