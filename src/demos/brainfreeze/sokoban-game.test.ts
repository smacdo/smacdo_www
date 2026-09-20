import { afterEach, describe, expect, it, vi } from "vitest";

import type { Level } from "./level.ts";
import { SokobanGame, TILE_WALL, validateLevel } from "./sokoban-game.js";
import { Grid } from "./tilemap.ts";

const LEVEL_WIDTH = 5;
const LEVEL_HEIGHT = 5;
const FLOOR = 0;

function createLevel(overrides: Partial<Level> = {}): Level {
    const defaults: Level = {
        tiles: new Grid(Array<number>(LEVEL_WIDTH * LEVEL_HEIGHT).fill(FLOOR), LEVEL_WIDTH),
        player: { x: 2, y: 2 },
        boxes: [{ x: 4, y: 4 }],
        goals: [{ x: 0, y: 4 }],
    };

    const level = { ...defaults, ...overrides };

    return {
        tiles: level.tiles,
        player: { ...level.player },
        boxes: level.boxes.map((box) => ({ ...box })),
        goals: level.goals.map((goal) => ({ ...goal })),
    };
}

function createTilesWithWall(wallX: number, wallY: number): Grid<number> {
    const tiles = Array<number>(LEVEL_WIDTH * LEVEL_HEIGHT).fill(FLOOR);
    tiles[wallY * LEVEL_WIDTH + wallX] = TILE_WALL;

    return new Grid(tiles, LEVEL_WIDTH);
}

