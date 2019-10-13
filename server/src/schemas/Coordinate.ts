import { Schema, type } from '@colyseus/schema';

export class Coordinate extends Schema {

    @type('number')
    public x: number;

    @type('number')
    public y: number;

    public constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }

    public toString(): string {
        return `${this.x}-${this.y}`;
    }

}
