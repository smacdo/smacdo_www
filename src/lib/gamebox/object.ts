import {AABB, Circle} from "./bounds.ts";

export class GameObject {
    prev_x: number = 0; // TODO: Rename prevX
    prev_y: number = 0; // TODO: Rename prevY
    /** object movement velocity in the x direction (0 for none). */
    vel_x: number = 0; // TODO: Rename velX
    /** object movement velocity in the y direction (0 for none). */
    vel_y: number = 0; // TODO:  Rename velY
    aabb: AABB;
    preciseBounds: AABB | Circle;

    constructor(aabb: AABB, preciseBounds?: AABB | Circle) { // TODO: calculate aabb from preciseBounds.
        this.aabb = aabb;
        this.preciseBounds = preciseBounds ?? aabb;
    }

    get x() {
        return this.aabb.x;
    }

    set x(x: number) {
        this.aabb.x = x;

        if (this.preciseBounds) {
            this.preciseBounds.x = x;
        }
    }

    get y() {
        return this.aabb.y;
    }

    set y(y: number) {
        this.aabb.y = y;

        if (this.preciseBounds) {
            this.preciseBounds.y = y;
        }
    }
}