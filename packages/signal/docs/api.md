# API Reference

This document provides a detailed reference for the core and advanced APIs available in `@wpackages/signal`.

## Core APIs

### `createSignal(initialValue, options?)`

Creates the core reactive primitive. It returns a tuple containing a getter and a setter function.

- **`initialValue`**: The initial value of the signal.
- **`options.equals`**: A function to compare the old and new values to prevent unnecessary updates. Defaults to `===`.
- **Returns**: `[get: () => T, set: (value: T) => void]`

### `createMemo(fn, options?)`

Creates a derived, read-only signal that automatically re-evaluates when its dependencies change.

- **`fn`**: The function to re-evaluate. Its return value becomes the memo's value.
- **`options.equals`**: A function to compare values.
- **Returns**: `() => T` (A getter function for the memoized value)

### `createEffect(fn)`

Runs a function and automatically re-runs it whenever its reactive dependencies change. Useful for side effects.

- **`fn`**: The effect function to run.

### `reactive(object)`

Creates a proxy-based reactive object. This provides a more ergonomic API for working with objects, where you can read and write properties directly.

- **`object`**: The plain JavaScript object to make reactive.
- **Returns**: A reactive proxy of the original object.

## Advanced APIs

### `createResource(source)`

Manages asynchronous data fetching. It returns a signal for the data and an object with `loading` and `error` states.

### `createSelector(source)`

Creates an efficient selector for checking if a key is 'selected' in a reactive source.

### `onCleanup(fn)`

Registers a cleanup function that runs before the next execution of an effect or when a memo is disposed.

### `batch(fn)`

Groups multiple signal updates into a single reaction, preventing intermediate computations and effects from running.

### `watch(source, callback)`

Watches a reactive source for changes and runs a callback function, providing both the new and previous values.
