import { Client } from 'colyseus';
import { MapSchema, Schema, type } from '@colyseus/schema';
import Coordinate from './Coordinate';
import GameConfig from '../interfaces/GameConfig';
import GameStatus from '../interfaces/GameStatus';
import Player from './Player';
import PlayerInitialState from '../interfaces/PlayerInitialState';
import TheGrid from '../bo/TheGrid';

export default class Arena extends Schema {

    @type({ map: Player })
    public players = new MapSchema<Player>();

    @type('number')
    public areaVirtualSize: number = 150;

    private grid: TheGrid;

    private playersInitialState: Array<PlayerInitialState>;

    public constructor(gameconfig: GameConfig) {
        super();
        this.areaVirtualSize = gameconfig.areaVirtualSize;
        this.playersInitialState = gameconfig.initialStates;
        this.formatPlayersInitialState();
        this.grid = new TheGrid(gameconfig.areaVirtualSize);
    }

    public createPlayer(client: Client, clientNumber: number): void {
        const initialState = this.playersInitialState[clientNumber - 1];
        this.players[client.sessionId] = new Player(client, initialState);
        this.grid.occupySpace(initialState.startPosition, client.sessionId);
    }

    public removePlayer(playerId: string): void {
        if (! this.playerExists(playerId)) {
            return;
        }
        delete this.players[playerId];
        this.grid.freeAllPlayerSpaces(playerId);
    }

    public changePlayerDirection(playerId: string, direction: string): void {
        if (! this.playerExists(playerId)) {
            return;
        }
        this.players[playerId].changeDirection(direction);
    }

    public refreshAllPlayersPositions(): void {
        Player.loopMap(this.players, (player: Player) => {
            player.refreshCurrentPosition();
        });
    }

    public makeGameStep(): GameStatus {
        this.moveAllPlayers();
        this.calculateCollisions();
        return this.getGameStatus();
    }

    public flushGameStep(): void {
        Player.loopMap(this.players, (player: Player, playerId: string) => {
            if (player.isAlive) {
                this.grid.occupySpace(player.currentPosition, playerId);
                player.allowChangeDirection();
            } else {
                this.removePlayer(playerId);
            }
        });
    }

    private formatPlayersInitialState(): void {
        this.playersInitialState = this.playersInitialState.map(state => {
            return {
                startPosition: new Coordinate(
                    0 <= state.startPosition.x ? state.startPosition.x :
                        this.areaVirtualSize - Math.abs(state.startPosition.x),
                    0 <= state.startPosition.y ? state.startPosition.y :
                        this.areaVirtualSize - Math.abs(state.startPosition.y)
                ),
                initialDirection: state.initialDirection,
            };
        });
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

    private playerExists(playerId: string): boolean {
        return 'undefined' !== typeof this.players[playerId];
    }

}
