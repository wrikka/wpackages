# @wpackages/store

A tiny, framework-agnostic state management library inspired by Nanostores, designed for simplicity, performance, and type safety.

## Features

- **Atomic by Design**: Build your state from small, isolated stores (atoms).
- **Extremely Lightweight**: Minimal footprint with zero dependencies.
- **Framework Agnostic**: Works with any UI framework (React, Vue, Svelte, etc.) or vanilla JavaScript.
- **Type-Safe**: Fully written in TypeScript for a great developer experience.
- **Computed Values**: Easily create derived stores that react to changes in other stores.
- **Lifecycle Events**: Use `onMount` to manage side effects like API calls or event listeners when a store becomes active.

## Comparison with Other Libraries

`@w/store` is heavily inspired by Nanostores and shares its core philosophy: a tiny, framework-agnostic, atomic state management library.

Compared to other popular libraries:

-   **vs. Zustand/Jotai**: These are excellent, popular libraries in the React ecosystem. However, `@w/store` is designed from the ground up to be framework-agnostic and have the smallest possible footprint, making it a more flexible choice for projects outside of React or where bundle size is the absolute top priority.
-   **vs. Valtio**: Valtio uses an intuitive proxy-based model. `@w/store` opts for a more explicit, functional API with `get()` and `set()` methods, which can lead to more predictable state updates.

A more detailed, feature-by-feature comparison can be found in [`docs/comparison.md`](./docs/comparison.md).

## Getting Started

This is an internal package within the `wpackages` monorepo.

## API

### `atom(initialValue)`

Creates a store for any single value, like a number, string, or array.

```typescript
import { atom } from '@wpackages/store';

const counter = atom(0);

// Read the value
console.log(counter.get()); // -> 0

// Update the value
counter.set(1);

// Subscribe to changes
const unsubscribe = counter.subscribe(value => {
  console.log('Counter changed to:', value);
});

counter.set(2); // -> Logs: Counter changed to: 2

// Unsubscribe when done
unsubscribe();
```

### `map(initialValue)`

Creates a store for object values. It includes a `setKey` method for efficiently updating a single property.

```typescript
import { map } from '@wpackages/store';

const user = map({ name: 'John', age: 30 });

// Update a single key
user.setKey('age', 31);

// Subscribe to changes
user.subscribe((value, oldValue, changedKey) => {
  console.log('User updated!');
  if (changedKey === 'age') {
    console.log('Age changed to:', value.age);
  }
});

user.setKey('age', 32); // -> Logs: User updated! Age changed to: 32
```

### `computed(stores, computerFn)`

Creates a readonly store whose value is derived from one or more other stores.

```typescript
import { atom, computed } from '@wpackages/store';

const firstName = atom('John');
const lastName = atom('Doe');

const fullName = computed([firstName, lastName], (first, last) => {
  return `${first} ${last}`;
});

console.log(fullName.get()); // -> John Doe

firstName.set('Jane');
console.log(fullName.get()); // -> Jane Doe
```

### `onMount(store, callback)`

Runs a callback when a store gets its first subscriber. It's perfect for managing side effects.

The callback can optionally return a cleanup function (`onUnmount`) that runs when the last subscriber unsubscribes.

```typescript
import { atom, onMount } from '@wpackages/store';

const timer = atom(0);

onMount(timer, () => {
  console.log('Timer store is now active!');
  const interval = setInterval(() => {
    timer.set(timer.get() + 1);
  }, 1000);

  // Return a cleanup function
  return () => {
    console.log('Timer store is no longer active.');
    clearInterval(interval);
  };
});

// The onMount callback runs here
const unsubscribe = timer.subscribe(value => {
  console.log('Tick:', value);
});

// After some time...
// The onUnmount callback runs here
unsubscribe();
```
