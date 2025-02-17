import { Vector } from '$lib';
import type { KonvaDragTransformEvent } from 'svelte-konva';

export function getClientXY(evt: DragEvent | MouseEvent | TouchEvent): Vector {
	if (window.TouchEvent && evt instanceof TouchEvent) {
		const touch = evt.touches[0] || evt.changedTouches[0];
		return touch ? new Vector(touch.clientX, touch.clientY) : new Vector(0, 0);
	} else {
		evt = evt as DragEvent | MouseEvent;
		return new Vector(evt.clientX, evt.clientY);
	}
}

export function getLocalXY(konvaEvent: KonvaDragTransformEvent): Vector {
	const konvaGroup = konvaEvent.target.parent!;
	const konvaGroupXY = konvaGroup.absolutePosition();
	const konvaStage = konvaEvent.target.getStage()!;
	const konvaStageXY = konvaStage.container().getBoundingClientRect();
	const clientXY = getClientXY(konvaEvent.evt);
	return new Vector(
		clientXY.x - konvaStageXY.left - konvaGroupXY.x,
		clientXY.y - konvaStageXY.top - konvaGroupXY.y
	);
}
