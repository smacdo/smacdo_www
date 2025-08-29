import {HTMLAttributes} from "react";
import {DrawFn, ResizeFn, useCanvas} from "../../hooks/UseCanvas";

export interface CanvasProps extends Omit<HTMLAttributes<HTMLCanvasElement>, 'onResize'> {
    width?: number;
    height?: number;
    onDraw: DrawFn;
    onResize: ResizeFn;
}

export default function Canvas({onDraw, onResize, ...props}: CanvasProps) {
    const canvasRef = useCanvas(onDraw, onResize);
    return <canvas ref={canvasRef} {...props}></canvas>
}