/**
 * Returns the value `v` clamped to the range [`min`, `max`].
 * @param v The value to clamp.
 * @param min The minimum value that `v` can be.
 * @param max The maximum value that `v` can be.
 */
export function clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
}

/**
 * Returns the passed value if it is both defined and not null, otherwise throws an exception.
 * @param value A value which should be defined and not null.
 * @param message An optional exception message when the value is undefined or null.
 */
export function not_null<T>(value: T | null | undefined, message = "Value cannot be null or undefined"): T {
    if (value === null || value === undefined) {
        throw new Error(message);
    }

    return value;
}