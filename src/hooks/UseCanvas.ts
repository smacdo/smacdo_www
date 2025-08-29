import {useEffect, useRef} from "react";
import {not_null} from "../lib/utils.tsx";
import {debounce} from "../lib/debounce.ts";

export type DrawFn = (ctx: CanvasRenderingContext2D, nowTime: DOMHighResTimeStamp, deltaTime: number) => void;
export type ResizeFn = (ctx: CanvasRenderingContext2D, canvasRect: DOMRect) => void;

export function useCanvas(onDraw: DrawFn, onResize: ResizeFn) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = not_null(canvasRef.current);
        const cleanupCallbacks = [
            createRenderListener(canvas, onDraw),
            createResizeListener(canvas, onResize),
        ];

        return () => {
            cleanupCallbacks.forEach(cb => {
                cb();
            })
        }

    }, [onDraw, onResize]);

    return canvasRef;
}

function createRenderListener(
    canvas: HTMLCanvasElement,
    onDraw: DrawFn
): () => void {
    const context = not_null(
        canvas.getContext("2d", {desynchronized: true}),
        "canvas element does not support 2d mode or the mode was already set");

    // Create a render lambda function that is invoked on regular cadence by the browser,
    // and each time it is called will invoke the user specified `onRender` callback.
    let lastFrameTime = performance.now();
    let lastAnimationFrameId: number | null = null;

    const render = (timestamp: DOMHighResTimeStamp) => {
        // Calculate the amount of time that has elapsed since the last draw call.
        const deltaTimeInMillisecs = timestamp - lastFrameTime;
        lastFrameTime = timestamp;

        // Invoke the `onDraw` callback to let the user control what is drawn to the screen.
        onDraw(context, timestamp, deltaTimeInMillisecs / 1000);
        lastAnimationFrameId = requestAnimationFrame(render);
    }

    // Start rendering by calling the render function once. This first call to `render` will continue
    // invoking itself in a time delayed loop (via `requestAnimationFrame`).
    render(lastFrameTime);

    // Return a callback that will cancel the last animation callback.
    return () => {
        if (lastAnimationFrameId !== null) {
            window.cancelAnimationFrame(lastAnimationFrameId);
        }
    }
}

/**
 * Creates a listener that will invoke `callback` any time the canvas's parent element is resized.
 * This method returns a lambda that should be called to cleanup the listener when the game is
 * deconstructed.
 *
 * @param canvas The canvas element to watch. This element must have a parent element.
 * @param callback Code to run when the element is resized.
 * @param debounceDelay The number of milliseconds to wait to avoid firing multiple events.
 */
function createResizeListener(
    canvas: HTMLCanvasElement,
    callback: ResizeFn,
    debounceDelay: number = 250
): () => void {
    const rect = canvas.getBoundingClientRect();

    let lastWidth = rect.width;
    let lastHeight = rect.height;

    const debouncedCallback = debounce(() => {
        const rect = canvas.getBoundingClientRect();
        const currentWidth = rect.width;
        const currentHeight = rect.height;

        if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
            lastWidth = currentWidth;
            lastHeight = currentHeight;

            const context = not_null(
                canvas.getContext("2d", {desynchronized: true}),
                "canvas element does not support 2d mode or the mode was already set");

            callback(context, rect);
        }
    }, debounceDelay);

    // Start listening to resize events on the canvas's _parent_ element, not on the canvas itself.
    //
    // The reason for this is we use a parent element for layout, and then manually control the CSS
    // dimensions on the canvas itself.
    if (!canvas.parentElement) {
        throw new Error('Canvas must have a parent element to observe resize events on');
    }

    const resizeObserver = new ResizeObserver(debouncedCallback);
    resizeObserver.observe(canvas.parentElement);

    // Return a lambda that will disconnect the resize observer.
    return () => {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    };
}