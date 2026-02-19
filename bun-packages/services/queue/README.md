# @wpackages/queue

Functional queue system with bounded/unbounded queues for async operations using Effect-TS.

## Features

- **Bounded Queue**: Fixed capacity queue with backpressure handling
- **Unbounded Queue**: Dynamic capacity queue that grows as needed
- **Async Operations**: Non-blocking offer/take with Effect
- **Auto-cleanup**: withQueue pattern for resource management
- **Type Safe**: Full TypeScript support with generic types
- **Zero Dependencies**: Only peer dependency on Effect

## Installation

```bash
bun add @wpackages/queue
```

## Quick Start

```typescript
import { createBoundedQueue, offer, take, withQueue } from "@wpackages/queue";
import { Effect } from "effect";

const program = Effect.gen(function*() {
	const queue = createBoundedQueue<number>(10);
	yield* offer(queue, 42);
	const item = yield* take(queue);
	console.log(item);
});
```

## API Reference

| Function                          | Description                 |
| --------------------------------- | --------------------------- |
| `createBoundedQueue<A>(capacity)` | Create fixed-capacity queue |
| `createUnboundedQueue<A>()`       | Create dynamic queue        |
| `offer<A>(queue, item)`           | Add item to queue           |
| `take<A>(queue)`                  | Remove and return item      |
| `peek<A>(queue)`                  | View next item              |
| `size<A>(queue)`                  | Get queue size              |
| `isEmpty<A>(queue)`               | Check if empty              |
| `isFull<A>(queue)`                | Check if full               |
| `shutdown<A>(queue)`              | Close queue                 |
| `withQueue<A, B>(queue, use)`     | Auto-shutdown pattern       |

## Development

```bash
bun install
bun run dev
bun run test
bun run build
bun run verify
```

## License

MIT
