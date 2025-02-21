import { describe, it, expect, test } from 'vitest';
import { toDerivativeHeading, fromHeadingInDegreeToAngleInRadian, fromDegreeToRadian, fromAngleInRadianToHeadingInDegree, boundHeading, boundAngle, shortestTurn } from './Usercode';

test("shortestTurn", () => {
  expect(shortestTurn(0, 1, 0)).toEqual({pos: 0, direction: 1});
  expect(shortestTurn(0, 1, 45)).toEqual({pos: 45, direction: 1});
  expect(shortestTurn(0, 1, 90)).toEqual({pos: 90, direction: 1});
  expect(shortestTurn(0, 1, 91)).toEqual({pos: -89, direction: -1});
  expect(shortestTurn(0, 1, 135)).toEqual({pos: -45, direction: -1});
  expect(shortestTurn(0, 1, 179)).toEqual({pos: -1, direction: -1});
  expect(shortestTurn(0, 1, 180)).toEqual({pos: 0, direction: -1});
  expect(shortestTurn(0, 1, 181)).toEqual({pos: 1, direction: -1});
  expect(shortestTurn(0, 1, 225)).toEqual({pos: 45, direction: -1});
  expect(shortestTurn(0, 1, 269)).toEqual({pos: 89, direction: -1});
  expect(shortestTurn(0, 1, 270)).toEqual({pos: -90, direction: 1});
  expect(shortestTurn(0, 1, 271)).toEqual({pos: -89, direction: 1});
  expect(shortestTurn(0, 1, 315)).toEqual({pos: -45, direction: 1});
  expect(shortestTurn(0, 1, 359)).toEqual({pos: -1, direction: 1});
  expect(shortestTurn(0, 1, 360)).toEqual({pos: 0, direction: 1});

	// 45 deg
	expect(shortestTurn(45, 1, 45)).toEqual({pos: 45 + 0, direction: 1});
	expect(shortestTurn(45, 1, 90)).toEqual({pos: 45 + 45, direction: 1});
	expect(shortestTurn(45, 1, 135)).toEqual({pos: 45 + 90, direction: 1});
	expect(shortestTurn(45, 1, 136)).toEqual({pos: 45 + -89, direction: -1});
	expect(shortestTurn(45, 1, 0)).toEqual({pos: 45 + -45, direction: 1});
	expect(shortestTurn(45, 1, 315)).toEqual({pos: 45 + -90, direction: 1});
	expect(shortestTurn(45, 1, 314)).toEqual({pos: 45 + 89, direction: -1});
});

test("toDerivativeHeading", () => {
  expect(toDerivativeHeading(0, 270)).toBe(-90);
  expect(toDerivativeHeading(270, 0)).toBe(90);
  expect(toDerivativeHeading(0, 90)).toBe(90);
  expect(toDerivativeHeading(90, 0)).toBe(-90);
  expect(toDerivativeHeading(0, 180)).toBe(-180);
  expect(toDerivativeHeading(180, 0)).toBe(-180);
});

test("fromHeadingInDegreeToAngleInRadian", () => {
  expect(fromHeadingInDegreeToAngleInRadian(0)).toBeCloseTo(fromDegreeToRadian(90));
  expect(fromHeadingInDegreeToAngleInRadian(90)).toBeCloseTo(fromDegreeToRadian(0));
  expect(fromHeadingInDegreeToAngleInRadian(180)).toBeCloseTo(fromDegreeToRadian(-90));
  expect(fromHeadingInDegreeToAngleInRadian(269.9)).toBeCloseTo(fromDegreeToRadian(-179.9));
  expect(fromHeadingInDegreeToAngleInRadian(270)).toBeCloseTo(fromDegreeToRadian(180));
  expect(fromHeadingInDegreeToAngleInRadian(271)).toBeCloseTo(fromDegreeToRadian(179));
  expect(fromHeadingInDegreeToAngleInRadian(359)).toBeCloseTo(fromDegreeToRadian(91));
  expect(fromHeadingInDegreeToAngleInRadian(91)).toBeCloseTo(fromDegreeToRadian(-1));
});

test("fromAngleInRadianToHeadingInDegree", () => {
  expect(fromAngleInRadianToHeadingInDegree(fromDegreeToRadian(90))).toBeCloseTo(0);
  expect(fromAngleInRadianToHeadingInDegree(fromDegreeToRadian(0))).toBeCloseTo(90);
  expect(fromAngleInRadianToHeadingInDegree(fromDegreeToRadian(-90))).toBeCloseTo(180);
  expect(fromAngleInRadianToHeadingInDegree(fromDegreeToRadian(-179.9))).toBeCloseTo(269.9);
  expect(fromAngleInRadianToHeadingInDegree(fromDegreeToRadian(180))).toBeCloseTo(270);
  expect(fromAngleInRadianToHeadingInDegree(fromDegreeToRadian(179))).toBeCloseTo(271);
  expect(fromAngleInRadianToHeadingInDegree(fromDegreeToRadian(91))).toBeCloseTo(359);
  expect(fromAngleInRadianToHeadingInDegree(fromDegreeToRadian(-1))).toBeCloseTo(91);
});

test("fromHeadingInDegreeToAngleInRadian <-> fromAngleInRadianToHeadingInDegree", () => {
  for (let i = -720; i < 1080; i += 0.1) {
    expect(fromAngleInRadianToHeadingInDegree(fromHeadingInDegreeToAngleInRadian(i))).toBeCloseTo(boundHeading(i));
  }
  for (let i = -Math.PI * 4; i < Math.PI * 6; i += 0.1) {
    expect(fromHeadingInDegreeToAngleInRadian(fromAngleInRadianToHeadingInDegree(i))).toBeCloseTo(boundAngle(i));
  }
});
