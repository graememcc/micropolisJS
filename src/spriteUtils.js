/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Tile } from './tile';
import * as TileValues from "./tileValues";
import { ZoneUtils } from './zoneUtils';

var pixToWorld = function(p) {
  return p >> 4;
};


var worldToPix = function(w) {
  return w << 4;
};


// Attempt to move 45° towards the desired direction, either
// clockwise or anticlockwise, whichever gets us there quicker
var turnTo = function(presentDir, desiredDir) {
  if (presentDir === desiredDir)
      return presentDir;

  if (presentDir < desiredDir) {
    // select clockwise or anticlockwise
    if (desiredDir - presentDir < 4)
      presentDir++;
    else
      presentDir--;
  } else {
    if (presentDir - desiredDir < 4)
      presentDir--;
    else
      presentDir++;
  }

  if (presentDir > 8)
    presentDir = 1;

  if (presentDir < 1)
    presentDir = 8;

  return presentDir;
};


var getTileValue = function(map, x, y) {
  var wX = pixToWorld(x);
  var wY = pixToWorld(y);

  if (wX < 0 || wX >= map.width || wY < 0 || wY >= map.height)
    return -1;

  return map.getTileValue(wX, wY);
};


// Choose the best direction to get from the origin to the destination
// If the destination is equidistant in both x and y deltas, a diagonal
// will be chosen, otherwise the most 'dominant' difference will be selected
// (so if a destination is 4 units north and 2 units east, north will be chosen).
// This code seems to always choose south if we're already there which seems like
// a bug
var directionTable = [0, 3, 2, 1, 3, 4, 5, 7, 6, 5, 7, 8, 1];

var getDir = function(orgX, orgY, destX, destY) {
  var deltaX = destX - orgX;
  var deltaY = destY - orgY;
  var i;

  if (deltaX < 0) {
    if (deltaY < 0) {
      i = 11;
    } else {
      i = 8;
    }
  } else {
    if (deltaY < 0) {
      i = 2;
    } else {
      i = 5;
    }
  }

  deltaX = Math.abs(deltaX);
  deltaY = Math.abs(deltaY);

  if (deltaX * 2 < deltaY)
    i++;
  else if (deltaY * 2 < deltaX)
    i--;

  if (i < 0 || i > 12)
    i = 0;

  return directionTable[i];
};


var absoluteDistance = function(orgX, orgY, destX, destY) {
  var deltaX = destX - orgX;
  var deltaY = destY - orgY;
  return Math.abs(deltaX) + Math.abs(deltaY);
};


var checkWet = function(tileValue) {
  if (tileValue === TileValues.HPOWER || tileValue === TileValues.VPOWER ||
      tileValue === TileValues.HRAIL || tileValue === TileValues.VRAIL ||
      tileValue === TileValues.BRWH || tileValue === TileValues.BRWV)
    return true;
  else
    return false;
};


var destroyMapTile = function(spriteManager, map, blockMaps, ox, oy) {
  var x = pixToWorld(ox);
  var y = pixToWorld(oy);

  if (!map.testBounds(x, y))
    return;

  var tile = map.getTile(x, y);
  var tileValue = tile.getValue();

  if (tileValue < TileValues.TREEBASE)
    return;

  if (!tile.isCombustible()) {
    if (tileValue >= TileValues.ROADBASE && tileValue <= TileValues.LASTROAD)
      map.setTile(x, y, TileValues.RIVER, 0);

    return;
  }

  if (tile.isZone()) {
    ZoneUtils.fireZone(map, x, y, blockMaps);

    if (tileValue > TileValues.RZB)
      spriteManager.makeExplosionAt(ox, oy);
  }

  if (checkWet(tileValue))
    map.setTile(x, y, TileValues.RIVER, 0);
  else
    map.setTile(x, y, TileValues.TINYEXP, Tile.BULLBIT | Tile.ANIMBIT);
};


var getDistance = function(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};


var checkSpriteCollision = function(s1, s2) {
  return s1.frame !== 0 && s2.frame !== 0 &&
         getDistance(s1.x, s1.y, s2.x, s2.y) < 30;
};


var SpriteUtils = {
  absoluteDistance: absoluteDistance,
  checkSpriteCollision: checkSpriteCollision,
  destroyMapTile: destroyMapTile,
  getDir: getDir,
  getTileValue: getTileValue,
  turnTo: turnTo,
  pixToWorld: pixToWorld,
  worldToPix: worldToPix
};


export { SpriteUtils };
