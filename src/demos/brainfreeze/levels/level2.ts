import { Level } from "../level.ts";
import { Grid } from "../grid.ts";

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
    player: { kind: "player", x: 1, y: 3 },
    boxes: [
        { kind: "box", x: 3, y: 2 },
        { kind: "box", x: 3, y: 4 },
    ],
    goals: [
        { kind: "goal", x: 6, y: 2 },
        { kind: "goal", x: 6, y: 4 },
    ],
};

export default level;
