import { Effect } from "effect";
import { expect, test } from "vitest";
import { createTreeFactory } from "./flyweight";

test("Flyweight Pattern", () => {
	const factory = createTreeFactory();

	const program = Effect.gen(function*() {
		const pine1 = yield* factory.getTreeType("Pine", "Green");
		const pine2 = yield* factory.getTreeType("Pine", "Green");
		const birch1 = yield* factory.getTreeType("Birch", "White");

		const draw1 = yield* pine1.draw(10, 20);
		const count = yield* factory.getTypesCount;

		return { pine1, pine2, birch1, draw1, count };
	});

	const result = Effect.runSync(program);

	expect(result.pine1).toBe(result.pine2); // Should be the same object
	expect(result.pine1).not.toBe(result.birch1);
	expect(result.count).toBe(2);
	expect(result.draw1).toBe("Drawing a Green Pine tree at (10, 20)");
});
