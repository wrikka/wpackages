import { describe, it, expect } from 'bun:test';
import { pipe, add5, multiplyBy2, subtract10, sanitizeString, capitalize, addGreeting } from './index';

describe('Functional Composition with pipe', () => {
    it('should compose mathematical functions correctly', () => {
        // (10 + 5) * 2 - 10 = 20
        const calculation = pipe(add5, multiplyBy2, subtract10);
        const result = calculation(10);
        expect(result).toBe(20);
    });

    it('should compose string manipulation functions correctly', () => {
        // trim -> toUpperCase -> addGreeting
        const formatName = pipe(sanitizeString, capitalize, addGreeting);
        const result = formatName('   alice   ');
        expect(result).toBe('Hello, ALICE!');
    });
});
