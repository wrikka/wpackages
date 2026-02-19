/**
 * HTML Parser usage examples
 */
import { parseHTMLSource } from "./html.parser";

const htmlSource = `
  <div>
    <h1>Hello, World!</h1>
    <p>This is a paragraph.</p>
  </div>
`;

console.log("--- HTML Parser ---");
const htmlResult = parseHTMLSource(htmlSource);

if (htmlResult._tag === "Success") {
	console.log("HTML AST:", JSON.stringify(htmlResult.value.ast, null, 2));
} else {
	console.error("HTML Parsing Error:", htmlResult.value);
}
