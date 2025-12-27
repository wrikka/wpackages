import { describe, expect, it } from "vitest";
import type { PointerEvent, PointerEventType } from "./pointer";

describe("PointerEvent types", () => {
	it("should create valid pointer event", () => {
		const event: PointerEvent = {
			altKey: false,
			button: 0,
			ctrlKey: false,
			position: { x: 100, y: 200 },
			shiftKey: false,
			type: "pointerdown",
		};

		expect(event.type).toBe("pointerdown");
		expect(event.position.x).toBe(100);
		expect(event.position.y).toBe(200);
	});

	it("should accept all pointer event types", () => {
		const types: PointerEventType[] = [
			"pointerdown",
			"pointermove",
			"pointerup",
		];

		for (const type of types) {
			const event: PointerEvent = {
				altKey: false,
				button: 0,
				ctrlKey: false,
				position: { x: 0, y: 0 },
				shiftKey: false,
				type,
			};

			expect(event.type).toBe(type);
		}
	});
});
