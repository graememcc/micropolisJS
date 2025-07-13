import { Tile } from "../src/tile";
import * as TileFlags from "../src/tileFlags";
import { DIRT, FLOOD, LIGHTNINGBOLT, TILE_COUNT, TILE_INVALID } from "../src/tileValues";

describe("The Tile constructor", () => {

    describe("called with no arguments", () => {

        it("should construct a DIRT tile", () => {
            const tile = new Tile();

            expect(tile.getValue()).toBe(DIRT);
        });

        it("should construct a tile with no flags", () => {
            const tile = new Tile();

            expect(tile.getFlags()).toBe(TileFlags.NOFLAGS);
        });
    });

    describe("called only with a tile value", () => {

        it("should use the given tile value", () => {
            const tile = new Tile(LIGHTNINGBOLT);

            expect(tile.getValue()).toBe(LIGHTNINGBOLT);
        });

        it("should construct the tile with no flags", () => {
            const tile = new Tile(LIGHTNINGBOLT);

            expect(tile.getFlags()).toBe(TileFlags.NOFLAGS);
        });
    });

    describe("called with a tile value and flags", () => {

        it("should use the given tile value", () => {
            const tile = new Tile(FLOOD, TileFlags.ANIMBIT);

            expect(tile.getValue()).toBe(FLOOD);
        });

        it("should use the given tile flags", () => {
            const tile = new Tile(FLOOD, TileFlags.ANIMBIT);

            expect(tile.getFlags()).toBe(TileFlags.ANIMBIT);
        });
    });

    describe("when called erroneously", () => {

        it("should throw if called with a tile value lower than the minimum", () => {
            const apiAbuse = () => new Tile(TILE_INVALID - 1);

            expect(apiAbuse).toThrow();
        });

        it("should throw if called with a tile value higher than the maximum", () => {
            const apiAbuse = () => new Tile(TILE_COUNT);

            expect(apiAbuse).toThrow();
        });

        it("should throw if called with tile flags lower than the minimum", () => {
            const apiAbuse = () => new Tile(DIRT, TileFlags.BIT_START - 1);

            expect(apiAbuse).toThrow();
        });

        it("should throw if called with a tile flags higher than the maximum", () => {
            const apiAbuse = () => new Tile(DIRT, TileFlags.BIT_END + 1);

            expect(apiAbuse).toThrow();
        });
    });
});

describe("when getting the raw tile value", () => {

    it("should return the tile value ORed with the flags", () => {
        const tileValue = FLOOD;
        const tileFlags = TileFlags.BURNBIT;
        const tile = new Tile(tileValue, tileFlags);

        expect(tile.getRawValue()).toBe(tileValue | tileFlags);
    });
});
describe("when setting the value", () => {

    it("should assume the supplied value", () => {
        const tile = new Tile(LIGHTNINGBOLT);

        tile.setValue(FLOOD);

        expect(tile.getValue()).toBe(FLOOD);
    });

    it("should preserve any flags", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT);

        tile.setValue(DIRT);

        expect(tile.getFlags()).toBe(TileFlags.ANIMBIT);
    });

    it("should assume the supplied value if called with a combined value", () => {
        const newValue = LIGHTNINGBOLT;
        const tile = new Tile(DIRT, TileFlags.POWERBIT);

        tile.setValue(newValue | TileFlags.ANIMBIT);

        expect(tile.getValue()).toBe(newValue);
    });

    it("should assume the supplied flags if called with a combined value", () => {
        const newFlag = TileFlags.CONDBIT;
        const tile = new Tile(FLOOD, TileFlags.BURNBIT);

        tile.setValue(DIRT | newFlag);

        expect(tile.getFlags()).toBe(newFlag);

    });

    it("should be able to set multiple flags at once when called with a combined value", () => {
        const newFlags = TileFlags.POWERBIT | TileFlags.CONDBIT;
        const tile = new Tile(DIRT, TileFlags.BURNBIT);

        tile.setValue(LIGHTNINGBOLT | newFlags);

        expect(tile.getFlags()).toBe(newFlags);
    });

    it("should throw if called with a tile value lower than the minimum", () => {
        const tile = new Tile();

        const apiAbuse = () => tile.setValue(TILE_INVALID - 1);

        expect(apiAbuse).toThrow();
    });
});

