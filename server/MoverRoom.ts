import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("number")
    x = Math.floor(Math.random() * 400);

    @type("number")
    y = Math.floor(Math.random() * 400);

    @type("string")
    position = "right";
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    gameLoop: any;

    something = "This attribute won't be sent to the client-side";

    createPlayer (id: string) {
        this.players[ id ] = new Player();

        this.gameLoop = setInterval(() => {
            this.movePlayer(id);
        }, 100);
    }

    changePosition (id: string, position: string) {
        this.players[ id ].position = position;
    }

    removePlayer (id: string) {
        delete this.players[ id ];
        clearInterval(this.gameLoop);
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
