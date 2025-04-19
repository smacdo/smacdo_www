/**
 * Calculates the Euclidean distance between two 2D vectors.
 *
 * @param ax The x-coordinate of the first vector.
 * @param ay The y-coordinate of the first vector.
 * @param bx The x-coordinate of the second vector.
 * @param by The y-coordinate of the second vector.
 * @returns The distance between the two vectors.
 *
 * @example
 * ```typescript
 * const distance = vector_distance(1, 2, 4, 6); // Returns 5
 * ```
 */
export function vector_distance(ax: number, ay: number, bx: number, by: number): number {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the squared Euclidean distance between two 2D vectors.
 * This is computationally cheaper than `vector_distance` as it avoids a square root operation.
 *
 * @param ax The x-coordinate of the first vector.
 * @param ay The y-coordinate of the first vector.
 * @param bx The x-coordinate of the second vector.
 * @param by The y-coordinate of the second vector.
 * @returns The squared distance between the two vectors.
 *
 * @example
 * ```typescript
 * const squaredDistance = vector_distance_squared(1, 2, 4, 6); // Returns 25
 * ```
 */
export function vector_distance_squared(ax: number, ay: number, bx: number, by: number): number {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
}

/**
 * Calculates the magnitude (length) of a 2D vector.
 *
 * @param x The x-coordinate of the vector.
 * @param y The y-coordinate of the vector.
 * @returns The length of the vector.
 *
 * @example
 * ```typescript
 * const length = vector_length(3, 4); // Returns 5
 * ```
 */
export function vector_length(x: number, y: number): number {
    return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the angle (in radians) of a 2D vector relative to the positive x-axis.
 * Returns `undefined` if the vector has a length of zero.
 *
 * @param x The x-coordinate of the vector.
 * @param y The y-coordinate of the vector.
 * @returns The angle of the vector in radians, or `undefined` if the vector's length is zero.
 * The angle ranges from -π to π.
 *
 * @example
 * ```typescript
 * const angle = vector_angle(1, 1); // Returns approximately 0.785 (π/4 radians)
 * const zeroVectorAngle = vector_angle(0, 0); // Returns undefined
 * ```
 */
export function vector_angle(x: number, y: number): number | undefined {
    const length = vector_length(x, y);

    if (length === 0) {
        return undefined;
    }

    const norm_x = x / length;
    const norm_y = y / length;

    return Math.atan2(norm_y, norm_x); // NOTE: y` before `x` because atan(y, x).
}

/**
 * Converts an angle from radians to degrees.
 *
 * @param rad The angle in radians.
 * @returns The angle in degrees.
 *
 * @example
 * ```typescript
 * const degrees = rad_to_degree(Math.PI / 2); // Returns 90
 * ```
 */
export function rad_to_degree(rad: number): number {
    return rad * 180 / Math.PI;
}

/**
 * Converts an angle from degrees to radians.
 *
 * @param degree The angle in degrees.
 * @returns The angle in radians.
 *
 * @example
 * ```typescript
 * const radians = degree_to_rad(180); // Returns approximately 3.14159 (π radians)
 * ```
 */
export function degree_to_rad(degree: number): number {
    return degree * Math.PI / 180;
}