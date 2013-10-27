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

  function MessageManager() {
    this.data = [];
  }


  MessageManager.prototype.sendMessage = function(message, data) {
    this.data.push({message: message, data: data});
  };


  MessageManager.prototype.clear = function() {
    this.data = [];
  };


  MessageManager.prototype.getMessages = function() {
    return this.data.slice();
  };


  return MessageManager;
});
