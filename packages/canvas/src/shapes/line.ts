import type { Point, Rect } from "../types";
import * as Geometry from "../utils/geometry";
import type { LineShape } from "./types";

export const getBounds = (shape: LineShape): Rect => {
	const minX = Math.min(shape.start.x, shape.end.x);
	const minY = Math.min(shape.start.y, shape.end.y);
	const maxX = Math.max(shape.start.x, shape.end.x);
	const maxY = Math.max(shape.start.y, shape.end.y);

	return {
		height: maxY - minY,
		width: maxX - minX,
		x: minX,
		y: minY,
	};
};

export const contains = (
	shape: LineShape,
	point: Point,
	threshold = 5,
): boolean => {
	const dist = distanceToPoint(shape, point);
	return dist <= threshold;
};

export const distanceToPoint = (shape: LineShape, point: Point): number => {
	const { start, end } = shape;
	const lineLength = Geometry.distance(start, end);

	if (lineLength === 0) {
		return Geometry.distance(start, point);
	}

	const t = Math.max(
		0,
		Math.min(
			1,
			Geometry.dotProduct(
				Geometry.subtract(point, start),
				Geometry.subtract(end, start),
			)
				/ (lineLength * lineLength),
		),
	);

	const projection = {
		x: start.x + t * (end.x - start.x),
		y: start.y + t * (end.y - start.y),
	};

	return Geometry.distance(point, projection);
};

export const getCenter = (shape: LineShape): Point => ({
	x: (shape.start.x + shape.end.x) / 2,
	y: (shape.start.y + shape.end.y) / 2,
});

export const toSVGPath = (shape: LineShape): string => {
	const { start, end } = shape;
	return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
};

export const getLength = (shape: LineShape): number => Geometry.distance(shape.start, shape.end);

export const getAngle = (shape: LineShape): number =>
	Math.atan2(shape.end.y - shape.start.y, shape.end.x - shape.start.x);

export const scale = (
	shape: LineShape,
	factor: number,
	origin: Point,
): LineShape => {
	const start = Geometry.add(
		Geometry.multiply(Geometry.subtract(shape.start, origin), factor),
		origin,
	);
	const end = Geometry.add(
		Geometry.multiply(Geometry.subtract(shape.end, origin), factor),
		origin,
	);

	return { ...shape, end, start };
};
