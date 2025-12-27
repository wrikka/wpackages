/**
 * File utility usage examples
 */

import * as File from "./file.util";

// Example 1: Check lintable files
const files = ["app.ts", "config.json", "index.tsx", "README.md", "util.js"];
const lintable = files.filter(File.isLintableFile);
console.log("Lintable files:", lintable); // ['app.ts', 'index.tsx', 'util.js']

// Example 2: Filter directories
const dirs = ["src", "node_modules", "test", "dist", "lib"];
const validDirs = dirs.filter((dir) => !File.shouldIgnoreDirectory(dir));
console.log("Valid dirs:", validDirs); // ['src', 'test', 'lib']

// Example 3: Path operations
const path = "src\\components\\Button.tsx";
console.log("Normalized:", File.normalizePath(path)); // src/components/Button.tsx
console.log("Basename:", File.getBasename(path)); // Button.tsx
console.log("Extension:", File.getExtension(path)); // .tsx

// Example 4: Relative paths
const from = "src/components";
const to = "src/utils/helpers.ts";
console.log("Relative:", File.getRelativePath(from, to)); // ../utils/helpers.ts
