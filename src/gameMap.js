/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Direction } from './direction';
import { MiscUtils } from './miscUtils';
import { PositionMaker } from './positionMaker';
import { Tile } from './tile';
import { BNCNBIT, ZONEBIT } from "./tileFlags";
import { TILE_INVALID } from "./tileValues";

function GameMap(width, height, defaultValue) {
  if (!(this instanceof GameMap))
    return new GameMap(width, height, defaultValue);

  if (arguments.length > 1 && typeof(width) === 'number' &&
      (width < 1 || height < 1))
    throw new Error('GameMap constructor called with invalid width or height ' + width + ' ' + height);

  // Argument shuffling
  if (arguments.length === 0) {
    width = 120;
    height = 100;
    defaultValue = new Tile().getValue();
  } else if (arguments.length === 1) {
    if (typeof(width) === 'number') {
      // Default value
      defaultValue = width;
    } else {
      // Tile
      defaultValue = width.getValue();
    }
    width = 120;
    height = 100;
  } else if (arguments.length === 2) {
    defaultValue = new Tile().getValue();
  } else if (arguments.length === 3) {
    if (typeof(defaultValue) === 'object')
      defaultValue = defaultValue.getValue();
  }


  this.Position = PositionMaker(width, height);
  this.width = width;
  this.height = height;

  var data = [];
  for (var i = 0, l = width * height; i < l; i++)
    data[i] = new Tile(defaultValue);
  this._data = data;

  // Generally set externally
  this.cityCentreX = Math.floor(this.width / 2);
  this.cityCentreY = Math.floor(this.height / 2);
  this.pollutionMaxX = this.cityCentreX;
  this.pollutionMaxY = this.cityCentreY;
}


var saveProps = ['cityCentreX', 'cityCentreY', 'pollutionMaxX', 'pollutionMaxY', 'width', 'height'];

GameMap.prototype.save = function(saveData) {
  for (var i = 0, l = saveProps.length; i < l; i++)
    saveData[saveProps[i]] = this[saveProps[i]];

  saveData.map = this._data.map(function(t) {
    return {value: t.getRawValue()};
  });
};


GameMap.prototype.load = function(saveData) {
  for (var i = 0, l = saveProps.length; i < l; i++)
    this[saveProps[i]] = saveData[saveProps[i]];

  var map = saveData.map;
  for (i = 0, l = map.length; i < l; i++)
    this.setTileValue(i % this.width, Math.floor(i / this.width), map[i].value);
};


GameMap.prototype._calculateIndex = function(x, y) {
  return x + y * this.width;
};


GameMap.prototype.testBounds = function(x, y) {
  return x >= 0 && y >= 0 && x < this.width && y < this.height;
};


GameMap.prototype.getTile = function(x, y, newTile) {
  // Argument-shuffling
  if (typeof(x) === 'object') {
    y = x.y;
    x = x.x;
  }

  var width = this.width;
  var height = this.height;

  if (x < 0 || y < 0 || x >= width || y >= height) {
    console.warn('getTile called with bad bounds', x, y);
    return new Tile(TILE_INVALID);
  }

  var tileIndex = x + y * width;
  var tile = this._data[tileIndex];

  // Return the original tile if we're not given a tile to fill
  if (!newTile)
    return tile;

  newTile.set(tile);
  return tile;
};


GameMap.prototype.getTileValue = function(x, y) {
  if (arguments.length < 1)
    throw new Error('GameMap getTileValue called with too few arguments' + [].toString.apply(arguments));

  // Argument-shuffling
  if (typeof(x) === 'object') {
    y = x.y;
    x = x.x;
  }

  if (!this.testBounds(x, y))
    throw new Error('GameMap getTileValue called with invalid bounds ' + x + ', ' + y);

  var tileIndex = this._calculateIndex(x, y);
  return this._data[tileIndex].getValue();
};


GameMap.prototype.getTileFlags = function(x, y) {
  if (arguments.length < 1)
    throw new Error('GameMap getTileFlags called with too few arguments' + [].toString.apply(arguments));

  // Argument-shuffling
  if (typeof(x) === 'object') {
    y = x.y;
    x = x.x;
  }

  if (!this.testBounds(x, y))
    throw new Error('GameMap getTileFlags called with invalid bounds ' + x + ', ' + y);

  var tileIndex = this._calculateIndex(x, y);
  return this._data[tileIndex].getFlags();
};


GameMap.prototype.getTiles = function(x, y, w, h) {
  if (arguments.length < 3)
    throw new Error('GameMap getTiles called with too few arguments' + [].toString.apply(arguments));

  // Argument-shuffling
  if (arguments.length === 3) {
    h = w;
    w = y;
    y = x.y;
    x = x.x;
  }

  if (!this.testBounds(x, y))
    throw new Error('GameMap getTiles called with invalid bounds ' + x + ', ' + y);

  var res = [];
  for (var a = y, ylim = y + h; a < ylim; a++) {
    res[a - y] = [];
    for (var b = x, xlim = x + w; b < xlim; b++) {
      var tileIndex = this._calculateIndex(b, a);
      res[a-y].push(this._data[tileIndex]);
    }
  }
  return res;
};


