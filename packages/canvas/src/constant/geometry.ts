/**
 * Geometry constants
 */

/**
 * Arrow head size constant
 */
export const DEFAULT_ARROW_HEAD_SIZE = 15 as const;

/**
 * Line point detection threshold
 */
export const LINE_DETECTION_THRESHOLD = 5 as const;

/**
 * Epsilon for floating point comparisons
 */
export const EPSILON = 1e-10 as const;

/**
 * Math constants
 */
export const MATH_CONSTANTS = {
	PI: Math.PI,
	PI_2: Math.PI / 2,
	PI_6: Math.PI / 6,
	TWO_PI: Math.PI * 2,
} as const;
