/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

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

  if (arguments.length > 1 && (bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1)))
    throw new Error('Tile constructor called with out-of-range bitmask ' + bitMask);

  this._value = tileValue;

  // If no value supplied, default to TileValues.DIRT
  if (this._value === undefined)
    this._value = DIRT;

  if (arguments.length > 1)
    this._value |= bitMask;
}


Tile.prototype.getValue = function() {
  return this._value & Tile.BIT_MASK;
};


Tile.prototype.setValue = function(tileValue) {
  if (arguments.length === 0)
    throw new Error('Tile setValue called without arguments');

  if (typeof(tileValue) !== 'number' || tileValue < 0)
    throw new Error('Tile setValue called with invalid tileValue ' + tileValue);

  var existingFlags = 0;
  if (tileValue < Tile.BIT_START)
    existingFlags = this._value & Tile.ALLBITS;
  this._value = tileValue | existingFlags;
};


Tile.prototype.isBulldozable = function() {
  return (this._value & Tile.BULLBIT) > 0;
};


Tile.prototype.isAnimated = function() {
  return (this._value & Tile.ANIMBIT) > 0;
};


Tile.prototype.isConductive = function() {
  return (this._value & Tile.CONDBIT) > 0;
};


Tile.prototype.isCombustible = function() {
  return (this._value & Tile.BURNBIT) > 0;
};


Tile.prototype.isPowered = function() {
  return (this._value & Tile.POWERBIT) > 0;
};


Tile.prototype.isZone = function() {
  return (this._value & Tile.ZONEBIT) > 0;
};


Tile.prototype.addFlags = function(bitMask) {
  if (arguments.length === 0)
    throw new Error('Tile addFlags called with no arguments');

  if (typeof(bitMask) !== 'number')
    throw new Error('Tile constructor called with invalid bitmask ' + bitMask);

  if (bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1))
    throw new Error('Tile addFlags called with out-of-range bitmask ' + bitMask);

  this._value |= bitMask;
};


Tile.prototype.removeFlags = function(bitMask) {
  if (arguments.length === 0)
    throw new Error('Tile removeFlags called with no arguments');

  if (typeof(bitMask) !== 'number')
    throw new Error('Tile removeFlags called with invalid bitmask ' + bitMask);

  if (bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1))
    throw new Error('Tile removeFlags called with out-of-range bitmask ' + bitMask);

  this._value &= ~bitMask;
};


Tile.prototype.setFlags = function(bitMask) {
  if (arguments.length === 0)
    throw new Error('Tile setFlags called with no arguments');

  if (typeof(bitMask) !== 'number')
    throw new Error('Tile setFlags called with invalid bitmask ' + bitMask);

  if (bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1))
    throw new Error('Tile setFlags called with out-of-range bitmask ' + bitMask);

  var existingValue = this._value & ~Tile.ALLBITS;
  this._value = existingValue | bitMask;
};


Tile.prototype.getFlags = function() {
  return this._value & Tile.ALLBITS;
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


// Bit-masks for statusBits
Tile.POWERBIT  = 0x8000; // bit 15, tile has power.
Tile.CONDBIT = 0x4000; // bit 14. tile can conduct electricity.
Tile.BURNBIT = 0x2000; // bit 13, tile can be lit.
Tile.BULLBIT = 0x1000; // bit 12, tile is bulldozable.
Tile.ANIMBIT = 0x0800; // bit 11, tile is animated.
Tile.ZONEBIT = 0x0400; // bit 10, tile is the center tile of the zone.
Tile.BLBNBIT   = Tile.BULLBIT | Tile.BURNBIT;
Tile.BLBNCNBIT = Tile.BULLBIT | Tile.BURNBIT | Tile.CONDBIT;
Tile.BNCNBIT   = Tile.BURNBIT | Tile.CONDBIT;
Tile.ASCBIT   = Tile.ANIMBIT | Tile.CONDBIT | Tile.BURNBIT;
Tile.ALLBITS = Tile.POWERBIT | Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT | Tile.ANIMBIT | Tile.ZONEBIT;
Tile.BIT_START = 0x400;
Tile.BIT_END = 0x8000;
Tile.BIT_MASK = Tile.BIT_START - 1;


export { Tile };
