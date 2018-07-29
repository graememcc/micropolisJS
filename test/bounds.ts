import { Bounds } from "../src/bounds";
import { assert } from "../src/debugAssert";
import { Position } from "../src/position";

const STARTX = 5;
const STARTY = 7;
const WIDTH = 12;
const HEIGHT = 9;

jest.mock("../src/debugAssert");

describe("the Bounds class", () => {

    describe("when constructing", () => {

        beforeEach(() => {
            jest.mock("../src/debugAssert");
        });

        it("should assert if constructed with a zero width", () => {
            // tslint:disable-next-line:no-unused-expression
            new Bounds(STARTX, STARTY, 0, HEIGHT);

            expect(assert).toHaveBeenCalled();
        });

        it("should assert if constructed with a zero height", () => {
            // tslint:disable-next-line:no-unused-expression
            new Bounds(STARTX, STARTY, WIDTH, 0);

            expect(assert).toHaveBeenCalled();
        });
    });

    describe("when testing a position", () => {

        let bounds: Bounds;

        beforeEach(() => {
            bounds = new Bounds(STARTX, STARTY, WIDTH, HEIGHT);
        });

        it("should regard interior points as contained in the bounds", () => {
            const interiorPoint = new Position(STARTX + 1, STARTY + 1);

            expect(bounds.contains(interiorPoint)).toBe(true);
        });

        it("should regard the top-left corner as contained in the bounds", () => {
            const topLeftPoint = new Position(STARTX, STARTY);

            expect(bounds.contains(topLeftPoint)).toBe(true);
        });

        it("should regard the top-right corner as contained in the bounds", () => {
            const topRightPoint = new Position(STARTX + WIDTH - 1, STARTY);

            expect(bounds.contains(topRightPoint)).toBe(true);
        });

        it("should regard the bottom-right corner as contained in the bounds", () => {
            const bottomRightPoint = new Position(STARTX + WIDTH - 1, STARTY + HEIGHT - 1);

            expect(bounds.contains(bottomRightPoint)).toBe(true);
        });

        it("should regard the bottom-left corner as contained in the bounds", () => {
            const bottomLeftPoint = new Position(STARTX, STARTY + HEIGHT - 1);

            expect(bounds.contains(bottomLeftPoint)).toBe(true);
        });

        it("should regard points on the top edge as contained in the bounds", () => {
            const upperPoint = new Position(STARTX + 2, STARTY);

            expect(bounds.contains(upperPoint)).toBe(true);
        });

        it("should regard points on the right edge as contained in the bounds", () => {
            const rightPoint = new Position(STARTX + WIDTH - 1, STARTY + 3);

            expect(bounds.contains(rightPoint)).toBe(true);
        });

        it("should regard points on the bottom edge as contained in the bounds", () => {
            const bottomPoint = new Position(STARTX + 2, STARTY + HEIGHT - 1);

            expect(bounds.contains(bottomPoint)).toBe(true);
        });

        it("should regard points on the left edge as contained in the bounds", () => {
            const leftPoint = new Position(STARTX, STARTY + 4);

            expect(bounds.contains(leftPoint)).toBe(true);
        });

        it("should regard exterior points as not contained in the bounds", () => {
            const exteriorPoint = new Position(STARTX + WIDTH + 3, STARTY + HEIGHT + 7);

            expect(bounds.contains(exteriorPoint)).toBe(false);
        });

        it("should regard exterior points adjacent to the top edge as not contained in the bounds", () => {
            const exteriorUpperPoint = new Position(STARTX + 2, STARTY - 1);

            expect(bounds.contains(exteriorUpperPoint)).toBe(false);
        });

        it("should regard exterior points adjacent to the right edge as not contained in the bounds", () => {
            const exteriorRightPoint = new Position(STARTX + WIDTH, STARTY + 3);

            expect(bounds.contains(exteriorRightPoint)).toBe(false);
        });

        it("should regard exterior points adjacent to the bottom edge as not contained in the bounds", () => {
            const exteriorBottomPoint = new Position(STARTX + 2, STARTY + HEIGHT);

            expect(bounds.contains(exteriorBottomPoint)).toBe(false);
        });

        it("should regard exterior points adjacent to the left edge as not contained in the bounds", () => {
            const exteriorLeftPoint = new Position(STARTX - 1, STARTY + 4);

            expect(bounds.contains(exteriorLeftPoint)).toBe(false);
        });
    });

    describe("when constructing a bounds starting at the origin", () => {

        it("should regard the origin as being in bounds", () => {
            const bounds = Bounds.fromOrigin(WIDTH, HEIGHT);
            const origin = Position.origin();

            expect(bounds.contains(origin)).toBe(true);
        });

        it("should regard the bottom-left corner as being in the bounds", () => {
            const bounds = Bounds.fromOrigin(WIDTH, HEIGHT);
            const bottomRightCorner = new Position(WIDTH - 1, HEIGHT - 1);

            expect(bounds.contains(bottomRightCorner)).toBe(true);
        });
    });

    describe("the toString method", () => {

        it("should produce a string that reflects the limits of the bounds", () => {
            const bounds = Bounds.fromOrigin(WIDTH, HEIGHT);
            const topLeftString = Position.origin().toString();
            const bottomRightString = (new Position(WIDTH - 1, HEIGHT - 1)).toString();

            const boundsString = bounds.toString();

            expect(boundsString).toMatch(new RegExp(topLeftString));
            expect(boundsString).toMatch(new RegExp(bottomRightString));
        });
    });
});
