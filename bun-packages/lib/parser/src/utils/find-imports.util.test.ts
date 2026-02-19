import { parseSync } from "oxc-parser";
import { describe, expect, it } from "vitest";
import { findImports, findImportsFrom, findImportSources } from "./find-imports.util";

describe("find-imports", () => {
	it("should find all imports", () => {
		const code = `
      import React from 'react';
      import { useState, useEffect } from 'react';
      import * as Utils from './utils';
    `;

		const { program } = parseSync("test.ts", code, {});
		const imports = findImports(program);

		expect(imports.length).toBeGreaterThan(0);
		expect(imports.some((imp) => imp.source === "react")).toBe(true);
	});

	it("should find import sources", () => {
		const code = `
      import React from 'react';
      import { render } from 'react-dom';
    `;

		const { program } = parseSync("test.ts", code, {});
		const sources = findImportSources(program);

		expect(sources).toContain("react");
		expect(sources).toContain("react-dom");
	});

	it("should find imports from specific package", () => {
		const code = `
      import React from 'react';
      import { useState } from 'react';
      import axios from 'axios';
    `;

		const { program } = parseSync("test.ts", code);
		const reactImports = findImportsFrom(program, "react");

		expect(reactImports.length).toBeGreaterThan(0);
		expect(reactImports.every((imp) => imp.source === "react")).toBe(true);
	});

	it("should detect default imports", () => {
		const code = `import React from 'react';`;
		const { program } = parseSync("test.ts", code, {});
		const imports = findImports(program);

		expect(imports[0].isDefault).toBe(true);
	});

	it("should detect namespace imports", () => {
		const code = `import * as Utils from './utils';`;
		const { program } = parseSync("test.ts", code, {});
		const imports = findImports(program);

		expect(imports[0].isNamespace).toBe(true);
	});
});
