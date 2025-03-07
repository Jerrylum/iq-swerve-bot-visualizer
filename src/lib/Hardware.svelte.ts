import { clamp } from '$lib';

/**
 * Measurement units for velocity values
 */
export enum VelocityUnits {
	/** Velocity as percentage of maximum (120RPM) */
	pct = 'pct',
	/** Rotations per minute */
	rpm = 'rpm',
	/** Degrees per second */
	dps = 'dps'
}

/**
 * Measurement units for percentage values
 */
export enum PercentUnits {
	/** Percentage unit (0-100%) */
	pct = 'pct'
}

/**
 * Braking modes for motor stopping
 */
export enum BrakeType {
	/** Motor coasts to stop */
	coast = 'coast',
	/** Motor stops immediately with braking */
	brake = 'brake',
	/** Motor holds position actively */
	hold = 'hold'
}

/**
 * Motor rotation directions
 */
export enum DirectionType {
	/** Forward direction */
	fwd = 'fwd',
	/** Reverse direction */
	rev = 'rev'
}

/**
 * Measurement units for rotation values
 */
export enum RotationUnits {
	/** Rotation in degrees */
	deg = 'deg',
	/** Rotation in full revolutions */
	rev = 'rev'
}

/**
 * Measurement units for time values
 */
export enum TimeUnits {
	/** Time in seconds */
	sec = 'sec',
	/** Time in milliseconds */
	msec = 'msec'
}

/**
 * Measurement units for electrical current
 */
export enum CurrentUnits {
	/** Current in amperes */
	amp = 'amp'
}

/**
 * Measurement units for voltage
 */
export enum VoltageUnits {
	/** Voltage in volts */
	volt = 'volt',
	/** Voltage in millivolts */
	mV = 'mV'
}

/**
 * Measurement units for power
 */
export enum PowerUnits {
	/** Power in watts */
	watt = 'watt'
}

/**
 * Measurement units for torque
 */
export enum TorqueUnits {
	/** Torque in Newton Meters */
	Nm = 'Nm',
	/** Torque in Inch Pounds */
	InLb = 'InLb'
}

export enum DeviceType {
	Motor = 'Motor'
}

export type SupportedDevices = {
	[DeviceType.Motor]: Motor;
};

export type SupportedDevice = SupportedDevices[keyof SupportedDevices];

export type SupportedDeviceImpl = SupportedDevice & DeviceImpl;

export interface Device {
	readonly type: DeviceType;
	readonly port: number;
}

export interface Motor extends Device {
	readonly type: DeviceType.Motor;

	/**
	 * Sets the motor mode to "reverse"
	 * @param value If true, commands spin in opposite direction
	 */
	setReversed(value: boolean): void;

	/**
	 * Sets velocity for subsequent commands
	 * @param velocity The target velocity
	 * @param units Measurement units for velocity
	 */
	setVelocity(velocity: number, units: VelocityUnits): void;
	setVelocity(velocity: number, units: PercentUnits): void;

	/**
	 * Sets legacy braking mode
	 * @param mode Brake mode (coast, brake, hold)
	 */
	setBrake(mode: BrakeType): void;

	/**
	 * Sets stopping mode
	 * @param mode Brake mode (coast, brake, hold)
	 */
	setStopping(mode: BrakeType): void;

	/** Resets rotation sensor to zero */
	resetPosition(): void;

	/**
	 * Sets rotation sensor value
	 * @param value New position value
	 * @param units Rotation units for position
	 */
	setPosition(value: number, units: RotationUnits): void;

	/**
	 * Sets movement timeout
	 * @param time Timeout duration
	 * @param units Time units
	 */
	setTimeout(time: number, units: TimeUnits): void;

	/**
	 * Spins motor in specified direction
	 * @param dir Movement direction
	 */
	spin(dir: DirectionType): void;

