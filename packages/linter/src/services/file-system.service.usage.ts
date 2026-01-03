/**
 * Usage examples for file system service
 */

import { Effect } from "effect";
import { FileSystemService } from "./file-system.service";

// Example 1: Read directory contents
const example1 = Effect.gen(function*() {
	console.log("=== Example 1: Read directory ===");

	try {
		const entries = yield* FileSystemService.readdir(".");

		console.log(`Found ${entries.length} entries`);
		const files = entries.filter((e) => e.isFile());
		const dirs = entries.filter((e) => e.isDirectory());

		console.log(`Files: ${files.length}`);
		console.log(`Directories: ${dirs.length}`);

		// Show first 5 entries
		entries.slice(0, 5).forEach((entry) => {
			const type = entry.isFile() ? "FILE" : "DIR";
			console.log(`  [${type}] ${entry.name}`);
		});
	} catch (error) {
		console.log("Error reading directory:", error);
	}
});

// Example 2: Read file content
const example2 = Effect.gen(function*() {
	console.log("\n=== Example 2: Read file ===");

	try {
		const content = yield* FileSystemService.readFile("package.json");
		const lines = content.split("\n");

		console.log("File read successfully");
		console.log(`Lines: ${lines.length}`);
		console.log("First 3 lines:");
		lines.slice(0, 3).forEach((line, i) => {
			console.log(`  ${i + 1}: ${line}`);
		});
	} catch {
		console.log("Error reading file");
	}
});

// Example 3: Filter TypeScript files
const example3 = Effect.gen(function*() {
	console.log("\n=== Example 3: Filter TypeScript files ===");

	try {
		const entries = yield* FileSystemService.readdir("src");
		const tsFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".ts"));

		console.log(`Found ${tsFiles.length} TypeScript files:`);
		tsFiles.slice(0, 10).forEach((file) => {
			console.log(`  - ${file.name}`);
		});
	} catch {
		console.log("Directory not found or error occurred");
	}
});

// Example 4: Combine operations
const example4 = Effect.gen(function*() {
	console.log("\n=== Example 4: Read and process ===");

	try {
		const entries = yield* FileSystemService.readdir(".");
		const configFiles = entries.filter(
			(e) => e.isFile() && e.name.includes("config"),
		);

		console.log(`Found ${configFiles.length} config files`);

		for (const file of configFiles.slice(0, 2)) {
			try {
				const content = yield* FileSystemService.readFile(file.name);
				console.log(`\n${file.name} (${content.length} bytes)`);
			} catch {
				console.log(`  Cannot read ${file.name}`);
			}
		}
	} catch {
		console.log("Error processing files");
	}
});

// Run examples
const program = Effect.gen(function*() {
	yield* example1;
	yield* example2;
	yield* example3;
	yield* example4;
});

Effect.runPromise(program).catch(console.error);
