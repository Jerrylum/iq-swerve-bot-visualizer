<script lang="ts">
	import { Stage, Layer, Rect, Text, Group } from 'svelte-konva';
	import Joystick from '$components/Joystick.svelte';
	import type { Coordinate } from '$lib';
	import SwerveModule from '$components/SwerveModule.svelte';
	import { Motor } from '$lib/Hardware.svelte';
	// import type { Motor} from '$components/SwerveModule.svelte';

	let leftJoystickPos: Coordinate = $state({ x: 0, y: 0 });
	let rightJoystickPos: Coordinate = $state({ x: 0, y: 0 });

	const m1 = new Motor(1);
	const m2 = new Motor(2);
	const m3 = new Motor(3);
	const m4 = new Motor(4);

	$effect(() => {
		// m1.setTargetVelocity(leftJoystickPos.x * 100);
		m2.setTargetVelocity(leftJoystickPos.y / 100 * 140);
		// m3.setTargetVelocity(rightJoystickPos.x * 100);
		// m4.setTargetVelocity(rightJoystickPos.y * 100);
		// console.log(m2.getTargetVelocity());
	});

	setInterval(() => {
		m2.loop();
	}, 20);
</script>

<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->

<!-- Swerve Bot Visualizer -->

<div class="flex h-screen w-full items-center justify-center">
	<Stage width={800} height={300} staticConfig={true}>
		<Layer>
			<Rect x={0} y={0} width={800} height={300} fill="#EEE" />
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
				<SwerveModule x={0} y={40} driveMotor={m1} steerMotor={m2} />
			</Group>
			<Group x={580} y={40}>
				<Text x={0} y={0} text="Right Swerve Drive" fontSize={20} />
				<SwerveModule x={0} y={40} driveMotor={m3} steerMotor={m4} />
			</Group>
		</Layer>
	</Stage>
</div>
