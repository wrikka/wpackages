/**
 * Usage examples for linter service
 */

import { DEFAULT_CONFIG } from "../config";
import { noConsole, noDebugger, RECOMMENDED_RULES } from "../rules";
import type { LinterOptions, LintMessage } from "../types";
import { lintFile, lintFiles } from "./linter.service";

// Example 1: Lint single file
const example1 = async () => {
	console.log("=== Example 1: Lint single file ===");

	const options: LinterOptions = {
		...DEFAULT_CONFIG,
		rules: {
			"no-console": "warning",
			"no-debugger": "error",
		},
	};

	try {
		const result = await lintFile(
			"src/index.ts",
			[noConsole, noDebugger],
			options,
		);

		console.log(`File: ${result.filePath}`);
		console.log(`Errors: ${result.errorCount}`);
		console.log(`Warnings: ${result.warningCount}`);
		console.log(`Messages: ${result.messages.length}`);
	} catch {
		console.log("Error linting file (file may not exist in this example)");
	}
};

// Example 2: Lint multiple files
const example2 = async () => {
	console.log("\n=== Example 2: Lint multiple files ===");

	const files = ["src/app.ts", "src/utils.ts"];
	const options: LinterOptions = DEFAULT_CONFIG;

	try {
		const report = await lintFiles(files, RECOMMENDED_RULES, options);

		console.log(`Files linted: ${report.filesLinted}`);
		console.log(`Total errors: ${report.errorCount}`);
		console.log(`Total warnings: ${report.warningCount}`);
		console.log(`Fixable errors: ${report.fixableErrorCount}`);
		console.log(`Fixable warnings: ${report.fixableWarningCount}`);
	} catch {
		console.log("Error linting files");
	}
};

// Example 3: Custom rules configuration
const example3 = () => {
	console.log("\n=== Example 3: Custom configuration ===");

	const options: LinterOptions = {
		rules: {
			"no-console": "off", // Disable console check
			"no-debugger": "error",
			"no-mutation": "warning",
			"prefer-const": "warning",
		},
		fix: true,
		ignore: ["node_modules", "dist"],
		extensions: [".ts", ".tsx", ".js", ".jsx"],
	};

	console.log("Configuration:");
	console.log("  Rules:", Object.keys(options.rules).length);
	console.log("  Auto-fix:", options.fix);
	console.log("  Ignore:", options.ignore.join(", "));
	console.log("  Extensions:", options.extensions.join(", "));
};

// Example 4: Process lint results
const example4 = async () => {
	console.log("\n=== Example 4: Process results ===");

	const files = ["src/index.ts"];
	const options: LinterOptions = DEFAULT_CONFIG;

	try {
		const report = await lintFiles(files, RECOMMENDED_RULES, options);

		// Process each result
		for (const result of report.results) {
			console.log(`\nFile: ${result.filePath}`);

			if (result.messages.length === 0) {
				console.log("  ✓ No issues");
			} else {
				result.messages.forEach((msg: LintMessage) => {
					const icon = msg.severity === "error" ? "✖" : "⚠";
					console.log(
						`  ${icon} Line ${msg.line}: ${msg.message} (${msg.ruleId})`,
					);
				});
			}
		}

		// Summary
		const hasIssues = report.errorCount > 0 || report.warningCount > 0;
		if (!hasIssues) {
			console.log("\n✓ All files passed!");
		}
	} catch {
		console.log("Error processing lint results");
	}
};

// Run examples
const runExamples = async () => {
	await example1();
	await example2();
	example3();
	await example4();
};

runExamples().catch(console.error);
