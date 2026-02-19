/**
 * Core type definitions for number utilities
 */

/**
 * Basic numeric types
 */
export type Numeric = number | bigint

/**
 * Number format options
 */
export interface NumberFormatOptions {
  decimals?: number
  thousandsSeparator?: string
  decimalSeparator?: string
}

/**
 * Range validation options
 */
export interface RangeOptions {
  min?: number
  max?: number
  inclusive?: boolean
}

/**
 * Precision options for calculations
 */
export interface PrecisionOptions {
  decimalPlaces?: number
  roundingMode?: 'up' | 'down' | 'nearest'
}

/**
 * Number validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Number conversion options
 */
export interface ConversionOptions {
  fromBase?: number
  toBase?: number
  prefix?: string
}
