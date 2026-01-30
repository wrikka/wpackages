# Getting Started

## Installation

```bash
bun add @wpackages/worker
```

## Basic Usage

### Worker Pool

```typescript
import { createWorkerPool } from "@wpackages/worker";

const pool = createWorkerPool({
  maxWorkers: 4,
  idleTimeout: 30000,
});

await pool.initialize();

const result = await pool.execute(() => {
  // CPU-intensive task
  return heavyComputation();
});

await pool.dispose();
```

### Task Runner

```typescript
import { createTaskRunner } from "@wpackages/worker";

const runner = createTaskRunner({
  maxConcurrent: 10,
  timeout: 5000,
});

const result = await runner.execute(() => {
  return fetchData();
});

console.log(runner.getStats());
```
