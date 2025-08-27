import React, {useEffect, useRef} from "react";
import {not_null} from "../../lib/utils.tsx";
import Canvas from "../Canvas";
import {Viewport} from "../../lib/gamebox/viewport.ts";

export abstract class BaseGame {
    /** The number of seconds between game state updates for a fixed time step simulation. */
    readonly timePerUpdateStep: number
    protected viewport: Viewport;
    protected previousOnAnimationFrameTime: number = 0;
    protected unconsumedUpdateTime: number = 0;
    private hasRunInit = false;
    private offscreenCanvas?: OffscreenCanvas = undefined;

    protected constructor(renderWidth: number, renderHeight: number, msPerUpdate: number) {
        this.timePerUpdateStep = msPerUpdate / 1000;
        this.viewport = new Viewport(renderWidth, renderHeight);
    }

    async onAnimationFrame(ctx: CanvasRenderingContext2D, nowTime: number, deltaTime: number) {
        // Let the game initialize itself when `onAnimationFrame` is called for the first time.
        if (!this.hasRunInit) {
            this.onInit(ctx);
            this.hasRunInit = true;

            console.debug("GameCanvas initialized")
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

        // Draw the game to an offscreen buffer.
        const offscreenCtx = not_null(not_null(this.offscreenCanvas).getContext("2d"), "canvas element does not support 2d mode or the mode was already set");
        this.onDraw(offscreenCtx, this.unconsumedUpdateTime / this.timePerUpdateStep);

        // Scale the offscreen buffer to the physical dimensions of the HTML canvas while respecting
        // the game's aspect ratio. The output should be centered to allow for blank space on any
        // side because of arbitrary window sizes not respecting the game's aspect ratio.
        ctx.drawImage(
            not_null(this.offscreenCanvas),
            0, // offscreen source x
            0, // offscreen source y
            this.viewport.renderWidth, // offscreen source width
            this.viewport.renderHeight, // offscreen source height
            not_null(this.viewport.outputOffsetX), // canvas destination x
            not_null(this.viewport.outputOffsetY), // canvas destination y
            not_null(this.viewport.outputWidth), // canvas destination width
            not_null(this.viewport.outputHeight), // canvas destination height.
        );
    }

    private onInit(ctx: CanvasRenderingContext2D) {
        // Initialize and calculate render dimensions first prior creation of the offscreen canvas.
        this.onResize(ctx);

        // Create an offscreen canvas to render to that uses logical pixels at a fixed aspect ratio
        // for the game to draw on.
        this.offscreenCanvas = new OffscreenCanvas(this.viewport.renderWidth, this.viewport.renderHeight);

        // Let the game perform any needed initialization logic.
        this.onStart();
    }

    /**
     * Inform the game canvas that it was resized, and should update itself as needed.
     * @param ctx The canvas rendering context that was resized.
     */
    onResize(ctx: CanvasRenderingContext2D) {
        // Get the size of the canvas bounding rectangle. This size is reported as CSS pixels, which
        // are logical units that are independent of DPI scaling.
        const canvas = ctx.canvas;
        const canvasRect = canvas.getBoundingClientRect();

        // Query the window's device pixel ratio, which indicates the number of
        // physical pixels drawn per logical CSS pixel.
        const {devicePixelRatio: ratio = 1} = window;

        // Scale the canvas's back buffer to match the device pixel ratio. This ensures the canvas
        // will draw at the device's native DPI rather than use up scaling which can result in
        // unpleasant blurry artifacts on things with sharp edges.
        canvas.width = Math.round(canvasRect.right * ratio) - Math.round(canvasRect.left * ratio);
        canvas.height = Math.round(canvasRect.bottom * ratio) - Math.round(canvasRect.top * ratio);

        // Tell the canvas to scale all drawing operations by the pixel ratio. Doing this allows the
        // game to continue rendering at the original logical pixel size, but to have output
        // (especially text or other non-bitmap output) be crisply drawn.
        ctx.scale(ratio, ratio);

        // Set the canvas element's CSS width and height to the _logical_ size of the element, not
        // the physical pixel size. (CSS pixels are logical, not physical).
        canvas.style.width = canvasRect.width + 'px';
        canvas.style.height = canvasRect.height + 'px';

        // Cache the logical pixel size for the game to use. The game should always use the logical
        // pixel size, and let the engine worry about up scaling.
        this.viewport.onCanvasSizeChanged(canvasRect.width, canvasRect.height);

        console.log(
            "canvas resized: devicePixelRatio = %d, canvas.width = %d, canvas.height = %d, styleWidth = %d, styleHeight = %d, gameCanvasWidth = %d, gameCanvasHeight = %d",
            devicePixelRatio,
            canvas.width,
            canvas.height,
            canvas.style.width,
            canvas.style.height,
            this.viewport.outputWidth,
            this.viewport.outputHeight,
        );
    }

    abstract onStart(): void;

    abstract onDraw(ctx: OffscreenCanvasRenderingContext2D, extrapolationFactor: number): void;

    abstract onUpdate(nowTime: number, deltaTime: number): void;

    abstract onKeyDown(event: KeyboardEvent): void;

    abstract onKeyUp(event: KeyboardEvent): void;
}

interface GameProps {
    width?: number;
    height?: number;
    game: BaseGame;
    style?: React.CSSProperties;
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