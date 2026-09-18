import { afterEach, describe, expect, it, vi } from "vitest";

import type { Level } from "./level.js";
import { SokobanGame, TILE_WALL } from "./sokoban-game.js";

type Position = [number, number];

const LEVEL_WIDTH = 5;
const LEVEL_HEIGHT = 5;
const FLOOR = 0;

function copyPosition([x, y]: Position): Position {
    return [x, y];
}

function createLevel(overrides: Partial<Level> = {}): Level {
    const defaults: Level = {
        tiles: Array<number>(LEVEL_WIDTH * LEVEL_HEIGHT).fill(FLOOR),
        colsPerRow: LEVEL_WIDTH,
        player: [2, 2],
        boxes: [[4, 4]],
        goals: [[0, 4]],
    };

    const level = { ...defaults, ...overrides };

    return {
        tiles: [...level.tiles],
        colsPerRow: level.colsPerRow,
        player: copyPosition(level.player),
        boxes: level.boxes.map(copyPosition),
        goals: level.goals.map(copyPosition),
    };
}

function createTilesWithWalls(...walls: Position[]): number[] {
    const tiles = Array<number>(LEVEL_WIDTH * LEVEL_HEIGHT).fill(FLOOR);

    for (const [x, y] of walls) {
        tiles[y * LEVEL_WIDTH + x] = TILE_WALL;
    }

    return tiles;
}

