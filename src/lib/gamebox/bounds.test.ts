import {
    AABB,
    aabb_aabb_intersects,
    Circle,
    circle_rect_intersects,
    resolve_aabb_aabb_collision,
    resolve_circle_rect_collision
} from "./bounds.ts";

function createAABB(left: number, right: number, width: number, height: number) {
    return new AABB(left, right, width, height);
}

function createCircle(x: number, y: number, radius: number) {
    return new Circle(x, y, radius);
}

describe('AABB', () => {
    it('should set x and y center properties from the constructor', () => {
        const a = new AABB(5, 12, 6, 8);
        expect(a.x).toBe(8);
        expect(a.y).toBe(16);
    });

    it('should set half width and height properties from the constructor', () => {
        const a = new AABB(5, 12, 6, 8);
        expect(a.halfWidth).toBe(3);
        expect(a.halfHeight).toBe(4);
    });

    it('should calculate left, right, top and bottom values', () => {
        const a = new AABB(5, 12, 6, 8);
        expect(a.left).toBe(5);
        expect(a.right).toBe(11);
        expect(a.top).toBe(12);
        expect(a.bottom).toBe(20);
    });

    it('should calculate width and height values', () => {
        const a = new AABB(5, 12, 6, 8);
        expect(a.width).toBe(6);
        expect(a.height).toBe(8);
    });
});

describe('Circle', () => {
    it('should set the x, y and radius properties from the constructor', () => {
        const c = new Circle(-5, 13, 7);
        expect(c.x).toBe(-5);
        expect(c.y).toBe(13);
        expect(c.radius).toBe(7);
    });
});

describe('rect_rect_intersects', () => {
    it('should return true when a and b are the same rectangle', () => {
        const a = createAABB(1, 1, 4, 4);
        const b = createAABB(1, 1, 4, 4);
        expect(aabb_aabb_intersects(a, b)).toBe(true);
        expect(resolve_aabb_aabb_collision(a, b)).toStrictEqual({x: 4, y: 4});
    });

    it('should return true when a completely overlaps b', () => {
        const a = createAABB(0, 0, 10, 10);
        const b = createAABB(2, 2, 5, 5);
        expect(aabb_aabb_intersects(a, b)).toBe(true);

        // NOTE: the returned vector here isn't correct as the resolve function cannot solve when
        //       one of the inputs is fully contained in the other.
        expect(resolve_aabb_aabb_collision(a, b)).toStrictEqual({x: 5, y: 5});
    });

    it('should return true when b completely overlaps a', () => {
        const a = createAABB(2, 2, 5, 5);
        const b = createAABB(0, 0, 10, 10);
        expect(aabb_aabb_intersects(a, b)).toBe(true);

        // NOTE: the returned vector here isn't correct as the resolve function cannot solve when
        //       one of the inputs is fully contained in the other.
        expect(resolve_aabb_aabb_collision(a, b)).toStrictEqual({x: 5, y: 5});
    });

    it('should return true for partial overlap', () => {
        const a = createAABB(0, 0, 5, 5);
        const b = createAABB(3, 3, 5, 5);
        expect(aabb_aabb_intersects(a, b)).toBe(true);
        expect(resolve_aabb_aabb_collision(a, b)).toStrictEqual({x: 2, y: 2});
    });

    it('should return false when a right edge touches b left edge', () => {
        const a = createAABB(0, 0, 5, 5);
        const b = createAABB(5, 0, 5, 5);
        expect(aabb_aabb_intersects(a, b)).toBe(false);
        expect(resolve_aabb_aabb_collision(a, b)).toBeUndefined();
    });

    it('should return false when b right edge touches a left edge', () => {
        const a = createAABB(5, 0, 5, 5);
        const b = createAABB(0, 0, 5, 5);
        expect(aabb_aabb_intersects(a, b)).toBe(false);
        expect(resolve_aabb_aabb_collision(a, b)).toBeUndefined();
    });

    it('should return false when a bottom edge touches b top edge', () => {
        const a = createAABB(0, 0, 5, 5);
        const b = createAABB(0, 5, 5, 5);
        expect(aabb_aabb_intersects(a, b)).toBe(false);
        expect(resolve_aabb_aabb_collision(a, b)).toBeUndefined();
    });

    it('should return false when b bottom edge touches a top edge', () => {
        const a = createAABB(0, 5, 5, 5);
        const b = createAABB(0, 0, 5, 5);
        expect(aabb_aabb_intersects(a, b)).toBe(false);
        expect(resolve_aabb_aabb_collision(a, b)).toBeUndefined();
    });

    it('should return false when corners touch (e.g. a top-right touches b bottom-left)', () => {
        const a = createAABB(0, 0, 5, 5);
        const b = createAABB(5, 5, 5, 5);
        expect(aabb_aabb_intersects(a, b)).toBe(false);
        expect(resolve_aabb_aabb_collision(a, b)).toBeUndefined();
    });

    it('should return false when a is completely to the left of b', () => {
        const a = createAABB(0, 0, 3, 3);
        const b = createAABB(5, 0, 3, 3);
        expect(aabb_aabb_intersects(a, b)).toBe(false);
        expect(resolve_aabb_aabb_collision(a, b)).toBeUndefined();
    });

    it('should return false when a is completely to the right of b', () => {
        const a = createAABB(5, 0, 3, 3);
        const b = createAABB(0, 0, 3, 3);
        expect(aabb_aabb_intersects(a, b)).toBe(false);
        expect(resolve_aabb_aabb_collision(a, b)).toBeUndefined();
    });

    it('should return false when a is completely above b', () => {
        const a = createAABB(0, 0, 3, 3);
        const b = createAABB(0, 5, 3, 3);
        expect(aabb_aabb_intersects(a, b)).toBe(false);
        expect(resolve_aabb_aabb_collision(a, b)).toBeUndefined();
    });

    it('should return false when a is completely below b', () => {
        const a = createAABB(0, 5, 3, 3);
        const b = createAABB(0, 0, 3, 3);
        expect(aabb_aabb_intersects(a, b)).toBe(false);
        expect(resolve_aabb_aabb_collision(a, b)).toBeUndefined();
    });

    it('should return false when a is diagonally separated (top-left to bottom-right)', () => {
        const a = createAABB(0, 0, 2, 2);
        const b = createAABB(3, 3, 2, 2);
        expect(aabb_aabb_intersects(a, b)).toBe(false);
        expect(resolve_aabb_aabb_collision(a, b)).toBeUndefined();
    });

    it('should return false when a is diagonally separated (top-right to bottom-left)', () => {
        const a = createAABB(3, 0, 2, 2);
        const b = createAABB(0, 3, 2, 2);
        expect(aabb_aabb_intersects(a, b)).toBe(false);
        expect(resolve_aabb_aabb_collision(a, b)).toBeUndefined();
    });
});

