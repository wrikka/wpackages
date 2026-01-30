/**
 * JavaScript Parser usage examples
 */
import { parseJavaScript, parseTypeScript } from "./javascript.parser";

const jsSource = `
  const x = 1;
  function add(a, b) {
    return a + b;
  }
`;

const tsSource = `
  const y: number = 2;
  function subtract(a: number, b: number): number {
    return a - b;
  }
`;

console.log("--- JavaScript Parser ---");
const jsResult = parseJavaScript(jsSource);

if (jsResult._tag === "Success") {
	console.log("JavaScript AST:", JSON.stringify(jsResult.value.ast.program, null, 2));
} else {
	console.error("JavaScript Parsing Error:", jsResult.value);
}

console.log("\n--- TypeScript Parser ---");
const tsResult = parseTypeScript(tsSource);

if (tsResult._tag === "Success") {
	console.log("TypeScript AST:", JSON.stringify(tsResult.value.ast.program, null, 2));
} else {
	console.error("TypeScript Parsing Error:", tsResult.value);
}
