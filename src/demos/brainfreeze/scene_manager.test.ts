import { describe, expect, it, vi } from "vitest";

import type { Input } from "./input.ts";
import { SceneManager, type Scene } from "./scene_manager.ts";

function createInput(): Input {
    return {} as Input;
}

function createScene(nextScene: Scene | null = null): Scene {
    return {
        update: vi.fn().mockReturnValue(nextScene),
        render: vi.fn(),
    };
}

describe("SceneManager", () => {
    it("keeps the active scene when update returns null", () => {
        const scene = createScene();
        const input = createInput();
        const manager = new SceneManager(scene);

        manager.update(0.05, input);

        expect(scene.update).toHaveBeenCalledOnce();
        expect(scene.update).toHaveBeenCalledWith(0.05, input);
        expect(manager.activeScene).toBe(scene);
    });

    it("replaces the active scene when update returns another scene", () => {
        const nextScene = createScene();
        const initialScene = createScene(nextScene);
        const manager = new SceneManager(initialScene);

        manager.update(0, createInput());

        expect(manager.activeScene).toBe(nextScene);
        expect(nextScene.update).not.toHaveBeenCalled();
    });

    it("renders the active scene", () => {
        const context = {} as CanvasRenderingContext2D;
        const scene = createScene();
        const manager = new SceneManager(scene);

        manager.render(context);

        expect(scene.render).toHaveBeenCalledOnce();
        expect(scene.render).toHaveBeenCalledWith(context);
    });

    it("allows an explicit scene replacement", () => {
        const initialScene = createScene();
        const nextScene = createScene();
        const manager = new SceneManager(initialScene);

        manager.replace(nextScene);

        expect(manager.activeScene).toBe(nextScene);
    });
});
