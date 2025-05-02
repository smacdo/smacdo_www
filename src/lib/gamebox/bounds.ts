import {clamp} from "../utils.tsx";
import {vector_distance} from "./math.ts";

// TODO: Merge the interface / class divide in this file.
// TODO: Convert methods to properties?

/** A bounding region. */
export interface Boundable {
    /** The center of the object on the x-axis. */
    x: number;

    /** The center of the object on the y-axis. */
    y: number;
}

/** A bounding region defined by an axis aligned box. */
export interface AxisAlignedBoundableBox extends Boundable {
    /** Half of the width of the bounding box. */
    readonly halfWidth: number;

    /** Half of the height of the bounding box. */
    readonly halfHeight: number;

    /** Get the bounding box's leftmost position on the x-axis. */
    left(): number;

    /** Get the bounding box's topmost position on the y-axis. */
    top(): number;

    /** Get the bounding box's rightmost position on the x-axis. */
    right(): number;

    /** Get the bounding box's bottommost position on the y-axis. */
    bottom(): number;

    /** Get the width of the bounding box. */
    width(): number;

    /** Get the height of the bounding box. */
    height(): number;
}

export class AABB implements AxisAlignedBoundableBox {
    x: number;
    y: number;
    halfWidth: number;
    halfHeight: number;

    constructor(left: number, top: number, width: number, height: number) {
        this.halfWidth = width / 2.0;
        this.halfHeight = height / 2.0;
        this.x = left + this.halfWidth;
        this.y = top + this.halfHeight;
    }

    public left() {
        return this.x - this.halfWidth;
    }

    public right() {
        return this.x + this.halfWidth;
    }

    public top() {
        return this.y - this.halfHeight;
    }

    public bottom() {
        return this.y + this.halfHeight;
    }

    public width() {
        return 2.0 * this.halfWidth;
    }

    public height() {
        return 2.0 * this.halfHeight;
    }
}

/** A bounding region defined by a circle. */
export interface CircleBoundable extends Boundable {
    /** The radius of the circle. */
    readonly radius: number;
}

export class Circle {
    constructor(public x: number, public y: number, public radius: number) {
    }
}

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
 * Calculates the interpenetration vector between two possibly colliding axis aligned boxes.
 * `undefined` is returned when `a` and `b` are not intersecting.
 *
 * Incorrect cases:
 *  - One AABB fully overlaps the other.
 *
 * @param a The first AABB to test.
 * @param b The second AABB to test.
 */
export function resolve_aabb_aabb_collision(a: AxisAlignedBoundableBox, b: AxisAlignedBoundableBox): {
    x: number,
    y: number
} | undefined {
    const intersectX = a.right() > b.left() && b.right() > a.left();
    const intersectY = a.top() < b.bottom() && b.top() < a.bottom();

    if (intersectX && intersectY) {
        const left = Math.max(a.left(), b.left());
        const right = Math.min(a.right(), b.right());
        const top = Math.max(a.top(), b.top());
        const bottom = Math.min(a.bottom(), b.bottom());

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
export function aabb_aabb_intersects(a: AxisAlignedBoundableBox, b: AxisAlignedBoundableBox): boolean {
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
export function resolve_circle_rect_collision(a: CircleBoundable, b: AxisAlignedBoundableBox): {
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

export function circle_rect_intersects(a: CircleBoundable, b: AxisAlignedBoundableBox): boolean {
    return resolve_circle_rect_collision(a, b) !== undefined;
}