import { Context, Effect, Layer } from "effect";
import { readFile } from "node:fs/promises";
import { collectFiles } from "../components/index";
import { CHECK_NAMES } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

export class SideEffectCheckerService extends Context.Tag("SideEffectCheckerService")<
	SideEffectCheckerService,
	{
		check: (patterns: string[]) => Effect.Effect<CheckResult, Error>;
	}
>() {}

// Common side effect patterns to detect
const SIDE_EFFECT_PATTERNS = [
	/console\.(log|error|warn|info|debug)/g,
	/process\.exit/g,
	/global\./g,
	/window\./g,
	/localStorage/g,
	/sessionStorage/g,
	/fetch\(/g,
	/XMLHttpRequest/g,
	/Math\.random\(\)/g,
	/Date\.now\(\)/g,
	/new Date\(\)/g,
	/setTimeout/g,
	/setInterval/g,
	/setImmediate/g,
	/eval\(/g,
	/require\(/g,
	/import\(/g,
];

export const makeSideEffectCheckerService = () => {
	const check = (patterns: string[]): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];

			try {
				// Collect all files matching patterns
				const files = yield* Effect.promise(() => collectFiles(patterns));

				// Check each file for side effects
				for (const file of files) {
					const content = yield* Effect.tryPromise({
						catch: (error) =>
							error instanceof Error ? error : new Error(`Failed to read ${file}`),
						try: () => readFile(file, "utf-8"),
					});

					const lines = content.split("\n");
					for (let lineNum = 0; lineNum < lines.length; lineNum++) {
						const line = lines[lineNum];
						if (!line) continue;

						// Skip comments
						if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
							continue;
						}

						for (const pattern of SIDE_EFFECT_PATTERNS) {
							if (pattern.test(line)) {
								const match = line.match(pattern);
								if (match) {
									issues.push({
										file,
										line: lineNum + 1,
										column: line.indexOf(match[0]) + 1,
										message: `Potential side effect detected: ${match[0]}`,
										severity: "info",
										suggestion: "Consider moving side effects to service layer or effect handlers",
										code: "SIDE_EFFECT_DETECTED",
									});
								}
							}
						}
					}
				}

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.sideEffect,
					status: issues.length > 0 ? ("failed" as const) : ("passed" as const),
					summary: `Scanned ${files.length} files, found ${issues.length} potential side effects`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error ? error : new Error("Side effect checking failed"),
				);
			}
		});

	return { check };
};

export const SideEffectCheckerLive = Layer.effect(
	SideEffectCheckerService,
	Effect.sync(() => makeSideEffectCheckerService()),
);
