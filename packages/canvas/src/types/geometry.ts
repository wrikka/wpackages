// Point types
export interface Point {
	readonly x: number;
	readonly y: number;
}

export interface Point3D {
	readonly x: number;
	readonly y: number;
	readonly z: number;
}

// ===== Factory Functions =====
export const createPoint = (x: number, y: number): Point => ({ x, y });

export const createPoint3D = (x: number, y: number, z: number): Point3D => ({
	x,
	y,
	z,
});

// Size and Rect types
export interface Size {
	readonly width: number;
	readonly height: number;
}

export interface Rect {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
}

export interface BoundingBox {
	readonly topLeft: Point;
	readonly bottomRight: Point;
}

export interface AABB {
	readonly min: Point;
	readonly max: Point;
}

export const createSize = (width: number, height: number): Size => ({
	height: Math.max(0, height),
	width: Math.max(0, width),
});

export const createRect = (
	x: number,
	y: number,
	width: number,
	height: number,
): Rect => ({
	height: Math.max(0, height),
	width: Math.max(0, width),
	x,
	y,
});

// Transform types
export interface Transform {
	readonly translate: Point;
	readonly scale: number;
	readonly rotate: number;
}

export type Matrix2D = readonly [
	number,
	number,
	number,
	number,
	number,
	number,
];

export interface TransformMatrix {
	readonly a: number;
	readonly b: number;
	readonly c: number;
	readonly d: number;
	readonly e: number;
	readonly f: number;
}
