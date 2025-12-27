/**
 * Factory Pattern Tests
 */

import { describe, expect, it } from "vitest";
import { createFactory } from "./factory";

describe("Factory Pattern", () => {
	it("should create objects using factory", () => {
		const factory = createFactory<string, { type: string; value: number }>((type: string) => ({
			type,
			value: Math.random(),
		}));

		const obj1 = factory("type-a");
		const obj2 = factory("type-b");

		expect(obj1.type).toBe("type-a");
		expect(obj2.type).toBe("type-b");
		expect(obj1.value).not.toBe(obj2.value);
	});

	it("should support different object types", () => {
		interface Shape {
			type: string;
			area(): number;
		}

		const shapeFactory = createFactory<string, Shape>((type: string) => {
			if (type === "circle") {
				return {
					type: "circle",
					area: () => Math.PI * 5 * 5,
				};
			}
			return {
				type: "square",
				area: () => 10 * 10,
			};
		});

		const circle = shapeFactory("circle");
		const square = shapeFactory("square");

		expect(circle.type).toBe("circle");
		expect(square.type).toBe("square");
		expect(circle.area()).toBeGreaterThan(0);
		expect(square.area()).toBe(100);
	});
});