	/**
	 * Spins to absolute position
	 * @param rotation Target position
	 * @param units Rotation units
	 * @param waitForCompletion Whether to block until complete
	 */
	spinTo(rotation: number, units: RotationUnits, waitForCompletion?: boolean): Promise<boolean>;

	/**
	 * Spins for relative rotation
	 * @param rotation Amount to rotate
	 * @param units Rotation units
	 * @param waitForCompletion Whether to block until complete
	 */
	spinFor(rotation: number, units: RotationUnits, waitForCompletion?: boolean): Promise<boolean>;

	/** Checks if motor is actively spinning */
	isSpinning(): boolean;

	/** Checks if movement is complete */
	isDone(): boolean;

	/** Checks if in velocity control mode */
	isSpinningMode(): boolean;

	/** Stops motor using current brake mode */
	stop(): void;

	/**
	 * Stops motor with specified brake mode
	 * @param mode Brake mode (coast, brake, hold)
	 */
	stop(mode: BrakeType): void;

	/**
	 * Sets maximum torque
	 * @param value Torque limit value
	 * @param units Measurement units
	 */
	setMaxTorque(value: number, units: PercentUnits): void;
	setMaxTorque(value: number, units: TorqueUnits): void;
	setMaxTorque(value: number, units: CurrentUnits): void;

	/** Gets current movement direction */
	direction(): DirectionType;

	/**
	 * Gets current position
	 * @param units Rotation units for return value
	 */
	position(units: RotationUnits): number;

	/**
	 * Gets current velocity
	 * @param units Velocity units for return value
	 */
	velocity(units: VelocityUnits | PercentUnits): number;
	velocity(units: PercentUnits): number;

	/**
	 * Gets electrical current
	 * @param units Current units
	 */
	current(units: CurrentUnits): number;
	current(units: PercentUnits): number;

	/**
	 * Gets electrical voltage
	 * @param units Voltage units
	 */
	voltage(units: VoltageUnits): number;

	/**
	 * Gets power consumption
	 * @param units Power units
	 */
	power(units: PowerUnits): number;

	/**
	 * Gets output torque
	 * @param units Torque units
	 */
	torque(units: TorqueUnits): number;

	/**
	 * Gets efficiency
	 * @param units Efficiency units
	 */
	efficiency(units: PercentUnits): number;
}

export enum AxisType {
	/** The left joystick's Y axis */
	AxisA = 'AxisA',
	/** The left joystick's X axis */
	AxisB = 'AxisB',
	/** The right joystick's X axis */
	AxisC = 'AxisC',
	/** The right joystick's Y axis */
	AxisD = 'AxisD'
}

export interface Controller {
	/**
	 * Gets the value of an axis
	 * @param axis The axis to get the value of
	 * @see AxisType
	 * @returns The value of the axis
	 */
	getValue(axis: AxisType): number;
}

export interface Context {
	/**
	 * Gets a device from the context
	 * @param port The port number of the device
	 * @param type The type of device to get
	 */
	getDevice<T extends DeviceType>(port: number, type: T): SupportedDevices[T];

	/**
	 * @returns The controller instance
	 */
	getController(): Controller;
}

export interface DeviceImpl extends Device {
	/**
	 * @description Updates the device's state
	 */
	loop(): void;
}

export class MotorImpl implements Motor, DeviceImpl {
	readonly type = DeviceType.Motor;

	private readonly maxVoltage: number = 7.2; // Max allowed voltage
	private readonly maxCommandRPM = 120; // 120 RPM
	private readonly maxPhysicalRPM = 140; // 140 RPM
	private readonly resistance = 2.4; // Calculated from stall current: R = V/I = 7.2V/3A = 2.4Ω
	private readonly backEMFConstant: number = 0.02; // V·s/rad

	private reverse: boolean = $state(false);
	private zeroPosition: number = $state(0); // in degrees
	private realWorldPosition: number = $state(0); // in degrees
	private appliedVoltage: number = $state(0); // in volts
	private momentOfInertia: number = $state(0); // kg·m²

