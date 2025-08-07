import {not_null} from "../../lib/utils.tsx";
import {BaseGame, GameCanvas} from "../../components/Game";
import {GameObject} from "../../lib/gamebox/object.ts";
import {AABB, Circle, resolve_collision} from "../../lib/gamebox/bounds.ts";
import {lerp, vector_length} from "../../lib/gamebox/math.ts";
import {Direction, vector_direction} from "../../lib/gamebox/direction.ts";
import {ImageLoader} from "../../lib/gamebox/resources.ts";

import PuzzleSpritesheetImage from "../../content/puzzle-spritesheet.png";
import {SpriteDefinition} from "../../lib/gamebox/sprites.ts";

// ASSORTED TODO LIST
// ==================================
//  Draw arbitrary output size from fixed internal canvas size while respecting ratio
//  Use Puzzle Spritesheet JSON instead of hard coded sprite definition values.

const RENDER_WIDTH = 720;
const RENDER_HEIGHT = 1280;

const PADDLE_WIDTH = 104;
const PADDLE_HEIGHT = 24;
const PADDLE_SPEED_X = 500;
const BLOCK_WIDTH = 64;
const BLOCK_HEIGHT = 32;

const BALL_BASE_VELOCITY_X = 100.0;
const BALL_BLOCK_COLLISION_VELOCITY_MODIFIER = 2.0;

const BALL_VEL_Y = -600;
const BALL_RADIUS = 11;

const DEFAULT_LEVEL: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 4, 4, 3, 3, 3, 4, 4, 3, 3],
    [3, 3, 4, 4, 3, 3, 3, 4, 4, 3, 3],
    [2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 3],
    [2, 2, 2, 3, 3, 4, 3, 3, 2, 2, 2],
];

interface BlockDefinition {
    color: string;
    solid: boolean;
    spriteDef: SpriteDefinition;
}

const BLOCKS: BlockDefinition[] = [
    {
        color: "#3399FF",
        solid: true,
        spriteDef: new SpriteDefinition(151, 213, BLOCK_WIDTH, BLOCK_HEIGHT, "element_grey_rectangle"),
    },
    {
        color: "#00B300",
        solid: false,
        spriteDef: new SpriteDefinition(1, 113, BLOCK_WIDTH, BLOCK_HEIGHT, "element_blue_rectangle_glossy"),
    },
    {
        color: "#CCCC66",
        solid: false,
        spriteDef: new SpriteDefinition(167, 163, BLOCK_WIDTH, BLOCK_HEIGHT, "element_green_rectangle_glossy"),
    },
    {
        color: "#FF8000",
        solid: false,
        spriteDef: new SpriteDefinition(117, 295, BLOCK_WIDTH, BLOCK_HEIGHT, "element_purple_rectangle_glossy"),
    },
    {
        color: "#FF8000",
        solid: false,
        spriteDef: new SpriteDefinition(351, 231, BLOCK_WIDTH, BLOCK_HEIGHT, "element_red_rectangle_glossy"),
    },
    {
        color: "#FF8000",
        solid: false,
        spriteDef: new SpriteDefinition(117, 347, BLOCK_WIDTH, BLOCK_HEIGHT, "element_yellow_rectangle_glossy"),
    },
];

class Block extends GameObject {
    alive = true;

    constructor(left: number, top: number, public def: BlockDefinition) {
        super(new AABB(left, top, BLOCK_WIDTH, BLOCK_HEIGHT));
    }
}

class Ball extends GameObject {
    stuckToPaddle = true;

    constructor(x: number, y: number, radius: number, public spriteDef: SpriteDefinition) {
        super(new Circle(x, y, radius));
    }
}

class Paddle extends GameObject {
    constructor(centerX: number, centerY: number, width: number, height: number, public spriteDef: SpriteDefinition) {
        super(new AABB(centerX - width / 2.0, centerY - height / 2.0, width, height));
    }
}

class GameLevel {
    blocks: Block[];
    balls: Ball[];
    paddles: Paddle[];
    levelWidth: number;
    levelHeight: number;

    constructor(levelWidth: number, levelHeight: number, blocks: number[][], ballSpriteDef: SpriteDefinition, paddleSpriteDef: SpriteDefinition) {
        this.levelWidth = levelWidth;
        this.levelHeight = levelHeight;
        this.blocks = [];
        this.balls = [new Ball(0, 0, BALL_RADIUS, ballSpriteDef)];
        this.paddles = [new Paddle(levelWidth / 2, levelHeight - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, paddleSpriteDef)];

        this.load(blocks);
    }

