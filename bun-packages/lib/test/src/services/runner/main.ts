import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { glob } from "glob";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WorkerPool } from "../../core/worker-pool";
import { loadConfig } from "../config";
import { ConsoleReporter } from "../reporter/console";
import { parseCliOptions } from "./cli";
import { startWatcher } from "./watcher";

export async function run() {
	const { watch, coverage, updateSnapshots, testNamePattern, shard, timeoutMs, retries } = parseCliOptions();
	const cwd = process.cwd();
	const config = await loadConfig(cwd);

	if (coverage) {
		console.log("\nGenerating coverage report...");
		// Delegate to bun test for coverage (Bun's native coverage works with bun test)
		const testFiles = await glob(config.testMatch!, { cwd });
		const testArgs = [
			"test",
			"--coverage",
			"--coverage-dir",
			"coverage",
			"--coverage-reporter",
			"text",
			"--coverage-reporter",
			"lcov",
		];
		if (testNamePattern) testArgs.push("--test-name-pattern", testNamePattern);
		if (shard) testArgs.push("--shard", shard);
		if (timeoutMs) testArgs.push("--timeout-ms", String(timeoutMs));
		if (retries) testArgs.push("--retries", String(retries));
		if (updateSnapshots) testArgs.push("--update-snapshots");
		testArgs.push(...testFiles);

		const proc = Bun.spawn({ cmd: ["bun", ...testArgs], stdout: "inherit", stderr: "inherit", cwd });
		const exitCode = await proc.exited;
		if (exitCode !== 0) {
			process.exit(exitCode);
		}
		return;
	}

	const testFiles = await glob(config.testMatch!, { cwd, absolute: true });
	const reporter = new ConsoleReporter();

	const runtimeSetupPath = fileURLToPath(new URL("../../runtime/setup.ts", import.meta.url));
	const runTestScriptPath = fileURLToPath(new URL("../../../bin/run-test.ts", import.meta.url));
	const pool = new WorkerPool({
		cwd,
		runtimeSetupPath,
		runTestScriptPath,
		maxWorkers: Math.max(1, Math.min(os.cpus().length, 8)),
	});

	const tasks = testFiles.map(async (file) => {
		// Mocking logic using AST
		const fileContent = await fs.readFile(file, "utf-8");
		const mockCalls: { path: string; factory?: string }[] = [];

		try {
			const ast = parse(fileContent, { sourceType: "module", plugins: ["typescript"] });
			traverse(ast, {
				CallExpression(p) {
					const { node } = p;
					if (
						node.callee.type === "MemberExpression"
						&& node.callee.object.type === "Identifier"
						&& node.callee.object.name === "w"
						&& node.callee.property.type === "Identifier"
						&& node.callee.property.name === "mock"
					) {
						const firstArg = node.arguments[0];
						if (!firstArg || firstArg.type !== "StringLiteral") return;

						const modulePath = firstArg.value;
						const secondArg = node.arguments[1];

						if (!secondArg) {
							mockCalls.push({ path: modulePath });
							return;
						}

						if (typeof secondArg.start !== "number" || typeof secondArg.end !== "number") {
							mockCalls.push({ path: modulePath });
							return;
						}

						const factory = fileContent.substring(secondArg.start, secondArg.end);
						mockCalls.push({ path: modulePath, factory });
					}
				},
			});
		} catch (e) {
			console.error(`Failed to parse mocks in ${file}:`, e);
		}

		let preloadFile: string | undefined;

		if (mockCalls.length > 0) {
			const factoryMocks = mockCalls.filter(m => m.factory);
			const autoMocks = mockCalls.filter(m => !m.factory);

			const createMockPath = fileURLToPath(new URL("../../utils/mock.ts", import.meta.url));

			const preloadContent = `
					import { plugin } from "bun";
					import { createMock } from "${createMockPath.replace(/\\/g, "\\\\")}";
					import fs from "node:fs/promises";

					// --- Injected Mock Factories ---
					${factoryMocks.map((m, i) => `const factory_${i} = ${m.factory};`).join("\n")}
					// -----------------------------

					await plugin({
						name: "wtest-custom-mock",
						async setup(build) {
							const autoMockPaths = ${JSON.stringify(autoMocks.map(m => m.path))};
							const factoryMockPaths = ${JSON.stringify(factoryMocks.map(m => m.path))};
							const factories = [${factoryMocks.map((_, i) => `factory_${i}`).join(", ")}];

							const autoMockResolutionMap = new Map<string, string>();
							for (const mockPath of autoMockPaths) {
								const resolved = await Bun.resolve(mockPath, path.dirname("${file.replace(/\\/g, "\\\\")}"));
								autoMockResolutionMap.set(resolved, mockPath);
							}

							const factoryMockResolutionMap = new Map<string, number>();
							for (let i = 0; i < factoryMockPaths.length; i++) {
								const resolved = await Bun.resolve(factoryMockPaths[i], path.dirname("${file.replace(/\\/g, "\\\\")}"));
								factoryMockResolutionMap.set(resolved, i);
							}

							build.onLoad({ filter: /.*/ }, async (args) => {
								// Handle factory mocks
								if (factoryMockResolutionMap.has(args.path)) {
									const factoryIndex = factoryMockResolutionMap.get(args.path)!;
									const factory = factories[factoryIndex];
									const mockedModule = await Promise.resolve(factory());
									return { exports: mockedModule, loader: 'object' };
								}

								// Handle auto mocks
								if (autoMockResolutionMap.has(args.path)) {
									const originalModule = await import(args.path);
									const mockedModule = {};
									for (const key in originalModule) {
										if (typeof originalModule[key] === 'function') {
											mockedModule[key] = createMock();
										} else {
											mockedModule[key] = originalModule[key];
										}
									}
									return { exports: mockedModule, loader: 'object' };
								}

								// Default loader for non-mocked files
								const contents = await fs.readFile(args.path, "utf8");
								return { contents, loader: "ts" };
							});
						}
					});
				`;
			preloadFile = path.join(cwd, `.${path.basename(file)}.mock.preload.ts`);
			await fs.writeFile(preloadFile, preloadContent);
		}

		const resolvedTimeoutMs = timeoutMs ?? config.testTimeoutMs;
		const resolvedRetries = retries ?? config.retries;

		try {
			const result = await pool.runTest(file, {
				testNamePattern,
				shard,
				timeout: typeof resolvedTimeoutMs === "number" && Number.isFinite(resolvedTimeoutMs)
					? resolvedTimeoutMs
					: undefined,
				retries: typeof resolvedRetries === "number" && Number.isFinite(resolvedRetries) && resolvedRetries > 0
					? resolvedRetries
					: undefined,
				updateSnapshots,
				preloadFiles: preloadFile ? [preloadFile] : undefined,
			});
			result.results.forEach((res: any) => reporter.addResult(res));
		} catch (e: any) {
			console.error(`Test worker for ${file} failed: ${e?.message ?? String(e)}`);
		} finally {
			if (preloadFile) {
				await fs.unlink(preloadFile);
			}
		}
	});

	await Promise.all(tasks);

	reporter.printSummary();

	if (watch) {
		await startWatcher(cwd);
	} else if (reporter.getResults().some(r => r.status === "failed")) {
		process.exit(1);
	}
}
