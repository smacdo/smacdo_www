import { Game } from "./game.ts";
import { Input } from "./input.ts";

const canvas = document.querySelector("#game-canvas");

if (canvas == null) {
    throw new Error("could not find game canvas HTML element");
} else if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("expected game canvas HTML element to be HTMLCanvasElement");
}

// The board is 8x8 tiles at the 64px tile size used by game.ts, so the canvas bitmap needs to
// be 512x512. Keep these in step with the tile size and level dimensions until the renderer
// derives them itself.
canvas.width = 512;
canvas.height = 512;

const canvasContext = canvas.getContext("2d");

if (canvasContext == null) {
    throw new Error("could not get game canvas 2d context");
}

const game = new Game(canvasContext, new Input());
game.start();
