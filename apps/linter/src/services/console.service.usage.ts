/**
 * Usage examples for console service
 */

import { Effect } from "effect";
import { ConsoleService } from "./console.service";

// Example 1: Simple logging
const example1 = Effect.gen(function*() {
	console.log("=== Example 1: Simple logging ===");
	yield* ConsoleService.log("Hello from ConsoleService!");
	yield* ConsoleService.log("This is logged via Effect");
});

// Example 2: Sequential logging
const example2 = Effect.gen(function*() {
	console.log("\n=== Example 2: Sequential logging ===");
	yield* ConsoleService.log("Step 1: Initialize");
	yield* ConsoleService.log("Step 2: Process");
	yield* ConsoleService.log("Step 3: Complete");
});

// Example 3: Conditional logging
const example3 = Effect.gen(function*() {
	console.log("\n=== Example 3: Conditional logging ===");
	const shouldLog = true;

	if (shouldLog) {
		yield* ConsoleService.log("Logging is enabled");
	}

	yield* Effect.when(
		ConsoleService.log("This only logs when true"),
		() => shouldLog,
	);
});

// Example 4: Logging with formatting
const example4 = Effect.gen(function*() {
	console.log("\n=== Example 4: Formatted logging ===");
	const count = 42;
	const name = "wtslint";

	yield* ConsoleService.log(`Found ${count} files to lint`);
	yield* ConsoleService.log(`Running ${name} linter...`);
});

// Run all examples
const program = Effect.gen(function*() {
	yield* example1;
	yield* example2;
	yield* example3;
	yield* example4;
});

Effect.runPromise(program);