	// Internal measurement properties
	private calculatedVelocity: number = 0; // in rpm (actual)
	private voltageLimit: number = this.maxVoltage;
	private measuring: number[] = [0, 0]; // last n measurements
	private measuredVelocity: number = $state(0); // in rpm (measured)
	private lastMeasuredPosition: number = 0; // in degrees
	private lastUpdateTime: number = Date.now();

	// Time properties
	private timeout = 0;
	private movementStartTime = 0;

	// If true, the motor is in position control mode, otherwise it is in velocity control mode
	private isPositionControl = $state(false);

	// Velocity control properties
	private targetVelocity: number = $state(0); // in rpm (desired)
	private readonly vel_kP: number = 0.8;
	private readonly vel_kI: number = 0.0;
	private readonly vel_kD: number = 0.001;
	private velIntegral: number = 0;
	private velPrevError: number = 0;

	// Position control properties
	private targetPosition: number | null = null;
	private positionTolerance = 0.375; // degrees
	private readonly pos_kP: number = 1;
	private readonly pos_kI: number = 0.0;
	private readonly pos_kD: number = 0.03;
	private posIntegral: number = 0;
	private posPrevError: number = 0;

	// Brake simulation
	private brakeMode: BrakeType = BrakeType.coast;
	private holdPosition: number | null = null;

	constructor(
		public readonly port: number,
		momentOfInertia: number // kg·m²
	) {
		this.momentOfInertia = momentOfInertia;
	}

	/** @inheritdoc */
	setReversed(value: boolean): void {
		this.reverse = value;
	}

	/** @inheritdoc */
	setVelocity(velocity: number, units: VelocityUnits | PercentUnits): void {
		if (units === VelocityUnits.pct) {
			this.targetVelocity = (velocity / 100) * this.maxCommandRPM;
		} else if (units === VelocityUnits.rpm) {
			this.targetVelocity = velocity;
		} else if (units === VelocityUnits.dps) {
			this.targetVelocity = velocity / 6;
		}
	}

	/** @inheritdoc */
	setBrake(mode: BrakeType): void {
		this.brakeMode = mode;
	}

	/** @inheritdoc */
	setStopping(mode: BrakeType): void {
		this.brakeMode = mode;
	}

	/** @inheritdoc */
	resetPosition(): void {
		this.zeroPosition = this.realWorldPosition;
	}

	/** @inheritdoc */
	setPosition(value: number, units: RotationUnits): void {
		const currentRealPosition = this.realWorldPosition;
		const desiredPosition = this.convertRotation(value, units);

		// Calculate new zero offset based on reverse flag
		this.zeroPosition = currentRealPosition - desiredPosition * (this.reverse ? -1 : 1);
	}

	/** @inheritdoc */
	setTimeout(time: number, units: TimeUnits): void {
		this.timeout = units === TimeUnits.sec ? time * 1000 : time;
	}

	/** @inheritdoc */
	spin(dir: DirectionType): void {
		const directionMultiplier =
			(dir === DirectionType.fwd ? 1 : -1) * this.targetVelocity > 0 ? 1 : -1;
		this.targetVelocity = Math.abs(this.targetVelocity) * directionMultiplier;
		this.isPositionControl = false;
	}

	/** @inheritdoc */
	async spinTo(rotation: number, units: RotationUnits, waitForCompletion = true): Promise<boolean> {
		const target = this.convertRotation(rotation, units);
		this.targetPosition = target;
		this.isPositionControl = true;
		this.movementStartTime = Date.now();

		if (waitForCompletion) {
			while (!this.isDone()) {
				await new Promise((resolve) => setTimeout(resolve, 10)); // ~100Hz update
			}
		}
		return true;
	}

