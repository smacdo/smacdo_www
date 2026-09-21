import { Input } from "./input.ts";
import { Scene, SceneManager } from "./scene_manager.ts";

export class Game {
    canvasContext: CanvasRenderingContext2D;
    input: Input;
    previousTimestamp: number | null;
    sceneManager: SceneManager;

    constructor(canvasContext: CanvasRenderingContext2D, input: Input, initialScene: Scene) {
        this.canvasContext = canvasContext;
        this.input = input;
        this.previousTimestamp = null;
        this.sceneManager = new SceneManager(initialScene);
    }

    /** Starts the game. */
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
        this.sceneManager.update(deltaTime, this.input);
        this.sceneManager.render(this.canvasContext);

        // Post frame clean up.
        this.input.endFrame();
        requestAnimationFrame((timestamp) => this.frame(timestamp));
    }
}
