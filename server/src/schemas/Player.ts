import { Schema, type, MapSchema } from "@colyseus/schema";
import { Coordinate } from './Coordinate';

export class Player extends Schema {
    @type(Coordinate)
    public currentPlayerPosition: Coordinate = new Coordinate(0, 0);

    @type('string')
    public direction = 'right';

    private playerParts = new MapSchema<Coordinate>();

    private playerSize = 0;

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
        this.playerParts[this.playerSize] = newPlayerPart;
        this.currentPlayerPosition = newPlayerPart;
        this.playerSize++;
    }

    public changeDirection(direction: string): void {
        this.direction = direction;
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
}
