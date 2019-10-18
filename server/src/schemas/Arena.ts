import { Schema, type, MapSchema } from '@colyseus/schema';
import Coordinate from './Coordinate';
import GameStatus from '../interfaces/GameStatus';
import Player from './Player';
import TheGrid from '../bo/TheGrid';
import GenericObject from '../interfaces/GenericObject';

export default class Arena extends Schema {

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
        const statusPlayers: GenericObject<boolean> = {};
        Player.loopMap(this.players, (player: Player, playerId: string) => {
            if (! player.isAlive) {
                finished = true;
            }
            isDraw = isDraw && ! player.isAlive;
            statusPlayers[playerId] = player.isAlive;
        });
        return {
            finished,
            isDraw,
            statusPlayers,
        };
    }

}
