# @wpackages/worker

Web Worker management for Bun with task pooling and concurrent execution.

## Features

- ⚡️ **Worker Pool**: Manage multiple Web Workers efficiently with automatic task distribution
- 🏃 **Task Runner**: Execute tasks concurrently with configurable concurrency limits and timeouts
- 🔄 **Queue Management**: Automatic queue processing when workers are busy
- 🛡️ **Error Handling**: Built-in error handling and task rejection
- 📊 **Statistics**: Track running and queued tasks
- 💪 **Type-Safe**: Full TypeScript support

## Installation

```bash
bun add @wpackages/worker
```

## Usage

### Worker Pool

Worker Pool manages multiple Web Workers and distributes tasks automatically:

```typescript
import { createWorkerPool } from "@wpackages/worker";

const pool = createWorkerPool({
  maxWorkers: 4,
  idleTimeout: 30000,
});

await pool.initialize();

// Execute CPU-intensive tasks in parallel
const result = await pool.execute(() => {
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i;
  }
  return sum;
});

await pool.dispose();
```

### Task Runner

Task Runner provides concurrent task execution with timeout support:

```typescript
import { createTaskRunner } from "@wpackages/worker";

const runner = createTaskRunner({
  maxConcurrent: 10,
  timeout: 5000,
});

// Execute tasks with concurrency control
const result = await runner.execute(() => {
  return fetchData();
});

// Get statistics
console.log(runner.getStats());
// { running: 0, queued: 0 }
```

## API Reference

### createWorkerPool

Creates a new Worker Pool instance.

```typescript
interface WorkerPoolConfig {
  readonly maxWorkers: number;      // Maximum number of workers
  readonly idleTimeout: number;     // Idle timeout in milliseconds
}

function createWorkerPool(config: WorkerPoolConfig): WorkerPool
```

#### Methods

- `initialize()`: Initialize the worker pool
- `execute<A, E>(fn: () => Promise<A>): Promise<A>`: Execute a task
- `dispose()`: Dispose all workers

### createTaskRunner

Creates a new Task Runner instance.

```typescript
interface TaskRunnerConfig {
  readonly maxConcurrent: number;   // Maximum concurrent tasks
  readonly timeout: number;         // Task timeout in milliseconds
}

function createTaskRunner(config: TaskRunnerConfig): TaskRunner
```

#### Methods

- `execute<A>(fn: () => Promise<A>): Promise<A>`: Execute a task
- `getStats()`: Get running and queued task statistics

## Examples

### Parallel Processing

```typescript
import { createWorkerPool } from "@wpackages/worker";

const pool = createWorkerPool({
  maxWorkers: 4,
  idleTimeout: 30000,
});

await pool.initialize();

// Process multiple tasks in parallel
const results = await Promise.all(
  Array.from({ length: 10 }, (_, i) =>
    pool.execute(() => {
      // CPU-intensive computation
      return heavyComputation(i);
    })
  )
);

await pool.dispose();
```

### Concurrent API Calls

```typescript
import { createTaskRunner } from "@wpackages/worker";

const runner = createTaskRunner({
  maxConcurrent: 10,
  timeout: 5000,
});

// Make concurrent API calls with rate limiting
const results = await Promise.all(
  Array.from({ length: 10 }, (_, i) =>
    runner.execute(() => fetch(`/api/data/${i}`).then(r => r.json()))
  )
);
```

## Platform

- **Bun**: Optimized for Bun runtime
- **Node.js**: Compatible with Node.js

## Status

✅ **Stable**: Production-ready and actively maintained

## Documentation

✅ **Full**: Complete documentation with examples

## Testing

✅ **Vitest**: Full Vitest test suite

## Size

**S**: Small (< 100 KB)

## License

MIT
