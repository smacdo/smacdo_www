export interface Box {
    x: number;
    y: number;
}

export interface Goal {
    x: number;
    y: number;
}

export interface Player {
    x: number;
    y: number;
}

export interface Level {
    tiles: number[]; // TODO: convert this to a Tilemap or Grid interface.
    colsPerRow: number; // TODO: move this field to the upcoming Tilemap/Grid.
    player: Player;
    boxes: Box[];
    goals: Goal[];
}
