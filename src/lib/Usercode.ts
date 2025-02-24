import type { Context, Motor } from './Hardware.svelte';
import {
	AxisType,
	BrakeType,
	DeviceType,
	DirectionType,
	RotationUnits,
	VelocityUnits
} from './Hardware.svelte';
import { clamp } from './Math';

/**
 * Bounds the given heading to the range [0, 360) in degrees.
 * @param num The heading to bound.
 * @returns The bounded heading.
 */
export function boundHeading(num: number): number {
	num = num % 360;
	if (num < 0) num += 360;
	return num;
}

/**
 * Bounds the given angle to the range (-PI, PI] in radian or (-180, 180] in degrees.
 * @param num The angle to bound.
 * @returns The bounded angle.
 */
export function boundAngle(num: number): number {
	while (num > Math.PI) num -= 2 * Math.PI;
	while (num <= -Math.PI) num += 2 * Math.PI;
	return num;
}

/**
 * Converts a vector to a heading angle in degrees.
 * @param x The x-coordinate of the vector.
 * @param y The y-coordinate of the vector.
 * @returns The heading angle in degrees.
 */
export function toHeading(x: number, y: number): number {
	const canvasDegree = 90 - (Math.atan2(y, x) * 180) / Math.PI;
	return boundHeading(canvasDegree);
}

/**
 * Calculates the optimal wheel rotation to reach a target heading using minimal movement.
 * Considers both maintaining current direction and flipping direction to find the shortest path.
 *
 * @param currentPos - Current encoder position in degrees (not bounded to 360)
 * @param currentDirection - Current rotation direction (1 = forward, -1 = reversed)
 * @param targetHeading - Desired heading to face in degrees [0, 360)
 * @returns Object containing new target encoder position and optimal direction
 */
export function shortestTurn(
	currentPos: number,
	currentDirection: 1 | -1,
	targetHeading: number
): { pos: number; direction: 1 | -1 } {
	// Calculate effective heading considering current direction and position
	// (1 - currentDirection) * 90 means add +180 degrees turn when the wheel is reversed
	const currentHeading = boundHeading(currentPos + (1 - currentDirection) * 90);

	// Calculate minimal turn angle in [-180, 180) range using modular arithmetic:
	// 1. Add 180 to shift the modulus window
	// 2. Apply modulo 360 to wrap around the circle
	// 3. Subtract 180 to center on zero
	// This converts heading difference to shortest angular distance with direction
	const deltaDerivative = ((targetHeading - currentHeading + 180) % 360) - 180;

	if (Math.abs(deltaDerivative) > 90) {
		// When turn exceeds 90° absolute, flip direction for shorter path:
		// - Change rotation direction
		// - Adjust position by delta minus 180° in the turn direction
		// Math.sign() ensures we subtract/add 180 based on turn direction
		return {
			pos: currentPos + (deltaDerivative - 180 * Math.sign(deltaDerivative)),
			direction: -currentDirection as 1 | -1
		};
	} else {
		// For turns <= 90° absolute, maintain current direction:
		// Simply add the calculated delta to current position
		return {
			pos: currentPos + deltaDerivative,
			direction: currentDirection
		};
	}
}

/**
 * Converts a number from degrees to radians.
 * @param degree The value in degrees.
 * @returns The value in radians.
 */
export function fromDegreeToRadian(degree: number) {
	return (degree * Math.PI) / 180;
}

/**
 * Converts an angle value from radians to degrees.
 * @param radians The angle value in radians.
 * @returns The angle value in degrees.
 */
export function fromRadiansToDegree(radians: number) {
	return (radians * 180) / Math.PI;
}

/**
 * A swerve module is a motor that can rotate and drive
 *
 * Definition:
 * Y Axis increases by north, X Axis increases by east, heading in degree starting from north (Y+ Axis) and increasing clockwise
 */
class SwerveModule {
	private direction: 1 | -1 = 1;
	private steerTargetPos: number = 0;
	private steerKp: number = 1;
	private steerKi: number = 0.0;
	private steerKd: number = 0.0;
	private steerIntegral: number = 0;
	private steerPrevError: number = 0;

