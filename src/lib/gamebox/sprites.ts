/**
 * Defines a sprite found in an image atlas.
 */
export class SpriteDefinition {
    /** The left most x pixel containing the sprite in the atlas. */
    readonly x: number;
    /** The top most y pixel containing the sprite in the atlas. */
    readonly y: number;
    /** The width of the sprite in pixels. */
    readonly width: number;
    /** The height of the sprite in pixels. */
    readonly height: number;
    /** An optional name for the sprite. */
    readonly name?: string;

    constructor(x: number, y: number, width: number, height: number, name?: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
    }
}