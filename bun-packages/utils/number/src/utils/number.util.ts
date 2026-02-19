/**
 * Core number utility functions
 */

import type { Numeric, NumberFormatOptions, RangeOptions, ValidationResult } from '../types'
import { ERROR_MESSAGES } from '../constants'

/**
 * Check if a value is a valid number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Check if a value is numeric (number or bigint)
 */
export function isNumeric(value: unknown): value is Numeric {
  return isNumber(value) || typeof value === 'bigint' || (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '')
}

/**
 * Validate a number against options
 */
export function validateNumber(value: unknown, options: RangeOptions = {}): ValidationResult {
  const errors: string[] = []

  if (!isNumber(value)) {
    errors.push(ERROR_MESSAGES.INVALID_NUMBER)
    return { isValid: false, errors }
  }

  const { min, max, inclusive = true } = options

  if (min !== undefined) {
    if (inclusive ? value < min : value <= min) {
      errors.push(`Number must be ${inclusive ? '>=' : '>'} ${min}`)
    }
  }

  if (max !== undefined) {
    if (inclusive ? value > max : value >= max) {
      errors.push(`Number must be ${inclusive ? '<=' : '<'} ${max}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Format a number with specified options
 */
export function formatNumber(
  value: number,
  options: NumberFormatOptions = {}
): string {
  if (!isNumber(value)) {
    throw new Error(ERROR_MESSAGES.INVALID_NUMBER)
  }

  const {
    decimals = 2,
    thousandsSeparator = ',',
    decimalSeparator = '.',
  } = options

  const rounded = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
  const parts = rounded.toString().split('.')

  let integerPart = parts[0] || '0'
  const decimalPart = parts[1] ? parts[1].padEnd(decimals, '0').slice(0, decimals) : '0'.repeat(decimals)

  // Add thousands separator
  if (thousandsSeparator && integerPart.length > 3) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
  }

  return decimals > 0 ? `${integerPart}${decimalSeparator}${decimalPart}` : integerPart
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Convert a string to number with error handling
 */
export function toNumber(value: string, defaultValue = 0): number {
  const parsed = Number(value)
  return isNumber(parsed) ? parsed : defaultValue
}

/**
 * Generate a random number between min and max (inclusive)
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number, decimals = 2): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100 * Math.pow(10, decimals)) / Math.pow(10, decimals)
}
