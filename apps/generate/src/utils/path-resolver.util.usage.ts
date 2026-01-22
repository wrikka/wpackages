/**
 * Usage example for path-resolver utility
 */
import {
	getDirectoryPath,
	getFileNameWithoutExtension,
	normalizePath,
	resolveDirectoryPath,
	resolveOutputPath,
} from "./path-resolver.util";

// Example 1: Resolve output path with case conversion
const outputPath = resolveOutputPath(
	"/project/src/components",
	"UserProfile",
	"kebab",
	".tsx",
);
console.log("Output path:", outputPath);

// Example 2: Resolve directory path
const dirPath = resolveDirectoryPath("/project", "src", "utils", "helpers");
console.log("Directory path:", dirPath);

// Example 3: Extract file name without extension
const fileName = getFileNameWithoutExtension("/path/to/component.tsx");
console.log("File name:", fileName);

// Example 4: Get directory from file path
const dir = getDirectoryPath("/project/src/components/Button.tsx");
console.log("Directory:", dir);

// Example 5: Normalize path separators
const normalized = normalizePath("C:\\Users\\Project\\src\\index.ts");
console.log("Normalized:", normalized);
