import { relative } from "node:path";

import type { WorkerPool } from "../../core/worker-pool";

export async function rerunAffectedTests(options: {
	affectedTests: string[];
	workerPool: WorkerPool;
	concurrency: number;
	lastRunTime: Map<string, number>;
	onTestComplete?: (event: {
		testFile: string;
		duration: number;
		success: boolean;
		error?: unknown;
	}) => void;
}): Promise<void> {
	console.log(`🔄 Re-running ${options.affectedTests.length} affected tests`);

	const sortedTests = options.affectedTests.sort((a, b) => {
		const timeA = options.lastRunTime.get(a) || 0;
		const timeB = options.lastRunTime.get(b) || 0;
		return timeA - timeB;
	});

	const chunks = chunkArray(sortedTests, Math.max(1, options.concurrency));

	for (const chunk of chunks) {
		await Promise.all(
			chunk.map(async (testFile) => {
				const startTime = Date.now();
				options.lastRunTime.set(testFile, startTime);

				try {
					console.log(`Running test: ${relative(process.cwd(), testFile)}`);
					await options.workerPool.runTest(testFile, {});

					const duration = Date.now() - startTime;
					console.log(`✅ Test completed in ${duration}ms`);

					options.onTestComplete?.({
						testFile,
						duration,
						success: true,
					});
				} catch (error) {
					const duration = Date.now() - startTime;
					console.log(`❌ Test failed in ${duration}ms:`, error);

					options.onTestComplete?.({
						testFile,
						duration,
						success: false,
						error: error,
					});
				}
			}),
		);
	}

	console.log(`✅ Completed ${options.affectedTests.length} test runs`);
}

function chunkArray<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}
