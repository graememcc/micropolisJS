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

function TileHistory() {
  this.clear();
}


var toKey = function(x, y) {
  return [x, y].join(',');
};


TileHistory.prototype.clear = function() {
  this.data = {};
};


TileHistory.prototype.getTile = function(x, y) {
  var key = toKey(x, y);
  return this.data[key];
};


TileHistory.prototype.setTile = function(x, y, value) {
  var key = toKey(x, y);
  this.data[key] = value;
};


export { TileHistory };
