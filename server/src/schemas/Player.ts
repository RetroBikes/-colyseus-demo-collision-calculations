import { Schema, type } from '@colyseus/schema';
import { Coordinate } from './Coordinate';
import GenericObject from '../interfaces/GenericObject';

export class Player extends Schema {

    @type(Coordinate)
    public currentPosition: Coordinate;

    @type('string')
    public direction = 'right';

    @type('boolean')
    public isAlive = true;

    private canChangeDirection = true;

    private oppositeDirections: GenericObject<string> = {
        up: 'down',
        right: 'left',
        down: 'up',
        left: 'right',
    };

    public constructor(startPosition: Coordinate, initialDirection = 'right') {
        super();
        this.direction = initialDirection;
        this.currentPosition = startPosition
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
        const newPosition = this.currentPosition;
        switch(this.direction) {
            case 'up':
                newPosition.y -= 1;
                break;
            case 'down':
                newPosition.y += 1;
                break;
            case 'left':
                newPosition.x -= 1;
                break;
            case 'right':
                newPosition.x += 1;
                break;
        }
        this.updateCurrentPosition(newPosition);
    }

    public allowChangeDirection(): void {
        this.canChangeDirection = true;
    }

    public denyChangeDirection(): void {
        this.canChangeDirection = false;
    }

    public kill(): void {
        this.isAlive = false;
    }

    private updateCurrentPosition(newPlayerPosition: Coordinate): void {
        this.currentPosition = newPlayerPosition;
    }

}
