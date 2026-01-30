import { describe, expect, it } from "vitest";
import { chunkData, reconstructChunks } from "./stream-chunking";

describe("stream-chunking", () => {
	describe("chunkData", () => {
		it("should chunk data into specified size", () => {
			const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
			const chunks = Array.from(chunkData(data, { chunkSize: 3 }));
			expect(chunks.length).toBe(4);
			expect(chunks[0]).toEqual(new Uint8Array([1, 2, 3]));
			expect(chunks[3]).toEqual(new Uint8Array([10]));
		});

		it("should handle overlap", () => {
			const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
			const chunks = Array.from(chunkData(data, { chunkSize: 4, overlap: 2 }));
			expect(chunks.length).toBe(4);
			expect(chunks[0]).toEqual(new Uint8Array([1, 2, 3, 4]));
			expect(chunks[1]).toEqual(new Uint8Array([3, 4, 5, 6]));
		});

		it("should throw error if overlap >= chunk size", () => {
			const data = new Uint8Array([1, 2, 3, 4, 5]);
			expect(() => Array.from(chunkData(data, { chunkSize: 3, overlap: 3 }))).toThrow("Overlap must be less than chunk size");
		});

		it("should handle empty data", () => {
			const data = new Uint8Array(0);
			const chunks = Array.from(chunkData(data, { chunkSize: 3 }));
			expect(chunks.length).toBe(0);
		});
	});

	describe("reconstructChunks", () => {
		it("should reconstruct chunks without overlap", () => {
			const chunks = [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6]), new Uint8Array([7, 8, 9, 10])];
			const reconstructed = reconstructChunks(chunks, 0);
			expect(reconstructed).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
		});

		it("should reconstruct chunks with overlap", () => {
			const chunks = [new Uint8Array([1, 2, 3, 4]), new Uint8Array([3, 4, 5, 6]), new Uint8Array([5, 6, 7, 8])];
			const reconstructed = reconstructChunks(chunks, 2);
			expect(reconstructed).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
		});

		it("should handle empty chunks", () => {
			const reconstructed = reconstructChunks([], 0);
			expect(reconstructed).toEqual(new Uint8Array(0));
		});

		it("should handle single chunk", () => {
			const chunks = [new Uint8Array([1, 2, 3])];
			const reconstructed = reconstructChunks(chunks, 0);
			expect(reconstructed).toEqual(new Uint8Array([1, 2, 3]));
		});
	});
});
