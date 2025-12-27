/**
 * Gradient types - Pure functional gradients
 */

import type { Point } from "./geometry";

/**
 * Color stop for gradients
 */
export interface ColorStop {
	readonly offset: number; // 0-1
	readonly color: string; // hex or rgba
}

/**
 * Linear gradient
 */
export interface LinearGradient {
	readonly type: "linear";
	readonly start: Point;
	readonly end: Point;
	readonly stops: readonly ColorStop[];
}

/**
 * Radial gradient
 */
export interface RadialGradient {
	readonly type: "radial";
	readonly startCircle: { center: Point; radius: number };
	readonly endCircle: { center: Point; radius: number };
	readonly stops: readonly ColorStop[];
}

/**
 * Conic gradient (cone-shaped)
 */
export interface ConicGradient {
	readonly type: "conic";
	readonly center: Point;
	readonly angle: number; // in radians
	readonly stops: readonly ColorStop[];
}

/**
 * Union type for all gradients
 */
export type Gradient = LinearGradient | RadialGradient | ConicGradient;

// ===== Factory Functions =====

/**
 * Create linear gradient - pure function
 */
export const createLinearGradient = (
	start: Point,
	end: Point,
	stops: readonly ColorStop[],
): LinearGradient => ({
	end,
	start,
	stops,
	type: "linear",
});

/**
 * Create radial gradient - pure function
 */
export const createRadialGradient = (
	startCircle: { center: Point; radius: number },
	endCircle: { center: Point; radius: number },
	stops: readonly ColorStop[],
): RadialGradient => ({
	endCircle,
	startCircle,
	stops,
	type: "radial",
});

/**
 * Create conic gradient - pure function
 */
export const createConicGradient = (
	center: Point,
	angle: number,
	stops: readonly ColorStop[],
): ConicGradient => ({
	angle,
	center,
	stops,
	type: "conic",
});

/**
 * Create color stop - pure function
 */
export const createColorStop = (offset: number, color: string): ColorStop => ({
	color,
	offset: Math.max(0, Math.min(1, offset)),
});

// ===== Gradient Utilities =====

/**
 * Add color stop to gradient - pure function
 */
export const addColorStop = <G extends Gradient>(
	gradient: G,
	stop: ColorStop,
): G => ({
	...gradient,
	stops: [...gradient.stops, stop].sort((a, b) => a.offset - b.offset),
});

/**
 * Remove color stop from gradient - pure function
 */
export const removeColorStop = <G extends Gradient>(
	gradient: G,
	index: number,
): G => ({
	...gradient,
	stops: gradient.stops.filter((_, i) => i !== index),
});

/**
 * Update color stop - pure function
 */
export const updateColorStop = <G extends Gradient>(
	gradient: G,
	index: number,
	stop: ColorStop,
): G => ({
	...gradient,
	stops: gradient.stops.map((s, i) => (i === index ? stop : s)),
});

/**
 * Reverse gradient direction - pure function
 */
export const reverseGradient = <G extends Gradient>(gradient: G): G => {
	if (gradient.type === "linear") {
		return {
			...gradient,
			end: gradient.start,
			start: gradient.end,
			stops: gradient.stops
				.map((s) => ({ ...s, offset: 1 - s.offset }))
				.reverse(),
		} as G;
	}

	if (gradient.type === "radial") {
		return {
			...gradient,
			endCircle: gradient.startCircle,
			startCircle: gradient.endCircle,
			stops: gradient.stops
				.map((s) => ({ ...s, offset: 1 - s.offset }))
				.reverse(),
		} as G;
	}

	// Conic
	return {
		...gradient,
		angle: gradient.angle + Math.PI,
		stops: gradient.stops
			.map((s) => ({ ...s, offset: 1 - s.offset }))
			.reverse(),
	} as G;
};

/**
 * Apply gradient to canvas context - side effect
 */
export const applyGradientToContext = (
	ctx: CanvasRenderingContext2D,
	gradient: Gradient,
): CanvasGradient => {
	let canvasGradient: CanvasGradient;

	if (gradient.type === "linear") {
		canvasGradient = ctx.createLinearGradient(
			gradient.start.x,
			gradient.start.y,
			gradient.end.x,
			gradient.end.y,
		);
	} else if (gradient.type === "radial") {
		canvasGradient = ctx.createRadialGradient(
			gradient.startCircle.center.x,
			gradient.startCircle.center.y,
			gradient.startCircle.radius,
			gradient.endCircle.center.x,
			gradient.endCircle.center.y,
			gradient.endCircle.radius,
		);
	} else {
		// Conic gradient
		canvasGradient = ctx.createConicGradient(
			gradient.angle,
			gradient.center.x,
			gradient.center.y,
		);
	}

	for (const stop of gradient.stops) {
		canvasGradient.addColorStop(stop.offset, stop.color);
	}

	return canvasGradient;
};

// ===== Predefined Gradients =====

/**
 * Create rainbow gradient - pure function
 */
export const createRainbowGradient = (
	start: Point,
	end: Point,
): LinearGradient =>
	createLinearGradient(start, end, [
		createColorStop(0, "#ff0000"), // Red
		createColorStop(0.166, "#ff7f00"), // Orange
		createColorStop(0.333, "#ffff00"), // Yellow
		createColorStop(0.5, "#00ff00"), // Green
		createColorStop(0.666, "#0000ff"), // Blue
		createColorStop(0.833, "#4b0082"), // Indigo
		createColorStop(1, "#9400d3"), // Violet
	]);

/**
 * Create sunset gradient - pure function
 */
export const createSunsetGradient = (
	start: Point,
	end: Point,
): LinearGradient =>
	createLinearGradient(start, end, [
		createColorStop(0, "#ff512f"),
		createColorStop(0.5, "#dd2476"),
		createColorStop(1, "#f953c6"),
	]);

/**
 * Create ocean gradient - pure function
 */
export const createOceanGradient = (start: Point, end: Point): LinearGradient =>
	createLinearGradient(start, end, [
		createColorStop(0, "#2e3192"),
		createColorStop(0.5, "#1bffff"),
		createColorStop(1, "#2e3192"),
	]);

/**
 * Create metal gradient - pure function
 */
export const createMetalGradient = (start: Point, end: Point): LinearGradient =>
	createLinearGradient(start, end, [
		createColorStop(0, "#434343"),
		createColorStop(0.25, "#9f9f9f"),
		createColorStop(0.5, "#ffffff"),
		createColorStop(0.75, "#9f9f9f"),
		createColorStop(1, "#434343"),
	]);

/**
 * Create fire gradient - pure function
 */
export const createFireGradient = (
	center: Point,
	startRadius: number,
	endRadius: number,
): RadialGradient =>
	createRadialGradient(
		{ center, radius: startRadius },
		{ center, radius: endRadius },
		[
			createColorStop(0, "#ffff00"), // Yellow center
			createColorStop(0.3, "#ff7f00"), // Orange
			createColorStop(0.7, "#ff0000"), // Red
			createColorStop(1, "#8b0000"), // Dark red edge
		],
	);
