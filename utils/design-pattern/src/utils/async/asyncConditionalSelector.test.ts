import { describe, it, expect } from 'bun:test';
import { createAsyncSelector } from './asyncConditionalSelector';

// Helper to simulate async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('createAsyncSelector', () => {
	it('should handle async conditions and return the correct result', async () => {
		const selector = createAsyncSelector([
			{ 
				condition: async (n: number) => { await delay(10); return n > 5; }, 
				result: 'greater than 5' 
			},
		], 'default');
		await expect(selector(10)).resolves.toBe('greater than 5');
	});

	it('should return the default value if no async conditions match', async () => {
		const selector = createAsyncSelector([
			{ 
				condition: async (n: number) => { await delay(10); return n > 10; }, 
				result: 'greater than 10' 
			},
		], 'default');
		await expect(selector(5)).resolves.toBe('default');
	});

	it('should handle a mix of sync and async conditions', async () => {
		const selector = createAsyncSelector([
			{ condition: (n: number) => n > 10, result: 'sync win' },
			{ 
				condition: async (n: number) => { await delay(10); return n > 5; }, 
				result: 'async win' 
			},
		], 'default');
		await expect(selector(12)).resolves.toBe('sync win');
		await expect(selector(7)).resolves.toBe('async win');
	});

	it('should handle async results (Promise)', async () => {
		const selector = createAsyncSelector([
			{ 
				condition: (n: number) => n > 5, 
				result: Promise.resolve('async result') 
			},
		], 'default');
		await expect(selector(10)).resolves.toBe('async result');
	});

	it('should handle async results (function returning a Promise)', async () => {
		const selector = createAsyncSelector([
			{ 
				condition: (n: number) => n > 5, 
				result: async (n: number) => { await delay(10); return `input was ${n}`; }
			},
		], 'default');
		await expect(selector(10)).resolves.toBe('input was 10');
	});

	it('should handle async default value', async () => {
		const selector = createAsyncSelector([
			{ condition: (n: number) => n > 10, result: 'greater than 10' },
		], Promise.resolve('async default'));
		await expect(selector(5)).resolves.toBe('async default');
	});

	it('should handle async default function', async () => {
		const selector = createAsyncSelector([
			{ condition: (n: number) => n > 10, result: 'greater than 10' },
		], async (n: number) => { await delay(10); return `default input was ${n}`; });
		await expect(selector(5)).resolves.toBe('default input was 5');
	});
});
