import { clamp } from '$lib';

/**
 * Measurement units for velocity values
 */
export enum velocityUnits {
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
export enum percentUnits {
	/** Percentage unit (0-100%) */
	pct = 'pct'
}

/**
 * Braking modes for motor stopping
 */
export enum brakeType {
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
export enum directionType {
	/** Forward direction */
	fwd = 'fwd',
	/** Reverse direction */
	rev = 'rev'
}

/**
 * Measurement units for rotation values
 */
export enum rotationUnits {
	/** Rotation in degrees */
	deg = 'deg',
	/** Rotation in full revolutions */
	rev = 'rev'
}

/**
 * Measurement units for time values
 */
export enum timeUnits {
	/** Time in seconds */
	sec = 'sec',
	/** Time in milliseconds */
	msec = 'msec'
}

/**
 * Measurement units for electrical current
 */
export enum currentUnits {
	/** Current in amperes */
	amp = 'amp'
}

/**
 * Measurement units for voltage
 */
export enum voltageUnits {
	/** Voltage in volts */
	volt = 'volt',
	/** Voltage in millivolts */
	mV = 'mV'
}

/**
 * Measurement units for power
 */
export enum powerUnits {
	/** Power in watts */
	watt = 'watt'
}

/**
 * Measurement units for torque
 */
export enum torqueUnits {
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
	setVelocity(velocity: number, units: velocityUnits): void;
	setVelocity(velocity: number, units: percentUnits): void;

	/**
	 * Sets legacy braking mode
	 * @param mode Brake mode (coast, brake, hold)
	 */
	setBrake(mode: brakeType): void;

	/**
	 * Sets stopping mode
	 * @param mode Brake mode (coast, brake, hold)
	 */
	setStopping(mode: brakeType): void;

	/** Resets rotation sensor to zero */
	resetPosition(): void;

	/**
	 * Sets rotation sensor value
	 * @param value New position value
	 * @param units Rotation units for position
	 */
	setPosition(value: number, units: rotationUnits): void;

	/**
	 * Sets movement timeout
	 * @param time Timeout duration
	 * @param units Time units
	 */
	setTimeout(time: number, units: timeUnits): void;

	/**
	 * Spins motor in specified direction
	 * @param dir Movement direction
	 */
	spin(dir: directionType): void;

	/**
	 * Spins to absolute position
	 * @param rotation Target position
	 * @param units Rotation units
	 * @param waitForCompletion Whether to block until complete
	 */
	spinTo(rotation: number, units: rotationUnits, waitForCompletion?: boolean): Promise<boolean>;

	/**
	 * Spins for relative rotation
	 * @param rotation Amount to rotate
	 * @param units Rotation units
	 * @param waitForCompletion Whether to block until complete
	 */
	spinFor(rotation: number, units: rotationUnits, waitForCompletion?: boolean): Promise<boolean>;

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
	stop(mode: brakeType): void;

	/**
	 * Sets maximum torque
	 * @param value Torque limit value
	 * @param units Measurement units
	 */
	setMaxTorque(value: number, units: percentUnits): void;
	setMaxTorque(value: number, units: torqueUnits): void;
	setMaxTorque(value: number, units: currentUnits): void;

	/** Gets current movement direction */
	direction(): directionType;

	/**
	 * Gets current position
	 * @param units Rotation units for return value
	 */
	position(units: rotationUnits): number;

	/**
	 * Gets current velocity
	 * @param units Velocity units for return value
	 */
	velocity(units: velocityUnits | percentUnits): number;
	velocity(units: percentUnits): number;

	/**
	 * Gets electrical current
	 * @param units Current units
	 */
	current(units: currentUnits): number;
	current(units: percentUnits): number;

	/**
	 * Gets electrical voltage
	 * @param units Voltage units
	 */
	voltage(units: voltageUnits): number;

	/**
	 * Gets power consumption
	 * @param units Power units
	 */
	power(units: powerUnits): number;

	/**
	 * Gets output torque
	 * @param units Torque units
	 */
	torque(units: torqueUnits): number;

	/**
	 * Gets efficiency
	 * @param units Efficiency units
	 */
	efficiency(units: percentUnits): number;
}

export interface Context {
	/**
	 * Gets a device from the context
	 * @param port The port number of the device
	 * @param type The type of device to get
	 */
	getDevice<T extends DeviceType>(port: number, type: T): SupportedDevices[T];
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
	private brakeMode: brakeType = brakeType.coast;
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
	setVelocity(velocity: number, units: velocityUnits | percentUnits): void {
		if (units === velocityUnits.pct) {
			this.targetVelocity = (velocity / 100) * this.maxCommandRPM;
		} else if (units === velocityUnits.rpm) {
			this.targetVelocity = velocity;
		} else if (units === velocityUnits.dps) {
			this.targetVelocity = velocity / 6;
		}
	}

	/** @inheritdoc */
	setBrake(mode: brakeType): void {
		this.brakeMode = mode;
	}

	/** @inheritdoc */
	setStopping(mode: brakeType): void {
		this.brakeMode = mode;
	}

	/** @inheritdoc */
	resetPosition(): void {
		this.zeroPosition = this.realWorldPosition;
	}

	/** @inheritdoc */
	setPosition(value: number, units: rotationUnits): void {
		const currentRealPosition = this.realWorldPosition;
		const desiredPosition = this.convertRotation(value, units);

		// Calculate new zero offset based on reverse flag
		this.zeroPosition = currentRealPosition - desiredPosition * (this.reverse ? -1 : 1);
	}

