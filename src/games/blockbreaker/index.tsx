import {not_null} from "../../utils.tsx";
import {BaseGame, GameCanvas} from "../../components/Game";
import {AabbGameObject, CircleGameObject} from "../../components/Game/object.ts";
import {circle_rect_intersects} from "../../components/Game/bounds.ts";

const PADDLE_WIDTH = 100.0;
const PADDLE_HEIGHT = 20.0;
const PADDLE_SPEED_X = 400;

const BALL_VEL_Y = -400;
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

class Block extends AabbGameObject {
    alive = true;

    constructor(left: number, top: number, width: number, height: number, public def: BlockDefinition) {
        super(left, top, width, height, 0, 0);
    }
}

class Ball extends CircleGameObject {
    stuckToPaddle = true;

    constructor(public x: number, public y: number, public radius: number, public vel_x: number, public vel_y: number) {
        super(x, y, radius, vel_x, vel_y);
    }
}

class Paddle extends AabbGameObject {
    constructor(center_x: number, center_y: number, width: number, height: number) {
        super(center_x - width / 2.0, center_y - height / 2.0, width, height, 0, 0);
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
        this.balls.push(new Ball(levelWidth * 0.15, levelHeight * 0.55, BALL_RADIUS, 0, BALL_VEL_Y));
    }
}

class BlockBreakerGame extends BaseGame {
    private currentLevel?: GameLevel;
    // TODO: refactor these into an input controller.
    private moveLeftRequested = false;
    private moveRightRequested = false;
    private launchBallRequested = false;

    constructor() {
        super();
    }

    override onInit() {
        const blocks = [
            [1, 1, 1, 1, 1, 1],
            [2, 2, 0, 0, 2, 2],
            [3, 3, 4, 4, 3, 3],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];

        this.currentLevel = new GameLevel(this.canvasWidth, this.canvasHeight, blocks);
    }

    onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case 'a':
                this.moveLeftRequested = true;
                break;
            case 'd':
                this.moveRightRequested = true;
                break;
            case ' ':
                this.launchBallRequested = true;
                break;
        }
    }

    onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case 'a':
                this.moveLeftRequested = false;
                break;
            case 'd':
                this.moveRightRequested = false;
                break;
        }
    }

    onDraw(ctx: CanvasRenderingContext2D, _nowTime: number, _deltaTime: number) {
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw the background.
        // TODO: Find a fancier background than just black or white.
        // TODO: Optimize rendering by drawing background to an offscreen canvas.
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw the game level (blocks, paddles, balls etc.).
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

            if (block.alive) {
                ctx.fillStyle = block.def.color;
                ctx.fillRect(block.left(), block.top(), block.width(), block.height());
            }
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

    onUpdate(_nowTime: number, deltaTime: number) {
        if (this.currentLevel !== null) {
            const currentLevel = not_null(this.currentLevel);

            for (let paddleIndex = 0; paddleIndex < currentLevel.paddles.length; paddleIndex++) {
                this.updatePaddle(currentLevel, currentLevel.paddles[paddleIndex], deltaTime);
            }

            for (let ballIndex = 0; ballIndex < currentLevel.balls.length; ballIndex++) {
                this.updateBallPosition(currentLevel, currentLevel.balls[ballIndex], deltaTime);
                this.updateBallCollisions(currentLevel, currentLevel.balls[ballIndex], deltaTime);
            }
        }
    }

    updatePaddle(level: GameLevel, paddle: Paddle, deltaTime: number) {
        // TODO: When bounds checking allow the paddle to move all the way to the edge.
        const displacement = PADDLE_SPEED_X * deltaTime;

        if (this.moveLeftRequested && paddle.left() - displacement > 0) {
            paddle.x -= displacement;
            paddle.vel_x = -PADDLE_SPEED_X;
        }

        if (this.moveRightRequested && paddle.right() + displacement <= level.levelWidth) {
            paddle.x += displacement;
            paddle.vel_x = PADDLE_SPEED_X;
        }
    }

    updateBallPosition(level: GameLevel, ball: Ball, deltaTime: number) {
        ball.x += ball.vel_x * deltaTime;
        ball.y += ball.vel_y * deltaTime;

        if (ball.stuckToPaddle) {
            const paddle = not_null(level.paddles[0]);

            ball.x = paddle.x;
            ball.y = paddle.top() - ball.radius;
            ball.vel_x = paddle.vel_x;
            ball.vel_y = BALL_VEL_Y;

            if (this.launchBallRequested) {
                console.info(`launch ball at vx ${ball.vel_x}`);
                ball.stuckToPaddle = false;
            }
        } else {
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

    updateBallCollisions(level: GameLevel, ball: Ball, _deltaTime: number) {
        // Skip if the ball has not launched.
        if (ball.stuckToPaddle) {
            return;
        }

        // Check every block to see if there is a collision between it and the ball.
        for (let blockIndex = 0; blockIndex < level.blocks.length; blockIndex++) {
            const block = level.blocks[blockIndex];

            if (block.alive && circle_rect_intersects(ball, block)) {
                block.alive = false;
            }
        }
    }
}

export function BlockBreaker() {
    return (<GameCanvas width={800} height={600} game={new BlockBreakerGame()}/>);
}