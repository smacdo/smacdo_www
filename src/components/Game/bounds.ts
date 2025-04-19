import {clamp} from "../../utils.tsx";
import {vector_distance} from "./mathutils.ts";

export interface AxisAlignedBoundableBox {
    /// Object position on the x axis.
    /// The x position is halfway between the object left and right.
    x: number;

    /// Object position on the y axis.
    /// The y position is halfway between the object top and bottom.
    y: number;

    /// Half of the width of the bounding box.
    halfWidth: number;

    /// Half of the height of the bounding box.
    halfHeight: number;

    /// Get the object's left position.
    left(): number;

    /// Get the object's top position.
    top(): number;

    /// Get the object's right position.
    right(): number;

    /// Get the object's bottom position.
    bottom(): number;

    /// Get the object's width.
    width(): number;

    /// Get the object's height.
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

export interface CircleBoundable {
    x: number;
    y: number;
    radius: number;
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

/// Returns a (x, y) vector to apply to the circle `a` parameter to resolve the collision. Alternatively apply it to `b`
/// as (-x, -y) to resolve the collision. If the two objects do not collide then `undefined` is returned.


/// Calculates the minimum interpenetration vector between a possibly colliding circle `a` and axis aligned bounding box
/// `b`. Adding the returned `(x, y)` vector to a's position will move the circle to the closest point such that it no
/// longer penetrates `b`.
///
/// `undefined` is returned if the two shapes are not colliding with each other.
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
    if (vector_distance(closest_x, closest_y, a.x, a.y) <= a.radius) {
        return {x: diff_x, y: diff_y};
    } else {
        return undefined;
    }
}

export function circle_rect_intersects(a: CircleBoundable, b: AxisAlignedBoundableBox): boolean {
    return resolve_circle_rect_collision(a, b) !== undefined;
}