/**
 * Usage examples for parser service
 *
 * Note: This service re-exports from parser
 * For detailed usage examples, see parser package
 */

console.log("=== Parser Service ===");
console.log("This service re-exports parser functions from parser");
console.log("");
console.log("Available exports:");
console.log("- parseSource: Parse source code string");
console.log("- parseFile: Parse file from path");
console.log("- parseMultipleFiles: Parse multiple files");
console.log("");
console.log("Example usage:");
console.log(`
  import { parseSource } from 'lint';
  
  const code = 'const x = 42;';
  const result = parseSource(code);
`);
