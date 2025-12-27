/**
 * Pure functions for bounds calculation
 */

import type { Point, Rect } from "../types";

/**
 * Calculate bounding box from array of points
 * @param points - Array of points
 * @returns Bounding rectangle
 */
export const calculateBoundsFromPoints = (points: readonly Point[]): Rect => {
	if (points.length === 0) {
		return { height: 0, width: 0, x: 0, y: 0 };
	}

	const xs = points.map((p) => p.x);
	const ys = points.map((p) => p.y);

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

/**
 * Calculate bounding box from two points (line)
 * @param start - Start point
 * @param end - End point
 * @returns Bounding rectangle
 */
export const calculateBoundsFromLine = (start: Point, end: Point): Rect => {
	const minX = Math.min(start.x, end.x);
	const minY = Math.min(start.y, end.y);
	const maxX = Math.max(start.x, end.x);
	const maxY = Math.max(start.y, end.y);

	return {
		height: maxY - minY,
		width: maxX - minX,
		x: minX,
		y: minY,
	};
};

/**
 * Calculate bounding box for circle
 * @param center - Center point
 * @param radius - Circle radius
 * @returns Bounding rectangle
 */
export const calculateBoundsFromCircle = (center: Point, radius: number): Rect => ({
	height: radius * 2,
	width: radius * 2,
	x: center.x - radius,
	y: center.y - radius,
});

/**
 * Calculate bounding box for rectangle
 * @param position - Top-left position
 * @param width - Rectangle width
 * @param height - Rectangle height
 * @returns Bounding rectangle
 */
export const calculateBoundsFromRectangle = (
	position: Point,
	width: number,
	height: number,
): Rect => ({
	height,
	width,
	x: position.x,
	y: position.y,
});
