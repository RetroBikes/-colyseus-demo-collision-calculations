import PlayerInitialState from './PlayerInitialState';

export default interface GameStatus {

    clientsToPlay: number,
    areaVirtualSize: number,
    initialStates: Array<PlayerInitialState>,

}
