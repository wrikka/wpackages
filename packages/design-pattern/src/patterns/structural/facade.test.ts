import { describe, expect, it } from "vitest";
import { Facade } from "./facade";

describe("Facade Pattern", () => {
	it("should provide a simple interface to a complex subsystem", () => {
		const facade = new Facade();
		const result = facade.operation();
		const expected = "Facade initializes subsystems:\n"
			+ "Subsystem1: Ready!"
			+ "Subsystem2: Get ready!"
			+ "Facade orders subsystems to perform the action:\n"
			+ "Subsystem1: Go!"
			+ "Subsystem2: Fire!";
		expect(result).toBe(expected);
	});
});
