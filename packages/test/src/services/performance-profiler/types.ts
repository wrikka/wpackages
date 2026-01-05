export interface TestProfile {
	name: string;
	suite: string;
	file: string;
	startTime: number;
	endTime: number;
	duration: number;
	memoryUsage?: NodeJS.MemoryUsage;
	cpuUsage?: NodeJS.CpuUsage;
	hooks: HookProfile[];
	status: "running" | "passed" | "failed" | "skipped";
	error?: Error;
}

export interface HookProfile {
	type: "beforeAll" | "afterAll" | "beforeEach" | "afterEach";
	name: string;
	startTime: number;
	endTime: number;
	duration: number;
}

export interface SuiteProfile {
	name: string;
	file: string;
	startTime: number;
	endTime: number;
	duration: number;
	tests: TestProfile[];
	hooks: HookProfile[];
	setupTime: number;
	teardownTime: number;
}

export interface PerformanceReport {
	totalDuration: number;
	suites: SuiteProfile[];
	slowestTests: TestProfile[];
	fastestTests: TestProfile[];
	memoryStats: MemoryStats;
	thresholds: PerformanceThresholds;
	recommendations: string[];
}

export interface MemoryStats {
	peakUsage: NodeJS.MemoryUsage;
	averageUsage: NodeJS.MemoryUsage;
	leakedTests: string[];
}

export interface PerformanceThresholds {
	testDuration: number;
	suiteDuration: number;
	memoryUsage: number;
	hookDuration: number;
}
