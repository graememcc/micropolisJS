import * as Direction from "../src/direction";
import { Position } from "../src/position";

describe("the Position class", () => {

    describe("when constructing an origin position", () => {

        it("should construct a position with the correct coordinates", () => {
            const {x: originX, y: originY} = Position.origin();

            expect(originX).toBe(0);
            expect(originY).toBe(0);
        });
    });

    describe("when moving", () => {

        it("should apply the correct transformation when moving north", () => {
            const originalPos = new Position(2, 2);

            const movedPos = Position.move(originalPos, Direction.NORTH);

            expect(movedPos.x).toBe(originalPos.x);
            expect(movedPos.y).toBe(originalPos.y - 1);
        });

        it("should apply the correct transformation when moving northeast", () => {
            const originalPos = new Position(3, 4);

            const movedPos = Position.move(originalPos, Direction.NORTHEAST);

            expect(movedPos.x).toBe(originalPos.x + 1);
            expect(movedPos.y).toBe(originalPos.y - 1);
        });

        it("should apply the correct transformation when moving east", () => {
            const originalPos = new Position(1, 2);

            const movedPos = Position.move(originalPos, Direction.EAST);

            expect(movedPos.x).toBe(originalPos.x + 1);
            expect(movedPos.y).toBe(originalPos.y);
        });

        it("should apply the correct transformation when moving southeast", () => {
            const originalPos = new Position(5, 11);

            const movedPos = Position.move(originalPos, Direction.SOUTHEAST);

            expect(movedPos.x).toBe(originalPos.x + 1);
            expect(movedPos.y).toBe(originalPos.y + 1);
        });

        it("should apply the correct transformation when moving south", () => {
            const originalPos = new Position(4, 2);

            const movedPos = Position.move(originalPos, Direction.SOUTH);

            expect(movedPos.x).toBe(originalPos.x);
            expect(movedPos.y).toBe(originalPos.y + 1);
        });

        it("should apply the correct transformation when moving southwest", () => {
            const originalPos = new Position(7, 3);

            const movedPos = Position.move(originalPos, Direction.SOUTHWEST);

            expect(movedPos.x).toBe(originalPos.x - 1);
            expect(movedPos.y).toBe(originalPos.y + 1);
        });

        it("should apply the correct transformation when moving west", () => {
            const originalPos = new Position(4, 6);

            const movedPos = Position.move(originalPos, Direction.WEST);

            expect(movedPos.x).toBe(originalPos.x - 1);
            expect(movedPos.y).toBe(originalPos.y);
        });

        it("should apply the correct transformation when moving northwest", () => {
            const originalPos = new Position(8, 4);

            const movedPos = Position.move(originalPos, Direction.NORTHWEST);

            expect(movedPos.x).toBe(originalPos.x - 1);
            expect(movedPos.y).toBe(originalPos.y - 1);
        });

        it("should throw an error for an unexpected direction", () => {
            const position = new Position(31, 11);

            const apiAbuse = () => Position.move(position, undefined as any);

            expect(apiAbuse).toThrow();
        });
    });

    describe("the toString method", () => {

        it("should produce a human-readable string", () => {
            const x = 12;
            const y = 30;

            const pos = new Position(x, y);

            expect(pos.toString()).toMatch(new RegExp(`(${x}, ${y})`));
        });
    });
});