describe('check_circle_rect_intersect', () => {
    // 1. Circle's Center Inside the AABB
    it('should return true when the circle\'s center is strictly inside the AABB', () => {
        const aabb = createAABB(0, 0, 10, 10);
        const circle = createCircle(5, 5, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    // 2. AABB's Corners Inside the Circle
    it('should return true when one of the AABB\'s corners is inside the circle', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(6, 6, 3); // Bottom-right corner (5, 5) is inside
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
        expect(resolve_circle_rect_collision(circle, aabb)).toStrictEqual({x: Math.sqrt(1), y: Math.sqrt(1)});
    });

    it('should return true when one of the AABB\'s corners is the center of the circle', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(0, 5, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
        expect(resolve_circle_rect_collision(circle, aabb)).toStrictEqual({x: 0, y: 0});
    });

    // 3. Circle Intersecting the Edges of the AABB
    it('should return false when the circle intersects the top edge', () => {
        const aabb = createAABB(0, 5, 10, 5);
        const circle = createCircle(5, 2, 3);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle intersects the bottom edge', () => {
        const aabb = createAABB(0, 0, 10, 5);
        const circle = createCircle(5, 8, 3);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle intersects the left edge', () => {
        const aabb = createAABB(5, 0, 5, 10);
        const circle = createCircle(2, 5, 3);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle intersects the right edge', () => {
        const aabb = createAABB(0, 0, 5, 10);
        const circle = createCircle(8, 5, 3);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle\'s edge touches a corner externally', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(6, 6, Math.sqrt(2)); // Distance from (5,5) to (6,6)
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    // 4. Circle Completely Outside the AABB
    it('should return false when the circle is completely to the left', () => {
        const aabb = createAABB(5, 0, 5, 5);
        const circle = createCircle(1, 2, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle is completely to the right', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(9, 2, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle is completely above', () => {
        const aabb = createAABB(0, 5, 5, 5);
        const circle = createCircle(2, 1, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle is completely below', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(2, 9, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle is diagonally separated (top-left)', () => {
        const aabb = createAABB(3, 3, 5, 5);
        const circle = createCircle(0, 0, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle is diagonally separated (bottom-right)', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(8, 8, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    // 5. Circle Touching the AABB (No Overlap)
    it('should return false when the circle touches the left edge externally', () => {
        const aabb = createAABB(2, 0, 5, 5);
        const circle = createCircle(0, 2, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle touches the top edge externally', () => {
        const aabb = createAABB(0, 2, 5, 5);
        const circle = createCircle(2, 0, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle touches a corner externally (top-left)', () => {
        const aabb = createAABB(1, 1, 3, 3);
        const circle = createCircle(0, 0, Math.sqrt(2));
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    // 6. Special Cases
    it('should return false when the circle has zero radius and its center is on the AABB edge', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(5, 2, 0);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle has zero radius and its center is inside the AABB', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(2, 2, 0);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });

    it('should return false when the circle has zero radius and its center is outside the AABB', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(6, 6, 0);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
    });

    it('should handle an AABB with zero width intersecting a circle', () => {
        const aabb = createAABB(2, 0, 0, 5); // Vertical line
        const circle = createCircle(2, 2, 1);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    it('should handle an AABB with zero height intersecting a circle', () => {
        const aabb = createAABB(0, 2, 5, 0); // Horizontal line
        const circle = createCircle(2, 2, 1);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    it('should handle an AABB with zero width and height (a point) intersecting a circle', () => {
        const aabb = createAABB(2, 2, 0, 0); // A point
        const circle = createCircle(2, 2, 1);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    it('should return false when a zero-size AABB (point) is outside the circle', () => {
        const aabb = createAABB(5, 5, 0, 0);
        const circle = createCircle(0, 0, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
        expect(resolve_circle_rect_collision(circle, aabb)).toBeUndefined();
    });
});