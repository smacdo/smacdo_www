import Canvas from "../../components/Canvas";
import {useRef} from "react";
import {not_null} from "../../utils.tsx";

const BRICK_COLORS = ["#3399FF", "#00B300", "#CCCC66", "#FF8000"];

/*
class GameObject {
    pos_x: number;
    pos_y: number;
    width: number;
    height: number;
    vel_x: number;
    vel_y: number;
}
*/

// TODO: Don't store the width or height of the level here, use the canvas dims.

class Level {
    bricks: number[][];

    constructor(bricks: number[][]) {
        this.bricks = bricks;
    }

    public maxRowLength() {
        let maxRowLength = 0;

        for (let i = 0; i < this.bricks.length; i++) { // TODO: extract utility function
            maxRowLength = this.bricks[i].length > maxRowLength ? this.bricks[i].length : maxRowLength;
        }

        return maxRowLength;
    }
}

class BlockBreakerGame {
    private currentLevel: Level;

    constructor(level?: Level) {
        if (level) {
            this.currentLevel = level;
        } else {
            this.currentLevel = new Level([
                    [1, 1, 1, 1, 1, 1],
                    [2, 2, 0, 0, 2, 2],
                    [3, 3, 4, 4, 3, 3],
                ]
            );
        }
    }

    public onDraw(ctx: CanvasRenderingContext2D, _nowTime: number, _deltaTime: number) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        // Draw the bricks.
        // TODO: Draw the bricks to an offscreen canvas that only updates as needed.
        const rowCount = this.currentLevel.bricks.length;
        const maxColCount = this.currentLevel.maxRowLength();
        const brickWidth = maxColCount > 0 ? ctx.canvas.width / maxColCount : 0;
        const brickHeight = rowCount > 0 ? ctx.canvas.height / rowCount : 0;

        for (let row = 0; row < rowCount; row++) {
            for (let col = 0; col < this.currentLevel.bricks[row].length; col++) {
                const brick = this.currentLevel.bricks[row][col];

                // Only draw solid bricks.
                if (brick > 0) {
                    ctx.fillStyle = BRICK_COLORS[brick - 1];
                    ctx.fillRect(col * brickWidth, row * brickHeight, brickWidth, brickHeight);
                }
            }
        }

        //ctx.font = "72px Georgia, Helvetica, Arial, sans-serif";
        //ctx.fillStyle = '#4A4A4A';
        //ctx.fillText("Hello Earth", 100, 100);
    }
}

export function BlockBreaker() {
    const game = useRef(new BlockBreakerGame());
    return (<Canvas width={800} height={600} onDraw={(ctx, nowTime, deltaTime) => {
        not_null(game.current).onDraw(ctx, nowTime, deltaTime);
    }}/>);
}