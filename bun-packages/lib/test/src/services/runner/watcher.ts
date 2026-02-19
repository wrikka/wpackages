import chokidar from "chokidar";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DependencyService } from "../dependencies";
import { ConsoleReporter } from "../reporter/console";

async function runTestFiles(filePaths: string[], cwd: string) {
	console.log(`\nRe-running ${filePaths.length} test file(s)...`);
	const reporter = new ConsoleReporter();

	for (const filePath of filePaths) {
		console.log(` - ${path.relative(cwd, filePath)}`);
		const runtimeSetupPath = fileURLToPath(new URL("../../runtime/setup.ts", import.meta.url));
		const runTestScriptPath = fileURLToPath(new URL("../../../bin/run-test.ts", import.meta.url));
		const worker = Bun.spawn({
			cmd: ["bun", "--preload", runtimeSetupPath, runTestScriptPath, filePath],
			stdout: "pipe",
			stderr: "pipe",
		});

		const stdout = await Bun.readableStreamToText(worker.stdout);
		const exitCode = await worker.exited;

		if (exitCode === 0) {
			try {
				const marker = "__WTEST_RESULT__";
				const markerIndex = stdout.lastIndexOf(marker);
				const jsonText = markerIndex >= 0 ? stdout.slice(markerIndex + marker.length).trim() : stdout.trim();
				const result = JSON.parse(jsonText);
				if (result.error) {
					console.error(`Error in test file ${filePath}: ${result.error}`);
				} else {
					result.results.forEach((res: any) => reporter.addResult(res));
				}
			} catch (e: any) {
				console.error(`Failed to parse test results from ${filePath}: ${e.message}`);
			}
		} else {
			console.error(`Test worker for ${filePath} exited with code ${exitCode}`);
		}
	}

	reporter.printSummary();
}

export async function startWatcher(cwd: string) {
	console.log("\nBuilding dependency graph...");
	const dependencyService = new DependencyService(cwd);
	await dependencyService.buildGraph();
	console.log("Dependency graph built. Watching for file changes...");

	chokidar.watch("src/**/*.ts", { cwd }).on("change", async (filePath) => {
		const absolutePath = path.resolve(cwd, filePath);
		const dependents = dependencyService.getDependents(absolutePath);
		const testFilesToRun = [...dependents].filter((file) => file.endsWith(".test.ts"));

		if (testFilesToRun.length > 0) {
			await runTestFiles(testFilesToRun, cwd);
		} else {
			console.log(`\nFile changed: ${filePath}. No tests found that depend on it.`);
		}
	});
}
