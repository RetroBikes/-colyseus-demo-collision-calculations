import { Schema, type, MapSchema } from "@colyseus/schema";
import { Coordinate } from './Coordinate';
import { Player } from './Player';

export class Arena extends Schema {
    @type({ map: Player })
    public players = new MapSchema<Player>();

    @type('number')
    public areaVirtualSize = 150;

    private gameObjectHashs = new Array<string>();

    public createPlayer(id: string, isPlayerOne: boolean): void {
        const startCoordinate = isPlayerOne ?
            new Coordinate(10, 10) :
            new Coordinate(this.areaVirtualSize - 10, this.areaVirtualSize - 10);
        this.players[ id ] = new Player(
            startCoordinate,
            isPlayerOne ? 'right' : 'left',
        );
    }

    public changeDirection(id: string, direction: string): void {
        this.players[ id ].changeDirection(direction);
    }

    public removePlayer(id: string): void {
        delete this.players[ id ];
    }

    public makeGameStep(): void {
        for (let playerId of this.getAllPlayerIds()) {
            this.players[playerId].move();
            const currentPlayerPart: Coordinate = this.players[playerId].currentPlayerPosition;
            this.gameObjectHashs.push(currentPlayerPart.toString());
            this.players[playerId].allowChangeDirection();
        }
    }

    private getAllPlayerIds():  Array<string> {
        return Object.keys(this.players);
    }

}
