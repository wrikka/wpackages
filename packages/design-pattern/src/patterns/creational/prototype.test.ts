import { describe, expect, it } from "vitest";
import { ConcretePrototype1, ConcretePrototype2 } from "./prototype";

describe("Prototype Pattern", () => {
	it("should clone ConcretePrototype1", () => {
		const p1 = new ConcretePrototype1(123);
		const p2 = p1.clone() as ConcretePrototype1;

		expect(p1).not.toBe(p2);
		expect(p1.field).toBe(p2.field);
	});

	it("should clone ConcretePrototype2", () => {
		const p1 = new ConcretePrototype2("test");
		const p2 = p1.clone() as ConcretePrototype2;

		expect(p1).not.toBe(p2);
		expect(p1.field).toBe(p2.field);
	});
});
