#!/usr/bin/env bun
import { glob } from "glob";
import path from "node:path";
import { ConsoleReporter } from "../src/reporter/console";

async function executeTests() {
	const cwd = process.cwd();
	const testFiles = await glob("src/**/*.test.ts", { cwd, absolute: true });
	const reporter = new ConsoleReporter();

	const promises = testFiles.map(file =>
		new Promise((resolve, reject) => {
			const worker = Bun.spawn({
				cmd: ["bun", "--preload", "./src/setup.ts", "./bin/run-test.mjs", file],
				stdout: "pipe",
				stderr: "pipe",
			});

			let stdout = "";
			const textDecoder = new TextDecoder();
			worker.stdout.on("data", chunk => stdout += textDecoder.decode(chunk));

			worker.exited.then(exitCode => {
				if (exitCode !== 0) {
					return reject(new Error(`Test worker for ${file} exited with code ${exitCode}`));
				}
				try {
					const result = JSON.parse(stdout);
					if (result.error) {
						return reject(new Error(`Error in test file ${file}: ${result.error}`));
					}
					result.results.forEach(res => reporter.addResult(res));
					resolve();
				} catch (e) {
					reject(new Error(`Failed to parse test results from ${file}: ${e.message}`));
				}
			});
		})
	);

	await Promise.all(promises);

	reporter.printSummary();
}

asy;
