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


  // Decorate the given object, by adding {add|remove}EventListener methods, and an internal '_emitEvent' method
  var makeEventEmitter = function(obj) {
    var events = {};


    var addListener = function(event, listener) {
      if (!(event in events))
        events[event] = [];

      var listeners = events[event];
      if (listeners.indexOf(listener) === -1)
        listeners.push(listener);
    };


    var removeListener = function(event, listener) {
      if (!(event in events))
        events[event] = [];

      var listeners = events[event];
      var index = listeners.indexOf(listener);
      if (index !== -1)
        listeners.splice(index, 1);
    };


    var emitEvent = function(event, value) {
      if (!(event in events))
        events[event] = [];

      var listeners = events[event];
      for (var i = 0, l = listeners.length; i < l; i++)
        listeners[i](value);
    };


    if (['addEventListener', 'removeEventListener', '_emitEvent'].some(function(prop) {
      return obj[prop] !== undefined;
    }))
      throw new Error('Cannot decorate object: existing properties would be overwritten!');

    obj.addEventListener = addListener;
    obj.removeEventListener = removeListener;
    obj._emitEvent = emitEvent;
  };


  return makeEventListener;
});
