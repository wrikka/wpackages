/**
 * Default configuration values
 */

/**
 * Default canvas configuration
 */
export const CANVAS_DEFAULTS = {
	width: 800,
	height: 600,
	backgroundColor: "#ffffff",
	gridSize: 20,
	snapToGrid: true,
} as const;

/**
 * Default rendering configuration
 */
export const RENDER_DEFAULTS = {
	antiAlias: true,
	pixelRatio: 1,
	clearBeforeRender: true,
} as const;

/**
 * Default shape configuration
 */
export const SHAPE_DEFAULTS = {
	fillColor: "#000000",
	strokeColor: "#000000",
	strokeWidth: 1,
	opacity: 1,
	zIndex: 0,
} as const;

/**
 * Default animation configuration
 */
export const ANIMATION_DEFAULTS = {
	duration: 300, // milliseconds
	delay: 0,
	loop: false,
	yoyo: false,
} as const;

/**
 * Default export configuration
 */
export const EXPORT_DEFAULTS = {
	format: "png" as const,
	quality: 0.95,
	scale: 1,
} as const;
