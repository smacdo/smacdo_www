import { not_null } from "../../lib/utils";

/**
 * Track samples over the requested time window and provide statistics on those samples. Excess
 * samples over the maximum will be dropped and reported.
 *
 *  The time window is the half open interval `(latestTime - windowSeconds, latestTime]` where
 * `latestTime` is the last time that `push(...)` was called.
 *
 * Time is advanced when a new sample is pushed. Accessor like sampleCount, average etc use the time
 * when push was last called as the end of the time window. Note that time is advanced even if a
 * sample is dropped when `push` is called!
 *
 * Note: Both `min` and `max` methods are O(N) rather than O(1) for simplicity right now.
 */
export class TimeSampleAccumulator {
    /** The number of seconds that a sample will live before it is removed. */
    private _requestedWindowSeconds: number;

    /**
     * Storage space for sample values _and_ the time a sample was appended. These samples and times
     * are stored interleaved for performance.
     *
     *    value[i] = 2i
     *    time[i]   = 2i + 1
     */
    private _samples: Float64Array;

    private _sampleCapacity: number;
    private _sampleCount: number;
    private _writeIndex: number;
    private _readIndex: number;
    private _latestObservedTime: number | null;
    private _latestRetainedTime: number | null;
    private _latestDropTime: number | null;
    private _totalDropCount: number;
    private _runningSum: number;

    /** Create a new sample accumulator with the given non-zero time window and expected sample rate. */
    constructor(windowSeconds: number, maxExpectedSamplesPerSecond: number) {
        if (!Number.isFinite(windowSeconds) || windowSeconds <= 0) {
            throw new Error("windowSeconds must be a positive finite value larger than zero");
        }

        if (!Number.isInteger(maxExpectedSamplesPerSecond) || maxExpectedSamplesPerSecond <= 0) {
            throw new Error(
                "maxExpectedSamplesPerSecond must be a positive integer value larger than zero",
            );
        }

        this._sampleCapacity = Math.ceil(windowSeconds * maxExpectedSamplesPerSecond);
        this._samples = new Float64Array(this._sampleCapacity * 2);

        this._requestedWindowSeconds = windowSeconds;

        this._sampleCount = 0;
        this._writeIndex = 0;
        this._readIndex = 0;
        this._latestObservedTime = null;
        this._latestRetainedTime = null;
        this._latestDropTime = null;
        this._totalDropCount = 0;
        this._runningSum = 0;
    }

    /** Clear all samples from the accumulator. */
    clear() {
        this._sampleCount = 0;
        this._writeIndex = 0;
        this._readIndex = 0;
        this._latestObservedTime = null;
        this._latestRetainedTime = null;
        this._latestDropTime = null;
        this._totalDropCount = 0;
        this._runningSum = 0;
    }

    /**
     * Add a sample value and time to the accumulator. This method returns false if the accumulator
     * is full for the current time window and will be dropped.
     *
     * Times must be monotonically nondecreasing. Smaller values will throw an exception.
     */
    push(value: number, time: number): boolean {
        // Check for invalid values and times.
        if (!Number.isFinite(value)) {
            throw new Error("sample value must be finite");
        }

        if (!Number.isFinite(time)) {
            throw new Error("sample time must be finite");
        }

        if (this._latestObservedTime != null && time < this._latestObservedTime) {
            throw new Error(
                "sample time must be equal to or larger than previously pushed sample time",
            );
        }

        // Expire samples that have fallen out of the time window.
        const oldestTime = time - this._requestedWindowSeconds;

        while (this._sampleCount > 0 && this._samples[this._readIndex * 2 + 1] <= oldestTime) {
            // Evict this value from the running sum.
            const valueToDrop = this._samples[this._readIndex * 2];
            this._runningSum -= valueToDrop;

            // TODO: Update cached min/max if this sample value matches it.

            // Advance the ring buffer read position which removes the value from the accumulator.
            this._sampleCount -= 1;
            this._readIndex = (this._readIndex + 1) % this._sampleCapacity;
        }

        // Always track the time of the latest push even if the sample is dropped.
        this._latestObservedTime = time;

        // Is there space for a new sample to be written?
        const canWrite = this._sampleCount == 0 || this._writeIndex != this._readIndex;

        if (canWrite) {
            // There is space; write the sample.
            this._samples[this._writeIndex * 2] = value;
            this._samples[this._writeIndex * 2 + 1] = time;

            this._writeIndex = (this._writeIndex + 1) % this._sampleCapacity;

            // Update running sum, count etc.
            // TODO: Consider caching the minimum and maximum values on push?
            this._latestRetainedTime = time;
            this._runningSum += value;
            this._sampleCount += 1;
        } else {
            // No space; record the dropped sample.
            this._latestDropTime = time;
            this._totalDropCount += 1;
        }

        return canWrite;
    }

