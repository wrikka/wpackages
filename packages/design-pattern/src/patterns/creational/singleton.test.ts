import { describe, expect, it } from "vitest";
import { Singleton } from "./singleton";

describe("Singleton Pattern", () => {
	it("should create only one instance", () => {
		const s1 = Singleton.getInstance();
		const s2 = Singleton.getInstance();

		expect(s1).toBe(s2);
		expect(s1.timestamp).toBe(s2.timestamp);
	});

	it("should have some business logic", () => {
		const instance = Singleton.getInstance();
		expect(() => instance.someBusinessLogic()).not.toThrow();
	});
});
