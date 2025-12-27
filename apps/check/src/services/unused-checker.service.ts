import { Context, Effect, Layer } from "effect";
import * as ts from "typescript";
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
						name: CHECK_NAMES.unused,
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

				const program = ts.createProgram({
					options: parsedConfig.options,
					rootNames: parsedConfig.fileNames,
				});
				for (const sourceFile of program.getSourceFiles()) {
					if (sourceFile.isDeclarationFile) continue;
					if (sourceFile.fileName.includes("node_modules")) continue;

					const unusedIdentifiers = findUnusedIdentifiers(sourceFile, program);

					for (const identifier of unusedIdentifiers) {
						const { line, character } = ts.getLineAndCharacterOfPosition(
							sourceFile,
							identifier.getStart(),
						);

						issues.push({
							column: character + 1,
							file: sourceFile.fileName,
							line: line + 1,
							message: `'${identifier.getText()}' is declared but never used`,
							severity: "warning",
							suggestion: `Remove unused ${
								identifier.parent?.kind === ts.SyntaxKind.ImportSpecifier ? "import" : "variable"
							}`,
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
					summary: `Found ${issues.length} unused declarations`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error
						? error
						: new Error("Unused code checking failed"),
				);
			}
		});

	return { check };
};

// Helper function to find unused identifiers
function findUnusedIdentifiers(
	sourceFile: ts.SourceFile,
	program: ts.Program,
): ts.Identifier[] {
	const unusedIdentifiers: ts.Identifier[] = [];
	const typeChecker = program.getTypeChecker();

	function visit(node: ts.Node) {
		// Check for unused imports
		if (ts.isImportDeclaration(node)) {
			const importClause = node.importClause;
			if (
				importClause?.namedBindings
				&& ts.isNamedImports(importClause.namedBindings)
			) {
				for (const element of importClause.namedBindings.elements) {
					const symbol = typeChecker.getSymbolAtLocation(element.name);
					if (symbol) {
						// Use getSymbolAtLocation to check if symbol is used
						const declarations = symbol.getDeclarations();
						if (declarations && declarations.length > 0) {
							// Simple check - if only declaration is the import itself, it's unused
							const isUsed = program.getSourceFiles().some(file => {
								if (file.isDeclarationFile || file.fileName.includes("node_modules")) return false;
								
								let used = false;
								ts.forEachChild(file, (child) => {
									if (ts.isIdentifier(child) && child.text === element.name.text) {
										const parent = child.parent;
										if (parent && !ts.isImportDeclaration(parent)) {
											used = true;
										}
									}
								});
								return used;
							});
							
							if (!isUsed) {
								unusedIdentifiers.push(element.name);
							}
						}
					}
				}
			}
		}

		// Check for unused variables
		if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
			const symbol = typeChecker.getSymbolAtLocation(node.name);
			if (symbol) {
				// Similar check for variables
				const nodeName = ts.isIdentifier(node.name) ? node.name.text : String(node.name);
				const isUsed = program.getSourceFiles().some(file => {
					if (file.isDeclarationFile || file.fileName.includes("node_modules")) return false;
					
					let used = false;
					ts.forEachChild(file, (child) => {
						if (ts.isIdentifier(child) && child.text === nodeName) {
							const parent = child.parent;
							if (parent && parent !== node) {
								used = true;
							}
						}
					});
					return used;
				});
				
				if (!isUsed) {
					unusedIdentifiers.push(node.name);
				}
			}
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return unusedIdentifiers;
}

export const UnusedCheckerLive = Layer.effect(
	UnusedCheckerService,
	Effect.sync(() => makeUnusedCheckerService()),
);
