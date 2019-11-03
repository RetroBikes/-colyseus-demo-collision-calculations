import { MapSchema } from '@colyseus/schema';
import Player from '../schemas/Player';

export default interface GameStatus {

    finished: boolean,
    isDraw: boolean,
    players: MapSchema<Player>,

}
