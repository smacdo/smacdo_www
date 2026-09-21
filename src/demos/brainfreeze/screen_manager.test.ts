import { describe, expect, it, vi } from "vitest";

import type { Input } from "./input.ts";
import { ScreenManager, type Screen } from "./screen_manager.ts";

function createInput(): Input {
    return {} as Input;
}

function createScreen(nextScreen: Screen | null = null): Screen {
    return {
        update: vi.fn().mockReturnValue(nextScreen),
        render: vi.fn(),
    };
}

describe("ScreenManager", () => {
    it("keeps the active screen when update returns null", () => {
        const screen = createScreen();
        const input = createInput();
        const manager = new ScreenManager(screen);

        manager.update(0.05, input);

        expect(screen.update).toHaveBeenCalledOnce();
        expect(screen.update).toHaveBeenCalledWith(0.05, input);
        expect(manager.activeScreen).toBe(screen);
    });

    it("replaces the active screen when update returns another screen", () => {
        const nextScreen = createScreen();
        const initialScreen = createScreen(nextScreen);
        const manager = new ScreenManager(initialScreen);

        manager.update(0, createInput());

        expect(manager.activeScreen).toBe(nextScreen);
        expect(nextScreen.update).not.toHaveBeenCalled();
    });

    it("renders the active screen", () => {
        const context = {} as CanvasRenderingContext2D;
        const screen = createScreen();
        const manager = new ScreenManager(screen);

        manager.render(context);

        expect(screen.render).toHaveBeenCalledOnce();
        expect(screen.render).toHaveBeenCalledWith(context);
    });

    it("allows an explicit screen replacement", () => {
        const initialScreen = createScreen();
        const nextScreen = createScreen();
        const manager = new ScreenManager(initialScreen);

        manager.replace(nextScreen);

        expect(manager.activeScreen).toBe(nextScreen);
    });
});
