import {HTMLAttributes} from "react";
import {DrawFn, useCanvas} from "../../hooks/UseCanvas";

interface CanvasProps extends HTMLAttributes<HTMLElement> {
    width: number;
    height: number;
    onDraw: DrawFn;
}

export default function Canvas({onDraw, ...props}: CanvasProps) {
    const canvasRef = useCanvas(onDraw);
    return <canvas ref={canvasRef} {...props}></canvas>
}