/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['MiscUtils'],
       function(MiscUtils) {
  "use strict";


  function BlockMap(mapWidth, mapHeight, blockSize, defaultValue) {
    var sourceMap;
    var sourceFunction;
    var id = function(x) {return x;};

    var e = new Error('Invalid parameters');
    if (arguments.length < 3) {
      if (!(mapWidth instanceof BlockMap) ||
          (arguments.length === 2 && typeof(mapHeight) !== 'function'))
        throw e;
      sourceMap = mapWidth;
      sourceFunction = mapHeight === undefined ? id : mapHeight;
    }

    if (sourceMap !== undefined) {
      mapWidth = sourceMap.width;
      mapHeight = sourceMap.height;
      blockSize = sourceMap.blockSize;
      defaultValue = sourceMap.defaultValue;
    }

    Object.defineProperties(this,
      {mapWidth: MiscUtils.makeConstantDescriptor(mapWidth),
       mapHeight: MiscUtils.makeConstantDescriptor(mapHeight),
       width: MiscUtils.makeConstantDescriptor(Math.floor((mapWidth  + 1) / blockSize)),
       height: MiscUtils.makeConstantDescriptor(Math.floor((mapHeight + 1)/ blockSize)),
       blockSize: MiscUtils.makeConstantDescriptor(blockSize),
       defaultValue: MiscUtils.makeConstantDescriptor(defaultValue)});

    this.data = [];

    if (sourceMap)
      copyFrom.call(this, sourceMap, sourceFunction);
    else
      this.clear();
  }


  var copyFrom = function(sourceMap, sourceFn) {
    var mapFn = function(elem) {
      return sourceFn(elem);
    };

    for (var y = 0, l = sourceMap.data.length; y < l; y++)
      this.data[y] = sourceMap.data[y].map(mapFn);
  };


  var makeArrayOf = function(length, value) {
    var result = [];
    for (var a = 0; a < length; a++)
      result[a] = value;
    return result;
  };


  BlockMap.prototype.clear = function() {
    var maxY = Math.floor(this.mapHeight / this.blockSize) + 1;
    var maxX = Math.floor(this.mapWidth / this.blockSize) + 1;
    for (var y = 0; y < maxY; y++)
      this.data[y] = makeArrayOf(maxX, this.defaultValue);
  };


  BlockMap.prototype.get = function(x, y) {
    return this.data[y][x];
  };


  BlockMap.prototype.set = function(x, y, value) {
    this.data[y][x] = value;
  };


  BlockMap.prototype.toBlock = function(num) {
    return Math.floor(num / this.blockSize);
  };


  BlockMap.prototype.worldGet = function(x, y) {
    return this.get(this.toBlock(x), this.toBlock(y));
  };


  BlockMap.prototype.worldSet = function(x, y, value) {
    this.set(this.toBlock(x), this.toBlock(y), value);
  };


  return BlockMap;
});
