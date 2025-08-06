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
    private readonly renderWidth: number;
    private readonly renderHeight: number;

    protected constructor(renderWidth: number, renderHeight: number, msPerUpdate: number) {
        this.timePerUpdateStep = msPerUpdate / 1000;
        this.viewport = new Viewport(renderWidth, renderHeight);
        this.renderWidth = renderWidth;
        this.renderHeight = renderHeight;
    }

    async onAnimationFrame(ctx: CanvasRenderingContext2D, nowTime: number, deltaTime: number) {
        // Send the canvas size and DPI to the viewport in case the viewport has changed and needs
        // to be updated.
        const {devicePixelRatio: dpr = 1} = window;
        this.viewport.onCanvasSizeChanged(ctx.canvas.width, ctx.canvas.height, dpr);

        // Perform any initialization required when the animation callback fires for the first time.
        if (!this.hasRunInit) {
            // Create an offscreen bitmap for the game to render to, rather than the physical canvas
            // present in the HTML document.
            this.offscreenCanvas = new OffscreenCanvas(this.renderWidth, this.renderHeight);

            // Let the derived game initialize itself.
            this.onStart();

            // Mark as initialized.
            this.hasRunInit = true;
            console.debug("GameCanvas initialized");
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
            this.renderWidth, // offscreen source width
            this.renderHeight, // offscreen source height
            not_null(this.viewport.outputOffsetX), // canvas destination x
            not_null(this.viewport.outputOffsetY), // canvas destination y
            not_null(this.viewport.outputWidth), // canvas destination width
            not_null(this.viewport.outputHeight), // canvas destination height.
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