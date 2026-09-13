import level from "./levels/level1.js";
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
    //const canvas = this.canvasContext.canvas;

    // Style configuration.
    const TILE_WALL = 0;

    const WALL_COLOR = "white";
    const FLOOR_COLOR = "gray";
    const PLAYER_COLOR = "yellow";
    const BOX_COLOR = "brown";
    const GOAL_EMPTY_COLOR = "red";
    const GOAL_FULL_COLOR = "pink";

    // Tile map configuration.
    const tileWidth = 64;
    const tileHeight = 64;

    const drawTileBorders = true;

    if (drawTileBorders) {
      this.canvasContext.strokeStyle = "black";
      this.canvasContext.lineWidth = 2;
    }

    // Draw the tile map.
    const colCount = level.colsPerRow;
    const rowCount = level.tiles.length / colCount;

    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < colCount; x++) {
        const tile = level.tiles.at(colCount * y + x);
        this.canvasContext.fillStyle =
          tile === TILE_WALL ? WALL_COLOR : FLOOR_COLOR;

        this.canvasContext.fillRect(
          x * tileWidth,
          y * tileHeight,
          tileWidth,
          tileHeight,
        );
      }
    }

    if (drawTileBorders) {
      for (let y = 0; y < rowCount; y++) {
        for (let x = 0; x < colCount; x++) {
          this.canvasContext.strokeRect(
            x * tileWidth,
            y * tileHeight,
            tileWidth,
            tileHeight,
          );
        }
      }
    }

    // Draw sprites.
    const spriteWidth = 48;
    const spriteHeight = 48;
    const spriteOffsetX = (tileWidth - spriteWidth) / 2;
    const spriteOffsetY = (tileHeight - spriteHeight) / 2;

    const goal_count = level.goals.length;

    for (let i = 0; i < goal_count; i++) {
      const goalX = level.goals[i][0];
      const goalY = level.goals[i][1];

      this.canvasContext.fillStyle = GOAL_EMPTY_COLOR;
      this.canvasContext.fillRect(
        goalX * tileWidth + spriteOffsetX,
        goalY * tileHeight + spriteOffsetY,
        spriteWidth,
        spriteHeight,
      );
    }

    const box_count = level.boxes.length;

    for (let i = 0; i < box_count; i++) {
      const boxX = level.boxes[i][0];
      const boxY = level.boxes[i][1];

      this.canvasContext.fillStyle = BOX_COLOR;
      this.canvasContext.fillRect(
        boxX * tileWidth + spriteOffsetX,
        boxY * tileHeight + spriteOffsetY,
        spriteWidth,
        spriteHeight,
      );
    }

    const playerX = level.playerSpawn[0];
    const playerY = level.playerSpawn[1];

    this.canvasContext.fillStyle = PLAYER_COLOR;
    this.canvasContext.fillRect(
      playerX * tileWidth + spriteOffsetX,
      playerY * tileHeight + spriteOffsetY,
      spriteWidth,
      spriteHeight,
    );

    /*
    this.canvasContext.fillStyle = "pink";
    this.canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    this.canvasContext.fillStyle = "blue";
    this.canvasContext.fillRect(this.x, this.y, 10, 10);
    */
  }
}
