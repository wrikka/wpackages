import { describe, expect, it } from "vitest";
import { createFactory, createFactoryWithDefaults } from "../creational/factory";

describe("Factory Pattern", () => {
	it("should create objects using factory", () => {
		const factory = createFactory<number, { value: number }>((input) => ({
			value: input * 2,
		}));

		const result = factory(5);
		expect(result.value).toBe(10);
	});

	it("should create factory with defaults", () => {
		const factory = createFactoryWithDefaults(
			(input: { name: string; age: number }) => input,
			{ name: "Guest", age: 0 },
		);

		const result = factory({ name: "Alice" });
		expect(result.name).toBe("Alice");
		expect(result.age).toBe(0);
	});
});
