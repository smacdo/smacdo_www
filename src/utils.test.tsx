import '@testing-library/jest-dom';
import {not_null} from "./utils";

describe("not_null", () => {
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
    })
});