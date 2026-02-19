import { describe, expect, it } from "vitest";
import { createEventEmitter } from "../../src/utils/event-emitter.utils";

describe("Event Emitter - Creation", () => {
	it("should create an event emitter", () => {
		const emitter = createEventEmitter();

		expect(emitter).toBeDefined();
		expect(emitter.on).toBeDefined();
		expect(emitter.off).toBeDefined();
		expect(emitter.emit).toBeDefined();
		expect(emitter.once).toBeDefined();
	});

	it("should be frozen", () => {
		const emitter = createEventEmitter();
		expect(Object.isFrozen(emitter)).toBe(true);
	});
});
