import type { Numeric, BinaryOperation, UnaryOperation } from '../types'
import { validateNumbers, validateNumeric } from '../utils/validation.util'

/**
 * Basic arithmetic operations
 */

export const add: BinaryOperation = (a: Numeric, b: Numeric): Numeric => {
	validateNumeric(a, b)
	return a + b
}

export const subtract: BinaryOperation = (a: Numeric, b: Numeric): Numeric => {
	validateNumeric(a, b)
	return a - b
}

export const multiply: BinaryOperation = (a: Numeric, b: Numeric): Numeric => {
	validateNumeric(a, b)
	return a * b
}

export const divide: BinaryOperation = (a: Numeric, b: Numeric): Numeric => {
	validateNumeric(a, b)
	if (b === 0) {
		throw new Error('Division by zero')
	}
	return a / b
}

export const power: BinaryOperation = (a: Numeric, b: Numeric): number => {
	validateNumbers(a, b)
	return Math.pow(a, b)
}

export const modulus: BinaryOperation = (a: Numeric, b: Numeric): Numeric => {
	validateNumeric(a, b)
	if (b === 0) {
		throw new Error('Modulus by zero')
	}
	return a % b
}

/**
 * Unary operations
 */

export const sqrt: UnaryOperation = (a: number): number => {
	validateNumbers(a)
	if (a < 0) {
		throw new Error('Square root of negative number')
	}
	return Math.sqrt(a)
}

export const abs: UnaryOperation = (a: Numeric): Numeric => {
	validateNumeric(a)
	return a < 0 ? -a : a
}

export const round: UnaryOperation = (a: number): number => {
	validateNumbers(a)
	return Math.round(a)
}

export const floor: UnaryOperation = (a: number): number => {
	validateNumbers(a)
	return Math.floor(a)
}

export const ceil: UnaryOperation = (a: number): number => {
	validateNumbers(a)
	return Math.ceil(a)
}

/**
 * Advanced arithmetic
 */

export function factorial(n: number): number {
	validateNumbers(n)
	if (n < 0) {
		throw new Error('Factorial of negative number')
	}
	if (n === 0 || n === 1) {
		return 1
	}
	
	let result = 1
	for (let i = 2; i <= n; i++) {
		result *= i
	}
	return result
}

export function gcd(a: number, b: number): number {
	validateNumbers(a, b)
	a = Math.abs(a)
	b = Math.abs(b)
	
	while (b !== 0) {
		const temp = b
		b = a % b
		a = temp
	}
	return a
}

export function lcm(a: number, b: number): number {
	validateNumbers(a, b)
	if (a === 0 || b === 0) {
		return 0
	}
	return Math.abs(a * b) / gcd(a, b)
}
