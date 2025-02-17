import type { Coordinate } from './Coordinate';

export class Vector implements Coordinate {
	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	add(value: number): Vector;
	add<T extends Vector>(value: T): T;
	add<T extends Vector>(value: number | T): Vector | T;
	add<T extends Vector>(value: number | T): Vector | T {
		if (typeof value === 'number') {
			return new Vector(this.x + value, this.y + value);
		} else {
			const rtn = value.clone();
			rtn.setXY(this.x + value.x, this.y + value.y);
			return rtn;
		}
	}

	subtract(value: number): Vector;
	subtract<T extends Vector>(value: T): T;
	subtract<T extends Vector>(value: number | T): Vector | T;
	subtract<T extends Vector>(value: number | T): Vector | T {
		if (typeof value === 'number') {
			return new Vector(this.x - value, this.y - value);
		} else {
			const rtn = value.clone();
			rtn.setXY(this.x - value.x, this.y - value.y);
			return rtn;
		}
	}

	multiply(value: number): Vector;
	multiply<T extends Vector>(value: T): T;
	multiply<T extends Vector>(value: number | T): Vector | T;
	multiply<T extends Vector>(value: number | T): Vector | T {
		if (typeof value === 'number') {
			return new Vector(this.x * value, this.y * value);
		} else {
			const rtn = value.clone();
			rtn.setXY(this.x * value.x, this.y * value.y);
			return rtn;
		}
	}

	divide(value: number): Vector;
	divide<T extends Vector>(value: T): T;
	divide<T extends Vector>(value: number | T): Vector | T;
	divide<T extends Vector>(value: number | T): Vector | T {
		if (typeof value === 'number') {
			return new Vector(this.x / value, this.y / value);
		} else {
			const rtn = value.clone();
			rtn.setXY(this.x / value.x, this.y / value.y);
			return rtn;
		}
	}

	dot(vector: Vector): number {
		return this.x * vector.x + this.y * vector.y;
	}

	distance(vector: Vector): number {
		return Math.sqrt(Math.pow(this.x - vector.x, 2) + Math.pow(this.y - vector.y, 2));
	}

	interpolate<T extends Vector>(other: T, distance: number): T {
		// "this" as the center
		let rtn = other.clone();
		// use trig to find the angle between the two points
		const angle = Math.atan2(rtn.y - this.y, rtn.x - this.x);
		// use the angle to find the x and y components of the vector
		rtn.x = this.x + distance * Math.cos(angle);
		rtn.y = this.y + distance * Math.sin(angle);
		return rtn;
	}

	mirror<T extends Vector>(other: T): T {
		// "this" as the center
		let rtn = other.clone();
		rtn.x = 2 * this.x - other.x;
		rtn.y = 2 * this.y - other.y;
		return rtn;
	}

	setXY(x: number, y: number): void;
	setXY(other: Vector): void;
	setXY(arg0: number | Vector, arg1?: number): void {
		if (arg0 instanceof Vector) {
			this.x = arg0.x;
			this.y = arg0.y;
		} else {
			this.x = arg0;
			this.y = arg1!;
		}
	}

	isWithinArea(from: Vector, to: Vector) {
		return this.x >= from.x && this.x <= to.x && this.y >= from.y && this.y <= to.y;
	}

	clone(): this {
		return new Vector(this.x, this.y) as this;
	}

	toVector(): Vector {
		return new Vector(this.x, this.y);
	}
}
