import { Effect } from "effect";
import {
	CircularCheckerService,
	ComplexityCheckerService,
	DepsCheckerService,
	DepsUpdateCheckerService,
	DuplicatesCheckerService,
	ImportsCheckerService,
	SecurityCheckerService,
	SideEffectCheckerService,
	SizeCheckerService,
	TypeCheckerService,
	TypeSafeCheckerService,
	UnusedCheckerService,
} from "../services/index";
import type { CheckerOptions, CheckResult, CheckResults, CheckType } from "../types/index";

export const runChecks = (
	options: CheckerOptions,
): Effect.Effect<
	CheckResults,
	Error,
	| TypeCheckerService
	| UnusedCheckerService
	| DepsCheckerService
	| DepsUpdateCheckerService
	| ImportsCheckerService
	| CircularCheckerService
	| ComplexityCheckerService
	| SizeCheckerService
	| DuplicatesCheckerService
	| SecurityCheckerService
	| TypeSafeCheckerService
	| SideEffectCheckerService
> =>
	Effect.gen(function*() {
		const startTime = Date.now();
		const results: CheckResult[] = [];

		// Run checks based on selected types
		for (const checkType of options.types) {
			const result = yield* runSingleCheck(checkType, options);
			results.push(result);
		}

		// Calculate summary
		const passed = results.filter((r) => r.status === "passed").length;
		const failed = results.filter((r) => r.status === "failed").length;
		const skipped = results.filter((r) => r.status === "skipped").length;

		return {
			duration: Date.now() - startTime,
			failed,
			passed,
			results,
			skipped,
			total: results.length,
		};
	});

const runSingleCheck = (
	checkType: CheckType,
	options: CheckerOptions,
): Effect.Effect<
	CheckResult,
	Error,
	| TypeCheckerService
	| UnusedCheckerService
	| DepsCheckerService
	| DepsUpdateCheckerService
	| ImportsCheckerService
	| CircularCheckerService
	| ComplexityCheckerService
	| SizeCheckerService
	| DuplicatesCheckerService
	| SecurityCheckerService
	| TypeSafeCheckerService
	| SideEffectCheckerService
> =>
	Effect.gen(function*() {
		const patterns = options.include || [];

		switch (checkType) {
			case "type": {
				const service = yield* TypeCheckerService;
				return yield* service.check(patterns);
			}
			case "unused": {
				const service = yield* UnusedCheckerService;
				return yield* service.check(patterns);
			}
			case "deps": {
				const service = yield* DepsCheckerService;
				return yield* service.check();
			}
			case "imports": {
				const service = yield* ImportsCheckerService;
				return yield* service.check(patterns);
			}
			case "circular": {
				const service = yield* CircularCheckerService;
				return yield* service.check(patterns);
			}
			case "complexity": {
				const service = yield* ComplexityCheckerService;
				return yield* service.check(patterns);
			}
			case "size": {
				const service = yield* SizeCheckerService;
				return yield* service.check(patterns);
			}
			case "duplicates": {
				const service = yield* DuplicatesCheckerService;
				return yield* service.check(patterns);
			}
			case "security": {
				const service = yield* SecurityCheckerService;
				return yield* service.check(patterns);
			}
			case "depsUpdate": {
				const service = yield* DepsUpdateCheckerService;
				return yield* service.check();
			}
			case "typeSafe": {
				const service = yield* TypeSafeCheckerService;
				return yield* service.check(patterns);
			}
			case "sideEffect": {
				const service = yield* SideEffectCheckerService;
				return yield* service.check(patterns);
			}
			default:
				return {
					duration: 0,
					issues: [],
					name: checkType,
					status: "skipped" as const,
					summary: "Not implemented yet",
				};
		}
	});