describe("when adding flags", () => {

    it("should be a no-op when the tile already has the flags", () => {
        const duplicateFlag = TileFlags.ANIMBIT;
        const originalFlags = duplicateFlag | TileFlags.BULLBIT;
        const tile = new Tile(DIRT, originalFlags);

        tile.addFlags(duplicateFlag);

        expect(tile.getFlags()).toBe(originalFlags);
    });

    it("should be a no-op when called with nothing", () => {
        // TODO: Should we really support this - adding nothing could be a logic error?
        const originalFlags = TileFlags.CONDBIT;
        const tile = new Tile(FLOOD, originalFlags);

        tile.addFlags(TileFlags.NOFLAGS);

        expect(tile.getFlags()).toBe(originalFlags);
    });

    it("should add the flag when necessary", () => {
        const addedFlag = TileFlags.ANIMBIT;
        const tile = new Tile(LIGHTNINGBOLT);

        tile.addFlags(addedFlag);

        expect(tile.getFlags()).toBe(addedFlag);
    });

    it("should not affect any other flags the tile has", () => {
        const originalFlags = TileFlags.CONDBIT;
        const flagToAdd = TileFlags.BULLBIT;
        const tile = new Tile(DIRT, originalFlags);

        tile.addFlags(flagToAdd);

        expect(tile.getFlags()).toBe(originalFlags | flagToAdd);
    });

    it("should not affect the tile value", () => {
        const originalTileValue = FLOOD;
        const tile = new Tile(originalTileValue);

        tile.addFlags(TileFlags.BURNBIT);

        expect(tile.getValue()).toBe(originalTileValue);
    });

    it("should be able to add multiple flags at once", () => {
        const addedFlags = TileFlags.POWERBIT | TileFlags.CONDBIT;
        const tile = new Tile(DIRT);

        tile.addFlags(addedFlags);

        expect(tile.getFlags()).toBe(addedFlags);
    });

    it("should throw if called with invalid flags", () => {
        const tile = new Tile(FLOOD);

        const apiAbuse = () => tile.addFlags(TileFlags.BIT_START - 1);

        expect(apiAbuse).toThrow();
    });
});

describe("when setting flags", () => {

    it("should be a no-op when the tile already has the flags", () => {
        const originalFlags = TileFlags.ANIMBIT;
        const tile = new Tile(DIRT, originalFlags);

        tile.setFlags(originalFlags);

        expect(tile.getFlags()).toBe(originalFlags);
    });

    it("should replace the existing flags with the new flags", () => {
        const newFlag = TileFlags.ANIMBIT;
        const tile = new Tile(LIGHTNINGBOLT, TileFlags.CONDBIT | TileFlags.BULLBIT);

        tile.setFlags(newFlag);

        expect(tile.getFlags()).toBe(newFlag);
    });

    it("should clear the flags when called with nothing", () => {
        const tile = new Tile(FLOOD, TileFlags.CONDBIT);

        tile.setFlags(TileFlags.NOFLAGS);

        expect(tile.getFlags()).toBe(TileFlags.NOFLAGS);
    });

    it("should not affect the tile value", () => {
        const originalTileValue = FLOOD;
        const tile = new Tile(originalTileValue);

        tile.setFlags(TileFlags.BURNBIT);

        expect(tile.getValue()).toBe(originalTileValue);
    });

    it("should be able to set multiple flags at once", () => {
        const newFlags = TileFlags.POWERBIT | TileFlags.CONDBIT;
        const tile = new Tile(DIRT);

        tile.setFlags(newFlags);

        expect(tile.getFlags()).toBe(newFlags);
    });

    it("should throw if called with invalid flags", () => {
        const tile = new Tile(FLOOD);

        const apiAbuse = () => tile.addFlags(TileFlags.BIT_END - 1);

        expect(apiAbuse).toThrow();
    });
});

