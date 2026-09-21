import { Grid } from "./grid.ts";

/// An object that can be located on a grid with integer coordinates.
export interface Position {
    x: number;
    y: number;
}

export interface Box extends Position {
    readonly kind: "box";
}

export interface Goal extends Position {
    readonly kind: "goal";
}

export interface Player extends Position {
    readonly kind: "player";
}

export interface Level {
    tiles: Grid<number>; // TODO: convert T to be a Tile enum type.
    player: Player;
    boxes: Box[];
    goals: Goal[];
}

export function cloneLevel(level: Level): Level {
    return {
        tiles: level.tiles.clone(),
        player: structuredClone(level.player),
        boxes: structuredClone(level.boxes),
        goals: structuredClone(level.goals),
    };
}
