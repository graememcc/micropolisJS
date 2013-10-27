/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Text'],
       function(Text) {
  "use strict";

  // TODO L20N

  var setClass = function(classification) {
    $('#cclass').text(classification);
  };

  var setDate = function(m, year) {
    $('#date').text([Text.months[m], year].join(' '));
  };


  var setFunds = function(funds) {
    $('#funds').text(funds);
  };


  var setPopulation = function(pop) {
    $('#population').text(pop);
  };


  var setScore = function(score) {
    $('#score').text(score);
  };


  var InfoBar = {
    setClass: setClass,
    setDate: setDate,
    setFunds: setFunds,
    setPopulation: setPopulation,
    setScore: setScore
  };


  return InfoBar;
});
