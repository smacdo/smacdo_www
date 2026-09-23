import { describe, expect, it, vi } from "vitest";

import type { Input } from "./input.ts";
import { ScreenManager, type Screen } from "./screen_manager.ts";
import { SokobanTitleScreen } from "./sokoban_title_screen.ts";

describe("SokobanTitleScreen", () => {
    it("stays on the title until Enter, then renders gameplay", () => {
        const gameScreen: Screen = {
            update: vi.fn().mockReturnValue(null),
            render: vi.fn(),
        };
        const manager = new ScreenManager(new SokobanTitleScreen(gameScreen));
        const context = { fillText: vi.fn() } as unknown as CanvasRenderingContext2D;
        let pressedKey = "w";
        const input = {
            isKeyPressed: (key: string) => key === pressedKey,
        } as Input;

        manager.update(0, input);
        manager.render(context);

        expect(manager.activeScreen).not.toBe(gameScreen);
        expect(context.fillText).toHaveBeenCalledWith("Brainfreeze", 80, 80);
        expect(gameScreen.render).not.toHaveBeenCalled();

        pressedKey = "Enter";
        manager.update(0, input);
        manager.render(context);

        expect(manager.activeScreen).toBe(gameScreen);
        expect(gameScreen.update).not.toHaveBeenCalled();
        expect(gameScreen.render).toHaveBeenCalledOnce();
        expect(gameScreen.render).toHaveBeenCalledWith(context);
    });
});
