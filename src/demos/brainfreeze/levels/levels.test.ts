import { describe, expect, it } from "vitest";

import { validateLevel } from "../sokoban_game.ts";
import LEVEL1 from "./level1.ts";
import LEVEL2 from "./level2.ts";
import LEVEL3 from "./level3.ts";

describe("Brainfreeze levels", () => {
    it.each([
        { name: "level 1", level: LEVEL1 },
        { name: "level 2", level: LEVEL2 },
        { name: "level 3", level: LEVEL3 },
    ])("loads $name without validation errors", ({ level }) => {
        expect(validateLevel(level)).toEqual([]);
    });
});
