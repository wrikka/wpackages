/**
 * Constants for number utilities
 */

/**
 * Mathematical constants
 */
export const MATH_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  SQRT2: Math.SQRT2,
  SQRT1_2: Math.SQRT1_2,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
} as const

/**
 * Number system bases
 */
export const BASES = {
  BINARY: 2,
  OCTAL: 8,
  DECIMAL: 10,
  HEXADECIMAL: 16,
} as const

/**
 * Common number ranges
 */
export const RANGES = {
  BYTE: { min: 0, max: 255 },
  SIGNED_BYTE: { min: -128, max: 127 },
  SHORT: { min: -32768, max: 32767 },
  UNSIGNED_SHORT: { min: 0, max: 65535 },
  INT: { min: -2147483648, max: 2147483647 },
  UNSIGNED_INT: { min: 0, max: 4294967295 },
  FLOAT: { min: -3.4028235e38, max: 3.4028235e38 },
} as const

/**
 * Default formatting options
 */
export const DEFAULT_FORMATTING = {
  decimals: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_NUMBER: 'Invalid number provided',
  OUT_OF_RANGE: 'Number is out of valid range',
  INVALID_BASE: 'Invalid base provided',
  DIVISION_BY_ZERO: 'Division by zero is not allowed',
  PRECISION_LOSS: 'Precision loss may occur',
} as const
