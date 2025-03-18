export function not_null<T>(value: T | null | undefined, message = "Value cannot be null or undefined"): T {
    if (value === null || value === undefined) {
        throw new Error(message);
    }

    return value;
}