function dynamicState(game: SokobanGame) {
    return {
        player: structuredClone(game.player),
        boxes: structuredClone(game.boxes),
    };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("validateLevel", () => {
    it("accepts a valid level", () => {
        expect(validateLevel(createLevel())).toEqual([]);
    });

    it("rejects an empty tilemap", () => {
        expect(validateLevel(createLevel({ tiles: new Grid([], 0) }))).toContain(
            "tilemaps cannot be zero length",
        );
    });

    it("rejects an unrecognized tile and reports its coordinates", () => {
        const tiles = Array<number>(LEVEL_WIDTH * LEVEL_HEIGHT).fill(FLOOR);
        tiles[7] = 2;

        expect(validateLevel(createLevel({ tiles: new Grid(tiles, LEVEL_WIDTH) }))).toContain(
            "tile 2, 1 is not a recognized tile type",
        );
    });

    it("requires at least one goal", () => {
        expect(validateLevel(createLevel({ boxes: [], goals: [] }))).toContain(
            "level must have at least one goal",
        );
    });

    it("requires equal box and goal counts", () => {
        expect(validateLevel(createLevel({ boxes: [] }))).toContain(
            "the number of goals (1) and boxes (0) should be the same",
        );
    });

    it.each([
        {
            entity: "player",
            level: () => createLevel({ player: { x: 0.5, y: 2 } }),
            expected: "player position 0.5, 2 must be an integer",
        },
        {
            entity: "goal",
            level: () => createLevel({ goals: [{ x: 0.5, y: 4 }] }),
            expected: "goal position 0.5, 4 must be an integer",
        },
        {
            entity: "box",
            level: () => createLevel({ boxes: [{ x: 3.5, y: 4 }] }),
            expected: "box position 3.5, 4 must be an integer",
        },
    ])("rejects fractional $entity coordinates", ({ level, expected }) => {
        expect(validateLevel(level())).toContain(expected);
    });

    it.each([
        {
            entity: "player",
            level: () => createLevel({ player: { x: LEVEL_WIDTH, y: 2 } }),
            expected: "player position 5, 2 must be in tilemap bounds 5 x 5",
        },
        {
            entity: "goal",
            level: () => createLevel({ goals: [{ x: 0, y: LEVEL_HEIGHT }] }),
            expected: "goal position 0, 5 must be in tilemap bounds 5 x 5",
        },
        {
            entity: "box",
            level: () => createLevel({ boxes: [{ x: -1, y: 4 }] }),
            expected: "box position -1, 4 must be in tilemap bounds 5 x 5",
        },
    ])("rejects an out-of-bounds $entity", ({ level, expected }) => {
        expect(validateLevel(level())).toContain(expected);
    });

    it.each([
        {
            entity: "player",
            level: () => createLevel({ tiles: createTilesWithWall(2, 2) }),
            expected: "player position 2, 2 must be on a floor tile",
        },
        {
            entity: "goal",
            level: () => createLevel({ tiles: createTilesWithWall(0, 4) }),
            expected: "goal position 0, 4 must be on a floor tile",
        },
        {
            entity: "box",
            level: () => createLevel({ tiles: createTilesWithWall(4, 4) }),
            expected: "box position 4, 4 must be on a floor tile",
        },
    ])("rejects a $entity on a wall", ({ level, expected }) => {
        expect(validateLevel(level())).toContain(expected);
    });

    it("rejects duplicate goals", () => {
        const errors = validateLevel(
            createLevel({
                boxes: [
                    { x: 3, y: 4 },
                    { x: 4, y: 4 },
                ],
                goals: [
                    { x: 0, y: 4 },
                    { x: 0, y: 4 },
                ],
            }),
        );

        expect(errors).toContain("duplicate goal positions found at index 0 and 1");
    });

    it("rejects duplicate boxes", () => {
        const errors = validateLevel(
            createLevel({
                boxes: [
                    { x: 4, y: 4 },
                    { x: 4, y: 4 },
                ],
                goals: [
                    { x: 0, y: 4 },
                    { x: 1, y: 4 },
                ],
            }),
        );

        expect(errors).toContain("duplicate box positions found at index 0 and 1");
    });

    it("rejects a player overlapping a box", () => {
        expect(validateLevel(createLevel({ player: { x: 4, y: 4 } }))).toContain(
            "player cannot be at same position as box at index 0",
        );
    });

    it("allows a player and box to share one coordinate", () => {
        expect(validateLevel(createLevel({ player: { x: 4, y: 0 } }))).toEqual([]);
    });

    it("includes each validation error on its own line when construction fails", () => {
        const constructInvalidLevel = () => new SokobanGame(createLevel({ goals: [] }));

        expect(constructInvalidLevel).toThrowError(
            new Error(
                "Failed to load level due to the following errors:\n" +
                    " - level must have at least one goal\n" +
                    " - the number of goals (0) and boxes (1) should be the same\n",
            ),
        );
    });
});

describe("SokobanGame.move", () => {
    describe("without a box", () => {
        it.each([
            { direction: "left", dx: -1, dy: 0, expected: { x: 1, y: 2 } },
            { direction: "right", dx: 1, dy: 0, expected: { x: 3, y: 2 } },
            { direction: "up", dx: 0, dy: -1, expected: { x: 2, y: 1 } },
            { direction: "down", dx: 0, dy: 1, expected: { x: 2, y: 3 } },
        ])("moves one square $direction", ({ dx, dy, expected }) => {
            const game = new SokobanGame(createLevel());

            expect(game.move(dx, dy)).toBe(true);
            expect(game.player).toEqual(expected);
        });

        it("rejects movement into a wall without changing state", () => {
            const game = new SokobanGame(
                createLevel({
                    tiles: createTilesWithWall(3, 2),
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
            { edge: "left", player: { x: 0, y: 2 }, dx: -1, dy: 0 },
            { edge: "right", player: { x: 4, y: 2 }, dx: 1, dy: 0 },
            { edge: "top", player: { x: 2, y: 0 }, dx: 0, dy: -1 },
            { edge: "bottom", player: { x: 2, y: 4 }, dx: 0, dy: 1 },
        ])("rejects movement past the $edge edge", ({ player, dx, dy }) => {
            vi.spyOn(console, "log").mockImplementation(() => {});
            const game = new SokobanGame(createLevel({ player }));

            expect(game.move(dx, dy)).toBe(false);
            expect(game.player).toEqual(player);
        });

        it("does not wrap horizontal movement into an adjacent row", () => {
            vi.spyOn(console, "log").mockImplementation(() => {});
            const game = new SokobanGame(createLevel({ player: { x: 4, y: 1 } }));

            expect(game.move(1, 0)).toBe(false);
            expect(game.player).toEqual({ x: 4, y: 1 });
        });
    });

    describe("pushing boxes", () => {
        it.each([
            { direction: "left", dx: -1, dy: 0, box: { x: 1, y: 2 }, goal: { x: 0, y: 2 } },
            {
                direction: "right",
                dx: 1,
                dy: 0,
                box: { x: 3, y: 2 },
                goal: { x: 4, y: 2 },
            },
            { direction: "up", dx: 0, dy: -1, box: { x: 2, y: 1 }, goal: { x: 2, y: 0 } },
            { direction: "down", dx: 0, dy: 1, box: { x: 2, y: 3 }, goal: { x: 2, y: 4 } },
        ])("pushes a box one square $direction", ({ dx, dy, box, goal }) => {
            const game = new SokobanGame(createLevel({ boxes: [box], goals: [goal] }));

            expect(game.move(dx, dy)).toBe(true);
            expect(game.player).toEqual(box);
            expect(game.boxes).toEqual([goal]);
        });

        it("rejects a push when a wall is behind the box", () => {
            const game = new SokobanGame(
                createLevel({
                    tiles: createTilesWithWall(4, 2),
                    boxes: [{ x: 3, y: 2 }],
                    goals: [{ x: 0, y: 0 }],
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
                        { x: 3, y: 2 },
                        { x: 4, y: 2 },
                    ],
                    goals: [
                        { x: 0, y: 0 },
                        { x: 0, y: 1 },
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
                    player: { x: 3, y: 2 },
                    boxes: [{ x: 4, y: 2 }],
                    goals: [{ x: 0, y: 0 }],
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
        { x: 0, y: 0, expected: true },
        { x: 4, y: 4, expected: true },
        { x: -1, y: 0, expected: false },
        { x: 5, y: 0, expected: false },
        { x: 0, y: -1, expected: false },
        { x: 0, y: 5, expected: false },
    ])("reports whether ($x, $y) is in bounds", ({ x, y, expected }) => {
        const game = new SokobanGame(createLevel());

        expect(game.tilemap.isInBounds(x, y)).toBe(expected);
    });

    it("distinguishes open, wall, box, and out-of-bounds destinations", () => {
        const game = new SokobanGame(
            createLevel({
                tiles: createTilesWithWall(1, 1),
                boxes: [{ x: 3, y: 3 }],
                goals: [{ x: 4, y: 4 }],
            }),
        );

        expect(game.canMoveTo(2, 1)).toBe(true);
        expect(game.canMoveTo(1, 1)).toBe(false);
        expect(game.canMoveTo(3, 3)).toBe(false);
        expect(game.canMoveTo(5, 1)).toBe(false);
    });

    it("reports goals by coordinate", () => {
        const game = new SokobanGame(createLevel({ goals: [{ x: 1, y: 3 }] }));

        expect(game.isGoalAt(1, 3)).toBe(true);
        expect(game.isGoalAt(1, 2)).toBe(false);
        expect(game.isGoalAt(-1, 3)).toBe(false);
    });
});

describe("SokobanGame state ownership", () => {
    it("clones the original level instead of retaining its mutable data", () => {
        const original = createLevel({
            player: { x: 1, y: 1 },
            boxes: [{ x: 2, y: 1 }],
            goals: [{ x: 3, y: 1 }],
        });
        const game = new SokobanGame(original);

        original.tiles.set(0, 0, TILE_WALL);
        original.player.x = 4;
        original.boxes[0].x = 4;
        original.goals[0].x = 4;

        expect(game.tilemap.get(0, 0)).toBe(FLOOR);
        expect(game.player).toEqual({ x: 1, y: 1 });
        expect(game.boxes).toEqual([{ x: 2, y: 1 }]);
        expect(game.goals).toEqual([{ x: 3, y: 1 }]);
    });

    it("does not mutate the original level while playing or restarting", () => {
        const original = createLevel({
            player: { x: 1, y: 1 },
            boxes: [{ x: 2, y: 1 }],
            goals: [{ x: 3, y: 1 }],
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
                player: { x: 1, y: 1 },
                boxes: [{ x: 2, y: 1 }],
                goals: [{ x: 3, y: 1 }],
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
        expect(game.player).toEqual({ x: 1, y: 2 });
        expect(game.undo()).toBe(true);
        expect(game.player).toEqual({ x: 2, y: 2 });
        expect(game.undo()).toBe(false);
    });

    it("keeps snapshots independent from later state mutations", () => {
        const game = new SokobanGame(
            createLevel({
                player: { x: 1, y: 1 },
                boxes: [{ x: 2, y: 1 }],
                goals: [{ x: 3, y: 1 }],
            }),
        );

        expect(game.move(1, 0)).toBe(true);
        game.boxes[0].x = 4;

        expect(game.undo()).toBe(true);
        expect(game.player).toEqual({ x: 1, y: 1 });
        expect(game.boxes).toEqual([{ x: 2, y: 1 }]);
    });

    it("does not record rejected moves", () => {
        const game = new SokobanGame(
            createLevel({
                tiles: createTilesWithWall(3, 2),
            }),
        );

        expect(game.move(1, 0)).toBe(false);
        expect(game.undo()).toBe(false);
    });

    it("can undo a move that completed the level", () => {
        const game = new SokobanGame(
            createLevel({
                player: { x: 1, y: 1 },
                boxes: [{ x: 2, y: 1 }],
                goals: [{ x: 3, y: 1 }],
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
                player: { x: 1, y: 1 },
                boxes: [{ x: 2, y: 1 }],
                goals: [{ x: 3, y: 1 }],
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
        expect(game.player).toEqual({ x: 2, y: 2 });
    });
});

describe("SokobanGame.isComplete", () => {
    it("returns false while any goal is unoccupied", () => {
        const game = new SokobanGame(
            createLevel({
                player: { x: 4, y: 0 },
                boxes: [
                    { x: 1, y: 1 },
                    { x: 2, y: 2 },
                ],
                goals: [
                    { x: 1, y: 1 },
                    { x: 3, y: 3 },
                ],
            }),
        );

        expect(game.isComplete()).toBe(false);
    });

    it("returns true when every goal is occupied", () => {
        const game = new SokobanGame(
            createLevel({
                boxes: [
                    { x: 3, y: 3 },
                    { x: 1, y: 1 },
                ],
                goals: [
                    { x: 1, y: 1 },
                    { x: 3, y: 3 },
                ],
            }),
        );

        expect(game.isComplete()).toBe(true);
    });
});
