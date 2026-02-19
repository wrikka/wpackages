/**
 * Usage examples for parseFile service
 */

import { Result } from "../utils";
import { parseFile, parseMultipleFiles } from "./parse-file.service";

// Example 1: Parse single file
async function parseSingleFile() {
	const result = await parseFile("./src/index.ts");

	if (Result.isOk(result)) {
		console.log("✓ File parsed successfully");
		console.log("Errors:", result.value.errors.length);
	} else {
		console.error("✗ Failed to parse:", result.error);
	}
}

// Example 2: Parse multiple files
async function parseMultiple() {
	const files = ["./src/index.ts", "./src/app.ts", "./src/utils.ts"];

	const results = await parseMultipleFiles(files);

	results.forEach((result, i) => {
		if (Result.isOk(result)) {
			console.log(`✓ ${files[i]}: OK`);
		} else {
			console.error(`✗ ${files[i]}: ${result.error}`);
		}
	});
}

// Run examples
parseSingleFile();
parseMultiple();
