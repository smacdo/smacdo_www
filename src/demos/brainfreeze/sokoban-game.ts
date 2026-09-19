import { Box, Level, Player, Position } from "./level.ts";

export const TILE_WALL = 1;
export const TILE_FLOOR = 0;

/** Captures mutable level state to perform undo. */
class LevelState {
    player: Player;
    boxes: Box[];

    constructor(player: Player, boxes: Box[]) {
        this.player = player;
        this.boxes = boxes;
    }
}

export class SokobanGame {
    initialLevel: Level;
    level: Level;
    stateSnapshots: LevelState[];

    constructor(level: Level) {
        this.stateSnapshots = [];
        const validateResults = validateLevel(level);

        if (validateResults.length != 0) {
            throw new Error(
                "Failed to load level due to the following errors:\n" +
                    validateResults.map((message) => ` - ${message}\n`).join(""),
            );
        }

        this.initialLevel = structuredClone(level);
        this.level = structuredClone(level);
    }

    /**
     * Move the player `dx` squares right and `dy` squares down.
     *
     * This method will throw an exception if the requested `dx` and `dy` violate
     * the following rules:
     *
     *   - It must be a non-floating point integer. (eg, 0 or 1, not 0.7).
     *   - It must be in the range [-1, 1].
     *   - Cardinal directions only, eg diagonal moves are not allowed.
     */
    move(dx: number, dy: number) {
        // Validate movement argument values are valid.
        if (!Number.isInteger(dx)) {
            throw new TypeError("dx must be an integer value");
        }

        if (!Number.isInteger(dy)) {
            throw new TypeError("dy must be an integer value");
        }

        if (dx < -1 || dx > 1) {
            throw new RangeError("dx must be a single step");
        }

        if (dy < -1 || dy > 1) {
            throw new Error("dy must be a single step");
        }

        if (Math.abs(dx) + Math.abs(dy) !== 1) {
            throw new RangeError("movement must be a cardinal step");
        }

        // Reject out of bounds moves.
        const newX = this.level.player.x + dx;
        const newY = this.level.player.y + dy;

        if (!this.isValidPos(newX, newY)) {
            console.log("out of bounds rejected: dx = " + dx + ", dy = " + dy);
            return false;
        }

        // Reject the move if it results in player moving into a wall.
        if (this.isWallAt(newX, newY)) {
            return false;
        }

        // Check if the move would cause the player to push a box.
        const boxIndex = this.#indexOfBoxAt(newX, newY);

        if (boxIndex !== -1) {
            const boxNewX = newX + dx;
            const boxNewY = newY + dy;

            // Reject the move if the box cannot move.
            if (!this.isValidPos(boxNewX, boxNewY)) {
                return false;
            } else if (this.isWallAt(boxNewX, boxNewY) || this.isBoxAt(boxNewX, boxNewY)) {
                return false;
            }
        }

        // Snapshot and push level state onto the undo stack.
        this.#snapshot();

        // Complete the box move - if the player pushed a box.
        if (boxIndex !== -1) {
            this.level.boxes[boxIndex].x += dx;
            this.level.boxes[boxIndex].y += dy;
        }

        // OK.
        this.level.player.x = newX;
        this.level.player.y = newY;

        return true;
    }

