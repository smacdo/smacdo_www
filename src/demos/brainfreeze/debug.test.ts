import { describe, expect, it } from "vitest";

import { TimeSampleAccumulator } from "./debug.ts";

function expectEmpty(accumulator: TimeSampleAccumulator) {
    expect(accumulator.retainedWindowSeconds).toBe(0);
    expect(accumulator.isComplete).toBe(true);
    expect(accumulator.sampleCount).toBe(0);
    expect(accumulator.dropCount).toBe(0);
    expect(accumulator.averageValue).toBeNull();
    expect(accumulator.minValue).toBeNull();
    expect(accumulator.maxValue).toBeNull();
}

describe("TimeSampleAccumulator construction", () => {
    it("starts with an empty, complete time window", () => {
        const accumulator = new TimeSampleAccumulator(2, 60);

        expect(accumulator.requestedWindowSeconds).toBe(2);
        expectEmpty(accumulator);
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
        "rejects an invalid window duration of %s",
        (windowSeconds) => {
            expect(() => new TimeSampleAccumulator(windowSeconds, 60)).toThrow();
        },
    );

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
        "rejects an invalid expected sample rate of %s",
        (samplesPerSecond) => {
            expect(() => new TimeSampleAccumulator(1, samplesPerSecond)).toThrow();
        },
    );
});

describe("TimeSampleAccumulator samples", () => {
    it("calculates statistics for one sample", () => {
        const accumulator = new TimeSampleAccumulator(1, 10);

        expect(accumulator.push(4, 10)).toBe(true);

        expect(accumulator.sampleCount).toBe(1);
        expect(accumulator.retainedWindowSeconds).toBe(0);
        expect(accumulator.averageValue).toBe(4);
        expect(accumulator.minValue).toBe(4);
        expect(accumulator.maxValue).toBe(4);
    });

    it("calculates statistics and the retained span for multiple samples", () => {
        const accumulator = new TimeSampleAccumulator(1, 10);

        accumulator.push(-2, 10);
        accumulator.push(0, 10.25);
        accumulator.push(5, 10.75);

        expect(accumulator.sampleCount).toBe(3);
        expect(accumulator.retainedWindowSeconds).toBe(0.75);
        expect(accumulator.averageValue).toBe(1);
        expect(accumulator.minValue).toBe(-2);
        expect(accumulator.maxValue).toBe(5);
    });

    it("accepts samples with equal timestamps", () => {
        const accumulator = new TimeSampleAccumulator(1, 3);

        expect(accumulator.push(1, 10)).toBe(true);
        expect(accumulator.push(2, 10)).toBe(true);

        expect(accumulator.sampleCount).toBe(2);
        expect(accumulator.retainedWindowSeconds).toBe(0);
        expect(accumulator.averageValue).toBe(1.5);
    });

    it("rejects a decreasing timestamp without changing its state", () => {
        const accumulator = new TimeSampleAccumulator(1, 3);
        accumulator.push(4, 10);

        expect(() => accumulator.push(100, 9)).toThrow();

        expect(accumulator.sampleCount).toBe(1);
        expect(accumulator.dropCount).toBe(0);
        expect(accumulator.averageValue).toBe(4);
        expect(accumulator.minValue).toBe(4);
        expect(accumulator.maxValue).toBe(4);
    });

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
        "rejects a non-finite sample value of %s without changing its state",
        (value) => {
            const accumulator = new TimeSampleAccumulator(1, 3);

            expect(() => accumulator.push(value, 1)).toThrow();

            expectEmpty(accumulator);
        },
    );

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
        "rejects a non-finite timestamp of %s without changing its state",
        (time) => {
            const accumulator = new TimeSampleAccumulator(1, 3);

            expect(() => accumulator.push(1, time)).toThrow();

            expectEmpty(accumulator);
        },
    );
});

describe("TimeSampleAccumulator window eviction", () => {
    it("uses a fractional window and preserves the half-open boundary", () => {
        const accumulator = new TimeSampleAccumulator(0.5, 10);

        accumulator.push(1, 0);
        accumulator.push(2, 0.499);

        expect(accumulator.sampleCount).toBe(2);
        expect(accumulator.minValue).toBe(1);

        accumulator.push(3, 0.5);

        expect(accumulator.sampleCount).toBe(2);
        expect(accumulator.retainedWindowSeconds).toBeCloseTo(0.001);
        expect(accumulator.averageValue).toBe(2.5);
        expect(accumulator.minValue).toBe(2);
        expect(accumulator.maxValue).toBe(3);
    });

    it("retains a sample just inside the window boundary", () => {
        const accumulator = new TimeSampleAccumulator(2, 10);

        accumulator.push(1, 0.001);
        accumulator.push(2, 2);

        expect(accumulator.sampleCount).toBe(2);
        expect(accumulator.minValue).toBe(1);
        expect(accumulator.maxValue).toBe(2);
    });

    it("evicts a sample exactly at the window boundary", () => {
        const accumulator = new TimeSampleAccumulator(2, 10);

        accumulator.push(1, 0);
        accumulator.push(2, 2);

        expect(accumulator.sampleCount).toBe(1);
        expect(accumulator.retainedWindowSeconds).toBe(0);
        expect(accumulator.averageValue).toBe(2);
        expect(accumulator.minValue).toBe(2);
        expect(accumulator.maxValue).toBe(2);
    });

    it("evicts multiple expired samples before adding the new sample", () => {
        const accumulator = new TimeSampleAccumulator(2, 10);

        accumulator.push(1, 0);
        accumulator.push(2, 0.5);
        accumulator.push(3, 1);
        accumulator.push(8, 3);

        expect(accumulator.sampleCount).toBe(1);
        expect(accumulator.averageValue).toBe(8);
        expect(accumulator.minValue).toBe(8);
        expect(accumulator.maxValue).toBe(8);
    });

    it("preserves correct statistics while indices wrap around the ring buffer", () => {
        const accumulator = new TimeSampleAccumulator(3, 1);

        accumulator.push(1, 0);
        accumulator.push(2, 1);
        accumulator.push(3, 2);
        accumulator.push(4, 3);
        accumulator.push(5, 4);

        expect(accumulator.sampleCount).toBe(3);
        expect(accumulator.retainedWindowSeconds).toBe(2);
        expect(accumulator.averageValue).toBe(4);
        expect(accumulator.minValue).toBe(3);
        expect(accumulator.maxValue).toBe(5);
    });
});

