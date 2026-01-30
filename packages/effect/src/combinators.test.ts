import { describe, expect, it } from "bun:test";
import { succeed, map, flatMap, all, forEach, runPromise } from "./";

describe("Combinators", () => {
	it("should map over effect", async () => {
		const effect = succeed(1);
		const mapped = map((x: number) => x * 2)(effect);
		const result = await runPromise(mapped);
		expect(result).toEqual({ _tag: "Success", value: 2 });
	});

	it("should flatMap over effect", async () => {
		const effect = succeed(1);
		const flatMapped = flatMap((x: number) => succeed(x * 2))(effect);
		const result = await runPromise(flatMapped);
		expect(result).toEqual({ _tag: "Success", value: 2 });
	});

	it("should run all effects", async () => {
		const effects = [succeed(1), succeed(2), succeed(3)] as const;
		const allEffect = all(effects);
		const result = await runPromise(allEffect);
		expect(result).toEqual({ _tag: "Success", value: [1, 2, 3] });
	});

	it("should forEach over items", async () => {
		const items = [1, 2, 3];
		const forEachEffect = forEach((x: number) => succeed(x * 2))(items);
		const result = await runPromise(forEachEffect);
		expect(result).toEqual({ _tag: "Success", value: [2, 4, 6] });
	});
});
