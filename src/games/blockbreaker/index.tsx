import {not_null} from "../../lib/utils.tsx";
import {BaseGame, GameCanvas} from "../../components/Game";
import {AabbGameObject, CircleGameObject} from "../../lib/gamebox/object.ts";
import {resolve_circle_rect_collision} from "../../lib/gamebox/bounds.ts";
import {lerp, vector_length} from "../../lib/gamebox/math.ts";
import {Direction, vector_direction} from "../../lib/gamebox/direction.ts";
import {ImageLoader} from "../../lib/gamebox/resources.ts";

import PuzzleSpritesheetImage from "../../content/puzzle-spritesheet.png";

const PADDLE_WIDTH = 120.0;
const PADDLE_HEIGHT = 20.0;
const PADDLE_SPEED_X = 400;

const BALL_BASE_VELOCITY_X = 100.0;
const BALL_BLOCK_COLLISION_VELOCITY_MODIFIER = 2.0;

const BALL_VEL_Y = -400;
const BALL_RADIUS = 12;
const BALL_COLOR = "#3FEFAA";

const PADDLE_COLOR = "#B0CAB0";

const DEFAULT_LEVEL: number[][] = [
    [1, 1, 1, 1, 1, 1],
    [2, 2, 0, 0, 2, 2],
    [3, 3, 4, 4, 3, 3],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
];

interface BlockDefinition {
    color: string;
    solid: boolean;
}

const BLOCKS: BlockDefinition[] = [
    {
        color: "#3399FF",
        solid: true,
    },
    {
        color: "#00B300",
        solid: false,
    },
    {
        color: "#CCCC66",
        solid: false,
    },
    {
        color: "#FF8000",
        solid: false,
    },
];

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

// TODO: Visually report that assets failed to load.

class BlockBreakerGame extends BaseGame {
    private imageLoader: ImageLoader = new ImageLoader();
    private currentLevel?: GameLevel;
    // TODO: refactor these into an input controller.
    private moveLeftRequested = false;
    private moveRightRequested = false;
    private launchBallRequested = false;
    private puzzleSpritesheet?: HTMLImageElement = undefined;

    constructor() {
        super(2);

        this.imageLoader.requestLoad("PuzzleSpritesheet", PuzzleSpritesheetImage, (image) => {
            this.puzzleSpritesheet = image;
        });
    }

    override onStart() {
        this.loadLevel();
    }

