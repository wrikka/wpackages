import { describe, it, expect } from 'vitest';
import { binarySearch } from './binary-search';

describe('binarySearch', () => {
  it('should find the index of an element in a sorted array', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(binarySearch(arr, 5)).toBe(4);
  });

  it('should return -1 if the element is not in the array', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(binarySearch(arr, 10)).toBe(-1);
  });

  it('should handle an empty array', () => {
    const arr: number[] = [];
    expect(binarySearch(arr, 5)).toBe(-1);
  });

  it('should find the first element', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(binarySearch(arr, 1)).toBe(0);
  });

  it('should find the last element', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(binarySearch(arr, 9)).toBe(8);
  });
});
