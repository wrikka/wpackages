// A simple `pipe` function implementation.
// It takes a series of functions and returns a new function that applies them in sequence.
export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T) =>
    fns.reduce((acc, fn) => fn(acc), value);

// --- Example Functions ---

export const add5 = (n: number): number => n + 5;
export const multiplyBy2 = (n: number): number => n * 2;
export const subtract10 = (n: number): number => n - 10;

export const sanitizeString = (s: string): string => s.trim();
export const capitalize = (s: string): string => s.toUpperCase();
export const addGreeting = (s: string): string => `Hello, ${s}!`;
