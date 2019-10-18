import GenericObject from './GenericObject';

export default interface GameStatus {

    finished: boolean,
    statusPlayers: GenericObject<boolean>,

}
