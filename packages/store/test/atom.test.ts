import { describe, it, expect, vi } from 'vitest';
import { atom } from '../src';

describe('atom', () => {
	it('should set and get a value', () => {
		const count = atom(0);
		expect(count.get()).toBe(0);
		count.set(5);
		expect(count.get()).toBe(5);
	});

	it('should notify listeners on change', () => {
		const name = atom('John');
		const listener = vi.fn();
		const unsubscribe = name.subscribe(listener);

		name.set('Jane');
		expect(listener).toHaveBeenCalledTimes(2); // Once on subscribe, once on set
		expect(listener).toHaveBeenCalledWith('Jane', 'John');

		unsubscribe();
		name.set('Doe');
		expect(listener).toHaveBeenCalledTimes(2); // Should not be called after unsubscribe
	});

	it('should not notify listeners if value is the same', () => {
		const value = atom(10);
		const listener = vi.fn();
		const unsubscribe = value.subscribe(listener);

		value.set(10);

		// The listener is called once on subscribe, but not again on set
		expect(listener).toHaveBeenCalledTimes(1);

		unsubscribe();
	});
});
