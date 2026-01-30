import { WorkerPool } from "./worker-pool";

const workerScript = new URL("./worker-pool.worker.ts", import.meta.url);
const pool = new WorkerPool<number, number>(workerScript, { maxWorkers: 4 });

const result = await pool.execute(5);
console.log("Result:", result);

const results = await pool.executeAll([1, 2, 3, 4, 5]);
console.log("Results:", results);

pool.terminate();
