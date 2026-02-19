import { parseSync } from "oxc-parser";
import { describe, expect, it } from "vitest";
import { findExportNames, findExports, hasDefaultExport } from "./find-exports.util";

describe("find-exports", () => {
	it("should find named exports", () => {
		const code = `
      export const x = 1;
      export function foo() {}
      export class Bar {}
    `;

		const { program } = parseSync("test.ts", code, code);
		const exports = findExports(program);

		expect(exports.length).toBeGreaterThan(0);
		expect(exports.some((exp) => exp.name === "x")).toBe(true);
		expect(exports.some((exp) => exp.name === "foo")).toBe(true);
		expect(exports.some((exp) => exp.name === "Bar")).toBe(true);
	});

	it("should find default export", () => {
		const code = `export default function foo() {}`;
		const { program } = parseSync("test.ts", code, {});
		const exports = findExports(program);

		expect(exports.some((exp) => exp.isDefault)).toBe(true);
	});

	it("should find export names", () => {
		const code = `
      export const x = 1;
      export const y = 2;
    `;

		const { program } = parseSync("test.ts", code, {});
		const names = findExportNames(program);

		expect(names).toContain("x");
		expect(names).toContain("y");
	});

	it("should detect if module has default export", () => {
		const code1 = `export default 42;`;
		const code2 = `export const x = 1;`;

		const { program: program1 } = parseSync("test.ts", code1, code1);
		const { program: program2 } = parseSync("test.ts", code2, code2);

		expect(hasDefaultExport(program1)).toBe(true);
		expect(hasDefaultExport(program2)).toBe(false);
	});

	it("should handle export { } syntax", () => {
		const code = `
      const x = 1;
      const y = 2;
      export { x, y };
    `;

		const { program } = parseSync("test.ts", code, {});
		const exports = findExports(program);

		expect(exports.some((exp) => exp.name === "x")).toBe(true);
		expect(exports.some((exp) => exp.name === "y")).toBe(true);
	});
});
