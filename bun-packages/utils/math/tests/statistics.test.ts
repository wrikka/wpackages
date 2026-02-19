import { describe, it, expect } from 'bun:test'
import {
	mean,
	median,
	mode,
	range,
	variance,
	standardDeviation,
	percentile,
	correlation
} from '../src/lib/statistics.lib'

describe('Statistics Operations', () => {
	describe('Basic Statistics', () => {
		it('should calculate mean correctly', () => {
			expect(mean([1, 2, 3, 4, 5])).toBe(3)
			expect(mean([10, 20, 30])).toBe(20)
			expect(mean([-1, 0, 1])).toBe(0)
		})

		it('should throw error for empty array in mean', () => {
			expect(() => mean([])).toThrow('Cannot calculate mean of empty array')
		})

		it('should calculate median correctly for odd length', () => {
			expect(median([1, 2, 3, 4, 5])).toBe(3)
			expect(median([10, 5, 8])).toBe(8)
		})

		it('should calculate median correctly for even length', () => {
			expect(median([1, 2, 3, 4])).toBe(2.5)
			expect(median([10, 5, 8, 12])).toBe(9)
		})

		it('should throw error for empty array in median', () => {
			expect(() => median([])).toThrow('Cannot calculate median of empty array')
		})

		it('should calculate mode correctly', () => {
			expect(mode([1, 2, 2, 3, 3, 3, 4])).toEqual([3])
			expect(mode([1, 1, 2, 2, 3, 4])).toEqual([1, 2])
			expect(mode([5])).toEqual([5])
		})

		it('should throw error for empty array in mode', () => {
			expect(() => mode([])).toThrow('Cannot calculate mode of empty array')
		})

		it('should calculate range correctly', () => {
			expect(range([1, 2, 3, 4, 5])).toEqual({ min: 1, max: 5 })
			expect(range([-5, 0, 10])).toEqual({ min: -5, max: 10 })
		})

		it('should throw error for empty array in range', () => {
			expect(() => range([])).toThrow('Cannot calculate range of empty array')
		})

		it('should calculate variance correctly', () => {
			expect(variance([1, 2, 3, 4, 5])).toBeCloseTo(2)
			expect(variance([10, 20, 30])).toBeCloseTo(66.666666667)
		})

		it('should throw error for empty array in variance', () => {
			expect(() => variance([])).toThrow('Cannot calculate variance of empty array')
		})

		it('should calculate standard deviation correctly', () => {
			expect(standardDeviation([1, 2, 3, 4, 5])).toBeCloseTo(1.414213562)
			expect(standardDeviation([10, 20, 30])).toBeCloseTo(8.164965809)
		})
	})

	describe('Advanced Statistics', () => {
		it('should calculate percentiles correctly', () => {
			expect(percentile([1, 2, 3, 4, 5], 50)).toBe(3)
			expect(percentile([1, 2, 3, 4, 5], 25)).toBe(2)
			expect(percentile([1, 2, 3, 4, 5], 75)).toBe(4)
		})

		it('should calculate percentiles for non-integer indices', () => {
			expect(percentile([1, 2, 3, 4], 25)).toBe(1.75)
			expect(percentile([1, 2, 3, 4], 75)).toBe(3.25)
		})

		it('should throw error for invalid percentile', () => {
			expect(() => percentile([1, 2, 3], -1)).toThrow('Percentile must be between 0 and 100')
			expect(() => percentile([1, 2, 3], 101)).toThrow('Percentile must be between 0 and 100')
		})

		it('should throw error for empty array in percentile', () => {
			expect(() => percentile([], 50)).toThrow('Cannot calculate percentile of empty array')
		})

		it('should calculate correlation correctly', () => {
			const x = [1, 2, 3, 4, 5]
			const y = [2, 4, 6, 8, 10]
			expect(correlation(x, y)).toBeCloseTo(1)
			
			const y2 = [5, 4, 3, 2, 1]
			expect(correlation(x, y2)).toBeCloseTo(-1)
		})

		it('should throw error for arrays of different lengths', () => {
			expect(() => correlation([1, 2, 3], [1, 2])).toThrow('Arrays must have the same length')
		})

		it('should throw error for empty arrays in correlation', () => {
			expect(() => correlation([], [])).toThrow('Cannot calculate correlation of empty arrays')
		})

		it('should throw error for zero variance in correlation', () => {
			expect(() => correlation([1, 1, 1], [2, 3, 4])).toThrow('Cannot calculate correlation when variance is zero')
		})
	})
})
