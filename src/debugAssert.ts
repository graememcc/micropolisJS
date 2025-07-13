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

// TODO: More descriptive asserting functions: will require better
// assert-stripping than is provided by ts-transform-unassert at time of writing

export function assert(assertionPassed: boolean, message: string) {
    // TODO: Less invasive reporting than an alert
    if (!assertionPassed) {
        alert(`Assertion failed: ${message}`);
    }
}