describe("when removing flags", () => {

    it("should be a no-op when the tile does not have the flags", () => {
        const tile = new Tile();
        const originalFlags = tile.getFlags();

        tile.removeFlags(TileFlags.ANIMBIT);

        expect(tile.getFlags()).toBe(originalFlags);
    });

    it("should be a no-op when called with nothing", () => {
        // TODO: Should we really support this - removing nothing could be a logic error?
        const originalFlags = TileFlags.CONDBIT;
        const tile = new Tile(DIRT, originalFlags);

        tile.removeFlags(TileFlags.NOFLAGS);

        expect(tile.getFlags()).toBe(originalFlags);
    });

    it("should remove the flag if the tile has it", () => {
        const flagToRemove = TileFlags.ANIMBIT;
        const tile = new Tile(FLOOD, flagToRemove);

        tile.removeFlags(flagToRemove);

        expect(tile.getFlags()).toBe(TileFlags.NOFLAGS);
    });

    it("should not affect any other flags the tile has", () => {
        const otherFlags = TileFlags.ANIMBIT;
        const flagToRemove = TileFlags.BURNBIT;
        const tile = new Tile(DIRT, otherFlags | flagToRemove);

        tile.removeFlags(flagToRemove);

        expect(tile.getFlags()).toBe(otherFlags);
    });

    it("should not affect the tile value", () => {
        const originalTileValue = LIGHTNINGBOLT;
        const tile = new Tile(originalTileValue, TileFlags.ANIMBIT);

        tile.removeFlags(TileFlags.ANIMBIT);

        expect(tile.getValue()).toBe(originalTileValue);
    });

    it("should be able to remove multiple flags at once", () => {
        const flagsToRemove = TileFlags.ANIMBIT | TileFlags.BULLBIT;
        const tile = new Tile(LIGHTNINGBOLT, flagsToRemove | TileFlags.CONDBIT);

        tile.removeFlags(flagsToRemove);

        expect(tile.getFlags()).toBe(TileFlags.CONDBIT);
    });

    it("should throw if called with invalid flags", () => {
        const tile = new Tile(DIRT, TileFlags.CONDBIT);

        const apiAbuse = () => tile.removeFlags(TileFlags.CONDBIT + 1);

        expect(apiAbuse).toThrow();
    });
});

describe("when setting both the tile value and flags", () => {

    it("should assume the supplied value", () => {
        const newValue = FLOOD;
        const tile = new Tile();

        tile.set(newValue, TileFlags.POWERBIT);

        expect(tile.getValue()).toBe(newValue);
    });

    it("should assume the supplied flags", () => {
        const newFlag = TileFlags.CONDBIT;
        const tile = new Tile(FLOOD, TileFlags.BURNBIT);

        tile.set(DIRT, newFlag);

        expect(tile.getFlags()).toBe(newFlag);

    });

    it("should be able to set multiple flags at once", () => {
        const newFlags = TileFlags.POWERBIT | TileFlags.CONDBIT;
        const tile = new Tile(LIGHTNINGBOLT, TileFlags.ANIMBIT);

        tile.set(FLOOD, newFlags);

        expect(tile.getFlags()).toBe(newFlags);
    });

    it("should throw if called with a tile value lower than the minimum", () => {
        const tile = new Tile();

        const apiAbuse = () => tile.set(TILE_INVALID - 1, TileFlags.NOFLAGS);

        expect(apiAbuse).toThrow();
    });

    it("should throw if called with a tile value higher than the maximum", () => {
        const tile = new Tile();

        const apiAbuse = () => tile.set(TILE_COUNT, TileFlags.NOFLAGS);

        expect(apiAbuse).toThrow();
    });

    it("should throw if called with invalid flags", () => {
        const tile = new Tile(DIRT, TileFlags.CONDBIT);

        const apiAbuse = () => tile.set(FLOOD, TileFlags.POWERBIT + 1);

        expect(apiAbuse).toThrow();
    });
});

describe("when setting from an existing tile", () => {

    it("should assume the value of the supplied tile", () => {
        const existingTile = new Tile(FLOOD);
        const destTile = new Tile();

        destTile.setFrom(existingTile);

        expect(destTile.getValue()).toBe(existingTile.getValue());
    });

    it("should assume the flags of the supplied tile", () => {
        const existingTile = new Tile(LIGHTNINGBOLT, TileFlags.BNCNBIT);
        const destTile = new Tile();

        destTile.setFrom(existingTile);

        expect(destTile.getFlags()).toBe(existingTile.getFlags());

    });
});

describe("when setting from an existing tile", () => {

    it("should assume the value of the supplied tile", () => {
        const existingTile = new Tile(FLOOD);
        const destTile = new Tile();

        destTile.setFrom(existingTile);

        expect(destTile.getValue()).toBe(existingTile.getValue());
    });

    it("should assume the flags of the supplied tile", () => {
        const existingTile = new Tile(LIGHTNINGBOLT, TileFlags.BNCNBIT);
        const destTile = new Tile();

        destTile.setFrom(existingTile);

        expect(destTile.getFlags()).toBe(existingTile.getFlags());

    });
});

