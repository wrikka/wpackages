import { PerformanceProfiler } from "./profiler";
import { buildPerformanceReport, exportReportData, printReportSummary } from "./report";
import type { PerformanceThresholds } from "./types";

// Global profiler instance
let globalProfiler: PerformanceProfiler | undefined;

export function createPerformanceProfiler(
	thresholds?: Partial<PerformanceThresholds>,
): PerformanceProfiler {
	if (!globalProfiler) {
		globalProfiler = new PerformanceProfiler(thresholds);
	}
	return globalProfiler;
}

export function getPerformanceProfiler(): PerformanceProfiler {
	if (!globalProfiler) {
		globalProfiler = new PerformanceProfiler();
	}
	return globalProfiler;
}

export function generateReport(): ReturnType<PerformanceProfiler["getProfiles"]> {
	return getPerformanceProfiler().getProfiles();
}

export function buildReport() {
	const profiler = getPerformanceProfiler();
	return buildPerformanceReport(profiler.getProfiles().values(), profiler.getThresholds());
}

export function printSummary(): void {
	const report = buildReport();
	printReportSummary(report);
}

export function exportData(format: "json" | "csv" = "json"): string {
	const report = buildReport();
	return exportReportData(report, format);
}

export { PerformanceProfiler };
export * from "./types";
