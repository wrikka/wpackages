# @wts/test

A type-safe, functional assertion library for [Vitest](https://vitest.dev/).

## Installation

```bash
bun add @wts/test vitest
```

## Features

- 🎯 **Type-safe Assertions** - A fluent and chainable API with full TypeScript support.
- 🧩 **Functional Approach** - Built with pure functions in mind.
- 📊 **Readable API** - Expressive and readable assertions that make your tests easier to understand.
- 🎭 **Async Helpers** - Rich utilities for testing asynchronous code.
- 📸 **Snapshot Testing** - Integrated snapshot testing utilities.
- 🚀 **Modern** - Built for modern TypeScript and ESM.

## Quick Start

First, set up Vitest in your project. Then, you can use `@wts/test` for your assertions.

`example.test.ts`

```typescript
import { expect } from "@wts/test";
import { describe, it } from "vitest";

describe("Calculator", () => {
	it("should add numbers", () => {
		expect(2 + 2).toBe(4);
	});

	it("should handle negative numbers", () => {
		expect(-5 + 3).not.toBe(0);
	});
});
```

## Assertions

### Equality

```typescript
expect(value).toBe(expected); // Strict equality (===)
expect(value).toEqual(expected); // Deep equality
expect(value).not.toBe(unexpected); // Negation
```

### Truthiness

```typescript
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
```

### Type Checking

```typescript
expect(value).toBeType("string");
expect(value).toBeInstanceOf(MyClass);
```

### Collections

```typescript
expect(array).toContain(item);
expect(string).toContainString(substring);
```

### Schema Validation

Ensure your data structures conform to a `zod` schema.

```typescript
import { expect } from "@wts/test";
import { z } from "zod";

const UserSchema = z.object({
	id: z.string(),
	name: z.string(),
});

const userData = { id: "123", name: "John" };

expect(userData).toMatchSchema(UserSchema);
```

### Errors

```typescript
// For synchronous functions
expect(() => throwingFunction()).toThrow();

// For async functions
await expect(async () => rejectingFunction()).toThrowAsync();
```

### Promises

```typescript
await expect(promise).toResolve();
await expect(promise).toReject();
```

## Advanced Features

### Mocking and Spying

`@wts/test` provides utilities for creating mocks and spies.

```typescript
import { createMock, spyOn } from "@wts/test";

// Create a mock function
const mockFn = createMock<() => number>(() => 42);
mockFn.mockReturnValue(100);
expect(mockFn()).toBe(100);

// Spy on object methods
const obj = { getValue: () => 42 };
const spy = spyOn(obj, "getValue");
obj.getValue();
expect(spy.callCount).toBe(1);
```

### Property-Based Testing

Powered by [fast-check](https://fast-check.dev/), you can create property-based tests to check invariants in your code against a wide range of generated inputs.

```typescript
import { fc, it } from "@wts/test";

describe("Math properties", () => {
	it.prop(
		"should hold for all integers",
		[fc.integer(), fc.integer()],
		(a, b) => {
			expect(a + b).toBe(b + a);
		},
	);
});
```

### E2E Testing Helpers

Utilities to simplify end-to-end testing scenarios.

**`waitForElement`**

Waits for a specific element to appear in the DOM before proceeding.

```typescript
import { waitForElement } from "@wts/test";

// Wait for the element with id 'submit-btn' to appear
const button = await waitForElement("#submit-btn", { timeout: 10000 });
expect(button).not.toBeNull();
```

### Async Testing Utilities

A rich set of helpers for handling asynchronous operations in your tests.

```typescript
import { delay, retry, waitFor, withTimeout } from "@wts/test";

// Wait for a condition to be true
await waitFor(() => dataLoaded, { timeout: 5000 });

// Retry an async function
const result = await retry(fetchData, { retries: 3, delay: 1000 });

// Add a timeout to a promise
await withTimeout(longRunningTask(), 5000);
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Review (format, lint, test, build)
bun run review
```

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## License

MIT © Wrikka Team
