import { describe, it, expect } from 'vitest';
import { mergeSort } from './merge-sort';

describe('mergeSort', () => {
  it('should sort an array of numbers', () => {
    const arr = [5, 2, 8, 1, 9, 4];
    const sortedArr = mergeSort(arr);
    expect(sortedArr).toEqual([1, 2, 4, 5, 8, 9]);
  });

  it('should handle an empty array', () => {
    const arr: number[] = [];
    const sortedArr = mergeSort(arr);
    expect(sortedArr).toEqual([]);
  });

  it('should handle an array with one element', () => {
    const arr = [5];
    const sortedArr = mergeSort(arr);
    expect(sortedArr).toEqual([5]);
  });

  it('should handle an array with duplicate elements', () => {
    const arr = [5, 2, 8, 1, 9, 4, 2, 8];
    const sortedArr = mergeSort(arr);
    expect(sortedArr).toEqual([1, 2, 2, 4, 5, 8, 8, 9]);
  });

  it('should handle a pre-sorted array', () => {
    const arr = [1, 2, 3, 4, 5];
    const sortedArr = mergeSort(arr);
    expect(sortedArr).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle a reverse-sorted array', () => {
    const arr = [5, 4, 3, 2, 1];
    const sortedArr = mergeSort(arr);
    expect(sortedArr).toEqual([1, 2, 3, 4, 5]);
  });
});
