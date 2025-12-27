/**
 * ตัวอย่างการใช้งาน parsePackage
 *
 * Run: bun run packages/dependencies/src/utils/package-parser.util.usage.ts
 */

import { parsePackage, parsePackages, formatPackage } from "./package-parser.util";

// Example 1: Parse single package
const pkg1 = parsePackage("react@18.0.0");
console.log("Parse react@18.0.0:", pkg1);
// Output: { name: "react", version: "18.0.0" }

// Example 2: Parse scoped package
const pkg2 = parsePackage("@types/node@20.0.0");
console.log("Parse @types/node@20.0.0:", pkg2);
// Output: { name: "@types/node", version: "20.0.0" }

// Example 3: Parse multiple packages
const packages = parsePackages(["react", "vue@3.0.0", "@types/node"]);
console.log("Parse multiple:", packages);

// Example 4: Format package back to string
const formatted = formatPackage({ name: "react", version: "18.0.0" });
console.log("Format package:", formatted);
// Output: "react@18.0.0"
