import { Schema, type, MapSchema } from '@colyseus/schema';
import Coordinate from './Coordinate';
import GameStatus from '../interfaces/GameStatus';
import Player from './Player';
import TheGrid from '../bo/TheGrid';
import { Client } from 'colyseus';

export default class Arena extends Schema {

    @type({ map: Player })
    public players = new MapSchema<Player>();

    @type('number')
    public areaVirtualSize: number = 150;

    private grid: TheGrid;

    private initialPlayersState = [
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
        const initialState = this.initialPlayersState[clientNumber - 1],
            startPosition = initialState.startPosition,
            initialDirection = initialState.initialDirection;
        this.players[client.sessionId] = new Player(client, startPosition, initialDirection);
        this.grid.occupySpace(startPosition);
    }

    public changePlayerDirection(playerId: string, direction: string): void {
        this.players[playerId].changeDirection(direction);
    }

    public removePlayer(playerId: string): void {
        delete this.players[playerId];
    }

    public makeGameStep(): GameStatus {
        this.moveAllPlayers();
        this.calculateCollisions();
        this.flushGameStep();
        return this.getGameStatus();
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
        Player.loopMap(this.players, (player: Player) => {
            this.grid.occupySpace(player.currentPosition);
            player.allowChangeDirection();
        });
    }

    private getGameStatus(): GameStatus {
        let finished = false,
            isDraw = true;
        Player.loopMap(this.players, (player: Player) => {
            if (! player.isAlive) {
                finished = true;
            }
            isDraw = isDraw && ! player.isAlive;
        });
        return {
            finished,
            isDraw,
            players: this.players,
        };
    }

}
