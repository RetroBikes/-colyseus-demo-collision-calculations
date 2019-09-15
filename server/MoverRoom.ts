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

    @type("string")
    public position = 'right';

    public constructor() {
        super();
        this.addPlayerPart(
            Math.floor(Math.random() * 400),
            Math.floor(Math.random() * 400),
        );
    }

    public addPlayerPart(x: number, y: number): void {
        const newPlayerPart = new PlayerPart(x, y);
        this.playerParts.push(newPlayerPart);
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
        switch(this.players[ id ].position) {
            case 'up':
                this.players[ id ].y -= 10;
                break;
            case 'down':
                this.players[ id ].y += 10;
                break;
            case 'left':
                this.players[ id ].x -= 10;
                break;
            case 'right':
                this.players[ id ].x += 10;
                break;
        }
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
