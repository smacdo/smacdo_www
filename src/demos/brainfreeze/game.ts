import { Input } from "./input.ts";
import { LevelPack } from "./level_manager.ts";
import { TILE_WALL, SokobanGame } from "./sokoban-game.ts";

export class Game {
    canvasContext: CanvasRenderingContext2D;
    input: Input;
    levelPack: LevelPack;
    gameState: SokobanGame;
    previousTimestamp: number | null;

    constructor(canvasContext: CanvasRenderingContext2D, input: Input, levelPack: LevelPack) {
        this.canvasContext = canvasContext;
        this.input = input;
        this.previousTimestamp = null;

        // Gameplay state.
        this.levelPack = levelPack;
        this.gameState = new SokobanGame(this.levelPack.currentLevel);
    }

    /** Starts the game. */
    start() {
        console.log("game started");
        requestAnimationFrame((timestamp) => this.frame(timestamp));
    }

    /**
     * Triggers game state updates and rendering as needed, depending on the
     * amount of time that has elapsed since the last call to `frame()`.
     */
    frame(timestamp: number) {
        // Calculate the amount of time that has elapsed since the last time `frame()` was called.
        const rawDeltaTime =
            this.previousTimestamp === null ? 0 : (timestamp - this.previousTimestamp) / 1000;
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

    /** Advance game state. */
    update(_deltaTime: number) {
        // TODO: use deltaTime and perform movement animation.

        // Perform player's requested action.
        const canGoToNextLevel = this.gameState.isComplete() && this.levelPack.hasNextLevel();

        if (this.input.isKeyPressed("Enter") && canGoToNextLevel) {
            // Advance to the next level when `enter` is pressed.
            this.levelPack.advance();
            this.gameState = new SokobanGame(this.levelPack.currentLevel);
        } else if (this.input.isKeyPressed("r")) {
            // Reset the level when `r` is pressed.
            // TODO: Consider asking for confirmation.
            this.gameState.restart();
        } else if (this.input.isKeyPressed("z")) {
            this.gameState.undo();
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

    /** Draw game state. */
    render() {
        //const canvas = this.canvasContext.canvas;

        // Style configuration.
        const WALL_COLOR = "white";
        const FLOOR_COLOR = "gray";
        const PLAYER_COLOR = "yellow";
        const BOX_COLOR = "brown";
        const GOAL_EMPTY_COLOR = "red";
        const GOAL_FULL_COLOR = "pink";

        const MESSAGE_BG_COLOR = "yellow";
        const MESSAGE_FG_COLOR = "black";

        // Tile map configuration.
        const tileWidth = 64;
        const tileHeight = 64;

        const drawTileBorders = true;

        if (drawTileBorders) {
            this.canvasContext.strokeStyle = "black";
            this.canvasContext.lineWidth = 2;
        }

        // Draw the tile map.
        const colCount = this.gameState.tilemap.cols;
        const rowCount = this.gameState.tilemap.rows;

        for (let y = 0; y < rowCount; y++) {
            for (let x = 0; x < colCount; x++) {
                const tile = this.gameState.tilemap.get(x, y);
                this.canvasContext.fillStyle = tile === TILE_WALL ? WALL_COLOR : FLOOR_COLOR;

                this.canvasContext.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
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

        const goals = this.gameState.goals;
        const goal_count = goals.length;

        for (let i = 0; i < goal_count; i++) {
            const goalX = goals[i].x;
            const goalY = goals[i].y;

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

        const boxes = this.gameState.boxes;
        const box_count = boxes.length;

        for (let i = 0; i < box_count; i++) {
            const boxX = boxes[i].x;
            const boxY = boxes[i].y;

            this.canvasContext.fillStyle = BOX_COLOR;
            this.canvasContext.fillRect(
                boxX * tileWidth + boxOffsetX,
                boxY * tileHeight + boxOffsetY,
                boxWidth,
                boxHeight,
            );
        }

        // Draw the player.
        const player = this.gameState.player;
        const playerX = player.x;
        const playerY = player.y;

        this.canvasContext.fillStyle = PLAYER_COLOR;
        this.canvasContext.fillRect(
            playerX * tileWidth + goalOffsetX,
            playerY * tileHeight + goalOffsetY,
            goalWidth,
            goalHeight,
        );

        // Show a message to the player when they beat the level.
        if (this.gameState.isComplete()) {
            this.canvasContext.fillStyle = MESSAGE_BG_COLOR;
            this.canvasContext.fillRect(40, 30, 450, 100);

            if (this.levelPack.hasNextLevel()) {
                // The player has beaten the current level in the pack, but there are more levels.
                this.canvasContext.font = "48px Arial";
                this.canvasContext.fillStyle = MESSAGE_FG_COLOR;
                this.canvasContext.fillText("Level complete!", 80, 80);

                this.canvasContext.font = "18px Arial";
                this.canvasContext.fillStyle = MESSAGE_FG_COLOR;
                this.canvasContext.fillText("Press enter to go to the next level", 100, 110);
            } else {
                // The player has beaten all of the levels in the pack!
                this.canvasContext.font = "bold 48px Arial";
                this.canvasContext.fillStyle = MESSAGE_FG_COLOR;
                this.canvasContext.fillText("YOU ARE WINNER", 50, 100);
            }
        }
    }
}