	/** @inheritdoc */
	async spinFor(
		rotation: number,
		units: RotationUnits,
		waitForCompletion = true
	): Promise<boolean> {
		const current = this.getPosition();
		return this.spinTo(
			current + this.convertRotation(rotation, units),
			RotationUnits.deg,
			waitForCompletion
		);
	}

	/** @inheritdoc */
	isSpinning(): boolean {
		return Math.abs(this.measuredVelocity) > 0.1 || (this.isPositionControl && !this.isDone());
	}

	/** @inheritdoc */
	isDone(): boolean {
		// IMPORTANT; Understand VEX IQ motor behavior before changing this
		if (!this.isPositionControl) return !this.isSpinning();

		if (this.targetPosition === null) return true;

		const error = Math.abs(this.targetPosition - this.getPosition());
		return error < this.positionTolerance;
	}

	/** @inheritdoc */
	isSpinningMode(): boolean {
		return !this.isPositionControl;
	}

	/** @inheritdoc */
	stop(mode?: BrakeType): void {
		const brakeMode = mode ?? this.brakeMode;
		this.brakeMode = brakeMode;

		if (brakeMode === BrakeType.hold) {
			this.holdPosition = this.getPosition();
			this.isPositionControl = true;
			this.targetPosition = this.holdPosition;
			this.targetVelocity = 0;
		} else {
			this.isPositionControl = false;
			this.targetPosition = null;
			this.targetVelocity = 0;
		}
	}

	/** @inheritdoc */
	setMaxTorque(value: number, units: PercentUnits | TorqueUnits | CurrentUnits): void {
		if (units === PercentUnits.pct) {
			this.voltageLimit = (value / 100) * this.maxVoltage;
		}
		// Torque/current units would require motor constant knowledge
	}

	/** @inheritdoc */
	direction(): DirectionType {
		return this.measuredVelocity >= 0 ? DirectionType.fwd : DirectionType.rev;
	}

	/** @inheritdoc */
	position(units: RotationUnits): number {
		const posDeg = this.getPosition();
		return this.convertRotation(posDeg, RotationUnits.deg, units);
	}

	/** @inheritdoc */
	velocity(units: VelocityUnits | PercentUnits): number {
		if (units === VelocityUnits.pct) {
			return (this.measuredVelocity / this.maxCommandRPM) * 100;
		}
		if (units === VelocityUnits.rpm) return this.measuredVelocity;
		if (units === VelocityUnits.dps) return this.measuredVelocity * 6;
		return 0;
	}

	/** @inheritdoc */
	current(units: CurrentUnits | PercentUnits): number {
		// Simplified model: current = voltage / resistance
		const current = this.appliedVoltage / this.resistance;
		if (units === PercentUnits.pct) {
			return (current / 2.5) * 100; // Assuming 2.5A max
		}
		return current;
	}

	/** @inheritdoc */
	voltage(units: VoltageUnits): number {
		return units === VoltageUnits.volt ? this.appliedVoltage : this.appliedVoltage * 1000;
	}

	/** @inheritdoc */
	power(units: PowerUnits): number {
		return this.appliedVoltage * this.current(CurrentUnits.amp);
	}

	/** @inheritdoc */
	torque(units: TorqueUnits): number {
		// T = Kt * I
		return this.backEMFConstant * this.current(CurrentUnits.amp);
	}

	/** @inheritdoc */
	efficiency(units: PercentUnits): number {
		// Simplified efficiency calculation
		return Math.min(100, (this.power(PowerUnits.watt) / 10) * 100);
	}

	// Helper methods
	private convertRotation(value: number, from: RotationUnits, to?: RotationUnits): number {
		const inDegrees = from === RotationUnits.deg ? value : value * 360;
		if (!to) return inDegrees;
		return to === RotationUnits.deg ? inDegrees : inDegrees / 360;
	}

