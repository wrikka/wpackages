import { describe, it, expect } from 'bun:test'
import {
	add,
	subtract,
	multiply,
	divide,
	power,
	modulus,
	sqrt,
	abs,
	round,
	floor,
	ceil,
	factorial,
	gcd,
	lcm
} from '../src/lib/arithmetic.lib'

describe('Arithmetic Operations', () => {
	describe('Basic Operations', () => {
		it('should add numbers correctly', () => {
			expect(add(2, 3)).toBe(5)
			expect(add(-1, 1)).toBe(0)
			expect(add(0, 0)).toBe(0)
		})

		it('should subtract numbers correctly', () => {
			expect(subtract(5, 3)).toBe(2)
			expect(subtract(1, -1)).toBe(2)
			expect(subtract(0, 0)).toBe(0)
		})

		it('should multiply numbers correctly', () => {
			expect(multiply(2, 3)).toBe(6)
			expect(multiply(-2, 3)).toBe(-6)
			expect(multiply(0, 5)).toBe(0)
		})

		it('should divide numbers correctly', () => {
			expect(divide(6, 2)).toBe(3)
			expect(divide(-6, 2)).toBe(-3)
			expect(divide(5, 2)).toBe(2.5)
		})

		it('should throw error when dividing by zero', () => {
			expect(() => divide(5, 0)).toThrow('Division by zero')
		})

		it('should calculate power correctly', () => {
			expect(power(2, 3)).toBe(8)
			expect(power(5, 0)).toBe(1)
			expect(power(4, 0.5)).toBe(2)
		})

		it('should calculate modulus correctly', () => {
			expect(modulus(7, 3)).toBe(1)
			expect(modulus(-7, 3)).toBe(-1)
			expect(modulus(7, -3)).toBe(1)
		})

		it('should throw error when modulus by zero', () => {
			expect(() => modulus(5, 0)).toThrow('Modulus by zero')
		})
	})

	describe('Unary Operations', () => {
		it('should calculate square root correctly', () => {
			expect(sqrt(9)).toBe(3)
			expect(sqrt(0)).toBe(0)
			expect(sqrt(2)).toBeCloseTo(1.414213562)
		})

		it('should throw error for square root of negative number', () => {
			expect(() => sqrt(-1)).toThrow('Square root of negative number')
		})

		it('should calculate absolute value correctly', () => {
			expect(abs(5)).toBe(5)
			expect(abs(-5)).toBe(5)
			expect(abs(0)).toBe(0)
		})

		it('should round numbers correctly', () => {
			expect(round(3.2)).toBe(3)
			expect(round(3.8)).toBe(4)
			expect(round(3.5)).toBe(4)
			expect(round(-3.2)).toBe(-3)
			expect(round(-3.8)).toBe(-4)
		})

		it('should floor numbers correctly', () => {
			expect(floor(3.8)).toBe(3)
			expect(floor(3.2)).toBe(3)
			expect(floor(-3.2)).toBe(-4)
			expect(floor(-3.8)).toBe(-4)
		})

		it('should ceil numbers correctly', () => {
			expect(ceil(3.2)).toBe(4)
			expect(ceil(3.8)).toBe(4)
			expect(ceil(-3.2)).toBe(-3)
			expect(ceil(-3.8)).toBe(-3)
		})
	})

	describe('Advanced Operations', () => {
		it('should calculate factorial correctly', () => {
			expect(factorial(0)).toBe(1)
			expect(factorial(1)).toBe(1)
			expect(factorial(5)).toBe(120)
			expect(factorial(10)).toBe(3628800)
		})

		it('should throw error for factorial of negative number', () => {
			expect(() => factorial(-1)).toThrow('Factorial of negative number')
		})

		it('should calculate GCD correctly', () => {
			expect(gcd(48, 18)).toBe(6)
			expect(gcd(17, 23)).toBe(1)
			expect(gcd(0, 5)).toBe(5)
			expect(gcd(5, 0)).toBe(5)
		})

		it('should calculate LCM correctly', () => {
			expect(lcm(4, 6)).toBe(12)
			expect(lcm(3, 5)).toBe(15)
			expect(lcm(0, 5)).toBe(0)
			expect(lcm(5, 0)).toBe(0)
		})
	})

	describe('BigInt Support', () => {
		it('should handle bigint operations', () => {
			expect(add(5n, 3n)).toBe(8n)
			expect(subtract(10n, 3n)).toBe(7n)
			expect(multiply(4n, 5n)).toBe(20n)
			expect(divide(20n, 4n)).toBe(5n)
			expect(modulus(15n, 4n)).toBe(3n)
			expect(abs(-5n)).toBe(5n)
		})

		it('should throw error for invalid bigint operations', () => {
			expect(() => divide(5n, 0n)).toThrow('0 is an invalid divisor value.')
			expect(() => modulus(5n, 0n)).toThrow('0 is an invalid divisor value.')
		})
	})
})
