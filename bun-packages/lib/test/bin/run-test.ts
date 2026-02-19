#!/usr/bin/env bun

// This script runs a single test file and reports results as JSON to stdout.

import fs from "node:fs/promises";
import path from "node:path";
import v8 from "node:v8";
import { setTestContext } from "../src/services/context.service";
import { SnapshotService } from "../src/services/snapshot";
import { clearSuites, getSuites } from "../src/services/suite.registry";
import type { SerializableError, TestResult, TestSuite } from "../src/types";

function getArgValue(args: string[], key: string): string | undefined {
	const index = args.indexOf(key);
	if (index === -1) return;
	return args[index + 1];
}

function createTestNameMatcher(pattern: string | undefined): (fullName: string) => boolean {
	if (!pattern) return () => true;
	try {
		const regexp = new RegExp(pattern);
		return (name) => regexp.test(name);
	} catch {
		return (name) => name.includes(pattern);
	}
}

function parseShard(value: string | undefined): { index: number; count: number } | undefined {
	if (!value) return;
	const [indexRaw, countRaw] = value.split("/");
	const index = Number(indexRaw);
	const count = Number(countRaw);
	if (!Number.isFinite(index) || !Number.isFinite(count) || index < 1 || count < 1 || index > count) return;
	return { index, count };
}

function hashStringFNV1a(value: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise;
	return await new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error(`Test timed out after ${timeoutMs}ms`));
		}, timeoutMs);
		promise
			.then((value) => {
				clearTimeout(timer);
				resolve(value);
			})
			.catch((error) => {
				clearTimeout(timer);
				reject(error);
			});
	});
}

