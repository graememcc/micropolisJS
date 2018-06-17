/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
*
* This code is released under the GNU GPL v3, with some additional terms.
* Please see the files LICENSE and COPYING for details. Alternatively,
* consult http://micropolisjs.graememcc.co.uk/LICENSE and
* http://micropolisjs.graememcc.co.uk/COPYING
*
*/

import * as TileFlags from "./tileFlags";
import { DIRT, TILE_COUNT, TILE_INVALID } from "./tileValues";

// I think I want to change this soon. Most of the tile properties, (e.g. whether
// it is a zone, population, conductiveness, pollution emitted) are completely defined
// by the tile value. I think we want a set of prototype objects that are essentially
// immutable, and a TileCreator() function that returns an object with the correct proto
// tile, where mutable state such as animation can live.
//
// This would allow us to cull the getTile/getValue pattern repeated ad nauseum all over the
// code. One could also have the map then track zones, so that populationDensityScan no longer
// needs to perform another full map scan.

type TilePredicateKey = {[K in keyof Tile]: Tile[K] extends () => boolean ? K : never; }[keyof Tile];

export class Tile {

  private value: number;

  constructor(value: number = DIRT, flags: number = 0) {
    this.validateArguments(value, flags, "Tile constructor");
    this.value = value | flags;
  }

  getValue(): number {
    return this.valueFromCombinedValue(this.value);
  }

  getFlags(): number {
    return this.flagsFromCombinedValue(this.value);
  }

  getRawValue(): number {
    // TODO: Can we remove the caller of this to avoid leaking this implementation detail?
    return this.value;
  }

  addFlags(flags: number) {
    this.validateFlags(flags, "addFlags");

    if (flags === TileFlags.NOFLAGS) {
      return;
    }

    this.value |= flags;
  }

  setValue(desiredValue: number) {
    if (desiredValue < TILE_INVALID) {
      throw new Error(`setValue called with out-of-range value ${desiredValue}`);
    }

    // TODO: Fix cases where this can be called with a "combined" value + flags value so we can simplify
    const value = this.valueFromCombinedValue(desiredValue);
    const bitMask = this.flagsToSetFromCombinedValue(desiredValue);
    this.set(value, bitMask);
  }

  setFlags(flags: number) {
    this.validateFlags(flags, "setFlags");

    const existingValue = this.value & ~TileFlags.ALLBITS;
    this.value = existingValue | flags;
  }

  removeFlags(flags: number) {
    this.validateFlags(flags, "removeFlags");

    if (flags === TileFlags.NOFLAGS) {
      return;
    }

    this.value &= ~flags;
  }

  setFrom(tile: Tile) {
    this.value = tile.value;
  }

  set(value: number, flags: number) {
    this.validateArguments(value, flags, "set");

    this.value = value | flags;
  }

  isAnimated(): boolean {
    return this.checkBits(TileFlags.ANIMBIT);
  }

  isBulldozable(): boolean {
    return this.checkBits(TileFlags.BULLBIT);
  }

  isConductive(): boolean {
    return this.checkBits(TileFlags.CONDBIT);
  }

  isCombustible(): boolean {
    return this.checkBits(TileFlags.BURNBIT);
  }

  isPowered(): boolean {
    return this.checkBits(TileFlags.POWERBIT);
  }

  isZone(): boolean {
    return this.checkBits(TileFlags.ZONEBIT);
  }

  toString(): string {
    const qualities = ["animated", "bulldozable", "combustible", "conductive", "powered", "zone"];
    const qualitiesText = qualities.map((quality) => this.getQualityText(quality)).join(", ");

    const tileValue = this.getValue();
    return `Tile# ${tileValue}: ${qualitiesText}`;
  }

  private getQualityText(quality: string): string {
    const predicate = this.predicateForQuality(quality);
    const qualityValue = this[predicate]();
    return `${quality}: ${this.summariseBoolean(qualityValue)}`;
  }

  private predicateForQuality(quality: string): TilePredicateKey {
    return `is${quality[0].toUpperCase()}${quality.slice(1)}` as TilePredicateKey;
  }

  private summariseBoolean(bool: boolean): string {
    return bool ? `✔` : `✘`;
  }

  private valueFromCombinedValue(value: number): number {
    return value & TileFlags.BIT_MASK;
  }

  private flagsFromCombinedValue(value: number): number {
    return value & TileFlags.ALLBITS;
  }

  private flagsToSetFromCombinedValue(value: number): number {
    const embeddedFlags = this.flagsFromCombinedValue(value);
    return embeddedFlags > 0 ? embeddedFlags : this.getFlags();
  }

  private checkBits(flag: number): boolean {
    return (this.value & flag) > 0;
  }

  private validateArguments(value: number, flags: number, context: string) {
    this.validateValue(value, context);
    this.validateFlags(flags, context);
  }

  private validateValue(value: number, context: string) {
    if (this.valueIsInvalid(value)) {
      throw new Error(`${context} called with out-of-range value ${value}`);
    }
  }

  private validateFlags(flags: number, context: string) {
    if (this.flagsAreInvalid(flags)) {
      throw new Error(`${context} called with out-of-range flags 0x${flags.toString(16)}`);
    }
  }

  private valueIsInvalid(value: number): boolean {
    return value < TILE_INVALID || value >= TILE_COUNT;
  }

  private flagsAreInvalid(flags: number): boolean {
    return flags !== 0 && (flags < TileFlags.BIT_START || (flags & ~TileFlags.ALLBITS) !== 0);
  }
}
