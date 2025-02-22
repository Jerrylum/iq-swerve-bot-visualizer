<script lang="ts">
	import type { SwerveModuleProps, SwerveModuleUpdate } from './SwerveModule.svelte';
	import SwerveModule from './SwerveModule.svelte';
	import { Group, Text } from 'svelte-konva';

	const {
		x,
		y,
		driveMotor,
		steerMotor,
		steerReversed,
		steerRatio,
		update,
		title
	}: SwerveModuleProps & { title: string } = $props();
	let values: SwerveModuleUpdate = $state({ steerAngle: 0, driveVelocity: 0 });
</script>

<Group {x} {y}>
	<Text x={0} y={0} text={title} fontSize={20} />
	<SwerveModule
		x={0}
		y={40}
		{driveMotor}
		{steerMotor}
		{steerReversed}
		{steerRatio}
		update={(steerAngle, driveVelocity) => {
			values.steerAngle = steerAngle;
			values.driveVelocity = driveVelocity;
			update(steerAngle, driveVelocity);
		}}
	/>
	<Text x={0} y={240} text={`Steer Angle: ${values.steerAngle.toFixed(2)}`} fontSize={16} />
	<Text x={0} y={260} text={`Drive Velocity: ${values.driveVelocity.toFixed(2)}`} fontSize={16} />
</Group>
