import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const setup = async () => {
	const dir = "./temp-lint-test";
	await mkdir(dir, { recursive: true });
	const filePath = join(dir, "test.ts");
	// This code has a lint error (e.g., using var)
	await writeFile(filePath, "var x = 1;");
	return dir;
};

const runLintExample = async () => {
	try {
		const testDir = await setup();

		console.log(`Linting files in: ${testDir}`);

		// Example lint report (placeholder)
		const report = {
			errorCount: 1,
			warningCount: 0,
			fixableErrorCount: 1,
			fixableWarningCount: 0,
			filesLinted: 1,
			results: [],
		};

		console.log("\n--- LINT REPORT ---");
		console.log(`Total errors: ${report.errorCount}`);
		console.log("--- END REPORT ---");
	} catch (error) {
		console.error("Error:", error);
	}
};

export { runLintExample };

if (import.meta.main) {
	await runLintExample();
}
