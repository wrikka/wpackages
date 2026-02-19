/**
 * Numeric types for math operations
 */
export type Numeric = number | bigint

/**
 * Complex number representation
 */
export interface ComplexNumber {
	real: number
	imaginary: number
}

/**
 * Vector representation
 */
export interface Vector2D {
	x: number
	y: number
}

export interface Vector3D {
	x: number
	y: number
	z: number
}

/**
 * Matrix representation
 */
export interface Matrix2D {
	readonly data: readonly readonly [number, number, number, number]
}

export interface Matrix3D {
	readonly data: readonly readonly [
		number, number, number,
		number, number, number,
		number, number, number
	]
}

/**
 * Range types
 */
export interface Range {
	min: number
	max: number
}

/**
 * Precision options
 */
export interface PrecisionOptions {
	decimalPlaces?: number
	roundingMode?: 'up' | 'down' | 'nearest'
}
