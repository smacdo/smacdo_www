import Canvas from "../../components/Canvas";
import {useEffect, useRef} from "react";
import {not_null} from "../../utils.tsx";

const PADDLE_WIDTH = 100.0;
const PADDLE_HEIGHT = 20.0;
const PADDLE_SPEED_X = 400;

const PADDLE_COLOR = "#B0CAB0";

interface BlockDefinition {
    color: string;
}

const BLOCKS: BlockDefinition[] = [
    {
        color: "#3399FF",
    },
    {
        color: "#00B300",
    },
    {
        color: "#CCCC66",
    },
    {
        color: "#FF8000",
    },
]

interface GameObject {
    /// left x position.
    left: number;
    /// top y position.
    top: number;
    /// right x position.
    right: number;
    /// bottom y position.
    bottom: number;
    /// object movement velocity in the x direction (0 for none).
    vel_x: number;
    /// object movement velocity in the y direction (0 for none).
    vel_y: number;
}

class Block implements GameObject {
    left: number;
    top: number;
    right: number;
    bottom: number;
    vel_x: number;
    vel_y: number;
    def: BlockDefinition;

    constructor(left: number, top: number, width: number, height: number, def: BlockDefinition) {
        this.left = left;
        this.top = top;
        this.right = left + width;
        this.bottom = top + height;
        this.vel_x = 0;
        this.vel_y = 0;
        this.def = def;
    }
}

class Paddle implements GameObject {
    left: number;
    top: number;
    right: number;
    bottom: number;
    vel_x: number;
    vel_y: number;

    constructor(center_x: number, center_y: number, width: number, height: number) {
        this.left = center_x - width / 2;
        this.top = center_y - height / 2;
        this.right = center_x + width / 2;
        this.bottom = center_y + height / 2;
        this.vel_x = 0;
        this.vel_y = 0;
    }

    public move(x: number, y: number) {
        this.left += x;
        this.right += x;
        this.top += y;
        this.bottom += y;
    }
}

// TODO: Don't store the width or height of the level here, calculate using canvas dims. Assume
//       a maximum of 10 rows that take up to 50% of the top half of the screen.
//       Alternatively, store the height (maybe width) as a percentage in the level.
class GameLevel {
    blocks: Block[];
    paddles: Paddle[];

    constructor(levelWidth: number, levelHeight: number, blocks: number[][]) {
        this.blocks = [];
        this.paddles = [new Paddle(levelWidth / 2, levelHeight - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT)];
        this.load(levelWidth, levelHeight, blocks);
    }

    public load(levelWidth: number, levelHeight: number, initialBlocks: number[][]) {
        this.blocks = [];

        // Use the first row as the number of columns in the level. This assumes that the grid is
        // rectangular otherwise undefined behavior may occur.
        // TODO: Check if non-rectangular and issue a warning.
        const rowCount = initialBlocks.length;
        const colCount = rowCount > 0 ? initialBlocks[0].length : 0;

        // Generate game objects from the provided block map.
        const blockWidth = colCount > 0 ? levelWidth / colCount : 0;
        const blockHeight = rowCount > 0 ? levelHeight / 2 / rowCount : 0;

        for (let row = 0; row < rowCount; row++) {
            for (let col = 0; col < initialBlocks[row].length; col++) {
                const block = initialBlocks[row][col];

                if (block > 0) {
                    this.blocks.push(new Block(
                        col * blockWidth,
                        row * blockHeight,
                        blockWidth,
                        blockHeight,
                        BLOCKS[block - 1]
                    ));
                }
            }
        }
    }
}

class BlockBreakerGame {
    private currentLevel?: GameLevel;
    private hasRunInit = false;
    private moveLeftRequested = false;
    private moveRightRequested = false;

    constructor() {
    }

    public onAnimationFrame(ctx: CanvasRenderingContext2D, nowTime: number, deltaTime: number) {
        if (!this.hasRunInit) {
            this.onInit(ctx.canvas.width, ctx.canvas.height);
            this.hasRunInit = true;
        }

        // TODO: Proper game loop (fixed update steps, partial draws).
        this.onUpdate(nowTime, deltaTime);
        this.onDraw(ctx, nowTime, deltaTime);
    }

    public onInit(canvasWidth: number, canvasHeight: number) {
        const blocks = [
            [1, 1, 1, 1, 1, 1],
            [2, 2, 0, 0, 2, 2],
            [3, 3, 4, 4, 3, 3],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];

        this.currentLevel = new GameLevel(canvasWidth, canvasHeight, blocks);
    }

    public onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case 'a':
                this.moveLeftRequested = true;
                break;
            case 'd':
                this.moveRightRequested = true;
                break;
        }
    }

    public onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case 'a':
                this.moveLeftRequested = false;
                break;
            case 'd':
                this.moveRightRequested = false;
                break;
        }
    }

    public onDraw(ctx: CanvasRenderingContext2D, _nowTime: number, _deltaTime: number) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw the background.
        // TODO: Find a fancier background than just black or white.
        // TODO: Optimize rendering by drawing background to an offscreen canvas.
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw the game level (blocks, paddles, balls etc).
        if (this.currentLevel) {
            this.drawBlocks(ctx, this.currentLevel);
            this.drawPaddles(ctx, this.currentLevel);
        }
    }

    drawBlocks(ctx: CanvasRenderingContext2D, level: GameLevel) {
        // TODO: Draw the blocks to an offscreen canvas that only updates as needed.
        for (let blockIndex = 0; blockIndex < level.blocks.length; blockIndex++) {
            const block = level.blocks[blockIndex];

            ctx.fillStyle = block.def.color;
            ctx.fillRect(block.left, block.top, block.right - block.left, block.bottom - block.top);
        }
    }

    drawPaddles(ctx: CanvasRenderingContext2D, level: GameLevel) {
        for (let paddleIndex = 0; paddleIndex < level.paddles.length; paddleIndex++) {
            const paddle = level.paddles[paddleIndex];

            ctx.fillStyle = PADDLE_COLOR;
            ctx.fillRect(paddle.left, paddle.top, paddle.right - paddle.left, paddle.bottom - paddle.top);
        }
    }

    public onUpdate(_nowTime: number, deltaTime: number) {
        // TODO: bounds check left/right using paddle size.
        if ((this.currentLevel?.paddles.length ?? 0) > 0) {
            const paddle = not_null(this.currentLevel).paddles[0];

            if (this.moveLeftRequested) {
                paddle.move(-PADDLE_SPEED_X * deltaTime, 0);
            }
            if (this.moveRightRequested) {
                paddle.move(PADDLE_SPEED_X * deltaTime, 0);
            }
        }
    }
}

export function BlockBreaker() {
    const game = useRef(new BlockBreakerGame());

    // Input event handlers.
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            not_null(game.current).onKeyDown(event);
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    useEffect(() => {
        const handleKeyUp = (event: KeyboardEvent) => {
            not_null(game.current).onKeyUp(event);
        };

        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keyup', handleKeyUp);
        }
    }, []);

    // Game canvas set up.
    return (<Canvas width={800} height={600} onDraw={(ctx, nowTime, deltaTime) => {
        not_null(game.current).onAnimationFrame(ctx, nowTime, deltaTime);
    }}/>);
}