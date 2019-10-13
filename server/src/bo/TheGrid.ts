import { Coordinate } from '../schemas/Coordinate';

export class TheGrid {

    private gridSize: number;

    private gridItems: Array<Array<boolean>>;

    public constructor(gridSize: number) {
        this.gridSize = gridSize;
        let emptyLine = new Array<boolean>((gridSize));
        emptyLine = Array.from(emptyLine, () => false);
        this.gridItems = new Array<Array<boolean>>(gridSize);
        this.gridItems = Array.from(this.gridItems, () => emptyLine.slice());
    }

    public occupySpace(spaceCoordinate: Coordinate): void {
        if (! this.spaceExists(spaceCoordinate)) {
            return;
        }
        this.gridItems[spaceCoordinate.x][spaceCoordinate.y] = true;
    }

    public isSpaceOccupied(spaceCoordinate: Coordinate): boolean {
        if (! this.spaceExists(spaceCoordinate)) {
            return true;
        }
        return this.gridItems[spaceCoordinate.x][spaceCoordinate.y];
    }

    private spaceExists(spaceCoordinate: Coordinate): boolean {
        return 0 <= spaceCoordinate.x && this.gridSize > spaceCoordinate.x &&
            0 <= spaceCoordinate.y && this.gridSize > spaceCoordinate.y;
    }

}
