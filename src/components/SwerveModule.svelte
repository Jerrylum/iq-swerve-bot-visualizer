<script lang="ts">
	import { clamp } from '$lib';
	import { velocityUnits, voltageUnits, type MotorImpl } from '$lib/Hardware.svelte';
	import { Group, Circle, Line, Arrow } from 'svelte-konva';

	const {
		x: rootX,
		y: rootY,
		driveMotor,
		steerMotor,
		steerReversed,
		steerRatio
	}: {
		x: number;
		y: number;
		driveMotor: MotorImpl;
		steerMotor: MotorImpl;
		steerReversed: boolean;
		steerRatio: number;
	} = $props();

	const swerveModuleOuterRadius = 90;
	const swerveModuleInnerRadius = swerveModuleOuterRadius * 0.4;
	let steerAngle = $state(0);
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

		const driveMotorVelocity = driveMotor.getVelocity();
		const driveMotorVelocityPct = clamp(driveMotorVelocity / 120, -1, 1);

		driveVelocityPct = Math.abs(driveMotorVelocityPct) > 0.05 ? driveMotorVelocityPct : 0;
	});
</script>

<Group x={rootX} y={rootY}>
	<Circle
		x={swerveModuleOuterRadius}
		y={swerveModuleOuterRadius}
		radius={swerveModuleOuterRadius}
		stroke="#000"
	/>
	<!-- draw a line in the middle width =10 -->
	<!-- <Line
		x={swerveModuleOuterRadius}
		y={swerveModuleOuterRadius}
		strokeWidth={30}
		stroke="#000"
		points={[0, 0, 0, swerveModuleInnerRadius * 2]}
		offsetY={swerveModuleInnerRadius}
		rotation={0}
		tension={1}
		lineCap="round"
	/> -->

	<!-- <Line
		x={swerveModuleOuterRadius}
		y={swerveModuleOuterRadius}
		strokeWidth={30}
		stroke="#000"
		points={[0, 0, 0, swerveModuleInnerRadius * 2]}
		pointerLength={20}
		pointerWidth={20}
		offsetY={swerveModuleInnerRadius}
		rotation={40}
		tension={1}
		lineCap="round"
	/> -->
	<!-- <Arrow
		x={swerveModuleOuterRadius}
		y={swerveModuleOuterRadius}
		strokeWidth={25 + Math.abs(driveVelocityPct) * 7}
		stroke="#000"
		points={[
			0,
			0,
			0,
			swerveModuleInnerRadius * 2 + (driveVelocityPct > 0 ? driveVelocityPct * 7 : 0)
		]}
		pointerLength={Math.abs(driveVelocityPct) * 7}
		pointerWidth={Math.abs(driveVelocityPct) * 7}
		pointerAtBeginning={driveVelocityPct > 0}
		pointerAtEnding={driveVelocityPct < 0}
		offsetY={swerveModuleInnerRadius}
		rotation={steerAngle}
		tension={1}
		lineCap="round"
	/> -->
	<Arrow
		x={swerveModuleOuterRadius}
		y={swerveModuleOuterRadius}
		strokeWidth={25 + Math.abs(driveVelocityPct) * 3.5}
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
	<!-- <Arrow
		x={swerveModuleOuterRadius}
		y={swerveModuleOuterRadius}
		strokeWidth={30}
		stroke="#000"
		points={[0, 0, 0, swerveModuleInnerRadius * 2 + 5]}
		pointerLength={5}
		pointerWidth={5}
		pointerAtBeginning={true}
		pointerAtEnding={false}
		offsetY={swerveModuleInnerRadius}
		rotation={steerAngle}
		tension={1}
		lineCap="round"
	/> -->
</Group>
