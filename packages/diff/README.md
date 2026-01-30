# @wpackages/diff

A modern, lightweight, and high-performance TypeScript library for calculating differences between texts and objects.

## Features

- **Object Diff**: Calculate differences between objects, Maps, Sets, and Arrays
- **LCS Algorithm**: Longest Common Subsequence algorithm for array comparisons
- **Patch & Unpatch**: Apply or revert changes using diff results
- **Circular Reference Handling**: Safely handles circular references in objects
- **Type-Safe**: Built with TypeScript for full type safety
- **Path Filtering**: Ignore specific paths when comparing objects
- **Formatted Output**: Beautiful terminal output with color highlighting
- **Zero Dependencies**: Minimal dependencies for maximum performance

## Comparison

| Feature         | `@wpackages/diff` | `jsdiff`   | `json-diff-ts` |
| --------------- | ----------------- | ---------- | -------------- |
| **Primary Use** | Text & Objects    | Text       | JSON Objects   |
| **TypeScript**  | ✅ Native         | ❌ (types) | ✅ Native      |
| **Performance** | 🚀 High           | 🆗 Good    | 🚀 High        |
| **Bundle Size** | 📦 Small          | 📦 Small   | 📦 Small       |

## Installation

```bash
bun add @wpackages/diff
```

## Usage

### Basic Object Diff

```typescript
import { diff } from "@wpackages/diff";

const obj1 = { a: 1, b: 2, c: { d: 3 } };
const obj2 = { a: 1, b: 3, c: { d: 4 } };

const result = diff(obj1, obj2);
console.log(result);
// Output:
// {
//   added: {},
//   deleted: {},
//   updated: {
//     b: { __old: 2, __new: 3 },
//     c: {
//       added: {},
//       deleted: {},
//       updated: { d: { __old: 3, __new: 4 } }
//     }
//   }
// }
```

### Array Diff

```typescript
import { diff } from "@wpackages/diff";

const arr1 = [1, 2, 3, 4];
const arr2 = [1, 2, 5, 4];

const result = diff(arr1, arr2);
console.log(result);
// Output:
// {
//   added: {},
//   deleted: {},
//   updated: {
//     _lcs: [
//       { type: 2, value: 1, indexA: 0, indexB: 0 },
//       { type: 2, value: 2, indexA: 1, indexB: 1 },
//       { type: 1, value: 3, indexA: 2 },
//       { type: 2, value: 4, indexA: 3, indexB: 3 },
//       { type: 0, value: 5, indexB: 2 }
//     ]
//   }
// }
```

### Map and Set Diff

```typescript
import { diff } from "@wpackages/diff";

const map1 = new Map([["a", 1], ["b", 2]]);
const map2 = new Map([["a", 1], ["c", 3]]);

const result = diff(map1, map2);
console.log(result);
// Output:
// {
//   added: { c: 3 },
//   deleted: { b: 2 },
//   updated: {}
// }
```

### Patch and Unpatch

```typescript
import { diff, patch, unpatch } from "@wpackages/diff";

const source = { a: 1, b: 2 };
const target = { a: 1, b: 3, c: 4 };

const diffResult = diff(source, target)!;

// Apply changes
const patched = patch(source, diffResult);
console.log(patched); // { a: 1, b: 3, c: 4 }

// Revert changes
const unpatched = unpatch(patched, diffResult);
console.log(unpatched); // { a: 1, b: 2 }
```

### Formatted Output

```typescript
import { createDiff } from "@wpackages/diff";

const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, b: 3 };

console.log(createDiff(obj1, obj2));
// Output:
//
// - Expected
// + Received
//
// {
// - b: 2
// + b: 3
// }
```

### Path Filtering

```typescript
import { diff } from "@wpackages/diff";

const obj1 = { a: 1, b: 2, nested: { c: 3 } };
const obj2 = { a: 1, b: 99, nested: { c: 3 } };

const result = diff(obj1, obj2, { ignorePaths: ["b"] });
console.log(result); // undefined (b is ignored)
```

## API Reference

### `diff(expected, actual, options?)`

Calculate differences between two values.

- `expected`: The original value
- `actual`: The new value to compare against
- `options`: Optional configuration
  - `ignorePaths`: Array of paths to ignore (e.g., `["b", "nested.c"]`)

Returns `DiffResult | undefined`

### `patch(source, diff)`

Apply a diff result to a source object.

- `source`: The original object
- `diff`: The diff result to apply

Returns the patched object.

### `unpatch(source, diff)`

Revert a diff result from a source object.

- `source`: The patched object
- `diff`: The diff result to revert

Returns the original object.

### `createDiff(expected, actual)`

Create a formatted string representation of the diff.

- `expected`: The original value
- `actual`: The new value to compare against

Returns a formatted string with color highlighting.

### `lcs(a, b)`

Calculate the Longest Common Subsequence between two arrays.

- `a`: First array
- `b`: Second array

Returns an array of `LcsChange` objects.

### `isEqual(a, b)`

Check if two values are deeply equal.

- `a`: First value
- `b`: Second value

Returns `boolean`.

## License

MIT
