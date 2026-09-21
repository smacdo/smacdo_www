import { afterEach, describe, expect, it, vi } from "vitest";

import { GameLoop } from "./game_loop.ts";
import type { Input } from "./input.ts";
import type { Screen } from "./screen_manager.ts";

function createInput(): Input {
    return {
        endFrame: vi.fn(),
    } as unknown as Input;
}

function createCanvasContext(): CanvasRenderingContext2D {
    return {} as CanvasRenderingContext2D;
}

function createScreen(nextScreen: Screen | null = null): Screen {
    return {
        update: vi.fn().mockReturnValue(nextScreen),
        render: vi.fn(),
    };
}

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe("Game", () => {
    it("passes elapsed time and input to the active screen", () => {
        const input = createInput();
        const screen = createScreen();
        const game = new GameLoop(createCanvasContext(), input, screen);
        vi.stubGlobal("requestAnimationFrame", vi.fn().mockReturnValue(1));
        game.previousTimestamp = 0;

        game.frame(50);

        expect(screen.update).toHaveBeenCalledOnce();
        expect(screen.update).toHaveBeenCalledWith(0.05, input);
    });

    it("renders the active screen with the canvas context", () => {
        const context = createCanvasContext();
        const screen = createScreen();
        const game = new GameLoop(context, createInput(), screen);
        vi.stubGlobal("requestAnimationFrame", vi.fn().mockReturnValue(1));

        game.frame(0);

        expect(screen.render).toHaveBeenCalledOnce();
        expect(screen.render).toHaveBeenCalledWith(context);
    });

    it("renders a replacement returned by the previous screen", () => {
        const nextScreen = createScreen();
        const initialScreen = createScreen(nextScreen);
        const game = new GameLoop(createCanvasContext(), createInput(), initialScreen);
        vi.stubGlobal("requestAnimationFrame", vi.fn().mockReturnValue(1));

        game.frame(0);

        expect(initialScreen.render).not.toHaveBeenCalled();
        expect(nextScreen.render).toHaveBeenCalledOnce();
    });
});

describe("Game.frame", () => {
    it("uses zero for the first delta, measures later frames, and caps long gaps", () => {
        const input = createInput();
        const game = new GameLoop(createCanvasContext(), input, createScreen());
        const update = vi.spyOn(game.screenManager, "update").mockImplementation(() => {});
        const render = vi.spyOn(game.screenManager, "render").mockImplementation(() => {});
        const requestFrame = vi.fn().mockReturnValue(1);
        vi.stubGlobal("requestAnimationFrame", requestFrame);

        game.frame(1_000);
        game.frame(1_050);
        game.frame(1_500);

        expect(update).toHaveBeenNthCalledWith(1, 0, input);
        expect(update).toHaveBeenNthCalledWith(2, 0.05, input);
        expect(update).toHaveBeenNthCalledWith(3, 0.1, input);
        expect(render).toHaveBeenCalledTimes(3);
        expect(input.endFrame).toHaveBeenCalledTimes(3);
        expect(requestFrame).toHaveBeenCalledTimes(3);
        expect(requestFrame).toHaveBeenLastCalledWith(expect.any(Function));
    });
});
