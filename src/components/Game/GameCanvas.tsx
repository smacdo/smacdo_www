import {useEffect, useRef} from "react";
import {not_null} from "../../lib/utils.tsx";
import Canvas from "../Canvas";

export abstract class BaseGame {
    /** The number of seconds between game state updates for a fixed time step simulation. */
    readonly timePerUpdateStep: number
    protected canvasWidth = 0;
    protected canvasHeight = 0;
    protected previousOnAnimationFrameTime: number = 0;
    protected unconsumedUpdateTime: number = 0;
    private hasRunInit = false;

    protected constructor(msPerUpdate: number) {
        this.timePerUpdateStep = msPerUpdate / 1000;
    }

    async onAnimationFrame(ctx: CanvasRenderingContext2D, nowTime: number, deltaTime: number) {
        // Let the game initialize itself when `onAnimationFrame` is called for the first time.
        if (!this.hasRunInit) {
            // Recalculate the unscaled window size prior to rendering. The window dimensions need
            // to be scaled by the inverse of the canvas's scaling factor.
            const {devicePixelRatio: ratio = 1} = window;

            this.canvasWidth = ctx.canvas.width / ratio;
            this.canvasHeight = ctx.canvas.height / ratio;

            console.info(`Initializing game with devicePixelRatio ${devicePixelRatio}, canvasWidth ${this.canvasWidth}, canvasHeight ${this.canvasHeight}`);

            // Let the derived game initialize itself.
            this.onStart();

            // Mark as initialized.
            this.hasRunInit = true;
        }

        // Update the game on a fixed time step.
        this.previousOnAnimationFrameTime = nowTime;
        this.unconsumedUpdateTime += deltaTime;

        const timePerUpdateStep = this.timePerUpdateStep;
        let updateTime = this.previousOnAnimationFrameTime;

        while (this.unconsumedUpdateTime >= timePerUpdateStep) {
            this.onUpdate(updateTime, timePerUpdateStep);
            updateTime += timePerUpdateStep;

            this.unconsumedUpdateTime -= timePerUpdateStep;
        }

        // Draw the game.
        this.onDraw(ctx, this.unconsumedUpdateTime / this.timePerUpdateStep);
    }

    abstract onStart(): void;

    abstract onDraw(ctx: CanvasRenderingContext2D, extrapolationFactor: number): void;

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