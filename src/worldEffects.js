/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

 import { Tile } from "./tile.ts";

function WorldEffects(map) {
  this._map = map;
  this._data = {};
}


var toKey = function(x, y) {
  return [x, y].join(',');
};


var fromKey = function(k) {
  k = k.split(',');
  return {x: k[0] - 0, y: k[1] - 0, toString: function() {return 'World effect coord: (' + k[0] + ', ' + k[1] + ')';}};
};


WorldEffects.prototype.clear = function() {
  this._data = [];
};


WorldEffects.prototype.getTile = function(x, y) {
  var key = toKey(x, y);
  var tile = this._data[key];
  if (tile === undefined)
    tile = this._map.getTile(x, y);
  return tile;
};


WorldEffects.prototype.getTileValue = function(x, y) {
  return this.getTile(x, y).getValue();
};


WorldEffects.prototype.setTile = function(x, y, value, flags) {
  if (flags !== undefined && value instanceof Tile)
    throw new Error('Flags supplied with already defined tile');

  if (!this._map.testBounds(x, y))
    throw new Error('WorldEffects setTile called with invalid bounds ' + x + ', ' + y);

  if (flags === undefined && !(value instanceof Tile))
    value = new Tile(value);
  else if (flags !== undefined)
    value = new Tile(value, flags);

  var key = toKey(x, y);
  this._data[key] = value;
};


WorldEffects.prototype.apply = function() {
  var keys = Object.keys(this._data);
  for (var i = 0, l = keys.length; i < l; i++) {
    var coords = fromKey(keys[i]);
    this._map.setTo(coords, this._data[keys[i]]);
  }
};


export { WorldEffects };
