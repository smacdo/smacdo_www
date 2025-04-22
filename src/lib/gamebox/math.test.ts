import {
    degree_to_rad,
    rad_to_degree,
    vector_angle,
    vector_distance,
    vector_distance_squared,
    vector_length
} from "./math.ts";

const PI = Math.PI;
const HALF_PI = Math.PI / 2;

describe('vector_distance', () => {
    it('should return the correct distance for a simple horizontal displacement', () => {
        expect(vector_distance(0, 0, 5, 0)).toBe(5);
    });

    it('should return the correct distance for a simple vertical displacement', () => {
        expect(vector_distance(0, 0, 0, 3)).toBe(3);
    });

    it('should return the correct distance for a diagonal distance', () => {
        // Pythagorean theorem: sqrt(3^2 + 4^2) = 5
        expect(vector_distance(1, 2, 4, 6)).toBe(5);
    });

    it('should be zero when the two vectors are the same value', () => {
        expect(vector_distance(2, 2, 2, 2)).toBe(0);
    });

    it('should return correct distance when there are negative coordinates', () => {
        expect(vector_distance(-1, -1, 2, 3)).toBe(5);
    });
});

describe('vector_distance_squared', () => {
    it('should return the correct distance for a simple horizontal displacement', () => {
        expect(vector_distance_squared(0, 0, 5, 0)).toBe(25);
    });

    it('should return the correct distance for a simple vertical displacement', () => {
        expect(vector_distance_squared(0, 0, 0, 3)).toBe(9);
    });

    it('should return the correct distance for a diagonal distance', () => {
        // Pythagorean theorem: (3^2 + 4^2) = 25
        expect(vector_distance_squared(1, 2, 4, 6)).toBe(25);
    });

    it('should be zero when the two vectors are the same value', () => {
        expect(vector_distance_squared(2, 2, 2, 2)).toBe(0);
    });

    it('should return correct distance when there are negative coordinates', () => {
        expect(vector_distance_squared(-1, -1, 2, 3)).toBe(25);
    });
});

describe('vector_length', () => {
    it('should return the correct length for a positive vector', () => {
        expect(vector_length(3, 4)).toBe(5);
    });

    it('should return the correct length for a vector with one zero component', () => {
        expect(vector_length(5, 0)).toBe(5);
        expect(vector_length(0, -12)).toBe(12);
    });

    it('should return zero for a zero vector', () => {
        expect(vector_length(0, 0)).toBe(0);
    });

    it('should return the correct length for a vector with negative components', () => {
        expect(vector_length(-3, -4)).toBe(5);
        expect(vector_length(-5, 12)).toBe(13);
    });

    it('should handle floating point numbers correctly', () => {
        expect(vector_length(1.5, 2.0)).toBeCloseTo(2.5);
    });
});

describe('vector_angle', () => {
    it('should return the correct angle for vectors along the positive axes', () => {
        expect(vector_angle(1, 0)).toBe(0); // Positive x-axis
        expect(vector_angle(0, 1)).toBe(HALF_PI); // Positive y-axis
    });

    it('should return the correct angle for vectors along the negative axes', () => {
        expect(vector_angle(-1, 0)).toBe(PI); // Negative x-axis
        expect(vector_angle(0, -1)).toBe(3 * PI / 2); // Negative y-axis
    });

    it('should return the correct angle for vectors in each quadrant', () => {
        expect(vector_angle(1, 1)).toBe(PI / 4); // Quadrant I (45 degrees)
        expect(vector_angle(-1, 1)).toBeCloseTo(3 * PI / 4); // Quadrant II (135 degrees)
        expect(vector_angle(-1, -1)).toBeCloseTo(5 * PI / 4); // Quadrant III (225 degrees)
        expect(vector_angle(1, -1)).toBeCloseTo(7 * PI / 4); // Quadrant IV (315 degrees)
    });

    it('should return zero angle for the zero vector', () => {
        expect(vector_angle(0, 0)).toBeNull();
    });

    it('should handle floating point numbers correctly', () => {
        expect(vector_angle(1.5, 1.5)).toBeCloseTo(PI / 4);
        expect(vector_angle(-2.0, 3.0)).toBeCloseTo(Math.atan2(3, -2));
    });
});

describe('rad_to_degree', () => {
    it('should convert basic radian values to degrees correctly', () => {
        expect(rad_to_degree(0)).toBe(0);
        expect(rad_to_degree(PI / 2)).toBe(90);
        expect(rad_to_degree(PI)).toBe(180);
        expect(rad_to_degree(3 * PI / 2)).toBe(270);
        expect(rad_to_degree(2 * PI)).toBe(360);
    });

    it('should handle negative radian values correctly', () => {
        expect(rad_to_degree(-PI / 2)).toBe(-90);
        expect(rad_to_degree(-PI)).toBe(-180);
        expect(rad_to_degree(-2 * PI)).toBe(-360);
    });

    it('should handle floating point radian values correctly', () => {
        expect(rad_to_degree(PI / 4)).toBe(45);
        expect(rad_to_degree(3 * PI / 4)).toBeCloseTo(135);
        expect(rad_to_degree(PI / 8)).toBeCloseTo(22.5);
    });
});

describe('degree_to_rad', () => {
    it('should convert basic degree values to radians correctly', () => {
        expect(degree_to_rad(0)).toBe(0);
        expect(degree_to_rad(90)).toBe(PI / 2);
        expect(degree_to_rad(180)).toBe(PI);
        expect(degree_to_rad(270)).toBe(3 * PI / 2);
        expect(degree_to_rad(360)).toBe(2 * PI);
    });

    it('should handle negative degree values correctly', () => {
        expect(degree_to_rad(-90)).toBe(-PI / 2);
        expect(degree_to_rad(-180)).toBe(-PI);
        expect(degree_to_rad(-360)).toBe(-2 * PI);
    });

    it('should handle floating point degree values correctly', () => {
        expect(degree_to_rad(45)).toBe(PI / 4);
        expect(degree_to_rad(135)).toBeCloseTo(3 * PI / 4);
        expect(degree_to_rad(22.5)).toBeCloseTo(PI / 8);
    });

    it('rad_to_degree and degree_to_rad should be inverses of each other', () => {
        const degreeValues = [0, 30, 45, 60, 90, 120, 135, 180, 270, 360, -45, -90, 72.34, -150.7];
        degreeValues.forEach((degree) => {
            const radians = degree_to_rad(degree);
            const backToDegrees = rad_to_degree(radians);
            expect(backToDegrees).toBeCloseTo(degree);
        });

        const radianValues = [0, PI / 6, PI / 4, PI / 3, PI / 2, 2 * PI / 3, 3 * PI / 4, PI, 3 * PI / 2, 2 * PI, -PI / 4, -PI / 2, 1.23, -3.45];
        radianValues.forEach((radians) => {
            const degrees = rad_to_degree(radians);
            const backToRadians = degree_to_rad(degrees);
            expect(backToRadians).toBeCloseTo(radians);
        });
    });
});