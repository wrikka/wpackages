# @wpackages/data-structure

## Introduction

`@wpackages/data-structure` is a library of common data structures implemented with a functional, immutable, and type-safe API. It provides correct and efficient implementations of foundational data structures, designed for use in modern TypeScript applications.

## Features

- 🧊 **Immutable by Design**: All data structures are immutable. Operations that modify a data structure return a new, updated instance, leaving the original unchanged.
- 🧩 **Functional API**: The library exposes pure functions for interacting with data structures, making the code predictable, testable, and easy to compose.
- 🔒 **Type-Safe**: Written entirely in TypeScript to ensure strong type safety for all operations.
- 📚 **Comprehensive Collection**: Includes a wide range of common data structures like Heaps, Graphs, Tries, and more.

## Goal

- 🎯 **Correctness**: To provide reference-quality implementations of classic data structures.
- 🧑‍💻 **Educational**: To serve as a clear and readable learning resource for developers.
- 🧱 **Foundational**: To be a foundational building block for other libraries and applications within the monorepo.

## Design Principles

- **Immutability**: No function ever mutates its inputs. This eliminates a large class of bugs and makes state management more predictable.
- **Purity**: The API consists of pure functions, meaning their output is determined solely by their input, with no hidden side effects.
- **Clarity**: Implementations are written to be as clear and easy to understand as possible.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

Each data structure is manipulated through a set of exported pure functions.

### Example: Using an Immutable Min-Heap

```typescript
import {
	createHeap,
	heapExtract,
	heapInsert,
	heapPeek,
	minComparator,
} from "@wpackages/data-structure";

// 1. Create an empty min-heap
let myHeap = createHeap<number>();

// 2. Insert values (each operation returns a new heap instance)
myHeap = heapInsert(myHeap, 10, minComparator);
myHeap = heapInsert(myHeap, 5, minComparator);
myHeap = heapInsert(myHeap, 15, minComparator);

// 3. Peek at the smallest value without modifying the heap
console.log(heapPeek(myHeap)); // Output: 5

// 4. Extract the smallest value, which returns the value and a new heap
const [value, newHeap] = heapExtract(myHeap, minComparator);

console.log(value); // Output: 5
console.log(heapPeek(newHeap)); // Output: 10

// The original heap remains unchanged due to immutability
console.log(heapPeek(myHeap)); // Output: 5
```

## Available Data Structures

- Binary Search Tree
- Graph (Weighted & Unweighted)
- Heap (Min & Max)
- Linked List
- Priority Queue
- Trie

## License

This project is licensed under the MIT License.
