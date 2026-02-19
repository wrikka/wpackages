import type { PrecisionOptions } from '../types/math.type'
import { DEFAULT_PRECISION, DEFAULT_DECIMAL_PLACES, DEFAULT_ROUNDING_MODE } from '../constants/precision.constants'

/**
 * Rounds a number to specified precision
 */
export function roundToPrecision(
	value: number,
	options: PrecisionOptions = {}
): number {
	const { decimalPlaces = DEFAULT_DECIMAL_PLACES, roundingMode = DEFAULT_ROUNDING_MODE } = options
	
	const factor = Math.pow(10, decimalPlaces)
	const rounded = value * factor
	
	switch (roundingMode) {
		case 'up':
			return Math.ceil(rounded) / factor
		case 'down':
			return Math.floor(rounded) / factor
		case 'nearest':
		default:
			return Math.round(rounded) / factor
	}
}

/**
 * Checks if two numbers are approximately equal within tolerance
 */
export function approximatelyEqual(
	a: number,
	b: number,
	tolerance = DEFAULT_PRECISION
): boolean {
	return Math.abs(a - b) <= tolerance
}

/**
 * Formats number with fixed decimal places
 */
export function formatNumber(
	value: number,
	decimalPlaces = DEFAULT_DECIMAL_PLACES
): string {
	return value.toFixed(decimalPlaces)
}

/**
 * Clamps a number within specified range
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max)
}
