import { Schema, type, MapSchema } from '@colyseus/schema';
import { Coordinate } from './Coordinate';
import { Player } from './Player';
import { TheGrid } from '../bo/TheGrid';

export class Arena extends Schema {

    @type({ map: Player })
    public players = new MapSchema<Player>();

    @type('number')
    public areaVirtualSize = 150;

    private grid: TheGrid;

    public constructor() {
        super();
        this.grid = new TheGrid(this.areaVirtualSize);
    }

    public createPlayer(playerId: string, isPlayerOne: boolean): void {
        const startCoordinate = isPlayerOne ?
            new Coordinate(10, 10) :
            new Coordinate(this.areaVirtualSize - 10, this.areaVirtualSize - 10);
        this.players[playerId] = new Player(startCoordinate, isPlayerOne ? 'right' : 'left');
        this.grid.occupySpace(startCoordinate);
    }

    public changePlayerDirection(playerId: string, direction: string): void {
        this.players[playerId].changeDirection(direction);
    }

    public removePlayer(playerId: string): void {
        delete this.players[playerId];
    }

    public makeGameStep(): Object {
        this.moveAllPlayers();
        this.calculateCollisions();
        this.flushGameStep();
        return this.getGameStatus();
    }

    private moveAllPlayers(): void {
        this.loopAllPlayers((player: Player, playerId: string) => {
            player.move();
            this.grid.addSpaceCandidateToOccupy(player.currentPosition, playerId);
        });
    }

    private calculateCollisions(): void {
        this.loopAllPlayers((player: Player, playerId: string) => {
            if (this.grid.isSpaceOccupied(player.currentPosition, playerId)) {
                player.kill();
            }
        });
    }

    private flushGameStep(): void {
        this.loopAllPlayers((player: Player) => {
            this.grid.occupySpace(player.currentPosition);
            player.allowChangeDirection();
        });
    }

    private getGameStatus(): Object {
        let isGameFinished = false;
        this.loopAllPlayers((player: Player) => {
            if (! player.isAlive) {
                isGameFinished = true;
            }
        });
        return {
            isGameFinished,
        };
    }

    private loopAllPlayers(callback: Function): void {
        for (let playerId of Object.keys(this.players)) {
            callback(this.players[playerId], playerId);
        }
    }

}
