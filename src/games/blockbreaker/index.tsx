import Canvas from "../../components/Canvas";
import {useEffect, useRef} from "react";
import {not_null} from "../../utils.tsx";

const PADDLE_WIDTH = 100.0;
const PADDLE_HEIGHT = 20.0;
const PADDLE_SPEED_X = 400;

const BALL_VEL_X = 50;
const BALL_VEL_Y = -50;
const BALL_RADIUS = 12;
const BALL_COLOR = "#3FEFAA";

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
    /// Object's center position on the X axis.
    x: number;
    /// Object's center position on the Y axis.
    y: number;
    /// object movement velocity in the x direction (0 for none).
    vel_x: number;
    /// object movement velocity in the y direction (0 for none).
    vel_y: number;
}

interface RectBounds {
    /// Get the object's left position.
    left: () => number;
    /// Get the object's top position.
    top: () => number;
    /// Get the object's right position.
    right: () => number;
    /// Get the object's bottom position.
    bottom: () => number;
    /// Get the object's width.
    width: () => number;
    /// Get the object's height.
    height: () => number;
}

class Block implements GameObject, RectBounds {
    x: number;
    y: number;
    halfWidth: number;
    halfHeight: number;
    vel_x: number;
    vel_y: number;
    def: BlockDefinition;

    constructor(left: number, top: number, width: number, height: number, def: BlockDefinition) {
        this.halfWidth = width / 2.0;
        this.halfHeight = height / 2.0;
        this.x = left + this.halfWidth;
        this.y = top + this.halfHeight;
        this.vel_x = 0;
        this.vel_y = 0;
        this.def = def;
    }

    public left() {
        return this.x - this.halfWidth;
    }

    public right() {
        return this.x + this.halfWidth;
    }

    public top() {
        return this.y - this.halfHeight;
    }

    public bottom() {
        return this.y + this.halfHeight;
    }

    public width() {
        return 2.0 * this.halfWidth;
    }

    public height() {
        return 2.0 * this.halfHeight;
    }
}

interface CircleBounds {
    radius: number;
}

class Ball implements GameObject, CircleBounds {
    stuckToPaddle = false;

    constructor(public x: number, public y: number, public radius: number, public vel_x: number, public vel_y: number) {
    }
}

class Paddle implements GameObject, RectBounds {
    x: number;
    y: number;
    halfWidth: number;
    halfHeight: number;
    vel_x: number;
    vel_y: number;

    constructor(center_x: number, center_y: number, width: number, height: number) {
        this.x = center_x;
        this.y = center_y;
        this.halfWidth = width / 2.0;
        this.halfHeight = height / 2.0;

        this.vel_x = 0;
        this.vel_y = 0;
    }

    public left() {
        return this.x - this.halfWidth;
    }

    public right() {
        return this.x + this.halfWidth;
    }

    public top() {
        return this.y - this.halfHeight;
    }

    public bottom() {
        return this.y + this.halfHeight;
    }

    public width() {
        return 2.0 * this.halfWidth;
    }

    public height() {
        return 2.0 * this.halfHeight;
    }
}

// TODO: Don't store the width or height of the level here, calculate using canvas dims. Assume
//       a maximum of 10 rows that take up to 50% of the top half of the screen.
//       Alternatively, store the height (maybe width) as a percentage in the level.
class GameLevel {
    blocks: Block[];
    balls: Ball[];
    paddles: Paddle[];
    levelWidth: number;
    levelHeight: number;

    constructor(levelWidth: number, levelHeight: number, blocks: number[][]) {
        this.blocks = [];
        this.balls = [];
        this.paddles = [new Paddle(levelWidth / 2, levelHeight - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT)];
        this.levelWidth = levelWidth;
        this.levelHeight = levelHeight;

        this.load(levelWidth, levelHeight, blocks);
    }

    public load(levelWidth: number, levelHeight: number, initialBlocks: number[][]) {
        this.blocks = [];
        this.levelWidth = levelWidth;
        this.levelHeight = levelHeight;

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

        // Spawn an initial ball near the middle.
        // TODO: Randomize the position, and randomize the direction. Maybe velocity?
        this.balls.push(new Ball(levelWidth * 0.15, levelHeight * 0.55, BALL_RADIUS, BALL_VEL_X, BALL_VEL_Y));
    }
}

class BlockBreakerGame {
    private currentLevel?: GameLevel;
    private hasRunInit = false;
    private moveLeftRequested = false;
    private moveRightRequested = false;
    private canvasWidth = 0;
    private canvasHeight = 0;

    constructor() {
    }

