import { Room, Client } from 'colyseus';
import Arena from '../schemas/Arena';
import GameStatus from '../interfaces/GameStatus';
import Player from '../schemas/Player';

export default class GameRoom extends Room<Arena> {

    public maxClients: number = 2;

    private waitingForPlayerTwo: boolean = true;

    public onCreate(options: any): void {
        console.log('StateHandlerRoom created!', options);
        this.setState(new Arena(this.maxClients));
    }

    public onJoin(client: Client): void {
        //
        this.state.createPlayer(client, this.waitingForPlayerTwo);
        if (! this.waitingForPlayerTwo) {
            this.startGame();
        }
        this.waitingForPlayerTwo = false;
    }

    public onLeave(client: Client): void {
        this.state.removePlayer(client.sessionId);
    }

    public onMessage(client: Client, data: any): void {
        console.log('StateHandlerRoom received message from', client.sessionId, ':', data);
        this.state.changePlayerDirection(client.sessionId, data.direction);
    }

    public onDispose(): void {
        console.log('Dispose StateHandlerRoom');
    }

    private startGame(): void {
        this.setSimulationInterval(() => {
            const gameStatus = this.state.makeGameStep();
            if (gameStatus.finished) {
                this.stopGame(gameStatus);
            }
        }, 100);
    }

    private stopGame(gameStatus: GameStatus): void {
        if (gameStatus.isDraw) {
            this.broadcast('Draw :o');
        } else {
            Player.loopMap(gameStatus.players, (player: Player) => {
                const message = player.isAlive ? 'You win :D' : 'You lose :/';
                this.send(player.getClientObject(), message);
            });
        }
        this.disconnect();
    }

}
