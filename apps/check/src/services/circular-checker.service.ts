import { Context, Effect, Layer } from "effect";
import * as ts from "typescript";
import { CHECK_NAMES } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

export class CircularCheckerService extends Context.Tag(
	"CircularCheckerService",
)<
	CircularCheckerService,
	{
		check: (patterns: string[]) => Effect.Effect<CheckResult, Error>;
	}
>() {}

export const makeCircularCheckerService = () => {
	const check = (): Effect.Effect<CheckResult, Error> =>
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
						name: CHECK_NAMES.circular,
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
				const dependencyGraph = new Map<string, Set<string>>();

				// Build dependency graph
				for (const sourceFile of program.getSourceFiles()) {
					if (sourceFile.isDeclarationFile) continue;
					if (sourceFile.fileName.includes("node_modules")) continue;

					const dependencies = new Set<string>();
					dependencyGraph.set(sourceFile.fileName, dependencies);

					ts.forEachChild(sourceFile, (node) => {
						if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
							const moduleSpecifier = node.moduleSpecifier;
							if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
								const resolvedModule = ts.resolveModuleName(
									moduleSpecifier.text,
									sourceFile.fileName,
									parsedConfig.options,
									ts.sys,
								);

								if (resolvedModule.resolvedModule) {
									dependencies.add(
										resolvedModule.resolvedModule.resolvedFileName,
									);
								}
							}
						}
					});
				}

				// Detect cycles
				const visited = new Set<string>();
				const recursionStack = new Set<string>();
				const cycles: string[][] = [];

				function detectCycle(file: string, path: string[]): void {
					if (recursionStack.has(file)) {
						const cycleStart = path.indexOf(file);
						cycles.push([...path.slice(cycleStart), file]);
						return;
					}

					if (visited.has(file)) return;

					visited.add(file);
					recursionStack.add(file);
					path.push(file);

					const deps = dependencyGraph.get(file);
					if (deps) {
						for (const dep of deps) {
							detectCycle(dep, [...path]);
						}
					}

					recursionStack.delete(file);
				}

				for (const file of dependencyGraph.keys()) {
					detectCycle(file, []);
				}

				// Report cycles
				for (const cycle of cycles) {
					issues.push({
						message: `Circular dependency detected: ${cycle.map((f) => f.split("/").pop()).join(" → ")}`,
						severity: "error" as const,
						suggestion: "Refactor to break the circular dependency",
						code: "CIRCULAR_DEPENDENCY",
					});
				}

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.circular,
					status: issues.length > 0 ? ("failed" as const) : ("passed" as const),
					summary: `Found ${cycles.length} circular dependencies`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error
						? error
						: new Error("Circular dependency checking failed"),
				);
			}
		});

	return { check };
};

export const CircularCheckerLive = Layer.effect(
	CircularCheckerService,
	Effect.sync(() => makeCircularCheckerService()),
);
