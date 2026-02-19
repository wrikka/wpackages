import { createWorkerPool, createTaskRunner } from "@wpackages/worker";

// Worker pool example
const workerPoolExample = async () => {
  console.log("=== Worker Pool Example ===\n");

  const pool = createWorkerPool({
    maxWorkers: 4,
    idleTimeout: 30000,
  });

  await pool.initialize();

  const results = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      pool.execute(() => {
        // Simulate CPU-intensive task
        let sum = 0;
        for (let j = 0; j < 1000000; j++) {
          sum += j;
        }
        return sum;
      }),
    ),
  );

  console.log("Results:", results);

  await pool.dispose();
};

// Task runner example
const taskRunnerExample = async () => {
  console.log("\n=== Task Runner Example ===\n");

  const runner = createTaskRunner({
    maxConcurrent: 10,
    timeout: 5000,
  });

  const results = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      runner.execute(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(i), Math.random() * 1000);
        });
      }),
    ),
  );

  console.log("Results:", results);
  console.log("Stats:", runner.getStats());
};

// Run all examples
const main = async () => {
  await workerPoolExample();
  await taskRunnerExample();
};

main();
