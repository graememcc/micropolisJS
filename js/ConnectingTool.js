/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { BaseTool } from './BaseTool';
import { Connector } from './Connector';

// Take a tool constructor, make it inherit from BaseTool, and add
// the various connection related functions
var makeTool = BaseTool.makeTool;
var ConnectingTool = function(toolConstructor) {
  return Connector(makeTool(toolConstructor));
};


export { ConnectingTool };
