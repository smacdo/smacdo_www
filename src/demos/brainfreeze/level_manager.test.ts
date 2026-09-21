import { describe, expect, it } from "vitest";

import type { Level } from "./level.ts";
import { LevelPack } from "./level_manager.ts";
import { Grid } from "./tilemap.ts";

function createLevel(): Level {
    return {
        tiles: new Grid(Array<number>(5).fill(0), 5),
        player: { kind: "player", x: 1, y: 1 },
        boxes: [{ kind: "box", x: 2, y: 1 }],
        goals: [{ kind: "goal", x: 3, y: 1 }],
    };
}

describe("LevelPack", () => {
    it("rejects an empty level list", () => {
        expect(() => new LevelPack([])).toThrowError(
            "there must be at least one level in a level pack",
        );
    });

    it("starts at the first level", () => {
        const firstLevel = createLevel();
        const secondLevel = createLevel();
        const pack = new LevelPack([firstLevel, secondLevel]);

        expect(pack.levelCount).toBe(2);
        expect(pack.currentLevel).toBe(firstLevel);
        expect(pack.hasNextLevel()).toBe(true);
    });

    it("reports that a one-level pack has no next level", () => {
        const pack = new LevelPack([createLevel()]);

        expect(pack.hasNextLevel()).toBe(false);
    });

    it("advances to and returns the next level", () => {
        const firstLevel = createLevel();
        const secondLevel = createLevel();
        const pack = new LevelPack([firstLevel, secondLevel]);

        expect(pack.advance()).toBe(secondLevel);
        expect(pack.currentLevel).toBe(secondLevel);
        expect(pack.hasNextLevel()).toBe(false);
    });

    it("rejects advancing past the final level without changing the current level", () => {
        const onlyLevel = createLevel();
        const pack = new LevelPack([onlyLevel]);

        expect(() => pack.advance()).toThrowError("there is no next level to advance to");
        expect(pack.currentLevel).toBe(onlyLevel);
    });
});
