import type { Range } from '../types/math.type'
import { validateNumbers } from '../utils/validation.util'

/**
 * Basic statistics
 */

export function mean(numbers: number[]): number {
	if (numbers.length === 0) {
		throw new Error('Cannot calculate mean of empty array')
	}
	validateNumbers(...numbers)

	const sum = numbers.reduce((acc, num) => acc + num, 0)
	return sum / numbers.length
}

export function median(numbers: number[]): number {
	if (numbers.length === 0) {
		throw new Error('Cannot calculate median of empty array')
	}
	validateNumbers(...numbers)

	const sorted = [...numbers].sort((a, b) => a - b)
	const middle = Math.floor(sorted.length / 2)

	if (sorted.length % 2 === 0) {
		const lowerIndex = middle - 1
		const upperIndex = middle
		if (lowerIndex >= 0 && upperIndex < sorted.length) {
			const lowerValue = sorted[lowerIndex]
			const upperValue = sorted[upperIndex]
			if (lowerValue !== undefined && upperValue !== undefined) {
				return (lowerValue + upperValue) / 2
			}
		}
		throw new Error('Invalid array bounds in median calculation')
	}
	const middleIndex = middle
	if (middleIndex >= 0 && middleIndex < sorted.length) {
		const value = sorted[middleIndex]
		if (value !== undefined) {
			return value
		}
	}
	throw new Error('Invalid array bounds in median calculation')
}

export function mode(numbers: number[]): number[] {
	if (numbers.length === 0) {
		throw new Error('Cannot calculate mode of empty array')
	}
	validateNumbers(...numbers)

	const frequency = new Map<number, number>()
	for (const num of numbers) {
		frequency.set(num, (frequency.get(num) || 0) + 1)
	}

	const maxFrequency = Math.max(...Array.from(frequency.values()))
	return Array.from(frequency.entries())
		.filter(([, freq]) => freq === maxFrequency)
		.map(([num]) => num)
		.sort((a, b) => a - b)
}

export function range(numbers: number[]): Range {
	if (numbers.length === 0) {
		throw new Error('Cannot calculate range of empty array')
	}
	validateNumbers(...numbers)

	const min = Math.min(...numbers)
	const max = Math.max(...numbers)
	return { min, max }
}

export function variance(numbers: number[]): number {
	if (numbers.length === 0) {
		throw new Error('Cannot calculate variance of empty array')
	}
	validateNumbers(...numbers)

	const avg = mean(numbers)
	const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2))
	return mean(squaredDiffs)
}

export function standardDeviation(numbers: number[]): number {
	return Math.sqrt(variance(numbers))
}

/**
 * Advanced statistics
 */

export function percentile(numbers: number[], p: number): number {
	if (numbers.length === 0) {
		throw new Error('Cannot calculate percentile of empty array')
	}
	if (p < 0 || p > 100) {
		throw new Error('Percentile must be between 0 and 100')
	}
	validateNumbers(...numbers)

	const sorted = numbers.slice().sort((a, b) => a - b)
	const index = (p / 100) * (sorted.length - 1)

	if (Number.isInteger(index)) {
		const idx = Math.floor(index)
		if (idx >= 0 && idx < sorted.length) {
			const value = sorted[idx]
			if (value !== undefined) {
				return value
			}
		}
	}

	const lower = Math.floor(index)
	const upper = Math.ceil(index)
	const weight = index - lower

	const lowerValue = (lower >= 0 && lower < sorted.length && sorted[lower] !== undefined) ? sorted[lower] : 0
	const upperValue = (upper >= 0 && upper < sorted.length && sorted[upper] !== undefined) ? sorted[upper] : 0
	return lowerValue * (1 - weight) + upperValue * weight
}

export function correlation(x: number[], y: number[]): number {
	if (x.length !== y.length) {
		throw new Error('Arrays must have the same length')
	}
	if (x.length === 0) {
		throw new Error('Cannot calculate correlation of empty arrays')
	}
	validateNumbers(...x, ...y)

	const xMean = mean(x)
	const yMean = mean(y)

	const numerator = x.reduce((sum, xi, i) => {
		const yi = y[i]
		if (yi !== undefined) {
			return sum + (xi - xMean) * (yi - yMean)
		}
		return sum
	}, 0)
	const xSumSquares = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0)
	const ySumSquares = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)

	const denominator = Math.sqrt(xSumSquares * ySumSquares)

	if (denominator === 0) {
		throw new Error('Cannot calculate correlation when variance is zero')
	}

	return numerator / denominator
}
