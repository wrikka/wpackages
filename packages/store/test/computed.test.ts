import { describe, it, expect } from 'vitest';
import { atom, computed } from '../src';
import { vi } from 'vitest';

describe('computed', () => {
	it('should derive value from other atoms', () => {
		const a = atom(1);
		const b = atom(2);
		const c = computed([a, b], (a, b) => a + b);

		expect(c.get()).toBe(3);

		a.set(2);
		expect(c.get()).toBe(4);
	});

	it('should be lazy and only compute when subscribed', () => {
		const a = atom(1);
		const computer = vi.fn((val: number) => val * 2);
		const derived = computed([a], computer);

		// Should not be called before anyone listens
		expect(computer).not.toHaveBeenCalled();

		// Should compute on first get
		expect(derived.get()).toBe(2);
		expect(computer).toHaveBeenCalledTimes(1);

		const unsubscribe = derived.subscribe(() => {});
		// Should be called on subscribe
		expect(computer).toHaveBeenCalledTimes(2);

		a.set(2);
		expect(computer).toHaveBeenCalledTimes(3);

		unsubscribe();

		// Should not be called after unsubscribing
		a.set(3);
		expect(computer).toHaveBeenCalledTimes(3);
	});

	it('should derive a value from multiple atoms', () => {
		const firstName = atom('John');
		const lastName = atom('Doe');
		const fullName = computed([firstName, lastName], (f, l) => `${f} ${l}`);

		expect(fullName.get()).toBe('John Doe');

		firstName.set('Jane');
		expect(fullName.get()).toBe('Jane Doe');
	});
});
