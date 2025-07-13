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

import { ANIMBIT, BIT_MASK, POWERBIT, ZONEBIT } from './tileFlags.ts';
import { TileHistory } from './tileHistory.js';
import { LASTTINYEXP, LIGHTNINGBOLT, TILE_COUNT, TILE_INVALID } from "./tileValues.ts";
import { TileUtils } from './tileUtils.js';


function AnimationManager(map, animationPeriod, blinkPeriod) {
  animationPeriod = animationPeriod || 50;
  blinkPeriod = blinkPeriod || 500;

  this._map = map;
  this.animationPeriod = animationPeriod;
  this.lastAnimation = new Date(1970, 1, 1);
  this.lastBlink = new Date(1970, 1, 1);
  this.blinkPeriod = blinkPeriod;
  this.shouldBlink = false;

  // When painting we keep track of what frames
  // have been painted at which map coordinates so we can
  // consistently display the correct frame even as the
  // canvas moves
  this._lastPainted = null;
  this._currentPainted = null;

  this._data = [];
  this.initArray();
  this.registerAnimations();
}


AnimationManager.prototype.initArray = function() {
  // Map all tiles to their own value in case we ever
  // look up a tile that is not animated
  for (var i = 0; i < TILE_COUNT; i++)
    this._data[i] = i;
};


AnimationManager.prototype.inSequence = function(tileValue, lastValue) {
  // It is important that we use the base value as the starting point
  // rather than the last painted value: base values often don't recur
  // in their sequences
  var seen = [tileValue];
  var current = this._data[tileValue];

  while (seen.indexOf(current) === -1) {
    if (current === lastValue)
      return true;

    seen.push(current);
    current = this._data[current];
  }
  return false;
};


// Takes an array of tile values, and overwrites with the correct tile after factoring in animations and
// power blinks. offsetX and offsetY represent the offset into the map the tileArray represents; xBound and
// yBound note how far to iterate (the idea being that GameCanvas recycles its tile value array)
AnimationManager.prototype.getTiles = function(tileValues, offsetX, offsetY, xBound, yBound, isPaused) {
  isPaused = isPaused || false;

  var shouldChangeAnimation = false;
  var d = new Date();

  var shouldBlink = this.shouldBlink;
  if (d - this.lastBlink > this.blinkPeriod) {
    shouldBlink = this.shouldBlink = !this.shouldBlink;
    this.lastBlink = d;
  }

  if (!isPaused) {
    if (d - this.lastAnimation > this.animationPeriod) {
      shouldChangeAnimation = true;
      this.lastAnimation = d;
    }
  }


  var newPainted = this._currentPainted === null ? new TileHistory() : this._currentPainted;

  for (var y = 0; y < yBound; y++) {
    for (var x = 0; x < xBound; x++) {
      var mapX = x + offsetX;
      var mapY = y + offsetY;
      var index = y * xBound + x;

      if (mapX < 0 || mapX >= this._map.width || mapY < 0 || mapY >= this._map.height)
        continue;

      var tile = tileValues[index];
      if (tile === TILE_INVALID)
        continue;

      if (shouldBlink && (tile & ZONEBIT) && !(tile & POWERBIT)) {
        tileValues[index] = LIGHTNINGBOLT;
        continue;
      }

      if (!(tile & ANIMBIT)) {
        tileValues[index] = tile & BIT_MASK;
        continue;
      }

      var tileValue = tile & BIT_MASK;
      var newTile = TILE_INVALID;
      var last;
      if (this._lastPainted)
        last = this._lastPainted.getTile(x, y);

      if (shouldChangeAnimation) {
        // Have we painted any of this sequence before? If so, paint the next tile
        if (last && this.inSequence(tileValue, last)) {
          // To ensure demolition explosions are animated smoothly, we adjust the map here when we have run to the
          // end of the animation. We would otherwise have to wait on MapScan running and picking up the explosion
          // tile, which may not happen for several frames
          if (last === LASTTINYEXP) {
            this._map.setTo(mapX, mapY, TileUtils.randomRubble());
            newTile = this._map.getTileValue(mapX, mapY);
          } else {
            newTile = this._data[last];
          }
        } else {
          // Either we haven't painted anything here before, or the last tile painted
          // there belongs to a different tile's animation sequence
          newTile = this._data[tileValue];
        }
      } else {
        // Have we painted any of this sequence before? If so, paint the same tile
        if (last && this.inSequence(tileValue, last))
          newTile = last;
      }

      if (newTile === TILE_INVALID) {
        tileValues[index] = tileValue;
        continue;
      }

      tileValues[index] = newTile;
      newPainted.setTile(x, y, newTile);
    }
  }

  // Rotate tile histories
  var temp = this._lastPainted;
  this._lastPainted = newPainted;

  if (temp !== null)
    temp.clear();
  this._currentPainted = temp;
};


