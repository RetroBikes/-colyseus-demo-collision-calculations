import { Schema, type, MapSchema } from "@colyseus/schema";
import { Coordinate } from './Coordinate';
import GenericObject from '../interfaces/GenericObject';

export class Player extends Schema {

    @type(Coordinate)
    public currentPlayerPosition: Coordinate = new Coordinate(0, 0);

    @type('string')
    public direction = 'right';

    private canChangeDirection = true;

    private oppositeDirections: GenericObject<string> = {
        up: 'down',
        right: 'left',
        down: 'up',
        left: 'right',
    };

    public constructor(startPositionX: number, startPositionY: number, initialDirection = 'right') {
        super();
        this.addPlayerPart(
            startPositionX,
            startPositionY,
        );
        this.direction = initialDirection;
    }

    public addPlayerPart(x: number, y: number): void {
        const newPlayerPart = new Coordinate(x, y);
        this.currentPlayerPosition = newPlayerPart;
    }

    public changeDirection(direction: string): void {
        if (! this.canChangeDirection ||
            this.direction === this.oppositeDirections[direction]) {
            return;
        }
        this.direction = direction;
        this.denyChangeDirection();
    }

    public move(): void {
        const currentPlayerPart = this.currentPlayerPosition;
        switch(this.direction) {
            case 'up':
                currentPlayerPart.y -= 1;
                break;
            case 'down':
                currentPlayerPart.y += 1;
                break;
            case 'left':
                currentPlayerPart.x -= 1;
                break;
            case 'right':
                currentPlayerPart.x += 1;
                break;
        }
        this.addPlayerPart(currentPlayerPart.x, currentPlayerPart.y);
    }

    public allowChangeDirection(): void {
        this.canChangeDirection = true;
    }

    public denyChangeDirection(): void {
        this.canChangeDirection = false;
    }

}
