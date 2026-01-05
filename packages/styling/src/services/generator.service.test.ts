import { describe, expect, it } from "vitest";
import { extractClasses, generateCss } from "./generator.service";

describe("generator.service", () => {
	it("should extract classes from a string", () => {
		const code = "<div class=\"p-4 bg-blue-500\">Hello</div>";
		const classes = extractClasses(code);
		expect(classes).toEqual(new Set(["p-4", "bg-blue-500"]));
	});

	it("should generate CSS for given classes", async () => {
		const classes = new Set(["p-4", "bg-blue-500"]);
		const css = await generateCss(classes, { cache: { enabled: false } });
		expect(css).toContain(".p-4");
		expect(css).toContain(".bg-blue-500");
	});

	it("should generate CSS for icons", async () => {
		const classes = new Set(["icon-[mdi--home]"]);
		const css = await generateCss(classes, { icons: ["mdi"], cache: { enabled: false } });
		expect(css).toContain(".icon-\\[mdi--home\\]");
	});

	it("should expand shortcuts into utility classes", async () => {
		const classes = new Set(["btn"]);
		const css = await generateCss(classes, {
			cache: { enabled: false },
			shortcuts: {
				btn: "p-4 bg-blue-500",
			},
		});
		expect(css).toContain(".p-4");
		expect(css).toContain(".bg-blue-500");
	});

	it("should compile rules into CSS", async () => {
		const classes = new Set(["m-4"]);
		const css = await generateCss(classes, {
			cache: { enabled: false },
			rules: [[/^m-(\d+)$/, ([, d]) => ({ margin: `${Number(d) / 4}rem` })]],
		});
		expect(css).toContain(".m-4");
		expect(css).toContain("margin:1rem");
	});
});
