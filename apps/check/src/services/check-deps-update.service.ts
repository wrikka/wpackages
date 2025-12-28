import { Context, Effect, Layer } from "effect";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CHECK_NAMES } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

export class DepsUpdateCheckerService extends Context.Tag("DepsUpdateCheckerService")<
	DepsUpdateCheckerService,
	{
		check: () => Effect.Effect<CheckResult, Error>;
	}
>() {}

export const makeDepsUpdateCheckerService = () => {
	const check = (): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];

			try {
				// Read package.json
				const packageJsonPath = join(process.cwd(), "package.json");
				const packageJsonContent = yield* Effect.tryPromise({
					catch: (error) =>
						error instanceof Error
							? error
							: new Error("Failed to read package.json"),
					try: () => readFile(packageJsonPath, "utf-8"),
				});

				const packageJson = JSON.parse(packageJsonContent);
				const dependencies = {
					...packageJson.dependencies,
					...packageJson.devDependencies,
				};

				// Check for outdated dependencies
				for (const [name, version] of Object.entries(dependencies) as [string, string][]) {
					// Skip workspace dependencies
					if (typeof version === "string" && version.startsWith("workspace:")) {
						continue;
					}

					// Check for caret (^) or tilde (~) versions
					if (typeof version === "string" && (version.startsWith("^") || version.startsWith("~"))) {
						issues.push({
							message: `Dependency "${name}" uses flexible version: ${version}`,
							severity: "info",
							suggestion: "Consider pinning to exact version for reproducibility",
							code: "DEPS_FLEXIBLE_VERSION",
						});
					}

					// Check for pre-release versions
					if (
						typeof version === "string"
						&& (version.includes("-alpha") || version.includes("-beta") || version.includes("-rc"))
					) {
						issues.push({
							message: `Dependency "${name}" uses pre-release version: ${version}`,
							severity: "warning",
							suggestion: "Consider updating to stable version",
							code: "DEPS_PRERELEASE",
						});
					}

					// Check for very old version patterns
					if (typeof version === "string" && version.match(/^\d+\.\d+\.\d+$/)) {
						// Could check against npm registry in production
						issues.push({
							message: `Dependency "${name}" version: ${version} (consider checking for updates)`,
							severity: "info",
							suggestion: "Run 'bun update:deps' to check for available updates",
							code: "DEPS_CHECK_UPDATE",
						});
					}
				}

				const hasWarnings = issues.some((i) => i.severity === "warning");

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.depsUpdate,
					status: hasWarnings ? ("failed" as const) : issues.length > 0 ? ("failed" as const) : ("passed" as const),
					summary: `Checked ${Object.keys(dependencies).length} dependencies, found ${issues.length} update issues`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error ? error : new Error("Dependency update checking failed"),
				);
			}
		});

	return { check };
};

export const DepsUpdateCheckerLive = Layer.effect(
	DepsUpdateCheckerService,
	Effect.sync(() => makeDepsUpdateCheckerService()),
);
