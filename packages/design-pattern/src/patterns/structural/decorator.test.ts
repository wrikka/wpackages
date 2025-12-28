import { describe, expect, it } from "vitest";
import { ConcreteComponent, ConcreteDecoratorA, ConcreteDecoratorB } from "./decorator";

describe("Decorator Pattern", () => {
	it("should allow wrapping a component with multiple decorators", () => {
		const simple = new ConcreteComponent();
		const decorator1 = new ConcreteDecoratorA(simple);
		const decorator2 = new ConcreteDecoratorB(decorator1);

		expect(simple.operation()).toBe("ConcreteComponent");
		expect(decorator1.operation()).toBe("ConcreteDecoratorA(ConcreteComponent)");
		expect(decorator2.operation()).toBe("ConcreteDecoratorB(ConcreteDecoratorA(ConcreteComponent))");
	});
});
