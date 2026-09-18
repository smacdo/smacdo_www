import { afterEach, describe, expect, it, vi } from "vitest";

import { Game } from "./game.js";
import type { Input } from "./input.js";

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

function createGame(input = createInput()) {
    return new Game(createCanvasContext(), input);
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
    it("draws the completion message when the level is solved", () => {
        const context = createCanvasContext();
        const game = new Game(context, createInput());
        vi.spyOn(game.gameState, "isComplete").mockReturnValue(true);

        game.render();

        expect(context.fillText).toHaveBeenCalledOnce();
        expect(context.fillText).toHaveBeenCalledWith("YOU ARE WINNER", 50, 100);
    });

    it("does not draw the completion message before the level is solved", () => {
        const context = createCanvasContext();
        const game = new Game(context, createInput());
        vi.spyOn(game.gameState, "isComplete").mockReturnValue(false);

        game.render();

        expect(context.fillText).not.toHaveBeenCalled();
    });
});
