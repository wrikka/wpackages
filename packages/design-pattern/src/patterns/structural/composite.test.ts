import { Effect } from "effect";
import { expect, test } from "vitest";
import { createCompoundGraphic, createDot } from "./composite";

test("Composite Pattern", () => {
	const dot1 = createDot(1, 2);
	const dot2 = createDot(3, 4);
	const compound = createCompoundGraphic(dot1, dot2);

	const result = Effect.runSync(compound.draw);

	expect(result).toContain("Drawing a dot at (1, 2)");
	expect(result).toContain("Drawing a dot at (3, 4)");
	expect(result.startsWith("Drawing a compound graphic:")).toBe(true);
});