	/**
	 * @inheritdoc
	 */
	public loop() {
		// IMPORTANT; Understand VEX IQ motor behavior before changing this

		const now = Date.now();
		// Limit the delta time to 30ms to prevent tab pause issues
		const dt = Math.min((now - this.lastUpdateTime) / 1000, 0.03); // Convert to seconds
		const currPos = this.getPosition();
		const currVel = (currPos - this.lastMeasuredPosition) / dt / 6; // to RPM
		this.measuring.push(currVel);
		this.measuring.shift();
		this.measuredVelocity = this.measuring.reduce((a, b) => a + b, 0) / this.measuring.length;
		this.lastMeasuredPosition = currPos;
		this.lastUpdateTime = now;

		// Position control logic
		if (this.isPositionControl && this.targetPosition !== null) {
			const error = this.targetPosition - this.getPosition();

			// Position PID
			this.posIntegral += error * dt;
			const derivative = (error - this.posPrevError) / dt;
			this.posPrevError = error;

			// Calculate target velocity from position PID
			let targetVel =
				this.pos_kP * error + this.pos_kI * this.posIntegral + this.pos_kD * derivative;
			this.targetVelocity = targetVel; // no clamping
		}

		// Handle timeout
		if (this.timeout > 0 && Date.now() - this.movementStartTime > this.timeout) {
			this.stop();
		}

		// Brake mode handling
		let voltage = 0;
		let brakingTorque = 0;
		if (this.targetVelocity === 0 && !this.isPositionControl) {
			// Handle different brake modes when not in position control
			switch (this.brakeMode) {
				case BrakeType.brake:
					// Dynamic braking using H-bridge short circuit
					const currentVelocity = this.measuredVelocity;
					const brakingCurrent = (Math.abs(currentVelocity) / this.maxCommandRPM) * 1; // 1A max braking current
					brakingTorque = brakingCurrent * this.backEMFConstant;
					voltage = -currentVelocity * this.resistance * brakingCurrent;
					break;

				case BrakeType.hold:
					// Switch to position control at current position
					this.isPositionControl = true;
					this.targetPosition = this.getPosition();
					break;

				case BrakeType.coast:
					// Let back EMF and friction slow down the motor
					voltage = 0;
					break;
			}
		} else {
			// Normal velocity PID control
			const error = this.targetVelocity - this.measuredVelocity;
			this.velIntegral += error * dt;
			const derivative = (error - this.velPrevError) / dt;

			// Calculate PID output
			voltage = this.vel_kP * error + this.vel_kI * this.velIntegral + this.vel_kD * derivative;
			this.velPrevError = error;
		}

		// Apply voltage limiting based on max power
		voltage = clamp(voltage, -this.voltageLimit, this.voltageLimit);
		this.appliedVoltage = voltage;

		// Simulate electrical characteristics
		const angularVelocity = (this.calculatedVelocity / 60) * 2 * Math.PI;
		const backEMF = this.backEMFConstant * angularVelocity;
		const current = (voltage - backEMF) / this.resistance;
		let torque = this.backEMFConstant * current;

		// Add braking torque if active
		if (this.brakeMode === BrakeType.brake && this.targetVelocity === 0) {
			torque -= Math.sign(angularVelocity) * brakingTorque;
		}

		// Calculate friction torque
		const frictionTorque =
			dt *
			Math.sign(angularVelocity) *
			(1 + Math.pow(Math.abs(this.calculatedVelocity) / this.maxPhysicalRPM, 2) * 2); // Exponential friction increase with speed
		const netTorque = torque - frictionTorque - brakingTorque;
		const acceleration = netTorque / this.momentOfInertia;

		// Integrate acceleration to velocity
		this.calculatedVelocity += ((acceleration * 60) / (2 * Math.PI)) * dt;

		// Apply hold position stiffness
		if (this.brakeMode === BrakeType.hold && this.holdPosition !== null) {
			const positionError = this.holdPosition - this.getPosition();
			this.calculatedVelocity += positionError * 0.1; // Simple P control for holding
		}

		// Update position with encoder resolution
		const degPerUpdate = (this.calculatedVelocity / 60) * 360 * dt;
		const positionDelta = degPerUpdate * (this.reverse ? -1 : 1);
		this.realWorldPosition += positionDelta;

		// Stop motor physics if velocity is too low
		if (Math.abs(this.calculatedVelocity) < 0.5) {
			this.calculatedVelocity = 0;
		}
	}

