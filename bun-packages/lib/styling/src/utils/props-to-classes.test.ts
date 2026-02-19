import { describe, expect, it } from "vitest";
import { mergeClasses, propsToClasses, styledPropsToClasses } from "./props-to-classes";

describe("propsToClasses", () => {
	it("should convert boolean props to classes", () => {
		const result = propsToClasses({ flex: true, hidden: false });
		expect(result).toContain("flex");
		expect(result).not.toContain("hidden");
	});

	it("should convert string props to classes", () => {
		const result = propsToClasses({ text: "center", bg: "blue-500" });
		expect(result).toContain("text-center");
		expect(result).toContain("bg-blue-500");
	});

	it("should convert number props to classes", () => {
		const result = propsToClasses({ p: 4, m: 2 });
		expect(result).toContain("p-4");
		expect(result).toContain("m-2");
	});

	it("should handle camelCase props", () => {
		const result = propsToClasses({ inlineBlock: true, maxW: "100%" });
		expect(result).toContain("inline-block");
		expect(result).toContain("max-w-100%");
	});

	it("should skip undefined and null values", () => {
		const result = propsToClasses({ flex: undefined, block: true });
		expect(result).toContain("block");
		expect(result).not.toContain("flex");
	});
});

describe("styledPropsToClasses", () => {
	it("should handle className and class props", () => {
		const result = styledPropsToClasses({ className: "foo bar", class: "baz" });
		expect(result).toContain("foo");
		expect(result).toContain("bar");
		expect(result).toContain("baz");
	});

	it("should convert utility props to classes", () => {
		const result = styledPropsToClasses({ flex: true, p: 4 });
		expect(result).toContain("flex");
		expect(result).toContain("p-4");
	});

	it("should merge className with utility props", () => {
		const result = styledPropsToClasses({ className: "base", flex: true });
		expect(result).toContain("base");
		expect(result).toContain("flex");
	});
});

describe("mergeClasses", () => {
	it("should merge string classes", () => {
		const result = mergeClasses("foo bar", "baz");
		expect(result).toBe("foo bar baz");
	});

	it("should merge array of classes", () => {
		const result = mergeClasses(["foo", "bar"], ["baz"]);
		expect(result).toBe("foo bar baz");
	});

	it("should deduplicate classes", () => {
		const result = mergeClasses("foo bar", "bar baz");
		expect(result).toBe("foo bar baz");
	});

	it("should handle undefined and null values", () => {
		const result = mergeClasses(undefined, null, "foo");
		expect(result).toBe("foo");
	});

	it("should handle mixed inputs", () => {
		const result = mergeClasses("foo", ["bar", "baz"], undefined, "qux");
		expect(result).toBe("foo bar baz qux");
	});
});
