<script lang="ts">
	import { Stage, Layer, Rect, Text, Group } from 'svelte-konva';
	import Joystick from '$components/Joystick.svelte';
	import type { Coordinate } from '$lib';
	import SwerveModule from '$components/SwerveModule.svelte';
	import {
		AxisType,
		BrakeType,
		ContextImpl,
		DeviceType,
		DirectionType,
		MotorImpl,
		RotationUnits,
		VelocityUnits
	} from '$lib/Hardware.svelte';
	import * as usercode from '$lib/Usercode';

	interface SwerveModuleUpdate {
		steerAngle: number;
		driveVelocity: number;
	}

	/**
	 * The moment of inertia of a uniformly distributed solid cylinder rotating about its central axis.
	 *
	 * Calculated using the formula for a solid cylinder:
	 *   I = (1/2) * mass * radius²
	 *
	 * Parameters:
	 * - Mass: 800 grams converted to kilograms (0.8 kg)
	 * - Radius: 5 cm converted to meters (0.05 m)
	 *
	 * Calculation steps:
	 * 1. Square the radius: (0.05 m)^2 = 0.0025 m²
	 * 2. Multiply by mass: 0.8 kg * 0.0025 m² = 0.002 kg·m²
	 * 3. Apply the 1/2 factor: 0.002 kg·m² * 0.5 = 0.001 kg·m²
	 *
	 * Final value in scientific notation matches input precision (3 significant figures).
	 * Represents rotational resistance of the cylinder about its central axis.
	 */
	const steeringInertia: number = 1e-3; // Unit: kg·m²
	const driveInertia: number = 1e-3; // Unit: kg·m²

	const context = new ContextImpl();
	const controller = context.getController();

	const m6 = new MotorImpl(6, driveInertia);
	const m3 = new MotorImpl(3, steeringInertia);
	const m12 = new MotorImpl(12, driveInertia);
	const m9 = new MotorImpl(9, steeringInertia);

	context.addDevice(m6);
	context.addDevice(m3);
	context.addDevice(m12);
	context.addDevice(m9);
	context.run();
	usercode.main(context);

	let leftJoystickPos: Coordinate = $state({ x: 0, y: 0 });
	let rightJoystickPos: Coordinate = $state({ x: 0, y: 0 });

	let leftSwerveModuleValues: SwerveModuleUpdate = $state({ steerAngle: 0, driveVelocity: 0 });
	let rightSwerveModuleValues: SwerveModuleUpdate = $state({ steerAngle: 0, driveVelocity: 0 });

	// m3.setBrake(BrakeType.coast);

	$effect(() => {
		controller.setValue(AxisType.AxisA, leftJoystickPos.y);
		controller.setValue(AxisType.AxisB, leftJoystickPos.x);
		controller.setValue(AxisType.AxisC, rightJoystickPos.x);
		controller.setValue(AxisType.AxisD, rightJoystickPos.y);
	});
</script>

<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->

<!-- Swerve Bot Visualizer -->

<div class="flex h-screen w-full items-center justify-center">
	<Stage width={800} height={400} staticConfig={true}>
		<Layer>
			<Rect x={0} y={0} width={800} height={400} fill="#EEE" />
			<Group x={40} y={40}>
				<Text x={0} y={0} text="Left Joystick" fontSize={20} />
				<Joystick x={0} y={40} update={(pos) => (leftJoystickPos = pos)} />
				<Text x={0} y={180} text={`X: ${leftJoystickPos.x}`} fontSize={16} />
				<Text x={0} y={200} text={`Y: ${leftJoystickPos.y}`} fontSize={16} />
			</Group>
			<Group x={200} y={40}>
				<Text x={0} y={0} text="Right Joystick" fontSize={20} />
				<Joystick x={0} y={40} update={(pos) => (rightJoystickPos = pos)} />
				<Text x={0} y={180} text={`X: ${rightJoystickPos.x}`} fontSize={16} />
				<Text x={0} y={200} text={`Y: ${rightJoystickPos.y}`} fontSize={16} />
			</Group>
			<Group x={360} y={40}>
				<Text x={0} y={0} text="Left Swerve Drive" fontSize={20} />
				<SwerveModule
					x={0}
					y={40}
					driveMotor={m6}
					steerMotor={m3}
					steerReversed={true}
					steerRatio={5}
					update={(steerAngle, driveVelocity) =>
						(leftSwerveModuleValues = { steerAngle, driveVelocity })}
				/>
				<Text
					x={0}
					y={240}
					text={`Steer Angle: ${leftSwerveModuleValues.steerAngle.toFixed(2)}`}
					fontSize={16}
				/>
				<Text
					x={0}
					y={260}
					text={`Drive Velocity: ${leftSwerveModuleValues.driveVelocity.toFixed(2)}`}
					fontSize={16}
				/>
			</Group>
			<Group x={580} y={40}>
				<Text x={0} y={0} text="Right Swerve Drive" fontSize={20} />
				<SwerveModule
					x={0}
					y={40}
					driveMotor={m12}
					steerMotor={m9}
					steerReversed={true}
					steerRatio={5}
					update={(steerAngle, driveVelocity) =>
						(rightSwerveModuleValues = { steerAngle, driveVelocity })}
				/>
				<Text
					x={0}
					y={240}
					text={`Steer Angle: ${rightSwerveModuleValues.steerAngle.toFixed(2)}`}
					fontSize={16}
				/>
				<Text
					x={0}
					y={260}
					text={`Drive Velocity: ${rightSwerveModuleValues.driveVelocity.toFixed(2)}`}
					fontSize={16}
				/>
			</Group>
		</Layer>
	</Stage>
</div>
