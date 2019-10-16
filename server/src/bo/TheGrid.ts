import { Coordinate } from '../schemas/Coordinate';
import GenericObject from '../interfaces/GenericObject';

export class TheGrid {

    private gridSize: number;

    private gridItems: Array<Array<boolean>>;

    private spacesCandidatesToOccupy: GenericObject<Coordinate>;

    public constructor(gridSize: number) {
        this.gridSize = gridSize;
        let emptyLine = new Array<boolean>((gridSize));
        emptyLine = Array.from(emptyLine, () => false);
        this.gridItems = new Array<Array<boolean>>(gridSize);
        this.gridItems = Array.from(this.gridItems, () => emptyLine.slice());
        this.spacesCandidatesToOccupy = {};
    }

    public addSpaceCandidateToOccupy(spaceCoordinate: Coordinate, playerId: string): void {
        if (! this.spaceExists(spaceCoordinate)) {
            return;
        }
        this.spacesCandidatesToOccupy[playerId] = new Coordinate(spaceCoordinate.x, spaceCoordinate.y);
    }

    public occupySpace(spaceCoordinate: Coordinate, playerId: string): void {
        if (! this.spaceExists(spaceCoordinate)) {
            return;
        }
        this.gridItems[spaceCoordinate.x][spaceCoordinate.y] = true;
    }

    public isSpaceOccupied(spaceCoordinate: Coordinate, playerId: string): boolean {
        if (! this.spaceExists(spaceCoordinate)) {
            return true;
        }
        return this.gridItems[spaceCoordinate.x][spaceCoordinate.y] &&
            ('undefined' === typeof this.spacesCandidatesToOccupy[playerId] ||
            this.spacesCandidatesToOccupy[playerId].toString() !== spaceCoordinate.toString());
    }

    private spaceExists(spaceCoordinate: Coordinate): boolean {
        return 0 <= spaceCoordinate.x && this.gridSize > spaceCoordinate.x &&
            0 <= spaceCoordinate.y && this.gridSize > spaceCoordinate.y;
    }

}
