/**
 * Builder Pattern Tests
 */

import { describe, expect, it } from "vitest";
import { createBuilder } from "./builder";

describe("Builder Pattern", () => {
	it("should create object with builder", () => {
		const builder = createBuilder<{ name: string; age: number }>({ name: '', age: 0 })
			.setName("John")
			.setAge(30);

		const result = builder.build();
		expect(result.name).toBe("John");
		expect(result.age).toBe(30);
	});

	it("should chain multiple set operations", () => {
		const result = createBuilder<{ a: string; b: number; c: boolean }>({ a: '', b: 0, c: false })
			.setA("test")
			.setB(42)
			.setC(true)
			.build();

		expect(result).toEqual({ a: "test", b: 42, c: true });
	});

	it("should allow partial object construction", () => {
		const builder = createBuilder<{ x: number; y: number }>({ x: 0, y: 0 });
		const result = builder.setX(10).build();
		expect(result.x).toBe(10);
		expect(result.y).toBe(0);
	});
});
