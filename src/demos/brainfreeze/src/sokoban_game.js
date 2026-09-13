export const TILE_WALL = 1;

// TODO: Add validation when loading the level that the following invariants hold:
//  - Goals > 0
//  - Goals == boxes (in the future we can support unequal counts for varations, but level requires flag).
//  - Player, goals and boxes are in bounds.
//  - Player, goals and boxes are on the floor (not in a wall).
//  - No overlapping goals or boxes. (eg no boxes have duplicate positions, same for goals).
//  - Player is not inside of a box.
//  - Tilemap colsPerRow is divisble by the length (eg col count holds).
//  - Player can reach all boxes and goals without being blocked by walls (STRETCH).
export class SokobanGame {
  /**
   * @param {import("./level.js").Level} level
   */
  constructor(level) {
    this.initialLevel = structuredClone(level);
    this.level = structuredClone(level);

    // TODO: Validate the level.
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
   *
   * @param {number} dx
   * @param {number} dy
   */
  move(dx, dy) {
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
    const newX = this.level.player[0] + dx;
    const newY = this.level.player[1] + dy;

    if (!this.isValidPos(newX, newY)) {
      console.log("out of bounds rejected: dx = " + dx + ", dy = " + dy);
      return false;
    }

    // Reject the move if it results in player moving into a wall.
    if (this.isWallAt(newX, newY)) {
      return false;
    }

    // Check if the move would make the player move into a box.
    const boxIndex = this.#indexOfBoxAt(newX, newY);

    if (boxIndex !== -1) {
      const boxNewX = newX + dx;
      const boxNewY = newY + dy;

      // Reject the move if the box cannot move.
      if (!this.isValidPos(boxNewX, boxNewY)) {
        return false;
      } else if (
        this.isWallAt(boxNewX, boxNewY) ||
        this.isBoxAt(boxNewX, boxNewY)
      ) {
        return false;
      }

      // Move the box.
      this.level.boxes[boxIndex][0] += dx;
      this.level.boxes[boxIndex][1] += dy;
    }

    // OK.
    this.level.player[0] = newX;
    this.level.player[1] = newY;

    return true;
  }

  /** Reset the level to its starting state. */
  restart() {
    this.level = structuredClone(this.initialLevel);
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

        if (goal[0] === box[0] && goal[1] === box[1]) {
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

  /**
   * Check if the position is within the tilemap bounds.
   *
   * @param {number} x
   * @param {number} y
   */
  isValidPos(x, y) {
    return y >= 0 && y < this.rowCount() && x >= 0 && x < this.colCount();
  }

  /**
   * Check if a position is a valid movement target for a player or box. This method does not  push
   * logic, so if a box is in the way it will return false.
   *
   * @param {number} x
   * @param {number} y
   */
  canMoveTo(x, y) {
    return this.isValidPos(x, y) && !this.isWallAt(x, y) && !this.isBoxAt(x, y);
  }

  /**
   * Check if a wall is at the given position.
   *
   * @param {number} x
   * @param {number} y
   */
  isWallAt(x, y) {
    return (
      this.isValidPos(x, y) &&
      this.level.tiles[y * this.level.colsPerRow + x] === TILE_WALL
    );
  }

  /**
   * Check if a box is at the given position.
   *
   * @param {number} x
   * @param {number} y
   */
  isBoxAt(x, y) {
    return this.#indexOfBoxAt(x, y) !== -1;
  }

  /**
   * Get the index of the box at the given position, or `-1` if no such box exists.
   *
   * @param {number} x
   * @param {number} y
   */
  #indexOfBoxAt(x, y) {
    if (this.isValidPos(x, y)) {
      let boxCount = this.level.boxes.length;

      for (let i = 0; i < boxCount; i++) {
        if (this.level.boxes[i][0] === x && this.level.boxes[i][1] === y) {
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

  /**
   * Check if a goal is at the given position.
   *
   * @param {number} x
   * @param {number} y
   */
  isGoalAt(x, y) {
    return this.#indexOfGoalAt(x, y) !== -1;
  }

  /**
   * Get the index of the goal at the given position, or `-1` if no such goal exists.
   *
   * @param {number} x
   * @param {number} y
   */
  #indexOfGoalAt(x, y) {
    if (this.isValidPos(x, y)) {
      let goalCount = this.level.goals.length;

      for (let i = 0; i < goalCount; i++) {
        if (this.level.goals[i][0] === x && this.level.goals[i][1] === y) {
          return i;
        }
      }
    }

    return -1;
  }
}
