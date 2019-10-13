import { Schema, type, MapSchema } from "@colyseus/schema";
import { Coordinate } from './Coordinate';
import { Player } from './Player';
import { TheGrid } from './TheGrid';

export class Arena extends Schema {

    @type({ map: Player })
    public players = new MapSchema<Player>();

    @type('number')
    public areaVirtualSize = 150;

    private gameObjectHashs = new Array<string>();

    private grid: TheGrid;

    public constructor() {
        super();
        this.initializeAreaObjectHashs();
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
            this.addGameObjectHash(currentPlayerPart);
            this.players[playerId].allowChangeDirection();
        }
    }

    private getAllPlayerIds():  Array<string> {
        return Object.keys(this.players);
    }

    private addGameObjectHash(coordinate: Coordinate): void {
        this.gameObjectHashs.push(coordinate.toString());
    }

    private initializeAreaObjectHashs(): void {
        for (let x = -1; x <= this.areaVirtualSize + 1; x++) {
            if (-1 === x || this.areaVirtualSize + 1 === x) {
                // First and last rows, take all the y coordinates.
                for (let y = -1; y <= this.areaVirtualSize + 1; y++) {
                    const coordinate = new Coordinate(x, y);
                    this.addGameObjectHash(coordinate);
                }
            } else {
                // Middle rows, take only first and last y coordinates.
                const coordinateUp = new Coordinate(x, -1),
                    coordinateBottom = new Coordinate(x, this.areaVirtualSize + 1);
                this.addGameObjectHash(coordinateUp);
                this.addGameObjectHash(coordinateBottom);
            }
        }
    }

}
