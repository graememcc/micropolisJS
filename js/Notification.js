/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['MiscUtils', 'Text'],
       function(MiscUtils, Text) {
  "use strict";


  function Notification(element, map, initialText) {
    element = MiscUtils.normaliseDOMid(element);
    this._element = $(element);
    this._map = map;

    this._handleClick = handleClick.bind(this);

    this._element.text(initialText);

    // The position to centre on when the link is clicked
    this._x = -1;
    this._y = -1;

    this._element.click(this._handleClick);
  }


  Notification.prototype._displayLink = function(text, x, y) {
    this._element.text(text);

    this._x = x;
    this._y = y;

    this._element.text(text);

    this._element.addClass('pointer');
  }


  Notification.prototype._displayText = function(text, x, y) {
    this._element.removeClass('pointer');

    this._element.text(text);
    this._x = -1;
    this._y = -1;
  };


  var handleClick = function(e) {
    e.preventDefault();

    if (this._x === -1 || this._y === -1)
      return;

    this._map.centreOn(this._x, this._y);
  };


  Notification.prototype.createMessage = function(message) {

    if (message.hasOwnProperty('data') && message.data !== undefined && message.data.hasOwnProperty('x') && message.data.hasOwnProperty('y')) {
      console.log(messsage);
      this._displayLink(Text.messageText[message.subject], message.data.x, message.data.y);
      return;
    }

    this._displayText(Text.messageText[message.subject]);
  };


  Notification.prototype.badNews = function(message) {
    this._element.removeClass('neutral');
    this._element.removeClass('good');
    this._element.addClass('bad');
    this.createMessage(message);
  };


  Notification.prototype.goodNews = function(message) {
    this._element.removeClass('neutral');
    this._element.removeClass('bad');
    this._element.addClass('good');
    this.createMessage(message);
  };


  Notification.prototype.news = function(message) {
    this._element.removeClass('good');
    this._element.removeClass('bad');
    this._element.addClass('neutral');
    this.createMessage(message);
  };


  return Notification;
});
