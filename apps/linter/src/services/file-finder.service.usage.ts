/**
 * Usage examples for file finder service
 */

// Example 1: Find files in single directory
const example1 = async () => {
	console.log("=== Example 1: Find files in directory ===");

	try {
		const files: readonly string[] = [];
		console.log(`Found ${files.length} lintable files`);

		// Show first 10 files
		files.slice(0, 10).forEach((file: string) => {
			console.log(`  - ${file}`);
		});
	} catch {
		console.log("Error finding files");
	}
};

// Example 2: Find files with ignore patterns
const example2 = async () => {
	console.log("\n=== Example 2: Find files with ignore ===");

	try {
		const ignorePatterns = ["node_modules", "dist", ".git"];
		const files: readonly string[] = [];

		console.log(`Found ${files.length} files (excluding ignored)`);
		console.log(`Ignored: ${ignorePatterns.join(", ")}`);
	} catch {
		console.log("Error finding files");
	}
};

// Example 3: Find files in multiple directories
const example3 = async () => {
	console.log("\n=== Example 3: Multiple directories ===");

	try {
		const dirs = ["src", "tests"];
		const files: readonly string[] = [];

		console.log(`Searched directories: ${dirs.join(", ")}`);
		console.log(`Total files found: ${files.length}`);

		// Group by directory
		const byDir = dirs.map((dir) => ({
			dir,
			count: files.filter((f: string) => f.includes(dir)).length,
		}));

		byDir.forEach(({ dir, count }) => {
			console.log(`  ${dir}/: ${count} files`);
		});
	} catch {
		console.log("Some directories may not exist");
	}
};

// Example 4: Custom ignore patterns
const example4 = async () => {
	console.log("\n=== Example 4: Custom ignore patterns ===");

	try {
		const ignorePatterns = [
			"node_modules",
			"dist",
			"build",
			"coverage",
			"**/*.test.ts",
			"**/*.spec.ts",
		];

		const files: readonly string[] = [];

		console.log(`Ignore patterns: ${ignorePatterns.length}`);
		console.log(`Files found: ${files.length}`);
		console.log("(Excluding test files and build directories)");
	} catch {
		console.log("Error processing files");
	}
};

// Run examples
const runExamples = async () => {
	try {
		await example1();
		await example2();
		await example3();
		await example4();
	} catch (error) {
		console.error("Error running examples:", error);
	}
};

export { example1, example2, example3, example4, runExamples };

if (import.meta.main) {
	await runExamples();
}
