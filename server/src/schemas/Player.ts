import { Client } from 'colyseus';
import { MapSchema, Schema, type } from '@colyseus/schema';
import Coordinate from './Coordinate';
import GenericObject from '../interfaces/GenericObject';
import PlayerInitialState from '../interfaces/PlayerInitialState';

/**
 * All the data the player needs to exists on the game, like current position, direction and goes on.
 * This extends the Schema Colyseus class to be passed to client side.
 */
export default class Player extends Schema {

    /**
     * Current player x / y position.
     * Flagged to be passed to client side.
     * @type string
     */
    @type(Coordinate)
    public currentPosition: Coordinate;

    /**
     * Player direction, basicly defines the next player position on move method.
     * Flagged to be passed to client side.
     * @type Coordinate
     */
    @type('string')
    public direction = 'right';

    /**
     * Defines if the player char is alive. Heavily used on the game step (GameRoom and Arena
     * classes) to define if the player need to be removed of the game area or the game is finished.
     * @type boolean
     */
    public isAlive = true;

    /**
     * Player client object. Used to send message on player win or defeat.
     * @type Client
     */
    private clientObject: Client;

    /**
     * Define if the player can change their direction.
     * Basicly, the player can't do two moves per game loop iteration
     * to guarantee he/she can't move to the own way and lose.
     * @type boolean
     */
    private canChangeDirection = true;

    /**
     * Opposite directions object, used to deny the player change their
     * direction to the opposite direction, losing in the process.
     * @type GenericObject<string>
     */
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

    public refreshCurrentPosition(): void {
        this.currentPosition = new Coordinate(
            this.currentPosition.x,
            this.currentPosition.y,
        );
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
        for (let playerId in players) {
            callback(players[playerId], playerId);
        }
    }

    private updateCurrentPosition(newPlayerPosition: Coordinate): void {
        this.currentPosition = newPlayerPosition;
    }

}
