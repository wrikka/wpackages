import { describe, expect, it } from "vitest";
import { reservoirSampling } from "./reservoir-sampling";

describe("reservoirSampling", () => {
	const stream = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	it("should return a sample of size k", () => {
		const k = 5;
		const sample = reservoirSampling(stream, k);
		expect(sample.length).toBe(k);
	});

	it("should contain elements only from the original stream", () => {
		const k = 5;
		const sample = reservoirSampling(stream, k);
		const streamSet = new Set(stream);
		const allInStream = sample.every(item => streamSet.has(item));
		expect(allInStream).toBe(true);
	});

	it("should return a copy of the stream if k is greater than stream length", () => {
		const k = 15;
		const sample = reservoirSampling(stream, k);
		expect(sample.length).toBe(stream.length);
		expect(sample).toEqual(expect.arrayContaining(stream));
	});

	it("should return a copy of the stream if k is equal to stream length", () => {
		const k = 10;
		const sample = reservoirSampling(stream, k);
		expect(sample.length).toBe(stream.length);
		expect(sample).toEqual(expect.arrayContaining(stream));
	});

	it("should return an empty array if k is 0", () => {
		const k = 0;
		const sample = reservoirSampling(stream, k);
		expect(sample).toEqual([]);
	});

	it("should return an empty array for an empty stream", () => {
		const emptyStream: number[] = [];
		const k = 5;
		const sample = reservoirSampling(emptyStream, k);
		expect(sample).toEqual([]);
	});

	it("should return an empty array for a negative k", () => {
		const k = -1;
		const sample = reservoirSampling(stream, k);
		expect(sample).toEqual([]);
	});
});
