import { createEventStore, createRepository, AggregateRoot, createSnapshotStore } from "@wpackages/event-sourcing";

// Event store example
const eventStoreExample = async () => {
  console.log("=== Event Store Example ===\n");

  const eventStore = createEventStore<{
    type: string;
    data: unknown;
  }>();

  await eventStore.append("user-1", [
    {
      id: "evt-1",
      aggregateId: "user-1",
      type: "UserCreated",
      data: { name: "John", email: "john@example.com" },
      timestamp: Date.now(),
      version: 1,
    },
    {
      id: "evt-2",
      aggregateId: "user-1",
      type: "UserUpdated",
      data: { name: "John Doe" },
      timestamp: Date.now(),
      version: 2,
    },
  ]);

  const events = await eventStore.getEvents("user-1");
  console.log("Events:", events);

  const eventsFromVersion = await eventStore.getEventsFromVersion("user-1", 1);
  console.log("Events from version 1:", eventsFromVersion);
};

// Aggregate example
const aggregateExample = async () => {
  console.log("\n=== Aggregate Example ===\n");

  interface UserState {
    name: string;
    email: string;
  }

  interface UserEvent {
    id: string;
    aggregateId: string;
    type: string;
    data: unknown;
    timestamp: number;
    version: number;
  }

  class UserAggregate extends AggregateRoot<UserState, UserEvent> {
    apply(event: UserEvent): UserAggregate<UserState, UserEvent> {
      if (event.type === "UserCreated") {
        const data = event.data as { name: string; email: string };
        return new UserAggregate(
          this.id,
          { name: data.name, email: data.email },
          this.version + 1,
        );
      }
      if (event.type === "UserUpdated") {
        const data = event.data as { name: string };
        return new UserAggregate(
          this.id,
          { ...this.state, name: data.name },
          this.version + 1,
        );
      }
      return this;
    }
  }

  const eventStore = createEventStore<UserEvent>();
  const repository = createRepository<UserState, UserEvent>(eventStore);

  // Create user
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

  const user = await repository.load("user-1");
  console.log("User:", user);
};

// Snapshot example
const snapshotExample = async () => {
  console.log("\n=== Snapshot Example ===\n");

  interface UserState {
    name: string;
    email: string;
  }

  const snapshotStore = createSnapshotStore<UserState>();

  await snapshotStore.save({
    aggregateId: "user-1",
    version: 100,
    state: { name: "John", email: "john@example.com" },
    timestamp: Date.now(),
  });

  const snapshot = await snapshotStore.load("user-1");
  console.log("Snapshot:", snapshot);
};

// Run all examples
const main = async () => {
  await eventStoreExample();
  await aggregateExample();
  await snapshotExample();
};

main();
