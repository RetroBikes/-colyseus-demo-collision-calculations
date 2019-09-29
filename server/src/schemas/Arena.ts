import { Schema, type, MapSchema } from "@colyseus/schema";
import { Coordinate } from './Coordinate';
import { Player } from './Player';

export class Arena extends Schema {
    @type({ map: Player })
    public players = new MapSchema<Player>();

    @type('number')
    public areaVirtualSize = 150;

    createPlayer(id: string, isPlayerOne: boolean): void {
        const startCoordinate = isPlayerOne ?
            new Coordinate(10, 10) :
            new Coordinate(this.areaVirtualSize - 10, this.areaVirtualSize - 10);
        this.players[ id ] = new Player(
            startCoordinate.x, startCoordinate.y,
            isPlayerOne ? 'right' : 'left'
        );
    }

    changeDirection(id: string, direction: string): void {
        this.players[ id ].changeDirection(direction);
    }

    removePlayer(id: string): void {
        delete this.players[ id ];
    }

    getAllPlayerIds():  Array<string> {
        return Object.keys(this.players);
    }

    makeGameStep(): void {
        for (let playerId of this.getAllPlayerIds()) {
            this.players[playerId].move();
        }
    }
}
