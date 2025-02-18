export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function deadband(value: number, deadband: number) {
	return Math.abs(value) < deadband ? 0 : value;
}