    /** Snapshot the game state for undoing moves. */
    #snapshot() {
        this.stateSnapshots.push(
            new LevelState(
                { ...this.level.player },
                this.level.boxes.map((box) => ({ ...box })),
            ),
        );
    }

    /** Undo the last move. */
    undo() {
        if (this.stateSnapshots.length > 0) {
            const snapshot = this.stateSnapshots.pop();

            if (snapshot) {
                this.level.player = snapshot.player;
                this.level.boxes = snapshot.boxes;

                return true;
            }
        }

        return false;
    }

    /** Reset the level to its starting state. */
    restart() {
        this.level = structuredClone(this.initialLevel);
        this.stateSnapshots = [];
    }

    /** Check if the player has completed the level succesfully. */
    isComplete() {
        const goalCount = this.level.goals.length;
        const boxCount = this.level.boxes.length;

        // Make sure each goal has a box on top of it otherwise the level is not complete.
        for (let goalIndex = 0; goalIndex < goalCount; goalIndex++) {
            const goal = this.level.goals[goalIndex];

            // Are there any boxes on top of this goal?
            let hasBox = false;

            for (let boxIndex = 0; boxIndex < boxCount; boxIndex++) {
                const box = this.level.boxes[boxIndex];

                if (goal.x === box.x && goal.y === box.y) {
                    hasBox = true;
                    break;
                }
            }

            // Reject if no boxes are on the goal.
            if (!hasBox) {
                return false;
            }
        }

        // Looks like all goals have a box on top.
        return true;
    }

    /** Get the tilemap for the level. */
    tilemap() {
        return this.level.tiles;
    }

    /** Get the number of rows in the tilemap. */
    rowCount() {
        return this.level.tiles.length / this.level.colsPerRow;
    }

    /** Get the number of columns per row in the tilemap. */
    colCount() {
        return this.level.colsPerRow;
    }

    /** Get the player position. */
    player() {
        return this.level.player;
    }

    /** Get a list of boxes in the level. */
    boxes() {
        return this.level.boxes;
    }

    /** Check if the position is within the tilemap bounds. */
    isValidPos(x: number, y: number) {
        return y >= 0 && y < this.rowCount() && x >= 0 && x < this.colCount();
    }

    /**
     * Check if a position is a valid movement target for a player or box. This method does not  push
     * logic, so if a box is in the way it will return false.
     */
    canMoveTo(x: number, y: number) {
        return this.isValidPos(x, y) && !this.isWallAt(x, y) && !this.isBoxAt(x, y);
    }

    /**
     * Check if a wall is at the given position.
     */
    isWallAt(x: number, y: number) {
        return (
            this.isValidPos(x, y) && this.level.tiles[y * this.level.colsPerRow + x] === TILE_WALL
        );
    }

    /** Check if a box is at the given position. */
    isBoxAt(x: number, y: number) {
        return this.#indexOfBoxAt(x, y) !== -1;
    }

    /**
     * Get the index of the box at the given position, or `-1` if no such box exists.
     */
    #indexOfBoxAt(x: number, y: number) {
        if (this.isValidPos(x, y)) {
            const boxCount = this.level.boxes.length;

            for (let i = 0; i < boxCount; i++) {
                if (this.level.boxes[i].x === x && this.level.boxes[i].y === y) {
                    return i;
                }
            }
        }

        return -1;
    }

    /** Get a list of goal positions for the level. */
    goals() {
        return this.level.goals;
    }

    /** Check if a goal is at the given position. */
    isGoalAt(x: number, y: number) {
        return this.#indexOfGoalAt(x, y) !== -1;
    }

    /** Get the index of the goal at the given position, or `-1` if no such goal exists. */
    #indexOfGoalAt(x: number, y: number) {
        if (this.isValidPos(x, y)) {
            const goalCount = this.level.goals.length;

            for (let i = 0; i < goalCount; i++) {
                if (this.level.goals[i].x === x && this.level.goals[i].y === y) {
                    return i;
                }
            }
        }

        return -1;
    }
}

/**
 * Performs sanity checks on the level to see if it is playable.
 *
 * This function returns an empty list if the level is valid, or the list of validation checks that
 * failed.
 */