    public load(initialBlocks: number[][]) {
        this.blocks = [];

        // Use the first row as the number of columns in the level. This assumes that the grid is
        // rectangular otherwise undefined behavior may occur.
        // TODO: Check if width or height exceeds expected viewport size.
        const rowCount = initialBlocks.length;

        for (let row = 0; row < rowCount; row++) {
            for (let col = 0; col < initialBlocks[row].length; col++) {
                const block = initialBlocks[row][col];

                if (block > 0) {
                    this.blocks.push(new Block(
                        col * BLOCK_WIDTH,
                        row * BLOCK_HEIGHT,
                        BLOCKS[block - 1]
                    ));
                }
            }
        }
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
        super(RENDER_WIDTH, RENDER_HEIGHT, 2);

        this.imageLoader.requestLoad("PuzzleSpritesheet", PuzzleSpritesheetImage, (image) => {
            this.puzzleSpritesheet = image;
        });
    }

    override onStart() {
        this.loadLevel();
    }

    loadLevel() {
        this.currentLevel = new GameLevel(
            RENDER_WIDTH,
            RENDER_HEIGHT,
            DEFAULT_LEVEL,
            new SpriteDefinition(1, 1, 22, 22, "ballBlue"),
            new SpriteDefinition(1, 265, 104, 24, "paddleBlu"),
        );
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

    onDraw(ctx: OffscreenCanvasRenderingContext2D, interpolation: number) {
        ctx.clearRect(0, 0, this.viewport.renderWidth, this.viewport.renderHeight);

        // Display an initial progress bar at start up while loading resources for the game.
        // TODO: Show a progress bar.
        if (this.imageLoader.errorCount() > 0) {
            ctx.fillText('failed to load resources, please see developer console for details', 10, 10);
            return;
        } else if (this.imageLoader.requestsPendingCount() > 0) {
            ctx.fillText('loading resources...', 10, 10);
            return;
        }

        //ctx.drawImage(not_null(this.puzzleSpritesheet), 0, 0); // TODO: not_null is annoying.

        // Draw the background.
        // TODO: Find a fancier background than just black or white.
        // TODO: Optimize rendering by drawing background to an offscreen canvas.
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(
            0,
            0,
            this.viewport.renderWidth,
            this.viewport.renderHeight);

        // Draw the game level (blocks, paddles, balls etc.).
        if (this.currentLevel) {
            this.drawBlocks(ctx, interpolation, this.currentLevel);
            this.drawPaddles(ctx, interpolation, this.currentLevel);
            this.drawBalls(ctx, interpolation, this.currentLevel);
        }
    }

    drawBlocks(ctx: OffscreenCanvasRenderingContext2D, _interpolation: number, level: GameLevel) {
        // TODO: Draw the blocks to an offscreen canvas that only updates as needed.
        for (let blockIndex = 0; blockIndex < level.blocks.length; blockIndex++) {
            const block = level.blocks[blockIndex];

            if (block.alive) {
                ctx.drawImage(
                    not_null(this.puzzleSpritesheet),
                    block.def.spriteDef.x,
                    block.def.spriteDef.y,
                    block.def.spriteDef.width,
                    block.def.spriteDef.height,
                    block.aabb.left,
                    block.aabb.top,
                    block.aabb.width,
                    block.aabb.height);
            }
        }
    }

    drawPaddles(ctx: OffscreenCanvasRenderingContext2D, interpolation: number, level: GameLevel) {
        for (let paddleIndex = 0; paddleIndex < level.paddles.length; paddleIndex++) {
            const paddle = level.paddles[paddleIndex];
            const paddleX = lerp(paddle.prevX, paddle.x, interpolation);
            const paddleY = lerp(paddle.prevY, paddle.y, interpolation);

            ctx.drawImage(
                not_null(this.puzzleSpritesheet),
                paddle.spriteDef.x,
                paddle.spriteDef.y,
                paddle.spriteDef.width,
                paddle.spriteDef.height,
                paddleX - paddle.aabb.halfWidth,
                paddleY - paddle.aabb.halfHeight,
                paddle.aabb.width,
                paddle.aabb.height);
        }
    }

    drawBalls(ctx: OffscreenCanvasRenderingContext2D, interpolation: number, level: GameLevel) {
        for (let ballIndex = 0; ballIndex < level.balls.length; ballIndex++) {
            const ball = level.balls[ballIndex];
            const ballX = lerp(ball.prevX, ball.x, interpolation);
            const ballY = lerp(ball.prevY, ball.y, interpolation);

            ctx.drawImage(
                not_null(this.puzzleSpritesheet),
                ball.spriteDef.x,
                ball.spriteDef.y,
                ball.spriteDef.width,
                ball.spriteDef.height,
                ballX - ball.aabb.halfWidth,
                ballY - ball.aabb.halfHeight,
                ball.aabb.width,
                ball.aabb.height);
        }
    }

    onUpdate(_nowTime: number, deltaTime: number) {
        // Only run the game update logic when there is a loaded level.
        if (this.currentLevel !== null) {
            const currentLevel = not_null(this.currentLevel);

            // Update paddles.
            for (let paddleIndex = 0; paddleIndex < currentLevel.paddles.length; paddleIndex++) {
                const paddle = currentLevel.paddles[paddleIndex];

                paddle.prevX = paddle.x;
                paddle.prevY = paddle.y;

                this.updatePaddle(currentLevel, paddle, deltaTime);
                this.updatePaddleCollision(currentLevel, paddle, deltaTime);
            }

            // Update balls.
            for (let ballIndex = 0; ballIndex < currentLevel.balls.length; ballIndex++) {
                const ball = currentLevel.balls[ballIndex];

                ball.prevX = ball.x;
                ball.prevY = ball.y;

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
        paddle.velX = 0;

        if (this.moveLeftRequested && paddle.aabb.left - displacement > 0) {
            paddle.x -= displacement;
            paddle.velX = -PADDLE_SPEED_X;
        }

        if (this.moveRightRequested && paddle.aabb.right + displacement <= level.levelWidth) {
            paddle.x += displacement;
            paddle.velX = PADDLE_SPEED_X;
        }
    }

    updatePaddleCollision(level: GameLevel, paddle: Paddle, _deltaTime: number) {
        for (let ballIndex = 0; ballIndex < level.balls.length; ballIndex++) {
            const ball = level.balls[ballIndex];

            // Skip the ball if it's stuck to the paddle, or if it doesn't intersect with the paddle.
            if (ball.stuckToPaddle) {
                continue;
            }

            const collision = resolve_collision(ball.preciseBounds, paddle.aabb);

            if (!collision) {
                continue;
            }

            // Find the distance from the middle of the paddle to the ball intersection point. The
            // velocity change from impact is larger the further from the middle the collision is.
            const distance = ball.x - paddle.x;
            const scaled_distance = distance / paddle.aabb.halfWidth;

            const old_vel_x = ball.velX;
            const old_vel_y = ball.velY;

            ball.velX = BALL_BASE_VELOCITY_X * BALL_BLOCK_COLLISION_VELOCITY_MODIFIER * scaled_distance;
            ball.velY = -1.0 * Math.abs(ball.velY); // always move up, fixes "ball stuck in paddle" bug.

            const new_vel_len = vector_length(ball.velX, ball.velY);
            const old_vel_len = vector_length(old_vel_x, old_vel_y);

            ball.velX = ball.velX / new_vel_len * old_vel_len;
            ball.velY = ball.velY / new_vel_len * old_vel_len;
        }
    }

    updateBallPosition(level: GameLevel, ball: Ball, deltaTime: number) {
        ball.x += ball.velX * deltaTime;
        ball.y += ball.velY * deltaTime;

        if (ball.stuckToPaddle) {
            const paddle = not_null(level.paddles[0]);

            ball.x = paddle.x;
            ball.y = paddle.aabb.top - ball.aabb.halfHeight;
            ball.velX = paddle.velX;
            ball.velY = BALL_VEL_Y;

            if (this.launchBallRequested) {
                ball.stuckToPaddle = false;
                this.launchBallRequested = false;
            }
        } else {
            const radius = (ball.preciseBounds as Circle).radius;

            if (ball.x - radius < 0) {
                ball.x = radius;
                ball.velX = -ball.velX;
            } else if (ball.x + radius > level.levelWidth) {
                ball.x = level.levelWidth - radius;
                ball.velX = -ball.velX;
            } else if (ball.y - radius < 0) {
                ball.y = radius;
                ball.velY = -ball.velY;
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
            const collision = resolve_collision(ball.preciseBounds, block.aabb);

            if (!collision) {
                continue;
            }

            // Resolve the collision by only on the collision axis, and ignore the other axis.
            const c_len = vector_length(collision.x, collision.y);
            const c_dir = vector_direction(collision.x / c_len, collision.y / c_len);

            if (c_dir === Direction.East || c_dir === Direction.West) {
                const penetration_distance = ball.aabb.halfHeight - Math.abs(collision.x);

                if (c_dir === Direction.East) {
                    ball.x += penetration_distance;
                } else {
                    ball.x -= penetration_distance;
                }

                ball.velX *= -1;
            } else {
                const penetration_distance = ball.aabb.halfHeight - Math.abs(collision.y);

                if (c_dir === Direction.North) {
                    ball.y += penetration_distance;
                } else {
                    ball.y -= penetration_distance;
                }

                ball.velY *= -1;
            }

            // Destroy any non-solid block that has been hit.
            if (!block.def.solid) {
                block.alive = false;
            }
        }
    }
}

export function BlockBreaker() {
    return (
        <div className="game-container">
            <GameCanvas
                style={{width: '100%', height: '100%'}}
                game={new BlockBreakerGame()}
            />
        </div>
    );
}