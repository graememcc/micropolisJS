/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { MiscUtils } from './miscUtils';

/*
 *
 * BlockMaps are data maps where each entry corresponds to data representing a block of tiles in the original
 * game map.
 *
 */


// Construct a block map. Takes three integers: the game map's width and height, and the block size (i.e. how many
// tiles in each direction should map to the same block). The BlockMap entries will be initialised to zero.
function BlockMap(gameMapWidth, gameMapHeight, blockSize) {
  if (gameMapWidth === undefined || gameMapHeight === undefined || blockSize === undefined)
    throw new Error('Invalid dimensions for block map');

  Object.defineProperties(this,
    {gameMapWidth: MiscUtils.makeConstantDescriptor(gameMapWidth),
     gameMapHeight: MiscUtils.makeConstantDescriptor(gameMapHeight),
     width: MiscUtils.makeConstantDescriptor(Math.floor((gameMapWidth  + blockSize - 1) / blockSize)),
     height: MiscUtils.makeConstantDescriptor(Math.floor((gameMapHeight + blockSize - 1)/ blockSize)),
     blockSize: MiscUtils.makeConstantDescriptor(blockSize)});

  this.data = [];
  this.clear();
}


BlockMap.prototype.clear = function() {
  var data = this.data;
  for (var y = 0, height = this.height; y < height; y++) {
    for (var x = 0, width = this.width; x < width; x++)
      data[width * y + x] = 0;
  }
};


BlockMap.prototype.copyFrom = function(sourceMap, sourceFn) {
  if (sourceMap.width !== this.width || sourceMap.height !== this.height || sourceMap.blockSize !== this.blockSize)
    console.warn('Copying from incompatible blockMap!');

  for (var y = 0, height = sourceMap.height; y < height; y++) {
    for (var x = 0, width = sourceMap.width; x < width; x++)
      this.data[width * y + x] = sourceFn(sourceMap.data[width * y + x]);
  }
};


BlockMap.prototype.get = function(x, y) {
  return this.data[this.width * y + x];
};


BlockMap.prototype.set = function(x, y, value) {
  this.data[this.width * y + x] = value;
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


export { BlockMap };
