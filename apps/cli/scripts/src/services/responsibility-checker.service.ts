import { Context, Effect, Layer } from "effect";
import { Project } from "ts-morph";
import { CHECK_NAMES } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

const MAX_EXPORTS = 5; // Threshold for SRP violation

export class ResponsibilityCheckerService extends Context.Tag(
	"ResponsibilityCheckerService",
)<ResponsibilityCheckerService, {
	check: (patterns: string[]) => Effect.Effect<CheckResult, Error>;
}>() {}

export const makeResponsibilityCheckerService = () => {
	const check = (patterns: string[]): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];
			let sourceFiles: any[] = [];
			try {
				const project = new Project();
				sourceFiles = project.addSourceFilesAtPaths(patterns);

				for (const sourceFile of sourceFiles) {
					const exports = sourceFile.getExportedDeclarations();
					if (exports.size > MAX_EXPORTS) {
						issues.push({
							file: sourceFile.getFilePath(),
							message:
								`File has ${exports.size} exports, which may violate the Single Responsibility Principle (SRP). Threshold is ${MAX_EXPORTS}.`,
							severity: "warning",
							suggestion: "Consider refactoring the file into smaller, more focused modules.",
						});
					}
				}
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error ? error : new Error("Responsibility checking failed"),
				);
			}

			const hasErrors = issues.some((i) => i.severity === "error");

			return {
				duration: Date.now() - startTime,
				issues,
				name: CHECK_NAMES.responsibility,
				status: hasErrors ? ("failed" as const) : issues.length > 0 ? ("failed" as const) : ("passed" as const),
				summary: `Checked ${sourceFiles.length} files, found ${issues.length} potential SRP issues`,
			};
		});

	return { check };
};

export const ResponsibilityCheckerLive = Layer.effect(
	ResponsibilityCheckerService,
	Effect.sync(() => makeResponsibilityCheckerService()),
);
