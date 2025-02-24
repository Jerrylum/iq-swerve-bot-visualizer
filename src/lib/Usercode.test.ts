import { expect, test } from 'vitest';
import { shortestTurn, boundHeading, boundAngle, fromDegreeToRadian, fromRadiansToDegree } from './Usercode';

test('shortestTurn', () => {
	expect(shortestTurn(0, 1, 0)).toEqual({ pos: 0, direction: 1 });
	expect(shortestTurn(0, 1, 45)).toEqual({ pos: 45, direction: 1 });
	expect(shortestTurn(0, 1, 90)).toEqual({ pos: 90, direction: 1 });
	expect(shortestTurn(0, 1, 91)).toEqual({ pos: -89, direction: -1 });
	expect(shortestTurn(0, 1, 135)).toEqual({ pos: -45, direction: -1 });
	expect(shortestTurn(0, 1, 179)).toEqual({ pos: -1, direction: -1 });
	expect(shortestTurn(0, 1, 180)).toEqual({ pos: 0, direction: -1 });
	expect(shortestTurn(0, 1, 181)).toEqual({ pos: 1, direction: -1 });
	expect(shortestTurn(0, 1, 225)).toEqual({ pos: 45, direction: -1 });
	expect(shortestTurn(0, 1, 269)).toEqual({ pos: 89, direction: -1 });
	expect(shortestTurn(0, 1, 270)).toEqual({ pos: -90, direction: 1 });
	expect(shortestTurn(0, 1, 271)).toEqual({ pos: -89, direction: 1 });
	expect(shortestTurn(0, 1, 315)).toEqual({ pos: -45, direction: 1 });
	expect(shortestTurn(0, 1, 359)).toEqual({ pos: -1, direction: 1 });
	expect(shortestTurn(0, 1, 360)).toEqual({ pos: 0, direction: 1 });

	// 45 deg
	expect(shortestTurn(45, 1, 45)).toEqual({ pos: 45 + 0, direction: 1 });
	expect(shortestTurn(45, 1, 90)).toEqual({ pos: 45 + 45, direction: 1 });
	expect(shortestTurn(45, 1, 135)).toEqual({ pos: 45 + 90, direction: 1 });
	expect(shortestTurn(45, 1, 136)).toEqual({ pos: 45 + -89, direction: -1 });
	expect(shortestTurn(45, 1, 0)).toEqual({ pos: 45 + -45, direction: 1 });
	expect(shortestTurn(45, 1, 315)).toEqual({ pos: 45 + -90, direction: 1 });
	expect(shortestTurn(45, 1, 314)).toEqual({ pos: 45 + 89, direction: -1 });
});

test('boundHeading', () => {
	// Test wrapping at 360 degrees
	expect(boundHeading(0)).toBe(0);
	expect(boundHeading(360)).toBe(0);
	expect(boundHeading(450)).toBe(90);
	expect(boundHeading(-90)).toBe(270);
	expect(boundHeading(720)).toBe(0);
	
	// Test edge cases
	expect(boundHeading(180)).toBe(180);
	expect(boundHeading(270)).toBe(270);
	expect(boundHeading(359)).toBe(359);
	expect(boundHeading(361)).toBe(1);
});

test('boundAngle', () => {
	// Test wrapping at PI radians
	expect(boundAngle(0)).toBe(0);
	expect(boundAngle(Math.PI)).toBe(Math.PI);
	expect(boundAngle(3 * Math.PI)).toBe(Math.PI);
	expect(boundAngle(-Math.PI)).toBe(Math.PI); // Special case due to <= -PI check
	expect(boundAngle(-3 * Math.PI)).toBe(Math.PI);
	
	// Test fractional values
	expect(boundAngle(Math.PI / 2)).toBe(Math.PI / 2);
	expect(boundAngle(-Math.PI / 2)).toBe(-Math.PI / 2);
	expect(boundAngle(3 * Math.PI / 2)).toBe(-Math.PI / 2);
	expect(boundAngle(-3 * Math.PI / 2)).toBe(Math.PI / 2);
});

test('degree/radian conversions', () => {
	// Degree to radian
	expect(fromDegreeToRadian(0)).toBe(0);
	expect(fromDegreeToRadian(180)).toBe(Math.PI);
	expect(fromDegreeToRadian(90)).toBeCloseTo(Math.PI / 2);
	expect(fromDegreeToRadian(270)).toBeCloseTo(3 * Math.PI / 2);
	expect(fromDegreeToRadian(360)).toBeCloseTo(2 * Math.PI);

	// Radian to degree
	expect(fromRadiansToDegree(0)).toBe(0);
	expect(fromRadiansToDegree(Math.PI)).toBe(180);
	expect(fromRadiansToDegree(Math.PI / 2)).toBeCloseTo(90);
	expect(fromRadiansToDegree(3 * Math.PI / 2)).toBeCloseTo(270);
	expect(fromRadiansToDegree(2 * Math.PI)).toBeCloseTo(360);
});
