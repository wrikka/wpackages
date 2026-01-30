import { parseSync } from "oxc-parser";
import { findNodes, findNodesByType, traverse } from "./ast-traverse.util";

// Usage examples

const code = `
const x = 1;
function foo() {
  const y = 2;
}
`;

const { program } = parseSync("example.ts", code);

// Example 1: Traverse all nodes
console.log("=== Traverse Example ===");
traverse(program, (node) => {
	console.log(`Node type: ${node.type}`);
	return undefined; // Continue traversal
});

// Example 2: Find all identifiers
console.log("\n=== Find Identifiers ===");
const identifiers = findNodes(program, (node) => node.type === "Identifier");
console.log(`Found ${identifiers.length} identifiers`);

// Example 3: Find all function declarations
console.log("\n=== Find Functions ===");
const functions = findNodesByType(program, "FunctionDeclaration");
console.log(`Found ${functions.length} functions`);
