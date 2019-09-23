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

    public constructor() {
        super();
        this.addPlayerPart(
            Math.floor(Math.random() * 400),
            Math.floor(Math.random() * 400),
        );
    }

    public addPlayerPart(x: number, y: number): void {
        const newPlayerPart = new Coordinate(x, y);
        this.playerParts[this.playerSize] = newPlayerPart;
        this.currentPlayerPosition = newPlayerPart;
        this.playerSize++;
    }
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    createPlayer (id: string) {
        this.players[ id ] = new Player();
    }

    changeDirection (id: string, direction: string) {
        this.players[ id ].direction = direction;
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

    onCreate (options: any) {
        console.log("StateHandlerRoom created!", options);

        this.setState(new State());

        this.setSimulationInterval(() => {
            this.state.makeGameStep();
        }, 100);
    }

    onJoin (client: Client) {
        this.state.createPlayer(client.sessionId);
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
