import { Effect } from "effect";
import { expect, test } from "vitest";
import { createBasicRemote, createTv } from "./bridge";

test("Bridge Pattern", () => {
	const tv = createTv();
	const remote = createBasicRemote(tv);

	const program = Effect.gen(function*() {
		yield* remote.togglePower;
		const powerState1 = yield* tv.isEnabled;

		yield* remote.volumeUp;
		const volumeState1 = yield* tv.getVolume;

		yield* remote.togglePower;
		const powerState2 = yield* tv.isEnabled;

		return { powerState1, volumeState1, powerState2 };
	});

	const result = Effect.runSync(program);

	expect(result.powerState1).toBe(true);
	expect(result.volumeState1).toBe(60);
	expect(result.powerState2).toBe(false);
});
