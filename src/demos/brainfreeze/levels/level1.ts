import { Level } from "../level.ts";
import { Grid } from "../tilemap.ts";

const level: Level = {
    tiles: new Grid<number>(
        // prettier-ignore
        [
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
        ],
        8,
    ),
    player: { x: 1, y: 2 },
    boxes: [
        { x: 3, y: 2 },
        { x: 4, y: 3 },
    ],
    goals: [
        { x: 6, y: 2 },
        { x: 3, y: 5 },
    ],
};

export default level;
