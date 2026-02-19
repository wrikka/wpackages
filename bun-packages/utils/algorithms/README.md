# @wpackages/algorithms

> A comprehensive collection of algorithm implementations in TypeScript

A type-safe, well-tested library of classic algorithms and data structures. Covers sorting, searching, graph algorithms, dynamic programming, cryptography, and more.

## ✨ Features

- 📊 **Sorting Algorithms**: QuickSort, MergeSort, HeapSort, RadixSort, and more
- 🔍 **Searching Algorithms**: Binary search, Linear search, Interpolation search
- 📈 **Graph Algorithms**: BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, A*
- 🧮 **Dynamic Programming**: Knapsack, LCS, Edit Distance, Matrix Chain Multiplication
- 🔐 **Cryptography**: Hash functions, encryption algorithms, digital signatures
- 📦 **Data Structures**: Trees, Heaps, Graphs, Tries, Bloom Filters
- 🗜️ **Compression**: Huffman coding, LZ77, BWT (Burrows-Wheeler Transform)
- 🎲 **Probabilistic**: Bloom Filter, HyperLogLog, Reservoir Sampling
- 📝 **String Algorithms**: Pattern matching, KMP, Rabin-Karp, Trie-based search
- 🔢 **Math Utilities**: GCD, LCM, Prime factorization, Modular arithmetic

## 🎯 Goal

- 📚 Provide production-ready algorithm implementations
- 🧪 Ensure correctness through comprehensive testing
- ⚡ Optimize for performance and readability
- 🔒 Maintain type safety with TypeScript

## 🏗️ Architecture

### Key Concepts

- **Pure Functions**: All algorithms are implemented as pure functions without side effects
- **Type Safety**: Full TypeScript support with generic types where applicable
- **Test Coverage**: Each algorithm includes unit tests and usage examples
- **Modular Design**: Import only what you need from specific categories

## 📦 Installation

```bash
bun add @wpackages/algorithms
```

## 🚀 Usage

### Sorting

```typescript
import { quickSort, mergeSort, heapSort } from "@wpackages/algorithms";

const arr = [3, 1, 4, 1, 5, 9, 2, 6];

quickSort(arr); // [1, 1, 2, 3, 4, 5, 6, 9]
mergeSort(arr); // [1, 1, 2, 3, 4, 5, 6, 9]
heapSort(arr);  // [1, 1, 2, 3, 4, 5, 6, 9]
```

### Searching

```typescript
import { binarySearch, linearSearch } from "@wpackages/algorithms";

const sortedArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

binarySearch(sortedArr, 5); // 4 (index)
linearSearch(sortedArr, 5);  // 4 (index)
```

### Graph Algorithms

```typescript
import { dijkstra, bfs, dfs } from "@wpackages/algorithms";

const graph = {
  A: { B: 1, C: 4 },
  B: { A: 1, C: 2, D: 5 },
  C: { A: 4, B: 2, D: 1 },
  D: { B: 5, C: 1 }
};

dijkstra(graph, "A"); // { A: 0, B: 1, C: 3, D: 4 }
```

### Data Structures

```typescript
import { BinaryHeap, Trie, LinkedList } from "@wpackages/algorithms";

// Min Heap
const heap = new BinaryHeap<number>();
heap.insert(5);
heap.insert(3);
heap.extractMin(); // 3

// Trie for string search
const trie = new Trie();
trie.insert("hello");
trie.search("hello"); // true
trie.startsWith("hel"); // true
```

### Dynamic Programming

```typescript
import { knapsack, longestCommonSubsequence } from "@wpackages/algorithms";

// 0/1 Knapsack
const values = [60, 100, 120];
const weights = [10, 20, 30];
knapsack(values, weights, 50); // 220

// LCS
longestCommonSubsequence("ABCDGH", "AEDFHR"); // "ADH"
```

### String Algorithms

```typescript
import { kmpSearch, rabinKarpSearch } from "@wpackages/algorithms";

const text = "ABABDABACDABABCABAB";
const pattern = "ABABCABAB";

kmpSearch(text, pattern); // Index of match
rabinKarpSearch(text, pattern); // Index of match
```

## 📚 API Categories

| Category | Description |
|----------|-------------|
| `sorting` | QuickSort, MergeSort, HeapSort, RadixSort, CountingSort |
| `searching` | BinarySearch, LinearSearch, InterpolationSearch |
| `graph` | BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, A*, Prim, Kruskal |
| `dynamic-programming` | Knapsack, LCS, EditDistance, MatrixChain, Fibonacci |
| `cryptography` | Hash functions, encryption, digital signatures |
| `data-structures` | Heap, Trie, AVL Tree, B-Tree, Graph, LinkedList |
| `compression` | Huffman, LZ77, BWT |
| `probabilistic` | Bloom Filter, HyperLogLog, Count-Min Sketch |
| `string` | KMP, Rabin-Karp, Z-Algorithm, Suffix Array |
| `math` | GCD, LCM, Prime factorization, Sieve of Eratosthenes |

## 🛠️ Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Type check
bun run typecheck

# Lint
bun run lint

# Format
bun run format

# Watch mode
bun run watch
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Development mode with watch |
| `build` | Build with tsdown (exports, dts, minify) |
| `test` | Run tests with Bun |
| `typecheck` | TypeScript type checking |
| `lint` | Type check and lint with oxlint |
| `format` | Format with dprint |
| `scan` | Run ast-grep scan |
| `review` | Full review (deps, format, lint, test) |

## 📄 License

MIT