import { Context, Effect, Layer } from "effect";
import * as ts from "typescript";
import { CHECK_NAMES, DEFAULT_MAX_COMPLEXITY } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

export class ComplexityCheckerService extends Context.Tag(
	"ComplexityCheckerService",
)<
	ComplexityCheckerService,
	{
		check: (
			patterns: string[],
			maxComplexity?: number,
		) => Effect.Effect<CheckResult, Error>;
	}
>() {}

export const makeComplexityCheckerService = () => {
	const check = (
		_patterns: string[],
		maxComplexity = DEFAULT_MAX_COMPLEXITY,
	): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];

			try {
				const configPath = ts.findConfigFile(
					process.cwd(),
					ts.sys.fileExists,
					"tsconfig.json",
				);

				if (!configPath) {
					return {
						duration: Date.now() - startTime,
						issues: [],
						name: CHECK_NAMES.complexity,
						status: "skipped" as const,
						summary: "No tsconfig.json found",
					};
				}

				const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
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

					ts.forEachChild(sourceFile, function visit(node: ts.Node) {
						if (
							ts.isFunctionDeclaration(node)
							|| ts.isMethodDeclaration(node)
							|| ts.isArrowFunction(node)
							|| ts.isFunctionExpression(node)
						) {
							const complexity = calculateComplexity(node);

							if (complexity > maxComplexity) {
								const name = getFunctionName(node);
								const { line, character } = ts.getLineAndCharacterOfPosition(
									sourceFile,
									node.getStart(),
								);

								issues.push({
									column: character + 1,
									file: sourceFile.fileName,
									line: line + 1,
									message: `Function "${name}" has complexity of ${complexity} (max: ${maxComplexity})`,
									severity: complexity > maxComplexity * 1.5 ? "error" : "warning",
									suggestion: "Consider breaking down into smaller functions",
								});
							}
						}

						ts.forEachChild(node, visit);
					});
				}

				const hasErrors = issues.some((i) => i.severity === "error");

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.complexity,
					status: hasErrors
						? ("failed" as const)
						: issues.length > 0
						? ("failed" as const)
						: ("passed" as const),
					summary: `Found ${issues.length} functions exceeding complexity threshold`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error
						? error
						: new Error("Complexity checking failed"),
				);
			}
		});

	return ComplexityCheckerService.of({ check });
};

// Calculate cyclomatic complexity
function calculateComplexity(node: ts.Node): number {
	let complexity = 1;

	function visit(n: ts.Node) {
		switch (n.kind) {
			case ts.SyntaxKind.IfStatement:
			case ts.SyntaxKind.WhileStatement:
			case ts.SyntaxKind.DoStatement:
			case ts.SyntaxKind.ForStatement:
			case ts.SyntaxKind.ForInStatement:
			case ts.SyntaxKind.ForOfStatement:
			case ts.SyntaxKind.CaseClause:
			case ts.SyntaxKind.ConditionalExpression:
			case ts.SyntaxKind.BinaryExpression:
				if (n.kind === ts.SyntaxKind.BinaryExpression) {
					const binExpr = n as ts.BinaryExpression;
					if (
						binExpr.operatorToken.kind
							=== ts.SyntaxKind.AmpersandAmpersandToken
						|| binExpr.operatorToken.kind === ts.SyntaxKind.BarBarToken
					) {
						complexity++;
					}
				} else {
					complexity++;
				}
				break;
		}

		ts.forEachChild(n, visit);
	}

	ts.forEachChild(node, visit);
	return complexity;
}

function getFunctionName(node: ts.Node): string {
	if (ts.isFunctionDeclaration(node) && node.name) {
		return node.name.text;
	}
	if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) {
		return node.name.text;
	}
	if (
		ts.isVariableDeclaration(node.parent)
		&& ts.isIdentifier(node.parent.name)
	) {
		return node.parent.name.text;
	}
	return "anonymous";
}

export const ComplexityCheckerLive = Layer.effect(
	ComplexityCheckerService,
	Effect.sync(() => makeComplexityCheckerService()),
);
