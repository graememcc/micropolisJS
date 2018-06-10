/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

 import * as TileFlags from "./tileFlags";
 import { DIRT, TILE_INVALID, TILE_COUNT } from "./tileValues";

// I think I want to change this soon. Most of the tile properties, (e.g. whether
// it is a zone, population, conductiveness, pollution emitted) are completely defined
// by the tile value. I think we want a set of prototype objects that are essentially
// immutable, and a TileCreator() function that returns an object with the correct proto
// tile, where mutable state such as animation can live.
//
// This would allow us to cull the getTile/getValue pattern repeated ad nauseum all over the
// code. One could also have the map then track zones, so that populationDensityScan no longer
// needs to perform another full map scan.

function Tile(tileValue, bitMask) {
  if (!(this instanceof Tile))
    return new Tile();

  if (arguments.length > 0 && typeof(tileValue) !== 'number')
    throw new Error('Tile constructor called with invalid tileValue ' + tileValue);

  if (arguments.length > 1 && typeof(bitMask) !== 'number')
    throw new Error('Tile constructor called with invalid bitMask ' + bitMask);

  if (arguments.length > 1 && (tileValue < TILE_INVALID || tileValue >= TILE_COUNT))
    throw new Error('Tile constructor called with out-of-range tileValue ' + tileValue);

  if (arguments.length > 1 && (bitMask < TileFlags.BIT_START || bitMask >= (TileFlags.BIT_END << 1)))
    throw new Error('Tile constructor called with out-of-range bitmask ' + bitMask);

  this._value = tileValue;

  // If no value supplied, default to TileValues.DIRT
  if (this._value === undefined)
    this._value = DIRT;

  if (arguments.length > 1)
    this._value |= bitMask;
}


Tile.prototype.getValue = function() {
  return this._value & TileFlags.BIT_MASK;
};


Tile.prototype.setValue = function(tileValue) {
  if (arguments.length === 0)
    throw new Error('Tile setValue called without arguments');

  if (typeof(tileValue) !== 'number' || tileValue < 0)
    throw new Error('Tile setValue called with invalid tileValue ' + tileValue);

  var existingFlags = 0;
  if (tileValue < TileFlags.BIT_START)
    existingFlags = this._value & TileFlags.ALLBITS;
  this._value = tileValue | existingFlags;
};


Tile.prototype.isBulldozable = function() {
  return (this._value & TileFlags.BULLBIT) > 0;
};


Tile.prototype.isAnimated = function() {
  return (this._value & TileFlags.ANIMBIT) > 0;
};


Tile.prototype.isConductive = function() {
  return (this._value & TileFlags.CONDBIT) > 0;
};


Tile.prototype.isCombustible = function() {
  return (this._value & TileFlags.BURNBIT) > 0;
};


Tile.prototype.isPowered = function() {
  return (this._value & TileFlags.POWERBIT) > 0;
};


Tile.prototype.isZone = function() {
  return (this._value & TileFlags.ZONEBIT) > 0;
};


Tile.prototype.addFlags = function(bitMask) {
  if (arguments.length === 0)
    throw new Error('Tile addFlags called with no arguments');

  if (typeof(bitMask) !== 'number')
    throw new Error('Tile constructor called with invalid bitmask ' + bitMask);

  if (bitMask < TileFlags.BIT_START || bitMask >= (TileFlags.BIT_END << 1))
    throw new Error('Tile addFlags called with out-of-range bitmask ' + bitMask);

  this._value |= bitMask;
};


Tile.prototype.removeFlags = function(bitMask) {
  if (arguments.length === 0)
    throw new Error('Tile removeFlags called with no arguments');

  if (typeof(bitMask) !== 'number')
    throw new Error('Tile removeFlags called with invalid bitmask ' + bitMask);

  if (bitMask < TileFlags.BIT_START || bitMask >= (TileFlags.BIT_END << 1))
    throw new Error('Tile removeFlags called with out-of-range bitmask ' + bitMask);

  this._value &= ~bitMask;
};


Tile.prototype.setFlags = function(bitMask) {
  if (arguments.length === 0)
    throw new Error('Tile setFlags called with no arguments');

  if (typeof(bitMask) !== 'number')
    throw new Error('Tile setFlags called with invalid bitmask ' + bitMask);

  if (bitMask < TileFlags.BIT_START || bitMask >= (TileFlags.BIT_END << 1))
    throw new Error('Tile setFlags called with out-of-range bitmask ' + bitMask);

  var existingValue = this._value & ~TileFlags.ALLBITS;
  this._value = existingValue | bitMask;
};


Tile.prototype.getFlags = function() {
  return this._value & TileFlags.ALLBITS;
};


Tile.prototype.getRawValue = function() {
  return this._value;
};


Tile.prototype.set = function(tileValue, bitMask) {
  if (tileValue instanceof Tile)
    this._value = tileValue._value;
  else
    this._value = tileValue | bitMask;
};


Tile.prototype.toString = function() {
  var value = this.getValue();
  var s = 'Tile# ' + value;
  s += this.isCombustible() ? ' burning' : '';
  s += this.isPowered() ? ' powered' : '';
  s += this.isAnimated() ? ' animated' : '';
  s += this.isConductive() ? ' conductive' : '';
  s += this.isZone() ? ' zone' : '';
  s += this.isBulldozable() ? ' bulldozeable' : '';
  return s;
};


export { Tile };
