import { Client } from 'colyseus';
import { MapSchema, Schema, type } from '@colyseus/schema';
import Coordinate from './Coordinate';
import GameConfig from '../interfaces/GameConfig';
import GameStatus from '../interfaces/GameStatus';
import Player from './Player';
import PlayerInitialState from '../interfaces/PlayerInitialState';
import TheGrid from '../bo/TheGrid';

/**
 * This extends the Schema Colyseus class to be passed to client side.
 */
export default class Arena extends Schema {

    /**
     * Stores all players connected to the current game.
     * The object keys are they client ids.
     * Flagged to be passed to client side.
     * @type MapSchema<Player>
     */
    @type({ map: Player })
    public players = new MapSchema<Player>();

    /**
     * Virtual size of the game area. The physical size has to be
     * calculated on client size. See the readme for more details.
     * Flagged to be passed to client side.
     * @type number
     */
    @type('number')
    public areaVirtualSize: number = 150;

    /**
     * The grid with all position statuses, as if occupied and the
     * client id of who is occupying. See more in TheGrid class comments.
     * @type TheGrid
     */
    private grid: TheGrid;

    /**
     * Sequence of players initial states. They are assigned to players by the connection order.
     * @type Array<PlayerInitialState>
     */
    private playersInitialState: Array<PlayerInitialState>;

    /**
     * Start the game arena with a GameConfig object to boot the initial states and the grid data.
     * @param gameconfig Readed from gameconfig.json on GameRoom class.
     */
    public constructor(gameconfig: GameConfig) {
        super();
        this.areaVirtualSize = gameconfig.areaVirtualSize;
        this.playersInitialState = gameconfig.initialStates;
        this.formatPlayersInitialState();
        this.grid = new TheGrid(gameconfig.areaVirtualSize);
    }

    /**
     * Add a player on players map, with their initial
     * states and occupy the initial position on game grid.
     * @param client Client object to instantiate the Player object
     * @param clientNumber Client number to get their initial states
     */
    public createPlayer(client: Client, clientNumber: number): void {
        const initialState = this.playersInitialState[clientNumber - 1];
        this.players[client.sessionId] = new Player(client, initialState);
        this.grid.occupySpace(initialState.startPosition, client.sessionId);
    }

    /**
     * Remove the player from the map and free all their spaces on game grid.
     * Depends of player existence on the map for complete the action.
     * @param playerId Client id of the player to remove
     */
    public removePlayer(playerId: string): void {
        if (! this.playerExists(playerId)) {
            return;
        }
        delete this.players[playerId];
        this.grid.freeAllPlayerSpaces(playerId);
    }

    /**
     * Change the player direction.
     * Depends of player existence on the map for complete the action.
     * @param playerId Client id of the player to change their direction
     * @param direction New direction to add to the player
     */
    public changePlayerDirection(playerId: string, direction: string): void {
        if (! this.playerExists(playerId)) {
            return;
        }
        this.players[playerId].changeDirection(direction);
    }

    /**
     * Recreate the Coordinate object of all players. This forces the data
     * to be passed to all clients, called on game start on GameRoom class.
     */
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
