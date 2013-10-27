/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define([],
       function() {
  "use strict";

  var clamp = function(value, min, max) {
    if (value < min)
      return min;
    if (value > max)
      return max;

    return value;
  };


  var makeConstantDescriptor = function(value) {
    return {configurable: false, enumerable: false,
            writeable: false, value: value};
  };


  var MiscUtils = {
    clamp: clamp,
    makeConstantDescriptor: makeConstantDescriptor
  };


  return MiscUtils;
});
