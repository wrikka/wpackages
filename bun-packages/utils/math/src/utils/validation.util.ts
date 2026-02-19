import type { Numeric } from '../types/math.type'
import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from '../constants/math.constants'

/**
 * Checks if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
	return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
}

/**
 * Checks if a value is numeric (number or bigint)
 */
export function isNumeric(value: unknown): value is Numeric {
	return isValidNumber(value) || typeof value === 'bigint'
}

/**
 * Checks if a number is within safe integer range
 */
export function isSafeInteger(value: number): boolean {
	return Number.isSafeInteger(value) && 
		   value >= MIN_SAFE_INTEGER && 
		   value <= MAX_SAFE_INTEGER
}

/**
 * Validates that all inputs are numbers
 */
export function validateNumbers(...values: unknown[]): asserts values is number[] {
	for (const value of values) {
		if (!isValidNumber(value)) {
			throw new TypeError(`Expected valid number, got ${typeof value}: ${value}`)
		}
	}
}

/**
 * Validates that all inputs are numeric
 */
export function validateNumeric(...values: unknown[]): asserts values is Numeric[] {
	for (const value of values) {
		if (!isNumeric(value)) {
			throw new TypeError(`Expected numeric value, got ${typeof value}: ${value}`)
		}
	}
}

/**
 * Checks if a number is positive
 */
export function isPositive(value: number): boolean {
	return value > 0
}

/**
 * Checks if a number is negative
 */
export function isNegative(value: number): boolean {
	return value < 0
}

/**
 * Checks if a number is zero
 */
export function isZero(value: number, tolerance = 1e-10): boolean {
	return Math.abs(value) <= tolerance
}
