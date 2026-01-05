import { Effect } from "effect";
import {
	CircularCheckerService,
	ComplexityCheckerService,
	DepsCheckerService,
	DepsUpdateCheckerService,
	DuplicatesCheckerService,
	ImportsCheckerService,
	ResponsibilityCheckerService,
	SecurityCheckerService,
	SideEffectCheckerService,
	SizeCheckerService,
	TypeCheckerService,
	UnusedCheckerService,
} from "../services/index";
import type { CheckerOptions, CheckResult, CheckResults, CheckType } from "../types/index";

import type { TypeAnalyzerService } from "../services/index";

const serviceMap: Partial<Record<CheckType, Effect.Tag<any>>> = {
	type: TypeCheckerService,
	unused: UnusedCheckerService,
	deps: DepsCheckerService,
	depsUpdate: DepsUpdateCheckerService,
	imports: ImportsCheckerService,
	circular: CircularCheckerService,
	complexity: ComplexityCheckerService,
	size: SizeCheckerService,
	duplicates: DuplicatesCheckerService,
	security: SecurityCheckerService,
	sideEffect: SideEffectCheckerService,
	responsibility: ResponsibilityCheckerService,
	"type-analysis": TypeAnalyzerService,
};

const checksWithPatterns: CheckType[] = [
	"type",
	"unused",
	"imports",
	"circular",
	"complexity",
	"size",
	"duplicates",
	"security",
	"sideEffect",
	"responsibility",
];

export type AllCheckerServices =
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
	| SideEffectCheckerService
	| ResponsibilityCheckerService
	| TypeAnalyzerService;

const runSingleCheck = (
	checkType: CheckType,
	options: CheckerOptions,
): Effect.Effect<CheckResult, Error, AllCheckerServices> =>
	Effect.gen(function*() {
		const serviceTag = serviceMap[checkType];

		if (!serviceTag) {
			return Effect.succeed(Effect.succeed({
				duration: 0,
				issues: [],
				name: checkType,
				status: "skipped" as const,
				summary: "Not implemented yet",
			}));
		}

		const service = yield* serviceTag;

		if (checksWithPatterns.includes(checkType)) {
			const patterns = options.include || [];
			return yield* service.check(patterns);
		}

		return yield* service.check();
	});

export const runChecks = (
	options: CheckerOptions,
): Effect.Effect<CheckResults, Error, AllCheckerServices> =>
	Effect.gen(function*() {
		const startTime = Date.now();

		const checkEffects = options.types.map((checkType) => runSingleCheck(checkType, options));

		const results = yield* Effect.all(checkEffects, { concurrency: "inherit" });

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