	/** @inheritdoc */
	setTimeout(time: number, units: timeUnits): void {
		this.timeout = units === timeUnits.sec ? time * 1000 : time;
	}

	/** @inheritdoc */
	spin(dir: directionType): void {
		const directionMultiplier =
			(dir === directionType.fwd ? 1 : -1) * this.targetVelocity > 0 ? 1 : -1;
		this.targetVelocity = Math.abs(this.targetVelocity) * directionMultiplier;
		this.isPositionControl = false;
	}

	/** @inheritdoc */
	async spinTo(rotation: number, units: rotationUnits, waitForCompletion = true): Promise<boolean> {
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
		units: rotationUnits,
		waitForCompletion = true
	): Promise<boolean> {
		const current = this.getPosition();
		return this.spinTo(
			current + this.convertRotation(rotation, units),
			rotationUnits.deg,
			waitForCompletion
		);
	}

	/** @inheritdoc */
	isSpinning(): boolean {
		return Math.abs(this.measuredVelocity) > 0.1 || (this.isPositionControl && !this.isDone());
	}

	/** @inheritdoc */
	isDone(): boolean {
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
	stop(mode?: brakeType): void {
		const brakeMode = mode ?? this.brakeMode;
		this.brakeMode = brakeMode;

		if (brakeMode === brakeType.hold) {
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
	setMaxTorque(value: number, units: percentUnits | torqueUnits | currentUnits): void {
		if (units === percentUnits.pct) {
			this.voltageLimit = (value / 100) * this.maxVoltage;
		}
		// Torque/current units would require motor constant knowledge
	}

	/** @inheritdoc */
	direction(): directionType {
		return this.measuredVelocity >= 0 ? directionType.fwd : directionType.rev;
	}

	/** @inheritdoc */
	position(units: rotationUnits): number {
		const posDeg = this.getPosition();
		return this.convertRotation(posDeg, rotationUnits.deg, units);
	}

	/** @inheritdoc */
	velocity(units: velocityUnits | percentUnits): number {
		if (units === velocityUnits.pct) {
			return (this.measuredVelocity / this.maxCommandRPM) * 100;
		}
		if (units === velocityUnits.rpm) return this.measuredVelocity;
		if (units === velocityUnits.dps) return this.measuredVelocity * 6;
		return 0;
	}

	/** @inheritdoc */
	current(units: currentUnits | percentUnits): number {
		// Simplified model: current = voltage / resistance
		const current = this.appliedVoltage / this.resistance;
		if (units === percentUnits.pct) {
			return (current / 2.5) * 100; // Assuming 2.5A max
		}
		return current;
	}

	/** @inheritdoc */
	voltage(units: voltageUnits): number {
		return units === voltageUnits.volt ? this.appliedVoltage : this.appliedVoltage * 1000;
	}

	/** @inheritdoc */
	power(units: powerUnits): number {
		return this.appliedVoltage * this.current(currentUnits.amp);
	}

	/** @inheritdoc */
	torque(units: torqueUnits): number {
		// T = Kt * I
		return this.backEMFConstant * this.current(currentUnits.amp);
	}

	/** @inheritdoc */
	efficiency(units: percentUnits): number {
		// Simplified efficiency calculation
		return Math.min(100, (this.power(powerUnits.watt) / 10) * 100);
	}

	// Helper methods
	private convertRotation(value: number, from: rotationUnits, to?: rotationUnits): number {
		const inDegrees = from === rotationUnits.deg ? value : value * 360;
		if (!to) return inDegrees;
		return to === rotationUnits.deg ? inDegrees : inDegrees / 360;
	}

	/**
	 * @inheritdoc
	 */
	public loop() {
		const now = Date.now();
		const dt = (now - this.lastUpdateTime) / 1000; // Convert to seconds
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
				case brakeType.brake:
					// Dynamic braking using H-bridge short circuit
					const currentVelocity = this.measuredVelocity;
					const brakingCurrent = (Math.abs(currentVelocity) / this.maxCommandRPM) * 1; // 1A max braking current
					brakingTorque = brakingCurrent * this.backEMFConstant;
					voltage = -currentVelocity * this.resistance * brakingCurrent;
					break;

				case brakeType.hold:
					// Switch to position control at current position
					this.isPositionControl = true;
					this.targetPosition = this.getPosition();
					break;

				case brakeType.coast:
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
		if (this.brakeMode === brakeType.brake && this.targetVelocity === 0) {
			torque -= Math.sign(angularVelocity) * brakingTorque;
		}

		// Update physics with better friction model
		const frictionTorque =
			dt *
			Math.sign(angularVelocity) *
			(1 + Math.pow(Math.abs(this.calculatedVelocity) / this.maxPhysicalRPM, 2) * 2); // Exponential friction increase with speed
		const netTorque = torque - frictionTorque - brakingTorque;
		const acceleration = netTorque / this.momentOfInertia;

		// Integrate acceleration to velocity
		this.calculatedVelocity += ((acceleration * 60) / (2 * Math.PI)) * dt;

		// Apply hold position stiffness
		if (this.brakeMode === brakeType.hold && this.holdPosition !== null) {
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



export class ContextImpl implements Context {
	private readonly devices: {
		[key: number]: SupportedDeviceImpl;
	} = {};
	private runningInterval: number | null = null;

	constructor() {}

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
