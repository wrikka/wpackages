export const REPORT_SCHEMA_VERSION = "1.0.0";

export interface VersionedTestReport {
	schemaVersion: string;
	timestamp: string;
	summary: {
		total: number;
		passed: number;
		failed: number;
		skipped: number;
		duration: number;
	};
	suites: VersionedTestSuite[];
	coverage?: VersionedCoverageReport;
	environment: {
		nodeVersion: string;
		bunVersion?: string;
		platform: string;
		arch: string;
	};
	config: {
		coverage: boolean;
		watch: boolean;
		timeout: number;
		retries: number;
		testNamePattern?: string;
		shard?: string;
	};
}

export interface VersionedTestSuite {
	name: string;
	file: string;
	duration: number;
	tests: VersionedTestCase[];
	hooks: {
		beforeAll?: number;
		afterAll?: number;
		beforeEach?: number;
		afterEach?: number;
	};
}

export interface VersionedTestCase {
	name: string;
	status: "passed" | "failed" | "skipped";
	duration: number;
	error?: {
		message: string;
		stack?: string;
		name: string;
	};
	tags?: string[];
	metadata?: Record<string, any>;
}

export interface VersionedCoverageReport {
	total: {
		lines: number;
		functions: number;
		branches: number;
		statements: number;
	};
	files: VersionedCoverageFile[];
	thresholds?: {
		lines?: number;
		functions?: number;
		branches?: number;
		statements?: number;
	};
}

export interface VersionedCoverageFile {
	path: string;
	statements: {
		total: number;
		covered: number;
		percentage: number;
	};
	functions: {
		total: number;
		covered: number;
		percentage: number;
	};
	branches: {
		total: number;
		covered: number;
		percentage: number;
	};
	lines: {
		total: number;
		covered: number;
		percentage: number;
	};
}

export function createVersionedReport(
	originalReport: any,
	coverageData?: any,
): VersionedTestReport {
	const now = new Date().toISOString();

	return {
		schemaVersion: REPORT_SCHEMA_VERSION,
		timestamp: now,
		summary: {
			total: originalReport.summary?.total || 0,
			passed: originalReport.summary?.passed || 0,
			failed: originalReport.summary?.failed || 0,
			skipped: originalReport.summary?.skipped || 0,
			duration: originalReport.summary?.duration || 0,
		},
		suites: (originalReport.suites || []).map((suite: any) => ({
			name: suite.name || "Unknown Suite",
			file: suite.file || "",
			duration: suite.duration || 0,
			tests: (suite.tests || []).map((test: any) => ({
				name: test.name || "Unknown Test",
				status: test.status || "failed",
				duration: test.duration || 0,
				error: test.error
					? {
						message: test.error.message || "Unknown error",
						stack: test.error.stack,
						name: test.error.name || "Error",
					}
					: undefined,
				tags: test.tags || [],
				metadata: test.metadata || {},
			})),
			hooks: {
				beforeAll: suite.hooks?.beforeAll,
				afterAll: suite.hooks?.afterAll,
				beforeEach: suite.hooks?.beforeEach,
				afterEach: suite.hooks?.afterEach,
			},
		})),
		coverage: coverageData
			? {
				total: {
					lines: coverageData.total?.lines || 0,
					functions: coverageData.total?.functions || 0,
					branches: coverageData.total?.branches || 0,
					statements: coverageData.total?.statements || 0,
				},
				files: (coverageData.files || []).map((file: any) => ({
					path: file.path || "",
					statements: file.statements || { total: 0, covered: 0, percentage: 0 },
					functions: file.functions || { total: 0, covered: 0, percentage: 0 },
					branches: file.branches || { total: 0, covered: 0, percentage: 0 },
					lines: file.lines || { total: 0, covered: 0, percentage: 0 },
				})),
				thresholds: coverageData.thresholds,
			}
			: undefined,
		environment: {
			nodeVersion: process.version,
			bunVersion: process.versions.bun,
			platform: process.platform,
			arch: process.arch,
		},
		config: {
			coverage: false, // These should come from actual config
			watch: false,
			timeout: 5000,
			retries: 0,
			testNamePattern: undefined,
			shard: undefined,
		},
	};
}

export function validateVersionedReport(report: VersionedTestReport): boolean {
	// Basic validation
	if (!report.schemaVersion || !report.timestamp) return false;
	if (!report.summary || typeof report.summary.total !== "number") return false;
	if (!Array.isArray(report.suites)) return false;

	// Validate suites
	for (const suite of report.suites) {
		if (!suite.name || !Array.isArray(suite.tests)) return false;

		// Validate tests
		for (const test of suite.tests) {
			if (!test.name || !["passed", "failed", "skipped"].includes(test.status)) {
				return false;
			}
		}
	}

	return true;
}

export function migrateReport(oldVersion: string, report: any): VersionedTestReport {
	// Migration logic for different schema versions
	switch (oldVersion) {
		case "0.9.0":
			// Migrate from 0.9.0 to 1.0.0
			return createVersionedReport({
				...report,
				suites: report.suites?.map((suite: any) => ({
					...suite,
					tests: suite.tests?.map((test: any) => ({
						...test,
						tags: test.tags || [],
						metadata: test.metadata || {},
					})),
				})),
			});
		default:
			// Assume current format if no migration needed
			return report as VersionedTestReport;
	}
}
