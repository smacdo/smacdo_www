import { Grid } from "./tilemap.ts";

export interface Position {
    x: number;
    y: number;
}

export class Box implements Position {
    constructor(
        public x: number,
        public y: number,
    ) {}
}

export class Goal implements Position {
    constructor(
        public x: number,
        public y: number,
    ) {}
}

export class Player implements Position {
    constructor(
        public x: number,
        public y: number,
    ) {}
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
