import { describe, it, expect } from 'vitest';
import { knapsack } from './knapsack-problem';

describe('Knapsack Problem', () => {
  it('should solve the knapsack problem for a simple case', () => {
    const items = [
      { weight: 1, value: 1 },
      { weight: 3, value: 4 },
      { weight: 4, value: 5 },
      { weight: 5, value: 7 },
    ];
    const capacity = 7;
    const result = knapsack(items, capacity);
    expect(result.maxValue).toBe(9);
    expect(result.selectedItems).toContainEqual({ weight: 3, value: 4 });
    expect(result.selectedItems).toContainEqual({ weight: 4, value: 5 });
  });

  it('should handle a case where some items are not selected', () => {
    const items = [
      { weight: 10, value: 60 },
      { weight: 20, value: 100 },
      { weight: 30, value: 120 },
    ];
    const capacity = 50;
    const result = knapsack(items, capacity);
    expect(result.maxValue).toBe(220);
    expect(result.selectedItems).toContainEqual({ weight: 20, value: 100 });
    expect(result.selectedItems).toContainEqual({ weight: 30, value: 120 });
  });

  it('should handle an empty item list', () => {
    const items: {weight: number, value: number}[] = [];
    const capacity = 10;
    const result = knapsack(items, capacity);
    expect(result.maxValue).toBe(0);
    expect(result.selectedItems).toEqual([]);
  });

  it('should handle zero capacity', () => {
    const items = [{ weight: 1, value: 1 }];
    const capacity = 0;
    const result = knapsack(items, capacity);
    expect(result.maxValue).toBe(0);
    expect(result.selectedItems).toEqual([]);
  });
});
