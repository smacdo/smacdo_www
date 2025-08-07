import {useEffect, useRef} from "react";
import {not_null} from "../lib/utils.tsx";

export type DrawFn = (ctx: CanvasRenderingContext2D, nowTime: DOMHighResTimeStamp, deltaTime: number) => void;

export function useCanvas(onDraw: DrawFn) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Request a 2d canvas context from the HTML canvas element.
        const canvas = not_null(canvasRef.current);
        const context = not_null(
            canvas.getContext("2d", {desynchronized: true}),
            "canvas element does not support 2d mode or the mode was already set");

        // Rescale the internal pixel buffer for this canvas element if the user has a high dpi
        // display.
        const {devicePixelRatio: ratio = 1} = window;

        if (devicePixelRatio !== 1) { // TODO: this block should match the one in render.
            const canvasRect = canvas.getBoundingClientRect();

            // Scale the internal pixel buffer up by the pixel ratio to ensure rendering is
            // happening at the user's higher dpi setting.
            canvas.width = Math.round(canvasRect.right * ratio) - Math.round(canvasRect.left * ratio);
            canvas.height = Math.round(canvasRect.bottom * ratio) - Math.round(canvasRect.top * ratio);

            context.scale(ratio, ratio);

            // Set the canvas element's CSS width and height to the _original_ size of the element.
            //
            // This is done because the CSS dimensions are physical (not logical pixels) and managed
            // by the browser, which is already accounting for high dpi measurements.
            canvas.style.width = canvasRect.width + 'px';
            canvas.style.height = canvasRect.height + 'px';

            console.log(`DPR = ${devicePixelRatio}, cW = ${canvas.width}, cH = ${canvas.height}, sW = ${canvas.style.width}, sH = ${canvas.style.height}`);
        }

        // Create a render lambda function that is invoked on regular cadence by the browser,
        // and each time it is called will invoke the user specified `onRender` callback.
        let lastFrameTime = performance.now();
        let lastAnimationFrameId: number | null = null;

        const render = (timestamp: DOMHighResTimeStamp) => {
            // Calculate the amount of time that has elapsed since the last draw call.
            const deltaTimeInMillisecs = timestamp - lastFrameTime;
            lastFrameTime = timestamp;

            // Handle window resizing.
            const {width, height} = canvas.getBoundingClientRect();

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width * ratio;
                canvas.height = height * ratio;

                context.scale(ratio, ratio);
            }

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
    }, [onDraw]);

    return canvasRef;
}