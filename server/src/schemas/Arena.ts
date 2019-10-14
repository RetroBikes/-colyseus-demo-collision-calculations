import { Schema, type, MapSchema } from '@colyseus/schema';
import { Coordinate } from './Coordinate';
import { Player } from './Player';
import { TheGrid } from '../bo/TheGrid';

export class Arena extends Schema {

    @type({ map: Player })
    public players = new MapSchema<Player>();

    @type('number')
    public areaVirtualSize = 150;

    private grid: TheGrid;

    public constructor() {
        super();
        this.grid = new TheGrid(this.areaVirtualSize);
    }

    public createPlayer(playerId: string, isPlayerOne: boolean): void {
        const startCoordinate = isPlayerOne ?
            new Coordinate(10, 10) :
            new Coordinate(this.areaVirtualSize - 10, this.areaVirtualSize - 10);
        this.players[playerId] = new Player(startCoordinate, isPlayerOne ? 'right' : 'left');
        this.grid.occupySpace(startCoordinate);
    }

    public changePlayerDirection(playerId: string, direction: string): void {
        this.players[playerId].changeDirection(direction);
    }

    public removePlayer(playerId: string): void {
        delete this.players[playerId];
    }

    public makeGameStep(): void {
        const allPlayerIds = this.getAllPlayerIds();

        // Move all players.
        for (let playerId of allPlayerIds) {
            this.players[playerId].move();
        }

        // Calculate collisions to all players.
        for (let playerId of allPlayerIds) {
            const currentPlayerPart: Coordinate = this.players[playerId].currentPosition;
            if (this.grid.isSpaceOccupied(currentPlayerPart)) {
                this.players[playerId].kill();
            }
            this.grid.occupySpace(currentPlayerPart);
        }

        // Allow all players to change directions.
        for (let playerId of allPlayerIds) {
            this.players[playerId].allowChangeDirection();
        }
    }

    private getAllPlayerIds(): Array<string> {
        return Object.keys(this.players);
    }

}
