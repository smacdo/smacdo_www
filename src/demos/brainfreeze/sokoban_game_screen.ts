import { Input } from "./input.ts";
import { LevelPack } from "./level_manager.ts";
import { Screen } from "./screen_manager.ts";
import { TILE_WALL, SokobanGame } from "./sokoban-game.ts";

type GameModal = { kind: "level-complete" } | { kind: "pack-complete" };

export class SokobanGameScreen implements Screen {
    private _levelPack: LevelPack;
    private _gameState: SokobanGame;
    private _activeModal: GameModal | null;

    constructor(levelPack: LevelPack) {
        this._levelPack = levelPack;
        this._gameState = new SokobanGame(this._levelPack.currentLevel);
        this._activeModal = null;
    }

    update(_deltaTime: number, input: Input): Screen | null {
        // Perform player's requested action.
        if (this._activeModal == null) {
            if (input.isKeyPressed("r")) {
                // TODO: Consider asking for confirmation when restarting level.
                this._gameState.restart();
            } else if (input.isKeyPressed("z")) {
                this._gameState.undo();
            } else if (input.isKeyPressed("w")) {
                this._gameState.move(0, -1);
            } else if (input.isKeyPressed("s")) {
                this._gameState.move(0, 1);
            } else if (input.isKeyPressed("a")) {
                this._gameState.move(-1, 0);
            } else if (input.isKeyPressed("d")) {
                this._gameState.move(1, 0);
            }
        } else {
            let exitModal = false;

            if (input.isKeyPressed("r")) {
                this._gameState.restart();
                exitModal = true;
            } else if (input.isKeyPressed("z")) {
                this._gameState.undo();
                exitModal = true;
            } else {
                switch (this._activeModal.kind) {
                    case "level-complete":
                        if (input.isKeyPressed("Enter")) {
                            this._levelPack.advance();
                            this._gameState = new SokobanGame(this._levelPack.currentLevel);
                            exitModal = true;
                        }

                        break;
                    case "pack-complete":
                        break;
                }
            }

            if (exitModal) {
                this._activeModal = null;
            }
        }

        // Trigger level or pack victory modals when the player has completed a level.
        if (this._activeModal == null && this._gameState.isComplete()) {
            if (this._levelPack.hasNextLevel()) {
                this._activeModal = { kind: "level-complete" };
            } else {
                this._activeModal = { kind: "pack-complete" };
            }
        }

        return null;
    }

    render(canvasContext: CanvasRenderingContext2D): void {
        //const canvas = canvasContext.canvas;

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
            canvasContext.strokeStyle = "black";
            canvasContext.lineWidth = 2;
        }

        // Draw the tile map.
        const colCount = this._gameState.tilemap.cols;
        const rowCount = this._gameState.tilemap.rows;

        for (let y = 0; y < rowCount; y++) {
            for (let x = 0; x < colCount; x++) {
                const tile = this._gameState.tilemap.get(x, y);
                canvasContext.fillStyle = tile === TILE_WALL ? WALL_COLOR : FLOOR_COLOR;

                canvasContext.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
            }
        }

        if (drawTileBorders) {
            for (let y = 0; y < rowCount; y++) {
                for (let x = 0; x < colCount; x++) {
                    canvasContext.strokeRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
                }
            }
        }

        // Draw goals.
        const goalWidth = 56;
        const goalHeight = 56;
        const goalOffsetX = (tileWidth - goalWidth) / 2;
        const goalOffsetY = (tileHeight - goalHeight) / 2;

        const goals = this._gameState.goals;
        const goal_count = goals.length;

        for (let i = 0; i < goal_count; i++) {
            const goalX = goals[i].x;
            const goalY = goals[i].y;

            canvasContext.fillStyle = this._gameState.isBoxAt(goalX, goalY)
                ? GOAL_FULL_COLOR
                : GOAL_EMPTY_COLOR;
            canvasContext.fillRect(
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

        const boxes = this._gameState.boxes;
        const box_count = boxes.length;

        for (let i = 0; i < box_count; i++) {
            const boxX = boxes[i].x;
            const boxY = boxes[i].y;

            canvasContext.fillStyle = BOX_COLOR;
            canvasContext.fillRect(
                boxX * tileWidth + boxOffsetX,
                boxY * tileHeight + boxOffsetY,
                boxWidth,
                boxHeight,
            );
        }

        // Draw the player.
        const player = this._gameState.player;
        const playerX = player.x;
        const playerY = player.y;

        canvasContext.fillStyle = PLAYER_COLOR;
        canvasContext.fillRect(
            playerX * tileWidth + goalOffsetX,
            playerY * tileHeight + goalOffsetY,
            goalWidth,
            goalHeight,
        );

        // Check if there is a modal dialog to show to the user.
        if (this._activeModal != null) {
            canvasContext.fillStyle = MESSAGE_BG_COLOR;
            canvasContext.fillRect(40, 30, 450, 100);

            switch (this._activeModal.kind) {
                case "level-complete":
                    // The player has beaten the current level in the pack, but there are more levels.
                    canvasContext.font = "48px Arial";
                    canvasContext.fillStyle = MESSAGE_FG_COLOR;
                    canvasContext.fillText("Level complete!", 80, 80);

                    canvasContext.font = "18px Arial";
                    canvasContext.fillStyle = MESSAGE_FG_COLOR;
                    canvasContext.fillText("Press enter to go to the next level", 100, 110);
                    break;

                case "pack-complete":
                    // The player has beaten all of the levels in the pack!
                    canvasContext.font = "bold 48px Arial";
                    canvasContext.fillStyle = MESSAGE_FG_COLOR;
                    canvasContext.fillText("YOU ARE WINNER", 50, 100);
                    break;
            }
        }
    }
}
