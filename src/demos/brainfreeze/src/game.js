import DEFAULT_LEVEL from "./levels/level1.js";
import { TILE_WALL, SokobanGame } from "./sokoban_game.js";

export class Game {
  /**
   * @param {CanvasRenderingContext2D} canvasContext
   * @param {import("./input.js").Input} input
   */
  constructor(canvasContext, input) {
    this.canvasContext = canvasContext;
    this.input = input;
    this.previousTimestamp = null;

    // Gameplay state.
    this.gameState = new SokobanGame(DEFAULT_LEVEL);
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
   * @param {number} _deltaTime
   */
  update(_deltaTime) {
    // TODO: use deltaTime and perform movement animation.

    // Perform player's requested action.
    if (this.input.isKeyPressed("r")) {
      // TODO: Ask confirmation.
      this.gameState.restart();
    } else if (this.input.isKeyPressed("w")) {
      this.gameState.move(0, -1);
    } else if (this.input.isKeyPressed("s")) {
      this.gameState.move(0, 1);
    } else if (this.input.isKeyPressed("a")) {
      this.gameState.move(-1, 0);
    } else if (this.input.isKeyPressed("d")) {
      this.gameState.move(1, 0);
    }
  }

  /**
   * Draw game state.
   */
  render() {
    //const canvas = this.canvasContext.canvas;

    // Style configuration.
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
    const colCount = this.gameState.colCount();
    const rowCount = this.gameState.tilemap().length / colCount;

    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < colCount; x++) {
        const tile = this.gameState.tilemap().at(colCount * y + x);
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

    // Draw goals.
    const goalWidth = 56;
    const goalHeight = 56;
    const goalOffsetX = (tileWidth - goalWidth) / 2;
    const goalOffsetY = (tileHeight - goalHeight) / 2;

    const goals = this.gameState.goals();
    const goal_count = goals.length;

    for (let i = 0; i < goal_count; i++) {
      const goalX = goals[i][0];
      const goalY = goals[i][1];

      this.canvasContext.fillStyle = this.gameState.isBoxAt(goalX, goalY)
        ? GOAL_FULL_COLOR
        : GOAL_EMPTY_COLOR;
      this.canvasContext.fillRect(
        goalX * tileWidth + goalOffsetX,
        goalY * tileHeight + goalOffsetY,
        goalWidth,
        goalHeight,
      );
    }

    // Draw boxes.
    const boxWidth = 32;
    const boxHeight = 32;
    const boxOffsetX = (tileWidth - boxWidth) / 2;
    const boxOffsetY = (tileHeight - boxHeight) / 2;

    const boxes = this.gameState.boxes();
    const box_count = boxes.length;

    for (let i = 0; i < box_count; i++) {
      const boxX = boxes[i][0];
      const boxY = boxes[i][1];

      this.canvasContext.fillStyle = BOX_COLOR;
      this.canvasContext.fillRect(
        boxX * tileWidth + boxOffsetX,
        boxY * tileHeight + boxOffsetY,
        boxWidth,
        boxHeight,
      );
    }

    // Draw the player.
    const player = this.gameState.player();
    const playerX = player[0];
    const playerY = player[1];

    this.canvasContext.fillStyle = PLAYER_COLOR;
    this.canvasContext.fillRect(
      playerX * tileWidth + goalOffsetX,
      playerY * tileHeight + goalOffsetY,
      goalWidth,
      goalHeight,
    );

    // Show a message to the player if they've completed the level.
    if (this.gameState.isComplete()) {
      this.canvasContext.fillRect(40, 30, 450, 100);

      this.canvasContext.font = "bold 48px Arial";
      this.canvasContext.fillStyle = "black";
      this.canvasContext.fillText("YOU ARE WINNER", 50, 100);
    }
  }
}
