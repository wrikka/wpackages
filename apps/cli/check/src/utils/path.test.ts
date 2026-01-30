import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatPathForDisplay } from "./path";

describe("formatPathForDisplay", () => {
	it("formats paths inside home as ~/<relative>", () => {
		const file = path.join(os.homedir(), "some", "dir", "file.ts");
		expect(formatPathForDisplay(file)).toBe("~/some/dir/file.ts");
	});

	it("formats paths inside cwd as relative", () => {
		const file = path.join(process.cwd(), "src", "index.ts");
		expect(formatPathForDisplay(file)).toBe("src/index.ts");
	});

	it("formats paths outside home and cwd as normalized absolute posix path", () => {
		const outside = process.platform === "win32" ? "C:/__wcheck_test__/a.ts" : "/__wcheck_test__/a.ts";
		const expected = path.resolve(outside).replaceAll("\\", "/");
		expect(formatPathForDisplay(outside)).toBe(expected);
	});

	it("expands ~ prefix", () => {
		expect(formatPathForDisplay("~/x/y.ts")).toBe("~/x/y.ts");
	});
});
