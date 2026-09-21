import { afterEach, describe, expect, it, vi } from "vitest";

import { Game } from "./game.ts";
import type { Input } from "./input.ts";
import type { Level } from "./level.ts";
import { LevelPack } from "./level_manager.ts";
import { Grid } from "./tilemap.ts";

function createLevel(row = 1): Level {
    return {
        tiles: new Grid(Array<number>(20).fill(0), 5),
        player: { kind: "player", x: 1, y: row },
        boxes: [{ kind: "box", x: 2, y: row }],
        goals: [{ kind: "goal", x: 3, y: row }],
    };
}

function createInput(...pressedKeys: string[]): Input {
    const pressed = new Set(pressedKeys);

    return {
        isKeyPressed: vi.fn((key: string) => pressed.has(key)),
        endFrame: vi.fn(),
    } as unknown as Input;
}

function createCanvasContext(): CanvasRenderingContext2D {
    return {
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 0,
        font: "",
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
}

function createGame(input = createInput(), levels: Level[] = [createLevel()]) {
    return new Game(createCanvasContext(), input, new LevelPack(levels));
}

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe("Game.update", () => {
    it.each([
        { key: "w", expectedDx: 0, expectedDy: -1 },
        { key: "s", expectedDx: 0, expectedDy: 1 },
        { key: "a", expectedDx: -1, expectedDy: 0 },
        { key: "d", expectedDx: 1, expectedDy: 0 },
    ])("maps $key to its movement direction", ({ key, expectedDx, expectedDy }) => {
        const game = createGame(createInput(key));
        const move = vi.spyOn(game.gameState, "move").mockReturnValue(true);

        game.update(0);

        expect(move).toHaveBeenCalledOnce();
        expect(move).toHaveBeenCalledWith(expectedDx, expectedDy);
    });

    it("maps r to restart", () => {
        const game = createGame(createInput("r"));
        const restart = vi.spyOn(game.gameState, "restart");
        const move = vi.spyOn(game.gameState, "move");

        game.update(0);

        expect(restart).toHaveBeenCalledOnce();
        expect(move).not.toHaveBeenCalled();
    });

    it("maps z to undo", () => {
        const game = createGame(createInput("z"));
        const undo = vi.spyOn(game.gameState, "undo");
        const move = vi.spyOn(game.gameState, "move");

        game.update(0);

        expect(undo).toHaveBeenCalledOnce();
        expect(move).not.toHaveBeenCalled();
    });

    it("prioritizes restart and performs at most one action per update", () => {
        const game = createGame(createInput("r", "z", "w"));
        const restart = vi.spyOn(game.gameState, "restart");
        const undo = vi.spyOn(game.gameState, "undo");
        const move = vi.spyOn(game.gameState, "move");

        game.update(0);

        expect(restart).toHaveBeenCalledOnce();
        expect(undo).not.toHaveBeenCalled();
        expect(move).not.toHaveBeenCalled();
    });

    it("does not advance before the current level is complete", () => {
        const firstLevel = createLevel();
        const secondLevel = createLevel(2);
        const game = createGame(createInput("Enter"), [firstLevel, secondLevel]);
        const initialGameState = game.gameState;

        game.update(0);

        expect(game.levelPack.currentLevel).toBe(firstLevel);
        expect(game.gameState).toBe(initialGameState);
    });

    it("replaces the completed game state with the next level when Enter is pressed", () => {
        const firstLevel = createLevel();
        const secondLevel = createLevel(2);
        const game = createGame(createInput("Enter"), [firstLevel, secondLevel]);
        const completedGameState = game.gameState;
        vi.spyOn(completedGameState, "isComplete").mockReturnValue(true);

        game.update(0);

        expect(game.levelPack.currentLevel).toBe(secondLevel);
        expect(game.gameState).not.toBe(completedGameState);
        expect(game.gameState.player).toEqual(secondLevel.player);
    });

    it("does not advance past the final completed level", () => {
        const game = createGame(createInput("Enter"));
        const finalGameState = game.gameState;
        vi.spyOn(finalGameState, "isComplete").mockReturnValue(true);

        game.update(0);

        expect(game.gameState).toBe(finalGameState);
        expect(game.levelPack.hasNextLevel()).toBe(false);
    });
});

describe("Game.frame", () => {
    it("uses zero for the first delta, measures later frames, and caps long gaps", () => {
        const input = createInput();
        const game = createGame(input);
        const update = vi.spyOn(game, "update").mockImplementation(() => {});
        vi.spyOn(game, "render").mockImplementation(() => {});
        const requestFrame = vi.fn().mockReturnValue(1);
        vi.stubGlobal("requestAnimationFrame", requestFrame);

        game.frame(1_000);
        game.frame(1_050);
        game.frame(1_500);

        expect(update).toHaveBeenNthCalledWith(1, 0);
        expect(update).toHaveBeenNthCalledWith(2, 0.05);
        expect(update).toHaveBeenNthCalledWith(3, 0.1);
        expect(input.endFrame).toHaveBeenCalledTimes(3);
        expect(requestFrame).toHaveBeenCalledTimes(3);
        expect(requestFrame).toHaveBeenLastCalledWith(expect.any(Function));
    });
});

describe("Game.render", () => {
    it("draws the final completion message when the last level is solved", () => {
        const context = createCanvasContext();
        const game = new Game(context, createInput(), new LevelPack([createLevel()]));
        vi.spyOn(game.gameState, "isComplete").mockReturnValue(true);

        game.render();

        expect(context.fillText).toHaveBeenCalledOnce();
        expect(context.fillText).toHaveBeenCalledWith("YOU ARE WINNER", 50, 100);
    });

    it("draws the next-level prompt when a non-final level is solved", () => {
        const context = createCanvasContext();
        const game = new Game(
            context,
            createInput(),
            new LevelPack([createLevel(), createLevel(2)]),
        );
        vi.spyOn(game.gameState, "isComplete").mockReturnValue(true);

        game.render();

        expect(context.fillText).toHaveBeenCalledTimes(2);
        expect(context.fillText).toHaveBeenNthCalledWith(1, "Level complete!", 80, 80);
        expect(context.fillText).toHaveBeenNthCalledWith(
            2,
            "Press enter to go to the next level",
            100,
            110,
        );
    });

    it("does not draw the completion message before the level is solved", () => {
        const context = createCanvasContext();
        const game = new Game(context, createInput(), new LevelPack([createLevel()]));
        vi.spyOn(game.gameState, "isComplete").mockReturnValue(false);

        game.render();

        expect(context.fillText).not.toHaveBeenCalled();
    });
});
