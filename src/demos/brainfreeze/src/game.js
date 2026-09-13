export class Game {
  /**
   * @param {CanvasRenderingContext2D} canvasContext
   * @param {import("./input.js").Input} input
   */
  constructor(canvasContext, input) {
    this.canvasContext = canvasContext;
    this.input = input;
    this.previousTimestamp = null;
    this.x = 0;
    this.y = 100;
  }

  /** Starts the game. */
  start() {
    console.log("game started");
    requestAnimationFrame((timestamp) => this.frame(timestamp));
  }

  /**
   * @param {number} timestamp
   */
  frame(timestamp) {
    // Calculate the amount of time that has elapsed since the last time `frame()` was called.
    const rawDeltaTime =
      this.previousTimestamp === null
        ? 0
        : (timestamp - this.previousTimestamp) / 1000;
    const deltaTime = Math.min(rawDeltaTime, 0.1);

    this.previousTimestamp = timestamp;

    // Advance game simulation and render.
    // TODO: fixed step accumulator.
    this.update(deltaTime);
    this.render();

    // Post frame clean up.
    this.input.endFrame();
    requestAnimationFrame((timestamp) => this.frame(timestamp));
  }

  /**
   * Advance game state.
   * @param {number} deltaTime
   */
  update(deltaTime) {
    const speed = 200.0;
    this.x += speed * deltaTime;

    if (this.input.isKeyPressed("a")) {
      this.x -= 100;
    }

    if (this.x > 640) {
      this.x = 0;
    }

    const horizontalSpeed = 80.0;

    if (this.input.isKeyDown("s")) {
      this.y += horizontalSpeed * deltaTime;
    } else if (this.input.isKeyDown("w")) {
      this.y -= horizontalSpeed * deltaTime;
    }

    if (this.y < 0) {
      this.y = 480 - 10;
    } else if (this.y > 480) {
      this.y = 0 + 10;
    }
  }

  /**
   * Draw game state.
   */
  render() {
    const canvas = this.canvasContext.canvas;

    this.canvasContext.fillStyle = "pink";
    this.canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    this.canvasContext.fillStyle = "blue";
    this.canvasContext.fillRect(this.x, this.y, 10, 10);
  }
}
