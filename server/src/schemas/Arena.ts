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
        this.moveAllPlayers();
        this.calculateCollisions();
        this.flushGameStep();
        // return this.getGameStatus();
    }

    private moveAllPlayers(): void {
        this.loopAllPlayers((playerId: string) => {
            const currentPlayerPosition: Coordinate = this.players[playerId].currentPosition;
            this.players[playerId].move();
            this.grid.addSpaceCandidateToOccupy(currentPlayerPosition, playerId);
        });
    }

    private calculateCollisions(): void {
        this.loopAllPlayers((playerId: string) => {
            const currentPlayerPosition: Coordinate = this.players[playerId].currentPosition;
            if (this.grid.isSpaceOccupied(currentPlayerPosition, playerId)) {
                this.players[playerId].kill();
            }
        });
    }

    private flushGameStep(): void {
        this.loopAllPlayers((playerId: string) => {
            const currentPlayerPosition: Coordinate = this.players[playerId].currentPosition;
            this.grid.occupySpace(currentPlayerPosition);
            this.players[playerId].allowChangeDirection();
        });
    }

    private loopAllPlayers(callback: Function): void {
        for (let playerId of Object.keys(this.players)) {
            callback(playerId);
        }
    }

}
