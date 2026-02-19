/**
 * Custom error classes for number utilities
 */

/**
 * Base error class for number utilities
 */
export class NumberError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message)
    this.name = 'NumberError'
  }
}

/**
 * Error thrown when number validation fails
 */
export class ValidationError extends NumberError {
  constructor(message: string, public readonly errors: string[]) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

/**
 * Error thrown when number is out of valid range
 */
export class RangeError extends NumberError {
  constructor(message: string, public readonly min?: number, public readonly max?: number) {
    super(message, 'RANGE_ERROR')
    this.name = 'RangeError'
  }
}

/**
 * Error thrown when base conversion fails
 */
export class BaseConversionError extends NumberError {
  constructor(message: string, public readonly fromBase?: number, public readonly toBase?: number) {
    super(message, 'BASE_CONVERSION_ERROR')
    this.name = 'BaseConversionError'
  }
}

/**
 * Error thrown when mathematical operation fails
 */
export class MathError extends NumberError {
  constructor(message: string, public readonly operation?: string) {
    super(message, 'MATH_ERROR')
    this.name = 'MathError'
  }
}
