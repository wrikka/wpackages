/**
 * Usage examples for CLI service
 */

import { Effect } from "effect";
import { makeCliService } from "./cli.service";
import type { Process } from "./cli.service";

// Example 1: Parse command line arguments
const example1 = Effect.gen(function* () {
	console.log("=== Example 1: Parse CLI arguments ===");

	const mockProcess: Process = {
		argv: ["node", "wtslint", "src/", "--fix", "--silent"],
		exit: (code: number) => console.log(`Would exit with code: ${code}`),
	};

	const service = makeCliService(mockProcess);
	const args = yield* service.getArgs;

	console.log("Raw argv:", mockProcess.argv);
	console.log("Parsed args:", args);
	console.log(
		"Flags:",
		args.filter((a) => a.startsWith("--")),
	);
	console.log(
		"Paths:",
		args.filter((a) => !a.startsWith("--")),
	);
});

// Example 2: Detect specific flags
const example2 = Effect.gen(function* () {
	console.log("\n=== Example 2: Detect flags ===");

	const mockProcess: Process = {
		argv: ["node", "wtslint", "--fix", "src/"],
		exit: () => {},
	};

	const service = makeCliService(mockProcess);
	const args = yield* service.getArgs;

	const hasFix = args.includes("--fix");
	const hasSilent = args.includes("--silent");
	const hasHelp = args.includes("--help") || args.includes("-h");

	console.log("Has --fix:", hasFix);
	console.log("Has --silent:", hasSilent);
	console.log("Has --help:", hasHelp);
});

// Example 3: Extract paths
const example3 = Effect.gen(function* () {
	console.log("\n=== Example 3: Extract paths ===");

	const mockProcess: Process = {
		argv: ["node", "wtslint", "src/", "test/", "lib/", "--fix"],
		exit: () => {},
	};

	const service = makeCliService(mockProcess);
	const args = yield* service.getArgs;

	const paths = args.filter((arg) => !arg.startsWith("--"));
	const flags = args.filter((arg) => arg.startsWith("--"));

	console.log("Paths to lint:", paths);
	console.log("Flags:", flags);
});

// Example 4: Exit with code
const example4 = Effect.gen(function* () {
	console.log("\n=== Example 4: Exit handling ===");

	let exitCode = -1;
	const mockProcess: Process = {
		argv: ["node", "wtslint"],
		exit: (code: number) => {
			exitCode = code;
			console.log(`Exiting with code: ${code}`);
		},
	};

	const service = makeCliService(mockProcess);

	// Simulate error condition
	const hasErrors = true;
	if (hasErrors) {
		yield* service.exit(1);
	}

	console.log("Exit code captured:", exitCode);
});

// Run all examples
const program = Effect.gen(function* () {
	yield* example1;
	yield* example2;
	yield* example3;
	yield* example4;
});

Effect.runPromise(program).catch(console.error);
