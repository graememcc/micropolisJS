/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 * The name/term "MICROPOLIS" is a registered trademark of Micropolis (https://www.micropolis.com) GmbH
 * (Micropolis Corporation, the "licensor") and is licensed here to the authors/publishers of the "Micropolis"
 * city simulation game and its source code (the project or "licensee(s)") as a courtesy of the owner.
 *
 */

interface BlockCoordinate {
  x: number;
  y: number;
}

type ForEachFunction = (x: number, y: number) => any;

type TransformationFunction = (n: number) => number;

const ID: TransformationFunction = (n) => n;

/*
 *
 * BlockMaps are data maps where each entry corresponds to data representing a block of tiles in the original
 * game map.
 *
 */

export class BlockMap {

  // tslint:disable-next-line:variable-name
  private _width: number;
  // tslint:disable-next-line:variable-name
  private _height: number;
  private data: number[] = [];

  // Construct a block map. Takes three integers: the game map's width and height, and the block size (i.e. how many
  // tiles in each direction should map to the same block). The BlockMap entries will be initialised to zero.
  constructor(readonly gameMapWidth: number, readonly gameMapHeight: number, readonly blockSize: number) {
    this._width = this.convertToBlockCount(this.gameMapWidth);
    this._height = this.convertToBlockCount(this.gameMapHeight);
    this.clear();
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  public get(blockX: number, blockY: number): number {
    const index = this.toIndex(blockX, blockY);
    return this.data[index];
  }

  public set(blockX: number, blockY: number, value: number) {
    const index = this.toIndex(blockX, blockY);
    this.data[index] = value;
  }

  public worldGet(worldX: number, worldY: number): number {
    const {x, y} = this.toBlockCoordinate(worldX, worldY);
    return this.get(x, y);
  }

  public worldSet(worldX: number, worldY: number, value: number) {
    const {x, y} = this.toBlockCoordinate(worldX, worldY);
    this.set(x, y, value);
  }

  public clear() {
    this.forEach((x, y) => this.set(x, y, 0));
  }

  public copyFrom(source: BlockMap, transform: TransformationFunction = ID) {
    if (this.hasIncompatibleDimensions(source)) {
      console.warn("Copying from incompatible blockMap!");
    }

    this.forEach((x, y) => this.set(x, y, transform(source.get(x, y))));
  }

  private forEach(fn: ForEachFunction) {
    const maxWidth = this.width;
    const maxHeight = this.height;

    for (let x = 0; x < maxWidth; x++) {
      for (let y = 0; y < maxHeight; y++) {
        fn(x, y);
      }
    }
  }

  private convertToBlockCount(value: number) {
    return Math.floor((value + this.blockSize - 1) / this.blockSize);
  }

  private hasIncompatibleDimensions(map: BlockMap): boolean {
    return map.gameMapHeight !== this.gameMapHeight ||
           map.gameMapWidth !== this.gameMapWidth ||
           map.blockSize !== this.blockSize;
  }

  private toBlockCoordinate(worldX: number, worldY: number): BlockCoordinate {
    const x = this.toBlockIndex(worldX);
    const y = this.toBlockIndex(worldY);
    return {x, y};
  }

  private toBlockIndex(worldIndex: number): number {
    return Math.floor(worldIndex / this.blockSize);
  }

  private toIndex(blockX: number, blockY: number) {
    return this.width * blockY + blockX;
  }
}
