import { describe, expect, it } from "vitest";
import { BufferPool } from "./buffer-pool";

describe("buffer-pool", () => {
	it("should acquire a buffer", () => {
		const pool = new BufferPool(1024);
		const buffer = pool.acquire();
		expect(buffer).toBeInstanceOf(Uint8Array);
		expect(buffer.length).toBe(1024);
	});

	it("should reuse released buffers", () => {
		const pool = new BufferPool(1024);
		const buffer1 = pool.acquire();
		pool.release(buffer1);
		const buffer2 = pool.acquire();
		expect(buffer2).toBe(buffer1);
	});

	it("should create new buffer when pool is empty", () => {
		const pool = new BufferPool(1024);
		const buffer1 = pool.acquire();
		const buffer2 = pool.acquire();
		expect(buffer1).not.toBe(buffer2);
	});

	it("should respect max pool size", () => {
		const pool = new BufferPool(1024, 2);
		const buffers = [pool.acquire(), pool.acquire(), pool.acquire()];
		buffers.forEach((b) => pool.release(b));
		expect(pool.size).toBe(2);
	});

	it("should clear the pool", () => {
		const pool = new BufferPool(1024);
		const buffer = pool.acquire();
		pool.release(buffer);
		pool.clear();
		expect(pool.size).toBe(0);
	});

	it("should not accept buffers of different size", () => {
		const pool = new BufferPool(1024);
		const buffer = new Uint8Array(512);
		pool.release(buffer);
		expect(pool.size).toBe(0);
	});
});
