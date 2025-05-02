import {clamp} from "../utils.tsx";
import {vector_distance} from "./math.ts";

/** A bounding region. */
export interface Boundable {
    /** The center of the object on the x-axis. */
    x: number;

    /** The center of the object on the y-axis. */
    y: number;
}

/** An axis aligned bounding box. */
export class AABB implements Boundable {
    /** The center of the AABB on the x-axis. */
    x: number;

    /** The center of the AABB on the y-axis. */
    y: number;

    /** Half of the AABB width. */
    halfWidth: number;

    /** Half of the AABB height. */
    halfHeight: number;

    constructor(left: number, top: number, width: number, height: number) {
        this.halfWidth = width / 2.0;
        this.halfHeight = height / 2.0;
        this.x = left + this.halfWidth;
        this.y = top + this.halfHeight;
    }

    get left() {
        return this.x - this.halfWidth;
    }

    get right() {
        return this.x + this.halfWidth;
    }

    get top() {
        return this.y - this.halfHeight;
    }

    get bottom() {
        return this.y + this.halfHeight;
    }

    get width() {
        return 2.0 * this.halfWidth;
    }

    get height() {
        return 2.0 * this.halfHeight;
    }
}

/** A circular bounding box. */
export class Circle implements Boundable {
    /** The center of the circle on the x-axis. */
    x: number;

    /** The center of the circle on the y-axis. */
    y: number;

    /** The circle's radius. */
    radius: number;

    constructor(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}

/**
 * Calculates the interpenetration vector between two possibly colliding bounding regions.
 * `undefined` is returned when `a` and `b` are not intersecting.
 *
 * @param a The first bounding region to test.
 * @param b The second bounding region to test.
 */
export function resolve_collision(a: AABB | Circle, b: AABB): {
    x: number,
    y: number
} | undefined {
    if (a instanceof AABB) {
        return resolve_aabb_aabb_collision(a, b);
    } else {
        return resolve_circle_rect_collision(a, b);
    }
}

/**
 * Returns true if `a` and `b` intersect with each other, false otherwise.
 *
 * @param a The first bounding region to test.
 * @param b The second bounding region to test.
 */
export function intersects(a: AABB | Circle, b: AABB): boolean {
    if (a instanceof AABB) {
        return aabb_aabb_intersects(a, b);
    } else {
        return circle_rect_intersects(a, b);
    }
}

/**
 * Calculates the interpenetration vector between two possibly colliding axis aligned boxes.
 * `undefined` is returned when `a` and `b` are not intersecting.
 *
 * Incorrect cases:
 *  - One AABB fully overlaps the other.
 *
 * @param a The first AABB to test.
 * @param b The second AABB to test.
 */
export function resolve_aabb_aabb_collision(a: AABB, b: AABB): {
    x: number,
    y: number
} | undefined {
    const intersectX = a.right > b.left && b.right > a.left;
    const intersectY = a.top < b.bottom && b.top < a.bottom;

    if (intersectX && intersectY) {
        const left = Math.max(a.left, b.left);
        const right = Math.min(a.right, b.right);
        const top = Math.max(a.top, b.top);
        const bottom = Math.min(a.bottom, b.bottom);

        return {x: right - left, y: bottom - top};
    } else {
        return undefined;
    }
}

/**
 * Returns true if `a` and `b` intersect with each other, false otherwise.
 *
 * @param a The first AABB to test.
 * @param b The second AABB to test.
 */
export function aabb_aabb_intersects(a: AABB, b: AABB): boolean {
    return resolve_aabb_aabb_collision(a, b) !== undefined;
}

/**
 * Calculates the interpenetration vector between a possibly colliding circle and axis aligned box.
 * `undefined` is returned when `a` and `b` are not intersecting.
 *
 * @param a The circle to test.
 * @param b The axis aligned box to test.
 *
 * Incorrect cases:
 *  - Circle center is on the edge or inside the rect.
 *
 * Degenerate cases:
 *  - Zero sized circle (point) inside AABB -> not colliding.
 */
export function resolve_circle_rect_collision(a: Circle, b: AABB): {
    x: number,
    y: number
} | undefined {
    // Calculate difference vector from center of `b` (AABB) to `a` (circle).
    const diff_x = a.x - b.x;
    const diff_y = a.y - b.y;

    // Find the AABB point closest to the circle.
    const clamped_diff_x = clamp(diff_x, -b.halfWidth, b.halfWidth);
    const clamped_diff_y = clamp(diff_y, -b.halfHeight, b.halfHeight);

    const closest_x = b.x + clamped_diff_x;
    const closest_y = b.y + clamped_diff_y;

    // Check if the length of the vector from the center of the circle to the closest point on the
    // AABB is shorter than the circle radius (intersects) or not.
    if (vector_distance(closest_x, closest_y, a.x, a.y) < a.radius) {
        const r_x = a.x - closest_x;
        const r_y = a.y - closest_y;

        return {x: r_x, y: r_y};
    } else {
        return undefined;
    }
}

/**
 * Returns true if `a` and `b` intersect with each other, false otherwise.
 *
 * @param a The circle to test.
 * @param b The axis aligned box to test.
 */
export function circle_rect_intersects(a: Circle, b: AABB): boolean {
    return resolve_circle_rect_collision(a, b) !== undefined;
}