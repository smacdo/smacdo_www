// TODO: Implement a Tilemap as an abstraction on top of Grid. Tilemaps add additional features
//       like tile size (width, height), chunking etc.
export class Tilemap {}

export class Grid<T> {
    private _cells: T[];
    private _cols: number;
    private _rows: number;

    /**
     * Construct a new grid from the provided array of cells and a column count.
     *
     * @param cells Array of cells. The grid assumes it is the owner of this reference.
     * @param colsPerRow The number of columns in row.
     */
    constructor(cells: T[], colsPerRow: number) {
        if (cells.length == 0) {
            if (colsPerRow != 0) {
                throw new Error(
                    "a grid with an empty cell array cannot have a non-zero colsPerRow value",
                );
            }

            this._cols = 0;
            this._rows = 0;
            this._cells = cells;
        } else {
            if (!Number.isInteger(colsPerRow) || colsPerRow < 1) {
                throw new Error(
                    `grid colsPerRow must be a positive integer value (current: ${colsPerRow})`,
                );
            }

            const rows = cells.length / colsPerRow;

            if (!Number.isInteger(rows)) {
                throw new Error(
                    `a grid must have a consistent number of columns per row (current size: ${cells.length}, colsPerRow: ${colsPerRow})`,
                );
            }

            this._cols = colsPerRow;
            this._rows = cells.length / colsPerRow;
            this._cells = cells;
        }
    }

    /// Create a deep copy clone of this grid.
    clone(): Grid<T> {
        return new Grid(structuredClone(this._cells), this._cols);
    }

    /// Get the cell at position `x, y`.
    get(x: number, y: number): T {
        const index = y * this._cols + x;

        if (!this.isInBounds(x, y)) {
            throw new Error(
                `grid pos ${x}, ${y} is a non-integer value or out of bounds (cols: ${this._cols}, rows: ${this._rows})`,
            );
        }

        return this._cells[index];
    }

    /// Get the cell at position `x, y`.
    set(x: number, y: number, value: T): T {
        const index = y * this._cols + x;

        if (!this.isInBounds(x, y)) {
            throw new Error(
                `grid pos ${x}, ${y} is a non-integer value or out of bounds (cols: ${this._cols}, rows: ${this._rows})`,
            );
        }

        this._cells[index] = value;
        return value;
    }

    /// Check if a position is within the bounds of the tile grid.
    isInBounds(x: number, y: number): boolean {
        return (
            Number.isInteger(x) &&
            Number.isInteger(y) &&
            x >= 0 &&
            x < this._cols &&
            y >= 0 &&
            y < this._rows
        );
    }

    /// Check if the grid is empty meaning it has no cells.
    get isEmpty(): boolean {
        return this.length == 0;
    }

    /// Get the number of cells in the grid.
    get length(): number {
        return this._cols * this._rows;
    }

    /// Get the number of columns per row in the grid.
    get cols(): number {
        return this._cols;
    }

    /// Get the number of rows in the grid.
    get rows(): number {
        return this._rows;
    }
}
