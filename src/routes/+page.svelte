<script lang="ts">
	import { Stage, Layer, Rect, Text } from 'svelte-konva';
  import Joystick from '$components/Joystick.svelte';

</script>

<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->

<!-- Swerve Bot Visualizer -->

<div class="flex h-screen w-full items-center justify-center">
	<Stage width={800} height={400} staticConfig={true}>
		<Layer>
			<Rect x={0} y={0} width={800} height={400} fill="#EEE" />
			<Text x={40} y={40} text="Left Joystick:" fontSize={20} />
			<Joystick x={40} y={80} />
			<Text x={200} y={40} text="Right Joystick:" fontSize={20} />
		</Layer>
	</Stage>
</div>
