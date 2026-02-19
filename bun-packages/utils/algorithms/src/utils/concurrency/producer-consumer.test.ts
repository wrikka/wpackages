import { describe, expect, it } from "vitest";
import { ProducerConsumer } from "./producer-consumer";

describe("ProducerConsumer", () => {
	it("should produce and consume items", async () => {
		const pc = new ProducerConsumer<number>(2);

		await pc.produce(1);
		await pc.produce(2);

		const item1 = await pc.consume();
		const item2 = await pc.consume();

		expect(item1).toBe(1);
		expect(item2).toBe(2);
	});

	it("should track production and consumption", async () => {
		const pc = new ProducerConsumer<number>(2);

		await pc.produce(1);
		await pc.produce(2);
		await pc.consume();
		await pc.consume();

		const stats = pc.getStats();
		expect(stats.produced).toBe(2);
		expect(stats.consumed).toBe(2);
	});
});
