/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Messages', 'Text'],
       function(Messages, Text) {
  "use strict";

  // TODO L20N

  var InfoBar = function(classification, population, score, funds, date) {
    var classificationSelector = (classification[0] == '#' ? '' : '#') + classification;
    var populationSelector = (population[0] == '#' ? '' : '#') + population;
    var scoreSelector = (score[0] == '#' ? '' : '#') + score;
    var fundsSelector = (funds[0] == '#' ? '' : '#') + funds;
    var dateSelector = (date[0] == '#' ? '' : '#') + date;

    return function(dataSource) {
      // Add the various listeners
      dataSource.addEventListener(Messages.CLASSIFICATION_UPDATED, function(classification) {
        $(classificationSelector).text(classification);
      });

      dataSource.addEventListener(Messages.POPULATION_UPDATED, function(population) {
        $(populationSelector).text(population);
      });

      dataSource.addEventListener(Messages.SCORE_UPDATED, function(score) {
        $(scoreSelector).text(score);
      });

      dataSource.addEventListener(Messages.FUNDS_CHANGED, function(funds) {
        $(fundsSelector).text(funds);
      });

      dataSource.addEventListener(Messages.DATE_UPDATED, function(date) {
        $(dateSelector).text([Text.months[date.month], date.year].join(' '));
      });
    };
  };


  return InfoBar;
});
