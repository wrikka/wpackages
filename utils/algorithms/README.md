# @wpackages/algorithms

## Introduction

`@wpackages/algorithms` is a comprehensive collection of classic algorithms implemented in TypeScript. The library focuses on correctness, performance, and type safety, providing a reliable and easy-to-use set of tools for common computational problems.

## Features

- 📚 **Wide Range**: A comprehensive library of algorithms from various domains including sorting, searching, graph theory, and more.
- 🛡️ **Type-Safe**: Fully implemented in TypeScript to leverage static typing and prevent common errors.
- 🧪 **Thoroughly Tested**: Each algorithm is accompanied by a robust test suite using Vitest to ensure correctness.
- 💡 **Usage Examples**: Clear `.usage.ts` files are provided for every algorithm to demonstrate practical application.
- 🧱 **Well-Structured**: Algorithms are organized into logical categories for easy navigation and discoverability.

## Goal

- 🎯 **Correctness**: To provide reference implementations of classic algorithms that are correct and reliable.
- 🧑‍💻 **Educational**: To serve as a learning resource for developers studying data structures and algorithms.
- 🧩 **Reusable**: To offer a set of reusable, high-quality algorithm implementations for use in other packages.

## Design Principles

- **Clarity**: Implementations are written to be as clear and readable as possible without sacrificing performance.
- **Purity**: Algorithms are implemented as pure functions where possible.
- **Well-Tested**: A strong emphasis is placed on comprehensive testing to guarantee correctness.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

Import the desired algorithm from the package and use it in your code.

```typescript
import { binarySearch } from "@wpackages/algorithms";

const sortedArray = [1, 5, 9, 13, 99, 100];
const target = 13;

const index = binarySearch(sortedArray, target); // Returns 3

if (index !== -1) {
	console.log(`Found target at index: ${index}`);
}
```

## Available Algorithms

| Category            | Algorithm                  |
| ------------------- | -------------------------- |
| Compression         | Huffman Coding             |
| Dynamic Programming | Kadane's Algorithm         |
| Dynamic Programming | Longest Common Subsequence |
| Graph               | Bellman-Ford               |
| Graph               | Depth First Search         |
| Graph               | Dijkstra's Algorithm       |
| Graph               | Floyd-Warshall             |
| Graph               | Kruskal's Algorithm        |
| Graph               | Prim's Algorithm           |
| Graph               | Topological Sort           |
| Math                | Euclidean Algorithm        |
| Math                | Fibonacci Sequence         |
| Math                | Luhn Algorithm             |
| Math                | Sieve of Eratosthenes      |
| Probabilistic       | Bloom Filter               |
| Random              | Fisher-Yates Shuffle       |
| Random              | Reservoir Sampling         |
| Searching           | Binary Search              |
| Searching           | Exponential Search         |
| Searching           | Jump Search                |
| Sorting             | Bubble Sort                |
| Sorting             | Counting Sort              |
| Sorting             | Heap Sort                  |
| Sorting             | Insertion Sort             |
| Sorting             | Merge Sort                 |
| Sorting             | Quick Sort                 |
| Sorting             | Radix Sort                 |
| Sorting             | Selection Sort             |
| String              | Knuth-Morris-Pratt         |
| String              | Levenshtein Distance       |
| String              | Rabin-Karp                 |
| String              | Z-Algorithm                |

## License

This project is licensed under the MIT License.
