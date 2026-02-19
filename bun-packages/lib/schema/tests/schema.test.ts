/**
 * Test suite for @wpackages/schema
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { s } from '../src/index';

describe('@wpackages/schema', () => {
	describe('Core Schemas', () => {
		it('should validate strings', () => {
			const schema = s.string();
			
			expect(schema.parse('hello')).toBe('hello');
			expect(() => schema.parse(123)).toThrow();
		});

		it('should validate numbers', () => {
			const schema = s.number();
			
			expect(schema.parse(42)).toBe(42);
			expect(() => schema.parse('42')).toThrow();
		});

		it('should validate booleans', () => {
			const schema = s.boolean();
			
			expect(schema.parse(true)).toBe(true);
			expect(schema.parse(false)).toBe(false);
			expect(() => schema.parse('true')).toThrow();
		});
	});

	describe('Fluent API', () => {
		it('should chain validation methods', () => {
			const schema = s.string()
				.minLength(5)
				.email()
				.toLowerCase();
			
			expect(schema.parse('HELLO@TEST.COM')).toBe('hello@test.com');
			expect(() => schema.parse('short')).toThrow();
		});

		it('should handle optional values', () => {
			const schema = s.string().optional();
			
			expect(schema.parse('hello')).toBe('hello');
			expect(schema.parse(undefined)).toBe(undefined);
		});

		it('should handle nullable values', () => {
			const schema = s.string().nullable();
			
			expect(schema.parse('hello')).toBe('hello');
			expect(schema.parse(null)).toBe(null);
		});

		it('should handle default values', () => {
			const schema = s.string().default('default');
			
			expect(schema.parse('hello')).toBe('hello');
			expect(schema.parse(undefined)).toBe('default');
		});
	});

	describe('Object Schemas', () => {
		it('should validate objects', () => {
			const schema = s.object({
				name: s.string().minLength(2),
				email: s.string().email(),
				age: s.number().range(18, 120),
			});
			
			const valid = {
				name: 'John Doe',
				email: 'john@example.com',
				age: 30,
			};
			
			expect(schema.parse(valid)).toEqual(valid);
			expect(() => schema.parse({ name: 'J' })).toThrow();
		});
	});

	describe('Array Schemas', () => {
		it('should validate arrays', () => {
			const schema = s.array(s.string());
			
			expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
			expect(() => schema.parse([1, 2, 3])).toThrow();
		});
	});

	describe('Union Schemas', () => {
		it('should validate unions', () => {
			const schema = s.union([s.string(), s.number()]);
			
			expect(schema.parse('hello')).toBe('hello');
			expect(schema.parse(42)).toBe(42);
			expect(() => schema.parse(true)).toThrow();
		});
	});

	describe('Transformations', () => {
		it('should transform strings', () => {
			const schema = s.string()
				.trim()
				.toLowerCase();
			
			expect(schema.parse('  HELLO  ')).toBe('hello');
		});

		it('should parse numbers', () => {
			const schema = s.string().toNumber();
			
			expect(schema.parse('42')).toBe(42);
			expect(() => schema.parse('invalid')).toThrow();
		});
	});

	describe('Error Handling', () => {
		it('should provide detailed errors', () => {
			const schema = s.string().email();
			const result = schema.safeParse('invalid-email');
			
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors[0].message).toContain('email');
			}
		});
	});

	describe('Performance', () => {
		it('should handle large datasets efficiently', () => {
			const schema = s.string();
			const iterations = 10000;
			
			const start = performance.now();
			for (let i = 0; i < iterations; i++) {
				schema.safeParse('test');
			}
			const end = performance.now();
			
			const opsPerSec = iterations / (end - start) * 1000;
			expect(opsPerSec).toBeGreaterThan(100000); // Should be fast
		});
	});
});
