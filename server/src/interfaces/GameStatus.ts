import Player from '../schemas/Player';
import { MapSchema } from '@colyseus/schema';

export default interface GameStatus {

    finished: boolean,
    isDraw: boolean,
    players: MapSchema<Player>,

}