	/**
	 * @returns The target velocity of the motor
	 */
	public getTargetVelocity(): number {
		return this.targetVelocity;
	}

	/**
	 * @returns The target position of the motor
	 */
	public getTargetPosition(): number | null {
		return this.targetPosition;
	}

	/**
	 * @returns Whether the motor is reversed
	 */
	public isReversed() {
		return this.reverse;
	}

	/**
	 * @returns The measured velocity of the motor, same as velocity(velocityUnits.rpm)
	 */
	public getVelocity() {
		return this.measuredVelocity;
	}

	/**
	 * @returns The position of the motor, same as position(rotationUnits.deg)
	 */
	public getPosition(): number {
		const rawPosition = this.realWorldPosition - this.zeroPosition;
		return rawPosition * (this.reverse ? -1 : 1);
	}

	/**
	 * Returns the real world position of the motor,
	 * when the motor is not reversed, the real world position is the same as the position
	 * when the motor is reversed, the real world position is the same as the position * -1
	 *
	 * @returns The real world position of the motor
	 */
	public getRealWorldPosition() {
		return this.realWorldPosition;
	}
}

export class ControllerImpl implements Controller {
	private readonly axes: {
		[key in AxisType]: number;
	} = {
		[AxisType.AxisA]: 0,
		[AxisType.AxisB]: 0,
		[AxisType.AxisC]: 0,
		[AxisType.AxisD]: 0
	};

	constructor() {}

	/** @inheritdoc */
	public getValue(axis: AxisType): number {
		return this.axes[axis];
	}

	/**
	 * @param axis The axis to set the value of
	 * @param value The value to set the axis to
	 * @see AxisType
	 */
	public setValue(axis: AxisType, value: number) {
		this.axes[axis] = Math.round(clamp(value, -100, 100));
	}
}

export class ContextImpl implements Context {
	private readonly devices: {
		[key: number]: SupportedDeviceImpl;
	} = {};
	private runningInterval: number | null = null;
	private controller: ControllerImpl = new ControllerImpl();

	/**
	 * Adds a device to the context
	 * @param device The device to add
	 */
	public addDevice(device: SupportedDeviceImpl) {
		if (this.devices[device.port]) {
			throw new Error(`Device already exists on port ${device.port}`);
		}
		this.devices[device.port] = device;
	}

	/** @inheritdoc */
	public getDevice<T extends DeviceType>(port: number, type: T): SupportedDevices[T] {
		const device = this.devices[port];
		if (!device) throw new Error(`Device not found on port ${port}`);
		if (device.type !== type) throw new Error(`Device on port ${port} is not of type ${type}`);
		return device;
	}

	/**
	 * @returns The controller instance
	 */
	public getController(): ControllerImpl {
		return this.controller;
	}

	/**
	 * Runs the context, this will call the loop method on all devices in the context every 20ms
	 *
	 * @throws Error if the context is already running
	 */
	public run() {
		if (this.runningInterval) throw new Error('Context is already running');
		this.runningInterval = setInterval(() => {
			for (const device of Object.values(this.devices)) {
				device.loop();
			}
		}, 20); // 20ms = 50Hz
	}

	/**
	 * Stops the context, this will stop the loop method on all devices in the context
	 *
	 * @throws Error if the context is not running
	 */
	public stop() {
		if (!this.runningInterval) throw new Error('Context is not running');
		clearInterval(this.runningInterval);
		this.runningInterval = null;
	}
}
