export class Input {
    /// Keys that are down, both this frame and previous frames.
    keysDown: Set<string>;
    /// Keys that were pushed down on this frame (not previous frames).
    keysPressed: Set<string>;

    constructor() {
        this.keysDown = new Set();
        this.keysPressed = new Set();

        // XXX: do we need to clean up the event handlers?
        window.addEventListener("keydown", (event) => {
            this.#onKeyDown(event);
        });

        window.addEventListener("keyup", (event) => {
            this.#onKeyUp(event);
        });

        window.addEventListener("blur", (_event) => {
            // Prevent any keys that are currently pressed from continuing to be pressed when focus
            // switches away from the game window.
            this.keysDown.clear();
            this.keysPressed.clear();
        });
    }

    /** Resets per-frame input state for the upcoming frame. */
    endFrame() {
        this.keysPressed.clear();
    }

    /**
     * Checks if a keyboard button `key` was pushed _this frame_.
     *
     * key: The name of the keyboard button, taken from `event.key`.
     */
    isKeyPressed(key: string) {
        return this.keysPressed.has(key);
    }

    /**
     * Checks if a keyboard button `key` is pushed.
     *
     * key: The name of the keyboard button, taken from `event.key`.
     */
    isKeyDown(key: string) {
        return this.keysDown.has(key);
    }

    /** Called when a keyboard button is pushed. */
    #onKeyDown(event: KeyboardEvent) {
        const key = event.key;

        if (!this.keysDown.has(key)) {
            this.keysPressed.add(key);
        }

        this.keysDown.add(key);
    }

    /** * Called when a keyboard button is no longer pushed. */
    #onKeyUp(event: KeyboardEvent) {
        this.keysDown.delete(event.key);
    }
}
