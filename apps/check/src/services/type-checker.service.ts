import { Context, Effect, Layer } from "effect";
import * as ts from "typescript";
import { CHECK_NAMES } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

export class TypeCheckerService extends Context.Tag("TypeCheckerService")<
	TypeCheckerService,
	{
		check: (patterns: string[]) => Effect.Effect<CheckResult, Error>;
	}
>() {}

export const makeTypeCheckerService = () => {
	const check = (): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];

			try {
				// Find tsconfig.json
				const configPath = ts.findConfigFile(
					process.cwd(),
					(path) => ts.sys.fileExists(path),
					"tsconfig.json",
				);

				if (!configPath) {
					return {
						duration: Date.now() - startTime,
						issues: [],
						name: CHECK_NAMES.type,
						status: "skipped" as const,
						summary: "No tsconfig.json found",
					};
				}

				// Load tsconfig
				const configFile = ts.readConfigFile(configPath, (path) => ts.sys.readFile(path));
				const parsedConfig = ts.parseJsonConfigFileContent(
					configFile.config,
					ts.sys,
					process.cwd(),
				);

				// Create program
				const program = ts.createProgram(
					parsedConfig.fileNames,
					parsedConfig.options,
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

				// Get diagnostics
				const diagnostics = [
					...program.getSemanticDiagnostics(),
					...program.getSyntacticDiagnostics(),
					...program.getDeclarationDiagnostics(),
				];

				// Convert diagnostics to issues
				for (const diagnostic of diagnostics) {
					if (diagnostic.file) {
						const { line, character } = ts.getLineAndCharacterOfPosition(
							diagnostic.file,
							diagnostic.start || 0,
						);

						issues.push({
							code: `TS${diagnostic.code}`,
							column: character + 1,
							file: diagnostic.file.fileName,
							line: line + 1,
							message: ts.flattenDiagnosticMessageText(
								diagnostic.messageText,
								"\n",
							),
							severity: diagnostic.category === ts.DiagnosticCategory.Error
								? "error"
								: "warning",
						});
					} else {
						issues.push({
							code: `TS${diagnostic.code}`,
							message: ts.flattenDiagnosticMessageText(
								diagnostic.messageText,
								"\n",
							),
							severity: "error",
						});
					}
				}

				const hasErrors = issues.some((i) => i.severity === "error");

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.type,
					status: hasErrors ? ("failed" as const) : ("passed" as const),
					summary: `Found ${issues.length} type issues`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error ? error : new Error("Type checking failed"),
				);
			}
		});

	return { check };
};

export const TypeCheckerLive = Layer.effect(
	TypeCheckerService,
	Effect.sync(() => makeTypeCheckerService()),
);
