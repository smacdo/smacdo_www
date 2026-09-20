import { Box, cloneLevel, Level, Player, Position } from "./level.ts";

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
    _initialLevel: Level;
    _level: Level;
    _stateSnapshots: LevelState[];

    constructor(level: Level) {
        this._stateSnapshots = [];
        const validateResults = validateLevel(level);

        if (validateResults.length != 0) {
            throw new Error(
                "Failed to load level due to the following errors:\n" +
                    validateResults.map((message) => ` - ${message}\n`).join(""),
            );
        }

        this._initialLevel = cloneLevel(level);
        this._level = cloneLevel(level);
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
        const newX = this._level.player.x + dx;
        const newY = this._level.player.y + dy;

        if (!this._level.tiles.isInBounds(newX, newY)) {
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
            if (!this._level.tiles.isInBounds(boxNewX, boxNewY)) {
                return false;
            } else if (this.isWallAt(boxNewX, boxNewY) || this.isBoxAt(boxNewX, boxNewY)) {
                return false;
            }
        }

        // Snapshot and push level state onto the undo stack.
        this.#snapshot();

        // Complete the box move - if the player pushed a box.
        if (boxIndex !== -1) {
            this._level.boxes[boxIndex].x += dx;
            this._level.boxes[boxIndex].y += dy;
        }

        // OK.
        this._level.player.x = newX;
        this._level.player.y = newY;

        return true;
    }

    /** Snapshot the game state for undoing moves. */
    #snapshot() {
        this._stateSnapshots.push(
            new LevelState(
                { ...this._level.player },
                this._level.boxes.map((box) => ({ ...box })),
            ),
        );
    }

    /** Undo the last move. */
    undo() {
        if (this._stateSnapshots.length > 0) {
            const snapshot = this._stateSnapshots.pop();

            if (snapshot) {
                this._level.player = snapshot.player;
                this._level.boxes = snapshot.boxes;

                return true;
            }
        }

        return false;
    }

    /** Reset the level to its starting state. */
    restart() {
        this._level = cloneLevel(this._initialLevel);
        this._stateSnapshots = [];
    }

    /** Check if the player has completed the level succesfully. */
    isComplete() {
        const goalCount = this._level.goals.length;
        const boxCount = this._level.boxes.length;

        // Make sure each goal has a box on top of it otherwise the level is not complete.
        for (let goalIndex = 0; goalIndex < goalCount; goalIndex++) {
            const goal = this._level.goals[goalIndex];

            // Are there any boxes on top of this goal?
            let hasBox = false;

            for (let boxIndex = 0; boxIndex < boxCount; boxIndex++) {
                const box = this._level.boxes[boxIndex];

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
    get tilemap() {
        return this._level.tiles;
    }

    /** Get the player position. */
    get player() {
        return this._level.player;
    }

    /** Get a list of boxes in the level. */
    get boxes() {
        return this._level.boxes;
    }

    /**
     * Check if a position is a valid movement target for a player or box. This method does not  push
     * logic, so if a box is in the way it will return false.
     */
    canMoveTo(x: number, y: number) {
        return this._level.tiles.isInBounds(x, y) && !this.isWallAt(x, y) && !this.isBoxAt(x, y);
    }

    /**
     * Check if a wall is at the given position.
     */
    isWallAt(x: number, y: number) {
        return this._level.tiles.isInBounds(x, y) && this._level.tiles.get(x, y) === TILE_WALL;
    }

    /** Check if a box is at the given position. */
    isBoxAt(x: number, y: number) {
        return this.#indexOfBoxAt(x, y) !== -1;
    }

    /**
     * Get the index of the box at the given position, or `-1` if no such box exists.
     */
    #indexOfBoxAt(x: number, y: number) {
        const boxCount = this._level.boxes.length;

        for (let i = 0; i < boxCount; i++) {
            if (this._level.boxes[i].x === x && this._level.boxes[i].y === y) {
                return i;
            }
        }

        return -1;
    }

    /** Get a list of goal positions for the level. */
    get goals() {
        return this._level.goals;
    }

    /** Check if a goal is at the given position. */
    isGoalAt(x: number, y: number) {
        return this.#indexOfGoalAt(x, y) !== -1;
    }

    /** Get the index of the goal at the given position, or `-1` if no such goal exists. */
    #indexOfGoalAt(x: number, y: number) {
        const goalCount = this._level.goals.length;

        for (let i = 0; i < goalCount; i++) {
            if (this._level.goals[i].x === x && this._level.goals[i].y === y) {
                return i;
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
    if (level.tiles.length == 0) {
        errors.push("tilemaps cannot be zero length");
    }

    // Ensure all tiles are valid types.
    for (let y = 0; y < level.tiles.rows; y++) {
        for (let x = 0; x < level.tiles.cols; x++) {
            const tile = level.tiles.get(x, y);

            if (tile != TILE_FLOOR && tile != TILE_WALL) {
                errors.push(`tile ${x}, ${y} is not a recognized tile type`);
            }
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
    const entitiesToCheck = [
        { name: "player", x: level.player.x, y: level.player.y },
        ...level.goals.map((goal) => ({ name: "goal", x: goal.x, y: goal.y })),
        ...level.boxes.map((box) => ({ name: "box", x: box.x, y: box.y })),
    ];

    for (let i = 0; i < entitiesToCheck.length; i++) {
        const e = entitiesToCheck[i];

        if (!Number.isInteger(e.x) || !Number.isInteger(e.y)) {
            errors.push(`${e.name} position ${e.x}, ${e.y} must be an integer`);
        } else if (!level.tiles.isInBounds(e.x, e.y)) {
            errors.push(
                `${e.name} position ${e.x}, ${e.y} must be in tilemap bounds ${level.tiles.cols} x ${level.tiles.rows}`,
            );
        } else if (level.tiles.get(e.x, e.y) != TILE_FLOOR) {
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

    //  TODO: Player can reach all boxes and goals without being blocked by walls.
    return errors;
}