function dynamicState(game: SokobanGame) {
    return {
        player: structuredClone(game.player()),
        boxes: structuredClone(game.boxes()),
    };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("SokobanGame.move", () => {
    describe("without a box", () => {
        it.each([
            { direction: "left", dx: -1, dy: 0, expected: [1, 2] as Position },
            { direction: "right", dx: 1, dy: 0, expected: [3, 2] as Position },
            { direction: "up", dx: 0, dy: -1, expected: [2, 1] as Position },
            { direction: "down", dx: 0, dy: 1, expected: [2, 3] as Position },
        ])("moves one square $direction", ({ dx, dy, expected }) => {
            const game = new SokobanGame(createLevel());

            expect(game.move(dx, dy)).toBe(true);
            expect(game.player()).toEqual(expected);
        });

        it("rejects movement into a wall without changing state", () => {
            const game = new SokobanGame(
                createLevel({
                    tiles: createTilesWithWalls([3, 2]),
                }),
            );
            const before = dynamicState(game);

            expect(game.move(1, 0)).toBe(false);
            expect(dynamicState(game)).toEqual(before);
        });
    });

    describe("argument validation", () => {
        it.each([
            { reason: "fractional dx", dx: 0.5, dy: 0 },
            { reason: "fractional dy", dx: 0, dy: 0.5 },
            { reason: "dx below the step range", dx: -2, dy: 0 },
            { reason: "dx above the step range", dx: 2, dy: 0 },
            { reason: "dy below the step range", dx: 0, dy: -2 },
            { reason: "dy above the step range", dx: 0, dy: 2 },
            { reason: "no movement", dx: 0, dy: 0 },
            { reason: "diagonal movement", dx: 1, dy: 1 },
        ])("throws for $reason without changing state", ({ dx, dy }) => {
            const game = new SokobanGame(createLevel());
            const before = dynamicState(game);

            expect(() => game.move(dx, dy)).toThrow();
            expect(dynamicState(game)).toEqual(before);
        });
    });

    describe("board boundaries", () => {
        it.each([
            { edge: "left", player: [0, 2] as Position, dx: -1, dy: 0 },
            { edge: "right", player: [4, 2] as Position, dx: 1, dy: 0 },
            { edge: "top", player: [2, 0] as Position, dx: 0, dy: -1 },
            { edge: "bottom", player: [2, 4] as Position, dx: 0, dy: 1 },
        ])("rejects movement past the $edge edge", ({ player, dx, dy }) => {
            vi.spyOn(console, "log").mockImplementation(() => {});
            const game = new SokobanGame(createLevel({ player }));

            expect(game.move(dx, dy)).toBe(false);
            expect(game.player()).toEqual(player);
        });

        it("does not wrap horizontal movement into an adjacent row", () => {
            vi.spyOn(console, "log").mockImplementation(() => {});
            const game = new SokobanGame(createLevel({ player: [4, 1] }));

            expect(game.move(1, 0)).toBe(false);
            expect(game.player()).toEqual([4, 1]);
        });
    });

    describe("pushing boxes", () => {
        it.each([
            { direction: "left", dx: -1, dy: 0, box: [1, 2] as Position, goal: [0, 2] as Position },
            {
                direction: "right",
                dx: 1,
                dy: 0,
                box: [3, 2] as Position,
                goal: [4, 2] as Position,
            },
            { direction: "up", dx: 0, dy: -1, box: [2, 1] as Position, goal: [2, 0] as Position },
            { direction: "down", dx: 0, dy: 1, box: [2, 3] as Position, goal: [2, 4] as Position },
        ])("pushes a box one square $direction", ({ dx, dy, box, goal }) => {
            const game = new SokobanGame(createLevel({ boxes: [box], goals: [goal] }));

            expect(game.move(dx, dy)).toBe(true);
            expect(game.player()).toEqual(box);
            expect(game.boxes()).toEqual([goal]);
        });

        it("rejects a push when a wall is behind the box", () => {
            const game = new SokobanGame(
                createLevel({
                    tiles: createTilesWithWalls([4, 2]),
                    boxes: [[3, 2]],
                    goals: [[0, 0]],
                }),
            );
            const before = dynamicState(game);

            expect(game.move(1, 0)).toBe(false);
            expect(dynamicState(game)).toEqual(before);
            expect(game.undo()).toBe(false);
        });

        it("rejects a push when another box is behind the box", () => {
            const game = new SokobanGame(
                createLevel({
                    boxes: [
                        [3, 2],
                        [4, 2],
                    ],
                    goals: [
                        [0, 0],
                        [0, 1],
                    ],
                }),
            );
            const before = dynamicState(game);

            expect(game.move(1, 0)).toBe(false);
            expect(dynamicState(game)).toEqual(before);
        });

        it("rejects a push past the edge of the board", () => {
            const game = new SokobanGame(
                createLevel({
                    player: [3, 2],
                    boxes: [[4, 2]],
                    goals: [[0, 0]],
                }),
            );
            const before = dynamicState(game);

            expect(game.move(1, 0)).toBe(false);
            expect(dynamicState(game)).toEqual(before);
        });
    });
});

describe("SokobanGame board queries", () => {
    it.each([
        { position: [0, 0] as Position, expected: true },
        { position: [4, 4] as Position, expected: true },
        { position: [-1, 0] as Position, expected: false },
        { position: [5, 0] as Position, expected: false },
        { position: [0, -1] as Position, expected: false },
        { position: [0, 5] as Position, expected: false },
    ])("reports whether $position is in bounds", ({ position: [x, y], expected }) => {
        const game = new SokobanGame(createLevel());

        expect(game.isValidPos(x, y)).toBe(expected);
    });

    it("distinguishes open, wall, box, and out-of-bounds destinations", () => {
        const game = new SokobanGame(
            createLevel({
                tiles: createTilesWithWalls([1, 1]),
                boxes: [[3, 3]],
                goals: [[4, 4]],
            }),
        );

        expect(game.canMoveTo(2, 1)).toBe(true);
        expect(game.canMoveTo(1, 1)).toBe(false);
        expect(game.canMoveTo(3, 3)).toBe(false);
        expect(game.canMoveTo(5, 1)).toBe(false);
    });

    it("reports goals by coordinate", () => {
        const game = new SokobanGame(createLevel({ goals: [[1, 3]] }));

        expect(game.isGoalAt(1, 3)).toBe(true);
        expect(game.isGoalAt(1, 2)).toBe(false);
        expect(game.isGoalAt(-1, 3)).toBe(false);
    });
});

describe("SokobanGame state ownership", () => {
    it("clones the original level instead of retaining its mutable data", () => {
        const original = createLevel({
            player: [1, 1],
            boxes: [[2, 1]],
            goals: [[3, 1]],
        });
        const game = new SokobanGame(original);

        original.tiles[0] = TILE_WALL;
        original.player[0] = 4;
        original.boxes[0][0] = 4;
        original.goals[0][0] = 4;

        expect(game.tilemap()[0]).toBe(FLOOR);
        expect(game.player()).toEqual([1, 1]);
        expect(game.boxes()).toEqual([[2, 1]]);
        expect(game.goals()).toEqual([[3, 1]]);
    });

    it("does not mutate the original level while playing or restarting", () => {
        const original = createLevel({
            player: [1, 1],
            boxes: [[2, 1]],
            goals: [[3, 1]],
        });
        const originalSnapshot = structuredClone(original);
        const game = new SokobanGame(original);

        expect(game.move(1, 0)).toBe(true);
        game.restart();

        expect(original).toEqual(originalSnapshot);
    });
});

describe("SokobanGame.undo", () => {
    it("returns false when there is no move to undo", () => {
        const game = new SokobanGame(createLevel());

        expect(game.undo()).toBe(false);
    });

    it("restores player and box positions after a push", () => {
        const game = new SokobanGame(
            createLevel({
                player: [1, 1],
                boxes: [[2, 1]],
                goals: [[3, 1]],
            }),
        );
        const before = dynamicState(game);

        expect(game.move(1, 0)).toBe(true);
        expect(game.undo()).toBe(true);
        expect(dynamicState(game)).toEqual(before);
    });

    it("undoes multiple moves in reverse order and then returns false", () => {
        const game = new SokobanGame(createLevel());

        expect(game.move(-1, 0)).toBe(true);
        expect(game.move(0, -1)).toBe(true);

        expect(game.undo()).toBe(true);
        expect(game.player()).toEqual([1, 2]);
        expect(game.undo()).toBe(true);
        expect(game.player()).toEqual([2, 2]);
        expect(game.undo()).toBe(false);
    });

    it("keeps snapshots independent from later state mutations", () => {
        const game = new SokobanGame(
            createLevel({
                player: [1, 1],
                boxes: [[2, 1]],
                goals: [[3, 1]],
            }),
        );

        expect(game.move(1, 0)).toBe(true);
        game.boxes()[0][0] = 4;

        expect(game.undo()).toBe(true);
        expect(game.player()).toEqual([1, 1]);
        expect(game.boxes()).toEqual([[2, 1]]);
    });

    it("does not record rejected moves", () => {
        const game = new SokobanGame(
            createLevel({
                tiles: createTilesWithWalls([3, 2]),
            }),
        );

        expect(game.move(1, 0)).toBe(false);
        expect(game.undo()).toBe(false);
    });

    it("can undo a move that completed the level", () => {
        const game = new SokobanGame(
            createLevel({
                player: [1, 1],
                boxes: [[2, 1]],
                goals: [[3, 1]],
            }),
        );

        expect(game.isComplete()).toBe(false);
        expect(game.move(1, 0)).toBe(true);
        expect(game.isComplete()).toBe(true);

        expect(game.undo()).toBe(true);
        expect(game.isComplete()).toBe(false);
    });
});

describe("SokobanGame.restart", () => {
    it("restores the initial player and box positions", () => {
        const game = new SokobanGame(
            createLevel({
                player: [1, 1],
                boxes: [[2, 1]],
                goals: [[3, 1]],
            }),
        );
        const initialState = dynamicState(game);

        expect(game.move(1, 0)).toBe(true);
        game.restart();

        expect(dynamicState(game)).toEqual(initialState);
        expect(game.isComplete()).toBe(false);
    });

    it("clears undo history", () => {
        const game = new SokobanGame(createLevel());

        expect(game.move(-1, 0)).toBe(true);
        game.restart();

        expect(game.undo()).toBe(false);
        expect(game.player()).toEqual([2, 2]);
    });
});

describe("SokobanGame.isComplete", () => {
    it("returns false while any goal is unoccupied", () => {
        const game = new SokobanGame(
            createLevel({
                player: [4, 0],
                boxes: [
                    [1, 1],
                    [2, 2],
                ],
                goals: [
                    [1, 1],
                    [3, 3],
                ],
            }),
        );

        expect(game.isComplete()).toBe(false);
    });

    it("returns true when every goal is occupied", () => {
        const game = new SokobanGame(
            createLevel({
                boxes: [
                    [3, 3],
                    [1, 1],
                ],
                goals: [
                    [1, 1],
                    [3, 3],
                ],
            }),
        );

        expect(game.isComplete()).toBe(true);
    });
});
