export class Input {
    constructor() {
        this.keysDown = new Set(); // Keys that are pushed (current frame and continous).
        this.keysPressed = new Set(); // Keys that were pushed for the current frame.

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
     *
     * @param {string} key
     */
    isKeyPressed(key) {
        return this.keysPressed.has(key);
    }

    /**
     * Checks if a keyboard button `key` is pushed.
     *
     * key: The name of the keyboard button, taken from `event.key`.
     *
     * @param {string} key
     */
    isKeyDown(key) {
        return this.keysDown.has(key);
    }

    /**
     * Called when a keyboard button is pushed.
     * @param {KeyboardEvent} event
     */
    #onKeyDown(event) {
        const key = event.key;

        if (!this.keysDown.has(key)) {
            this.keysPressed.add(key);
        }

        this.keysDown.add(key);
    }

    /**
     * Called when a keyboard button is no longer pushed.
     * @param {KeyboardEvent} event
     */
    #onKeyUp(event) {
        this.keysDown.delete(event.key);
    }
}
