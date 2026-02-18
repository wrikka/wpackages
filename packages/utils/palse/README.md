# @wpackages/palse

> Experimental reactive core (signals/effects) aiming to be a better Vue alternative

A lightweight, type-safe reactivity system inspired by Vue 3's reactivity API but built from scratch with functional programming principles. Provides fine-grained reactivity with signals, computed values, effects, and watchers.

## ✨ Features

- 🎯 **Fine-grained Reactivity**: Signals with automatic dependency tracking
- ⚡ **Computed Values**: Lazy evaluation with smart caching
- 🔄 **Effects**: Auto-tracking side effects with cleanup support
- 📦 **Batching**: Batch multiple updates into a single effect run
- 🎭 **Reactive Objects**: Deep reactivity for objects and arrays
- 🔒 **Readonly**: Create immutable reactive proxies
- 👀 **Watchers**: Watch source values with old/new value access
- 🧹 **Cleanup**: Built-in cleanup registration for effects

## 📦 Installation

```bash
bun add @wpackages/palse
```

## 🚀 Quick Start

### Basic Signal

```typescript
import { signal, effect, computed } from "@wpackages/palse";

// Create a signal
const count = signal(0);

// Get and set values
console.log(count.get()); // 0
count.set(5);
count.set((v) => v + 1); // Functional update

// Effects auto-track dependencies
const stop = effect(() => {
  console.log(`Count is: ${count.get()}`);
});

count.set(10); // Logs: "Count is: 10"
stop(); // Stop the effect
```

### Computed Values

```typescript
import { signal, computed } from "@wpackages/palse";

const firstName = signal("John");
const lastName = signal("Doe");

// Computed auto-tracks dependencies
const fullName = computed(() => `${firstName.get()} ${lastName.get()}`);

console.log(fullName.get()); // "John Doe"
firstName.set("Jane");
console.log(fullName.get()); // "Jane Doe"
```

### Batching Updates

```typescript
import { signal, effect, batch } from "@wpackages/palse";

const a = signal(1);
const b = signal(2);

effect(() => {
  console.log(`Sum: ${a.get() + b.get()}`);
});

// Without batch: effect runs twice
// With batch: effect runs once
batch(() => {
  a.set(10);
  b.set(20);
});
```

### Reactive Objects

```typescript
import { reactive, readonly } from "@wpackages/palse";

// Deep reactive object
const state = reactive({
  user: { name: "John", age: 30 },
  items: [1, 2, 3]
});

state.user.name = "Jane"; // Triggers effects
state.items.push(4); // Triggers effects

// Create readonly proxy
const readonlyState = readonly(state);
// readonlyState.user.name = "X"; // Error!
```

### Watch & WatchEffect

```typescript
import { ref, watch, watchEffect } from "@wpackages/palse";

const count = ref(0);

// Watch with old/new value access
const stopWatch = watch(
  () => count.value,
  (newVal, oldVal) => {
    console.log(`Changed: ${oldVal} -> ${newVal}`);
  }
);

// WatchEffect for simpler cases
const stopWatchEffect = watchEffect(() => {
  console.log(`Count is: ${count.value}`);
});

// Control methods
stopWatch.pause();
stopWatch.resume();
stopWatch.stop();
```

## 📚 API Reference

### Reactivity

| Function | Description |
|----------|-------------|
| `signal<T>(initial)` | Create a reactive signal with `get()` and `set()` |
| `computed<T>(fn)` | Create a computed value with auto-tracking |
| `reactive<T>(obj)` | Create a deeply reactive proxy |
| `readonly<T>(obj)` | Create a readonly reactive proxy |
| `ref<T>(value)` | Create a ref with `.value` accessor |

### Effects

| Function | Description |
|----------|-------------|
| `effect(fn, options?)` | Run side effect, auto-track dependencies |
| `batch(fn)` | Batch multiple updates into one effect run |
| `untrack(fn)` | Run without tracking dependencies |

### Watchers

| Function | Description |
|----------|-------------|
| `watch(source, cb, options?)` | Watch source with old/new value access |
| `watchEffect(fn, options?)` | Auto-track and run effect on changes |

### Types

```typescript
// Signal with get/set interface
type Signal<T> = {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
};

// Ref with .value property
type Ref<T> = { value: T };

// Computed with getter
type Computed<T> = { get: () => T };

// Watch handle with control methods
type WatchHandle = {
  (): void;           // Call to stop
  pause: () => void;  // Pause watching
  resume: () => void; // Resume watching
  stop: () => void;   // Permanently stop
};
```

## 🛠️ Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run tests with coverage
bun test --coverage

# Build
bun run build

# Development mode
bun run dev

# Lint
bun run lint

# Format
bun run format

# Full verification
bun run verify
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Run development mode with watch |
| `build` | Build for Bun runtime |
| `test` | Run tests |
| `test:coverage` | Run tests with coverage |
| `lint` | Type check and lint |
| `format` | Format code with dprint |
| `verify` | Run all checks (format, lint, test, build) |

## 📄 License

MIT
