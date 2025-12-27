import { describe, expect, it } from "vitest";
import type { KeyboardEvent, KeyboardEventType } from "./keyboard";

describe("KeyboardEvent types", () => {
	it("should create valid keyboard event", () => {
		const event: KeyboardEvent = {
			altKey: false,
			ctrlKey: true,
			key: "a",
			shiftKey: false,
			type: "keydown",
		};

		expect(event.type).toBe("keydown");
		expect(event.key).toBe("a");
		expect(event.ctrlKey).toBe(true);
	});

	it("should accept all keyboard event types", () => {
		const types: KeyboardEventType[] = ["keydown", "keyup"];

		for (const type of types) {
			const event: KeyboardEvent = {
				altKey: false,
				ctrlKey: false,
				key: "x",
				shiftKey: false,
				type,
			};

			expect(event.type).toBe(type);
		}
	});
});
