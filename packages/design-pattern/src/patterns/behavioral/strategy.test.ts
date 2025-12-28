import { describe, expect, it } from "vitest";
import { ConcreteStrategyA, ConcreteStrategyB, Context } from "./strategy";

describe("Strategy Pattern", () => {
	it("should use ConcreteStrategyA to sort data", () => {
		const context = new Context(new ConcreteStrategyA());
		const result = context.doSomeBusinessLogic();
		expect(result).toEqual(["a", "b", "c", "d", "e"]);
	});

	it("should use ConcreteStrategyB to reverse data", () => {
		const context = new Context(new ConcreteStrategyB());
		const result = context.doSomeBusinessLogic();
		expect(result).toEqual(["e", "d", "c", "b", "a"]);
	});

	it("should allow changing strategy at runtime", () => {
		const context = new Context(new ConcreteStrategyA());
		expect(context.doSomeBusinessLogic()).toEqual(["a", "b", "c", "d", "e"]);

		context.setStrategy(new ConcreteStrategyB());
		expect(context.doSomeBusinessLogic()).toEqual(["e", "d", "c", "b", "a"]);
	});
});
