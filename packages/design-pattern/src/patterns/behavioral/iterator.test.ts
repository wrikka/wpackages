import { Effect, Option } from "effect";
import { expect, test } from "vitest";
import { createArrayIterator } from "./iterator";

test("Iterator Pattern", () => {
	const collection = [1, 2, 3];
	const iterator = createArrayIterator(collection);

	const program = Effect.gen(function*() {
		const results: number[] = [];
		let hasNext = yield* iterator.hasNext;
		while (hasNext) {
			const valueOpt = yield* iterator.next;
			if (Option.isSome(valueOpt)) {
				results.push(valueOpt.value);
			}
			hasNext = yield* iterator.hasNext;
		}
		return results;
	});

	const result = Effect.runSync(program);

	expect(result).toEqual([1, 2, 3]);
});
