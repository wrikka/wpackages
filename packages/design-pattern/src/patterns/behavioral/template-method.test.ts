import { Effect } from "effect";
import { expect, test } from "vitest";
import { ConcreteClass1, ConcreteClass2 } from "./template-method";

test("Template Method Pattern", () => {
	const class1 = new ConcreteClass1();
	const class2 = new ConcreteClass2();

	const result1 = Effect.runSync(class1.templateMethod());
	const result2 = Effect.runSync(class2.templateMethod());

	expect(result1).toContain("ConcreteClass1 says: Implemented Operation1");
	expect(result1).not.toContain("Overridden Hook1");

	expect(result2).toContain("ConcreteClass2 says: Implemented Operation1");
	expect(result2).toContain("ConcreteClass2 says: Overridden Hook1");
});
