<script lang="ts">
	import { velocityUnits, voltageUnits, type MotorImpl } from '$lib/Hardware.svelte';
	import { Group, Circle, Line, Arrow } from 'svelte-konva';

	const {
		x: rootX,
		y: rootY,
		driveMotor,
		steerMotor
	}: { x: number; y: number; driveMotor: MotorImpl; steerMotor: MotorImpl } = $props();

	const swerveModuleOuterRadius = 90;
	const swerveModuleInnerRadius = swerveModuleOuterRadius * 0.4;
	let steerAngle = $state(0);
	// steerMotor.setReverse(true);

	// setTimeout(() => {
	// 	steerMotor.setTargetVelocity(100);
	// 	setTimeout(() => {
	// 		steerMotor.setTargetVelocity(0);
	// 	}, 1000);
	// }, 1000);

	$inspect(steerMotor).with((type, steerMotor) => {
		console.log(type, steerMotor);
	});

	$effect(() => {
		console.log('>>>', steerMotor.getVelocity().toFixed(2), steerMotor.voltage(voltageUnits.volt).toFixed(2));
		// console.log('>>>', steerMotor.measuredVelocity.toFixed(2), steerMotor.velocity(velocityUnits.rpm).toFixed(2));

		steerAngle = steerMotor.getRealWorldPosition() % 360;
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
	<Arrow
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
	/>
</Group>
