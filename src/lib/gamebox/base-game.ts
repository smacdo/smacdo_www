import {not_null} from "../utils.ts";
import {Viewport} from "./viewport.ts";

export abstract class BaseGame {
    readonly timePerUpdateStep: number;
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
        if (!this.hasRunInit) {
            this.onInit(ctx);
            this.hasRunInit = true;
        }

        this.previousOnAnimationFrameTime = nowTime;
        this.unconsumedUpdateTime += deltaTime;

        const timePerUpdateStep = this.timePerUpdateStep;
        let updateTime = this.previousOnAnimationFrameTime;

        while (this.unconsumedUpdateTime >= timePerUpdateStep) {
            this.onUpdate(updateTime, timePerUpdateStep);
            updateTime += timePerUpdateStep;
            this.unconsumedUpdateTime -= timePerUpdateStep;
        }

        const offscreenCtx = not_null(
            not_null(this.offscreenCanvas).getContext("2d"),
            "canvas does not support 2d context"
        );
        this.onDraw(offscreenCtx, this.unconsumedUpdateTime / this.timePerUpdateStep);

        ctx.drawImage(
            not_null(this.offscreenCanvas),
            0, 0,
            this.viewport.renderWidth,
            this.viewport.renderHeight,
            not_null(this.viewport.outputOffsetX),
            not_null(this.viewport.outputOffsetY),
            not_null(this.viewport.outputWidth),
            not_null(this.viewport.outputHeight),
        );
    }

    private onInit(ctx: CanvasRenderingContext2D) {
        this.onResize(ctx, ctx.canvas.getBoundingClientRect());
        this.offscreenCanvas = new OffscreenCanvas(this.viewport.renderWidth, this.viewport.renderHeight);
        this.onStart();
    }

    onResize(ctx: CanvasRenderingContext2D, canvasRect: DOMRect) {
        const canvas = ctx.canvas;
        const {devicePixelRatio: ratio = 1} = window;

        canvas.width = Math.round(canvasRect.right * ratio) - Math.round(canvasRect.left * ratio);
        canvas.height = Math.round(canvasRect.bottom * ratio) - Math.round(canvasRect.top * ratio);

        ctx.scale(ratio, ratio);

        canvas.style.width = canvasRect.width + 'px';
        canvas.style.height = canvasRect.height + 'px';

        this.viewport.onCanvasSizeChanged(canvasRect.width, canvasRect.height);
    }

    abstract onStart(): void;
    abstract onDraw(ctx: OffscreenCanvasRenderingContext2D, extrapolationFactor: number): void;
    abstract onUpdate(nowTime: number, deltaTime: number): void;
    abstract onKeyDown(event: KeyboardEvent): void;
    abstract onKeyUp(event: KeyboardEvent): void;
}
