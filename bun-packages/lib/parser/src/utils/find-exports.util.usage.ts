import { parseSync } from "oxc-parser";
import { findExportNames, findExports, hasDefaultExport } from "./find-exports.util";

// Usage examples

const code = `
export const x = 1;
export function greet(name: string) {
  return \`Hello, \${name}!\`;
}
export default class MyClass {}
`;

const { program } = parseSync("example.ts", code);

// Example 1: Find all exports
console.log("=== All Exports ===");
const exports = findExports(program);
for (const exp of exports) {
	console.log(
		`Name: ${exp.name}, Default: ${exp.isDefault}, Named: ${exp.isNamed}`,
	);
}

// Example 2: Find export names only
console.log("\n=== Export Names ===");
const names = findExportNames(program);
console.log(names);

// Example 3: Check for default export
console.log("\n=== Has Default Export ===");
console.log(hasDefaultExport(program));