export function validateLevel(level: Level): string[] {
    const errors: string[] = [];

    // The level must be a rectangle with at least one column and row.
    //
    // Any failure in these checks makes tilemap lookups unsafe so return early
    // rather than continue checking.
    if (level.tiles.length == 0) {
        errors.push("tilemaps cannot be zero length");
    } else if (level.colsPerRow < 1) {
        errors.push("tilemaps must have at least one column per row");
    } else if (!Number.isInteger(level.colsPerRow)) {
        errors.push("tilemap column count must be an integer");
    } else if (!Number.isInteger(level.tiles.length / level.colsPerRow)) {
        errors.push("tilemaps must have a consistent column count");
    }

    if (errors.length > 0) {
        return errors;
    }

    // Ensure all tiles are valid types.
    for (let i = 0; i < level.tiles.length; i++) {
        if (level.tiles[i] != TILE_FLOOR && level.tiles[i] != TILE_WALL) {
            errors.push(
                `tile ${i % level.colsPerRow}, ${Math.floor(i / level.colsPerRow)} at index ${i} is not a recognized tile type`,
            );
        }
    }

    // There must be at least one goal.
    const goalCount = level.goals.length;

    if (goalCount < 1) {
        errors.push("level must have at least one goal");
    }

    // Goal and box count should match.
    // TODO: Support variants where this is not true but those levels have a marker.
    const boxCount = level.boxes.length;

    if (goalCount != boxCount) {
        errors.push(
            `the number of goals (${goalCount}) and boxes (${boxCount}) should be the same`,
        );
    }

    // The player, goals and boxes should be within the level bounds and on the floor.
    const rowCount = level.tiles.length / level.colsPerRow;

    function isInBounds(x: number, y: number) {
        return x >= 0 && x < level.colsPerRow && y >= 0 && y < rowCount;
    }

    function isOnFloor(x: number, y: number) {
        return isInBounds(x, y) && level.tiles[y * level.colsPerRow + x] == TILE_FLOOR;
    }

    const entitiesToCheck = [
        { name: "player", x: level.player.x, y: level.player.y },
        ...level.goals.map((goal) => ({ name: "goal", x: goal.x, y: goal.y })),
        ...level.boxes.map((box) => ({ name: "box", x: box.x, y: box.y })),
    ];

    for (let i = 0; i < entitiesToCheck.length; i++) {
        const e = entitiesToCheck[i];

        if (!Number.isInteger(e.x) || !Number.isInteger(e.y)) {
            errors.push(`${e.name} position ${e.x}, ${e.y} must be an integer`);
            return errors; // Return early avoid unsafe tilemap look ups.
        }

        if (!isInBounds(e.x, e.y)) {
            errors.push(
                `${e.name} position ${e.x}, ${e.y} must be in tilemap bounds ${level.colsPerRow} x ${rowCount}`,
            );
        }

        if (!isOnFloor(e.x, e.y)) {
            errors.push(`${e.name} position ${e.x}, ${e.y} must be on a floor tile`);
        }
    }

    // There should be no overlapping goals or boxes (eg, two boxes in the same spot).
    function hasDuplicates(positions: Position[]): [number, number] | null {
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                if (positions[i].x == positions[j].x && positions[i].y == positions[j].y) {
                    return [i, j];
                }
            }
        }

        return null;
    }

    const goalDuplicateResults = hasDuplicates(level.goals);

    if (goalDuplicateResults != null) {
        errors.push(
            `duplicate goal positions found at index ${goalDuplicateResults[0]} and ${goalDuplicateResults[1]}`,
        );
    }

    const boxDuplicateResults = hasDuplicates(level.boxes);

    if (boxDuplicateResults != null) {
        errors.push(
            `duplicate box positions found at index ${boxDuplicateResults[0]} and ${boxDuplicateResults[1]}`,
        );
    }

    // Player should not be inside of a box.
    for (let i = 0; i < level.boxes.length; i++) {
        const box = level.boxes[i];

        if (level.player.x == box.x && level.player.y == box.y) {
            errors.push(`player cannot be at same position as box at index ${i}`);
        }
    }

    //  TODO: Player can reach all boxes and goals without being blocked by walls

    return errors;
}
