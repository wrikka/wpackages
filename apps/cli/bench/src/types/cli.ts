export type BenchmarkResult = {
	command: string;
	runs: number;
	times: number[]; // milliseconds
	totalTimeMs: number;
	mean: number;
	median: number;
	min: number;
	max: number;
	stddev: number;
	variance: number;
	throughputOpsPerSec: number;
	errorCount: number;
	errorRate: number;
	cpuUserMs: number;
	cpuSystemMs: number;
	maxRssBytes: number;
	fsReadBytes: number;
	fsWriteBytes: number;
	percentiles: {
		p25: number;
		p50: number;
		p75: number;
		p90: number;
		p95: number;
		p99: number;
	};
};

export type BenchmarkOptions = {
	warmup?: number; // warmup runs
	runs?: number; // number of benchmark runs
	concurrency?: number; // parallel processes per iteration
	prepare?: string; // command to run before each benchmark
	cleanup?: string; // command to run after each benchmark
	shell?: string; // shell to use
	output?: "json" | "text" | "table" | "chart" | "histogram" | "boxplot" | "csv" | "md" | "markdown";
	export?: string; // export results to file
	verbose?: boolean;
	silent?: boolean;
	htmlReport?: string; // path to generate HTML report
	config?: string; // path to a configuration file
	parameterScan?: { parameter: string; values: string[] };
	threshold?: number; // regression threshold in percentage
	ab?: boolean; // enable A/B testing mode
};

export type ComparisonResult = {
	results: BenchmarkResult[];
	fastest: string;
	slowest: string;
	speedups: Record<string, number>; // relative to fastest
	pValues?: Record<string, number>; // p-value from t-test vs fastest
};
