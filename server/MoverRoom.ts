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

    public playerParts = new MapSchema<Coordinate>();

    public playerSize = 0;

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

    public changeDirection(direction: string) {
        this.direction = direction;
    }
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    @type('number')
    areaVirtualSize = 150;

    waitingForPlayerTwo = true;

    createPlayer (id: string, isPlayerOne: boolean) {
        const startCoordinate = isPlayerOne ?
            new Coordinate(10, 10) :
            new Coordinate(this.areaVirtualSize - 10, this.areaVirtualSize - 10);
        this.players[ id ] = new Player(
            startCoordinate.x, startCoordinate.y,
            isPlayerOne ? 'right' : 'left'
        );
    }

    changeDirection (id: string, direction: string) {
        this.players[ id ].changeDirection(direction);
    }

    removePlayer (id: string) {
        delete this.players[ id ];
    }

    getAllPlayerIds() {
        return Object.keys(this.players);
    }

    makeGameStep() {
        for (let playerId of this.getAllPlayerIds()) {
            this.movePlayer(playerId);
        }
    }

    movePlayer (id: string) {
        const currentPlayerPart = this.players[id].currentPlayerPosition;
        switch(this.players[id].direction) {
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
        this.players[id].addPlayerPart(currentPlayerPart.x, currentPlayerPart.y);
    }
}

export class MoverRoom extends Room<State> {
    maxClients = 2;

    waitingForPlayerTwo = true;

    onCreate (options: any) {
        console.log("StateHandlerRoom created!", options);

        this.setState(new State());
    }

    onJoin (client: Client) {
        this.state.createPlayer(client.sessionId, this.waitingForPlayerTwo);
        if (! this.waitingForPlayerTwo) {
            this.startGame();
        }
        this.waitingForPlayerTwo = false;
    }

    startGame() {
        this.setSimulationInterval(() => {
            this.state.makeGameStep();
        }, 100);
    }

    onLeave (client: Client) {
        this.state.removePlayer(client.sessionId);
    }

    onMessage (client: Client, data: any) {
        console.log("StateHandlerRoom received message from", client.sessionId, ":", data);
        this.state.changeDirection(client.sessionId, data.direction);
    }

    onDispose () {
        console.log("Dispose StateHandlerRoom");
    }

}