describe("TimeSampleAccumulator capacity", () => {
    it("reuses a one-sample ring after its retained sample reaches the window boundary", () => {
        const accumulator = new TimeSampleAccumulator(1, 1);

        expect(accumulator.push(1, 0)).toBe(true);
        expect(accumulator.push(2, 0.5)).toBe(false);

        expect(accumulator.push(3, 1)).toBe(true);

        expect(accumulator.sampleCount).toBe(1);
        expect(accumulator.dropCount).toBe(1);
        expect(accumulator.retainedWindowSeconds).toBe(0);
        expect(accumulator.averageValue).toBe(3);
        expect(accumulator.minValue).toBe(3);
        expect(accumulator.maxValue).toBe(3);
    });

    it("drops a new sample when the current window is at capacity", () => {
        const accumulator = new TimeSampleAccumulator(2, 1);

        expect(accumulator.push(1, 0)).toBe(true);
        expect(accumulator.push(3, 0.25)).toBe(true);
        expect(accumulator.push(100, 0.5)).toBe(false);

        expect(accumulator.sampleCount).toBe(2);
        expect(accumulator.dropCount).toBe(1);
        expect(accumulator.isComplete).toBe(false);
        expect(accumulator.retainedWindowSeconds).toBe(0.25);
        expect(accumulator.averageValue).toBe(2);
        expect(accumulator.minValue).toBe(1);
        expect(accumulator.maxValue).toBe(3);
    });

    it("counts every dropped sample", () => {
        const accumulator = new TimeSampleAccumulator(2, 1);

        accumulator.push(1, 0);
        accumulator.push(2, 0.25);
        expect(accumulator.push(3, 0.5)).toBe(false);
        expect(accumulator.push(4, 0.75)).toBe(false);

        expect(accumulator.dropCount).toBe(2);
        expect(accumulator.sampleCount).toBe(2);
    });

    it("uses a dropped sample's timestamp for subsequent ordering", () => {
        const accumulator = new TimeSampleAccumulator(2, 1);

        accumulator.push(1, 0);
        accumulator.push(2, 0.25);
        expect(accumulator.push(3, 1)).toBe(false);

        expect(() => accumulator.push(4, 0.75)).toThrow();
        expect(accumulator.dropCount).toBe(1);
        expect(accumulator.sampleCount).toBe(2);
    });

    it("accepts samples again when retained samples expire", () => {
        const accumulator = new TimeSampleAccumulator(2, 1);

        accumulator.push(1, 0);
        accumulator.push(2, 0.25);
        expect(accumulator.push(3, 0.5)).toBe(false);

        expect(accumulator.push(4, 2)).toBe(true);

        expect(accumulator.sampleCount).toBe(2);
        expect(accumulator.averageValue).toBe(3);
        expect(accumulator.minValue).toBe(2);
        expect(accumulator.maxValue).toBe(4);
    });

    it("becomes complete after the most recent dropped sample leaves the window", () => {
        const accumulator = new TimeSampleAccumulator(2, 1);

        accumulator.push(1, 0);
        accumulator.push(2, 0.25);
        expect(accumulator.push(3, 0.5)).toBe(false);

        accumulator.push(4, 2);
        expect(accumulator.isComplete).toBe(false);

        accumulator.push(5, 2.5);
        expect(accumulator.isComplete).toBe(true);
        expect(accumulator.dropCount).toBe(1);
    });
});

describe("TimeSampleAccumulator.clear", () => {
    it("restores the initial state and resets timestamp ordering", () => {
        const accumulator = new TimeSampleAccumulator(2, 1);

        accumulator.push(1, 10);
        accumulator.push(2, 10.25);
        accumulator.push(3, 10.5);

        accumulator.clear();

        expect(accumulator.requestedWindowSeconds).toBe(2);
        expectEmpty(accumulator);
        expect(accumulator.push(4, 1)).toBe(true);
        expect(accumulator.averageValue).toBe(4);
    });
});
