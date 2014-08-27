/* micropolisJS. Adapted from Micropolis by Graeme McCutcheon.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['Messages', 'MiscUtils'],
       function(Messages, MiscUtils) {
  "use strict";

  function RCI(parentNode, eventSource, id) {
    var e = new Error('Invalid parameter');

    if (arguments.length < 2) {
      throw e;
    }

    if (id === undefined)
      id = RCI.DEFAULT_ID;

    if (typeof(parentNode) === 'string') {
      var orig = parentNode;
      parentNode = $('#' + parentNode);
      parentNode = parentNode.length === 0 ? null : parentNode[0];
      if (parentNode === null)
        throw new Error('Node ' + orig + ' not found');
    }

    this._padding = 3; // 3 rectangles in each bit of padding
    this._buckets = 10; // 0.2000 is scaled in to 10 buckets 
    this._rectSize = 5; // Each rect is 5px
    this._scale = Math.floor(2000 / this._buckets);

    // Each bar is 1 unit of padding wide, and there are 2 units
    // of padding between the 3 bars. There are 2 units of padding
    // either side. So 9 units of padding total
    this._canvasWidth = 9 * this._rectSize;

    // Each bar can be at most bucket rectangles tall, but we multiply
    // that by 2 as we can have positive and negative directions. There
    // should be 1 unit of padding either side. The text box in the middle
    // is 1 unit of padding
    this._canvasHeight = (2 * this._buckets + 3 * this._padding) * this._rectSize;

    this._canvas = $('<canvas></canvas>', {id: id})[0];

    // Remove any existing element with the same id
    var elems = $('#' + id)
    var current = elems.length > 0 ? elems[0] : null;
    if (current !== null) {
      if (current.parentNode === parentNode)
        parentNode.replaceChild(this._canvas, current);
      else
        throw new Error('ID ' + id + ' already exists in document!');
    } else
      parentNode.appendChild(this._canvas);

    eventSource.addEventListener(Messages.VALVES_UPDATED, this.update.bind(this));
  }


  RCI.prototype._clear = function(ctx) {
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  };


  RCI.prototype._drawRect = function(ctx) {
    // The rect is inset by one unit of padding
    var boxLeft = this._padding * this._rectSize;
    // and is the length of a bar plus a unit of padding down
    var boxTop = (this._buckets + this._padding) * this._rectSize;
    // It must accomodate 3 bars, 2 bits of internal padding
    // with padding either side
    var boxWidth = 7 * this._padding * this._rectSize;
    var boxHeight = this._padding * this._rectSize;

    ctx.fillStyle = 'rgb(192, 192, 192)';
    ctx.fillRect(boxLeft, boxTop, boxWidth, boxHeight);
  };


  RCI.prototype._drawValue = function(ctx, index, value) {
    // Need to scale com and ind
    if (index > 1)
      value = Math.floor(2000/1500 * value);

    var colours = ['rgb(0,255,0)', 'rgb(0, 0, 139)', 'rgb(255, 255, 0)'];
    var barHeightRect = Math.floor(Math.abs(value) / this._scale);
    var barStartY = (value >= 0) ?
      this._buckets + this._padding - barHeightRect : this._buckets + 2 * this._padding;
    var barStartX = 2 * this._padding + (index * 2 * this._padding);

    ctx.fillStyle = colours[index];
    ctx.fillRect(barStartX * this._rectSize, barStartY * this._rectSize,
                 this._padding * this._rectSize, barHeightRect * this._rectSize);
  };


  RCI.prototype._drawLabel = function(ctx, index) {
    var labels = ['R', 'C', 'I'];
    var textLeft = 2 * this._padding + (index * 2 * this._padding) +
                   Math.floor(this._padding/2);

    ctx.font = 'normal xx-small sans-serif';
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.textBaseline = 'bottom';
    ctx.fillText(labels[index], textLeft * this._rectSize,
                 (this._buckets + 2 * this._padding) * this._rectSize);
  };


  RCI.prototype.update = function(data) {
    var ctx = this._canvas.getContext('2d');
    this._clear(ctx);
    this._drawRect(ctx);

    var values = [data.residential, data.commerical, data.industrial];
    for (var i = 0; i < 3; i++) {
      this._drawValue(ctx, i, values[i]);
      this._drawLabel(ctx, i);
    }
  };


  Object.defineProperty(RCI, 'DEFAULT_ID', MiscUtils.makeConstantDescriptor('RCICanvas'));

  return RCI;
});
