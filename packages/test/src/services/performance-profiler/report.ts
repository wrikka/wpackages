import type { MemoryStats, PerformanceReport, PerformanceThresholds, SuiteProfile, TestProfile } from "./types";

export function buildPerformanceReport(
	profiles: Iterable<SuiteProfile>,
	thresholds: PerformanceThresholds,
): PerformanceReport {
	const suites = Array.from(profiles);
	const totalDuration = suites.reduce((sum, suite) => sum + suite.duration, 0);

	const allTests = suites.flatMap((suite) => suite.tests);
	const slowestTests = allTests
		.filter((test) => test.status !== "skipped")
		.sort((a, b) => b.duration - a.duration)
		.slice(0, 10);

	const fastestTests = allTests
		.filter((test) => test.status !== "skipped")
		.sort((a, b) => a.duration - b.duration)
		.slice(0, 10);

	const memoryStats = calculateMemoryStats(allTests);
	const recommendations = generateRecommendations(suites, allTests, memoryStats, thresholds);

	return {
		totalDuration,
		suites,
		slowestTests,
		fastestTests,
		memoryStats,
		thresholds,
		recommendations,
	};
}

export function exportReportData(report: PerformanceReport, format: "json" | "csv" = "json"): string {
	if (format === "json") {
		return JSON.stringify(report, null, 2);
	}

	const headers = ["Suite", "Test", "Duration", "Status", "Memory (MB)", "CPU (user)", "CPU (system)"];
	const rows = report.suites.flatMap((suite) =>
		suite.tests.map((test) => [
			suite.name,
			test.name,
			test.duration.toFixed(2),
			test.status,
			((test.memoryUsage?.heapUsed || 0) / 1024 / 1024).toFixed(2),
			test.cpuUsage?.user || 0,
			test.cpuUsage?.system || 0,
		])
	);

	return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

export function printReportSummary(report: PerformanceReport): void {
	console.log("\n📊 Performance Report");
	console.log("====================");
	console.log(`Total Duration: ${report.totalDuration.toFixed(2)}ms`);
	console.log(`Test Suites: ${report.suites.length}`);
	console.log(
		`Total Tests: ${report.suites.reduce((sum, suite) => sum + suite.tests.length, 0)}`,
	);

	if (report.slowestTests.length > 0) {
		console.log("\n🐌 Slowest Tests:");
		report.slowestTests.slice(0, 5).forEach((test, index) => {
			console.log(
				`  ${index + 1}. ${test.suite} > ${test.name} (${test.duration.toFixed(2)}ms)`,
			);
		});
	}

	if (report.fastestTests.length > 0) {
		console.log("\n⚡ Fastest Tests:");
		report.fastestTests.slice(0, 5).forEach((test, index) => {
			console.log(
				`  ${index + 1}. ${test.suite} > ${test.name} (${test.duration.toFixed(2)}ms)`,
			);
		});
	}

	console.log("\n💾 Memory Usage:");
	console.log(
		`  Peak: ${(report.memoryStats.peakUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
	);
	console.log(
		`  Average: ${(report.memoryStats.averageUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
	);

	if (report.recommendations.length > 0) {
		console.log("\n💡 Recommendations:");
		report.recommendations.forEach((rec) => {
			console.log(`  • ${rec}`);
		});
	}
}

function calculateMemoryStats(tests: TestProfile[]): MemoryStats {
	const memoryUsages = tests
		.map((test) => test.memoryUsage?.heapUsed || 0)
		.filter((usage) => usage > 0);

	if (memoryUsages.length === 0) {
		return {
			peakUsage: process.memoryUsage(),
			averageUsage: process.memoryUsage(),
			leakedTests: [],
		};
	}

	const peakUsage = {
		rss: Math.max(...tests.map((t) => t.memoryUsage?.rss || 0)),
		heapTotal: Math.max(...tests.map((t) => t.memoryUsage?.heapTotal || 0)),
		heapUsed: Math.max(...memoryUsages),
		external: Math.max(...tests.map((t) => t.memoryUsage?.external || 0)),
		arrayBuffers: Math.max(...tests.map((t) => t.memoryUsage?.arrayBuffers || 0)),
	};

	const averageUsage = {
		rss: memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length,
		heapTotal: memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length,
		heapUsed: memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length,
		external: memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length,
		arrayBuffers: memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length,
	};

	const avgMemory = averageUsage.heapUsed;
	const leakedTests = tests
		.filter((test) => test.memoryUsage?.heapUsed && test.memoryUsage.heapUsed > avgMemory * 3)
		.map((test) => `${test.suite} > ${test.name}`);

	return {
		peakUsage,
		averageUsage,
		leakedTests,
	};
}

function generateRecommendations(
	suites: SuiteProfile[],
	tests: TestProfile[],
	memoryStats: MemoryStats,
	thresholds: PerformanceThresholds,
): string[] {
	const recommendations: string[] = [];

	const slowTests = tests.filter((test) => test.duration > thresholds.testDuration);
	if (slowTests.length > 0) {
		recommendations.push(
			`Found ${slowTests.length} slow tests (> ${thresholds.testDuration}ms). Consider optimizing or breaking them down.`,
		);
	}

	const slowSuites = suites.filter((suite) => suite.duration > thresholds.suiteDuration);
	if (slowSuites.length > 0) {
		recommendations.push(
			`Found ${slowSuites.length} slow test suites (> ${thresholds.suiteDuration}ms). Consider running them in parallel or splitting them.`,
		);
	}

	if (memoryStats.leakedTests.length > 0) {
		recommendations.push(
			`Found ${memoryStats.leakedTests.length} tests with potential memory leaks. Review cleanup in these tests.`,
		);
	}

	const avgTestDuration = tests.reduce((sum, test) => sum + test.duration, 0) / tests.length;
	const highVarianceTests = tests.filter(
		(test) => Math.abs(test.duration - avgTestDuration) > avgTestDuration * 2,
	);
	if (highVarianceTests.length > tests.length * 0.3) {
		recommendations.push(
			"Test execution times vary significantly. Consider standardizing test complexity and setup.",
		);
	}

	const failedTests = tests.filter((test) => test.status === "failed");
	if (failedTests.length > 0) {
		recommendations.push(
			`${failedTests.length} tests failed. Review and fix failing tests to improve overall performance.`,
		);
	}

	return recommendations;
}
