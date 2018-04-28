/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(function(require, exports, module) {


  var MiscUtils = require('./MiscUtils');

  // Split out to avoid circular dependency hell

  var SpriteConstants = {};
  Object.defineProperties(SpriteConstants,
     {SPRITE_TRAIN: MiscUtils.makeConstantDescriptor(1),
      SPRITE_SHIP: MiscUtils.makeConstantDescriptor(4),
      SPRITE_MONSTER: MiscUtils.makeConstantDescriptor(5),
      SPRITE_HELICOPTER: MiscUtils.makeConstantDescriptor(2),
      SPRITE_AIRPLANE: MiscUtils.makeConstantDescriptor(3),
      SPRITE_TORNADO: MiscUtils.makeConstantDescriptor(6),
      SPRITE_EXPLOSION: MiscUtils.makeConstantDescriptor(7)});


  return SpriteConstants;
});
