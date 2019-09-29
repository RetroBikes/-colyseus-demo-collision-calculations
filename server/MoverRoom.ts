import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Coordinate extends Schema {
    @type("number")
    public x: number;

    @type("number")
    public y: number;

    public constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }
}

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

export class State extends Schema {
    @type({ map: Player })
    public players = new MapSchema<Player>();

    @type('number')
    public areaVirtualSize = 150;

    createPlayer (id: string, isPlayerOne: boolean): void {
        const startCoordinate = isPlayerOne ?
            new Coordinate(10, 10) :
            new Coordinate(this.areaVirtualSize - 10, this.areaVirtualSize - 10);
        this.players[ id ] = new Player(
            startCoordinate.x, startCoordinate.y,
            isPlayerOne ? 'right' : 'left'
        );
    }

    changeDirection (id: string, direction: string): void {
        this.players[ id ].changeDirection(direction);
    }

    removePlayer (id: string): void {
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

export class MoverRoom extends Room<State> {
    public maxClients = 2;

    private waitingForPlayerTwo = true;

    onCreate (options: any): void {
        console.log("StateHandlerRoom created!", options);

        this.setState(new State());
    }

    onJoin (client: Client): void {
        this.state.createPlayer(client.sessionId, this.waitingForPlayerTwo);
        if (! this.waitingForPlayerTwo) {
            this.startGame();
        }
        this.waitingForPlayerTwo = false;
    }

    startGame(): void {
        this.setSimulationInterval(() => {
            this.state.makeGameStep();
        }, 100);
    }

    onLeave(client: Client): void {
        this.state.removePlayer(client.sessionId);
    }

    onMessage(client: Client, data: any): void {
        console.log("StateHandlerRoom received message from", client.sessionId, ":", data);
        this.state.changeDirection(client.sessionId, data.direction);
    }

    onDispose(): void {
        console.log("Dispose StateHandlerRoom");
    }

}
