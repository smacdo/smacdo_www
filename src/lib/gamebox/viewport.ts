// TODO: the canvasWidth and canvasHeight properties should be `number | None` for initialization.
// TODO: make canvasWidth and canvasHeight as read-only accessor methods.


/**
 * TODO: Document me!
 */
export class Viewport {
    /** Aspect ratio to use when rendering the game to a non-default viewport size. */
    readonly aspectRatio: number;
    /** The game's canvas width, which defines the maximum width that can be used when rendering. */
    #canvasWidth: number;
    /** The game's canvas height, which defines the maximum height that can be used when rendering. */
    #canvasHeight: number;
    #outputWidth: number;
    #outputHeight: number;

    /** Logical internal rendering width independent of final output width. */
    readonly #renderWidth: number;
    /** Logical internal rendering height independent of final output height. */
    readonly #renderHeight: number;

    constructor(renderWidth: number, renderHeight: number) {
        this.#renderWidth = renderWidth;
        this.#renderHeight = renderHeight;
        this.aspectRatio = renderWidth / renderHeight;

        this.#outputWidth = 0;
        this.#outputHeight = 0;
        this.#canvasWidth = 0;
        this.#canvasHeight = 0;

        console.info(`Initialize viewport with renderWidth = ${this.#renderWidth}, renderHeight = ${this.#renderHeight}, ratio = ${this.aspectRatio}`);
    }

    onCanvasSizeChanged(canvasWidth: number, canvasHeight: number, devicePixelRatio: number) {
        // Recalculate the unscaled window size prior to rendering. The window dimensions need
        // to be scaled by the inverse of the canvas's scaling factor.
        // TODO: This implementation may not be not correct.
        // TODO: make it configurable if we lock to canvas height or width.
        // TODO: error if the final output width/height is smaller than the canvas.
        const newCanvasWidth = canvasWidth / devicePixelRatio;
        const newCanvasHeight = canvasHeight / devicePixelRatio;

        if (newCanvasWidth != this.#canvasWidth || newCanvasHeight != this.#canvasHeight) {
            this.#canvasWidth = newCanvasWidth;
            this.#canvasHeight = newCanvasHeight;
            console.info(`Viewport canvasWidth = ${this.#canvasWidth}, canvasHeight = ${this.#canvasHeight}, dpr = ${devicePixelRatio}`);
        }

        const newOutputHeight = newCanvasHeight;
        const newOutputWidth = newOutputHeight * this.aspectRatio;

        if (newOutputWidth != this.#outputWidth || newOutputHeight != this.#outputHeight) {
            this.#outputWidth = newOutputWidth;
            this.#outputHeight = newOutputHeight;
            console.info(`Viewport aspectRatio = ${this.aspectRatio}, outputWidth = ${this.#outputWidth}, outputHeight = ${this.#outputHeight}`);
        }
    }

    /**
     * Draw solid colored rectangles on the screen to visualize the viewport.
     *
     * Pink represents the full canvas dimensions.
     * Green represents the drawable region for the game depending on the aspect ratio.
     *
     * @param ctx The canvas rendering context that can be used for rendering.
     */
    drawDebugOverlay(ctx: CanvasRenderingContext2D) {
        // Draw the full canvas region.
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(0, 0, this.#canvasWidth, this.#canvasHeight);

        // Draw the output zone (the "drawable" region for the game).
        ctx.fillStyle = '#00FF00'; // '#F0F0A';
        ctx.fillRect(this.outputOffsetX(), this.outputOffsetY(), this.outputWidth(), this.outputHeight());
    }

    canvasWidth(): number {
        return this.#canvasWidth;
    }

    canvasHeight(): number {
        return this.#canvasHeight;
    }

    outputOffsetX(): number {
        return (this.#canvasWidth - this.#outputWidth) / 2.0;
    }

    outputOffsetY(): number {
        return (this.#canvasHeight - this.#outputHeight) / 2.0;
    }

    outputWidth(): number {
        return this.#outputWidth;
    }

    outputHeight(): number {
        return this.#outputHeight;
    }
}