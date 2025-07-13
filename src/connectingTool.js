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

import { BaseTool } from './baseTool.js';
import { Connector } from './connector.js';

// Take a tool constructor, make it inherit from BaseTool, and add
// the various connection related functions
var makeTool = BaseTool.makeTool;
var ConnectingTool = function(toolConstructor) {
  return Connector(makeTool(toolConstructor));
};


export { ConnectingTool };
