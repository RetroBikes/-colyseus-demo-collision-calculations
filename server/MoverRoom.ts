import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class PlayerPart extends Schema {
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
    @type({ map: PlayerPart })
    public playerParts = new MapSchema<PlayerPart>();

    @type('string')
    public position = 'right';

    @type('number')
    public playerSize = 0;

    public constructor() {
        super();
        this.addPlayerPart(
            Math.floor(Math.random() * 400),
            Math.floor(Math.random() * 400),
        );
    }

    public addPlayerPart(x: number, y: number): void {
        const newPlayerPart = new PlayerPart(x, y);
        this.playerParts[this.playerSize] = newPlayerPart;
        this.playerSize++;
    }

    public getCurrentPart(): PlayerPart {
        return this.playerParts[this.playerSize - 1];
    }
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    gameLoop: any;

    something = "This attribute won't be sent to the client-side";

    createPlayer (id: string) {
        this.players[ id ] = new Player();
    }

    changePosition (id: string, position: string) {
        this.players[ id ].position = position;
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
        const currentPlayerPart = this.players[id].getCurrentPart();
        switch(this.players[id].position) {
            case 'up':
                currentPlayerPart.y -= 10;
                break;
            case 'down':
                currentPlayerPart.y += 10;
                break;
            case 'left':
                currentPlayerPart.x -= 10;
                break;
            case 'right':
                currentPlayerPart.x += 10;
                break;
        }
        this.players[id].addPlayerPart(currentPlayerPart.x, currentPlayerPart.y);
    }
}

export class MoverRoom extends Room<State> {
    maxClients = 4;

    onCreate (options: any) {
        console.log("StateHandlerRoom created!", options);

        this.setState(new State());

        this.setSimulationInterval(() => {
            this.state.makeGameStep();
        });
    }

    onJoin (client: Client) {
        this.state.createPlayer(client.sessionId);
    }

    onLeave (client: Client) {
        this.state.removePlayer(client.sessionId);
    }

    onMessage (client: Client, data: any) {
        console.log("StateHandlerRoom received message from", client.sessionId, ":", data);
        this.state.changePosition(client.sessionId, data.position);
    }

    onDispose () {
        console.log("Dispose StateHandlerRoom");
    }

}
