import { Effect } from "effect";
import { expect, test } from "vitest";
import { Originator } from "./memento";

test("Memento Pattern", () => {
	const originator = new Originator("Super-duper-super-puper-super.");
	const program = Effect.gen(function*() {
		const memento1 = yield* originator.save();
		yield* originator.doSomething();
		const state1 = yield* originator.getState();
		yield* originator.restore(memento1);
		const state2 = yield* originator.getState();
		return { state1, state2 };
	});

	const { state1, state2 } = Effect.runSync(program);

	expect(state1).not.toBe("Super-duper-super-puper-super.");
	expect(state2).toBe("Super-duper-super-puper-super.");
});
