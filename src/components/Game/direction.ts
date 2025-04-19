import {rad_to_degree, vector_angle} from "./mathutils.ts";

/**
 * Represents the four cardinal directions.
 */
export enum Direction {
    East = 1,
    North = 2,
    West = 3,
    South = 4,
}

/**
 * Returns the closest cardinal direction for a 2D vector.
 * Returns `undefined` if the input vector has a length of zero.
 *
 * @param x The x-coordinate of the vector.
 * @param y The y-coordinate of the vector.
 * @returns The `Direction` enum value representing the vector's direction,
 * or `undefined` if the vector's length is zero.
 *
 * @example
 * ```typescript
 * const direction1 = vector_direction(1, 0); // Returns Direction.East
 * const direction2 = vector_direction(0, 1); // Returns Direction.North
 * const zeroVectorDirection = vector_direction(0, 0); // Returns undefined
 * ```
 */
export function vector_direction(x: number, y: number): Direction | undefined {
    const angle = vector_angle(x, y);

    if (angle === undefined) {
        return undefined;
    }

    const degree = rad_to_degree(angle);

    if (degree < 45) {
        return Direction.East;
    } else if (degree < 135) {
        return Direction.North;
    } else if (degree < 225) {
        return Direction.West;
    } else if (degree < 315) {
        return Direction.South;
    } else {
        return Direction.East;
    }
}