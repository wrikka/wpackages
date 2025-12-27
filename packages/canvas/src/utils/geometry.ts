import type { Point, Rect, Transform, TransformMatrix } from "../types";

// ===== Point Utils =====
export const createPoint = (x: number, y: number): Point => ({ x, y });

export const add = (a: Point, b: Point): Point => ({
	x: a.x + b.x,
	y: a.y + b.y,
});

export const subtract = (a: Point, b: Point): Point => ({
	x: a.x - b.x,
	y: a.y - b.y,
});

export const multiply = (p: Point, scalar: number): Point => ({
	x: p.x * scalar,
	y: p.y * scalar,
});

export const divide = (p: Point, scalar: number): Point => ({
	x: p.x / scalar,
	y: p.y / scalar,
});

export const distance = (a: Point, b: Point): number => {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	return Math.sqrt(dx * dx + dy * dy);
};

export const dotProduct = (a: Point, b: Point): number => a.x * b.x + a.y * b.y;

export const normalize = (p: Point): Point => {
	const len = Math.sqrt(p.x * p.x + p.y * p.y);
	return len === 0 ? p : divide(p, len);
};

export const lerp = (a: Point, b: Point, t: number): Point => ({
	x: a.x + (b.x - a.x) * t,
	y: a.y + (b.y - a.y) * t,
});

export const equals = (a: Point, b: Point, epsilon = 1e-10): boolean =>
	Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon;

export const roundPoint = (p: Point): Point => ({
	x: Math.round(p.x),
	y: Math.round(p.y),
});

export const floorPoint = (p: Point): Point => ({
	x: Math.floor(p.x),
	y: Math.floor(p.y),
});

export const ceilPoint = (p: Point): Point => ({
	x: Math.ceil(p.x),
	y: Math.ceil(p.y),
});

export const clampPoint = (p: Point, min: Point, max: Point): Point => ({
	x: Math.max(min.x, Math.min(max.x, p.x)),
	y: Math.max(min.y, Math.min(max.y, p.y)),
});

export const rotate = (
	p: Point,
	angle: number,
	origin: Point = { x: 0, y: 0 },
): Point => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const dx = p.x - origin.x;
	const dy = p.y - origin.y;

	return {
		x: origin.x + dx * cos - dy * sin,
		y: origin.y + dx * sin + dy * cos,
	};
};

// ===== Rect Utils =====
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

export const containsPoint = (rect: Rect, point: Point): boolean =>
	point.x >= rect.x
	&& point.x <= rect.x + rect.width
	&& point.y >= rect.y
	&& point.y <= rect.y + rect.height;

export const intersects = (a: Rect, b: Rect): boolean =>
	a.x < b.x + b.width
	&& a.x + a.width > b.x
	&& a.y < b.y + b.height
	&& a.y + a.height > b.y;

export const union = (a: Rect, b: Rect): Rect => {
	const x = Math.min(a.x, b.x);
	const y = Math.min(a.y, b.y);
	const width = Math.max(a.x + a.width, b.x + b.width) - x;
	const height = Math.max(a.y + a.height, b.y + b.height) - y;

	return { height, width, x, y };
};

export const center = (rect: Rect): Point => ({
	x: rect.x + rect.width / 2,
	y: rect.y + rect.height / 2,
});

export const expandRect = (rect: Rect, amount: number): Rect => ({
	height: rect.height + amount * 2,
	width: rect.width + amount * 2,
	x: rect.x - amount,
	y: rect.y - amount,
});

export const scaleRect = (rect: Rect, factor: number): Rect => ({
	height: rect.height * factor,
	width: rect.width * factor,
	x: rect.x * factor,
	y: rect.y * factor,
});

export const fromPoints = (a: Point, b: Point): Rect => {
	const x = Math.min(a.x, b.x);
	const y = Math.min(a.y, b.y);
	const width = Math.abs(b.x - a.x);
	const height = Math.abs(b.y - a.y);
	return { height, width, x, y };
};

export const toBoundingBox = (rect: Rect): import("../types").BoundingBox => ({
	bottomRight: { x: rect.x + rect.width, y: rect.y + rect.height },
	topLeft: { x: rect.x, y: rect.y },
});

export const toAABB = (rect: Rect): import("../types").AABB => ({
	max: { x: rect.x + rect.width, y: rect.y + rect.height },
	min: { x: rect.x, y: rect.y },
});

export const fromBoundingBox = (
	bbox: import("../types").BoundingBox,
): Rect => ({
	height: bbox.bottomRight.y - bbox.topLeft.y,
	width: bbox.bottomRight.x - bbox.topLeft.x,
	x: bbox.topLeft.x,
	y: bbox.topLeft.y,
});

export const intersectionRect = (a: Rect, b: Rect): Rect | null => {
	const x = Math.max(a.x, b.x);
	const y = Math.max(a.y, b.y);
	const width = Math.min(a.x + a.width, b.x + b.width) - x;
	const height = Math.min(a.y + a.height, b.y + b.height) - y;
	return width > 0 && height > 0 ? { height, width, x, y } : null;
};

// ===== Transform Utils =====
export const createTransform = (
	translate: Point,
	scale: number,
	rotate: number,
): Transform => ({
	rotate,
	scale: Math.max(0.001, scale),
	translate,
});

export const applyTransform = (point: Point, transform: Transform): Point => {
	let p = point;
	p = multiply(p, transform.scale);
	p = rotate(p, transform.rotate);
	p = add(p, transform.translate);
	return p;
};

export const composeTransform = (a: Transform, b: Transform): Transform => ({
	rotate: a.rotate + b.rotate,
	scale: a.scale * b.scale,
	translate: add(multiply(b.translate, a.scale), a.translate),
});

export const inverseTransform = (transform: Transform): Transform => ({
	rotate: -transform.rotate,
	scale: 1 / transform.scale,
	translate: multiply(transform.translate, -1 / transform.scale),
});

export const toMatrix = (transform: Transform): TransformMatrix => {
	const cos = Math.cos(transform.rotate);
	const sin = Math.sin(transform.rotate);
	const s = transform.scale;

	return {
		a: s * cos,
		b: s * sin,
		c: -s * sin,
		d: s * cos,
		e: transform.translate.x,
		f: transform.translate.y,
	};
};

export const fromMatrix = (matrix: TransformMatrix): Transform => {
	const scale = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
	const rotate = Math.atan2(matrix.b, matrix.a);

	return {
		rotate,
		scale,
		translate: { x: matrix.e, y: matrix.f },
	};
};

export const applyToMatrix = (
	point: Point,
	matrix: TransformMatrix,
): Point => ({
	x: point.x * matrix.a + point.y * matrix.c + matrix.e,
	y: point.x * matrix.b + point.y * matrix.d + matrix.f,
});

export const composeMatrix = (
	a: TransformMatrix,
	b: TransformMatrix,
): TransformMatrix => ({
	a: a.a * b.a + a.c * b.b,
	b: a.b * b.a + a.d * b.b,
	c: a.a * b.c + a.c * b.d,
	d: a.b * b.c + a.d * b.d,
	e: a.a * b.e + a.c * b.f + a.e,
	f: a.b * b.e + a.d * b.f + a.f,
});

export const inverseMatrix = (matrix: TransformMatrix): TransformMatrix => {
	const det = matrix.a * matrix.d - matrix.b * matrix.c;

	return {
		a: matrix.d / det,
		b: -matrix.b / det,
		c: -matrix.c / det,
		d: matrix.a / det,
		e: (matrix.c * matrix.f - matrix.d * matrix.e) / det,
		f: (matrix.b * matrix.e - matrix.a * matrix.f) / det,
	};
};
