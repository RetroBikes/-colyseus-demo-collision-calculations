import { Client } from 'colyseus';
import { Schema, type, MapSchema } from '@colyseus/schema';
import Coordinate from './Coordinate';
import GenericObject from '../interfaces/GenericObject';
import PlayerInitialState from '../interfaces/PlayerInitialState';

export default class Player extends Schema {

    @type(Coordinate)
    public currentPosition: Coordinate;

    @type('string')
    public direction = 'right';

    @type('boolean')
    public isAlive = true;

    private clientObject: Client;

    private canChangeDirection = true;

    private oppositeDirections: GenericObject<string> = {
        up: 'down',
        right: 'left',
        down: 'up',
        left: 'right',
    };

    public constructor(client: Client, initialState: PlayerInitialState) {
        super();
        this.clientObject = client;
        this.direction = initialState.initialDirection;
        this.currentPosition = initialState.startPosition;
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

    public getClientObject(): Client {
        return this.clientObject;
    }

    public static loopMap(players: MapSchema<Player>, callback: Function): void {
        for (let playerId of Object.keys(players)) {
            callback(players[playerId], playerId);
        }
    }

    private updateCurrentPosition(newPlayerPosition: Coordinate): void {
        this.currentPosition = newPlayerPosition;
    }

}
