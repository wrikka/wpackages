import { Context, Effect, Layer } from "effect";
import { stat } from "node:fs/promises";
import { collectFiles } from "../components/index";
import { CHECK_NAMES, DEFAULT_MAX_FILE_SIZE } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

export class SizeCheckerService extends Context.Tag("SizeCheckerService")<
	SizeCheckerService,
	{
		check: (
			patterns: string[],
			maxSize?: number,
		) => Effect.Effect<CheckResult, Error>;
	}
>() {}

export const makeSizeCheckerService = () => {
	const check = (
		patterns: string[],
		maxSize = DEFAULT_MAX_FILE_SIZE,
	): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];

			try {
				// Collect all files matching patterns
				const files = yield* Effect.promise(() => collectFiles(patterns));

				// Check file sizes
				for (const file of files) {
					try {
						const stats = yield* Effect.promise(() => stat(file));

						if (stats.size > maxSize) {
							const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
							const maxMB = (maxSize / (1024 * 1024)).toFixed(2);

							issues.push({
								file,
								message: `File size ${sizeMB}MB exceeds maximum ${maxMB}MB`,
								severity: "warning",
								suggestion: "Consider splitting the file or optimizing its contents",
							});
						}
					// eslint-disable-next-line no-unused-vars
					} catch (_) {
						// Ignore file access errors - some files might not be accessible
					}
				}

				const hasErrors = issues.some((i) => i.severity === "error");

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.size,
					status: hasErrors
						? ("failed" as const)
						: issues.length > 0
						? ("failed" as const)
						: ("passed" as const),
					summary: `Checked ${files.length} files, found ${issues.length} size issues`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error ? error : new Error("Size checking failed"),
				);
			}
		});

	return { check };
};

export const SizeCheckerLive = Layer.effect(
	SizeCheckerService,
	Effect.sync(() => makeSizeCheckerService()),
);
