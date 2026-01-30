import { describe, expect, it } from "bun:test";
import { some, none, isSome, isNone, mapOption, foldOption, fromNullable } from "./utils/option";

describe("Option", () => {
	it("should create some", () => {
		const option = some(42);
		expect(isSome(option)).toBe(true);
		expect(option.value).toBe(42);
	});

	it("should create none", () => {
		const option = none;
		expect(isNone(option)).toBe(true);
	});

	it("should map over some", () => {
		const option = some(42);
		const mapped = mapOption((x: number) => x * 2)(option);
		expect(isSome(mapped)).toBe(true);
		expect(mapped.value).toBe(84);
	});

	it("should fold over option", () => {
		const someOption = some(42);
		const noneOption = none;

		const someFolded = foldOption(() => "None", (x: number) => `Some: ${x}`)(someOption);
		expect(someFolded).toBe("Some: 42");

		const noneFolded = foldOption(() => "None", (x: number) => `Some: ${x}`)(noneOption);
		expect(noneFolded).toBe("None");
	});

	it("should create from nullable", () => {
		expect(isSome(fromNullable(42))).toBe(true);
		expect(isNone(fromNullable(null))).toBe(true);
		expect(isNone(fromNullable(undefined))).toBe(true);
	});
});
