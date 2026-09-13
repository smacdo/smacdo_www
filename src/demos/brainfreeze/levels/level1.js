/** @type {import("../level.js").Level} */
const level = {
    // prettier-ignore
    tiles: [
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
  ],
    colsPerRow: 8,
    player: [1, 2],
    boxes: [
        [3, 2],
        [4, 3],
    ],
    goals: [
        [6, 2],
        [3, 5],
    ],
};

export default level;
