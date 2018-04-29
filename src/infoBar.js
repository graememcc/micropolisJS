/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Messages } from './messages';
import { MiscUtils } from './miscUtils';
import { Text } from './text';

// TODO L20N

var InfoBar = function(classification, population, score, funds, date, name) {
  var classificationSelector = MiscUtils.normaliseDOMid(classification);
  var populationSelector = MiscUtils.normaliseDOMid(population);
  var scoreSelector = MiscUtils.normaliseDOMid(score);
  var fundsSelector = MiscUtils.normaliseDOMid(funds);
  var dateSelector = MiscUtils.normaliseDOMid(date);
  var nameSelector = MiscUtils.normaliseDOMid(name);

  return function(dataSource, initialValues) {
    $(classificationSelector).text(initialValues.classification);
    $(populationSelector).text(initialValues.population);
    $(scoreSelector).text(initialValues.score);
    $(fundsSelector).text(initialValues.funds);
    $(dateSelector).text([Text.months[initialValues.date.month], initialValues.date.year].join(' '));
    $(nameSelector).text(initialValues.name);

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


export { InfoBar };
