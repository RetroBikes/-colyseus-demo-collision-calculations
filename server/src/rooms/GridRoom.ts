import { Room, Client } from "colyseus";
import { Arena } from '../schemas/Arena';

export class GridRoom extends Room<Arena> {
    public maxClients = 2;

    private waitingForPlayerTwo = true;

    public onCreate(options: any): void {
        console.log("StateHandlerRoom created!", options);

        this.setState(new Arena());
    }

    public onJoin(client: Client): void {
        this.state.createPlayer(client.sessionId, this.waitingForPlayerTwo);
        if (! this.waitingForPlayerTwo) {
            this.startGame();
        }
        this.waitingForPlayerTwo = false;
    }

    public onLeave(client: Client): void {
        this.state.removePlayer(client.sessionId);
    }

    public onMessage(client: Client, data: any): void {
        console.log("StateHandlerRoom received message from", client.sessionId, ":", data);
        this.state.changePlayerDirection(client.sessionId, data.direction);
    }

    public onDispose(): void {
        console.log("Dispose StateHandlerRoom");
    }

    private startGame(): void {
        this.setSimulationInterval(() => {
            this.state.makeGameStep();
        }, 100);
    }

}
