import { describe, it, expect } from 'bun:test';
import { chainSelectors } from './chainSelectors';

describe('chainSelectors', () => {
  it('should chain two functions correctly', () => {
    const add5 = (n: number) => n + 5;
    const multiply2 = (n: number) => n * 2;
    const chained = chainSelectors(add5, multiply2);
    // (10 + 5) * 2 = 30
    expect(chained(10)).toBe(30);
  });

  it('should chain multiple functions in the correct order', () => {
    const add5 = (n: number) => n + 5;
    const multiply2 = (n: number) => n * 2;
    const toString = (n: number) => `Result is ${n}`;
    const chained = chainSelectors(add5, multiply2, toString);
    // ((10 + 5) * 2) => "Result is 30"
    expect(chained(10)).toBe('Result is 30');
  });

  it('should work with different types between functions', () => {
    const getLength = (s: string) => s.length;
    const isEven = (n: number) => n % 2 === 0;
    const chained = chainSelectors(getLength, isEven);
    expect(chained('hello')).toBe(false); // length 5 -> false
    expect(chained('world!')).toBe(true);  // length 6 -> true
  });

  it('should handle a single function', () => {
    const add5 = (n: number) => n + 5;
    const chained = chainSelectors(add5);
    expect(chained(10)).toBe(15);
  });

  it('should throw an error if no selectors are provided', () => {
    // @ts-ignore - testing invalid usage
    expect(() => chainSelectors()).toThrow('chainSelectors requires at least one selector.');
  });
});
