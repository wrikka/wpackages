import { calculateTotal, checkThresholds } from "./calculator";
import { createDefaultCoverageConfig } from "./config";
import { shouldIncludeFile } from "./filter";
import { generateCoverageReport, generateLcovReport } from "./reporters";
import type { CoverageConfig, CoverageThresholds } from "./types";

export class CoverageManager {
	private config: CoverageConfig;
	private cwd: string;

	constructor(cwd: string, config: Partial<CoverageConfig> = {}) {
		this.cwd = cwd;
		this.config = { ...createDefaultCoverageConfig(), ...config };
	}

	public processCoverageData(coverageData: any[]): {
		total: any;
		files: any[];
		thresholdsMet: boolean;
		thresholdFailures: string[];
	} {
		const files = coverageData.filter(
			(file) =>
				file.path
				&& shouldIncludeFile(
					file.path,
					this.cwd,
					this.config.includePatterns,
					this.config.excludePatterns,
				),
		);

		const total = calculateTotal(files);
		const thresholdFailures = checkThresholds(total, files, this.config);
		const thresholdsMet = thresholdFailures.length === 0;

		return {
			total,
			files,
			thresholdsMet,
			thresholdFailures,
		};
	}

	public generateCoverageReport(coverageData: any[]): void {
		const { total, files, thresholdsMet, thresholdFailures } = this.processCoverageData(coverageData);
		generateCoverageReport(total, files, thresholdsMet, thresholdFailures);
	}

	public async generateLcovReport(coverageData: any[]): Promise<string> {
		const files = coverageData.filter(
			(file) =>
				file.path
				&& shouldIncludeFile(
					file.path,
					this.cwd,
					this.config.includePatterns,
					this.config.excludePatterns,
				),
		);
		return generateLcovReport(files, this.cwd);
	}

	public setThresholds(thresholds: CoverageThresholds): void {
		this.config.thresholds = { ...this.config.thresholds, ...thresholds };
		this.config.thresholdGlobal = { ...this.config.thresholdGlobal, ...thresholds };
	}

	public setExcludePatterns(patterns: string[]): void {
		this.config.excludePatterns = patterns;
	}

	public setIncludePatterns(patterns: string[]): void {
		this.config.includePatterns = patterns;
	}

	public getConfig(): CoverageConfig {
		return { ...this.config };
	}
}
