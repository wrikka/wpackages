# task

> Task orchestration and scheduling - Workflows, queues, and parallel execution

Functional task management library for scheduling, queuing, and orchestrating complex workflows.

[![npm version](https://img.shields.io/npm/v/task.svg)](https://www.npmjs.com/package/task)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✅ **Task Queues** - Priority queues with concurrency control
- ✅ **Scheduling** - Cron-like scheduling (daily, weekly, interval, cron expressions)
- ✅ **Workflows** - DAG-based workflows with dependencies and data passing
- ✅ **Transactions** - Atomic operations with rollback support
- ✅ **Parallel Execution** - Execute independent workflow steps in parallel
- ✅ **Resilience Patterns** - Retry, timeout, circuit breaker, bulkhead, and rate limiting
- ✅ **Type-safe** - Full TypeScript support with comprehensive type definitions
- ✅ **Functional** - Pure functions, immutable data structures
- ✅ **Zero External Dependencies** - Only depends on program
- ✅ **Error Handling** - Comprehensive error handling with Result pattern

## Installation

```sh
# Using npm
npm install task

# Using yarn
yarn add task

# Using pnpm
pnpm add task

# Using bun
bun add task
```

## Quick Start

### 1. Task & Queue

Create tasks and add them to a queue for processing.

```typescript
import { createTask, createQueue, enqueue, processNext } from 'task';
import { ok } from 'program';

// Create a task
const task = createTask('fetch-user', async () => {
  // const user = await fetchUser(123);
  return ok({ id: 123, name: 'John' });
});

// Create a queue
let queue = createQueue('main');

// Enqueue task
const enqueueResult = enqueue(queue, task);
if (enqueueResult.ok) {
  queue = enqueueResult.value;
}

// Process the next task manually
const processResult = await processNext(queue);
if (processResult.ok) {
  queue = processResult.value;
}
```

### 2. Queue Worker

For continuous, automatic queue processing, use a `QueueWorker`.

```typescript
import { createQueueWorker } from 'task';

const worker = createQueueWorker(queue);

worker.on('task:complete', (result) => {
  console.log(`Task ${result.taskId} completed successfully!`);
});

worker.on('task:fail', (result) => {
  console.error(`Task ${result.taskId} failed.`);
});

worker.start();

// You can stop the worker anytime
// worker.stop();
```

### 3. Scheduling (with Timezone)

Schedule tasks to run at specific times, with timezone support.

```typescript
import { parseSchedule, type Schedule } from 'task';

// Daily at 9:00 AM in New York
const dailySchedule: Schedule = {
  type: 'daily',
  time: '09:00',
  timezone: 'America/New_York'
};

const nextRun = parseSchedule(dailySchedule);
if (nextRun.ok) {
  console.log('Next run in New York time:', nextRun.value);
}

// Cron expression (every day at midnight)
const cronSchedule: Schedule = {
  type: 'cron',
  expression: '0 0 * * *'
};
```

> **Note on Cron Expressions:** The current cron parser is basic. It supports numbers and `*` but not ranges (`1-5`), steps (`*/15`), or lists (`1,2,3`).

### 4. Workflows (with Data Passing)

Orchestrate complex, multi-step processes. Steps can now receive output from their dependencies.

```typescript
import { createWorkflow, executeWorkflow, createTask } from 'task';
import { ok } from 'program';

// Step 1: Fetch user data
const fetchUser = createTask('fetch-user', async () => {
  console.log('Fetching user...');
  return ok({ id: 1, name: 'John Doe' });
});

// Step 2: Process the user data
const processUser = createTask('process-user', async (user: { id: number, name: string }) => {
  console.log(`Processing ${user.name}...`);
  return ok({ ...user, processed: true });
});

// Create workflow steps
const step1 = { id: 'fetch', task: fetchUser };
const step2 = {
  id: 'process',
  task: processUser,
  dependsOn: ['fetch'], // Depends on step 1
  input: (context: Map<string, any>) => context.get('fetch'), // Use output from step 1 as input
};

// Create and execute the workflow
const workflow = createWorkflow('user-pipeline', [step1, step2]);
const result = await executeWorkflow(workflow);

if (result.ok) {
  console.log('Workflow complete! Final result:', result.value.get('process'));
  // Expected output: { id: 1, name: 'John Doe', processed: true }
} else {
  console.error('Workflow failed:', result.error);
}
```

### 5. Transactions

Group multiple operations into a single atomic transaction with automatic rollback on failure.

```typescript
import { createTransaction, executeTransaction } from 'task';

// Create transaction steps
const transaction = createTransaction([
  {
    execute: async () => { /* await database.insert('users', user); */ },
    rollback: async () => { /* await database.delete('users', user.id); */ }
  },
  {
    execute: async () => { /* await database.insert('profiles', profile); */ },
    rollback: async () => { /* await database.delete('profiles', profile.id); */ }
  }
]);

// Execute transaction
const result = await executeTransaction(transaction);
if (result.ok) {
  console.log('Transaction committed');
} else {
  console.error('Transaction rolled back:', result.error);
}
```

## Core Concepts

### Tasks

Tasks are the basic units of work in task. They are asynchronous functions that return a Result type.

```typescript
import { createTask } from 'task';
import { ok, err } from 'program';

const task = createTask(
  'example-task',
  async (input: string) => {
    try {
      const result = await processInput(input);
      return ok(result);
    } catch (error) {
      return err(new Error('Processing failed'));
    }
  },
  {
    priority: 'high',
    timeout: 5000,
    retries: 3
  }
);
```

### Queues

Queues manage the execution of tasks with configurable concurrency, retry policies, and priority handling.

```typescript
import { createQueue } from 'task';

const queue = createQueue('worker-queue', {
  maxConcurrent: 10,
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  priority: true
});
```

### Scheduling

Schedule tasks to run at specific intervals or times, with timezone support.

```typescript
import { parseSchedule } from 'task';

// Different schedule types
const schedules = {
  daily: { type: 'daily', time: '09:00' },
  weekly: { type: 'weekly', dayOfWeek: 1, time: '10:00' },
  interval: { type: 'interval', interval: 5 * 60 * 1000 },
  cron: { type: 'cron', expression: '0 0 * * *' },
  once: { type: 'once' }
};
```

### Workflows

Workflows orchestrate multiple tasks with dependencies and data flow between steps.

```typescript
import { createWorkflow, executeWorkflow } from 'task';

const workflow = createWorkflow('data-pipeline', [
  {
    id: 'fetch',
    name: 'Fetch Data',
    task: fetchTask
  },
  {
    id: 'process',
    name: 'Process Data',
    task: processTask,
    dependsOn: ['fetch'],
    input: (context) => context.get('fetch')
  },
  {
    id: 'save',
    name: 'Save Data',
    task: saveTask,
    dependsOn: ['process'],
    input: (context) => context.get('process')
  }
], {
  parallel: true,
  transactional: true
});
```

### Transactions

Transactions ensure atomicity of operations with automatic rollback on failure.

```typescript
import { createTransaction, executeTransaction } from 'task';

const transaction = createTransaction([
  {
    execute: async () => {
      await database.insert('users', userData);
    },
    rollback: async () => {
      await database.delete('users', userData.id);
    }
  },
  {
    execute: async () => {
      await database.insert('profiles', profileData);
    },
    rollback: async () => {
      await database.delete('profiles', profileData.id);
    }
  }
]);

const result = await executeTransaction(transaction);
```

## API Reference

### Task Management

```typescript
// Create a task
createTask(name, execute, options?)

// Task options
interface TaskOptions {
  id?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  timeout?: number; // milliseconds
  retries?: number;
  metadata?: Record<string, unknown>;
}
```

### Queue Operations

```typescript
// Create a queue
createQueue(name, config?)

// Queue config
interface QueueConfig {
  maxConcurrent?: number; // default: 5
  maxRetries?: number;    // default: 3
  retryDelay?: number;    // default: 1000ms
  timeout?: number;       // default: 30000ms
  priority?: boolean;     // default: false
}

// Queue operations
enqueue(queue, task)         // Add task to queue
processNext(queue)           // Process next task
getQueueStats(queue)         // Get queue statistics
clearCompleted(queue)        // Remove completed tasks
clearFailed(queue)           // Remove failed tasks
```

### Scheduling

```typescript
// Schedule types
interface Schedule {
  type: 'cron' | 'interval' | 'once' | 'daily' | 'weekly';
  expression?: string;  // cron expression
  interval?: number;    // milliseconds
  time?: string;        // "HH:MM" for daily/weekly
  dayOfWeek?: number;   // 0-6 for weekly
  timezone?: string;
}

// Scheduling operations
parseSchedule(schedule, from?)  // Get next run time
shouldRun(task, now?)          // Check if task should run
updateNextRun(task)            // Update task's next run time
```

### Workflows

```typescript
// Create a workflow
createWorkflow(name, steps, options?)

// Workflow options
interface WorkflowOptions {
  id?: string;
  parallel?: boolean;      // Run independent steps in parallel
  transactional?: boolean; // Rollback on failure
}

// Workflow step
interface WorkflowStep {
  id: string;
  name: string;
  task: Task;
  input?: (context: Map<string, any>) => any;
  dependsOn?: string[]; // step IDs
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  rollback?: () => Promise<void>;
}

// Workflow operations
executeWorkflow(workflow)   // Execute workflow
validateWorkflow(workflow)  // Validate workflow structure
```

### Transactions

```typescript
// Create a transaction
createTransaction(steps)

// Transaction step
interface TransactionStep {
  execute: () => Promise<void>;
  rollback: () => Promise<void>;
}

// Transaction operations
executeTransaction(transaction)  // Execute with auto-rollback
rollbackTransaction(transaction) // Manual rollback
```

### Resilience Patterns

```typescript
// Retry pattern
withTaskRetry(task, retryOptions)

// Retry options
interface RetryOptions {
  maxAttempts?: number;     // default: 3
  strategy?: 'fixed' | 'linear' | 'exponential'; // default: 'exponential'
  baseDelay?: number;       // default: 1000ms
  maxDelay?: number;        // default: 30000ms
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

// Timeout pattern
withTaskTimeout(task, timeoutMs)

// Circuit breaker pattern
withTaskCircuitBreaker(task, threshold)

// Bulkhead pattern
withTaskBulkhead(task, limit)

// Rate limiting pattern
withTaskRateLimit(task, rps) // requests per second
```

## Error Handling

All errors follow the `Result<T, E>` pattern:

```typescript
import { taskError, queueError, scheduleError, workflowError } from 'task';

// Task error
taskError('Task failed', {
  taskId: 'task-123',
  taskName: 'fetch-data',
  code: 'EXECUTION_FAILED',
  cause: error
});

// Queue error
queueError('Queue is full', {
  queueName: 'main',
  code: 'QUEUE_FULL'
});

// Schedule error
scheduleError('Invalid cron expression', {
  schedule,
  code: 'INVALID_CRON'
});

// Workflow error
workflowError('Circular dependency detected', {
  workflowId: 'workflow-123',
  stepId: 'step-1',
  code: 'CIRCULAR_DEPENDENCY'
});
```

## Best Practices

### 1. Always Handle Results

```typescript
const result = await processNext(queue);
if (!result.ok) {
  console.error('Queue processing failed:', result.error);
  return;
}
queue = result.value;
```

### 2. Use Priority Queues for Important Tasks

```typescript
const queue = createQueue('critical', {
  priority: true,
  maxConcurrent: 10
});

const importantTask = createTask('urgent', execute, {
  priority: 'critical'
});
```

### 3. Set Timeouts and Retries

```typescript
const task = createTask('api-call', execute, {
  timeout: 5000,
  retries: 3
});
```

### 4. Validate Workflows Before Execution

```typescript
const validation = validateWorkflow(workflow);
if (!validation.ok) {
  throw new Error(`Invalid workflow: ${validation.error.message}`);
}
```

### 5. Use Transactions for Atomic Operations

```typescript
const transaction = createTransaction([
  { execute: step1, rollback: undo1 },
  { execute: step2, rollback: undo2 }
]);

const result = await executeTransaction(transaction);
```

### 6. Handle Timezones Correctly

```typescript
const schedule: Schedule = {
  type: 'daily',
  time: '09:00',
  timezone: 'America/New_York' // Always specify timezone for consistent behavior
};
```

### 7. Apply Resilience Patterns

Add resilience patterns to tasks for improved fault tolerance:

```typescript
import { 
  withTaskRetry, 
  withTaskTimeout, 
  withTaskCircuitBreaker,
  withTaskBulkhead,
  withTaskRateLimit
} from 'task';

// Add retry pattern
const resilientTask = withTaskRetry(
  createTask('fetch-data', async () => {
    // Task implementation
  }),
  {
    maxAttempts: 3,
    strategy: 'exponential',
    baseDelay: 1000
  }
);

// Add timeout pattern
const timeoutTask = withTaskTimeout(
  createTask('slow-operation', async () => {
    // Task implementation
  }),
  5000 // 5 second timeout
);

// Combine multiple resilience patterns
const highlyResilientTask = withTaskRateLimit(
  withTaskBulkhead(
    withTaskCircuitBreaker(
      withTaskTimeout(
        withTaskRetry(
          createTask('complex-operation', async () => {
            // Task implementation
          }),
          {
            maxAttempts: 3,
            strategy: 'exponential',
            baseDelay: 500
          }
        ),
        5000 // 5 second timeout
      ),
      3 // Trip after 3 failures
    ),
    10 // Allow maximum 10 concurrent executions
  ),
  5 // Limit to 5 requests per second
);
```

### 8. Apply Resilience Patterns Appropriately

Use resilience patterns based on your specific needs:

```typescript
// Use retry for operations that might fail temporarily
const apiTask = withTaskRetry(createTask('api-call', apiCall), {
  maxAttempts: 3,
  strategy: 'exponential'
});

// Use timeout for operations that might hang
const dbTask = withTaskTimeout(createTask('db-query', dbQuery), 5000);

// Use circuit breaker for external services that might fail
const externalServiceTask = withTaskCircuitBreaker(
  createTask('external-service', externalServiceCall), 
  5 // Trip after 5 failures
);

// Use bulkhead to limit concurrent resource-intensive operations
const fileProcessingTask = withTaskBulkhead(
  createTask('file-processing', fileProcessing), 
  3 // Maximum 3 concurrent executions
);

// Use rate limiting to avoid overwhelming services
const highFrequencyTask = withTaskRateLimit(
  createTask('high-frequency', highFrequencyOperation), 
  10 // Maximum 10 requests per second
);
```

## Advanced Usage

### Parallel Workflow Execution

Execute independent workflow steps in parallel for better performance:

```typescript
const workflow = createWorkflow('parallel-pipeline', [
  { id: 'fetch-user', task: fetchUserTask },
  { id: 'fetch-orders', task: fetchOrdersTask },
  { 
    id: 'process-data', 
    task: processDataTask,
    dependsOn: ['fetch-user', 'fetch-orders'],
    input: (context) => ({
      user: context.get('fetch-user'),
      orders: context.get('fetch-orders')
    })
  }
], {
  parallel: true // Enable parallel execution
});
```

### Transactional Workflows

Ensure atomicity of workflow execution with rollback support:

```typescript
const workflow = createWorkflow('transactional-pipeline', [
  {
    id: 'create-user',
    task: createUserTask,
    rollback: async () => {
      await deleteUser();
    }
  },
  {
    id: 'create-profile',
    task: createProfileTask,
    rollback: async () => {
      await deleteProfile();
    }
  }
], {
  transactional: true // Enable transactional behavior
});
```

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

MIT © [WTS Framework](LICENSE)