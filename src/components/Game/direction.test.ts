import {Direction, vector_direction} from "./direction.ts";

describe('vector_direction', () => {
    test('should return East for vectors pointing towards the right', () => {
        expect(vector_direction(1, 0)).toBe(Direction.East);
        expect(vector_direction(5, 0)).toBe(Direction.East);
        expect(vector_direction(1, -0.5)).toBe(Direction.East); // Slightly down and right
        expect(vector_direction(1, 0.5)).toBe(Direction.East);  // Slightly up and right
    });

    test('should return North for vectors pointing upwards', () => {
        expect(vector_direction(0, 1)).toBe(Direction.North);
        expect(vector_direction(0, 3)).toBe(Direction.North);
        expect(vector_direction(-0.5, 1)).toBe(Direction.North); // Slightly left and up
        expect(vector_direction(0.5, 1)).toBe(Direction.North);  // Slightly right and up
    });

    test('should return West for vectors pointing towards the left', () => {
        expect(vector_direction(-1, 0)).toBe(Direction.West);
        expect(vector_direction(-2, 0)).toBe(Direction.West);
        expect(vector_direction(-1, 0.5)).toBe(Direction.West);  // Slightly up and left
        expect(vector_direction(-1, -0.5)).toBe(Direction.West); // Slightly down and left
    });

    test('should return South for vectors pointing downwards', () => {
        expect(vector_direction(0, -1)).toBe(Direction.South);
        expect(vector_direction(0, -4)).toBe(Direction.South);
        expect(vector_direction(0.5, -1)).toBe(Direction.South);  // Slightly right and down
        expect(vector_direction(-0.5, -1)).toBe(Direction.South); // Slightly left and down
    });

    test('should return undefined for a zero-length vector', () => {
        expect(vector_direction(0, 0)).toBeUndefined();
    });

    test('should return boundary conditions correctly', () => {
        expect(vector_direction(1, Math.tan(Math.PI / 4 - 0.01))).toBe(Direction.East); // Just before North
        expect(vector_direction(1, Math.tan(Math.PI / 4 + 0.01))).toBe(Direction.North); // Just after East

        expect(vector_direction(-Math.tan(Math.PI / 4 - 0.01), 1)).toBe(Direction.North); // Just before West
        expect(vector_direction(-Math.tan(Math.PI / 4 + 0.01), 1)).toBe(Direction.West); // Just after North

        expect(vector_direction(-1, -Math.tan(Math.PI / 4 - 0.01))).toBe(Direction.West); // Just before South
        expect(vector_direction(-1, -Math.tan(Math.PI / 4 + 0.01))).toBe(Direction.South); // Just after West

        expect(vector_direction(Math.tan(Math.PI / 4 - 0.01), -1)).toBe(Direction.South); // Just before East (going clockwise)
        expect(vector_direction(Math.tan(Math.PI / 4 + 0.01), -1)).toBe(Direction.East); // Just after South
    });
});