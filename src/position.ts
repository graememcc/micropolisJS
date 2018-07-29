export class Position {

    static origin(): Position {
        return new Position(0, 0);
    }

    constructor(readonly x: number, readonly y: number) {}

    toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}
