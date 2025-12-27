# reactivity

A high-performance, compiler-friendly reactivity library inspired by SolidJS.

## Philosophy

This library provides a set of primitives for building reactive systems with a focus on performance and predictability. By separating read and write operations (`[getter, setter]`), it enables fine-grained reactivity and opens the door for future compile-time optimizations, similar to SolidJS.

## Features

- **Compiler-Friendly**: `[getter, setter]` API inspired by SolidJS.
- **Fine-Grained Performance**: Updates are surgical and efficient.
- **Type-Safe**: Fully written in TypeScript.
- **Rich Primitives**: `createSignal`, `createMemo`, `createEffect`, `createResource`, `createSelector`.
- **Proxy-based Reactivity**: Optional `reactive` API for ergonomic state management.

## Core APIs

### `createSignal(initialValue, options?)`

Creates a new signal, the core reactive primitive. It returns a tuple with a getter and a setter.

```typescript
import { createSignal, createEffect } from 'reactivity';

const [count, setCount] = createSignal(0);

createEffect(() => console.log(count())); // Logs 0

setCount(1); // Logs 1
```

### `createMemo(fn, options?)`

Creates a derived, read-only signal that automatically re-evaluates when its dependencies change.

```typescript
const [count, setCount] = createSignal(2);
const doubled = createMemo(() => count() * 2);

console.log(doubled()); // 4
setCount(3);
console.log(doubled()); // 6
```

### `createEffect(fn)`

Runs a function and automatically re-runs it whenever its reactive dependencies change.

### `reactive(object)`

Creates a proxy-based reactive object for more natural state interaction.

```typescript
const state = reactive({ count: 0 });
effect(() => console.log(state.count));
state.count = 1;
```

## Advanced APIs

### `createResource(source)`

Manages asynchronous data fetching.

```typescript
const [user, { loading, error }] = createResource(() => fetchUser(1));
```

### `createSelector(source)`

Creates an efficient selector for checking if a key is 'selected' in a reactive list.

```typescript
const [selected, setSelected] = createSignal(1);
const isSelected = createSelector(selected);

console.log(isSelected(1)); // true
console.log(isSelected(2)); // false
```

### `onCleanup(fn)`

Registers a cleanup function within an effect.

### `batch(fn)`

Groups multiple updates into a single reaction.

### `watch(source, callback)`

Watches a source for changes and runs a callback.