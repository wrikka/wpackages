import { Heap } from './heap';

// --- MinHeap Example ---
console.log('--- MinHeap ---');

// 1. Create a new MinHeap
const minHeap = new Heap<number>(); // Uses default min-comparator

// 2. Insert values
minHeap.insert(10);
minHeap.insert(5);
minHeap.insert(15);
minHeap.insert(3);
minHeap.insert(7);

console.log('MinHeap size:', minHeap.size()); // Output: 5

// 3. Peek at the minimum value
console.log('Min value:', minHeap.peek()); // Output: 3

// 4. Extract minimum values
console.log('Extract min:', minHeap.extract()); // Output: 3
console.log('New min value:', minHeap.peek());   // Output: 5
console.log('Extract min:', minHeap.extract()); // Output: 5
console.log('New min value:', minHeap.peek());   // Output: 7


// --- MaxHeap Example ---
console.log('\n--- MaxHeap ---');

// 1. Create a new MaxHeap with a custom comparator
const maxComparator = (a: number, b: number) => b - a;
const maxHeap = new Heap<number>(maxComparator);

// 2. Insert values
maxHeap.insert(10);
maxHeap.insert(5);
maxHeap.insert(15);
maxHeap.insert(3);
maxHeap.insert(7);

console.log('MaxHeap size:', maxHeap.size()); // Output: 5

// 3. Peek at the maximum value
console.log('Max value:', maxHeap.peek()); // Output: 15

// 4. Extract maximum values
console.log('Extract max:', maxHeap.extract()); // Output: 15
console.log('New max value:', maxHeap.peek());   // Output: 10
console.log('Extract max:', maxHeap.extract()); // Output: 10
console.log('New max value:', maxHeap.peek());   // Output: 7
