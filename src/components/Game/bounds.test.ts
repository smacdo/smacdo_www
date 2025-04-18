import {AABB, Circle, circle_rect_intersects, rect_rect_intersects} from "./bounds.ts";

function createAABB(left: number, right: number, width: number, height: number) {
    return new AABB(left, right, width, height);
}

function createCircle(x: number, y: number, radius: number) {
    return new Circle(x, y, radius);
}

describe('rect_rect_intersects', () => {
    it('should return true when a and b are the same rectangle', () => {
        const a = createAABB(1, 1, 4, 4);
        const b = createAABB(1, 1, 4, 4);
        expect(rect_rect_intersects(a, b)).toBe(true);
    });

    it('should return true when a completely overlaps b', () => {
        const a = createAABB(0, 0, 10, 10);
        const b = createAABB(2, 2, 5, 5);
        expect(rect_rect_intersects(a, b)).toBe(true);
    });

    it('should return true when b completely overlaps a', () => {
        const a = createAABB(2, 2, 5, 5);
        const b = createAABB(0, 0, 10, 10);
        expect(rect_rect_intersects(a, b)).toBe(true);
    });

    it('should return true for partial overlap', () => {
        const a = createAABB(0, 0, 5, 5);
        const b = createAABB(3, 3, 5, 5);
        expect(rect_rect_intersects(a, b)).toBe(true);
    });

    it('should return true when a right edge touches b left edge', () => {
        const a = createAABB(0, 0, 5, 5);
        const b = createAABB(5, 0, 5, 5);
        expect(rect_rect_intersects(a, b)).toBe(true);
    });

    it('should return true when b right edge touches a left edge', () => {
        const a = createAABB(5, 0, 5, 5);
        const b = createAABB(0, 0, 5, 5);
        expect(rect_rect_intersects(a, b)).toBe(true);
    });

    it('should return true when a bottom edge touches b top edge', () => {
        const a = createAABB(0, 0, 5, 5);
        const b = createAABB(0, 5, 5, 5);
        expect(rect_rect_intersects(a, b)).toBe(true);
    });

    it('should return true when b bottom edge touches a top edge', () => {
        const a = createAABB(0, 5, 5, 5);
        const b = createAABB(0, 0, 5, 5);
        expect(rect_rect_intersects(a, b)).toBe(true);
    });

    it('should return true when corners touch (e.g. a top-right touches b bottom-left)', () => {
        const a = createAABB(0, 0, 5, 5);
        const b = createAABB(5, 5, 5, 5);
        expect(rect_rect_intersects(a, b)).toBe(true);
    });

    it('should return false when a is completely to the left of b', () => {
        const a = createAABB(0, 0, 3, 3);
        const b = createAABB(5, 0, 3, 3);
        expect(rect_rect_intersects(a, b)).toBe(false);
    });

    it('should return false when a is completely to the right of b', () => {
        const a = createAABB(5, 0, 3, 3);
        const b = createAABB(0, 0, 3, 3);
        expect(rect_rect_intersects(a, b)).toBe(false);
    });

    it('should return false when a is completely above b', () => {
        const a = createAABB(0, 0, 3, 3);
        const b = createAABB(0, 5, 3, 3);
        expect(rect_rect_intersects(a, b)).toBe(false);
    });

    it('should return false when a is completely below b', () => {
        const a = createAABB(0, 5, 3, 3);
        const b = createAABB(0, 0, 3, 3);
        expect(rect_rect_intersects(a, b)).toBe(false);
    });

    it('should return false when a is diagonally separated (top-left to bottom-right)', () => {
        const a = createAABB(0, 0, 2, 2);
        const b = createAABB(3, 3, 2, 2);
        expect(rect_rect_intersects(a, b)).toBe(false);
    });

    it('should return false when a is diagonally separated (top-right to bottom-left)', () => {
        const a = createAABB(3, 0, 2, 2);
        const b = createAABB(0, 3, 2, 2);
        expect(rect_rect_intersects(a, b)).toBe(false);
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
    });

    // 3. Circle Intersecting the Edges of the AABB
    it('should return true when the circle intersects the top edge', () => {
        const aabb = createAABB(0, 5, 10, 5);
        const circle = createCircle(5, 2, 3);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    it('should return true when the circle intersects the bottom edge', () => {
        const aabb = createAABB(0, 0, 10, 5);
        const circle = createCircle(5, 8, 3);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    it('should return true when the circle intersects the left edge', () => {
        const aabb = createAABB(5, 0, 5, 10);
        const circle = createCircle(2, 5, 3);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    it('should return true when the circle intersects the right edge', () => {
        const aabb = createAABB(0, 0, 5, 10);
        const circle = createCircle(8, 5, 3);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    it('should return true when the circle\'s edge touches a corner externally', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(6, 6, Math.sqrt(2)); // Distance from (5,5) to (6,6)
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    // 4. Circle Completely Outside the AABB
    it('should return false when the circle is completely to the left', () => {
        const aabb = createAABB(5, 0, 5, 5);
        const circle = createCircle(1, 2, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
    });

    it('should return false when the circle is completely to the right', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(9, 2, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
    });

    it('should return false when the circle is completely above', () => {
        const aabb = createAABB(0, 5, 5, 5);
        const circle = createCircle(2, 1, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
    });

    it('should return false when the circle is completely below', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(2, 9, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
    });

    it('should return false when the circle is diagonally separated (top-left)', () => {
        const aabb = createAABB(3, 3, 5, 5);
        const circle = createCircle(0, 0, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
    });

    it('should return false when the circle is diagonally separated (bottom-right)', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(8, 8, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(false);
    });

    // 5. Circle Touching the AABB (No Overlap)
    it('should return true when the circle touches the left edge externally', () => {
        const aabb = createAABB(2, 0, 5, 5);
        const circle = createCircle(0, 2, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    it('should return true when the circle touches the top edge externally', () => {
        const aabb = createAABB(0, 2, 5, 5);
        const circle = createCircle(2, 0, 2);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    it('should return true when the circle touches a corner externally (top-left)', () => {
        const aabb = createAABB(1, 1, 3, 3);
        const circle = createCircle(0, 0, Math.sqrt(2));
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    // 6. Special Cases
    it('should return true when the circle has zero radius and its center is on the AABB edge', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(5, 2, 0);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
    });

    it('should return true when the circle has zero radius and its center is inside the AABB', () => {
        const aabb = createAABB(0, 0, 5, 5);
        const circle = createCircle(2, 2, 0);
        expect(circle_rect_intersects(circle, aabb)).toBe(true);
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
    });
});