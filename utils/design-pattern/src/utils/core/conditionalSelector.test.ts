import { describe, it, expect } from 'bun:test';
import { createSelector } from './conditionalSelector';

describe('createSelector', () => {
	it('should return the result of the first matching condition', () => {
		const selector = createSelector([
			{ condition: (n: number) => n > 5, result: 'greater than 5' },
			{ condition: (n: number) => n > 0, result: 'greater than 0' },
		], 'default');
		expect(selector(10)).toBe('greater than 5');
	});

	it('should return the default value if no conditions match', () => {
		const selector = createSelector([
			{ condition: (n: number) => n > 10, result: 'greater than 10' },
		], 'default');
		expect(selector(5)).toBe('default');
	});

	it('should return the result of the first of multiple matching conditions', () => {
		const selector = createSelector([
			{ condition: (n: number) => n > 0, result: 'first' },
			{ condition: (n: number) => n > 5, result: 'second' },
		], 'default');
		expect(selector(10)).toBe('first');
	});

	it('should execute and return the result of a function if the result is a function', () => {
		const selector = createSelector([
			{ condition: (n: number) => n > 5, result: (n: number) => `input is ${n}` },
		], 'default');
		expect(selector(10)).toBe('input is 10');
	});

	it('should execute and return the result of the default function if no conditions match', () => {
		const selector = createSelector([
			{ condition: (n: number) => n > 10, result: 'greater than 10' },
		], (n: number) => `default input is ${n}`);
		expect(selector(5)).toBe('default input is 5');
	});

	it('should work with object inputs', () => {
		type User = { role: 'admin' | 'user'; age: number };
		const selector = createSelector([
			{ condition: (u: User) => u.role === 'admin', result: 'Admin User' },
			{ condition: (u: User) => u.age > 18, result: 'Adult User' },
		], 'Minor User');

		expect(selector({ role: 'admin', age: 25 })).toBe('Admin User');
		expect(selector({ role: 'user', age: 25 })).toBe('Adult User');
		expect(selector({ role: 'user', age: 15 })).toBe('Minor User');
	});

	it('should handle empty conditions array and return default value', () => {
		const selector = createSelector([], 'default');
		expect(selector(123)).toBe('default');
	});

	it('should handle empty conditions array and return default function result', () => {
		const selector = createSelector([], (n: number) => `default input is ${n}`);
		expect(selector(123)).toBe('default input is 123');
	});
});
