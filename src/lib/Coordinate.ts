export interface Coordinate {
	x: number;
	y: number;
}

export interface CoordinateWithHeading extends Coordinate {
	heading: number; // Degree [0, 360)
}

export function isCoordinate(target: any): target is Coordinate {
	return typeof target.x === 'number' && typeof target.y === 'number';
}

export function isCoordinateWithHeading(target: any): target is CoordinateWithHeading {
	return typeof target.heading === 'number' && isCoordinate(target);
}
