import { Random } from "../src/random";

function makeMathGlobal() {
    const math = {floor: jest.fn(), random: jest.fn()};
    math.floor.mockImplementationOnce((n) => Math.floor(n));
    return math;
}

function zeroFilledArrayOfInclusiveLength(n: number): number[] {
    const array = [];
    const limit = n + 1;

    for (let i = 0; i < limit; i++) {
        array[i] = 0;
    }

    return array;
}

function differenceToPreviousNeighbour(i: number, array: number[]): number {
    const value = array[i];
    const neighbour = Math.max(i - 1, 0);
    return Math.abs(value - array[neighbour]);
}

function differenceToNextNeighbour(i: number, array: number[]): number {
    const value = array[i];
    const neighbour = Math.min(i + 1, array.length - 1);
    return Math.abs(value - array[neighbour]);
}

test("getRandom should be able to return 0", () => {
    const mathGlobal = makeMathGlobal();
    mathGlobal.random.mockReturnValueOnce(0);

    const result = Random.getRandom(1, mathGlobal);

    expect(result).toBe(0);
});

test("getRandom should be able to return the maximum", () => {
    const mathGlobal = makeMathGlobal();
    mathGlobal.random.mockReturnValueOnce(0.9999999999);

    const result = Random.getRandom(5, mathGlobal);

    expect(result).toBe(5);
});

test("getRandom should not exhibit significant bias", () => {
    const range = 1000;
    const buckets = zeroFilledArrayOfInclusiveLength(range);
    const mathGlobal = makeMathGlobal();

    for (let i = 0; i < 1; i += 0.001) {
        buckets[Random.getRandom(range, mathGlobal)] += 1;
    }

    buckets.forEach((n) => {
        expect(differenceToPreviousNeighbour(n, buckets)).toBeLessThan(2);
        expect(differenceToNextNeighbour(n, buckets)).toBeLessThan(2);
    });
});

test("getRandom should not return values outside of the range", () => {
    const range = 1000;
    const buckets = zeroFilledArrayOfInclusiveLength(range);
    const mathGlobal = makeMathGlobal();

    for (let i = 0; i < 1; i += 0.001) {
        buckets[Random.getRandom(range, mathGlobal)] += 1;
    }

    expect(buckets.length).toBe(range + 1);
});

test("getRandom16 should limit itself to 16-bit values", () => {
    const rng = jest.fn();

    Random.getRandom16(rng);

    expect(rng).toHaveBeenCalledWith(2 ** 16 - 1);
});

test("getRandom16Signed should return positive values below 2^15", () => {
    const valueBelowThreshold = 32767;

    const rng = jest.fn().mockReturnValueOnce(valueBelowThreshold);

    expect(Random.getRandom16Signed(rng)).toBe(valueBelowThreshold);
});

test("getRandom16Signed should return negative values in the interval [-(2^15)..-1]", () => {
    const threshold = 32768;
    const limit = 2 ** 16 - 1;
    const rng = jest.fn().mockReturnValueOnce(threshold).mockReturnValueOnce(limit);

    expect(Random.getRandom16Signed(rng)).toBeLessThan(0);
    expect(Random.getRandom16Signed(rng)).toBeLessThan(0);
});

test("getERandom should respect the given maximum", () => {
    const threshold = 1000;
    const rng = jest.fn().mockReturnValue(1);

    Random.getERandom(threshold, rng);

    expect(rng).toHaveBeenCalledWith(threshold);
});

test("getERandom should exhibit a bias towards smaller numbers", () => {
    const threshold = 1000;
    const lower = 1;
    const upper = 2;
    const rng = jest.fn().mockReturnValueOnce(lower).mockReturnValueOnce(upper);

    expect(Random.getERandom(threshold, rng)).toBe(lower);
});

test("getChance should return false if the least significant bits match exactly", () => {
    const chanceValue = 0b101;
    const rng = jest.fn().mockReturnValueOnce(0b1101);

    expect(Random.getChance(chanceValue, rng)).toBe(false);
});

test("getChance should return false if some of the least significant bits match", () => {
    const chanceValue = 0b11;
    const rng = jest.fn().mockReturnValueOnce(0b1101);

    expect(Random.getChance(chanceValue, rng)).toBe(false);
});

test("getChance should return true if none of the least significant bits match", () => {
    const chanceValue = 0b101;
    const rng = jest.fn().mockReturnValueOnce(0b1010);

    expect(Random.getChance(chanceValue, rng)).toBe(true);
});
