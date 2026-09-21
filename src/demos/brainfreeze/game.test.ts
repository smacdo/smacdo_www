import { afterEach, describe, expect, it, vi } from "vitest";

import { Game } from "./game.ts";
import type { Input } from "./input.ts";
import type { Scene } from "./scene_manager.ts";

function createInput(): Input {
    return {
        endFrame: vi.fn(),
    } as unknown as Input;
}

function createCanvasContext(): CanvasRenderingContext2D {
    return {} as CanvasRenderingContext2D;
}

function createScene(nextScene: Scene | null = null): Scene {
    return {
        update: vi.fn().mockReturnValue(nextScene),
        render: vi.fn(),
    };
}

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe("Game", () => {
    it("passes elapsed time and input to the active scene", () => {
        const input = createInput();
        const scene = createScene();
        const game = new Game(createCanvasContext(), input, scene);

        game.update(0.05);

        expect(scene.update).toHaveBeenCalledOnce();
        expect(scene.update).toHaveBeenCalledWith(0.05, input);
    });

    it("renders the active scene with the canvas context", () => {
        const context = createCanvasContext();
        const scene = createScene();
        const game = new Game(context, createInput(), scene);

        game.render();

        expect(scene.render).toHaveBeenCalledOnce();
        expect(scene.render).toHaveBeenCalledWith(context);
    });

    it("renders a replacement returned by the previous scene", () => {
        const nextScene = createScene();
        const initialScene = createScene(nextScene);
        const game = new Game(createCanvasContext(), createInput(), initialScene);

        game.update(0);
        game.render();

        expect(initialScene.render).not.toHaveBeenCalled();
        expect(nextScene.render).toHaveBeenCalledOnce();
    });
});

describe("Game.frame", () => {
    it("uses zero for the first delta, measures later frames, and caps long gaps", () => {
        const input = createInput();
        const game = new Game(createCanvasContext(), input, createScene());
        const update = vi.spyOn(game, "update").mockImplementation(() => {});
        const render = vi.spyOn(game, "render").mockImplementation(() => {});
        const requestFrame = vi.fn().mockReturnValue(1);
        vi.stubGlobal("requestAnimationFrame", requestFrame);

        game.frame(1_000);
        game.frame(1_050);
        game.frame(1_500);

        expect(update).toHaveBeenNthCalledWith(1, 0);
        expect(update).toHaveBeenNthCalledWith(2, 0.05);
        expect(update).toHaveBeenNthCalledWith(3, 0.1);
        expect(render).toHaveBeenCalledTimes(3);
        expect(input.endFrame).toHaveBeenCalledTimes(3);
        expect(requestFrame).toHaveBeenCalledTimes(3);
        expect(requestFrame).toHaveBeenLastCalledWith(expect.any(Function));
    });
});
