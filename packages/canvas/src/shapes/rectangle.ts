import type { Point, Rect } from "../types";
import * as Geometry from "../utils/geometry";
import type { RectangleShape } from "./types";

export const getBounds = (shape: RectangleShape): Rect => ({
	height: shape.size.height,
	width: shape.size.width,
	x: shape.position.x,
	y: shape.position.y,
});

export const contains = (shape: RectangleShape, point: Point): boolean => {
	const bounds = getBounds(shape);
	return Geometry.containsPoint(bounds, point);
};

export const getCenter = (shape: RectangleShape): Point => ({
	x: shape.position.x + shape.size.width / 2,
	y: shape.position.y + shape.size.height / 2,
});

export const getCorners = (
	shape: RectangleShape,
): [Point, Point, Point, Point] => {
	const { x, y } = shape.position;
	const { width, height } = shape.size;

	return [
		{ x, y },
		{ x: x + width, y },
		{ x: x + width, y: y + height },
		{ x, y: y + height },
	];
};

export const toSVGPath = (shape: RectangleShape): string => {
	const { x, y } = shape.position;
	const { width, height } = shape.size;
	const r = shape.cornerRadius ?? 0;

	if (r === 0) {
		return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
	}

	return `
    M ${x + r} ${y}
    L ${x + width - r} ${y}
    Q ${x + width} ${y} ${x + width} ${y + r}
    L ${x + width} ${y + height - r}
    Q ${x + width} ${y + height} ${x + width - r} ${y + height}
    L ${x + r} ${y + height}
    Q ${x} ${y + height} ${x} ${y + height - r}
    L ${x} ${y + r}
    Q ${x} ${y} ${x + r} ${y}
    Z
  `
		.trim()
		.replace(/\s+/g, " ");
};

export const scale = (
	shape: RectangleShape,
	factor: number,
): RectangleShape => ({
	...shape,
	...(shape.cornerRadius && {
		cornerRadius: shape.cornerRadius * factor,
	}),
	size: {
		height: shape.size.height * factor,
		width: shape.size.width * factor,
	},
});
