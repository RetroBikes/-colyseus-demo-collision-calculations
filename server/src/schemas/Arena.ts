import { Schema, type, MapSchema } from "@colyseus/schema";
import { Coordinate } from './Coordinate';
import { Player } from './Player';
import { TheGrid } from './TheGrid';

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
    }

    public changePlayerDirection(playerId: string, direction: string): void {
        this.players[playerId].changeDirection(direction);
    }

    public removePlayer(playerId: string): void {
        delete this.players[playerId];
    }

    public makeGameStep(): void {
        for (let playerId of this.getAllPlayerIds()) {
            this.players[playerId].move();
            const currentPlayerPart: Coordinate = this.players[playerId].currentPlayerPosition;
            this.grid.occupySpace(currentPlayerPart);
            this.players[playerId].allowChangeDirection();
        }
    }

    private getAllPlayerIds():  Array<string> {
        return Object.keys(this.players);
    }

}