    public onAnimationFrame(ctx: CanvasRenderingContext2D, nowTime: number, deltaTime: number) {
        // Recalculate the unscaled window size prior to rendering. The window dimensions need to be scaled by the
        // inverse of the canvas's scaling factor.
        const {devicePixelRatio: ratio = 1} = window;

        if (devicePixelRatio > 1) {
            this.canvasWidth = ctx.canvas.width / ratio;
            this.canvasHeight = ctx.canvas.height / ratio;
        }

        // Let the game initialize itself when `onAnimationFrame` is called for the first time.
        if (!this.hasRunInit) {
            this.onInit();
            this.hasRunInit = true;
        }

        // Draw and (possibly) update the game.
        // TODO: Proper game loop (fixed update steps, partial draws).
        ctx.scale(1.0, 1.0);
        this.onUpdate(nowTime, deltaTime);
        this.onDraw(ctx, nowTime, deltaTime);
    }

    public onInit() {
        const blocks = [
            [1, 1, 1, 1, 1, 1],
            [2, 2, 0, 0, 2, 2],
            [3, 3, 4, 4, 3, 3],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];

        this.currentLevel = new GameLevel(this.canvasWidth, this.canvasHeight, blocks);
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
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw the background.
        // TODO: Find a fancier background than just black or white.
        // TODO: Optimize rendering by drawing background to an offscreen canvas.
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw the game level (blocks, paddles, balls etc).
        if (this.currentLevel) {
            this.drawBlocks(ctx, this.currentLevel);
            this.drawPaddles(ctx, this.currentLevel);
            this.drawBalls(ctx, this.currentLevel);
        }
    }

    drawBlocks(ctx: CanvasRenderingContext2D, level: GameLevel) {
        // TODO: Draw the blocks to an offscreen canvas that only updates as needed.
        for (let blockIndex = 0; blockIndex < level.blocks.length; blockIndex++) {
            const block = level.blocks[blockIndex];

            ctx.fillStyle = block.def.color;
            ctx.fillRect(block.left(), block.top(), block.width(), block.height());
        }
    }

    drawPaddles(ctx: CanvasRenderingContext2D, level: GameLevel) {
        for (let paddleIndex = 0; paddleIndex < level.paddles.length; paddleIndex++) {
            const paddle = level.paddles[paddleIndex];

            ctx.fillStyle = PADDLE_COLOR;
            ctx.fillRect(paddle.left(), paddle.top(), paddle.width(), paddle.height());
        }
    }

    drawBalls(ctx: CanvasRenderingContext2D, level: GameLevel) {
        for (let ballIndex = 0; ballIndex < level.balls.length; ballIndex++) {
            const ball = level.balls[ballIndex];

            ctx.fillStyle = BALL_COLOR;

            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    public onUpdate(_nowTime: number, deltaTime: number) {
        if (this.currentLevel !== null) {
            const currentLevel = not_null(this.currentLevel);

            for (let paddleIndex = 0; paddleIndex < currentLevel.paddles.length; paddleIndex++) {
                this.updatePaddle(currentLevel.paddles[paddleIndex], currentLevel, deltaTime);
            }

            for (let ballIndex = 0; ballIndex < currentLevel.balls.length; ballIndex++) {
                this.updateBall(currentLevel.balls[ballIndex], currentLevel, deltaTime);
            }
        }
    }

    public updatePaddle(paddle: Paddle, level: GameLevel, deltaTime: number) {
        // TODO: When bounds checking allow the paddle to move all the way to the edge.
        const displacement = PADDLE_SPEED_X * deltaTime;

        if (this.moveLeftRequested && paddle.left() - displacement > 0) {
            paddle.x -= displacement;
            paddle.vel_x = -displacement;
        }

        if (this.moveRightRequested && paddle.right() + displacement <= level.levelWidth) {
            paddle.x += displacement;
            paddle.vel_x = displacement;
        }
    }

    public updateBall(ball: Ball, level: GameLevel, deltaTime: number) {
        ball.x += ball.vel_x * deltaTime;
        ball.y += ball.vel_y * deltaTime;

        if (!ball.stuckToPaddle){
            if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.vel_x = -ball.vel_x;
            } else if (ball.x + ball.radius > level.levelWidth) {
                ball.x = level.levelWidth - ball.radius;
                ball.vel_x = -ball.vel_x;
            } else if (ball.y - ball.radius < 0) {
                ball.y = ball.radius;
                ball.vel_y = -ball.vel_y;
            } else if (ball.y + ball.radius > level.levelHeight) {
                ball.y = ball.y - ball.radius;
                ball.vel_x = 0;
                ball.vel_y = 0;
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