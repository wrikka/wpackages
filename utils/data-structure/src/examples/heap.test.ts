import { describe, it, expect } from 'vitest';
import { Heap } from './core/heap';

describe('Heap', () => {
  describe('MinHeap', () => {
    it('should create an empty heap', () => {
      const minHeap = new Heap<number>();
      expect(minHeap.size()).toBe(0);
      expect(minHeap.isEmpty()).toBe(true);
    });

    it('should insert values and maintain min-heap property', () => {
      const minHeap = new Heap<number>();
      minHeap.insert(10);
      minHeap.insert(5);
      minHeap.insert(15);
      minHeap.insert(3);
      minHeap.insert(7);

      expect(minHeap.peek()).toBe(3);
    });

    it('should extract min value and maintain min-heap property', () => {
      const minHeap = new Heap<number>();
      minHeap.insert(10);
      minHeap.insert(5);
      minHeap.insert(15);
      minHeap.insert(3);
      minHeap.insert(7);

      expect(minHeap.extract()).toBe(3);
      expect(minHeap.peek()).toBe(5);
      expect(minHeap.extract()).toBe(5);
      expect(minHeap.peek()).toBe(7);
    });
  });

  describe('MaxHeap', () => {
    const maxComparator = (a: number, b: number) => b - a;

    it('should create an empty max-heap', () => {
      const maxHeap = new Heap<number>(maxComparator);
      expect(maxHeap.size()).toBe(0);
      expect(maxHeap.isEmpty()).toBe(true);
    });

    it('should insert values and maintain max-heap property', () => {
      const maxHeap = new Heap<number>(maxComparator);
      maxHeap.insert(10);
      maxHeap.insert(5);
      maxHeap.insert(15);
      maxHeap.insert(3);
      maxHeap.insert(7);

      expect(maxHeap.peek()).toBe(15);
    });

    it('should extract max value and maintain max-heap property', () => {
      const maxHeap = new Heap<number>(maxComparator);
      maxHeap.insert(10);
      maxHeap.insert(5);
      maxHeap.insert(15);
      maxHeap.insert(3);
      maxHeap.insert(7);

      expect(maxHeap.extract()).toBe(15);
      expect(maxHeap.peek()).toBe(10);
      expect(maxHeap.extract()).toBe(10);
      expect(maxHeap.peek()).toBe(7);
    });
  });
});
