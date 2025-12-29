type Comparator<T> = (a: T, b: T) => number;

const minComparator = (a: number, b: number) => a - b;

export class Heap<T> {
  private heap: T[] = [];
  private comparator: Comparator<T>;

  constructor(comparator?: Comparator<T>) {
    this.comparator = comparator ?? (minComparator as Comparator<T>);
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  peek(): T | null {
    return this.heap[0] ?? null;
  }

  insert(value: T): void {
    this.heap.push(value);
    this.siftUp(this.size() - 1);
  }

  extract(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    this.swap(0, this.size() - 1);
    const extractedValue = this.heap.pop()!;
    this.siftDown(0);
    return extractedValue;
  }

  private getParentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private getLeftChildIndex(i: number): number {
    return 2 * i + 1;
  }

  private getRightChildIndex(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i]!, this.heap[j]!] = [this.heap[j]!, this.heap[i]!];
  }

  private siftUp(i: number): void {
    let parentIndex = this.getParentIndex(i);
    while (i > 0) {
      const current = this.heap[i];
      const parent = this.heap[parentIndex];
      if (current === undefined || parent === undefined || this.comparator(current, parent) >= 0) {
        break;
      }
      this.swap(i, parentIndex);
      i = parentIndex;
      parentIndex = this.getParentIndex(i);
    }
  }

  private siftDown(i: number): void {
    let minIndex = i;
    const leftIndex = this.getLeftChildIndex(i);
    const rightIndex = this.getRightChildIndex(i);
    const size = this.size();

    const current = this.heap[minIndex];
    const left = this.heap[leftIndex];
    if (current !== undefined && left !== undefined && leftIndex < size && this.comparator(left, current) < 0) {
      minIndex = leftIndex;
    }

    const min = this.heap[minIndex];
    const right = this.heap[rightIndex];
    if (min !== undefined && right !== undefined && rightIndex < size && this.comparator(right, min) < 0) {
      minIndex = rightIndex;
    }

    if (i !== minIndex) {
      this.swap(i, minIndex);
      this.siftDown(minIndex);
    }
  }
}
