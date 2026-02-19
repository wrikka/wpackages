import type { Numeric } from './math.type'

/**
 * Binary operation function type
 */
export type BinaryOperation<T extends Numeric = Numeric> = (a: T, b: T) => T

/**
 * Unary operation function type
 */
export type UnaryOperation<T extends Numeric = Numeric> = (a: T) => T

/**
 * Operation result with metadata
 */
export interface OperationResult<T extends Numeric = Numeric> {
	value: T
	precision?: number
	operation: string
	timestamp: Date
}

/**
 * Math operation types
 */
export type MathOperation = 
	| 'add'
	| 'subtract'
	| 'multiply'
	| 'divide'
	| 'power'
	| 'modulus'
	| 'sqrt'
	| 'abs'
	| 'round'
	| 'floor'
	| 'ceil'

/**
 * Operation configuration
 */
export interface OperationConfig {
	precision?: number
	validateInputs?: boolean
	throwOnError?: boolean
}
