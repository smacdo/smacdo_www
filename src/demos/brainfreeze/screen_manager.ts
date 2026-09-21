import { Input } from "./input.ts";

// TODO: Move this to shared code.
export class ScreenManager {
    private _activeScreen: Screen;

    constructor(initialScreen: Screen) {
        this._activeScreen = initialScreen;
    }

    get activeScreen(): Screen {
        return this._activeScreen;
    }

    replace(nextScreen: Screen) {
        this._activeScreen = nextScreen;
    }

    /** Advance game state. */
    update(deltaTime: number, input: Input) {
        const nextScreen = this._activeScreen.update(deltaTime, input);

        if (nextScreen != null) {
            this.replace(nextScreen);
        }
    }

    /** Draw game state. */
    render(canvasContext: CanvasRenderingContext2D) {
        this._activeScreen.render(canvasContext);
    }
}

export interface Screen {
    update(deltaTime: number, input: Input): Screen | null;
    render(canvasContext: CanvasRenderingContext2D): void;
}
