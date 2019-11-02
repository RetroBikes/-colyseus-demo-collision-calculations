import { MapSchema } from '@colyseus/schema';
import { Room, Client } from 'colyseus';
import Arena from '../schemas/Arena';
import Configurations from '../bo/Configurations';
import GameStatus from '../interfaces/GameStatus';
import Player from '../schemas/Player';

export default class GameRoom extends Room<Arena> {

    public maxClients: number = 2;

    public onCreate(options: any): void {
        console.log('StateHandlerRoom created!', options);
        this.setState(new Arena());
        const gameconfigdata = new Configurations('gameconfig.json'),
            gameconfig = gameconfigdata.getJsonData();
        this.maxClients = gameconfig.clientsToPlay;
    }

    public onJoin(client: Client): void {
        const clientNumber = this.clients.length + 1,
            roomOccupied = this.maxClients <= this.clients.length + 1;
        this.state.createPlayer(client, clientNumber);
        if (roomOccupied) {
            this.startGame();
        }
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
            } else {
                this.sendMessageToPlayers(gameStatus.players, false);
            }
            this.state.flushGameStep();
        }, 100);
    }

    private stopGame(gameStatus: GameStatus): void {
        if (gameStatus.isDraw) {
            this.broadcast('Draw :o');
        } else {
            this.sendMessageToPlayers(gameStatus.players, true);
        }
        this.disconnect();
    }

    private sendMessageToPlayers(players: MapSchema<Player>, canSendWinMessage: boolean): void {
        Player.loopMap(players, (player: Player) => {
            if (player.isAlive && ! canSendWinMessage) {
                return;
            }
            const message = player.isAlive ? 'You win :D' : 'You lose :/';
            this.send(player.getClientObject(), message);
        });
    }

}
