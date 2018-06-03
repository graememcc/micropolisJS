import { BlockMap } from "../src/blockMap";

function threeByThreeBlockMap(): BlockMap {
    return new BlockMap(12, 12, 4);
}

describe("when constructing", () => {

    it("should correctly compute the width in blocks", () => {
        const blockWidth = 4;
        const blockCount = 2;

        const blockMap = new BlockMap(blockWidth * blockCount, 0, blockWidth);

        expect(blockMap.width).toBe(blockCount);
    });

    it("should correctly compute the width when the map width is not an exact number of blocks", () => {
        const blockWidth = 4;

        const blockMap = new BlockMap(blockWidth - 1, 0, blockWidth);

        expect(blockMap.width).toBe(1);
    });

    it("should correctly compute the height in blocks", () => {
        const blockHeight = 4;
        const blockCount = 2;

        const blockMap = new BlockMap(0, blockHeight * blockCount, blockHeight);

        expect(blockMap.height).toBe(blockCount);
    });

    it("should correctly compute the height when the map width is not an exact number of blocks", () => {
        const blockHeight = 4;

        const blockMap = new BlockMap(0, blockHeight - 1, blockHeight);

        expect(blockMap.height).toBe(1);
    });

    it("should initially be zeroed", () => {
        const blockX = 1;
        const blockY = 1;
        const blockMap = threeByThreeBlockMap();

        expect(blockMap.get(blockX, blockY)).toBe(0);
    });
});

describe("when getting and setting values", () => {

    it("should be able to get a value that is set", () => {
        const blockX = 1;
        const blockY = 1;
        const value = 123;
        const blockMap = threeByThreeBlockMap();

        blockMap.set(blockX, blockY, value);

        expect(blockMap.get(blockX, blockY)).toBe(value);
    });

    it("should be able to set by world coordinates", () => {
        const worldXInBlock1 = 5;
        const worldYInBlock0 = 1;
        const value = 234;
        const blockMap = threeByThreeBlockMap();

        blockMap.worldSet(worldXInBlock1, worldYInBlock0, value);

        expect(blockMap.get(1, 0)).toBe(value);
    });

    it("should be able to get by world coordinates", () => {
        const worldXInBlock0 = 2;
        const worldYInBlock1 = 6;
        const value = 234;
        const blockMap = threeByThreeBlockMap();

        blockMap.set(0, 1, value);

        expect(blockMap.worldGet(worldXInBlock0, worldYInBlock1)).toBe(value);
    });
});

describe("when copying from one block map to another", () => {

    it("should warn if copying from a map with a greater width", () => {
        console.warn = jest.fn();
        const dest = threeByThreeBlockMap();
        const source = new BlockMap(4, 3, 4);

        dest.copyFrom(source);

        expect(console.warn).toHaveBeenCalled();
    });

    it("should warn if copying from a map with a smaller width", () => {
        console.warn = jest.fn();
        const dest = threeByThreeBlockMap();
        const source = new BlockMap(2, 3, 4);

        dest.copyFrom(source);

        expect(console.warn).toHaveBeenCalled();
    });

    it("should warn if copying from a map with a smaller height", () => {
        console.warn = jest.fn();
        const dest = threeByThreeBlockMap();
        const source = new BlockMap(3, 2, 4);

        dest.copyFrom(source);

        expect(console.warn).toHaveBeenCalled();
    });

    it("should warn if copying from a map with a greater block size", () => {
        console.warn = jest.fn();
        const dest = threeByThreeBlockMap();
        const source = new BlockMap(3, 3, 5);

        dest.copyFrom(source);

        expect(console.warn).toHaveBeenCalled();
    });

    it("should warn if copying from a map with a smaller block size", () => {
        console.warn = jest.fn();
        const dest = threeByThreeBlockMap();
        const source = new BlockMap(3, 3, 2);

        dest.copyFrom(source);

        expect(console.warn).toHaveBeenCalled();
    });

    it("should not warn if map dimensions are compatible", () => {
        console.warn = jest.fn();
        const dest = threeByThreeBlockMap();
        const source = threeByThreeBlockMap();

        dest.copyFrom(source);

        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should copy the maps correctly", () => {
        const x = 2;
        const y = 1;
        const value = 456;
        const source = threeByThreeBlockMap();
        source.set(x, y, value);

        const dest = threeByThreeBlockMap();
        dest.copyFrom(source);

        expect(dest.get(x, y)).toBe(value);
    });

    it("should transform values correctly", () => {
        const transformed = (n: number) => n * 2;
        const x = 1;
        const y = 2;
        const value = 789;
        const source = threeByThreeBlockMap();
        source.set(x, y, value);

        const dest = threeByThreeBlockMap();
        dest.copyFrom(source, transformed);

        expect(dest.get(x, y)).toBe(transformed(value));
    });
});
