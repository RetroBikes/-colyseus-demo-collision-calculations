export class TheGrid {
    private gridItems: Array<Array<boolean>>;

    public constructor(gridSize: number) {
        const emptyLine = new Array<boolean>((gridSize + 2));
        emptyLine.fill(false);
        this.gridItems = new Array<Array<boolean>>(gridSize + 2);
        this.gridItems.fill(emptyLine);
        console.log(this.gridItems);
    }
}
