import Canvas from "../../components/Canvas";
import {useRef} from "react";
import {not_null} from "../../utils.tsx";

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
    pos_x: number;
    /// top y position.
    pos_y: number;
    /// object width.
    width: number;
    /// object height.
    height: number;
    /// object movement velocity in the x direction (0 for none).
    vel_x: number;
    /// object movement velocity in the y direction (0 for none).
    vel_y: number;
}

class Block implements GameObject {
    pos_x: number;
    pos_y: number;
    width: number;
    height: number;
    vel_x: number;
    vel_y: number;
    def: BlockDefinition;

    constructor(pos_x: number, pos_y: number, width: number, height: number, def: BlockDefinition) {
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.width = width;
        this.height = height;
        this.vel_x = 0;
        this.vel_y = 0;
        this.def = def;
    }
}

// TODO: Don't store the width or height of the level here, calculate using canvas dims. Assume
//       a maximum of 10 rows that take up to 50% of the top half of the screen.
//       Alternatively, store the height (maybe width) as a percentage in the level.
class GameLevel {
    blocks: Block[];

    constructor(levelWidth: number, levelHeight: number, blocks: number[][]) {
        this.blocks = [];
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
        const blockHeight = rowCount > 0 ? levelHeight / rowCount : 0;

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

    constructor() {
    }

    public onAnimationFrame(ctx: CanvasRenderingContext2D, nowTime: number, deltaTime: number) {
        if (!this.hasRunInit) {
            this.onInit(ctx.canvas.width, ctx.canvas.height);
            this.hasRunInit = true;
        }

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

        this.currentLevel = new GameLevel(canvasWidth, canvasHeight / 2, blocks);
    }

    public onDraw(ctx: CanvasRenderingContext2D, _nowTime: number, _deltaTime: number) {
        // TODO: Optimize rendering by drawing background and blocks to an offscreen canvas.

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw the background.
        // TODO: Find a fancier background than just black or white.
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw the blocks.
        // TODO: Draw the blocks to an offscreen canvas that only updates as needed.
        if (this.currentLevel) {
            for (let blockIndex = 0; blockIndex < this.currentLevel.blocks.length; blockIndex++) {
                const block = this.currentLevel.blocks[blockIndex];

                ctx.fillStyle = block.def.color;
                ctx.fillRect(block.pos_x, block.pos_y, block.width, block.height);
            }
        }
    }
}

export function BlockBreaker() {
    const game = useRef(new BlockBreakerGame());
    return (<Canvas width={800} height={600} onDraw={(ctx, nowTime, deltaTime) => {
        not_null(game.current).onAnimationFrame(ctx, nowTime, deltaTime);
    }}/>);
}