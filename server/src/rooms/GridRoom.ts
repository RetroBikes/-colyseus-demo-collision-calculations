import { Room, Client } from "colyseus";
import { State } from '../schemas/State';

export class GridRoom extends Room<State> {
    public maxClients = 2;

    private waitingForPlayerTwo = true;

    onCreate(options: any): void {
        console.log("StateHandlerRoom created!", options);

        this.setState(new State());
    }

    onJoin(client: Client): void {
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
