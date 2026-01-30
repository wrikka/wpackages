/**
 * CSS Parser usage examples
 */
import { parseCSS, parseSCSS } from "./css.parser";

const cssSource = `
  body {
    color: blue;
  }
`;

const scssSource = `
  $primary-color: #333;
  body {
    color: $primary-color;
  }
`;

console.log("--- CSS Parser ---");
const cssResult = parseCSS(cssSource);
if (cssResult._tag === "Success") {
	console.log("CSS AST:", JSON.stringify(cssResult.value.ast, null, 2));
} else {
	console.error("CSS Parsing Error:", cssResult.value);
}

console.log("\n--- SCSS Parser ---");
const scssResult = parseSCSS(scssSource);
if (scssResult._tag === "Success") {
	console.log("SCSS AST (compiled to CSS):", JSON.stringify(scssResult.value.ast, null, 2));
} else {
	console.error("SCSS Parsing Error:", scssResult.value);
}
