/**
 * Core library functions for advanced number operations
 */

import type { Numeric, PrecisionOptions, ConversionOptions } from '../types'
import { BASES, ERROR_MESSAGES } from '../constants'
import { isNumber, isNumeric } from '../utils'

/**
 * Round a number with precision options
 */
export function round(value: number, options: PrecisionOptions = {}): number {
  if (!isNumber(value)) {
    throw new Error(ERROR_MESSAGES.INVALID_NUMBER)
  }

  const { decimalPlaces = 0, roundingMode = 'nearest' } = options
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
 * Convert number between different bases
 */
export function convertBase(value: Numeric, options: ConversionOptions = {}): string {
  if (!isNumeric(value)) {
    throw new Error(ERROR_MESSAGES.INVALID_NUMBER)
  }

  const { fromBase = BASES.DECIMAL, toBase = BASES.HEXADECIMAL, prefix = '' } = options

  if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
    throw new Error(ERROR_MESSAGES.INVALID_BASE)
  }

  let decimalValue: number

  // Convert from source base to decimal
  if (fromBase === BASES.DECIMAL) {
    decimalValue = Number(value)
  } else {
    const stringValue = String(value)
    decimalValue = parseInt(stringValue, fromBase)
    
    if (isNaN(decimalValue)) {
      throw new Error(`Cannot convert ${stringValue} from base ${fromBase}`)
    }
  }

  // Convert from decimal to target base
  if (toBase === BASES.DECIMAL) {
    return prefix + decimalValue.toString()
  }

  return prefix + decimalValue.toString(toBase).toUpperCase()
}

/**
 * Calculate greatest common divisor (GCD)
 */
export function gcd(a: number, b: number): number {
  if (!isNumber(a) || !isNumber(b)) {
    throw new Error(ERROR_MESSAGES.INVALID_NUMBER)
  }

  a = Math.abs(a)
  b = Math.abs(b)

  while (b !== 0) {
    const temp = b
    b = a % b
    a = temp
  }

  return a
}

/**
 * Calculate least common multiple (LCM)
 */
export function lcm(a: number, b: number): number {
  if (!isNumber(a) || !isNumber(b)) {
    throw new Error(ERROR_MESSAGES.INVALID_NUMBER)
  }

  if (a === 0 || b === 0) return 0

  return Math.abs((a * b) / gcd(a, b))
}

/**
 * Check if a number is prime
 */
export function isPrime(n: number): boolean {
  if (!isNumber(n) || n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false

  const sqrt = Math.sqrt(n)
  for (let i = 3; i <= sqrt; i += 2) {
    if (n % i === 0) return false
  }

  return true
}

/**
 * Get prime factors of a number
 */
export function getPrimeFactors(n: number): number[] {
  if (!isNumber(n) || n < 2) return []

  const factors: number[] = []
  let remaining = Math.abs(n)

  // Extract factor 2
  while (remaining % 2 === 0) {
    factors.push(2)
    remaining /= 2
  }

  // Extract odd factors
  for (let i = 3; i <= Math.sqrt(remaining); i += 2) {
    while (remaining % i === 0) {
      factors.push(i)
      remaining /= i
    }
  }

  // If remaining is a prime > 2
  if (remaining > 2) {
    factors.push(remaining)
  }

  return factors
}

/**
 * Calculate factorial
 */
export function factorial(n: number): number {
  if (!isNumber(n) || n < 0) {
    throw new Error('Factorial is only defined for non-negative integers')
  }

  if (n === 0 || n === 1) return 1

  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }

  return result
}
