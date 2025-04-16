import {AABB, Circle} from "./bounds.ts";

export interface GameObject {
    /// Object's center position on the X axis.
    x: number;
    /// Object's center position on the Y axis.
    y: number;
    /// object movement velocity in the x direction (0 for none).
    vel_x: number;
    /// object movement velocity in the y direction (0 for none).
    vel_y: number;
}

export class AabbGameObject extends AABB {
    constructor(left: number, top: number, width: number, height: number, public vel_x: number, public vel_y: number) {
        super(left, top, width, height);
    }
}

export class CircleGameObject extends Circle {
    constructor(x: number, y: number, radius: number, public vel_x: number, public vel_y: number) {
        super(x, y, radius);
    }
}