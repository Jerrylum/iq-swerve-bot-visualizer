import type { Context } from './Hardware.svelte';
import { AxisType, DeviceType, DirectionType, VelocityUnits } from './Hardware.svelte';

export async function main(context: Context) {
	const controller = context.getController();

	const leftSteerMotor = context.getDevice(6, DeviceType.Motor);
	const rightSteerMotor = context.getDevice(3, DeviceType.Motor);
	const leftDriveMotor = context.getDevice(12, DeviceType.Motor);
	const rightDriveMotor = context.getDevice(9, DeviceType.Motor);

	setInterval(() => {
		const x1 = controller.getValue(AxisType.AxisB);
		const y1 = controller.getValue(AxisType.AxisA);

		// console.log(x1, y1);

		leftSteerMotor.setVelocity((y1 / 100) * 140, VelocityUnits.rpm);
		leftSteerMotor.spin(DirectionType.fwd);
	}, 10);
}
