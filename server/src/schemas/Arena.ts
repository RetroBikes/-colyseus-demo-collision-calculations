import { Client } from 'colyseus';
import { Schema, type, MapSchema } from '@colyseus/schema';
import Coordinate from './Coordinate';
import GameStatus from '../interfaces/GameStatus';
import PlayerInitialState from '../interfaces/PlayerInitialState';
import Player from './Player';
import TheGrid from '../bo/TheGrid';

export default class Arena extends Schema {

    @type({ map: Player })
    public players = new MapSchema<Player>();

    @type('number')
    public areaVirtualSize: number = 150;

    private grid: TheGrid;

    private playersInitialState: Array<PlayerInitialState> = [
        {
            startPosition: new Coordinate(10, 10),
            initialDirection: 'right',
        },
        {
            startPosition: new Coordinate(this.areaVirtualSize - 10, this.areaVirtualSize - 10),
            initialDirection: 'left',
        },
        {
            startPosition: new Coordinate(this.areaVirtualSize - 10, 10),
            initialDirection: 'down',
        },
        {
            startPosition: new Coordinate(10, this.areaVirtualSize - 10),
            initialDirection: 'up',
        },
    ];

    public constructor() {
        super();
        this.grid = new TheGrid(this.areaVirtualSize);
    }

    public createPlayer(client: Client, clientNumber: number): void {
        const initialState = this.playersInitialState[clientNumber - 1];
        this.players[client.sessionId] = new Player(client, initialState);
        this.grid.occupySpace(initialState.startPosition, client.sessionId);
    }

    public changePlayerDirection(playerId: string, direction: string): void {
        this.players[playerId].changeDirection(direction);
    }

    public removePlayer(playerId: string): void {
        delete this.players[playerId];
        this.grid.freeAllPlayerSpaces(playerId);
    }

    public makeGameStep(): GameStatus {
        this.moveAllPlayers();
        this.calculateCollisions();
        const gameStatus = this.getGameStatus();
        this.flushGameStep();
        return gameStatus;
    }

    private moveAllPlayers(): void {
        Player.loopMap(this.players, (player: Player, playerId: string) => {
            player.move();
            this.grid.addSpaceCandidateToOccupy(player.currentPosition, playerId);
        });
    }

    private calculateCollisions(): void {
        Player.loopMap(this.players, (player: Player, playerId: string) => {
            if (this.grid.isSpaceOccupied(player.currentPosition, playerId)) {
                player.kill();
            }
        });
    }

    private flushGameStep(): void {
        Player.loopMap(this.players, (player: Player, playerId: string) => {
            if (player.isAlive) {
                this.grid.occupySpace(player.currentPosition, playerId);
                player.allowChangeDirection();
            } else {
                this.removePlayer(playerId);
            }
        });
    }

    private getGameStatus(): GameStatus {
        let playersAlive = 0,
            finished = false,
            isDraw = true;
        Player.loopMap(this.players, (player: Player) => {
            if (player.isAlive) {
                playersAlive++;
            }
            isDraw = isDraw && ! player.isAlive;
        });
        if (1 >= playersAlive) {
            finished = true;
        }
        return {
            finished,
            isDraw,
            players: this.players,
        };
    }

}
