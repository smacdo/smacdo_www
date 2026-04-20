import {not_null} from "../../lib/utils.ts";
import {BaseGame} from "../../lib/gamebox/base-game.ts";
import {GameObject} from "../../lib/gamebox/object.ts";
import {AABB, Circle, resolve_collision} from "../../lib/gamebox/bounds.ts";
import {lerp, vector_length} from "../../lib/gamebox/math.ts";
import {Direction, vector_direction} from "../../lib/gamebox/direction.ts";
import {ImageLoader} from "../../lib/gamebox/resources.ts";
import {SpriteDefinition} from "../../lib/gamebox/sprites.ts";

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
    { color: "#3399FF", solid: true,  spriteDef: new SpriteDefinition(151, 213, BLOCK_WIDTH, BLOCK_HEIGHT, "element_grey_rectangle") },
    { color: "#00B300", solid: false, spriteDef: new SpriteDefinition(1,   113, BLOCK_WIDTH, BLOCK_HEIGHT, "element_blue_rectangle_glossy") },
    { color: "#CCCC66", solid: false, spriteDef: new SpriteDefinition(167, 163, BLOCK_WIDTH, BLOCK_HEIGHT, "element_green_rectangle_glossy") },
    { color: "#FF8000", solid: false, spriteDef: new SpriteDefinition(117, 295, BLOCK_WIDTH, BLOCK_HEIGHT, "element_purple_rectangle_glossy") },
    { color: "#FF8000", solid: false, spriteDef: new SpriteDefinition(351, 231, BLOCK_WIDTH, BLOCK_HEIGHT, "element_red_rectangle_glossy") },
    { color: "#FF8000", solid: false, spriteDef: new SpriteDefinition(117, 347, BLOCK_WIDTH, BLOCK_HEIGHT, "element_yellow_rectangle_glossy") },
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

    load(initialBlocks: number[][]) {
        this.blocks = [];
        const rowCount = initialBlocks.length;
        for (let row = 0; row < rowCount; row++) {
            for (let col = 0; col < initialBlocks[row].length; col++) {
                const block = initialBlocks[row][col];
                if (block > 0) {
                    this.blocks.push(new Block(col * BLOCK_WIDTH, row * BLOCK_HEIGHT, BLOCKS[block - 1]));
                }
            }
        }
    }
}

export class BlockBreakerGame extends BaseGame {
    private imageLoader: ImageLoader = new ImageLoader();
    private currentLevel?: GameLevel;
    private moveLeftRequested = false;
    private moveRightRequested = false;
    private launchBallRequested = false;
    private puzzleSpritesheet?: HTMLImageElement = undefined;

    constructor() {
        super(RENDER_WIDTH, RENDER_HEIGHT, 2);
        this.imageLoader.requestLoad("PuzzleSpritesheet", "/img/puzzle-spritesheet.png", (image) => {
            this.puzzleSpritesheet = image;
        });
    }

    override onStart() {
        this.loadLevel();
    }

    loadLevel() {
        this.currentLevel = new GameLevel(
            RENDER_WIDTH, RENDER_HEIGHT, DEFAULT_LEVEL,
            new SpriteDefinition(1, 1, 22, 22, "ballBlue"),
            new SpriteDefinition(1, 265, 104, 24, "paddleBlu"),
        );
    }

    onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case 'a': case 'ArrowLeft':  this.moveLeftRequested = true; break;
            case 'd': case 'ArrowRight': this.moveRightRequested = true; break;
            case ' ': this.launchBallRequested = true; break;
        }
    }

    onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case 'a': case 'ArrowLeft':  this.moveLeftRequested = false; break;
            case 'd': case 'ArrowRight': this.moveRightRequested = false; break;
        }
    }

    onDraw(ctx: OffscreenCanvasRenderingContext2D, interpolation: number) {
        ctx.clearRect(0, 0, this.viewport.renderWidth, this.viewport.renderHeight);

        if (this.imageLoader.errorCount() > 0) {
            ctx.fillText('Failed to load resources. See developer console.', 10, 20);
            return;
        } else if (this.imageLoader.requestsPendingCount() > 0) {
            ctx.fillText('Loading...', 10, 20);
            return;
        }

        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(0, 0, this.viewport.renderWidth, this.viewport.renderHeight);

        if (this.currentLevel) {
            this.drawBlocks(ctx, interpolation, this.currentLevel);
            this.drawPaddles(ctx, interpolation, this.currentLevel);
            this.drawBalls(ctx, interpolation, this.currentLevel);
        }
    }

    private drawBlocks(ctx: OffscreenCanvasRenderingContext2D, _interpolation: number, level: GameLevel) {
        for (const block of level.blocks) {
            if (block.alive) {
                ctx.drawImage(
                    not_null(this.puzzleSpritesheet),
                    block.def.spriteDef.x, block.def.spriteDef.y,
                    block.def.spriteDef.width, block.def.spriteDef.height,
                    block.aabb.left, block.aabb.top,
                    block.aabb.width, block.aabb.height,
                );
            }
        }
    }

    private drawPaddles(ctx: OffscreenCanvasRenderingContext2D, interpolation: number, level: GameLevel) {
        for (const paddle of level.paddles) {
            const paddleX = lerp(paddle.prevX, paddle.x, interpolation);
            const paddleY = lerp(paddle.prevY, paddle.y, interpolation);
            ctx.drawImage(
                not_null(this.puzzleSpritesheet),
                paddle.spriteDef.x, paddle.spriteDef.y,
                paddle.spriteDef.width, paddle.spriteDef.height,
                paddleX - paddle.aabb.halfWidth, paddleY - paddle.aabb.halfHeight,
                paddle.aabb.width, paddle.aabb.height,
            );
        }
    }

    private drawBalls(ctx: OffscreenCanvasRenderingContext2D, interpolation: number, level: GameLevel) {
        for (const ball of level.balls) {
            const ballX = lerp(ball.prevX, ball.x, interpolation);
            const ballY = lerp(ball.prevY, ball.y, interpolation);
            ctx.drawImage(
                not_null(this.puzzleSpritesheet),
                ball.spriteDef.x, ball.spriteDef.y,
                ball.spriteDef.width, ball.spriteDef.height,
                ballX - ball.aabb.halfWidth, ballY - ball.aabb.halfHeight,
                ball.aabb.width, ball.aabb.height,
            );
        }
    }

    onUpdate(_nowTime: number, deltaTime: number) {
        if (this.currentLevel == null) return;
        const level = this.currentLevel;

        for (const paddle of level.paddles) {
            paddle.prevX = paddle.x;
            paddle.prevY = paddle.y;
            this.updatePaddle(level, paddle, deltaTime);
            this.updatePaddleCollision(level, paddle, deltaTime);
        }

        for (const ball of level.balls) {
            ball.prevX = ball.x;
            ball.prevY = ball.y;
            this.updateBallPosition(level, ball, deltaTime);
            this.updateBallCollisions(level, ball, deltaTime);

            if (ball.y >= level.levelHeight) {
                this.loadLevel();
            }
        }
    }

    private updatePaddle(level: GameLevel, paddle: Paddle, deltaTime: number) {
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

    private updatePaddleCollision(level: GameLevel, paddle: Paddle, _deltaTime: number) {
        for (const ball of level.balls) {
            if (ball.stuckToPaddle) continue;
            const collision = resolve_collision(ball.preciseBounds, paddle.aabb);
            if (!collision) continue;

            const distance = ball.x - paddle.x;
            const scaled_distance = distance / paddle.aabb.halfWidth;
            const old_vel_x = ball.velX;
            const old_vel_y = ball.velY;

            ball.velX = BALL_BASE_VELOCITY_X * BALL_BLOCK_COLLISION_VELOCITY_MODIFIER * scaled_distance;
            ball.velY = -1.0 * Math.abs(ball.velY);

            const new_vel_len = vector_length(ball.velX, ball.velY);
            const old_vel_len = vector_length(old_vel_x, old_vel_y);
            ball.velX = ball.velX / new_vel_len * old_vel_len;
            ball.velY = ball.velY / new_vel_len * old_vel_len;
        }
    }

    private updateBallPosition(level: GameLevel, ball: Ball, deltaTime: number) {
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

    private updateBallCollisions(level: GameLevel, ball: Ball, _deltaTime: number) {
        if (ball.stuckToPaddle) return;

        for (const block of level.blocks) {
            if (!block.alive) continue;

            const collision = resolve_collision(ball.preciseBounds, block.aabb);
            if (!collision) continue;

            const c_len = vector_length(collision.x, collision.y);
            const c_dir = vector_direction(collision.x / c_len, collision.y / c_len);

            if (c_dir === Direction.East || c_dir === Direction.West) {
                const penetration = ball.aabb.halfHeight - Math.abs(collision.x);
                ball.x += c_dir === Direction.East ? penetration : -penetration;
                ball.velX *= -1;
            } else {
                const penetration = ball.aabb.halfHeight - Math.abs(collision.y);
                ball.y += c_dir === Direction.North ? penetration : -penetration;
                ball.velY *= -1;
            }

            if (!block.def.solid) {
                block.alive = false;
            }
        }
    }
}
