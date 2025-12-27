import type { Point, Rect } from "../types";
import * as Geometry from "../utils/geometry";
import type { CircleShape } from "./types";

export const getBounds = (shape: CircleShape): Rect => ({
	height: shape.radius * 2,
	width: shape.radius * 2,
	x: shape.position.x - shape.radius,
	y: shape.position.y - shape.radius,
});

export const contains = (shape: CircleShape, point: Point): boolean => {
	const bounds = getBounds(shape);
	return Geometry.containsPoint(bounds, point);
};

export const getCenter = (shape: CircleShape): Point => shape.position;

export const toSVGPath = (shape: CircleShape): string => {
	const { x, y } = shape.position;
	const r = shape.radius;

	return `M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y}`;
};

export const scale = (shape: CircleShape, factor: number): CircleShape => ({
	...shape,
	radius: shape.radius * factor,
});

export const getCircumference = (shape: CircleShape): number => 2 * Math.PI * shape.radius;

export const getArea = (shape: CircleShape): number => Math.PI * shape.radius * shape.radius;
