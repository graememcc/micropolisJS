import { Position } from "../src/position";

describe("the Position class", () => {

    describe("when constructing an origin position", () => {

        it("should construct a position with the correct coordinates", () => {
            const {x: originX, y: originY} = Position.origin();

            expect(originX).toBe(0);
            expect(originY).toBe(0);
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
