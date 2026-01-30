import { Context, Effect, Layer } from "effect";
import * as ts from "typescript";
import { CHECK_NAMES } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

export class ImportsCheckerService extends Context.Tag("ImportsCheckerService")<
	ImportsCheckerService,
	{
		check: (patterns: string[]) => Effect.Effect<CheckResult, Error>;
	}
>() {}

export const makeImportsCheckerService = () => {
	const check = (): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];

			try {
				const configPath = ts.findConfigFile(
					process.cwd(),
					(path) => ts.sys.fileExists(path),
					"tsconfig.json",
				);

				if (!configPath) {
					return {
						duration: Date.now() - startTime,
						issues: [],
						name: CHECK_NAMES.imports,
						status: "skipped" as const,
						summary: "No tsconfig.json found",
					};
				}

				const configFile = ts.readConfigFile(configPath, (path) => ts.sys.readFile(path));
				const parsedConfig = ts.parseJsonConfigFileContent(
					configFile.config,
					ts.sys,
					process.cwd(),
				);

				const program = ts.createProgram(
					parsedConfig.fileNames,
					parsedConfig.options,
				);

				for (const sourceFile of program.getSourceFiles()) {
					if (sourceFile.isDeclarationFile) continue;
					if (sourceFile.fileName.includes("node_modules")) continue;

					ts.forEachChild(sourceFile, (node) => {
						if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
							const moduleSpecifier = node.moduleSpecifier;
							if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
								const importPath = moduleSpecifier.text;

								if (importPath.startsWith(".")) {
									if (
										!importPath.endsWith(".js")
										&& !importPath.endsWith(".json")
									) {
										const { line, character } = ts.getLineAndCharacterOfPosition(
											sourceFile,
											moduleSpecifier.getStart(),
										);

										issues.push({
											column: character + 1,
											file: sourceFile.fileName,
											line: line + 1,
											message: `Import "${importPath}" is missing .js extension`,
											severity: "warning",
											suggestion: "Add .js extension for ESM compatibility",
										});
									}
								}
							}
						}
					});
				}

				const hasErrors = issues.some((i) => i.severity === "error");

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.imports,
					status: hasErrors
						? ("failed" as const)
						: issues.length > 0
						? ("failed" as const)
						: ("passed" as const),
					summary: `Found ${issues.length} import issues`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error ? error : new Error("Import checking failed"),
				);
			}
		});

	return { check };
};

export const ImportsCheckerLive = Layer.effect(
	ImportsCheckerService,
	Effect.sync(() => makeImportsCheckerService()),
);