GameMap.prototype.getTileValuesForPainting = function(x, y, w, h, result) {
  result = result || [];

  if (arguments.length < 3)
    throw new Error('GameMap getTileValuesForPainting called with too few arguments' + [].toString.apply(arguments));

  // Argument-shuffling
  if (arguments.length === 3) {
    h = w;
    w = y;
    y = x.y;
    x = x.x;
  }

  var width = this.width;
  var height = this.height;

  // Result is stored in row-major order
  for (var a = y, ylim = y + h; a < ylim; a++) {
    for (var b = x, xlim = x + w; b < xlim; b++) {
      if (a < 0 || b < 0 || a >= height || b >= width) {
        result[(a - y) * w + (b - x)] = TILE_INVALID;
        continue;
      }

      var tileIndex =  b + a * width;
      result[(a - y) * w + (b - x)] = this._data[tileIndex].getRawValue();
    }
  }

  return result;
};


GameMap.prototype.getTileFromMapOrDefault = function(pos, dir, defaultTile) {
  switch (dir) {
    case Direction.NORTH:
      if (pos.y > 0)
        return this.getTileValue(pos.x, pos.y - 1);
      return defaultTile;

    case Direction.EAST:
      if (pos.x < this.width - 1)
        return this.getTileValue(pos.x + 1, pos.y);

      return defaultTile;

    case Direction.SOUTH:
      if (pos.y < this.height - 1)
        return this.getTileValue(pos.x, pos.y + 1);

      return defaultTile;

    case Direction.WEST:
      if (pos.x > 0)
        return this.getTileValue(pos.x - 1, pos.y);

      return defaultTile;

    default:
        return defaultTile;
  }
};


GameMap.prototype.setTile = function(x, y, value, flags) {
  if (arguments.length < 3)
    throw new Error('GameMap setTile called with too few arguments' + [].toString.apply(arguments));

  // Argument-shuffling
  if (arguments.length === 3) {
    flags = value;
    value = y;
    y = x.y;
    x = x.x;
  }

  if (!this.testBounds(x, y))
    throw new Error('GameMap setTile called with invalid bounds ' + x + ', ' + y);

  var tileIndex = this._calculateIndex(x, y);
  this._data[tileIndex].set(value, flags);
};


GameMap.prototype.setTo = function(x, y, tile) {
  if (arguments.length < 2)
    throw new Error('GameMap setTo called with too few arguments' + [].toString.apply(arguments));

  // Argument-shuffling
  if (tile === undefined) {
    tile = y;
    y = x.y;
    x = x.x;
  }

  if (!this.testBounds(x, y))
    throw new Error('GameMap setTo called with invalid bounds ' + x + ', ' + y);

  var tileIndex = this._calculateIndex(x, y);
  this._data[tileIndex] = tile;
};


GameMap.prototype.setTileValue = function(x, y, value) {
  if (arguments.length < 2)
    throw new Error('GameMap setTileValue called with too few arguments' + [].toString.apply(arguments));

  // Argument-shuffling
  if (arguments.length === 2) {
    value = y;
    y = x.y;
    x = x.x;
  }

  if (!this.testBounds(x, y))
    throw new Error('GameMap setTileValue called with invalid bounds ' + x + ', ' + y);

  var tileIndex = this._calculateIndex(x, y);
  this._data[tileIndex].setValue(value);
};


GameMap.prototype.setTileFlags = function(x, y, flags) {
  if (arguments.length < 2)
    throw new Error('GameMap setTileFlags called with too few arguments' + [].toString.apply(arguments));

  // Argument-shuffling
  if (arguments.length === 2) {
    flags = y;
    y = x.y;
    x = x.x;
  }

  if (!this.testBounds(x, y))
    throw new Error('GameMap setTileFlags called with invalid bounds ' + x + ', ' + y);

  var tileIndex = this._calculateIndex(x, y);
  this._data[tileIndex].setFlags(flags);
};


GameMap.prototype.addTileFlags = function(x, y, flags) {
  if (arguments.length < 2)
    throw new Error('GameMap addTileFlags called with too few arguments' + [].toString.apply(arguments));

  // Argument-shuffling
  if (arguments.length === 2) {
    flags = y;
    y = x.y;
    x = x.x;
  }

  if (!this.testBounds(x, y))
    throw new Error('GameMap addTileFlags called with invalid bounds ' + x + ', ' + y);

  var tileIndex = this._calculateIndex(x, y);
  this._data[tileIndex].addFlags(flags);
};


GameMap.prototype.removeTileFlags = function(x, y, flags) {
  if (arguments.length < 2)
    throw new Error('GameMap removeTileFlags called with too few arguments' + [].toString.apply(arguments));

  // Argument-shuffling
  if (arguments.length === 2) {
    flags = y;
    y = x.y;
    x = x.x;
  }

  if (!this.testBounds(x, y))
    throw new Error('GameMap removeTileFlags called with invalid bounds ' + x + ', ' + y);

  var tileIndex = this._calculateIndex(x, y);
  this._data[tileIndex].removeFlags(flags);
};


GameMap.prototype.putZone = function(centreX, centreY, centreTile, size) {
  var x, y;

  if (!this.testBounds(centreX, centreY) || !this.testBounds(centreX - 1 + size - 1, centreY - 1 + size - 1))
    throw new Error('GameMap putZone called with invalid bounds ' + x + ', ' + y);

  var tile = centreTile - 1 - size;
  var startX = centreX - 1;
  var startY = centreY - 1;

  for (y = startY; y < startY + size; y++) {
    for (x = startX; x < startX + size; x++) {
      if (x === centreX && y === centreY)
        this.setTo(x, y, new Tile(tile, BNCNBIT | ZONEBIT));
      else
        this.setTo(x, y, new Tile(tile, BNCNBIT));
      tile += 1;
    }
  }
};


export { GameMap };
