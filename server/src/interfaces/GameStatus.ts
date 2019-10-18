import GenericObject from './GenericObject';

export default interface GameStatus {

    finished: boolean,
    isDraw: boolean,
    statusPlayers: GenericObject<boolean>,

}
