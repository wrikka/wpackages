# @wts/test

Type-safe, functional testing framework with unified unit and E2E testing capabilities.

## Installation

```bash
bun add @wts/test
```

## Features

- 🎯 **Type-safe** - Full TypeScript support with fluent API
- 🧩 **Functional** - Pure functions, no side effects
- ⚡ **Fast** - Parallel test execution
- 🔄 **Unified** - Unit and E2E testing in one framework
- 📊 **Better assertions** - Fluent, readable API
- 🎭 **Effect-TS** - Functional effects integration
- 📸 **Snapshots** - Built-in snapshot testing
- 🚀 **Modern** - Built for modern TypeScript

## Quick Start

```typescript
import { describe, it, expect } from '@wts/test';

describe('Calculator', () => {
  it('should add numbers', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle negative numbers', () => {
    expect(-5 + 3).toBe(-2);
  });
});
```

## Advanced Features

### Mocking and Spying

```typescript
import { createMock, spyOn } from '@wts/test';

// Create a mock function
const mockFn = createMock<() => number>(() => 42);
mockFn.mockReturnValue(100);
expect(mockFn()).toBe(100);

// Spy on object methods
const obj = { getValue: () => 42 };
const spy = spyOn(obj, 'getValue');
obj.getValue();
expect(spy.callCount).toBe(1);
```

### Async Testing

```typescript
import { waitFor, delay, retry, withTimeout } from '@wts/test';

// Wait for condition
await waitFor(() => dataLoaded, 5000);

// Retry with backoff
const result = await retry(fetchData, 3, 1000);

// Timeout protection
await withTimeout(longRunningTask(), 5000);

// Batch processing
await batch(items, processItem, 5);
```

### Snapshots

```typescript
import { matchSnapshot } from '@wts/test';

const result = { name: 'John', age: 30 };
expect(matchSnapshot(result, { name: 'user-snapshot' })).toBe(true);
```

### Custom Matchers

```typescript
import { createMatcher, typeMatcher } from '@wts/test';

const customMatcher = createMatcher(
  'isPositive',
  (actual, expected) => actual > 0,
  (actual) => `Expected ${actual} to be positive`
);
```

## Assertions

### Equality

```typescript
expect(value).toBe(expected);           // Strict equality
expect(value).toEqual(expected);        // Deep equality
expect(value).not.toBe(unexpected);     // Negation
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
expect(value).toBeType('string');
expect(value).toBeType('number');
expect(value).toBeType('object');
```

### Collections

```typescript
expect(array).toContain(item);
expect(string).toContainString(substring);
expect(array).not.toContain(item);
```

### Errors

```typescript
expect(() => throwingFunction()).toThrow();
expect(async () => rejectingFunction()).toThrowAsync();
```

### Promises

```typescript
expect(promise).toResolve();
expect(promise).toReject();
```

## Test Organization

### Describe Blocks

```typescript
describe('User Service', () => {
  describe('Create User', () => {
    it('should create a new user', () => {
      // test code
    });
  });

  describe('Delete User', () => {
    it('should delete an existing user', () => {
      // test code
    });
  });
});
```

### Hooks

```typescript
describe('Database', () => {
  before(async () => {
    // Setup before all tests
    await connectDatabase();
  });

  after(async () => {
    // Cleanup after all tests
    await disconnectDatabase();
  });

  it('should query data', () => {
    // test code
  });
});
```

## Fluent API

```typescript
// Readable, chainable assertions
expect(user.age)
  .toBeType('number')
  .not.toBe(0);

expect(users)
  .toContain(newUser)
  .not.toContain(deletedUser);
```

## Advanced Usage

### Custom Matchers

```typescript
const customMatcher = (actual, expected) => ({
  pass: actual === expected,
  message: () => `Expected ${actual} to equal ${expected}`
});
```

### Snapshots

```typescript
expect(result).toMatchSnapshot();
expect(result).toMatchSnapshot({ name: 'custom-snapshot' });
```

### Async Tests

```typescript
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

## Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun run test:coverage

# Run with UI
bun run test:ui

# Watch mode
bun run dev
```

## Performance

- **Parallel execution** - Tests run in parallel for speed
- **Lazy evaluation** - Assertions only evaluate when needed
- **Minimal overhead** - Pure functions, no unnecessary abstractions

## Comparison with vitest/Playwright

| Feature | @wts/test | vitest | Playwright |
|---------|-----------|--------|-----------|
| **Type Safety** | ✅ Full | ⚠️ Partial | ⚠️ Partial |
| **Fluent API** | ✅ Yes | ❌ No | ❌ No |
| **Functional** | ✅ Yes | ❌ No | ❌ No |
| **Unit Testing** | ✅ Yes | ✅ Yes | ❌ No |
| **E2E Testing** | ✅ Yes | ❌ No | ✅ Yes |
| **Mocking** | ✅ Built-in | ✅ Built-in | ⚠️ Limited |
| **Async Helpers** | ✅ Rich | ⚠️ Basic | ✅ Good |
| **Snapshots** | ✅ Yes | ✅ Yes | ❌ No |
| **Custom Matchers** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Effect-TS** | ✅ Yes | ❌ No | ❌ No |
| **Unified Framework** | ✅ Yes | ❌ No | ❌ No |
| **Learning Curve** | Low | Medium | High |
| **Performance** | ⚡ Fast | ⚡ Fast | 🐢 Slower |
| **Bundle Size** | 📦 Small | 📦 Medium | 📦 Large |

### Pros and Cons

#### @wts/test
**Pros:**
- Type-safe fluent API
- Functional programming approach
- Unified unit + E2E framework
- Small bundle size
- Easy to learn and use
- Effect-TS integration
- Rich async helpers

**Cons:**
- Newer project (less community)
- Fewer plugins/extensions
- Less browser automation

#### vitest
**Pros:**
- Mature and stable
- Large community
- Good performance
- Rich plugin ecosystem
- Familiar Jest-like API

**Cons:**
- Not fully type-safe
- No fluent API
- Not functional
- Separate from E2E testing
- Larger bundle

#### Playwright
**Pros:**
- Best for E2E testing
- Multi-browser support
- Good documentation
- Powerful automation

**Cons:**
- Not for unit testing
- Steep learning curve
- Larger bundle
- Slower execution
- Not type-safe

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

# Test coverage
bun run test:coverage
```

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## License

MIT © Wrikka Team

## Related Packages

- `@wts/resilience` - Resilience patterns and fault tolerance
- `@wts/functional` - Functional programming utilities
- `@wts/effect` - Effect-TS extensions
