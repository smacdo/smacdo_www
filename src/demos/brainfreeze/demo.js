import { Game } from "./game.js";
import { Input } from "./input.js";

const canvas = document.querySelector("#game");

if (canvas == null) {
    throw new Error("could not find game canvas HTML element");
} else if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("expected game canvas HTML element to be HTMLCanvasElement");
}

const canvasContext = canvas.getContext("2d");

if (canvasContext == null) {
    throw new Error("could not get game canvas 2d context");
}

const game = new Game(canvasContext, new Input());
game.start();
