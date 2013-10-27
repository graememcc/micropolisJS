/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

(function() {
  "use strict";


  // Note: these polyfills reflect micropolisJS's usage of
  // the functions rather than full ECMAScript spec compliance

  if (typeof(Array.prototype.filter) === 'undefined') {
    Array.prototype.filter = function(f) {
      var result = [];

      for (var i = 0, l = this.length; i < l; i++) {
        if (f(this[i], i, this))
          result.push(this[i]);
      }

      return result;
    };
  }


  if (typeof(Array.prototype.map) === 'undefined') {
    Array.prototype.filter = function(f) {
      var result = [];

      for (var i = 0, l = this.length; i < l; i++)
        result.push(f(this[i], i, this));

      return result;
    };
  }


  if (typeof(Function.prototype.bind) === 'undefined') {
    Function.prototype.bind = function(thisArg) {
      var f = this;
      var suppliedArgs = [].slice.call(arguments, 1);

      return function() {
        var args = suppliedArgs.concat([].slice.call(arguments));
        return f.apply(thisArg, args);
      };
    };
  }


  if (typeof(Object.defineProperty) === 'undefined') {
    Object.defineProperty = function(obj, propName, descriptor) {
      obj[propName] = descriptor.value;
    };
  }


  if (typeof(Object.defineProperties) === 'undefined') {
    Object.defineProperties = function(obj, propObj) {
      for (var k in propObj)
        obj[k] = propObj[k].value;
    };
  }


  if (typeof(Object.keys) === 'undefined') {
    Object.keys = function(obj) {
      var result = [];

      for (var k in obj)
        result.push(k);

      return result;
    };
  }
 

  if (typeof(Object.create) === 'undefined') {
    Object.create = function(prototype) {
      function C() {}
      C.prototype = prototype;
      return new C();
    };
  }
})();
