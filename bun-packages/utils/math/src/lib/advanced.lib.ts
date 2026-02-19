import type { ComplexNumber, Vector2D, Vector3D, Matrix2D, Matrix3D } from '../types/math.type'
import { validateNumbers } from '../utils/validation.util'

/**
 * Complex number operations
 */

export function createComplexNumber(real: number, imaginary: number): ComplexNumber {
	return { real, imaginary }
}

export function addComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
	return {
		real: a.real + b.real,
		imaginary: a.imaginary + b.imaginary
	}
}

export function multiplyComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
	return {
		real: a.real * b.real - a.imaginary * b.imaginary,
		imaginary: a.real * b.imaginary + a.imaginary * b.real
	}
}

export function complexMagnitude(complex: ComplexNumber): number {
	return Math.sqrt(complex.real * complex.real + complex.imaginary * complex.imaginary)
}

/**
 * Vector operations
 */

export function createVector2D(x: number, y: number): Vector2D {
	return { x, y }
}

export function createVector3D(x: number, y: number, z: number): Vector3D {
	return { x, y, z }
}

export function addVector2D(a: Vector2D, b: Vector2D): Vector2D {
	return { x: a.x + b.x, y: a.y + b.y }
}

export function subtractVector2D(a: Vector2D, b: Vector2D): Vector2D {
	return { x: a.x - b.x, y: a.y - b.y }
}

export function dotProduct2D(a: Vector2D, b: Vector2D): number {
	return a.x * b.x + a.y * b.y
}

export function crossProduct2D(a: Vector2D, b: Vector2D): number {
	return a.x * b.y - a.y * b.x
}

export function vectorMagnitude2D(vector: Vector2D): number {
	return Math.sqrt(vector.x * vector.x + vector.y * vector.y)
}

export function normalizeVector2D(vector: Vector2D): Vector2D {
	const magnitude = vectorMagnitude2D(vector)
	if (magnitude === 0) {
		throw new Error('Cannot normalize zero vector')
	}
	return { x: vector.x / magnitude, y: vector.y / magnitude }
}

/**
 * Matrix operations
 */

export function createMatrix2D(a: number, b: number, c: number, d: number): Matrix2D {
	return { data: [a, b, c, d] as const }
}

export function addMatrix2D(a: Matrix2D, b: Matrix2D): Matrix2D {
	return {
		data: [
			a.data[0] + b.data[0],
			a.data[1] + b.data[1],
			a.data[2] + b.data[2],
			a.data[3] + b.data[3]
		] as const
	}
}

export function multiplyMatrix2D(a: Matrix2D, b: Matrix2D): Matrix2D {
	return {
		data: [
			a.data[0] * b.data[0] + a.data[1] * b.data[2],
			a.data[0] * b.data[1] + a.data[1] * b.data[3],
			a.data[2] * b.data[0] + a.data[3] * b.data[2],
			a.data[2] * b.data[1] + a.data[3] * b.data[3]
		] as const
	}
}

export function matrixDeterminant2D(matrix: Matrix2D): number {
	return matrix.data[0] * matrix.data[3] - matrix.data[1] * matrix.data[2]
}

/**
 * Trigonometric functions
 */

export function sin(angle: number): number {
	validateNumbers(angle)
	return Math.sin(angle)
}

export function cos(angle: number): number {
	validateNumbers(angle)
	return Math.cos(angle)
}

export function tan(angle: number): number {
	validateNumbers(angle)
	return Math.tan(angle)
}

export function asin(value: number): number {
	validateNumbers(value)
	if (value < -1 || value > 1) {
		throw new Error('asin input must be between -1 and 1')
	}
	return Math.asin(value)
}

export function acos(value: number): number {
	validateNumbers(value)
	if (value < -1 || value > 1) {
		throw new Error('acos input must be between -1 and 1')
	}
	return Math.acos(value)
}

export function atan(value: number): number {
	validateNumbers(value)
	return Math.atan(value)
}

export function atan2(y: number, x: number): number {
	validateNumbers(y, x)
	return Math.atan2(y, x)
}
