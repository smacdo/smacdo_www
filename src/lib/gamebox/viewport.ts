import {not_null} from "../utils.tsx";

/**
 * A viewport TODO: document me properly!
 */
export class Viewport {
    /** The aspect ratio used by the game's internal rendering buffer. */
    readonly #aspectRatio: number;

    /** Logical internal rendering width independent of final output width. */
    readonly #renderWidth: number;
    /** Logical internal rendering height independent of final output height. */
    readonly #renderHeight: number;

    /** The game's canvas width, which defines the maximum width that can be used when rendering. */
    #canvasWidth: number | undefined;

    /** The game's canvas height, which defines the maximum height that can be used when rendering. */
    #canvasHeight: number | undefined;
    #outputWidth: number | undefined;
    #outputHeight: number | undefined;

    constructor(renderWidth: number, renderHeight: number) {
        this.#renderWidth = renderWidth;
        this.#renderHeight = renderHeight;
        this.#aspectRatio = renderWidth / renderHeight;
    }

    get aspectRatio(): number {
        return this.#aspectRatio;
    }

    get renderWidth(): number {
        return this.#renderWidth;
    }

    get renderHeight(): number {
        return this.#renderHeight;
    }

    get canvasWidth(): number | undefined {
        return this.#canvasWidth;
    }

    get canvasHeight(): number | undefined {
        return this.#canvasHeight;
    }

    get outputOffsetX(): number | undefined {
        if (this.#canvasWidth !== undefined && this.#outputWidth !== undefined) {
            return (this.#canvasWidth - this.#outputWidth) / 2.0;
        } else {
            return undefined;
        }
    }

    get outputOffsetY(): number | undefined {
        if (this.#canvasHeight !== undefined && this.#outputHeight !== undefined) {
            return (this.#canvasHeight - this.#outputHeight) / 2.0;
        } else {
            return undefined;
        }
    }

    get outputWidth(): number | undefined {
        return this.#outputWidth;
    }

    get outputHeight(): number | undefined {
        return this.#outputHeight;
    }

    onCanvasSizeChanged(cssWidth: number, cssHeight: number) {
        // TODO: explain the aspect ratio resizing logic.
        // TODO: make it configurable if we lock to canvas height or width.
        // TODO: error if the final output width/height is smaller than the canvas.
        const newCanvasWidth = cssWidth;
        const newCanvasHeight = cssHeight;
        let wasResized = false;

        if (newCanvasWidth != this.#canvasWidth || newCanvasHeight != this.#canvasHeight) {
            this.#canvasWidth = newCanvasWidth;
            this.#canvasHeight = newCanvasHeight;
            wasResized = true;
        }

        const newOutputHeight = newCanvasHeight;
        const newOutputWidth = newOutputHeight * this.#aspectRatio;

        if (newOutputWidth != this.#outputWidth || newOutputHeight != this.#outputHeight) {
            this.#outputWidth = newOutputWidth;
            this.#outputHeight = newOutputHeight;
            wasResized = true;
        }

        if (wasResized) {
            console.debug(`Viewport resized; canvasWidth = ${this.#canvasWidth}, canvasHeight = ${this.#canvasHeight}, outputWidth = ${this.#outputWidth}, outputHeight = ${this.#outputHeight}, aspectRatio = ${this.aspectRatio}`);
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
        ctx.fillRect(0, 0, not_null(this.#canvasWidth), not_null(this.#canvasHeight));

        // Draw the output zone (the "drawable" region for the game).
        ctx.fillStyle = '#00FF00'; // '#F0F0A';
        ctx.fillRect(
            not_null(this.outputOffsetX),
            not_null(this.outputOffsetY),
            not_null(this.outputWidth),
            not_null(this.outputHeight));
    }
}