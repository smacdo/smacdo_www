import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {debounce} from './debounce';

describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should call the function after the specified delay', () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn();

        // Function should not be called immediately
        expect(mockFn).not.toHaveBeenCalled();

        // Fast-forward time by 100ms
        vi.advanceTimersByTime(100);

        // Function should now be called
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly to the debounced function', () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn('arg1', 'arg2', 123);

        vi.advanceTimersByTime(100);

        expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('should reset the delay when called multiple times within the delay period', () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn();

        // Advance time by 50ms (less than the delay)
        vi.advanceTimersByTime(50);
        expect(mockFn).not.toHaveBeenCalled();

        // Call again, which should reset the timer
        debouncedFn();

        // Advance by another 50ms (total 100ms from first call, but only 50ms from second call)
        vi.advanceTimersByTime(50);
        expect(mockFn).not.toHaveBeenCalled();

        // Advance by another 50ms (now 100ms from the second call)
        vi.advanceTimersByTime(50);
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should only call the function once when called multiple times rapidly', () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 100);

        // Call the function multiple times rapidly
        debouncedFn();
        debouncedFn();
        debouncedFn();
        debouncedFn();

        vi.advanceTimersByTime(100);

        // Should only be called once
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should use the arguments from the last call when called multiple times', () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn('first');
        debouncedFn('second');
        debouncedFn('third');

        vi.advanceTimersByTime(100);

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should allow the function to be called again after the delay has passed', () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 100);

        // First call
        debouncedFn('first');
        vi.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenLastCalledWith('first');

        // Second call after delay
        debouncedFn('second');
        vi.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(2);
        expect(mockFn).toHaveBeenLastCalledWith('second');
    });

    it('should handle zero delay', () => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 0);

        debouncedFn();

        // With 0 delay, it should still be asynchronous (next tick)
        expect(mockFn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(0);
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple debounced instances independently', () => {
        const mockFn1 = vi.fn();
        const mockFn2 = vi.fn();
        const debouncedFn1 = debounce(mockFn1, 100);
        const debouncedFn2 = debounce(mockFn2, 200);

        debouncedFn1('fn1');
        debouncedFn2('fn2');

        vi.advanceTimersByTime(100);
        expect(mockFn1).toHaveBeenCalledTimes(1);
        expect(mockFn1).toHaveBeenCalledWith('fn1');
        expect(mockFn2).not.toHaveBeenCalled();

        vi.advanceTimersByTime(100); // Total 200ms
        expect(mockFn2).toHaveBeenCalledTimes(1);
        expect(mockFn2).toHaveBeenCalledWith('fn2');
    });

    // TODO: Fix this failing test.

    /*

    it('should preserve this context when the original function is called', () => {
        const obj = {
            value: 'test',
            method: vi.fn(function (this: any) {
                return this.value;
            })
        };

        const debouncedMethod = debounce(obj.method, 100);

        // Call the debounced method in the context of obj
        debouncedMethod.call(obj);

        vi.advanceTimersByTime(100);

        expect(obj.method).toHaveBeenCalledTimes(1);
    });

     */
});