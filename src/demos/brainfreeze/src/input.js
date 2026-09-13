export class Input {
  constructor() {
    this.keysDown = new Set();

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
    });
  }

  /**
   * Checks if a keyboard button `key` is down. The name is from `KeyboardEvent.key`.
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
    // TODO: log when a key is pressed - ONCE. do the same when it's released.
    this.keysDown.add(event.key);
  }

  /**
   * Called when a keyboard button is no longer pushed.
   * @param {KeyboardEvent} event
   */
  #onKeyUp(event) {
    this.keysDown.delete(event.key);
  }
}
