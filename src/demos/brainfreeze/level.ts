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
    tiles: number[]; // TODO: convert this to a Tilemap or Grid interface.
    colsPerRow: number; // TODO: move this field to the upcoming Tilemap/Grid.
    player: Player;
    boxes: Box[];
    goals: Goal[];
}
