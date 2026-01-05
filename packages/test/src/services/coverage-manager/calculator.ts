import type { CoverageConfig } from "./types";

export function calculateTotal(files: any[]): any {
	const total = {
		lines: { total: 0, covered: 0, percentage: 0 },
		functions: { total: 0, covered: 0, percentage: 0 },
		branches: { total: 0, covered: 0, percentage: 0 },
		statements: { total: 0, covered: 0, percentage: 0 },
	};

	for (const file of files) {
		for (const metric of ["lines", "functions", "branches", "statements"] as const) {
			if (file[metric]) {
				total[metric].total += file[metric].total || 0;
				total[metric].covered += file[metric].covered || 0;
			}
		}
	}

	for (const metric of ["lines", "functions", "branches", "statements"] as const) {
		if (total[metric].total > 0) {
			total[metric].percentage = Math.round(
				(total[metric].covered / total[metric].total) * 100,
			);
		}
	}

	return total;
}

export function checkThresholds(total: any, files: any[], config: CoverageConfig): string[] {
	const failures: string[] = [];

	for (const metric of ["lines", "functions", "branches", "statements"] as const) {
		const threshold = config.thresholdGlobal[metric];
		if (threshold !== undefined && total[metric].percentage < threshold) {
			failures.push(
				`Global ${metric} coverage ${total[metric].percentage}% is below threshold ${threshold}%`,
			);
		}
	}

	for (const file of files) {
		for (const metric of ["lines", "functions", "branches", "statements"] as const) {
			const threshold = config.thresholdFile[metric];
			if (threshold !== undefined && file[metric] && file[metric].percentage < threshold) {
				failures.push(
					`File ${file.path} ${metric} coverage ${file[metric].percentage}% is below threshold ${threshold}%`,
				);
			}
		}
	}

	return failures;
}
