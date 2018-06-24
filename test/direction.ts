import * as Direction from "../src/direction";
import { Random } from "../src/random";

jest.mock("../src/random");

function allDirections() {
    return [
        Direction.NORTH,
        Direction.NORTHEAST,
        Direction.EAST,
        Direction.SOUTHEAST,
        Direction.SOUTH,
        Direction.SOUTHWEST,
        Direction.WEST,
        Direction.NORTHWEST,
    ];
}

function allUnique<T>(values: T[]): boolean {
    return values.every((value, index) => {
        return values.indexOf(value) === index && values.lastIndexOf(value) === index;
    });
}

describe("the Direction module", () => {

    describe("the constant values", () => {

        it("each direction constant should be unique", () => {
            const allDirs = allDirections();

            expect(allUnique(allDirs)).toBe(true);
        });

        it("each direction constant should be immutable", () => {
            const prop = "foo";

            try {
                (Direction.NORTH as any)[prop] = 1;
            // tslint:disable-next-line:no-empty variable-name
            } catch (_expectedError) {}

            expect((Direction.NORTH as any)[prop]).toBeUndefined();
        });

        describe("when rotating clockwise", () => {

            it("should return NORTHEAST for NORTH", () => {
                expect(Direction.NORTH.rotateClockwise()).toBe(Direction.NORTHEAST);
            });

            it("should return EAST for NORTHEAST", () => {
                expect(Direction.NORTHEAST.rotateClockwise()).toBe(Direction.EAST);
            });

            it("should return SOUTHEAST for EAST", () => {
                expect(Direction.EAST.rotateClockwise()).toBe(Direction.SOUTHEAST);
            });

            it("should return SOUTH for SOUTHEAST", () => {
                expect(Direction.SOUTHEAST.rotateClockwise()).toBe(Direction.SOUTH);
            });

            it("should return SOUTHWEST for SOUTH", () => {
                expect(Direction.SOUTH.rotateClockwise()).toBe(Direction.SOUTHWEST);
            });

            it("should return WEST for SOUTHWEST", () => {
                expect(Direction.SOUTHWEST.rotateClockwise()).toBe(Direction.WEST);
            });

            it("should return NORTHWEST for WEST", () => {
                expect(Direction.WEST.rotateClockwise()).toBe(Direction.NORTHWEST);
            });

            it("should return NORTH for NORTHWEST", () => {
                expect(Direction.NORTHWEST.rotateClockwise()).toBe(Direction.NORTH);
            });
        });

        describe("when rotating counter-clockwise", () => {

            it("should return NORTHWEST for NORTH", () => {
                expect(Direction.NORTH.rotateCounterClockwise()).toBe(Direction.NORTHWEST);
            });

            it("should return NORTH for NORTHEAST", () => {
                expect(Direction.NORTHEAST.rotateCounterClockwise()).toBe(Direction.NORTH);
            });

            it("should return NORTHEAST for EAST", () => {
                expect(Direction.EAST.rotateCounterClockwise()).toBe(Direction.NORTHEAST);
            });

            it("should return EAST for SOUTHEAST", () => {
                expect(Direction.SOUTHEAST.rotateCounterClockwise()).toBe(Direction.EAST);
            });

            it("should return SOUTHEAST for SOUTH", () => {
                expect(Direction.SOUTH.rotateCounterClockwise()).toBe(Direction.SOUTHEAST);
            });

            it("should return SOUTH for SOUTHWEST", () => {
                expect(Direction.SOUTHWEST.rotateCounterClockwise()).toBe(Direction.SOUTH);
            });

            it("should return SOUTHWEST for WEST", () => {
                expect(Direction.WEST.rotateCounterClockwise()).toBe(Direction.SOUTHWEST);
            });

            it("should return WEST for NORTHWEST", () => {
                expect(Direction.NORTHWEST.rotateCounterClockwise()).toBe(Direction.WEST);
            });
        });

        describe("when flipping to the opposite direction", () => {

            it("should return SOUTH for NORTH", () => {
                expect(Direction.NORTH.oppositeDirection()).toBe(Direction.SOUTH);
            });

            it("should return SOUTHWEST for NORTHEAST", () => {
                expect(Direction.NORTHEAST.oppositeDirection()).toBe(Direction.SOUTHWEST);
            });

            it("should return WEST for EAST", () => {
                expect(Direction.EAST.oppositeDirection()).toBe(Direction.WEST);
            });

            it("should return NORTHWEST for SOUTHEAST", () => {
                expect(Direction.SOUTHEAST.oppositeDirection()).toBe(Direction.NORTHWEST);
            });

            it("should return NORTH for SOUTH", () => {
                expect(Direction.SOUTH.oppositeDirection()).toBe(Direction.NORTH);
            });

            it("should return NORTHEAST for SOUTHWEST", () => {
                expect(Direction.SOUTHWEST.oppositeDirection()).toBe(Direction.NORTHEAST);
            });

            it("should return EAST for WEST", () => {
                expect(Direction.WEST.oppositeDirection()).toBe(Direction.EAST);
            });

            it("should return SOUTHEAST for NORTHWEST", () => {
                expect(Direction.NORTHWEST.oppositeDirection()).toBe(Direction.SOUTHEAST);
            });
        });

        describe("when converting to a string", () => {

            it("each direction should have a unique string representation", () => {
                const stringRepresentations = allDirections().map((dir) => dir.toString());

                expect(allUnique(stringRepresentations)).toBe(true);
            });
        });
    });

    describe("the static methods", () => {

        describe("when iterating over each cardinal direction", () => {

            it("should be called as many times as there are cardinal directions", () => {
                const iterator = jest.fn();

                Direction.forEachCardinalDirection(iterator);

                expect(iterator).toHaveBeenCalledTimes(4);
            });

            it("should be called in clockwise order from north", () => {
                const iterator = jest.fn();

                Direction.forEachCardinalDirection(iterator);

                expect(iterator).toHaveBeenNthCalledWith(1, Direction.NORTH);
                expect(iterator).toHaveBeenNthCalledWith(2, Direction.EAST);
                expect(iterator).toHaveBeenNthCalledWith(3, Direction.SOUTH);
                expect(iterator).toHaveBeenNthCalledWith(4, Direction.WEST);
            });
        });

        describe("when getting a random direction", () => {

            it("should return a different direction when the random number generator returns a different value", () => {
                let i = 0;
                const randomValues = [3, 7, 1, 5, 0, 4, 6, 2];
                (Random.getRandom as jest.Mock).mockImplementation(() => randomValues[i++]);

                // tslint:disable-next-line:variable-name
                const directions = randomValues.map((_unused_) => Direction.getRandomDirection());

                expect(allUnique(directions)).toBe(true);
            });
        });

        describe("when getting a random cardinal direction", () => {

            it("should return a different direction when the random number generator returns a different value", () => {
                let i = 0;
                const randomValues = [3, 1, 2, 0];
                (Random.getRandom as jest.Mock).mockImplementation(() => randomValues[i++]);

                // tslint:disable-next-line:variable-name
                const directions = randomValues.map((_unused_) => Direction.getRandomCardinalDirection());

                expect(allUnique(directions)).toBe(true);
            });
        });
    });
});
