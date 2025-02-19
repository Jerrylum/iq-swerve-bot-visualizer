export class Motor {
	private reverse: boolean = $state(false);
	private velocity: number = $state(0); // in rpm (actual)
	private targetVelocity: number = $state(0); // in rpm (desired)
	private zeroPosition: number = $state(0); // in degrees
	private realWorldPosition: number = $state(0); // in degrees

	// Simulation properties
	private integral: number = 0;
	private previousError: number = 0;
	private appliedVoltage: number = 0;
	private momentOfInertia: number; // kg·m²
	private backEMFConstant: number; // V·s/rad
	private voltageLimit: number; // Max allowed voltage

	constructor(
		public readonly port: number,
		public readonly resistance: number = 1, // Ohms
		private kP: number = 0.05, // PID proportional gain
		private kI: number = 0.0, // PID integral gain
		private kD: number = 0.001, // PID derivative gain
		voltageLimit: number = 6, // Volts
		momentOfInertia: number = 0.001, // kg·m²
		backEMFConstant: number = 0.02 // V·s/rad
	) {
		this.momentOfInertia = momentOfInertia;
		this.backEMFConstant = backEMFConstant;
		this.voltageLimit = voltageLimit;
	}

	public loop() {
		// PID Controller (velocity control)
		const dt = 0.02; // 20ms time step
		const currentRPM = this.velocity;
		const error = this.targetVelocity - currentRPM;

		// PID calculations
		this.integral += error * dt;
		const derivative = (error - this.previousError) / dt;
		this.previousError = error;

		// Calculate voltage using PID
		let voltage = this.kP * error + this.kI * this.integral + this.kD * derivative;

		// Apply voltage limiting
		voltage = Math.max(-this.voltageLimit, Math.min(voltage, this.voltageLimit));
		this.appliedVoltage = voltage;

		// Motor physics simulation
		const angularVelocity = (currentRPM / 60) * 2 * Math.PI; // Convert RPM to rad/s
		const backEMF = this.backEMFConstant * angularVelocity;
		const current = (voltage - backEMF) / this.resistance;
		const torque = this.backEMFConstant * current; // T = Kt * I
		const acceleration = torque / this.momentOfInertia; // α = T/J

		// Update velocity and position
		this.velocity += (acceleration * dt * 60) / (2 * Math.PI); // Convert back to RPM
		const degPer20ms = (this.velocity / 60) * 360 * 0.02;
		this.realWorldPosition += degPer20ms * (this.reverse ? -1 : 1);
	}

	public setReverse(reverse: boolean) {
		this.reverse = reverse;
	}

	public setTargetVelocity(rpm: number) {
		this.targetVelocity = rpm;
	}

	public getTargetVelocity(): number {
		return this.targetVelocity;
	}

	public getAppliedVoltage(): number {
		return this.appliedVoltage;
	}

	public setPosition(position: number) {
		this.zeroPosition = this.realWorldPosition - position * (this.reverse ? -1 : 1);
	}

	public setRealWorldPosition(position: number) {
		this.realWorldPosition = position;
	}

	public isReversed() {
		return this.reverse;
	}

	public getVelocity() {
		return this.velocity;
	}

	public getPosition() {
		return (this.realWorldPosition - this.zeroPosition) * (this.reverse ? -1 : 1);
	}

	public getRealWorldPosition() {
		return this.realWorldPosition;
	}
}
