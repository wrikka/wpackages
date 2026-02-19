# Testing Guide

## Overview

Testing utilities ช่วยให้คุณ test effects ได้อย่างง่าย

## Mocks

### Creating Mocks

```typescript
import { createMock, runPromise } from "@wpackages/effect/testing";

const mockEffect = createMock<number, Error>();

mockEffect.mockImplementation((...args) => {
	return args[0] * 2;
});

const result = await runPromise(mockEffect());
console.log(result.value); // 42 (if called with 21)
```

### Mocking Effects

```typescript
import { createMock, runPromise, succeed } from "@wpackages/effect/testing";

const mockFetch = createMock<string, Error>();

mockFetch.mockImplementation((url) => {
	if (url === "/api/users") {
		return succeed(JSON.stringify([{ id: 1, name: "John" }]));
	}
	return succeed(JSON.stringify({}));
});

const result = await runPromise(mockFetch("/api/users"));
console.log(result.value); // [{"id":1,"name":"John"}]
```

## Stubs

### Creating Stubs

```typescript
import { createStub, runPromise } from "@wpackages/effect/testing";

const stubEffect = createStub<number, Error>(42);

stubEffect.withReturnValue(100);

const result = await runPromise(stubEffect());
console.log(result.value); // 100
```

### Stubbing Errors

```typescript
import { createStub, runPromise } from "@wpackages/effect/testing";

const stubEffect = createStub<number, Error>();

stubEffect.withError({ message: "Error" });

const result = await runPromise(stubEffect());
console.log(result); // { _tag: "Failure", error: { message: "Error" } }
```

## Spies

### Creating Spies

```typescript
import { createSpy, runPromise, succeed } from "@wpackages/effect/testing";

const effect = succeed(42);
const spy = createSpy(effect);

await runPromise(spy);

console.log(spy.getCalls()); // [{ args: [], result: 42 }]
console.log(spy.wasCalled()); // true
```

### Assertions

```typescript
import {
	assertCalled,
	assertCalledTimes,
	assertCalledWith,
	createSpy,
	runPromise,
	succeed,
} from "@wpackages/effect/testing";

const effect = succeed(42);
const spy = createSpy(effect);

await runPromise(spy);

// Assert called
assertCalled(spy);

// Assert called with specific args
assertCalledWith(spy, 1, 2, 3);

// Assert called specific times
assertCalledTimes(spy, 1);
```

## Testing Effects

### Testing Success

```typescript
import { runPromise, succeed } from "@wpackages/effect";

const effect = succeed(42);
const result = await runPromise(effect);

if (result._tag === "Success") {
	console.log(result.value); // 42
}
```

### Testing Failure

```typescript
import { fail, runPromise } from "@wpackages/effect";

const effect = fail({ message: "Error" });
const result = await runPromise(effect);

if (result._tag === "Failure") {
	console.log(result.error); // { message: "Error" }
}
```

### Testing Combinators

```typescript
import { flatMap, map, pipe, runPromise, succeed } from "@wpackages/effect";

const effect = pipe(
	succeed(1),
	map((x) => x * 2),
	flatMap((x) => succeed(x + 10)),
);

const result = await runPromise(effect);
console.log(result.value); // 12
```

## Testing Resilience

```typescript
import {
	exponential,
	retryWithJitter,
	runPromise,
	tryPromise,
} from "@wpackages/effect";

let attemptCount = 0;

const effect = retryWithJitter(
	tryPromise(
		() => {
			attemptCount++;
			if (attemptCount < 3) {
				throw new Error("Failed");
			}
			return Promise.resolve(42);
		},
		(error) => ({ message: "Error", error }),
	),
	{
		maxRetries: 5,
		baseDelay: 100,
		maxDelay: 1000,
		jitter: exponential(100, 2),
	},
);

const result = await runPromise(effect);
console.log(result.value); // 42
console.log(attemptCount); // 3
```

## Testing Streams

```typescript
import {
	filter,
	fromArray,
	map,
	runPromise,
	toArray,
} from "@wpackages/effect/stream";

const stream = fromArray([1, 2, 3, 4, 5]);
const processed = pipe(
	stream,
	map((x) => x * 2),
	filter((x) => x > 5),
	toArray,
);

const result = await runPromise(processed);
console.log(result.value); // [6, 8, 10]
```

## Testing Observables

```typescript
import { createObservable, filter, map } from "@wpackages/effect/observable";

const values: number[] = [];
const observable = createObservable((observer) => {
	[1, 2, 3, 4, 5].forEach((value) => observer.next(value));
	observer.complete();
});

const subscription = pipe(
	observable,
	map((x) => x * 2),
	filter((x) => x > 5),
).subscribe({
	next: (value) => values.push(value),
	error: (error) => console.error(error),
	complete: () => console.log("Completed"),
});

console.log(values); // [6, 8, 10]
```

## Best Practices

1. **Use mocks** สำหรับ isolating dependencies
2. **Use stubs** สำหรับ providing fixed values
3. **Use spies** สำหรับ tracking calls
4. **Test both success and failure** paths
5. **Test edge cases** และ boundary conditions
6. **Use assertions** สำหรับ verifying behavior
7. **Clean up** หลังจาก test
8. **Use descriptive test names** สำหรับ clarity
