/**
 * Time utilities
 */

export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const now = (): number => Date.now();

export const isExpired = (timestamp: number, ttl: number): boolean => now() - timestamp > ttl;
