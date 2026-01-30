# Getting Started

## Installation

```bash
bun add @wpackages/event-sourcing
```

## Basic Usage

### Event Store

```typescript
import { createEventStore } from "@wpackages/event-sourcing";

const eventStore = createEventStore<UserEvent>();

await eventStore.append("user-1", [
  {
    id: "evt-1",
    aggregateId: "user-1",
    type: "UserCreated",
    data: { name: "John", email: "john@example.com" },
    timestamp: Date.now(),
    version: 1,
  },
]);

const events = await eventStore.getEvents("user-1");
```

### Aggregate

```typescript
import { createRepository, AggregateRoot } from "@wpackages/event-sourcing";

class UserAggregate extends AggregateRoot<UserState, UserEvent> {
  apply(event: UserEvent): UserAggregate<UserState, UserEvent> {
    if (event.type === "UserCreated") {
      return new UserAggregate(
        this.id,
        { name: event.data.name, email: event.data.email },
        this.version + 1,
      );
    }
    return this;
  }
}

const repository = createRepository<UserState, UserEvent>(eventStore);
const user = await repository.load("user-1");
```

### Snapshot

```typescript
import { createSnapshotStore } from "@wpackages/event-sourcing";

const snapshotStore = createSnapshotStore<UserState>();

await snapshotStore.save({
  aggregateId: "user-1",
  version: 100,
  state: { name: "John", email: "john@example.com" },
  timestamp: Date.now(),
});

const snapshot = await snapshotStore.load("user-1");
```
