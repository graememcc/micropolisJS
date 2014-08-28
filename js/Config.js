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

  // All areas of micropolisJS that provide debug options should also check the debug
  // value as well as their individual value. The debug flag is intended to switch on all
  // debug options.

  var Config = {
    debug: false,
    gameDebug: false,
    queryDebug: false
  };


  return Config;
});
