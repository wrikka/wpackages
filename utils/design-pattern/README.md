# @wpackages/design-pattern

This package provides implementations of common design patterns and related utilities, structured into modular, composable functions.

## Features

- **Core Selector**: A powerful, declarative way to handle complex conditional logic.
- **Async Support**: An async-native version of the selector for handling promises.
- **Higher-Order Functions**: Utilities to enhance selectors with features like memoization (caching) and debugging.
- **Composition**: Tools to chain selectors together to create powerful data transformation pipelines.

## Core Utilities

### `createSelector`

A utility function to select a value based on a series of conditions. It's like a `switch` statement but more powerful, allowing conditions to be functions and results to be values *or* functions that compute a value.

#### Usage

```typescript
import { createSelector } from '@wpackages/design-pattern';

const classifyNumber = createSelector(
  [
    { condition: (n: number) => n > 0, result: 'Positive' },
    { condition: (n: number) => n < 0, result: 'Negative' },
  ],
  'Zero'
);

console.log(classifyNumber(10)); // 'Positive'
```

## Async Utilities

### `createAsyncSelector`

Handles asynchronous conditions and results seamlessly. Perfect for when your logic depends on API calls, database queries, or other async operations.

#### Usage

```typescript
import { createAsyncSelector } from '@wpackages/design-pattern';

const checkPermissions = async (userId: number) => userId === 1;
const fetchUserName = async (userId: number) => 'Alice';

const getDashboard = createAsyncSelector(
  [{
    condition: checkPermissions,
    result: async (id) => `Welcome, Admin ${(await fetchUserName(id))}!`
  }],
  'Access Denied'
);

console.log(await getDashboard(1)); // 'Welcome, Admin Alice!'
```

## Higher-Order Functions (HOFs)

Enhance any selector with additional capabilities.

### `withMemoization`

Adds a cache to a selector, preventing re-computation for the same input. This is a great way to optimize performance-critical selectors.

#### Usage

```typescript
import { createSelector, withMemoization } from '@wpackages/design-pattern';

const expensiveSelector = createSelector([/* ... */]);
const fastSelector = withMemoization(expensiveSelector);

fastSelector(input); // First call is slow
fastSelector(input); // Subsequent calls with the same input are instant
```

### `withDebugging`

Wraps a selector to log its input and output to the console. Invaluable for tracing data flow and debugging complex chains.

#### Usage

```typescript
import { createSelector, withDebugging } from '@wpackages/design-pattern';

const mySelector = createSelector([/* ... */]);
const debuggedSelector = withDebugging(mySelector, 'MySelectorName');

debuggedSelector(input);
// Logs:
// [MySelectorName] Input: { ... }
// [MySelectorName] Output: "..."
```

## Composition Utilities

### `chainSelectors`

Creates a powerful data transformation pipeline by chaining multiple selectors together.

#### Usage

```typescript
import { chainSelectors } from '@wpackages/design-pattern';

const getName = (user: { name: string }) => user.name;
const toUpperCase = (s: string) => s.toUpperCase();

const getUpperName = chainSelectors(getName, toUpperCase);

console.log(getUpperName({ name: 'Alice' })); // 'ALICE'
```
