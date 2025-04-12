import {useEffect, useRef} from "react";
import {not_null} from "../../utils.tsx";
import Canvas from "../Canvas";

export abstract class BaseGame {
    private hasRunInit = false;
    protected canvasWidth = 0;
    protected canvasHeight = 0;

    onAnimationFrame(ctx: CanvasRenderingContext2D, nowTime: number, deltaTime: number) {
        // Recalculate the unscaled window size prior to rendering. The window dimensions need to be scaled by the
        // inverse of the canvas's scaling factor.
        const {devicePixelRatio: ratio = 1} = window;

        if (devicePixelRatio > 1) {
            this.canvasWidth = ctx.canvas.width / ratio;
            this.canvasHeight = ctx.canvas.height / ratio;
        }

        // Let the game initialize itself when `onAnimationFrame` is called for the first time.
        if (!this.hasRunInit) {
            this.onInit();
            this.hasRunInit = true;
        }

        // Draw and (possibly) update the game.
        // TODO: Proper game loop (fixed update steps, partial draws).
        this.onUpdate(nowTime, deltaTime);
        this.onDraw(ctx, nowTime, deltaTime);
    }

    abstract onInit(): void;

    abstract onDraw(ctx: CanvasRenderingContext2D, nowTime: number, deltaTime: number): void;

    abstract onUpdate(nowTime: number, deltaTime: number): void;

    abstract onKeyDown(event: KeyboardEvent): void;

    abstract onKeyUp(event: KeyboardEvent): void;
}

interface GameProps {
    width: number;
    height: number;
    game: BaseGame;
}

export function GameCanvas({game, ...props}: GameProps) {
    const gameRef = useRef(game);

    // Input event handlers.
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            not_null(gameRef.current).onKeyDown(event);
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    useEffect(() => {
        const handleKeyUp = (event: KeyboardEvent) => {
            not_null(gameRef.current).onKeyUp(event);
        };

        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keyup', handleKeyUp);
        }
    }, []);

    // Game canvas set up.
    return (<Canvas {...props} onDraw={(ctx, nowTime, deltaTime) => {
        not_null(gameRef.current).onAnimationFrame(ctx, nowTime, deltaTime);
    }}/>);
}