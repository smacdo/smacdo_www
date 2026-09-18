// @vitest-environment jsdom

import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { Input } from "./input.js";

function keyEvent(type: "keydown" | "keyup", key: string): KeyboardEvent {
    return new KeyboardEvent(type, { key });
}

describe("Input", () => {
    let input: Input;

    beforeAll(() => {
        input = new Input();
    });

    beforeEach(() => {
        window.dispatchEvent(new Event("blur"));
    });

    it("records a key as down and newly pressed on keydown", () => {
        window.dispatchEvent(keyEvent("keydown", "w"));

        expect(input.isKeyDown("w")).toBe(true);
        expect(input.isKeyPressed("w")).toBe(true);
    });

    it("keeps a held key down while clearing its per-frame pressed state", () => {
        window.dispatchEvent(keyEvent("keydown", "w"));

        input.endFrame();

        expect(input.isKeyDown("w")).toBe(true);
        expect(input.isKeyPressed("w")).toBe(false);
    });

    it("does not treat repeated keydown events as new presses while a key is held", () => {
        window.dispatchEvent(keyEvent("keydown", "w"));
        input.endFrame();

        window.dispatchEvent(keyEvent("keydown", "w"));

        expect(input.isKeyDown("w")).toBe(true);
        expect(input.isKeyPressed("w")).toBe(false);
    });

    it("releases a key without erasing the press recorded for the current frame", () => {
        window.dispatchEvent(keyEvent("keydown", "w"));
        window.dispatchEvent(keyEvent("keyup", "w"));

        expect(input.isKeyDown("w")).toBe(false);
        expect(input.isKeyPressed("w")).toBe(true);
    });

    it("records a new press after a key has been released", () => {
        window.dispatchEvent(keyEvent("keydown", "w"));
        input.endFrame();
        window.dispatchEvent(keyEvent("keyup", "w"));

        window.dispatchEvent(keyEvent("keydown", "w"));

        expect(input.isKeyPressed("w")).toBe(true);
    });

    it("clears held and per-frame state when the window loses focus", () => {
        window.dispatchEvent(keyEvent("keydown", "w"));
        window.dispatchEvent(keyEvent("keydown", "d"));

        window.dispatchEvent(new Event("blur"));

        expect(input.isKeyDown("w")).toBe(false);
        expect(input.isKeyPressed("w")).toBe(false);
        expect(input.isKeyDown("d")).toBe(false);
        expect(input.isKeyPressed("d")).toBe(false);
    });
});
