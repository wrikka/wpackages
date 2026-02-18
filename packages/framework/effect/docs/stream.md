# Stream Processing Guide

## Overview

Stream processing ช่วยให้คุณ process data แบบ async และ lazy

## Creating Streams

### From Array

```typescript
import { fromArray, runPromise, toArray } from "@wpackages/effect/stream";

const stream = fromArray([1, 2, 3, 4, 5]);
const result = await runPromise(toArray(stream));
console.log(result.value); // [1, 2, 3, 4, 5]
```

### From Async Iterable

```typescript
import {
	fromAsyncIterable,
	runPromise,
	toArray,
} from "@wpackages/effect/stream";

async function* generateNumbers() {
	for (let i = 0; i < 5; i++) {
		yield i;
	}
}

const stream = fromAsyncIterable(generateNumbers());
const result = await runPromise(toArray(stream));
console.log(result.value); // [0, 1, 2, 3, 4]
```

### From Effect

```typescript
import { fromEffect, runPromise, toArray } from "@wpackages/effect/stream";

const stream = fromEffect(succeed(42));
const result = await runPromise(toArray(stream));
console.log(result.value); // [42]
```

## Stream Operators

### map

Transform each value:

```typescript
import { fromArray, map, runPromise, toArray } from "@wpackages/effect/stream";

const stream = fromArray([1, 2, 3]);
const doubled = map((x) => x * 2)(stream);

const result = await runPromise(toArray(doubled));
console.log(result.value); // [2, 4, 6]
```

### filter

Filter values:

```typescript
import {
	filter,
	fromArray,
	runPromise,
	toArray,
} from "@wpackages/effect/stream";

const stream = fromArray([1, 2, 3, 4, 5]);
const evens = filter((x) => x % 2 === 0)(stream);

const result = await runPromise(toArray(evens));
console.log(result.value); // [2, 4]
```

### flatMap

Transform each value to a stream:

```typescript
import {
	flatMap,
	fromArray,
	runPromise,
	toArray,
} from "@wpackages/effect/stream";

const stream = fromArray([1, 2, 3]);
const multiplied = flatMap((x) => fromArray([x, x * 2]))(stream);

const result = await runPromise(toArray(multiplied));
console.log(result.value); // [1, 2, 2, 4, 3, 6]
```

### reduce

Reduce to single value:

```typescript
import { fromArray, reduce, runPromise } from "@wpackages/effect/stream";

const stream = fromArray([1, 2, 3, 4, 5]);
const sum = reduce((acc, x) => acc + x, 0)(stream);

const result = await runPromise(sum);
console.log(result.value); // 15
```

### batch

Batch values:

```typescript
import {
	batch,
	fromArray,
	runPromise,
	toArray,
} from "@wpackages/effect/stream";

const stream = fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const batches = batch(3)(stream);

const result = await runPromise(toArray(batches));
console.log(result.value); // [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
```

### merge

Merge multiple streams:

```typescript
import {
	fromArray,
	merge,
	runPromise,
	toArray,
} from "@wpackages/effect/stream";

const stream1 = fromArray([1, 2, 3]);
const stream2 = fromArray([4, 5, 6]);
const merged = merge(stream1, stream2);

const result = await runPromise(toArray(merged));
console.log(result.value); // [1, 4, 2, 5, 3, 6] (order may vary)
```

## Chaining Operators

```typescript
import {
	filter,
	flatMap,
	fromArray,
	map,
	pipe,
	reduce,
	runPromise,
} from "@wpackages/effect/stream";

const result = await runPromise(
	pipe(
		fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
		map((x) => x * 2),
		filter((x) => x > 10),
		flatMap((x) => fromArray([x, x + 1])),
		reduce((acc, x) => acc + x, 0),
	),
);
console.log(result.value); // Sum of all filtered and transformed values
```

## Backpressure Handling

Stream processing automatically handles backpressure ด้วย async iteration:

```typescript
import { fromArray, map, runPromise, toArray } from "@wpackages/effect/stream";

const stream = fromArray(Array.from({ length: 100000 }, (_, i) => i));
const processed = map(async (x) => {
	// Simulate async processing
	await new Promise((resolve) => setTimeout(resolve, 10));
	return x * 2;
})(stream);

const result = await runPromise(toArray(processed));
console.log(result.value.length); // 100000
```

## Use Cases

### Processing Large Files

```typescript
import {
	filter,
	fromAsyncIterable,
	map,
	reduce,
	runPromise,
} from "@wpackages/effect/stream";

async function* readLines(filePath: string) {
	const file = Bun.file(filePath);
	const stream = file.stream();
	const reader = stream.getReader();
	const decoder = new TextDecoder();

	let buffer = "";
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split("\n");
		buffer = lines.pop() || "";

		for (const line of lines) {
			yield line;
		}
	}

	if (buffer) {
		yield buffer;
	}
}

const result = await runPromise(
	pipe(
		fromAsyncIterable(readLines("data.txt")),
		map((line) => line.trim()),
		filter((line) => line.length > 0),
		reduce((count) => count + 1, 0),
	),
);
console.log(`Total lines: ${result.value}`);
```

### Real-time Data Processing

```typescript
import {
	filter,
	fromAsyncIterable,
	map,
	runPromise,
	toArray,
} from "@wpackages/effect/stream";

async function* fetchSensorData() {
	while (true) {
		const data = await fetch("https://api.example.com/sensor");
		yield await data.json();
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}

const result = await runPromise(
	pipe(
		fromAsyncIterable(fetchSensorData()),
		map((data) => data.value),
		filter((value) => value > 100),
		toArray,
	),
);
console.log(result.value);
```

### API Pagination

```typescript
import {
	flatMap,
	fromAsyncIterable,
	map,
	runPromise,
	toArray,
} from "@wpackages/effect/stream";

async function* fetchPaginatedData(url: string) {
	let page = 1;
	while (true) {
		const response = await fetch(`${url}?page=${page}`);
		const data = await response.json();

		if (data.items.length === 0) break;

		for (const item of data.items) {
			yield item;
		}

		page++;
	}
}

const result = await runPromise(
	pipe(
		fromAsyncIterable(fetchPaginatedData("https://api.example.com/items")),
		map((item) => item.id),
		flatMap((id) => fetch(`https://api.example.com/items/${id}`)),
		toArray,
	),
);
console.log(result.value);
```