    /** Get the accumulator's time window in seconds. */
    get requestedWindowSeconds(): number {
        return this._requestedWindowSeconds;
    }

    /**
     * Get the real time window for the retained samples. This may not always be equal to the
     * requested window size (e.g. during start up, or if there are dropped samples).
     *
     * The retained window is calculated as `newest_retained_timestamp - oldest_retained_timestamp`.
     */
    get retainedWindowSeconds(): number {
        // The retained time is always zero if there are zero or one samples.
        if (this.sampleCount <= 1) {
            return 0;
        }

        const oldest_time_index = this._readIndex * 2 + 1;
        return not_null(this._latestRetainedTime) - this._samples[oldest_time_index];
    }

    /**
     * Checks for dropped samples in the current time window. It will return false if there are
     * dropped samples, true otherwise.
     */
    get isComplete(): boolean {
        if (this.sampleCount == 0) {
            // TODO: is it better to return true or false here?
            return true;
        }

        return (
            this._latestDropTime == null ||
            not_null(this._latestRetainedTime) >=
                this._latestDropTime + this._requestedWindowSeconds
        );
    }

    /**
     * Get the number of samples accumulated in the current time window with the last pushed sample
     * as the most recent time.
     */
    get sampleCount(): number {
        return this._sampleCount;
    }

    /** Get the number of samples that have been dropped since the last call to clear. */
    get dropCount(): number {
        return this._totalDropCount;
    }

    /**
     * Calculate the average value of samples across the accumulator's time window, with the last
     * pushed sample as the most recent time.
     */
    get averageValue(): number | null {
        if (this._sampleCount == 0) {
            return null;
        }

        return this._runningSum / this._sampleCount;
    }

    /**
     * Get the minimum value of samples across the accumulator's time window, with the last pushed
     * sample as the most recent time.
     */
    get minValue(): number | null {
        if (this._sampleCount == 0) {
            return null;
        }

        // TODO: Try to cache the min value during push operations to make O(1).
        let nextIndex = this._readIndex;
        let minValue = this._samples[nextIndex * 2];

        for (let i = 1; i < this._sampleCount; i++) {
            nextIndex = (this._readIndex + i) % this._sampleCapacity;
            const value = this._samples[nextIndex * 2];

            if (value < minValue) {
                minValue = value;
            }
        }

        return minValue;
    }

    /**
     * Get the maximum value of samples across the accumulator's time window, with the last pushed
     * sample as the most recent time.
     */
    get maxValue(): number | null {
        if (this._sampleCount == 0) {
            return null;
        }

        // TODO: Try to cache the max value during push operations to make O(1).
        let nextIndex = this._readIndex;
        let maxValue = this._samples[nextIndex * 2];

        for (let i = 1; i < this._sampleCount; i++) {
            nextIndex = (this._readIndex + i) % this._sampleCapacity;
            const value = this._samples[nextIndex * 2];

            if (value > maxValue) {
                maxValue = value;
            }
        }

        return maxValue;
    }
}
