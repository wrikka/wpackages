import { findUnused } from "@wpackages/unused";
import { Context, Effect, Layer } from "effect";
import { CHECK_NAMES } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

export class UnusedCheckerService extends Context.Tag("UnusedCheckerService")<
	UnusedCheckerService,
	{
		check: (patterns: string[]) => Effect.Effect<CheckResult, Error>;
	}
>() {}

export const makeUnusedCheckerService = () => {
	const check = (): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];

			try {
				const result = yield* Effect.tryPromise(() =>
					findUnused({
						cwd: process.cwd(),
						cache: false,
					})
				);

				for (const filePath of result.unusedFiles) {
					issues.push({
						file: filePath,
						message: `Unused file: ${filePath}`,
						severity: "warning",
						suggestion: "Remove unused file or add to entrypoints",
					});
				}

				for (const dep of result.unusedDependencies) {
					issues.push({
						message: `Unused dependency: ${dep}`,
						severity: "warning",
						suggestion: `Remove ${dep} from package.json dependencies`,
					});
				}

				for (const [filePath, exports] of result.unusedExports.entries()) {
					for (const exp of exports) {
						issues.push({
							file: filePath,
							message: `Unused export: ${exp}`,
							severity: "warning",
							suggestion: `Remove export '${exp}' from ${filePath}`,
						});
					}
				}

				const hasErrors = issues.some((i) => i.severity === "error");

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.unused,
					status: hasErrors
						? ("failed" as const)
						: issues.length > 0
						? ("failed" as const)
						: ("passed" as const),
					summary: `Found ${issues.length} unused items`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error ? error : new Error("Unused code checking failed"),
				);
			}
		});

	return { check };
};

export const UnusedCheckerLive = Layer.effect(
	UnusedCheckerService,
	Effect.sync(() => makeUnusedCheckerService()),
);
