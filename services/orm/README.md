# @wpackages/orm

Type-safe ORM with Effect integration using Drizzle ORM.

## Features

- **Multi-database support**: PostgreSQL, MySQL, SQLite
- **Effect integration**: Full Effect-TS service layer support
- **Type-safe**: Powered by Drizzle ORM
- **Query builders**: Pagination, filtering, sorting
- **Transaction support**: Effect-based transaction helpers
- **Migration support**: Drizzle Kit integration

## Installation

```bash
bun add @wpackages/orm
```

## Usage

### Basic Setup

```typescript
import { DatabaseService, DatabaseServiceLive } from "@wpackages/orm/services";
import { Effect } from "effect";

const config = {
  type: "postgresql" as const,
  connectionString: "postgresql://localhost:5432/mydb",
};

const layer = DatabaseServiceLive(config);

const main = Effect.gen(function* () {
  const db = yield* DatabaseService;
  // Use db.adapter.db for Drizzle queries
});

Effect.runPromise(Effect.provide(main, layer));
```

### Query with Pagination

```typescript
import { applyQueryOptions } from "@wpackages/orm/utils";

const query = db.adapter.db.select(users).$dynamic();
const paginated = applyQueryOptions(query, {
  pagination: { page: 1, limit: 10 },
  sort: { field: "createdAt", direction: "desc" },
  filters: [{ field: "name", operator: "like", value: "John" }],
});
```

### Transactions

```typescript
import { TransactionService } from "@wpackages/orm/services";

const transaction = Effect.gen(function* () {
  const tx = yield* TransactionService;
  yield* tx.transaction((db) => {
    // Perform multiple operations
  });
});
```

## Migrations

```bash
# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate

# Push schema (development)
bun run db:push

# Open Drizzle Studio
bun run db:studio
```

## License

MIT
