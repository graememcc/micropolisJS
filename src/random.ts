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

interface MathGlobal {
  random(): number;
  floor(n: number): number;
}

type UpperBoundedRNG = (maxValue: number) => number;

type SixteenBitRNG = () => number;

function getChance(chance: number, rng: SixteenBitRNG = getRandom16): boolean {
  // tslint:disable-next-line:no-bitwise
  return (rng() & chance) === 0;
}

function getERandom(max: number, rng: UpperBoundedRNG = getRandom): number {
  const firstCandidate = rng(max);
  const secondCandidate = rng(max);
  return Math.min(firstCandidate, secondCandidate);
}

function getRandom(max: number, mathGlobal: MathGlobal = Math): number {
  return mathGlobal.floor(mathGlobal.random() * (max + 1));
}

function getRandom16(rng: UpperBoundedRNG = getRandom): number {
  return rng(65535);
}

function getRandom16Signed(rng: SixteenBitRNG = getRandom16) {
  const value = rng();

  if (value < 32768) {
    return value;
  } else {
    return -(2 ** 16) + value;
  }
}

const Random = {
  getChance,
  getERandom,
  getRandom,
  getRandom16,
  getRandom16Signed,
};

export { Random };
