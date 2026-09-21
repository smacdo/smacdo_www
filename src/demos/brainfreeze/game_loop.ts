import { Input } from "./input.ts";
import { Screen, ScreenManager } from "./screen_manager.ts";

export class GameLoop {
    canvasContext: CanvasRenderingContext2D;
    input: Input;
    previousTimestamp: number | null;
    screenManager: ScreenManager;

    constructor(canvasContext: CanvasRenderingContext2D, input: Input, initialScreen: Screen) {
        this.canvasContext = canvasContext;
        this.input = input;
        this.previousTimestamp = null;
        this.screenManager = new ScreenManager(initialScreen);
    }

    /** Starts the game loop. */
    start() {
        console.log("game started");
        requestAnimationFrame((timestamp) => this.frame(timestamp));
    }

    /**
     * Triggers game state updates and rendering as needed, depending on the
     * amount of time that has elapsed since the last call to `frame()`.
     */
    frame(timestamp: number) {
        // Calculate the amount of time that has elapsed since the last time `frame()` was called.
        const rawDeltaTime =
            this.previousTimestamp === null ? 0 : (timestamp - this.previousTimestamp) / 1000;
        const deltaTime = Math.min(rawDeltaTime, 0.1);

        this.previousTimestamp = timestamp;

        // Advance game simulation and render.
        // TODO: fixed step accumulator.
        this.screenManager.update(deltaTime, this.input);
        this.screenManager.render(this.canvasContext);

        // Post frame clean up.
        this.input.endFrame();
        requestAnimationFrame((timestamp) => this.frame(timestamp));
    }
}
