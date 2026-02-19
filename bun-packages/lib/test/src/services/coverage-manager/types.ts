export interface CoverageThresholds {
	lines?: number;
	functions?: number;
	branches?: number;
	statements?: number;
}

export interface CoverageConfig {
	excludePatterns: string[];
	includePatterns: string[];
	thresholds: CoverageThresholds;
	thresholdGlobal: CoverageThresholds;
	thresholdFile: CoverageThresholds;
	reporters: string[];
	outputDir: string;
	all: boolean;
	only: boolean;
}
