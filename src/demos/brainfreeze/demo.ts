import { GameLoop } from "./game_loop.ts";
import { Input } from "./input.ts";
import { LevelPack } from "./level_pack.ts";
import { SokobanGameScreen } from "./sokoban_game_screen.ts";

import LEVEL1 from "./levels/level1.ts";
import LEVEL2 from "./levels/level2.ts";
import LEVEL3 from "./levels/level3.ts";

const canvas = document.querySelector("#game-canvas");

if (canvas == null) {
    throw new Error("could not find game canvas HTML element");
} else if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("expected game canvas HTML element to be HTMLCanvasElement");
}

// The board is 8x8 tiles at the 64px tile size used by sokoban_game_screen.ts, so the bitmap needs to
// be 512x512. Keep these in step with the tile size and level dimensions until the renderer
// derives them itself.
canvas.width = 512;
canvas.height = 512;

const canvasContext = canvas.getContext("2d");

if (canvasContext == null) {
    throw new Error("could not get game canvas 2d context");
}

const gameLoop = new GameLoop(
    canvasContext,
    new Input(),
    new SokobanGameScreen(new LevelPack([LEVEL1, LEVEL2, LEVEL3])),
);

gameLoop.start();
