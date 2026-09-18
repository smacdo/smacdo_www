// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
});

describe("Brainfreeze demo bootstrap", () => {
    it("sizes the game canvas and starts the animation loop", async () => {
        document.body.innerHTML = '<canvas id="game-canvas"></canvas>';
        const context = {} as CanvasRenderingContext2D;
        vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
        const requestFrame = vi.fn().mockReturnValue(1);
        vi.stubGlobal("requestAnimationFrame", requestFrame);
        vi.spyOn(console, "log").mockImplementation(() => {});

        await import("./demo.js");

        const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
        expect(canvas).not.toBeNull();
        expect(canvas?.width).toBe(512);
        expect(canvas?.height).toBe(512);
        expect(requestFrame).toHaveBeenCalledOnce();
    });
});
