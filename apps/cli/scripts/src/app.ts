#!/usr/bin/env bun
import { intro, isCancel, multiselect, outro, spinner } from "@clack/prompts";
import { Effect, Layer } from "effect";
import { createCheckerConfig } from "../../scripts.config";
import { formatCheckResult, formatSummary } from "./components/index";
import {
	CircularCheckerLive,
	ComplexityCheckerLive,
	DepsCheckerLive,
	DepsUpdateCheckerLive,
	DuplicatesCheckerLive,
	ImportsCheckerLive,
	ResponsibilityCheckerLive,
	SecurityCheckerLive,
	SideEffectCheckerLive,
	SizeCheckerLive,
	TypeAnalyzerLive,
	TypeCheckerLive,
	UnusedCheckerLive,
} from "./services/index";
import type { CheckerOptions, CheckResults, CheckType } from "./types/index";
import { runChecks } from "./utils/index";

const AllCheckerServicesLive = Layer.mergeAll(
	TypeCheckerLive,
	UnusedCheckerLive,
	DepsCheckerLive,
	DepsUpdateCheckerLive,
	ImportsCheckerLive,
	CircularCheckerLive,
	ComplexityCheckerLive,
	SizeCheckerLive,
	DuplicatesCheckerLive,
	SecurityCheckerLive,
	SideEffectCheckerLive,
	ResponsibilityCheckerLive,
	TypeAnalyzerLive,
);

export const runChecker = (
	partialOptions: Partial<CheckerOptions> = {},
): Effect.Effect<CheckResults, Error, never> =>
	Effect.gen(function*() {
		const options = createCheckerConfig(partialOptions);
		const results = yield* runChecks(options);

		for (const result of results.results) {
			console.log(formatCheckResult(result));
		}
		console.log(formatSummary(results));

		if (results.failed > 0) {
			return yield* Effect.fail(new Error(`${results.failed} checks failed`));
		}
		return results;
	}).pipe(Effect.provide(AllCheckerServicesLive));

async function main() {
	intro(`Code Quality Checker`);

	const checkTypes = await multiselect({
		message: "Which checks would you like to run?",
		options: [
			{ value: "type", label: "TypeScript Type Checking" },
			{ value: "unused", label: "Detect Unused Code" },
			{ value: "deps", label: "Check Dependencies" },
			{ value: "depsUpdate", label: "Check for Outdated Dependencies" },
			{ value: "imports", label: "Validate Imports" },
			{ value: "circular", label: "Detect Circular Dependencies" },
			{ value: "complexity", label: "Check Code Complexity" },
			{ value: "size", label: "Check File Sizes" },
			{ value: "duplicates", label: "Find Duplicate Code" },
			{ value: "security", label: "Security Checks" },
			{ value: "sideEffect", label: "Detect Side Effects" },
			{ value: "responsibility", label: "Check Single Responsibility" },
			{ value: "type-analysis", label: "Analyze Type Declarations" },
		],
		initialValues: ["type", "unused", "deps"],
	});

	if (isCancel(checkTypes)) {
		outro("Cancelled");
		process.exit(0);
	}

	const s = spinner();
	s.start("Running checks...");

	const options = {
		types: checkTypes as CheckType[],
	};

	const program = runChecker(options);

	Effect.runPromise(program)
		.then(() => {
			s.stop("Checks completed successfully.");
			outro("All checks passed!");
			process.exit(0);
		})
		.catch((error: unknown) => {
			s.stop("Checks failed.");
			if (error instanceof Error) {
				outro(`An unexpected error occurred: ${error.message}`);
			} else {
				outro("An unexpected error occurred. Please check the logs for more details.");
			}
			console.error(error);
			process.exit(1);
		});
}

if (import.meta.main) {
	main().catch(console.error);
}
