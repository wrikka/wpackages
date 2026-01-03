# API Reference for @wpackages/queue

This document provides a reference for the public API of the `@wpackages/queue` package.

## Functions

### `createQueueManager<T_OUT, E>(name, config?)`

Creates and returns a new `QueueManager` instance.

-   **`name`**: `string` - A unique name for the queue.
-   **`config`?**: `QueueConfig` - Optional configuration for the queue.
-   **Returns**: `Effect.Effect<QueueManager<T_OUT, E>>`

**Example:**

```typescript
import { createQueueManager } from "@wpackages/queue";

const manager = await Effect.runPromise(createQueueManager("my-queue"));
```

### `processNext<T_OUT, E>(manager)`

Processes the next available task from the pending list in the queue.

-   **`manager`**: `QueueManager<T_OUT, E>` - The queue manager instance.
-   **Returns**: `Effect.Effect<void, QueueEmptyError | QueueFullError | StateInvalidError>` - An effect that completes when the task is moved to the running state and starts processing. It fails if the queue is empty or full.

## Interfaces

### `QueueManager<T_OUT, E>`

An interface representing the queue manager. It holds the state and provides methods to interact with the queue.

-   **`state`**: `Ref.Ref<TaskQueue<T_OUT, E>>` - The reactive state of the queue.
-   **`enqueue(task)`**: `(task: Task<any, T_OUT, E>) => Effect.Effect<void>` - Adds a task to the pending list.
-   **`getStats`**: `Effect.Effect<{...}>` - Returns statistics about the queue (pending, running, completed, failed, total).
-   **`clearCompleted`**: `Effect.Effect<void>` - Clears the list of completed tasks.
-   **`clearFailed`**: `Effect.Effect<void>` - Clears the list of failed tasks.

## Types & Config

### `QueueConfig`

An interface for the queue configuration object.

-   `maxConcurrent?`: `number` (Default: `5`)
-   `maxRetries?`: `number` (Default: `3`)
-   `retryDelay?`: `number` (ms, Default: `1000`)
-   `timeout?`: `number` (ms, Default: `30000`)
-   `priority?`: `boolean` (Default: `false`)

### `TaskQueue<T_OUT, E>`

Represents the complete state of the queue at any given time.

-   `name`: `string`
-   `config`: `QueueConfig`
-   `pending`: `Task[]`
-   `running`: `Task[]`
-   `completed`: `TaskResult[]`
-   `failed`: `TaskResult[]`

## Errors

Custom errors are provided as `Data.TaggedError` from `effect`.

-   **`QueueEmptyError`**: Thrown by `processNext` when there are no tasks in the pending list.
-   **`QueueFullError`**: Thrown by `processNext` when the number of running tasks has reached `maxConcurrent`.
-   **`StateInvalidError`**: Thrown if the queue state becomes inconsistent internally.
-   **`TimeoutError`**: Thrown by the task runner if a task exceeds its configured timeout.
