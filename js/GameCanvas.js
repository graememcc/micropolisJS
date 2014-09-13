/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['AnimationManager', 'GameMap', 'MiscUtils', 'MouseBox', 'Tile', 'TileSet'],
       function(AnimationManager, GameMap, MiscUtils, MouseBox, Tile, TileSet) {
  "use strict";


  function GameCanvas(id, parentNode) {
    if (!(this instanceof GameCanvas))
      return new GameCanvas(id, parentNode, width, height);

    var e = new Error('Invalid parameter');

    if (arguments.length < 1)
      throw e;

    // Argument shuffling
    if (parentNode === undefined) {
      // No ID supplied
      parentNode = id;
      id = GameCanvas.DEFAULT_ID;
    }

    if (typeof(parentNode) === 'string') {
      var orig = parentNode;
      parentNode = $(MiscUtils.normaliseDOMid(parentNode));
      parentNode = parentNode.length === 0 ? null : parentNode[0];
      if (parentNode === null)
        throw new Error('Node ' + orig + ' not found');
    }

    this._canvas = document.createElement('canvas');
    this._canvas.id = id;

    // The canvas is assumed to fill its container on-screen
    var rect = parentNode.getBoundingClientRect();
    this._canvas.width = rect.width;
    this._canvas.height = rect.height;
    this._canvas.style.margin = '0';
    this._canvas.style.padding = '0';

    this._pendingTileSet = null;

    // Remove any existing element with the same id
    var current = document.getElementById(id);
    if (current !== null) {
      if  (current.parentNode === parentNode)
        parentNode.replaceChild(this._canvas, current);
      else
        throw new Error('ID ' + id + ' already exists in document!');
    } else
      parentNode.appendChild(this._canvas);

    this.ready = false;
  }


  GameCanvas.prototype.init = function(map, tileSet, spriteSheet, animationManager) {
    animationManager = animationManager || new AnimationManager(map);

    var e = new Error('Invalid parameter');

    if (arguments.length < 3)
      throw e;

    if (!tileSet.loaded)
      throw new Error('TileSet not ready!');

    this._spriteSheet = spriteSheet;
    this._tileSet = tileSet;
    var w = this._tileSet.tileWidth;
    this._map = map;
    this.animationManager = new AnimationManager(map);

    if (this._canvas.width < w || this._canvas.height < w)
      throw new Error('Canvas too small!');

    // Whether to allow off-map scrolling
    this._allowScrolling = true;

    // An array indexed by tile offset containing the tileValue last painted there
    this._lastPaintedTiles = null;
    this._currentPaintedTiles = null; // for future use

    // Last time we painted, the canvas was this many tiles wide and tall
    this._lastPaintedWidth = -1;
    this._lastPaintedHeight = -1;

    // Last time we painted, the canvas was this wide and tall in pixels (determines whether we
    // can safely call putImageData)
    this._lastCanvasWidth = -1;
    this._lastCanvasHeight = -1;

    // After painting tiles, we store the image data here before painting sprites and mousebox
    this._lastCanvasData = null;

    this._calculateDimensions();

    // Order is important here. ready must be set before the call to centreOn below
    this.ready = true;
    this.centreOn(Math.floor(this._map.width / 2), Math.floor(this._map.height / 2));

    this.paint(null, null);
  };


  GameCanvas.prototype._calculateDimensions = function(force) {
    force = force || false;

    // The canvas is assumed to fill its container on-screen
    var canvasWidth = this.canvasWidth = this._canvas.parentNode.clientWidth;
    var canvasHeight = this.canvasHeight = this._canvas.parentNode.clientHeight;

    if (canvasHeight === this._lastCanvasHeight && canvasWidth === this._lastCanvasWidth && !force)
      return;

    this._canvas.width = canvasWidth;
    this._canvas.height = canvasHeight;

    var w = this._tileSet.tileWidth;

    // How many tiles fit?
    this._wholeTilesInViewX = Math.floor(canvasWidth / w);
    this._wholeTilesInViewY = Math.floor(canvasHeight / w);
    this._totalTilesInViewX = Math.ceil(canvasWidth / w);
    this._totalTilesInViewY = Math.ceil(canvasHeight / w);

    if (this._allowScrolling) {
      // The min/max properties denote how far we will let the canvas' origin move: the map
      // should be visible in at least half the canvas
      this.minX = 0 - Math.ceil(Math.floor(canvasWidth/w) / 2);
      this.maxX = (this._map.width - 1) - Math.ceil(Math.floor(canvasWidth/w) / 2);
      this.minY = 0 - Math.ceil(Math.floor(canvasHeight/w) / 2);
      this.maxY = (this._map.height - 1) - Math.ceil(Math.floor(canvasHeight/w) / 2);
      this._totalTilesInViewY = Math.ceil(canvasHeight / w);
    } else {
      this.minX = 0;
      this.minY = 0;
      this.maxX = this._map.width - this._totalTilesInViewX;
      this.maxY = this._map.height - this._totalTilesInViewY;
    }
  };


  // NOTE: Canvas must be visible when this is called
  GameCanvas.prototype.disallowOffMap = function() {
    this._allowScrolling = false;
    this._lastPaintedTiles = null;
    this._calculateDimensions(true);
  };


  GameCanvas.prototype.moveNorth = function() {
    if (!this.ready)
      throw new Error('Not ready!');

    if (this._originY > this.minY)
      this._originY--;
  };


  GameCanvas.prototype.moveEast = function() {
    if (!this.ready)
      throw new Error('Not ready!');

    if (this._originX < this.maxX)
      this._originX++;
  };


  GameCanvas.prototype.moveSouth = function() {
    if (!this.ready)
      throw new Error('Not ready!');

    if (this._originY < this.maxY)
      this._originY++;
  };


  GameCanvas.prototype.moveWest = function() {
    if (!this.ready)
      throw new Error('Not ready!');

    if (this._originX > this.minX)
      this._originX--;
  };


  GameCanvas.prototype.moveTo = function(x, y) {
    var e = new Error('Invalid parameter');

    if (arguments.length < 1)
      throw e;

    if (!this.ready)
      throw new Error('Not ready!');

    if (x < this.minX || x > this.maxX ||
        y < this.minY || y > this.maxY)
      throw new Error('Coordinates out of bounds');

    this._originX = x;
    this._originY = y;
  };


  GameCanvas.prototype.centreOn = function(x, y) {
    var e = new Error('Invalid parameter');

    if (arguments.length < 1)
      throw e;

    if (!this.ready)
      throw new Error('Not ready!');

    if (y === undefined) {
      y = x.y;
      x = x.x;
    }

    // XXX Need to fix so that centres on best point if bounds fall outside
    // XXX min/max
    var originX = Math.floor(x) - Math.ceil(this._wholeTilesInViewX / 2);
    var originY = Math.floor(y) - Math.ceil(this._wholeTilesInViewY / 2);

    if (originX > this.maxX)
      originX = this.maxX;
    if (originX < this.minX)
      originX = this.minX;
    if (originY > this.maxY)
      originY = this.maxY;
    if (originY < this.minY)
      originY = this.minY;

    this._originX = originX;
    this._originY = originY;
  };


  GameCanvas.prototype.getTileOrigin = function() {
    var e = new Error('Not ready!');

    if (!this.ready)
      throw e;

    return {x: this._originX, y: this._originY};
  };


  GameCanvas.prototype.getMaxTile = function() {
    var e = new Error('Not ready!');

    if (!this.ready)
      throw e;

    return {x: this._originX + this._totalTilesInViewX - 1, y: this._originY + this._totalTilesInViewY - 1};
  };


  GameCanvas.prototype.canvasCoordinateToTileOffset = function(x, y) {
    var e = new Error('Invalid parameter');

    if (arguments.length < 2)
      throw e;

    if (!this.ready)
      throw new Error('Not ready!');

    return {x: Math.floor(x / this._tileSet.tileWidth),
            y: Math.floor(y / this._tileSet.tileWidth)};
  };


  GameCanvas.prototype.canvasCoordinateToTileCoordinate = function(x, y) {
    var e = new Error('Invalid parameter');

    if (arguments.length < 2)
      throw e;

    if (!this.ready)
      throw new Error('Not ready!');

    if (x >= this.canvasWidth || y >= this.canvasHeight)
      return null;

    return {x: this._originX + Math.floor(x/this._tileSet.tileWidth),
            y: this._originY + Math.floor(y/this._tileSet.tileWidth)};
  };


  GameCanvas.prototype.canvasCoordinateToPosition = function(x, y) {
    var e = new Error('Invalid parameter');

    if (arguments.length < 2)
      throw e;

    if (!this.ready)
      throw new Error('Not ready!');

    if (x >= this.canvasWidth || y >= this.canvasHeight)
      return null;

    x = this._originX + Math.floor(x / this._tileSet.tileWidth);
    y = this._originY + Math.floor(y / this._tileSet.tileWidth);


    if (x < 0 || x >= this._map.width || y < 0 || y >= this._map.height)
      return null;

    return new this._map.Position(x, y);
  };



  GameCanvas.prototype.positionToCanvasCoordinate = function(p) {
    var e = new Error('Invalid parameter');

    if (arguments.length < 1)
      throw e;


    return this.tileToCanvasCoordinate(p);
  };



  GameCanvas.prototype.tileToCanvasCoordinate = function(x, y) {
    var e = new Error('Invalid parameter');

    if (arguments.length < 1)
      throw e;

    if (!this.ready)
      throw new Error('Not ready!');

    if (y === undefined) {
      y = x.y;
      x = x.x;
    }

    if (x === undefined || y === undefined || x < this.minX || y < this.minY ||
        x > (this.maxX + this._totalTilesInViewX - 1) ||
        y > (this.maxY + this._totalTilesInViewY - 1))
      throw e;

    if (x < this._originX || x >= this._originX + this._totalTilesInViewX ||
        y < this._originY || y >= this._originY + this._totalTilesInViewY)
      return null;

    return {x: (x - this._originX) * this._tileSet.tileWidth,
            y: (y - this._originY) * this._tileSet.tileWidth};
  };



  GameCanvas.prototype.changeTileSet = function(tileSet) {
    var e = new Error('Invalid parameter');

    if (arguments.length < 1)
      throw e;

    if (!this.ready)
      throw new Error('Not ready!');

    if (!tileSet.loaded)
      throw new Error('new tileset not loaded');

    if (this._pendingTileSet && (this._pendingHeight || this._pendingWidth))
      throw new Error('dimensions have changed');

    var w = tileSet.tileWidth;
    var canvasWidth = this._pendingWidth === null ? this.canvasWidth : this._pendingWidth;
    var canvasHeight = this._pendingHeight === null ? this.canvasHeight : this._pendingHeight;

    if (canvasWidth < w || canvasHeight < w)
      throw new Error('canvas too small');

    this._pendingTileSet = tileSet;
  };



  GameCanvas.prototype._screenshot = function(onlyVisible) {
    if (onlyVisible)
      return this._canvas.toDataURL();

    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = this._map.width * this._tileSet.tileWidth;
    tempCanvas.height = this._map.height * this._tileSet.tileWidth;
    var ctx = tempCanvas.getContext('2d');

    for (var x = 0; x < this._map.width; x++) {
      for (var y = 0; y < this._map.height; y++) {
        this._paintOne(ctx, this._map.getTileValue(x, y), x, y);
      }
    }
    return tempCanvas.toDataURL();
  };


  GameCanvas.prototype.screenshotMap = function() {
    return this._screenshot(false);
  };


  GameCanvas.prototype.screenshotVisible = function() {
    return this._screenshot(true);
  };


  GameCanvas.prototype.shoogle = function() {
    // TODO Earthquakes
  };


  GameCanvas.prototype._processSprites = function(ctx, spriteList) {
    var spriteDamage = [];
    var tileWidth = this._tileSet.tileWidth;

    for (var i = 0, l = spriteList.length; i < l; i++) {
      var sprite = spriteList[i];
      ctx.drawImage(this._spriteSheet,
                    (sprite.frame - 1) * 48,
                    (sprite.type - 1) * 48,
                    sprite.width,
                    sprite.width,
                    sprite.x + sprite.xOffset - this._originX * 16,
                    sprite.y + sprite.yOffset - this._originY * 16,
                    sprite.width,
                    sprite.width);

      // sprite values are in pixels
      spriteDamage.push({x: Math.floor((sprite.x + sprite.xOffset - this._originX * 16) / tileWidth),
                         xBound: Math.ceil((sprite.x + sprite.xOffset + sprite.width - this._originX * 16) / tileWidth),
                         y: Math.floor((sprite.y + sprite.yOffset - this._originY * 16) / tileWidth),
                         yBound: Math.ceil((sprite.y + sprite.yOffset + sprite.height - this._originY * 16) / tileWidth)});
    }

    return spriteDamage;
  };


  GameCanvas.prototype._processMouse = function(mouse) {
    if (mouse.width === 0 || mouse.height === 0)
      return;

    // For outlines bigger than 2x2 (in either dimension) assume the mouse is offset by
    // one tile
    var mouseX = mouse.x;
    var mouseY = mouse.y;
    var mouseWidth = mouse.width;
    var mouseHeight = mouse.height;
    var options = {colour: mouse.colour, outline: true};

    if (mouseWidth > 2)
      mouseX -= 1;
    if (mouseHeight > 2)
      mouseY -= 1;

    var offMap = (this._originX + mouseX < 0 && this._originX + mouseX + mouseWidth <= 0) ||
                 (this._originY + mouseY < 0 && this._originY + mouseY + mouseHeight <= 0) ||
                 this._originX + mouseX >= this._map.width || this._originY + mouseY >= this._map.height;

    if (offMap)
      return {x: mouseX, xBound: mouseX, y: mouseY, yBound: mouseY};

    var pos = {x: mouseX * this._tileSet.tileWidth, y: mouseY * this._tileSet.tileWidth};
    var width = mouseWidth * this._tileSet.tileWidth;
    var height = mouseHeight * this._tileSet.tileWidth;
    MouseBox.draw(this._canvas, pos, width, height, options);

    // Return an object representing tiles that were damaged that will need redrawn
    // Note that we must take an extra tile either side to account for the outline
    return {x: mouseX - 1, xBound: mouseX + mouseWidth + 2, y: mouseY - 1, yBound: mouseY + mouseWidth + 2};
  };


  GameCanvas.prototype._paintVoid = function(ctx, x, y) {
    var w = this._tileSet.tileWidth;
    ctx.fillStyle = 'black';
    ctx.fillRect(x * w, y * w, w, w);
  };


  GameCanvas.prototype._paintOne = function(ctx, tileVal, x, y) {
    if (tileVal === Tile.TILE_INVALID) {
      this._paintVoid(ctx, x, y);
      return;
    }

    var src = this._tileSet[tileVal];
    ctx.drawImage(src, x * this._tileSet.tileWidth, y * this._tileSet.tileWidth);
  };


  GameCanvas.prototype._paintTiles = function(ctx, paintData) {
    if (this._lastPaintedTiles !== null) {
      var xBound = Math.min(this._lastPaintedWidth, this._totalTilesInViewX);
      var yBound = Math.min(this._lastPaintedHeight, this._totalTilesInViewY);

      // Loop, comparing the current value with what was there last time
      for (var y = 0; y < yBound; y++) {
        var row = paintData[y];
        var lastRow = this._lastPaintedTiles[y];

        for (var x = 0; x < xBound; x++) {
          if (lastRow[x] === row[x])
            continue;

          // Tile is different: repaint
          this._paintOne(ctx, row[x], x, y);
        }
      }

      // Do we have more tiles than before?
      if (this._totalTilesInViewX > this._lastPaintedWidth) {
        for (y = 0; y < this._totalTilesInViewY; y++) {
          row = paintData[y];

          for (x = this._lastPaintedWidth; x < this._totalTilesInViewX; x++)
              this._paintOne(ctx, row[x], x, y);
        }
      } else if (this._totalTilesInViewY > this._lastPaintedHeight) {
        for (y = this._lastPaintedHeight; y < this._totalTilesInViewY; y++) {
          row = paintData[y];

          for (x = 0; x < this._totalTilesInViewX; x++)
            this._paintOne(ctx, row[x], x, y);
        }
      }
    } else {
      // Full paint
      for (var y = 0; y < this._totalTilesInViewY; y++) {
        row = paintData[y];

        for (x = 0; x < this._totalTilesInViewX; x++)
            this._paintOne(ctx, row[x], x, y);
      }
    }

    // Stash data
    this._lastPaintedWidth = this._totalTilesInViewX;
    this._lastPaintedHeight = this._totalTilesInViewY;

    // Rotate tile data
    var temp = this._lastPaintedTiles;
    this._lastPaintedTiles = paintData;
    this._currentPaintedTiles = temp;
  };


  GameCanvas.prototype.paint = function(mouse, sprites, isPaused) {
    if (!this.ready)
      throw new Error('Not ready!');

    // Change tileSet if necessary
    var tileSetChanged = false;
    if (this._pendingTileSet !== null) {
      this._tileSet = this._pendingTileSet;
      this._pendingTileSet = null;
      tileSetChanged = true;

      this._lastPaintedTiles = null;
      this._lastCanvasData = null;
    }

    this._calculateDimensions();

    // Fill an array with the values we need to paint
    var tileValues = this._map.getTileValuesForPainting(this._originX, this._originY, this._totalTilesInViewX, this._totalTilesInViewY, this._currentPaintedTiles);

    // Adjust for animations
    this.animationManager.getTiles(tileValues, this._originX, this._originY, this._totalTilesInViewX, this._totalTilesInViewY, isPaused);

    var ctx = this._canvas.getContext('2d');

    if (this.canvasWidth !== this._lastCanvasWidth || this.canvasHeight !== this._lastCanvasHeight) {
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      for (var y = 0, l = (this._lastPaintedTiles !== null ? this._lastPaintedTiles.length : 0); y < l; y++) {
        var row = this._lastPaintedTiles[y];
        for (var x = 0, l2 = row.length; x < l2; x++)
          row[x] = -2;
      }
    }

    this._paintTiles(ctx, tileValues);

    // Stash various values for next paint
    this._lastCanvasWidth = this.canvasWidth;
    this._lastCanvasHeight = this.canvasHeight;

    if (!mouse && !sprites) {
      return;
    }

    if (mouse) {
      var damaged = this._processMouse(mouse);
      for (var y = Math.max(0, damaged.y), yBound = Math.min(this._lastPaintedTiles.length, damaged.yBound); y < yBound; y++) {
        var row = this._lastPaintedTiles[y];
        for (var x = Math.max(0, damaged.x), xBound = Math.min(row.length, damaged.xBound); x < xBound; x++) {
          // Note: we can't use Tile.INVALID (-1) as that in some sense is a valid tile for the void!
          row[x] = -2;
        }
      }
    }

    if (sprites) {
      damaged = this._processSprites(ctx, sprites);
      for (var i = 0, l = damaged.length; i < l; i++) {
        var damagedArea = damaged[i];
        for (var y = Math.max(0, damagedArea.y), yBound = Math.min(damagedArea.yBound, this._lastPaintedTiles.length); y < yBound; y++) {
          row = this._lastPaintedTiles[y];
          for (var x = Math.max(0, damagedArea.x), xBound = Math.min(damagedArea.xBound, row.length); x < xBound; x++) {
            this._lastPaintedTiles[y][x] = -2;
          }
        }
      }
    }
  };


  GameCanvas.DEFAULT_ID = 'MicropolisCanvas';


  return GameCanvas;
});
