import type { Point, Rect } from "../types";
import * as Geometry from "../utils/geometry";
import type { PathShape } from "./types";

export const getBounds = (shape: PathShape): Rect => {
	if (shape.points.length === 0) {
		return { height: 0, width: 0, x: 0, y: 0 };
	}

	const xs = shape.points.map((p) => p.x);
	const ys = shape.points.map((p) => p.y);

	const minX = Math.min(...xs);
	const minY = Math.min(...ys);
	const maxX = Math.max(...xs);
	const maxY = Math.max(...ys);

	return {
		height: maxY - minY,
		width: maxX - minX,
		x: minX,
		y: minY,
	};
};

export const contains = (
	shape: PathShape,
	point: Point,
	threshold = 5,
): boolean => {
	for (let i = 0; i < shape.points.length - 1; i++) {
		const start = shape.points[i]!;
		const end = shape.points[i + 1]!;
		const lineLength = Geometry.distance(start, end);

		if (lineLength === 0) continue;

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

		if (Geometry.distance(point, projection) <= threshold) {
			return true;
		}
	}

	return false;
};

export const getCenter = (shape: PathShape): Point => {
	if (shape.points.length === 0) {
		return { x: 0, y: 0 };
	}

	const sum = shape.points.reduce(
		(acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
		{ x: 0, y: 0 },
	);

	return {
		x: sum.x / shape.points.length,
		y: sum.y / shape.points.length,
	};
};

export const toSVGPath = (shape: PathShape): string => {
	if (shape.points.length === 0) return "";

	const first = shape.points[0]!;
	let path = `M ${first.x} ${first.y}`;

	if (shape.smooth && shape.points.length > 2) {
		for (let i = 1; i < shape.points.length - 1; i++) {
			const p0 = shape.points[i - 1]!;
			const p1 = shape.points[i]!;
			const p2 = shape.points[i + 1]!;

			const cp1x = p1.x + (p2.x - p0.x) / 6;
			const cp1y = p1.y + (p2.y - p0.y) / 6;

			path += ` Q ${cp1x} ${cp1y} ${p1.x} ${p1.y}`;
		}

		const last = shape.points[shape.points.length - 1]!;
		path += ` L ${last.x} ${last.y}`;
	} else {
		for (let i = 1; i < shape.points.length; i++) {
			const p = shape.points[i]!;
			path += ` L ${p.x} ${p.y}`;
		}
	}

	if (shape.closed) {
		path += " Z";
	}

	return path;
};

export const simplify = (shape: PathShape, tolerance = 2): PathShape => {
	if (shape.points.length <= 2) return shape;

	const simplified = ramerDouglasPeucker([...shape.points], tolerance);

	return {
		...shape,
		points: simplified,
	};
};

const ramerDouglasPeucker = (points: Point[], tolerance: number): Point[] => {
	if (points.length <= 2) return points;

	let maxDistance = 0;
	let maxIndex = 0;
	const end = points.length - 1;

	for (let i = 1; i < end; i++) {
		const distance = perpendicularDistance(
			points[i]!,
			points[0]!,
			points[end]!,
		);
		if (distance > maxDistance) {
			maxDistance = distance;
			maxIndex = i;
		}
	}

	if (maxDistance > tolerance) {
		const left = ramerDouglasPeucker(points.slice(0, maxIndex + 1), tolerance);
		const right = ramerDouglasPeucker(points.slice(maxIndex), tolerance);

		return [...left.slice(0, -1), ...right];
	}

	return [points[0]!, points[end]!];
};

const perpendicularDistance = (
	point: Point,
	lineStart: Point,
	lineEnd: Point,
): number => {
	const dx = lineEnd.x - lineStart.x;
	const dy = lineEnd.y - lineStart.y;

	if (dx === 0 && dy === 0) {
		return Geometry.distance(point, lineStart);
	}

	const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy)
		/ (dx * dx + dy * dy);

	if (t < 0) {
		return Geometry.distance(point, lineStart);
	}
	if (t > 1) {
		return Geometry.distance(point, lineEnd);
	}

	const projection = {
		x: lineStart.x + t * dx,
		y: lineStart.y + t * dy,
	};

	return Geometry.distance(point, projection);
};
