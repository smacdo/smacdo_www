import {not_null} from "../utils.ts";
import {BaseGame} from "./base-game.ts";

export function runGame(canvas: HTMLCanvasElement, game: BaseGame): void {
    const ctx = not_null(canvas.getContext("2d"), "canvas does not support 2d context");
    let previousTime: number | undefined;

    const observer = new ResizeObserver(() => {
        game.onResize(ctx, canvas.getBoundingClientRect());
    });
    observer.observe(canvas);

    document.addEventListener("keydown", (e) => game.onKeyDown(e));
    document.addEventListener("keyup", (e) => game.onKeyUp(e));

    function frame(nowMs: number) {
        const nowSec = nowMs / 1000;
        const deltaSec = previousTime !== undefined ? nowSec - previousTime : 0;
        previousTime = nowSec;

        game.onAnimationFrame(ctx, nowSec, deltaSec);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}
