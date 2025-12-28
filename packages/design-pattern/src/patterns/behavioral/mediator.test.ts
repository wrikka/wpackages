import { Effect } from "effect";
import { expect, test, vi } from "vitest";
import { Component1, Component2, ConcreteMediator } from "./mediator";

test("Mediator Pattern", async () => {
	// Mock Component2's doB method
	const mockDoB = vi.fn(() => Effect.void);
	class MockComponent2 extends Component2 {
		override doB = mockDoB;
	}

	// Setup
	const c2 = new MockComponent2(null as any);
	const mediator = new ConcreteMediator(c2);
	const c1 = new Component1(mediator);
	c2.mediator = mediator; // Assign mediator to c2

	// Action
	await Effect.runPromise(c1.doA());

	// Assertion
	expect(mockDoB).toHaveBeenCalled();
});