describe("the isAnimated predicate", () => {

    it("should return false for a tile without flags", () => {
        const tile = new Tile();

        expect(tile.isAnimated()).toBe(false);
    });

    it("should return false for a tile with flags that don't include the animation flag", () => {
        const tile = new Tile(FLOOD, TileFlags.BULLBIT | TileFlags.BURNBIT);

        expect(tile.isAnimated()).toBe(false);
    });

    it("should return true for a tile with the flag", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT);

        expect(tile.isAnimated()).toBe(true);
    });

    it("should return true for a tile with multiple flags including animation", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT | TileFlags.BURNBIT);

        expect(tile.isAnimated()).toBe(true);
    });
});

describe("the isBulldozable predicate", () => {

    it("should return false for a tile without flags", () => {
        const tile = new Tile();

        expect(tile.isBulldozable()).toBe(false);
    });

    it("should return false for a tile with flags that don't include the bulldozable flag", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT | TileFlags.BURNBIT);

        expect(tile.isBulldozable()).toBe(false);
    });

    it("should return true for a tile with the flag", () => {
        const tile = new Tile(FLOOD, TileFlags.BULLBIT);

        expect(tile.isBulldozable()).toBe(true);
    });

    it("should return true for a tile with multiple flags including bulldozable", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT | TileFlags.BULLBIT);

        expect(tile.isBulldozable()).toBe(true);
    });
});

describe("the isConductive predicate", () => {

    it("should return false for a tile without flags", () => {
        const tile = new Tile();

        expect(tile.isConductive()).toBe(false);
    });

    it("should return false for a tile with flags that don't include the conductive flag", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT | TileFlags.BURNBIT);

        expect(tile.isConductive()).toBe(false);
    });

    it("should return true for a tile with the flag", () => {
        const tile = new Tile(FLOOD, TileFlags.CONDBIT);

        expect(tile.isConductive()).toBe(true);
    });

    it("should return true for a tile with multiple flags including conductive", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT | TileFlags.CONDBIT);

        expect(tile.isConductive()).toBe(true);
    });
});

describe("the isCombustible predicate", () => {

    it("should return false for a tile without flags", () => {
        const tile = new Tile();

        expect(tile.isCombustible()).toBe(false);
    });

    it("should return false for a tile with flags that don't include the combustible flag", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT | TileFlags.BULLBIT);

        expect(tile.isCombustible()).toBe(false);
    });

    it("should return true for a tile with the flag", () => {
        const tile = new Tile(FLOOD, TileFlags.BURNBIT);

        expect(tile.isCombustible()).toBe(true);
    });

    it("should return true for a tile with multiple flags including combustible", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT | TileFlags.BURNBIT);

        expect(tile.isCombustible()).toBe(true);
    });
});

describe("the isPowered predicate", () => {

    it("should return false for a tile without flags", () => {
        const tile = new Tile();

        expect(tile.isPowered()).toBe(false);
    });

    it("should return false for a tile with flags that don't include the powered flag", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT | TileFlags.BULLBIT);

        expect(tile.isPowered()).toBe(false);
    });

    it("should return true for a tile with the flag", () => {
        const tile = new Tile(FLOOD, TileFlags.POWERBIT);

        expect(tile.isPowered()).toBe(true);
    });

    it("should return true for a tile with multiple flags including powered", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT | TileFlags.POWERBIT);

        expect(tile.isPowered()).toBe(true);
    });
});

describe("the isZone predicate", () => {

    it("should return false for a tile without flags", () => {
        const tile = new Tile();

        expect(tile.isZone()).toBe(false);
    });

    it("should return false for a tile with flags that don't include the zone flag", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT | TileFlags.BULLBIT);

        expect(tile.isZone()).toBe(false);
    });

    it("should return true for a tile with the flag", () => {
        const tile = new Tile(FLOOD, TileFlags.ZONEBIT);

        expect(tile.isZone()).toBe(true);
    });

    it("should return true for a tile with multiple flags including zone", () => {
        const tile = new Tile(FLOOD, TileFlags.ANIMBIT | TileFlags.ZONEBIT);

        expect(tile.isZone()).toBe(true);
    });
});
