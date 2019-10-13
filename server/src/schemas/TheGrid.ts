import { Coordinate } from './Coordinate';

export class TheGrid {

    private gridSize: number;

    private gridItems: Array<Array<boolean>>;

    public constructor(gridSize: number) {
        this.gridSize = gridSize;
        const emptyLine = new Array<boolean>((gridSize));
        emptyLine.fill(false);
        this.gridItems = new Array<Array<boolean>>(gridSize);
        this.gridItems.fill(emptyLine);
    }

    public occupySpace(spaceCoordinate: Coordinate): void {
        if (this.spaceExists(spaceCoordinate)) {
            return;
        }
        this.gridItems[spaceCoordinate.x][spaceCoordinate.y] = true;
    }

    public isSpaceOccupied(spaceCoordinate: Coordinate): boolean {
        if (this.spaceExists(spaceCoordinate)) {
            return true;
        }
        return this.gridItems[spaceCoordinate.x][spaceCoordinate.y];
    }

    private spaceExists(spaceCoordinate: Coordinate): boolean {
        return 0 <= spaceCoordinate.x || this.gridSize > spaceCoordinate.x ||
            0 <= spaceCoordinate.y || this.gridSize > spaceCoordinate.y;
    }

}
