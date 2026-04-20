import {not_null} from "../../lib/utils.ts";
import {runGame} from "../../lib/gamebox/game-runner.ts";
import {BlockBreakerGame} from "./blockbreaker.ts";

const canvas = not_null(
    document.getElementById("game-canvas") as HTMLCanvasElement | null,
    "game-canvas element not found"
);

runGame(canvas, new BlockBreakerGame());
