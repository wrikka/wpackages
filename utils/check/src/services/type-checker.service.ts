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
					ts.sys.fileExists,
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
				const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
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
