import { Context, Effect, Layer } from "effect";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { CHECK_NAMES } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

const execPromise = promisify(exec);

export class DepsCheckerService extends Context.Tag("DepsCheckerService")<
	DepsCheckerService,
	{
		check: () => Effect.Effect<CheckResult, Error>;
	}
>() {}

export const makeDepsCheckerService = () => {
	const check = (): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];

			try {
				const knipEffect = Effect.promise(() => execPromise("bunx knip --reporter json")).pipe(
					Effect.catchAll((error: unknown) => {
						if (error && typeof error === "object" && "stdout" in error) {
							// This is the "success" case where knip found issues and reported them
							return Effect.succeed({ stdout: (error as { stdout: string }).stdout, stderr: "" });
						}
						// This is a real execution error
						return Effect.fail(error instanceof Error ? error : new Error("Failed to run knip"));
					})
				);

				const { stdout } = yield* knipEffect;

				const knipResult = JSON.parse(stdout);

				// Process dependencies
				if (knipResult.dependencies && Array.isArray(knipResult.dependencies)) {
					for (const dep of knipResult.dependencies) {
						issues.push({
							file: dep.parent,
							message: `Unused dependency: "${dep.name}"`,
							severity: "warning",
							suggestion: `Remove "${dep.name}" from ${dep.parent}`,
						});
					}
				}

				const hasErrors = issues.some((i) => i.severity === "error");

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.deps,
					status: hasErrors
						? ("failed" as const)
						: issues.length > 0
						? ("failed" as const)
						: ("passed" as const),
					summary: `Found ${issues.length} unused dependencies across all packages.`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error ? error : new Error("Dependency checking failed"),
				);
			}
		});

	return { check };
};

export const DepsCheckerLive = Layer.effect(
	DepsCheckerService,
	Effect.sync(() => makeDepsCheckerService()),
);
