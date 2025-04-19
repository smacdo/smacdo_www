import {AABB, Circle} from "./bounds.ts";

export interface GameObject {
    x: number;
    y: number;

    prev_x: number;
    prev_y: number;

    /// object movement velocity in the x direction (0 for none).
    vel_x: number;
    /// object movement velocity in the y direction (0 for none).
    vel_y: number;
}

export class AabbGameObject extends AABB implements GameObject {
    prev_x: number = 0;
    prev_y: number = 0;

    constructor(left: number, top: number, width: number, height: number, public vel_x: number, public vel_y: number) {
        super(left, top, width, height);
    }
}

export class CircleGameObject extends Circle implements GameObject {
    prev_x: number = 0;
    prev_y: number = 0;

    constructor(x: number, y: number, radius: number, public vel_x: number, public vel_y: number) {
        super(x, y, radius);
    }
}