    loadLevel() {
        this.currentLevel = new GameLevel(this.canvasWidth, this.canvasHeight, DEFAULT_LEVEL);
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

    onDraw(ctx: CanvasRenderingContext2D, interpolation: number) {
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Display an initial progress bar at start up while loading resources for the game.
        // TODO: Show a progress bar.
        if (this.imageLoader.errorCount() > 0) {
            ctx.fillText('failed to load resources, please see developer console for details', 10, 10);
            return;
        } else if (this.imageLoader.requestsPendingCount() > 0) {
            ctx.fillText('loading resources...', 10, 10);
            return;
        }

        ctx.drawImage(not_null(this.puzzleSpritesheet), 0, 0); // TODO: not_null is annoying.

        // Draw the background.
        // TODO: Find a fancier background than just black or white.
        // TODO: Optimize rendering by drawing background to an offscreen canvas.
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw the game level (blocks, paddles, balls etc.).
        if (this.currentLevel) {
            this.drawBlocks(ctx, interpolation, this.currentLevel);
            this.drawPaddles(ctx, interpolation, this.currentLevel);
            this.drawBalls(ctx, interpolation, this.currentLevel);
        }
    }

    drawBlocks(ctx: CanvasRenderingContext2D, _interpolation: number, level: GameLevel) {
        // TODO: Draw the blocks to an offscreen canvas that only updates as needed.
        for (let blockIndex = 0; blockIndex < level.blocks.length; blockIndex++) {
            const block = level.blocks[blockIndex];

            if (block.alive) {
                ctx.fillStyle = block.def.color;
                ctx.fillRect(block.left(), block.top(), block.width(), block.height());
            }
        }
    }

    drawPaddles(ctx: CanvasRenderingContext2D, interpolation: number, level: GameLevel) {
        for (let paddleIndex = 0; paddleIndex < level.paddles.length; paddleIndex++) {
            const paddle = level.paddles[paddleIndex];
            const paddleX = lerp(paddle.prev_x, paddle.x, interpolation);
            const paddleY = lerp(paddle.prev_y, paddle.y, interpolation);

            ctx.fillStyle = PADDLE_COLOR;
            ctx.fillRect(paddleX - paddle.halfWidth, paddleY - paddle.halfHeight, paddle.width(), paddle.height());
        }
    }

    drawBalls(ctx: CanvasRenderingContext2D, interpolation: number, level: GameLevel) {
        for (let ballIndex = 0; ballIndex < level.balls.length; ballIndex++) {
            const ball = level.balls[ballIndex];
            const ballX = lerp(ball.prev_x, ball.x, interpolation);
            const ballY = lerp(ball.prev_y, ball.y, interpolation);

            ctx.fillStyle = BALL_COLOR;

            ctx.beginPath();
            ctx.arc(ballX, ballY, ball.radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    onUpdate(_nowTime: number, deltaTime: number) {
        // Only run the game update logic when there is a loaded level.
        if (this.currentLevel !== null) {
            const currentLevel = not_null(this.currentLevel);

            // Update paddles.
            for (let paddleIndex = 0; paddleIndex < currentLevel.paddles.length; paddleIndex++) {
                const paddle = currentLevel.paddles[paddleIndex];

                paddle.prev_x = paddle.x;
                paddle.prev_y = paddle.y;

                this.updatePaddle(currentLevel, paddle, deltaTime);
                this.updatePaddleCollision(currentLevel, paddle, deltaTime);
            }

            // Update balls.
            for (let ballIndex = 0; ballIndex < currentLevel.balls.length; ballIndex++) {
                const ball = currentLevel.balls[ballIndex];

                ball.prev_x = ball.x;
                ball.prev_y = ball.y;

                this.updateBallPosition(currentLevel, ball, deltaTime);
                this.updateBallCollisions(currentLevel, ball, deltaTime);

                // Check for game over condition, which happens when a ball goes out of bounds.
                if (ball.y >= currentLevel.levelHeight) {
                    console.warn("game over!");
                    this.loadLevel();
                }
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

    updatePaddleCollision(level: GameLevel, paddle: Paddle, _deltaTime: number) {
        for (let ballIndex = 0; ballIndex < level.balls.length; ballIndex++) {
            const ball = level.balls[ballIndex];

            // Skip the ball if it's stuck to the paddle, or if it doesn't intersect with the paddle.
            if (ball.stuckToPaddle) {
                continue;
            }

            const collision = resolve_circle_rect_collision(ball, paddle);

            if (collision === null) {
                continue;
            }

            // Find the distance from the middle of the paddle to the ball intersection point. The
            // velocity change from impact is larger the further from the middle the collision is.
            const distance = ball.x - paddle.x;
            const scaled_distance = distance / paddle.halfWidth;

            const old_vel_x = ball.vel_x;
            const old_vel_y = ball.vel_y;

            ball.vel_x = BALL_BASE_VELOCITY_X * BALL_BLOCK_COLLISION_VELOCITY_MODIFIER * scaled_distance;
            ball.vel_y = -1.0 * Math.abs(ball.vel_y); // always move up, fixes "ball stuck in paddle" bug.

            const new_vel_len = vector_length(ball.vel_x, ball.vel_y);
            const old_vel_len = vector_length(old_vel_x, old_vel_y);

            ball.vel_x = ball.vel_x / new_vel_len * old_vel_len;
            ball.vel_y = ball.vel_y / new_vel_len * old_vel_len;
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
                ball.stuckToPaddle = false;
                this.launchBallRequested = false;
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

            // Skip the block if it's already destroyed.
            if (!block.alive) {
                continue;
            }

            // Check if the ball will hit this block. Skip the block if there's no collision.
            const collision = resolve_circle_rect_collision(ball, block);

            if (collision === null) {
                continue;
            }

            // Resolve the collision by only on the collision axis, and ignore the other axis.
            const c_len = vector_length(collision.x, collision.y);
            const c_dir = vector_direction(collision.x / c_len, collision.y / c_len);

            if (c_dir === Direction.East || c_dir === Direction.West) {
                const penetration_distance = ball.radius - Math.abs(collision.x);

                if (c_dir === Direction.East) {
                    ball.x += penetration_distance;
                } else {
                    ball.x -= penetration_distance;
                }

                ball.vel_x *= -1;
            } else {
                const penetration_distance = ball.radius - Math.abs(collision.y);

                if (c_dir === Direction.North) {
                    ball.y -= penetration_distance;
                } else {
                    ball.y += penetration_distance;
                }

                ball.vel_y *= -1;
            }

            // Destroy any non-solid block that has been hit.
            if (!block.def.solid) {
                block.alive = false;
            }
        }
    }
}

export function BlockBreaker() {
    return (<GameCanvas width={800} height={600} game={new BlockBreakerGame()}/>);
}