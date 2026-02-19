import { DEG_TO_RAD, RAD_TO_DEG } from '../constants/math.constants'

/**
 * Converts degrees to radians
 */
export function degreesToRadians(degrees: number): number {
	return degrees * DEG_TO_RAD
}

/**
 * Converts radians to degrees
 */
export function radiansToDegrees(radians: number): number {
	return radians * RAD_TO_DEG
}

/**
 * Converts polar coordinates to cartesian
 */
export function polarToCartesian(radius: number, angle: number): { x: number; y: number } {
	const radians = degreesToRadians(angle)
	return {
		x: radius * Math.cos(radians),
		y: radius * Math.sin(radians)
	}
}

/**
 * Converts cartesian coordinates to polar
 */
export function cartesianToPolar(x: number, y: number): { radius: number; angle: number } {
	const radius = Math.sqrt(x * x + y * y)
	const angle = radiansToDegrees(Math.atan2(y, x))
	return { radius, angle }
}

/**
 * Converts number to scientific notation string
 */
export function toScientificNotation(value: number, precision = 2): string {
	return value.toExponential(precision)
}

/**
 * Converts string in scientific notation to number
 */
export function fromScientificNotation(value: string): number {
	return parseFloat(value)
}
