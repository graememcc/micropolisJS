
/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

var getChance = function(chance: number): boolean {
  return (getRandom16() & chance) === 0;
};


var getERandom = function(max:number): number {
  var r1 = getRandom(max);
  var r2 = getRandom(max);
  return Math.min(r1, r2);
};


var getRandom = function(max:number): number {
  return Math.floor(Math.random() * (max + 1));
};


var getRandom16 = function() {
  return getRandom(65535);
};


var getRandom16Signed = function() {
  var value = getRandom16();
  if (value >= 32768)
    value = 32768 - value;
  return value;
};


var Random = {
  getChance: getChance,
  getERandom: getERandom,
  getRandom: getRandom,
  getRandom16: getRandom16,
  getRandom16Signed: getRandom16Signed
};


export { Random };
