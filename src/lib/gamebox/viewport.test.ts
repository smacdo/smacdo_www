import {Viewport} from "./viewport.ts";

describe("viewport", () => {
    it("stores the render width and height used in the constructor", () => {
        const viewport = new Viewport(3840, 2160);
        expect(viewport.renderWidth).toBe(3840);
        expect(viewport.renderHeight).toBe(2160);
    });

    it("canvas and output dimensions are not defined after construction", () => {
        const viewport = new Viewport(3840, 2160);
        expect(viewport.canvasWidth).toBeUndefined();
        expect(viewport.canvasHeight).toBeUndefined();
        expect(viewport.outputWidth).toBeUndefined();
        expect(viewport.outputHeight).toBeUndefined();
    });

    it("calculates the aspect ratio when constructing with the render width and height", () => {
        const viewport = new Viewport(1920, 1080);
        expect(viewport.aspectRatio).toBe(16.0 / 9.0);
    });

    it("canvas dimensions are set after calling onCanvasSizeChanged", () => {
        const viewport = new Viewport(24, 32);
        viewport.onCanvasSizeChanged(1440.0, 3200.0, 1.0);
        expect(viewport.canvasWidth).toBe(1440.0);
        expect(viewport.canvasHeight).toBe(3200.0);
    });

    it("output dimensions use the vertical canvas size and aspect ratio when resizing", () => {
        const viewport = new Viewport(1920, 1080); // 16:9 aspect ratio
        viewport.onCanvasSizeChanged(800, 600, 1.0);

        expect(viewport.outputWidth).toBeCloseTo(1066.67, 2); // 600 * (16/9)
        expect(viewport.outputHeight).toBe(600);
    });

    it("each call to onCanvasSizeChanged updates the viewport canvas and output dimensions", () => {
        const viewport = new Viewport(1920, 1080);

        // First resize
        viewport.onCanvasSizeChanged(800, 600, 1.0);
        expect(viewport.canvasWidth).toBe(800);
        expect(viewport.canvasHeight).toBe(600);
        expect(viewport.outputWidth).toBeCloseTo(1066.67, 2); // 600 * (16/9)
        expect(viewport.outputHeight).toBe(600);

        // Second resize with different dimensions
        viewport.onCanvasSizeChanged(1200, 900, 1.0);
        expect(viewport.canvasWidth).toBe(1200);
        expect(viewport.canvasHeight).toBe(900);
        expect(viewport.outputWidth).toBe(1600); // 900 * (16/9)
        expect(viewport.outputHeight).toBe(900);
    });

    it("outputOffsetXY centers the values", () => {
        const viewport = new Viewport(1920, 1080);
        viewport.onCanvasSizeChanged(1000, 600, 1.0);

        const outputWidth = viewport.outputWidth!; // 600 * (16/9) = 1066.67
        const outputHeight = viewport.outputHeight!;

        // X offset should center the output horizontally.
        const expectedOffsetX = (1000 - outputWidth) / 2;
        expect(viewport.outputOffsetX).toBeCloseTo(expectedOffsetX, 2);

        // Y offset should center the output vertically.
        const expectedOffsetY = (600 - outputHeight) / 2;
        expect(viewport.outputOffsetY).toBe(expectedOffsetY);
    });

    it("device pixel ratio correctly scales canvas and output dimensions", () => {
        const viewport = new Viewport(1920, 1080); // 16:9 aspect ratio

        // Test with 2x device pixel ratio.
        // DPR should scale down canvas dimensions
        viewport.onCanvasSizeChanged(1600, 1200, 2.0);

        expect(viewport.canvasWidth).toBe(800); // 1600 / 2.0
        expect(viewport.canvasHeight).toBe(600); // 1200 / 2.0

        expect(viewport.outputWidth).toBeCloseTo(1066.67, 2); // 600 * (16/9)
        expect(viewport.outputHeight).toBe(600);

        // Test with 1.5x device pixel ratio
        viewport.onCanvasSizeChanged(900, 600, 1.5);

        expect(viewport.canvasWidth).toBe(600); // 900 / 1.5
        expect(viewport.canvasHeight).toBe(400); // 600 / 1.5
        expect(viewport.outputWidth).toBeCloseTo(711.11, 2); // 400 * (16/9)
        expect(viewport.outputHeight).toBe(400);
    });
});