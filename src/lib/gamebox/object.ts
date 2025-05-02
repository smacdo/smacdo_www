import {AABB, Circle} from "./bounds.ts";

export class GameObject {
    prevX: number = 0;
    prevY: number = 0;
    /** object movement velocity in the x direction (0 for none). */
    velX: number = 0;
    /** object movement velocity in the y direction (0 for none). */
    velY: number = 0;
    aabb: AABB;
    preciseBounds: AABB | Circle;

    constructor(bounds: AABB | Circle) {
        if (bounds instanceof AABB) {
            this.aabb = bounds;
            this.preciseBounds = bounds;
        } else {
            this.aabb = new AABB(bounds.x - bounds.radius, bounds.y - bounds.radius, bounds.radius * 2, bounds.radius * 2);
            this.preciseBounds = bounds;
        }
    }

    /** Get the center of the object on the x-axis. */
    get x() {
        return this.aabb.x;
    }

    /** Set the center of the object on the x-axis. */
    set x(x: number) {
        this.aabb.x = x;

        if (this.preciseBounds) {
            this.preciseBounds.x = x;
        }
    }

    /** Get the center of the object on the y-axis. */
    get y() {
        return this.aabb.y;
    }

    /** Set the center of the object on the x-axis. */
    set y(y: number) {
        this.aabb.y = y;

        if (this.preciseBounds) {
            this.preciseBounds.y = y;
        }
    }
}