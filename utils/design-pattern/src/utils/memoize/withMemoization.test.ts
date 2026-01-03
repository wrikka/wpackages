import { describe, it, expect, vi } from 'bun:test';
import { withMemoization } from './withMemoization';

describe('withMemoization', () => {
  it('should return the same result as the original function', () => {
    const selector = (x: number) => x * 2;
    const memoizedSelector = withMemoization(selector);
    expect(memoizedSelector(10)).toBe(20);
  });

  it('should call the original function only once for the same input', () => {
    const selector = vi.fn((x: number) => x * 2);
    const memoizedSelector = withMemoization(selector);

    memoizedSelector(10);
    memoizedSelector(10);
    memoizedSelector(10);

    expect(selector).toHaveBeenCalledTimes(1);
  });

  it('should call the original function for different inputs', () => {
    const selector = vi.fn((x: number) => x * 2);
    const memoizedSelector = withMemoization(selector);

    memoizedSelector(10);
    memoizedSelector(20);

    expect(selector).toHaveBeenCalledTimes(2);
  });

  it('should have a clearCache function that resets the cache', () => {
    const selector = vi.fn((x: number) => x * 2);
    const memoizedSelector = withMemoization(selector);

    memoizedSelector(10);
    expect(selector).toHaveBeenCalledTimes(1);

    memoizedSelector.clearCache();

    memoizedSelector(10);
    expect(selector).toHaveBeenCalledTimes(2);
  });

  it('should use cacheKeyResolver for complex objects', () => {
    type User = { id: number; name: string };
    const selector = vi.fn((u: User) => `User is ${u.name}`);
    const memoizedSelector = withMemoization(selector, (u) => u.id);

    const user1_a = { id: 1, name: 'Alice' };
    const user1_b = { id: 1, name: 'Alice' }; // Different object reference, same ID
    const user2 = { id: 2, name: 'Bob' };

    memoizedSelector(user1_a);
    memoizedSelector(user1_b);
    memoizedSelector(user2);

    expect(selector).toHaveBeenCalledTimes(2);
    expect(memoizedSelector(user1_a)).toBe('User is Alice');
    expect(memoizedSelector(user2)).toBe('User is Bob');
  });
});
