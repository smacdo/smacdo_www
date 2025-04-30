import {clamp} from "../utils.tsx";
import {vector_distance} from "./math.ts";

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

export function rect_rect_intersects(a: AxisAlignedBoundableBox, b: AxisAlignedBoundableBox): boolean {
    const intersectX = a.right() >= b.left() && b.right() >= a.left();
    const intersectY = a.top() <= b.bottom() && b.top() <= a.bottom();
    return intersectX && intersectY;
}

/**
 * Calculates the minimum interpenetration vector between a possibly colliding circle `a` and axis
 * aligned bounding box `b`. Adding the returned `(x, y)` vector to a's position will move the
 * circle to the closest point such that it no longer penetrates `b`.
 *
 * `null` is returned if the two shapes are not colliding with each other.
 */
export function resolve_circle_rect_collision(a: CircleBoundable, b: AxisAlignedBoundableBox): {
    x: number,
    y: number
} | null {
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
    if (vector_distance(closest_x, closest_y, a.x, a.y) <= a.radius) {
        const r_x = closest_x - a.x;
        const r_y = closest_y - a.y;

        return {x: r_x, y: r_y};
    } else {
        return null;
    }
}

export function circle_rect_intersects(a: CircleBoundable, b: AxisAlignedBoundableBox): boolean {
    return resolve_circle_rect_collision(a, b) !== null;
}