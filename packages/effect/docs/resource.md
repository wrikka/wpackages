# Resource Management Guide

## Overview

Resource management ช่วยให้คุณ manage resources อย่างถูกต้อง (connections, files, etc.)

## Acquire and Release

### Basic Usage

```typescript
import { acquireRelease, using, runPromise } from "@wpackages/effect";

const withFile = using(
  acquireRelease(
    async () => await Bun.file("data.txt").open(),
    (file) => async () => await file.close(),
  ),
  (file) => async () => {
    return await file.text();
  },
);

const result = await runPromise(withFile);
console.log(result.value);
```

### Chaining Resources

```typescript
import { gen, acquireRelease, using, runPromise } from "@wpackages/effect";

const withMultipleResources = gen(function*() {
  const file = yield* acquireRelease(
    async () => await Bun.file("data.txt").open(),
    (file) => async () => await file.close(),
  );

  const db = yield* acquireRelease(
    async () => await connectToDatabase(),
    (db) => async () => await db.close(),
  );

  return succeed({ file, db });
});
```

## Resource Pooling

### Creating a Pool

```typescript
import { pool, using, runPromise } from "@wpackages/effect";

const connectionPool = pool(
  () => createConnection(),
  10, // max size
);

const withConnection = using(
  connectionPool,
  (pool) => async () => {
    const connection = await pool.acquire();
    try {
      return await connection.query("SELECT * FROM users");
    } finally {
      await pool.release(connection);
    }
  },
);

const result = await runPromise(withConnection);
```

### Pool Configuration

```typescript
import { ResourcePool } from "@wpackages/effect";

const pool = new ResourcePool(
  () => createConnection(),
  10, // max size
);

// Initialize pool with some connections
await pool.initialize();

// Use pool
const connection = await pool.acquire();
try {
  const result = await connection.query("SELECT * FROM users");
  console.log(result);
} finally {
  await pool.release(connection);
}

// Dispose pool
await pool.dispose();
```

## Use Cases

### Database Connections

```typescript
import { pool, using, runPromise } from "@wpackages/effect";

const dbPool = pool(
  () => connectToDatabase(),
  5,
);

const queryUsers = using(
  dbPool,
  (pool) => async () => {
    const connection = await pool.acquire();
    try {
      return await connection.query("SELECT * FROM users");
    } finally {
      await pool.release(connection);
    }
  },
);

const result = await runPromise(queryUsers);
```

### HTTP Clients

```typescript
import { acquireRelease, using, runPromise } from "@wpackages/effect";

const withHttpClient = using(
  acquireRelease(
    async () => {
      const client = new HttpClient();
      await client.connect();
      return client;
    },
    (client) => async () => await client.disconnect(),
  ),
  (client) => async () => {
    return await client.get("/api/users");
  },
);

const result = await runPromise(withHttpClient);
```

### File Operations

```typescript
import { acquireRelease, using, runPromise } from "@wpackages/effect";

const readFile = (path: string) =>
  using(
    acquireRelease(
      async () => await Bun.file(path).open(),
      (file) => async () => await file.close(),
    ),
    (file) => async () => {
      return await file.text();
    },
  );

const writeFile = (path: string, content: string) =>
  using(
    acquireRelease(
      async () => await Bun.file(path).open("w"),
      (file) => async () => await file.close(),
    ),
    (file) => async () => {
      await file.write(content);
    },
  );

const result = await runPromise(readFile("data.txt"));
const writeResult = await runPromise(writeFile("output.txt", "Hello"));
```

### Temporary Resources

```typescript
import { acquireRelease, using, runPromise } from "@wpackages/effect";

const withTempFile = using(
  acquireRelease(
    async () => {
      const path = `/tmp/${Date.now()}.tmp`;
      await Bun.write(path, "temp content");
      return path;
    },
    (path) => async () => {
      await Bun.remove(path);
    },
  ),
  (path) => async () => {
    return await Bun.read(path);
  },
);

const result = await runPromise(withTempFile);
```

## Best Practices

1. **Always release resources** ใน finally block
2. **Use pooling** สำหรับ expensive resources
3. **Set appropriate pool sizes** ตาม workload
4. **Handle errors** ใน acquire and release
5. **Use using** สำหรับ automatic cleanup
6. **Dispose pools** เมื่อไม่ใช้งานแล้ว
7. **Monitor pool metrics** สำหรับ performance tuning
8. **Use timeouts** สำหรับ preventing hangs
