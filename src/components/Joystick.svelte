<script lang="ts">
	import { getLocalXY, clamp, Vector } from '$lib';
	import { Group, Circle } from 'svelte-konva';
	import type { KonvaDragTransformEvent } from 'svelte-konva';

	const { x: rootX, y: rootY } = $props<{ x: number; y: number }>();

	const joystickOuterRadius = (200 - (20 + 20 + 20) - 20) / 2; // 180
	const joystickInnerRadius = joystickOuterRadius - 30;

	let joystickOutputX = $state(0); // 0..100
	let joystickOutputY = $state(0); // 0..100
	let thumbX = $state(0);
	let thumbY = $state(0);

	/**
	 * Set the joystick position
	 * @param pos - The position of the joystick, in cartesian coordinates with Y Axis increases by north, X Axis increases by east, zero point is at the center of the joystick
	 */
	const setJoystick = (pos: Vector) => {
		// Calculate the magnitude of the vector by using pythagorean theorem
		const magnitude = Math.sqrt(pos.x * pos.x + pos.y * pos.y);

		// Normalize and scale the vector to fit within unit circle
		const normalizedMagnitude = Math.min(magnitude, joystickOuterRadius) / joystickOuterRadius;
		const angle = Math.atan2(-pos.y, pos.x);

		// Convert back to cartesian coordinates
		const jx = normalizedMagnitude * Math.cos(angle);
		const jy = normalizedMagnitude * Math.sin(angle);

		const maxThumbDistance = joystickOuterRadius;
		thumbX = jx * maxThumbDistance;
		thumbY = jy * maxThumbDistance;

		const outputX = clamp(pos.x / (joystickOuterRadius * 0.72), -1, 1);
		const outputY = -1 * clamp(pos.y / (joystickOuterRadius * 0.72), -1, 1);

		joystickOutputX = Math.round(outputX * 100);
		joystickOutputY = Math.round(outputY * 100);
	};

	const handleJoystickDragMove = (e: KonvaDragTransformEvent) => {
		const konvaJoystickOuter = e.target;

		const localXY = getLocalXY(e);
		const centerXY = new Vector(joystickOuterRadius, joystickOuterRadius);

		// the current x and y are centered on the top left corner
		// convert them to tx ty, which is centered on the joystick outer
		const transformedXY = localXY.subtract(centerXY);

		setJoystick(transformedXY);
		// console.log('Joystick updated', joystickOutputX, joystickOutputY);

		// set it back to the original position, do not actually drag it
		konvaJoystickOuter.setPosition({ x: joystickOuterRadius, y: joystickOuterRadius });
	};

  const handleJoystickDragEnd = (e: KonvaDragTransformEvent) => {
		setJoystick(new Vector(0, 0));

    console.log('Joystick drag end');
  }
</script>

<Group x={rootX} y={rootY}>
	<Circle
		x={joystickOuterRadius}
		y={joystickOuterRadius}
		radius={joystickOuterRadius}
		stroke="#000"
		draggable={true}
		ondragmove={handleJoystickDragMove}
		ondragend={handleJoystickDragEnd}
	/>
	<Circle
		x={joystickOuterRadius + thumbX}
		y={joystickOuterRadius - thumbY}
		radius={joystickInnerRadius}
		fill="#000"
		listening={false}
	/>
</Group>