	/**
	 * IMPORTANT:
	 * Before using the module, the user needs to reset the position of the module to 0 degrees manually
	 *
	 * @param steerMotor The motor that rotates the module
	 * @param steerRatio The ratio of the steering motor, how many times the steering motor turns for a full rotation of the module
	 * @param steerReversed The module should rotate clockwise when the motor is spinning forward (with positive velocity), set this to true if the motor is reversed
	 * @param driveMotor The motor that drives the wheel
	 * @param driveReversed The wheel should move forward when the motor is spinning forward (with positive velocity), set this to true if the motor is reversed
	 * @param r The distance from the center of the robot to the wheel
	 * @param theta The angle of the module in degrees when robot is rotating clockwise
	 */
	constructor(
		public readonly steerMotor: Motor,
		public readonly steerRatio: number,
		public readonly steerReversed: boolean,
		public readonly driveMotor: Motor,
		public readonly driveReversed: boolean,
		public readonly r: number,
		public readonly theta: number
	) {
		this.steerMotor.setBrake(BrakeType.brake);
		this.steerMotor.setReversed(this.steerReversed);
		this.driveMotor.setBrake(BrakeType.brake);
		this.driveMotor.setReversed(this.driveReversed);
	}

	/**
	 *
	 * @param x x-axis input of the robot [-1, 1]
	 * @param y y-axis input of the robot [-1, 1]
	 * @param rot rotation input of the robot [-1, 1]
	 * @param alpha heading of the robot in degrees
	 */
	operate(x: number, y: number, rot: number, alpha: number) {
		const steerEnc = this.steerMotor.position(RotationUnits.deg);
		const steerPos = steerEnc / this.steerRatio;

		const vecX = x + rot * this.r * Math.sin(fromDegreeToRadian(this.theta + alpha));
		const vecY = y + rot * this.r * Math.cos(fromDegreeToRadian(this.theta + alpha));

		if (vecX !== 0 || vecY !== 0) {
			const targetHeading = toHeading(vecX, vecY);
			const { pos, direction } = shortestTurn(steerPos, this.direction, targetHeading);
			this.steerTargetPos = pos;
			this.direction = direction;
		}
		// If the joystick is centered, don't update the steering target position

		const steerTargetEnc = this.steerTargetPos * this.steerRatio;
		const steerError = steerTargetEnc - steerEnc;
		this.steerIntegral += steerError;
		const steerDerivative = steerError - this.steerPrevError;
		this.steerPrevError = steerError;
		const steerOutput =
			this.steerKp * steerError +
			this.steerKi * this.steerIntegral +
			this.steerKd * steerDerivative;
		this.steerMotor.setVelocity(steerOutput, VelocityUnits.rpm);
		this.steerMotor.spin(DirectionType.fwd);

		const magnitude = clamp(Math.sqrt(x * x + y * y + rot * rot), 0, 1) * this.direction;
		this.driveMotor.setVelocity(magnitude * 140, VelocityUnits.rpm);
		this.driveMotor.spin(DirectionType.fwd);
	}
}

export async function main(context: Context) {
	const controller = context.getController();

	const leftFrontDriveMotor = context.getDevice(6, DeviceType.Motor);
	const leftFrontSteerMotor = context.getDevice(3, DeviceType.Motor);
	const rightFrontDriveMotor = context.getDevice(12, DeviceType.Motor);
	const rightFrontSteerMotor = context.getDevice(9, DeviceType.Motor);
	const leftBackDriveMotor = context.getDevice(2, DeviceType.Motor);
	const leftBackSteerMotor = context.getDevice(1, DeviceType.Motor);
	const rightBackDriveMotor = context.getDevice(8, DeviceType.Motor);
	const rightBackSteerMotor = context.getDevice(7, DeviceType.Motor);

	const leftFrontSwerveModule = new SwerveModule(
		leftFrontSteerMotor,
		5,
		true,
		leftFrontDriveMotor,
		false,
		1,
		45
	);
	const rightFrontSwerveModule = new SwerveModule(
		rightFrontSteerMotor,
		5,
		true,
		rightFrontDriveMotor,
		false,
		1,
		135
	);
	const leftBackSwerveModule = new SwerveModule(
		leftBackSteerMotor,
		5,
		true,
		leftBackDriveMotor,
		false,
		1,
		-45
	);
	const rightBackSwerveModule = new SwerveModule(
		rightBackSteerMotor,
		5,
		true,
		rightBackDriveMotor,
		false,
		1,
		-135
	);

	setInterval(() => {
		const x1 = controller.getValue(AxisType.AxisB) / 100;
		const y1 = controller.getValue(AxisType.AxisA) / 100;
		const x2 = controller.getValue(AxisType.AxisC) / 100;

		leftFrontSwerveModule.operate(x1, y1, x2, 0);
		rightFrontSwerveModule.operate(x1, y1, x2, 0);
		leftBackSwerveModule.operate(x1, y1, x2, 0);
		rightBackSwerveModule.operate(x1, y1, x2, 0);
	}, 10);
}