AnimationManager.prototype.registerSingleAnimation = function(arr) {
  for (var i = 1; i < arr.length; i++)
    this._data[arr[i - 1]] = arr[i];
};


AnimationManager.prototype.registerAnimations = function() {
  this.registerSingleAnimation([56, 57, 58, 59, 60, 61, 62, 63, 56]);
  this.registerSingleAnimation([80, 128, 112, 96, 80]);
  this.registerSingleAnimation([81, 129, 113, 97, 81]);
  this.registerSingleAnimation([82, 130, 114, 98, 82]);
  this.registerSingleAnimation([83, 131, 115, 99, 83]);
  this.registerSingleAnimation([84, 132, 116, 100, 84]);
  this.registerSingleAnimation([85, 133, 117, 101, 85]);
  this.registerSingleAnimation([86, 134, 118, 102, 86]);
  this.registerSingleAnimation([87, 135, 119, 103, 87]);
  this.registerSingleAnimation([88, 136, 120, 104, 88]);
  this.registerSingleAnimation([89, 137, 121, 105, 89]);
  this.registerSingleAnimation([90, 138, 122, 106, 90]);
  this.registerSingleAnimation([91, 139, 123, 107, 91]);
  this.registerSingleAnimation([92, 140, 124, 108, 92]);
  this.registerSingleAnimation([93, 141, 125, 109, 93]);
  this.registerSingleAnimation([94, 142, 126, 110, 94]);
  this.registerSingleAnimation([95, 143, 127, 111, 95]);
  this.registerSingleAnimation([144, 192, 176, 160, 144]);
  this.registerSingleAnimation([145, 193, 177, 161, 145]);
  this.registerSingleAnimation([146, 194, 178, 162, 146]);
  this.registerSingleAnimation([147, 195, 179, 163, 147]);
  this.registerSingleAnimation([148, 196, 180, 164, 148]);
  this.registerSingleAnimation([149, 197, 181, 165, 149]);
  this.registerSingleAnimation([150, 198, 182, 166, 150]);
  this.registerSingleAnimation([151, 199, 183, 167, 151]);
  this.registerSingleAnimation([152, 200, 184, 168, 152]);
  this.registerSingleAnimation([153, 201, 185, 169, 153]);
  this.registerSingleAnimation([154, 202, 186, 170, 154]);
  this.registerSingleAnimation([155, 203, 187, 171, 155]);
  this.registerSingleAnimation([156, 204, 188, 172, 156]);
  this.registerSingleAnimation([157, 205, 189, 173, 157]);
  this.registerSingleAnimation([158, 206, 190, 174, 158]);
  this.registerSingleAnimation([159, 207, 191, 175, 159]);
  this.registerSingleAnimation([621, 852, 853, 854, 855, 856, 857, 858, 859, 852]);
  this.registerSingleAnimation([641, 884, 885, 886, 887, 884]);
  this.registerSingleAnimation([644, 888, 889, 890, 891, 888]);
  this.registerSingleAnimation([649, 892, 893, 894, 895, 892]);
  this.registerSingleAnimation([650, 896, 897, 898, 899, 896]);
  this.registerSingleAnimation([676, 900, 901, 902, 903, 900]);
  this.registerSingleAnimation([677, 904, 905, 906, 907, 904]);
  this.registerSingleAnimation([686, 908, 909, 910, 911, 908]);
  this.registerSingleAnimation([689, 912, 913, 914, 915, 912]);
  this.registerSingleAnimation([747, 916, 917, 918, 919, 916]);
  this.registerSingleAnimation([748, 920, 921, 922, 923, 920]);
  this.registerSingleAnimation([751, 924, 925, 926, 927, 924]);
  this.registerSingleAnimation([752, 928, 929, 930, 931, 928]);
  this.registerSingleAnimation([820, 952, 953, 954, 955, 952]);
  this.registerSingleAnimation([832, 833, 834, 835, 836, 837, 838, 839, 832]);
  this.registerSingleAnimation([840, 841, 842, 843, 840]);
  this.registerSingleAnimation([844, 845, 846, 847, 848, 849, 850, 851, 844]);
  this.registerSingleAnimation([860, 861, 862, 863, 864, 865, 866, 867]);
  this.registerSingleAnimation([932, 933, 934, 935, 936, 937, 938, 939, 932]);
  this.registerSingleAnimation([940, 941, 942, 943, 944, 945, 946, 947, 940]);
};


export { AnimationManager };
