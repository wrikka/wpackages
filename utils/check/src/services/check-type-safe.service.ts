import { Context, Effect, Layer } from "effect";
import * as ts from "typescript";
import { CHECK_NAMES } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

export class TypeSafeCheckerService extends Context.Tag("TypeSafeCheckerService")<
	TypeSafeCheckerService,
	{
		check: (patterns: string[]) => Effect.Effect<CheckResult, Error>;
	}
>() {}

export const makeTypeSafeCheckerService = () => {
	const check = (): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];

			try {
				// Find tsconfig.json
				const configPath = ts.findConfigFile(
					process.cwd(),
					ts.sys.fileExists,
					"tsconfig.json",
				);

				if (!configPath) {
					return {
						duration: Date.now() - startTime,
						issues: [],
						name: CHECK_NAMES.typeSafe,
						status: "skipped" as const,
						summary: "No tsconfig.json found",
					};
				}

				// Load tsconfig
				const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
				const parsedConfig = ts.parseJsonConfigFileContent(
					configFile.config,
					ts.sys,
					process.cwd(),
				);

				// Check for strict mode settings
				const strictSettings = [
					{ key: "strict", value: parsedConfig.options.strict },
					{ key: "noImplicitAny", value: parsedConfig.options.noImplicitAny },
					{ key: "noImplicitThis", value: parsedConfig.options.noImplicitThis },
					{ key: "strictNullChecks", value: parsedConfig.options.strictNullChecks },
					{ key: "strictFunctionTypes", value: parsedConfig.options.strictFunctionTypes },
					{ key: "strictBindCallApply", value: parsedConfig.options.strictBindCallApply },
					{ key: "strictPropertyInitialization", value: parsedConfig.options.strictPropertyInitialization },
					{ key: "noImplicitReturns", value: parsedConfig.options.noImplicitReturns },
					{ key: "noFallthroughCasesInSwitch", value: parsedConfig.options.noFallthroughCasesInSwitch },
				];

				for (const setting of strictSettings) {
					if (!setting.value) {
						issues.push({
							message: `TypeScript strict mode setting "${setting.key}" is not enabled`,
							severity: "warning",
							suggestion: `Enable "${setting.key}" in tsconfig.json for better type safety`,
							code: "TYPE_SAFE_DISABLED",
						});
					}
				}

				// Check for any type usage (requires program analysis)
				const program = ts.createProgram(
					parsedConfig.fileNames,
					parsedConfig.options,
				);

				// Check for any type usage in source files
				let anyTypeCount = 0;
				for (const sourceFile of program.getSourceFiles()) {
					if (sourceFile.isDeclarationFile) continue;

					const content = sourceFile.text;
					const anyMatches = content.match(/:\s*any\b|as\s+any\b/g);
					if (anyMatches) {
						anyTypeCount += anyMatches.length;
					}
				}

				if (anyTypeCount > 0) {
					issues.push({
						message: `Found ${anyTypeCount} uses of 'any' type`,
						severity: "warning",
						suggestion: "Replace 'any' with specific types for better type safety",
						code: "TYPE_SAFE_ANY_USAGE",
					});
				}

				const hasWarnings = issues.some((i) => i.severity === "warning");

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.typeSafe,
					status: hasWarnings ? ("failed" as const) : ("passed" as const),
					summary: `Checked type safety settings, found ${issues.length} issues`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error ? error : new Error("Type safety checking failed"),
				);
			}
		});

	return { check };
};

export const TypeSafeCheckerLive = Layer.effect(
	TypeSafeCheckerService,
	Effect.sync(() => makeTypeSafeCheckerService()),
);
