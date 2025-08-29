/**
 * Prevents a function `func` from executing too frequently by defining a minimum delay time before
 * running. Multiple calls to debounce within the delay period will be dropped, and the delay time
 * will be reset back to zero.
 *
 * @param func The function to debounce.
 * @param delay The number of milliseconds to wait before invoking `func`.
 */
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: number;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => func(...args), delay);
    };
}
