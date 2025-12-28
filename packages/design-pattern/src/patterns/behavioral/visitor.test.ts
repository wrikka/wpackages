import { Effect } from "effect";
import { expect, test } from "vitest";
import { ConcreteComponentA, ConcreteComponentB, ConcreteVisitor1 } from "./visitor";

test("Visitor Pattern", () => {
	const components = [new ConcreteComponentA(), new ConcreteComponentB()];
	const visitor = new ConcreteVisitor1();

	const program = Effect.all(components.map((c) => c.accept(visitor)));
	const results = Effect.runSync(program);

	expect(results[0]).toBe("ConcreteVisitor1: A");
	expect(results[1]).toBe("ConcreteVisitor1: B");
});
