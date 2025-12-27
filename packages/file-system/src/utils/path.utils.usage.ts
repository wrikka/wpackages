/**
 * ตัวอย่างการใช้งาน joinPaths
 *
 * Run: bun run packages/file-system/src/utils/path.utils.usage.ts
 */

import {
	getBasename,
	getDirname,
	getExtname,
	getFilename,
	getPathSeparator,
	isAbsolutePath,
	joinPaths,
	parsePath,
} from "./path.utils";

// Example: Join paths
console.log("Path joining:");
console.log("joinPaths('/home', 'user', 'file.txt'):", joinPaths("/home", "user", "file.txt"));

// Example: Parse path
console.log("\nPath parsing:");
const parsed = parsePath("/home/user/document.txt");
console.log("parsePath('/home/user/document.txt'):", parsed);

// Example: Path components
console.log("\nPath components:");
console.log("getDirname('/home/user/file.txt'):", getDirname("/home/user/file.txt"));
console.log("getBasename('/home/user/file.txt'):", getBasename("/home/user/file.txt"));
console.log("getExtname('/home/user/file.txt'):", getExtname("/home/user/file.txt"));
console.log("getFilename('/home/user/file.txt'):", getFilename("/home/user/file.txt"));

// Example: Path checks
console.log("\nPath checks:");
console.log("isAbsolutePath('/home/user'):", isAbsolutePath("/home/user"));
console.log("isAbsolutePath('relative/path'):", isAbsolutePath("relative/path"));
console.log("getPathSeparator():", getPathSeparator());
