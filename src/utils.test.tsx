import '@testing-library/jest-dom';
import {clamp, not_null} from "./utils";

describe('clamp', () => {
    test('returns the number if it is between min and max', () => {
        expect(clamp(3, 3, 7)).toBe(3);
        expect(clamp(4, 3, 7)).toBe(4);
        expect(clamp(5, 3, 7)).toBe(5);
        expect(clamp(6, 3, 7)).toBe(6);
        expect(clamp(7, 3, 7)).toBe(7);
    });

    test('returns min if the value is less than min', () => {
        expect(clamp(2, 3, 7)).toBe(3);
        expect(clamp(1, 3, 7)).toBe(3);
        expect(clamp(0, 3, 7)).toBe(3);
        expect(clamp(-1, 3, 7)).toBe(3);
        expect(clamp(-100, 3, 7)).toBe(3);
    });

    test('returns max if the value is greater than max', () => {
        expect(clamp(8, 3, 7)).toBe(7);
        expect(clamp(9, 3, 7)).toBe(7);
        expect(clamp(10, 3, 7)).toBe(7);
        expect(clamp(100, 3, 7)).toBe(7);
    });
});

describe('not_null', () => {
    test('returns the value if it is not null', () => {
        expect(not_null(123)).toEqual(123);
        expect(not_null("hello")).toEqual("hello");

        const foo = {name: "Delta", age: 44};
        expect(not_null(foo)).toEqual(foo);
    });

    test('throws an error if the value is undefined', () => {
        expect(() => not_null(undefined)).toThrow(/cannot be null or undefined/);
    });

    test('throws an error if the value is null', () => {
        expect(() => not_null(null)).toThrow(/cannot be null or undefined/);
    });

    test('throws an error with a custom message', () => {
        expect(() => not_null(null, "custom message")).toThrow(/custom message/);
    });
});