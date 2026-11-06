import { afterEach, describe, expect, it, vi } from "vitest";

import { Stopwatch, TimeSampleAccumulator } from "./debug.ts";

function expectEmpty(stopwatch: Stopwatch) {
    expect(stopwatch.running).toBe(false);
    expect(stopwatch.elapsedTimeMs).toBeNull();
    expect(stopwatch.lapTimeMs).toBeNull();
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("Stopwatch construction and reset", () => {
    it("starts empty and stopped", () => {
        expectEmpty(new Stopwatch());
    });

    it("clears a running stopwatch", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);
        stopwatch.lap(125);

        stopwatch.clear();

        expectEmpty(stopwatch);
    });

    it("clears a stopped stopwatch", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);
        stopwatch.lap(125);
        stopwatch.stop(150);

        stopwatch.clear();

        expectEmpty(stopwatch);
    });
});

describe("Stopwatch start and stop", () => {
    it("measures and freezes elapsed time using explicit timestamps", () => {
        const stopwatch = new Stopwatch();

        stopwatch.start(100);
        const elapsedTime = stopwatch.stop(135);

        expect(elapsedTime).toBe(35);
        expect(stopwatch.elapsedTimeMs).toBe(35);
        expect(stopwatch.running).toBe(false);
    });

    it("accepts equal start and stop timestamps", () => {
        const stopwatch = new Stopwatch();

        stopwatch.start(0);

        expect(stopwatch.stop(0)).toBe(0);
        expect(stopwatch.elapsedTimeMs).toBe(0);
    });

    it("uses performance.now when starting and stopping without timestamps", () => {
        const stopwatch = new Stopwatch();
        vi.spyOn(performance, "now").mockReturnValueOnce(100).mockReturnValueOnce(145);

        stopwatch.start();

        expect(stopwatch.stop()).toBe(45);
    });

    it("reports elapsed time from performance.now while running", () => {
        const stopwatch = new Stopwatch();
        vi.spyOn(performance, "now").mockReturnValueOnce(100).mockReturnValue(125);

        stopwatch.start();

        expect(stopwatch.elapsedTimeMs).toBe(25);
        expect(stopwatch.running).toBe(true);
    });

    it("starts a fresh run after stopping", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);
        stopwatch.lap(125);
        stopwatch.stop(150);

        stopwatch.start(200);

        expect(stopwatch.running).toBe(true);
        expect(stopwatch.lapTimeMs).toBeNull();
        expect(stopwatch.stop(230)).toBe(30);
    });

    it("rejects starting while running without changing the original run", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);

        expect(() => stopwatch.start(200)).toThrow();

        expect(stopwatch.running).toBe(true);
        expect(stopwatch.stop(150)).toBe(50);
    });

    it("rejects stopping before starting", () => {
        const stopwatch = new Stopwatch();

        expect(() => stopwatch.stop(100)).toThrow();
        expectEmpty(stopwatch);
    });

    it("rejects stopping twice", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);
        stopwatch.stop(125);

        expect(() => stopwatch.stop(150)).toThrow();
        expect(stopwatch.elapsedTimeMs).toBe(25);
        expect(stopwatch.running).toBe(false);
    });
});

describe("Stopwatch laps", () => {
    it("measures the first lap from the start time", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);

        const lapTime = stopwatch.lap(130);

        expect(lapTime).toBe(30);
        expect(stopwatch.lapTimeMs).toBe(30);
    });

    it("measures later laps from the previous lap", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);
        stopwatch.lap(130);

        const lapTime = stopwatch.lap(175);

        expect(lapTime).toBe(45);
        expect(stopwatch.lapTimeMs).toBe(45);
    });

    it("accepts equal lap timestamps", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);

        expect(stopwatch.lap(100)).toBe(0);
        expect(stopwatch.lapTimeMs).toBe(0);
    });

    it("uses performance.now when recording a lap without a timestamp", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);
        vi.spyOn(performance, "now").mockReturnValue(135);

        expect(stopwatch.lap()).toBe(35);
        expect(stopwatch.lapTimeMs).toBe(35);
    });

    it("retains the most recent lap duration after stopping", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);
        stopwatch.lap(125);

        stopwatch.stop(150);

        expect(stopwatch.lapTimeMs).toBe(25);
    });

    it("accepts a stop timestamp equal to the most recent lap timestamp", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);
        stopwatch.lap(150);

        expect(stopwatch.stop(150)).toBe(50);
        expect(stopwatch.running).toBe(false);
    });

    it("rejects recording a lap before starting", () => {
        const stopwatch = new Stopwatch();

        expect(() => stopwatch.lap(100)).toThrow();
        expectEmpty(stopwatch);
    });

    it("rejects recording a lap after stopping", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);
        stopwatch.stop(125);

        expect(() => stopwatch.lap(150)).toThrow();
        expect(stopwatch.elapsedTimeMs).toBe(25);
        expect(stopwatch.lapTimeMs).toBeNull();
    });
});

describe("Stopwatch timestamp validation", () => {
    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
        "rejects an invalid start timestamp of %s without changing state",
        (timeMs) => {
            const stopwatch = new Stopwatch();

            expect(() => stopwatch.start(timeMs)).toThrow();
            expectEmpty(stopwatch);
        },
    );

    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 99])(
        "rejects an invalid stop timestamp of %s without stopping",
        (timeMs) => {
            const stopwatch = new Stopwatch();
            stopwatch.start(100);

            expect(() => stopwatch.stop(timeMs)).toThrow();

            expect(stopwatch.running).toBe(true);
            expect(stopwatch.stop(110)).toBe(10);
        },
    );

    it("rejects stopping before the most recent lap without stopping", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);
        stopwatch.lap(150);

        expect(() => stopwatch.stop(125)).toThrow();

        expect(stopwatch.running).toBe(true);
        expect(stopwatch.lapTimeMs).toBe(50);
        expect(stopwatch.stop(160)).toBe(60);
    });

    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 99])(
        "rejects an invalid first lap timestamp of %s without recording a lap",
        (timeMs) => {
            const stopwatch = new Stopwatch();
            stopwatch.start(100);

            expect(() => stopwatch.lap(timeMs)).toThrow();

            expect(stopwatch.lapTimeMs).toBeNull();
            expect(stopwatch.lap(110)).toBe(10);
        },
    );

    it("rejects a decreasing later lap without changing the previous lap", () => {
        const stopwatch = new Stopwatch();
        stopwatch.start(100);
        stopwatch.lap(130);

        expect(() => stopwatch.lap(120)).toThrow();

        expect(stopwatch.lapTimeMs).toBe(30);
        expect(stopwatch.lap(150)).toBe(20);
    });
});

function expectEmptyAccumulator(accumulator: TimeSampleAccumulator) {
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
        expectEmptyAccumulator(accumulator);
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

            expectEmptyAccumulator(accumulator);
        },
    );

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
        "rejects a non-finite timestamp of %s without changing its state",
        (time) => {
            const accumulator = new TimeSampleAccumulator(1, 3);

            expect(() => accumulator.push(1, time)).toThrow();

            expectEmptyAccumulator(accumulator);
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
        expectEmptyAccumulator(accumulator);
        expect(accumulator.push(4, 1)).toBe(true);
        expect(accumulator.averageValue).toBe(4);
    });
});
