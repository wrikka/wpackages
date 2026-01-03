import { Effect, Layer } from "effect";
import { formatCheckResult, formatJson, formatSummary, formatTable } from "./components/index";
import { createCheckerConfig } from "./config/index";
import {
	CircularCheckerLive,
	ComplexityCheckerLive,
	DepsCheckerLive,
	DepsUpdateCheckerLive,
	DuplicatesCheckerLive,
	ImportsCheckerLive,
	SecurityCheckerLive,
	SideEffectCheckerLive,
	SizeCheckerLive,
	TypeCheckerLive,
	TypeSafeCheckerLive,
	UnusedCheckerLive,
} from "./services/index";
import type { CheckerOptions, CheckResults } from "./types/index";
import { runChecks } from "./utils/index";

// Combine all service layers
const CheckerServicesLive = Layer.mergeAll(
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
	TypeSafeCheckerLive,
	SideEffectCheckerLive,
);

export const runChecker = (
	partialOptions: Partial<CheckerOptions> = {},
): Effect.Effect<CheckResults, Error> =>
	Effect.gen(function*() {
		const options = createCheckerConfig(partialOptions);

		if (!options.silent) {
			console.log("🔍 Running code quality checks...\n");
		}

		// Run all checks
		const results = yield* runChecks(options);

		// Format output
		if (!options.silent) {
			switch (options.output) {
				case "json":
					console.log(formatJson(results));
					break;
				case "table":
					console.log(formatTable(results));
					console.log(formatSummary(results));
					break;
				default:
					for (const result of results.results) {
						console.log(formatCheckResult(result));
					}
					console.log(formatSummary(results));
			}
		}

		// Exit with appropriate code
		if (results.failed > 0) {
			return yield* Effect.fail(new Error(`${results.failed} checks failed`));
		}

		return results;
	}).pipe(Effect.provide(CheckerServicesLive));

// Export program for direct execution
export const CheckerProgram = runChecker();
