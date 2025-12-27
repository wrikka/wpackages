/**
 * Usage examples for lint app
 */

import { lint, lintWithDefaults } from "./app";

// ============================================
// Example 1: Basic Linting
// ============================================

async function example1() {
	const result = await lint({ paths: ["./src"] });

	result.match({
		ok: (report: any) => {
			console.log(`✅ Linted ${report.filesLinted} files`);
			console.log(`Errors: ${report.errorCount}`);
			console.log(`Warnings: ${report.warningCount}`);
		},
		err: (error: any) => {
			console.error("❌ Linting failed:", error.message);
		},
	});
}

// ============================================
// Example 2: Multiple Paths
// ============================================

async function example2() {
	const result = await lint({
		paths: ["./src", "./lib", "./tests"],
		silent: false,
	});

	if (result.isOk()) {
		const report = result.unwrap();
		console.log("Lint Report:", report);
	}
}

// ============================================
// Example 3: Silent Mode
// ============================================

async function example3() {
	const result = await lint({
		paths: ["./src"],
		silent: true, // No console output
	});

	// Only check result
	if (result.isErr()) {
		console.error("Error:", result.unwrapErr());
		process.exit(1);
	}
}

// ============================================
// Example 4: Custom Rules
// ============================================

async function example4() {
	const result = await lint({
		paths: ["./src"],
		rules: {
			"no-console": "error",
			"no-debugger": "error",
			"prefer-const": "warning",
		},
	});

	result.match({
		ok: (report) => console.log("Success:", report),
		err: (error) => console.error("Failed:", error),
	});
}

// ============================================
// Example 5: With Auto-fix
// ============================================

async function example5() {
	const result = await lint({
		paths: ["./src"],
		fix: true, // Auto-fix fixable issues
	});

	result.match({
		ok: (report) => {
			console.log(`Fixed ${report.fixableErrorCount} errors`);
			console.log(`Fixed ${report.fixableWarningCount} warnings`);
		},
		err: (error) => console.error(error),
	});
}

// ============================================
// Example 6: With Ignore Patterns
// ============================================

async function example6() {
	const result = await lint({
		paths: ["./"],
		ignore: [
			"**/node_modules/**",
			"**/dist/**",
			"**/*.test.ts",
			"**/*.spec.ts",
		],
	});

	console.log("Result:", result);
}

// ============================================
// Example 7: Using Defaults
// ============================================

async function example7() {
	const result = await lintWithDefaults(["./src", "./lib"]);

	if (result.isOk()) {
		console.log("✅ All files passed linting");
	} else {
		console.error("❌ Linting failed");
		process.exit(1);
	}
}

// ============================================
// Example 8: CI/CD Integration
// ============================================

async function example8() {
	const result = await lint({
		paths: ["./src"],
		silent: true,
	});

	result.match({
		ok: (report) => {
			if (report.errorCount > 0) {
				console.error(`❌ Found ${report.errorCount} errors`);
				process.exit(1);
			}
			console.log("✅ No errors found");
		},
		err: (error) => {
			console.error("❌ Linting failed:", error);
			process.exit(1);
		},
	});
}

// ============================================
// Example 9: Detailed Report
// ============================================

async function example9() {
	const result = await lint({ paths: ["./src"] });

	result.match({
		ok: (report) => {
			console.log("\n📊 Lint Report");
			console.log("─".repeat(50));
			console.log(`Files Linted: ${report.filesLinted}`);
			console.log(`Errors: ${report.errorCount}`);
			console.log(`Warnings: ${report.warningCount}`);
			console.log(`Fixable Errors: ${report.fixableErrorCount}`);
			console.log(`Fixable Warnings: ${report.fixableWarningCount}`);
			console.log("─".repeat(50));

			// Show files with issues
			for (const result of report.results) {
				if (result.messages.length > 0) {
					console.log(`\n📄 ${result.filePath}`);
					for (const msg of result.messages) {
						console.log(`  ${msg.severity}: ${msg.message} (${msg.ruleId})`);
					}
				}
			}
		},
		err: (error) => console.error(error),
	});
}

// ============================================
// Example 10: Error Handling
// ============================================

async function example10() {
	try {
		const result = await lint({ paths: ["./src"] });

		// Chain operations
		const report = result
			.tap((r) => console.log(`Linted ${r.filesLinted} files`))
			.tapErr((e) => console.error(`Error: ${e.message}`))
			.unwrapOr({
				results: [],
				errorCount: 0,
				warningCount: 0,
				fixableErrorCount: 0,
				fixableWarningCount: 0,
				filesLinted: 0,
			});

		console.log("Final report:", report);
	} catch (error) {
		console.error("Unexpected error:", error);
	}
}

// Export examples
export {
	example1,
	example2,
	example3,
	example4,
	example5,
	example6,
	example7,
	example8,
	example9,
	example10,
};

// Run examples
if (import.meta.main) {
	console.log("Running lint examples...\n");
	await example1();
}
