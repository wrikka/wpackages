/**
 * Pure functions for SVG path generation
 */

import type { Point } from "../types";

/**
 * Format SVG path string by trimming and normalizing whitespace
 * @param path - Raw SVG path string
 * @returns Formatted SVG path string
 */
export const formatSVGPath = (path: string): string =>
	path.trim().replace(/\s+/g, " ");

/**
 * Create SVG line path between two points
 * @param start - Start point
 * @param end - End point
 * @returns SVG path string
 */
export const createLinePath = (start: Point, end: Point): string =>
	`M ${start.x} ${start.y} L ${end.x} ${end.y}`;

/**
 * Create SVG arc path for circle
 * @param center - Center point
 * @param radius - Circle radius
 * @returns SVG path string
 */
export const createCirclePath = (center: Point, radius: number): string => {
	const { x, y } = center;
	const r = radius;
	return `M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y}`;
};

/**
 * Create SVG rectangle path with optional corner radius
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Rectangle width
 * @param height - Rectangle height
 * @param cornerRadius - Optional corner radius
 * @returns SVG path string
 */
export const createRectanglePath = (
	x: number,
	y: number,
	width: number,
	height: number,
	cornerRadius?: number,
): string => {
	const r = cornerRadius ?? 0;

	if (r === 0) {
		return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
	}

	return formatSVGPath(`
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
  `);
};

/**
 * Create SVG arrow head points
 * @param tip - Tip point
 * @param angle - Arrow angle
 * @param size - Arrow head size
 * @returns Array of three points [tip, left, right]
 */
export const createArrowHeadPoints = (
	tip: Point,
	angle: number,
	size: number,
): [Point, Point, Point] => {
	const left = {
		x: tip.x + size * Math.cos(angle + Math.PI / 6),
		y: tip.y + size * Math.sin(angle + Math.PI / 6),
	};

	const right = {
		x: tip.x + size * Math.cos(angle - Math.PI / 6),
		y: tip.y + size * Math.sin(angle - Math.PI / 6),
	};

	return [tip, left, right];
};

/**
 * Create SVG arrow path from arrow head points
 * @param tip - Tip point
 * @param left - Left point
 * @param right - Right point
 * @returns SVG path string
 */
export const createArrowPath = (
	tip: Point,
	left: Point,
	right: Point,
): string => `M ${left.x} ${left.y} L ${tip.x} ${tip.y} L ${right.x} ${right.y}`;