async function runAndReport() {
	const args = process.argv;
	const collectCoverage = args.includes("--coverage");
	const updateSnapshots = args.includes("-u") || args.includes("--update-snapshots");
	const testNamePattern = getArgValue(args, "--testNamePattern") ?? getArgValue(args, "--test-name-pattern");
	const shardValue = getArgValue(args, "--shard");
	const timeoutValue = getArgValue(args, "--timeout-ms");
	const retriesValue = getArgValue(args, "--retries");
	const timeoutMs = timeoutValue ? Number(timeoutValue) : undefined;
	const retries = retriesValue ? Number(retriesValue) : 0;
	const testFile = [...args]
		.reverse()
		.find((arg) => arg.endsWith(".test.ts") || arg.endsWith(".spec.ts"))
		?? [...args].reverse().find((arg) => arg.endsWith(".ts") && arg !== import.meta.path);
	// Bun does not support v8.startCoverage(). Use NODE_V8_COVERAGE + v8.takeCoverage() instead.

	if (!testFile) {
		console.error(JSON.stringify({ error: "No test file provided." }));
		process.exit(1);
	}

	const results: TestResult[] = [];
	const snapshotService = new SnapshotService(testFile);
	await snapshotService.load();

	try {
		await import(path.resolve(testFile));
		const suites = getSuites();
		const matchTestName = createTestNameMatcher(testNamePattern);
		const shard = parseShard(shardValue);

		function shouldRunTest(fullName: string): boolean {
			if (!matchTestName(fullName)) return false;
			if (!shard) return true;
			return (hashStringFNV1a(fullName) % shard.count) === (shard.index - 1);
		}

		function suiteHasRunnableTests(
			suite: TestSuite,
			parentSuiteName: string | undefined,
		): boolean {
			const suiteName = parentSuiteName ? `${parentSuiteName} > ${suite.name}` : suite.name;
			for (const test of suite.tests) {
				const fullName = `${suiteName} > ${test.name}`;
				if (shouldRunTest(fullName)) return true;
			}
			for (const nestedSuite of suite.suites) {
				if (suiteHasRunnableTests(nestedSuite, suiteName)) return true;
			}
			return false;
		}

		async function runSuite(
			suite: TestSuite,
			parentSuiteName: string | undefined,
			parentBeforeEach: (() => void | Promise<void>)[],
			parentAfterEach: (() => void | Promise<void>)[],
		): Promise<boolean> {
			const suiteName = parentSuiteName ? `${parentSuiteName} > ${suite.name}` : suite.name;
			const ownBeforeAll = suite.beforeAllHooks ?? [];
			const ownAfterAll = suite.afterAllHooks ?? [];
			const ownBeforeEach = suite.beforeEachHooks ?? [];
			const ownAfterEach = suite.afterEachHooks ?? [];
			const beforeEachHooks = [...parentBeforeEach, ...ownBeforeEach];
			const afterEachHooks = [...ownAfterEach, ...parentAfterEach];

			let ranAny = false;
			const hasRunnable = suiteHasRunnableTests(suite, parentSuiteName);
			if (!hasRunnable) return false;

			for (const hook of ownBeforeAll) await hook();

			for (const test of suite.tests) {
				const fullName = `${suiteName} > ${test.name}`;
				if (!shouldRunTest(fullName)) continue;
				ranAny = true;

				setTestContext({ snapshotService, currentTestName: test.name, updateSnapshots });
				const startedAt = Date.now();
				const maxAttempts = typeof retries === "number" && Number.isFinite(retries) && retries > 0 ? retries + 1 : 1;

				try {
					for (const hook of beforeEachHooks) await hook();

					for (let attempt = 0; attempt < maxAttempts; attempt++) {
						try {
							const exec = Promise.resolve(test.fn());
							await withTimeout(exec, typeof timeoutMs === "number" ? timeoutMs : 0);
							break;
						} catch (error) {
							if (attempt === maxAttempts - 1) throw error;
						}
					}

					results.push({
						suiteName: suite.name,
						testName: test.name,
						status: "passed",
						durationMs: Date.now() - startedAt,
					});
				} catch (error) {
					const testError: SerializableError = error instanceof Error
						? { message: error.message, ...(error.stack && { stack: error.stack }) }
						: { message: String(error) };
					results.push({
						suiteName: suite.name,
						testName: test.name,
						status: "failed",
						durationMs: Date.now() - startedAt,
						error: testError,
					});
				} finally {
					try {
						for (const hook of afterEachHooks) await hook();
					} finally {
						setTestContext({ currentTestName: null });
					}
				}
			}

			for (const nestedSuite of suite.suites) {
				const ranNested = await runSuite(
					nestedSuite,
					suiteName,
					beforeEachHooks,
					afterEachHooks,
				);
				ranAny = ranAny || ranNested;
			}

			for (const hook of ownAfterAll) await hook();

			return ranAny;
		}

		for (const suite of suites) {
			await runSuite(suite, undefined, [], []);
		}

		await snapshotService.save();

		let coverageDebug: { dir?: string; files?: number } | undefined;
		if (collectCoverage) {
			try {
				v8.takeCoverage();
			} catch {
				// Ignore if coverage is not enabled via NODE_V8_COVERAGE
			}

			try {
				const dir = process.env.NODE_V8_COVERAGE;
				if (dir) {
					const entries = await fs.readdir(dir);
					coverageDebug = { dir, files: entries.length };
				}
			} catch {
				// ignore
			}
		}

		process.stdout.write(`\n__WTEST_RESULT__${JSON.stringify({ results, coverageDebug })}\n`);
		clearSuites();
	} catch (error) {
		const importError: SerializableError = error instanceof Error
			? { message: error.message, ...(error.stack && { stack: error.stack }) }
			: { message: String(error) };
		console.error(JSON.stringify({ error: "Failed to run test file.", details: importError }));
		process.exit(1);
	}
}

runAndReport().catch(error => {
	const reportError: SerializableError = error instanceof Error
		? { message: error.message, ...(error.stack && { stack: error.stack }) }
		: { message: String(error) };
	console.error(JSON.stringify({ error: "Unhandled error in test runner", details: reportError }));
	process.exit(1);
});
