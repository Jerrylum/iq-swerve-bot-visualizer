<script lang="ts">
	import { clamp } from '$lib';
	import type { MotorImpl } from '$lib';
	import { Group, Circle, Arrow } from 'svelte-konva';

	const {
		x: rootX,
		y: rootY,
		driveMotor,
		steerMotor,
		steerReversed,
		steerRatio,
		update
	}: {
		x: number;
		y: number;
		driveMotor: MotorImpl;
		steerMotor: MotorImpl;
		steerReversed: boolean;
		steerRatio: number;
		update: (steerAngle: number, driveVelocity: number) => void;
	} = $props();

	const swerveModuleOuterRadius = 90;
	const swerveModuleInnerRadius = swerveModuleOuterRadius * 0.4;
	let steerAngle = $state(0);
	let driveVelocity = $state(0);
	let driveVelocityPct = $state(0);
	$effect(() => {
		// console.log(
		// 	'>>>',
		// 	steerMotor.getVelocity().toFixed(2),
		// 	steerMotor.voltage(voltageUnits.volt).toFixed(2)
		// );

		const steerMotorPosition = steerMotor.getRealWorldPosition();
		const turnableBasePosition = (steerMotorPosition * (steerReversed ? -1 : 1)) / steerRatio;

		steerAngle = turnableBasePosition % 360;

		driveVelocity = driveMotor.getVelocity();

		const driveMotorVelocityPct = clamp(driveVelocity / 120, -1, 1);

		driveVelocityPct = Math.abs(driveMotorVelocityPct) > 0.02 ? driveMotorVelocityPct : 0;

		update(steerAngle, driveVelocity);
	});
</script>

<Group x={rootX} y={rootY}>
	<Circle
		x={swerveModuleOuterRadius}
		y={swerveModuleOuterRadius}
		radius={swerveModuleOuterRadius}
		stroke="#000"
	/>
	<Arrow
		x={swerveModuleOuterRadius}
		y={swerveModuleOuterRadius}
		strokeWidth={25}
		stroke="#000"
		points={[
			0,
			Math.abs(driveVelocityPct) * 3.5,
			0,
			swerveModuleInnerRadius * 2 + Math.abs(driveVelocityPct) * 7
		]}
		pointerLength={Math.abs(driveVelocityPct) * 7}
		pointerWidth={Math.abs(driveVelocityPct) * 7}
		pointerAtBeginning={driveVelocityPct !== 0}
		pointerAtEnding={false}
		offsetY={swerveModuleInnerRadius}
		rotation={steerAngle + (driveVelocityPct < 0 ? 180 : 0)}
		tension={1}
		lineCap="round"
	/>
</Group>
