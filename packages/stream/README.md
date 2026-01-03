# @w/stream

A lightweight, lazy-evaluation stream processing library for TypeScript, inspired by Java 8 Streams.

## Features

- **Lazy Evaluation**: Computations are only performed when a terminal operation is invoked, improving performance for large datasets.
- **Rich API**: A comprehensive set of intermediate and terminal operations.
- **Type-Safe**: Written in TypeScript to ensure type safety.
- **Optional Type**: Includes an `Optional<T>` type for safer handling of potentially null or undefined values.

## Installation

```bash
bun add @w/stream
```

## Usage

### Creating a Stream

```typescript
import { Stream } from "@w/stream";

// From elements
const stream1 = Stream.of(1, 2, 3, 4);

// From an array
const stream2 = Stream.from([1, 2, 3, 4]);

// From a generator function (infinite stream)
const stream3 = Stream.generate(() => Math.random());

// From an iterative function (infinite stream)
const stream4 = Stream.iterate(0, n => n + 2);

// From a range of numbers
const stream5 = Stream.range(1, 100);
```

### Intermediate Operations

Intermediate operations are lazy and return a new stream.

- `map<R>(mapper: (value: T) => R)`: Transforms each element.
- `filter(predicate: (value: T) => boolean)`: Filters elements based on a predicate.
- `flatMap<R>(mapper: (value: T) => Iterable<R>)`: Transforms each element into an iterable and flattens the result.
- `peek(action: (value: T) => void)`: Performs an action on each element (useful for debugging).
- `distinct()`: Returns a stream with unique elements.
- `sorted(comparator?: (a: T, b: T) => number)`: Sorts the elements.
- `limit(maxSize: number)`: Truncates the stream to be no longer than `maxSize`.
- `skip(n: number)`: Discards the first `n` elements.

**Example:**

```typescript
const result = Stream.range(1, 11) // [1, 2, ..., 10]
	.filter(n => n % 2 === 0) // [2, 4, 6, 8, 10]
	.map(n => n * n) // [4, 16, 36, 64, 100]
	.skip(1) // [16, 36, 64, 100]
	.limit(2) // [16, 36]
	.collect(); // [16, 36]

console.log(result); // Output: [16, 36]
```

### Terminal Operations

Terminal operations trigger the execution of the stream pipeline and produce a result.

- `collect(): T[]`: Collects the results into an array.
- `forEach(action: (value: T) => void)`: Performs an action for each element.
- `reduce(reducer, identity?): Optional<T>`: Performs a reduction on the elements.
- `findFirst(): Optional<T>`: Returns an `Optional` describing the first element.
- `count(): number`: Returns the count of elements.
- `anyMatch(predicate)`: Returns `true` if any elements match the predicate.
- `allMatch(predicate)`: Returns `true` if all elements match the predicate.
- `noneMatch(predicate)`: Returns `true` if no elements match the predicate.
- `join(separator?: string)`: Joins the elements into a string.

**Example:**

```typescript
const sum = Stream.of(1, 2, 3, 4)
	.reduce((a, b) => a + b, 0)
	.get(); // 10

const firstEven = Stream.of(1, 3, 4, 6)
	.filter(n => n % 2 === 0)
	.findFirst();

firstEven.ifPresent(val => console.log(val)); // Output: 4
```

### Optional Type

The `Optional` type is a container object which may or may not contain a non-null value. It's used by terminal operations like `findFirst` and `reduce` to avoid `null` pointer exceptions.

```typescript
import { Optional } from "@w/stream";

const optional = Stream.of(1, 2, 3)
	.filter(n => n > 5)
	.findFirst();

console.log(optional.isPresent()); // false

const value = optional.orElse(0);
console.log(value); // 0
```

## License

ISC
