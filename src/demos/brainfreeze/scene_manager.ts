import { Input } from "./input.ts";

// TODO: Move this to shared code.
// TODO: Call this "ScreenManager" (and "Screen") to disambiguate game levels ("scenes") and
//       scene graph.
export class SceneManager {
    private _activeScene: Scene;

    constructor(initialScene: Scene) {
        this._activeScene = initialScene;
    }

    get activeScene(): Scene {
        return this._activeScene;
    }

    replace(nextScene: Scene) {
        this._activeScene = nextScene;
    }

    /** Advance game state. */
    update(deltaTime: number, input: Input) {
        const nextScene = this._activeScene.update(deltaTime, input);

        if (nextScene != null) {
            this.replace(nextScene);
        }
    }

    /** Draw game state. */
    render(canvasContext: CanvasRenderingContext2D) {
        this._activeScene.render(canvasContext);
    }
}

export interface Scene {
    update(deltaTime: number, input: Input): Scene | null;
    render(canvasContext: CanvasRenderingContext2D): void;
}
