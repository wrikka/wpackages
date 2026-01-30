import { acquireRelease, using, pool, runPromise } from "@wpackages/effect";

// Simulated database connection
class DatabaseConnection {
  constructor(readonly id: number) {
    console.log(`Connection ${id} opened`);
  }

  async query(sql: string) {
    console.log(`Executing: ${sql}`);
    return [{ id: 1, name: "John" }, { id: 2, name: "Jane" }];
  }

  async close() {
    console.log(`Connection ${this.id} closed`);
  }
}

// Acquire and release
const acquireReleaseExample = async () => {
  const withConnection = using(
    acquireRelease(
      async () => new DatabaseConnection(1),
      (conn) => async () => await conn.close(),
    ),
    (conn) => async () => {
      return await conn.query("SELECT * FROM users");
    },
  );

  const result = await runPromise(withConnection);
  console.log("Acquire/Release:", result);
};

// Resource pool
const poolExample = async () => {
  const connectionPool = pool(
    () => new DatabaseConnection(Math.floor(Math.random() * 100)),
    3,
  );

  await connectionPool.initialize();

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
  console.log("Pool:", result);

  await connectionPool.dispose();
};

// Chained resources
const chainedExample = async () => {
  const withResources = using(
    acquireRelease(
      async () => new DatabaseConnection(1),
      (conn) => async () => await conn.close(),
    ),
    (conn1) => async () => {
      return using(
        acquireRelease(
          async () => new DatabaseConnection(2),
          (conn) => async () => await conn.close(),
        ),
        async (conn2) => {
          const result1 = await conn1.query("SELECT * FROM users");
          const result2 = await conn2.query("SELECT * FROM posts");
          return succeed({ users: result1, posts: result2 });
        },
      );
    },
  );

  const result = await runPromise(withResources);
  console.log("Chained:", result);
};

// Run all examples
const main = async () => {
  console.log("=== Resource Management Examples ===\n");

  await acquireReleaseExample();
  await poolExample();
  await chainedExample();
};

main();
