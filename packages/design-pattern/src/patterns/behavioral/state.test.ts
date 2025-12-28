import { Effect } from "effect";
import { expect, test } from "vitest";
import { ConcreteStateA, ConcreteStateB, Context } from "./state";

test("State Pattern", () => {
	const context = new Context(new ConcreteStateA());

	const program = Effect.gen(function*() {
		const state1 = context.state;
		yield* context.request();
		const state2 = context.state;
		yield* context.request();
		const state3 = context.state;
		return { state1, state2, state3 };
	});

	const { state1, state2, state3 } = Effect.runSync(program);

	expect(state1).toBeInstanceOf(ConcreteStateA);
	expect(state2).toBeInstanceOf(ConcreteStateB);
	expect(state3).toBeInstanceOf(ConcreteStateA);
});
