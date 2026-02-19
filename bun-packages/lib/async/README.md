# @wpackages/async

Async utilities with retry, parallel, queue, and stream support.

## Installation

```bash
bun install @wpackages/async
```

## Features

- **defer** - Create deferred promises
- **sleep** - Sleep with AbortSignal support
- **withTimeout** - Add timeout to promises
- **retry** - Retry with exponential/linear backoff and jitter
- **parallel** - Run tasks in parallel with concurrency limit
- **series** - Run tasks in sequence
- **waterfall** - Waterfall pattern (output → input next)
- **AsyncQueue** - Priority queue for async tasks
- **debounce** - Debounce async functions
- **throttle** - Throttle async functions
- **mapLimit** - Map with concurrency limit
- **filterLimit** - Filter with concurrency limit
- **memoizeAsync** - Memoize async results with TTL

## Usage

### Basic

```typescript
import { sleep, withTimeout, retry } from "@wpackages/async";

// Sleep with cancellation
await sleep(1000, { signal: abortController.signal });

// Timeout
const result = await withTimeout(fetch(url), 5000, { message: "Request timed out" });

// Retry with backoff
const data = await retry(() => fetch(url).then(r => r.json()), {
  maxAttempts: 3,
  delay: 1000,
  backoff: "exponential",
  jitter: true,
});
```

### Parallel Execution

```typescript
import { parallel, series, mapLimit } from "@wpackages/async";

// Parallel with limit
const results = await parallel(
  [task1, task2, task3, task4, task5],
  { concurrency: 2 }
);

// Map with limit
const processed = await mapLimit(items, 3, async (item) => {
  return await processItem(item);
});
```

### Queue

```typescript
import { createQueue } from "@wpackages/async";

const queue = createQueue({ concurrency: 5 });

const result1 = await queue.enqueue({
  id: "task-1",
  run: () => fetchData(1),
  priority: 10, // Higher priority runs first
});

const result2 = await queue.enqueue({
  id: "task-2",
  run: () => fetchData(2),
  priority: 5,
});
```

## License

MIT
