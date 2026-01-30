# @wpackages/effect

A lightweight, type-safe functional effect system better than Effect-TS.

## Features

- **Type-safe**: Full TypeScript type inference with no compromises
- **Lightweight**: Minimal bundle size, optimized for Bun
- **Simple API**: Easy to learn and use, no complex abstractions
- **Powerful**: Supports async, error handling, dependency injection, and resilience patterns
- **Composable**: Functional composition with pipe and combinators

## Installation

```bash
bun add @wpackages/effect
```

## Quick Start

```typescript
import { Effect } from "@wpackages/effect";

const program = Effect.gen(function*() {
  const n = yield* Effect.sync(() => Math.random());
  return n;
});

const result = await Effect.runPromise(program);
```

## Managing Side Effects (Resource)

Side effects that require cleanup (files, sockets, timers, etc.) should be modeled with `Resource` helpers.

```typescript
import { Effect, acquireRelease, using } from "@wpackages/effect";

type FileHandle = { close: () => Promise<void> };

const openFile = (path: string): Effect<FileHandle> =>
	Effect.sync(() => ({
		close: async () => {
			await Promise.resolve();
		},
	}));

const program = using(
	acquireRelease(
		openFile("./tmp.txt"),
		(handle) => Effect.sync(() => handle.close()),
	),
	() => Effect.sync(() => "done"),
);

await Effect.runPromise(program);
```

## Documentation

See [docs](./docs) for detailed documentation.
