/**
 * Usage examples for parseSource service
 */

import { Result } from "../utils";
import { parseSource } from "./parse-source.service";

// Example 1: Parse simple JavaScript
const jsCode = `
const greet = (name) => {
  console.log(\`Hello, \${name}!\`);
};
`;

const jsResult = parseSource(jsCode, "example.js");
if (Result.isOk(jsResult)) {
	console.log("✓ Parsed JavaScript successfully");
	console.log("AST:", jsResult.value.ast);
} else {
	console.error("✗ Parse error:", jsResult.error);
}

// Example 2: Parse TypeScript with types
const tsCode = `
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "Alice",
  age: 30,
};
`;

const tsResult = parseSource(tsCode, "example.ts", { typescript: true });
if (Result.isOk(tsResult)) {
	console.log("✓ Parsed TypeScript successfully");
}

// Example 3: Parse JSX
const jsxCode = `
const App = () => {
  return <div>Hello World</div>;
};
`;

const jsxResult = parseSource(jsxCode, "example.jsx", { jsx: true });
if (Result.isOk(jsxResult)) {
	console.log("✓ Parsed JSX successfully");
}
