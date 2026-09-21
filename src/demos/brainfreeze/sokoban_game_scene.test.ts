import { afterEach, describe, expect, it, vi } from "vitest";

import type { Input } from "./input.ts";
import type { Level } from "./level.ts";
import { LevelPack } from "./level_manager.ts";
import { SokobanGame } from "./sokoban-game.ts";
import { SokobanGameScene } from "./sokoban_game_scene.ts";
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

function completeLevel(scene: SokobanGameScene) {
    scene.update(0, createInput("d"));
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("SokobanGameScene.update", () => {
    it.each([
        { key: "w", expectedDx: 0, expectedDy: -1 },
        { key: "s", expectedDx: 0, expectedDy: 1 },
        { key: "a", expectedDx: -1, expectedDy: 0 },
        { key: "d", expectedDx: 1, expectedDy: 0 },
    ])("maps $key to its movement direction", ({ key, expectedDx, expectedDy }) => {
        const move = vi.spyOn(SokobanGame.prototype, "move").mockReturnValue(true);
        const scene = new SokobanGameScene(new LevelPack([createLevel()]));

        scene.update(0, createInput(key));

        expect(move).toHaveBeenCalledOnce();
        expect(move).toHaveBeenCalledWith(expectedDx, expectedDy);
    });

    it("maps r to restart", () => {
        const restart = vi.spyOn(SokobanGame.prototype, "restart");
        const move = vi.spyOn(SokobanGame.prototype, "move");
        const scene = new SokobanGameScene(new LevelPack([createLevel()]));

        scene.update(0, createInput("r"));

        expect(restart).toHaveBeenCalledOnce();
        expect(move).not.toHaveBeenCalled();
    });

    it("maps z to undo", () => {
        const undo = vi.spyOn(SokobanGame.prototype, "undo");
        const move = vi.spyOn(SokobanGame.prototype, "move");
        const scene = new SokobanGameScene(new LevelPack([createLevel()]));

        scene.update(0, createInput("z"));

        expect(undo).toHaveBeenCalledOnce();
        expect(move).not.toHaveBeenCalled();
    });

    it("prioritizes restart and performs at most one action per update", () => {
        const restart = vi.spyOn(SokobanGame.prototype, "restart");
        const undo = vi.spyOn(SokobanGame.prototype, "undo");
        const move = vi.spyOn(SokobanGame.prototype, "move");
        const scene = new SokobanGameScene(new LevelPack([createLevel()]));

        scene.update(0, createInput("r", "z", "w"));

        expect(restart).toHaveBeenCalledOnce();
        expect(undo).not.toHaveBeenCalled();
        expect(move).not.toHaveBeenCalled();
    });

    it("does not advance before the current level is complete", () => {
        const firstLevel = createLevel();
        const levelPack = new LevelPack([firstLevel, createLevel(2)]);
        const scene = new SokobanGameScene(levelPack);

        scene.update(0, createInput("Enter"));

        expect(levelPack.currentLevel).toBe(firstLevel);
    });

    it("advances from a completed level and starts the next level", () => {
        const secondLevel = createLevel(2);
        const levelPack = new LevelPack([createLevel(), secondLevel]);
        const scene = new SokobanGameScene(levelPack);

        completeLevel(scene);
        scene.update(0, createInput("Enter"));

        const context = createCanvasContext();
        scene.render(context);

        expect(levelPack.currentLevel).toBe(secondLevel);
        expect(context.fillRect).toHaveBeenCalledWith(68, 132, 56, 56);
        expect(context.fillText).not.toHaveBeenCalled();
    });

    it("does not advance past the final completed level", () => {
        const onlyLevel = createLevel();
        const levelPack = new LevelPack([onlyLevel]);
        const scene = new SokobanGameScene(levelPack);

        completeLevel(scene);
        scene.update(0, createInput("Enter"));

        expect(levelPack.currentLevel).toBe(onlyLevel);
    });

    it.each(["w", "s", "a", "d"])("blocks %s movement while a modal is active", (key) => {
        const move = vi.spyOn(SokobanGame.prototype, "move");
        const scene = new SokobanGameScene(new LevelPack([createLevel(), createLevel(2)]));
        completeLevel(scene);
        move.mockClear();

        scene.update(0, createInput(key));

        expect(move).not.toHaveBeenCalled();
    });

    it("allows restart from a completion modal and dismisses it", () => {
        const restart = vi.spyOn(SokobanGame.prototype, "restart");
        const scene = new SokobanGameScene(new LevelPack([createLevel(), createLevel(2)]));
        completeLevel(scene);

        scene.update(0, createInput("r"));
        const context = createCanvasContext();
        scene.render(context);

        expect(restart).toHaveBeenCalledOnce();
        expect(context.fillText).not.toHaveBeenCalled();
    });

    it("allows undo from the final completion modal and dismisses it", () => {
        const undo = vi.spyOn(SokobanGame.prototype, "undo");
        const scene = new SokobanGameScene(new LevelPack([createLevel()]));
        completeLevel(scene);

        scene.update(0, createInput("z"));
        const context = createCanvasContext();
        scene.render(context);

        expect(undo).toHaveBeenCalledOnce();
        expect(context.fillText).not.toHaveBeenCalled();
    });

    it("does not advance when restart and Enter are pressed together on a completion modal", () => {
        const firstLevel = createLevel();
        const levelPack = new LevelPack([firstLevel, createLevel(2)]);
        const scene = new SokobanGameScene(levelPack);
        completeLevel(scene);

        scene.update(0, createInput("r", "Enter"));

        expect(levelPack.currentLevel).toBe(firstLevel);
    });

    it("returns no scene transition while gameplay remains active", () => {
        const scene = new SokobanGameScene(new LevelPack([createLevel()]));

        expect(scene.update(0, createInput())).toBeNull();
    });
});

describe("SokobanGameScene.render", () => {
    it("draws the final completion message when the last level is solved", () => {
        const context = createCanvasContext();
        const scene = new SokobanGameScene(new LevelPack([createLevel()]));
        completeLevel(scene);

        scene.render(context);

        expect(context.fillText).toHaveBeenCalledOnce();
        expect(context.fillText).toHaveBeenCalledWith("YOU ARE WINNER", 50, 100);
    });

    it("draws the next-level prompt when a non-final level is solved", () => {
        const context = createCanvasContext();
        const scene = new SokobanGameScene(new LevelPack([createLevel(), createLevel(2)]));
        completeLevel(scene);

        scene.render(context);

        expect(context.fillText).toHaveBeenCalledTimes(2);
        expect(context.fillText).toHaveBeenNthCalledWith(1, "Level complete!", 80, 80);
        expect(context.fillText).toHaveBeenNthCalledWith(
            2,
            "Press enter to go to the next level",
            100,
            110,
        );
    });

    it("does not draw a completion message before the level is solved", () => {
        const context = createCanvasContext();
        const scene = new SokobanGameScene(new LevelPack([createLevel()]));

        scene.render(context);

        expect(context.fillText).not.toHaveBeenCalled();
    });
});
