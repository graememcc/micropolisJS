/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define([],
       function() {
  "use strict";


  var badNews = function(msg) {
    var elem = $('#notifications');
    elem.removeClass('neutral');
    elem.removeClass('good');
    elem.addClass('bad');
    elem.text(msg);
  };


  var goodNews = function(msg) {
    var elem = $('#notifications');
    elem.removeClass('neutral');
    elem.removeClass('bad');
    elem.addClass('good');
    elem.text(msg);
  };


  var news = function(msg) {
    var elem = $('#notifications');
    elem.removeClass('good');
    elem.removeClass('bad');
    elem.addClass('neutral');
    elem.text(msg);
  };


  var Notification = {
    badNews: badNews,
    goodNews: goodNews,
    news: news
  };

   
  return Notification;
});
