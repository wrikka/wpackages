export type BenchmarkResult = {
	command: string;
	runs: number;
	times: number[]; // milliseconds
	mean: number;
	median: number;
	min: number;
	max: number;
	stddev: number;
	variance: number;
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
	prepare?: string; // command to run before each benchmark
	cleanup?: string; // command to run after each benchmark
	shell?: string; // shell to use
	output?: "json" | "text" | "table" | "chart";
	export?: string; // export results to file
	verbose?: boolean;
	silent?: boolean;
};

export type ComparisonResult = {
	results: BenchmarkResult[];
	fastest: string;
	slowest: string;
	speedups: Record<string, number>; // relative to fastest
};
