/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['BaseTool', 'Connector'], function(BaseTool, Connector) {
  "use strict";


  // Take a tool constructor, make it inherit from BaseTool, and add
  // the various connection related functions
  var makeTool = BaseTool.makeTool;
  var connectingTool = function(toolConstructor) {
    return Connector(makeTool(toolConstructor));
  };


  return connectingTool;
});
