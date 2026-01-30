import { describe, expect, it } from "bun:test";
import { left, right, isLeft, isRight, mapEither, foldEither } from "./utils/either";

describe("Either", () => {
	it("should create left", () => {
		const either = left({ message: "Error" });
		expect(isLeft(either)).toBe(true);
		expect(either.left).toEqual({ message: "Error" });
	});

	it("should create right", () => {
		const either = right(42);
		expect(isRight(either)).toBe(true);
		expect(either.right).toBe(42);
	});

	it("should map over right", () => {
		const either = right(42);
		const mapped = mapEither((x: number) => x * 2)(either);
		expect(isRight(mapped)).toBe(true);
		expect(mapped.right).toBe(84);
	});

	it("should fold over either", () => {
		const rightEither = right(42);
		const leftEither = left({ message: "Error" });

		const rightFolded = foldEither(
			(l: any) => `Left: ${l.message}`,
			(r: number) => `Right: ${r}`,
		)(rightEither);
		expect(rightFolded).toBe("Right: 42");

		const leftFolded = foldEither(
			(l: any) => `Left: ${l.message}`,
			(r: number) => `Right: ${r}`,
		)(leftEither);
		expect(leftFolded).toBe("Left: Error");
	});
});
