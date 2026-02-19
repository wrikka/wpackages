/**
 * Tests for number utilities
 */

import { describe, it, expect } from 'bun:test'
import {
  isNumber,
  isNumeric,
  validateNumber,
  formatNumber,
  clamp,
  toNumber,
  randomBetween,
  percentage,
  round,
  convertBase,
  gcd,
  lcm,
  isPrime,
  getPrimeFactors,
  factorial,
} from '../src'

describe('Number Validation', () => {
  it('should check if value is a number', () => {
    expect(isNumber(42)).toBe(true)
    expect(isNumber(3.14)).toBe(true)
    expect(isNumber(NaN)).toBe(false)
    expect(isNumber(Infinity)).toBe(false)
    expect(isNumber('42')).toBe(false)
    expect(isNumber(null)).toBe(false)
    expect(isNumber(undefined)).toBe(false)
  })

  it('should check if value is numeric', () => {
    expect(isNumeric(42)).toBe(true)
    expect(isNumeric(42n)).toBe(true)
    expect(isNumeric('42')).toBe(true)
    expect(isNumeric('invalid')).toBe(false)
    expect(isNumeric(null)).toBe(false)
  })

  it('should validate numbers with range options', () => {
    const validResult = validateNumber(50, { min: 1, max: 100 })
    expect(validResult.isValid).toBe(true)
    expect(validResult.errors).toHaveLength(0)

    const invalidResult = validateNumber(150, { min: 1, max: 100 })
    expect(invalidResult.isValid).toBe(false)
    expect(invalidResult.errors).toContain('Number must be <= 100')
  })
})

describe('Number Formatting', () => {
  it('should format numbers with custom options', () => {
    expect(formatNumber(1234.567, { decimals: 2 })).toBe('1,234.57')
    expect(formatNumber(1234.567, { decimals: 0 })).toBe('1,235')
    expect(formatNumber(1234.567, { decimals: 3, thousandsSeparator: ' ', decimalSeparator: ',' })).toBe('1 234,567')
  })

  it('should clamp numbers between min and max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
  })
})

describe('Number Conversion', () => {
  it('should convert between bases', () => {
    expect(convertBase(255, { toBase: 16 })).toBe('FF')
    expect(convertBase(255n, { fromBase: 10, toBase: 16 })).toBe('FF')
    expect(convertBase('1010', { fromBase: 2, toBase: 10 })).toBe('10')
    expect(convertBase(10, { toBase: 2 })).toBe('1010')
  })

  it('should convert strings to numbers', () => {
    expect(toNumber('42')).toBe(42)
    expect(toNumber('invalid', 0)).toBe(0)
    expect(toNumber('3.14')).toBe(3.14)
  })
})

describe('Mathematical Operations', () => {
  it('should calculate GCD', () => {
    expect(gcd(48, 18)).toBe(6)
    expect(gcd(17, 13)).toBe(1)
    expect(gcd(0, 5)).toBe(5)
  })

  it('should calculate LCM', () => {
    expect(lcm(12, 18)).toBe(36)
    expect(lcm(4, 6)).toBe(12)
    expect(lcm(0, 5)).toBe(0)
  })

  it('should check prime numbers', () => {
    expect(isPrime(2)).toBe(true)
    expect(isPrime(17)).toBe(true)
    expect(isPrime(1)).toBe(false)
    expect(isPrime(15)).toBe(false)
  })

  it('should get prime factors', () => {
    expect(getPrimeFactors(12)).toEqual([2, 2, 3])
    expect(getPrimeFactors(17)).toEqual([17])
    expect(getPrimeFactors(1)).toEqual([])
  })

  it('should calculate factorial', () => {
    expect(factorial(0)).toBe(1)
    expect(factorial(5)).toBe(120)
    expect(factorial(7)).toBe(5040)
  })
})

describe('Utility Functions', () => {
  it('should round numbers with precision', () => {
    expect(round(3.14159, { decimalPlaces: 2 })).toBe(3.14)
    expect(round(3.145, { decimalPlaces: 2, roundingMode: 'up' })).toBe(3.15)
    expect(round(3.145, { decimalPlaces: 2, roundingMode: 'down' })).toBe(3.14)
  })

  it('should calculate percentage', () => {
    expect(percentage(25, 100)).toBe(25)
    expect(percentage(1, 3, 2)).toBe(33.33)
    expect(percentage(50, 0)).toBe(0)
  })

  it('should generate random numbers in range', () => {
    const random = randomBetween(1, 10)
    expect(random).toBeGreaterThanOrEqual(1)
    expect(random).toBeLessThanOrEqual(10)
  })
})
