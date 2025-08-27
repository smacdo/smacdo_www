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
    }, [onDraw]);

    return canvasRef;
}