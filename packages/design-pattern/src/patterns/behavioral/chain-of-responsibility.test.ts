import { Effect, Option } from "effect";
import { expect, test } from "vitest";
import { createMonkeyHandler, createSquirrelHandler } from "./chain-of-responsibility";

test("Chain of Responsibility Pattern", () => {
	const monkey = createMonkeyHandler();
	const squirrel = createSquirrelHandler();

	monkey.setNext(squirrel);

	const program = Effect.gen(function*() {
		const result1 = yield* monkey.handle("Nut");
		const result2 = yield* monkey.handle("Banana");
		const result3 = yield* monkey.handle("Cup of coffee");
		return { result1, result2, result3 };
	});

	const { result1, result2, result3 } = Effect.runSync(program);

	expect(Option.getOrThrow(result1)).toBe("Squirrel: I'll eat the Nut.");
	expect(Option.getOrThrow(result2)).toBe("Monkey: I'll eat the Banana.");
	expect(Option.isNone(result3)).toBe(true);
});
