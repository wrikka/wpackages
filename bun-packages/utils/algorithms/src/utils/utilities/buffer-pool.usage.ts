import { BufferPool } from "./buffer-pool";

const pool = new BufferPool(4096, 50);

const buffer1 = pool.acquire();
console.log("Acquired buffer size:", buffer1.length);

pool.release(buffer1);
console.log("Pool size after release:", pool.size);

pool.clear();
