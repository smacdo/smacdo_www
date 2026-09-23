import { Input } from "./input.ts";
import { Screen } from "./screen_manager.ts";

export class SokobanTitleScreen implements Screen {
    private _nextScreen: Screen;

    constructor(nextScreen: Screen) {
        this._nextScreen = nextScreen;
    }

    update(_deltaTime: number, input: Input): Screen | null {
        if (input.isKeyPressed("Enter")) {
            return this._nextScreen;
        }

        return null;
    }
    render(canvasContext: CanvasRenderingContext2D): void {
        canvasContext.font = "64px Arial";
        canvasContext.fillStyle = "#89DCEB";
        canvasContext.fillText("Brainfreeze", 80, 80);

        canvasContext.font = "18px Arial";
        canvasContext.fillStyle = "#FAB387";
        canvasContext.fillText("Press enter to start", 150, 300);
    }
}
