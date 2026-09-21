import { describe, expect, it } from "vitest";

import { Grid } from "./grid.ts";

describe("Grid", () => {
    describe("construction", () => {
        it("accepts a rectangular set of cells", () => {
            const grid = new Grid([0, 1, 2, 3, 4, 5], 3);

            expect(grid.length).toBe(6);
            expect(grid.cols).toBe(3);
            expect(grid.rows).toBe(2);
            expect(grid.isEmpty).toBe(false);
        });

        it("accepts an empty grid with zero columns", () => {
            const grid = new Grid<number>([], 0);

            expect(grid.length).toBe(0);
            expect(grid.cols).toBe(0);
            expect(grid.rows).toBe(0);
            expect(grid.isEmpty).toBe(true);
        });

        it("rejects an empty grid with a nonzero column count", () => {
            expect(() => new Grid([], 1)).toThrow(/empty cell array.*non-zero colsPerRow/);
        });

        it.each([
            { condition: "zero", colsPerRow: 0 },
            { condition: "negative", colsPerRow: -1 },
            { condition: "fractional", colsPerRow: 1.5 },
        ])("rejects a non-empty grid with a $condition column count", ({ colsPerRow }) => {
            expect(() => new Grid([0, 1], colsPerRow)).toThrow(
                /colsPerRow must be a positive integer/,
            );
        });

        it("rejects an incomplete final row", () => {
            expect(() => new Grid([0, 1, 2, 3, 4], 2)).toThrow(/consistent number of columns/);
        });
    });

    describe("clone", () => {
        it("clones an empty grid", () => {
            const original = new Grid<number>([], 0);
            const clone = original.clone();

            expect(clone).not.toBe(original);
            expect(clone.isEmpty).toBe(true);
            expect(clone.cols).toBe(0);
            expect(clone.rows).toBe(0);
        });

        it("deeply clones cells", () => {
            const original = new Grid([{ value: 1 }], 1);
            const clone = original.clone();

            clone.get(0, 0).value = 2;

            expect(clone).not.toBe(original);
            expect(clone.get(0, 0)).toEqual({ value: 2 });
            expect(original.get(0, 0)).toEqual({ value: 1 });
        });
    });

    describe("cell access", () => {
        it("gets and sets cells by coordinate", () => {
            const grid = new Grid([0, 1, 2, 3], 2);

            expect(grid.get(1, 0)).toBe(1);
            expect(grid.set(1, 1, 4)).toBe(4);
            expect(grid.get(1, 1)).toBe(4);
        });

        it.each([
            { edge: "left", x: -1, y: 0 },
            { edge: "right", x: 2, y: 0 },
            { edge: "top", x: 0, y: -1 },
            { edge: "bottom", x: 0, y: 2 },
        ])("rejects a get past the $edge edge", ({ x, y }) => {
            const grid = new Grid([0, 1, 2, 3], 2);

            expect(() => grid.get(x, y)).toThrow(/out of bounds/);
        });

        it.each([
            { coordinate: "x", x: 0.5, y: 0 },
            { coordinate: "y", x: 0, y: 0.5 },
        ])("rejects a fractional $coordinate coordinate", ({ x, y }) => {
            const grid = new Grid([0, 1, 2, 3], 2);

            expect(() => grid.get(x, y)).toThrow(/non-integer/);
            expect(() => grid.set(x, y, 4)).toThrow(/non-integer/);
        });

        it("applies the same bounds checks when setting a cell", () => {
            const grid = new Grid([0, 1, 2, 3], 2);

            expect(() => grid.set(2, 0, 4)).toThrow(/out of bounds/);
            expect(grid.get(0, 1)).toBe(2);
        });
    });

    describe("isInBounds", () => {
        it.each([
            { description: "top-left corner", x: 0, y: 0, expected: true },
            { description: "bottom-right corner", x: 1, y: 1, expected: true },
            { description: "negative x", x: -1, y: 0, expected: false },
            { description: "x at the column count", x: 2, y: 0, expected: false },
            { description: "negative y", x: 0, y: -1, expected: false },
            { description: "y at the row count", x: 0, y: 2, expected: false },
            { description: "fractional x", x: 0.5, y: 0, expected: false },
            { description: "fractional y", x: 0, y: 0.5, expected: false },
        ])("returns $expected for the $description", ({ x, y, expected }) => {
            const grid = new Grid([0, 1, 2, 3], 2);

            expect(grid.isInBounds(x, y)).toBe(expected);
        });
    });
});
